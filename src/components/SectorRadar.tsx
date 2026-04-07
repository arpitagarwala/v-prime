'use client';
import useSWR from 'swr';
import { Radar, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import { useLayoutStore } from '@/hooks/useLayoutStore';
import styles from '@/app/page.module.css';

export default function SectorRadar() {
  const { layout, toggleModule, isReady } = useLayoutStore();
  const isOpen = layout.sector;

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? data.data : [];
  };

  const { data: sectors = [], isLoading } = useSWR('/api/market/sectors', fetcher, { refreshInterval: 60000 });

  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      <div 
        className={styles.cardHeader}
        style={{ border: 'none', padding: '0 0 1rem 0' }}
        onClick={() => toggleModule('sector')}
      >
        <div className={styles.cardHeaderLeft}>
          <Radar size={14} color="var(--text-muted)" />
          <span className={styles.cardTitle}>Sectoral Rotation Radar</span>
        </div>
        <div className={styles.collapseToggle}>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      <div className={`${styles.collapsibleContent} ${isOpen ? styles.expandedContent : ''}`}>
        {isLoading && sectors.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', minHeight: '210px' }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--r-md)' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', minHeight: '210px' }}>
            {sectors.map((s: any) => {
              const isProfit = s.pChange >= 0;
              // Clean field mapping to prevent NaN/Key errors
              return (
                <div key={s.symbol} style={{ background: 'var(--surface-card)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--surface-border)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: isProfit ? 'var(--profit)' : 'var(--loss)', opacity: 0.8 }} />
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{s.symbol}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                     <div style={{ fontSize: '1rem', fontWeight: 800 }}>{Number(s.lastPrice || 0).toLocaleString()}</div>
                     <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isProfit ? 'var(--profit)' : 'var(--loss)', display: 'flex', alignItems: 'center' }}>
                        {isProfit ? <TrendingUp size={12} style={{marginRight: '2px'}} /> : <TrendingDown size={12} style={{marginRight: '2px'}} />}
                        {Math.abs(s.pChange || 0).toFixed(2)}%
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
