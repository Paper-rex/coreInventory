const prisma = require('../utils/prisma');

exports.list = async (req, res) => {
  try {
    const transfers = await prisma.internalTransfer.findMany({
      include: { sourceLocation: { include: { warehouse: true } }, destLocation: { include: { warehouse: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transfers);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const transfer = await prisma.internalTransfer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { sourceLocation: { include: { warehouse: true } }, destLocation: { include: { warehouse: true } }, items: { include: { product: true } } }
    });
    if (!transfer) return res.status(404).json({ error: 'Transfer not found.' });
    res.json(transfer);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { reference, sourceLocId, destLocId, items } = req.body;
    const transfer = await prisma.internalTransfer.create({
      data: {
        reference, sourceLocId: parseInt(sourceLocId), destLocId: parseInt(destLocId),
        items: { create: items.map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) })) }
      },
      include: { items: { include: { product: true } }, sourceLocation: true, destLocation: true }
    });
    res.status(201).json(transfer);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.validate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const transfer = await prisma.internalTransfer.findUnique({ where: { id }, include: { items: true } });
    if (!transfer) return res.status(404).json({ error: 'Transfer not found.' });
    if (transfer.status === 'DONE') return res.status(400).json({ error: 'Transfer already validated.' });

    for (const item of transfer.items) {
      const stock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: item.productId, locationId: transfer.sourceLocId } }
      });
      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ID ${item.productId} at source location.` });
      }
    }

    for (const item of transfer.items) {
      // Decrease source
      await prisma.stock.update({
        where: { productId_locationId: { productId: item.productId, locationId: transfer.sourceLocId } },
        data: { quantity: { decrement: item.quantity } }
      });
      // Increase destination
      await prisma.stock.upsert({
        where: { productId_locationId: { productId: item.productId, locationId: transfer.destLocId } },
        update: { quantity: { increment: item.quantity } },
        create: { productId: item.productId, locationId: transfer.destLocId, quantity: item.quantity }
      });

      const totalStock = await prisma.stock.aggregate({ where: { productId: item.productId }, _sum: { quantity: true } });
      await prisma.stockLedger.create({
        data: {
          productId: item.productId, operationType: 'TRANSFER', quantityIn: item.quantity, quantityOut: item.quantity,
          sourceLocId: transfer.sourceLocId, destLocId: transfer.destLocId, referenceDoc: transfer.reference,
          runningBalance: totalStock._sum.quantity || 0
        }
      });
    }

    const updated = await prisma.internalTransfer.update({
      where: { id }, data: { status: 'DONE' },
      include: { items: { include: { product: true } }, sourceLocation: true, destLocation: true }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
