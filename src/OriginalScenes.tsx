import { useEffect, useRef, useState } from 'react';
import ModelLab from './ModelLab';
import './original-scenes.css';

// Una sola galería: el bosque en sus dos cámaras y las panorámicas de otros biomas.
// `soft` es la misma toma sin pixelado: esas fotos llevan un interruptor de pixel art.
type Shot = { file: string; soft?: string; title: [string, string]; note: [string, string] };
const PANORAMAS: Shot[] = [
 { file: 'escenas/templo-noche-pixel', soft: 'escenas/templo-noche-suave', title: ['El templo de noche', 'The temple at night'], note: ['Cámara 1, de frente. Quita y pon el pixel art', 'Camera 1, front view. Toggle the pixel art'] },
 { file: 'escenas/templo-dia-pixel', soft: 'escenas/templo-dia-suave', title: ['El templo de día', 'The temple by day'], note: ['Mismo encuadre e instante que de noche', 'Same framing and moment as at night'] },
 { file: 'escenas/bosque-camara-1', title: ['El bosque · cámara 1', 'The forest · camera 1'], note: ['Cámara clásica en tres cuartos', 'Classic three-quarter camera'] },
 { file: 'escenas/bosque-camara-2', title: ['El bosque · cámara 2', 'The forest · camera 2'], note: ['Cámara en perspectiva', 'Perspective camera'] },
 { file: 'escenas/arbol-camara-1', title: ['Un árbol · cámara 1', 'One tree · camera 1'], note: ['El mismo árbol desde las tres cámaras', 'The same tree from all three cameras'] },
 { file: 'escenas/arbol-camara-2', title: ['Un árbol · cámara 2', 'One tree · camera 2'], note: ['Perspectiva', 'Perspective'] },
 { file: 'escenas/arbol-camara-3', title: ['Un árbol · cámara 3', 'One tree · camera 3'], note: ['Sobre el hombro', 'Over the shoulder'] },
 { file: 'escenas/bosque-oscuro', title: ['El bosque oscuro', 'The dark forest'], note: ['El portal entre los árboles', 'The portal among the trees'] },
 { file: 'escenas/bosque-oscuro-claro-de-la-espada', title: ['El claro de la espada', 'The sword clearing'], note: ['Un haz de luz sobre la roca', 'A beam of light on the rock'] },
 { file: 'escenas/espada-de-cerca', title: ['La espada', 'The sword'], note: ['De cerca, clavada en la roca', 'Up close, set in the rock'] },
 { file: 'escenas/lago', title: ['El lago', 'The lake'], note: ['Agua con reflejos entre el pasto', 'Water with reflections in the grass'] },
 { file: 'escenas/arana-jefa', title: ['La araña jefa', 'The spider boss'], note: ['Frente al templo, sobre el agua', 'Before the temple, over the water'] },
 { file: 'panoramas/costa-atardecer', title: ['La cascada al atardecer', 'The waterfall at sunset'], note: ['Agua que cae por delante del acantilado', 'Water falling in front of the cliff'] },
 { file: 'rogue-forest-overview', title: ['Rayos entre los árboles', 'Light through the trees'], note: ['Vista tres cuartos en pixel art', 'Three-quarter view in pixel art'] },
 { file: 'rogue-forest-first-person', title: ['El bosque al anochecer', 'The forest at dusk'], note: ['Primera persona, niebla y luna', 'First person, fog and moon'] },
];

const GAME_METRICS: [string, [string, string]][] = [
 ['18 → 55 fps', ['sin crear materiales en cada cuadro', 'by not creating materials every frame']],
 ['13,3 → 7,1 ms', ['por cuadro: el costo era el cielo, no los árboles', 'per frame: the cost was the sky, not the trees']],
 ['831', ['baterías de pruebas automáticas', 'automated test batteries']],
];

