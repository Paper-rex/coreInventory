const prisma = require('../utils/prisma');

exports.list = async (req, res) => {
  try {
    const adjustments = await prisma.stockAdjustment.findMany({
      include: { product: true, location: { include: { warehouse: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(adjustments);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { reference, productId, locationId, countedQty, reason } = req.body;
    const pId = parseInt(productId), lId = parseInt(locationId), counted = parseInt(countedQty);

    const stock = await prisma.stock.findUnique({ where: { productId_locationId: { productId: pId, locationId: lId } } });
    const systemQty = stock ? stock.quantity : 0;
    const difference = counted - systemQty;

    const adjustment = await prisma.stockAdjustment.create({
      data: { reference, productId: pId, locationId: lId, countedQty: counted, systemQty, difference, reason },
      include: { product: true, location: { include: { warehouse: true } } }
    });
    res.status(201).json(adjustment);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.validate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const adj = await prisma.stockAdjustment.findUnique({ where: { id } });
    if (!adj) return res.status(404).json({ error: 'Adjustment not found.' });
    if (adj.status === 'DONE') return res.status(400).json({ error: 'Adjustment already validated.' });

    await prisma.stock.upsert({
      where: { productId_locationId: { productId: adj.productId, locationId: adj.locationId } },
      update: { quantity: adj.countedQty },
      create: { productId: adj.productId, locationId: adj.locationId, quantity: adj.countedQty }
    });

    const totalStock = await prisma.stock.aggregate({ where: { productId: adj.productId }, _sum: { quantity: true } });

    await prisma.stockLedger.create({
      data: {
        productId: adj.productId, operationType: 'ADJUSTMENT',
        quantityIn: adj.difference > 0 ? adj.difference : 0,
        quantityOut: adj.difference < 0 ? Math.abs(adj.difference) : 0,
        sourceLocId: adj.locationId, referenceDoc: adj.reference,
        runningBalance: totalStock._sum.quantity || 0
      }
    });

    const updated = await prisma.stockAdjustment.update({
      where: { id }, data: { status: 'DONE' },
      include: { product: true, location: { include: { warehouse: true } } }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
