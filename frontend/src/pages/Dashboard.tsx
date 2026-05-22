import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { analyticsApi } from '../api';
import type { TodaySummary } from '../types';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function Dashboard() {
  const { user, hasPermission, isSuperAdmin } = useAuth();
  const canViewAnalytics = hasPermission('analytics');
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.todaySummary()
      .then(r => setSummary(r.data.data!))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const title = t('nav.dashboard' as any);

  return (
    <Layout title={title}>
      <div className="page-header">
        <div>
          <div className="page-header-title">{t('dashboard.welcome' as any)}, {user?.name?.split(' ')[0]} 👋</div>
          <div className="page-header-sub">{new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="stat-grid">
        <div className="stat-card" style={{ '--stat-color': 'var(--green)' } as React.CSSProperties}>
          <div className="stat-icon">💰</div>
          <div className="stat-label">{t('dashboard.todayIncome' as any)}</div>
          <div className="stat-value currency">{loading ? '—' : (summary?.income ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          <div className="stat-sub">{summary?.transactionCount ?? 0} {t('dashboard.transactionsCount' as any)}</div>
        </div>

        {canViewAnalytics && (
          <>
            <div className="stat-card" style={{ '--stat-color': 'var(--red)' } as React.CSSProperties}>
              <div className="stat-icon">📤</div>
              <div className="stat-label">{t('dashboard.todayExpenses' as any)}</div>
              <div className="stat-value currency">{loading ? '—' : (summary?.expenses ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <div className="stat-sub">{t('dashboard.approvedOnly' as any)}</div>
            </div>
            <div className="stat-card" style={{ '--stat-color': summary && summary.profit >= 0 ? 'var(--green)' : 'var(--red)' } as React.CSSProperties}>
              <div className="stat-icon">📈</div>
              <div className="stat-label">{t('dashboard.todayProfit' as any)}</div>
              <div className="stat-value currency" style={{ color: summary && summary.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {loading ? '—' : (summary?.profit ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className="stat-sub">{t('dashboard.profitSub' as any)}</div>
            </div>
          </>
        )}

        {canViewAnalytics && summary && summary.pendingExpenseCount > 0 && (
          <div className="stat-card" style={{ '--stat-color': 'var(--yellow)' } as React.CSSProperties}>
            <div className="stat-icon">⏳</div>
            <div className="stat-label">{t('dashboard.pendingApprovals' as any)}</div>
            <div className="stat-value" style={{ color: 'var(--yellow)' }}>{summary.pendingExpenseCount}</div>
            <div className="stat-sub">{t('dashboard.pendingSub' as any)}</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="section-title">{t('dashboard.quickActions' as any)}</div>
      <div className="quick-actions">
        <div className="quick-action-card" onClick={() => navigate('/transactions/new')}>
          <div className="quick-action-icon">＋</div>
          <div className="quick-action-label">{t('nav.newEntry' as any)}</div>
        </div>
        <div className="quick-action-card" onClick={() => navigate('/transactions')}>
          <div className="quick-action-icon">📋</div>
          <div className="quick-action-label">{t('nav.myTransactions' as any)}</div>
        </div>
        <div className="quick-action-card" onClick={() => navigate('/expenses/new')}>
          <div className="quick-action-icon">💸</div>
          <div className="quick-action-label">{t('dashboard.addExpense' as any)}</div>
        </div>
        <div className="quick-action-card" onClick={() => navigate('/expenses')}>
          <div className="quick-action-icon">📑</div>
          <div className="quick-action-label">{t('nav.myExpenses' as any)}</div>
        </div>
        {canViewAnalytics && (
          <>
            <div className="quick-action-card" onClick={() => navigate('/analytics')}>
              <div className="quick-action-icon">📊</div>
              <div className="quick-action-label">{t('nav.analytics' as any)}</div>
            </div>
            <div className="quick-action-card" onClick={() => navigate('/services')}>
              <div className="quick-action-icon">🛠</div>
              <div className="quick-action-label">{t('nav.services' as any)}</div>
            </div>
          </>
        )}
        {isSuperAdmin && (
          <>
            <div className="quick-action-card" onClick={() => navigate('/users')}>
              <div className="quick-action-icon">👥</div>
              <div className="quick-action-label">{t('nav.users' as any)}</div>
            </div>
            <div className="quick-action-card" onClick={() => navigate('/logs')}>
              <div className="quick-action-icon">📜</div>
              <div className="quick-action-label">{t('nav.auditLogs' as any)}</div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
