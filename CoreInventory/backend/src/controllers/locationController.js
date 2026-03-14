const prisma = require('../utils/prisma');

exports.list = async (req, res) => {
  try {
    const { warehouseId } = req.query;
    const where = warehouseId ? { warehouseId: parseInt(warehouseId) } : {};
    const locations = await prisma.location.findMany({ where, include: { warehouse: true }, orderBy: { name: 'asc' } });
    res.json(locations);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, shortCode, warehouseId } = req.body;
    const loc = await prisma.location.create({ data: { name, shortCode, warehouseId: parseInt(warehouseId) }, include: { warehouse: true } });
    res.status(201).json(loc);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.warehouseId) data.warehouseId = parseInt(data.warehouseId);
    const loc = await prisma.location.update({ where: { id: parseInt(req.params.id) }, data, include: { warehouse: true } });
    res.json(loc);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Location deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
