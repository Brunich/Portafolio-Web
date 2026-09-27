import { useEffect, useRef, useState } from 'react';
import type * as T from 'three';
import './model-lab.css';

// Comparador sobre un modelo 3D real del juego (Null). Los estilos se recrean en WebGL:
// no son capturas del motor, y así se rotulan en la página.
type Style = 'pixel' | 'cel' | 'pbr';
const NAMES: Record<Style, [string, string]> = { pixel: ['Pixel art', 'Pixel art'], cel: ['Cel shading', 'Cel shading'], pbr: ['3D realista', 'Realistic 3D'] };
const PAIRS: [Style, Style][] = [['pixel', 'pbr'], ['cel', 'pbr'], ['pixel', 'cel']];

export default function ModelLab({ lang, paused }: { lang: 'es' | 'en'; paused: boolean }) {
 const es = lang === 'es', L = es ? 0 : 1;
 const host = useRef<HTMLDivElement>(null);
 const [pair, setPair] = useState(0);
 const [split, setSplit] = useState(50);
 const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
 const [pixelSize, setPixelSize] = useState(5);
 const api = useRef<{ zoom: (f: number) => void; reset: () => void; refresh: () => void } | null>(null);
 const state = useRef({ pair, split, paused, pixelSize });
 useEffect(() => { state.current = { pair, split, paused, pixelSize }; api.current?.refresh(); }, [pair, split, paused, pixelSize]);

 useEffect(() => {
  const el = host.current;
  if (!el) return;
  let disposed = false, cleanup = () => {};
  const boot = async () => {
   setStatus('loading');
   try {
    const THREE = await import('three');
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
    const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
    if (disposed) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const key = new THREE.DirectionalLight('#fff1dc', 3.2); key.position.set(-2.5, 3.5, -3);
    const rim = new THREE.DirectionalLight('#7fb4ff', 3.4); rim.position.set(2.5, 2, 3);
    const fill = new THREE.HemisphereLight('#9ec3ff', '#141d33', 0.9);
    scene.add(key, rim, fill);
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d')!; const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(4,8,20,.75)'); grad.addColorStop(1, 'rgba(4,8,20,0)'); sctx.fillStyle = grad; sctx.fillRect(0, 0, 128, 128);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Rampas de luz: 3 bandas para cel, 2 para pixel art (como el shader de bandas del juego).
    const ramp = (steps: number[]) => { const t = new THREE.DataTexture(new Uint8Array(steps), steps.length, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; };
    const celRamp = ramp([60, 140, 255]), pixelRamp = ramp([55, 120, 200, 255]);

    const gltf = await new GLTFLoader().loadAsync('/media/models/null.glb');
    if (disposed) return;
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    model.position.sub(center).add(new THREE.Vector3(0, size.y / 2, 0));
    floor.scale.setScalar(Math.max(size.x, size.z) * 0.9);
    scene.add(model);

    type Entry = { mesh: T.Mesh; pbr: T.Material; cel: T.Material; pixel: T.Material; outline: T.Mesh };
    const entries: Entry[] = [];
    const outlineMat = new THREE.ShaderMaterial({
     uniforms: { uWidth: { value: size.y * 0.0045 } },
     vertexShader: 'uniform float uWidth; void main(){ vec3 p = position + normal * uWidth; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }',
     fragmentShader: 'void main(){ gl_FragColor = vec4(0.02,0.03,0.07,1.0); }',
     side: THREE.BackSide,
    });
    // Se reúnen antes: si no, traverse visitaría también los contornos que se añaden abajo.
    const meshes: T.Mesh[] = [];
    model.traverse(o => { if ((o as T.Mesh).isMesh) meshes.push(o as T.Mesh); });
    meshes.forEach(mesh => {
     const src = mesh.material as T.MeshStandardMaterial;
     const pbr = src.clone(); pbr.envMap = envMap; pbr.envMapIntensity = 0.55;
     const glows = !!src.emissive?.getHex();
     if (glows) pbr.emissiveIntensity = 0.9;
     // Los colores del juego son muy oscuros; en toon se levantan un poco para que las bandas se lean.
     const lifted = src.color.clone().convertLinearToSRGB().multiplyScalar(1.8).convertSRGBToLinear();
     const toon = (gradientMap: T.Texture) => new THREE.MeshToonMaterial({ color: lifted, gradientMap, emissive: src.emissive, emissiveIntensity: glows ? 1.6 : 0 });
     const outline = new THREE.Mesh(mesh.geometry, outlineMat);
     const face = glows || /visor|eye/i.test(`${src.name} ${mesh.name}`);
     if (!face) mesh.add(outline);
     entries.push({ mesh, pbr, cel: toon(celRamp), pixel: toon(pixelRamp), outline });
    });
    const apply = (style: Style) => entries.forEach(e => { e.mesh.material = e[style]; e.outline.visible = style !== 'pbr'; });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08; controls.zoomSpeed = 1.4;
    controls.target.set(0, size.y * 0.52, 0);
    const home = new THREE.Vector3(size.y * 0.95, size.y * 0.68, -size.y * 1.95); // Null mira hacia -Z: tres cuartos de frente
    camera.position.copy(home);
    controls.minDistance = size.y * 0.55; controls.maxDistance = size.y * 4;
    controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.62;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.8;

    const lowRT = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: lowRT.texture, toneMapped: false, transparent: true }));
    quadScene.add(quad);

    let w = 1, h = 1;
    const resize = () => {
     const b = el.getBoundingClientRect(); w = Math.max(1, b.width); h = Math.max(1, b.height);
     renderer.setSize(w, h); camera.aspect = w / h; camera.fov = camera.aspect < 1 ? 32 / camera.aspect * 0.85 : 32; camera.updateProjectionMatrix(); // en vertical se abre el ángulo para que quepa entero
    };
    const drawStyle = (style: Style, x: number, width: number) => {
     if (width <= 0) return;
     renderer.setScissor(x, 0, width, h); renderer.setViewport(0, 0, w, h);
     apply(style);
     if (style === 'pixel') {
      const px = state.current.pixelSize;
      lowRT.setSize(Math.max(8, Math.round(w / px)), Math.max(8, Math.round(h / px)));
      renderer.setRenderTarget(lowRT); renderer.setScissorTest(false); renderer.setClearColor(0x000000, 0); renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.setScissorTest(true);
      renderer.render(quadScene, quadCam);
     } else renderer.render(scene, camera);
    };
    const render = () => {
     const [a, b] = PAIRS[state.current.pair];
     const cut = Math.round(w * state.current.split / 100);
     renderer.setScissorTest(true); renderer.setClearColor(0x000000, 0);
     renderer.setScissor(0, 0, w, h); renderer.clear();
     drawStyle(a, 0, cut); drawStyle(b, cut, w - cut);
    };
    let frame = 0, visible = false, idleTimer = 0;
    let running = false;
    const loop = () => {
     // Marcado como ocupado: controls.update() emite 'change' y no debe agendar un segundo bucle.
     running = true;
     controls.autoRotate = !state.current.paused && idleTimer === 0;
     const moved = controls.update(); render();
     running = false;
     // En pausa sólo se sigue dibujando mientras la inercia del giro se mueve.
     frame = visible && (!state.current.paused || moved) ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!frame && !running && visible) frame = requestAnimationFrame(loop); };
    // Tras interactuar, el giro automático espera un poco antes de volver.
    controls.addEventListener('start', () => { clearTimeout(idleTimer); idleTimer = -1 as unknown as number; });
    controls.addEventListener('end', () => { idleTimer = window.setTimeout(() => { idleTimer = 0; }, 2500); });
    controls.addEventListener('change', kick);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); else { cancelAnimationFrame(frame); frame = 0; } });
    const ro = new ResizeObserver(() => { resize(); kick(); });
    resize(); io.observe(el); ro.observe(el);
    api.current = {
     zoom: f => { const dir = camera.position.clone().sub(controls.target); const d = THREE.MathUtils.clamp(dir.length() * f, controls.minDistance, controls.maxDistance); camera.position.copy(controls.target).add(dir.setLength(d)); kick(); },
     reset: () => { camera.position.copy(home); kick(); },
     refresh: () => { if (!frame) { controls.update(); render(); } },
    };
    setStatus('ready');
    cleanup = () => { cancelAnimationFrame(frame); io.disconnect(); ro.disconnect(); controls.dispose(); renderer.dispose(); lowRT.dispose(); pmrem.dispose(); renderer.domElement.remove(); api.current = null; };
   } catch (err) { console.error('ModelLab', err); if (!disposed) setStatus('error'); }
  };
  // El modelo (2 MB) y three.js sólo se descargan cuando la sección se acerca a la pantalla.
  const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near.disconnect(); void boot(); } }, { rootMargin: '400px' });
  near.observe(el);
  return () => { disposed = true; near.disconnect(); cleanup(); };
 }, []);

 const [a, b] = PAIRS[pair];
 const dragSplit = (e: React.PointerEvent<HTMLDivElement>) => {
  const bounds = host.current?.getBoundingClientRect(); if (!bounds) return;
  setSplit(Math.round(Math.max(0, Math.min(100, (e.clientX - bounds.left) / bounds.width * 100))));
 };
 return <div className="model-lab">
  <div className="original-toolbar"><h3>{es ? 'Null, en tres estilos' : 'Null, in three styles'}</h3><div className="original-pairs">{PAIRS.map(([x, y], i) => <button key={i} aria-pressed={pair === i} onClick={() => setPair(i)}>{NAMES[x][L]} <span aria-hidden="true">↔</span> {NAMES[y][L]}</button>)}</div></div>
  <div className="ml-stage" ref={host}>
   {status !== 'ready' && <p className="ml-status">{status === 'error' ? (es ? 'Tu navegador no pudo iniciar WebGL.' : 'Your browser could not start WebGL.') : (es ? 'Cargando modelo…' : 'Loading model…')}</p>}
   <div className="ml-split" style={{ left: `${split}%` }} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); dragSplit(e); }} onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) dragSplit(e); }}><span aria-hidden="true">↔</span></div>
   <div className="original-side-labels"><span>{NAMES[a][L]}</span><span>{NAMES[b][L]}</span></div>
   <div className="ml-zoom"><button onClick={() => api.current?.zoom(0.8)} aria-label={es ? 'Acercar' : 'Zoom in'}>+</button><button onClick={() => api.current?.zoom(1.25)} aria-label={es ? 'Alejar' : 'Zoom out'}>−</button><button onClick={() => api.current?.reset()} aria-label={es ? 'Volver al encuadre inicial' : 'Reset view'}>⟲</button></div>
  </div>
  <div className="ml-controls">
   <label>{es ? 'División' : 'Divider'}<input type="range" min="0" max="100" value={split} onChange={e => setSplit(Number(e.target.value))} aria-label={es ? 'Comparación de estilos sobre el modelo' : 'Style comparison on the model'}/></label>
   <label>{es ? 'Tamaño del píxel' : 'Pixel size'}<input type="range" min="2" max="10" value={pixelSize} onChange={e => setPixelSize(Number(e.target.value))}/></label>
  </div>
  <p className="original-caption">{es ? 'Arrastra el modelo para girarlo y usa la rueda o pellizca para acercarte. Null es el protagonista de IA Rogue; los estilos del juego están recreados en WebGL para el navegador.' : 'Drag the model to rotate it; scroll or pinch to zoom. Null is IA Rogue’s protagonist; the game’s styles are recreated in WebGL for the browser.'}</p>
 </div>;
}
