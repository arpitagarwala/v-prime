import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { endpoint, action, reqCode, payload, keys } = await req.json();

    if (!keys?.accessToken || !keys?.userKey) {
      return NextResponse.json({ 
        error: 'No Access Token found. Please complete the 5paisa login flow first.',
        code: 'NO_ACCESS_TOKEN'
      }, { status: 401 });
    }

    // Per official docs: minimal head with just the key, plus Bearer token in header
    const requestBody = {
      head: { 
        key: keys.userKey 
      },
      body: payload || {}
    };

    const url = `https://Openapi.5paisa.com/VendorsAPI/Service1.svc/${endpoint}/${action}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${keys.accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: '5paisa returned non-JSON', raw: text.substring(0, 500) }, { status: 502 });
    }

    if (!response.ok) {
      return NextResponse.json({ error: '5paisa API error', details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('5paisa Proxy error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
