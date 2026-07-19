import { cors, requireAdmin, requirePost, send, supabaseAdmin } from '../_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requirePost(req, res)) return;
  if (!requireAdmin(req, res)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const latestVersion = String(body.latestVersion || '').trim();
    const downloadUrl = String(body.downloadUrl || '').trim();
    const sha256 = String(body.sha256 || '').trim().toUpperCase();
    const enabled = body.enabled !== false;
    const required = Boolean(body.required);

    if (enabled && (!latestVersion || !downloadUrl)) {
      throw new Error('Enabled update cần latestVersion và downloadUrl.');
    }

    const db = supabaseAdmin();
    const payload = {
      id: 1,
      latest_version: latestVersion,
      download_url: downloadUrl,
      sha256,
      enabled,
      required,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await db
      .from('app_updates')
      .upsert(payload, { onConflict: 'id' })
      .select('latest_version,download_url,sha256,enabled,required,updated_at')
      .single();

    if (error) throw error;

    return send(res, 200, { ok: true, update: data });
  } catch (error) {
    return send(res, 500, { ok: false, code: 'server_error', error: 'License server error.' });
  }
}

