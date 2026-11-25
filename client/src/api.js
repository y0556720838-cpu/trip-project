const BASE_URL = 'http://localhost:3000';

// משאבים שנמחקים יחד עם האב שלהם בשרת (מחיקת אלבום מוחקת גם את התמונות שלו)
const DEPENDENTS = { albums: ['photos'], posts: ['comments'], lists: ['todos'] };

// משאבים שגם משתמשות אחרות משנות - העותק שלהם נחשב עדכני רק לזמן מוגבל
const SHARED = ['posts', 'comments'];
const SHARED_TTL = 2 * 60 * 1000; // 2 דקות

// התשובות עצמן נשמרות במטמון של הדפדפן 
const fresh = new Map();

function resourceOf(path) {
  return path.split(/[/?]/)[0];
}

function isFresh(path) {
  const time = fresh.get(path);
  if (time === undefined) return false;
  if (SHARED.includes(resourceOf(path))) return Date.now() - time < SHARED_TTL;
  return true;
}

// פונקציה פנימית אחת שכל הפניות עוברות דרכה
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/${path}`, {
      // כותרת רק כשיש גוף: כותרת כזו בבקשת קריאה גורמת לדפדפן לשלוח בקשת בדיקה מקדימה לשרת
      headers: options.body ? { 'Content-Type': 'application/json' } : {},
      ...options,
    });
  } catch {
    throw new Error('אין חיבור לשרת');
  }
  //אם משום מה המידע הגיע בפורמט לא טוב
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'הפעולה נכשלה');

  return { data, total: Number(res.headers.get('X-Total-Count')) };
}

function buildPath(path, params) {
  const query = new URLSearchParams(params).toString();
  return query ? `${path}?${query}` : path;
}

async function cachedRequest(path) {
  const result = await request(path, { cache: isFresh(path) ? 'force-cache' : 'no-cache' });
  fresh.set(path, Date.now());
  return result;
}

function invalidate(path, withDependents = false) {
  const resource = resourceOf(path);
  const affected = [resource, ...(withDependents ? DEPENDENTS[resource] || [] : [])];
  for (const key of fresh.keys()) {
    if (affected.includes(resourceOf(key))) fresh.delete(key);
  }
}

export async function apiGet(path, params = {}) {
  const { data } = await cachedRequest(buildPath(path, params));
  return data;
}

// קריאה שלא נשמרת בכלל במטמון של הדפדפן - לבדיקות של כניסה והרשמה
export async function apiGetNoStore(path, params = {}) {
  const { data } = await request(buildPath(path, params), { cache: 'no-store' });
  return data;
}

// עמוד אחד מתוך רשימה ארוכה: מחזיר את הפריטים ואת המספר הכולל
export function apiGetPage(path, params, page, limit) {
  return cachedRequest(buildPath(path, { ...params, _page: page, _limit: limit }));
}

export async function apiCount(path, params = {}) {
  const { total } = await cachedRequest(buildPath(path, { ...params, _limit: 0 }));
  return total;
}

export async function apiPost(path, body) {
  const { data } = await request(path, { method: 'POST', body: JSON.stringify(body) });
  invalidate(path);
  return data;
}

export async function apiPatch(path, body) {
  const { data } = await request(path, { method: 'PATCH', body: JSON.stringify(body) });
  invalidate(path);
  return data;
}

export async function apiDelete(path) {
  await request(path, { method: 'DELETE' });
  invalidate(path, true);
}

// ביציאה מהמערכת - כל העותקים השמורים ייבדקו מול השרת לפני שימוש חוזר
export function clearCache() {
  fresh.clear();
}