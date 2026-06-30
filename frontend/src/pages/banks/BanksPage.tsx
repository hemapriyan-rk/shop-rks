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
  const [deductModal, setDeductModal] = useState<BankAccount | null>(null);
  const [deductMiscModal, setDeductMiscModal] = useState<BankAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newIsCash, setNewIsCash] = useState(false);

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
      setDepositModal(null); setAmount(''); setNote(''); load();
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
      setBalanceModal(null); setAmount(''); setNote(''); load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Update failed');
    } finally { setSubmitting(false); }
  };

  const handleDeduct = async () => {
    if (!deductModal) return;
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setSubmitting(true);
    try {
      await banksApi.adjust(deductModal.id, -val, note || `Manual deduction from ${deductModal.name}`);
      setDeductModal(null); setAmount(''); setNote(''); load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Deduction failed');
    } finally { setSubmitting(false); }
  };

  const handleDeductMisc = async () => {
    if (!deductMiscModal) return;
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setSubmitting(true);
    try {
      await expensesApi.create({
        amount: val,
        category: 'Miscellaneous',
        note: note || `Miscellaneous deduction from ${deductMiscModal.name}`,
        bankId: deductMiscModal.id
      });
      setDeductMiscModal(null); setAmount(''); setNote(''); load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Misc deduction failed');
    } finally { setSubmitting(false); }
  };

  const handleCreateBank = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      await banksApi.create({
        name: newName.trim(),
        balance: parseFloat(newBalance) || 0,
        isCash: newIsCash
      });
      setCreateModal(false); setNewName(''); setNewBalance(''); setNewIsCash(false); load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Create bank failed');
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
          <input type="date" className="form-input" style={{ width: 160 }} value={date}
            onChange={e => setDate(e.target.value)}
            max={new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })} />
          <select className="form-select" style={{ width: 150 }} value={action} onChange={e => setAction(e.target.value)}>
            <option value="">All Activity</option>
            <option value="UPDATE">Manual Adjust</option>
            <option value="EXPENSE">Expenses Only</option>
          </select>
          <button className="btn btn-ghost" onClick={load}>Refresh</button>
          {isSuperAdmin && (
            <button className="btn btn-primary" onClick={() => setCreateModal(true)}>+ New Account</button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error mb-16">{error}</div>}

      {loading ? (
        <div className="page-loading"><div className="spinner spinner-lg" /></div>
      ) : (
        <>
          {/* All accounts in one grid */}
          <div className="grid grid-3" style={{ marginBottom: 32 }}>
            {banks.map(bank => (
              <div key={bank.id} className={`card bank-card ${bank.isCash ? 'cash-card' : ''}`}>
                <div className="bank-card-icon">{bank.isCash ? '💵' : '🏦'}</div>
                <div className="bank-card-name">{bank.name}</div>

                {/* Balance: only show for real banks */}
                {bank.isCash ? (
                  <div className="cash-label">Cash Payment</div>
                ) : (
                  <div className="bank-card-balance">
                    ₹{Number(bank.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                )}

                <div className="bank-card-meta">
                  {bank.isCash
                    ? <span>Expenses: {bank._count?.expenses || 0}</span>
                    : <span>Total Deducted: ₹{Number(bank.totalDeducted || 0).toLocaleString('en-IN')}</span>
                  }
                </div>

                <div className="bank-card-actions">
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button className="btn btn-primary btn-sm btn-full" onClick={() => setDepositModal(bank)}>Deposit</button>
                    <button className="btn btn-danger btn-sm btn-full" onClick={() => setDeductModal(bank)}>Deduct</button>
                  </div>
                  <button className="btn btn-warning btn-sm btn-full" onClick={() => setDeductMiscModal(bank)}>Deduct-Misc</button>
                  {isSuperAdmin && !bank.isCash && (
                    <button className="btn btn-ghost btn-sm btn-full mt-8" onClick={() => setBalanceModal(bank)}>
                      Set Absolute Balance
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Activity section — only real banks show activity */}
          <div className="page-header-title" style={{ fontSize: 20, marginBottom: 16, marginTop: 40 }}>Recent Activity</div>
          {banks.map(bank => (
            <div key={`activity-${bank.id}`} className="activity-card mb-32">
              <div className="bank-activity-header">
                <span className="bank-name-tag">
                  {bank.isCash ? '💵' : '🏦'} {bank.name}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {bank._count?.expenses || 0} total deductions
                </span>
              </div>

              <div className="grid grid-2" style={{ gap: 24 }}>
                <div>
                  <div className="activity-section-title">💸 Recent Expenses</div>
                  {bank.expenses && bank.expenses.length > 0 ? (
                    <div className="table-wrapper">
                      <table className="table-compact">
                        <thead><tr><th>Category</th><th>Amount</th><th>Time</th></tr></thead>
                        <tbody>
                          {bank.expenses.map(exp => (
                            <tr key={exp.id}>
                              <td title={exp.note}>{exp.category}</td>
                              <td style={{ color: 'var(--red)', fontWeight: 700 }}>-₹{Number(exp.amount).toFixed(2)}</td>
                              <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(exp.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <div className="empty-sub">No expenses yet.</div>}
                </div>

                <div>
                  <div className="activity-section-title">🔄 Deposits & Adjustments</div>
                  {bank.logs && bank.logs.length > 0 ? (
                    <div className="table-wrapper">
                      <table className="table-compact">
                        <thead><tr><th>Action</th><th>Value</th><th>By</th><th>Time</th></tr></thead>
                        <tbody>
                          {bank.logs.map(log => {
                            const val = { ...(log.oldValue as any || {}), ...(log.newValue as any || {}) };
                            const isDeposit = val?.action === 'DEPOSIT';
                            const isExpenseDeduct = val?.action === 'EXPENSE_DEDUCTION';
                            const isAdjustDown = val?.action === 'ADJUST_DOWN';
                            const isAdjustUp = val?.action === 'ADJUST_UP';
                            const isAutoTrans = log.action === 'AUTO_TRANS';
                            
                            let badgeClass = 'badge-blue', actionLabel = val?.action || 'ADJUST', color = 'var(--color-accent)';
                            let displayAmount = Number(val?.amount || 0) || Number(val?.balance || 0);
                            
                            if (isDeposit) { badgeClass = 'badge-green'; actionLabel = 'DEPOSIT'; color = 'var(--green)'; }
                            else if (isExpenseDeduct) { badgeClass = 'badge-red'; actionLabel = 'EXPENSE'; color = 'var(--red)'; }
                            else if (isAdjustDown) { badgeClass = 'badge-red'; actionLabel = 'DEDUCT'; color = 'var(--red)'; displayAmount = Math.abs(displayAmount); }
                            else if (isAdjustUp) { badgeClass = 'badge-green'; actionLabel = 'ADD'; color = 'var(--green)'; }
                            else if (isAutoTrans) { badgeClass = 'badge-blue'; actionLabel = val?.action === 'CASH_RECONCILIATION' ? 'AUTO_CASH' : 'AUTO_ONLINE'; color = 'var(--color-primary)'; }
                            
                            const isNegative = isExpenseDeduct || isAdjustDown;
                            
                            return (
                              <tr key={log.id}>
                                <td style={{ fontSize: 11 }}><span className={`badge ${badgeClass}`}>{actionLabel}</span></td>
                                <td style={{ fontWeight: 700, color }}>{isNegative ? '-' : ''}₹{displayAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style={{ fontSize: 11 }}>{log.user.name}</td>
                                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : <div className="empty-sub">No logs yet.</div>}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

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
      {deductModal && (
        <div className="modal-overlay" onClick={() => setDeductModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Manual Deduction from {deductModal.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeductModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Amount to Deduct (₹)</label>
                <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Reason / Note</label>
                <input className="form-input" placeholder="e.g. Petty cash, Bank transfer..." value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <div className="alert alert-warning">ℹ️ This deducts from the balance without creating an expense.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeductModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={submitting || !amount} onClick={handleDeduct}>
                {submitting ? 'Processing...' : 'Confirm Deduction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deduct Misc Modal */}
      {deductMiscModal && (
        <div className="modal-overlay" onClick={() => setDeductMiscModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Misc Deduction from {deductMiscModal.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeductMiscModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Amount to Deduct (₹)</label>
                <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Reason / Note</label>
                <input className="form-input" placeholder="e.g. Bank charges..." value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <div className="alert alert-info">ℹ️ This creates a <strong>Miscellaneous</strong> expense record.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeductMiscModal(null)}>Cancel</button>
              <button className="btn btn-warning" disabled={submitting || !amount} onClick={handleDeductMisc}>
                {submitting ? 'Processing...' : 'Confirm Misc Deduction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModal && (
        <div className="modal-overlay" onClick={() => setCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create New Account</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Account Name</label>
                <input className="form-input" placeholder="e.g. HDFC Bank, GPay..." value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Balance (₹)</label>
                <input className="form-input" type="number" placeholder="0.00" value={newBalance} onChange={e => setNewBalance(e.target.value)} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <input type="checkbox" id="isCashCheck" checked={newIsCash} onChange={e => setNewIsCash(e.target.checked)} />
                <label htmlFor="isCashCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Is this a Cash account?</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setCreateModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={submitting || !newName.trim()} onClick={handleCreateBank}>
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Balance Modal (SuperAdmin, real banks only) */}
      {balanceModal && (
        <div className="modal-overlay" onClick={() => setBalanceModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Set Balance: {balanceModal.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setBalanceModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning mb-16">⚠️ This will hard-set the balance. Use only for reconciliation.</div>
              <div className="form-group">
                <label className="form-label">New Absolute Balance (₹)</label>
                <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Reason / Note</label>
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
          padding: 28px; 
          text-align: center; 
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.1) 100%);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        .bank-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent);
          transform: skewX(-25deg);
          transition: all 0.7s;
        }
        .bank-card:hover::before {
          left: 150%;
        }
        .bank-card:hover { 
          transform: translateY(-8px) scale(1.02); 
          box-shadow: 0 15px 35px rgba(0,0,0,0.2), 0 0 20px rgba(255,215,0,0.05);
          border-color: rgba(255,255,255,0.1);
        }
        .cash-card { border: 1px dashed rgba(251,191,36,0.5); background: linear-gradient(145deg, rgba(251,191,36,0.05) 0%, rgba(0,0,0,0.02) 100%); }
        .bank-card-icon { font-size: 42px; margin-bottom: 16px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); transition: transform 0.3s; }
        .bank-card:hover .bank-card-icon { transform: scale(1.1) rotate(5deg); }
        .bank-card-name { font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; font-size: 11px; margin-bottom: 12px; opacity: 0.8; }
        .bank-card-balance { font-size: 32px; font-weight: 900; color: var(--color-accent); margin-bottom: 20px; text-shadow: 0 2px 10px rgba(0,0,0,0.3); letter-spacing: -0.5px; }
        .cash-label { font-size: 13px; font-weight: 800; color: #f59e0b; background: rgba(245,158,11,0.15); padding: 6px 18px; border-radius: 30px; display: inline-block; margin-bottom: 20px; border: 1px solid rgba(245,158,11,0.2); }
        .bank-card-meta { font-size: 12px; color: var(--text-muted); margin-bottom: 24px; padding-top: 16px; border-top: 1px dashed rgba(255,255,255,0.1); }
        .bank-card-actions .btn { border-radius: 12px; font-weight: 600; transition: all 0.2s; }
        .bank-card-actions .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.15); }
        .mt-8 { margin-top: 8px; }
        .mb-32 { margin-bottom: 32px; }
        
        .activity-card {
          background: rgba(20,20,20, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 28px;
          transition: all 0.3s;
        }
        .activity-card:hover {
          border-color: rgba(255,255,255,0.1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .bank-activity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .bank-name-tag { background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.05); padding: 6px 16px; border-radius: 12px; font-weight: 800; font-size: 15px; color: var(--color-accent); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .activity-section-title { font-size: 14px; font-weight: 800; margin-bottom: 16px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
        
        .table-compact { border-collapse: separate; border-spacing: 0; width: 100%; }
        .table-compact th { background: rgba(0,0,0,0.2); padding: 12px 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .table-compact th:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .table-compact th:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
        .table-compact td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.02); transition: background 0.2s; }
        .table-compact tbody tr:hover td { background: rgba(255,255,255,0.03); }
        
        .empty-sub { padding: 24px; text-align: center; color: var(--text-muted); font-size: 14px; background: rgba(0,0,0,0.1); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1); }
      `}</style>
    </Layout>
  );
}
