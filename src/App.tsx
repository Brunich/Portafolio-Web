import { lazy, Suspense, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight, DownloadSimple, GithubLogo, EnvelopeSimple, LinkedinLogo, WhatsappLogo, Pause, Play } from '@phosphor-icons/react';
import { copy, certificates } from './content';
import type { Lang } from './content';
import { professional } from './professional-content';
import { personal } from './personal';
import OriginalScenes from './OriginalScenes';
// Las demos pesadas se cargan sólo en su página.
const DataWorkbench = lazy(() => import('./DataWorkbench'));
const LoyaltyDemo = lazy(() => import('./LoyaltyDemo'));
const ShiftHandover = lazy(() => import('./ShiftHandover'));
const Planta = lazy(() => import('./Planta'));
const Inventario = lazy(() => import('./Inventario'));
const Spc = lazy(() => import('./Spc'));
const MenuPage = lazy(() => import('./Menu').then(m => ({ default: m.MenuPage })));
const MenuBuilder = lazy(() => import('./Menu').then(m => ({ default: m.MenuBuilder })));
import PlantaPreview from './PlantaPreview';
import InventarioPreview from './InventarioPreview';
import SpcPreview from './SpcPreview';
import ClubPreview from './ClubPreview';
import CsvChart from './CsvChart';
import TurnoPreview from './TurnoPreview';
import HeroShowcase, { NfcTap } from './HeroShowcase';
import './pages.css';
import './theme.css';
import './layout.css';
import { useMotion } from './motion';
import { curtain } from './transition';
import { usePaging, glide, glideTo, zoneList } from './paging';
import { StampPage, NfcSetup, Qr, bizLink, bizFrom } from './Stamp';
import './brand.css';

const PROJECT_ORDER = ['club', 'csv', 'planta', 'spc', 'inventario', 'turno', 'vibe', 'punto'];
type Project = ReturnType<typeof professional>['projects'][number];
const external = (url: string) => url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};

