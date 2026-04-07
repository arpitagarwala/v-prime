import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Array of major NIFTY 50 heavyweights to analyze real-time momentum
    const symbols = [
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 
      'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 
      'LT.NS', 'BAJFINANCE.NS', 'TATAMOTORS.NS', 'M&M.NS',
      'AXISBANK.NS', 'MARUTI.NS', 'SUNPHARMA.NS'
    ];
    
    const quotes = await yahooFinance.quote(symbols) as any[];
    
    // Sort by daily percentage change
    const sorted = quotes.sort((a: any, b: any) => 
      (b.regularMarketChangePercent || 0) - (a.regularMarketChangePercent || 0)
    );

    const bestOverall = sorted[0];
    const lagging = sorted[sorted.length - 1];

    return NextResponse.json({ 
      success: true, 
      bestOverall: {
        symbol: bestOverall.symbol.replace('.NS', ''),
        changePct: bestOverall.regularMarketChangePercent,
      },
      lagging: {
        symbol: lagging.symbol.replace('.NS', ''),
        changePct: lagging.regularMarketChangePercent,
      }
    });

  } catch (error: any) {
    console.error('Yahoo Movers Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
