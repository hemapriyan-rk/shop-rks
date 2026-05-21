import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { analyticsApi } from '../../api';
import type { DailyAnalytics, MonthlyAnalytics } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function AnalyticsPage() {
  const [tab, setTab] = useState<'daily' | 'monthly'>('daily');
  const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const nowIST = new Date();
  const [date, setDate] = useState(todayIST);
  const [year, setYear] = useState(nowIST.getFullYear());
  const [month, setMonth] = useState(nowIST.getMonth() + 1);
  const [daily, setDaily] = useState<DailyAnalytics | null>(null);
  const [monthly, setMonthly] = useState<MonthlyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === 'daily') {
      analyticsApi.daily(date).then(r => setDaily(r.data.data!)).finally(() => setLoading(false));
    } else {
      analyticsApi.monthly(year, month).then(r => setMonthly(r.data.data!)).finally(() => setLoading(false));
    }
  }, [tab, date, year, month]);

  const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="stat-card" style={{ '--stat-color': color } as React.CSSProperties}>
      <div className="stat-label">{label}</div>
      <div className="stat-value currency">{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
    </div>
  );



  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <Layout title="Analytics">
      <div className="page-header">
        <div className="page-header-title">Financial Analytics</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${tab === 'daily' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('daily')}>Daily</button>
          <button className={`btn ${tab === 'monthly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('monthly')}>Monthly</button>
        </div>
      </div>

      {tab === 'daily' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <label className="form-label">Date:</label>
          <input type="date" className="form-input" style={{ width: 180 }} value={date} max={todayIST} onChange={e => setDate(e.target.value)} />
        </div>
      )}

      {tab === 'monthly' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <label className="form-label">Year:</label>
          <select className="form-select" style={{ width: 100 }} value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <label className="form-label">Month:</label>
          <select className="form-select" style={{ width: 130 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
      )}

      {loading && <div className="page-loading"><div className="spinner spinner-lg" /></div>}

      {!loading && tab === 'daily' && daily && (
        <>
          <div className="stat-grid">
            <StatCard label="Total Income" value={daily.income} color="var(--green)" />
            <StatCard label="Cash Income" value={daily.cashIncome} color="#10B981" />
            <StatCard label="Online Income" value={daily.onlineIncome} color="#3B82F6" />
            <StatCard label="Expenses (Approved)" value={daily.expenses} color="var(--red)" />
            <StatCard label={`Profit ${daily.profit < 0 ? '(Loss)' : ''}`} value={daily.profit} color={daily.profit >= 0 ? 'var(--green)' : 'var(--red)'} />
            <div className="stat-card" style={{ '--stat-color': 'var(--blue)' } as React.CSSProperties}>
              <div className="stat-label">Transactions</div>
              <div className="stat-value">{daily.transactionCount}</div>
            </div>
          </div>

          {daily.topServices.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 14 }}>Top Services by Revenue</div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>#</th><th>Service</th><th>Category</th><th>Count</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {daily.topServices.map((ts, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{ts.service?.name}</td>
                        <td><span className="badge badge-purple">{ts.service?.category}</span></td>
                        <td>{ts.count}</td>
                        <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{ts.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {daily.userBreakdown.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Revenue by Operator</div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Name</th><th>Transactions</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {daily.userBreakdown.map((u, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{u.user?.name}</td>
                        <td>{u.count}</td>
                        <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{u.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && tab === 'monthly' && monthly && (
        <>
          <div className="stat-grid">
            <StatCard label="Monthly Income" value={monthly.income} color="var(--green)" />
            <StatCard label="Monthly Cash" value={monthly.cashIncome} color="#10B981" />
            <StatCard label="Monthly Online" value={monthly.onlineIncome} color="#3B82F6" />
            <StatCard label="Monthly Expenses" value={monthly.expenses} color="var(--red)" />
            <StatCard label="Monthly Profit" value={monthly.profit} color={monthly.profit >= 0 ? 'var(--green)' : 'var(--red)'} />
            <div className="stat-card" style={{ '--stat-color': 'var(--blue)' } as React.CSSProperties}>
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value">{monthly.transactionCount}</div>
            </div>
          </div>

          {monthly.daily.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Daily Income vs Expenses</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthly.daily} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#606080' }} tickFormatter={d => d.slice(8)} />
                  <YAxis tick={{ fontSize: 11, fill: '#606080' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} contentStyle={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#A0A0B8' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="cashIncome" name="Cash Income" stackId="income" fill="#10B981" />
                  <Bar dataKey="onlineIncome" name="Online Income" stackId="income" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
