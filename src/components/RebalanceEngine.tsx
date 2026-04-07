'use client';
import { useState, useEffect } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ArrowRightLeft, Send, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './RebalanceEngine.module.css';

interface RebalanceEngineProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RebalanceEngine({ isOpen, onClose }: RebalanceEngineProps) {
  const { holdings } = usePortfolio();
  
  // Initialize target weights to be exactly the current weights
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasInit, setHasInit] = useState(false);

  useEffect(() => {
    if (isOpen && !hasInit && holdings.length > 0) {
      const initial: Record<string, number> = {};
      holdings.forEach(h => {
        initial[h.symbol] = Math.round(h.weightPct * 10) / 10;
      });
      setTargets(initial);
      setSuccess(false);
      setHasInit(true);
    } else if (!isOpen) {
      setHasInit(false);
    }
  }, [isOpen, holdings, hasInit]);

  if (!isOpen) return null;

  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  
  // Calculate total target weight to ensure it adds up to roughly 100
  const currentTotalWeight = Object.values(targets).reduce((a, b) => a + b, 0);

  const handleSliderChange = (symbol: string, val: number) => {
    setTargets(prev => ({ ...prev, [symbol]: val }));
  };

  // Calculate executed difference commands
  const executions = holdings.map(h => {
    const targetPct = targets[h.symbol] || 0;
    const targetValue = (targetPct / 100) * totalValue;
    const valueDiff = targetValue - h.currentValue;
    
    // We assume current price is currentValue / quantity
    const currentPrice = h.qty > 0 ? h.currentValue / h.qty : 0;
    const qtyDiff = currentPrice > 0 ? Math.round(valueDiff / currentPrice) : 0;

    return {
      symbol: h.symbol,
      currentPct: h.weightPct,
      targetPct,
      qtyDiff,
      valueDiff,
      action: qtyDiff > 0 ? 'BUY' : qtyDiff < 0 ? 'SELL' : 'HOLD',
    };
  }).filter(e => e.action !== 'HOLD'); // Only show actionable things

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div 
            className={styles.modal}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <div className={styles.header}>
              <div className={styles.titleGroup}>
                <SlidersHorizontal size={22} className={styles.accent} />
                <h2>1-Click Rebalance Engine</h2>
              </div>
              <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
            </div>

            {!success ? (
              <div className={styles.content}>
                
                {/* Weight Sliders */}
                <div className={styles.sliderSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Target Allocation</h3>
                    <span className={`${styles.totalWeight} ${Math.abs(currentTotalWeight - 100) > 1 ? styles.invalidWeight : ''}`}>
                      Total: {currentTotalWeight.toFixed(1)}% {Math.abs(currentTotalWeight - 100) > 1 ? '(Must equal 100%)' : ''}
                    </span>
                  </div>
                  
                  <div className={styles.sliderList}>
                    {holdings.map(h => (
                      <div key={h.symbol} className={styles.sliderRow}>
                        <div className={styles.sliderLabels}>
                          <span className={styles.sSymbol}>{h.symbol}</span>
                          <span className={styles.sValues}>
                            <span className={styles.sCurrent}>Current: {h.weightPct.toFixed(1)}%</span>
                            <ArrowRightLeft size={10} className={styles.sArrow} />
                            <span className={styles.sTarget}>Target: {(targets[h.symbol] || 0).toFixed(1)}%</span>
                          </span>
                        </div>
                        <input 
                          type="range" 
                          className={styles.rangeInput}
                          min="0" max="100" step="0.5"
                          value={targets[h.symbol] || 0}
                          onChange={(e) => handleSliderChange(h.symbol, parseFloat(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Execution Plan */}
                <div className={styles.planSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Execution Batch</h3>
                  </div>
                  
                  <div className={styles.batchList}>
                    {executions.length === 0 ? (
                      <div className={styles.emptyBatch}>Adjust sliders to generate rebalance orders.</div>
                    ) : (
                      executions.map((ex, i) => (
                        <div key={i} className={styles.batchRow}>
                          <div className={styles.bLeft}>
                            {ex.action === 'BUY' ? <TrendingUp size={14} color="var(--profit)" /> : <TrendingDown size={14} color="var(--loss)" />}
                            <span className={styles.bSymbol}>{ex.symbol}</span>
                          </div>
                          <div className={styles.bRight}>
                            <span className={ex.action === 'BUY' ? styles.bActionBuy : styles.bActionSell}>
                              {ex.action} {Math.abs(ex.qtyDiff)} Qty
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className={styles.footer}>
                  <button 
                    className={styles.executeBtn} 
                    disabled={executions.length === 0 || Math.abs(currentTotalWeight - 100) > 1 || isExecuting}
                    onClick={handleExecute}
                  >
                    {isExecuting ? 'Routing Orders...' : <><Send size={16} /> Execute Rebalance Batch</>}
                  </button>
                </div>

              </div>
            ) : (
              <div className={styles.successState}>
                <CheckCircle2 size={48} className={styles.successIcon} />
                <h3>Rebalance Complete</h3>
                <p>Buy and Sell orders have been successfully routed to the exchange.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
