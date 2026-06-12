import React from 'react';
import { NavLink } from 'react-router-dom';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { FcComboChart, FcLibrary, FcList, FcMoneyTransfer } from 'react-icons/fc';

export default function BottomNav() {
  const triggerHaptic = () => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }
  };

  const triggerHeavyHaptic = () => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    }
  };

  return (
    <nav className="bottom-nav hide-desktop">
      <div className="bottom-nav-container">
        <NavLink to="/analytics" onClick={triggerHaptic} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon"><FcComboChart size={24} /></span>
          <span className="bottom-nav-label">Analytics</span>
        </NavLink>
        
        <NavLink to="/banks" onClick={triggerHaptic} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon"><FcLibrary size={24} /></span>
          <span className="bottom-nav-label">Banks</span>
        </NavLink>
        
        <div className="bottom-nav-item center-fab-container">
          <NavLink to="/transactions/new" onClick={triggerHeavyHaptic} className={({ isActive }) => `center-fab ${isActive ? 'active' : ''}`}>
            <span className="fab-icon">＋</span>
          </NavLink>
        </div>
        
        <NavLink to="/transactions" onClick={triggerHaptic} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon"><FcList size={24} /></span>
          <span className="bottom-nav-label">Records</span>
        </NavLink>
        
        <NavLink to="/expenses" onClick={triggerHaptic} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon"><FcMoneyTransfer size={24} /></span>
          <span className="bottom-nav-label">Expenses</span>
        </NavLink>
      </div>
    </nav>
  );
}
