export default async function handler(req, res) {
  const REZDY_KEY = process.env.REZDY_API_KEY;
  const BASE = 'https://api.rezdy.com/v1';

  const CODES = [
    'CYGPZD1AV','LEIFPPGYFF','LEIFPRJ91F','WWPQKTAT',
    'BOBSPPQE8C','SOIHPAGRS3','EEPVK0WM','WSS1PTD5DT','GSEPAXC50'
  ];

  try {
    const start = '2026-01-01 00:00:00';
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const end = future.toISOString().slice(0,10) + ' 00:00:00';

    const results = await Promise.all(CODES.map(async (code) => {
      // Try multiple endpoint formats
      const [av1, av2, sess] = await Promise.all([
        fetch(`${BASE}/availability?apiKey=${REZDY_KEY}&productCode=${code}&startTimeLocal=${encodeURIComponent(start)}&endTimeLocal=${encodeURIComponent(end)}&limit=50`).then(r => r.json()).catch(() => ({})),
        fetch(`${BASE}/availability?apiKey=${REZDY_KEY}&productCode=${code}&startTime=${encodeURIComponent(start)}&endTime=${encodeURIComponent(end)}&limit=50`).then(r => r.json()).catch(() => ({})),
        fetch(`${BASE}/products/${code}/sessions?apiKey=${REZDY_KEY}&limit=50`).then(r => r.json()).catch(() => ({})),
      ]);

      return {
        code,
        av1Keys: Object.keys(av1),
        av1Count: (av1.availability || []).length,
        av2Count: (av2.availability || []).length,
        sessCount: (sess.sessions || []).length,
        sessKeys: Object.keys(sess),
        firstSess: (sess.sessions || [])[0] || null,
      };
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ results, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
