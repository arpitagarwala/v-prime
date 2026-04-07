/**
 * Mapping utility for Indian Stock Sectors
 * Focuses on Top 200 NSE Stocks
 */

export const SECTOR_MAP: Record<string, string> = {
  // Banking & Financials
  'HDFCBANK': 'Banking',
  'HDFC': 'Banking',
  'ICICIBANK': 'Banking',
  'SBIN': 'Banking',
  'KOTAKBANK': 'Banking',
  'AXISBANK': 'Banking',
  'BAJFINANCE': 'Financials',
  'BAJAJFINSV': 'Financials',
  'MUTHOOTFIN': 'Financials',
  'CHOLAFIN': 'Financials',

  // IT & Technology
  'TCS': 'IT Services',
  'INFY': 'IT Services',
  'HCLTECH': 'IT Services',
  'WIPRO': 'IT Services',
  'TECHM': 'IT Services',
  'LTIM': 'IT Services',
  'ZOMATO': 'Internet Tech',
  'NYKAA': 'Internet Tech',
  'PAYTM': 'Fintech',

  // Energy & Oil
  'RELIANCE': 'Energy',
  'ONGC': 'Energy',
  'BPCL': 'Energy',
  'IOC': 'Energy',
  'GAIL': 'Energy',
  'POWERGRID': 'Utilities',
  'NTPC': 'Utilities',
  'ADANIGREEN': 'Renewables',
  'ADANIPOWER': 'Energy',

  // FMCG & Consumer
  'HINDUNILVR': 'FMCG',
  'ITC': 'FMCG',
  'NESTLEIND': 'FMCG',
  'BRITANNIA': 'FMCG',
  'TATACONSUM': 'FMCG',
  'VBL': 'FMCG',
  'TITAN': 'Consumer Durables',
  'ASIANPAINT': 'Consumer Durables',

  // Auto & Manufacturing
  'TATAMOTORS': 'Automobile',
  'MARUTI': 'Automobile',
  'M&M': 'Automobile',
  'EICHERMOT': 'Automobile',
  'BAJAJ-AUTO': 'Automobile',
  'HEROMOTOCO': 'Automobile',
  'ASHOKLEY': 'Automobile',

  // Pharma & Healthcare
  'SUNPHARMA': 'Pharmaceuticals',
  'DRREDDY': 'Pharmaceuticals',
  'CIPLA': 'Pharmaceuticals',
  'DIVISLAB': 'Pharmaceuticals',
  'APOLLOHOSP': 'Healthcare',

  // Materials & Construction
  'ULTRACEMCO': 'Materials',
  'GRASIM': 'Materials',
  'JSWSTEEL': 'Materials',
  'TATASTEEL': 'Materials',
  'HINDALCO': 'Materials',
  'DLF': 'Real Estate',
  'L&T': 'Infrastructure',

  // Metals
  'VEDL': 'Metals',
  'NATIONALUM': 'Metals',
  'HINDZINC': 'Metals',
  'COALINDIA': 'Mining',
};

export function getSector(symbol: string): string {
  const cleanSymbol = symbol.toUpperCase().split('-')[0];
  return SECTOR_MAP[cleanSymbol] || 'Others';
}
