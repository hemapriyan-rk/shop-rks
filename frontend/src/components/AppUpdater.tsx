import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const CURRENT_VERSION = '1.0.7';

export default function AppUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [apkUrl, setApkUrl] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');

  useEffect(() => {
    // Only check for updates if running as a native app
    if (!Capacitor.isNativePlatform()) return;

    const checkForUpdates = async () => {
      try {
        const response = await fetch(`https://shop-rks.onrender.com/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;

        const data = await response.json();
        
        // Simple string comparison for versions (e.g. '1.0.1' > '1.0.0')
        if (data.version && compareVersions(data.version, CURRENT_VERSION) > 0) {
          setApkUrl(data.apkUrl || 'https://shop-rks.onrender.com/download');
          setReleaseNotes(data.releaseNotes || 'A new version is available.');
          setUpdateAvailable(true);
        }
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    };

    // Check immediately, and then every 2 hours
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const compareVersions = (v1: string, v2: string) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  };

  const handleUpdate = async () => {
    // Open the download URL in the external device browser so the system can download it properly
    const urlToOpen = apkUrl.startsWith('http') ? apkUrl : `https://shop-rks.onrender.com${apkUrl}`;
    await Browser.open({ url: urlToOpen });
  };

  if (!updateAvailable) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        color: 'var(--text-primary)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ 
          width: '60px', height: '60px', borderRadius: '16px', 
          background: 'rgba(99, 102, 241, 0.2)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
          border: '1px solid rgba(99, 102, 241, 0.5)'
        }}>
          <span style={{ fontSize: '32px' }}>🚀</span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Update Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          A new version of Shop RKS is available. Please update to continue using the application securely.
        </p>
        
        {releaseNotes && (
          <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: '12px', marginBottom: '24px', borderLeft: '3px solid var(--color-primary)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{releaseNotes}</p>
          </div>
        )}
        
        <button 
          onClick={handleUpdate}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
            transition: 'transform 0.2s'
          }}
        >
          Download Update
        </button>
      </div>
    </div>
  );
}
