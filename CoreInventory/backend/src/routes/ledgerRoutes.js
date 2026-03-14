const router = require('express').Router();
const ctrl = require('../controllers/ledgerController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.list);

module.exports = router;
