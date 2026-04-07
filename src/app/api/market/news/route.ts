import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Strategy: First try Yahoo Search (Traditional), then fall back to Google News RSS (Bulletproof)
    const ySearchUrl = 'https://query2.finance.yahoo.com/v1/finance/search?q=NIFTY+50&newsCount=8';
    const rssUrl = 'https://news.google.com/rss/search?q=Indian+Stock+Market+News&hl=en-IN&gl=IN&ceid=IN:en';

    try {
      const yRes = await fetch(ySearchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } });
      const yData = await yRes.json();
      
      if (yData.news && yData.news.length > 0) {
        const data = yData.news.map((n: any) => ({
          title: n.title,
          link: n.link,
          publisher: n.publisher || 'Finance News',
          time: new Date(n.providerPublishTime * 1000).toISOString()
        }));
        return NextResponse.json({ success: true, data });
      }
    } catch (e) {
      console.log('[News API] Yahoo fail, falling back...');
    }

    // High Reliability RSS Fallback
    const rssRes = await fetch(rssUrl, { next: { revalidate: 300 } });
    const rssText = await rssRes.text();

    // Primitive but robust XML parser for RSS titles and links
    const items = [];
    const itemMatches = rssText.matchAll(/<item>([\s\S]*?)<\/item>/g);
    
    for (const match of itemMatches) {
        const content = match[1];
        const title = content.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
        const link = content.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        
        if (title && link) {
            items.push({
                title: title.replace(' - ', ' | '),
                link: link,
                publisher: title.split(' - ').pop() || 'Market News',
                time: new Date(pubDate).toISOString()
            });
        }
        if (items.length >= 8) break;
    }

    return NextResponse.json({ success: true, data: items, _fallback: 'rss' });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
