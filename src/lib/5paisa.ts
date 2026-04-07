/**
 * 5paisa API proxy — exact replica of the official 5paisajs SDK request format.
 *
 * Key findings from SDK source (index.js lines 318-336, const.js):
 * 1. Authorization: 'Bearer {token}'  ← capital B (NOT lowercase 'bearer')
 * 2. Head requires all 7 fields: appName, appVer, key, osName, requestCode, userId, password
 * 3. '5Paisa-API-Uid' header is set globally in the axios instance
 * 4. The full genericPayload is sent even with OAuth tokens
 */
export async function call5paisa(
  endpoint: string,
  action: string,
  requestCode: string, 
  body: Record<string, unknown>,
  keys: {
    userKey: string;
    appName: string;
    userId: string;
    password: string;
    accessToken: string;
    [key: string]: any;
  }
) {
  // CRITICAL FIX from Xstream AI: 
  // 1. Send ONLY 'Key' in head (Capital K is mandatory!).
  // 2. Remove all legacy fields like appName, appVer, requestCode, userId, password.
  const requestBody = {
    head: {
      Key: keys.userKey, // ONLY required field, strictly capital 'Key'
    },
    body,
  };

  const url = `https://Openapi.5paisa.com/VendorsAPI/Service1.svc/${endpoint}/${action}`;

  console.log(`[5paisa] → POST ${url}`);
  console.log(`[5paisa] head:`, JSON.stringify(requestBody.head));
  console.log(`[5paisa] body:`, JSON.stringify(requestBody.body));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${keys.accessToken}`, // ← Capital B, exactly as SDK does it
    },
    body: JSON.stringify(requestBody),
  });

  const text = await res.text();
  console.log(`[5paisa] ← status=${res.status}`, text.substring(0, 600));

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`5paisa returned non-JSON: ${text.substring(0, 200)}`);
  }
}
