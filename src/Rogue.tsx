import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import type { Lang } from './content';
import './rogue.css';

// Capturas reales del juego (2560×1440, sin HUD), servidas a 800 y 1600 px sin recortar el 16:9.
// El pie siempre dice lugar / cámara / hora, para que se lea qué se está viendo.
type T = [string, string];
export type Shot = { file: string; place: T; cam: T; hour: T; alt: T };
const DAY: T = ['día', 'day'], LATE: T = ['tarde', 'afternoon'];

export const COVER: Shot = { file: 'templo-tarde-alto', place: ['Templo', 'Temple'], cam: ['cámara alta', 'high camera'], hour: LATE, alt: ['Templo de columnas sobre el agua, con antorchas a lo largo del muelle de piedra, visto desde arriba al atardecer', 'A columned temple on the water, torches along the stone pier, seen from above at sunset'] };
export const PLACES: Shot[] = [
 { file: 'pueblo-dia-calle-r4', place: ['Pueblo', 'Village'], cam: ['a pie de calle', 'street level'], hour: DAY, alt: ['Calle empedrada del pueblo con puestos de fruta, banderines, una fogata y un castillo al fondo', 'Cobbled village street with fruit stalls, bunting, a campfire and a castle in the distance'] },
 { file: 'cementerio-tarde-oeste-bajo', place: ['Cementerio', 'Graveyard'], cam: ['baja, desde el oeste', 'low, from the west'], hour: LATE, alt: ['Iglesia de piedra con techo de teja y el cementerio cercado con reja de hierro', 'Stone church with a tiled roof and the graveyard behind an iron fence'] },
 { file: 'templo-tarde-agua-baja', place: ['Templo', 'Temple'], cam: ['a ras del agua', 'at water level'], hour: LATE, alt: ['El templo desde el nivel del agua, con bloques de piedra caídos y antorchas encendidas', 'The temple from water level, with fallen stone blocks and lit torches'] },
 { file: 'costa-tarde-mirador', place: ['Costa', 'Coast'], cam: ['desde el mirador', 'from the lookout'], hour: LATE, alt: ['Playa con rocas, un barco encallado, una torre de vigía y un portal junto a una casa', 'Beach with rocks, a stranded ship, a watchtower and a portal next to a house'] },
 { file: 'portal-cerca-tarde', place: ['Portal', 'Portal'], cam: ['de cerca', 'close up'], hour: LATE, alt: ['Arco de piedra con un portal de píxeles de colores, antorchas y una cerca de madera', 'Stone arch with a portal of coloured pixels, torches and a wooden fence'] },
];
export const WATER: Shot[] = [
 { file: 'agua-tarde-cascada-horizonte', place: ['Cascada', 'Waterfall'], cam: ['cámara alta', 'high camera'], hour: LATE, alt: ['Muelle de piedra frente al lago, con la cascada azul al fondo y su reflejo en el agua', 'Stone pier facing the lake, with the blue waterfall behind and its reflection on the water'] },
 { file: 'agua-tarde-cascada-epica', place: ['Cascada', 'Waterfall'], cam: ['cámara baja', 'low camera'], hour: LATE, alt: ['El lago y la cascada desde la orilla, con el personaje y una antorcha en primer plano', 'The lake and the waterfall from the shore, with the character and a torch up front'] },
 { file: 'agua-dia-templo-hombro', place: ['Templo', 'Temple'], cam: ['sobre el hombro', 'over the shoulder'], hour: DAY, alt: ['El personaje en el muelle del templo, con el agua clara en primer plano', 'The character on the temple pier, with clear water up front'] },
];

export function ShotImg({ s, lang, sizes, eager }: { s: Shot; lang: Lang; sizes: string; eager?: boolean }) {
 const set = (ext: string) => `/media/rogue/${s.file}-800.${ext} 800w, /media/rogue/${s.file}-1600.${ext} 1600w`;
 return <picture>
  <source type="image/avif" srcSet={set('avif')} sizes={sizes}/>
  <source type="image/webp" srcSet={set('webp')} sizes={sizes}/>
  <img src={`/media/rogue/${s.file}-1600.webp`} width={1600} height={900} alt={s.alt[lang === 'es' ? 0 : 1]} loading={eager ? undefined : 'lazy'} decoding="async"/>
 </picture>;
}
export function Caption({ s, lang }: { s: Shot; lang: Lang }) {
 const L = lang === 'es' ? 0 : 1;
 return <figcaption className="rg-cap"><span>{s.place[L]}</span><span>{s.cam[L]}</span><span>{s.hour[L]}</span></figcaption>;
}

