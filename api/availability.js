export default async function handler(req, res) {
  const REZDY_KEY = process.env.REZDY_API_KEY;
  const BASE = 'https://api.rezdy.com/v1';

  try {
    const start = '2026-01-01 00:00:00';
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const end = future.toISOString().slice(0,10) + ' 00:00:00';

    // Fetch all products first to get exact codes
    const prodRes = await fetch(`${BASE}/products?apiKey=${REZDY_KEY}&limit=100&offset=0`);
    const prodData = await prodRes.json();
    const allProducts = prodData.products || [];

    // Return raw product list so we can see exact codes and structure
    return res.status(200).json({
      totalProducts: allProducts.length,
      products: allProducts.map(p => ({
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
