import { NextResponse } from 'next/server';

export const revalidate = 60; // Edge Cache for 60 seconds

async function fetchTicker(symbol: string) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 }
    });
    
    if (!res.ok) return null;
    
    const d = await res.json();
    const meta = d.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose;
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    const change = price - prevClose;

    return { price, changePct, change };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const [nifty, sensex] = await Promise.all([
      fetchTicker('^NSEI'),
      fetchTicker('^BSESN')
    ]);

    return NextResponse.json({ 
      success: true, 
      data: {
        nifty: nifty || { changePct: 0, price: 0, change: 0 },
        sensex: sensex || { changePct: 0, price: 0, change: 0 }
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
