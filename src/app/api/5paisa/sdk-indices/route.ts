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

    // Indices Scrip Codes for 5paisa: 
    // 999920000 (Nifty 50 Index), 999901000 (Sensex Index)
    const reqList = [
      { Exch: 'N', ExchType: 'C', ScripCode: '999920000' }, 
      { Exch: 'B', ExchType: 'C', ScripCode: '999901000' }
    ];

    try {
      const feed = await client.getMarketFeed(reqList);
      return NextResponse.json({ 
        success: true, 
        data: feed 
      });
    } catch (apiErr: any) {
      console.error('Indices Feed Error:', apiErr);
      return NextResponse.json({ success: false, error: 'Failed to fetch indices' });
    }

  } catch (error: any) {
    console.error('Indices API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
