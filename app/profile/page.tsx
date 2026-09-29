'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Save, Trophy } from 'lucide-react';
import { api, store, API_BASE } from '@/lib/api';
import AvatarGroup from '@/components/AvatarGroup';
import Dropzone from '@/components/Dropzone';
import CopyButton from '@/components/CopyButton';

type J = Record<string, any>;

export default function ProfilePage() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [prof, setProf] = useState<J | null>(null);
  const [board, setBoard] = useState<J[]>([]);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (k: string) => {
    const p = await api.profile(k);
    if (p.success) {
      const d = (p.data || {}) as J;
      const flat = { ...(d.profile || {}), ...(d.account || {}), ...(d.referral || {}) } as J;
      setProf(Object.keys(flat).length ? flat : d);
      setName(d.profile?.displayName || d.displayName || '');
      setAvatar(d.profile?.avatar || d.avatar || '');
      setBio(d.profile?.bio || d.bio || '');
    }
    const lb = await api.leaderboard().catch(() => null);
    if (lb?.success) setBoard((((lb.data || {}) as { leaderboard?: J[] }).leaderboard) || []);
  }, []);

  useEffect(() => {
    const u = store.user;
    if (!u) { router.push('/login'); return; }
    setKey(u.apiKey);
    load(u.apiKey);
  }, [router, load]);

  const save = async () => {
    setMsg(''); setBusy(true);
    try {
      const r = await api.update({ apikey: key, displayName: name, avatar, bio });
      setMsg(r.message);
      if (r.success) load(key);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const upload = async (f: File) => {
    setMsg('Uploading…');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user/avatar/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apikey: key, base64: String(reader.result || '') }),
        });
        const r = await res.json();
        setMsg(r.message || 'Uploaded');
        if (r.success) {
          const url = r.data?.avatar || r.data?.url || '';
          if (url) setAvatar(url);
          load(key);
        }
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Upload failed');
      }
    };
    reader.readAsDataURL(f);
  };

  if (!key) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-zinc-400">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Profile</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="glass space-y-3 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                (prof?.username || 'U').slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-white">{prof?.username}</p>
              <p className="text-xs text-zinc-400">{prof?.email}</p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Display name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Avatar URL</label>
            <input className="input font-mono !text-xs" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Bio</label>
            <input className="input" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the world…" />
          </div>
          <button className="btn-primary w-full" disabled={busy} onClick={save}><Save size={15} /> {busy ? 'Saving…' : 'Save changes'}</button>
          {msg && <p className="text-sm text-zinc-300">{msg}</p>}
        </div>
        <div className="space-y-4">
          <div className="glass rounded-3xl p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Upload avatar</p>
            <Dropzone onFile={upload} />
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500"><Trophy size={14} /> Top referrers</p>
            <div className="mt-3"><AvatarGroup avatars={board.map((b) => ({ name: String(b.username || '?'), src: b.avatar }))} max={6} size={38} /></div>
            <div className="mt-3 space-y-1.5">
              {board.slice(0, 5).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">#{b.rank || i + 1} {b.username}</span>
                  <span className="text-zinc-500">{b.referrals} refs</span>
                </div>
              ))}
            </div>
            {prof?.referralCode && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <span className="font-mono text-sm text-indigo-200">{prof.referralCode}</span>
                <CopyButton text={String(prof.referralCode)} label="Code" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
