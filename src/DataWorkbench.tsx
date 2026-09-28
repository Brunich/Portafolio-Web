import { useMemo, useRef, useState } from 'react';
import { exportCsv, parseCsv, profileColumns } from './csv';
import { readTable, TABLE_ACCEPT } from './read-file';
import type { ColumnProfile, CsvData } from './csv';
import { detectIssues } from './quality';
import type { Issue } from './quality';
import { SAMPLES } from './samples';
import CsvMindMap from './CsvMindMap';
import Found, { doneOf } from './CsvFound';
import type { Done } from './CsvFound';
import { personal } from './personal';
import CsvCharts from './CsvCharts';
import type { Table } from './CsvCharts';
import CsvSql from './CsvSql';
import './data-workbench.css';

const LIMIT = 20 * 1024 * 1024;

function ColumnChart({ p }: { p: ColumnProfile }) {
 if (p.kind === 'number' && p.numbers && p.min !== undefined && p.max !== undefined) {
  const bins = Array(8).fill(0), span = p.max - p.min || 1;
  p.numbers.forEach(n => bins[Math.min(7, Math.floor((n - p.min!) / span * 8))]++);
  const top = Math.max(...bins);
  return <svg className="dw-spark" viewBox="0 0 160 40" preserveAspectRatio="none" aria-hidden="true">{bins.map((b, i) => <rect key={i} x={i * 20 + 1} y={40 - b / top * 38} width="18" height={b / top * 38} rx="2"/>)}</svg>;
 }
 if (p.kind === 'date' && p.perDay) {
  const top = Math.max(...p.perDay.map(d => d[1])), w = 160 / p.perDay.length;
  return <svg className="dw-spark" viewBox="0 0 160 40" preserveAspectRatio="none" aria-hidden="true">{p.perDay.map(([d, n], i) => <rect key={d} x={i * w + 1} y={40 - n / top * 38} width={Math.max(2, w - 2)} height={n / top * 38} rx="2"/>)}</svg>;
 }
 if (p.kind === 'category') {
  const top = p.top[0]?.[1] ?? 1;
  return <ul className="dw-bars">{p.top.slice(0, 4).map(([v, n]) => <li key={v}><span>{v}</span><i style={{ width: `${n / top * 100}%` }}/><b>{n}</b></li>)}</ul>;
 }
 return null;
}

