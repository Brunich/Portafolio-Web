import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, GithubLogo, AndroidLogo, DesktopTower } from '@phosphor-icons/react';
import type { Lang } from './content';
import { personal } from './personal';
import './project-site.css';

export type SiteProject = { id: string; slug: string; title: string; kind: string; status: string; pitch: string; desc: string; tags: string[]; metrics: [string, string][]; how: string[][]; link: string; action: string };
export type Native = { es: string; en: string; href?: string; android?: boolean };

const out = (url: string) => url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};
const done = (status: string) => /^(Funcional|Working|Publicad[oa]|Published)$/.test(status);

// Barra propia de cada proyecto: no la del portafolio, para que se sienta su propio sitio.
function Bar({ lang, setLang, project, right }: { lang: Lang; setLang: (l: Lang) => void; project: SiteProject; right: ReactNode }) {
 const es = lang === 'es';
 return <header className="ps-bar"><div className="ps-wrap ps-bar-in">
  <a className="ps-back" href="/#projects" data-title="Bruno Salas"><ArrowLeft size={16}/><span>Bruno Salas</span></a>
  <span className="ps-mark">{project.title}</span>
  <div className="ps-tools">
   <div className="ps-lang" aria-label={es ? 'Idioma' : 'Language'}>{(['es', 'en'] as const).map(l => <button key={l} aria-pressed={lang === l} aria-label={l === 'es' ? 'Cambiar a español' : 'Switch to English'} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
   {right}
  </div>
 </div></header>;
}

// La presentación: qué es, cómo funciona y con qué está hecho. La app vive en su propia pantalla.
export function ProjectSite({ lang, setLang, project, next, visual, appHref, native, repo, extra }: {
 lang: Lang; setLang: (l: Lang) => void; project: SiteProject; next: SiteProject; visual: ReactNode; appHref: string; native?: Native; repo?: string; extra?: ReactNode;
}) {
 const es = lang === 'es';
 useEffect(() => { scrollTo(0, 0); }, [project.id]);
 const open = <a className="ps-btn" href={appHref} data-title={project.title} {...out(appHref)}>{project.action}{appHref.startsWith('http') ? <ArrowUpRight size={18}/> : <ArrowRight size={18}/>}</a>;
 return <div className={`ps ps-${project.id}`} data-c>
  <Bar lang={lang} setLang={setLang} project={project} right={<a className="ps-bar-cta" href={appHref} data-title={project.title} {...out(appHref)}>{es ? 'Abrir' : 'Open'}<ArrowUpRight size={15}/></a>}/>
  <main id="main" className="ps-main">
   <section className="ps-wrap ps-hero">
    <div className="ps-copy">
     <span className="ps-kind">{project.kind}{!done(project.status) && <em>{project.status}</em>}</span>
     <h1>{project.title}</h1>
     <p className="ps-pitch">{project.pitch}</p>
     <p className="ps-desc">{project.desc}</p>
     <div className="ps-actions">{open}
      {repo && <a className="ps-link" href={`https://github.com/Brunich/${repo}`} {...out('https://')}><GithubLogo size={19}/>{es ? 'Código' : 'Code'}</a>}
     </div>
     {native && (native.href
      ? <a className="ps-native" href={native.href} {...out(native.href)}>{native.android ? <AndroidLogo size={20}/> : <DesktopTower size={20}/>}<strong>{es ? native.es : native.en}</strong><span>{es ? 'Descargar' : 'Download'}<ArrowUpRight size={14}/></span></a>
      : <p className="ps-native is-dev"><AndroidLogo size={20}/><strong>{es ? native.es : native.en}</strong><span>{es ? 'En desarrollo' : 'In development'}</span></p>)}
    </div>
    <div className={`ps-visual case-visual media-${project.id}`} aria-hidden="true">{visual}</div>
   </section>
   {project.metrics.length > 0 && <section className="ps-wrap ps-metrics" aria-label={es ? 'En números' : 'In numbers'}><dl>{project.metrics.map(([v, label]) => <div key={v + label}><dt>{v}</dt><dd>{label}</dd></div>)}</dl></section>}
   <section className="ps-wrap ps-how" aria-labelledby="ps-how"><h2 id="ps-how">{es ? 'Cómo funciona' : 'How it works'}</h2>
    <ol>{project.how.map(([title, text], i) => <li key={title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
   </section>
   {extra}
   <section className="ps-wrap ps-stack" aria-labelledby="ps-stack"><h2 id="ps-stack">{es ? 'Hecho con' : 'Built with'}</h2><ul>{project.tags.map(t => <li key={t}>{t}</li>)}</ul></section>
   <section className="ps-wrap ps-end">
    <div><h2>{es ? '¿Algo así para tu negocio?' : 'Something like this for your business?'}</h2><p>{es ? 'Lo adapto a tus datos y te lo dejo funcionando.' : 'I adapt it to your data and leave it running.'}</p></div>
    <div className="ps-end-actions">{open}<a className="ps-link" href={`mailto:${personal.email}?subject=${encodeURIComponent(project.title)}`}>{es ? 'Escríbeme' : 'Write to me'}<ArrowUpRight size={17}/></a></div>
   </section>
  </main>
  <footer className="ps-foot"><div className="ps-wrap ps-foot-in">
   <a className="ps-next" href={`/proyectos/${next.slug}`} data-title={next.title}><span>{es ? 'Siguiente proyecto' : 'Next project'}</span><strong>{next.title}</strong><ArrowRight size={22}/></a>
   <small>© {new Date().getFullYear()} Bruno Salas Rodríguez · <a href="/" data-title="Bruno Salas">{es ? 'Portafolio' : 'Portfolio'}</a></small>
  </div></footer>
 </div>;
}

// La app a pantalla completa, sin la presentación encima.
export function ProjectApp({ lang, setLang, project, children }: { lang: Lang; setLang: (l: Lang) => void; project: SiteProject; children: ReactNode }) {
 const es = lang === 'es';
 useEffect(() => { scrollTo(0, 0); }, [project.id]);
 return <div className={`ps ps-${project.id} pa`} data-c>
  <Bar lang={lang} setLang={setLang} project={project} right={<a className="ps-bar-cta is-quiet" href={`/proyectos/${project.slug}`} data-title={project.title}><ArrowLeft size={15}/>{es ? 'Presentación' : 'Overview'}</a>}/>
  <main id="main" className="pa-main" aria-label={`${project.title} — app`}>
   <div className="ps-wrap pa-note"><h1>{project.title}</h1><span>{es ? 'Demo con datos de ejemplo' : 'Demo with sample data'}</span></div>
   <section id="demo" className="case-demo pa-stage"><div className="wrap">{children}</div></section>
  </main>
 </div>;
}
