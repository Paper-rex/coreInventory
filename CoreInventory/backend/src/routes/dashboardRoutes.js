const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/kpis', ctrl.getKPIs);
router.get('/activity', ctrl.getRecentActivity);
router.get('/stock-movement', ctrl.getStockMovementChart);
router.get('/category-distribution', ctrl.getCategoryDistribution);

module.exports = router;
