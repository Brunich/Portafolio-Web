import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import ModelLab from './ModelLab';
import { COVER, PLACES, WATER, ShotImg, Caption, rogueText } from './Rogue';
import './original-scenes.css';

// El juego en la portada, en tres paradas: la portada con tres miniaturas que llevan a su ficha,
// el visor 3D del personaje y el templo de noche con su interruptor de pixel art (lo que no está en la ficha).
const THUMBS = [PLACES[0], PLACES[1], WATER[0]];

export default function OriginalScenes({ lang, paused }: { lang: 'es' | 'en'; paused: boolean }) {
 const es = lang === 'es', t = rogueText(es);
 const [pixel, setPixel] = useState(true);
 return <section id="graphics" className="wrap gamedev">
  <div className="gd-stop" data-zone="Game dev">
   <div className="gd-feature">
    <a className="gd-cover" href="/proyectos/ia-rogue" data-title="IA Rogue" aria-label={es ? 'IA Rogue — ver la ficha' : 'IA Rogue — see the project page'}><figure className="rg-fig"><ShotImg s={COVER} lang={lang} sizes="(min-width: 980px) 780px, 100vw"/><Caption s={COVER} lang={lang}/></figure></a>
    <div className="gd-copy">
     <p className="row-meta"><span>{t.kind}</span><em>{es ? 'En desarrollo' : 'In development'}</em></p>
     <h3><a href="/proyectos/ia-rogue" data-title="IA Rogue">IA Rogue</a></h3>
     <p className="pitch">{t.pitch}</p>
     <p className="lead">{es ? 'Lo hago en Godot 4: modelado en Blender, shaders y biomas. Sigue en desarrollo; aquí van capturas del juego tal cual.' : 'I am making it in Godot 4: modeling in Blender, shaders and biomes. Still in development; these are in-game captures as they are.'}</p>
     <div className="gd-thumbs">{THUMBS.map(s => <a key={s.file} href={`/proyectos/ia-rogue#${s === WATER[0] ? 'agua' : 'lugares'}`} data-title="IA Rogue"><figure className="rg-fig"><ShotImg s={s} lang={lang} sizes="200px"/><Caption s={s} lang={lang}/></figure></a>)}</div>
     <a className="inline-link" href="/proyectos/ia-rogue" data-title="IA Rogue">{es ? 'Ver la ficha de IA Rogue' : 'See the IA Rogue page'}<ArrowRight size={18}/></a>
    </div>
   </div>
  </div>

  {/* Las dos paradas siguientes van con el título a la izquierda: así la pieza cabe entera en la pantalla */}
  <div className="gd-block" data-zone={es ? 'Tres estilos' : 'Three styles'}>
   <div className="gd-side"><h3>{es ? 'Un personaje, tres estilos.' : 'One character, three styles.'}</h3><p>{es ? 'Gíralo, acércate y cambia el tamaño del píxel.' : 'Rotate it, zoom in and change the pixel size.'}</p></div>
   <ModelLab lang={lang} paused={paused}/>
  </div>

  <div className="gd-block" data-zone="Pixel art">
   <div className="gd-side"><h3>{es ? 'La misma toma, con y sin pixel art.' : 'The same shot, with and without pixel art.'}</h3><p>{es ? 'El templo de noche en el mismo instante; el botón cambia sólo el pixelado.' : 'The temple at night at the same instant; the button only switches the pixelation.'}</p></div>
   <figure className="rg-fig gd-pixel">
    <img src={`/media/escenas/templo-noche-${pixel ? 'pixel' : 'suave'}.webp`} width={1600} height={900} loading="lazy" decoding="async" alt={es ? `El templo de noche ${pixel ? 'con' : 'sin'} pixel art` : `The temple at night ${pixel ? 'with' : 'without'} pixel art`}/>
    <button className="pano-pixel" aria-pressed={pixel} onClick={() => setPixel(!pixel)}><span className="pano-switch" aria-hidden="true"/>Pixel art</button>
    <figcaption className="rg-cap"><span>{es ? 'Templo' : 'Temple'}</span><span>{es ? 'cámara 1, de frente' : 'camera 1, front'}</span><span>{es ? 'noche' : 'night'}</span></figcaption>
   </figure>
  </div>
 </section>;
}
