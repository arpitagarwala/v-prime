import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { requestToken, userKey, encryptionKey, userId } = await req.json();

    if (!requestToken || !userKey) {
      return NextResponse.json({ error: 'Missing requestToken or userKey' }, { status: 400 });
    }

    const payload = {
      head: { Key: userKey },
      body: {
        RequestToken: requestToken,
        EncryKey: encryptionKey,
        UserId: userId,
      },
    };

    const res = await fetch('https://Openapi.5paisa.com/VendorsAPI/Service1.svc/GetAccessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Bad response from 5paisa', raw: text.substring(0, 300) }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('GetAccessToken proxy error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
