'use client';
import { usePortfolio } from '@/hooks/usePortfolio';
import { motion } from 'framer-motion';
import { Activity, AlertOctagon, TrendingDown } from 'lucide-react';
import styles from './GlobalRiskMonitor.module.css';
import { useState, useEffect } from 'react';

export default function GlobalRiskMonitor() {
  const { holdings, isLoading, isLive } = usePortfolio();
  
  const [peakValue, setPeakValue] = useState(0);
  
  // Reset peak on connection toggle to clear mock inheritance
  useEffect(() => {
    setPeakValue(0);
  }, [isLive]);
  
  // Editable threshold state
  const [trapThreshold, setTrapThreshold] = useState<number | null>(null);
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState('');

  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);

  useEffect(() => {
    if (totalValue > peakValue) {
      setPeakValue(totalValue);
    }
  }, [totalValue, peakValue]);

  if (isLoading || holdings.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <Activity size={16} />
          <span>Drawdown Monitor</span>
        </div>
        <div className={styles.empty}>Monitoring paused.</div>
      </div>
    );
  }

  const drawdownAmt = Math.max(0, peakValue - totalValue);
  const drawdownPct = peakValue > 0 ? (drawdownAmt / peakValue) * 100 : 0;
  
  // Danger logic
  const hasLimit = trapThreshold !== null && trapThreshold > 0;
  const isDanger = hasLimit && drawdownPct >= trapThreshold;
  
  // Progress bar fills up as it drops towards the threshold, capped at 100%
  const dangerProgression = hasLimit ? Math.min(100, (drawdownPct / trapThreshold) * 100) : 0;

  const handleSaveLimit = () => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val > 0) {
      setTrapThreshold(val);
    } else {
      setTrapThreshold(null);
    }
    setIsEditingLimit(false);
  };


  return (
    <div className={`${styles.card} ${isDanger ? styles.dangerGlow : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <Activity size={16} className={isDanger ? styles.dangerIcon : styles.safeIcon} />
          <span>Drawdown Monitor</span>
        </div>
        
        {isEditingLimit ? (
          <div className={styles.limitEditor}>
            <input 
              autoFocus
              type="text" 
              value={tempLimit} 
              onChange={e => setTempLimit(e.target.value)}
              onBlur={handleSaveLimit}
              onKeyDown={e => e.key === 'Enter' && handleSaveLimit()}
              placeholder="e.g. 2.0"
              className={styles.limitInput}
            />
            <span className={styles.limitPctSign}>%</span>
          </div>
        ) : (
          <button 
            className={styles.thresholdBadge} 
            onClick={() => {
              setTempLimit(trapThreshold ? trapThreshold.toString() : '');
              setIsEditingLimit(true);
            }}
          >
            {hasLimit ? `${trapThreshold}% LIMIT` : 'SET LIMIT'}
          </button>
        )}
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <span className={styles.mLabel}>Session Peak</span>
          <span className={styles.mValue}>₹{peakValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.mLabel}>Current Value</span>
          <span className={`${styles.mValue} ${isDanger ? styles.dangerText : ''}`}>
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Drawdown Progress Bar */}
      <div className={styles.trackerArea}>
        <div className={styles.trackerHeader}>
          <span className={styles.drawdownLabel}>
            <TrendingDown size={14} /> 
            Drift from Peak (-{drawdownPct.toFixed(2)}%)
          </span>
          <span className={styles.drawdownAmt}>-₹{drawdownAmt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
        
        <div className={styles.track}>
          <motion.div
            className={`${styles.fill} ${isDanger ? styles.dangerFill : ''}`}
            initial={{ width: 0 }}
            animate={{ width: `${dangerProgression}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {isDanger && (
        <div className={styles.alertRibbon}>
          <AlertOctagon size={14} />
          <span>PROFIT LOCK TRIPPED. Exit positions.</span>
        </div>
      )}
    </div>
  );
}
