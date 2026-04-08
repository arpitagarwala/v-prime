import { NextResponse } from 'next/server';

export const revalidate = 5; // Vercel Edge caching prevents rate limit bans on free APIs

const MACRO_SYMBOLS = [
  { label: 'USD/INR', symbol: 'INR=X' },
  { label: 'Crude Oil', symbol: 'CL=F' },
  { label: 'Gold', symbol: 'GC=F' },
  { label: 'India VIX', symbol: '^INDIAVIX' },
  { label: 'Dollar Index', symbol: 'DX-Y.NYB' },
  { label: 'U.S. 10Y Yield', symbol: '^TNX' },
];

export async function GET() {
  try {
    const results = await Promise.all(
      MACRO_SYMBOLS.map(async (m) => {
        try {
          const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${m.symbol}?interval=1d&range=1d`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 300 }
          });
          const d = await res.json();
          const meta = d.chart?.result?.[0]?.meta;
          if (!meta) return null;

          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose;
          // Some macro assets don't have prevClose in the chart meta reliably
          const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

          return { symbol: m.symbol, label: m.label, price, changePct };
        } catch (e) {
          return null;
        }
      })
    );

    const validResults = results.filter(Boolean);
    return NextResponse.json({ success: true, data: validResults });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
