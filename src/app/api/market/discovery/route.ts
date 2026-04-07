import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

// Memory cache to prevent SDK hammering (60-second revalidation for 'Live' experience)
let DISCOVERY_CACHE: any = null;
let CACHE_EXPIRY = 0;
const CACHE_DURATION = 60000; // 60 Seconds

const SEED_TICKERS = [
  'RELIANCE.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'INFY.NS', 'TCS.NS', 
  'BHARTIARTL.NS', 'ITC.NS', 'SBIN.NS', 'AXISBANK.NS', 'LT.NS'
];

export async function GET() {
  const now = Date.now();
  
  if (DISCOVERY_CACHE && now < CACHE_EXPIRY) {
    return NextResponse.json({ success: true, data: DISCOVERY_CACHE, _cached: true });
  }

  try {
    const dataPromises = SEED_TICKERS.map(async (ticker) => {
      try {
        const raw = await yahooFinance.quoteSummary(ticker, { modules: ['financialData', 'price', 'summaryDetail'] }) as any;
        const unwrap = (val: any) => (val && typeof val === 'object' && val.raw !== undefined) ? val.raw : val;
        
        return {
          symbol: ticker.replace('.NS', ''),
          price: unwrap(raw.price?.regularMarketPrice),
          pe: unwrap(raw.summaryDetail?.trailingPE) || unwrap(raw.summaryDetail?.forwardPE) || 0,
          upside: (() => {
            const mean = unwrap(raw.financialData?.targetMeanPrice);
            const cur = unwrap(raw.price?.regularMarketPrice);
            return mean ? ((mean - cur) / cur) * 100 : 0;
          })(),
          marketCap: unwrap(raw.price?.marketCap)
        };
      } catch (e) { return null; }
    });

    const results = (await Promise.all(dataPromises)).filter(Boolean) as any[];

    // If data fetch failed but we have NO cache, use Hardcoded "Institutional Safe-Haven" fallback
    if (results.length === 0 && !DISCOVERY_CACHE) {
       return NextResponse.json({ 
         success: true, 
         data: {
           valuePicks: [
             { symbol: 'ITC', price: 440, pe: 24.1, upside: 12.5, marketCap: 54000000000 },
             { symbol: 'SBIN', price: 760, pe: 10.5, upside: 15.2, marketCap: 68000000000 }
           ],
           growthAlphas: [
             { symbol: 'RELIANCE', price: 2950, pe: 28.5, upside: 18.4, marketCap: 200000000000 },
             { symbol: 'INFY', price: 1620, pe: 25.2, upside: 14.1, marketCap: 67000000000 }
           ]
         },
         _fallback: 'static_seed'
       });
    }

    const payload = {
      valuePicks: results.filter(x => x.pe > 0).sort((a,b) => a.pe - b.pe).slice(0, 3),
      growthAlphas: results.filter(x => x.upside > 0).sort((a,b) => b.upside - a.upside).slice(0, 3)
    };

    DISCOVERY_CACHE = payload;
    CACHE_EXPIRY = now + CACHE_DURATION;

    return NextResponse.json({ success: true, data: payload, _cached: false });

  } catch (error: any) {
    if (DISCOVERY_CACHE) return NextResponse.json({ success: true, data: DISCOVERY_CACHE, _stale: true });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
