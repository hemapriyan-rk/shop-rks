import React, { useState } from 'react';

export default function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('');

  const append = (val: string) => {
    if (display === 'Error') setDisplay(val);
    else setDisplay(prev => prev + val);
  };

  const calculate = () => {
    try {
      if (!display) return;
      // Evaluate basic math safely
      // Only allow digits, operators, and decimal points
      if (!/^[0-9+\-*/.() ]+$/.test(display)) throw new Error();
      const result = new Function('return ' + display)();
      setDisplay(String(Math.round(result * 100) / 100));
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => setDisplay('');
  const backspace = () => setDisplay(prev => prev === 'Error' ? '' : prev.slice(0, -1));

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        🧮
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 280,
      background: 'var(--bg-surface)',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      padding: 16,
      zIndex: 9999,
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>Calculator</h4>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>

      <div style={{
        background: 'var(--bg-base)',
        padding: '12px 16px',
        borderRadius: 8,
        fontSize: 24,
        textAlign: 'right',
        marginBottom: 16,
        color: 'var(--text-primary)',
        fontFamily: 'monospace',
        minHeight: 56,
        overflowX: 'auto',
        wordBreak: 'break-all'
      }}>
        {display || '0'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <button className="btn btn-ghost" onClick={clear} style={{ color: 'var(--red)' }}>C</button>
        <button className="btn btn-ghost" onClick={backspace}>⌫</button>
        <button className="btn btn-ghost" onClick={() => append('/')} style={{ color: 'var(--color-primary)' }}>÷</button>
        <button className="btn btn-ghost" onClick={() => append('*')} style={{ color: 'var(--color-primary)' }}>×</button>

        <button className="btn btn-secondary" onClick={() => append('7')}>7</button>
        <button className="btn btn-secondary" onClick={() => append('8')}>8</button>
        <button className="btn btn-secondary" onClick={() => append('9')}>9</button>
        <button className="btn btn-ghost" onClick={() => append('-')} style={{ color: 'var(--color-primary)' }}>-</button>

        <button className="btn btn-secondary" onClick={() => append('4')}>4</button>
        <button className="btn btn-secondary" onClick={() => append('5')}>5</button>
        <button className="btn btn-secondary" onClick={() => append('6')}>6</button>
        <button className="btn btn-ghost" onClick={() => append('+')} style={{ color: 'var(--color-primary)' }}>+</button>

        <button className="btn btn-secondary" onClick={() => append('1')}>1</button>
        <button className="btn btn-secondary" onClick={() => append('2')}>2</button>
        <button className="btn btn-secondary" onClick={() => append('3')}>3</button>
        <button className="btn btn-primary" onClick={calculate} style={{ gridRow: 'span 2', height: '100%' }}>=</button>

        <button className="btn btn-secondary" onClick={() => append('0')} style={{ gridColumn: 'span 2' }}>0</button>
        <button className="btn btn-secondary" onClick={() => append('.')}>.</button>
      </div>
    </div>
  );
}
