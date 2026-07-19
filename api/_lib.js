import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
export function supabaseAdmin(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('SERVER_CONFIG');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
export function send(res,status,payload){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Admin-Secret');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.end(JSON.stringify(payload))}
export function cors(req,res){if(req.method==='OPTIONS'){send(res,200,{ok:true});return true}return false}
export function requirePost(req,res){if(req.method!=='POST'){send(res,405,{ok:false,code:'method_not_allowed',error:'POST required'});return false}return true}
export function normalizeKey(key=''){return String(key).trim().toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,64)}
export function normalizeMachineId(id=''){const value=String(id).trim();return /^[a-f0-9]{64}$/i.test(value)?value:''}
export function publicLicense(row){return{key:row.license_key,status:row.status,plan:'lifetime',product:'Wipter Node Tool',activatedAt:row.activated_at,lastSeenAt:row.last_seen_at}}
function safeEqual(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
export function requireAdmin(req,res){const expected=process.env.ADMIN_SECRET||'',provided=req.headers['x-admin-secret']||'';if(!expected||expected==='change-me-long-random-secret'){send(res,500,{ok:false,code:'server_config',error:'Admin chưa được cấu hình.'});return false}if(!safeEqual(provided,expected)){send(res,401,{ok:false,code:'unauthorized',error:'Không có quyền truy cập.'});return false}return true}
export function generateLicenseKey(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=crypto.randomBytes(12),groups=[];for(let g=0;g<3;g++){let part='';for(let i=0;i<4;i++)part+=alphabet[bytes[g*4+i]%alphabet.length];groups.push(part)}return `WNT-${groups.join('-')}`}
export async function getLicense(db,key){const{data,error}=await db.from('licenses').select('*').eq('license_key',key).maybeSingle();if(error)throw error;return data}
export function serverError(res,error){console.error('[license-api]',error?.message||error);return send(res,500,{ok:false,code:'server_error',error:'Dịch vụ license đang bận. Vui lòng thử lại.'})}
