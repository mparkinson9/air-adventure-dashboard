const REZDY_KEY = process.env.REZDY_API_KEY;
const BASE = 'https://api.rezdy.com/v1';

export default async (req, context) => {
  try {
    const prodRes = await fetch(`${BASE}/products?apiKey=${REZDY_KEY}&limit=100&offset=0`);
    const prodData = await prodRes.json();
    const rawProducts = prodData.products || [];

    return new Response(JSON.stringify({
      totalProducts: rawProducts.length,
      firstFewCodes: rawProducts.slice(0, 10).map(p => ({
        productCode: p.productCode,
        name: p.name,
      })),
      fetchedAt: new Date().toISOString(),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/.netlify/functions/availability' };
