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
    // Fetch bookings from Jan 2026 to Jan 2028
    const url = `${BASE}/orders?apiKey=${REZDY_KEY}&startTimeLocal=${encodeURIComponent('2026-01-01 00:00:00')}&endTimeLocal=${encodeURIComponent('2028-01-01 00:00:00')}&limit=100&offset=0`;
    const ordersRes = await fetch(url);
    const ordersData = ordersRes.ok ? await ordersRes.json() : {};

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      orderKeys: Object.keys(ordersData),
      orderCount: (ordersData.orders || []).length,
      firstOrder: (ordersData.orders || [])[0] || null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
