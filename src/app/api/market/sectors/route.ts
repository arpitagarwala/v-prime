import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SECTORS = [
  { name: 'NIFTY AUTO', symbol: '^CNXAUTO' },
  { name: 'NIFTY IT', symbol: '^CNXIT' },
  { name: 'NIFTY METAL', symbol: '^CNXMETAL' },
  { name: 'NIFTY PHARMA', symbol: '^CNXPHARMA' },
  { name: 'NIFTY FMCG', symbol: '^CNXFMCG' },
  { name: 'NIFTY REALTY', symbol: '^CNXREALTY' },
  { name: 'NIFTY PSU BANK', symbol: '^CNXPSUBANK' },
  { name: 'NIFTY OIL & GAS', symbol: '^CNXENERGY' },
  { name: 'NIFTY BANK', symbol: '^NSEBANK' },
];

export async function GET() {
  try {
    const results = await Promise.all(
      SECTORS.map(async (sec) => {
        try {
          const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sec.symbol}?interval=1d&range=1d`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 60 }
          });
          const d = await res.json();
          const meta = d.chart?.result?.[0]?.meta;
          if (!meta) return null;

          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose;
          const pChange = ((price - prevClose) / prevClose) * 100;

          // Align with frontend keys to avoid NaN
          return { symbol: sec.name, lastPrice: price, pChange };
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
