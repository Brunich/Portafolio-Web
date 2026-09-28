import { useMemo, useRef, useState } from 'react';
import { profileColumns } from './csv';
import type { ColumnProfile } from './csv';
import { toNumber } from './quality';
import './csv-charts.css';

// Gráficas desde el CSV sin tocar Excel: sugerencias automáticas, ocho tipos, y exportar a imagen
// o a los datos listos para pegar en Canva, Flourish o Datawrapper.
export type Table = { headers: string[]; rows: string[][]; name: string };
type Kind = 'bar' | 'hbar' | 'line' | 'area' | 'pie' | 'donut' | 'scatter' | 'hist';
type Agg = 'sum' | 'avg' | 'count' | 'max' | 'min';
type Config = { kind: Kind; x: number; y: number; agg: Agg; top: number; sort: 'value' | 'label'; title: string };
type Point = { label: string; value: number; x?: number };

const PALETTES: Record<string, string[]> = {
 portafolio: ['#a894f0', '#9fd0bf', '#dd9fbd', '#d9c08a', '#b3aed8', '#8fb7d6', '#e0b39a', '#c3d98f'],
 sobrio: ['#5b6c8f', '#8aa1c1', '#b9c7da', '#6f8f7e', '#a8bfa9', '#9a8fb3', '#c9b8d8', '#7d8594'],
 calido: ['#c9795c', '#e0a86e', '#e8c98a', '#a8695a', '#d68f86', '#b98fa1', '#8f7a6a', '#e5b7a0'],
};
const KINDS: [Kind, string, string][] = [['bar', 'Barras', 'Bars'], ['hbar', 'Barras horizontales', 'Horizontal bars'], ['line', 'Línea', 'Line'], ['area', 'Área', 'Area'], ['pie', 'Pastel', 'Pie'], ['donut', 'Dona', 'Donut'], ['scatter', 'Dispersión', 'Scatter'], ['hist', 'Histograma', 'Histogram']];
const AGGS: [Agg, string, string][] = [['sum', 'Suma', 'Sum'], ['avg', 'Promedio', 'Average'], ['count', 'Conteo de filas', 'Row count'], ['max', 'Máximo', 'Max'], ['min', 'Mínimo', 'Min']];
const iso = (v: string) => { const t = v.trim(); const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t); return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : t; };
const fmt = (n: number) => Math.abs(n) >= 1000 ? n.toLocaleString('es-MX', { maximumFractionDigits: 0 }) : n.toLocaleString('es-MX', { maximumFractionDigits: 2 });
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// Sugerencias: qué gráfica tiene sentido según el tipo de cada columna.
export function suggest(p: ColumnProfile[], es: boolean): Config[] {
 const num = p.map((c, i) => [c, i] as const).filter(([c]) => c.kind === 'number');
 const cat = p.map((c, i) => [c, i] as const).filter(([c]) => (c.kind === 'category' || (c.kind === 'text' && c.unique <= 30)) && c.unique >= 2)
  .sort((a, b) => (a[0].kind === 'category' ? 0 : 1) - (b[0].kind === 'category' ? 0 : 1));
 const date = p.map((c, i) => [c, i] as const).filter(([c]) => c.kind === 'date');
 const out: Config[] = [];
 const base = { top: 10, sort: 'value' as const };
 if (cat[0] && num[0]) out.push({ ...base, kind: 'bar', x: cat[0][1], y: num[num.length > 1 ? num.length - 1 : 0][1], agg: 'sum', title: es ? `${num[num.length > 1 ? num.length - 1 : 0][0].name} por ${cat[0][0].name}` : `${num[num.length > 1 ? num.length - 1 : 0][0].name} by ${cat[0][0].name}` });
 if (date[0]) out.push({ ...base, sort: 'label', kind: num[0] ? 'area' : 'line', x: date[0][1], y: num[0]?.[1] ?? -1, agg: num[0] ? 'sum' : 'count', title: es ? `${num[0] ? num[0][0].name : 'Filas'} por día` : `${num[0] ? num[0][0].name : 'Rows'} per day` });
 const share = cat.find(([c]) => c.unique <= 6) ?? cat[1] ?? cat[0];
 if (share) out.push({ ...base, kind: 'donut', x: share[1], y: -1, agg: 'count', title: es ? `Reparto por ${share[0].name}` : `Share by ${share[0].name}` });
 if (num[0]) out.push({ ...base, kind: 'hist', x: num[0][1], y: -1, agg: 'count', title: es ? `Cómo se reparte ${num[0][0].name}` : `Distribution of ${num[0][0].name}` });
 if (num.length > 1) out.push({ ...base, kind: 'scatter', x: num[0][1], y: num[1][1], agg: 'sum', title: `${num[1][0].name} vs ${num[0][0].name}` });
 if (cat[1] && !out.some(o => o.x === cat[1][1])) out.push({ ...base, kind: 'hbar', x: cat[1][1], y: -1, agg: 'count', title: es ? `Filas por ${cat[1][0].name}` : `Rows by ${cat[1][0].name}` });
 return out.slice(0, 4);
}

