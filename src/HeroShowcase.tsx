import { useEffect, useState } from 'react';
import { ClubPreview } from './LoyaltyDemo';
import './hero-showcase.css';

// Portada: tres proyectos reales apilados que rotan solos. La tarjeta del frente lleva a su página.
const SLIDES = [
 { slug: 'punto-u', title: 'Punto U', note: ['Red de favores entre estudiantes', 'A favor network for students'], kind: 'phone', img: '/media/punto-u.webp' },
 { slug: 'club-nfc', title: 'Club NFC', note: ['Clientes que vuelven con un toque', 'Customers who return with one tap'], kind: 'club' },
 { slug: 'analizador-csv', title: 'Analizador CSV', note: ['Limpia reportes en el navegador', 'Cleans reports in the browser'], kind: 'shot', img: '/media/analizador.webp' },
] as const;

export default function HeroShowcase({ lang, paused }: { lang: 'es' | 'en'; paused: boolean }) {
 const es = lang === 'es', L = es ? 0 : 1;
 const [front, setFront] = useState(0);
 const [hover, setHover] = useState(false);
 useEffect(() => {
  if (paused || hover) return;
  const id = setInterval(() => setFront(f => (f + 1) % SLIDES.length), 5200);
  return () => clearInterval(id);
 }, [paused, hover]);

 return <div className="hs" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
  <div className="hs-stage">
   {SLIDES.map((s, i) => {
    const pos = (i - front + SLIDES.length) % SLIDES.length;
    return <a key={s.slug} href={`/proyectos/${s.slug}`} className={`hs-card hs-${s.kind} hs-pos${pos}`} tabIndex={pos === 0 ? 0 : -1} aria-hidden={pos !== 0}
     aria-label={`${s.title} — ${s.note[L]}. ${es ? 'Ver proyecto' : 'View project'}`}>
     {s.kind === 'club' ? <ClubPreview lang={lang}/> : <img src={s.img} alt="" loading={i ? 'lazy' : undefined}/>}
    </a>;
   })}
  </div>
  <div className="hs-tabs" role="tablist" aria-label={es ? 'Proyectos destacados' : 'Featured projects'}>
   {SLIDES.map((s, i) => <button key={s.slug} role="tab" aria-selected={i === front} onClick={() => setFront(i)}>
    <strong>{s.title}</strong><small>{s.note[L]}</small>
    {i === front && !paused && !hover && <span className="hs-progress" aria-hidden="true"/>}
   </button>)}
  </div>
 </div>;
}
