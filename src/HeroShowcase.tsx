import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, WhatsappLogo } from '@phosphor-icons/react';
import PlantaPreview from './PlantaPreview';
import TurnoPreview from './TurnoPreview';
import CasaPreview from './CasaPreview';
import './hero-showcase.css';

// Vistas previas que se animan una sola vez: al llegar a la pantalla corren hasta `ms` y se quedan ahí.
// Con `instant` (o la pausa global) saltan directo a ese cuadro: así el hero nunca se mueve solo.
export function Hold({ ms, instant = false, className, children }: { ms: number; instant?: boolean; className?: string; children: ReactNode }) {
 const ref = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const el = ref.current;
  if (!el?.getAnimations) return;
  const freeze = (t: number) => el.getAnimations({ subtree: true }).forEach(a => { a.currentTime = t; a.pause(); });
  const still = document.documentElement.dataset.motion === 'paused' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (instant || still) { freeze(ms); return; }
  freeze(0);
  let timer = 0;
  const io = new IntersectionObserver(([e]) => {
   if (!e.isIntersecting) return;
   io.disconnect();
   el.getAnimations({ subtree: true }).forEach(a => a.play());
   timer = window.setTimeout(() => freeze(ms), ms);
  }, { threshold: .5 });
  io.observe(el);
  return () => { io.disconnect(); clearTimeout(timer); };
 }, [ms, instant]);
 return <div ref={ref} className={className}>{children}</div>;
}

// Íconos de línea para cada proyecto: el símbolo NFC clásico, una gráfica y un medidor.
export function ProjectIcon({ kind }: { kind: string }) {
 const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
 return <svg className="hs-icon" viewBox="0 0 24 24" aria-hidden="true">
  {kind === 'nfc' && <><rect x="3" y="3" width="18" height="18" rx="5" {...p}/><path d="M8.5 16.5V7.5l7 9V7.5" {...p}/><path d="M6 9.5a4 4 0 0 0 0 5M18 9.5a4 4 0 0 1 0 5" {...p} opacity=".55"/></>}
  {kind === 'chart' && <><rect x="3" y="3" width="18" height="18" rx="5" {...p}/><path d="M7.5 16v-3M12 16V8M16.5 16v-5.5" {...p}/><path d="M7 7.5h2" {...p} opacity=".55"/></>}
  {kind === 'planta' && <><path d="M4.5 16.5a7.5 7.5 0 0 1 15 0" {...p}/><path d="M12 16.5l3.5-4.5" {...p}/><path d="M4 20h16" {...p} opacity=".55"/></>}
 </svg>;
}

// El celular baja sobre el chip, salen las ondas y en su pantalla cae el sello del día (ficha de NFC).
export function NfcTap({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="nt" aria-hidden="true">
  <div className="nt-tag"><ProjectIcon kind="nfc"/><span>NFC</span></div>
  <span className="nt-wave"/><span className="nt-wave w2"/><span className="nt-wave w3"/>
  <div className="nt-phone">
   <i className="nt-notch"/>
   <div className="nt-screen">
    <div className="nt-wa"><WhatsappLogo size={15} weight="fill"/><span><b>WhatsApp</b>{es ? '¿Cómo estuvo la comida? Califícanos' : 'How was the food? Rate us'}</span></div>
    <small>{es ? 'Café Aurora' : 'Aurora Café'}</small>
    <div className="nt-stamps">{Array.from({ length: 6 }, (_, i) => <b key={i} className={i < 3 ? 'on' : i === 3 ? 'new' : ''}/>)}</div>
    <strong>{es ? '+1 sello' : '+1 stamp'}</strong>
    <em>{es ? 'Te faltan 2 para tu café' : '2 more for your coffee'}</em>
   </div>
  </div>
 </div>;
}

// Tres accesos del hero: cada fila abre la app y la flecha de al lado, su ficha.
// Pasar el ratón o enfocar una fila cambia la vista grande; nada rota solo.
type Access = { id: string; slug: string; title: [string, string]; line: [string, string]; href: string; external?: boolean; hold: number; view: (lang: 'es' | 'en') => ReactNode };
const ACCESS: Access[] = [
 { id: 'planta', slug: 'planta', title: ['Planta y OEE', 'Plant & OEE'], line: ['Tres reportes, un OEE, cero copiar y pegar.', 'Three reports, one OEE, zero copy-paste.'], href: '/proyectos/planta/app', hold: 3000, view: l => <PlantaPreview lang={l}/> },
 { id: 'turno', slug: 'entrega-de-turno', title: ['Entrega de turno', 'Shift handover'], line: ['Nada se pierde entre turnos.', 'Nothing gets lost between shifts.'], href: '/proyectos/entrega-de-turno/app', hold: 4500, view: l => <TurnoPreview lang={l}/> },
 { id: 'casa', slug: 'la-casa-del-angel', title: ['La Casa del Ángel', 'La Casa del Ángel'], line: ['Página y portal para una residencia real.', 'Website and portal for a real residence.'], href: 'https://la-casa-del-angel.vercel.app', external: true, hold: 0, view: l => <CasaPreview lang={l}/> },
];

export default function HeroAccess({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es', L = es ? 0 : 1;
 const [on, setOn] = useState(0);
 const a = ACCESS[on];
 return <div className="hx">
  <a className={`hx-view media-${a.id}`} href={a.href} tabIndex={-1} aria-hidden="true" {...(a.external ? { target: '_blank', rel: 'noopener noreferrer' } : { 'data-title': a.title[L] })}>
   <Hold key={a.id + lang} ms={a.hold} instant className="hx-frame">{a.view(lang)}</Hold>
  </a>
  {/* Rótulo de la lista: sólo se ve en móvil, donde la vista grande no está */}
  <p className="hx-label" aria-hidden="true">{es ? 'Pruébalas' : 'Try them'}</p>
  <ul className="hx-list" aria-label={es ? 'Apps para probar' : 'Apps to try'}>
   {ACCESS.map((x, i) => <li key={x.id} className={i === on ? 'on' : undefined} onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)}>
    <a className="hx-open" href={x.href} {...(x.external ? { target: '_blank', rel: 'noopener noreferrer' } : { 'data-title': x.title[L] })}>
     {/* Miniatura de la vista previa: sólo en móvil, donde no hay vista grande */}
     <span className="hx-thumb" aria-hidden="true"><Hold ms={x.hold} instant className="hold">{x.view(lang)}</Hold></span>
     <span className="hx-name">{x.title[L]}</span>
     <span className="hx-line">{x.line[L]}</span>
     <span className="hx-go">{x.external ? (es ? 'Abrir la página' : 'Open the website') : (es ? 'Abrir la app' : 'Open the app')}{x.external ? <><ArrowUpRight size={16} aria-hidden="true"/><span className="sr-only">{es ? '(se abre en otra pestaña)' : '(opens in a new tab)'}</span></> : <ArrowRight size={16} aria-hidden="true"/>}</span>
    </a>
    <a className="hx-page" href={`/proyectos/${x.slug}`} data-title={x.title[L]} aria-label={`${x.title[L]}: ${es ? 'ficha del proyecto' : 'project page'}`}><span aria-hidden="true">{es ? 'Ficha' : 'Page'}</span><ArrowRight size={16} aria-hidden="true"/></a>
   </li>)}
  </ul>
 </div>;
}
