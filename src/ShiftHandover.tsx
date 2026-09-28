import { useEffect, useRef, useState } from 'react';
import { Camera } from '@phosphor-icons/react';
import './shift-handover.css';

// Entrega de turno: un tablero de incidencias de calidad (abierta → en curso → cerrada).
// Sólo se cierra con responsable y foto de evidencia; al final sale el resumen para el siguiente turno.
// Se guarda en este navegador para poder usarlo de verdad durante un turno.
type Status = 'open' | 'doing' | 'closed';
type Sev = 'Crítica' | 'Mayor' | 'Menor';
type Incident = { id: string; line: string; lot: string; defect: string; sev: Sev; status: Status; owner: string; action: string; photo: string; at: number };
const OWNERS = ['R. Garza', 'L. Treviño', 'A. Cantú', 'M. Salinas'];
const SEV_EN: Record<Sev, string> = { 'Crítica': 'Critical', 'Mayor': 'Major', 'Menor': 'Minor' };
const RANK: Record<Sev, number> = { 'Crítica': 0, 'Mayor': 1, 'Menor': 2 };
const KEY = 'bruno-turno-v2';
const H = 60 * 60 * 1000;
const sample = (): Incident[] => {
 const now = Date.now();
 return [
  { id: 'INC-232', line: 'L1', lot: '4468', defect: 'Torque fuera de rango en rueda', sev: 'Crítica', status: 'doing', owner: 'R. Garza', action: 'Recalibrar la llave 3', photo: '', at: now - 3.2 * H },
  { id: 'INC-231', line: 'L2', lot: '4471', defect: 'Burbuja en pintura de cofre', sev: 'Mayor', status: 'open', owner: '', action: '', photo: '', at: now - 1.4 * H },
  { id: 'INC-229', line: 'L3', lot: '4459', defect: 'Fuga en sello de parabrisas', sev: 'Mayor', status: 'doing', owner: 'L. Treviño', action: 'Cambiar lote de sellador', photo: 'demo', at: now - 5 * H },
  { id: 'INC-226', line: 'L1', lot: '4450', defect: 'Rayón en puerta trasera', sev: 'Menor', status: 'closed', owner: 'A. Cantú', action: 'Pulido y reinspección', photo: 'demo', at: now - 6.5 * H },
 ];
};
const load = (): Incident[] => { try { const v = JSON.parse(localStorage.getItem(KEY) ?? ''); if (Array.isArray(v)) return v; } catch { /* ejemplo */ } return sample(); };