function compute(t: Table, p: ColumnProfile[], c: Config): Point[] {
 if (c.kind === 'scatter') return t.rows.map(r => ({ label: '', x: toNumber(r[c.x] ?? ''), value: toNumber(r[c.y] ?? '') })).filter(d => !Number.isNaN(d.x!) && !Number.isNaN(d.value)).slice(0, 800);
 if (c.kind === 'hist') {
  const vals = t.rows.map(r => toNumber(r[c.x] ?? '')).filter(n => !Number.isNaN(n));
  if (!vals.length) return [];
  const lo = Math.min(...vals), hi = Math.max(...vals), bins = Math.min(12, Math.max(4, Math.round(Math.sqrt(vals.length)))), w = (hi - lo) / bins || 1;
  const counts = Array(bins).fill(0); vals.forEach(v => counts[Math.min(bins - 1, Math.floor((v - lo) / w))]++);
  return counts.map((n, i) => ({ label: `${fmt(lo + i * w)}–${fmt(lo + (i + 1) * w)}`, value: n }));
 }
 const isDate = p[c.x]?.kind === 'date';
 const groups = new Map<string, number[]>();
 t.rows.forEach(r => {
  const raw = (r[c.x] ?? '').trim(); if (!raw) return;
  const k = isDate ? iso(raw) : raw;
  const v = c.agg === 'count' || c.y < 0 ? 1 : toNumber(r[c.y] ?? '');
  if (Number.isNaN(v)) return;
  groups.set(k, [...(groups.get(k) ?? []), v]);
 });
 const agg = (vs: number[]) => c.agg === 'count' || c.y < 0 ? vs.length : c.agg === 'sum' ? vs.reduce((a, b) => a + b, 0) : c.agg === 'avg' ? vs.reduce((a, b) => a + b, 0) / vs.length : c.agg === 'max' ? Math.max(...vs) : Math.min(...vs);
 let pts = [...groups].map(([label, vs]) => ({ label, value: agg(vs) }));
 const byLabel = c.sort === 'label' || c.kind === 'line' || c.kind === 'area';
 pts.sort(byLabel ? (a, b) => a.label.localeCompare(b.label, 'es', { numeric: true }) : (a, b) => b.value - a.value);
 if (!byLabel && pts.length > c.top) { const rest = pts.slice(c.top - 1).reduce((s, d) => s + d.value, 0); pts = [...pts.slice(0, c.top - 1), { label: 'Otros', value: c.agg === 'sum' || c.agg === 'count' ? rest : NaN }].filter(d => !Number.isNaN(d.value)); }
 return pts;
}

