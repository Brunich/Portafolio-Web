import { useEffect, useMemo, useRef, useState } from 'react';
import { Barcode, Camera, CameraSlash, ImageSquare, Plus, Minus, ListChecks, Printer, WhatsappLogo, DownloadSimple, ArrowCounterClockwise, MagnifyingGlass, Trash, WarningCircle } from '@phosphor-icons/react';
import { SAMPLE, codeKind, labelSvg, normalizeCode, printable, shopping } from './inventario-logic';
import type { Move, Mode, Product } from './inventario-logic';
import './inventario.css';

// Inventario con la cámara del celular: cada código escaneado suma, resta o se cuenta.
// Todo se guarda en este navegador; la lista de compras sale sola de lo que está bajo el mínimo.
const KEY = 'bruno-inventario-v1';
type Store = { products: Product[]; moves: Move[] };
const load = (): Store => { try { const s = JSON.parse(localStorage.getItem(KEY) ?? ''); if (Array.isArray(s.products)) return s; } catch { /* tienda de ejemplo */ } return { products: SAMPLE, moves: [] }; };

export default function Inventario({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es', t = (a: string, b: string) => es ? a : b;
 const [store, setStore] = useState<Store>(load);
 const [mode, setMode] = useState<Mode>('in');
 const [camera, setCamera] = useState(false);
 const [camErr, setCamErr] = useState('');
 const [manual, setManual] = useState('');
 const [flash, setFlash] = useState<{ code: string; text: string; ok: boolean; n: number } | null>(null);
 const [unknown, setUnknown] = useState<string | null>(null);
 const [newName, setNewName] = useState('');
 const [view, setView] = useState<'all' | 'low' | 'count'>('all');
 const [labels, setLabels] = useState(false);
 const [find, setFind] = useState('');
 const [open, setOpen] = useState<string | null>(null);
 const [removed, setRemoved] = useState<{ p: Product; at: number } | null>(null);
 const sheet = useRef<HTMLElement>(null);
 const video = useRef<HTMLVideoElement>(null);
 const stopCam = useRef<(() => void) | null>(null);
 const last = useRef({ code: '', at: 0 });
 const modeRef = useRef(mode); modeRef.current = mode;
 useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* sin espacio */ } }, [store]);
 useEffect(() => () => stopCam.current?.(), []);

 const low = useMemo(() => shopping(store.products), [store.products]);
 const units = store.products.reduce((s, p) => s + p.stock, 0);
 const counted = store.products.filter(p => p.counted !== undefined);
 const diffs = counted.filter(p => p.counted !== p.stock);

 function apply(raw: string) {
  const code = normalizeCode(raw);
  if (!code) return;
  const now = Date.now();
  if (code === last.current.code && now - last.current.at < 1500) return; // la cámara lee el mismo código varias veces seguidas
  last.current = { code, at: now };
  navigator.vibrate?.(60);
  const m = modeRef.current;
  setStore(s => {
   const p = s.products.find(x => x.code === code);
   if (!p) { setUnknown(code); setFlash({ code, text: t('Código nuevo: ¿qué producto es?', 'New code: which product is it?'), ok: false, n: now }); return s; }
   const delta = m === 'in' ? 1 : m === 'out' ? -1 : 0;
   const products = s.products.map(x => x.code !== code ? x : m === 'count' ? { ...x, counted: (x.counted ?? 0) + 1 } : { ...x, stock: Math.max(0, x.stock + delta) });
   const after = products.find(x => x.code === code)!;
   setFlash({ code, ok: true, n: now, text: m === 'count' ? t(`${p.name}: contadas ${after.counted}`, `${p.name}: counted ${after.counted}`) : `${p.name} ${delta > 0 ? '+1' : '−1'} · ${t('quedan', 'left')} ${after.stock}` });
   return { products, moves: [{ at: now, code, name: p.name, delta, mode: m }, ...s.moves].slice(0, 300) };
  });
 }

 async function startCam() {
  setCamErr('');
  try {
   const { BrowserMultiFormatReader } = await import('@zxing/browser');
   const reader = new BrowserMultiFormatReader();
   const controls = await reader.decodeFromConstraints({ video: { facingMode: 'environment' } }, video.current!, res => { if (res) apply(res.getText()); });
   stopCam.current = () => controls.stop(); setCamera(true);
  } catch { setCamErr(t('No se pudo abrir la cámara. Revisa el permiso o usa una foto del código.', 'Could not open the camera. Check the permission or use a photo of the code.')); setCamera(false); }
 }
 function stop() { stopCam.current?.(); stopCam.current = null; setCamera(false); }
 async function fromPhoto(file: File | undefined) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  try { const { BrowserMultiFormatReader } = await import('@zxing/browser'); const r = await new BrowserMultiFormatReader().decodeFromImageUrl(url); last.current = { code: '', at: 0 }; apply(r.getText()); }
  catch { setFlash({ code: '', ok: false, n: Date.now(), text: t('No encontré un código en la foto. Acércate y que salga derecho.', 'No code found in the photo. Get closer and keep it straight.') }); }
  finally { URL.revokeObjectURL(url); }
 }
 function addProduct(e: React.FormEvent) {
  e.preventDefault();
  if (!unknown || !newName.trim()) return;
  setStore(s => ({ ...s, products: [...s.products, { code: unknown, name: newName.trim(), stock: modeRef.current === 'in' ? 1 : 0, min: 5 }] }));
  setUnknown(null); setNewName('');
 }
 const setField = (code: string, p: Partial<Product>) => setStore(s => ({ ...s, products: s.products.map(x => x.code === code ? { ...x, ...p } : x) }));
 function closeCount() { setStore(s => ({ products: s.products.map(p => p.counted === undefined ? p : { ...p, stock: p.counted, counted: undefined }), moves: [...s.products.filter(p => p.counted !== undefined && p.counted !== p.stock).map(p => ({ at: Date.now(), code: p.code, name: p.name, delta: p.counted! - p.stock, mode: 'count' as Mode })), ...s.moves].slice(0, 300) })); setView('all'); }
 const list = t('Lista de compras', 'Shopping list') + '\n' + low.map(p => `• ${p.name}: ${p.order}`).join('\n');
 const csv = () => { const url = URL.createObjectURL(new Blob(['﻿' + ['codigo,producto,existencias,minimo', ...store.products.map(p => `${p.code},"${p.name.replace(/"/g, '""')}",${p.stock},${p.min}`)].join('\r\n')], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'inventario.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
 const q = find.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
 const matchFind = (p: Product) => !q || p.code.toLowerCase().includes(q) || p.name.toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q);
 const shown = (view === 'low' ? store.products.filter(p => p.stock < p.min) : store.products).filter(matchFind);
 // Borrar con red: el producto se puede recuperar mientras el aviso siga a la vista.
 function remove(p: Product) { setStore(s => ({ ...s, products: s.products.filter(x => x.code !== p.code) })); setRemoved({ p, at: Date.now() }); setOpen(null); }
 function undo() { if (!removed) return; const p = removed.p; setStore(s => s.products.some(x => x.code === p.code) ? s : { ...s, products: [...s.products, p] }); setRemoved(null); }
 function showLabels() { setLabels(true); setTimeout(() => sheet.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }

 return <div className="inv">
  <dl className="inv-kpis">
   <div><dt>{t('Productos', 'Products')}</dt><dd>{store.products.length}</dd></div>
   <div><dt>{t('Piezas en tienda', 'Units in store')}</dt><dd>{units}</dd></div>
   <div className={low.length ? 'warn' : ''}><dt>{low.length > 0 && <WarningCircle size={14} weight="fill" aria-hidden="true"/>}{t('Bajo el mínimo', 'Below minimum')}</dt><dd>{low.length}</dd></div>
   <div><dt>{t('Movimientos', 'Moves')}</dt><dd>{store.moves.length}</dd></div>
  </dl>

  <div className="inv-main">
   <section className="inv-scan">
    <div className="inv-modes" role="radiogroup" aria-label={t('Qué hace cada escaneo', 'What each scan does')}>
     {([['in', t('Entrada', 'Stock in'), <Plus key="i" size={16} weight="bold"/>], ['out', t('Venta / salida', 'Sale / out'), <Minus key="o" size={16} weight="bold"/>], ['count', t('Conteo físico', 'Stock count'), <ListChecks key="c" size={16}/>]] as const).map(([k, label, icon]) => <button key={k} role="radio" aria-checked={mode === k} className={`m-${k}`} onClick={() => { setMode(k); if (k === 'count') setView('count'); }}>{icon}{label}</button>)}
    </div>
    <div className={`inv-video${camera ? ' on' : ''}`}>
     <video ref={video} muted playsInline/>
     {!camera && <div className="inv-idle"><Barcode size={54} weight="thin"/><p>{t('Apunta la cámara al código de barras.', 'Point the camera at the barcode.')}</p></div>}
     <i className="inv-laser" aria-hidden="true"/>
     {flash && <div key={flash.n} className={`inv-flash${flash.ok ? '' : ' bad'}`} role="status">{flash.text}</div>}
    </div>
    <div className="inv-scan-actions">
     {camera ? <button onClick={stop}><CameraSlash size={18}/>{t('Apagar cámara', 'Stop camera')}</button> : <button className="dw-primary" onClick={() => void startCam()}><Camera size={18}/>{t('Escanear con la cámara', 'Scan with camera')}</button>}
     <label className="inv-photo"><ImageSquare size={18}/>{t('Desde una foto', 'From a photo')}<input type="file" accept="image/*" hidden onChange={e => { void fromPhoto(e.target.files?.[0]); e.target.value = ''; }}/></label>
    </div>
    {camErr && <p className="inv-err" role="alert">{camErr}</p>}
    <form className="inv-manual" onSubmit={e => { e.preventDefault(); last.current = { code: '', at: 0 }; apply(manual); setManual(''); }}>
     <input value={manual} placeholder={t('O escribe el código', 'Or type the code')} aria-label={t('Código de barras', 'Barcode')} onChange={e => setManual(e.target.value)}/>
     <button type="submit">{t('Aplicar', 'Apply')}</button>
    </form>
    <p className="inv-hint">{t('¿Sin productos a la mano? ', 'No products at hand? ')}<button className="pl-link" onClick={showLabels}>{t('Abre las etiquetas de ejemplo', 'Open the sample labels')}</button>{t(' y apunta la cámara a la pantalla. Lee EAN-13, EAN-8, UPC-A y códigos internos (Code 128).', ' and point the camera at the screen. Reads EAN-13, EAN-8, UPC-A and internal codes (Code 128).')}</p>
    {unknown && <form className="inv-new" onSubmit={addProduct}>
     <strong>{t('Producto nuevo', 'New product')} · <code>{unknown}</code><small> · {codeKind(unknown)}</small></strong>
     <input autoFocus value={newName} placeholder={t('Nombre del producto', 'Product name')} onChange={e => setNewName(e.target.value)}/>
     <div><button type="submit" className="dw-primary">{t('Guardar', 'Save')}</button><button type="button" onClick={() => setUnknown(null)}>{t('Cancelar', 'Cancel')}</button></div>
    </form>}
    {store.moves.length > 0 && <ol className="inv-log">{store.moves.slice(0, 5).map(m => <li key={m.at + m.code}><span className={m.delta > 0 ? 'up' : m.delta < 0 ? 'down' : ''}>{m.mode === 'count' ? (m.delta ? `${m.delta > 0 ? '+' : ''}${m.delta}` : '✓') : m.delta > 0 ? '+1' : '−1'}</span>{m.name}<time>{new Date(m.at).toLocaleTimeString(es ? 'es-MX' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</time></li>)}</ol>}
   </section>

   <section className="inv-list">
    <label className="inv-find"><MagnifyingGlass size={17} aria-hidden="true"/><input type="search" aria-label={t('Buscar producto', 'Find product')} value={find} placeholder={t('Buscar por nombre o código', 'Search by name or code')} onChange={e => setFind(e.target.value)}/></label>
    {removed && <p className="inv-undo" role="status">{t(`Borraste «${removed.p.name}».`, `Deleted “${removed.p.name}”.`)} <button className="pl-link" onClick={undo}>{t('Deshacer', 'Undo')}</button></p>}
    <div className="inv-tabs" role="tablist">
     <button role="tab" aria-selected={view === 'all'} onClick={() => setView('all')}>{t('Todo', 'All')}</button>
     <button role="tab" aria-selected={view === 'low'} onClick={() => setView('low')}>{t(`Resurtir (${low.length})`, `Restock (${low.length})`)}</button>
     <button role="tab" aria-selected={view === 'count'} onClick={() => setView('count')}>{t(`Conteo (${counted.length})`, `Count (${counted.length})`)}</button>
    </div>
    {view === 'count' ? <div className="inv-count">
     <p>{t('Escanea cada pieza en modo «Conteo físico». Al cerrar, el sistema toma lo contado y registra la diferencia.', 'Scan every unit in “Stock count” mode. Closing it takes the counted amounts and logs the difference.')}</p>
     <table><thead><tr><th>{t('Producto', 'Product')}</th><th>{t('Sistema', 'System')}</th><th>{t('Contado', 'Counted')}</th><th>{t('Diferencia', 'Difference')}</th></tr></thead>
      <tbody>{counted.map(p => <tr key={p.code} className={p.counted !== p.stock ? 'off' : ''}><td>{p.name}</td><td>{p.stock}</td><td>{p.counted}</td><td>{p.counted! - p.stock > 0 ? '+' : ''}{p.counted! - p.stock}</td></tr>)}</tbody></table>
     {!counted.length && <p className="inv-empty">{t('Aún no cuentas nada.', 'Nothing counted yet.')}</p>}
     <div className="inv-row"><button className="dw-primary" disabled={!counted.length} onClick={closeCount}>{t(`Cerrar conteo (${diffs.length} diferencias)`, `Close count (${diffs.length} differences)`)}</button><button onClick={() => setStore(s => ({ ...s, products: s.products.map(p => ({ ...p, counted: undefined })) }))}>{t('Borrar conteo', 'Clear count')}</button></div>
    </div> : <>
     {!shown.length && <p className="inv-empty">{q ? t(`Nada coincide con «${find}».`, `Nothing matches “${find}”.`) : t('Nada por aquí.', 'Nothing here.')}</p>}
     <ul className="inv-products">{shown.map((p, i) => { const pct = Math.min(1, p.stock / Math.max(1, p.min * 2)), isOpen = open === p.code, hist = isOpen ? store.moves.filter(m => m.code === p.code).slice(0, 6) : []; return <li key={p.code} className={`${p.stock < p.min ? 'low' : ''}${flash?.code === p.code && flash.ok ? ' hit' : ''}${isOpen ? ' open' : ''}`} style={{ ['--i' as string]: i }}>
      <button className="inv-name" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : p.code)}><strong>{p.name}</strong><code>{p.code}</code></button>
      <span className="inv-bar"><i style={{ width: `${pct * 100}%` }}/><b style={{ left: '50%' }} title={t('mínimo', 'minimum')}/></span>
      <span className="inv-stock"><b>{p.stock}</b><small>{t('mín', 'min')} <input type="number" min={0} value={p.min} aria-label={`${t('Mínimo de', 'Minimum for')} ${p.name}`} onChange={e => setField(p.code, { min: Math.max(0, +e.target.value || 0) })}/></small></span>
      {isOpen && <div className="inv-detail">
       <label>{t('Nombre', 'Name')}<input value={p.name} maxLength={40} onChange={e => setField(p.code, { name: e.target.value })}/></label>
       <p className="inv-kind">{codeKind(p.code)}</p>
       {hist.length ? <ol className="inv-log">{hist.map(m => <li key={m.at + m.code + m.delta}><span className={m.delta > 0 ? 'up' : m.delta < 0 ? 'down' : ''}>{m.mode === 'count' ? (m.delta ? `${m.delta > 0 ? '+' : ''}${m.delta}` : '✓') : m.delta > 0 ? '+1' : '−1'}</span>{m.mode === 'in' ? t('Entrada', 'In') : m.mode === 'out' ? t('Venta', 'Sale') : t('Ajuste por conteo', 'Count adjustment')}<time>{new Date(m.at).toLocaleString(es ? 'es-MX' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></li>)}</ol> : <p className="inv-empty">{t('Sin movimientos todavía.', 'No moves yet.')}</p>}
       <button className="inv-delete" onClick={() => remove(p)}><Trash size={16}/>{t('Borrar producto', 'Delete product')}</button>
      </div>}
     </li>; })}</ul>
     {view === 'low' && low.length > 0 && <div className="inv-row"><a className="pl-wa" href={`https://wa.me/?text=${encodeURIComponent(list)}`} target="_blank" rel="noreferrer"><WhatsappLogo size={17}/>{t('Mandar lista al proveedor', 'Send list to supplier')}</a></div>}
    </>}
    <div className="inv-row inv-tools">
     <button onClick={() => labels ? setLabels(false) : showLabels()}><Printer size={17}/>{labels ? t('Ocultar etiquetas', 'Hide labels') : t('Etiquetas con código', 'Barcode labels')}</button>
     <button onClick={csv}><DownloadSimple size={17}/>CSV</button>
     <button onClick={() => { setStore({ products: SAMPLE, moves: [] }); setUnknown(null); }}><ArrowCounterClockwise size={17}/>{t('Tienda de ejemplo', 'Sample store')}</button>
    </div>
   </section>
  </div>

  {labels && <section className="inv-labels" ref={sheet}>
   <div className="inv-row"><strong>{t('Etiquetas con código · recórtalas y pégalas en el anaquel', 'Barcode labels · cut them out for the shelf')}</strong><button className="dw-primary" onClick={() => window.print()}><Printer size={17}/>{t('Imprimir', 'Print')}</button></div>
   <div className="inv-sheet">{store.products.filter(p => printable(p.code)).map(p => <figure key={p.code} dangerouslySetInnerHTML={{ __html: labelSvg(p) }}/>)}</div>
  </section>}
 </div>;
}
