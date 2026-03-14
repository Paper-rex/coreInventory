const prisma = require('../utils/prisma');

exports.list = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const deliveries = await prisma.deliveryOrder.findMany({
      where, include: { location: { include: { warehouse: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(deliveries);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const delivery = await prisma.deliveryOrder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { location: { include: { warehouse: true } }, items: { include: { product: true } } }
    });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found.' });
    res.json(delivery);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { reference, customer, locationId, items } = req.body;
    const delivery = await prisma.deliveryOrder.create({
      data: {
        reference, customer, locationId: parseInt(locationId),
        items: { create: items.map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) })) }
      },
      include: { items: { include: { product: true } }, location: true }
    });
    res.status(201).json(delivery);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.validate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const delivery = await prisma.deliveryOrder.findUnique({ where: { id }, include: { items: true } });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found.' });
    if (delivery.status === 'DONE') return res.status(400).json({ error: 'Delivery already validated.' });

    for (const item of delivery.items) {
      const stock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: item.productId, locationId: delivery.locationId } }
      });
      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ID ${item.productId}. Available: ${stock?.quantity || 0}` });
      }
    }

    for (const item of delivery.items) {
      await prisma.stock.update({
        where: { productId_locationId: { productId: item.productId, locationId: delivery.locationId } },
        data: { quantity: { decrement: item.quantity } }
      });

      const totalStock = await prisma.stock.aggregate({ where: { productId: item.productId }, _sum: { quantity: true } });
      await prisma.stockLedger.create({
        data: {
          productId: item.productId, operationType: 'DELIVERY', quantityOut: item.quantity,
          sourceLocId: delivery.locationId, referenceDoc: delivery.reference,
          runningBalance: totalStock._sum.quantity || 0
        }
      });
    }

    const updated = await prisma.deliveryOrder.update({
      where: { id }, data: { status: 'DONE' },
      include: { items: { include: { product: true } }, location: true }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.cancel = async (req, res) => {
  try {
    const updated = await prisma.deliveryOrder.update({ where: { id: parseInt(req.params.id) }, data: { status: 'CANCELLED' } });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
