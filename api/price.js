export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/KC%3DF?interval=1m&range=1d&_=${Date.now()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Yahoo Finance retornou erro', status: response.status });
    }

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) {
      return res.status(502).json({ error: 'Resposta do Yahoo sem dados de mercado' });
    }

    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).json({
      price: meta.regularMarketPrice,
      prev: meta.chartPreviousClose || meta.previousClose,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
