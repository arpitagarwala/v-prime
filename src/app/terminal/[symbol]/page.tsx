'use client';
import useSWR from 'swr';
import { useState, use } from 'react';
import { ArrowLeft, Activity, Target, ShieldAlert, BarChart3, Info, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const PERIODS = ['1mo', '3mo', '6mo', '1y'] as const;
type Period = typeof PERIODS[number];

function TerminalSkeleton() {
  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div className="skeleton" style={{ width: '120px', height: '16px', marginBottom: '1.25rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="skeleton" style={{ width: '240px', height: '48px' }} />
            <div className="skeleton" style={{ width: '380px', height: '18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
             <div className="skeleton" style={{ width: '180px', height: '48px' }} />
             <div className="skeleton" style={{ width: '120px', height: '24px' }} />
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card skeleton" style={{ height: '320px' }} />
          <div className="glass-card skeleton" style={{ height: '240px' }} />
          <div className="glass-card skeleton" style={{ height: '300px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card skeleton" style={{ height: '250px' }} />
          <div className="glass-card skeleton" style={{ height: '200px' }} />
          <div className="glass-card skeleton" style={{ height: '180px' }} />
        </div>
      </div>
    </div>
  );
}

export default function DeepTerminal({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol.toUpperCase();
  const [period, setPeriod] = useState<Period>('6mo');

  // --- Deep Dive Fundamentals ---
  const deepFetcher = async () => {
    const res = await fetch(`/api/market/deep-dive?symbol=${symbol}`);
    return res.json();
  };
  const { data: raw, isLoading: deepLoading } = useSWR(`deep-dive-${symbol}`, deepFetcher, { refreshInterval: 300000 });

  // --- Historical Chart ---
  const chartFetcher = async () => {
    const res = await fetch(`/api/market/chart?symbol=${symbol}&period=${period}`);
    return res.json();
  };
  const { data: chartRaw, isLoading: chartLoading } = useSWR(
    `chart-${symbol}-${period}`,
    chartFetcher,
    { revalidateOnFocus: false }
  );

  const data = raw?.data;
  const chartData = chartRaw?.success ? chartRaw.data : [];

  if (deepLoading) {
    return <TerminalSkeleton />;
  }

  if (!data) return (
    <div style={{ padding: '2rem', color: 'var(--loss)' }}>
      Failed to load data for {symbol}. The symbol may not be listed on NSE, or Yahoo Finance data is unavailable.
    </div>
  );

  const fmt = (n: any) => typeof n === 'number' && !isNaN(n) ? n.toLocaleString('en-IN') : 'N/A';
  const fmtNum = (n: any, precision = 2) => typeof n === 'number' && !isNaN(n) ? n.toFixed(precision) : 'N/A';
  const fmtCr = (n: any) => typeof n === 'number' && !isNaN(n) ? '₹' + (n / 10000000).toFixed(2) + ' Cr' : 'N/A';
  const fmtPct = (n: any) => typeof n === 'number' && !isNaN(n) ? (n * 100).toFixed(2) + '%' : 'N/A';
  const sign = (n: number) => (n >= 0 ? '+' : '');
  const isProfit = (data.price?.change ?? 0) >= 0;

  const rec = data.analyst?.recommendation?.replace(/_/g, ' ') || 'hold';
  const recColor: Record<string, string> = {
    'buy': 'var(--profit)', 'strong buy': 'var(--profit)',
    'hold': 'var(--accent)', 'sell': 'var(--loss)', 'strong sell': 'var(--loss)'
  };
  const recBg: Record<string, string> = {
    'buy': 'var(--profit-soft)', 'strong buy': 'var(--profit-soft)',
    'hold': 'var(--accent-soft)', 'sell': 'var(--loss-soft)', 'strong sell': 'var(--loss-soft)'
  };

  const closes = chartData.map((d: any) => d.close).filter(Boolean);
  const chartMin = closes.length ? Math.floor(Math.min(...closes) * 0.98) : 'auto';
  const chartMax = closes.length ? Math.ceil(Math.max(...closes) * 1.02) : 'auto';

  const chartColor = closes.length >= 2
    ? closes[closes.length - 1] >= closes[0] ? '#10b981' : '#ef4444'
    : '#6366f1';

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div>
        <button onClick={() => window.history.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', padding: 0, border: 'none', background: 'none' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{symbol}</h1>
              <span style={{
                padding: '0.3rem 0.8rem', borderRadius: 'var(--r-sm)', fontSize: '0.85rem', fontWeight: 700,
                textTransform: 'capitalize', background: recBg[rec] || 'var(--accent-soft)', color: recColor[rec] || 'var(--accent)'
              }}>{rec}</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              <span>52W High: <strong style={{ color: 'var(--profit)' }}>₹{fmt(data.price?.high52)}</strong></span>
              <span>52W Low: <strong style={{ color: 'var(--loss)' }}>₹{fmt(data.price?.low52)}</strong></span>
              <span>Mkt Cap: <strong style={{ color: 'var(--text-secondary)' }}>{fmtCr(data.price?.marketCap)}</strong></span>
              <span>Vol: <strong style={{ color: 'var(--text-secondary)' }}>{fmt(data.price?.vol)}</strong></span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>
              ₹{fmt(data.price?.current)}
            </div>
            <div style={{ color: isProfit ? 'var(--profit)' : 'var(--loss)', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.25rem' }}>
              {sign(data.price?.change)}₹{data.price?.change?.toFixed(2)} ({sign(data.price?.changePct)}{data.price?.changePct?.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={15} color="var(--accent)" /> Price History
              </h3>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {PERIODS.map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{
                    padding: '0.25rem 0.6rem', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', border: '1px solid var(--surface-border)',
                    background: period === p ? 'var(--accent)' : 'var(--surface-raised)',
                    color: period === p ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s'
                  }}>{p}</button>
                ))}
              </div>
            </div>

            {chartLoading ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <RefreshCcw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[chartMin, chartMax]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} width={70} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px' }}
                    formatter={(val: any) => [`₹${val}`, 'Close']}
                  />
                  <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} fill={`url(#grad-${symbol})`} dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No chart data available for this period.
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={15} color="var(--accent2)" /> Core Financials
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'P/E (TTM)', val: fmtNum(data.financials?.pe) },
                { label: 'Forward P/E', val: fmtNum(data.financials?.fwdPe) },
                { label: 'EPS (TTM)', val: data.financials?.eps != null ? `₹${fmtNum(data.financials.eps)}` : 'N/A' },
                { label: 'P/B Ratio', val: fmtNum(data.financials?.priceToBook) },
                { label: 'Profit Margin', val: fmtPct(data.financials?.margins) },
                { label: 'ROE', val: fmtPct(data.financials?.roe) },
                { label: 'Debt / Equity', val: fmtNum(data.financials?.debtToEquity) },
                { label: 'Total Revenue', val: fmtCr(data.financials?.revenue) },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-md)', padding: '0.85rem', border: '1px solid var(--surface-border)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{item.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.val ?? 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={15} color="var(--accent)" /> Technical & Risk
            </h3>

            <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-md)', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Market Beta (Volatility)</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: (data.technicals?.beta ?? 1) > 1.2 ? 'var(--loss)' : (data.technicals?.beta ?? 1) < 0.8 ? 'var(--profit)' : 'var(--text-primary)', lineHeight: 1 }}>
                    {fmtNum(data.technicals?.beta)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '160px', lineHeight: 1.4 }}>
                  {(data.technicals?.beta ?? 1) > 1.2 ? 'Highly Aggressive. Amplifies broader market movements.' : (data.technicals?.beta ?? 1) < 0.8 ? 'Defensive. Highly resistant to broader market crashes.' : 'Neutral. Mirrors exact market movements.'}
                </div>
              </div>
              
              <div style={{ position: 'relative', height: '6px', background: 'linear-gradient(90deg, var(--profit) 0%, var(--accent) 50%, var(--loss) 100%)', borderRadius: '3px', marginTop: '0.5rem' }}>
                {data.technicals?.beta != null && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: `${Math.min(Math.max((data.technicals.beta / 2.5) * 100, 0), 100)}%`, 
                    transform: 'translate(-50%, -50%)', 
                    width: '14px', 
                    height: '14px', 
                    background: '#fff', 
                    border: '3px solid var(--surface-card)', 
                    borderRadius: '50%',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    transition: 'left 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <span>0.0 (Safe)</span>
                <span>1.0 (NIFTY)</span>
                <span>2.5+ (Risky)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: '50-Day SMA', val: data.technicals?.sma50, isBullish: (data.price?.current ?? 0) > (data.technicals?.sma50 ?? 0) },
                { label: '200-Day SMA', val: data.technicals?.sma200, isBullish: (data.price?.current ?? 0) > (data.technicals?.sma200 ?? 0) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.6rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{row.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <strong style={{ fontFamily: 'monospace' }}>₹{fmt(row.val)}</strong>
                    <span style={{
                      fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', fontWeight: 700,
                      background: row.isBullish ? 'var(--profit-soft)' : 'var(--loss-soft)',
                      color: row.isBullish ? 'var(--profit)' : 'var(--loss)'
                    }}>
                      {row.isBullish ? '▲ BULLISH' : '▼ BEARISH'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               Business Overview
            </h3>
            {data.profile?.summary ? (
              <>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Sector', val: data.profile.sector },
                    { label: 'Industry', val: data.profile.industry },
                    { label: 'Employees', val: data.profile.employees?.toLocaleString() },
                  ].map(b => b.val && (
                     <span key={b.label} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 'var(--r-sm)', color: 'var(--text-secondary)' }}>
                       <span style={{ color: 'var(--text-muted)' }}>{b.label}:</span> {b.val}
                     </span>
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {data.profile.summary}
                </p>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Company profile data is temporarily unavailable.</div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               Shareholding Pattern
            </h3>
            {data.ownership?.insiders != null && data.ownership?.institutions != null ? (() => {
              const insiders = data.ownership.insiders * 100;
              const institutions = data.ownership.institutions * 100;
              const retail = Math.max(0, 100 - insiders - institutions);
              return (
                <div>
                  <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: 'var(--surface-raised)' }}>
                    <div style={{ width: `${insiders}%`, background: 'var(--profit)' }} title={`Insiders: ${insiders.toFixed(1)}%`} />
                    <div style={{ width: `${institutions}%`, background: 'var(--accent)' }} title={`Institutions: ${institutions.toFixed(1)}%`} />
                    <div style={{ width: `${retail}%`, background: '#f43f5e' }} title={`Retail/Public: ${retail.toFixed(1)}%`} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--profit)' }} />
                      Promoters/Insiders: <strong style={{ color: 'var(--text-primary)' }}>{insiders.toFixed(1)}%</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }} />
                      Institutions (FII/DII): <strong style={{ color: 'var(--text-primary)' }}>{institutions.toFixed(1)}%</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} />
                      Retail/Public: <strong style={{ color: 'var(--text-primary)' }}>{retail.toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Shareholding composition unavailable.</div>
            )}
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="glass-card" style={{ padding: '1.5rem', borderTop: `3px solid ${recColor[rec] || 'var(--accent)'}` }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={15} /> Analyst Consensus
            </h3>
            <div style={{ textAlign: 'center', padding: '1rem 0', borderBottom: '1px solid var(--surface-border)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'capitalize', color: recColor[rec] || 'var(--text-primary)' }}>{rec}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {data.analyst?.numAnalysts ?? 0} analysts
              </div>
            </div>
            {[
              { label: 'High Target', val: `₹${fmt(data.analyst?.highTarget)}`, color: 'var(--profit)' },
              { label: 'Mean Target', val: `₹${fmtNum(data.analyst?.target)}`, color: 'var(--text-primary)' },
              { label: 'Low Target', val: `₹${fmt(data.analyst?.lowTarget)}`, color: 'var(--loss)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.label}</span>
                <strong style={{ color: item.color, fontFamily: 'monospace' }}>{item.val}</strong>
              </div>
            ))}

            {data.analyst?.target && data.price?.current && (
              <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-md)', padding: '0.75rem', marginTop: '0.5rem', textAlign: 'center', border: '1px solid var(--surface-border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Upside Potential</div>
                <div style={{
                  fontSize: '1.4rem', fontWeight: 800,
                  color: data.analyst.target > data.price.current ? 'var(--profit)' : 'var(--loss)'
                }}>
                  {sign(data.analyst.target - data.price.current)}
                  {(((data.analyst.target - data.price.current) / data.price.current) * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={15} color="var(--accent2)" /> Value Signals
            </h3>
            {[
              {
                label: 'Valuation',
                val: data.financials?.pe,
                text: !data.financials?.pe ? 'N/A' : data.financials.pe < 15 ? 'Undervalued' : data.financials.pe < 30 ? 'Fair Value' : 'Premium',
                color: !data.financials?.pe ? 'var(--text-muted)' : data.financials.pe < 15 ? 'var(--profit)' : data.financials.pe < 30 ? 'var(--accent)' : 'var(--loss)'
              },
              {
                label: 'Momentum',
                val: data.technicals?.sma50,
                text: !data.technicals?.sma50 ? 'N/A' : (data.price?.current ?? 0) > data.technicals.sma50 ? 'Positive' : 'Negative',
                color: !data.technicals?.sma50 ? 'var(--text-muted)' : (data.price?.current ?? 0) > data.technicals.sma50 ? 'var(--profit)' : 'var(--loss)'
              },
              {
                label: 'Profitability',
                val: data.financials?.roe,
                text: !data.financials?.roe ? 'N/A' : data.financials.roe > 0.15 ? 'Strong' : data.financials.roe > 0 ? 'Moderate' : 'Weak',
                color: !data.financials?.roe ? 'var(--text-muted)' : data.financials.roe > 0.15 ? 'var(--profit)' : data.financials.roe > 0 ? 'var(--accent)' : 'var(--loss)'
              },
            ].map(sig => (
              <div key={sig.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--surface-border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{sig.label}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: sig.color }}>● {sig.text}</span>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Upcoming Events
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-raised)', padding: '0.75rem 1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--surface-border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--profit)' }} /> Earnings Call
                </span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {data.events?.earningsDate ? new Date(data.events.earningsDate * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-raised)', padding: '0.75rem 1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--surface-border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} /> Ex-Dividend
                </span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {data.events?.exDividendDate ? new Date(data.events.exDividendDate * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                </strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
