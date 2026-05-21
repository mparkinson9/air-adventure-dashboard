const REZDY_KEY = process.env.REZDY_API_KEY;
const BASE = 'https://api.rezdy.com/v1';

exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const prodRes = await fetch(`${BASE}/products?apiKey=${REZDY_KEY}&limit=100&offset=0`);
    if (!prodRes.ok) throw new Error(`Products fetch failed: ${prodRes.status}`);
    const prodData = await prodRes.json();
    const rawProducts = prodData.products || [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalProducts: rawProducts.length,
        firstFive: rawProducts.slice(0, 5).map(p => ({
          keys: Object.keys(p),
          productCode: p.productCode,
          name: p.name,
        })),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