export default function DataWorkbench({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es', L = es ? 0 : 1;
 const t = (a: string, b: string) => es ? a : b;
 const [original, setOriginal] = useState<CsvData>(() => parseCsv(SAMPLES[0].csv));
 const [rows, setRows] = useState<string[][]>(() => parseCsv(SAMPLES[0].csv).rows);
 const [source, setSource] = useState<string>(SAMPLES[0].id);
 const [fileName, setFileName] = useState(SAMPLES[0].file);
 const [done, setDone] = useState<Done[]>([]);
 const [hover, setHover] = useState<number | null>(null);
 const [focusIssue, setFocusIssue] = useState<string | null>(null);
 const [dragging, setDragging] = useState(false);
 const [error, setError] = useState('');
 const [note, setNote] = useState('');
 const [query, setQuery] = useState('');
 const [allCols, setAllCols] = useState(false);
 const [version, setVersion] = useState(0);
 const [showAll, setShowAll] = useState(false);
 const upload = useRef<HTMLInputElement>(null);
 const tableTop = useRef<HTMLDivElement>(null), found = useRef<HTMLDivElement>(null);
 const [tab, setTab] = useState<'clean' | 'chart' | 'sql'>('clean');
 const [chartFrom, setChartFrom] = useState<Table | null>(null);
 const headers = original.headers;

 const issues = useMemo(() => detectIssues(headers, rows), [headers, rows]);
 const whole = useMemo<Table>(() => ({ headers, rows, name: fileName }), [headers, rows, fileName]);
 const profile = useMemo(() => profileColumns(headers, rows), [headers, rows]);
 const flagged = useMemo(() => {
  const m = new Map<string, Issue['severity']>();
  issues.filter(i => !focusIssue || i.id === focusIssue).forEach(i => i.cells.forEach(([r, c]) => { const k = `${r},${c}`; if (!m.has(k)) m.set(k, i.severity); }));
  return m;
 }, [issues, focusIssue]);
 const filled = rows.length * headers.length ? Math.round(rows.reduce((n, r) => n + r.filter(v => v.trim()).length, 0) / (rows.length * headers.length) * 1000) / 10 : 0;
 const sample = SAMPLES.find(s => s.id === source);
 const matches = rows.map((r, i) => [r, i] as const).filter(([r]) => !query || r.some(v => v.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))));
 const focusRows = focusIssue ? new Set(issues.find(i => i.id === focusIssue)?.cells.map(([r]) => r)) : null;
 const visible = (focusRows ? matches.filter(([, i]) => focusRows.has(i)) : matches).slice(0, showAll ? 500 : 10);

 const load = (data: CsvData, id: string, name: string) => { setOriginal(data); setRows(data.rows); setSource(id); setFileName(name); setDone([]); setFocusIssue(null); setQuery(''); setChartFrom(null); setError(''); setNote(''); setShowAll(false); setVersion(v => v + 1); };
 const apply = (issue: Issue) => { if (!issue.fix) return; setRows(r => issue.fix!(r)); setDone(d => [...d, doneOf(issue)]); setFocusIssue(null); };
 const applyAll = () => { let r = rows; const fixed: Done[] = []; for (let pass = 0; pass < 4; pass++) { const next = detectIssues(headers, r).filter(i => i.fix); if (!next.length) break; next.forEach(i => { r = i.fix!(r); fixed.push(doneOf(i)); }); } setRows(r); setDone(d => [...d, ...fixed]); setFocusIssue(null); };
 function describeError(err: unknown) {
  const [kind, row, expected, actual] = (err instanceof Error ? err.message : 'READ').split(':');
  if (kind === 'ROW_WIDTH') return t(`La fila ${row} tiene ${actual} columnas y el encabezado ${expected}. Revisa separadores y comillas.`, `Row ${row} has ${actual} columns and the header ${expected}. Check delimiters and quotes.`);
  if (kind === 'EMPTY') return t('El archivo está vacío.', 'The file is empty.');
  if (kind === 'SIZE') return t('El archivo supera 20 MB.', 'The file exceeds 20 MB.');
  if (kind === 'TYPE') return t('Elige un CSV, TSV o Excel (.xlsx, .xls).', 'Choose a CSV, TSV or Excel file (.xlsx, .xls).');
  if (kind === 'UNCLOSED_QUOTE' || kind === 'INVALID_QUOTE') return t(`Comillas inválidas en la fila ${row}.`, `Invalid quotes in row ${row}.`);
  return t('No se pudo leer el archivo. Si es de Excel, prueba guardarlo como .xlsx.', 'Could not read the file. If it comes from Excel, try saving it as .xlsx.');
 }
 async function loadFile(file: File) {
  try {
   if (file.size > LIMIT) throw new Error('SIZE');
   const data = await readTable(file);
   load(data, 'file', file.name);
   const f = data.fixes;
   const n = (k: number, one: string, many: string) => k ? `${k} ${k === 1 ? one : many}` : '';
   if (f && (f.short || f.long || f.blank)) setNote(t(
    `Lo abrí ajustando: ${[n(f.blank, 'línea vacía saltada', 'líneas vacías saltadas'), n(f.short, 'fila corta completada', 'filas cortas completadas'), n(f.long, 'fila con datos de más (nueva columna)', 'filas con datos de más (nueva columna)')].filter(Boolean).join(', ')}. No se perdió ningún dato.`,
    `Opened with adjustments: ${[n(f.blank, 'blank line skipped', 'blank lines skipped'), n(f.short, 'short row padded', 'short rows padded'), n(f.long, 'row with extra data (new column)', 'rows with extra data (new column)')].filter(Boolean).join(', ')}. No data was lost.`));
  } catch (err) { setError(describeError(err)); }
 }
 function download() {
  const url = URL.createObjectURL(new Blob(['﻿', exportCsv(headers, rows)], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = fileName.replace(/\.csv$/i, '') + '_limpio.csv'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
 }

 return <div className={`dw-workbench${dragging ? ' dw-dragging' : ''}`} aria-label={t('Analizador de CSV', 'CSV analyzer')}
  onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={e => { if (e.currentTarget === e.target) setDragging(false); }}
  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void loadFile(f); }}>
  {dragging && <div className="dw-dropveil" aria-hidden="true">{t('Suelta tu CSV aquí', 'Drop your CSV here')}</div>}

  <header className="dw-top">
   <div className="dw-file"><span className="dw-fileicon" aria-hidden="true">CSV</span><div><strong>{fileName}</strong><small>{sample ? `${t('Datos sintéticos', 'Synthetic data')} · ${sample.context[L]}` : t('Tu archivo · se procesa sólo en este navegador', 'Your file · processed only in this browser')}</small></div></div>
   <div className="dw-sources">
    {SAMPLES.map(s => <button key={s.id} aria-pressed={source === s.id} onClick={() => { const d = parseCsv(s.csv); load(d, s.id, s.file); }}>{s.title[L]}</button>)}
    <input ref={upload} type="file" accept={TABLE_ACCEPT} hidden onChange={e => { const f = e.target.files?.[0]; if (f) void loadFile(f); e.target.value = ''; }}/>
    <button className="dw-primary" onClick={() => upload.current?.click()}>{t('Subir el tuyo', 'Upload yours')} <span aria-hidden="true">↑</span></button>
   </div>
  </header>
  {sample && <div className="dw-yours">
   <p><strong>{t('Esto es un ejemplo', 'This is a sample')}</strong> {t('con formato de reporte real; los datos son inventados.', 'shaped like a real report; the data is made up.')}</p>
   <div><button className="dw-primary" onClick={() => upload.current?.click()}>{t('Sube el tuyo', 'Upload yours')} <span aria-hidden="true">↑</span></button><a href={`mailto:${personal.email}?subject=${encodeURIComponent(t('CSV para revisar', 'CSV to review'))}`}>{t('o mándamelo y lo reviso', 'or send it to me')}</a></div>
  </div>}
  {note && <p className="dw-note" role="status">{note}</p>}
  {error && <p className="dw-error" role="alert">{error} {t('Se conserva el análisis anterior.', 'The previous analysis is kept.')}</p>}

  <dl className="dw-kpis">
   <div><dt>{t('Filas', 'Rows')}</dt><dd>{rows.length}</dd></div>
   <div><dt>{t('Columnas', 'Columns')}</dt><dd>{headers.length}</dd></div>
   <div><dt>{t('Celdas con dato', 'Filled cells')}</dt><dd>{filled}<small>%</small></dd></div>
   <div className={issues.some(i => i.severity !== 'info') ? 'dw-kpi-warn' : 'dw-kpi-ok'}><dt>{t('Problemas', 'Issues')}</dt><dd>{issues.filter(i => i.severity !== 'info').length}</dd></div>
  </dl>

  <div className="dw-tabs" role="tablist" aria-label={t('Qué hacer con el archivo', 'What to do with the file')}>
   {([['clean', t('Revisar y limpiar', 'Review & clean')], ['chart', t('Graficar', 'Chart')], ['sql', t('Preguntar con SQL', 'Ask with SQL')]] as const).map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>)}
  </div>
  {tab === 'chart' && <CsvCharts key={`${version}:${chartFrom ? 'sql' : 'all'}`} lang={lang} table={chartFrom ?? whole} onBack={chartFrom ? () => setChartFrom(null) : undefined}/>}
  {tab === 'sql' && <CsvSql key={version} lang={lang} table={whole} onChart={r => { setChartFrom(r); setTab('chart'); }}/>}
  {tab === 'clean' && <>

  <section className="dw-structure" aria-label={t('Cómo está organizado', 'How it is organized')}>
   <h3>{t('Cómo está organizado', 'How it is organized')}</h3>
   <CsvMindMap lang={lang} file={fileName} rows={rows.length} columns={profile} hover={hover} onHover={setHover} runKey={`${version}`}/>
  </section>

  <section className={`dw-columns${allCols ? ' is-open' : ''}`} style={{ '--cols': Math.ceil(profile.length / Math.ceil(profile.length / 5)) } as React.CSSProperties} aria-label={t('Columnas', 'Columns')}>
   {profile.map((p, i) => <article key={p.name} className={`dw-col kind-${p.kind}${hover === i ? ' is-hot' : ''}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
    <header><strong>{p.name}</strong><span>{({ number: t('número', 'number'), date: t('fecha', 'date'), category: t('categoría', 'category'), text: t('texto', 'text') })[p.kind]}</span></header>
    <p>{p.kind === 'number' ? `${t('de', 'from')} ${p.min?.toLocaleString('es-MX')} ${t('a', 'to')} ${p.max?.toLocaleString('es-MX')} · ${t('mediana', 'median')} ${p.median?.toLocaleString('es-MX')}` : p.kind === 'date' ? `${p.from} → ${p.to}` : `${p.unique} ${t('valores distintos', 'distinct values')}`}{p.blanks ? ` · ${p.blanks} ${t(p.blanks === 1 ? 'vacío' : 'vacíos', 'blank')}` : ''}</p>
    <ColumnChart p={p}/>
   </article>)}
  </section>
  {profile.length > 4 && <button className="dw-morecols" aria-expanded={allCols} onClick={() => setAllCols(!allCols)}>{allCols ? t('Ver menos columnas', 'Show fewer columns') : t(`Ver las ${profile.length} columnas`, `Show all ${profile.length} columns`)}</button>}

  <div className="dw-tabletools" ref={tableTop}>
   <label className="dw-search"><span className="dw-visually-hidden">{t('Buscar en la tabla', 'Search the table')}</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('Buscar en la tabla…', 'Search the table…')}/></label>
   {focusIssue ? <button onClick={() => setFocusIssue(null)}>{t('Ver todas las filas', 'Show all rows')} ✕</button>
    : issues.length > 0 && <button className="dw-jump" onClick={() => found.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{t('Las celdas marcadas tienen algo raro · ver qué', 'Marked cells have something off · see what')} ↓</button>}
  </div>
  <div className="dw-tablewrap" tabIndex={0} role="region" aria-label={t('Datos', 'Data')}><table>
   <thead><tr><th scope="col" className="dw-rownum">#</th>{headers.map((h, i) => <th key={i} scope="col" className={hover === i ? 'dw-hot' : ''} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>{h}</th>)}</tr></thead>
   <tbody>{visible.map(([row, r]) => <tr key={r}><td className="dw-rownum">{r + 2}</td>{row.map((v, c) => { const f = flagged.get(`${r},${c}`); return <td key={c} className={`${hover === c ? 'dw-hot' : ''}${f ? ` flag-${f}` : ''}`}>{v.trim() ? <span className="dw-cell">{v}</span> : <span className="dw-empty">{t('vacío', 'blank')}</span>}</td>; })}</tr>)}</tbody>
  </table></div>
  <div className="dw-footer">
   <span>{t(`${visible.length} de ${rows.length} filas`, `${visible.length} of ${rows.length} rows`)}{!showAll && matches.length > 10 && <button className="dw-link" onClick={() => setShowAll(true)}>{t('ver todas', 'show all')}</button>}</span>
   <button className="dw-primary" onClick={download}>{t('Descargar CSV limpio', 'Download clean CSV')} <span aria-hidden="true">↓</span></button>
  </div>
  <div ref={found}><Found lang={lang} issues={issues} rows={rows.length} done={done} focus={focusIssue} runKey={`${version}`}
   onFix={apply} onFixAll={applyAll} onUndo={() => { setRows(original.rows); setDone([]); }}
   onShow={id => { setFocusIssue(id); tableTop.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}/></div>
  </>}
 </div>;
}
