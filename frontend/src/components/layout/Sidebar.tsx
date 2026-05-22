import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface NavItem {
  icon: string;
  labelKey: string;
  path: string;
  permKey?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, role, isAdmin, isSuperAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const userNav: NavItem[] = [
    { icon: '⊞', labelKey: 'nav.dashboard', path: '/dashboard' },
    { icon: '＋', labelKey: 'nav.newEntry', path: '/transactions/new' },
    { icon: '📄', labelKey: 'nav.billing', path: '/billing' },
    { icon: '⚖️', labelKey: 'nav.terms', path: '/terms' },
    { icon: '📋', labelKey: 'nav.myTransactions', path: '/transactions' },
    { icon: '💸', labelKey: 'nav.myExpenses', path: '/expenses' },
  ];

  const adminNav: NavItem[] = [
    { icon: '📊', labelKey: 'nav.analytics', path: '/analytics', permKey: 'analytics' },
    { icon: '🛠', labelKey: 'nav.services', path: '/services', permKey: 'services' },
    { icon: '🏦', labelKey: 'nav.banks', path: '/banks', permKey: 'banks' },
    { icon: '⚙️', labelKey: 'nav.bankConfig', path: '/admin/bank-config', permKey: 'banks' },
    { icon: '📂', labelKey: 'nav.allTransactions', path: '/admin/transactions', permKey: 'allRecords' },
    { icon: '📑', labelKey: 'nav.allExpenses', path: '/admin/expenses', permKey: 'allRecords' },
    { icon: '🏷', labelKey: 'nav.expenseCats', path: '/admin/expense-categories', permKey: 'expenseCategories' },
    { icon: '💼', labelKey: 'nav.salary', path: '/admin/salary', permKey: 'salaryLogs' },
    { icon: '📜', labelKey: 'nav.auditLogs', path: '/logs', permKey: 'salaryLogs' },
    { icon: '📄', labelKey: 'nav.billLogs', path: '/admin/bill-logs', permKey: 'salaryLogs' },
    { icon: '📦', labelKey: 'nav.dataExports', path: '/admin/exports', permKey: 'analytics' },
  ];

  const superNav: NavItem[] = [
    { icon: '👥', labelKey: 'nav.users', path: '/users' },
    { icon: '📊', labelKey: 'User Perf', path: '/admin/user-performance' },
    { icon: '🔐', labelKey: 'Roles', path: '/admin/roles' },
    { icon: '🖥', labelKey: 'nav.serverMgmt', path: '/admin/system' },
    { icon: '⚙️', labelKey: 'Auto Tx', path: '/admin/auto-transactions' },
    { icon: '☁️', labelKey: 'nav.renderMgmt', path: '/admin/render' },
    { icon: '💾', labelKey: 'nav.storageMgmt', path: '/admin/storage' },
    { icon: '📈', labelKey: 'nav.incomeMgmt', path: '/admin/income-management' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo flex-center" style={{ padding: '24px 18px 20px', alignItems: 'center' }}>
        <img src="/logo.png" alt="RKS Logo" style={{ height: 96, width: 'auto', objectFit: 'contain' }} />
        <button className="sidebar-close-btn text-muted" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, fontSize: '20px', padding: '4px' }}>
          ✕
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          {userNav.map(item => (
            <NavLink key={item.path} to={item.path} end
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {t(item.labelKey as any)}
            </NavLink>
          ))}
        </div>

        {(isAdmin || role === 'MANAGER' || role === 'CUSTOM') && (
          <div className="nav-section">
            <div className="nav-section-title">Admin</div>
            {adminNav
              .filter(item => {
                if (isAdmin) return true;
                if (role === 'MANAGER') return ['services', 'expenseCategories'].includes(item.permKey || '');
                if (role === 'CUSTOM' && item.permKey) {
                  return user?.customPermissions?.[item.permKey]?.read;
                }
                return false;
              })
              .map(item => (
                <NavLink key={item.path} to={item.path} end
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.labelKey.startsWith('nav.') ? t(item.labelKey as any) : item.labelKey}
                </NavLink>
              ))}
          </div>
        )}

        {isSuperAdmin && (
          <div className="nav-section">
            <div className="nav-section-title">System</div>
            {superNav.map(item => (
              <NavLink key={item.path} to={item.path} end
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.labelKey.startsWith('nav.') ? t(item.labelKey as any) : item.labelKey}
              </NavLink>
            ))}
          </div>
        )}

        <div className="nav-section" style={{ marginTop: 'auto' }}>
          <NavLink to="/developer" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
            <span className="nav-icon">👨‍💻</span>
            Developer Info
          </NavLink>
        </div>

        <div className="nav-section">
          <button className="nav-item" style={{ color: 'var(--red)' }} onClick={handleLogout}>
            <span className="nav-icon">⇥</span>
            {t('nav.logout')}
          </button>
        </div>
      </nav>

      <div 
        className="sidebar-user" 
        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        onClick={() => navigate('/profile')}
      >
        <div className="avatar" style={{ background: 'var(--color-primary)', color: 'white', fontWeight: 800 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="user-info">
          <div className="user-name" style={{ fontWeight: 700 }}>{user?.name}</div>
          <div className="text-muted text-xs">View Profile</div>
        </div>
        <div style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 12 }}>›</div>
      </div>
    </aside>
  );
}
