'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, PieChart, CandlestickChart, Component, Grid } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Market Pulse', path: '/', icon: Activity },
    { name: 'My Portfolio', path: '/portfolio', icon: PieChart },
    { name: 'Derivatives', path: '/fno', icon: CandlestickChart },
    { name: 'Commodities', path: '/commodities', icon: Component },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Grid size={22} className={styles.logoIcon} />
        <span className={styles.brandName}>V-Prime</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={18} />
              <span className={styles.navText}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Spacer */}
      <div style={{ flex: 1 }} />
      
      <div className={styles.bottomNav}>
        {/* Placeholder for future settings or profile links */}
      </div>
    </aside>
  );
}
