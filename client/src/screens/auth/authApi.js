import { apiGetNoStore, apiPost, apiDelete } from '../../api';

let pending = null;

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// זורקת שגיאה אם שם המשתמש תפוס
async function assertUsernameFree(username) {
  const users = await apiGetNoStore('users', { username });
  if (users.length > 0) throw new Error('שם המשתמש כבר קיים');
}

export async function startRegistration(username, password) {
  await assertUsernameFree(username);
  pending = { username, hash: await hashPassword(password) };
}

// האם עברו את שלב 1 - כדי שמסך השלמת הפרטים לא ייפתח בלעדיו
export function hasPendingRegistration() {
  return pending !== null;
}

export async function registerUser(profile) {
  const { username, hash } = pending;

  await assertUsernameFree(username);

  const user = await apiPost('users', { username, ...profile, joinedAt: new Date().toISOString() });
  try {
    await apiPost('passwords', { userId: user.id, username, hash });
  } catch (err) {
    await apiDelete(`users/${user.id}`);
    throw err;
  }

  pending = null;
  return user;
}

export async function loginUser(username, password) {
  const hash = await hashPassword(password);
  const match = await apiGetNoStore('passwords', { username, hash });
  if (match.length === 0) throw new Error('שם משתמש או סיסמה שגויים');

  return apiGetNoStore(`users/${match[0].userId}`);
}