export default async function handler(req, res) {
  const REZDY_KEY = process.env.REZDY_API_KEY;
  const BASE = 'https://api.rezdy.com/v1';

  const TOURS = {
    'CYGPZD1AV':  'Cape York & The Gulf',
    'LEIFPPGYFF': 'Lake Eyre in Flood (ex Adelaide)',
    'LEIFPRJ91F': 'Lake Eyre in Flood (ex Melbourne)',
    'WWPQKTAT':   'Western Wedge Wildflower Safari',
    'BOBSPPQE8C': 'Best of Bass Strait',
    'SOIHPAGRS3': 'Southern Ocean Island Hop',
    'EEPVK0WM':   'Ediacaran Expedition',
    'WSS1PTD5DT': 'Wet Season Spectacular',
    'GSEPAXC50':  'Great Southern Edge',
  };

  try {
    const start = '2026-01-01T00:00:00';
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const end = future.toISOString().slice(0,10) + 'T00:00:00';

    const results = await Promise.all(
      Object.entries(TOURS).map(async ([code, name]) => {
        try {
          const url = `${BASE}/products/${code}/sessions?apiKey=${REZDY_KEY}&startTime=${encodeURIComponent(start)}&endTime=${encodeURIComponent(end)}&limit=50`;
          const sessRes = await fetch(url);
          const sessData = sessRes.ok ? await sessRes.json() : {};
          const sessions = (sessData.sessions || []).map(s => {
            const total = s.totalCapacity ?? null;
            const available = s.seatsAvailable ?? 0;
            const booked = total !== null ? total - available : null;
            return {
              startTimeLocal: s.startTimeLocal || s.startTime,
              seatsAvailable: available,
              seatsBooked: booked,
              totalCapacity: total,
            };
          });
          return { productCode: code, name, sessions };
        } catch {
          return { productCode: code, name, sessions: [] };
        }
      })
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ products: results, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
