import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Pencil, Trash2, X, Warehouse as WarehouseIcon } from 'lucide-react';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', shortCode: '', address: '' });

  const fetch = () => api.get('/warehouses').then(r => setWarehouses(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', shortCode: '', address: '' }); setShowModal(true); };
  const openEdit = (w) => { setEditing(w); setForm({ name: w.name, shortCode: w.shortCode, address: w.address || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/warehouses/${editing.id}`, form);
    else await api.post('/warehouses', form);
    setShowModal(false); fetch();
  };

  const handleDelete = async (id) => { if (confirm('Delete this warehouse?')) { await api.delete(`/warehouses/${id}`); fetch(); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-textNavy">Warehouses</h1><p className="text-sm text-slate-500 mt-1">Manage your warehouses.</p></div>
        <button onClick={openNew} className="bg-primary hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-primary/30 transition-all flex items-center gap-2 hover:-translate-y-0.5"><Plus className="h-4 w-4" /> Add Warehouse</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map(w => (
          <div key={w.id} className="bg-card rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center"><WarehouseIcon className="h-5 w-5 text-secondary" /></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <h3 className="font-bold text-textNavy">{w.name}</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">{w.shortCode}</p>
            {w.address && <p className="text-sm text-slate-500 mt-2">{w.address}</p>}
            <div className="mt-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-medium">{w.locations?.length || 0} locations</span></div>
          </div>
        ))}
        {warehouses.length === 0 && <div className="col-span-full text-center py-12 text-slate-400 bg-card rounded-2xl border border-slate-200">No warehouses yet.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-textNavy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-textNavy">{editing ? 'Edit Warehouse' : 'New Warehouse'}</h3><button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Short Code</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.shortCode} onChange={e => setForm({...form, shortCode: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><textarea className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm shadow-primary/30">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
