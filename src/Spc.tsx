import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, WarningOctagon, UploadSimple, Copy, Printer, FloppyDisk, Trash, Info } from '@phosphor-icons/react';
import { parseCsv } from './csv';
import { readTable, TABLE_ACCEPT } from './read-file';
import { toNumber } from './quality';
import { buildChart, capability, verdict, sampleCsv, findHeader, readMeasures, SAMPLE_SPEC, RULES, MEANING } from './spc-logic';
import type { Chart, Rule } from './spc-logic';
import { esc, printDoc } from './print-doc';
import './spc.css';

// Gráficas de control: sube las mediciones de una pieza, elige la columna y la tolerancia,
// y dice si el proceso está bajo control, qué puntos avisan y si alcanza la tolerancia.
type Grid = { headers: string[]; rows: string[][] };
type Spec = { lsl: string; usl: string };
// Un estudio guardado: lo que se reporta a calidad o al cliente (PPAP) y sirve para ver si el Cpk mejora.
type Study = { id: string; at: number; file: string; feature: string; n: number; mean: number; sigma: number; cp: number | null; cpk: number | null; ppk: number | null; control: boolean; signals: number; lsl: string; usl: string };
const KEY = 'bruno-tolerancia-v1';
const loadSaved = (): { specs: Record<string, Spec>; studies: Study[] } => { try { const v = JSON.parse(localStorage.getItem(KEY) ?? ''); return { specs: v.specs ?? {}, studies: Array.isArray(v.studies) ? v.studies : [] }; } catch { return { specs: {}, studies: [] }; } };
const fold = (s: string) => s.toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
const SAMPLE_NAME = 'buje_diametro.csv';
const sampleData = () => ({ grid: parseCsv(sampleCsv()), name: SAMPLE_NAME, sample: true, titleRows: 0 });
// Una cota con uno que otro «N/A» sigue siendo cota; se avisa qué celdas no se usaron.
const isMeasure = (g: Grid, i: number) => { const m = readMeasures(g.rows.map(r => r[i] ?? '')), ok = m.nums.filter(Number.isFinite).length; return ok >= 5 && m.bad.length <= ok * 0.1; };
const orNull = (n: number | undefined) => n !== undefined && Number.isFinite(n) ? n : null;

function guess(g: Grid) {
 const group = g.headers.findIndex(h => /^(muestra|subgrupo|grupo|sample|subgroup|lote|hora)/.test(fold(h)));
 const numeric = g.headers.map((_, i) => i !== group && isMeasure(g, i));
 const measure = numeric.lastIndexOf(true);
 const gi = group >= 0 && group !== measure && new Set(g.rows.map(r => r[group])).size < g.rows.length ? group : -1;
 return { measure, group: gi };
}
const fmt = (n: number, d = 3) => Number.isFinite(n) ? n.toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

