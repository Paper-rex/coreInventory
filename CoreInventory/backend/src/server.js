require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/warehouses', require('./routes/warehouseRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/transfers', require('./routes/transferRoutes'));
app.use('/api/adjustments', require('./routes/adjustmentRoutes'));
app.use('/api/ledger', require('./routes/ledgerRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CoreInventory API running on http://localhost:${PORT}`);
});
