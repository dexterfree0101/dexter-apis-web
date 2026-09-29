'use client';
import { useRef, useState } from 'react';
import { CloudUpload, FileCheck } from 'lucide-react';

export default function Dropzone({ onFile, accept = 'image/*', hint = 'Drag & drop or click to upload' }: {
  onFile: (f: File) => void; accept?: string; hint?: string;
}) {
  const [drag, setDrag] = useState(false);
  const [name, setName] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const pick = (f: File | undefined) => {
    if (!f) return;
    setName(f.name);
    onFile(f);
  };

  return (
    <div
      onClick={() => input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
        drag ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/15 bg-white/[0.02] hover:border-indigo-400/50'
      }`}
    >
      <input ref={input} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {name ? <FileCheck size={28} className="text-emerald-400" /> : <CloudUpload size={28} className="text-indigo-300" />}
      <p className="text-sm text-zinc-300">{name || hint}</p>
      <p className="text-xs text-zinc-500">{accept} · max 2MB</p>
    </div>
  );
}
