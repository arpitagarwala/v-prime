'use client';
import useSWR from 'swr';
import { Calendar, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';
import { useLayoutStore } from '@/hooks/useLayoutStore';
import styles from '@/app/page.module.css';

export default function EventRadar() {
  const { layout, toggleModule, isReady } = useLayoutStore();
  const isOpen = layout.events;

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? data.data : [];
  };

  const { data: events = [], isLoading } = useSWR('/api/market/hot-events', fetcher, { refreshInterval: 300000 });

  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      {/* Header Toggle */}
      <div 
        className={styles.cardHeader}
        style={{ border: 'none', padding: '0 0 1rem 0' }}
        onClick={() => toggleModule('events')}
      >
        <div className={styles.cardHeaderLeft}>
          <Calendar size={14} color="var(--text-muted)" />
          <span className={styles.cardTitle}>Volatility Event Radar</span>
        </div>
        <div className={styles.collapseToggle}>
          {isReady && (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      </div>

      <div className={`${styles.collapsibleContent} ${isOpen ? styles.expandedContent : ''}`}>
        <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-soft)', borderRadius: 'var(--r-md)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent)', fontWeight: 800, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
            <AlertCircle size={14} /> {isLoading ? 'SCANNING:' : 'ACTIVE RADAR:'}
          </div>
          
          <div className="marquee-container" style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'inline-flex', gap: '2.5rem', animation: 'marquee 35s linear infinite' }}>
              {isLoading && (!events || (Array.isArray(events) && events.length === 0)) ? (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 size={12} className="animate-spin" /> Fetching latest institutional volatility catalysts...
                </span>
              ) : (!Array.isArray(events) || events.length === 0) ? (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Institutional Scan Active: No immediate volatility events detected in the current session pulse.
                </span>
              ) : (
                <>
                  {/* Duplicated for smooth marquee wrap */}
                  {[...events, ...events].map((ev: any, i: number) => (
                    <span key={i} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>{ev.symbol}</span>: {ev.event} ({ev.date})
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
