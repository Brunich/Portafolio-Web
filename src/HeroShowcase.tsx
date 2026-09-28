import { useEffect, useState } from 'react';
import { WhatsappLogo } from '@phosphor-icons/react';
import { NfcApp, CsvApp, PlantaApp } from './HeroApps';
import type { View } from './HeroApps';
import './hero-showcase.css';

// Portada: tres apps apiladas que rotan solas. Cada una enseña su resumen, luego su vista completa,
// y su botón «Abrir» lleva a la herramienta real.
const SLIDES = [
 { slug: 'club-nfc', title: ['NFC para negocios', 'NFC for businesses'], kind: 'nfc', App: NfcApp },
 { slug: 'analizador-csv', title: ['Analizador CSV', 'CSV Analyzer'], kind: 'chart', App: CsvApp },
 { slug: 'planta', title: ['Planta y OEE', 'Plant & OEE'], kind: 'planta', App: PlantaApp },
] as const;
const SUM = 3600, FULL = 3800;

// Íconos de línea para cada proyecto: el símbolo NFC clásico, una gráfica y un medidor.
export function ProjectIcon({ kind }: { kind: string }) {
 const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
 return <svg className="hs-icon" viewBox="0 0 24 24" aria-hidden="true">
  {kind === 'nfc' && <><rect x="3" y="3" width="18" height="18" rx="5" {...p}/><path d="M8.5 16.5V7.5l7 9V7.5" {...p}/><path d="M6 9.5a4 4 0 0 0 0 5M18 9.5a4 4 0 0 1 0 5" {...p} opacity=".55"/></>}
  {kind === 'chart' && <><rect x="3" y="3" width="18" height="18" rx="5" {...p}/><path d="M7.5 16v-3M12 16V8M16.5 16v-5.5" {...p}/><path d="M7 7.5h2" {...p} opacity=".55"/></>}
  {kind === 'planta' && <><path d="M4.5 16.5a7.5 7.5 0 0 1 15 0" {...p}/><path d="M12 16.5l3.5-4.5" {...p}/><path d="M4 20h16" {...p} opacity=".55"/></>}
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
    <div className="nt-wa"><WhatsappLogo size={15} weight="fill"/><span><b>WhatsApp</b>{es ? '¿Cómo estuvo la comida? Califícanos ★★★★★' : 'How was the food? Rate us ★★★★★'}</span></div>
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
 const [view, setView] = useState<View>('sum');
 const [hover, setHover] = useState(false);
 const [hold, setHold] = useState(false);
 // Resumen → completo → la siguiente app. Si la persona toca algo, se queda quieta un rato.
 useEffect(() => {
  if (paused || hover || hold) return;
  const id = setTimeout(() => { if (view === 'sum') setView('full'); else { setView('sum'); setFront(f => (f + 1) % SLIDES.length); } }, view === 'sum' ? SUM : FULL);
  return () => clearTimeout(id);
 }, [front, view, paused, hover, hold]);
 useEffect(() => { if (!hold) return; const id = setTimeout(() => setHold(false), 12000); return () => clearTimeout(id); }, [hold, front, view]);
 const pick = (v: View) => { setView(v); setHold(true); };

 return <div className="hs" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
  <div className="hs-stage">
   {SLIDES.map((s, i) => {
    const pos = (i - front + SLIDES.length) % SLIDES.length, App = s.App;
    return <div key={s.slug} className={`hs-card hs-${s.kind} hs-pos${pos}`} inert={pos !== 0} aria-hidden={pos !== 0 || undefined} role="group" aria-label={s.title[L]}>
     <App lang={lang} view={pos === 0 ? view : 'sum'} onView={pick} slug={s.slug} key={pos === 0 ? `f${front}` : 'b'}/>
    </div>;
   })}
  </div>
  <div className="hs-tabs" role="tablist" aria-label={es ? 'Apps destacadas' : 'Featured apps'}>
   {SLIDES.map((s, i) => <button key={s.slug} role="tab" aria-selected={i === front} onClick={() => { setFront(i); setView('sum'); setHold(true); }} className={`t-${s.kind}`}>
    <ProjectIcon kind={s.kind}/><strong>{s.title[L]}</strong>
    {i === front && !paused && !hover && !hold && <span className="hs-progress" key={front} style={{ animationDuration: `${SUM + FULL}ms` }} aria-hidden="true"/>}
   </button>)}
  </div>
 </div>;
}
