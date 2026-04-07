import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ success: false, error: 'No symbol provided' }, { status: 400 });
  }

  try {
    const ticker = `${symbol.toUpperCase()}.NS`;
    
    // First try the deep institutional payload (which has aggressive rate limits)
    try {
      const data = await yahooFinance.quoteSummary(ticker, {
        modules: ['price', 'summaryDetail', 'financialData', 'recommendationTrend', 'defaultKeyStatistics', 'assetProfile', 'majorHoldersBreakdown', 'calendarEvents']
      }) as any;

      const unwrap = (val: any) => (val && typeof val === 'object' && val.raw !== undefined) ? val.raw : val;

      const payload = {
        price: {
          current: unwrap(data.price?.regularMarketPrice),
          change: unwrap(data.price?.regularMarketChange),
          changePct: (() => {
            const val = unwrap(data.price?.regularMarketChangePercent);
            // Yahoo sometimes returns decimal (0.001) instead of percentage (0.1). 
            // If the value is very small relative to the nominal price change, we normalize.
            if (val != null && Math.abs(val) < 0.1 && unwrap(data.price?.regularMarketChange) !== 0) {
              return val * 100;
            }
            return val;
          })(),
          high52: unwrap(data.summaryDetail?.fiftyTwoWeekHigh),
          low52: unwrap(data.summaryDetail?.fiftyTwoWeekLow),
          marketCap: unwrap(data.price?.marketCap),
          vol: unwrap(data.summaryDetail?.volume),
        },
        technicals: {
          sma50: unwrap(data.summaryDetail?.fiftyDayAverage),
          sma200: unwrap(data.summaryDetail?.twoHundredDayAverage),
          beta: unwrap(data.defaultKeyStatistics?.beta),
        },
        financials: {
          pe: unwrap(data.summaryDetail?.trailingPE),
          fwdPe: unwrap(data.summaryDetail?.forwardPE),
          eps: unwrap(data.defaultKeyStatistics?.trailingEps),
          priceToBook: unwrap(data.defaultKeyStatistics?.priceToBook),
          revenue: unwrap(data.financialData?.totalRevenue),
          margins: unwrap(data.financialData?.profitMargins),
          roe: unwrap(data.financialData?.returnOnEquity),
          debtToEquity: unwrap(data.financialData?.debtToEquity),
          cash: unwrap(data.financialData?.totalCash),
          dividendYield: unwrap(data.summaryDetail?.dividendYield),
          sector: data.summaryProfile?.sector,
        },
        analyst: {
          target: unwrap(data.financialData?.targetMeanPrice),
          lowTarget: unwrap(data.financialData?.targetLowPrice),
          highTarget: unwrap(data.financialData?.targetHighPrice),
          recommendation: data.financialData?.recommendationKey,
          numAnalysts: unwrap(data.financialData?.numberOfAnalystOpinions),
        },
        profile: {
          industry: data.assetProfile?.industry,
          sector: data.assetProfile?.sector,
          employees: data.assetProfile?.fullTimeEmployees,
          website: data.assetProfile?.website,
          summary: data.assetProfile?.longBusinessSummary,
        },
        ownership: {
          insiders: unwrap(data.majorHoldersBreakdown?.insidersPercentHeld),
          institutions: unwrap(data.majorHoldersBreakdown?.institutionsPercentHeld),
        },
        events: {
          exDividendDate: unwrap(data.calendarEvents?.exDividendDate),
          earningsDate: unwrap(data.calendarEvents?.earnings?.earningsDate?.[0]),
        }
      };
      return NextResponse.json({ success: true, data: payload });
      
    } catch (deepError: any) {
      console.log('[Deep Dive] SDK limit hit. Attempting manual V10 proxy fetch...');
      
      try {
        // Attempt manual crumb bypass
        const { getYahooCrumb } = require('@/lib/yahooCrumb');
        const { cookie, crumb } = await getYahooCrumb();
        
        if (crumb) {
          const v10Res = await fetch(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,summaryDetail,financialData,recommendationTrend,defaultKeyStatistics,assetProfile,majorHoldersBreakdown,calendarEvents&crumb=${crumb}`, {
              headers: { cookie, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          
          if (v10Res.ok) {
            const v10Data = await v10Res.json();
            const resultData = v10Data.quoteSummary.result[0];

            const unwrap = (val: any) => (val && typeof val === 'object' && val.raw !== undefined) ? val.raw : val;

            const payload = {
              price: {
                current: unwrap(resultData.price?.regularMarketPrice),
                change: unwrap(resultData.price?.regularMarketChange),
                changePct: unwrap(resultData.price?.regularMarketChangePercent),
                high52: unwrap(resultData.summaryDetail?.fiftyTwoWeekHigh),
                low52: unwrap(resultData.summaryDetail?.fiftyTwoWeekLow),
                marketCap: unwrap(resultData.price?.marketCap),
                vol: unwrap(resultData.summaryDetail?.volume),
              },
              technicals: {
                sma50: unwrap(resultData.summaryDetail?.fiftyDayAverage),
                sma200: unwrap(resultData.summaryDetail?.twoHundredDayAverage),
                beta: unwrap(resultData.defaultKeyStatistics?.beta),
              },
              financials: {
                pe: unwrap(resultData.summaryDetail?.trailingPE),
                fwdPe: unwrap(resultData.summaryDetail?.forwardPE),
                eps: unwrap(resultData.defaultKeyStatistics?.trailingEps),
                priceToBook: unwrap(resultData.defaultKeyStatistics?.priceToBook),
                revenue: unwrap(resultData.financialData?.totalRevenue),
                margins: unwrap(resultData.financialData?.profitMargins),
                roe: unwrap(resultData.financialData?.returnOnEquity),
                debtToEquity: unwrap(resultData.financialData?.debtToEquity),
                cash: unwrap(resultData.financialData?.totalCash),
                dividendYield: unwrap(resultData.summaryDetail?.dividendYield),
                sector: resultData.summaryProfile?.sector,
              },
              analyst: {
                target: unwrap(resultData.financialData?.targetMeanPrice),
                lowTarget: unwrap(resultData.financialData?.targetLowPrice),
                highTarget: unwrap(resultData.financialData?.targetHighPrice),
                recommendation: resultData.financialData?.recommendationKey,
                numAnalysts: unwrap(resultData.financialData?.numberOfAnalystOpinions),
              },
              profile: {
                industry: resultData.assetProfile?.industry,
                sector: resultData.assetProfile?.sector,
                employees: resultData.assetProfile?.fullTimeEmployees,
                website: resultData.assetProfile?.website,
                summary: resultData.assetProfile?.longBusinessSummary,
              },
              ownership: {
                insiders: unwrap(resultData.majorHoldersBreakdown?.insidersPercentHeld),
                institutions: unwrap(resultData.majorHoldersBreakdown?.institutionsPercentHeld),
              },
              events: {
                exDividendDate: unwrap(resultData.calendarEvents?.exDividendDate),
                earningsDate: unwrap(resultData.calendarEvents?.earnings?.earningsDate?.[0]),
              }
            };
            return NextResponse.json({ success: true, data: payload, _fallback: 'v10_manual' });
          }
        }
        
        // If Manual V10 fails, fall back to pure anonymous V8
        console.log('[Deep Dive] Manual V10 failed. Yielding to pure V8 chart anonymous map.');
        const v8Res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, cache: 'no-store'
        });
        const v8Data = await v8Res.json();
        const meta = v8Data.chart?.result?.[0]?.meta;
        if (!meta) throw new Error('V8 Fallback Data Missing');

        return NextResponse.json({ 
          success: true, 
          data: {
            price: { 
                current: meta.regularMarketPrice, 
                change: meta.regularMarketPrice - meta.chartPreviousClose, 
                changePct: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100, 
                high52: meta.fiftyTwoWeekHigh || null, 
                low52: meta.fiftyTwoWeekLow || null, 
                marketCap: null, 
                vol: meta.regularMarketVolume 
            },
            technicals: { sma50: null, sma200: null, beta: null },
            financials: { pe: null, fwdPe: null, eps: null, priceToBook: null, dividendYield: null },
            analyst: { recommendation: 'hold' }
          }, 
          _fallback: 'v8_pure' 
        });
      } catch (fbError: any) {
        throw deepError; 
      }
    }
  } catch (error: any) {
    console.error('Yahoo Deep Dive Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
