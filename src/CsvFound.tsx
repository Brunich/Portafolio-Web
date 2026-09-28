import { useState } from 'react';
import type { Issue } from './quality';

// «Qué encontré» como gráfica: un medidor con las filas limpias y una barra por problema.
// Lo que se arregla con un clic se encoge y se pinta de menta; lo que requiere criterio se queda.
export type Done = { key: number; title: [string, string]; text: [string, string]; n: number };
let seq = 0;
const rowsOf = (i: Issue) => new Set(i.rows ?? i.cells.map(([r]) => r)).size || 1;
export const doneOf = (i: Issue): Done => ({ key: ++seq, title: i.title, text: i.fixDone ?? i.title, n: rowsOf(i) });
const kindOf = (i: Issue) => i.fix ? 'fix' : i.severity === 'info' ? 'info' : 'rule';

type Props = { lang: 'es' | 'en'; issues: Issue[]; rows: number; done: Done[]; focus: string | null; runKey: string;
 onFix: (i: Issue) => void; onFixAll: () => void; onUndo: () => void; onShow: (id: string) => void };

export default function Found({ lang, issues, rows, done, focus, runKey, onFix, onFixAll, onUndo, onShow }: Props) {
 const es = lang === 'es', L = es ? 0 : 1, t = (a: string, b: string) => es ? a : b;
 const [open, setOpen] = useState<string | null>(null);
 const real = issues.filter(i => i.severity !== 'info');
 const fixable = issues.filter(i => i.fix);
 const dirty = new Set(real.flatMap(i => i.rows ?? i.cells.map(([r]) => r)));
 const clean = rows ? (rows - dirty.size) / rows : 1;
 const max = Math.max(1, ...issues.map(rowsOf), ...done.map(d => d.n));
 const tone = !real.length ? 'ok' : real.every(i => !i.fix) ? 'rule' : 'fix';

 return <section className="cf" aria-label={t('Qué encontré', 'What I found')} key={runKey}>
  <header className="cf-head">
   <div><h4>{t('Qué encontré', 'What I found')}</h4>
    <p>{!real.length ? t('Nada que corregir: el archivo está listo.', 'Nothing to fix: the file is ready.')
     : fixable.length ? t(`${fixable.length} se arreglan con un clic; el resto necesita que alguien decida.`, `${fixable.length} can be fixed in one click; the rest needs someone to decide.`)
     : t('Lo que queda necesita que alguien decida: se marca, no se inventa.', 'What remains needs someone to decide: it is flagged, never made up.')}</p></div>
   <div className="cf-actions">
    {done.length > 0 && <button onClick={onUndo}>{t('Volver al original', 'Back to original')}</button>}
    {fixable.length > 0 && <button className="dw-primary" onClick={onFixAll}>{t(`Arreglar lo automático (${fixable.length})`, `Fix the automatic ones (${fixable.length})`)}</button>}
   </div>
  </header>
  <div className="cf-body">
   <div className={`cf-gauge tone-${tone}`}>
    <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" className="cf-track"/><circle cx="60" cy="60" r="50" className="cf-arc" pathLength={100} style={{ strokeDashoffset: 100 - clean * 100 }}/></svg>
    <div className="cf-score"><b>{real.length}</b><small>{real.length === 1 ? t('problema', 'issue') : t('problemas', 'issues')}</small></div>
    <p>{t(`${Math.round(clean * 100)} % de las filas sin problemas`, `${Math.round(clean * 100)}% of rows without issues`)}</p>
   </div>
   <ol className="cf-bars">
    {issues.map((i, n) => {
     const isOpen = open === i.id;
     return <li key={i.id} className={`cf-row k-${kindOf(i)}${isOpen ? ' is-open' : ''}${focus === i.id ? ' is-focus' : ''}`} style={{ ['--w' as string]: `${rowsOf(i) / max * 100}%`, ['--i' as string]: n }}>
      <button className="cf-label" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i.id)}><span>{i.title[L]}</span><i aria-hidden="true">▾</i></button>
      <span className="cf-bar" aria-hidden="true"><i/></span>
      <span className="cf-n" title={t('filas', 'rows')}>{rowsOf(i)}</span>
      <span className="cf-act">{i.fix && <button className="cf-fix" onClick={() => onFix(i)}>{i.fixLabel![L]}</button>}</span>
      {isOpen && <div className="cf-detail"><p>{i.detail[L]}</p>{i.example && <code>{i.example}</code>}
       <button className="dw-link" onClick={() => onShow(i.id)}>{t('Ver estas filas en la tabla', 'Show these rows in the table')} ↑</button></div>}
     </li>;
    })}
    {done.map(d => <li key={`d${d.key}`} className="cf-row k-fix is-done" style={{ ['--w' as string]: `${d.n / max * 100}%` }}>
     <span className="cf-label"><span>{d.title[L]}</span></span>
     <span className="cf-bar" aria-hidden="true"><i/></span>
     <span className="cf-n">0</span>
     <span className="cf-act cf-ok">✓ {d.text[L]}</span>
    </li>)}
   </ol>
  </div>
  <p className="cf-legend"><span><i className="fix"/>{t('se corrige con un clic', 'one-click fix')}</span><span><i className="rule"/>{t('requiere criterio', 'needs judgment')}</span><span><i className="info"/>{t('aviso', 'note')}</span><span>{t('El número es cuántas filas toca.', 'The number is how many rows it touches.')}</span></p>
 </section>;
}
