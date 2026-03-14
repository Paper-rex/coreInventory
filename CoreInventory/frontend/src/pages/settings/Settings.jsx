import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-textNavy">Settings</h1><p className="text-sm text-slate-500 mt-1">View your profile information.</p></div>

      <div className="bg-card rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-textNavy">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <User className="h-5 w-5 text-primary" />
            <div><p className="text-xs text-slate-500 font-medium">Full Name</p><p className="text-sm text-textNavy font-semibold">{user?.name}</p></div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Mail className="h-5 w-5 text-primary" />
            <div><p className="text-xs text-slate-500 font-medium">Email</p><p className="text-sm text-textNavy font-semibold">{user?.email}</p></div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Shield className="h-5 w-5 text-primary" />
            <div><p className="text-xs text-slate-500 font-medium">Role</p><p className="text-sm text-textNavy font-semibold">{user?.role}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
