const prisma = require('../utils/prisma');

exports.list = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const receipts = await prisma.receipt.findMany({
      where, include: { location: { include: { warehouse: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(receipts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { location: { include: { warehouse: true } }, items: { include: { product: true } } }
    });
    if (!receipt) return res.status(404).json({ error: 'Receipt not found.' });
    res.json(receipt);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { reference, supplier, locationId, items } = req.body;
    const receipt = await prisma.receipt.create({
      data: {
        reference, supplier, locationId: parseInt(locationId),
        items: { create: items.map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) })) }
      },
      include: { items: { include: { product: true } }, location: true }
    });
    res.status(201).json(receipt);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.validate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const receipt = await prisma.receipt.findUnique({ where: { id }, include: { items: true } });
    if (!receipt) return res.status(404).json({ error: 'Receipt not found.' });
    if (receipt.status === 'DONE') return res.status(400).json({ error: 'Receipt already validated.' });

    // Update stocks and create ledger entries
    for (const item of receipt.items) {
      await prisma.stock.upsert({
        where: { productId_locationId: { productId: item.productId, locationId: receipt.locationId } },
        update: { quantity: { increment: item.quantity } },
        create: { productId: item.productId, locationId: receipt.locationId, quantity: item.quantity }
      });

      const totalStock = await prisma.stock.aggregate({ where: { productId: item.productId }, _sum: { quantity: true } });
      await prisma.stockLedger.create({
        data: {
          productId: item.productId, operationType: 'RECEIPT', quantityIn: item.quantity,
          destLocId: receipt.locationId, referenceDoc: receipt.reference,
          runningBalance: totalStock._sum.quantity || 0
        }
      });
    }

    const updated = await prisma.receipt.update({
      where: { id }, data: { status: 'DONE' },
      include: { items: { include: { product: true } }, location: true }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.cancel = async (req, res) => {
  try {
    const updated = await prisma.receipt.update({ where: { id: parseInt(req.params.id) }, data: { status: 'CANCELLED' } });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
