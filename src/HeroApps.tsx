import { Ticket, ListBullets, ArrowSquareOut, WhatsappLogo, Star, ListChecks, Table, Gauge, ChartBar, Lightning, WarningCircle, CheckCircle, MicrosoftExcelLogo, ForkKnife } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { ProjectIcon } from './HeroShowcase';
import './hero-apps.css';

// Las tres apps de la portada, cada una con su aparato y su color: el celular del cliente (NFC),
// la ventana de escritorio (Analizador) y la tableta de la planta (OEE).
// Abajo, como en una app de verdad: «Resumen», «Completo» y «Abrir», que lleva a la herramienta real.
export type View = 'sum' | 'full';
type Props = { lang: 'es' | 'en'; view: View; onView: (v: View) => void; slug: string };

function AppNav({ es, view, onView, slug, icons }: { es: boolean; view: View; onView: (v: View) => void; slug: string; icons: [Icon, Icon] }) {
 const [Sum, Full] = icons;
 return <nav className="ha-nav" aria-label={es ? 'Vistas de la app' : 'App views'}>
  <button type="button" aria-pressed={view === 'sum'} onClick={() => onView('sum')}><Sum size={17} weight={view === 'sum' ? 'fill' : 'regular'}/><span>{es ? 'Resumen' : 'Summary'}</span></button>
  <button type="button" aria-pressed={view === 'full'} onClick={() => onView('full')}><Full size={17} weight={view === 'full' ? 'fill' : 'regular'}/><span>{es ? 'Completo' : 'Full'}</span></button>
  <a href={`/proyectos/${slug}#demo`}><ArrowSquareOut size={17}/><span>{es ? 'Abrir' : 'Open'}</span></a>
 </nav>;
}

// ---------- NFC: el celular del cliente ----------
export function NfcApp({ lang, view, onView, slug }: Props) {
 const es = lang === 'es';
 return <div className={`ha ha-nfc v-${view}`}>
  <div className="ha-chip"><ProjectIcon kind="nfc"/><span>NFC</span></div>
  {view === 'sum' && <><span className="ha-wave"/><span className="ha-wave w2"/></>}
  <div className="ha-phone">
   <i className="ha-notch"/>
   <div className="ha-screen">
    {view === 'sum' && <div className="ha-wa"><WhatsappLogo size={18} weight="fill"/><div><b>Café Aurora</b><span>{es ? 'Califícanos: ¿cómo estuvo la comida?' : 'Rate us: how was the food?'} <i>★★★★★</i></span></div></div>}
    <header className="ha-biz"><span className="ha-logo">CA</span><div><b>Café Aurora</b><small>{es ? 'Tarjeta de sellos' : 'Stamp card'}</small></div></header>
    {view === 'sum' ? <div className="ha-view" key="sum">
     <div className="ha-stamps">{Array.from({ length: 6 }, (_, i) => <b key={i} className={i < 3 ? 'on' : i === 3 ? 'new' : ''}/>)}</div>
     <strong className="ha-plus">{es ? '+1 sello' : '+1 stamp'}</strong>
     <em className="ha-left">{es ? 'Te faltan 2 para tu café' : '2 more for your coffee'}</em>
    </div> : <div className="ha-view ha-nfc-full" key="full">
     <p className="ha-prog"><span>{es ? '4 de 6 sellos' : '4 of 6 stamps'}</span><i><b/></i></p>
     <ol>{(es ? ['Hoy', '21 sep', '14 sep'] : ['Today', 'Sep 21', 'Sep 14']).map((d, i) => <li key={d} style={{ ['--i' as string]: i }}><Ticket size={14} weight="fill"/>{d}<small>+1</small></li>)}</ol>
     <p className="ha-prize"><Star size={14} weight="fill"/>{es ? 'Premio: café de la casa' : 'Reward: house coffee'}</p>
     <div className="ha-actions"><span><Star size={13} weight="fill"/>{es ? 'Calificar' : 'Rate'}</span><span><ForkKnife size={13} weight="fill"/>{es ? 'Menú' : 'Menu'}</span></div>
    </div>}
    <AppNav es={es} view={view} onView={onView} slug={slug} icons={[Ticket, ListBullets]}/>
   </div>
  </div>
 </div>;
}

