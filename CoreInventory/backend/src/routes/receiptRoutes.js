const router = require('express').Router();
const ctrl = require('../controllers/receiptController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authorize('ADMIN', 'MANAGER', 'STAFF'), ctrl.create);
router.post('/:id/validate', authorize('ADMIN', 'MANAGER', 'STAFF'), ctrl.validate);
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), ctrl.cancel);

module.exports = router;
