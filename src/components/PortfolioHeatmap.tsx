'use client';
import { usePortfolio } from '@/hooks/usePortfolio';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Info, Zap } from 'lucide-react';
import { useState } from 'react';
import styles from './PortfolioHeatmap.module.css';

export default function PortfolioHeatmap() {
  const { holdings, isLoading } = usePortfolio();
  const [hovered, setHovered] = useState<string | null>(null);

  if (isLoading || holdings.length === 0) return null;

  const totalWeight = holdings.reduce((sum, h) => sum + h.weightPct, 0);
  const sorted = [...holdings].sort((a, b) => b.weightPct - a.weightPct);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <LayoutGrid size={16} className="accent-text" />
          <span>Stealth Risk Mosaic</span>
        </div>
        <div className={styles.legend}>
          <div className={styles.swatch + ' ' + styles.pHigh} title="+2% Gain" />
          <div className={styles.swatch + ' ' + styles.lHigh} title="-2% Loss" />
        </div>
      </div>

      <div className={styles.mosaicGrid}>
        {sorted.map((h, i) => {
          const colorClass = h.dayPnlPct >= 2 ? styles.pHigh : 
                            h.dayPnlPct >= 0.5 ? styles.pMed :
                            h.dayPnlPct >= -0.5 ? styles.neutral :
                            h.dayPnlPct >= -2 ? styles.lMed : styles.lHigh;

          // Advanced weighting for visual blocks (min 1fr, max 4fr)
          const spanWidth = Math.max(1, Math.round((h.weightPct / totalWeight) * 4));
          
          return (
            <motion.div
              key={h.symbol}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`${styles.block} ${colorClass}`}
              style={{ gridColumn: `span ${spanWidth}` }}
              onMouseEnter={() => setHovered(h.symbol)}
              onMouseLeave={() => setHovered(null)}
            >
              <AnimatePresence>
                {hovered === h.symbol && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={styles.overlay}
                  >
                    <div className={styles.overlaySymbol}>{h.symbol}</div>
                    <div className={styles.overlayVal}>
                      {h.dayPnlPct >= 0 ? '+' : ''}{h.dayPnlPct.toFixed(2)}%
                    </div>
                    <div className={styles.overlayWeight}>{h.weightPct.toFixed(1)}% Weight</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <Info size={12} />
        <span>Hover for analytics. Box size matches portfolio weight.</span>
      </div>
    </div>
  );
}
