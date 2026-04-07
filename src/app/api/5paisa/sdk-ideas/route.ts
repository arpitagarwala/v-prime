import { NextRequest, NextResponse } from 'next/server';
const { FivePaisaClient } = require('5paisajs');

export async function POST(req: NextRequest) {
  try {
    const { keys } = await req.json();

    if (!keys || !keys.accessToken) {
      return NextResponse.json({ success: false, error: 'No access token' }, { status: 401 });
    }

    const client = new FivePaisaClient(keys);
    await client.set_access_token(keys.accessToken);

    // Fetch Buy Ideas and Trade Ideas (Research)
    try {
      const buyIdeasDf = await client.ideas_buy();
      const tradeIdeasDf = await client.ideas_trade();

      // Convert pandas-style objects to standard arrays if needed
      // The 5paisajs SDK uses node-pandas which provides a .to_json() or we can access the underlying data
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
