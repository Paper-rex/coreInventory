import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Pencil, Trash2, X, MapPin as MapPinIcon } from 'lucide-react';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filterWh, setFilterWh] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', shortCode: '', warehouseId: '' });

  const fetchLoc = () => { const p = filterWh ? { warehouseId: filterWh } : {}; api.get('/locations', { params: p }).then(r => setLocations(r.data)).catch(() => {}); };
  useEffect(() => { fetchLoc(); }, [filterWh]);
  useEffect(() => { api.get('/warehouses').then(r => setWarehouses(r.data)).catch(() => {}); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', shortCode: '', warehouseId: warehouses[0]?.id || '' }); setShowModal(true); };
  const openEdit = (l) => { setEditing(l); setForm({ name: l.name, shortCode: l.shortCode, warehouseId: l.warehouseId }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/locations/${editing.id}`, form);
    else await api.post('/locations', form);
    setShowModal(false); fetchLoc();
  };
  const handleDelete = async (id) => { if (confirm('Delete this location?')) { await api.delete(`/locations/${id}`); fetchLoc(); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-textNavy">Locations</h1><p className="text-sm text-slate-500 mt-1">Manage storage locations within warehouses.</p></div>
        <button onClick={openNew} className="bg-primary hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-primary/30 transition-all flex items-center gap-2 hover:-translate-y-0.5"><Plus className="h-4 w-4" /> Add Location</button>
      </div>
      <div className="flex gap-3 mb-2">
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20" value={filterWh} onChange={e => setFilterWh(e.target.value)}>
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {locations.map(l => (
          <div key={l.id} className="bg-card rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center"><MapPinIcon className="h-4 w-4 text-teal-600" /></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(l)} className="p-1 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(l.id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <h3 className="font-bold text-textNavy text-sm">{l.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{l.shortCode}</p>
            <p className="text-xs text-slate-400 mt-2">{l.warehouse?.name}</p>
          </div>
        ))}
        {locations.length === 0 && <div className="col-span-full text-center py-12 text-slate-400 bg-card rounded-2xl border border-slate-200">No locations yet.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-textNavy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-textNavy">{editing ? 'Edit Location' : 'New Location'}</h3><button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Warehouse</label><select required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.warehouseId} onChange={e => setForm({...form, warehouseId: e.target.value})}><option value="">Select</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Short Code</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.shortCode} onChange={e => setForm({...form, shortCode: e.target.value})} /></div>
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

export default Locations;
