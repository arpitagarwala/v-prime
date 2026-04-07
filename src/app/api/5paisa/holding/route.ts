export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { call5paisa } from '@/lib/5paisa';

export async function POST(req: Request) {
  try {
    const { keys } = await req.json();

    if (!keys?.accessToken || !keys?.userKey) {
      return NextResponse.json({ error: 'Missing credentials', code: 'NO_CREDENTIALS' }, { status: 401 });
    }

    // SDK: HOLDINGS_ROUTE = V3/Holding, HOLDINGS_REQUEST_CODE = '5PHoldingV2'
    // Full genericPayload head is required alongside Bearer token
    const data = await call5paisa(
      'V3', 'Holding', '5PHoldingV2',
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
      console.error('[holding] 5paisa error:', data.head.statusDescription);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[holding] Proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

