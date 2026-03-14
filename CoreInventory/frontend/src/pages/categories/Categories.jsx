import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetch = () => api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/categories/${editing.id}`, form);
    else await api.post('/categories', form);
    setShowModal(false); fetch();
  };

  const handleDelete = async (id) => { if (confirm('Delete this category?')) { await api.delete(`/categories/${id}`); fetch(); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-textNavy">Categories</h1><p className="text-sm text-slate-500 mt-1">Manage product categories.</p></div>
        <button onClick={openNew} className="bg-primary hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-primary/30 transition-all flex items-center gap-2 hover:-translate-y-0.5"><Plus className="h-4 w-4" /> Add Category</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="bg-card rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div><h3 className="font-bold text-textNavy text-lg">{c.name}</h3><p className="text-sm text-slate-500 mt-1">{c.description || 'No description'}</p></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-medium">{c._count?.products || 0} products</span></div>
          </div>
        ))}
        {categories.length === 0 && <div className="col-span-full text-center py-12 text-slate-400 bg-card rounded-2xl border border-slate-200">No categories yet. Create one to organize products!</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-textNavy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-textNavy">{editing ? 'Edit Category' : 'New Category'}</h3><button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
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

export default Categories;
