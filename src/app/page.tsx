'use client';
import { useState, useEffect } from 'react';
import GlobalPulse from '@/components/GlobalPulse';
import SectorRadar from '@/components/SectorRadar';
import EventRadar from '@/components/EventRadar';
import DiscoveryRadar from '@/components/DiscoveryRadar';
import IndexPulse from '@/components/IndexPulse';
import NewsPulse from '@/components/NewsPulse';
import StockScanner from '@/components/StockScanner';
import PortfolioPill from '@/components/PortfolioPill';
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
        
        <StockScanner />
        <PortfolioPill />

        <div className={styles.sessionClock}>
           <Clock size={14} /> {mounted && time ? time.toLocaleTimeString([], { hour12: false }) : '--:--:--'}
        </div>
      </div>

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
          <div style={{ marginBottom: '1.5rem', width: '340px' }}>
            <div 
              className={styles.cardHeader}
              style={{ border: 'none', padding: '0 0 1rem 0' }}
              onClick={() => toggleModule('research')}
            >
              <div className={styles.cardHeaderLeft}>
                <Zap size={14} color="var(--accent)" />
                <span className={styles.cardTitle}>Live Research Pulse</span>
              </div>
              <div className={styles.collapseToggle}>
                {isReady && (isResearchOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </div>
            </div>
            
            <div className={`${styles.collapsibleContent} ${isResearchOpen ? styles.expandedContent : ''}`}>
               <NewsPulse />
            </div>
          </div>
          
          <DiscoveryRadar />
        </div>
      </div>
    </main>
  );
}
