import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import ModelLab from './ModelLab';
import { COVER, PLACES, WATER, ShotImg, Caption, rogueText } from './Rogue';
import './original-scenes.css';

// Bloque C de la portada: la portada del juego con tres miniaturas que llevan a su ficha,
// el visor 3D del personaje y el templo de noche con su interruptor de pixel art (lo que no está en la ficha).
const THUMBS = [PLACES[0], PLACES[1], WATER[0]];

export default function OriginalScenes({ lang, paused }: { lang: 'es' | 'en'; paused: boolean }) {
 const es = lang === 'es', t = rogueText(es);
 const [pixel, setPixel] = useState(true);
 return <section id="graphics" className="wrap section-space gamedev" data-zone="Game dev">
  <div className="group-head"><span className="kicker">C · {es ? 'Juego' : 'Game'}</span><p>{es ? 'Mi proyecto personal: un juego que hago por mi cuenta.' : 'My personal project: a game I make on my own.'}</p></div>
  <div className="gd-feature">
   <a className="gd-cover" href="/proyectos/ia-rogue" data-title="IA Rogue" aria-label={es ? 'IA Rogue — ver la ficha' : 'IA Rogue — see the project page'}><figure className="rg-fig"><ShotImg s={COVER} lang={lang} sizes="(min-width: 980px) 780px, 100vw"/><Caption s={COVER} lang={lang}/></figure></a>
   <div className="gd-copy">
    <span className="project-kind">{t.kind}<em>{es ? 'En desarrollo' : 'In development'}</em></span>
    <h3><a href="/proyectos/ia-rogue" data-title="IA Rogue">IA Rogue</a></h3>
    <p className="pitch">{t.pitch}</p>
    <p>{es ? 'Modelado en Blender, shaders, biomas y varias cámaras jugables. El repositorio es privado; la ficha tiene capturas del juego.' : 'Modeling in Blender, shaders, biomes and several playable cameras. The repository is private; the project page has in-game captures.'}</p>
    <div className="gd-thumbs">{THUMBS.map(s => <a key={s.file} href={`/proyectos/ia-rogue#${s === WATER[0] ? 'agua' : 'lugares'}`} data-title="IA Rogue"><figure className="rg-fig"><ShotImg s={s} lang={lang} sizes="200px"/><Caption s={s} lang={lang}/></figure></a>)}</div>
    <a className="inline-link" href="/proyectos/ia-rogue" data-title="IA Rogue">{es ? 'Ver la ficha de IA Rogue' : 'See the IA Rogue page'}<ArrowRight size={18}/></a>
   </div>
  </div>

  <div className="gd-block" data-zone={es ? 'Tres estilos' : 'Three styles'}>
   <div className="original-compare-heading"><h3>{es ? 'Un personaje, tres estilos.' : 'One character, three styles.'}</h3><p>{es ? 'Gíralo, acércate y cambia el tamaño del píxel.' : 'Rotate it, zoom in and change the pixel size.'}</p></div>
   <ModelLab lang={lang} paused={paused}/>
  </div>

  <div className="gd-block" data-zone="Pixel art">
   <div className="original-compare-heading"><h3>{es ? 'La misma toma, con y sin pixel art.' : 'The same shot, with and without pixel art.'}</h3><p>{es ? 'El templo de noche en el mismo instante; el botón cambia sólo el pixelado.' : 'The temple at night at the same instant; the button only switches the pixelation.'}</p></div>
   <figure className="rg-fig gd-pixel">
    <img src={`/media/escenas/templo-noche-${pixel ? 'pixel' : 'suave'}.webp`} width={1600} height={900} loading="lazy" decoding="async" alt={es ? `El templo de noche ${pixel ? 'con' : 'sin'} pixel art` : `The temple at night ${pixel ? 'with' : 'without'} pixel art`}/>
    <button className="pano-pixel" aria-pressed={pixel} onClick={() => setPixel(!pixel)}><span className="pano-switch" aria-hidden="true"/>Pixel art</button>
    <figcaption className="rg-cap"><span>{es ? 'Templo' : 'Temple'}</span><span>{es ? 'cámara 1, de frente' : 'camera 1, front'}</span><span>{es ? 'noche' : 'night'}</span></figcaption>
   </figure>
  </div>
 </section>;
}
