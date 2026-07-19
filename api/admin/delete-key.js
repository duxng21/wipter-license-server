import { cors, getLicense, normalizeKey, requireAdmin, requirePost, send, supabaseAdmin } from '../_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requirePost(req, res)) return;
  if (!requireAdmin(req, res)) return;

  try {
    const key = normalizeKey(req.body?.key);
    if (!key) return send(res, 400, { ok: false, error: 'Missing license key' });
    const db = supabaseAdmin();
    const license = await getLicense(db, key);
    if (!license) return send(res, 404, { ok: false, error: 'License key not found' });

    const { error } = await db.from('licenses').delete().eq('license_key', key);
    if (error) throw error;
    return send(res, 200, { ok: true, key, deleted: true });
  } catch (error) {
    return send(res, 500, { ok: false, code: 'server_error', error: 'License server error.' });
  }
}

