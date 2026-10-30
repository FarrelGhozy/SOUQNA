import type { MockUser } from '../types/index.js';
import { users } from '../mocks/extras.mock.js';

// Mock-auth dummy — satu-satunya pembaca/penulis sesi (`souqna:session`).
// Guard dan komponen dilarang baca localStorage langsung — lewat sini / api.getMe.
// Role TIDAK pernah diambil dari input user; login email apa saja → akun
// preset bila email cocok, selain itu buyer baru. Switch peran hanya antar
// akun preset untuk demo (bukan field role dari form).

const KEY = 'souqna:session';
const EXTRA_KEY = 'souqna:extra-users';
const OVERRIDES_KEY = 'souqna:profile-overrides';

const memoryStore = new Map<string, string>();
const storage = {
  getItem: (k: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : memoryStore.get(k) ?? null),
  setItem: (k: string, v: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(k, v);
    else memoryStore.set(k, v);
  },
  removeItem: (k: string) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(k);
    else memoryStore.delete(k);
  },
};

type Override = Partial<Pick<MockUser, 'full_name' | 'phone' | 'default_location' | 'hasStore' | 'store_id'>>;

function read<T>(key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

function extraUsers(): MockUser[] {
  return read<MockUser[]>(EXTRA_KEY) ?? [];
}

function overrides(): Record<string, Override> {
  return read<Record<string, Override>>(OVERRIDES_KEY) ?? {};
}

function applyOverride(u: MockUser): MockUser {
  const o = overrides()[u.id];
  return o ? { ...u, ...o } : u;
}

function saveSession(u: MockUser) {
  storage.setItem(KEY, JSON.stringify(u));
}

const emailOf = (email: string) => email.trim().toLowerCase();
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function currentSession(): MockUser | null {
  const s = read<MockUser>(KEY);
  return s ? applyOverride(s) : null;
}

function findByEmail(email: string): MockUser | null {
  const e = emailOf(email);
  return (
    extraUsers().find((u) => emailOf(u.email) === e) ??
    users.find((u) => emailOf(u.email) === e) ??
    null
  );
}

/** Login dummy: email apa saja. Email dikenal → akun itu; asing → buyer baru. */
export function loginWithEmail(email: string): MockUser {
  if (!validEmail(email)) throw new Error('Email tidak valid.');
  const found = findByEmail(email);
  if (found) {
    const u = applyOverride(found);
    saveSession(u);
    return u;
  }
  const name = emailOf(email).split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Pembeli Baru';
  const u: MockUser = {
    id: `user-local-${Date.now()}`, full_name: name, email: email.trim(),
    role: 'buyer', hasStore: false,
  };
  const all = extraUsers();
  all.push(u);
  storage.setItem(EXTRA_KEY, JSON.stringify(all));
  saveSession(u);
  return u;
}

/** Register dummy: selalu buyer baru (atau login bila email sudah ada). */
export function register(name: string, email: string): MockUser {
  if (!name.trim()) throw new Error('Nama wajib diisi.');
  if (!validEmail(email)) throw new Error('Email tidak valid.');
  const found = findByEmail(email);
  const base = found ?? loginWithEmail(email);
  const u = applyOverride({ ...base, full_name: name.trim() });
  // Simpan override nama agar persist antar sesi.
  const ov = overrides();
  ov[u.id] = { ...ov[u.id], full_name: u.full_name };
  storage.setItem(OVERRIDES_KEY, JSON.stringify(ov));
  saveSession(u);
  return u;
}

/** Switch peran demo antar akun preset (bukan dari input user). */
export function loginAs(role: MockUser['role']): MockUser {
  const u = users.find((x) => x.role === role) ?? users[0];
  const merged = applyOverride(u);
  saveSession(merged);
  return merged;
}

export function updateProfile(patch: Override): MockUser {
  const s = read<MockUser>(KEY);
  if (!s) throw new Error('Belum login.');
  if (patch.full_name !== undefined && !patch.full_name.trim()) throw new Error('Nama tidak boleh kosong.');
  const ov = overrides();
  ov[s.id] = { ...ov[s.id], ...patch };
  storage.setItem(OVERRIDES_KEY, JSON.stringify(ov));
  const u = applyOverride(s);
  saveSession(u);
  return u;
}

export function logout() { storage.removeItem(KEY); }

/** Tandai sesi punya toko (dipanggil setelah createMyStore sukses). */
export function attachStore(storeId: string): MockUser {
  const s = read<MockUser>(KEY);
  if (!s) throw new Error('Belum login.');
  const ov = overrides();
  ov[s.id] = { ...ov[s.id], hasStore: true, store_id: storeId };
  storage.setItem(OVERRIDES_KEY, JSON.stringify(ov));
  // Sinkronkan juga bila user ada di extra-users (akun buyer baru).
  try {
    const raw = storage.getItem(EXTRA_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as MockUser[];
      const i = arr.findIndex((u) => u.id === s.id);
      if (i >= 0) {
        arr[i] = { ...arr[i], hasStore: true, store_id: storeId };
        storage.setItem(EXTRA_KEY, JSON.stringify(arr));
      }
    }
  } catch { /* abaikan */ }
  const u = applyOverride(s);
  saveSession(u);
  return u;
}
