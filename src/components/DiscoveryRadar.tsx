'use client';
import useSWR from 'swr';
import { Sparkles, Target, DollarSign, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useLayoutStore } from '@/hooks/useLayoutStore';
import styles from '@/app/page.module.css';

export default function DiscoveryRadar() {
  const { layout, toggleModule, isReady } = useLayoutStore();
  const isOpen = layout.discovery;

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    return res.json();
  };

  const { data, isLoading } = useSWR('/api/market/discovery', fetcher, { 
    refreshInterval: 60000, 
    revalidateOnFocus: false 
  });

  const isMarketOpen = (() => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const day = istTime.getUTCDay();
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    if (day === 0 || day === 6) return false;
    const time = hours * 100 + minutes;
    return time >= 915 && time <= 1530;
  })();

  const valuePicks = data?.success ? data.data.valuePicks : [];
  const growthAlphas = data?.success ? data.data.growthAlphas : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
      
      {/* Header Toggle */}
      <div 
        className={styles.cardHeader}
        style={{ border: 'none', padding: 0 }}
        onClick={() => toggleModule('discovery')}
      >
        <div className={styles.cardHeaderLeft}>
          <Sparkles size={14} color="var(--text-muted)" />
          <span className={styles.cardTitle}>Opportunity Scanner</span>
        </div>
        <div className={styles.collapseToggle}>
          {isReady && (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      </div>

      <div className={`${styles.collapsibleContent} ${isOpen ? styles.expandedContent : ''}`}>
        {isLoading && !data ? (
          <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--r-lg)' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Alpha Section */}
            <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--surface-border)', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={14} color="var(--accent)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isMarketOpen ? 'Live Alpha Pulse' : 'Tactical Alpha Sweep'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {growthAlphas.map((s: any) => (
                  <Link key={s.symbol} href={`/terminal/${s.symbol}`} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'var(--surface-base)', borderRadius: 'var(--r-md)', border: '1px solid var(--surface-border)', transition: 'all 0.2s' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.symbol}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{isMarketOpen ? 'LTP: ' : 'Consensus: '} ₹{s.price.toFixed(0)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--profit)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          +{s.upside.toFixed(1)}% <ArrowUpRight size={10} />
                        </div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Analyst Upside</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Value Section */}
            <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--surface-border)', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={14} color="var(--profit)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Undervalued Leaders</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {valuePicks.map((s: any) => (
                  <Link key={s.symbol} href={`/terminal/${s.symbol}`} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'var(--surface-base)', borderRadius: 'var(--r-md)', border: '1px solid var(--surface-border)', transition: 'all 0.2s' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.symbol}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>PE: {s.pe.toFixed(1)}x</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent2)' }}>Low Risk</div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Valuation</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
