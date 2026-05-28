export default async function handler(req, res) {
  const REZDY_API_KEY = process.env.REZDY_API_KEY;
  const base = 'https://api.rezdy.com/v1';

  const { path, ...params } = req.query;
  const qs = new URLSearchParams({ ...params, apiKey: REZDY_API_KEY }).toString();
  const url = `${base}${path}?${qs}`;

  try {
    const upstream = await fetch(url);
    const data = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(upstream.status).send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
