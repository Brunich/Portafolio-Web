import { lazy, Suspense, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight, DownloadSimple, Pause, Play } from '@phosphor-icons/react';
import { copy, certificates } from './content';
import type { Lang } from './content';
import { professional } from './professional-content';
import { personal } from './personal';
import OriginalScenes from './OriginalScenes';
import Hobbies from './Hobbies';
import { RoguePage } from './Rogue';
// Las demos pesadas se cargan sólo en su página.
const DataWorkbench = lazy(() => import('./DataWorkbench'));
const LoyaltyDemo = lazy(() => import('./LoyaltyDemo'));
const ShiftHandover = lazy(() => import('./ShiftHandover'));
const Planta = lazy(() => import('./Planta'));
const Inventario = lazy(() => import('./Inventario'));
const Spc = lazy(() => import('./Spc'));
const Agente = lazy(() => import('./Agente'));
const MenuPage = lazy(() => import('./Menu').then(m => ({ default: m.MenuPage })));
const MenuBuilder = lazy(() => import('./Menu').then(m => ({ default: m.MenuBuilder })));
import PlantaPreview from './PlantaPreview';
import InventarioPreview from './InventarioPreview';
import SpcPreview from './SpcPreview';
import CasaPreview from './CasaPreview';
import AgentePreview from './AgentePreview';
import ClubPreview from './ClubPreview';
import CsvChart from './CsvChart';
import TurnoPreview from './TurnoPreview';
import HeroShowcase, { NfcTap } from './HeroShowcase';
import './layout.css';
import './pages.css';
import { curtain } from './transition';
import { usePaging, glideTo } from './paging';
import { StampPage, NfcSetup, Qr, bizLink, bizFrom } from './Stamp';
import AppShell, { BRANDS } from './AppShell';

type Native = { es: string; en: string; href?: string; android?: boolean };

// La portada va en cuatro bloques: lo que comparte la planta ficticia, lo de negocio pequeño, el juego y una lista corta.
// 'rogue' no es un proyecto de la lista: sólo marca dónde entra su ficha en la cadena de «siguiente proyecto».
const PROJECT_ORDER = ['turno', 'csv', 'planta', 'spc', 'inventario', 'casa', 'club', 'rogue', 'vibe', 'punto', 'agente'];
type Group = { letter: string; ids: string[]; name: [string, string]; line: [string, string] };
const GROUPS: Group[] = [
 { letter: 'A', ids: ['turno', 'csv', 'planta', 'spc', 'inventario'], name: ['Turno en planta', 'Plant shift'], line: ['Las cinco usan la misma planta ficticia: Líneas 1 a 3, lotes 4411 a 4428 y folios INC-221 a INC-232. La INC-232, en curso en Entrega de turno, aparece en Planta como el paro de la Línea 1; el inventario es el de su almacén de consumibles.', 'All five use the same made-up plant: Lines 1 to 3, batches 4411 to 4428 and tickets INC-221 to INC-232. INC-232, in progress in Shift handover, shows up in Plant as Line 1’s stop; the inventory is its consumables stockroom.'] },
 { letter: 'B', ids: ['casa', 'club'], name: ['Negocio pequeño', 'Small business'], line: ['Para negocios que atienden al cliente de frente. La Casa del Ángel es un trabajo para un cliente real y está en uso; NFC para negocios funciona y se puede adaptar a otro local.', 'For businesses that serve customers face to face. La Casa del Ángel was built for a real client and is in use; NFC for businesses works and can be adapted to another shop.'] },
];
const OTHER = ['vibe', 'punto', 'agente'];
const ROGUE = { id: 'rogue', slug: 'ia-rogue', title: 'IA Rogue' };
type Project = ReturnType<typeof professional>['projects'][number];
const unfinished = (status: string) => /^(Funcional|Working|Publicad[oa]|Published)$/.test(status) ? null : <em>{status}</em>;
// Todo lo que sale del sitio abre otra pestaña y lo avisa con la flecha ↗ antes de picar.
const EXT = { target: '_blank', rel: 'noopener noreferrer' } as const;
function Out({ es, size = 18 }: { es: boolean; size?: number }) {
 return <><ArrowUpRight size={size} aria-hidden="true"/><span className="sr-only">{es ? '(se abre en otra pestaña)' : '(opens in a new tab)'}</span></>;
}

// Rutas: la portada resume; cada proyecto tiene su propia página.
function route() {
 const path = location.pathname.replace(/\/+$/, '');
 if (path === '/sello') return { page: 'sello' as const };
 if (path === '/nfc') return { page: 'nfc' as const };
 if (path === '/menu') return { page: 'menu' as const };
 if (path === '/sobre-mi') return { page: 'about' as const };
 const m = /^\/proyectos\/([a-z0-9-]+)(\/app)?$/.exec(path);
 return m ? { page: 'project' as const, slug: m[1], app: !!m[2] } : { page: 'home' as const };
}

// Los enlaces internos no recargan: pasan por el telón y cambian la ruta con el historial.
function useNavigation() {
 const [, setTick] = useState(0);
 useEffect(() => {
  const render = () => flushSync(() => setTick(n => n + 1));
  const land = (hash: string) => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView(); else scrollTo(0, 0); };
  const onClick = (e: MouseEvent) => {
   if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
   const a = (e.target as Element).closest?.('a');
   if (!a || a.hasAttribute('download')) return;
   const url = new URL(a.href, location.href);
   if (url.origin !== location.origin || /\.\w+$/.test(url.pathname) || url.pathname === location.pathname) return;
   // Fichas y apps siempre en la misma pestaña, aunque algún enlace viejo aún traiga target (el «Abrir» del visor de la portada).
   if (a.target && !url.pathname.startsWith('/proyectos/')) return;
   e.preventDefault();
   void curtain(a.dataset.title ?? 'Bruno Salas', () => { history.pushState(null, '', url.pathname + url.search + url.hash); render(); land(url.hash); });
  };
  const onPop = () => { render(); land(location.hash); };
  document.addEventListener('click', onClick); addEventListener('popstate', onPop);
  return () => { document.removeEventListener('click', onClick); removeEventListener('popstate', onPop); };
 }, []);
}

