import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const { FivePaisaClient } = require('5paisajs');

export async function POST(req: NextRequest) {
  try {
    const { keys } = await req.json();

    if (!keys || !keys.accessToken) {
      return NextResponse.json({ success: false, error: 'No access token' }, { status: 401 });
    }

    const client = new FivePaisaClient(keys);
    await client.set_access_token(keys.accessToken);

    // Simple 3000ms timeout wrapper to intercept unhandled promise hangs in 5paisajs
    const withTimeout = (promise: Promise<any>, ms: number) => {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<any>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('5Paisa API Timeout')), ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
    };

    try {
      const buyIdeasDf = await withTimeout(client.ideas_buy(), 3000).catch(() => []);
      const tradeIdeasDf = await withTimeout(client.ideas_trade(), 3000).catch(() => []);

      // Convert pandas-style objects to standard arrays if needed
      const buyNews = Array.isArray(buyIdeasDf) ? buyIdeasDf : [];
      const tradeNews = Array.isArray(tradeIdeasDf) ? tradeIdeasDf : [];

      return NextResponse.json({ 
        success: true, 
        data: [...buyNews, ...tradeNews] 
      });
    } catch (apiErr: any) {
      // In some cases, if no ideas are available, it might reject. Return empty array instead of error.
      return NextResponse.json({ success: true, data: [] });
    }

  } catch (error: any) {
    console.error('Ideas API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
