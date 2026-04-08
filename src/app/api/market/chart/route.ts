import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export const revalidate = 5; // Vercel Edge caching prevents rate limit bans on free APIs

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const period = searchParams.get('period') || '6mo'; // 1mo, 3mo, 6mo, 1y, 2y

  if (!symbol) {
    return NextResponse.json({ success: false, error: 'No symbol provided' }, { status: 400 });
  }

  try {
    const ticker = `${symbol.toUpperCase()}.NS`;
    const intervalMapper: Record<string, string> = {
      '1mo': '1d', '3mo': '1d', '6mo': '1wk', '1y': '1wk', '2y': '1mo'
    };
    
    // Using robust anonymous V8 fetch to bypass any crumb or SDK IP blocks
    const v8Res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${intervalMapper[period] || '1wk'}&range=${period}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3 }
    });
    
    if (!v8Res.ok) throw new Error('V8 Fetch failed');
    
    const v8Data = await v8Res.json();
    const result = v8Data.chart?.result?.[0];
    
    if (!result) throw new Error('Chart data missing');

    const timestamps = result.timestamp || [];
    const quote = result.indicators.quote[0] || {};
    
    const data = timestamps.map((ts: number, index: number) => ({
      date: new Date(ts * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      close: quote.close[index] ? parseFloat(quote.close[index].toFixed(2)) : null,
      volume: quote.volume[index] ?? null,
    })).filter((d: any) => d.close !== null);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[chart] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case '1mo': return new Date(now.setMonth(now.getMonth() - 1));
    case '3mo': return new Date(now.setMonth(now.getMonth() - 3));
    case '6mo': return new Date(now.setMonth(now.getMonth() - 6));
    case '1y':  return new Date(now.setFullYear(now.getFullYear() - 1));
    case '2y':  return new Date(now.setFullYear(now.getFullYear() - 2));
    default:    return new Date(now.setMonth(now.getMonth() - 6));
  }
}
