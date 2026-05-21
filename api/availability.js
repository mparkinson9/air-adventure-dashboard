export default async function handler(req, res) {
  const REZDY_KEY = process.env.REZDY_API_KEY;
  const BASE = 'https://api.rezdy.com/v1';

  try {
    // Fetch all products
    const prodRes = await fetch(`${BASE}/products?apiKey=${REZDY_KEY}&limit=100&offset=0`);
    const prodData = await prodRes.json();
    const allProducts = prodData.products || [];

    // Filter to outback only — exclude anything with (Golf) in the name
    const outbackProducts = allProducts.filter(p => {
      const name = (p.name || '').toLowerCase();
      return !name.includes('golf') && !name.includes('gift card') && p.productCode;
    });

    const cutoff = new Date('2026-01-01T00:00:00');
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const start = '2026-01-01T00:00:00';
    const end = future.toISOString().slice(0,10) + 'T00:00:00';

    const results = await Promise.all(
      outbackProducts.map(async (p) => {
        try {
          const url = `${BASE}/products/${p.productCode}/sessions?apiKey=${REZDY_KEY}&startTime=${encodeURIComponent(start)}&endTime=${encodeURIComponent(end)}&limit=50`;
          const sessRes = await fetch(url);
          const sessData = sessRes.ok ? await sessRes.json() : {};
          const sessions = (sessData.sessions || [])
            .filter(s => {
              const d = new Date(s.startTimeLocal || s.startTime || '');
              return d >= cutoff;
            })
            .map(s => {
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
          return {
            productCode: p.productCode,
            name: p.name,
            advertisedPrice: p.advertisedPrice || null,
            sessions,
          };
        } catch {
          return {
            productCode: p.productCode,
            name: p.name,
            advertisedPrice: p.advertisedPrice || null,
            sessions: [],
          };
        }
      })
    );

    // Only return products that have at least one session
    const filtered = results.filter(p => p.sessions.length > 0);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ products: filtered, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
