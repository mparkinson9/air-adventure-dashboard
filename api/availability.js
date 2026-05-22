export default async function handler(req, res) {
  const REZDY_KEY = process.env.REZDY_API_KEY;
  const BASE = 'https://api.rezdy.com/v1';

  const TOURS = {
    'PZD1AV':  'Cape York & The Gulf',
    'PPGYFF':  'Lake Eyre in Flood (ex Adelaide)',
    'PRJ91F':  'Lake Eyre in Flood (ex Melbourne)',
    'PQKTAT':  'Western Wedge Wildflower Safari',
    'PPQE8C':  'Best of Bass Strait',
    'PAGRS3':  'Southern Ocean Island Hop',
    'PVK0WM':  'Ediacaran Expedition',
    'PTD5DT':  'Wet Season Spectacular',
    'PAXC50':  'Great Southern Edge',
  };

  try {
    const results = await Promise.all(
      Object.entries(TOURS).map(async ([code, name]) => {
        try {
          // Try sessions endpoint with no date filter first
          const url = `${BASE}/products/${code}/sessions?apiKey=${REZDY_KEY}&limit=50`;
          const sessRes = await fetch(url);
          const sessData = sessRes.ok ? await sessRes.json() : {};
          
          return {
            productCode: code,
            name,
            sessKeys: Object.keys(sessData),
            sessCount: (sessData.sessions || []).length,
            firstSession: (sessData.sessions || [])[0] || null,
            rawSample: JSON.stringify(sessData).slice(0, 200),
          };
        } catch(e) {
          return { productCode: code, name, error: e.message };
        }
      })
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ results, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