export default function App() {
 const [lang, setLang] = useState<Lang>(() => { try { return localStorage.getItem('bruno-language') === 'en' ? 'en' : 'es'; } catch { return 'es'; } });
 const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
 useNavigation();
 usePaging(location.pathname === '/' || location.pathname === '', `${location.pathname}:${lang}`);
 const es = lang === 'es', p = professional(lang), c = copy[lang], r = route();
 const projects = [...p.projects].sort((a, b) => PROJECT_ORDER.indexOf(a.id) - PROJECT_ORDER.indexOf(b.id));
 const project = r.page === 'project' ? projects.find(x => x.slug === r.slug) : undefined;
 const rogue = r.page === 'project' && r.slug === ROGUE.slug && !r.app;
 const chain = PROJECT_ORDER.map(id => id === 'rogue' ? ROGUE : projects.find(x => x.id === id)!);
 const nextOf = (id: string) => chain[(chain.findIndex(x => x.id === id) + 1) % chain.length];
 const home = !project && !rogue && r.page === 'home';
 // index.html pinta el fondo de la app sólo al cargar directo en /app; al entrar o salir sin recarga se ajusta aquí.
 useEffect(() => {
  const root = document.documentElement, metas = document.querySelectorAll('meta[name=theme-color]');
  if (r.page === 'project' && r.app) {
   const ax = document.querySelector('.ax');
   if (ax) { root.classList.add('is-app'); root.style.background = getComputedStyle(ax).backgroundColor; }
   return;
  }
  root.classList.remove('is-app'); root.style.background = '';
  metas.forEach(m => m.setAttribute('content', m.getAttribute('media')?.includes('dark') ? '#171815' : '#efece4'));
 }, [location.pathname]);
 useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('bruno-language', lang); } catch { /* Preferencia opcional. */ } }, [lang]);
 useEffect(() => { document.documentElement.dataset.motion = paused ? 'paused' : 'active'; }, [paused]);
 useEffect(() => { const pref = matchMedia('(prefers-reduced-motion: reduce)'); const change = () => setPaused(pref.matches); pref.addEventListener('change', change); return () => pref.removeEventListener('change', change); }, []);
 useEffect(() => { if (r.page === 'sello' || r.page === 'menu' || (r.page === 'project' && r.app)) return; document.title = r.page === 'about' ? (es ? 'Sobre mí — Bruno Salas' : 'About me — Bruno Salas') : r.page === 'nfc' ? (es ? 'Arma tu tarjeta NFC — Bruno Salas' : 'Build your NFC card — Bruno Salas') : rogue ? 'IA Rogue — Bruno Salas' : project ? `${project.title} — Bruno Salas` : (es ? 'Bruno Salas · Ingeniería en Software' : 'Bruno Salas · Software Engineering'); }, [project, rogue, es, r.page]);
 const at = (id: string) => home ? `#${id}` : `/#${id}`;
 if (r.page === 'sello') return <StampPage lang={lang}/>;
 if (r.page === 'menu') return <Suspense fallback={null}><MenuPage lang={lang}/></Suspense>;
 // AppShell no trae salida: el «volver» a la ficha va como primera pieza del escenario de la app.
 if (project && r.app && HAS_APP.includes(project.id)) return <AppShell id={project.id} lang={lang} setLang={setLang}><Suspense fallback={<p className="case-loading">{es ? 'Cargando…' : 'Loading…'}</p>}><Demo lang={lang} project={project}/></Suspense></AppShell>;

 return <>
  <a className="skip-link" href="#main">{c.skip}</a>
  <header className="topbar" aria-label={es ? 'Navegación del portafolio' : 'Portfolio navigation'}><div className="topbar-inner wrap">
   <a className="brand" href="/" data-title="Bruno Salas" aria-label="Bruno Salas — inicio"><span className="brand-name"><b>Bruno Salas</b><small>{es ? 'Ingeniería en Software · UANL' : 'Software Engineering · UANL'}</small></span></a>
   <nav className="topnav" aria-label={es ? 'Secciones' : 'Sections'}>{[['projects', es ? 'Proyectos' : 'Projects'], ['about', 'CV'], ['graphics', 'Game dev'], ['motion', 'Motion']].map(([id, label]) => <a key={id} href={at(id)}>{label}</a>)}</nav>
   <div className="topbar-tools">
    <button className="icon-button" aria-label={paused ? c.play : c.pause} onClick={() => setPaused(!paused)}>{paused ? <Play size={16} weight="fill"/> : <Pause size={16} weight="fill"/>}</button>
    <div className="language-control" aria-label={es ? 'Idioma' : 'Language'}>{(['es', 'en'] as const).map(l => <button key={l} aria-label={l === 'es' ? 'Cambiar a español' : 'Switch to English'} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
    <a className="topbar-cta" href={at('contact')}>{es ? 'Contacto' : 'Contact'}</a>
   </div>
  </div></header>
  {r.page === 'about' ? <Hobbies lang={lang}/> : r.page === 'nfc' ? <NfcPage lang={lang}/> : rogue ? <RoguePage lang={lang} next={nextOf('rogue')}/> : project ? <ProjectPage lang={lang} project={project} next={nextOf(project.id)}/> : <Home lang={lang} paused={paused} projects={projects}/>}
  <footer className="site-footer wrap" aria-label={es ? 'Pie del portafolio' : 'Portfolio footer'}>© {new Date().getFullYear()} Bruno Salas Rodríguez <span>{c.location}</span></footer>
 </>;
}

function Home({ lang, paused, projects }: { lang: Lang; paused: boolean; projects: Project[] }) {
 const c = copy[lang], p = professional(lang), es = lang === 'es', L = es ? 0 : 1;
 const byId = (id: string) => projects.find(x => x.id === id)!;
 const others = OTHER.map(byId);
 const cv = es ? '/cv/Bruno-Salas-ES.pdf' : '/cv/Bruno-Salas-EN.pdf';
 const jump = (id: string) => () => void glideTo(document.getElementById(id));
 return <main id="main">
  <section id="home" className="hero wrap" data-zone={es ? 'Inicio' : 'Home'}>
   <dl className="hero-sheet">{(es
    ? [['Lugar', 'Monterrey, N. L.'], ['Carrera', 'Ing. en Software · UANL 2023–2028'], ['Idiomas', 'ES / EN / PT'], ['Hoja', '00 · Portada']]
    : [['Place', 'Monterrey, Mexico'], ['Degree', 'Software Eng. · UANL 2023–2028'], ['Languages', 'ES / EN / PT'], ['Sheet', '00 · Cover']]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
   <div className="hero-copy"><h1>{p.title} {p.accent}</h1><p>{p.intro}</p><div className="hero-actions"><a className="button primary" href="#projects">{c.view}<ArrowDown size={18}/></a><a className="button secondary" href={cv} download>{es ? 'Descargar CV' : 'Download CV'}<DownloadSimple size={18}/></a></div></div>
   <div className="hero-workbench"><span className="hero-label">{es ? 'Fig. 1 · Tres apps en vivo' : 'Fig. 1 · Three live apps'}</span><HeroShowcase lang={lang} paused={paused}/></div>
  </section>
  <section id="projects" className="wrap section-space"><div className="projects-intro" data-zone={es ? 'Proyectos' : 'Projects'}><div className="section-heading"><div><span className="kicker">01 · {es ? 'Proyectos' : 'Projects'}</span><h2>{p.projectsTitle}</h2><p>{p.projectsIntro}</p></div></div>
   {/* Índice en cuatro columnas, una por bloque: cabe en una pantalla aunque sean diez proyectos */}
   <div className="project-index">
    {GROUPS.map(g => <div key={g.letter} className="pi-group"><span className="pi-head">{g.letter} · {g.name[L]}</span><ol>{g.ids.map(id => { const x = byId(id); return <li key={id} className={`project-${id}`}><button onClick={jump(`p-${id}`)}><strong>{x.title}</strong><ArrowDown size={16}/></button></li>; })}</ol></div>)}
    <div className="pi-group"><span className="pi-head">C · {es ? 'Juego' : 'Game'}</span><ol><li><button onClick={jump('graphics')}><strong>IA Rogue</strong><ArrowDown size={16}/></button></li></ol></div>
    <div className="pi-group"><span className="pi-head">D · {es ? 'Otros trabajos' : 'Other work'}</span><ol>{others.map(x => <li key={x.id}><button onClick={jump('otros')}><strong>{x.title}</strong><ArrowDown size={16}/></button></li>)}</ol></div>
   </div></div>
   {GROUPS.map(g => <div key={g.letter} className="rows">{g.ids.map((id, i) => <ProjectRow key={id} lang={lang} project={byId(id)} flip={i % 2 === 1} n={i + 1} group={i === 0 ? g : undefined} letter={g.letter} of={g.ids.length}/>)}</div>)}
  </section>
  <OriginalScenes lang={lang} paused={paused}/>
  <section id="otros" className="wrap section-space others-list" data-zone={es ? 'Otros trabajos' : 'Other work'}>
   <div className="group-head"><span className="kicker">D · {es ? 'Otros trabajos' : 'Other work'}</span><p>{es ? 'Un hackathon, una app para estudiantes, un asistente que todavía estoy armando y las versiones para Android.' : 'A hackathon, a student app, an assistant I am still building and the Android versions.'}</p></div>
   <ul className="ol-list">
    {others.map(x => <li key={x.id}><a href={`/proyectos/${x.slug}`} data-title={x.title}><strong>{x.title}</strong><span>{x.pitch}</span><em>{x.kind}{unfinished(x.status)}</em><ArrowRight size={18} aria-hidden="true"/></a></li>)}
    <li><div><strong>{es ? 'Apps Android' : 'Android apps'}</strong><span>{es ? 'Ya en Android: La Casa del Ángel, Punto U y NFC para negocios. Faltan las de Inventario y Entrega de turno.' : 'Already on Android: La Casa del Ángel, Punto U and NFC for businesses. Inventory and Shift handover still need theirs.'}</span><em>Capacitor · Android</em></div></li>
    <li><a href={personal.github} {...EXT}><strong>GitHub</strong><span>{es ? 'Juegos, herramientas y pruebas más chicas.' : 'Games, tools and smaller experiments.'}</span><em>github.com/Brunich</em><Out es={es}/></a></li>
   </ul>
  </section>
  <section id="about" className="about-section section-space"><div className="wrap">
   <div className="about-grid" data-zone="CV">
    <figure className="portrait"><picture><source srcSet="/media/bruno-retrato.avif" type="image/avif"/><source srcSet="/media/bruno-retrato.webp" type="image/webp"/><img src="/media/bruno-retrato.jpg" alt="Bruno Salas" width="560" height="700" loading="lazy"/></picture><figcaption><strong>Bruno Salas</strong><span>Monterrey, N. L.</span></figcaption></figure>
    <div className="about-copy"><span className="kicker">02 · CV</span><h2>{p.aboutTitle}</h2><p>{p.about}</p><a className="inline-link" href={cv} download>{es ? 'Descargar CV' : 'Download CV'}<DownloadSimple size={20}/></a>
</div>
   </div>
   <div className="experience-grid" data-zone={es ? 'Experiencia' : 'Experience'}><div><h3>{c.timelineTitle}</h3>{c.experience.map(e => <div className="experience-row" key={e.year}><span className="year">{e.year}</span><div><h4>{e.role}</h4><span className="org">{e.org}</span><p>{e.text}</p></div></div>)}</div><div><h3>{c.learning}</h3>{certificates.map(cert => <a className="certificate" key={cert.title} href={cert.url} {...EXT}><div><h4>{cert.title}</h4><p>{cert.org}</p><span>{cert.year}</span></div><Out es={es} size={22}/></a>)}</div></div>
   <div className="skills tools-block" data-zone={es ? 'Herramientas que sé manejar' : 'Tools I work with'}><h3>{p.techTitle}</h3><div className="skills-grid">{p.skills.map(s => <div key={s.name}><h4>{s.name}</h4><p>{s.desc}</p><div className="tags">{s.tools.map(tool => <span key={tool}>{tool}</span>)}</div></div>)}</div><p className="languages-line">{c.languages}</p></div>
  </div></section>
  <Motion lang={lang}/>
  <Contact lang={lang}/>
 </main>;
}

function Media({ lang, project }: { lang: Lang; project: Project }) {
 const es = lang === 'es';
 switch (project.media) {
  case 'club': return <ClubPreview lang={lang}/>;
  case 'analizador': return <CsvChart lang={lang}/>;
  case 'turno': return <TurnoPreview lang={lang}/>;
  case 'planta': return <PlantaPreview lang={lang}/>;
  case 'inventario': return <InventarioPreview lang={lang}/>;
  case 'spc': return <SpcPreview lang={lang}/>;
  case 'agente': return <AgentePreview lang={lang}/>;
  case 'casa': return <CasaPreview lang={lang}/>;
  case 'vibemap': return <img className="vibe-shot" src="/media/vibemap-mapa.webp" alt={lang === 'es' ? 'Mapa mental de VibeMap sobre el código de este portafolio' : 'VibeMap mind map of this portfolio’s code'} width="1210" height="350" loading="lazy"/>;
  default: return <div className="phones"><img src="/media/punto-u-mapa.webp" width="780" height="2000" alt={es ? 'Punto U: mapa del campus con misiones' : 'Punto U: campus map with missions'} loading="lazy"/><img src="/media/punto-u.webp" width="600" height="1300" alt={es ? 'Punto U: crear perfil' : 'Punto U: create profile'} loading="lazy"/></div>;
 }
}

// Datos llanos en mono (tecnología / qué se prueba / estado) en lugar de cifras de vitrina.
const Facts = ({ items }: { items: string[] }) => <p className="facts">{items.map(f => <span key={f}>{f}</span>)}</p>;

function ProjectRow({ lang, project, flip, n, of, letter, group }: { lang: Lang; project: Project; flip: boolean; n: number; of: number; letter: string; group?: Group }) {
 const es = lang === 'es', page = `/proyectos/${project.slug}`;
 return <article id={`p-${project.id}`} data-c data-zone={project.title} className={`row project project-${project.id}${flip ? ' flip' : ''}${group ? ' has-head' : ''}`}>
  {/* El cajetín del bloque va dentro de su primera fila: así la portada por zonas no lo deja suelto entre pantallas */}
  {group && <div className="group-head"><span className="kicker">{group.letter} · {group.name[es ? 0 : 1]}</span><p>{group.line[es ? 0 : 1]}</p></div>}
  <a className={`project-media media-${project.id}`} href={page} data-title={project.title} aria-label={`${project.title} — ${es ? 'ver proyecto' : 'view project'}`}><Media lang={lang} project={project}/><span className="media-open"><ArrowRight size={22}/></span></a>
  <div className="project-info"><span className="row-num">{letter} · {String(n).padStart(2, '0')}<i>/ {String(of).padStart(2, '0')}</i></span><span className="project-kind">{project.kind}{unfinished(project.status)}</span><h3><a href={page} data-title={project.title}>{project.title}</a></h3><p className="pitch">{project.pitch}</p><p>{project.desc}</p>
   <Facts items={project.facts}/>
   <div className="project-links"><a className="button primary" href={page} data-title={project.title}>{es ? 'Ver proyecto' : 'View project'}<ArrowRight size={18}/></a>{project.link.startsWith('http') && <a className="inline-link" href={project.link} {...EXT}>{project.action}<Out es={es}/></a>}</div>
  </div>
 </article>;
}

// La demo de cada proyecto, en su propia pantalla (/proyectos/…/app).
function Demo({ lang, project }: { lang: Lang; project: Project }) {
 const es = lang === 'es';
 return <>
   {project.id === 'club' && <><div className="case-demo-head"><h2>{es ? 'Así se ve en el restaurante.' : 'This is how it looks at the restaurant.'}</h2><p>{es ? 'Acerca el celular al chip y adelanta el tiempo.' : 'Tap the phone on the chip and fast-forward.'}</p></div><LoyaltyDemo lang={lang}/><ClubReal lang={lang}/></>}
   {project.id === 'turno' && <ShiftHandover lang={lang}/>}
   {project.id === 'planta' && <><div className="case-demo-head"><h2>{es ? 'Súbele tus reportes del turno.' : 'Upload your shift reports.'}</h2><p>{es ? 'Ya vienen tres de ejemplo; cambia cualquiera por tu Excel o CSV.' : 'Three samples are loaded; swap any for your Excel or CSV.'}</p></div><Planta lang={lang}/><div className="monitor-live"><div className="case-demo-head"><h2>{es ? 'Y mientras pasa el turno: Monitor de planta.' : 'And while the shift runs: Plant monitor.'}</h2><p>{es ? 'Una app aparte, en tiempo real y con estilo Windows 98: OEE en vivo, lotes que se liberan o retienen y detenciones que tú provocas.' : 'A separate app, real time and Windows 98 style: live OEE, batches released or held and stops you trigger.'}</p></div><div className="monitor-shots"><img src="/media/monitor-planta.webp" width={1006} height={705} loading="lazy" alt={es ? 'Monitor de planta con tres líneas, OEE en vivo y cola de lotes' : 'Plant monitor with three lines, live OEE and batch queue'}/><img src="/media/monitor-planta-detencion.webp" width={1006} height={705} loading="lazy" alt={es ? 'Diálogo para registrar la causa de una detención' : 'Dialog to log a stop cause'}/></div><p className="demo-vibe-links"><a className="inline-link" href="https://monitor-de-planta.vercel.app" {...EXT}>{es ? 'Abrir el monitor' : 'Open the monitor'}<Out es={es}/></a><a className="inline-link" href="https://github.com/Brunich/Monitor-De-Planta" {...EXT}>{es ? 'Ver el código' : 'View the code'}<Out es={es}/></a></p></div></>}
   {project.id === 'agente' && <><div className="case-demo-head"><h2>{es ? 'Así va a trabajar.' : 'This is how it will work.'}</h2><p>{es ? 'Escríbele como cliente o pregúntale a la base de una planta.' : 'Write to it as a customer or ask a plant’s database.'}</p></div><Agente lang={lang}/></>}
   {project.id === 'spc' && <><div className="case-demo-head"><h2>{es ? 'Súbele las mediciones de una pieza.' : 'Upload a part’s measurements.'}</h2><p>{es ? 'Ejemplo: el diámetro de un buje, con la herramienta desgastándose al final. Cambia la tolerancia o sube tu Excel.' : 'Sample: a bushing diameter, with the tool wearing out at the end. Change the tolerance or upload your Excel.'}</p></div><Spc lang={lang}/></>}
   {project.id === 'inventario' && <><div className="case-demo-head"><h2>{es ? 'El almacén de consumibles, en el celular.' : 'The consumables stockroom, on a phone.'}</h2><p>{es ? 'Toca un producto y escanea su QR con tu celular: se abre aquí mismo para darle salida o surtirlo.' : 'Tap a product and scan its QR with your phone: it opens right here to issue or restock it.'}</p></div><Inventario lang={lang}/></>}
   {project.id === 'csv' && <><div className="case-demo-head"><h2>{es ? 'Pruébalo con tu reporte.' : 'Try it with your report.'}</h2><p>{es ? 'CSV o Excel. Todo pasa en tu navegador.' : 'CSV or Excel. It all runs in your browser.'}</p></div><DataWorkbench lang={lang}/></>}
 </>;
}

function ProjectPage({ lang, project, next }: { lang: Lang; project: Project; next: { id: string; slug: string; title: string } }) {
 const es = lang === 'es', app = `/proyectos/${project.slug}/app`, brand = BRANDS[project.id];
 useEffect(() => { const d = location.hash && document.getElementById(location.hash.slice(1)); if (d) d.scrollIntoView(); else scrollTo(0, 0); }, [project.id]);
 const native = NATIVE[project.id];
 return <main id="main" data-c className={`case case-${project.id} project-${project.id}`} aria-label={project.title}>
  <div className="wrap">
   <a className="case-back" href="/#projects" data-title={es ? 'Proyectos' : 'Projects'}><ArrowLeft size={18}/>{es ? 'Todos los proyectos' : 'All projects'}</a>
   <header className="case-head" data-zone={project.title}>
    <div><span className="project-kind">{project.kind}{unfinished(project.status)}</span><h1>{project.title}</h1><p className="pitch">{project.pitch}</p><p>{project.desc}</p>
     <Facts items={project.facts}/>
     <div className="tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>
     {/* Sólo SPC nació como app de escritorio; las demás ya eran web */}
     {project.id === 'spc' && <p className="web-note">{es ? 'Versión web: adaptada de la app de escritorio para funcionar en el navegador.' : 'Web version: adapted from the desktop app to run in the browser.'}</p>}
     {HAS_APP.includes(project.id) ? <a className="button primary case-action" href={app} data-title={brand.name}>{es ? 'Abrir la app' : 'Open the app'}<ArrowRight size={18}/></a> : project.link.startsWith('http') && <a className="button primary case-action" href={project.link} {...EXT}>{project.action}<Out es={es}/></a>}
     {native && (native.href
      ? <a className="native-note" href={native.href} {...EXT}><strong>{es ? native.es : native.en}</strong><span>{es ? 'Descargar' : 'Download'}<Out es={es} size={14}/></span></a>
      : <p className="native-note is-dev"><strong>{es ? native.es : native.en}</strong><span>{es ? 'En desarrollo' : 'In development'}</span></p>)}
     {REPO[project.id] && <a className="inline-link case-code" href={`https://github.com/Brunich/${REPO[project.id]}`} {...EXT}>{es ? 'Código en GitHub' : 'Code on GitHub'}<Out es={es} size={16}/></a>}
    </div>
    <div className={`case-visual media-${project.id}`} aria-hidden="true">{project.id === 'club' ? <NfcTap lang={lang}/> : <Media lang={lang} project={project}/>}</div>
   </header>
   <section className="how" data-zone={es ? 'Cómo funciona' : 'How it works'} aria-label={es ? 'Cómo funciona' : 'How it works'}><h2>{es ? 'Cómo funciona' : 'How it works'}</h2><ol style={{ '--n': project.how.length } as React.CSSProperties}>{project.how.map(([title, text], i) => <li key={title}><span>{String(i + 1).padStart(2, '0')}</span><strong>{title}</strong><p>{text}</p></li>)}</ol></section>
  </div>
  {HAS_APP.includes(project.id) && <section id="demo" className="case-launch wrap" data-zone={es ? 'Pruébalo' : 'Try it'} aria-label={es ? 'Pruébalo' : 'Try it'}>
   <div><h2>{es ? 'Pruébalo' : 'Try it'}</h2><p>{es ? `Se abre ${brand.name}, la app sola${brand.real ? '' : ', con datos de ejemplo'}. Arriba tiene un enlace para volver a esta ficha.` : `${brand.name} opens, the app on its own${brand.real ? '' : ', with sample data'}. A link at the top brings you back to this page.`}</p></div>
   <a className="button primary" href={app} data-title={brand.name}>{es ? 'Abrir la app' : 'Open the app'}<ArrowRight size={18}/></a>
  </section>}
  {(project.id === 'punto' || project.id === 'vibe') && <section id="demo" className="case-demo" data-zone={es ? 'Pruébalo' : 'Try it'} aria-label={es ? 'Pruébalo' : 'Try it'}><div className="wrap">
   {project.id === 'punto' && <PuntoDemo lang={lang} link={project.link}/>}
   {project.id === 'vibe' && <div className="demo-vibe"><div className="case-demo-head"><h2>{es ? 'Pruébalo aquí mismo.' : 'Try it right here.'}</h2><p>{es ? 'Toca «Un RPG en Godot» o suelta la carpeta de tu proyecto. Todo corre en tu navegador.' : 'Tap “Un RPG en Godot” or drop your own project folder. Everything runs in your browser.'}</p></div><LiveOrShots probe={project.link} lang={lang} shots={[['/media/vibemap-mapa.webp', 1210, 350, es ? 'Mapa mental de VibeMap' : 'VibeMap mind map']]}><div className="case-browser"><span className="case-browser-bar"><i/><i/><i/><b>vibemap-brunich.vercel.app</b></span><iframe src={project.link} title={es ? 'VibeMap en vivo' : 'VibeMap live'} loading="lazy"/></div></LiveOrShots><p className="demo-vibe-links"><a className="inline-link" href={project.link} {...EXT}>{es ? 'Abrir en otra pestaña' : 'Open in a new tab'}<Out es={es}/></a><a className="inline-link" href="https://github.com/Brunich/VibeMap" {...EXT}>{es ? 'Ver el código' : 'View the code'}<Out es={es}/></a></p></div>}
  </div></section>}
  {!OTHER.includes(project.id) && project.id !== 'casa' && <aside className={`case-cta wrap project-${project.id}`} aria-label={es ? 'Contacto' : 'Contact'}><div><strong>{es ? 'Se puede adaptar a los datos de tu negocio.' : 'It can be adapted to your business’s data.'}</strong><span>{es ? 'Escríbeme y vemos qué le hace falta.' : 'Write to me and we will see what it needs.'}</span></div><a className="button primary" href={`mailto:${personal.email}?subject=${encodeURIComponent(project.title)}`}>{es ? 'Escribir por correo' : 'Send an email'}<ArrowRight size={18}/></a></aside>}
  <nav data-c data-zone={es ? 'Siguiente' : 'Next'} className={`case-next wrap project-${next.id}`} aria-label={es ? 'Siguiente proyecto' : 'Next project'}><a href={`/proyectos/${next.slug}`} data-title={next.title}><span>{es ? 'Siguiente proyecto' : 'Next project'}</span><strong>{next.title}</strong><ArrowRight size={26}/></a></nav>
 </main>;
}


// Una demo en vivo depende de otro servidor: si no contesta, se enseñan capturas y se dice por qué, en vez de una app vacía.
const PUNTO_API = 'https://wugsixqhygqvamgywymn.supabase.co/rest/v1/';
function useLive(probe: string) {
 const [live, setLive] = useState<boolean | null>(null);
 useEffect(() => {
  const stop = new AbortController(), timer = setTimeout(() => stop.abort(), 6000);
  fetch(probe, { mode: 'no-cors', signal: stop.signal, cache: 'no-store' }).then(() => setLive(true), () => setLive(false)).finally(() => clearTimeout(timer));
  return () => { clearTimeout(timer); stop.abort(); };
 }, [probe]);
 return live;
}
function LiveOrShots({ probe, shots, lang, children, live: given }: { probe: string; shots: [string, number, number, string][]; lang: Lang; children: React.ReactNode; live?: boolean | null }) {
 const es = lang === 'es';
 const probed = useLive(probe), live = given === undefined ? probed : given;
 if (live !== false) return <>{children}</>;
 return <div className="live-off">
  <p className="live-note" role="status">{es ? 'El servidor de esta demo no está respondiendo ahora mismo, así que te enseño capturas de la app real.' : 'This demo’s server is not responding right now, so here are screenshots of the real app.'}</p>
  <div className={`live-shots n${shots.length}`}>{shots.map(([src, w, h, alt]) => <figure key={src}><img src={src} width={w} height={h} alt={alt} loading="lazy"/><figcaption>{alt}</figcaption></figure>)}</div>
 </div>;
}

function PuntoDemo({ lang, link }: { lang: Lang; link: string }) {
 const es = lang === 'es', live = useLive(PUNTO_API);
 return <div className="demo-punto">
  <LiveOrShots probe={PUNTO_API} live={live} lang={lang} shots={[['/media/punto-u-mapa.webp', 780, 2000, es ? 'Mapa del campus con misiones' : 'Campus map with missions'], ['/media/punto-u.webp', 600, 1300, es ? 'Crear perfil' : 'Create a profile']]}><div className="case-phone"><iframe src={link} title={es ? 'Punto U en vivo' : 'Punto U live'}/></div></LiveOrShots>
  <div className="demo-punto-copy">{live === false
   ? <><h2>{es ? 'Así se ve la app.' : 'This is the app.'}</h2><p>{es ? 'El mapa del campus con las misiones abiertas y el registro con matrícula y facultad. La versión en vivo vuelve cuando su servidor esté arriba.' : 'The campus map with open missions and sign-up with student ID and school. The live version returns once its server is back up.'}</p></>
   : <><h2>{es ? 'Pruébala aquí mismo.' : 'Try it right here.'}</h2><p>{es ? 'La app real, en vivo: crea tu perfil y publica una misión.' : 'The real app, live: create your profile and post a mission.'}</p><a className="inline-link" href={link} {...EXT}>{es ? 'Abrir en otra pestaña' : 'Open in a new tab'}<Out es={es}/></a></>}</div>
 </div>;
}

// La tarjeta real: un QR que abre la misma página que abriría el chip, y el armador para tu negocio.
function ClubReal({ lang }: { lang: Lang }) {
 const es = lang === 'es';
 const demo = `${bizLink(bizFrom(''))}&demo`;
 const menuDemo = `${location.origin}/menu?mesa=7`;
 return <><div className="club-real">
  <Qr text={demo} label={es ? 'QR para abrir la tarjeta de sellos' : 'QR to open the stamp card'}/>
  <div><span className="kicker">{es ? 'Pruébalo con tu celular' : 'Try it on your phone'}</span><h3>{es ? 'Escanéalo: es lo mismo que tocar el chip.' : 'Scan it: same as tapping the chip.'}</h3>
   <p>{es ? 'Se abre la tarjeta de sellos real con el sello de hoy. Vuelve mañana y suma otro; al llenarla, el premio.' : 'The real stamp card opens with today’s stamp. Come back tomorrow for another; fill it for the reward.'}</p>
   <div className="club-real-links"><a className="button primary" href="/nfc" data-title={es ? 'Tu tarjeta NFC' : 'Your NFC card'}>{es ? 'Arma la de tu negocio' : 'Build one for your business'}<ArrowRight size={18}/></a><a className="inline-link" href={demo} data-title={es ? 'Tarjeta de sellos' : 'Stamp card'}>{es ? 'Abrirla aquí' : 'Open it here'}<ArrowRight size={18}/></a></div></div>
 </div>
 <div className="club-real club-menu">
  <Qr text={menuDemo} label={es ? 'QR para abrir el menú de ejemplo' : 'QR to open the sample menu'}/>
  <div><span className="kicker">{es ? 'El mismo chip, el menú' : 'Same chip, the menu'}</span><h3>{es ? 'La carta en el celular y el pedido por WhatsApp.' : 'The menu on the phone, the order via WhatsApp.'}</h3>
   <p>{es ? 'El cliente ve platillos, precios y alérgenos, arma su pedido y lo manda con el número de mesa. El negocio arma su menú en un minuto y no paga servidor.' : 'The customer sees dishes, prices and allergens, builds an order and sends it with the table number. The business builds its menu in a minute, with no server to pay for.'}</p>
   <div className="club-real-links"><a className="button primary" href="/nfc#menu" data-title={es ? 'Tu menú' : 'Your menu'}>{es ? 'Arma tu menú' : 'Build your menu'}<ArrowRight size={18}/></a><a className="inline-link" href={menuDemo} data-title={es ? 'Menú de ejemplo' : 'Sample menu'}>{es ? 'Ver el menú de ejemplo' : 'See the sample menu'}<ArrowRight size={18}/></a></div></div>
 </div></>;
}

function NfcPage({ lang }: { lang: Lang }) {
 const es = lang === 'es';
 const [tool, setTool] = useState<'card' | 'menu'>(() => location.hash === '#menu' ? 'menu' : 'card');
 useEffect(() => { scrollTo(0, 0); }, []);
 return <main id="main" data-c className="case project-club" aria-label={es ? 'Tu tarjeta NFC' : 'Your NFC card'}>
  <div className="wrap">
   <a className="case-back" href="/proyectos/club-nfc" data-title={es ? 'NFC para negocios' : 'NFC for businesses'}><ArrowLeft size={18}/>{es ? 'NFC para negocios' : 'NFC for businesses'}</a>
   <header className="nfc-head"><h1>{es ? 'Tu tarjeta de sellos, en un chip.' : 'Your stamp card, on a chip.'}</h1><p className="pitch">{es ? 'Tres pasos y queda lista en el mostrador.' : 'Three steps and it’s ready at the counter.'}</p></header>
   <ol className="nfc-steps">
    <li><span>01</span><strong>{es ? 'Compra el chip' : 'Buy the chip'}</strong><p>{es ? 'Stickers o tarjetas NFC NTAG215 (sirven los NTAG213 si no pones enlace de reseñas). Se venden en paquetes de 10 en Mercado Libre o Amazon.' : 'NTAG215 NFC stickers or cards (NTAG213 works if you skip the review link). Sold in packs of 10 online.'}</p></li>
    <li><span>02</span><strong>{es ? 'Arma tu tarjeta' : 'Set up your card'}</strong><p>{es ? 'Nombre, cuántos sellos y el premio. Abajo ves cómo le va a quedar al cliente.' : 'Name, how many stamps and the reward. Below you see how the customer will see it.'}</p></li>
    <li><span>03</span><strong>{es ? 'Grábalo y pégalo' : 'Write it and stick it'}</strong><p>{es ? 'Graba el enlace en el chip y pégalo en la carpeta de la cuenta o en la caja. iPhone y Android lo leen sin app.' : 'Write the link to the chip and stick it on the bill folder or the counter. iPhone and Android read it with no app.'}</p></li>
   </ol>
  </div>
  <section className="case-demo"><div className="wrap"><div className="dw-tabs nfc-tabs" role="tablist">{([['card', es ? 'Tarjeta de sellos' : 'Stamp card'], ['menu', es ? 'Menú' : 'Menu']] as const).map(([k, label]) => <button key={k} role="tab" aria-selected={tool === k} onClick={() => { setTool(k); history.replaceState(null, '', k === 'menu' ? '#menu' : location.pathname); }}>{label}</button>)}</div><Suspense fallback={null}>{tool === 'card' ? <NfcSetup lang={lang}/> : <MenuBuilder lang={lang}/>}</Suspense></div></section>
  <NfcGuide lang={lang}/>
 </main>;
}

// Guía de compra y grabado: qué chip pedir, cómo grabarlo y cómo dejarlo seguro.
function NfcGuide({ lang }: { lang: Lang }) {
 const es = lang === 'es';
 const cards: [string, string, string[]][] = es ? [
  ['Qué comprar', 'Stickers NTAG215 redondos de 25 mm, en paquete de 10.', ['Tarjeta de sellos: basta un NTAG213; con enlace de reseñas, NTAG215.', 'Menú: NTAG216 sin descripciones; el QR sí aguanta el menú completo.', 'Sobre metal (caja, refri, terminal) pide la versión «anti-metal»: un sticker normal no se lee ahí.', 'Evita MIFARE Classic 1K: el iPhone no lo abre como enlace.']],
  ['Cómo grabarlo', 'Dos minutos, sin instalar nada en Android.', ['Android: abre esta página en Chrome y toca «Grabar en el chip».', 'iPhone: app gratuita NFC Tools → Escribir → Añadir registro → URL → pega el enlace.', 'Acerca el chip a la parte de atrás del celular, cerca de la cámara.']],
  ['Antes de pegarlo', 'Que lo lea un celular que no sea el tuyo.', ['En Android, «¿Quedó bien grabado?» lee el chip y lo compara con tu enlace.', 'Cuando funcione, bloquéalo en NFC Tools (Otros → Bloquear etiqueta) para que nadie lo reescriba. Es para siempre: hazlo al final.', 'Pega también el QR al lado, para los celulares sin NFC.']],
 ] : [
  ['What to buy', 'Round 25 mm NTAG215 stickers, in packs of 10.', ['Stamp card: an NTAG213 is enough; with a review link, NTAG215.', 'Menu: NTAG216 without descriptions; the QR holds the full menu.', 'On metal (register, fridge, card terminal) get the “anti-metal” kind: a regular sticker will not read there.', 'Avoid MIFARE Classic 1K: iPhones will not open it as a link.']],
  ['How to write it', 'Two minutes, nothing to install on Android.', ['Android: open this page in Chrome and tap “Write to the chip”.', 'iPhone: free NFC Tools app → Write → Add record → URL → paste the link.', 'Hold the chip to the back of the phone, near the camera.']],
  ['Before sticking it', 'Have a phone other than yours read it.', ['On Android, “Was it written right?” reads the chip and compares it with your link.', 'Once it works, lock it in NFC Tools (Other → Lock tag) so nobody rewrites it. It is permanent: do it last.', 'Stick the QR next to it too, for phones without NFC.']],
 ];
 return <section className="wrap nfc-guide" data-zone={es ? 'Guía' : 'Guide'} aria-labelledby="nfc-guide-title">
  <h2 id="nfc-guide-title">{es ? 'Guía rápida del chip' : 'Chip quick guide'}</h2>
  <div className="nfc-guide-grid">{cards.map(([title, lead, items], i) => <article key={title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{lead}</p><ul>{items.map(x => <li key={x}>{x}</li>)}</ul></article>)}</div>
 </section>;
}

// Cada proyecto tiene su propio repo, con pruebas y README.
// La versión nativa de cada herramienta: las que ya existen se descargan; las demás van en camino.
const NATIVE: Record<string, Native> = {
 spc: { es: 'También como app de escritorio para Windows', en: 'Also as a Windows desktop app', href: 'https://github.com/Brunich/graficas-de-control/releases/latest' },
 casa: { es: 'App para Android, ya en uso', en: 'Android app, already in use', href: 'https://la-casa-del-angel.vercel.app/instalar', android: true },
 club: { es: 'App Android con lector NFC', en: 'Android app with NFC reader', href: 'https://github.com/Brunich/Chip-NFC-Para-Empresas-Y-Negocios/releases/latest/download/nfc-negocios.apk', android: true },
 inventario: { es: 'App Android nativa con escáner de cámara', en: 'Native Android app with camera scanner' },
 turno: { es: 'App Android nativa con cámara y avisos', en: 'Native Android app with camera and alerts' },
};
const REPO: Record<string, string> = { club: 'nfc-negocios', csv: 'analizador-csv', planta: 'planta-oee', inventario: 'inventario-camara', spc: 'graficas-de-control', turno: 'entrega-de-turno', vibe: 'VibeMap', punto: 'Punto-U-app', casa: 'la-casa-del-angel' };
// Los que tienen demo dentro del portafolio; los demás abren su propio sitio.
const HAS_APP = ['club', 'csv', 'planta', 'spc', 'inventario', 'turno', 'agente'];

// Videos de motion design: hoy el reel del portafolio; el espacio está listo para los que sigan.
function Motion({ lang }: { lang: Lang }) {
 const es = lang === 'es';
 return <section id="motion" className="wrap section-space motion-section" data-zone="Motion">
  <div className="section-heading"><div><span className="kicker">03 · Motion design</span><h2>{es ? 'También en movimiento.' : 'In motion, too.'}</h2><p>{es ? 'Videos cortos para presentar un producto, un proyecto o un juego. Cada cuadro sale de código, con la misma identidad que la web.' : 'Short videos to present a product, a project or a game. Every frame comes from code, with the same identity as the site.'}</p></div></div>
  <div className="motion-grid">
   <figure className="motion-main"><video src="/media/reel.mp4" poster="/media/reel-poster.jpg" controls playsInline preload="none" width="1920" height="1080" aria-label={es ? 'Reel del portafolio' : 'Portfolio reel'}/><figcaption><strong>{es ? 'Reel del portafolio' : 'Portfolio reel'}</strong><span>50 s · 1080p · 60 fps</span></figcaption></figure>
  </div>
 </section>;
}

function Contact({ lang }: { lang: Lang }) {
 const c = copy[lang], es = lang === 'es';
 return <section id="contact" className="contact-section wrap" data-zone={es ? 'Contacto' : 'Contact'}><div className="section-heading"><div><span className="kicker">04 · {es ? 'Contacto' : 'Contact'}</span><h2>{es ? 'Busco prácticas y también tomo encargos.' : 'Looking for an internship, and open to projects.'}</h2><p>{c.contactText}</p></div></div><div className="contact-links"><a href={`mailto:${personal.email}`}><span>Email<small>{personal.email}</small></span><ArrowRight size={22}/></a><a href={personal.github} {...EXT}><span>GitHub<small>Brunich</small></span><Out es={es} size={22}/></a>{personal.linkedIn && <a href={personal.linkedIn} {...EXT}><span>LinkedIn<small>Bruno Salas</small></span><Out es={es} size={22}/></a>}<a href={`https://wa.me/${personal.phone.replace(/\D/g, '')}`} {...EXT}><span>WhatsApp<small>{personal.phone}</small></span><Out es={es} size={22}/></a><a className="contact-about" href="/sobre-mi" data-title={es ? 'Sobre mí' : 'About me'}><span>{es ? 'Sobre mí' : 'About me'}<small>{es ? 'Música y viajes' : 'Music and travel'}</small></span><ArrowRight size={22}/></a></div></section>;
}
