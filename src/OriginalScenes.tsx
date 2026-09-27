import { useEffect, useRef, useState } from 'react';
import ModelLab from './ModelLab';
import './original-scenes.css';

const PANORAMAS: { file: string; title: [string, string]; note: [string, string] }[] = [
 { file: 'templo-portico', title: ['Pórtico del templo', 'Temple portico'], note: ['Antorchas, piedra y agua de noche', 'Torches, stone and water at night'] },
 { file: 'costa-atardecer', title: ['Costa al atardecer', 'Coast at sunset'], note: ['Llegada junto al acantilado', 'Arrival by the cliff'] },
 { file: 'ciudad-noche', title: ['Ciudad de noche', 'City at night'], note: ['Ventanas encendidas, vista ortográfica', 'Lit windows, orthographic view'] },
 { file: 'costa-facetada', title: ['Costa facetada', 'Faceted coast'], note: ['Iluminación cel facetada', 'Faceted cel lighting'] },
 { file: 'isla-ciudad', title: ['Isla ciudad', 'Island city'], note: ['Nivel generado por el juego', 'Game-generated level'] },
];

export default function OriginalScenes({ lang, paused }: { lang: 'es' | 'en'; paused: boolean }) {
 const es = lang === 'es', L = es ? 0 : 1;
 const [view, setView] = useState(0);
 const [pano, setPano] = useState(0);
 const [open, setOpen] = useState(false);
 const [hovering, setHovering] = useState(false);
 const dialog = useRef<HTMLDialogElement>(null);

 useEffect(() => {
  if (paused || open || hovering) return;
  const id = setInterval(() => setPano(p => (p + 1) % PANORAMAS.length), 6500);
  return () => clearInterval(id);
 }, [paused, open, hovering]);
 useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);

 return <section id="graphics" className="wrap section-space"><div className="section-heading"><div><h2>{es ? 'Entornos y dirección visual.' : 'Environments & visual direction.'}</h2><p>{es ? 'IA Rogue, mi videojuego en Godot. Composición, vegetación, iluminación y estilos de renderizado en escenas jugables.' : 'IA Rogue, my Godot game. Composition, vegetation, lighting and rendering styles in playable scenes.'}</p></div></div>
  <div className="original-gallery"><div className="original-toolbar"><h3>{es ? 'El bosque' : 'The forest'}</h3><div>{[es ? 'Tres cuartos' : 'Three-quarter', es ? 'Primera persona' : 'First-person'].map((label, i) => <button key={label} onClick={() => setView(i)} aria-pressed={view === i}>{label}</button>)}</div></div><img className="original-scene" src={`/media/rogue-forest-${view ? 'first-person' : 'overview'}.webp`} width="1600" height="1000" loading="lazy" alt={es ? (view ? 'Vista en primera persona del bosque al anochecer' : 'Bosque con luz solar, vegetación y sendero en vista tres cuartos') : (view ? 'First-person forest view at dusk' : 'Forest with sunlight, vegetation and path in three-quarter view')}/><p className="original-caption">{es ? 'Captura del juego · Cámara y hora distintas en cada vista.' : 'In-game capture · Each view uses a different camera and time of day.'}</p></div>

  <div className="original-compare-heading"><h3>{es ? 'Un personaje, tres estilos.' : 'One character, three styles.'}</h3><p>{es ? 'Compara pixel art, cel shading y 3D realista sobre el mismo modelo. Gíralo, acércate y cambia el tamaño del píxel en tiempo real.' : 'Compare pixel art, cel shading and realistic 3D on the same model. Rotate it, zoom in and change the pixel size in real time.'}</p></div>
  <ModelLab lang={lang} paused={paused}/>

  <div className="original-compare-heading"><h3>{es ? 'Más escenas del proyecto.' : 'More scenes from the project.'}</h3><p>{es ? 'Panorámicas de distintos biomas y etapas de IA Rogue. Toca una para verla a pantalla completa.' : 'Panoramas from different IA Rogue biomes and stages. Tap one to view it full screen.'}</p></div>
  <div className="pano" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
   <button className="pano-stage" onClick={() => setOpen(true)} aria-label={`${PANORAMAS[pano].title[L]} — ${es ? 'ver a pantalla completa' : 'view full screen'}`}>
    {PANORAMAS.map((p, i) => <img key={p.file} src={`/media/panoramas/${p.file}.webp`} alt="" className={i === pano ? 'on' : ''} loading={i ? 'lazy' : undefined}/>)}
    <span className="pano-title"><strong>{PANORAMAS[pano].title[L]}</strong>{PANORAMAS[pano].note[L]}</span>
    {!paused && !hovering && !open && <span className="pano-progress" key={pano}/>}
   </button>
   <div className="pano-thumbs" role="tablist" aria-label={es ? 'Escenas' : 'Scenes'}>{PANORAMAS.map((p, i) => <button key={p.file} role="tab" aria-selected={i === pano} onClick={() => setPano(i)}><img src={`/media/panoramas/${p.file}.webp`} alt="" loading="lazy"/><span>{p.title[L]}</span></button>)}</div>
  </div>
  <dialog ref={dialog} className="pano-dialog" onClose={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
   <img src={`/media/panoramas/${PANORAMAS[pano].file}.webp`} alt={PANORAMAS[pano].title[L]}/>
   <div className="pano-dialog-bar"><button onClick={() => setPano((pano + PANORAMAS.length - 1) % PANORAMAS.length)} aria-label={es ? 'Anterior' : 'Previous'}>←</button><span>{PANORAMAS[pano].title[L]} · {PANORAMAS[pano].note[L]}</span><button onClick={() => setPano((pano + 1) % PANORAMAS.length)} aria-label={es ? 'Siguiente' : 'Next'}>→</button><button onClick={() => setOpen(false)} aria-label={es ? 'Cerrar' : 'Close'}>✕</button></div>
  </dialog>
 </section>;
}
