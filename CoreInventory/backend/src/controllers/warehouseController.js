const prisma = require('../utils/prisma');

exports.list = async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({ include: { locations: true }, orderBy: { name: 'asc' } });
    res.json(warehouses);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const wh = await prisma.warehouse.findUnique({ where: { id: parseInt(req.params.id) }, include: { locations: true } });
    if (!wh) return res.status(404).json({ error: 'Warehouse not found.' });
    res.json(wh);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, shortCode, address } = req.body;
    const wh = await prisma.warehouse.create({ data: { name, shortCode, address } });
    res.status(201).json(wh);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const wh = await prisma.warehouse.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json(wh);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await prisma.warehouse.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Warehouse deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
