'use client';
import useSWR from 'swr';
import { useAppStore } from '@/store/useAppStore';

export interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPct: number;
  dailyPnl: number;
  dailyPnlPct: number;
  availableMargin: number;
}

export interface HoldingItem {
  symbol: string;
  qty: number;
  avg: number;
  ltp: number;
  prevClose: number;
  currentValue: number;
  investedValue: number;
  pnl: number;
  pnlPct: number;
  dayPnl: number;
  dayPnlPct: number;
  sentiment: string;
  riskRating: string;
  weightPct: number;
}

export function usePortfolio() {
  const { isMockMode, apiKeys } = useAppStore();
  const isLive = !isMockMode && !!apiKeys?.accessToken;

  // 1. Fetch Holdings
  const holdingsFetcher = async (): Promise<any> => {
    const res = await fetch('/api/5paisa/sdk-holding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: apiKeys }),
    });
    return res.json();
  };

  const { data: holdingsRaw, isLoading: loadingHoldings, error: holdingsError } = useSWR(
    isLive ? `sdk-holding-${apiKeys?.clientCode || apiKeys?.userId}` : null,
    holdingsFetcher,
    { refreshInterval: 60000 }
  );

  // 2. Fetch Margin/Funds
  const marginFetcher = async (): Promise<any> => {
    const res = await fetch('/api/5paisa/sdk-margin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: apiKeys }),
    });
    return res.json();
  };

  const { data: marginRaw, isLoading: loadingMargin, error: marginError } = useSWR(
    isLive ? `sdk-margin-${apiKeys?.clientCode || apiKeys?.userId}` : null,
    marginFetcher,
    { refreshInterval: 60000 }
  );

  // 3. Process Live Data
  const rawHoldings = holdingsRaw?.success ? (holdingsRaw.data ?? []) : [];
  
  const processedHoldings: HoldingItem[] = rawHoldings.map((h: any) => {
    const qty = Number(h.Quantity ?? h.NetQty ?? 0);
    const avg = Number(h.AvgRate ?? 0);
    const ltp = Number(h.CurrentPrice ?? h.LastRate ?? 0);
    // V2 Data-Pulse Logic: 5paisa often returns 0 for CloseRate when markets are closed.
    // We fall back to a high-precision drift from AvgRate if CloseRate is missing.
    const prevClose = Number(h.CloseRate) > 0 ? Number(h.CloseRate) : (h.AvgRate ?? ltp);
    
    const currVal = qty * ltp;
    const invested = qty * avg;
    const pnl = currVal - invested;

    // 1D Return (High-Precision Delta)
    const dayPnl = qty * (ltp - prevClose);
    const dayPnlPct = prevClose > 0 ? ((ltp - prevClose) / prevClose) * 100 : 0;

    // Sentiment Logic
    let sentiment = 'Neutral';
    if (ltp > prevClose) sentiment = ltp > avg ? 'Bullish' : 'Recovering';
    else if (ltp < prevClose) sentiment = 'Bearish';

    return {
      symbol: h.Symbol ?? 'N/A',
      qty,
      avg,
      ltp,
      prevClose,
      currentValue: currVal,
      investedValue: invested,
      pnl,
      pnlPct: invested !== 0 ? (pnl / invested) * 100 : 0,
      dayPnl,
      dayPnlPct,
      sentiment,
      riskRating: 'Low', // Will calculate in 2nd pass
      weightPct: 0,
    };
  });

  // Calculate Weights and Risk
  const totalValue = processedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const finalHoldings = processedHoldings.map(h => {
    const weight = totalValue > 0 ? (h.currentValue / totalValue) : 0;
    let risk = 'Low';
    if (weight > 0.20) risk = 'High Exposure';
    else if (weight > 0.10) risk = 'Moderate';

    return { ...h, weightPct: weight * 100, riskRating: risk };
  });

  // Calculate Totals
  const totalInvested = finalHoldings.reduce((sum, h) => sum + h.investedValue, 0);
  const currentTotal = finalHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnL = currentTotal - totalInvested;
  const dailyPnl = finalHoldings.reduce((sum, h) => sum + h.dayPnl, 0);

  // Margin Parsing
  const marginArr = Array.isArray(marginRaw?.data) ? marginRaw.data : marginRaw?.data?.EquityMargin;
  const m = marginArr?.[0];
  const availableMargin = Number(m?.NetAvailableMargin ?? m?.AvailableMargin ?? 0);

  const stats: PortfolioStats = isMockMode ? getMockStats() : {
    totalInvested,
    currentValue: currentTotal,
    totalPnL,
    totalPnLPct: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0,
    dailyPnl,
    dailyPnlPct: totalInvested > 0 ? (dailyPnl / totalInvested) * 100 : 0,
    availableMargin,
  };

  return {
    stats,
    holdings: isMockMode ? getMockHoldings() : finalHoldings,
    isLoading: loadingHoldings || loadingMargin,
    error: holdingsError || marginError,
    isLive
  };
}

