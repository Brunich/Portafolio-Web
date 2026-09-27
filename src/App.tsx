import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight, DownloadSimple, GithubLogo, EnvelopeSimple, LinkedinLogo, WhatsappLogo, Pause, Play } from '@phosphor-icons/react';
import { copy, certificates } from './content';
import type { Lang } from './content';
import { professional } from './professional-content';
import { personal } from './personal';
import OriginalScenes from './OriginalScenes';
import CodeRiver from './CodeRiver';
import DataWorkbench from './DataWorkbench';
import ImpactExplorer from './ImpactExplorer';
import VibeSketch from './VibeSketch';
import LoyaltyDemo, { ClubPreview } from './LoyaltyDemo';
import HeroShowcase from './HeroShowcase';
import './pages.css';

const PROJECT_ORDER = ['punto', 'club', 'csv', 'vibe'];
type Project = ReturnType<typeof professional>['projects'][number];
const external = (url: string) => url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};

// Rutas: la portada resume; cada proyecto y las propuestas tienen su propia página.
function route() {
 const path = location.pathname.replace(/\/+$/, '');
 const m = /^\/proyectos\/([a-z0-9-]+)$/.exec(path);
 if (m) return { page: 'project' as const, slug: m[1] };
 if (path === '/propuestas') return { page: 'proposals' as const };
 return { page: 'home' as const };
}

