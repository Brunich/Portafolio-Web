import { useEffect, useMemo, useRef, useState } from 'react';
import type { Database, SqlJsStatic } from 'sql.js';
import { profileColumns } from './csv';
import type { ColumnProfile } from './csv';
import { toNumber } from './quality';
import type { Table } from './CsvCharts';

// Preguntarle al CSV en SQL: SQLite real (sql.js, WebAssembly) dentro del navegador.
// El archivo se vuelve la tabla «datos»; los números se guardan como números y las fechas en AAAA-MM-DD.
let engine: Promise<SqlJsStatic> | null = null;
const loadEngine = () => engine ??= Promise.all([import('sql.js'), import('sql.js/dist/sql-wasm.wasm?url')]).then(([m, w]) => m.default({ locateFile: () => w.default }));
const q = (name: string) => `"${name.replace(/"/g, '""')}"`;
const iso = (v: string) => { const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v.trim()); return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : v.trim(); };

function examples(p: ColumnProfile[], es: boolean): [string, string][] {
 const num = p.filter(c => c.kind === 'number'), cat = p.filter(c => c.kind === 'category'), date = p.find(c => c.kind === 'date');
 const out: [string, string][] = [[es ? 'Primeras 10 filas' : 'First 10 rows', 'SELECT *\nFROM datos\nLIMIT 10;']];
 if (cat[0] && num[0]) out.push([es ? `Total de ${num.at(-1)!.name} por ${cat[0].name}` : `Total ${num.at(-1)!.name} by ${cat[0].name}`, `SELECT ${q(cat[0].name)}, SUM(${q(num.at(-1)!.name)}) AS total\nFROM datos\nGROUP BY ${q(cat[0].name)}\nORDER BY total DESC;`]);
 if (cat[0]) out.push([es ? `Cuántas filas por ${cat[0].name}` : `Rows per ${cat[0].name}`, `SELECT ${q(cat[0].name)}, COUNT(*) AS filas\nFROM datos\nGROUP BY 1\nORDER BY filas DESC;`]);
 if (num.length > 1) out.push([es ? 'Porcentaje entre dos columnas' : 'Ratio of two columns', `SELECT ${cat[0] ? `${q(cat[0].name)}, ` : ''}ROUND(100.0 * SUM(${q(num.at(-1)!.name)}) / SUM(${q(num[0].name)}), 2) AS porcentaje\nFROM datos${cat[0] ? `\nGROUP BY 1\nORDER BY porcentaje DESC` : ''};`]);
 if (date && num[0]) out.push([es ? 'Por día' : 'Per day', `SELECT ${q(date.name)} AS dia, SUM(${q(num[0].name)}) AS total\nFROM datos\nGROUP BY dia\nORDER BY dia;`]);
 if (num[0]) out.push([es ? `Arriba del promedio de ${num[0].name}` : `Above average ${num[0].name}`, `SELECT *\nFROM datos\nWHERE ${q(num[0].name)} > (SELECT AVG(${q(num[0].name)}) FROM datos)\nORDER BY ${q(num[0].name)} DESC;`]);
 return out;
}

