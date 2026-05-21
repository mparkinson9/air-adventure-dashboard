const REZDY_KEY = process.env.REZDY_API_KEY;
const BASE = 'https://api.rezdy.com/v1';

const ALLOWED_PRODUCTS = [
  'CYGPZD1AV',    // Cape York and The Gulf
  'LEIFPPGYFF',   // Lake Eyre in Flood ex Adelaide
  'LEIFPRJ91F',   // Lake Eyre in Flood ex Melbourne
  'WWPQKTAT',     // Western Wedge Wildflower Safari
  'BOBSPPQE8C',   // Best of Bass Strait
  'SOIHPAGRS3',   // Southern Ocean Island Hop
  'EEPVK0WM',     // Ediacaran Expedition
  'WSS1PTD5DT',   // Wet Season Spectacular
  'GSEPAXC50',    // Great Southern Edge
];

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
    const allProducts = prodData.products || [];
    const products = allProducts.filter(p => ALLOWED_PRODUCTS.includes(p.productCode));

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
