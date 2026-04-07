export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// Temporary debug endpoint - reveals exactly what 5paisa sends back
export async function POST(req: Request) {
  try {
    const { endpoint, action, payload, keys } = await req.json();

    const requestBody = {
      head: { key: keys.userKey },
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
    
    // Log everything
    console.log(`\n===== 5paisa DEBUG [${endpoint}/${action}] =====`);
    console.log('Status:', response.status);
    console.log('Response:', text.substring(0, 2000));
    console.log('================================================\n');

    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = null; }

    return NextResponse.json({
      httpStatus: response.status,
      rawText: text.substring(0, 3000),
      parsed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

