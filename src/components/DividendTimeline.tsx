'use client';
import { usePortfolio } from '@/hooks/usePortfolio';
import { CalendarClock, Coins, Banknote, CalendarDays } from 'lucide-react';
import styles from './DividendTimeline.module.css';

export default function DividendTimeline() {
  const { holdings, isLoading } = usePortfolio();

  // Mock corporate actions. If the user holds the stock, they get the cash flow.
  const upcomingEvents = [
    { symbol: 'ITC', type: 'Dividend', amount: 5.25, daysToEx: 3, dateStr: '15 May' },
    { symbol: 'HDFCBANK', type: 'Dividend', amount: 19.50, daysToEx: 12, dateStr: '24 May' },
    { symbol: 'RELIANCE', type: 'Bonus (1:1)', amount: 0, daysToEx: 20, dateStr: '02 Jun' },
    { symbol: 'TCS', type: 'Dividend', amount: 28.00, daysToEx: 45, dateStr: '27 Jun' }
  ];

  let expectedCashFlow = 0;
  const actionableEvents = upcomingEvents.map(event => {
    // Check if user currently holds this stock
    const held = holdings.find(h => h.symbol === event.symbol);
    const qty = held ? held.qty : 0;
    const payout = qty * event.amount;
    expectedCashFlow += payout;
    return { ...event, qty, payout, isActive: qty > 0 };
  });

  if (isLoading) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <CalendarDays size={16} className={styles.icon} />
          <span>Passive Income Radar</span>
        </div>
      </div>

      <div className={styles.cashFlowBox}>
        <span className={styles.cfLabel}>Expected 30-Day Cash Flow</span>
        <div className={styles.cfAmount}>
          <Banknote size={20} className={styles.cashIcon} />
          <span>₹{expectedCashFlow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div className={styles.timeline}>
        {actionableEvents.map((ev, idx) => (
          <div key={idx} className={`${styles.tRow} ${ev.isActive ? styles.activeRow : styles.inactiveRow}`}>
            
            <div className={styles.tDate}>
              <span className={styles.dDay}>{ev.dateStr.split(' ')[0]}</span>
              <span className={styles.dMonth}>{ev.dateStr.split(' ')[1]}</span>
            </div>

            <div className={styles.tLine}>
              <div className={`${styles.tDot} ${ev.isActive ? styles.activeDot : ''}`} />
              {idx < actionableEvents.length - 1 && <div className={styles.tTail} />}
            </div>

            <div className={styles.tContent}>
              <div className={styles.cInfo}>
                <span className={styles.cSymbol}>{ev.symbol}</span>
                <span className={styles.cType}>{ev.type} {ev.amount > 0 ? `(₹${ev.amount}/sh)` : ''}</span>
              </div>
              
              <div className={styles.cStatus}>
                {ev.isActive ? (
                  <div className={styles.payoutBadge}>
                    <Coins size={12} />
                    +₹{ev.payout.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                ) : (
                  <span className={styles.noPos}>No Position</span>
                )}
                <span className={styles.cDays}>Ex in {ev.daysToEx}d</span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
