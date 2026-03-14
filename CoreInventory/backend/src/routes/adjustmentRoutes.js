const router = require('express').Router();
const ctrl = require('../controllers/adjustmentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', authorize('ADMIN', 'MANAGER', 'STAFF'), ctrl.create);
router.post('/:id/validate', authorize('ADMIN', 'MANAGER'), ctrl.validate);

module.exports = router;
