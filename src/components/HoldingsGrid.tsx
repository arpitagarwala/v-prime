'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePortfolio, HoldingItem } from '@/hooks/usePortfolio';
import { usePortfolioEnrichment } from '@/hooks/usePortfolioEnrichment';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RebalanceEngine from './RebalanceEngine';
import styles from './HoldingsGrid.module.css';

export default function HoldingsGrid() {
  const { holdings, isLoading } = usePortfolio();
  const symbols = holdings.map(h => h.symbol);
  const { enrichedMap } = usePortfolioEnrichment(symbols);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showRebalance, setShowRebalance] = useState(false);

  const toggle = (sym: string) => setExpanded(prev => prev === sym ? null : sym);

  const fmtINR = (n: number) =>
    '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sign = (n: number) => (n >= 0 ? '+' : '−');

  if (isLoading) return <div className={styles.loading}>Loading positions…</div>;

  return (
    <div className={styles.container}>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem 0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Active Holdings</h3>
        <button 
          onClick={() => setShowRebalance(true)}
          style={{ 
            background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', 
            color: 'var(--text-primary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--r-sm)', 
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' 
          }}
        >
          <TrendingUp size={14} /> Rebalance Portfolio
        </button>
      </div>

      {/* Table Header */}
      <div className={styles.tableHead}>
        <span>Instrument</span>
        <span className={styles.right}>Mkt Price</span>
        <span className={styles.right}>Avg. Buy</span>
        <span className={styles.right}>1D Return</span>
        <span className={styles.right}>Total P&amp;L</span>
      </div>

      {/* Rows */}
      {holdings.map((h: HoldingItem) => {
        // Overlay Yahoo Finance dynamic data over 5paisa missing data
        const enrichedDayPct = enrichedMap[h.symbol]?.regularMarketChangePercent;
        const enrichedDayAmt = enrichedMap[h.symbol]?.regularMarketChange;
        
        const displayDayPnlPct = enrichedDayPct !== undefined && enrichedDayPct !== null ? enrichedDayPct : h.dayPnlPct;
        const displayDayPnl = enrichedDayAmt !== undefined && enrichedDayAmt !== null ? (enrichedDayAmt * h.qty) : h.dayPnl;

        const isProfit     = h.pnl >= 0;
        const isDayProfit  = displayDayPnl >= 0;
        const isOpen       = expanded === h.symbol;

        return (
          <div key={h.symbol} className={styles.rowGroup}>
            <button
              className={`${styles.row} ${isOpen ? styles.rowOpen : ''}`}
              onClick={() => toggle(h.symbol)}
              aria-expanded={isOpen}
            >
              {/* Instrument */}
              <div className={styles.instrumentCol}>
                <div className={styles.avatar}>{h.symbol[0]}</div>
                <div className={styles.nameBlock}>
                  <span className={styles.symbolName}>{h.symbol}</span>
                  <span className={styles.qty}>{h.qty} shares</span>
                </div>
              </div>

              {/* Market Price */}
              <div className={styles.priceCol}>
                <span className={styles.price}>{fmtINR(h.ltp)}</span>
              </div>

              {/* Avg Buy */}
              <div className={styles.priceCol}>
                <span className={styles.price}>{fmtINR(h.avg)}</span>
              </div>

              {/* 1D Return */}
              <div className={styles.pnlCol}>
                <span className={isDayProfit ? styles.profit : styles.loss}>
                  {sign(displayDayPnl)}{fmtINR(displayDayPnl)}
                </span>
                <span className={`${styles.pnlPct} ${isDayProfit ? styles.profit : styles.loss}`}>
                  {sign(displayDayPnlPct)}{Math.abs(displayDayPnlPct).toFixed(2)}%
                </span>
              </div>

              {/* Total P&L */}
              <div className={styles.pnlCol}>
                <span className={isProfit ? styles.profit : styles.loss}>
                  {sign(h.pnl)}{fmtINR(h.pnl)}
                </span>
                <span className={`${styles.pnlPct} ${isProfit ? styles.profit : styles.loss}`}>
                  {sign(h.pnlPct)}{Math.abs(h.pnlPct).toFixed(2)}%
                </span>
              </div>
            </button>

            {/* Expansion Panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className={styles.panel}
                >
                  <div className={styles.panelGrid}>
                    <div className={styles.panelItem}>
                      <span className={styles.panelLabel}>Current Value</span>
                      <span className={styles.panelValue}>{fmtINR(h.currentValue)}</span>
                    </div>
                    <div className={styles.panelItem}>
                      <span className={styles.panelLabel}>Invested</span>
                      <span className={styles.panelValue}>{fmtINR(h.investedValue)}</span>
                    </div>
                    <div className={styles.panelItem}>
                      <span className={styles.panelLabel}>Portfolio Weight</span>
                      <span className={styles.panelValue}>{h.weightPct.toFixed(1)}%</span>
                    </div>
                    <div className={styles.panelItem}>
                      <span className={styles.panelLabel}>Sentiment</span>
                      <span className={`${styles.panelValue} ${h.sentiment === 'Bullish' ? styles.profit : h.sentiment === 'Bearish' ? styles.loss : ''}`}>
                        {h.sentiment}
                      </span>
                    </div>
                    <div className={styles.panelItem}>
                      <span className={styles.panelLabel}>Risk</span>
                      <span className={styles.panelValue}>{h.riskRating}</span>
                    </div>
                    <div className={styles.panelItem}>
                      <span className={styles.panelLabel}>Prev. Close</span>
                      <span className={styles.panelValue}>{fmtINR(h.prevClose)}</span>
                    </div>
                    {/* Deep Terminal Link */}
                    <div className={styles.panelItem} style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                       <Link 
                         href={`/terminal/${h.symbol}`} 
                         style={{ 
                           display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                           background: 'var(--accent-soft)', color: 'var(--accent)', padding: '0.75rem', 
                           borderRadius: 'var(--r-md)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                           transition: 'all 0.2s', border: '1px solid var(--accent-glow)'
                         }}>
                         Launch Deep Terminal <TrendingUp size={14} />
                       </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <RebalanceEngine isOpen={showRebalance} onClose={() => setShowRebalance(false)} />
    </div>
  );
}
