const REZDY_KEY = process.env.REZDY_API_KEY;
const BASE = 'https://api.rezdy.com/v1';

const ALLOWED_CODES = [
  'CYGPZD1AV',
  'LEIFPPGYFF',
  'LEIFPRJ91F',
  'WWPQKTAT',
  'BOBSPPQE8C',
  'SOIHPAGRS3',
  'EEPVK0WM',
  'WSS1PTD5DT',
  'GSEPAXC50',
];

const FALLBACK_NAMES = {
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

    // Log raw keys from first product to debug structure
    const rawProducts = prodData.products || prodData.data || [];
    const firstProduct = rawProducts[0] || {};
    console.log('First product keys:', Object.keys(firstProduct));
    console.log('First product sample:', JSON.stringify(firstProduct).slice(0, 300));

    // Filter to our nine tours — check multiple possible code field names
    const products = rawProducts.filter(p => {
      const code = p.productCode || p.code || p.id || '';
      return ALLOWED_CODES.includes(code);
    });

    const now = new Date();
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const start = now.toISOString().slice(0, 10) + ' 00:00:00';
    const end = future.toISOString().slice(0, 10) + ' 00:00:00';

    const results = await Promise.all(
      products.map(async (p) => {
        const code = p.productCode || p.code || p.id || '';
        const name = p.name || p.productName || p.title || FALLBACK_NAMES[code] || code;
        const price = p.advertisedPrice || p.price || null;

        try {
          const avUrl = `${BASE}/availability?apiKey=${REZDY_KEY}&productCode=${code}&startTimeLocal=${encodeURIComponent(start)}&endTimeLocal=${encodeURIComponent(end)}&limit=50`;
          const avRes = await fetch(avUrl);
          const avData = avRes.ok ? await avRes.json() : {};
          const sessions = (avData.availability || avData.sessions || []).map((s) => ({
            startTimeLocal: s.startTimeLocal || s.startTime || s.date || '',
            seatsAvailable: s.seatsAvailable ?? s.seats ?? 0,
            totalCapacity: s.totalCapacity || s.capacity || null,
          }));

          return { productCode: code, name, advertisedPrice: price, sessions };
        } catch {
          return { productCode: code, name, advertisedPrice: price, sessions: [] };
        }
      })
    );

    // If filter returned nothing, return raw debug info
    if (results.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          products: [],
          debug: {
            totalRawProducts: rawProducts.length,
            firstProductKeys: Object.keys(firstProduct),
            firstFewCodes: rawProducts.slice(0, 5).map(p => p.productCode || p.code || p.id || 'NO_CODE_FOUND'),
          },
          fetchedAt: new Date().toISOString(),
        }),
      };
    }

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
