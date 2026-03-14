import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Download } from 'lucide-react';

const opColors = { RECEIPT: 'bg-teal-50 text-teal-600', DELIVERY: 'bg-indigo-50 text-indigo-600', TRANSFER: 'bg-blue-50 text-blue-600', ADJUSTMENT: 'bg-orange-50 text-orange-600' };

const Ledger = () => {
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterProduct, setFilterProduct] = useState('');
  const [filterOp, setFilterOp] = useState('');

  const fetch = () => {
    const params = {};
    if (filterProduct) params.productId = filterProduct;
    if (filterOp) params.operationType = filterOp;
    api.get('/ledger', { params }).then(r => setEntries(r.data)).catch(() => {});
  };

  useEffect(() => { fetch(); }, [filterProduct, filterOp]);
  useEffect(() => { api.get('/products').then(r => setProducts(r.data)).catch(() => {}); }, []);

  const exportCSV = () => {
    const headers = ['Date', 'Product', 'Operation', 'Qty In', 'Qty Out', 'Source', 'Destination', 'Reference', 'Balance'];
    const rows = entries.map(e => [
      new Date(e.date).toLocaleString(), e.product?.name, e.operationType, e.quantityIn, e.quantityOut,
      e.sourceLocation?.name || '-', e.destLocation?.name || '-', e.referenceDoc, e.runningBalance
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'stock_ledger.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-textNavy">Stock Ledger</h1><p className="text-sm text-slate-500 mt-1">Complete history of all inventory movements.</p></div>
        <button onClick={exportCSV} className="bg-secondary hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-2"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20" value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20" value={filterOp} onChange={e => setFilterOp(e.target.value)}>
            <option value="">All Operations</option>
            <option value="RECEIPT">Receipt</option>
            <option value="DELIVERY">Delivery</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Date</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Product</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Operation</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Qty In</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Qty Out</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Source</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Destination</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Reference</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Balance</th>
            </tr></thead>
            <tbody>
              {entries.length === 0 ? <tr><td colSpan={9} className="text-center py-12 text-slate-400">No ledger entries yet.</td></tr> : entries.map(e => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(e.date).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-textNavy">{e.product?.name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${opColors[e.operationType]}`}>{e.operationType}</span></td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">{e.quantityIn > 0 ? `+${e.quantityIn}` : '-'}</td>
                  <td className="px-4 py-3 text-red-500 font-medium">{e.quantityOut > 0 ? `-${e.quantityOut}` : '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.sourceLocation?.name || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.destLocation?.name || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{e.referenceDoc}</td>
                  <td className="px-4 py-3 font-bold text-textNavy">{e.runningBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
