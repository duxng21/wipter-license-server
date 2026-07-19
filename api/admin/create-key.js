import { cors, generateLicenseKey, getLicense, normalizeKey, requireAdmin, requirePost, send, supabaseAdmin } from '../_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requirePost(req, res)) return;
  if (!requireAdmin(req, res)) return;

  try {
    const db = supabaseAdmin();
    const note = String(req.body?.note || '').trim() || null;
    let key = normalizeKey(req.body?.key);

    if (!key) {
      do {
        key = generateLicenseKey();
      } while (await getLicense(db, key));
    }

    if (!/^WNT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) {
      return send(res, 400, { ok: false, error: 'Invalid key format. Expected WNT-XXXX-XXXX-XXXX' });
    }

    const { data, error } = await db.from('licenses').insert({ license_key: key, status: 'unused', note }).select('*').single();
    if (error) {
      if (error.code === '23505') return send(res, 409, { ok: false, error: 'License key already exists' });
      throw error;
    }

    return send(res, 200, { ok: true, key: data.license_key, status: data.status, note: data.note });
  } catch (error) {
    return send(res, 500, { ok: false, code: 'server_error', error: 'License server error.' });
  }
}


