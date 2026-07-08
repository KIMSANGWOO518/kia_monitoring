// Upstash Redis 프록시 — 토큰을 서버(환경변수)에만 보관하고 브라우저에 노출하지 않는다.
module.exports = async (req, res) => {
  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  const version = req.query.version;
  if (!version) {
    res.status(400).json({ error: 'version is required' });
    return;
  }
  const key = version + '_status';

  try {
    if (req.method === 'GET') {
      const resp = await fetch(KV_URL + '/get/' + key, {
        headers: { Authorization: 'Bearer ' + KV_TOKEN }
      });
      const data = await resp.json();
      res.status(200).json(data);
      return;
    }

    if (req.method === 'POST') {
      const statusMap = (req.body && req.body.status) || {};
      const resp = await fetch(KV_URL + '/set/' + key, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + KV_TOKEN },
        body: JSON.stringify(statusMap)
      });
      const data = await resp.json();
      res.status(resp.ok ? 200 : 500).json(data);
      return;
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
