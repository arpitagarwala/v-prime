import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { call5paisa } from '@/lib/5paisa';

export async function POST(req: Request) {
  try {
    const { keys } = await req.json();

    if (!keys?.accessToken || !keys?.userKey) {
      return NextResponse.json({ error: 'Missing credentials', code: 'NO_CREDENTIALS' }, { status: 401 });
    }

    // CRITICAL FIX: The server returned responseCode '5PMarginV4'. If we send '5PMarginV3',
    // it rejects with "Invalid head parameters". The requestCode must match the endpoint version.
    const data = await call5paisa(
      'V4', 'Margin', '5PMarginV4',
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
      return NextResponse.json({ error: data.head.statusDescription, success: false });
    }

    return NextResponse.json({ success: true, data: data?.body?.EquityMargin || [] });
  } catch (error: any) {
    console.error('[margin] Proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

