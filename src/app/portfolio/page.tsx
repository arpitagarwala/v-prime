'use client';
import PortfolioHero from '@/components/PortfolioHero';
import PortfolioDiagnostics from '@/components/PortfolioDiagnostics';
import HoldingsGrid from '@/components/HoldingsGrid';
import GlobalRiskMonitor from '@/components/GlobalRiskMonitor';
import DividendTimeline from '@/components/DividendTimeline';
import { useState, useEffect } from 'react';
import { ChevronRight, BarChart2, Monitor, Clock as ClockIcon } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function PortfolioPage() {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className={styles.container}>
      {/* Institutional Header */}
      <div className={styles.terminalHeader}>
        <div className={styles.terminalTitle}>
          <Monitor size={14} /> <span>V-PRIME</span> TERMINAL // PORTFOLIO INTELLIGENCE
        </div>
        <div className={styles.sessionClock}>
          <ClockIcon size={14} /> {mounted && time ? time.toLocaleTimeString([], { hour12: false }) : '--:--:--'}
        </div>
      </div>

      {/* Main Layout */}
      <div className={styles.dashboardGrid}>
        {/* Left: Portfolio + Holdings */}
        <div className={styles.mainColumn}>
          <PortfolioHero />
          <HoldingsGrid />
        </div>

        {/* Right: Intelligence Sidebar */}
        <div className={styles.sideColumn}>
          {/* Global Drawdown Risk */}
          <GlobalRiskMonitor />

          {/* Risk Diagnostics */}
          <div className="glass-card">
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <BarChart2 size={15} color="var(--accent)" />
                <span className={styles.cardTitle}>Portfolio Health</span>
              </div>
            </div>
            <PortfolioDiagnostics />
          </div>

          {/* Passive Income Radar */}
          <DividendTimeline />
        </div>
      </div>
    </main>
  );
}
