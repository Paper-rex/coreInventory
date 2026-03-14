import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, CheckCircle, X, Eye } from 'lucide-react';

const statusColors = { DRAFT: 'bg-slate-100 text-slate-600', READY: 'bg-blue-50 text-blue-600', DONE: 'bg-emerald-50 text-emerald-600', CANCELLED: 'bg-red-50 text-red-500' };

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ reference: '', sourceLocId: '', destLocId: '', items: [{ productId: '', quantity: 1 }] });

  const fetch = () => api.get('/transfers').then(r => setTransfers(r.data)).catch(() => {});
  useEffect(() => { fetch(); api.get('/products').then(r => setProducts(r.data)).catch(() => {}); api.get('/locations').then(r => setLocations(r.data)).catch(() => {}); }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, val) => { const items = [...form.items]; items[i][field] = val; setForm({ ...form, items }); };

  const handleSubmit = async (e) => { e.preventDefault(); await api.post('/transfers', form); setShowModal(false); fetch(); };
  const handleValidate = async (id) => { try { await api.post(`/transfers/${id}/validate`); fetch(); } catch (err) { alert(err.response?.data?.error || 'Validation failed'); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-textNavy">Internal Transfers</h1><p className="text-sm text-slate-500 mt-1">Move inventory between locations.</p></div>
        <button onClick={() => { setForm({ reference: `T${String(Date.now()).slice(-5)}`, sourceLocId: '', destLocId: '', items: [{ productId: '', quantity: 1 }] }); setShowModal(true); }} className="bg-primary hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-primary/30 transition-all flex items-center gap-2 hover:-translate-y-0.5"><Plus className="h-4 w-4" /> New Transfer</button>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 text-left">
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Reference</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Source</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Destination</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Items</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {transfers.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-slate-400">No transfers yet.</td></tr> : transfers.map(t => (
              <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-xs font-medium text-textNavy">{t.reference}</td>
                <td className="px-4 py-3 text-slate-600">{t.sourceLocation?.name}</td>
                <td className="px-4 py-3 text-slate-600">{t.destLocation?.name}</td>
                <td className="px-4 py-3 text-slate-600">{t.items?.length || 0}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[t.status]}`}>{t.status}</span></td>
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => setViewItem(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-textNavy"><Eye className="h-4 w-4" /></button>
                  {t.status === 'DRAFT' && <button onClick={() => handleValidate(t.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><CheckCircle className="h-4 w-4" /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewItem && (
        <div className="fixed inset-0 bg-textNavy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-textNavy">Transfer {viewItem.reference}</h3><button onClick={() => setViewItem(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button></div>
            <div className="p-6 space-y-3 text-sm">
              <p><span className="font-medium text-slate-500">From:</span> {viewItem.sourceLocation?.name} → <span className="font-medium text-slate-500">To:</span> {viewItem.destLocation?.name}</p>
              <p><span className="font-medium text-slate-500">Status:</span> <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[viewItem.status]}`}>{viewItem.status}</span></p>
              <h4 className="font-bold text-textNavy mt-4">Items</h4>
              {viewItem.items?.map((it, i) => <div key={i} className="flex justify-between border-b border-slate-50 py-2"><span>{it.product?.name}</span><span className="font-bold">{it.quantity}</span></div>)}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-textNavy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-textNavy">New Transfer</h3><button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Reference</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Source</label><select required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.sourceLocId} onChange={e => setForm({...form, sourceLocId: e.target.value})}><option value="">Select</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.name})</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Destination</label><select required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.destLocId} onChange={e => setForm({...form, destLocId: e.target.value})}><option value="">Select</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.name})</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Items</label>
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select required className="flex-1 border border-slate-200 rounded-lg px-2 py-2 text-sm" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}><option value="">Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <input type="number" min={1} required className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-sm" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                    {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>}
                  </div>
                ))}
                <button type="button" onClick={addItem} className="text-sm text-primary hover:text-blue-700 font-medium">+ Add Item</button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm shadow-primary/30">Create Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfers;
