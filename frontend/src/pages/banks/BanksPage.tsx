import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { banksApi, expensesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { BankAccount } from '../../types';

export default function BanksPage() {
  const { isSuperAdmin } = useAuth();
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [depositModal, setDepositModal] = useState<BankAccount | null>(null);
  const [balanceModal, setBalanceModal] = useState<BankAccount | null>(null);
  const [withdrawModal, setWithdrawModal] = useState<BankAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    banksApi.analytics({ date, action })
      .then(r => setBanks(r.data.data ?? []))
      .catch(() => setError('Failed to load bank data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [date, action]);

  const handleDeposit = async () => {
    if (!depositModal) return;
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setSubmitting(true);
    try {
      await banksApi.deposit(depositModal.id, val, note);
      setDepositModal(null);
      setAmount('');
      setNote('');
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Deposit failed');
    } finally { setSubmitting(false); }
  };

  const handleSetBalance = async () => {
    if (!balanceModal) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) return;
    setSubmitting(true);
    try {
      await banksApi.setBalance(balanceModal.id, val, note);
      setBalanceModal(null);
      setAmount('');
      setNote('');
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Update failed');
    } finally { setSubmitting(false); }
  };

  const handleWithdraw = async () => {
    if (!withdrawModal) return;
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setSubmitting(true);
    try {
      // Manual deduction from bank page creates a 'Miscellaneous' expense
      await expensesApi.create({
        amount: val,
        category: 'Miscellaneous',
        note: note || `Manual deduction from ${withdrawModal.name}`,
        bankId: withdrawModal.id
      });
      setWithdrawModal(null);
      setAmount('');
      setNote('');
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Deduction failed');
    } finally { setSubmitting(false); }
  };

  return (
    <Layout title="Bank Accounts">
      <div className="page-header">
        <div>
          <div className="page-header-title">Bank Accounts</div>
          <div className="page-header-sub">Manage cash flow and balances</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="date" className="form-input" style={{ width: 160 }} value={date} onChange={e => setDate(e.target.value)} max={new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })} />
          <select className="form-select" style={{ width: 150 }} value={action} onChange={e => setAction(e.target.value)}>
            <option value="">All Activity</option>
            <option value="UPDATE">Manual Adjust</option>
            <option value="EXPENSE">Expenses Only</option>
          </select>
          <button className="btn btn-ghost" onClick={load}>Refresh</button>
        </div>
      </div>

      {error && <div className="alert alert-error mb-16">{error}</div>}

      {loading ? (
        <div className="page-loading"><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="grid grid-3" style={{ marginBottom: 32 }}>
          {banks.map(bank => (
            <div key={bank.id} className="card bank-card">
              <div className="bank-card-icon">🏦</div>
              <div className="bank-card-name">{bank.name}</div>
              <div className="bank-card-balance">₹{Number(bank.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <div className="bank-card-meta">
                <span>Total Deducted: ₹{Number(bank.totalDeducted || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="bank-card-actions">
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm btn-full" onClick={() => setDepositModal(bank)}>Deposit</button>
                  <button className="btn btn-danger btn-sm btn-full" onClick={() => setWithdrawModal(bank)}>Deduct</button>
                </div>
                {isSuperAdmin && (
                  <button className="btn btn-ghost btn-sm btn-full mt-8" onClick={() => setBalanceModal(bank)}>Set Absolute Balance</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-header-title" style={{ fontSize: 20, marginBottom: 16 }}>Recent Activity</div>
      {banks.map(bank => (
        <div key={`activity-${bank.id}`} className="card mb-32">
          <div className="bank-activity-header">
            <span className="bank-name-tag">{bank.name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{bank._count?.expenses || 0} total deductions</span>
          </div>

          <div className="grid grid-2" style={{ gap: 24 }}>
            {/* Column 1: Expenses */}
            <div>
              <div className="activity-section-title">💸 Recent Expenses Deducted</div>
              {bank.expenses && bank.expenses.length > 0 ? (
                <div className="table-wrapper">
                  <table className="table-compact">
                    <thead><tr><th>Category</th><th>Amount</th><th>Time</th></tr></thead>
                    <tbody>
                      {bank.expenses.map(exp => (
                        <tr key={exp.id}>
                          <td title={exp.note}>{exp.category}</td>
                          <td style={{ color: 'var(--red)', fontWeight: 700 }}>-₹{Number(exp.amount).toFixed(2)}</td>
                          <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(exp.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-sub">No expenses yet.</div>
              )}
            </div>

            {/* Column 2: Logs (Deposits/Set Balance) */}
            <div>
              <div className="activity-section-title">🔄 Deposits & Adjustments</div>
              {bank.logs && bank.logs.length > 0 ? (
                <div className="table-wrapper">
                  <table className="table-compact">
                    <thead><tr><th>Action</th><th>Value</th><th>By</th><th>Time</th></tr></thead>
                    <tbody>
                      {bank.logs.map(log => {
                        const val = log.newValue as any;
                        const isDeposit = val?.action === 'DEPOSIT';
                        const isDeduction = val?.action === 'EXPENSE_DEDUCTION';
                        
                        let badgeClass = 'badge-blue';
                        let actionLabel = 'ADJUST';
                        let color = 'var(--color-accent)';
                        let displayAmount = Number(val?.balance || 0);

                        if (isDeposit) {
                          badgeClass = 'badge-green';
                          actionLabel = 'DEPOSIT';
                          color = 'var(--green)';
                        } else if (isDeduction) {
                          badgeClass = 'badge-red';
                          actionLabel = 'DEDUCT';
                          color = 'var(--red)';
                          displayAmount = Number(val?.amount || 0);
                        }

                        return (
                          <tr key={log.id}>
                            <td style={{ fontSize: 11 }}>
                              <span className={`badge ${badgeClass}`}>
                                {actionLabel}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700, color }}>
                              {isDeduction ? '-' : ''}₹{displayAmount.toLocaleString()}
                            </td>
                            <td style={{ fontSize: 11 }}>{log.user.name}</td>
                            <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-sub">No logs yet.</div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Deposit Modal */}
      {depositModal && (
        <div className="modal-overlay" onClick={() => setDepositModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Deposit to {depositModal.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setDepositModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Amount to Add (₹)</label>
                <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input className="form-input" placeholder="Deposit reference..." value={note} onChange={e => setNote(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDepositModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={submitting || !amount} onClick={handleDeposit}>
                {submitting ? 'Processing...' : 'Confirm Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deduct Modal */}
      {withdrawModal && (
        <div className="modal-overlay" onClick={() => setWithdrawModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Manual Deduction from {withdrawModal.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setWithdrawModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Amount to Deduct (₹)</label>
                <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Reason / Note</label>
                <input className="form-input" placeholder="e.g. Petty cash, Bank charges..." value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <div className="alert alert-info">
                ℹ️ This will create a <strong>Miscellaneous</strong> expense record.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setWithdrawModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-danger" disabled={submitting || !amount} onClick={handleWithdraw}>
                {submitting ? 'Processing...' : 'Confirm Deduction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Balance Modal */}
      {balanceModal && (
        <div className="modal-overlay" onClick={() => setBalanceModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Set Balance: {balanceModal.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setBalanceModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning mb-16">
                ⚠️ This will hard-set the balance. Use only for initial setup or reconciliation.
              </div>
              <div className="form-group">
                <label className="form-label">New Absolute Balance (₹)</label>
                <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Reason/Note</label>
                <input className="form-input" placeholder="Why is this being adjusted?" value={note} onChange={e => setNote(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setBalanceModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={submitting || !amount} onClick={handleSetBalance}>
                {submitting ? 'Updating...' : 'Update Balance'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bank-card {
          padding: 24px;
          text-align: center;
          transition: transform 0.2s;
        }
        .bank-card:hover {
          transform: translateY(-4px);
        }
        .bank-card-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        .bank-card-name {
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .bank-card-balance {
          font-size: 28px;
          font-weight: 900;
          color: var(--color-accent);
          margin-bottom: 16px;
        }
        .bank-card-meta {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 20px;
          padding-top: 12px;
          border-top: 1px dashed var(--border-color);
        }
        .mt-8 { margin-top: 8px; }
        .bank-activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .bank-name-tag {
          background: var(--bg-secondary);
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 14px;
          color: var(--color-accent);
        }
        .activity-section-title {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .table-compact th, .table-compact td {
          padding: 8px 12px;
          font-size: 13px;
        }
        .empty-sub {
          padding: 16px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px dashed var(--border-color);
        }
      `}</style>
    </Layout>
  );
}