export const rogueText = (es: boolean) => ({
 kind: es ? 'Juego · Godot 4' : 'Game · Godot 4',
 pitch: es ? 'Un roguelike 3D donde una IA busca su libertad.' : 'A 3D roguelike where an AI looks for its freedom.',
 desc: es ? 'Lo hago en Godot 4: el modelado en Blender, los shaders y los biomas, con varias cámaras jugables. Sigue en desarrollo y el repositorio es privado, así que aquí van capturas del juego tal cual, sin HUD ni retoque.' : 'I am making it in Godot 4: modeling in Blender, the shaders and the biomes, with several playable cameras. It is still in development and the repository is private, so these are in-game captures as they are, with no HUD or retouching.',
 facts: es ? ['Godot 4 · GDScript · Blender', 'Capturas del juego, sin HUD', 'En desarrollo · repositorio privado'] : ['Godot 4 · GDScript · Blender', 'In-game captures, no HUD', 'In development · private repository'],
});

export function RoguePage({ lang, next }: { lang: Lang; next: { slug: string; title: string; id: string } }) {
 const es = lang === 'es', t = rogueText(es);
 useEffect(() => { const d = location.hash && document.getElementById(location.hash.slice(1)); if (d) d.scrollIntoView(); else scrollTo(0, 0); }, []);
 // La rejilla va a dos columnas en escritorio: cada foto pide la mitad del ancho útil.
 const half = '(min-width: 760px) 610px, 100vw', third = '(min-width: 760px) 410px, 100vw';
 return <main id="main" className="case case-rogue" aria-label="IA Rogue">
  <div className="wrap">
   <a className="case-back" href="/#graphics" data-title={es ? 'Proyectos' : 'Projects'}><ArrowLeft size={18}/>{es ? 'Todos los proyectos' : 'All projects'}</a>
   <header className="rg-head" data-zone="IA Rogue">
    <div><span className="project-kind">{t.kind}<em>{es ? 'En desarrollo' : 'In development'}</em></span><h1>IA Rogue</h1></div>
    <div><p className="pitch">{t.pitch}</p><p>{t.desc}</p><p className="facts">{t.facts.map(f => <span key={f}>{f}</span>)}</p></div>
   </header>
   <figure className="rg-cover rg-fig"><ShotImg s={COVER} lang={lang} sizes="(min-width: 1360px) 1240px, 100vw" eager/><Caption s={COVER} lang={lang}/></figure>
   <section id="lugares" className="rg-section" aria-labelledby="rg-lugares">
    <div className="rg-section-head"><h2 id="rg-lugares">{es ? 'Lugares' : 'Places'}</h2><p>{es ? 'Pueblo, cementerio, templo, costa y portal: zonas del mismo mundo.' : 'Village, graveyard, temple, coast and portal: areas of the same world.'}</p></div>
    <div className="rg-grid">{PLACES.map(s => <figure key={s.file} className="rg-fig"><ShotImg s={s} lang={lang} sizes={half}/><Caption s={s} lang={lang}/></figure>)}</div>
   </section>
   <section id="agua" className="rg-section" aria-labelledby="rg-agua">
    <div className="rg-section-head"><h2 id="rg-agua">{es ? 'La misma agua, tres cámaras' : 'The same water, three cameras'}</h2><p>{es ? 'La cascada y el templo comparten lago. Son tres de las cámaras del juego sobre esa misma agua.' : 'The waterfall and the temple share a lake. These are three of the game’s cameras on that same water.'}</p></div>
    <div className="rg-grid rg-three">{WATER.map(s => <figure key={s.file} className="rg-fig"><ShotImg s={s} lang={lang} sizes={third}/><Caption s={s} lang={lang}/></figure>)}</div>
   </section>
   <p className="rg-more"><a className="inline-link" href="/#graphics" data-title="Game dev">{es ? 'El personaje en tres estilos, en la portada' : 'The character in three styles, on the home page'}<ArrowRight size={18}/></a></p>
  </div>
  <nav data-c data-zone={es ? 'Siguiente' : 'Next'} className={`case-next wrap project-${next.id}`} aria-label={es ? 'Siguiente proyecto' : 'Next project'}><a href={`/proyectos/${next.slug}`} data-title={next.title}><span>{es ? 'Siguiente proyecto' : 'Next project'}</span><strong>{next.title}</strong><ArrowRight size={26}/></a></nav>
 </main>;
}
