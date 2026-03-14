const prisma = require('../utils/prisma');

exports.getKPIs = async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();
    
    // Low stock items: products where total stock <= reorderLevel
    const products = await prisma.product.findMany({ include: { stocks: true } });
    let lowStockItems = 0;
    for (const p of products) {
      const totalQty = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
      if (totalQty <= p.reorderLevel) lowStockItems++;
    }

    const pendingReceipts = await prisma.receipt.count({ where: { status: { in: ['DRAFT', 'READY'] } } });
    const pendingDeliveries = await prisma.deliveryOrder.count({ where: { status: { in: ['DRAFT', 'WAITING', 'READY'] } } });
    const scheduledTransfers = await prisma.internalTransfer.count({ where: { status: { in: ['DRAFT', 'READY'] } } });

    res.json({ totalProducts, lowStockItems, pendingReceipts, pendingDeliveries, scheduledTransfers });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const activities = await prisma.stockLedger.findMany({
      take: 20,
      orderBy: { date: 'desc' },
      include: { product: true, sourceLocation: true, destLocation: true }
    });
    res.json(activities);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStockMovementChart = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const movements = await prisma.stockLedger.findMany({
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' }
    });

    // Group by day
    const dayMap = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    movements.forEach(m => {
      const dayName = days[new Date(m.date).getDay()];
      if (!dayMap[dayName]) dayMap[dayName] = { name: dayName, in: 0, out: 0 };
      dayMap[dayName].in += m.quantityIn;
      dayMap[dayName].out += m.quantityOut;
    });

    res.json(Object.values(dayMap));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCategoryDistribution = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: { include: { stocks: true } } }
    });
    const result = categories.map(c => ({
      name: c.name,
      value: c.products.reduce((sum, p) => sum + p.stocks.reduce((s, st) => s + st.quantity, 0), 0)
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
