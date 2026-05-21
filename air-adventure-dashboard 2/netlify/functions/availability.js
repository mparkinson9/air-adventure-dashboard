exports.handler = async function(event, context) {
  const REZDY_KEY = process.env.REZDY_API_KEY;
  const BASE = 'https://api.rezdy.com/v1';

  try {
    const prodRes = await fetch(`${BASE}/products?apiKey=${REZDY_KEY}&limit=100&offset=0`);
    const prodData = await prodRes.json();
    const rawProducts = prodData.products || [];

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalProducts: rawProducts.length,
        firstFewCodes: rawProducts.slice(0, 10).map(p => ({
          productCode: p.productCode,
          name: p.name,
        })),
        fetchedAt: new Date().toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