// Dibuja la gráfica como SVG autónomo (sirve igual en pantalla y al exportar).
function draw(pts: Point[], c: Config, colors: string[], xName: string, yName: string, es: boolean): string {
 const W = 880, H = 500, L = c.kind === 'hbar' ? 170 : 70, R = 30, T = 70, B = c.kind === 'hbar' ? 40 : 86;
 const iw = W - L - R, ih = H - T - B;
 const font = `font-family="DM Sans Variable, DM Sans, Segoe UI, Arial, sans-serif"`;
 let body = '';
 const title = `<text x="${L}" y="36" ${font} font-size="22" font-weight="700" fill="#f4f0f7">${esc(c.title)}</text><text x="${L}" y="58" ${font} font-size="13" fill="#b7aec4">${esc(c.kind === 'scatter' ? `${yName} contra ${xName}` : c.kind === 'hist' ? (es ? `Número de filas por rango de ${xName}` : `Rows per ${xName} range`) : `${c.y < 0 || c.agg === 'count' ? (es ? 'Filas' : 'Rows') : `${AGGS.find(a => a[0] === c.agg)![es ? 1 : 2]} de ${yName}`} · ${xName}`)}</text>`;
 if (!pts.length) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" rx="18" fill="#161225"/>${title}<text x="${W / 2}" y="${H / 2}" ${font} text-anchor="middle" fill="#b7aec4" font-size="15">${es ? 'No hay números en esa columna.' : 'No numbers in that column.'}</text></svg>`;
 const ticks = (max: number, min = 0) => { const span = max - min || 1, step = Math.pow(10, Math.floor(Math.log10(span / 4))), n = [1, 2, 2.5, 5, 10].map(m => m * step).find(s => span / s <= 5)!; const out: number[] = []; for (let v = Math.floor(min / n) * n; v <= max + n * .001; v += n) out.push(+v.toFixed(6)); return out; };
 if (c.kind === 'pie' || c.kind === 'donut') {
  const total = pts.reduce((s, d) => s + Math.max(0, d.value), 0) || 1, cx = 300, cy = T + ih / 2 + 6, r = Math.min(ih / 2, 190), ri = c.kind === 'donut' ? r * .58 : 0;
  let a0 = -Math.PI / 2;
  pts.forEach((d, i) => {
   const a1 = a0 + Math.max(0, d.value) / total * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0, col = colors[i % colors.length];
   const p = (a: number, rr: number) => `${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
   const path = ri ? `M${p(a0, r)} A${r} ${r} 0 ${big} 1 ${p(a1, r)} L${p(a1, ri)} A${ri} ${ri} 0 ${big} 0 ${p(a0, ri)}Z` : `M${cx} ${cy} L${p(a0, r)} A${r} ${r} 0 ${big} 1 ${p(a1, r)}Z`;
   body += `<path d="${path}" fill="${col}" stroke="#161225" stroke-width="2" class="ch-seg" style="--i:${i}"/>`;
   const ly = T + 20 + i * 30;
   body += `<rect x="560" y="${ly - 11}" width="14" height="14" rx="4" fill="${col}"/><text x="584" y="${ly}" ${font} font-size="14" fill="#e8e2f0">${esc(d.label.slice(0, 24))}</text><text x="${W - R}" y="${ly}" ${font} font-size="14" font-weight="700" text-anchor="end" fill="#f4f0f7">${Math.round(d.value / total * 100)} %</text>`;
   a0 = a1;
  });
  if (ri) body += `<text x="${cx}" y="${cy}" ${font} text-anchor="middle" font-size="34" font-weight="800" fill="#f4f0f7">${fmt(total)}</text><text x="${cx}" y="${cy + 24}" ${font} text-anchor="middle" font-size="13" fill="#b7aec4">total</text>`;
 } else if (c.kind === 'hbar') {
  const max = Math.max(...pts.map(d => d.value), 0), bh = Math.min(34, ih / pts.length * .7), step = ih / pts.length;
  ticks(max).forEach(v => { const x = L + v / (max || 1) * iw; if (x <= L + iw + 1) body += `<line x1="${x}" x2="${x}" y1="${T}" y2="${T + ih}" stroke="#ffffff14"/><text x="${x}" y="${T + ih + 20}" ${font} font-size="12" text-anchor="middle" fill="#9d93ad">${fmt(v)}</text>`; });
  pts.forEach((d, i) => { const y = T + i * step + (step - bh) / 2, w = Math.max(2, d.value / (max || 1) * iw); body += `<text x="${L - 12}" y="${y + bh / 2 + 5}" ${font} font-size="13" text-anchor="end" fill="#e8e2f0">${esc(d.label.slice(0, 20))}</text><rect x="${L}" y="${y}" width="${w}" height="${bh}" rx="6" fill="${colors[0]}" class="ch-hbar" style="--i:${i}"/><text x="${L + w + 8}" y="${y + bh / 2 + 5}" ${font} font-size="13" font-weight="700" fill="#f4f0f7">${fmt(d.value)}</text>`; });
 } else if (c.kind === 'scatter') {
  const xs = pts.map(d => d.x!), ys = pts.map(d => d.value), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(0, ...ys), y1 = Math.max(...ys);
  const sx = (v: number) => L + (v - x0) / (x1 - x0 || 1) * iw, sy = (v: number) => T + ih - (v - y0) / (y1 - y0 || 1) * ih;
  ticks(y1, y0).forEach(v => body += `<line x1="${L}" x2="${L + iw}" y1="${sy(v)}" y2="${sy(v)}" stroke="#ffffff14"/><text x="${L - 10}" y="${sy(v) + 4}" ${font} font-size="12" text-anchor="end" fill="#9d93ad">${fmt(v)}</text>`);
  ticks(x1, x0).forEach(v => { if (v >= x0 && v <= x1) body += `<text x="${sx(v)}" y="${T + ih + 22}" ${font} font-size="12" text-anchor="middle" fill="#9d93ad">${fmt(v)}</text>`; });
  pts.forEach((d, i) => body += `<circle cx="${sx(d.x!)}" cy="${sy(d.value)}" r="6" fill="${colors[0]}" fill-opacity=".75" stroke="#161225" class="ch-dot" style="--i:${i % 40}"/>`);
  body += `<text x="${L + iw}" y="${H - 22}" ${font} font-size="13" text-anchor="end" fill="#b7aec4">${esc(xName)} →</text>`;
 } else {
  const max = Math.max(...pts.map(d => d.value), 0), min = Math.min(0, ...pts.map(d => d.value)), room = max + (max - min) * .1, sy = (v: number) => T + ih - (v - min) / (room - min || 1) * ih;
  ticks(max, min).forEach(v => body += `<line x1="${L}" x2="${L + iw}" y1="${sy(v)}" y2="${sy(v)}" stroke="#ffffff14"/><text x="${L - 10}" y="${sy(v) + 4}" ${font} font-size="12" text-anchor="end" fill="#9d93ad">${fmt(v)}</text>`);
  const step = iw / pts.length, every = Math.ceil(pts.length / 12);
  const lab = (d: Point, i: number, x: number) => i % every ? '' : `<text x="${x}" y="${T + ih + 20}" ${font} font-size="12" text-anchor="end" transform="rotate(-30 ${x} ${T + ih + 20})" fill="#d8d0e4">${esc(d.label.slice(0, 16))}</text>`;
  if (c.kind === 'bar' || c.kind === 'hist') {
   const bw = c.kind === 'hist' ? step - 2 : Math.min(56, step * .68);
   pts.forEach((d, i) => { const x = L + i * step + (step - bw) / 2, y = sy(Math.max(0, d.value)), h = Math.abs(sy(d.value) - sy(0)); body += `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(1, h)}" rx="${c.kind === 'hist' ? 3 : 7}" fill="${colors[c.kind === 'hist' ? 1 : 0]}" class="ch-bar" style="--i:${i}"/>${pts.length <= 14 ? `<text x="${x + bw / 2}" y="${y - 8}" ${font} font-size="12" font-weight="700" text-anchor="middle" fill="#f4f0f7">${fmt(d.value)}</text>` : ''}${lab(d, i, x + bw / 2 + 4)}`; });
  } else {
   const pt = (d: Point, i: number) => `${(L + i * step + step / 2).toFixed(1)} ${sy(d.value).toFixed(1)}`;
   const line = pts.map((d, i) => `${i ? 'L' : 'M'}${pt(d, i)}`).join(' ');
   if (c.kind === 'area') body += `<defs><linearGradient id="ch-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colors[0]}" stop-opacity=".55"/><stop offset="1" stop-color="${colors[0]}" stop-opacity="0"/></linearGradient></defs><path d="${line} L${(L + (pts.length - .5) * step).toFixed(1)} ${sy(min)} L${(L + step / 2).toFixed(1)} ${sy(min)}Z" fill="url(#ch-fill)" class="ch-area"/>`;
   body += `<path d="${line}" fill="none" stroke="${colors[0]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" pathLength="1" class="ch-line"/>`;
   pts.forEach((d, i) => { body += `<circle cx="${L + i * step + step / 2}" cy="${sy(d.value)}" r="4.5" fill="#161225" stroke="${colors[0]}" stroke-width="2.5" class="ch-dot" style="--i:${i}"/>${lab(d, i, L + i * step + step / 2 + 4)}`; });
  }
  body += `<line x1="${L}" x2="${L + iw}" y1="${sy(0)}" y2="${sy(0)}" stroke="#ffffff40"/>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img"><rect width="${W}" height="${H}" rx="18" fill="#161225"/>${title}${body}</svg>`;
}

export default function CsvCharts({ lang, table, onBack }: { lang: 'es' | 'en'; table: Table; onBack?: () => void }) {
 const es = lang === 'es', t = (a: string, b: string) => es ? a : b;
 const profile = useMemo(() => profileColumns(table.headers, table.rows), [table]);
 const ideas = useMemo(() => suggest(profile, es), [profile, es]);
 const [cfg, setCfg] = useState<Config>(() => ideas[0] ?? { kind: 'bar', x: 0, y: -1, agg: 'count', top: 10, sort: 'value', title: table.name });
 const [palette, setPalette] = useState('portafolio');
 const [note, setNote] = useState('');
 const [run, setRun] = useState(0);
 const box = useRef<HTMLDivElement>(null);
 const safe = { ...cfg, x: Math.min(cfg.x, table.headers.length - 1), y: Math.min(cfg.y, table.headers.length - 1) };
 const pts = useMemo(() => compute(table, profile, safe), [table, profile, safe.kind, safe.x, safe.y, safe.agg, safe.top, safe.sort]); // eslint-disable-line react-hooks/exhaustive-deps
 const svg = useMemo(() => draw(pts, safe, PALETTES[palette], table.headers[safe.x] ?? '', table.headers[safe.y] ?? '', es), [pts, safe.title, palette, es]); // eslint-disable-line react-hooks/exhaustive-deps
 const set = (p: Partial<Config>) => { setCfg(c => ({ ...c, ...p })); setRun(r => r + 1); setNote(''); };
 const numCols = profile.map((c, i) => [c, i] as const).filter(([c]) => c.kind === 'number');
 const needsY = safe.kind !== 'pie' && safe.kind !== 'donut' && safe.kind !== 'hist';
 const dataRows = safe.kind === 'scatter' ? [[table.headers[safe.x], table.headers[safe.y]], ...pts.map(d => [String(d.x), String(d.value)])] : [[safe.kind === 'hist' ? t('rango', 'range') : table.headers[safe.x], safe.y < 0 || safe.agg === 'count' ? t('filas', 'rows') : table.headers[safe.y]], ...pts.map(d => [d.label, String(+d.value.toFixed(4))])];
 const fileBase = (safe.title || 'grafica').toLocaleLowerCase('es').normalize('NFD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') || 'grafica';

 function save(blob: Blob, name: string) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
 function png() {
  const img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  img.onload = () => { const c = document.createElement('canvas'); c.width = 1760; c.height = 1000; c.getContext('2d')!.drawImage(img, 0, 0, 1760, 1000); URL.revokeObjectURL(url); c.toBlob(b => b && save(b, `${fileBase}.png`)); setNote(t('Imagen descargada.', 'Image downloaded.')); };
  img.src = url;
 }
 async function copyData() {
  try { await navigator.clipboard.writeText(dataRows.map(r => r.join('\t')).join('\n')); setNote(t('Datos copiados: pégalos en la gráfica de Canva, Flourish o Datawrapper.', 'Data copied: paste it into a Canva, Flourish or Datawrapper chart.')); }
  catch { setNote(t('No se pudo copiar; usa «Descargar datos».', 'Could not copy; use “Download data”.')); }
 }

 return <div className="ch">
  <div className="ch-ideas" role="list" aria-label={t('Sugerencias', 'Suggestions')}>
   <span className="ch-label">{t('Sugerencias para tus datos', 'Suggestions for your data')}</span>
   {ideas.map((idea, i) => <button key={i} role="listitem" className={idea.kind === cfg.kind && idea.x === cfg.x && idea.y === cfg.y ? 'on' : ''} onClick={() => { setCfg(idea); setRun(r => r + 1); }}>
    <i className={`ch-mini k-${idea.kind}`} aria-hidden="true"><b/><b/><b/><b/></i><span>{idea.title}</span>
   </button>)}
   {onBack && <button className="ch-back" onClick={onBack}>{t('← Volver a todo el archivo', '← Back to the whole file')}</button>}
  </div>
  <div className="ch-body">
   <form className="ch-form" onSubmit={e => e.preventDefault()}>
    <fieldset className="ch-kinds"><legend>{t('Tipo', 'Type')}</legend>{KINDS.map(([k, a, b]) => <button type="button" key={k} aria-pressed={cfg.kind === k} onClick={() => set({ kind: k, ...(k === 'scatter' && numCols.length > 1 ? { x: numCols[0][1], y: numCols[1][1] } : k === 'hist' && numCols[0] ? { x: numCols[0][1] } : {}) })}><i className={`ch-mini k-${k}`} aria-hidden="true"><b/><b/><b/><b/></i>{es ? a : b}</button>)}</fieldset>
    <label>{t('Título', 'Title')}<input value={cfg.title} onChange={e => setCfg({ ...cfg, title: e.target.value })}/></label>
    <label>{safe.kind === 'scatter' ? t('Eje X (número)', 'X axis (number)') : safe.kind === 'hist' ? t('Columna numérica', 'Numeric column') : t('Agrupar por', 'Group by')}<select value={safe.x} onChange={e => set({ x: +e.target.value })}>{table.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}</select></label>
    {needsY && <div className="ch-two">
     {safe.kind !== 'scatter' && <label>{t('Cálculo', 'Calculation')}<select value={safe.y < 0 ? 'count' : cfg.agg} onChange={e => set({ agg: e.target.value as Agg, y: e.target.value === 'count' ? -1 : (safe.y < 0 ? numCols[0]?.[1] ?? -1 : safe.y) })}>{AGGS.map(([k, a, b]) => <option key={k} value={k} disabled={k !== 'count' && !numCols.length}>{es ? a : b}</option>)}</select></label>}
     {(safe.y >= 0 || safe.kind === 'scatter') && <label>{safe.kind === 'scatter' ? t('Eje Y (número)', 'Y axis (number)') : t('De la columna', 'Of column')}<select value={safe.y} onChange={e => set({ y: +e.target.value })}>{numCols.map(([c, i]) => <option key={i} value={i}>{c.name}</option>)}</select></label>}
    </div>}
    {(safe.kind === 'bar' || safe.kind === 'hbar' || safe.kind === 'pie' || safe.kind === 'donut') && <div className="ch-two">
     <label>{t('Orden', 'Order')}<select value={cfg.sort} onChange={e => set({ sort: e.target.value as 'value' | 'label' })}><option value="value">{t('De mayor a menor', 'Largest first')}</option><option value="label">{t('Por nombre', 'By name')}</option></select></label>
     <label>{t('Mostrar', 'Show')}<select value={cfg.top} onChange={e => set({ top: +e.target.value })}>{[5, 8, 10, 15, 25].map(n => <option key={n} value={n}>{t(`${n} más grandes`, `Top ${n}`)}</option>)}</select></label>
    </div>}
    <fieldset className="ch-pal"><legend>{t('Colores', 'Colors')}</legend>{Object.entries(PALETTES).map(([k, cs]) => <button type="button" key={k} aria-pressed={palette === k} aria-label={k} onClick={() => setPalette(k)}>{cs.slice(0, 4).map(c => <i key={c} style={{ background: c }}/>)}</button>)}</fieldset>
   </form>
   <div className="ch-stage">
    <div className="ch-canvas" ref={box} key={run} dangerouslySetInnerHTML={{ __html: svg }}/>
    <div className="ch-export">
     <button className="dw-primary" onClick={png}>{t('Descargar PNG', 'Download PNG')}</button>
     <button onClick={() => { save(new Blob([svg], { type: 'image/svg+xml' }), `${fileBase}.svg`); setNote(t('SVG descargado: se edita en Figma, Illustrator o Canva.', 'SVG downloaded: edit it in Figma, Illustrator or Canva.')); }}>SVG</button>
     <button onClick={() => { save(new Blob(['﻿' + dataRows.map(r => r.map(v => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), `${fileBase}_datos.csv`); setNote(t('Datos de la gráfica descargados.', 'Chart data downloaded.')); }}>{t('Descargar datos', 'Download data')}</button>
     <button onClick={copyData}>{t('Copiar datos', 'Copy data')}</button>
    </div>
    <p className="ch-send">{t('Para diseñarla más: copia los datos y pégalos en', 'To design it further: copy the data and paste it into')} <a href="https://www.canva.com/graphs/" target="_blank" rel="noreferrer">Canva</a>, <a href="https://app.flourish.studio/" target="_blank" rel="noreferrer">Flourish</a> {t('o', 'or')} <a href="https://app.datawrapper.de/create/chart" target="_blank" rel="noreferrer">Datawrapper</a>.</p>
    {note && <p className="ch-note" role="status">{note}</p>}
   </div>
  </div>
 </div>;
}
