import { useState } from 'react';
import api from '../../services/api';
import { Mail, ArrowRight, Key, Lock } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP & new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(`OTP sent! (Dev mode OTP: ${res.data.otp})`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setMessage('Password reset successful! You can now login.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-textNavy text-center mb-2">Reset Password</h3>
      <p className="text-slate-500 text-center text-sm mb-8">
        {step === 1 ? 'Enter your email to receive an OTP' : step === 2 ? 'Enter the OTP and your new password' : 'All done!'}
      </p>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
      {message && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">{message}</div>}

      {step === 1 && (
        <form className="space-y-5" onSubmit={handleRequestOTP}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
              <input type="email" required className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-textNavy bg-slate-50/50"
                placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-blue-700 transition-all">
            Send OTP <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          <p className="text-center text-sm text-slate-500"><a href="/login" className="text-primary font-medium hover:text-blue-700">Back to Login</a></p>
        </form>
      )}

      {step === 2 && (
        <form className="space-y-5" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">OTP Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Key className="h-5 w-5 text-slate-400" /></div>
              <input type="text" required className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-textNavy bg-slate-50/50"
                placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
              <input type="password" required minLength={6} className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-textNavy bg-slate-50/50"
                placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-blue-700 transition-all">
            Reset Password <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center">
          <a href="/login" className="inline-flex items-center text-primary font-medium hover:text-blue-700 transition-colors">
            Go to Login <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
