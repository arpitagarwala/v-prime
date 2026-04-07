'use client';
import { useNews } from '@/hooks/useNews';
import { Zap, Info, Clock, ArrowUpCircle, ArrowDownCircle, Target, Shield } from 'lucide-react';
import styles from './NewsPulse.module.css';

function NewsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '360px' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className={styles.card} style={{ opacity: 0.5, cursor: 'default' }}>
          <div className={styles.cardHead}>
            <div className={styles.meta} style={{ marginBottom: '0.5rem' }}>
              <div className="skeleton" style={{ width: '60px', height: '12px', borderRadius: '4px' }} />
              <div className="skeleton" style={{ width: '12px', height: '12px', borderRadius: '50%' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
               <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
               <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px', marginBottom: '6px' }} />
                  <div className="skeleton" style={{ width: '90%', height: '12px', borderRadius: '4px' }} />
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewsPulse() {
  const { news, isLoading, isLive } = useNews();

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return 'Active';
    const now = new Date();
    const then = new Date(dateStr);
    const diffInMins = Math.floor((now.getTime() - then.getTime()) / 60000);
    
    if (diffInMins < 1) return 'Just Now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return then.toLocaleDateString();
  };

  const handleLink = (e: React.MouseEvent, symbol: string) => {
    e.preventDefault();
    if (!symbol) return;
    window.location.href = `/terminal/${symbol}`;
  };

  if (isLoading && news.length === 0) {
    return <NewsSkeleton />;
  }

  if (!news || news.length === 0) {
    return (
      <div className={styles.state}>
        <Info size={16} />
        <p>No active alpha reports found.</p>
      </div>
    );
  }

  return (
    <div className={styles.feed} style={{ minHeight: '360px' }}>
      {!isLive && (
        <div style={{ fontSize: '0.65rem', padding: '0.5rem', background: 'rgba(255, 171, 0, 0.1)', color: 'var(--accent2)', borderRadius: '8px', marginBottom: '0.75rem', textAlign: 'center', fontWeight: 800 }}>
             DEMO MODE: CONNECT 5PAISA TO UNLOCK LIVE RESEARCH
        </div>
      )}
      
      {news.map((item: any, idx: number) => {
        const isSell = item.BuySell === 'SELL';
        return (
          <div key={idx} className={styles.card} onClick={(e) => handleLink(e, item.Symbol)}>
            <div className={styles.cardHead}>
              <div className={styles.meta}>
                <div className={styles.timeTag}>
                   <Clock size={10} /> {timeAgo(item.Time)}
                </div>
                {isLive ? (
                   <span style={{ fontSize: '0.6rem', color: 'var(--profit)', fontWeight: 800 }}>LIVE ALPHA</span>
                ) : (
                   <Zap size={12} color="var(--accent)" />
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.2rem' }}>
                 {isSell ? <ArrowDownCircle size={16} color="var(--loss)" /> : <ArrowUpCircle size={16} color="var(--profit)" />}
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                      {item.Symbol} 
                      <span style={{ marginLeft: '6px', color: isSell ? 'var(--loss)' : 'var(--profit)', fontSize: '0.7rem' }}>
                         {item.CallType}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>
                      {item.Remarks}
                    </div>
                 </div>
              </div>

              {(item.Target > 0 || item.StopLoss > 0) && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)' }}>
                      <Target size={12} /> TGT: ₹{item.Target}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      <Shield size={12} /> SL: ₹{item.StopLoss}
                   </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
