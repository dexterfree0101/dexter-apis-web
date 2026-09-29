import { MessageCircle, Send } from 'lucide-react';

export const CONTACTS = {
  whatsapp: ['9489958225', '94767799548', '94753574803'],
  telegram: 'dexter_id_error',
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-white">DEXTER <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">APIS</span></p>
          <p className="mt-2 text-sm text-zinc-400">35+ production APIs — AI, downloaders, LK news, tools, fun and more. Free tier forever.</p>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Platform</p>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li><a href="/docs" className="hover:text-white">API Docs</a></li>
            <li><a href="/plans" className="hover:text-white">Plans &amp; Pricing</a></li>
            <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
            <li><a href="https://dexter-apis.onrender.com/api/plans" target="_blank" rel="noreferrer" className="hover:text-white">API Status</a></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Custom Plan</p>
          <ul className="space-y-2 text-sm text-zinc-300">
            {CONTACTS.whatsapp.map((n) => (
              <li key={n}>
                <a href={`https://wa.me/${n}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
                  <MessageCircle size={14} className="text-emerald-400" /> +{n}
                </a>
              </li>
            ))}
            <li>
              <a href={`https://t.me/${CONTACTS.telegram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
                <Send size={14} className="text-sky-400" /> @{CONTACTS.telegram}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Legal</p>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li><span className="text-zinc-500">Fair use · No abuse</span></li>
            <li><span className="text-zinc-500">Manual approval for paid plans</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-500">
        © 2026 DEXTER APIS · Built for builders
      </div>
    </footer>
  );
}
