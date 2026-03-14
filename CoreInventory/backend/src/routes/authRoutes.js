const router = require('express').Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.get('/me', authenticate, auth.me);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

module.exports = router;
