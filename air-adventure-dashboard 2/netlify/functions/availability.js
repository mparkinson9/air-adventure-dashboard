exports.handler = async function(event, context) {
  const REZDY_KEY = process.env.REZDY_API_KEY;
  const BASE = 'https://api.rezdy.com/v1';

  const ALLOWED_CODES = [
    'CYGPZD1AV','LEIFPPGYFF','LEIFPRJ91F','WWPQKTAT',
    'BOBSPPQE8C','SOIHPAGRS3','EEPVK0WM','WSS1PTD5DT','GSEPAXC50',
  ];

  const NAMES = {
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
    const now = new Date();
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const start = now.toISOString().slice(0,10) + ' 00:00:00';
    const end = future.toISOString().slice(0,10) + ' 00:00:00';

    const results = await Promise.all(
      ALLOWED_CODES.map(async (code) => {
        try {
          const avUrl = `${BASE}/availability?apiKey=${REZDY_KEY}&productCode=${code}&startTimeLocal=${encodeURIComponent(start)}&endTimeLocal=${encodeURIComponent(end)}&limit=50`;
          const avRes = await fetch(avUrl);
          const avData = avRes.ok ? await avRes.json() : {};
          const sessions = (avData.availability || []).map(s => ({
            startTimeLocal: s.startTimeLocal,
            seatsAvailable: s.seatsAvailable ?? 0,
            totalCapacity: s.totalCapacity ?? null,
          }));
          return { productCode: code, name: NAMES[code], sessions };
        } catch {
          return { productCode: code, name: NAMES[code], sessions: [] };
        }
      })
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: results, fetchedAt: new Date().toISOString() }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
