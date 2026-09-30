'use client';
import CopyButton from './CopyButton';

function Token({ t, k }: { t: { v: string; c: string }; k: number }) {
  return <span key={k} className={t.c}>{t.v}</span>;
}

function highlightJson(src: string) {
  const re = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?/g;
  const out: { v: string; c: string }[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) out.push({ v: src.slice(last, m.index), c: 'text-zinc-400' });
    const tok = m[0];
    let c = 'text-amber-300';
    if (tok.startsWith('"')) c = m[3] ? 'text-violet-300' : 'text-emerald-300';
    else if (tok === 'true' || tok === 'false') c = 'text-sky-300';
    else if (tok === 'null') c = 'text-rose-300';
    out.push({ v: tok, c });
    last = m.index + tok.length;
    if (++i > 4000) break;
  }
  if (last < src.length) out.push({ v: src.slice(last), c: 'text-zinc-400' });
  return out.map((t, k) => <Token key={k} t={t} k={k} />);
}

export default function CodeBlock({ code, title = 'Response', maxHeight = 420 }: { code: string; title?: string; maxHeight?: number }) {
  return (
    <div className="codewrap w-full overflow-hidden rounded-xl border border-white/10 bg-black/50">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500/80" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400/80" />
          <span className="ml-2 truncate text-xs text-zinc-400">{title}</span>
        </div>
        <CopyButton text={code} label="" className="shrink-0 border-0 bg-transparent px-2" />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed" style={{ maxHeight }}>
        <code className="whitespace-pre">{highlightJson(code)}</code>
      </pre>
    </div>
  );
}
