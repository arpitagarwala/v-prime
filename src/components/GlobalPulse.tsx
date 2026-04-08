'use client';
import useSWR from 'swr';
import { Globe, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useLayoutStore } from '@/hooks/useLayoutStore';
import styles from '@/app/page.module.css';

export default function GlobalPulse() {
  const { layout, toggleModule, isReady } = useLayoutStore();
  const isOpen = layout.macro;

  const labels: Record<string, string> = {
    'INR=X': 'USD/INR',
    'CL=F': 'Crude Oil',
    'GC=F': 'Gold',
    '^INDIAVIX': 'India VIX',
    'DX-Y.NYB': 'Dollar Index (DXY)',
    '^TNX': '10Y Yield (US)',
  };

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? data.data : [];
  };

  const { data: items = [], isLoading } = useSWR('/api/market/global', fetcher, { refreshInterval: 3000 });

  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      <div 
        className={styles.cardHeader}
        style={{ border: 'none', padding: '0 0 1rem 0' }}
        onClick={() => toggleModule('macro')}
      >
        <div className={styles.cardHeaderLeft}>
          <Globe size={14} color="var(--text-muted)" />
          <span className={styles.cardTitle}>Global Macro Pulse</span>
        </div>
        <div className={styles.collapseToggle}>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      <div className={`${styles.collapsibleContent} ${isOpen ? styles.expandedContent : ''}`}>
        {isLoading && items.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', minHeight: '65px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '60px', borderRadius: 'var(--r-md)' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', minHeight: '65px' }}>
            {items.map((item: any) => {
              const isProfit = item.changePct >= 0;
              const label = labels[item.symbol] || item.label;
              return (
                <div key={item.symbol} style={{ background: 'var(--surface-card)', padding: '0.75rem 1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--surface-border)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{label}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                     <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{Number(item.price).toLocaleString()}</div>
                     <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isProfit ? 'var(--profit)' : 'var(--loss)' }}>
                      {isProfit ? <TrendingUp size={10} style={{ marginRight: '2px' }} /> : <TrendingDown size={10} style={{ marginRight: '2px' }} />}
                      {Math.abs(item.changePct).toFixed(2)}%
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
