import { useEffect, useState } from 'react';
import CsvChart from './CsvChart';
import './hero-showcase.css';

// Portada: tres proyectos reales apilados que rotan solos. La tarjeta del frente lleva a su página.
const SLIDES = [
 { slug: 'club-nfc', title: 'NFC para negocios', note: ['Un sello con acercar el celular', 'A stamp with one tap'], kind: 'nfc' },
 { slug: 'analizador-csv', title: 'Analizador CSV', note: ['Limpia reportes en el navegador', 'Cleans reports in the browser'], kind: 'chart' },
 { slug: 'punto-u', title: 'Punto U', note: ['Red de favores entre estudiantes', 'A favor network for students'], kind: 'phone', img: '/media/punto-u.webp' },
] as const;

// Íconos de línea para cada proyecto: el símbolo NFC clásico, una gráfica y un pin en el mapa.
export function ProjectIcon({ kind }: { kind: string }) {
 const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
 return <svg className="hs-icon" viewBox="0 0 24 24" aria-hidden="true">
  {kind === 'nfc' && <><rect x="3" y="3" width="18" height="18" rx="5" {...p}/><path d="M8.5 16.5V7.5l7 9V7.5" {...p}/><path d="M6 9.5a4 4 0 0 0 0 5M18 9.5a4 4 0 0 1 0 5" {...p} opacity=".55"/></>}
  {kind === 'chart' && <><rect x="3" y="3" width="18" height="18" rx="5" {...p}/><path d="M7.5 16v-3M12 16V8M16.5 16v-5.5" {...p}/><path d="M7 7.5h2" {...p} opacity=".55"/></>}
  {kind === 'phone' && <><path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21z" {...p}/><circle cx="12" cy="10.5" r="2.4" {...p}/></>}
 </svg>;
}

// El celular baja sobre el chip, salen las ondas y en su pantalla cae el sello del día.
export function NfcTap({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="nt" aria-hidden="true">
  <div className="nt-tag"><ProjectIcon kind="nfc"/><span>NFC</span></div>
  <span className="nt-wave"/><span className="nt-wave w2"/><span className="nt-wave w3"/>
  <div className="nt-phone">
   <i className="nt-notch"/>
   <div className="nt-screen">
    <small>{es ? 'Café Aurora' : 'Aurora Café'}</small>
    <div className="nt-stamps">{Array.from({ length: 6 }, (_, i) => <b key={i} className={i < 3 ? 'on' : i === 3 ? 'new' : ''}/>)}</div>
    <strong>{es ? '+1 sello' : '+1 stamp'}</strong>
    <em>{es ? 'Te faltan 2 para tu café' : '2 more for your coffee'}</em>
   </div>
  </div>
 </div>;
}

export default function HeroShowcase({ lang, paused }: { lang: 'es' | 'en'; paused: boolean }) {
 const es = lang === 'es', L = es ? 0 : 1;
 const [front, setFront] = useState(0);
 const [hover, setHover] = useState(false);
 useEffect(() => {
  if (paused || hover) return;
  const id = setInterval(() => setFront(f => (f + 1) % SLIDES.length), 5600);
  return () => clearInterval(id);
 }, [paused, hover]);

 return <div className="hs" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
  <div className="hs-stage">
   {SLIDES.map((s, i) => {
    const pos = (i - front + SLIDES.length) % SLIDES.length;
    return <a key={s.slug} href={`/proyectos/${s.slug}`} data-title={s.title} className={`hs-card hs-${s.kind} hs-pos${pos}`} tabIndex={pos === 0 ? 0 : -1} aria-hidden={pos !== 0}
     aria-label={`${s.title} — ${s.note[L]}. ${es ? 'Ver proyecto' : 'View project'}`}>
     {s.kind === 'nfc' ? (pos === 0 && <NfcTap key={front} lang={lang}/>) : s.kind === 'chart' ? <div className="hs-rect"><CsvChart lang={lang}/></div> : <img src={s.img} width="600" height="1300" alt="" loading={i ? 'lazy' : undefined}/>}
    </a>;
   })}
  </div>
  <div className="hs-tabs" role="tablist" aria-label={es ? 'Proyectos destacados' : 'Featured projects'}>
   {SLIDES.map((s, i) => <button key={s.slug} role="tab" aria-selected={i === front} onClick={() => setFront(i)} className={`t-${s.kind}`}>
    <ProjectIcon kind={s.kind}/><span><strong>{s.title}</strong><small>{s.note[L]}</small></span>
    {i === front && !paused && !hover && <span className="hs-progress" aria-hidden="true"/>}
   </button>)}
  </div>
 </div>;
}
