const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', authorize('ADMIN', 'MANAGER'), ctrl.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), ctrl.update);
router.delete('/:id', authorize('ADMIN'), ctrl.remove);

module.exports = router;
