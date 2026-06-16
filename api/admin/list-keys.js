import { cors, normalizeKey, requireAdmin, send, supabaseAdmin } from '../_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res)) return;

  try {
    const db = supabaseAdmin();
    const key = normalizeKey(req.query?.key);
    let query = db
      .from('licenses')
      .select('license_key,status,machine_id,activated_at,created_at,last_seen_at,note')
      .order('id', { ascending: false })
      .limit(200);

    if (key) query = query.eq('license_key', key);
    const { data, error } = await query;
    if (error) throw error;
    return send(res, 200, { ok: true, licenses: data || [] });
  } catch (error) {
    return send(res, 500, { ok: false, error: error.message || String(error) });
  }
}
