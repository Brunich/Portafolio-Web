import { useEffect, useRef, useState } from 'react';
import ModelLab from './ModelLab';
import './original-scenes.css';

const PANORAMAS: { file: string; title: [string, string]; note: [string, string] }[] = [
 { file: 'templo-portico', title: ['Pórtico del templo', 'Temple portico'], note: ['Antorchas, piedra y agua de noche', 'Torches, stone and water at night'] },
 { file: 'costa-facetada', title: ['Costa facetada', 'Faceted coast'], note: ['Iluminación cel facetada', 'Faceted cel lighting'] },
];

const GAME_METRICS: [string, [string, string]][] = [
 ['18 → 55 fps', ['al dejar de crear 195 materiales en cada cuadro', 'by no longer creating 195 materials every frame']],
 ['13,3 → 7,1 ms', ['por cuadro en el bosque: el cielo y el minimapa eran el costo, no los árboles', 'per frame in the forest: the sky and minimap were the cost, not the trees']],
 ['831', ['baterías de pruebas automáticas que avisan si algo vuelve', 'automated test batteries that warn if something comes back']],
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

 return <section id="graphics" className="wrap section-space gamedev"><div className="section-heading"><div><span className="gamedev-kicker">Game development</span><h2>{es ? 'IA Rogue, mi videojuego en Godot.' : 'IA Rogue, my Godot game.'}</h2><p>{es ? 'Un roguelike 3D que hago como hobby profesional: dirijo lo visual, armo las escenas, escribo los shaders y mido el rendimiento antes de tocar código.' : 'A 3D roguelike I build as a professional hobby: I direct the visuals, build the scenes, write the shaders and measure performance before touching code.'}</p><div className="tags gamedev-tags">{(es ? ['Dirección visual', 'Game dev', 'Modelado 3D', 'Shaders', 'Hobby profesional'] : ['Visual direction', 'Game dev', '3D modeling', 'Shaders', 'Professional hobby']).map(tag => <span key={tag}>{tag}</span>)}</div></div></div>
  <dl className="gamedev-metrics">{GAME_METRICS.map(([value, label]) => <div key={value}><dt>{value}</dt><dd>{label[L]}</dd></div>)}</dl>
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
