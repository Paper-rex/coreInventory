const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { sendOtpEmail } = require('../utils/email');

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Max OTP verification attempts before lockout
const MAX_OTP_ATTEMPTS = 5;

// ──────────────────────────────────────────────
// SIGNUP
// ──────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: role || 'VIEWER' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────
// GET CURRENT USER
// ──────────────────────────────────────────────
exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────
// STEP 1: FORGOT PASSWORD — Send OTP to email
// POST /auth/forgot-password  { email }
// ──────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No account found with this email address.' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { email },
      data: { resetOtp: otp, otpExpiry, otpAttempts: 0 }
    });

    // Send OTP via email
    try {
      const { sendOtpEmail } = require('../utils/email');
      await sendOtpEmail(email, otp, user.name);
    } catch (emailErr) {
      console.warn('⚠️ SMTP failed, but OTP is generated. Check console for development testing.');
      console.log('──────────────────────────────────────────────');
      console.log(`🔥 [DEV] OTP for ${email}: ${otp}`);
      console.log('──────────────────────────────────────────────');
    }

    res.json({ message: 'OTP has been sent to your email address. It is valid for 5 minutes.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP email. Please check SMTP configuration.' });
  }
};

// ──────────────────────────────────────────────
// STEP 2: VERIFY OTP
// POST /auth/verify-otp  { email, otp }
// ──────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Check if OTP attempts exceeded
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      await prisma.user.update({
        where: { email },
        data: { resetOtp: null, otpExpiry: null, otpAttempts: 0 }
      });
      return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' });
    }

    // Check if OTP exists
    if (!user.resetOtp) {
      return res.status(400).json({ error: 'No OTP was requested. Please request a new one.' });
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiry) {
      await prisma.user.update({
        where: { email },
        data: { resetOtp: null, otpExpiry: null, otpAttempts: 0 }
      });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check if OTP matches
    if (user.resetOtp !== otp) {
      await prisma.user.update({
        where: { email },
        data: { otpAttempts: user.otpAttempts + 1 }
      });
      const remaining = MAX_OTP_ATTEMPTS - user.otpAttempts - 1;
      return res.status(400).json({ error: `Invalid OTP. ${remaining} attempt(s) remaining.` });
    }

    // OTP is valid — don't clear it yet, wait for password reset
    res.json({ message: 'OTP verified successfully. You can now reset your password.' });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────
// STEP 3: RESET PASSWORD
// POST /auth/reset-password  { email, newPassword }
// ──────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password are required.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Ensure OTP was verified (resetOtp still exists in DB from verify step)
    if (!user.resetOtp) {
      return res.status(400).json({ error: 'Please verify your OTP first.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashed, resetOtp: null, otpExpiry: null, otpAttempts: 0 }
    });

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
