export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://magdalena-reporta.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 'IP_DESCONOCIDA';

  // Sanitizar 'type' antes de loggear — evita log injection.
  // Solo letras, números, guiones. Máximo 30 chars.
  const rawType = req.body?.type;
  const safeType = typeof rawType === 'string'
    ? rawType.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30) || 'mapa'
    : 'mapa';

  console.log(`[VISITA] IP: ${clientIp} | Tipo: ${safeType}`);

  return res.status(200).json({ ok: true });
}
