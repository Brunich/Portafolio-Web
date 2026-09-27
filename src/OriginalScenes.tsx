import { useEffect, useRef, useState } from 'react';
import './original-scenes.css';

const STYLE_NAME: Record<number, [string, string]> = { 0: ['Definitive', 'Definitive'], 1: ['Intermedio', 'Intermediate'], 3: ['3D sin pixelado', 'Unpixelated 3D'] };
const PAIRS: [number, number][] = [[0, 3], [1, 3], [0, 1]];
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
 const [split, setSplit] = useState(50);
 const [pair, setPair] = useState(0);
 const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
 const [lensOn, setLensOn] = useState(true);
 const [pano, setPano] = useState(0);
 const [open, setOpen] = useState(false);
 const [hovering, setHovering] = useState(false);
 const dialog = useRef<HTMLDialogElement>(null);
 const [left, right] = PAIRS[pair];

 useEffect(() => {
  if (paused || open || hovering) return;
  const id = setInterval(() => setPano(p => (p + 1) % PANORAMAS.length), 6500);
  return () => clearInterval(id);
 }, [paused, open, hovering]);
 useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);

 const moveLens = (e: React.PointerEvent<HTMLDivElement>) => {
  if (!lensOn || e.pointerType === 'touch') return;
  const b = e.currentTarget.getBoundingClientRect();
  setLens({ x: e.clientX - b.left, y: e.clientY - b.top, w: b.width, h: b.height });
 };
 const ZOOM = 3, R = 85;
 const lensSrc = lens && lens.x / lens.w * 100 < split ? left : right;

 return <section id="graphics" className="wrap section-space"><div className="section-heading"><div><h2>{es ? 'Entornos y dirección visual.' : 'Environments & visual direction.'}</h2><p>{es ? 'IA Rogue · Bosque Definitive. Composición, vegetación, iluminación y estilos de renderizado en una escena jugable.' : 'IA Rogue · Definitive Forest. Composition, vegetation, lighting and rendering styles in a playable scene.'}</p></div></div>
  <div className="original-gallery"><div className="original-toolbar"><h3>{es ? 'Bosque Definitive' : 'Definitive Forest'}</h3><div>{[es ? 'Tres cuartos' : 'Three-quarter', es ? 'Primera persona' : 'First-person'].map((label, i) => <button key={label} onClick={() => setView(i)} aria-pressed={view === i}>{label}</button>)}</div></div><img className="original-scene" src={`/media/rogue-forest-${view ? 'first-person' : 'overview'}.webp`} width="1600" height="1000" loading="lazy" alt={es ? (view ? 'Vista en primera persona del bosque al anochecer' : 'Bosque con luz solar, vegetación y sendero en vista tres cuartos') : (view ? 'First-person forest view at dusk' : 'Forest with sunlight, vegetation and path in three-quarter view')}/><p className="original-caption">{es ? 'Captura del juego · Cámara y hora distintas en cada vista.' : 'In-game capture · Each view uses a different camera and time of day.'}</p></div>

  <div className="original-compare-heading"><h3>{es ? 'El mismo bosque. Tres estilos originales.' : 'The same forest. Three original styles.'}</h3><p>{es ? 'Elige una pareja de estilos y arrastra la división. Con la lupa ves de cerca cómo cambia cada píxel. Escena, sol, vegetación y ambiente son los originales.' : 'Pick a pair of styles and drag the divider. The magnifier shows how each pixel changes. Scene, sun, vegetation and atmosphere are original.'}</p></div>
  <div className="original-gallery"><div className="original-toolbar"><h3>{es ? 'Comparador de renderizado' : 'Rendering comparison'}</h3><div className="original-pairs">{PAIRS.map(([a, b], i) => <button key={i} aria-pressed={pair === i} onClick={() => setPair(i)}>{STYLE_NAME[a][L]} <span aria-hidden="true">↔</span> {STYLE_NAME[b][L]}</button>)}<button className="lens-toggle" aria-pressed={lensOn} onClick={() => { setLensOn(!lensOn); setLens(null); }}>{es ? 'Lupa ×3' : 'Magnifier ×3'}</button></div></div>
   <div className="original-comparator" onPointerMove={moveLens} onPointerLeave={() => setLens(null)}>
    <img src={`/media/shader-original/forest_${right}.webp`} alt={`${es ? 'Bosque en estilo' : 'Forest in style'} ${STYLE_NAME[right][L]}`} loading="lazy"/>
    <img src={`/media/shader-original/forest_${left}.webp`} alt={`${es ? 'Bosque en estilo' : 'Forest in style'} ${STYLE_NAME[left][L]}`} loading="lazy" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}/>
    <div className="original-split" style={{ left: `${split}%` }}><span aria-hidden="true">↔</span></div>
    <div className="original-side-labels"><span>{STYLE_NAME[left][L]}</span><span>{STYLE_NAME[right][L]}</span></div>
    {lens && <div className="original-lens" aria-hidden="true" style={{ left: lens.x - R, top: lens.y - R, width: R * 2, height: R * 2, backgroundImage: `url(/media/shader-original/forest_${lensSrc}.webp)`, backgroundSize: `${lens.w * ZOOM}px ${lens.h * ZOOM}px`, backgroundPosition: `${R - lens.x * ZOOM}px ${R - lens.y * ZOOM}px` }}><small>{STYLE_NAME[lensSrc][L]}</small></div>}
    <input type="range" min="0" max="100" value={split} onChange={e => setSplit(Number(e.target.value))} aria-label={es ? 'Comparación de estilos originales' : 'Original style comparison'} aria-valuetext={`${split}% ${STYLE_NAME[left][L]}`}/>
   </div>
   <p className="original-caption">{es ? 'Arrastra sobre la imagen o usa las flechas del teclado. Capturas del motor Godot: el comparador no recrea los shaders en el navegador.' : 'Drag across the image or use the arrow keys. Captured in Godot: the comparison does not recreate shaders in the browser.'}</p>
  </div>

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
