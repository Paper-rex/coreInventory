const prisma = require('../utils/prisma');

exports.list = async (req, res) => {
  try {
    const { productId, operationType } = req.query;
    const where = {};
    if (productId) where.productId = parseInt(productId);
    if (operationType) where.operationType = operationType;

    const ledger = await prisma.stockLedger.findMany({
      where,
      include: {
        product: true,
        sourceLocation: { include: { warehouse: true } },
        destLocation: { include: { warehouse: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(ledger);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