export default function OriginalScenes({ lang, paused }: { lang: 'es' | 'en'; paused: boolean }) {
 const es = lang === 'es', L = es ? 0 : 1;
 const [pano, setPano] = useState(0);
 const [pixel, setPixel] = useState(true);
 const src = (p: Shot) => `/media/${p.soft && !pixel ? p.soft : p.file}.webp`;
 const cur = PANORAMAS[pano];
 const [open, setOpen] = useState(false);
 const [hovering, setHovering] = useState(false);
 const dialog = useRef<HTMLDialogElement>(null);

 useEffect(() => {
  if (paused || open || hovering) return;
  const id = setInterval(() => setPano(p => (p + 1) % PANORAMAS.length), 6500);
  return () => clearInterval(id);
 }, [paused, open, hovering]);
 useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);

 return <section id="graphics" className="wrap section-space gamedev"><div className="section-heading"><div><span className="kicker">03 · Game development</span><h2>{es ? 'IA Rogue, mi videojuego en Godot.' : 'IA Rogue, my Godot game.'}</h2><p>{es ? 'Proyecto personal de modelado y diseño en Blender, con escenas jugables, mecánicas y distintas cámaras funcionales.' : 'A personal project of modeling and design in Blender, with playable scenes, mechanics and several working cameras.'}</p><div className="tags gamedev-tags">{(es ? ['Dirección visual', 'Game dev', 'Modelado 3D', 'Shaders', 'Hobby profesional'] : ['Visual direction', 'Game dev', '3D modeling', 'Shaders', 'Professional hobby']).map(tag => <span key={tag}>{tag}</span>)}</div></div></div>
  <dl className="gamedev-metrics">{GAME_METRICS.map(([value, label]) => <div key={value}><dt>{value}</dt><dd>{label[L]}</dd></div>)}</dl>
  <div className="original-compare-heading"><h3>{es ? 'Un personaje, tres estilos.' : 'One character, three styles.'}</h3><p>{es ? 'Gíralo, acércate y cambia el tamaño del píxel.' : 'Rotate it, zoom in and change the pixel size.'}</p></div>
  <ModelLab lang={lang} paused={paused}/>

  <div className="original-compare-heading"><h3>{es ? 'Escenas del juego.' : 'Scenes from the game.'}</h3><p>{es ? 'Capturas del juego desde sus tres cámaras, sin retoque. Toca una para verla completa.' : 'In-game captures from its three cameras, untouched. Tap one to see it in full.'}</p></div>
  <div className="pano" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
   <button className="pano-stage" onClick={() => setOpen(true)} aria-label={`${PANORAMAS[pano].title[L]} — ${es ? 'ver a pantalla completa' : 'view full screen'}`}>
    {PANORAMAS.map((p, i) => <img key={p.file} src={src(p)} alt="" className={i === pano ? 'on' : ''} loading={i ? 'lazy' : undefined}/>)}
    <span className="pano-title"><strong>{PANORAMAS[pano].title[L]}</strong>{PANORAMAS[pano].note[L]}</span>
    {!paused && !hovering && !open && <span className="pano-progress" key={pano}/>}
   </button>
   {cur.soft && <button className="pano-pixel" aria-pressed={pixel} onClick={() => setPixel(!pixel)}><span className="pano-switch" aria-hidden="true"/>{es ? 'Pixel art' : 'Pixel art'}</button>}
   <div className="pano-thumbs" role="tablist" aria-label={es ? 'Escenas' : 'Scenes'}>{PANORAMAS.map((p, i) => <button key={p.file} role="tab" aria-selected={i === pano} onClick={() => setPano(i)}><img src={`/media/${p.file}.webp`} alt="" loading="lazy"/><span>{p.title[L]}</span></button>)}</div>
  </div>
  <dialog ref={dialog} className="pano-dialog" onClose={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
   <img src={src(cur)} alt={cur.title[L]}/>
   <div className="pano-dialog-bar"><button onClick={() => setPano((pano + PANORAMAS.length - 1) % PANORAMAS.length)} aria-label={es ? 'Anterior' : 'Previous'}>←</button><span>{PANORAMAS[pano].title[L]} · {PANORAMAS[pano].note[L]}</span><button onClick={() => setPano((pano + 1) % PANORAMAS.length)} aria-label={es ? 'Siguiente' : 'Next'}>→</button><button onClick={() => setOpen(false)} aria-label={es ? 'Cerrar' : 'Close'}>✕</button></div>
  </dialog>
 </section>;
}