// ---------- Analizador: ventana de escritorio ----------
const ISSUES: [string, string, number, boolean][] = [
 ['Escrito de varias formas', 'Written several ways', 3, true], ['Fechas mezcladas', 'Mixed dates', 3, true], ['Espacios sobrantes', 'Extra spaces', 2, true],
 ['Filas repetidas', 'Duplicate rows', 1, true], ['Separador de miles', 'Thousands separator', 1, true], ['Regla de negocio', 'Business rule', 1, false],
];
const ROWS: [string, string, string, number][] = [
 ['03/03/2026', 'Grupo Garza', '$12,480', -1], ['2026-03-04', 'Aceros Loma', '$8,150', 0], ['05/03/2026', 'grupo garza ', '$9,730', 1],
 ['06/03/2026', 'Talleres Sur', '$15,200', -1], ['07/03/2026', 'Aceros Loma', '-$1,050', 2],
];
const FIXED = ['04/03/2026', 'Grupo Garza'];
export function CsvApp({ lang, view, onView, slug }: Props) {
 const es = lang === 'es';
 return <div className={`ha ha-csv v-${view}`}>
  <div className="ha-win">
   <header className="ha-titlebar"><i/><i/><i/><b>ventas_marzo.csv</b><small>1,240 {es ? 'filas' : 'rows'}</small></header>
   {view === 'sum' ? <div className="ha-view ha-csv-sum" key="sum">
    <div className="ha-gauge"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" className="ha-track"/><circle cx="60" cy="60" r="50" className="ha-arc" pathLength={100}/></svg>
     <div><b><span className="a">7</span><span className="b">1</span></b><small><span className="a">{es ? 'problemas' : 'issues'}</span><span className="b"><WarningCircle size={12} weight="fill"/>{es ? 'por revisar' : 'to review'}</span></small></div></div>
    <div className="ha-issues">
     {ISSUES.map(([a, b, n, fix], i) => <div key={b} className={`ha-issue${fix ? ' fix' : ' rule'}`} style={{ ['--i' as string]: i, ['--w' as string]: `${n / 3 * 100}%` }}>
      <span className="ha-ico">{fix ? <><Lightning size={13} weight="fill" className="x"/><CheckCircle size={13} weight="fill" className="y"/></> : <WarningCircle size={13} weight="fill"/>}</span>
      <span className="ha-lbl">{es ? a : b}</span><span className="ha-bar"><i/></span><span className="ha-n">{n}</span>
     </div>)}
     <span className="ha-fix"><Lightning size={13} weight="fill"/>{es ? 'Arreglar 5' : 'Fix 5'}</span>
    </div>
   </div> : <div className="ha-view ha-csv-full" key="full">
    <table><colgroup><col style={{ width: '36%' }}/><col style={{ width: '37%' }}/><col/></colgroup><thead><tr><th>{es ? 'fecha' : 'date'}</th><th>{es ? 'cliente' : 'customer'}</th><th>{es ? 'importe' : 'amount'}</th></tr></thead>
     <tbody>{ROWS.map((r, i) => <tr key={i} style={{ ['--i' as string]: i }}>{[r[0], r[1], r[2]].map((c, j) => <td key={j} className={r[3] === j ? (j === 2 ? 'rule' : 'fixed') : ''}>{r[3] === j && j < 2 ? FIXED[j] : c}</td>)}</tr>)}</tbody></table>
    <div className="ha-mini"><span>{es ? 'Importe por línea' : 'Amount by line'}</span>{([['L1', 88], ['L2', 52], ['L3', 70]] as const).map(([l, h], i) => <i key={l} style={{ ['--h' as string]: h, ['--i' as string]: i }}><b/>{l}</i>)}</div>
   </div>}
   <AppNav es={es} view={view} onView={onView} slug={slug} icons={[ListChecks, Table]}/>
  </div>
 </div>;
}

// ---------- Planta: tableta en el piso ----------
const LINES: [string, number][] = [['L1', .828], ['L2', .786], ['L3', .807]];
const STOPS: [string, string, number][] = [['Falla en robot de soldadura', 'Welding robot failure', 112], ['Falta de material', 'Material shortage', 44], ['Sin causa registrada', 'No cause logged', 41], ['Cambio de modelo', 'Model changeover', 38]];
function Ring({ v, big }: { v: number; big?: boolean }) {
 return <span className={`ha-ring${big ? ' big' : ''}${v >= .85 ? ' ok' : ''}`}><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" className="ha-track"/><circle cx="60" cy="60" r="50" className="ha-arc" pathLength={100} style={{ ['--o' as string]: `${100 - v * 100}px` }}/><circle cx="60" cy="60" r="50" className="ha-goal" pathLength={100}/></svg><b>{Math.round(v * 100)}<small>%</small></b></span>;
}
export function PlantaApp({ lang, view, onView, slug }: Props) {
 const es = lang === 'es';
 return <div className={`ha ha-planta v-${view}`}>
  <div className="ha-tablet">
   <header className="ha-plhead"><b>{es ? 'Planta · Turno 1' : 'Plant · Shift 1'}</b><small>{es ? '3 reportes cruzados' : '3 reports matched'}</small></header>
   {view === 'sum' ? <div className="ha-view ha-pl-sum" key="sum">
    <div className="ha-pl-total"><Ring v={.807} big/><p><strong>OEE</strong><span>{es ? 'Eficiencia general del equipo' : 'Overall equipment effectiveness'}</span><em>{es ? 'Meta 85 %' : 'Goal 85%'}</em></p></div>
    <div className="ha-pl-lines">{LINES.map(([l, v], i) => <div key={l} style={{ ['--i' as string]: i }}><Ring v={v}/><span>{es ? 'Línea' : 'Line'} {l.slice(1)}</span></div>)}</div>
   </div> : <div className="ha-view ha-pl-full" key="full">
    <p className="ha-pl-h">{es ? 'Detenciones por causa' : 'Stops by cause'}<span className="ha-warn"><WarningCircle size={13} weight="fill"/>{es ? '9 por revisar' : '9 to review'}</span></p>
    <ol>{STOPS.map(([a, b, m], i) => <li key={b} style={{ ['--i' as string]: i, ['--w' as string]: `${m / 112 * 100}%` }}><span>{es ? a : b}</span><i><b/></i><em>{m} min</em></li>)}</ol>
    <div className="ha-actions"><span><MicrosoftExcelLogo size={14} weight="fill"/>Excel</span><span><WhatsappLogo size={14} weight="fill"/>WhatsApp</span></div>
   </div>}
   <AppNav es={es} view={view} onView={onView} slug={slug} icons={[Gauge, ChartBar]}/>
  </div>
 </div>;
}
