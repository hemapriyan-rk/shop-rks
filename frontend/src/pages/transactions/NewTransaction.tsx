import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { servicesApi, transactionsApi } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import type { Service, ServiceCategory } from '../../types';

const CATS: ServiceCategory[] = ['GOVT', 'PRINTING', 'CARDS', 'OTHER'];
const CAT_LABELS: Record<ServiceCategory, string> = { GOVT: '🏛 Govt', PRINTING: '🖨 Printing', CARDS: '🪪 Cards', OTHER: '🔧 Other' };

export default function NewTransaction() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Service | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE' | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    servicesApi.list({ active: true })
      .then(r => setServices(r.data.data ?? []))
      .finally(() => setLoading(false));
    searchRef.current?.focus();
  }, []);

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  const grouped = CATS.reduce((acc, cat) => {
    const items = filtered.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, Service[]>);

  const handleSelect = (s: Service) => {
    setSelected(s);
    setQuantity(1);
    setUnitPrice(Number(s.price));
    setPaymentMethod(''); // Reset choice
    setIsSearchOpen(false);
    setTimeout(() => qtyRef.current?.focus(), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { setError(t('newTx.errorSelect' as any)); return; }
    if (quantity === '' || quantity < 1) { setError(t('newTx.errorQuantity' as any)); return; }
    if (unitPrice === '' || unitPrice < 0) { setError(t('newTx.errorPrice' as any)); return; }
    if (!paymentMethod) { setError('Please choose a payment method (Cash or Online)'); return; }
    
    setError('');
    setSubmitting(true);
    try {
      await transactionsApi.create({ 
        serviceId: selected.id, 
        quantity: Number(quantity), 
        unitPrice: Number(unitPrice),
        paymentMethod,
        notes: notes || undefined 
      });
      setSuccess(`✓ ${selected.name} × ${quantity} recorded — ₹${(Number(unitPrice) * Number(quantity)).toFixed(2)}`);
      setSelected(null);
      setQuantity(1);
      setUnitPrice('');
      setNotes('');
      setSearch('');
      setIsSearchOpen(true);
      searchRef.current?.focus();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save transaction');
    } finally { setSubmitting(false); }
  };

  const total = selected && unitPrice !== '' ? Number(unitPrice) * (Number(quantity) || 0) : 0;

  return (
    <Layout title={t('newTx.title' as any)}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <div className="page-header-title">{t('newTx.title' as any)}</div>
            <div className="page-header-sub">{t('newTx.subtitle' as any)}</div>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/transactions')}>{t('newTx.viewList' as any)}</button>
        </div>

        {error && <div className="alert alert-error mb-16">{error}</div>}
        {success && <div className="alert alert-success mb-16">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSearchOpen ? 14 : 0, cursor: 'pointer' }} onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <label className="form-label" style={{ margin: 0, cursor: 'pointer' }}>{t('newTx.searchLabel' as any)}</label>
              <button type="button" className="btn-icon text-muted">{isSearchOpen ? '▲' : '▼'}</button>
            </div>
            
            {isSearchOpen && (
              <>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input ref={searchRef} className="form-input search-input" placeholder={t('newTx.searchPlaceholder' as any)} value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>

                {loading ? <div className="page-loading" style={{ height: 120 }}><div className="spinner" /></div> : (
                  <div className="service-list">
                    {Object.entries(grouped).length === 0 && (
                      <div className="empty-state" style={{ padding: 24 }}>
                        <div>{t('newTx.noServices' as any)} "{search}"</div>
                      </div>
                    )}
                    {Object.entries(grouped).map(([cat, items]) => (
                      <div key={cat}>
                        <div style={{ padding: '6px 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          {CAT_LABELS[cat as ServiceCategory]}
                        </div>
                        {items.map(s => (
                          <div key={s.id} className={`service-item${selected?.id === s.id ? ' selected' : ''}`} onClick={() => handleSelect(s)}>
                            <div>
                              <div className="service-item-name">{s.name}</div>
                            </div>
                            <div className="service-item-price">₹{Number(s.price).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {selected && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('newTx.defaultPrice' as any)}{Number(selected.price).toFixed(2)}</div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setIsSearchOpen(true); }}>{t('newTx.clear' as any)}</button>
              </div>
              
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">{t('newTx.unitPrice' as any)}</label>
                  <input className="form-input" type="number" min={0} step="0.01" value={unitPrice}
                    onChange={e => setUnitPrice(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('newTx.quantity' as any)}</label>
                  <input ref={qtyRef} className="form-input" type="number" min={1} value={quantity}
                    onChange={e => setQuantity(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value)))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('newTx.notes' as any)}</label>
                  <input className="form-input" type="text" placeholder="..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('newTx.totalAmount' as any)}</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-accent)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {selected && (
            <div className="card" style={{ marginBottom: 24 }}>
              <label className="form-label mb-16" style={{ fontSize: 16 }}>Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div 
                  className={`service-item ${paymentMethod === 'CASH' ? 'selected' : ''}`} 
                  style={{ textAlign: 'center', padding: '16px', cursor: 'pointer' }}
                  onClick={() => setPaymentMethod('CASH')}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>💵</div>
                  <div style={{ fontWeight: 700 }}>Cash</div>
                </div>
                <div 
                  className={`service-item ${paymentMethod === 'ONLINE' ? 'selected' : ''}`} 
                  style={{ textAlign: 'center', padding: '16px', cursor: 'pointer' }}
                  onClick={() => setPaymentMethod('ONLINE')}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>💳</div>
                  <div style={{ fontWeight: 700 }}>Online</div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={!selected || !paymentMethod || submitting}>
            {submitting ? <><span className="spinner" style={{ width: 16, height: 16 }} /> {t('newTx.saving' as any)}</> : `${t('newTx.saveBtn' as any)}${selected ? ` — ₹${total.toFixed(2)}` : ''}`}
          </button>
        </form>
      </div>
    </Layout>
  );
}
