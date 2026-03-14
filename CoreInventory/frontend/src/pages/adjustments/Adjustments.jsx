import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, CheckCircle, X } from 'lucide-react';

const statusColors = { DRAFT: 'bg-slate-100 text-slate-600', DONE: 'bg-emerald-50 text-emerald-600', CANCELLED: 'bg-red-50 text-red-500' };

const Adjustments = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ reference: '', productId: '', locationId: '', countedQty: 0, reason: '' });

  const fetch = () => api.get('/adjustments').then(r => setAdjustments(r.data)).catch(() => {});
  useEffect(() => { fetch(); api.get('/products').then(r => setProducts(r.data)).catch(() => {}); api.get('/locations').then(r => setLocations(r.data)).catch(() => {}); }, []);

  const handleSubmit = async (e) => { e.preventDefault(); await api.post('/adjustments', form); setShowModal(false); fetch(); };
  const handleValidate = async (id) => { await api.post(`/adjustments/${id}/validate`); fetch(); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-textNavy">Stock Adjustments</h1><p className="text-sm text-slate-500 mt-1">Correct inventory discrepancies.</p></div>
        <button onClick={() => { setForm({ reference: `ADJ${String(Date.now()).slice(-5)}`, productId: '', locationId: '', countedQty: 0, reason: '' }); setShowModal(true); }} className="bg-primary hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-primary/30 transition-all flex items-center gap-2 hover:-translate-y-0.5"><Plus className="h-4 w-4" /> New Adjustment</button>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 text-left">
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Reference</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Product</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Location</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">System Qty</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Counted</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Diff</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {adjustments.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-slate-400">No adjustments yet.</td></tr> : adjustments.map(a => (
              <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-xs font-medium text-textNavy">{a.reference}</td>
                <td className="px-4 py-3 text-slate-600">{a.product?.name}</td>
                <td className="px-4 py-3 text-slate-600">{a.location?.name}</td>
                <td className="px-4 py-3 text-slate-600">{a.systemQty}</td>
                <td className="px-4 py-3 text-slate-600">{a.countedQty}</td>
                <td className="px-4 py-3"><span className={`font-bold ${a.difference < 0 ? 'text-red-500' : a.difference > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>{a.difference > 0 ? '+' : ''}{a.difference}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[a.status]}`}>{a.status}</span></td>
                <td className="px-4 py-3">
                  {a.status === 'DRAFT' && <button onClick={() => handleValidate(a.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><CheckCircle className="h-4 w-4" /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-textNavy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-textNavy">New Adjustment</h3><button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Reference</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Product</label><select required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.productId} onChange={e => setForm({...form, productId: e.target.value})}><option value="">Select</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Location</label><select required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.locationId} onChange={e => setForm({...form, locationId: e.target.value})}><option value="">Select</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.name})</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Counted Quantity</label><input type="number" min={0} required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.countedQty} onChange={e => setForm({...form, countedQty: parseInt(e.target.value) || 0})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Reason</label><textarea className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" rows={2} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm shadow-primary/30">Create Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adjustments;
