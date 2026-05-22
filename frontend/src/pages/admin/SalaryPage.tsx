import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { usersApi, banksApi, expensesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { User, BankAccount } from '../../types';

export default function SalaryPage() {
  const { isSuperAdmin } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [staffName, setStaffName] = useState('');
  const [amount, setAmount] = useState('');
  const [bankId, setBankId] = useState('');
  const [note, setNote] = useState('');

  // Lock logic
  const now = new Date();
  const currentDay = now.getDate();
  const isLockedOut = currentDay > 5 && !isSuperAdmin;

  useEffect(() => {
    Promise.all([
      usersApi.list(),
      banksApi.list()
    ])
    .then(([usersRes, banksRes]) => {
      setUsers(usersRes.data.data ?? []);
      setBanks(banksRes.data.data ?? []);
      if (banksRes.data.data?.length) {
        setBankId(banksRes.data.data[0].id);
      }
    })
    .catch(() => setError('Failed to load required data'))
    .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;
    
    if (!staffName.trim()) { setError('Please specify the staff name'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('Please specify a valid amount'); return; }
    if (!bankId) { setError('Please select a bank to deduct from'); return; }

    setSubmitting(true);
    setError('');
    
    try {
      await expensesApi.paySalary({
        staffName: staffName.trim(),
        amount: parseFloat(amount),
        bankId,
        note: note.trim()
      });
      
      setSuccess(`Salary of ₹${amount} paid to ${staffName} successfully!`);
      setStaffName('');
      setAmount('');
      setNote('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process salary');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Staff Salary">
      <div className="page-header">
        <div>
          <div className="page-header-title">Staff Salary Processing</div>
          <div className="page-header-sub">Pay staff salaries and deduct from previous month analytics</div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {isLockedOut ? (
          <div className="alert alert-error" style={{ marginBottom: 24, fontSize: 16, padding: 24 }}>
            <h3 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔒</span> Salary Processing Locked
            </h3>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Salaries can only be processed between the <strong>1st and 5th</strong> of each month. 
              Today is the {currentDay}th. Please contact a Super Admin if an emergency processing is required.
            </p>
          </div>
        ) : (
          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            ℹ️ <strong>Note:</strong> Salaries processed here are automatically logged as expenses for the <strong>last day of the previous month</strong> to keep your analytical profits accurate.
          </div>
        )}

        {error && <div className="alert alert-error mb-16">{error}</div>}
        {success && <div className="alert alert-success mb-16">✅ {success}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Staff Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Type name or select below..." 
                  value={staffName} 
                  onChange={e => setStaffName(e.target.value)} 
                  disabled={isLockedOut || submitting}
                  list="staff-list"
                  autoComplete="off"
                />
                <datalist id="staff-list">
                  {users.map(u => <option key={u.id} value={u.name} />)}
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Salary Amount (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0.00" 
                min="1"
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                disabled={isLockedOut || submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deduct From (Bank/Cash)</label>
              <select 
                className="form-select" 
                value={bankId} 
                onChange={e => setBankId(e.target.value)}
                disabled={isLockedOut || submitting}
              >
                {banks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.isCash ? '💵 ' : '🏦 '}{b.name} {b.isCash ? '' : `(₹${Number(b.balance).toLocaleString()})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. May Salary, Advance included..." 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                disabled={isLockedOut || submitting}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 12, padding: 14, fontSize: 16 }}
              disabled={isLockedOut || submitting}
            >
              {submitting ? 'Processing Salary...' : 'Confirm & Pay Salary'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
