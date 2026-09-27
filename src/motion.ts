import { useEffect } from 'react';

// Movimiento de la página: aparición al hacer scroll, barra de lectura, luz que sigue al cursor
// en las tarjetas y números que cuentan al aparecer. Todo respeta la pausa global.
const TARGETS = '.section-heading,.row>.project-media,.row>.project-info,.skills-grid>div,.experience-row,.certificate,.about-grid>*,.gamedev-metrics>div,.original-compare-heading,.model-lab,.pano,.contact-links>a,.how li,.case-next,.case-head>*';

export function useMotion(key: string) {
 useEffect(() => {
  const still = () => document.documentElement.dataset.motion === 'paused';
  const els = [...document.querySelectorAll<HTMLElement>(TARGETS)];
  const io = new IntersectionObserver(entries => {
   for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); countUp(e.target as HTMLElement, still()); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el, i) => {
   // Lo que ya se ve al cargar no se anima: entra directo.
   if (el.getBoundingClientRect().top < innerHeight * 0.9) { el.classList.add('reveal', 'is-in'); return; }
   el.classList.add('reveal'); el.style.transitionDelay = `${(i % 3) * 70}ms`; io.observe(el);
  });

  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  const onScroll = () => { const max = document.documentElement.scrollHeight - innerHeight; bar?.style.setProperty('--p', String(max > 0 ? scrollY / max : 0)); };
  const onMove = (e: PointerEvent) => {
   const m = (e.target as HTMLElement).closest?.('.project-media') as HTMLElement | null;
   if (!m) return;
   const r = m.getBoundingClientRect();
   m.style.setProperty('--mx', `${e.clientX - r.left}px`); m.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('pointermove', onMove, { passive: true }); onScroll();
  return () => { io.disconnect(); removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMove); };
 }, [key]);
}

// Los números enteros de las métricas cuentan desde cero; los que llevan flechas o comas se quedan quietos.
function countUp(root: HTMLElement, still: boolean) {
 if (still) return;
 root.querySelectorAll<HTMLElement>('dt').forEach(dt => {
  const text = dt.textContent ?? '';
  if (!/^\d{1,4}$/.test(text)) return;
  const end = Number(text), start = performance.now();
  const step = (now: number) => { const t = Math.min(1, (now - start) / 900); dt.textContent = String(Math.round(end * (1 - Math.pow(1 - t, 3)))); if (t < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
 });
}
