import { NextResponse } from 'next/server';

export const revalidate = 5; // Vercel Edge caching prevents rate limit bans on free APIs

// Memory cache to prevent repetitive cookie throttling by NSE servers
let cachedCookies = '';
let cookieTimestamp = 0;

async function getNSECookies() {
    // Return cached cookies if they are less than 5 minutes old
    if (cachedCookies && (Date.now() - cookieTimestamp < 300000)) {
        return cachedCookies;
    }
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
    };
    try {
        const response = await fetch('https://www.nseindia.com', { headers });
        cachedCookies = response.headers.get('set-cookie') || '';
        cookieTimestamp = Date.now();
        return cachedCookies;
    } catch (e) {
        return '';
    }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = searchParams.get('index') || 'NIFTY 50'; 

  try {
    const cookies = await getNSECookies();

    // Map common human-readable names to explicit strict NSE parameter names
    const indexMapper: Record<string, string> = {
        'NIFTY 50': 'NIFTY%2050',
        'NIFTY BANK': 'NIFTY%20BANK',
        'NIFTY IT': 'NIFTY%20IT',
        'NIFTY AUTO': 'NIFTY%20AUTO',
        'NIFTY METAL': 'NIFTY%20METAL',
    };

    const targetIndex = indexMapper[index] || 'NIFTY%2050';

    const res = await fetch(`https://www.nseindia.com/api/equity-stockIndices?index=${targetIndex}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Cookie': cookies,
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      },
      next: { revalidate: 3 }
    });

    if (!res.ok) {
        throw new Error(`NSE Tunnel Failed with status: ${res.status}`);
    }

    const rawData = await res.json();
    
    // Normalize and clean the payload to prevent frontend parsing crashes
    // data[0] is strictly the 'INDEX' aggregate metric itself, real components start at data.slice(1)
    const constituents = Array.isArray(rawData.data) ? rawData.data.slice(1).map((item: any) => ({
      symbol: item.symbol,
      ltp: item.lastPrice,
      change: item.change,
      pChange: item.pChange,
      open: item.open,
      dayHigh: item.dayHigh,
      dayLow: item.dayLow,
      vol: item.totalTradedVolume || item.previousClose,
    })) : [];

    return NextResponse.json({ success: true, data: constituents });

  } catch (error: any) {
    console.error('[NSE Index Proxy] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
