import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, TrendingUp, ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563EB', '#3B93B0', '#F4A431', '#94A3B8', '#10B981', '#6366F1'];

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [activity, setActivity] = useState([]);
  const [movementData, setMovementData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    api.get('/dashboard/kpis').then(r => setKpis(r.data)).catch(() => {});
    api.get('/dashboard/activity').then(r => setActivity(r.data)).catch(() => {});
    api.get('/dashboard/stock-movement').then(r => setMovementData(r.data)).catch(() => {});
    api.get('/dashboard/category-distribution').then(r => setCategoryData(r.data)).catch(() => {});
  }, []);

  const kpiCards = kpis ? [
    { title: 'Total Products', value: kpis.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Low Stock Items', value: kpis.lowStockItems, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' },
    { title: 'Pending Receipts', value: kpis.pendingReceipts, icon: ArrowDownToLine, color: 'text-teal-600', bg: 'bg-teal-100' },
    { title: 'Pending Deliveries', value: kpis.pendingDeliveries, icon: ArrowUpFromLine, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Scheduled Transfers', value: kpis.scheduledTransfers, icon: ArrowRightLeft, color: 'text-violet-600', bg: 'bg-violet-100' },
  ] : [];

  const getActivityLabel = (a) => {
    const type = a.operationType;
    const pName = a.product?.name || 'Unknown';
    if (type === 'RECEIPT') return `Receipt ${a.referenceDoc}: +${a.quantityIn} ${pName}`;
    if (type === 'DELIVERY') return `Delivery ${a.referenceDoc}: -${a.quantityOut} ${pName}`;
    if (type === 'TRANSFER') return `Transfer ${a.referenceDoc}: ${a.quantityIn} ${pName}`;
    return `Adjustment ${a.referenceDoc}: ${a.quantityIn > 0 ? '+' : '-'}${a.quantityIn || a.quantityOut} ${pName}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textNavy">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time inventory KPIs and stock movements.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="bg-card rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-textNavy mb-0.5">{kpi.value}</h3>
            <p className="text-xs font-medium text-slate-500">{kpi.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Movement Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-textNavy mb-6">Stock Movement (Last 7 Days)</h3>
          <div className="h-72 w-full">
            {movementData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={movementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="in" name="Qty In" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="out" name="Qty Out" stroke="#F4A431" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-slate-400 text-sm">No movement data yet</div>}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-textNavy mb-6">Category Distribution</h3>
          {categoryData.length > 0 ? (
            <>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                      {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2.5">
                {categoryData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div><span className="text-slate-600">{item.name}</span></div>
                    <span className="text-textNavy font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="flex items-center justify-center h-52 text-slate-400 text-sm">No category data yet</div>}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-textNavy mb-6">Recent Activity</h3>
        {activity.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
            {activity.slice(0, 10).map((a) => (
              <div key={a.id} className="relative pl-6">
                <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ring-4 ring-white ${
                  a.operationType === 'RECEIPT' ? 'bg-teal-500' : a.operationType === 'DELIVERY' ? 'bg-indigo-500' : a.operationType === 'TRANSFER' ? 'bg-blue-500' : 'bg-orange-500'
                }`}></div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">{new Date(a.date).toLocaleString()}</span>
                <p className="text-sm font-medium text-textNavy">{getActivityLabel(a)}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-400 text-center py-8">No activity recorded yet. Start receiving or delivering stock!</p>}
      </div>
    </div>
  );
};

export default Dashboard;
