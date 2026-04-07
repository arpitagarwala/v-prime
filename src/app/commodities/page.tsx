'use client';
import { Component, ShieldAlert } from 'lucide-react';

export default function CommoditiesPage() {
  return (
    <div style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
       <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(217, 70, 239, 0.1)', color: 'rgb(217, 70, 239)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Component size={40} />
       </div>
       <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Commodities Terminal</h1>
       <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6 }}>
          Real-time Crude, Gold, Silver, and Natural Gas tracking is scheduled for Phase 7. V-Prime is preparing to bridge MCF Exchange data natively.
       </p>
       <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.75rem 1.25rem', background: 'rgba(217, 70, 239, 0.1)', color: 'rgb(217, 70, 239)', borderRadius: 'var(--r-md)', border: '1px solid rgba(217, 70, 239, 0.2)', fontSize: '0.9rem', fontWeight: 600 }}>
          <ShieldAlert size={18} /> IN DEVELOPMENT: ALPHA 0.6.2
       </div>
    </div>
  );
}
