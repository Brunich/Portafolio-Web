import { useMemo, useRef, useState } from 'react';
import { compareTables, guessKey, changesByColumn, diffRows } from './compare';
import type { Table as Plain } from './compare';
import { exportCsv } from './csv';
import { readTable, TABLE_ACCEPT } from './read-file';
import type { Table } from './CsvCharts';

// Comparar el archivo abierto (el corte anterior) con uno nuevo del mismo reporte.
type View = 'changed' | 'added' | 'removed';
const PAGE = 40;

// Corte de ejemplo: el mismo reporte «al día siguiente», para probar sin tener dos archivos a la mano.
function nextCut(t: Plain): Plain {
 const key = guessKey(t, t);
 const ki = key ? t.headers.indexOf(key) : -1;
 const cat = t.headers.findIndex((_, i) => i !== ki && new Set(t.rows.map(r => r[i])).size <= Math.max(3, t.rows.length / 4));
 const vals = cat >= 0 ? [...new Set(t.rows.map(r => r[cat]).filter(Boolean))] : [];
 const rows = t.rows.filter((_, i) => i % 9 !== 4).map((r, i) => i % 5 === 1 && cat >= 0 && vals.length > 1 ? r.map((v, j) => j === cat ? vals[(vals.indexOf(v) + 1) % vals.length] : v) : r);
 const extra = t.rows.slice(0, 2).map((r, n) => r.map((v, j) => j === ki ? `${v}-N${n + 1}` : v));
 return { headers: t.headers, rows: [...rows, ...extra] };
}

