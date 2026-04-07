import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { call5paisa } from '@/lib/5paisa';

export async function POST(req: Request) {
  try {
    const { keys } = await req.json();

    if (!keys?.accessToken || !keys?.userKey) {
      return NextResponse.json({ error: 'Missing credentials', code: 'NO_CREDENTIALS' }, { status: 401 });
    }

    // REVERTING TO V3 as per direct email from Karan Gill (5paisa Support)
    const data = await call5paisa(
      'V3', 'Holding', '5PHoldingV3',
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
      return NextResponse.json({ error: data.head.statusDescription, success: false });
    }

    return NextResponse.json({ success: true, data: data?.body?.Data || [] });
  } catch (error: any) {
    console.error('[holding] Proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

