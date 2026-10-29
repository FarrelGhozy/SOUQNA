import type { MockUser } from '../types/index.js';
import { users } from '../mocks/extras.mock.js';

const KEY = 'souqna:session';
export function currentSession(): MockUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch { return null; }
}
export function loginAs(role: MockUser['role']): MockUser {
  const u = users.find((x) => x.role === role) ?? users[0];
  localStorage.setItem(KEY, JSON.stringify(u));
  return u;
}
export function logout() { localStorage.removeItem(KEY); }
