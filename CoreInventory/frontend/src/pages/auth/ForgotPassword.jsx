import { useState } from 'react';
import api from '../../services/api';
import { Mail, ArrowRight, Key, Lock, CheckCircle, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=Email, 2=OTP, 3=New Password, 4=Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── Step 1: Request OTP ──────────────────
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  // ─── Step 2: Verify OTP ───────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed.');
    } finally { setLoading(false); }
  };

  // ─── Step 3: Reset Password ───────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await api.post('/auth/reset-password', { email, newPassword });
      setMessage(res.data.message);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  // ─── Step Progress Indicator ──────────────
  const steps = ['Email', 'Verify OTP', 'New Password'];
  const stepDescriptions = [
    'Enter your registered email address',
    'Enter the 6-digit OTP sent to your email',
    'Create a new secure password',
    'Your password has been reset!'
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-textNavy text-center mb-2">Reset Password</h3>
      <p className="text-slate-500 text-center text-sm mb-6">{stepDescriptions[step - 1]}</p>

      {/* Step Progress Bar */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-1 mb-8">
          {steps.map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                idx + 1 < step ? 'bg-emerald-100 text-emerald-700' :
                idx + 1 === step ? 'bg-primary/10 text-primary ring-2 ring-primary/20' :
                'bg-slate-100 text-slate-400'
              }`}>
                {idx + 1 < step ? <CheckCircle className="h-3.5 w-3.5" /> : <span>{idx + 1}</span>}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-6 h-0.5 mx-1 rounded transition-colors ${idx + 1 < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}
      {message && step !== 4 && (
        <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      {/* ─── Step 1: Enter Email ─── */}
      {step === 1 && (
        <form className="space-y-5" onSubmit={handleRequestOTP}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
              <input type="email" required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-textNavy bg-slate-50/50 transition-colors"
                placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-blue-700 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 shadow-primary/30'}`}>
            {loading ? <Spinner /> : <> Send OTP <ArrowRight className="ml-2 h-4 w-4" /> </>}
          </button>
          <p className="text-center text-sm text-slate-500">
            <a href="/login" className="text-primary font-medium hover:text-blue-700 transition-colors">← Back to Login</a>
          </p>
        </form>
      )}

      {/* ─── Step 2: Enter OTP ─── */}
      {step === 2 && (
        <form className="space-y-5" onSubmit={handleVerifyOTP}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit OTP Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Key className="h-5 w-5 text-slate-400" /></div>
              <input type="text" required maxLength={6} pattern="[0-9]{6}"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-textNavy bg-slate-50/50 tracking-[0.3em] text-center text-lg font-bold transition-colors"
                placeholder="• • • • • •" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            </div>
            <p className="text-xs text-slate-400 mt-2">Check your inbox at <strong className="text-slate-600">{email}</strong></p>
          </div>
          <button type="submit" disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-blue-700 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 shadow-primary/30'}`}>
            {loading ? <Spinner /> : <> Verify OTP <ShieldCheck className="ml-2 h-4 w-4" /> </>}
          </button>
          <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
            className="w-full py-2 text-sm text-slate-500 hover:text-primary transition-colors">
            ← Change email or resend OTP
          </button>
        </form>
      )}

      {/* ─── Step 3: New Password ─── */}
      {step === 3 && (
        <form className="space-y-5" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
              <input type="password" required minLength={6}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-textNavy bg-slate-50/50 transition-colors"
                placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
              <input type="password" required minLength={6}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-textNavy bg-slate-50/50 transition-colors"
                placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <button type="submit" disabled={loading || (confirmPassword && newPassword !== confirmPassword)}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-blue-700 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 shadow-primary/30'}`}>
            {loading ? <Spinner /> : <> Reset Password <ArrowRight className="ml-2 h-4 w-4" /> </>}
          </button>
        </form>
      )}

      {/* ─── Step 4: Success ─── */}
      {step === 4 && (
        <div className="text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-textNavy mb-1">Password Reset Successful!</h4>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
          <a href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-blue-700 transition-all duration-200 hover:-translate-y-0.5 shadow-primary/30">
            Go to Login <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
};

// ─── Loading Spinner ────────────────────────
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default ForgotPassword;
