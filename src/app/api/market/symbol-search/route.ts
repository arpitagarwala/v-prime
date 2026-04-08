import { NextResponse } from 'next/server';

export const revalidate = 60; // Edge Cache for 60 seconds against identical queries

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=15&newsCount=0`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      throw new Error(`Yahoo Search Engine Failed: ${res.status}`);
    }

    const rawData = await res.json();
    const quotes = rawData.quotes || [];

    // Filter strictly for Indian Equities (NSE and BSE) and map them intelligently
    const results = quotes
      .filter((q: any) => q.exchDisp === 'NSE' || q.exchDisp === 'BSE')
      .map((q: any) => ({
        symbol: q.symbol.replace(/\.NS$/, '').replace(/\.BO$/, ''),
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp,
        type: q.quoteType || 'EQUITY'
      }));

    // Deduplicate cross-listed symbols (e.g., RELIANCE listed on both NSE and BSE)
    // We prioritize NSE if both exist.
    const uniqueMap = new Map();
    for (const item of results) {
      if (!uniqueMap.has(item.symbol) || uniqueMap.get(item.symbol).exchange !== 'NSE') {
        uniqueMap.set(item.symbol, item);
      }
    }

    const uniqueResults = Array.from(uniqueMap.values());

    return NextResponse.json({ success: true, data: uniqueResults });

  } catch (error: any) {
    console.error('[Search Proxy] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