export default function App() {
 const [lang, setLang] = useState<Lang>(() => { try { return localStorage.getItem('bruno-language') === 'en' ? 'en' : 'es'; } catch { return 'es'; } });
 const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
 const es = lang === 'es', p = professional(lang), r = route();
 const projects = [...p.projects].sort((a, b) => PROJECT_ORDER.indexOf(a.id) - PROJECT_ORDER.indexOf(b.id));
 const project = r.page === 'project' ? projects.find(x => x.slug === r.slug) : undefined;
 const home = r.page === 'home' || (r.page === 'project' && !project);
 useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('bruno-language', lang); } catch { /* Preferencia opcional. */ } }, [lang]);
 useEffect(() => { document.documentElement.dataset.motion = paused ? 'paused' : 'active'; }, [paused]);
 useEffect(() => { const pref = matchMedia('(prefers-reduced-motion: reduce)'); const change = () => setPaused(pref.matches); pref.addEventListener('change', change); return () => pref.removeEventListener('change', change); }, []);
 useEffect(() => {
  document.title = project ? `${project.title} — Bruno Salas` : r.page === 'proposals' ? (es ? 'Propuestas — Bruno Salas' : 'Proposals — Bruno Salas') : (es ? 'Bruno Salas — Web, datos y automatización' : 'Bruno Salas — Web, data & automation');
 }, [project, r.page, es]);

 return <>
  <a className="skip-link" href="#main">{copy[lang].skip}</a>
  <header className="site-header wrap"><a className="identity" href="/">{personal.portrait && <img src={personal.portrait} alt="Bruno Salas" width="72" height="72"/>}<span><strong>Bruno Salas</strong><small>{p.role}</small></span></a><div className="header-right"><div className="language-control" aria-label={es ? 'Idioma' : 'Language'}>{(['es', 'en'] as const).map(l => <button key={l} aria-label={l === 'es' ? 'Cambiar a español' : 'Switch to English'} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div><a className="header-contact inline-link" href={home ? '#contact' : '/#contact'}>{copy[lang].contact}<ArrowUpRight size={19}/></a></div></header>
  {home ? <Home lang={lang} paused={paused} setPaused={setPaused} projects={projects}/>
   : project ? <ProjectPage lang={lang} project={project} projects={projects}/>
   : <Proposals lang={lang} paused={paused}/>}
  <footer className="site-footer wrap">© {new Date().getFullYear()} Bruno Salas Rodríguez <span>{copy[lang].location}</span></footer>
 </>;
}

function Home({ lang, paused, setPaused, projects }: { lang: Lang; paused: boolean; setPaused: (v: boolean) => void; projects: Project[] }) {
 const c = copy[lang], p = professional(lang), es = lang === 'es';
 const [active, setActive] = useState('home');
 useEffect(() => { const observer = new IntersectionObserver(entries => { for (const e of entries) if (e.isIntersecting) setActive(e.target.id); }, { rootMargin: '-10% 0px -65% 0px' }); document.querySelectorAll('main > section[id]').forEach(el => observer.observe(el)); return () => observer.disconnect(); }, []);
 return <>
  <main id="main">
   <section id="home" className="hero wrap"><div className="hero-copy"><h1>{p.title}<span>{p.accent}</span></h1><p>{p.intro}</p><div className="hero-actions"><a className="button primary" href="#projects">{c.view}<ArrowDown size={19}/></a><a className="button secondary" href="/cv/Bruno-Salas-EN.pdf" download>{es ? 'CV en inglés' : 'Download CV'}<DownloadSimple size={19}/></a></div><p className="hero-facts">{es ? 'Monterrey, N. L. · UANL 2023–2028 · Español, inglés y portugués' : 'Monterrey, Mexico · UANL 2023–2028 · Spanish, English & Portuguese'}</p></div><div className="hero-workbench"><HeroShowcase lang={lang} paused={paused}/></div></section>
   <CodeRiver lang={lang} paused={paused}/>
   <section id="projects" className="wrap section-space"><div className="section-heading"><div><h2>{p.projectsTitle}</h2><p>{p.projectsIntro}</p></div><a className="inline-link" href={personal.github} {...external(personal.github)}>GitHub<GithubLogo size={21}/></a></div>
    <div className="project-grid">{projects.map((project, i) => <ProjectCard key={project.id} lang={lang} project={project} featured={i < 2}/>)}</div>
    <a className="proposals-strip" href="/propuestas"><div><span className="proposals-kicker">{es ? 'Ideas en diseño' : 'Ideas in design'}</span><strong>{es ? 'Propuestas de automatización' : 'Automation proposals'}</strong><p>{es ? '¿Qué se rompe si toco este archivo? Un mapa interactivo de impacto de cambios y un flujo de continuidad de calidad entre turnos. Están diseñadas, todavía no construidas.' : 'What breaks if I touch this file? An interactive change-impact map and a quality handover flow between shifts. Designed, not built yet.'}</p></div><ArrowRight size={26}/></a>
   </section>
   <section id="skills" className="wrap section-space"><div className="skills"><h2>{p.techTitle}</h2><div className="skills-grid">{p.skills.map(s => <div key={s.name}><h3>{s.name}</h3><p>{s.desc}</p><div className="tags">{s.tools.map(tool => <span key={tool}>{tool}</span>)}</div></div>)}</div><section className="language-section"><h3>{es ? 'Idiomas' : 'Languages'}</h3><p>{c.languages}</p></section></div></section>
   <section id="about" className="about-section section-space"><div className="wrap"><div className="about-intro"><div><h2>{p.aboutTitle}</h2><p>{p.about}</p><p>{p.about2}</p><a className="inline-link" href="/cv/Bruno-Salas-EN.pdf" download>{es ? 'CV en inglés' : 'Download CV'}<DownloadSimple size={20}/></a></div><dl className="profile-points">{p.profilePoints.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div><div className="experience-grid"><div><h3>{c.timelineTitle}</h3>{c.experience.map(e => <div className="experience-row" key={e.year}><span className="year">{e.year}</span><div><h4>{e.role}</h4><span className="org">{e.org}</span><p>{e.text}</p></div></div>)}</div><div><h3>{c.learning}</h3>{certificates.map(cert => <a className="certificate" key={cert.title} href={cert.url} {...external(cert.url)}><div><h4>{cert.title}</h4><p>{cert.org}</p><span>{cert.year}</span></div><ArrowUpRight size={22}/></a>)}</div></div></div></section>
   <OriginalScenes lang={lang} paused={paused}/>
   <Contact lang={lang}/>
  </main>
  <nav className="floating-nav" aria-label={es ? 'Navegación principal' : 'Main navigation'}>{[['projects', es ? 'Proyectos' : 'Projects'], ['skills', es ? 'Herramientas' : 'Tools'], ['about', es ? 'Perfil' : 'Profile'], ['graphics', 'Game dev']].map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined}>{label}</a>)}<button className="motion-button" aria-label={paused ? c.play : c.pause} onClick={() => setPaused(!paused)}>{paused ? <Play size={18} weight="fill"/> : <Pause size={18} weight="fill"/>}</button><a className="nav-contact" href="#contact">{c.contact}</a></nav>
 </>;
}