// Foto de evidencia: se reduce a 480 px para que quepa en el almacenamiento del navegador.
function shrink(file: File): Promise<string> {
 return new Promise((ok, fail) => {
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => { const k = Math.min(1, 480 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k; c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', .72)); };
  img.onerror = fail; img.src = url;
 });
}

export default function ShiftHandover({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es', t = (a: string, b: string) => (es ? a : b);
 const [items, setItems] = useState<Incident[]>(load);
 const [draft, setDraft] = useState({ line: 'L2', lot: '', defect: '', sev: 'Mayor' as Sev });
 const [openId, setOpenId] = useState<string | null>(null);
 const [handed, setHanded] = useState<string | null>(null);
 const [copied, setCopied] = useState(false);
 const [err, setErr] = useState('');
 const file = useRef<HTMLInputElement>(null), target = useRef<string>('');
 useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* sin espacio: sigue en memoria */ } }, [items]);

 const patch = (id: string, p: Partial<Incident>) => { setItems(list => list.map(i => i.id === id ? { ...i, ...p } : i)); setHanded(null); };
 const label: Record<Status, string> = { open: t('Abiertas', 'Open'), doing: t('En curso', 'In progress'), closed: t('Cerradas', 'Closed') };
 const ago = (at: number) => { const m = Math.max(1, Math.round((Date.now() - at) / 60000)); return m < 60 ? t(`hace ${m} min`, `${m} min ago`) : t(`hace ${Math.round(m / 60)} h`, `${Math.round(m / 60)} h ago`); };
 const pending = items.filter(i => i.status !== 'closed').sort((a, b) => RANK[a.sev] - RANK[b.sev]);
 const orphan = pending.filter(i => !i.owner).length;

 function add(e: React.FormEvent) {
  e.preventDefault();
  if (!draft.defect.trim()) return setErr(t('Escribe el defecto.', 'Write the defect.'));
  if (!/^\d{3,5}$/.test(draft.lot)) return setErr(t('El lote son 3 a 5 números.', 'The batch is 3 to 5 digits.'));
  const n = Math.max(232, ...items.map(i => Number(i.id.slice(4)) || 0)) + 1;
  setItems(list => [{ id: `INC-${n}`, line: draft.line, lot: draft.lot, defect: draft.defect.trim(), sev: draft.sev, status: 'open', owner: '', action: '', photo: '', at: Date.now() }, ...list]);
  setDraft({ ...draft, lot: '', defect: '' }); setErr(''); setHanded(null);
 }
 async function attach(f: File | undefined) { if (!f) return; try { patch(target.current, { photo: await shrink(f) }); } catch { setErr(t('No se pudo leer la foto.', 'Could not read the photo.')); } }
 const summary = () => [
  t(`Entrega de turno · ${new Date().toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}`, `Shift handover · ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`),
  t(`${pending.length} pendientes${orphan ? `, ${orphan} sin responsable` : ''}:`, `${pending.length} open${orphan ? `, ${orphan} without owner` : ''}:`),
  ...pending.map(i => `• [${es ? i.sev : SEV_EN[i.sev]}] ${i.id} ${i.defect} (${i.line}, ${t('lote', 'batch')} ${i.lot}) — ${i.owner || t('SIN RESPONSABLE', 'NO OWNER')}${i.action ? ` · ${i.action}` : ''}`),
 ].join('\n');
 async function copy() { try { await navigator.clipboard.writeText(summary()); setCopied(true); } catch { setCopied(false); } }

 return <div className="sh">
  <header className="sh-top">
   <div><span className="sh-kicker">{t('Planta de ensamble · Turno matutino', 'Assembly plant · Morning shift')}</span><strong>{t('Incidencias de calidad', 'Quality incidents')}</strong></div>
   <div className="sh-health">
    <span className="sh-meter" aria-hidden="true">{(['closed', 'doing', 'open'] as Status[]).map(s => <i key={s} className={`m-${s}`} style={{ flexGrow: items.filter(i => i.status === s).length }}/>)}</span>
    <span>{t(`${items.filter(i => i.status === 'closed').length} de ${items.length} cerradas`, `${items.filter(i => i.status === 'closed').length} of ${items.length} closed`)}{orphan > 0 && <b>{t(` · ${orphan} sin responsable`, ` · ${orphan} without owner`)}</b>}</span>
   </div>
  </header>

  <form className="sh-new" onSubmit={add}>
   <label>{t('Línea', 'Line')}<select value={draft.line} onChange={e => setDraft({ ...draft, line: e.target.value })}>{['L1', 'L2', 'L3'].map(l => <option key={l}>{l}</option>)}</select></label>
   <label>{t('Lote', 'Batch')}<input value={draft.lot} inputMode="numeric" placeholder="4480" onChange={e => setDraft({ ...draft, lot: e.target.value })}/></label>
   <label className="grow">{t('Defecto', 'Defect')}<input value={draft.defect} placeholder={t('Ej. soldadura incompleta', 'e.g. incomplete weld')} onChange={e => setDraft({ ...draft, defect: e.target.value })}/></label>
   <label>{t('Severidad', 'Severity')}<select value={draft.sev} onChange={e => setDraft({ ...draft, sev: e.target.value as Sev })}>{(['Crítica', 'Mayor', 'Menor'] as Sev[]).map(s => <option key={s} value={s}>{es ? s : SEV_EN[s]}</option>)}</select></label>
   <button type="submit">{t('Registrar', 'Log it')}</button>
   {err && <p className="sh-err" role="alert">{err}</p>}
  </form>
  <input ref={file} type="file" accept="image/*" capture="environment" hidden onChange={e => { void attach(e.target.files?.[0]); e.target.value = ''; }}/>

  <div className="sh-board">
   {(['open', 'doing', 'closed'] as Status[]).map(col => {
    const list = items.filter(i => i.status === col).sort((a, b) => RANK[a.sev] - RANK[b.sev]);
    return <section key={col} className={`sh-col c-${col}`} aria-label={label[col]}>
     <h4>{label[col]}<span>{list.length}</span></h4>
     {!list.length && <p className="sh-empty">{col === 'closed' ? t('Nada cerrado todavía.', 'Nothing closed yet.') : t('Nada aquí.', 'Nothing here.')}</p>}
     {list.map(i => {
      const open = openId === i.id;
      return <article key={i.id + i.status} className={`sh-card sev-${RANK[i.sev]}${open ? ' is-open' : ''}`}>
       <button className="sh-card-head" aria-expanded={open} onClick={() => setOpenId(open ? null : i.id)}>
        <span className="sh-sev">{es ? i.sev : SEV_EN[i.sev]}</span>
        <strong>{i.defect}</strong>
        <small>{i.id} · {i.line} · {t('lote', 'batch')} {i.lot} · {ago(i.at)}</small>
        <span className="sh-who">{i.owner ? <i title={i.owner}>{i.owner.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').slice(0, 2)}</i> : <em>{t('sin responsable', 'no owner')}</em>}{i.photo && <Camera className="sh-cam" size={16} weight="fill" aria-label={t('Con evidencia', 'With evidence')}/>}</span>
       </button>
       {open && col !== 'closed' && <div className="sh-edit">
        <label>{t('Responsable', 'Owner')}<select value={i.owner} onChange={e => patch(i.id, { owner: e.target.value, status: e.target.value ? 'doing' : 'open' })}><option value="">{t('Sin asignar', 'Unassigned')}</option>{OWNERS.map(o => <option key={o}>{o}</option>)}</select></label>
        <label>{t('Siguiente acción', 'Next action')}<input value={i.action} placeholder={t('¿Qué sigue?', 'What’s next?')} onChange={e => patch(i.id, { action: e.target.value })}/></label>
        <div className="sh-evidence">
         {i.photo && i.photo !== 'demo' ? <img src={i.photo} alt={t('Evidencia', 'Evidence')}/> : i.photo ? <span className="sh-demo-photo">{t('foto de ejemplo', 'sample photo')}</span> : null}
         <button type="button" onClick={() => { target.current = i.id; file.current?.click(); }}>{i.photo ? t('Cambiar foto', 'Change photo') : t('Tomar foto de evidencia', 'Take evidence photo')}</button>
        </div>
        <button type="button" className="sh-close" disabled={!i.photo || !i.owner} onClick={() => { patch(i.id, { status: 'closed' }); setOpenId(null); }}>
         {!i.owner ? t('Asigna un responsable para cerrar', 'Assign an owner to close') : !i.photo ? t('Sin evidencia no se cierra', 'No evidence, no closing') : t('Cerrar incidencia', 'Close incident')}</button>
       </div>}
       {open && col === 'closed' && <div className="sh-edit"><p className="sh-closed">{i.owner} · {i.action || t('sin nota', 'no note')}</p>{i.photo && i.photo !== 'demo' && <img className="sh-proof" src={i.photo} alt={t('Evidencia', 'Evidence')}/>}<button type="button" onClick={() => patch(i.id, { status: 'doing' })}>{t('Reabrir', 'Reopen')}</button></div>}
      </article>;
     })}
    </section>;
   })}
  </div>

  <div className="sh-hand">
   <button type="button" className="sh-go" onClick={() => { setHanded(new Date().toLocaleTimeString(es ? 'es-MX' : 'en-US', { hour: '2-digit', minute: '2-digit' })); setCopied(false); }}>{t('Entregar turno', 'Hand over shift')}</button>
   <button type="button" className="sh-reset" onClick={() => { setItems(sample()); setHanded(null); setOpenId(null); }}>{t('Volver al ejemplo', 'Reset sample')}</button>
   {handed && <div className="sh-summary" role="status">
    <header><strong>{t(`Para el turno vespertino · ${handed}`, `For the evening shift · ${handed}`)}</strong><span>{t(`${pending.length} pendientes`, `${pending.length} open`)}{orphan ? t(` · ${orphan} sin responsable`, ` · ${orphan} without owner`) : ''}</span></header>
    <ol>{pending.map((i, n) => <li key={i.id} style={{ ['--i' as string]: n }} className={i.owner ? '' : 'no-owner'}><span className={`sh-sev sev-${RANK[i.sev]}`}>{es ? i.sev : SEV_EN[i.sev]}</span><b>{i.defect}</b><small>{i.id} · {i.line} · {i.owner || t('sin responsable', 'no owner')}{i.action ? ` · ${i.action}` : ''}</small></li>)}</ol>
    {!pending.length && <p>{t('Todo cerrado: turno limpio.', 'Everything closed: clean shift.')}</p>}
    <div className="sh-send"><button type="button" onClick={copy}>{copied ? t('Copiado', 'Copied') : t('Copiar resumen', 'Copy summary')}</button><a href={`https://wa.me/?text=${encodeURIComponent(summary())}`} target="_blank" rel="noreferrer">{t('Mandar por WhatsApp', 'Send via WhatsApp')}</a></div>
   </div>}
  </div>
  <p className="sh-note">{t('Se guarda en este navegador: puedes usarlo en un turno real y tomar las fotos con el celular.', 'It is saved in this browser: you can use it on a real shift and take the photos with your phone.')}</p>
 </div>;
}
