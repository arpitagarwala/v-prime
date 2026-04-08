import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { call5paisa } from '@/lib/5paisa';

export async function POST(req: Request) {
  try {
    const { keys } = await req.json();

    if (!keys?.accessToken || !keys?.userKey) {
      return NextResponse.json({ error: 'Missing credentials', code: 'NO_CREDENTIALS' }, { status: 401 });
    }

    const data = await call5paisa(
      'V2', 'NetPositionNetWise', '5PNetPositionV1',
      { ClientCode: keys.clientCode || keys.userId },
      {
        userKey: keys.userKey,
        appName: keys.appName || '',
        userId: keys.userId || '',
        password: keys.password || '',
        accessToken: keys.accessToken,
      }
    );

    if (data?.head?.status === '2') {
      console.error('[positions] 5paisa error:', data.head.statusDescription);
      return NextResponse.json({ error: data.head.statusDescription, success: false });
    }

    const posData = data?.body?.NetPositionDetail || data?.body?.Data || [];
    console.log('[positions] Raw payload from 5paisa:', JSON.stringify(posData).substring(0, 500));
    
    // Dump locally to read the shape
    require('fs').writeFileSync('position_debug.json', JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, data: posData });
  } catch (error: any) {
    console.error('[positions] Proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
