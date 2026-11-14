import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Stamp, Table, Factory, ChartLineUp, Barcode, ClipboardText, ChatCircleDots } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import type { Lang } from './content';
import './app-shell.css';

// Cada demo se abre como si fuera su propio producto: nombre, colores y pestaña propios, sin el portafolio alrededor.
// `real`: la app se usa tal cual con lo que registras; no lleva aviso de datos de ejemplo.
// `slug` y `title` son los de la ficha del proyecto: el enlace de regreso abre en la misma pestaña.
type Brand = { name: string; es: string; en: string; icon: Icon; color: string; slug: string; title: [string, string]; real?: boolean };
export const BRANDS: Record<string, Brand> = {
 club: { name: 'Sellito', es: 'Tarjeta de sellos y menú con NFC', en: 'NFC stamp card and menu', icon: Stamp, color: '#e3a26f', slug: 'club-nfc', title: ['NFC para negocios', 'NFC for businesses'] },
 csv: { name: 'Cuadro', es: 'Analizador de CSV y Excel', en: 'CSV and Excel analyzer', icon: Table, color: '#1c1d1a', slug: 'analizador-csv', title: ['Analizador de CSV', 'CSV Analyzer'] },
 planta: { name: 'Línea', es: 'Consolidador de reportes y OEE', en: 'Report consolidator and OEE', icon: Factory, color: '#1c1d1a', slug: 'planta', title: ['Planta: consolidador y OEE', 'Plant: consolidator & OEE'] },
 spc: { name: 'Tolerancia', es: 'Gráficas de control SPC', en: 'SPC control charts', icon: ChartLineUp, color: '#1c1d1a', slug: 'graficas-de-control', title: ['Gráficas de control (SPC)', 'Control charts (SPC)'] },
 inventario: { name: 'Estante', es: 'Inventario con la cámara', en: 'Camera inventory', icon: Barcode, color: '#1c1d1a', slug: 'inventario', title: ['Inventario con la cámara', 'Camera inventory'], real: true },
 turno: { name: 'Relevo', es: 'Entrega de turno de calidad', en: 'Quality shift handover', icon: ClipboardText, color: '#1c1d1a', slug: 'entrega-de-turno', title: ['Entrega de turno', 'Shift handover'] },
 agente: { name: 'Casero', es: 'Asistente de IA que corre en tu equipo', en: 'AI assistant that runs on your machine', icon: ChatCircleDots, color: '#1c1d1a', slug: 'asistente-ia-local', title: ['IA personalizada local sin APIs', 'Custom local AI, no APIs'] },
};

// El ícono de la pestaña: un cuadro con la inicial. Las seis herramientas de planta comparten tinta; Sellito conserva su caramelo.
function favicon(b: Brand) {
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="3" fill="${b.color}"/><text x="16" y="22.5" font-family="Arial,sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="${b.color === '#1c1d1a' ? '#efece4' : '#111'}">${b.name[0]}</text></svg>`;
 let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
 if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.append(link); }
 link.type = 'image/svg+xml'; link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export default function AppShell({ id, lang, setLang, children }: { id: string; lang: Lang; setLang: (l: Lang) => void; children: ReactNode }) {
 const es = lang === 'es', b = BRANDS[id], Logo = b.icon;
 useEffect(() => {
  document.title = `${b.name} — ${es ? b.es : b.en}`;
  favicon(b);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.documentElement).backgroundColor);
 }, [b, es]);
 return <div className={`ax ax-${id}`}>
  <header className="ax-bar"><div className="ax-wrap ax-bar-in">
   <a className="ax-back" href={`/proyectos/${b.slug}`} data-title={es ? b.title[0] : b.title[1]} aria-label={es ? `Volver a la ficha: ${b.title[0]}` : `Back to the project page: ${b.title[1]}`}><ArrowLeft size={16} weight="bold" aria-hidden="true"/><span>{es ? 'Ficha' : 'Project'}</span></a>
   <span className="ax-logo" aria-hidden="true"><Logo size={22} weight="bold"/></span>
   <div className="ax-name"><strong>{b.name}</strong><small>{es ? b.es : b.en}</small></div>
   {!b.real && <span className="ax-badge">{es ? 'Datos de ejemplo' : 'Sample data'}</span>}
   <div className="ax-lang" aria-label={es ? 'Idioma' : 'Language'}>{(['es', 'en'] as const).map(l => <button key={l} aria-pressed={lang === l} aria-label={l === 'es' ? 'Cambiar a español' : 'Switch to English'} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
  </div></header>
  <main id="main" className="ax-main" aria-label={b.name}>
   <h1 className="ax-title">{b.name}<span>{es ? b.es : b.en}</span></h1>
   <section id="demo" className="case-demo ax-stage"><div className="wrap">{children}</div></section>
  </main>
  <footer className="ax-foot"><div className="ax-wrap">{b.name} · {b.real ? (es ? 'Lo que registras se guarda en este dispositivo.' : 'What you log is saved on this device.') : (es ? 'Versión de prueba con datos de ejemplo.' : 'Trial version with sample data.')}<span>© {new Date().getFullYear()} Bruno Salas</span></div></footer>
 </div>;
}