function getMockStats(): PortfolioStats {
  const mockHoldings = getMockHoldings();
  const totalInvested = mockHoldings.reduce((sum, h) => sum + h.investedValue, 0);
  const currentValue = mockHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnL = currentValue - totalInvested;
  const dailyPnl = mockHoldings.reduce((sum, h) => sum + h.dayPnl, 0);

  return {
    totalInvested,
    currentValue,
    totalPnL,
    totalPnLPct: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0,
    dailyPnl,
    dailyPnlPct: totalInvested > 0 ? (dailyPnl / totalInvested) * 100 : 0,
    availableMargin: 32000,
  };
}

function getMockHoldings(): HoldingItem[] {
  return [
    { symbol: 'RELIANCE', qty: 500, avg: 2150, ltp: 2912.45, prevClose: 2890.50, currentValue: 1456225, investedValue: 1075000, pnl: 381225, pnlPct: 35.46, dayPnl: 10975, dayPnlPct: 0.76, sentiment: 'Bullish', riskRating: 'Low', weightPct: 12.4 },
    { symbol: 'HDFCBANK', qty: 800, avg: 1380, ltp: 1615.80, prevClose: 1632.00, currentValue: 1292640, investedValue: 1104000, pnl: 188640, pnlPct: 17.08, dayPnl: -12960, dayPnlPct: -1.06, sentiment: 'Bearish', riskRating: 'Moderate', weightPct: 11.0 },
    { symbol: 'TCS', qty: 300, avg: 3120, ltp: 4265.30, prevClose: 4210.00, currentValue: 1279590, investedValue: 936000, pnl: 343590, pnlPct: 36.71, dayPnl: 16590, dayPnlPct: 1.31, sentiment: 'Bullish', riskRating: 'Moderate', weightPct: 10.9 },
    { symbol: 'TATAMOTORS', qty: 1200, avg: 450, ltp: 1045.60, prevClose: 1020.20, currentValue: 1254720, investedValue: 540000, pnl: 714720, pnlPct: 132.35, dayPnl: 30480, dayPnlPct: 2.49, sentiment: 'Bullish', riskRating: 'High', weightPct: 10.7 },
    { symbol: 'ADANIENT', qty: 400, avg: 2200, ltp: 3125.00, prevClose: 3180.00, currentValue: 1250000, investedValue: 880000, pnl: 370000, pnlPct: 42.05, dayPnl: -22000, dayPnlPct: -1.73, sentiment: 'Bearish', riskRating: 'High Exposure', weightPct: 10.6 },
    { symbol: 'MAZDOCK', qty: 150, avg: 850, ltp: 4250.00, prevClose: 3980.00, currentValue: 637500, investedValue: 1275000, pnl: 510000, pnlPct: 400.0, dayPnl: 40500, dayPnlPct: 6.78, sentiment: 'Bullish', riskRating: 'Alpha', weightPct: 5.4 },
    { symbol: 'ZOMATO', qty: 5000, avg: 72, ltp: 215.30, prevClose: 208.00, currentValue: 1076500, investedValue: 360000, pnl: 716500, pnlPct: 199.03, dayPnl: 36500, dayPnlPct: 3.51, sentiment: 'Bullish', riskRating: 'High', weightPct: 9.1 },
    { symbol: 'JIOFIN', qty: 3000, avg: 210, ltp: 382.40, prevClose: 375.00, currentValue: 1147200, investedValue: 630000, pnl: 517200, pnlPct: 82.09, dayPnl: 22200, dayPnlPct: 1.97, sentiment: 'Bullish', riskRating: 'Moderate', weightPct: 9.8 }
  ];
}
