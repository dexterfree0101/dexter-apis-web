const BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://dexter-apis.onrender.com').replace(/\/$/, '');

export const API_BASE = BASE;

export interface Envelope<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  creator: string;
  data?: T;
  timestamp: string;
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<Envelope<T>> {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!json || typeof json !== 'object') throw new Error('Bad response from server');
  return json as Envelope<T>;
}

const post = <T,>(path: string, body: unknown, token?: string) =>
  req<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

const get = <T,>(path: string, token?: string) =>
  req<T>(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

export interface PlanInfo { id: string; name: string; price: number; calls: number; vip: boolean; features: string[] }
export interface QuotaInfo { used: number; limit: number; left?: number; resetsAt: string }

export const api = {
  plans: () => get<{ plans: PlanInfo[] }>(`/api/plans`),
  services: () => get(`/api/services`),
  sendOtp: (b: { username: string; email: string; password: string; referralCode?: string }) => post(`/api/auth/send-otp`, b),
  verifyOtp: (b: { email: string; otp: string }) => post(`/api/auth/verify-otp`, b),
  register: (b: { username: string; email: string; password: string; referralCode?: string }) => post(`/api/auth/register`, b),
  login: (b: { email: string; password: string }) => post(`/api/auth/login`, b),
  forgot: (b: { email: string }) => post(`/api/auth/forgot-password`, b),
  reset: (b: { email: string; otp: string; newPassword: string }) => post(`/api/auth/reset-password`, b),
  info: (key: string) => get(`/api/user/info?apikey=${encodeURIComponent(key)}`),
  profile: (key: string) => get(`/api/user/profile?apikey=${encodeURIComponent(key)}`),
  update: (b: { apikey: string; displayName?: string; avatar?: string; bio?: string }) =>
    req(`/api/user/update`, { method: 'PUT', body: JSON.stringify(b) }),
  referral: (key: string) => get(`/api/user/referral?apikey=${encodeURIComponent(key)}`),
  refHistory: (key: string) => get(`/api/user/referral/history?apikey=${encodeURIComponent(key)}`),
  leaderboard: () => get(`/api/referral/leaderboard`),
  validateRef: (code: string) => get(`/api/referral/validate/${encodeURIComponent(code)}`),
  redeem: (b: { apikey: string; coupon: string }) => post(`/api/user/redeem-coupon`, b),
  subRequest: (b: { apikey: string; plan: string; reference: string; note?: string; requestedCalls?: number; requestedDevName?: string }) =>
    post(`/api/subscription/request`, b),
  subStatus: (key: string) => get(`/api/subscription/status?apikey=${encodeURIComponent(key)}`),
  subHistory: (key: string) => get(`/api/subscription/history?apikey=${encodeURIComponent(key)}`),
  adminLogin: (b: { adminId: string; password: string }) => post(`/api/admin/login`, b),
  adminStats: (t: string) => get(`/api/admin/stats`, t),
  adminSubs: (t: string, status = '') => get(`/api/admin/subscriptions${status ? `?status=${status}` : ''}`, t),
  adminApprove: (t: string, id: string, b: { months?: number; calls?: number; devName?: string }) =>
    post(`/api/admin/subscriptions/${id}/approve`, b, t),
  adminReject: (t: string, id: string, reason: string) => post(`/api/admin/subscriptions/${id}/reject`, { reason }, t),
  adminUsers: (t: string, q = '') => get(`/api/admin/users${q}`, t),
  adminUpdateUser: (t: string, id: string, b: Record<string, unknown>) =>
    req(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(b), headers: { Authorization: `Bearer ${t}` } }),
  adminCouponCreate: (t: string, b: { plan: string; days: number; maxUses: number }) => post(`/api/admin/coupons/create`, b, t),
  adminCoupons: (t: string) => get(`/api/admin/coupons`, t),
};

export async function callApiEndpoint(endpoint: string, params: Record<string, string>): Promise<unknown> {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${endpoint}?${q}`);
  return res.json().catch(() => ({ status: res.status, raw: true }));
}

interface StoredUser { username: string; apiKey: string; plan?: string }

function readLS(k: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(k); } catch { return null; }
}
function writeLS(k: string, v: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (v === null) window.localStorage.removeItem(k);
    else window.localStorage.setItem(k, v);
  } catch { /* noop */ }
}

export const store = {
  get user(): StoredUser | null {
    const raw = readLS('dexter_user');
    if (!raw) return null;
    try { return JSON.parse(raw) as StoredUser; } catch { return null; }
  },
  get token(): string | null { return readLS('dexter_token'); },
  get adminToken(): string | null { return readLS('dexter_admin'); },
  setSession(user: StoredUser, token?: string) {
    writeLS('dexter_user', JSON.stringify(user));
    if (token) writeLS('dexter_token', token);
  },
  setAdmin(token: string) { writeLS('dexter_admin', token); },
  clear() { writeLS('dexter_user', null); writeLS('dexter_token', null); },
  clearAdmin() { writeLS('dexter_admin', null); },
};
