import type { ColumnKind, ColumnProfile } from './csv';

const KIND_COLOR: Record<ColumnKind, string> = { number: '#f2c98f', date: '#c9b3ff', category: '#9ddbc9', text: '#a9c8ff' };
const W = 960, H = 470, CX = W / 2, CY = H / 2;
const cut = (s: string, n: number) => s.length > n ? `${s.slice(0, n - 1)}…` : s;
const textWidth = (s: string, size: number) => s.length * size * 0.56 + 26;
const fmt = (n: number) => Number.isInteger(n) ? n.toLocaleString('es-MX') : n.toLocaleString('es-MX', { maximumFractionDigits: 2 });

type Props = { lang: 'es' | 'en'; file: string; rows: number; columns: ColumnProfile[]; hover: number | null; onHover: (i: number | null) => void; runKey: string };

export default function CsvMindMap({ lang, file, rows, columns, hover, onHover, runKey }: Props) {
 const es = lang === 'es';
 const kindLabel: Record<ColumnKind, string> = es ? { number: 'número', date: 'fecha', category: 'categoría', text: 'texto' } : { number: 'number', date: 'date', category: 'category', text: 'text' };
 const shown = columns.slice(0, 10);
 const leftCount = Math.ceil(shown.length / 2);
 const leaves = (c: ColumnProfile): string[] => {
  const out: string[] = [];
  if (c.kind === 'number' && c.min !== undefined && c.max !== undefined) out.push(`${es ? 'rango' : 'range'} ${fmt(c.min)} – ${fmt(c.max)}`);
  if (c.kind === 'date' && c.from) out.push(`${c.from} → ${c.to}`);
  if (c.kind === 'category') c.top.slice(0, 2).forEach(([v, n]) => out.push(`${cut(v, 14)} ×${n}`));
  if (c.kind === 'text') out.push(`${c.unique} ${es ? 'valores distintos' : 'distinct values'}`);
  out.push(c.blanks ? `⚠ ${c.blanks} ${es ? (c.blanks === 1 ? 'vacío' : 'vacíos') : 'blank'}` : `${Math.round(c.filled * 100)} % ${es ? 'lleno' : 'filled'}`);
  return out;
 };
 const rootLabel = cut(file === 'demo' ? 'ventas_campus.csv' : file, 26);
 const rootW = Math.max(210, textWidth(rootLabel, 15));
 let delay = 0;
 return <div className="dw-mindmap" key={runKey}>
  <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={es ? `Mapa mental de ${rootLabel}: ${shown.map(c => `${c.name}, ${kindLabel[c.kind]}`).join('; ')}` : `Mind map of ${rootLabel}: ${shown.map(c => `${c.name}, ${kindLabel[c.kind]}`).join('; ')}`}>
   <defs><radialGradient id="mm-glow"><stop offset="0" stopColor="#3b5f94" stopOpacity=".55"/><stop offset="1" stopColor="#142139" stopOpacity="0"/></radialGradient></defs>
   <circle cx={CX} cy={CY} r="190" fill="url(#mm-glow)"/>
   {shown.map((c, i) => {
    const left = i < leftCount;
    const k = left ? i : i - leftCount;
    const count = left ? leftCount : shown.length - leftCount;
    const y = count === 1 ? CY : 62 + k * (H - 124) / (count - 1);
    const label = cut(c.name, 18);
    const w = Math.max(118, textWidth(label, 14));
    const x = left ? 305 : W - 305;
    const nx = left ? x - w : x;
    const color = KIND_COLOR[c.kind];
    const dim = hover !== null && hover !== i;
    const facts = leaves(c);
    const d0 = (delay += 1) * 0.09;
    return <g key={c.name + i} className={`mm-branch${dim ? ' mm-dim' : ''}${hover === i ? ' mm-hot' : ''}`} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(i)} onBlur={() => onHover(null)} tabIndex={0} style={{ ['--d' as string]: `${d0}s` }}>
     <path className="mm-edge" pathLength={1} d={`M${CX + (left ? -rootW / 2 : rootW / 2)} ${CY} C ${left ? CX - 170 : CX + 170} ${CY}, ${left ? x + 90 : x - 90} ${y}, ${x} ${y}`} stroke={color}/>
     {facts.map((f, j) => {
      const ly = y + (j - (facts.length - 1) / 2) * 24;
      const lx = left ? nx - 34 : nx + w + 34;
      return <g key={f} className="mm-leaf" style={{ ['--d' as string]: `${d0 + 0.25 + j * 0.08}s` }}>
       <path className="mm-edge mm-edge-thin" pathLength={1} d={`M${left ? nx : nx + w} ${y} C ${left ? nx - 16 : nx + w + 16} ${y}, ${left ? lx + 12 : lx - 12} ${ly}, ${lx} ${ly}`} stroke={color}/>
       <text x={left ? lx - 6 : lx + 6} y={ly} textAnchor={left ? 'end' : 'start'} className={f.startsWith('⚠') ? 'mm-warn' : ''}>{f}</text>
      </g>;
     })}
     <g className="mm-node">
      <rect x={nx} y={y - 19} width={w} height={38} rx={10} stroke={color}/>
      <circle cx={left ? nx + w - 14 : nx + 14} cy={y} r={4} fill={color}/>
      <text x={left ? nx + w - 26 : nx + 26} y={y - 1} textAnchor={left ? 'end' : 'start'} className="mm-name">{label}</text>
      <text x={left ? nx + w - 26 : nx + 26} y={y + 12} textAnchor={left ? 'end' : 'start'} className="mm-kind" fill={color}>{kindLabel[c.kind]}</text>
     </g>
    </g>;
   })}
   <g className="mm-root">
    <rect x={CX - rootW / 2} y={CY - 34} width={rootW} height={68} rx={16}/>
    <text x={CX} y={CY - 6} textAnchor="middle" className="mm-root-name">{rootLabel}</text>
    <text x={CX} y={CY + 17} textAnchor="middle" className="mm-root-meta">{rows} {es ? 'filas' : 'rows'} · {columns.length} {es ? 'columnas' : 'columns'}</text>
   </g>
  </svg>
  <div className="mm-tree" aria-hidden="true">
   <p className="mm-tree-root"><strong>{rootLabel}</strong>{rows} {es ? 'filas' : 'rows'} · {columns.length} {es ? 'columnas' : 'columns'}</p>
   <ul>{shown.map((c, i) => <li key={c.name + i} style={{ ['--c' as string]: KIND_COLOR[c.kind], ['--d' as string]: `${i * 0.08}s` }}><span className="mm-tree-name">{c.name}<small>{kindLabel[c.kind]}</small></span><span className="mm-tree-facts">{leaves(c).join(' · ')}</span></li>)}</ul>
  </div>
  <ul className="mm-legend">{(Object.keys(KIND_COLOR) as ColumnKind[]).map(k => <li key={k}><i style={{ background: KIND_COLOR[k] }}/>{kindLabel[k]}</li>)}{columns.length > 10 && <li>+{columns.length - 10} {es ? (columns.length === 11 ? 'columna más' : 'columnas más') : (columns.length === 11 ? 'more column' : 'more columns')}</li>}</ul>
 </div>;
}
