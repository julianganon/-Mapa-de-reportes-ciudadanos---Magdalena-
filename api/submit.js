import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

si (!getApps().length) {
  inicializarAplicación({
    credencial: certificado({
      projectId: process.env.FIREBASE_PROJECT_ID,
      Correo electrónico del cliente: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

// Limitación de velocidad en memoria (se resetea si la función se reinicia)
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60000; // 1 minuto

const VALID_CAT_IDS = [
  'obra','calle','luminaria','basura','cloaca',
  'agua','aguas','faltlum','tacho','rampa','zanja','otro'
];

función sanitizar(str) {
  si (!str) devuelve '';
  devolver String(str)
    .replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
    .replace(/"/g, '"').replace(/'/g, ''')
    .replace(/\\/g, '\').trim();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  intentar {
    // 1 — Verificar token de Google
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    sea ​​token decodificado;
    intentar {
      decodedToken = await auth.verifyIdToken(idToken);
    } atrapar {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const uid = decodedToken.uid;
    const userEmail = decodedToken.email || '';
    const userName = decodedToken.name || '';

    // 2 — Limitación de velocidad por usuario
    const ahora = Fecha.ahora();
    const lastSubmit = rateLimitMap.get(uid) || 0;
    si (ahora - últimoEnvío < LÍMITE_RATE_LIMIT_MS) {
      return res.status(429).json({ error: 'Espera un momento antes de enviar otro reclamo' });
    }

    // 3 — Validar datos
    const { gatos, descripción, latitud, longitud } = req.body;

    si (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }
    Si (typeof description !== 'string' || description.length > 300) {
      return res.status(400).json({ error: 'Descripción inválida' });
    }
    if (!Array.isArray(cats) || cats.length === 0) {
      return res.status(400).json({ error: 'Seleccioná al menos una categoría' });
    }

    // 4 — Validar categorías contra lista oficial
    const safeCats = gatos
      .filter(c => VALID_CAT_IDS.includes(c.id))
      .map(c => ({
        id: sanitizar(c.id),
        nombre: sanitizar(c.name),
        icono: sanitizar(c.icon)
      }));

    Si (safeCats.length === 0) {
      return res.status(400).json({ error: 'Categorías inválidas' });
    }

    // 5 — Sanitizar campos opcionales
    const contactName = sanitize(req.body.contactName || '').substring(0, 100);
    const contactInfo = sanitize(req.body.contactInfo || '').substring(0, 100);
    const safeDesc = sanitize(description).substring(0, 300);

    // 6 — Guardar en Firestore
    const informe = {
      gatos: gatos seguros,
      descripción: safeDesc,
      latitud,
      largo,
      marca de tiempo: new Date().toISOString(),
      estado: 'Pendiente',
      nombreContacto: nombreContacto || nulo,
      informaciónDeContacto: informaciónDeContacto || nulo,
      userUid: uid,
      nombre de usuario,
      Correo electrónico del usuario,
    };

    const docRef = await db.collection('reports').add(report);

    // 7 — Límite de tasa de Marcar
    rateLimitMap.set(uid, now);

    // 8 — Respaldo a Google Sheets (silencioso)
    const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
    si (sheetsUrl) {
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
      obtener(sheetsUrl, {
        método: 'POST',
        modo: 'no-cors',
        encabezados: { 'Content-Type': 'application/json' },
        cuerpo: JSON.stringify({ ...report, mapsUrl, secret: process.env.SHEETS_TOKEN })
      }).catch(() => {});
    }

    return res.status(200).json({ ok: true, id: docRef.id });

  } capturar (error) {
    console.error('Error al enviar:', err);
    return res.status(500).json({ error: 'Error al guardar el reclamo' });
  }
}
