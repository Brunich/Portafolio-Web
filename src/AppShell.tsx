import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Stamp, Table, Factory, ChartLineUp, Barcode, ClipboardText, ChatCircleDots } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import type { Lang } from './content';
import './app-shell.css';

// Cada demo se abre como si fuera su propio producto: nombre, colores y pestaña propios, sin el portafolio alrededor.
type Brand = { name: string; es: string; en: string; icon: Icon; color: string };
export const BRANDS: Record<string, Brand> = {
 club: { name: 'Sellito', es: 'Tarjeta de sellos y menú con NFC', en: 'NFC stamp card and menu', icon: Stamp, color: '#e3a26f' },
 csv: { name: 'Cuadro', es: 'Analizador de CSV y Excel', en: 'CSV and Excel analyzer', icon: Table, color: '#5b8cff' },
 planta: { name: 'Línea', es: 'Consolidador de reportes y OEE', en: 'Report consolidator and OEE', icon: Factory, color: '#ff7a3d' },
 spc: { name: 'Tolerancia', es: 'Gráficas de control SPC', en: 'SPC control charts', icon: ChartLineUp, color: '#58c98b' },
 inventario: { name: 'Estante', es: 'Inventario con la cámara', en: 'Camera inventory', icon: Barcode, color: '#2fd4b5' },
 turno: { name: 'Relevo', es: 'Entrega de turno de calidad', en: 'Quality shift handover', icon: ClipboardText, color: '#ffb020' },
 agente: { name: 'Casero', es: 'Asistente de IA que corre en tu equipo', en: 'AI assistant that runs on your machine', icon: ChatCircleDots, color: '#a8c79a' },
};

// El ícono de la pestaña también cambia: un cuadro con la inicial y el color de la app.
function favicon(b: Brand) {
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${b.color}"/><text x="16" y="22.5" font-family="Arial,sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="#111">${b.name[0]}</text></svg>`;
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
   <span className="ax-logo" aria-hidden="true"><Logo size={22} weight="bold"/></span>
   <div className="ax-name"><strong>{b.name}</strong><small>{es ? b.es : b.en}</small></div>
   <span className="ax-badge">{es ? 'Datos de ejemplo' : 'Sample data'}</span>
   <div className="ax-lang" aria-label={es ? 'Idioma' : 'Language'}>{(['es', 'en'] as const).map(l => <button key={l} aria-pressed={lang === l} aria-label={l === 'es' ? 'Cambiar a español' : 'Switch to English'} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
  </div></header>
  <main id="main" className="ax-main" aria-label={b.name}>
   <h1 className="ax-title">{b.name}<span>{es ? b.es : b.en}</span></h1>
   <section id="demo" className="case-demo ax-stage"><div className="wrap">{children}</div></section>
  </main>
  <footer className="ax-foot"><div className="ax-wrap">{b.name} · {es ? 'Versión de prueba con datos de ejemplo.' : 'Trial version with sample data.'}<span>© {new Date().getFullYear()} Bruno Salas</span></div></footer>
 </div>;
}