export default function CsvSql({ lang, table, onChart }: { lang: 'es' | 'en'; table: Table; onChart: (t: Table) => void }) {
 const es = lang === 'es', t = (a: string, b: string) => es ? a : b;
 const profile = useMemo(() => profileColumns(table.headers, table.rows), [table]);
 const ex = useMemo(() => examples(profile, es), [profile, es]);
 const [sql, setSql] = useState(() => ex[1]?.[1] ?? ex[0][1]);
 const [result, setResult] = useState<{ headers: string[]; rows: string[][]; ms: number } | null>(null);
 const [err, setErr] = useState('');
 const [ready, setReady] = useState(false);
 const db = useRef<Database | null>(null);
 const area = useRef<HTMLTextAreaElement>(null);

 useEffect(() => {
  let alive = true;
  setReady(false);
  void loadEngine().then(SQL => {
   if (!alive) return;
   db.current?.close();
   const d = new SQL.Database();
   d.run(`CREATE TABLE datos (${table.headers.map((h, i) => `${q(h)} ${profile[i].kind === 'number' ? 'REAL' : 'TEXT'}`).join(', ')});`);
   const ins = d.prepare(`INSERT INTO datos VALUES (${table.headers.map(() => '?').join(',')})`);
   d.run('BEGIN');
   table.rows.forEach(r => ins.run(r.map((v, i) => { const k = profile[i].kind; if (!v.trim()) return null; if (k === 'number') { const n = toNumber(v); return Number.isNaN(n) ? v : n; } return k === 'date' ? iso(v) : v.trim(); })));
   d.run('COMMIT'); ins.free();
   db.current = d; setReady(true);
   runSql(sql, d);
  }).catch(() => setErr(t('No se pudo cargar el motor de SQL.', 'Could not load the SQL engine.')));
  return () => { alive = false; };
 }, [table]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(() => () => db.current?.close(), []);

 function runSql(text = sql, d = db.current) {
  if (!d) return;
  const t0 = performance.now();
  try {
   const res = d.exec(text);
   const last = res.at(-1);
   setResult({ headers: last?.columns ?? [], rows: (last?.values ?? []).map(r => r.map(v => v === null ? '' : typeof v === 'number' ? String(+v.toFixed(6)) : String(v))), ms: performance.now() - t0 });
   setErr('');
  } catch (e) { setErr((e as Error).message.replace(/^Error: /, '')); }
 }
 const insert = (text: string) => { const el = area.current; if (!el) return; const s = el.selectionStart, e = el.selectionEnd; const next = sql.slice(0, s) + text + sql.slice(e); setSql(next); requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = s + text.length; }); };
 const download = () => { if (!result) return; const url = URL.createObjectURL(new Blob(['﻿' + [result.headers, ...result.rows].map(r => r.map(v => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'consulta.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };

 return <div className="sq">
  <aside className="sq-schema">
   <h3>{t('Tabla', 'Table')} <code>datos</code></h3>
   <span className="sq-meta">{table.rows.length} {t('filas · toca una columna para escribirla', 'rows · tap a column to insert it')}</span>
   {table.headers.map((h, i) => <button key={h} onClick={() => insert(/^[a-z_][a-z0-9_]*$/i.test(h) ? h : q(h))}>{h}<small>{profile[i].kind === 'number' ? t('número', 'number') : profile[i].kind === 'date' ? t('fecha', 'date') : t('texto', 'text')}</small></button>)}
  </aside>
  <div className="sq-main">
   <div className="sq-examples" aria-label={t('Ejemplos', 'Examples')}>{ex.map(([label, text]) => <button key={label} onClick={() => { setSql(text); runSql(text); }}>{label}</button>)}</div>
   <div className="sq-editor"><textarea ref={area} value={sql} spellCheck={false} aria-label={t('Consulta SQL', 'SQL query')} onChange={e => setSql(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runSql(); } }}/></div>
   <div className="sq-run">
    <button className="dw-primary" disabled={!ready} onClick={() => runSql()}>{ready ? t('Ejecutar', 'Run') : t('Cargando SQLite…', 'Loading SQLite…')}</button>
    <small>Ctrl + Enter</small>
    {result && result.headers.length > 0 && <><button onClick={() => onChart({ headers: result.headers, rows: result.rows, name: t('Resultado de la consulta', 'Query result') })}>{t('Graficar este resultado', 'Chart this result')}</button><button onClick={download}>{t('Descargar resultado', 'Download result')}</button></>}
   </div>
   {err && <p className="sq-err" role="alert">{err}</p>}
   {result && !err && <>
    <span className="sq-meta" role="status">{result.headers.length ? t(`${result.rows.length} ${result.rows.length === 1 ? 'fila' : 'filas'} en ${result.ms.toFixed(1)} ms`, `${result.rows.length} rows in ${result.ms.toFixed(1)} ms`) : t('Listo (sin filas que mostrar).', 'Done (no rows to show).')}</span>
    {result.headers.length > 0 && <div className="dw-tablewrap" tabIndex={0} role="region" aria-label={t('Resultado', 'Result')}><table><thead><tr>{result.headers.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead><tbody>{result.rows.slice(0, 200).map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
   </>}
  </div>
 </div>;
}
