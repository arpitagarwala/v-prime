import { NextResponse } from 'next/server';

export const revalidate = 60; // Edge Cache for 60 seconds

export async function GET() {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/^NSEI?interval=1d&range=1d`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch Nifty');
    
    const d = await res.json();
    const meta = d.chart?.result?.[0]?.meta;
    
    if (!meta) return NextResponse.json({ success: true, data: { changePct: 0, price: 0 } });

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose;
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

    return NextResponse.json({ success: true, data: { changePct, price } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
