import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowsHorizontal, Pause } from '@phosphor-icons/react';
import { sculptureVertex, sculptureFragment } from './shaders';
import './shader-lab.css';

type Props = { lang: 'es' | 'en'; paused: boolean; compact?: boolean };

export default function ShaderLab({ lang, paused, compact = false }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState(0);
  const [comparison, setComparison] = useState(50);
  const [intensity, setIntensity] = useState(1);
  const [automatic, setAutomatic] = useState(false);
  const [error, setError] = useState(false);
  const config = useRef({ mode, comparison, intensity, automatic, paused });
  const refresh = useRef<() => void>(() => {});
  const es = lang === 'es';

  useEffect(() => { if (paused) setAutomatic(false); }, [paused]);

  const dragComparison = (clientX: number) => {
    const bounds = host.current?.getBoundingClientRect();
    if (!bounds?.width) return;
    setAutomatic(false);
    setComparison(Math.round(Math.max(0, Math.min(100, (clientX - bounds.left) / bounds.width * 100))));
  };

  useEffect(() => {
    config.current = { mode, comparison, intensity, automatic, paused };
    refresh.current();
  }, [mode, comparison, intensity, automatic, paused]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x4d7193, 1);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    camera.position.set(4.6, 3.4, 6.5);
    camera.lookAt(0, .45, 0);
    const uniforms = { uTime: { value: 0 }, uIntensity: { value: 1 }, uMode: { value: 0 }, uBase: { value: 0 } };
    const material = new THREE.ShaderMaterial({ vertexShader: sculptureVertex, fragmentShader: sculptureFragment, uniforms: { ...uniforms, uWater: { value: 0 } } });
    const waterMaterial = new THREE.ShaderMaterial({ vertexShader: sculptureVertex, fragmentShader: sculptureFragment, uniforms: { ...uniforms, uWater: { value: 1 } }, side: THREE.DoubleSide });
    const geometries: THREE.BufferGeometry[] = [];
    const addRock = (x: number, z: number, sx: number, sy: number, sz: number, rotation: number) => {
      const geometry = new THREE.IcosahedronGeometry(1, 2);
      const positions = geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        const px = positions.getX(i), py = positions.getY(i), pz = positions.getZ(i);
        const distortion = 1 + .14 * Math.sin(px * 13 + py * 7) * Math.cos(pz * 9 - py * 5);
        positions.setXYZ(i, px * distortion, py * distortion, pz * distortion);
      }
      geometry.computeVertexNormals();
      const rock = new THREE.Mesh(geometry, material);
      rock.scale.set(sx, sy, sz);
      rock.position.set(x, sy * .48, z);
      rock.rotation.y = rotation;
      scene.add(rock);
      geometries.push(geometry);
    };
    addRock(0, 0, 1.05, 1.35, .85, .3);
    addRock(-.8, .12, .7, .75, .7, .9);
    addRock(.75, .1, .58, .95, .64, -.2);
    addRock(.38, .8, .68, .42, .52, 1.5);
    addRock(-1.45, .4, .3, .24, .35, 2);
    const seaGeometry = new THREE.PlaneGeometry(70, 70, 220, 220);
    seaGeometry.rotateX(-Math.PI / 2);
    geometries.push(seaGeometry);
    scene.add(new THREE.Mesh(seaGeometry, waterMaterial));
    let width = 1, height = 1, frame = 0, previous = 0, elapsed = 0;
    let visible = true, lost = false, disposed = false;
    const isRunning = () => visible && !document.hidden && !config.current.paused && !lost && !disposed;
    function render(now: number) {
      frame = 0;
      if (disposed || lost || !visible || document.hidden) return;
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      if (!config.current.paused) elapsed += delta;
      uniforms.uTime.value = elapsed;
      uniforms.uIntensity.value = config.current.intensity;
      uniforms.uMode.value = config.current.mode;
      let split = config.current.comparison;
      if (config.current.automatic && !compact && !config.current.paused) {
        split = 50 + Math.sin(elapsed * 0.45) * 32;
        setComparison(Math.round(split));
      }
      renderer.setScissorTest(false);
      renderer.clear();
      if (!compact) {
        renderer.setScissorTest(true);
        renderer.setScissor(0, 0, width * split / 100, height);
        uniforms.uBase.value = 1;
        renderer.render(scene, camera);
        renderer.setScissor(width * split / 100, 0, width * (100 - split) / 100, height);
      }
      uniforms.uBase.value = 0;
      renderer.render(scene, camera);
      renderer.setScissorTest(false);
      if (isRunning()) frame = requestAnimationFrame(render);
    }
    function schedule() {
      if (!visible || document.hidden || lost || disposed) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
        return;
      }
      if (!frame) {
        previous = 0;
        frame = requestAnimationFrame(render);
      }
    }
    refresh.current = schedule;
    const resize = new ResizeObserver(() => {
      width = element.clientWidth;
      height = element.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.position.set(4.6, 3.4, width / height < 1 ? 9.5 : 6.5);
      camera.lookAt(0, .45, 0);
      camera.updateProjectionMatrix();
      schedule();
    });
    resize.observe(element);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: 0.01 });
    observer.observe(element);
    document.addEventListener('visibilitychange', schedule);
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; if (frame) cancelAnimationFrame(frame); setError(true); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    schedule();
    return () => {
      disposed = true;
      refresh.current = () => {};
      cancelAnimationFrame(frame);
      resize.disconnect(); observer.disconnect();
      document.removeEventListener('visibilitychange', schedule);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      geometries.forEach(geometry => geometry.dispose()); material.dispose(); waterMaterial.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, [compact]);

  return <div className={`shader-lab${compact ? ' shader-compact' : ''}`}>
    {!compact && <div className="shader-toolbar">
      <div className="shader-modes" aria-label={es ? 'Tipo de shader' : 'Shader type'}>
        {[es ? 'Agua' : 'Water', 'Cel shading', 'Pixel art'].map((label, index) => <button type="button" key={index} aria-pressed={mode === index} onClick={() => setMode(index)}>{label}</button>)}
      </div>
      <span className="shader-live"><i /> WEBGL · GLSL</span>
    </div>}
    <div className="shader-stage">
      <div className="shader-canvas" ref={host} />
      {!compact && <>
        <div className="shader-label shader-label-left">{es ? 'Malla base' : 'Base mesh'}</div>
        <div className="shader-label shader-label-right">Material</div>
        <div className="shader-divider" style={{ left: `${comparison}%` }}><button type="button" className="shader-drag" aria-label={es ? 'Arrastrar comparación' : 'Drag comparison'}
          onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); dragComparison(event.clientX); }}
          onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) dragComparison(event.clientX); }}
          onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
          onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault(); setAutomatic(false);
            setComparison(value => event.key === 'Home' ? 0 : event.key === 'End' ? 100 : Math.max(0, Math.min(100, value + (event.key === 'ArrowRight' ? 5 : -5))));
          }}><ArrowsHorizontal size={19} aria-hidden="true" /></button></div>
      </>}
      {compact && <div className="shader-hero-note"><span className="shader-note-dot" />{es ? 'Forma, luz y unas líneas de código.' : 'Form, light, and a few lines of code.'}</div>}
      {error && <p className="shader-error" role="status">{es ? 'WebGL no está disponible. Recarga la página para volver a intentarlo.' : 'WebGL is unavailable. Reload the page to try again.'}</p>}
    </div>
    {!compact && <>
      <div className="shader-controls">
        <label className="shader-range"><span>{es ? 'Comparación' : 'Comparison'}<output aria-live="off">{comparison}%</output></span><input type="range" min="0" max="100" value={comparison} aria-label={es ? 'Comparación' : 'Comparison'} onChange={event => { setAutomatic(false); setComparison(Number(event.target.value)); }} /></label>
        <label className="shader-range shader-intensity"><span>{es ? 'Intensidad' : 'Intensity'}<output aria-live="off">{intensity.toFixed(1)}</output></span><input type="range" min="0" max="2" step="0.1" value={intensity} aria-label={es ? 'Intensidad' : 'Intensity'} onChange={event => setIntensity(Number(event.target.value))} /></label>
        <div className="shader-auto-wrap"><button className="shader-auto" type="button" disabled={paused} aria-pressed={automatic && !paused} onClick={() => setAutomatic(value => !value)}>{automatic && !paused ? <Pause size={17} aria-hidden="true" /> : <ArrowsHorizontal size={17} aria-hidden="true" />} {es ? 'Comparación auto' : 'Auto comparison'}</button>{paused && <small>{es ? 'Activa el movimiento para usarla.' : 'Enable motion to use this.'}</small>}</div>
      </div>
      <p className="shader-description" aria-live="polite">{(es ? ['Ondas suaves deforman la superficie y desplazan los reflejos del agua.', 'La luz se divide en bandas para dar al volumen un acabado ilustrado.', 'Una paleta reducida y reflejos en bloques reinterpretan la isla como pixel art.'] : ['Gentle waves deform the surface and shift its water reflections.', 'Light is divided into bands for an illustrated finish.', 'A reduced palette and block-shaped highlights reinterpret the island as pixel art.'])[mode]}</p>
    </>}
  </div>;
}

