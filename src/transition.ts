// Cambio de página con telón: una hoja de tinta plana sube, cambia la ruta por debajo y sigue de largo.
// Corto a propósito (unos 350 ms): marca el cambio sin hacer esperar.
const EASE = 'cubic-bezier(.65,0,.35,1)';
const still = () => document.documentElement.dataset.motion === 'paused' || matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function curtain(title: string, swap: () => void) {
 if (still()) { swap(); return; }
 const el = document.createElement('div');
 el.className = 'curtain';
 el.innerHTML = '<span class="curtain-title"></span>';
 el.querySelector('.curtain-title')!.textContent = title;
 document.body.append(el);
 await el.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 170, easing: EASE, fill: 'forwards' }).finished;
 swap();
 await new Promise(requestAnimationFrame);
 await el.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 180, easing: EASE, fill: 'forwards' }).finished;
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
