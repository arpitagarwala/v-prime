import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { symbols } = await req.json();
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ success: false, error: 'No symbols provided' }, { status: 400 });
    }

    // Convert NSE symbols to Yahoo Finance format (append .NS)
    const tickers = symbols.map((s: string) => `${s.toUpperCase()}.NS`);

    let quotes: any[] = [];
    try {
      quotes = await yahooFinance.quote(tickers) as any[];
    } catch (sdkError: any) {
      console.log('[Portfolio Batch] SDK Rate limit hit or failed. Falling back to robust anonymous V8 mapping...');
      const enriched: Record<string, any> = {};

      const fetchV8 = async (sym: string, ticker: string) => {
        try {
          const v8Res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store'
          });
          const v8Data = await v8Res.json();
          const meta = v8Data.chart?.result?.[0]?.meta;
          if (meta) {
            enriched[sym] = {
              beta: null, pe: null, fwdPe: null, eps: null,
              regularMarketPrice: meta.regularMarketPrice,
              regularMarketChange: meta.regularMarketPrice - meta.chartPreviousClose,
              regularMarketChangePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
              regularMarketPreviousClose: meta.chartPreviousClose,
              marketCap: null, fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || null, fiftyTwoWeekLow: meta.fiftyTwoWeekLow || null,
              fiftyDayAverage: null, twoHundredDayAverage: null, dividendYield: null, priceToBook: null, sector: null,
            };
          }
        } catch(e) {
          // silently fail for individual stock if it's delisted
        }
      };

      await Promise.all(symbols.map((sym: string) => fetchV8(sym, `${sym.toUpperCase()}.NS`)));
      return NextResponse.json({ success: true, data: enriched, _fallback: true });
    }

    const enriched: Record<string, any> = {};
    quotes.forEach((q: any) => {
      const sym = q.symbol?.replace('.NS', '');
      enriched[sym] = {
        beta: q.beta ?? null,
        pe: q.trailingPE ?? null,
        fwdPe: q.forwardPE ?? null,
        eps: q.epsTrailingTwelveMonths ?? null,
        regularMarketPrice: q.regularMarketPrice ?? null,
        regularMarketChange: q.regularMarketChange ?? null,
        regularMarketChangePercent: q.regularMarketChangePercent ?? null,
        regularMarketPreviousClose: q.regularMarketPreviousClose ?? null,
        marketCap: q.marketCap ?? null,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
        fiftyDayAverage: q.fiftyDayAverage ?? null,
        twoHundredDayAverage: q.twoHundredDayAverage ?? null,
        dividendYield: q.dividendYield ?? null,
        priceToBook: q.priceToBook ?? null,
        sector: q.sector ?? null,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    console.error('[portfolio-batch] Master Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
