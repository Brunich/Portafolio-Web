import { useEffect, useState } from 'react';

// Portada por zonas: cada gesto de la rueda (o flecha/Av Pág) lleva a la zona siguiente con una animación.
// Si una zona es más alta que la pantalla, primero se recorre por dentro y luego se pasa a la siguiente.
// Sólo en escritorio con ratón y sin «reducir movimiento»; en celular el scroll sigue normal.
const TOP = 74;
const still = () => document.documentElement.dataset.motion === 'paused' || matchMedia('(prefers-reduced-motion: reduce)').matches;
export const zoneList = () => [...document.querySelectorAll<HTMLElement>('main [data-zone]')];

let gliding: Promise<void> | null = null;
export function glide(y: number): Promise<void> {
 const max = document.documentElement.scrollHeight - innerHeight;
 const to = Math.max(0, Math.min(max, Math.round(y)));
 if (still()) { scrollTo({ top: to, behavior: 'instant' }); return Promise.resolve(); }
 const from = scrollY, dist = to - from, start = performance.now(), ms = Math.min(1050, 520 + Math.abs(dist) * .3);
 gliding = new Promise(done => {
  const step = (now: number) => {
   const t = Math.min(1, (now - start) / ms), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
   scrollTo({ top: from + dist * e, behavior: 'instant' });
   if (t < 1) requestAnimationFrame(step); else done();
  };
  requestAnimationFrame(step);
 });
 return gliding;
}
export const glideTo = (el: Element | null) => el && glide(el.getBoundingClientRect().top + scrollY - TOP);

function currentIndex(zs: HTMLElement[]) {
 let c = 0;
 zs.forEach((z, i) => { if (z.getBoundingClientRect().top <= TOP + innerHeight * .35) c = i; });
 return c;
}

async function step(dir: 1 | -1) {
 const zs = zoneList(); if (!zs.length) return;
 const i = currentIndex(zs), r = zs[i].getBoundingClientRect(), view = innerHeight - TOP;
 let target: number | null = null;
 if (dir > 0) {
  const rest = r.bottom - innerHeight;
  if (rest > 8) target = scrollY + Math.min(rest, view * .85);
  else if (zs[i + 1]) target = zs[i + 1].getBoundingClientRect().top + scrollY - TOP;
  else target = document.documentElement.scrollHeight;
 } else {
  const over = TOP - r.top;
  if (over > 8) target = scrollY - Math.min(over, view * .85);
  else if (zs[i - 1]) { const p = zs[i - 1].getBoundingClientRect(); target = scrollY + Math.max(p.top - TOP, p.bottom - innerHeight); }
  else target = 0;
 }
 if (Math.abs(target - scrollY) > 2) await glide(target);
}

export function usePaging(on: boolean, key: string) {
 const [paged, setPaged] = useState(false);
 const [current, setCurrent] = useState(0);
 const [labels, setLabels] = useState<string[]>([]);

 useEffect(() => {
  const root = document.documentElement;
  const mq = matchMedia('(min-width: 981px) and (min-height: 600px) and (pointer: fine)');
  if (!on || !mq.matches || matchMedia('(prefers-reduced-motion: reduce)').matches) { setPaged(false); return; }
  root.classList.add('paged'); setPaged(true);
  let busy = false, cooldown = false, last = 0;
  const run = async (dir: 1 | -1) => { busy = true; await step(dir); cooldown = true; busy = false; };
  const onWheel = (e: WheelEvent) => {
   const now = performance.now(), gap = now - last; last = now;
   if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
   if ((e.target as Element).closest?.('.dw-tablewrap,textarea,select,dialog,[data-free-wheel]')) return;
   e.preventDefault();
   if (busy) return;
   if (cooldown && gap < 220) return; // inercia del trackpad: se espera a que el gesto termine
   cooldown = false;
   if (Math.abs(e.deltaY) >= 3) void run(e.deltaY > 0 ? 1 : -1);
  };
  const onKey = (e: KeyboardEvent) => {
   if (e.altKey || e.ctrlKey || e.metaKey) return;
   const t = e.target as Element;
   if (t.closest?.('input,textarea,select,[role=slider],[contenteditable],dialog')) return;
   const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
   const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
   if (!down && !up) return;
   if (e.key === ' ' && t.closest?.('button,a,summary')) return;
   e.preventDefault(); if (!busy) void run(down ? 1 : -1);
  };
  addEventListener('wheel', onWheel, { passive: false }); addEventListener('keydown', onKey);
  return () => { root.classList.remove('paged'); removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey); };
 }, [on, key]);

 // Zona actual: la que ocupa la pantalla recibe `zone-in` para que su contenido entre animado.
 useEffect(() => {
  if (!paged) return;
  let frame = 0, prev = -1;
  const read = () => {
   frame = 0;
   const zs = zoneList(), i = currentIndex(zs);
   if (i === prev) return;
   prev = i; setCurrent(i);
   zs.forEach((z, n) => { if (n !== i) z.classList.remove('zone-in'); });
   const z = zs[i]; if (z && !z.classList.contains('zone-in')) { z.classList.add('zone-in'); }
  };
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
  const t = setTimeout(() => { setLabels(zoneList().map(z => z.dataset.zone ?? '')); read(); }, 50);
  addEventListener('scroll', onScroll, { passive: true });
  return () => { clearTimeout(t); removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); zoneList().forEach(z => z.classList.remove('zone-in')); };
 }, [paged, key]);

 return { paged, current, labels };
}
