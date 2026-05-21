import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface TopbarProps { title: string; onMenuClick: () => void; }

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit'
      }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="topbar">
      <button className="mobile-menu-btn text-muted" onClick={onMenuClick} style={{ fontSize: '20px', padding: '4px' }}>
        ☰
      </button>
      <span className="topbar-title">{title}</span>
      
      <div className="flex-center gap-12" style={{ marginLeft: 'auto' }}>
        <span className="topbar-time" style={{ display: window.innerWidth < 768 ? 'none' : 'inline' }}>{time} IST</span>
        
        <button onClick={toggleLanguage} className="btn-icon text-muted" title={t('topbar.toggleLanguage')} style={{ fontSize: '15px', fontWeight: 800 }}>
          {language === 'en' ? 'அ' : 'A'}
        </button>

        <button onClick={toggleTheme} className="btn-icon text-muted" title={t('topbar.toggleTheme')} style={{ fontSize: '18px' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{user?.name}</span>
      </div>
    </header>
  );
}
