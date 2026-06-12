import React from 'react';
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="bottom-nav hide-desktop">
      <div className="bottom-nav-container">
        <NavLink to="/analytics" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">📊</span>
          <span className="bottom-nav-label">Analytics</span>
        </NavLink>
        
        <NavLink to="/banks" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">🏦</span>
          <span className="bottom-nav-label">Banks</span>
        </NavLink>
        
        <div className="bottom-nav-item center-fab-container">
          <NavLink to="/transactions/new" className={({ isActive }) => `center-fab ${isActive ? 'active' : ''}`}>
            <span className="fab-icon">＋</span>
          </NavLink>
        </div>
        
        <NavLink to="/transactions" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">📋</span>
          <span className="bottom-nav-label">Records</span>
        </NavLink>
        
        <NavLink to="/expenses" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">💸</span>
          <span className="bottom-nav-label">Expenses</span>
        </NavLink>
      </div>
    </nav>
  );
}
