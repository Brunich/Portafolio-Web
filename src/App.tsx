import { lazy, Suspense, useEffect, useState } from 'react';
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
import ClubPreview from './ClubPreview';
import CsvChart from './CsvChart';
import TurnoPreview from './TurnoPreview';
import HeroShowcase from './HeroShowcase';
import './pages.css';
import './theme.css';
import './layout.css';
import { useMotion } from './motion';

const PROJECT_ORDER = ['club', 'csv', 'turno', 'vibe', 'punto'];
type Project = ReturnType<typeof professional>['projects'][number];
const external = (url: string) => url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};

// Rutas: la portada resume; cada proyecto tiene su propia página.
function route() {
 const m = /^\/proyectos\/([a-z0-9-]+)$/.exec(location.pathname.replace(/\/+$/, ''));
 return m ? { page: 'project' as const, slug: m[1] } : { page: 'home' as const };
}

export default function App() {
 const [lang, setLang] = useState<Lang>(() => { try { return localStorage.getItem('bruno-language') === 'en' ? 'en' : 'es'; } catch { return 'es'; } });
 const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
 const es = lang === 'es', p = professional(lang), c = copy[lang], r = route();
 const projects = [...p.projects].sort((a, b) => PROJECT_ORDER.indexOf(a.id) - PROJECT_ORDER.indexOf(b.id));
 const project = r.page === 'project' ? projects.find(x => x.slug === r.slug) : undefined;
 const home = !project;
 useMotion(`${project?.id ?? 'home'}:${lang}`);
 useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('bruno-language', lang); } catch { /* Preferencia opcional. */ } }, [lang]);
 useEffect(() => { document.documentElement.dataset.motion = paused ? 'paused' : 'active'; }, [paused]);
 useEffect(() => { const pref = matchMedia('(prefers-reduced-motion: reduce)'); const change = () => setPaused(pref.matches); pref.addEventListener('change', change); return () => pref.removeEventListener('change', change); }, []);
 useEffect(() => { document.title = project ? `${project.title} — Bruno Salas` : (es ? 'Bruno Salas — Web, datos y automatización' : 'Bruno Salas — Web, data & automation'); }, [project, es]);
 const at = (id: string) => home ? `#${id}` : `/#${id}`;

 return <>
  <a className="skip-link" href="#main">{c.skip}</a>
  <div className="scroll-progress" aria-hidden="true"/>
  <header className="topbar"><div className="topbar-inner wrap">
   <a className="brand" href="/" aria-label="Bruno Salas — inicio"><span className="brand-mark" aria-hidden="true">BS</span><span className="brand-name">Bruno Salas<small>{p.role}</small></span></a>
   <nav className="topnav" aria-label={es ? 'Secciones' : 'Sections'}>{[['projects', es ? 'Proyectos' : 'Projects'], ['about', es ? 'Perfil' : 'Profile'], ['graphics', 'Game dev']].map(([id, label]) => <a key={id} href={at(id)}>{label}</a>)}</nav>
   <div className="topbar-tools">
    <button className="icon-button" aria-label={paused ? c.play : c.pause} onClick={() => setPaused(!paused)}>{paused ? <Play size={16} weight="fill"/> : <Pause size={16} weight="fill"/>}</button>
    <div className="language-control" aria-label={es ? 'Idioma' : 'Language'}>{(['es', 'en'] as const).map(l => <button key={l} aria-label={l === 'es' ? 'Cambiar a español' : 'Switch to English'} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
    <a className="topbar-cta" href={at('contact')}>{c.contact}</a>
   </div>
  </div></header>
  {home ? <Home lang={lang} paused={paused} projects={projects}/> : <ProjectPage lang={lang} project={project} projects={projects}/>}
  <footer className="site-footer wrap">© {new Date().getFullYear()} Bruno Salas Rodríguez <span>{c.location}</span></footer>
 </>;
}

function Home({ lang, paused, projects }: { lang: Lang; paused: boolean; projects: Project[] }) {
 const c = copy[lang], p = professional(lang), es = lang === 'es';
 const cv = es ? '/cv/Bruno-Salas-ES.pdf' : '/cv/Bruno-Salas-EN.pdf';
 return <main id="main">
  <section id="home" className="hero wrap"><div className="hero-copy"><h1>{p.title}<span>{p.accent}</span></h1><p>{p.intro}</p><div className="hero-actions"><a className="button primary" href="#projects">{c.view}<ArrowDown size={19}/></a><a className="button secondary" href={cv} download>{es ? 'Descargar CV' : 'Download CV'}<DownloadSimple size={19}/></a></div><p className="hero-facts">{es ? 'Monterrey, N. L. · UANL 2023–2028 · Español, inglés y portugués' : 'Monterrey, Mexico · UANL 2023–2028 · Spanish, English & Portuguese'}</p></div><div className="hero-workbench"><HeroShowcase lang={lang} paused={paused}/></div></section>
  <section id="projects" className="wrap section-space"><div className="section-heading"><div><span className="kicker">01 · {es ? 'Proyectos' : 'Projects'}</span><h2>{p.projectsTitle}</h2><p>{p.projectsIntro}</p></div><a className="inline-link" href={personal.github} {...external(personal.github)}>GitHub<GithubLogo size={21}/></a></div>
   <div className="rows">{projects.map((project, i) => <ProjectRow key={project.id} lang={lang} project={project} flip={i % 2 === 1}/>)}</div>
  </section>
  <section id="about" className="about-section section-space"><div className="wrap">
   <div className="about-grid">
    <figure className="portrait"><img src="/media/bruno-retrato.jpg" alt="Bruno Salas" width="640" height="800" loading="lazy"/><figcaption><strong>Bruno Salas</strong><span>Monterrey, N. L.</span></figcaption></figure>
    <div className="about-copy"><span className="kicker">02 · {es ? 'Perfil' : 'Profile'}</span><h2>{p.aboutTitle}</h2><p>{p.about}</p><p>{p.about2}</p><a className="inline-link" href={cv} download>{es ? 'Descargar CV' : 'Download CV'}<DownloadSimple size={20}/></a>
     <dl className="profile-points">{p.profilePoints.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
   </div>
   <div className="experience-grid"><div><h3>{c.timelineTitle}</h3>{c.experience.map(e => <div className="experience-row" key={e.year}><span className="year">{e.year}</span><div><h4>{e.role}</h4><span className="org">{e.org}</span><p>{e.text}</p></div></div>)}</div><div><h3>{c.learning}</h3>{certificates.map(cert => <a className="certificate" key={cert.title} href={cert.url} {...external(cert.url)}><div><h4>{cert.title}</h4><p>{cert.org}</p><span>{cert.year}</span></div><ArrowUpRight size={22}/></a>)}</div></div>
   <div className="skills tools-block"><h3>{p.techTitle}</h3><div className="skills-grid">{p.skills.map(s => <div key={s.name}><h4>{s.name}</h4><p>{s.desc}</p><div className="tags">{s.tools.map(tool => <span key={tool}>{tool}</span>)}</div></div>)}</div><p className="languages-line">{c.languages}</p></div>
  </div></section>
  <OriginalScenes lang={lang} paused={paused}/>
  <Contact lang={lang}/>
 </main>;
}

function Media({ lang, project }: { lang: Lang; project: Project }) {
 const es = lang === 'es';
 switch (project.media) {
  case 'club': return <ClubPreview lang={lang}/>;
  case 'analizador': return <CsvChart lang={lang}/>;
  case 'turno': return <TurnoPreview lang={lang}/>;
  case 'vibemap': return <img className="vibe-shot" src="/media/vibemap-mapa.webp" alt={lang === 'es' ? 'Mapa mental de VibeMap sobre el código de este portafolio' : 'VibeMap mind map of this portfolio’s code'} width="1210" height="350" loading="lazy"/>;
  default: return <div className="phones"><img src="/media/punto-u-mapa.webp" alt={es ? 'Punto U: mapa del campus con misiones' : 'Punto U: campus map with missions'} loading="lazy"/><img src="/media/punto-u.webp" alt={es ? 'Punto U: crear perfil' : 'Punto U: create profile'} loading="lazy"/></div>;
 }
}

function ProjectRow({ lang, project, flip }: { lang: Lang; project: Project; flip: boolean }) {
 const es = lang === 'es', page = `/proyectos/${project.slug}`;
 return <article className={`row project project-${project.id}${flip ? ' flip' : ''}${project.id === 'vibe' ? ' wide' : ''}`}>
  <a className={`project-media media-${project.id}`} href={page} aria-label={`${project.title} — ${es ? 'ver proyecto' : 'view project'}`}><Media lang={lang} project={project}/><span className="media-open"><ArrowUpRight size={22}/></span></a>
  <div className="project-info"><span className="project-kind">{project.kind}<em>{project.status}</em></span><h3><a href={page}>{project.title}</a></h3><p>{project.desc}</p>
   {project.metrics.length > 0 && <dl className="project-metrics">{project.metrics.map(([value, label]) => <div key={value + label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>}
   <div className="project-links"><a className="button primary" href={page}>{es ? 'Ver proyecto' : 'View project'}<ArrowRight size={18}/></a>{project.link.startsWith('http') && <a className="inline-link" href={project.link} {...external(project.link)}>{project.action}<ArrowUpRight size={18}/></a>}</div>
  </div>
 </article>;
}

function ProjectPage({ lang, project, projects }: { lang: Lang; project: Project; projects: Project[] }) {
 const es = lang === 'es';
 const next = projects[(projects.indexOf(project) + 1) % projects.length];
 useEffect(() => { scrollTo(0, 0); }, [project.id]);
 return <main id="main" className={`case case-${project.id}`}>
  <div className="wrap">
   <a className="case-back" href="/#projects"><ArrowLeft size={18}/>{es ? 'Todos los proyectos' : 'All projects'}</a>
   <header className="case-head">
    <div><span className="project-kind">{project.kind}<em>{project.status}</em></span><h1>{project.title}</h1><p>{project.desc}</p>
     <div className="tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>
     {project.link.startsWith('http') && <a className="button primary case-action" href={project.link} {...external(project.link)}>{project.action}<ArrowUpRight size={18}/></a>}
    </div>
    {project.metrics.length > 0 && <dl className="project-metrics case-metrics">{project.metrics.map(([value, label]) => <div key={value + label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>}
   </header>
   <section className="how" aria-label={es ? 'Cómo funciona' : 'How it works'}><h2>{es ? 'Cómo funciona' : 'How it works'}</h2><ol>{project.how.map(([title, text], i) => <li key={title}><span>{String(i + 1).padStart(2, '0')}</span><strong>{title}</strong><p>{text}</p></li>)}</ol></section>
  </div>
  <section className="case-demo" aria-label={es ? 'Pruébalo' : 'Try it'}><div className="wrap"><Suspense fallback={<p className="case-loading">{es ? 'Cargando…' : 'Loading…'}</p>}>
   {project.id === 'punto' && <div className="demo-punto"><div className="case-phone"><iframe src={project.link} title={es ? 'Punto U en vivo' : 'Punto U live'}/></div><div className="demo-punto-copy"><h2>{es ? 'Pruébala aquí mismo.' : 'Try it right here.'}</h2><p>{es ? 'La app real, en vivo: crea tu perfil y publica una misión.' : 'The real app, live: create your profile and post a mission.'}</p><a className="inline-link" href={project.link} {...external(project.link)}>{es ? 'Abrir en otra pestaña' : 'Open in a new tab'}<ArrowUpRight size={18}/></a></div></div>}
   {project.id === 'club' && <LoyaltyDemo lang={lang}/>}
   {project.id === 'turno' && <ShiftHandover lang={lang}/>}
   {project.id === 'csv' && <><div className="case-demo-head"><h2>{es ? 'Tus datos, en un mapa.' : 'Your data, as a map.'}</h2><p>{es ? 'Sube o arrastra tu CSV. Se analiza en tu navegador y nada sale de tu equipo.' : 'Upload or drag your CSV. It is analyzed in your browser and nothing leaves your device.'}</p></div><DataWorkbench lang={lang}/></>}
   {project.id === 'vibe' && <div className="demo-vibe"><div className="case-demo-head"><h2>{es ? 'Pruébalo aquí mismo.' : 'Try it right here.'}</h2><p>{es ? 'Toca «Un RPG en Godot» o suelta la carpeta de tu proyecto. Todo corre en tu navegador.' : 'Tap “Un RPG en Godot” or drop your own project folder. Everything runs in your browser.'}</p></div><div className="case-browser"><span className="case-browser-bar"><i/><i/><i/><b>vibemap-brunich.vercel.app</b></span><iframe src={project.link} title={es ? 'VibeMap en vivo' : 'VibeMap live'} loading="lazy"/></div><p className="demo-vibe-links"><a className="inline-link" href={project.link} {...external(project.link)}>{es ? 'Abrir en otra pestaña' : 'Open in a new tab'}<ArrowUpRight size={18}/></a><a className="inline-link" href="https://github.com/Brunich/VibeMap" {...external('https://github.com/Brunich/VibeMap')}>{es ? 'Ver el código' : 'View the code'}<ArrowUpRight size={18}/></a></p></div>}
  </Suspense></div></section>
  <nav className="case-next wrap" aria-label={es ? 'Siguiente proyecto' : 'Next project'}><a href={`/proyectos/${next.slug}`}><span>{es ? 'Siguiente proyecto' : 'Next project'}</span><strong>{next.title}</strong><ArrowRight size={26}/></a></nav>
 </main>;
}

function Contact({ lang }: { lang: Lang }) {
 const c = copy[lang], es = lang === 'es';
 return <section id="contact" className="contact-section wrap"><div className="section-heading"><div><span className="kicker">04 · {es ? 'Contacto' : 'Contact'}</span><h2>{es ? 'Hablemos de tu proyecto.' : 'Let’s talk about your project.'}</h2><p>{c.contactText}</p></div></div><div className="contact-links"><a href={`mailto:${personal.email}`}><EnvelopeSimple size={25}/><span>Email<small>{personal.email}</small></span><ArrowUpRight size={22}/></a><a href={personal.github} {...external(personal.github)}><GithubLogo size={25}/><span>GitHub<small>Brunich</small></span><ArrowUpRight size={22}/></a>{personal.linkedIn && <a href={personal.linkedIn} {...external(personal.linkedIn)}><LinkedinLogo size={25}/><span>LinkedIn<small>Bruno Salas</small></span><ArrowUpRight size={22}/></a>}<a href={`https://wa.me/${personal.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><WhatsappLogo size={25}/><span>WhatsApp<small>{personal.phone}</small></span><ArrowUpRight size={22}/></a></div></section>;
}
