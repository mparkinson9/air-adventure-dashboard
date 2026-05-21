export default async function handler(req, res) {
  const REZDY_KEY = process.env.REZDY_API_KEY;
  const BASE = 'https://api.rezdy.com/v1';

  try {
    // Fetch page 2 of products (offset 100)
    const prodRes = await fetch(`${BASE}/products?apiKey=${REZDY_KEY}&limit=100&offset=100`);
    const prodData = await prodRes.json();
    const products = prodData.products || [];

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      totalOnPage2: products.length,
      products: products.map(p => ({
        productCode: p.productCode,
        internalCode: p.internalCode,
        name: p.name,
        productType: p.productType,
      })),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
