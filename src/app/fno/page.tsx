'use client';
import { CandlestickChart, ShieldAlert } from 'lucide-react';

export default function FnoPage() {
  return (
    <div style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
       <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CandlestickChart size={40} color="var(--accent)" />
       </div>
       <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>F&O Derivatives Module</h1>
       <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6 }}>
          The Derivatives engine is currently under development. Phase 6 will bring Institutional-grade Option Chains, OI Analysis, and P.C.R. trackers directly to your cockpit.
       </p>
       <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.75rem 1.25rem', background: 'rgba(255, 171, 0, 0.1)', color: '#ffab00', borderRadius: 'var(--r-md)', border: '1px solid rgba(255, 171, 0, 0.2)', fontSize: '0.9rem', fontWeight: 600 }}>
          <ShieldAlert size={18} /> IN DEVELOPMENT: ALPHA 0.6.2
       </div>
    </div>
  );
}
