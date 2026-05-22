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
    const start = '2026-01-01 00:00:00';
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const end = future.toISOString().slice(0,10) + ' 00:00:00';

    const results = await Promise.all(
      Object.entries(TOURS).map(async ([code, name]) => {
        try {
          const url = `${BASE}/availability?apiKey=${REZDY_KEY}&productCode=${code}&startTimeLocal=${encodeURIComponent(start)}&endTimeLocal=${encodeURIComponent(end)}&limit=50`;
          const avRes = await fetch(url);
          const avData = avRes.ok ? await avRes.json() : {};
          const sessions = (avData.availability || []).map(s => {
            const total = s.totalCapacity ?? null;
            const available = s.seatsAvailable ?? 0;
            const booked = total !== null ? total - available : null;
            return {
              startTimeLocal: s.startTimeLocal,
              endTimeLocal: s.endTimeLocal,
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
