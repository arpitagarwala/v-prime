export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { call5paisa } from '@/lib/5paisa';

export async function POST(req: Request) {
  try {
    const { keys } = await req.json();

    if (!keys?.accessToken || !keys?.userKey) {
      return NextResponse.json({ error: 'Missing credentials', code: 'NO_CREDENTIALS' }, { status: 401 });
    }

    // SDK: MARGIN_ROUTE = V4/Margin, MARGIN_REQUEST_CODE = '5PMarginV3'
    const data = await call5paisa(
      'V4', 'Margin', '5PMarginV3',
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
      console.error('[margin] 5paisa error:', data.head.statusDescription);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[margin] Proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

