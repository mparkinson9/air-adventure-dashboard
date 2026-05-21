const REZDY_KEY = process.env.REZDY_API_KEY;
const BASE = 'https://api.rezdy.com/v1';

const TOURS = [
  { code: 'CYGPZD1AV',  label: 'Cape York & The Gulf' },
  { code: 'LEIFPPGYFF', label: 'Lake Eyre in Flood (ex Adelaide)' },
  { code: 'LEIFPRJ91F', label: 'Lake Eyre in Flood (ex Melbourne)' },
  { code: 'WWPQKTAT',   label: 'Western Wedge Wildflower Safari' },
  { code: 'BOBSPPQE8C', label: 'Best of Bass Strait' },
  { code: 'SOIHPAGRS3', label: 'Southern Ocean Island Hop' },
  { code: 'EEPVK0WM',   label: 'Ediacaran Expedition' },
  { code: 'WSS1PTD5DT', label: 'Wet Season Spectacular' },
  { code: 'GSEPAXC50',  label: 'Great Southern Edge' },
];

exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const now = new Date();
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const start = now.toISOString().slice(0, 10) + ' 00:00:00';
    const end = future.toISOString().slice(0, 10) + ' 00:00:00';

    // Fetch each tour directly by product code — no filtering needed
    const results = await Promise.all(
      TOURS.map(async (tour) => {
        try {
          // Fetch product details
          const prodRes = await fetch(`${BASE}/products/${tour.code}?apiKey=${REZDY_KEY}`);
          const prodData = prodRes.ok ? await prodRes.json() : {};
          const product = prodData.product || prodData || {};

          // Fetch availability
          const avUrl = `${BASE}/availability?apiKey=${REZDY_KEY}&productCode=${tour.code}&startTimeLocal=${encodeURIComponent(start)}&endTimeLocal=${encodeURIComponent(end)}&limit=50`;
          const avRes = await fetch(avUrl);
          const avData = avRes.ok ? await avRes.json() : {};

          return {
            productCode: tour.code,
            name: product.name || tour.label,
            advertisedPrice: product.advertisedPrice || null,
            sessions: (avData.availability || []).map((s) => ({
              startTimeLocal: s.startTimeLocal,
              seatsAvailable: s.seatsAvailable ?? 0,
              totalCapacity: s.totalCapacity ?? null,
            })),
          };
        } catch {
          return {
            productCode: tour.code,
            name: tour.label,
            advertisedPrice: null,
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
