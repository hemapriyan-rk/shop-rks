import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { transactionsApi } from '../../api';
import type { Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';

function isToday(dateStr: string) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return dateStr.startsWith(today);
}

export default function TransactionsList() {
  const { isAdmin } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    transactionsApi.list({ date })
      .then(r => {
        const data = r.data.data ?? [];
        setTransactions(data);
        setTotal(data.reduce((s, t) => s + Number(t.totalPrice), 0));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [date]);

  const handleDelete = async (id: string) => {
    try {
      await transactionsApi.delete(id);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Delete failed');
    }
    setDeleteId(null);
  };

  return (
    <Layout title="Transactions">
      <div className="page-header">
        <div>
          <div className="page-header-title">Transactions</div>
          <div className="page-header-sub">Service income entries</div>
        </div>
        <div className="page-actions">
          {isAdmin ? (
            <input type="date" className="form-input" style={{ width: 160 }} value={date} onChange={e => setDate(e.target.value)} max={new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })} />
          ) : (
            <div className="badge badge-blue">Today: {date}</div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error mb-16">{error}</div>}

      <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{transactions.length} records for {date}</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-accent)' }}>Total: ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
      </div>

      {loading ? <div className="page-loading"><div className="spinner spinner-lg" /></div> : transactions.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No transactions for this date</div></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th>Service</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total</th>
              <th>By</th><th>Time</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {transactions.map(t => {
                const editable = isToday(t.createdAt);
                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.service.name}</td>
                    <td><span className="badge badge-purple">{t.service.category}</span></td>
                    <td>{t.quantity}</td>
                    <td>₹{Number(t.unitPrice).toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{Number(t.totalPrice).toFixed(2)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.user.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(t.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      {isAdmin && editable && (
                        deleteId === t.id ? (
                          <span>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Confirm</button>
                            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 4 }} onClick={() => setDeleteId(null)}>Cancel</button>
                          </span>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(t.id)}>Delete</button>
                        )
                      )}
                      {!editable && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Read-only</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
