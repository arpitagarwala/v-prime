'use client';
import { useState, useEffect } from 'react';
import MarketBenchmark from '@/components/MarketBenchmark';
import IndexPulse from '@/components/IndexPulse';
import GlobalPulse from '@/components/GlobalPulse';
import SectorRadar from '@/components/SectorRadar';
import EventRadar from '@/components/EventRadar';
import DiscoveryRadar from '@/components/DiscoveryRadar';
import NewsPulse from '@/components/NewsPulse';
import { ChevronRight, Zap, ChevronDown, ChevronUp, Monitor, Clock } from 'lucide-react';
import { useLayoutStore } from '@/hooks/useLayoutStore';
import styles from './page.module.css';

export default function Home() {
  const { layout, toggleModule, isReady } = useLayoutStore();
  const isResearchOpen = layout.research;
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
          <Monitor size={14} /> <span>V-PRIME</span> TERMINAL // MARKET PULSE
        </div>
        <div className={styles.sessionClock}>
          <Clock size={14} /> {mounted && time ? time.toLocaleTimeString([], { hour12: false }) : '--:--:--'}
        </div>
      </div>

      {/* Index Ticker (Full Width) */}
      <MarketBenchmark />

      {/* Main Layout */}
      <div className={styles.dashboardGrid}>
        {/* Left column -> Index Scanning */}
        <div className={styles.mainColumn}>
          <GlobalPulse />
          <SectorRadar />
          <EventRadar />
          <IndexPulse />
        </div>

        {/* Right column -> Pulse Alerts */}
        <div className={styles.sideColumn}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.5rem', width: '340px' }}>
            <div className={styles.cardHeader} onClick={() => toggleModule('research')}>
              <div className={styles.cardHeaderLeft}>
                <Zap size={15} color="var(--accent)" />
                <span className={styles.cardTitle}>Live Research Pulse</span>
              </div>
              <div className={styles.collapseToggle}>
                {isReady && (isResearchOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </div>
            </div>
            
            <div className={`${styles.collapsibleContent} ${isResearchOpen ? styles.expandedContent : ''}`}>
              <div style={{ flex: 1, padding: '1rem' }}>
                 <NewsPulse />
              </div>
            </div>
          </div>
          
          <DiscoveryRadar />
        </div>
      </div>
    </main>
  );
}