export default function CsvCompare({ lang, table }: { lang: 'es' | 'en'; table: Table }) {
 const es = lang === 'es', t = (a: string, b: string) => (es ? a : b);
 const [other, setOther] = useState<(Plain & { name: string }) | null>(null);
 const [key, setKey] = useState<string | null | undefined>(undefined); // undefined = la que se adivine
 const [view, setView] = useState<View>('changed');
 const [shown, setShown] = useState(PAGE);
 const [err, setErr] = useState('');
 const input = useRef<HTMLInputElement>(null);
 const guessed = useMemo(() => other ? guessKey(table, other) : null, [table, other]);
 const useKey = key === undefined ? guessed : key;
 const d = useMemo(() => other ? compareTables(table, other, useKey) : null, [table, other, useKey]);
 const byCol = useMemo(() => d ? changesByColumn(d) : [], [d]);
 const shared = other ? table.headers.filter(h => other.headers.some(x => x.trim().toLowerCase() === h.trim().toLowerCase())) : [];
 const n = (x: number) => x.toLocaleString(es ? 'es-MX' : 'en-US');
 const keyIdx = (hs: string[]) => useKey ? hs.findIndex(h => h.trim().toLowerCase() === useKey.trim().toLowerCase()) : 0;

 async function load(f: File | undefined) {
  if (!f) return;
  try { const data = await readTable(f); setOther({ headers: data.headers, rows: data.rows, name: f.name }); setKey(undefined); setView('changed'); setShown(PAGE); setErr(''); }
  catch { setErr(t(`No pude leer ${f.name}. Usa CSV o Excel.`, `Could not read ${f.name}. Use CSV or Excel.`)); }
 }
 function sample() { setOther({ ...nextCut(table), name: table.name.replace(/(\.\w+)?$/, '_dia_siguiente$1') }); setKey(undefined); setView('changed'); setShown(PAGE); setErr(''); }
 function download() {
  if (!d || !other) return;
  const csv = exportCsv([t('tipo', 'type'), useKey ?? t('fila', 'row'), t('columna', 'column'), t('antes', 'before'), t('después', 'after')], diffRows(d, other.headers, table.headers));
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'diferencias.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
 }

 // Abre en la vista que tiene algo que enseñar.
 const firstView: View = !d ? 'changed' : d.changed.length ? 'changed' : d.added.length ? 'added' : d.removed.length ? 'removed' : 'changed';
 const shownView = d && (view === 'changed' && !d.changed.length) ? firstView : view;
 const list = !d ? [] : shownView === 'changed' ? d.changed : shownView === 'added' ? d.added : d.removed;
 return <section className="cmp" aria-label={t('Comparar dos cortes', 'Compare two snapshots')}>
  <div className="cmp-files">
   <div className="cmp-file"><span>{t('Antes', 'Before')}</span><strong>{table.name}</strong><small>{n(table.rows.length)} {t('filas', 'rows')}</small></div>
   <span className="cmp-arrow" aria-hidden="true">→</span>
   <div className={`cmp-file${other ? '' : ' empty'}`}><span>{t('Después', 'After')}</span>{other ? <><strong>{other.name}</strong><small>{n(other.rows.length)} {t('filas', 'rows')}</small></> : <small>{t('El mismo reporte, con fecha más nueva.', 'The same report, newer date.')}</small>}
    <div className="cmp-actions"><input ref={input} type="file" accept={TABLE_ACCEPT} hidden onChange={e => { void load(e.target.files?.[0]); e.target.value = ''; }}/>
     <button className="dw-primary" onClick={() => input.current?.click()}>{other ? t('Cambiar archivo', 'Change file') : t('Subir el corte nuevo', 'Upload the new snapshot')}</button>
     <button onClick={sample}>{t('Probar con uno de ejemplo', 'Try a sample')}</button></div>
   </div>
  </div>
  {err && <p className="dw-error" role="alert">{err}</p>}
  {!d && <p className="cmp-hint">{t('Sirve para saber qué cambió entre el reporte de ayer y el de hoy sin revisarlos a ojo: filas nuevas, las que desaparecieron y cada celda distinta.', 'Find what changed between yesterday’s and today’s report without eyeballing: new rows, missing rows and every different cell.')}</p>}
  {d && other && <>
   <label className="cmp-key">{t('Emparejar filas por', 'Match rows by')}
    <select value={useKey ?? ''} onChange={e => { setKey(e.target.value || null); setShown(PAGE); }}>{shared.map(h => <option key={h} value={h}>{h}{h === guessed ? t(' (sugerida)', ' (suggested)') : ''}</option>)}<option value="">{t('Fila completa (sin llave)', 'Whole row (no key)')}</option></select>
   </label>
   <dl className="cmp-kpis">
    {([['changed', t('Cambiaron', 'Changed'), d.changed.length], ['added', t('Nuevas', 'New'), d.added.length], ['removed', t('Ya no están', 'Gone'), d.removed.length]] as const).map(([k, label, v]) =>
     <div key={k} className={`k-${k}`}><dt>{label}</dt><dd><button aria-pressed={shownView === k} onClick={() => { setView(k); setShown(PAGE); }}>{n(v)}</button></dd></div>)}
    <div className="k-same"><dt>{t('Iguales', 'Same')}</dt><dd>{n(d.same)}</dd></div>
   </dl>
   {(d.newColumns.length > 0 || d.goneColumns.length > 0 || d.duplicates > 0) && <p className="cmp-note">
    {d.newColumns.length > 0 && t(`Columnas nuevas: ${d.newColumns.join(', ')}. `, `New columns: ${d.newColumns.join(', ')}. `)}
    {d.goneColumns.length > 0 && t(`Ya no vienen: ${d.goneColumns.join(', ')}. `, `Dropped: ${d.goneColumns.join(', ')}. `)}
    {d.duplicates > 0 && t(`${d.duplicates} filas con la llave repetida se compararon sólo una vez.`, `${d.duplicates} rows with a repeated key were compared once.`)}</p>}
   {byCol.length > 0 && <div className="cmp-cols"><p>{t('Dónde cambia', 'Where it changes')}</p><ul>{byCol.slice(0, 6).map(([c, v]) => <li key={c}><span>{c}</span><i><b style={{ width: `${v / byCol[0][1] * 100}%` }}/></i><em>{n(v)}</em></li>)}</ul></div>}
   <ol className={`cmp-list v-${shownView}`}>
    {list.slice(0, shown).map((x, i) => shownView === 'changed'
     ? <li key={i}><code>{(x as typeof d.changed[number]).key}</code><div>{(x as typeof d.changed[number]).changes.map(c => <span key={c.column} className="cmp-chg"><b>{c.column}</b><s>{c.before || '∅'}</s><span aria-hidden="true">→</span><ins>{c.after || '∅'}</ins></span>)}</div></li>
     : <li key={i}><code>{(x as string[])[keyIdx(shownView === 'added' ? other.headers : table.headers)] || `#${i + 1}`}</code><div className="cmp-row">{(x as string[]).filter(Boolean).slice(0, 6).join(' · ')}</div></li>)}
   </ol>
   {!list.length && <p className="cmp-hint">{shownView === 'changed' ? t('Ninguna fila cambió.', 'No row changed.') : shownView === 'added' ? t('No hay filas nuevas.', 'No new rows.') : t('No falta ninguna fila.', 'No rows are missing.')}</p>}
   <div className="cmp-foot">{list.length > shown && <button onClick={() => setShown(s => s + PAGE)}>{t(`Ver ${Math.min(PAGE, list.length - shown)} más de ${n(list.length - shown)}`, `Show ${Math.min(PAGE, list.length - shown)} more of ${n(list.length - shown)}`)}</button>}
    <button className="dw-primary" onClick={download}>{t('Descargar diferencias (CSV)', 'Download differences (CSV)')}</button></div>
  </>}
 </section>;
}
