import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await signup(form.name, form.email, form.password, form.role);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-textNavy text-center mb-2">Create Account</h3>
      <p className="text-slate-500 text-center text-sm mb-8">Fill in the details to get started</p>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">{success}</div>}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
            <input name="name" required className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-textNavy placeholder-slate-400 bg-slate-50/50"
              placeholder="John Doe" value={form.name} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
            <input name="email" type="email" required className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-textNavy placeholder-slate-400 bg-slate-50/50"
              placeholder="you@company.com" value={form.email} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
            <input name="password" type="password" required minLength={6} className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-textNavy placeholder-slate-400 bg-slate-50/50"
              placeholder="••••••••" value={form.password} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select name="role" value={form.role} onChange={handleChange}
            className="block w-full py-3 px-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-textNavy bg-slate-50/50">
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Inventory Manager</option>
            <option value="STAFF">Warehouse Staff</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        <button type="submit" disabled={isSubmitting}
          className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md text-sm font-medium text-white bg-primary hover:bg-blue-700 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 shadow-primary/30'}`}>
          {isSubmitting ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          : <> Create Account <ArrowRight className="ml-2 h-4 w-4" /> </>}
        </button>
        <p className="text-center text-sm text-slate-500">Already have an account? <a href="/login" className="text-primary font-medium hover:text-blue-700">Sign in</a></p>
      </form>
    </div>
  );
};

export default Signup;
