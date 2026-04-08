'use client';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Activity, TrendingUp, TrendingDown, Target, ChevronDown, ChevronUp, ArrowUpDown, ChevronRight } from 'lucide-react';
import { useLayoutStore } from '@/hooks/useLayoutStore';
import styles from '@/app/page.module.css';

const INDICES = ['NIFTY 50', 'NIFTY BANK', 'NIFTY IT'];

type SortKey = 'symbol' | 'ltp' | 'pChange' | 'dayHigh' | 'dayLow';
type SortOrder = 'asc' | 'desc';

function IndexSkeleton() {
  return (
    <div style={{ padding: '0 1.5rem', minHeight: '480px' }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 1fr 1fr 1fr 1fr 100px', padding: '1.2rem 0', borderBottom: '1px solid var(--surface-border)', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ width: '100px', height: '18px' }} />
          </div>
          <div className="skeleton" style={{ justifySelf: 'end', width: '80px', height: '20px' }} />
          <div className="skeleton" style={{ justifySelf: 'end', width: '60px', height: '20px' }} />
          <div className="skeleton" style={{ justifySelf: 'end', width: '70px', height: '18px' }} />
          <div className="skeleton" style={{ justifySelf: 'end', width: '70px', height: '18px' }} />
          <div className="skeleton" style={{ justifySelf: 'end', width: '32px', height: '32px', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  );
}

export default function IndexPulse() {
  const { layout, toggleModule, isReady } = useLayoutStore();
  const isOpen = layout.indices;
  const [activeIndex, setActiveIndex] = useState('NIFTY 50');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, order: SortOrder }>({ key: 'pChange', order: 'desc' });

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const result = await res.json();
    return result;
  };

  const { data, isLoading, error } = useSWR(
    `/api/market/indices?index=${encodeURIComponent(activeIndex)}`,
    fetcher,
    { refreshInterval: 3000 }
  );

  const constituents = data?.success ? data.data : [];

  const sortedConstituents = useMemo(() => {
    if (!constituents) return [];
    const items = [...constituents];
    items.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string') {
        return sortConfig.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.order === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });
    return items;
  }, [constituents, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const fmtINR = (n: number | string) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const sign = (n: number) => (n > 0 ? '+' : '');

  // Market Breadth Data
  const breadth = useMemo(() => {
    if (!constituents.length) return { advances: 0, declines: 0 };
    return {
      advances: constituents.filter((s: any) => s.pChange > 0).length,
      declines: constituents.filter((s: any) => s.pChange < 0).length
    };
  }, [constituents]);

  return (
    <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--surface-border)', overflow: 'hidden', padding: 0, width: '100%', minWidth: '100%' }}>
      {/* Header and Index Toggles */}
      <div className={styles.cardHeader} onClick={() => toggleModule('indices')} style={{ borderBottom: isOpen ? '1px solid var(--surface-border)' : 'none' }}>
        <div className={styles.cardHeaderLeft}>
          <Activity size={18} color="var(--accent)" />
          <span className={styles.cardTitle}>Institutional Index Engine</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {INDICES.map(idx => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--r-sm)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  border: '1px solid var(--surface-border)',
                  background: activeIndex === idx ? 'var(--accent)' : 'var(--surface-base)',
                  color: activeIndex === idx ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {idx}
              </button>
            ))}
          </div>
          <div className={styles.collapseToggle}>
            {isReady && (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
          </div>
        </div>
      </div>

      <div className={`${styles.collapsibleContent} ${isOpen ? styles.expandedContent : ''}`}>
        {!isLoading && !error && constituents.length > 0 && (
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: '2rem', background: 'rgba(255,255,255,0.01)', alignItems: 'center' }}>
            {/* Leader */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--profit-soft)', color: 'var(--profit)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={12} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>LEADER:</span>
                {constituents.sort((a:any,b:any) => b.pChange - a.pChange)[0]?.symbol}
                <span style={{ color: 'var(--profit)', marginLeft: '4px' }}>+{constituents.sort((a:any,b:any) => b.pChange - a.pChange)[0]?.pChange.toFixed(2)}%</span>
              </div>
            </div>
            {/* Laggard */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--loss-soft)', color: 'var(--loss)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingDown size={12} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>LAGGARD:</span>
                {constituents.sort((a:any,b:any) => a.pChange - b.pChange)[0]?.symbol}
                <span style={{ color: 'var(--loss)', marginLeft: '4px' }}>{constituents.sort((a:any,b:any) => a.pChange - b.pChange)[0]?.pChange.toFixed(2)}%</span>
              </div>
            </div>
            {/* Market Breadth (Balanced View) */}
            <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Market Breadth</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--profit-soft)', color: 'var(--profit)', fontSize: '0.75rem', fontWeight: 900 }}>A: {breadth.advances}</div>
                <div style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--loss-soft)', color: 'var(--loss)', fontSize: '0.75rem', fontWeight: 900 }}>D: {breadth.declines}</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '3rem', color: 'var(--loss)', textAlign: 'center', fontSize: '0.9rem' }}>
            Failed to establish secure tunnel to NSE APIs. Please try again.
          </div>
        )}

        {isLoading && !error && <IndexSkeleton />}

        {/* Grid Header (Sortable) */}
        {!isLoading && !error && constituents.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 1fr 1fr 1fr 1fr 100px', padding: '0.85rem 1.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--surface-border)', fontWeight: 800 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => handleSort('symbol')}>
              Company {sortConfig.key === 'symbol' && <ArrowUpDown size={10} color="var(--accent)" />}
            </span>
            <span style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => handleSort('ltp')}>
              LTP {sortConfig.key === 'ltp' && <ArrowUpDown size={10} color="var(--accent)" />}
            </span>
            <span style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => handleSort('pChange')}>
              1D Swings {sortConfig.key === 'pChange' && <ArrowUpDown size={10} color="var(--accent)" />}
            </span>
            <span style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => handleSort('dayHigh')}>
              High {sortConfig.key === 'dayHigh' && <ArrowUpDown size={10} color="var(--accent)" />}
            </span>
            <span style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => handleSort('dayLow')}>
              Low {sortConfig.key === 'dayLow' && <ArrowUpDown size={10} color="var(--accent)" />}
            </span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>
        )}

        {/* Infinite Grid Map with Zen-Stability footprint */}
        {!isLoading && !error && (
              <div style={{ maxHeight: '500px', minHeight: '480px', overflowY: 'auto' }}>
                {sortedConstituents.map((stock: any, index: number) => {
                    const isProfit = stock.pChange >= 0;
                    return (
                        <div key={stock.symbol} style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'minmax(140px, 1fr) 1fr 1fr 1fr 1fr 100px', 
                            padding: '0.85rem 1.5rem', 
                            borderBottom: '1px solid var(--surface-border)',
                            background: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                            alignItems: 'center',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }} className="hover-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  {stock.symbol.charAt(0)}
                              </div>
                              <strong style={{ fontSize: '0.85rem' }}>{stock.symbol}</strong>
                            </div>
                            <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 800 }}>
                                {fmtINR(stock.ltp)}
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 900, fontSize: '0.85rem', color: isProfit ? 'var(--profit)' : 'var(--loss)' }}>
                                {sign(stock.pChange)}{stock.pChange.toFixed(2)}%
                            </div>
                            <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {fmtINR(stock.dayHigh)}
                            </div>
                            <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {fmtINR(stock.dayLow)}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <Link href={`/terminal/${stock.symbol}`} style={{ background: 'var(--surface-raised)', display: 'inline-flex', padding: '0.4rem', borderRadius: '8px', color: 'var(--accent)', border: '1px solid var(--surface-border)', transition: 'all 0.2s' }}>
                                    <Target size={14} />
                                </Link>
                            </div>
                        </div>
                    )
                })}
              </div>
          )}
      </div>
    </div>
  );
}
