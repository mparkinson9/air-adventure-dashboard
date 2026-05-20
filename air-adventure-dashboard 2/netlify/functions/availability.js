const REZDY_KEY = process.env.REZDY_API_KEY;
const BASE = 'https://api.rezdy.com/v1';

exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Fetch all products
    const prodRes = await fetch(`${BASE}/products?apiKey=${REZDY_KEY}&limit=100&offset=0`);
    if (!prodRes.ok) throw new Error(`Products fetch failed: ${prodRes.status}`);
    const prodData = await prodRes.json();
    const products = prodData.products || [];

    // Date range: today → 12 months out
    const now = new Date();
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const start = now.toISOString().slice(0, 10) + ' 00:00:00';
    const end = future.toISOString().slice(0, 10) + ' 00:00:00';

    // Fetch availability for each product
    const results = await Promise.all(
      products.map(async (p) => {
        try {
          const url = `${BASE}/availability?apiKey=${REZDY_KEY}&productCode=${p.productCode}&startTimeLocal=${encodeURIComponent(start)}&endTimeLocal=${encodeURIComponent(end)}&limit=50`;
          const avRes = await fetch(url);
          const avData = avRes.ok ? await avRes.json() : {};
          return {
            productCode: p.productCode,
            name: p.name,
            advertisedPrice: p.advertisedPrice || null,
            durationLabel: p.durationLabel || null,
            sessions: (avData.availability || []).map((s) => ({
              startTimeLocal: s.startTimeLocal,
              seatsAvailable: s.seatsAvailable ?? 0,
              totalCapacity: s.totalCapacity ?? null,
            })),
          };
        } catch {
          return {
            productCode: p.productCode,
            name: p.name,
            advertisedPrice: p.advertisedPrice || null,
            durationLabel: p.durationLabel || null,
            sessions: [],
          };
        }
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ products: results, fetchedAt: new Date().toISOString() }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