function ControlChart({ c, kind, lsl, usl, es }: { c: Chart; kind: 'x' | 'r'; lsl?: number; usl?: number; es: boolean }) {
 const W = 760, H = kind === 'x' ? 280 : 130, L = 56, R = 64, T = 14, B = 26;
 const vals = kind === 'x' ? c.points.map(p => p.value) : c.points.map(p => p.range ?? NaN);
 const lines = kind === 'x' ? { cl: c.cl, ucl: c.ucl, lcl: c.lcl } : { cl: c.rCl, ucl: c.rUcl, lcl: c.rLcl };
 const specs = kind === 'x' ? [lsl, usl].filter((v): v is number => Number.isFinite(v)) : [];
 const pool = [...vals.filter(Number.isFinite), lines.ucl, lines.lcl, ...specs];
 let lo = Math.min(...pool), hi = Math.max(...pool); const pad = (hi - lo) * 0.08 || 1; lo -= pad; hi += pad;
 const x = (i: number) => L + (c.points.length > 1 ? i / (c.points.length - 1) : 0.5) * (W - L - R), y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
 const step = (W - L - R) / Math.max(1, c.points.length - 1);
 const s1 = (lines.ucl - lines.cl) / 3;
 const bad = (i: number) => kind === 'x' ? c.points[i].rules.length > 0 : c.rangeOut.includes(i);
 const path = vals.map((v, i) => Number.isFinite(v) ? `${i && Number.isFinite(vals[i - 1]) ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}` : '').join('');
 const label = (v: number, text: string, cls: string, key = cls) => <g key={key} className={cls}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)}/><text x={W - R + 6} y={y(v) + 4}>{text}</text></g>;
 return <svg className={`spc-chart k-${kind}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={kind === 'x' ? (es ? 'Gráfica de promedios con límites de control' : 'Means chart with control limits') : (es ? 'Gráfica de rangos' : 'Range chart')}>
  {c.base < c.points.length && <g className="spc-base"><rect x={L - step / 2} y={T} width={Math.max(0, x(c.base - 1) - L + step)} height={H - T - B}/><text x={L - step / 2 + 6} y={H - B - 6}>{es ? 'cálculo de límites' : 'limits computed here'}</text></g>}
  {kind === 'x' && <><rect className="spc-z2" x={L} width={W - L - R} y={y(lines.cl + 2 * s1)} height={Math.max(0, y(lines.cl - 2 * s1) - y(lines.cl + 2 * s1))}/><rect className="spc-z1" x={L} width={W - L - R} y={y(lines.cl + s1)} height={Math.max(0, y(lines.cl - s1) - y(lines.cl + s1))}/></>}
  {specs.map((v, i) => label(v, `${v === lsl ? (es ? 'LIE' : 'LSL') : (es ? 'LSE' : 'USL')} ${fmt(v, 2)}`, 'spc-spec' + i))}
  {label(lines.ucl, `${es ? 'LSC' : 'UCL'} ${fmt(lines.ucl)}`, 'spc-lim', 'ucl')}
  {kind === 'x' || lines.lcl > 0 ? label(lines.lcl, `${es ? 'LIC' : 'LCL'} ${fmt(lines.lcl)}`, 'spc-lim', 'lcl') : null}
  {label(lines.cl, `${kind === 'x' ? (c.mode === 'I-MR' ? 'X̄' : 'X̿') : c.mode === 'I-MR' ? 'MR̄' : 'R̄'} ${fmt(lines.cl)}`, 'spc-cl')}
  <path className="spc-line" d={path} pathLength={1}/>
  {vals.map((v, i) => Number.isFinite(v) && <circle key={i} className={bad(i) ? 'bad' : ''} cx={x(i)} cy={y(v)} r={bad(i) ? 5.5 : 3.6} style={{ ['--i' as string]: i }}><title>{`${c.points[i].label}: ${fmt(v)}${kind === 'x' && c.points[i].rules.length ? ` · ${c.points[i].rules.map(r => RULES[r][es ? 0 : 1]).join('; ')}` : ''}`}</title></circle>)}
  {c.points.map((p, i) => (c.points.length <= 30 || i % Math.ceil(c.points.length / 25) === 0) && <text key={i} className="spc-x" x={x(i)} y={H - 8}>{p.label}</text>)}
 </svg>;
}

function Histogram({ values, lsl, usl, mean, es }: { values: number[]; lsl?: number; usl?: number; mean: number; es: boolean }) {
 const W = 360, H = 150, bins = 14;
 const pool = [...values, ...[lsl, usl].filter((v): v is number => Number.isFinite(v))];
 const lo = Math.min(...pool), hi = Math.max(...pool), span = hi - lo || 1;
 const counts = Array(bins).fill(0); values.forEach(v => counts[Math.min(bins - 1, Math.floor((v - lo) / span * bins))]++);
 const top = Math.max(...counts), x = (v: number) => 10 + (v - lo) / span * (W - 20);
 return <svg className="spc-hist" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Histograma">
  {counts.map((n, i) => <rect key={i} x={10 + i * (W - 20) / bins + 1} width={(W - 20) / bins - 2} y={H - 22 - n / top * (H - 40)} height={n / top * (H - 40)} rx={2}/>)}
  {[lsl, usl].map((v, i) => Number.isFinite(v) && <g key={i} className="spc-spec"><line x1={x(v!)} x2={x(v!)} y1={8} y2={H - 20}/><text x={x(v!)} y={H - 6}>{i ? (es ? 'LSE' : 'USL') : (es ? 'LIE' : 'LSL')}</text></g>)}
  <line className="spc-mean" x1={x(mean)} x2={x(mean)} y1={8} y2={H - 20}/>
 </svg>;
}

export default function Spc({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es', L = es ? 0 : 1, t = (a: string, b: string) => (es ? a : b);
 const [data, setData] = useState<{ grid: Grid; name: string; sample: boolean; titleRows: number }>(sampleData);
 const first = useMemo(() => guess(data.grid), [data]);
 const [measure, setMeasure] = useState<number | null>(null);
 const [group, setGroup] = useState<number | null>(null);
 // Tolerancias por característica (por nombre de columna): se recuerdan para la siguiente vez que suba el mismo archivo.
 const [saved] = useState(loadSaved);
 const [specs, setSpecs] = useState<Record<string, Spec>>(() => ({ [`${SAMPLE_NAME}|diametro_mm`]: { lsl: String(SAMPLE_SPEC.lsl), usl: String(SAMPLE_SPEC.usl) }, ...saved.specs }));
 const [studies, setStudies] = useState<Study[]>(saved.studies);
 const [base, setBase] = useState(SAMPLE_SPEC.base);
 const [err, setErr] = useState(''), [note, setNote] = useState('');
 const input = useRef<HTMLInputElement>(null), charts = useRef<HTMLDivElement>(null);
 const mi = measure ?? first.measure, gi = group ?? first.group;
 const feature = data.grid.headers[mi] ?? '';
 // La tolerancia del ejemplo no debe colarse en un archivo propio que tenga una columna con el mismo nombre.
 const keyOf = (h: string) => data.sample ? `${SAMPLE_NAME}|${h}` : h;
 const lsl = specs[keyOf(feature)]?.lsl ?? '', usl = specs[keyOf(feature)]?.usl ?? '';
 const setSpec = (k: keyof Spec, v: string) => setSpecs(s => ({ ...s, [keyOf(feature)]: { lsl, usl, [k]: v } }));
 useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ specs, studies })); } catch { /* sin espacio: sigue en memoria */ } }, [specs, studies]);
 const groupsOf = useMemo(() => (col: number) => {
  const g = data.grid, order: string[] = [], map = new Map<string, number[]>(), nums = readMeasures(g.rows.map(r => r[col] ?? '')).nums;
  g.rows.forEach((r, i) => { const k = gi >= 0 ? (r[gi] ?? '').trim() : String(i + 1); if (!map.has(k)) { map.set(k, []); order.push(k); } if (Number.isFinite(nums[i])) map.get(k)!.push(nums[i]); });
  return order.map(k => ({ label: k, values: map.get(k)! }));
 }, [data, gi]);
 const groups = useMemo(() => mi >= 0 ? groupsOf(mi) : [], [groupsOf, mi]);
 const reading = useMemo(() => mi >= 0 ? readMeasures(data.grid.rows.map(r => r[mi] ?? '')) : null, [data, mi]);
 const all = groups.flatMap(g => g.values);
 const c = useMemo(() => mi >= 0 ? buildChart(groups, base || undefined) : null, [groups, base, mi]);
 const num = (s: string) => { const n = toNumber(s.replace(/^(-?\d+),(\d+)$/, '$1.$2')); return Number.isFinite(n) ? n : undefined; };
 const L1 = num(lsl), U1 = num(usl);
 const cap = c ? capability(c, all, L1, U1) : null;
 const v = c ? verdict(c, cap, es) : null;
 const byRule = useMemo(() => { const m = new Map<Rule, string[]>(); c?.points.forEach(p => p.rules.forEach(r => m.set(r, [...(m.get(r) ?? []), p.label]))); return [...m].sort((a, b) => a[0] - b[0]); }, [c]);
 // Un archivo de la máquina de medición trae varias cotas: el resumen las pone todas juntas para ver cuál preocupa.
 const features = useMemo(() => data.grid.headers.map((h, i) => ({ h, i })).filter(({ i }) => i !== gi && isMeasure(data.grid, i)).map(({ h, i }) => {
  const ch = buildChart(groupsOf(i), base || undefined), vals = groupsOf(i).flatMap(g => g.values), sp = specs[keyOf(h)];
  const k = ch ? capability(ch, vals, sp ? num(sp.lsl) : undefined, sp ? num(sp.usl) : undefined) : null;
  return { h, i, ch, k, vd: ch ? verdict(ch, k, es) : null };
 }), [data, gi, groupsOf, base, specs, es]); // eslint-disable-line react-hooks/exhaustive-deps

 // En celular la gráfica se desliza: abre en lo más reciente, que es lo que se vigila.
 useEffect(() => { charts.current?.querySelectorAll('figure').forEach(f => { f.scrollLeft = f.scrollWidth; }); }, [c]);
 async function load(f: File | undefined) {
  if (!f) return;
  try {
   const g = await readTable(f), rows = [g.headers, ...g.rows], h = findHeader(rows);
   setData({ grid: { headers: rows[h].map((x, j) => x.trim() || `${t('Columna', 'Column')} ${j + 1}`), rows: rows.slice(h + 1).filter(r => r.some(x => x.trim())) }, name: f.name, sample: false, titleRows: h });
   setMeasure(null); setGroup(null); setBase(0); setErr(''); setNote('');
  }
  catch { setErr(t(`No pude leer ${f.name}. Usa CSV o Excel.`, `Could not read ${f.name}. Use CSV or Excel.`)); }
 }
 function sample() { setData(sampleData()); setMeasure(null); setGroup(null); setBase(SAMPLE_SPEC.base); setErr(''); setNote(''); }
 function saveStudy() {
  if (!c || !v) return;
  const s: Study = { id: `${data.name}|${feature}|${all.length}|${c.mean.toFixed(6)}`, at: Date.now(), file: data.name, feature, n: all.length, mean: c.mean, sigma: c.sigma, cp: orNull(cap?.cp), cpk: orNull(cap?.cpk), ppk: orNull(cap?.ppk), control: v.control, signals: v.signals, lsl, usl };
  setStudies(x => [s, ...x.filter(y => y.id !== s.id)].slice(0, 60)); setNote(t('Estudio guardado.', 'Study saved.'));
 }
 // Reporte de capacidad para entregar: veredicto, gráficas, señales y la tolerancia contra la que se midió.
 function printReport() {
  if (!c || !v) return;
  const svgs = [...(charts.current?.querySelectorAll('svg.spc-chart') ?? [])].map(s => `<figure>${s.outerHTML}</figure>`).join('');
  const css = `<style>.spc-chart text{font:10px system-ui;fill:#444}.spc-x{text-anchor:middle}.spc-z2{fill:#f4f5f7}.spc-z1{fill:#eaecf0}.spc-lim line{stroke:#b4232f;stroke-dasharray:5 4}.spc-cl line{stroke:#16181d}[class^=spc-spec] line{stroke:#9a6200;stroke-dasharray:2 3}.spc-line{fill:none;stroke:#2b5fd9;stroke-width:1.5}circle{fill:#2b5fd9}circle.bad{fill:#b4232f}.spc-base rect{fill:#2b5fd912}.spc-base text{fill:#666}</style>`;
  const f2 = (n: number | null | undefined) => n === null || n === undefined || !Number.isFinite(n) ? '—' : fmt(n, 2);
  printDoc(t('Estudio de capacidad', 'Capability study'), `${css}
<header><div><h1>${esc(feature)}</h1><p>${t('Estudio de control y capacidad', 'Control and capability study')} · ${esc(data.name)}</p></div><small>${t('Impreso', 'Printed')} ${esc(new Date().toLocaleString(es ? 'es-MX' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }))}</small></header>
<p class="${v.control ? 'ok' : 'bad'}">${esc(v.text)}</p>
<dl class="kpis"><div><dt>${t('Mediciones', 'Measurements')}</dt><dd>${all.length}</dd></div><div><dt>${t('Promedio', 'Mean')}</dt><dd>${fmt(c.mean)}</dd></div><div><dt>Cpk</dt><dd class="${cap ? cap.cpk >= 1.33 ? 'ok' : cap.cpk >= 1 ? 'warn' : 'bad' : ''}">${f2(cap?.cpk)}</dd></div><div><dt>Ppk</dt><dd>${f2(cap?.ppk)}</dd></div></dl>
<p class="note">${c.mode === 'I-MR' ? t('Individuales y rango móvil', 'Individuals and moving range') : t(`X̄-R, subgrupos de ${c.n}`, `X̄-R, subgroups of ${c.n}`)} · ${t('Centro', 'Center')} ${fmt(c.cl)} · ${t('LSC', 'UCL')} ${fmt(c.ucl)} · ${t('LIC', 'LCL')} ${fmt(c.lcl)} · σ ${fmt(c.sigma, 4)} · ${t('Tolerancia', 'Tolerance')} ${esc(lsl || '—')} a ${esc(usl || '—')}${cap ? ` · ${t('fuera de tolerancia', 'out of spec')}: ${cap.outside}` : ''}</p>
<h2>${t('Gráficas', 'Charts')}</h2>${svgs}
<h2>${t('Señales', 'Signals')}</h2>${byRule.length || c.rangeOut.length ? `<table><thead><tr><th>${t('Regla', 'Rule')}</th><th>${t('Muestras', 'Samples')}</th><th>${t('Qué revisar', 'What to check')}</th></tr></thead><tbody>${byRule.map(([r, pts]) => `<tr><td>${r} · ${esc(RULES[r][L])}</td><td>${esc(pts.join(', '))}</td><td>${esc(MEANING[r][L])}</td></tr>`).join('')}${c.rangeOut.length ? `<tr><td>R</td><td>${esc(c.rangeOut.map(i => c.points[i].label).join(', '))}</td><td>${t('Variación dentro de la muestra fuera de límite.', 'Within-sample variation beyond its limit.')}</td></tr>` : ''}</tbody></table>` : `<p class="ok">${t('Ningún punto rompe las reglas.', 'No point breaks the rules.')}</p>`}
${features.length > 1 ? `<h2>${t('Todas las características del archivo', 'Every feature in the file')}</h2><table><thead><tr><th>${t('Característica', 'Feature')}</th><th class="n">${t('Promedio', 'Mean')}</th><th class="n">σ</th><th>${t('Estado', 'State')}</th><th class="n">Cpk</th></tr></thead><tbody>${features.map(x => `<tr><td>${esc(x.h)}</td><td class="n">${x.ch ? fmt(x.ch.mean) : '—'}</td><td class="n">${x.ch ? fmt(x.ch.sigma, 4) : '—'}</td><td class="${x.vd?.control ? 'ok' : 'bad'}">${x.vd ? esc(x.vd.title) : '—'}</td><td class="n">${f2(x.k?.cpk)}</td></tr>`).join('')}</tbody></table>` : ''}
<div class="sign"><div>${t('Elaboró', 'Prepared by')}</div><div>${t('Revisó (Calidad)', 'Reviewed (Quality)')}</div></div>`, lang);
 }
 async function copy() {
  if (!c || !v) return;
  const lines = [`${data.grid.headers[mi]} · ${c.mode === 'I-MR' ? t('individuales', 'individuals') : t(`subgrupos de ${c.n}`, `subgroups of ${c.n}`)}`, v.text,
   `${t('Centro', 'Center')} ${fmt(c.cl)} · ${t('LSC', 'UCL')} ${fmt(c.ucl)} · ${t('LIC', 'LCL')} ${fmt(c.lcl)}`, cap ? `Cp ${fmt(cap.cp, 2)} · Cpk ${fmt(cap.cpk, 2)} · ${t('fuera de tolerancia', 'out of tolerance')}: ${cap.outside}` : '',
   ...byRule.map(([r, pts]) => `• ${RULES[r][L]}: ${pts.join(', ')}`)].filter(Boolean);
  try { await navigator.clipboard.writeText(lines.join('\n')); setNote(t('Resumen copiado.', 'Summary copied.')); } catch { setNote(''); }
 }

 return <div className="spc">
  <div className="spc-top">
   <div className="spc-file"><strong>{data.name}</strong><small>{all.length} {t('mediciones', 'measurements')}{data.sample ? t(' · ejemplo: diámetro de un buje, 5 piezas cada media hora', ' · sample: bushing diameter, 5 parts every half hour') : ''}</small></div>
   <div className="spc-actions"><input ref={input} type="file" accept={TABLE_ACCEPT} hidden onChange={e => { void load(e.target.files?.[0]); e.target.value = ''; }}/>
    <button className="dw-primary" onClick={() => input.current?.click()}><UploadSimple size={17}/>{t('Subir mediciones', 'Upload measurements')}</button>{!data.sample && <button onClick={sample}>{t('Volver al ejemplo', 'Back to sample')}</button>}</div>
  </div>
  {err && <p className="spc-err" role="alert">{err}</p>}
  <div className="spc-setup">
   <label>{t('Medición', 'Measurement')}<select value={mi} onChange={e => setMeasure(+e.target.value)}>{data.grid.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}</select></label>
   <label>{t('Agrupar por', 'Group by')}<select value={gi} onChange={e => setGroup(+e.target.value)}><option value={-1}>{t('Cada fila es un punto', 'Each row is a point')}</option>{data.grid.headers.map((h, i) => i !== mi && <option key={i} value={i}>{h}</option>)}</select></label>
   <label>{t('Tolerancia mínima (LIE)', 'Lower spec (LSL)')}<input inputMode="decimal" value={lsl} placeholder="—" onChange={e => setSpec('lsl', e.target.value)}/></label>
   <label>{t('Tolerancia máxima (LSE)', 'Upper spec (USL)')}<input inputMode="decimal" value={usl} placeholder="—" onChange={e => setSpec('usl', e.target.value)}/></label>
   <label>{t('Límites con', 'Limits from')}<select value={base} onChange={e => setBase(+e.target.value)}><option value={0}>{t('todos los puntos', 'all points')}</option>{[10, 15, 20, 25].filter(n => n < groups.length).map(n => <option key={n} value={n}>{t(`los primeros ${n}`, `the first ${n}`)}</option>)}</select></label>
  </div>
  {reading && (data.titleRows > 0 || reading.decimalComma || reading.bad.length > 0) && <ul className="spc-read" aria-label={t('Cómo se leyó el archivo', 'How the file was read')}>
   {data.titleRows > 0 && <li><Info size={15} aria-hidden="true"/>{t(`Los encabezados están en la fila ${data.titleRows + 1}; lo de arriba era el título del reporte.`, `Headers are on row ${data.titleRows + 1}; the rows above were the report title.`)}</li>}
   {reading.decimalComma && <li><Info size={15} aria-hidden="true"/>{t('Los números traen coma decimal (25,012): se leyeron como 25.012.', 'Numbers use a decimal comma (25,012): read as 25.012.')}</li>}
   {reading.bad.length > 0 && <li className="warn"><WarningOctagon size={15} aria-hidden="true"/>{t(`${reading.bad.length} ${reading.bad.length === 1 ? 'celda no es número y no se usó' : 'celdas no son números y no se usaron'}: `, `${reading.bad.length} cell${reading.bad.length === 1 ? ' is' : 's are'} not numbers and were skipped: `)}{reading.bad.slice(0, 6).map(i => t(`fila ${i + data.titleRows + 2} («${data.grid.rows[i][mi]}»)`, `row ${i + data.titleRows + 2} ("${data.grid.rows[i][mi]}")`)).join(', ')}{reading.bad.length > 6 ? '…' : ''}</li>}
  </ul>}
  {!c && <p className="spc-err">{t('Hacen falta al menos 5 mediciones numéricas en la columna elegida.', 'At least 5 numeric measurements are needed in the chosen column.')}</p>}
  {c && v && <>
   <section className={`spc-verdict ${v.control ? 'ok' : 'bad'}`}>
    <div className="spc-state">{v.control ? <CheckCircle size={30} weight="fill"/> : <WarningOctagon size={30} weight="fill"/>}<div><strong>{v.title}</strong>{v.detail && <span className="spc-detail">{v.detail[0].toUpperCase() + v.detail.slice(1)}</span>}<small>{c.mode === 'I-MR' ? t('Gráfica de individuales y rango móvil (I-MR)', 'Individuals and moving range chart (I-MR)') : t(`Gráfica X̄-R con subgrupos de ${c.n}`, `X̄-R chart, subgroups of ${c.n}`)}{c.base < c.points.length ? t(` · límites con los primeros ${c.base}`, ` · limits from the first ${c.base}`) : ''}</small></div></div>
    <dl className="spc-kpis">
     <div><dt>{t('Promedio', 'Mean')}</dt><dd>{fmt(c.mean)}</dd></div>
     <div><dt>σ</dt><dd>{fmt(c.sigma, 4)}</dd></div>
     {cap && <><div className={`cap-${cap.cpk >= 1.33 ? 'good' : cap.cpk >= 1 ? 'mid' : 'low'}`}><dt>Cpk</dt><dd>{fmt(cap.cpk, 2)}</dd></div>
      <div><dt>Cp</dt><dd>{fmt(cap.cp, 2)}</dd></div>
      <div className={cap.outside ? 'cap-low' : ''}><dt>{t('Fuera de tolerancia', 'Out of spec')}</dt><dd>{cap.outside}<small> / {all.length}</small></dd></div></>}
    </dl>
   </section>
   <div className="spc-charts" ref={charts}>
    <p className="spc-swipe">{t('Desliza la gráfica para ver las muestras anteriores.', 'Swipe the chart to see earlier samples.')}</p>
    <figure tabIndex={0} aria-label={t('Gráfica de control, se puede deslizar', 'Control chart, scrollable')}><figcaption>{c.mode === 'I-MR' ? t('Cada medición', 'Each measurement') : t('Promedio de cada muestra', 'Mean of each sample')}</figcaption><ControlChart c={c} kind="x" lsl={L1} usl={U1} es={es}/></figure>
    <figure tabIndex={0} aria-label={t('Gráfica de rangos, se puede deslizar', 'Range chart, scrollable')}><figcaption>{c.mode === 'I-MR' ? t('Rango móvil (cambio entre una pieza y la siguiente)', 'Moving range (change from one part to the next)') : t('Rango dentro de cada muestra', 'Range within each sample')}</figcaption><ControlChart c={c} kind="r" es={es}/></figure>
   </div>
   <div className="spc-split">
    <section className="spc-signals">
     <h3>{t('Qué avisa y qué revisar', 'What it flags and what to check')}</h3>
     {!byRule.length && !c.rangeOut.length && <p className="spc-okmsg"><CheckCircle size={18}/>{t('Ningún punto rompe las reglas: la variación es la normal del proceso.', 'No point breaks the rules: the variation is the process’s normal one.')}</p>}
     <ol>{byRule.map(([r, pts]) => <li key={r}><span className="spc-rule">{t('Regla', 'Rule')} {r}</span><div><strong>{RULES[r][L]}</strong><small>{t('Muestras', 'Samples')} {pts.join(', ')}</small><p>{MEANING[r][L]}</p></div></li>)}
      {c.rangeOut.length > 0 && <li><span className="spc-rule">R</span><div><strong>{t('Variación dentro de la muestra fuera de límite', 'Within-sample variation beyond its limit')}</strong><small>{t('Muestras', 'Samples')} {c.rangeOut.map(i => c.points[i].label).join(', ')}</small><p>{t('Las piezas de un mismo momento salieron muy distintas entre sí: sujeción floja, material disparejo o un error al medir.', 'Parts from the same moment came out very different: loose clamping, uneven material or a measuring error.')}</p></div></li>}</ol>
    </section>
    <section className="spc-dist">
     <h3>{t('Contra la tolerancia', 'Against the tolerance')}</h3>
     <Histogram values={all} lsl={L1} usl={U1} mean={c.mean} es={es}/>
     <p>{cap ? (cap.cpk >= 1.33 ? t('El proceso cabe en la tolerancia con margen (Cpk ≥ 1.33).', 'The process fits the tolerance with room (Cpk ≥ 1.33).') : cap.cpk >= 1 ? t('Cabe, pero justo: un corrimiento pequeño ya saca piezas (1 ≤ Cpk < 1.33).', 'It fits, barely: a small shift already produces bad parts (1 ≤ Cpk < 1.33).') : t('No cabe: aunque esté bajo control, saldrán piezas fuera de tolerancia (Cpk < 1).', 'It does not fit: even in control, parts will fall out of tolerance (Cpk < 1).')) : t('Escribe la tolerancia para saber si el proceso la alcanza.', 'Enter the tolerance to see if the process can hold it.')}</p>
     <div className="spc-do">
      <button className="dw-primary" onClick={printReport}><Printer size={16}/>{t('Imprimir o PDF', 'Print or PDF')}</button>
      <button onClick={saveStudy}><FloppyDisk size={16}/>{t('Guardar estudio', 'Save study')}</button>
      <button onClick={() => void copy()}><Copy size={16}/>{t('Copiar resumen', 'Copy summary')}</button>
     </div>
     {note && <span className="spc-note" role="status">{note}</span>}
    </section>
   </div>
   {features.length > 1 && <section className="spc-features">
    <h3>{t('Todas las cotas del archivo', 'Every dimension in the file')}<span>{t('Toca una para verla en la gráfica. La tolerancia de cada una se recuerda.', 'Tap one to chart it. Each tolerance is remembered.')}</span></h3>
    <div className="spc-scroll"><table>
     <thead><tr><th scope="col">{t('Característica', 'Feature')}</th><th scope="col">{t('Promedio', 'Mean')}</th><th scope="col">σ</th><th scope="col">{t('Estado', 'State')}</th><th scope="col">Cpk</th></tr></thead>
     <tbody>{features.map(x => <tr key={x.i} className={x.i === mi ? 'is-on' : ''}>
      <th scope="row"><button aria-pressed={x.i === mi} onClick={() => setMeasure(x.i)}>{x.h}</button></th>
      <td>{x.ch ? fmt(x.ch.mean) : '—'}</td><td>{x.ch ? fmt(x.ch.sigma, 4) : '—'}</td>
      <td className={x.vd ? x.vd.control ? 'ok' : 'bad' : ''}>{x.vd ? x.vd.title : '—'}</td>
      <td className={x.k ? x.k.cpk >= 1.33 ? 'ok' : x.k.cpk >= 1 ? 'mid' : 'bad' : ''}>{x.k ? fmt(x.k.cpk, 2) : t('sin tolerancia', 'no tolerance')}</td></tr>)}</tbody>
    </table></div>
   </section>}
  </>}
  {studies.length > 0 && <section className="spc-studies">
   <h3>{t('Estudios guardados', 'Saved studies')}<span>{t('Para ver si el Cpk mejora después de un ajuste.', 'To see whether Cpk improves after an adjustment.')}</span></h3>
   <div className="spc-scroll"><table>
    <thead><tr><th scope="col">{t('Fecha', 'Date')}</th><th scope="col">{t('Característica', 'Feature')}</th><th scope="col">n</th><th scope="col">{t('Promedio', 'Mean')}</th><th scope="col">Cpk</th><th scope="col">{t('Estado', 'State')}</th><th scope="col"><span className="spc-sr">{t('Borrar', 'Delete')}</span></th></tr></thead>
    <tbody>{studies.map((s, i) => { const prev = studies.slice(i + 1).find(o => o.feature === s.feature), d = prev && s.cpk !== null && prev.cpk !== null ? s.cpk - prev.cpk : null;
     return <tr key={s.id}><td>{new Date(s.at).toLocaleDateString(es ? 'es-MX' : 'en-US', { day: 'numeric', month: 'short' })}</td><th scope="row">{s.feature}<small>{s.file}</small></th><td>{s.n}</td><td>{fmt(s.mean)}</td>
      <td className={s.cpk === null ? '' : s.cpk >= 1.33 ? 'ok' : s.cpk >= 1 ? 'mid' : 'bad'}>{s.cpk === null ? '—' : fmt(s.cpk, 2)}{d !== null && Math.abs(d) >= .005 && <em className={d > 0 ? 'up' : 'down'}>{d > 0 ? '▲' : '▼'} {fmt(Math.abs(d), 2)}</em>}</td>
      <td className={s.control ? 'ok' : 'bad'}>{s.control ? t('Bajo control', 'In control') : t(`${s.signals} señales`, `${s.signals} signals`)}</td>
      <td><button className="spc-icon" aria-label={t(`Borrar estudio de ${s.feature}`, `Delete ${s.feature} study`)} onClick={() => setStudies(x => x.filter(y => y.id !== s.id))}><Trash size={16}/></button></td></tr>; })}</tbody>
   </table></div>
  </section>}
 </div>;
}
