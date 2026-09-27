import { useState } from 'react';
import './shift-handover.css';

// Entrega de turno: incidencias de calidad con responsable, evidencia y cierre, y un resumen para el siguiente turno.
type Status = 'open' | 'doing' | 'closed';
type Sev = 'Crítica' | 'Mayor' | 'Menor';
type Incident = { id: string; line: string; lot: string; defect: string; sev: Sev; status: Status; owner: string; action: string; evidence: boolean };
const OWNERS = ['R. Garza', 'L. Treviño', 'A. Cantú', 'M. Salinas'];
const START: Incident[] = [
 { id: 'INC-232', line: 'L1', lot: '4468', defect: 'Torque fuera de rango en rueda', sev: 'Crítica', status: 'doing', owner: 'R. Garza', action: 'Recalibrar la llave 3', evidence: false },
 { id: 'INC-231', line: 'L2', lot: '4471', defect: 'Burbuja en pintura de cofre', sev: 'Mayor', status: 'open', owner: '', action: '', evidence: false },
 { id: 'INC-229', line: 'L3', lot: '4459', defect: 'Fuga en sello de parabrisas', sev: 'Mayor', status: 'doing', owner: 'L. Treviño', action: 'Cambiar lote de sellador', evidence: true },
 { id: 'INC-226', line: 'L1', lot: '4450', defect: 'Rayón en puerta trasera', sev: 'Menor', status: 'closed', owner: 'A. Cantú', action: 'Pulido y reinspección', evidence: true },
];
const SEV_EN: Record<Sev, string> = { 'Crítica': 'Critical', 'Mayor': 'Major', 'Menor': 'Minor' };