function ProjectCard({ lang, project, featured }: { lang: Lang; project: Project; featured: boolean }) {
 const es = lang === 'es', page = `/proyectos/${project.slug}`;
 return <article className={`project ${featured ? 'project-featured' : ''} project-${project.id}`}>
  <a className={`project-media media-${project.id}`} href={page} aria-label={`${project.title} — ${es ? 'ver proyecto' : 'view project'}`}>
   {project.media === 'vibemap' ? <VibeSketch lang={lang}/> : project.media === 'club' ? <ClubPreview lang={lang}/> : <img src={`/media/${project.media}.webp`} alt="" loading="lazy"/>}
   <span className="media-open"><ArrowUpRight size={24}/></span>
  </a>
  <div className="project-info"><span className="project-kind">{project.kind}</span><h3><a href={page}>{project.title}</a></h3><p>{project.desc}</p>
   {project.metrics.length > 0 && <dl className="project-metrics">{project.metrics.map(([value, label]) => <div key={value + label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>}
   <div className="tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>
   <div className="project-links"><a className="button primary" href={page}>{es ? 'Ver proyecto' : 'View project'}<ArrowRight size={18}/></a>{project.link.startsWith('http') && <a className="inline-link" href={project.link} {...external(project.link)}>{project.action}<ArrowUpRight size={18}/></a>}</div>
  </div>
 </article>;
}

function ProjectPage({ lang, project, projects }: { lang: Lang; project: Project; projects: Project[] }) {
 const c = copy[lang], es = lang === 'es';
 const next = projects[(projects.indexOf(project) + 1) % projects.length];
 useEffect(() => { scrollTo(0, 0); }, [project.id]);
 return <main id="main" className={`case case-${project.id}`}>
  <div className="wrap">
   <a className="case-back" href="/#projects"><ArrowLeft size={18}/>{es ? 'Todos los proyectos' : 'All projects'}</a>
   <header className="case-head">
    <div><span className="project-kind">{project.kind} · {project.status}</span><h1>{project.title}</h1><p>{project.desc}</p>
     <div className="tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>
     {project.link.startsWith('http') && <a className="button primary case-action" href={project.link} {...external(project.link)}>{project.action}<ArrowUpRight size={18}/></a>}
    </div>
    {project.metrics.length > 0 && <dl className="project-metrics case-metrics">{project.metrics.map(([value, label]) => <div key={value + label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>}
   </header>
  </div>
  <section className="case-demo" aria-label={es ? 'Demostración' : 'Demo'}><div className="wrap">
   {project.id === 'punto' && <div className="demo-punto"><div className="case-phone"><iframe src={project.link} title={es ? 'Punto U en vivo' : 'Punto U live'}/></div><div className="demo-punto-copy"><h2>{es ? 'Pruébala aquí mismo.' : 'Try it right here.'}</h2><p>{es ? 'Es la aplicación real, en vivo. Funciona en modo demostración: los perfiles y favores que crees se guardan sólo en tu navegador.' : 'This is the real app, live. It runs in demo mode: profiles and favors you create are stored only in your browser.'}</p><a className="inline-link" href={project.link} {...external(project.link)}>{es ? 'Abrir en otra pestaña' : 'Open in a new tab'}<ArrowUpRight size={18}/></a></div></div>}
   {project.id === 'club' && <LoyaltyDemo lang={lang}/>}
   {project.id === 'csv' && <><div className="case-demo-head"><h2>{es ? 'Tus datos, en un mapa.' : 'Your data, as a map.'}</h2><p>{es ? 'Arranca con un ejemplo con el formato de un reporte real de planta. Sube el tuyo o arrástralo: se analiza en tu navegador, encuentra lo que está mal y dibuja cómo está organizado. Nada sale de tu equipo.' : 'It starts with a sample shaped like a real plant report. Upload or drag yours: it is analyzed in your browser, finds what is wrong and draws how it is organized. Nothing leaves your device.'}</p></div><DataWorkbench lang={lang}/></>}
   {project.id === 'vibe' && <div className="demo-vibe"><VibeSketch lang={lang}/><p>{es ? 'Así se ve la salida de VibeMap aplicada al código de este mismo sitio: cada flecha es una función real, numerada, y la explicación usa los mismos números.' : 'This is VibeMap’s output applied to this very site’s code: every arrow is a real, numbered function, and the explanation uses the same numbers.'}</p></div>}
  </div></section>
  <section className="case-story wrap" aria-label={es ? 'Cómo está construido' : 'How it is built'}>
   {[[c.challenge, project.challenge], [c.contribution, project.work], [c.result, project.result]].map(([title, text]) => <div key={title}><h2>{title}</h2><p>{text}</p></div>)}
  </section>
  <nav className="case-next wrap" aria-label={es ? 'Siguiente proyecto' : 'Next project'}><a href={`/proyectos/${next.slug}`}><span>{es ? 'Siguiente proyecto' : 'Next project'}</span><strong>{next.title}</strong><ArrowRight size={26}/></a></nav>
 </main>;
}

function Proposals({ lang, paused }: { lang: Lang; paused: boolean }) {
 const p = professional(lang), es = lang === 'es';
 const [automation, setAutomation] = useState(0);
 const [step, setStep] = useState(0);
 const a = p.automations[automation];
 useEffect(() => { scrollTo(0, 0); }, []);
 const explanations = automation === 0
  ? (es ? ['Se parte de los archivos elegidos o de un diff de Git, acotado a la tarea.', 'Se conectan las importaciones y referencias detectables en React/TypeScript, cada una con evidencia verificable.', 'Al elegir un archivo se explica su responsabilidad, su relación con el cambio y qué código revisar.', 'Sale una lista enfocada de archivos y pruebas relacionadas, con referencias, para apoyar el criterio del desarrollador.'] : ['Start from selected files or a Git diff, scoped to the task at hand.', 'Connect detectable imports and references in React/TypeScript, each with verifiable evidence.', 'Selecting a file explains its responsibility, relationship to the change and code to inspect.', 'Produce a focused review list of files and related tests with references, supporting developer judgment.'])
  : (es ? ['Incidencia: un defecto observado. Lote: el grupo de piezas afectado. Línea: dónde se produjo. Se reutilizarán identificadores existentes.', 'Cada incidencia tendrá una acción, un responsable y una fecha; el relevo de turno verá qué sigue abierto.', 'La evidencia se vinculará a la acción y una persona autorizada verificará el cierre.', 'El valor será unir registros dispersos con acciones pendientes, recurrencias y entrega de turno; se integrará al sistema existente cuando sea viable.'] : ['Incident: an observed defect. Batch: affected parts. Line: production location. Existing identifiers will be reused.', 'Assign action, owner and deadline; shift handover shows open work.', 'Link evidence to actions and require an authorized closure review.', 'Connect scattered records to open actions, recurring defects and shift handover; integrate with existing systems where feasible.']);
 return <main id="main" className="case">
  <div className="wrap"><a className="case-back" href="/#projects"><ArrowLeft size={18}/>{es ? 'Volver al inicio' : 'Back home'}</a>
   <header className="case-head"><div><span className="project-kind">{es ? 'Ideas en diseño · aún no construidas' : 'Ideas in design · not built yet'}</span><h1>{p.automationTitle}</h1><p>{p.automationIntro}</p></div></header>
  </div>
  <section id="automation" className="wrap case-demo-plain"><div className="automation-layout"><div className="automation-options" aria-label={es ? 'Propuestas de automatización' : 'Automation proposals'}>{p.automations.map((item, i) => <button key={item.title} aria-pressed={i === automation} onClick={() => { setAutomation(i); setStep(0); }}>{item.title}<ArrowUpRight size={21}/></button>)}</div><div className="automation-detail" aria-live="polite"><span className="proposal-status">{es ? 'Diseño del flujo' : 'Workflow design'}</span><h3>{a.title}</h3><p>{a.who}</p><div className="workflow-map" aria-label={es ? 'Pasos del proceso' : 'Process steps'}>{a.steps.map((label, i) => <button key={label} aria-pressed={step === i} onClick={() => setStep(i)}><span>0{i + 1}</span>{label}</button>)}</div><p className="step-explanation">{explanations[step]}</p><h4>{es ? 'Resultado del recorrido' : 'Workflow output'}</h4><p>{a.deliverable}</p><p className="automation-stack">{a.stack}</p><p className="automation-boundary">{a.boundary}</p></div></div>{automation === 0 && <ImpactExplorer lang={lang} paused={paused}/>}</section>
 </main>;
}

function Contact({ lang }: { lang: Lang }) {
 const c = copy[lang], es = lang === 'es';
 return <section id="contact" className="contact-section wrap"><div className="section-heading"><div><h2>{es ? 'Hablemos de tu proyecto.' : 'Let’s talk about your project.'}</h2><p>{c.contactText}</p></div></div><div className="contact-links"><a href={`mailto:${personal.email}`}><EnvelopeSimple size={25}/><span>Email<small>{personal.email}</small></span><ArrowUpRight size={22}/></a><a href={personal.github} {...external(personal.github)}><GithubLogo size={25}/><span>GitHub<small>Brunich</small></span><ArrowUpRight size={22}/></a>{personal.linkedIn && <a href={personal.linkedIn} {...external(personal.linkedIn)}><LinkedinLogo size={25}/><span>LinkedIn<small>Bruno Salas</small></span><ArrowUpRight size={22}/></a>}<a href={`https://wa.me/${personal.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><WhatsappLogo size={25}/><span>WhatsApp<small>{personal.phone}</small></span><ArrowUpRight size={22}/></a></div></section>;
}
