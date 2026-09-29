import type { Lang } from './content';
import './hobbies.css';

// Fuera del código: música y viajes. Los videos no cargan hasta que se reproducen.
const VIDEOS = [
 { src: 'bohemian-rhapsody', w: 848, h: 480, es: ['Bohemian Rhapsody', 'Al piano, en un festival de Thanksgiving en el teatro.'], en: ['Bohemian Rhapsody', 'On piano, at a Thanksgiving festival in the theater.'] },
 { src: 'graduacion', w: 480, h: 864, es: ['Graduación', 'Teoría musical, en la Casa de la Cultura.'], en: ['Graduation', 'Music theory, at the Casa de la Cultura.'] },
 { src: 'improvisacion', w: 480, h: 848, es: ['Improvisación', 'A cuatro manos con un compañero alemán, en un voluntariado.'], en: ['Improvisation', 'Four hands with a German friend, during a volunteer trip.'] },
];
const PHOTOS: [string, number, number][] = [['viaje-rio', 900, 1200], ['viaje-agra', 960, 1200], ['viaje-lago', 903, 1200], ['viaje-otono', 780, 1040], ['viaje-canal', 900, 1200], ['viaje-montana', 768, 1024], ['viaje-puente', 675, 1200], ['viaje-muelle', 900, 1200]];

export default function Hobbies({ lang }: { lang: Lang }) {
 const es = lang === 'es';
 return <section id="hobbies" className="wrap section-space hobbies" data-zone={es ? 'Sobre mí' : 'About me'}>
  <div className="section-heading" data-num="05"><div><span className="kicker">05 · {es ? 'Sobre mí' : 'About me'}</span><h2>{es ? 'Fuera del código.' : 'Away from code.'}</h2><p>{es ? 'Música y viajes.' : 'Music and travel.'}</p></div></div>
  <h3 className="hob-h">{es ? 'Música' : 'Music'}</h3>
  <div className="hob-videos">{VIDEOS.map(v => {
   const [title, text] = es ? v.es : v.en;
   return <figure key={v.src} className={`hob-video${v.h > v.w ? ' tall' : ' wide'}`}>
    <video src={`/media/about/${v.src}.mp4`} poster={`/media/about/${v.src}.jpg`} controls playsInline preload="none" width={v.w} height={v.h} aria-label={title}/>
    <figcaption><strong>{title}</strong><span>{text}</span></figcaption>
   </figure>;
  })}</div>
  <h3 className="hob-h">{es ? 'Viajes' : 'Travel'}</h3>
  <p className="hob-lead">{es ? 'Me gusta tomar fotos, conocer lugares nuevos y aprender de otras culturas.' : 'I like taking photos, visiting new places and learning about other cultures.'}</p>
  <div className="hob-photos" tabIndex={0} role="region" aria-label={es ? 'Fotos de viajes' : 'Travel photos'}>{PHOTOS.map(([src, w, h]) => <img key={src} src={`/media/about/${src}.webp`} width={w} height={h} loading="lazy" alt={es ? 'Foto de un viaje' : 'Travel photo'}/>)}</div>
 </section>;
}
