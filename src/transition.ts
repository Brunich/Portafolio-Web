// Cambio de página con telón: la tarjeta que tocaste crece hasta llenar la pantalla con el color
// del proyecto y su nombre, se cambia la ruta por debajo y el telón sube dejando ver la página nueva.
const EASE = 'cubic-bezier(.76,0,.24,1)';
const still = () => document.documentElement.dataset.motion === 'paused' || matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function curtain(from: Element | null, color: string, title: string, swap: () => void) {
 if (still()) { swap(); return; }
 const r = from?.getBoundingClientRect() ?? new DOMRect(innerWidth / 2 - 40, innerHeight / 2 - 40, 80, 80);
 const el = document.createElement('div');
 el.className = 'curtain';
 el.style.setProperty('--c', color || '#9b87ff');
 el.innerHTML = '<div class="curtain-inner"><span class="curtain-title"></span><i class="curtain-line"></i></div>';
 el.querySelector('.curtain-title')!.textContent = title;
 document.body.append(el);
 const box = (x: number, y: number, w: number, h: number, rad: number) => ({ clipPath: `inset(${y}px ${innerWidth - x - w}px ${innerHeight - y - h}px ${x}px round ${rad}px)` });
 await el.animate([box(r.left, r.top, r.width, r.height, 22), box(0, 0, innerWidth, innerHeight, 0)], { duration: 720, easing: EASE, fill: 'forwards' }).finished;
 await new Promise(ok => setTimeout(ok, 260));
 swap();
 await new Promise(requestAnimationFrame);
 document.querySelector('main')?.animate([{ transform: 'translateY(80px) scale(.98)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' });
 await el.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 760, easing: EASE, fill: 'forwards' }).finished;
 el.remove();
}

// Intro de la primera visita: el nombre sube letra por letra, un contador y el telón se abre.
export function intro() {
 const root = document.documentElement, box = document.getElementById('intro');
 if (!box || !root.classList.contains('intro-on')) { box?.remove(); return; }
 try { sessionStorage.setItem('bruno-intro', '1'); } catch { /* sin almacenamiento: se vuelve a ver */ }
 const n = box.querySelector('.intro-count b')!;
 const start = performance.now(), total = 1500;
 const tick = (now: number) => {
  const t = Math.min(1, (now - start) / total);
  n.textContent = String(Math.round(100 * (1 - Math.pow(1 - t, 3))));
  if (t < 1) { requestAnimationFrame(tick); return; }
  box.classList.add('intro-out');
  root.classList.remove('intro-on');
  setTimeout(() => box.remove(), 1000);
 };
 requestAnimationFrame(tick);
 box.addEventListener('click', () => { box.classList.add('intro-out'); root.classList.remove('intro-on'); setTimeout(() => box.remove(), 1000); }, { once: true });
}
