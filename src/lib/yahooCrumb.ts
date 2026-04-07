let cachedCookie = '';
let cachedCrumb = '';

export async function getYahooCrumb(): Promise<{ cookie: string, crumb: string }> {
    if (cachedCrumb && cachedCookie) {
        return { cookie: cachedCookie, crumb: cachedCrumb };
    }
    try {
        const r1 = await fetch('https://fc.yahoo.com', { redirect: 'manual' });
        const cookie = r1.headers.get('set-cookie');
        
        if (!cookie) throw new Error('Failed to get cookie from Yahoo');
        
        const r2 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
            headers: { 
                cookie, 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const crumb = await r2.text();
        
        cachedCookie = cookie;
        cachedCrumb = crumb;
        
        return { cookie, crumb };
    } catch(e) {
        console.error('Failed to get Yahoo manual crumb:', e);
        return { cookie: '', crumb: '' };
    }
}
