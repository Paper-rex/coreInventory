const nodemailer = require('nodemailer');

/**
 * Create the SMTP transporter
 * Supports Gmail, Google Workspace, Outlook, and custom SMTP servers
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Helps with some corporate/university SMTP servers
    },
  });
};

/**
 * Send an OTP email for password reset
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - Recipient's name
 */
const sendOtpEmail = async (toEmail, otp, userName = 'User') => {
  const transporter = createTransporter();

  // Verify SMTP connection first
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
  } catch (verifyErr) {
    console.error('❌ SMTP connection verification failed:', verifyErr.message);
    throw new Error(`SMTP connection failed: ${verifyErr.message}`);
  }

  const mailOptions = {
    from: `"CoreInventory" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '🔒 CoreInventory — Password Reset OTP',
    text: `Hello ${userName},\n\nYour OTP for resetting your CoreInventory password is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.\n\n— CoreInventory Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #2563EB, #3B93B0); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Core<span style="opacity: 0.9;">Inventory</span></h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Password Reset Request</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #1E293B; font-size: 15px; margin: 0 0 8px;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your password. Use the OTP code below to proceed. This code is valid for <strong>5 minutes</strong>.
          </p>
          <div style="background: #F8FAFC; border: 2px dashed #2563EB; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <p style="margin: 0 0 4px; color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your OTP Code</p>
            <p style="margin: 0; color: #2563EB; font-size: 36px; font-weight: 800; letter-spacing: 8px;">${otp}</p>
          </div>
          <p style="color: #94A3B8; font-size: 13px; line-height: 1.5; margin: 0;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="background: #F8FAFC; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94A3B8; font-size: 12px;">© ${new Date().getFullYear()} CoreInventory • Inventory Management System</p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✅ OTP email sent to:', toEmail, '| MessageId:', info.messageId);
  return info;
};

module.exports = { sendOtpEmail };
