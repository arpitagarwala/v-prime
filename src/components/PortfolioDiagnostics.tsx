'use client';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePortfolioEnrichment } from '@/hooks/usePortfolioEnrichment';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle, Zap, TrendingUp, Layers, PieChart } from 'lucide-react';
import styles from './PortfolioDiagnostics.module.css';

export default function PortfolioDiagnostics() {
  const { holdings, isLoading } = usePortfolio();
  const symbols = holdings.map(h => h.symbol);
  const { enrichedMap, isEnrichmentLoading } = usePortfolioEnrichment(symbols);

  if (isLoading || holdings.length === 0) {
    return <div className={styles.empty}>No positions to analyze.</div>;
  }

  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);

  // --- Institutional Metrics ---

  // Weighted Portfolio Beta
  const portfolioBeta = holdings.reduce((sum, h) => {
    const weight = totalValue > 0 ? h.currentValue / totalValue : 0;
    const beta = enrichedMap[h.symbol]?.beta ?? 1.0; // assume market beta if unknown
    return sum + weight * beta;
  }, 0);

  // Weighted Portfolio P/E
  const portfolioPE = holdings.reduce((sum, h) => {
    const weight = totalValue > 0 ? h.currentValue / totalValue : 0;
    const pe = enrichedMap[h.symbol]?.pe ?? 0;
    return sum + weight * pe;
  }, 0);

  // Market Cap Classification
  const capBuckets = { large: 0, mid: 0, small: 0 };
  holdings.forEach(h => {
    const mcap = enrichedMap[h.symbol]?.marketCap ?? 0;
    const weight = totalValue > 0 ? h.currentValue / totalValue : 0;
    if (mcap > 200_000_000_000) capBuckets.large += weight; // > 2000Cr large cap (rough)
    else if (mcap > 50_000_000_000) capBuckets.mid += weight;
    else capBuckets.small += weight;
  });

  // Concentration Risk
  const maxWeight = Math.max(...holdings.map(h => h.weightPct));
  const highRiskCount = holdings.filter(h => h.weightPct > 20).length;

  // Safety Score
  const concentrationPenalty = maxWeight * 0.8;
  const spreadBonus = Math.min(30, holdings.length * 8);
  const safetyScore = Math.max(10, Math.min(100, Math.round(100 - concentrationPenalty + spreadBonus)));

  const isStable   = safetyScore >= 70;
  const isCaution  = safetyScore >= 40 && safetyScore < 70;

  const StatusIcon = isStable ? ShieldCheck : isCaution ? Shield : ShieldAlert;
  const statusLabel = isStable ? 'Healthy' : isCaution ? 'Caution' : 'High Risk';
  const barColor = isStable ? 'var(--profit)' : isCaution ? 'var(--warn)' : 'var(--loss)';

  // Top 3 holdings by weight
  const top3 = [...holdings].sort((a, b) => b.weightPct - a.weightPct).slice(0, 3);

  const betaColor = portfolioBeta > 1.3 ? 'var(--loss)' : portfolioBeta > 1.0 ? 'var(--warn)' : 'var(--profit)';
  const betaLabel = portfolioBeta > 1.3 ? 'Aggressive' : portfolioBeta > 1.0 ? 'Moderate' : 'Defensive';

  return (
    <div className={styles.container}>
      {/* Safety Score */}
      <div className={styles.scoreRow}>
        <div className={styles.scoreLeft}>
          <StatusIcon size={18} color={barColor} />
          <span className={styles.statusLabel} style={{ color: barColor }}>{statusLabel}</span>
        </div>
        <span className={styles.scoreNum}>{safetyScore}<span className={styles.scoreMax}>/100</span></span>
      </div>
      <div className={styles.track}>
        <motion.div className={styles.fill} initial={{ width: 0 }} animate={{ width: `${safetyScore}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }} style={{ background: barColor }} />
      </div>

      {/* Institutional Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', margin: '1rem 0' }}>
        {/* Portfolio Beta */}
        <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-md)', padding: '0.8rem', border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
            <Zap size={11} color={betaColor} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portfolio β</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: betaColor, lineHeight: 1 }}>
            {isEnrichmentLoading ? '…' : portfolioBeta.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.7rem', color: betaColor, marginTop: '0.2rem' }}>{betaLabel}</div>
        </div>

        {/* Weighted P/E */}
        <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-md)', padding: '0.8rem', border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
            <TrendingUp size={11} color="var(--accent)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg P/E</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {isEnrichmentLoading ? '…' : portfolioPE > 0 ? portfolioPE.toFixed(1) : 'N/A'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Weighted</div>
        </div>
      </div>

      {/* Market Cap Allocation Bars */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
          <PieChart size={11} color="var(--accent2)" />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Cap Exposure</span>
        </div>
        {[
          { label: 'Large Cap', val: capBuckets.large, color: 'var(--profit)' },
          { label: 'Mid Cap', val: capBuckets.mid, color: 'var(--accent)' },
          { label: 'Small Cap', val: capBuckets.small, color: 'var(--warn)' },
        ].map(b => (
          <div key={b.label} style={{ marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.label}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: b.color }}>{(b.val * 100).toFixed(0)}%</span>
            </div>
            <div style={{ height: '4px', background: 'var(--surface-border)', borderRadius: '2px' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${b.val * 100}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ height: '100%', background: b.color, borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Weight Concentration */}
      <div className={styles.breakdownList}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
          <Layers size={11} color="var(--text-muted)" />
          <p className={styles.breakdownTitle} style={{ margin: 0 }}>Weight Breakdown</p>
        </div>
        {top3.map(h => (
          <div key={h.symbol} className={styles.breakdownRow}>
            <span className={styles.bSymbol}>{h.symbol}</span>
            <div className={styles.bTrack}>
              <motion.div className={styles.bFill} initial={{ width: 0 }}
                animate={{ width: `${h.weightPct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
            </div>
            <span className={`${styles.bPct} ${h.weightPct > 30 ? styles.warn : ''}`}>
              {h.weightPct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Risk Flag */}
      {highRiskCount > 0 && (
        <div className={styles.alert}>
          <AlertTriangle size={13} color="var(--warn)" />
          <span>{highRiskCount} holding{highRiskCount > 1 ? 's' : ''} exceed 20% portfolio weight</span>
        </div>
      )}
    </div>
  );
}
