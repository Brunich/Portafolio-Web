import { useEffect, useRef } from 'react';
import csvSource from './csv.ts?raw';
import './code-river.css';

// Fragmentos reales de este sitio (csv.ts) fluyendo como corrientes de agua.
const KEYWORDS = new Set(['const','let','return','if','else','for','function','export','import','type','new','throw','while','true','false']);
const TOKENS = (csvSource.match(/[A-Za-z_]\w*|\d+(?:\.\d+)?|'[^'\n]{1,14}'|[{}()[\];=<>!&|?:+\-*/.,]{1,3}/g) ?? ['parseCsv','(',')']).slice(0, 900);

type Drop = { text: string; lane: number; x: number; speed: number; phase: number; size: number; color: string; alpha: number; width: number; dy: number; vy: number };

function colorOf(token: string) {
 if (KEYWORDS.has(token)) return '#c9b8ff';
 if (token.startsWith("'")) return '#86e3c8';
 if (/^\d/.test(token)) return '#ffc58a';
 if (/^[A-Za-z_]/.test(token)) return '#9aa1b3';
 return '#5d6376';
}

export default function CodeRiver({ lang, paused }: { lang: 'es' | 'en'; paused: boolean }) {
 const canvas = useRef<HTMLCanvasElement>(null);
 const pausedRef = useRef(paused);
 const redraw = useRef<() => void>(() => {});
 useEffect(() => { pausedRef.current = paused; redraw.current(); }, [paused]);

 useEffect(() => {
  const el = canvas.current;
  const ctx = el?.getContext('2d');
  if (!el || !ctx) return;
  let width = 0, height = 0, frame = 0, visible = false, last = 0, time = 0, cursor = 0;
  const pointer = { x: -9999, y: -9999, active: false };
  const ripples: { x: number; y: number; t: number }[] = [];
  let drops: Drop[] = [];
  const LANES = 9;
  const laneY = (lane: number, x: number, t: number) => {
   const base = height * (0.12 + 0.76 * lane / (LANES - 1));
   return base + Math.sin(x * 0.0042 + t * 0.55 + lane * 0.9) * height * 0.07 + Math.sin(x * 0.011 - t * 0.9 + lane) * height * 0.018;
  };
  const laneSpeed = (lane: number) => { const center = 1 - Math.abs(lane - (LANES - 1) / 2) / ((LANES - 1) / 2); return 34 + center * 62 + (lane % 3) * 6; }; // la corriente central va más rápido
  const tails: number[] = [];
  const make = (lane: number, x: number): Drop => {
   const text = TOKENS[cursor++ % TOKENS.length];
   const center = 1 - Math.abs(lane - (LANES - 1) / 2) / ((LANES - 1) / 2);
   const size = 11 + Math.round(center * 4);
   ctx.font = `${size}px "JetBrains Mono", ui-monospace, Consolas, monospace`;
   return { text, lane, x, speed: laneSpeed(lane), phase: Math.random() * Math.PI * 2, size, color: colorOf(text), alpha: 0.32 + center * 0.5, width: ctx.measureText(text).width, dy: 0, vy: 0 };
  };
  // Cada fragmento nuevo entra detrás del último de su corriente, nunca encima.
  const spawnBehind = (lane: number) => { const d = make(lane, 0); d.x = Math.min(-d.width, tails[lane] - d.width - 18 - Math.random() * 60); tails[lane] = d.x; return d; };
  const resize = () => {
   const box = el.getBoundingClientRect();
   const dpr = Math.min(window.devicePixelRatio || 1, 2);
   width = box.width; height = box.height;
   el.width = Math.round(width * dpr); el.height = Math.round(height * dpr);
   ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
   drops = [];
   for (let lane = 0; lane < LANES; lane++) {
    let x = width + 40 - Math.random() * 80;
    while (x > -200) { const d = make(lane, 0); x -= d.width + 18 + Math.random() * 60; d.x = x; drops.push(d); }
    tails[lane] = x;
   }
  };
  const draw = (dt: number) => {
   ctx.clearRect(0, 0, width, height);
   // Corrientes de fondo: líneas finas que ondulan como la superficie del agua.
   ctx.lineWidth = 1;
   for (let lane = 0; lane < LANES; lane++) {
    ctx.beginPath();
    for (let x = 0; x <= width; x += 16) { const y = laneY(lane, x, time) + 9; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = `rgba(150,156,176,${0.05 + 0.05 * Math.sin(time * 0.8 + lane)})`;
    ctx.stroke();
   }
   for (const r of ripples) {
    const age = time - r.t, radius = age * 150, fade = Math.max(0, 1 - age / 1.6);
    ctx.beginPath(); ctx.ellipse(r.x, r.y, radius, radius * 0.38, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(134,227,200,${0.35 * fade})`; ctx.stroke();
   }
   while (ripples.length && time - ripples[0].t > 1.6) ripples.shift();
   for (let lane = 0; lane < LANES; lane++) tails[lane] += laneSpeed(lane) * dt;
   ctx.textBaseline = 'middle';
   for (const d of drops) {
    d.x += d.speed * dt;
    if (d.x > width + 40) Object.assign(d, spawnBehind(d.lane));
    const y0 = laneY(d.lane, d.x, time);
    // El puntero aparta el código como una mano en el agua; luego vuelve a su corriente.
    let force = 0;
    if (pointer.active) {
     const dx = d.x - pointer.x, dy = y0 + d.dy - pointer.y, dist = Math.hypot(dx, dy);
     if (dist < 110) force = (1 - dist / 110) * Math.sign(dy || 1) * 900;
    }
    for (const r of ripples) {
     const age = time - r.t, ring = Math.abs(Math.hypot(d.x - r.x, (y0 - r.y) / 0.38) - age * 150);
     if (ring < 24) force += (1 - ring / 24) * Math.sign(y0 - r.y || 1) * 1300 * Math.max(0, 1 - age / 1.6);
    }
    d.vy += (force - d.dy * 16 - d.vy * 5) * dt;
    d.dy += d.vy * dt;
    const y = y0 + d.dy;
    const shimmer = 0.75 + 0.25 * Math.sin(time * 2.4 + d.phase + d.x * 0.02);
    const edge = Math.min(1, d.x / 140, (width - d.x) / 140);
    ctx.globalAlpha = Math.max(0, d.alpha * shimmer * edge);
    ctx.font = `${d.size}px "JetBrains Mono", ui-monospace, Consolas, monospace`;
    ctx.fillStyle = d.color;
    ctx.fillText(d.text, d.x, y);
   }
   ctx.globalAlpha = 1;
  };
  const loop = (now: number) => {
   frame = 0;
   const dt = Math.min(0.05, (now - (last || now)) / 1000);
   last = now; time += dt;
   draw(dt);
   if (visible && !pausedRef.current) frame = requestAnimationFrame(loop);
  };
  const start = () => { if (!frame && visible && !pausedRef.current) { last = 0; frame = requestAnimationFrame(loop); } };
  redraw.current = () => { if (pausedRef.current) { cancelAnimationFrame(frame); frame = 0; draw(0); } else start(); };
  const move = (e: PointerEvent) => { const b = el.getBoundingClientRect(); pointer.x = e.clientX - b.left; pointer.y = e.clientY - b.top; pointer.active = true; if (pausedRef.current) draw(0); };
  const leave = () => { pointer.active = false; };
  const tap = (e: PointerEvent) => { const b = el.getBoundingClientRect(); ripples.push({ x: e.clientX - b.left, y: e.clientY - b.top, t: time }); start(); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else { cancelAnimationFrame(frame); frame = 0; } });
  const sizer = new ResizeObserver(() => { resize(); draw(0); });
  resize(); draw(0);
  observer.observe(el); sizer.observe(el);
  el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave); el.addEventListener('pointerdown', tap);
  return () => { cancelAnimationFrame(frame); observer.disconnect(); sizer.disconnect(); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); el.removeEventListener('pointerdown', tap); };
 }, []);

 const es = lang === 'es';
 return <section className="code-river" aria-label={es ? 'Código de este sitio fluyendo como agua' : 'This site’s code flowing like water'}>
  <canvas ref={canvas} aria-hidden="true"/>
  <p className="code-river-caption"><span>csv.ts</span>{es ? 'El código de este sitio, en corriente. Pasa el cursor o toca para agitarlo.' : 'This site’s code, in motion. Hover or tap to stir it.'}</p>
 </section>;
}
