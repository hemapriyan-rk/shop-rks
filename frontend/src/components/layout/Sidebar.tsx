import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface NavItem {
  icon: string;
  labelKey: string;
  path: string;
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
    { icon: '📋', labelKey: 'nav.myTransactions', path: '/transactions' },
    { icon: '💸', labelKey: 'nav.myExpenses', path: '/expenses' },
  ];

  const adminNav: NavItem[] = [
    { icon: '📊', labelKey: 'nav.analytics', path: '/analytics' },
    { icon: '🛠', labelKey: 'nav.services', path: '/services' },
    { icon: '🏦', labelKey: 'nav.banks', path: '/banks' },
    { icon: '⚙️', labelKey: 'nav.bankConfig', path: '/admin/bank-config' },
    { icon: '📂', labelKey: 'nav.allTransactions', path: '/admin/transactions' },
    { icon: '📑', labelKey: 'nav.allExpenses', path: '/admin/expenses' },
    { icon: '🏷', labelKey: 'nav.expenseCats', path: '/admin/expense-categories' },
    { icon: '💼', labelKey: 'nav.salary', path: '/admin/salary' },
    { icon: '📜', labelKey: 'nav.auditLogs', path: '/logs' },
    { icon: '📦', labelKey: 'nav.dataExports', path: '/admin/exports' },
  ];

  const superNav: NavItem[] = [
    { icon: '👥', labelKey: 'nav.users', path: '/users' },
    { icon: '🖥', labelKey: 'nav.serverMgmt', path: '/admin/system' },
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

        {isAdmin && (
          <div className="nav-section">
            <div className="nav-section-title">Admin</div>
            {adminNav.map(item => (
              <NavLink key={item.path} to={item.path} end
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                {t(item.labelKey as any)}
              </NavLink>
            ))}
          </div>
        )}

        {isSuperAdmin && (
          <div className="nav-section">
            <div className="nav-section-title">System</div>
            {superNav.map(item => (
              <NavLink key={item.path} to={item.path} end
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                {t(item.labelKey as any)}
              </NavLink>
            ))}
          </div>
        )}

        <div className="nav-section" style={{ marginTop: 'auto' }}>
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
