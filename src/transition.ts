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
