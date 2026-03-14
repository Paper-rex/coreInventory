const prisma = require('../utils/prisma');

exports.list = async (req, res) => {
  try {
    const { search, categoryId } = req.query;
    const where = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }];
    if (categoryId) where.categoryId = parseInt(categoryId);

    const products = await prisma.product.findMany({
      where,
      include: { category: true, stocks: { include: { location: { include: { warehouse: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true, stocks: { include: { location: { include: { warehouse: true } } } } }
    });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, sku, unitOfMeasure, reorderLevel, categoryId, initialStock, locationId } = req.body;
    const product = await prisma.product.create({
      data: { name, sku, unitOfMeasure, reorderLevel: reorderLevel || 0, categoryId: parseInt(categoryId) },
      include: { category: true }
    });

    // If initial stock is provided, create a stock record and ledger entry
    if (initialStock && initialStock > 0 && locationId) {
      await prisma.stock.create({
        data: { productId: product.id, locationId: parseInt(locationId), quantity: parseInt(initialStock) }
      });
      await prisma.stockLedger.create({
        data: {
          productId: product.id, operationType: 'RECEIPT', quantityIn: parseInt(initialStock),
          destLocId: parseInt(locationId), referenceDoc: `INIT-${product.sku}`, runningBalance: parseInt(initialStock)
        }
      });
    }
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const { name, sku, unitOfMeasure, reorderLevel, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { name, sku, unitOfMeasure, reorderLevel, categoryId: categoryId ? parseInt(categoryId) : undefined },
      include: { category: true }
    });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