export default function ShiftHandover({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 const t = (a: string, b: string) => (es ? a : b);
 const [items, setItems] = useState(START);
 const [draft, setDraft] = useState({ line: 'L2', lot: '', defect: '', sev: 'Mayor' as Sev });
 const [handed, setHanded] = useState<string | null>(null);
 const [seq, setSeq] = useState(233);
 const patch = (id: string, p: Partial<Incident>) => { setItems(list => list.map(i => i.id === id ? { ...i, ...p } : i)); setHanded(null); };
 const count = (s: Status) => items.filter(i => i.status === s).length;
 const label: Record<Status, string> = { open: t('Abierta', 'Open'), doing: t('En curso', 'In progress'), closed: t('Cerrada', 'Closed') };

 function add(e: React.FormEvent) {
  e.preventDefault();
  if (!draft.defect.trim() || !/^\d{3,5}$/.test(draft.lot)) return;
  setItems(list => [{ id: `INC-${seq}`, line: draft.line, lot: draft.lot, defect: draft.defect.trim(), sev: draft.sev, status: 'open', owner: '', action: '', evidence: false }, ...list]);
  setSeq(s => s + 1); setDraft({ ...draft, lot: '', defect: '' }); setHanded(null);
 }
 function handOver() { setHanded(new Date().toLocaleTimeString(es ? 'es-MX' : 'en-US', { hour: '2-digit', minute: '2-digit' })); }
 const pending = items.filter(i => i.status !== 'closed');

 return <div className="sh">
  <header className="sh-top">
   <div><span className="sh-kicker">{t('Planta de ensamble · Turno matutino', 'Assembly plant · Morning shift')}</span><strong>{t('Incidencias de calidad', 'Quality incidents')}</strong></div>
   <dl className="sh-kpis">
    <div className="k-open"><dt>{label.open}</dt><dd>{count('open')}</dd></div>
    <div className="k-doing"><dt>{label.doing}</dt><dd>{count('doing')}</dd></div>
    <div className="k-closed"><dt>{label.closed}</dt><dd>{count('closed')}</dd></div>
    <div className="k-owner"><dt>{t('Sin responsable', 'No owner')}</dt><dd>{items.filter(i => !i.owner && i.status !== 'closed').length}</dd></div>
   </dl>
  </header>

  <form className="sh-new" onSubmit={add}>
   <label>{t('Línea', 'Line')}<select value={draft.line} onChange={e => setDraft({ ...draft, line: e.target.value })}>{['L1', 'L2', 'L3'].map(l => <option key={l}>{l}</option>)}</select></label>
   <label>{t('Lote', 'Batch')}<input value={draft.lot} inputMode="numeric" placeholder="4480" onChange={e => setDraft({ ...draft, lot: e.target.value })}/></label>
   <label className="grow">{t('Defecto', 'Defect')}<input value={draft.defect} placeholder={t('Ej. soldadura incompleta', 'e.g. incomplete weld')} onChange={e => setDraft({ ...draft, defect: e.target.value })}/></label>
   <label>{t('Severidad', 'Severity')}<select value={draft.sev} onChange={e => setDraft({ ...draft, sev: e.target.value as Sev })}>{(['Crítica', 'Mayor', 'Menor'] as Sev[]).map(s => <option key={s} value={s}>{es ? s : SEV_EN[s]}</option>)}</select></label>
   <button type="submit">{t('Registrar', 'Log it')}</button>
  </form>

  <ul className="sh-list">
   {items.map(i => <li key={i.id} className={`sh-item s-${i.status}`}>
    <div className="sh-head">
     <span className={`sh-sev sev-${i.sev}`}>{es ? i.sev : SEV_EN[i.sev]}</span>
     <strong>{i.defect}</strong>
     <span className="sh-meta">{i.id} · {t('Línea', 'Line')} {i.line} · {t('Lote', 'Batch')} {i.lot}</span>
     <span className={`sh-status st-${i.status}`}>{label[i.status]}</span>
    </div>
    {i.status !== 'closed' ? <div className="sh-body">
     <label>{t('Responsable', 'Owner')}<select value={i.owner} onChange={e => patch(i.id, { owner: e.target.value, status: e.target.value ? 'doing' : 'open' })}><option value="">{t('Sin asignar', 'Unassigned')}</option>{OWNERS.map(o => <option key={o}>{o}</option>)}</select></label>
     <label className="grow">{t('Siguiente acción', 'Next action')}<input value={i.action} placeholder={t('¿Qué sigue?', 'What’s next?')} onChange={e => patch(i.id, { action: e.target.value })}/></label>
     <button type="button" className={`sh-evidence${i.evidence ? ' on' : ''}`} aria-pressed={i.evidence} onClick={() => patch(i.id, { evidence: !i.evidence })}>{i.evidence ? t('Evidencia adjunta', 'Evidence attached') : t('Adjuntar evidencia', 'Attach evidence')}</button>
     <button type="button" className="sh-close" disabled={!i.evidence || !i.owner} onClick={() => patch(i.id, { status: 'closed' })} title={!i.evidence ? t('Sin evidencia no se puede cerrar', 'Cannot close without evidence') : undefined}>{t('Cerrar', 'Close')}</button>
    </div> : <p className="sh-closed">{i.owner} · {i.action} · {t('cerrada con evidencia', 'closed with evidence')}</p>}
   </li>)}
  </ul>

  <div className="sh-hand">
   <button type="button" onClick={handOver}>{t('Entregar turno', 'Hand over shift')}</button>
   {handed && <div className="sh-summary" role="status">
    <strong>{t(`Entregado al turno vespertino a las ${handed}`, `Handed to the evening shift at ${handed}`)}</strong>
    <p>{t(`${pending.length} pendientes`, `${pending.length} open`)}{pending.some(i => !i.owner) ? t(` · ${pending.filter(i => !i.owner).length} sin responsable`, ` · ${pending.filter(i => !i.owner).length} without owner`) : ''}</p>
    <ol>{pending.map(i => <li key={i.id}><b>{i.id}</b> {i.defect} — {i.owner || t('sin responsable', 'no owner')}{i.action ? ` · ${i.action}` : ''}</li>)}</ol>
   </div>}
  </div>
 </div>;
}