// Rutas: la portada resume; cada proyecto tiene su propia página.
function route() {
 const path = location.pathname.replace(/\/+$/, '');
 if (path === '/sello') return { page: 'sello' as const };
 if (path === '/nfc') return { page: 'nfc' as const };
 if (path === '/menu') return { page: 'menu' as const };
 const m = /^\/proyectos\/([a-z0-9-]+)$/.exec(path);
 return m ? { page: 'project' as const, slug: m[1] } : { page: 'home' as const };
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
   if (!a || a.target || a.hasAttribute('download')) return;
   const url = new URL(a.href, location.href);
   if (url.origin !== location.origin || /\.\w+$/.test(url.pathname) || url.pathname === location.pathname) return;
   e.preventDefault();
   const from = a.closest('.row')?.querySelector('.project-media') ?? a;
   const color = getComputedStyle(a.closest('[data-c]') ?? a).getPropertyValue('--c').trim();
   void curtain(from, color, a.dataset.title ?? 'Bruno Salas', () => { history.pushState(null, '', url.pathname + url.search + url.hash); render(); land(url.hash); });
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
 const pg = usePaging(location.pathname === '/' || location.pathname === '', `${location.pathname}:${lang}`);
 const es = lang === 'es', p = professional(lang), c = copy[lang], r = route();
 const projects = [...p.projects].sort((a, b) => PROJECT_ORDER.indexOf(a.id) - PROJECT_ORDER.indexOf(b.id));
 const project = r.page === 'project' ? projects.find(x => x.slug === r.slug) : undefined;
 const home = !project && r.page === 'home';
 useMotion(`${project?.id ?? r.page}:${lang}`);
 useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('bruno-language', lang); } catch { /* Preferencia opcional. */ } }, [lang]);
 useEffect(() => { document.documentElement.dataset.motion = paused ? 'paused' : 'active'; }, [paused]);
 useEffect(() => { const pref = matchMedia('(prefers-reduced-motion: reduce)'); const change = () => setPaused(pref.matches); pref.addEventListener('change', change); return () => pref.removeEventListener('change', change); }, []);
 useEffect(() => { if (r.page === 'sello' || r.page === 'menu') return; document.title = r.page === 'nfc' ? (es ? 'Arma tu tarjeta NFC — Bruno Salas' : 'Build your NFC card — Bruno Salas') : project ? `${project.title} — Bruno Salas` : (es ? 'Bruno Salas — Web, datos y automatización' : 'Bruno Salas — Web, data & automation'); }, [project, es, r.page]);
 const at = (id: string) => home ? `#${id}` : `/#${id}`;
 if (r.page === 'sello') return <StampPage lang={lang}/>;
 if (r.page === 'menu') return <Suspense fallback={null}><MenuPage lang={lang}/></Suspense>;

 return <>
  <a className="skip-link" href="#main">{c.skip}</a>
  <div className="scroll-progress" aria-hidden="true"/>
  <header className="topbar" aria-label={es ? 'Navegación del portafolio' : 'Portfolio navigation'}><div className="topbar-inner wrap">
   <a className="brand" href="/" data-title="Bruno Salas" aria-label="Bruno Salas — inicio"><span className="brand-name"><span className="brand-top"><b>Bruno Salas</b><em>{es ? 'portafolio' : 'portfolio'}</em></span><small>{p.role}</small></span></a>
   <nav className="topnav" aria-label={es ? 'Secciones' : 'Sections'}>{[['projects', es ? 'Proyectos' : 'Projects'], ['about', es ? 'Perfil' : 'Profile'], ['graphics', 'Game dev'], ['motion', 'Motion']].map(([id, label]) => <a key={id} href={at(id)}>{label}</a>)}</nav>
   <div className="topbar-tools">
    <button className="icon-button" aria-label={paused ? c.play : c.pause} onClick={() => setPaused(!paused)}>{paused ? <Play size={16} weight="fill"/> : <Pause size={16} weight="fill"/>}</button>
    <div className="language-control" aria-label={es ? 'Idioma' : 'Language'}>{(['es', 'en'] as const).map(l => <button key={l} aria-label={l === 'es' ? 'Cambiar a español' : 'Switch to English'} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
    <a className="topbar-cta" href={at('contact')}>{c.contact}</a>
   </div>
  </div></header>
  {r.page === 'nfc' ? <NfcPage lang={lang}/> : project ? <ProjectPage lang={lang} project={project} projects={projects}/> : <Home lang={lang} paused={paused} projects={projects}/>}
  <ZoneNav lang={lang} routeKey={`${r.page}:${project?.id ?? ''}`}/>
  {pg.paged && <ZoneDots labels={pg.labels} current={pg.current}/>}
  <footer className="site-footer wrap" aria-label={es ? 'Pie del portafolio' : 'Portfolio footer'}>© {new Date().getFullYear()} Bruno Salas Rodríguez <span>{c.location}</span></footer>
 </>;
}

// Botón de zonas: baja con animación a la siguiente parte de la página; en la última, vuelve arriba.
function ZoneNav({ lang, routeKey }: { lang: Lang; routeKey: string }) {
 const es = lang === 'es';
 const [next, setNext] = useState<HTMLElement | null>(null);
 const [label, setLabel] = useState('');
 const [hidden, setHidden] = useState(false);
 useEffect(() => {
  let lastY = scrollY;
  // En celular no hay margen libre: arranca oculto y aparece al subir.
  setHidden(!document.documentElement.classList.contains('paged') && matchMedia('(max-width:760px)').matches);
  const update = () => {
   const zones = [...document.querySelectorAll<HTMLElement>('main [data-zone]')];
   const n = zones.find(z => z.getBoundingClientRect().top > 110) ?? null;
   setNext(n); setLabel(n?.dataset.zone ?? (es ? 'Arriba' : 'Top'));
   // Fuera de la portada por zonas se esconde mientras bajas leyendo, para no tapar texto; vuelve al subir o al final.
   const y = scrollY, end = y > 240 && y + innerHeight > document.documentElement.scrollHeight - 80;
   if (!document.documentElement.classList.contains('paged') && Math.abs(y - lastY) > 6) setHidden(y > lastY && y > 240 && !end);
   if (end) setHidden(false);
   lastY = y;
  };
  update(); const late = setTimeout(update, 600);
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', update);
  return () => { clearTimeout(late); removeEventListener('scroll', update); removeEventListener('resize', update); };
 }, [routeKey, es]);
 return <button className={`zone-nav${next ? '' : ' is-top'}${hidden ? ' is-hidden' : ''}`} onClick={() => { if (next) void glideTo(next); else void glide(0); }} aria-label={next ? `${es ? 'Bajar a' : 'Go to'} ${label}` : (es ? 'Volver arriba' : 'Back to top')}>
  <span className="zone-label">{label}</span><span className="zone-arrow" aria-hidden="true"><ArrowDown size={18} weight="bold"/></span>
 </button>;
}

// Guía lateral: una marca por zona; la actual se alarga y muestra su nombre.
function ZoneDots({ labels, current }: { labels: string[]; current: number }) {
 return <nav className="zone-dots" aria-label="Zonas">{labels.map((l, i) => <button key={l + i} className={i === current ? 'on' : ''} aria-current={i === current ? 'true' : undefined} onClick={() => void glideTo(zoneList()[i])}><span>{l}</span></button>)}</nav>;
}

// Arte de fondo de la portada: órbitas de línea fina con puntos que las recorren.
function HeroArt() {
 return <svg className="hero-art" viewBox="0 0 800 800" aria-hidden="true">
  <defs><linearGradient id="ha" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a391ff"/><stop offset=".5" stopColor="#6fd6ff"/><stop offset="1" stopColor="#7fe3c6"/></linearGradient></defs>
  {[150, 230, 310, 390].map((r, i) => <g key={r} className={`orbit o${i}`}><ellipse cx="400" cy="400" rx={r} ry={r * .62} fill="none" stroke="url(#ha)" strokeWidth="1"/><circle cx={400 + r} cy="400" r={3 + (i % 2)} fill="url(#ha)"/></g>)}
  {[[120, 140], [690, 210], [610, 660], [170, 600], [430, 90]].map(([x, y], i) => <path key={i} className={`spark s${i}`} d={`M${x} ${y - 9}L${x + 2.2} ${y - 2.2}L${x + 9} ${y}L${x + 2.2} ${y + 2.2}L${x} ${y + 9}L${x - 2.2} ${y + 2.2}L${x - 9} ${y}L${x - 2.2} ${y - 2.2}Z`} fill="#e9e4ff"/>)}
 </svg>;
}

function Home({ lang, paused, projects }: { lang: Lang; paused: boolean; projects: Project[] }) {
 const c = copy[lang], p = professional(lang), es = lang === 'es';
 const cv = es ? '/cv/Bruno-Salas-ES.pdf' : '/cv/Bruno-Salas-EN.pdf';
 return <main id="main">
  <section id="home" className="hero wrap" data-zone={es ? 'Inicio' : 'Home'}><HeroArt/><div className="hero-copy"><h1>{p.title}<em>{p.accent}</em></h1><p>{p.intro}</p><div className="hero-actions"><a className="button primary" href="#projects">{c.view}<ArrowDown size={19}/></a><a className="button secondary" href={cv} download>{es ? 'Descargar CV' : 'Download CV'}<DownloadSimple size={19}/></a></div><p className="hero-facts">{es ? 'Monterrey, N. L. · UANL 2023–2028 · Español, inglés y portugués' : 'Monterrey, Mexico · UANL 2023–2028 · Spanish, English & Portuguese'}</p></div><div className="hero-workbench"><HeroShowcase lang={lang} paused={paused}/></div></section>
  <section id="projects" className="wrap section-space"><div className="projects-intro" data-zone={es ? 'Proyectos' : 'Projects'}><div className="section-heading" data-num="01"><div><span className="kicker">01 · {es ? 'Proyectos' : 'Projects'}</span><h2>{p.projectsTitle}</h2><p>{p.projectsIntro}</p></div><a className="inline-link" href={personal.github} {...external(personal.github)}>GitHub<GithubLogo size={21}/></a></div>
   <ol className="project-index">{projects.map((x, i) => <li key={x.id} className={`project-${x.id}`}><button onClick={() => void glideTo(document.getElementById(`p-${x.id}`))}><span className="pi-num">{String(i + 1).padStart(2, '0')}</span><span className="pi-main"><strong>{x.title}</strong><em>{x.pitch}</em></span><span className="pi-kind">{x.kind}</span><ArrowDown size={18}/></button></li>)}</ol></div>
   <div className="rows">{projects.map((project, i) => <ProjectRow key={project.id} lang={lang} project={project} flip={i % 2 === 1} n={i + 1} of={projects.length}/>)}</div>
  </section>
  <section id="about" className="about-section section-space"><div className="wrap">
   <div className="about-grid" data-zone={es ? 'Perfil' : 'Profile'}>
    <figure className="portrait"><img src="/media/bruno-retrato.jpg" alt="Bruno Salas" width="560" height="700" loading="lazy"/><figcaption><strong>Bruno Salas</strong><span>Monterrey, N. L.</span></figcaption></figure>
    <div className="about-copy"><span className="kicker">02 · {es ? 'Perfil' : 'Profile'}</span><h2>{p.aboutTitle}</h2><p>{p.about}</p><p>{p.about2}</p><a className="inline-link" href={cv} download>{es ? 'Descargar CV' : 'Download CV'}<DownloadSimple size={20}/></a>
     <dl className="profile-points">{p.profilePoints.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
   </div>
   <div className="experience-grid" data-zone={es ? 'Experiencia' : 'Experience'}><div><h3>{c.timelineTitle}</h3>{c.experience.map(e => <div className="experience-row" key={e.year}><span className="year">{e.year}</span><div><h4>{e.role}</h4><span className="org">{e.org}</span><p>{e.text}</p></div></div>)}</div><div><h3>{c.learning}</h3>{certificates.map(cert => <a className="certificate" key={cert.title} href={cert.url} {...external(cert.url)}><div><h4>{cert.title}</h4><p>{cert.org}</p><span>{cert.year}</span></div><ArrowUpRight size={22}/></a>)}</div></div>
   <div className="skills tools-block" data-zone={es ? 'Herramientas' : 'Tools'}><h3>{p.techTitle}</h3><div className="skills-grid">{p.skills.map(s => <div key={s.name}><h4>{s.name}</h4><p>{s.desc}</p><div className="tags">{s.tools.map(tool => <span key={tool}>{tool}</span>)}</div></div>)}</div><p className="languages-line">{c.languages}</p></div>
  </div></section>
  <OriginalScenes lang={lang} paused={paused}/>
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
  case 'vibemap': return <img className="vibe-shot" src="/media/vibemap-mapa.webp" alt={lang === 'es' ? 'Mapa mental de VibeMap sobre el código de este portafolio' : 'VibeMap mind map of this portfolio’s code'} width="1210" height="350" loading="lazy"/>;
  default: return <div className="phones"><img src="/media/punto-u-mapa.webp" width="780" height="2000" alt={es ? 'Punto U: mapa del campus con misiones' : 'Punto U: campus map with missions'} loading="lazy"/><img src="/media/punto-u.webp" width="600" height="1300" alt={es ? 'Punto U: crear perfil' : 'Punto U: create profile'} loading="lazy"/></div>;
 }
}

function ProjectRow({ lang, project, flip, n, of }: { lang: Lang; project: Project; flip: boolean; n: number; of: number }) {
 const es = lang === 'es', page = `/proyectos/${project.slug}`;
 return <article id={`p-${project.id}`} data-c data-zone={project.title} className={`row project project-${project.id}${flip ? ' flip' : ''}${project.id === 'vibe' ? ' wide' : ''}`}>
  <a className={`project-media media-${project.id}`} href={page} data-title={project.title} aria-label={`${project.title} — ${es ? 'ver proyecto' : 'view project'}`}><Media lang={lang} project={project}/><span className="media-open"><ArrowUpRight size={22}/></span></a>
  <div className="project-info"><span className="row-num">{String(n).padStart(2, '0')}<i>/ {String(of).padStart(2, '0')}</i></span><span className="project-kind">{project.kind}<em>{project.status}</em></span><h3><a href={page} data-title={project.title}>{project.title}</a></h3><p className="pitch">{project.pitch}</p><p>{project.desc}</p>
   {project.metrics.length > 0 && <dl className="project-metrics">{project.metrics.map(([value, label]) => <div key={value + label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>}
   <div className="project-links"><a className="button primary" href={page} data-title={project.title}>{es ? 'Ver proyecto' : 'View project'}<ArrowRight size={18}/></a>{project.link.startsWith('http') && <a className="inline-link" href={project.link} {...external(project.link)}>{project.action}<ArrowUpRight size={18}/></a>}</div>
  </div>
 </article>;
}

function ProjectPage({ lang, project, projects }: { lang: Lang; project: Project; projects: Project[] }) {
 const es = lang === 'es';
 const next = projects[(projects.indexOf(project) + 1) % projects.length];
 useEffect(() => { scrollTo(0, 0); }, [project.id]);
 return <main id="main" data-c className={`case case-${project.id} project-${project.id}`} aria-label={project.title}>
  <div className="wrap">
   <a className="case-back" href="/#projects" data-title={es ? 'Proyectos' : 'Projects'}><ArrowLeft size={18}/>{es ? 'Todos los proyectos' : 'All projects'}</a>
   <header className="case-head" data-zone={project.title}>
    <div><span className="project-kind">{project.kind}<em>{project.status}</em></span><h1>{project.title}</h1><p className="pitch">{project.pitch}</p><p>{project.desc}</p>
     {project.metrics.length > 0 && <dl className="project-metrics case-metrics">{project.metrics.map(([value, label]) => <div key={value + label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>}
     <div className="tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>
     {project.link.startsWith('http') && <a className="button primary case-action" href={project.link} {...external(project.link)}>{project.action}<ArrowUpRight size={18}/></a>}
     {REPO[project.id] && <a className="inline-link case-code" href={`https://github.com/Brunich/${REPO[project.id]}`} {...external('https://github.com')}><GithubLogo size={20}/>{es ? 'Código en GitHub' : 'Code on GitHub'}<ArrowUpRight size={16}/></a>}
    </div>
    <div className={`case-visual media-${project.id}`} aria-hidden="true">{project.id === 'club' ? <NfcTap lang={lang}/> : <Media lang={lang} project={project}/>}</div>
   </header>
   <section className="how" data-zone={es ? 'Cómo funciona' : 'How it works'} aria-label={es ? 'Cómo funciona' : 'How it works'}><h2>{es ? 'Cómo funciona' : 'How it works'}</h2><ol style={{ '--n': project.how.length } as React.CSSProperties}>{project.how.map(([title, text], i) => <li key={title}><span>{String(i + 1).padStart(2, '0')}</span><strong>{title}</strong><p>{text}</p></li>)}</ol></section>
  </div>
  <section className="case-demo" data-zone={es ? 'Pruébalo' : 'Try it'} aria-label={es ? 'Pruébalo' : 'Try it'}><div className="wrap"><Suspense fallback={<p className="case-loading">{es ? 'Cargando…' : 'Loading…'}</p>}>
   {project.id === 'punto' && <PuntoDemo lang={lang} link={project.link}/>}
   {project.id === 'club' && <><div className="case-demo-head"><h2>{es ? 'Así se ve en el restaurante.' : 'This is how it looks at the restaurant.'}</h2><p>{es ? 'Apoya el celular en el chip y adelanta el tiempo: así junta sellos el cliente y así le da seguimiento el negocio.' : 'Tap the phone on the chip and fast-forward: this is how the customer collects stamps and how the business follows up.'}</p></div><LoyaltyDemo lang={lang}/><ClubReal lang={lang}/></>}
   {project.id === 'turno' && <ShiftHandover lang={lang}/>}
   {project.id === 'planta' && <><div className="case-demo-head"><h2>{es ? 'Súbele tus reportes del turno.' : 'Upload your shift reports.'}</h2><p>{es ? 'Ya vienen tres de ejemplo. Cambia cualquiera por tu Excel o CSV: todo se procesa en tu navegador.' : 'Three samples are loaded. Swap any for your Excel or CSV: everything runs in your browser.'}</p></div><Planta lang={lang}/></>}
   {project.id === 'spc' && <><div className="case-demo-head"><h2>{es ? 'Súbele las mediciones de una pieza.' : 'Upload a part’s measurements.'}</h2><p>{es ? 'Ya viene un ejemplo: el diámetro de un buje, cinco piezas cada media hora, con la herramienta desgastándose al final. Cambia la tolerancia o sube tu Excel.' : 'A sample is loaded: a bushing diameter, five parts every half hour, with the tool wearing out at the end. Change the tolerance or upload your Excel.'}</p></div><Spc lang={lang}/></>}
   {project.id === 'inventario' && <><div className="case-demo-head"><h2>{es ? 'Ábrelo en tu celular y escanea algo.' : 'Open it on your phone and scan something.'}</h2><p>{es ? 'Funciona con la cámara, con una foto del código o escribiéndolo. Se guarda en tu navegador.' : 'Works with the camera, a photo of the code or by typing it. Saved in your browser.'}</p></div><Inventario lang={lang}/></>}
   {project.id === 'csv' && <><div className="case-demo-head"><h2>{es ? 'Tus datos, en un mapa.' : 'Your data, as a map.'}</h2><p>{es ? 'Sube o arrastra tu CSV. Se analiza en tu navegador y nada sale de tu equipo.' : 'Upload or drag your CSV. It is analyzed in your browser and nothing leaves your device.'}</p></div><DataWorkbench lang={lang}/></>}
   {project.id === 'vibe' && <div className="demo-vibe"><div className="case-demo-head"><h2>{es ? 'Pruébalo aquí mismo.' : 'Try it right here.'}</h2><p>{es ? 'Toca «Un RPG en Godot» o suelta la carpeta de tu proyecto. Todo corre en tu navegador.' : 'Tap “Un RPG en Godot” or drop your own project folder. Everything runs in your browser.'}</p></div><LiveOrShots probe={project.link} lang={lang} shots={[['/media/vibemap-mapa.webp', 1210, 350, es ? 'Mapa mental de VibeMap' : 'VibeMap mind map']]}><div className="case-browser"><span className="case-browser-bar"><i/><i/><i/><b>vibemap-brunich.vercel.app</b></span><iframe src={project.link} title={es ? 'VibeMap en vivo' : 'VibeMap live'} loading="lazy"/></div></LiveOrShots><p className="demo-vibe-links"><a className="inline-link" href={project.link} {...external(project.link)}>{es ? 'Abrir en otra pestaña' : 'Open in a new tab'}<ArrowUpRight size={18}/></a><a className="inline-link" href="https://github.com/Brunich/VibeMap" {...external('https://github.com/Brunich/VibeMap')}>{es ? 'Ver el código' : 'View the code'}<ArrowUpRight size={18}/></a></p></div>}
  </Suspense></div></section>
  <nav data-c data-zone={es ? 'Siguiente' : 'Next'} className={`case-next wrap project-${next.id}`} aria-label={es ? 'Siguiente proyecto' : 'Next project'}><a href={`/proyectos/${next.slug}`} data-title={next.title}><span>{es ? 'Siguiente proyecto' : 'Next project'}</span><strong>{next.title}</strong><ArrowRight size={26}/></a></nav>
 </main>;
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
   <div className="club-real-links"><a className="button primary" href="/nfc" data-title={es ? 'Tu tarjeta NFC' : 'Your NFC card'}>{es ? 'Arma la de tu negocio' : 'Build one for your business'}<ArrowRight size={18}/></a><a className="inline-link" href={demo} target="_blank" rel="noreferrer">{es ? 'Abrirla aquí' : 'Open it here'}<ArrowUpRight size={18}/></a></div></div>
 </div>
 <div className="club-real club-menu">
  <Qr text={menuDemo} label={es ? 'QR para abrir el menú de ejemplo' : 'QR to open the sample menu'}/>
  <div><span className="kicker">{es ? 'El mismo chip, el menú' : 'Same chip, the menu'}</span><h3>{es ? 'La carta en el celular y el pedido por WhatsApp.' : 'The menu on the phone, the order via WhatsApp.'}</h3>
   <p>{es ? 'El cliente ve platillos, precios y alérgenos, arma su pedido y lo manda con el número de mesa. El negocio arma su menú en un minuto y no paga servidor.' : 'The customer sees dishes, prices and allergens, builds an order and sends it with the table number. The business builds its menu in a minute, with no server to pay for.'}</p>
   <div className="club-real-links"><a className="button primary" href="/nfc#menu" data-title={es ? 'Tu menú' : 'Your menu'}>{es ? 'Arma tu menú' : 'Build your menu'}<ArrowRight size={18}/></a><a className="inline-link" href={menuDemo} target="_blank" rel="noreferrer">{es ? 'Ver el menú de ejemplo' : 'See the sample menu'}<ArrowUpRight size={18}/></a></div></div>
 </div></>;
}

function NfcPage({ lang }: { lang: Lang }) {
 const es = lang === 'es';
 const [tool, setTool] = useState<'card' | 'menu'>(() => location.hash === '#menu' ? 'menu' : 'card');
 useEffect(() => { scrollTo(0, 0); }, []);
 return <main id="main" data-c className="case project-club">
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
   : <><h2>{es ? 'Pruébala aquí mismo.' : 'Try it right here.'}</h2><p>{es ? 'La app real, en vivo: crea tu perfil y publica una misión.' : 'The real app, live: create your profile and post a mission.'}</p><a className="inline-link" href={link} target="_blank" rel="noreferrer">{es ? 'Abrir en otra pestaña' : 'Open in a new tab'}<ArrowUpRight size={18}/></a></>}</div>
 </div>;
}

// Cada proyecto tiene su propio repo, con pruebas y README.
const REPO: Record<string, string> = { club: 'nfc-negocios', csv: 'analizador-csv', planta: 'planta-oee', inventario: 'inventario-camara', turno: 'entrega-de-turno', vibe: 'VibeMap', punto: 'Punto-U-app' };

// Videos de motion design: hoy el reel del portafolio; el espacio está listo para los que sigan.
function Motion({ lang }: { lang: Lang }) {
 const es = lang === 'es';
 return <section id="motion" className="wrap section-space motion-section" data-zone="Motion">
  <div className="section-heading" data-num="04"><div><span className="kicker">04 · Motion design</span><h2>{es ? 'También en movimiento.' : 'In motion, too.'}</h2><p>{es ? 'Videos cortos para presentar un producto, un proyecto o un juego. Cada cuadro sale de código, con la misma identidad que la web.' : 'Short videos to present a product, a project or a game. Every frame comes from code, with the same identity as the site.'}</p></div></div>
  <div className="motion-grid">
   <figure className="motion-main"><video src="/media/reel.mp4" poster="/media/reel-poster.jpg" controls playsInline preload="none" width="1920" height="1080" aria-label={es ? 'Reel del portafolio' : 'Portfolio reel'}/><figcaption><strong>{es ? 'Reel del portafolio' : 'Portfolio reel'}</strong><span>50 s · 1080p · 60 fps</span></figcaption></figure>
   <div className="motion-next"><span className="motion-tag">{es ? 'En preparación' : 'In the works'}</span><strong>{es ? 'Tráiler de IA Rogue' : 'IA Rogue trailer'}</strong><p>{es ? 'Un comercial corto de mi videojuego, en cuanto tenga las escenas.' : 'A short spot for my game, once the scenes are ready.'}</p></div>
  </div>
 </section>;
}

function Contact({ lang }: { lang: Lang }) {
 const c = copy[lang], es = lang === 'es';
 return <section id="contact" className="contact-section wrap" data-zone={es ? 'Contacto' : 'Contact'}><div className="section-heading" data-num="05"><div><span className="kicker">05 · {es ? 'Contacto' : 'Contact'}</span><h2>{es ? 'Hablemos de tu proyecto.' : 'Let’s talk about your project.'}</h2><p>{c.contactText}</p></div></div><div className="contact-links"><a href={`mailto:${personal.email}`}><EnvelopeSimple size={25}/><span>Email<small>{personal.email}</small></span><ArrowUpRight size={22}/></a><a href={personal.github} {...external(personal.github)}><GithubLogo size={25}/><span>GitHub<small>Brunich</small></span><ArrowUpRight size={22}/></a>{personal.linkedIn && <a href={personal.linkedIn} {...external(personal.linkedIn)}><LinkedinLogo size={25}/><span>LinkedIn<small>Bruno Salas</small></span><ArrowUpRight size={22}/></a>}<a href={`https://wa.me/${personal.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><WhatsappLogo size={25}/><span>WhatsApp<small>{personal.phone}</small></span><ArrowUpRight size={22}/></a></div></section>;
}
