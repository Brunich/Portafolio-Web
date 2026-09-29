import { ArrowLeft } from '@phosphor-icons/react';
import type { Lang } from './content';
import './hobbies.css';

// Fuera del código: música y viajes. Los videos no cargan hasta que se reproducen.
const VIDEOS = [
 { src: 'bohemian-rhapsody', w: 848, h: 480, es: ['Bohemian Rhapsody', 'Al piano, en un festival de Thanksgiving en el teatro.'], en: ['Bohemian Rhapsody', 'On piano, at a Thanksgiving festival in the theater.'] },
 { src: 'improvisacion', w: 480, h: 848, es: ['Improvisación', 'A cuatro manos con un compañero alemán, en un voluntariado.'], en: ['Improvisation', 'Four hands with a German friend, during a volunteer trip.'] },
 { src: 'bar', w: 480, h: 864, es: ['En el bar', 'Tocando en el bar donde trabajaba de barman.'], en: ['At the bar', 'Playing at the bar where I worked as a bartender.'] },
 { src: 'graduacion', w: 400, h: 220, es: ['Graduación', 'Teoría musical, en la Casa de la Cultura.'], en: ['Graduation', 'Music theory, at the Casa de la Cultura.'] },
];
// Orden pensado para que no queden juntas dos fotos con la misma pose.
const PHOTOS: [string, number, number][] = [['viaje-muelle', 900, 1200], ['viaje-montana', 768, 1024], ['viaje-puente', 675, 1200], ['viaje-otono', 780, 1040], ['viaje-canal', 900, 1200], ['viaje-lago', 903, 1200], ['viaje-agra', 960, 1200], ['viaje-surf', 960, 1200], ['viaje-rio', 900, 1200]];

export default function Hobbies({ lang }: { lang: Lang }) {
 const es = lang === 'es';
 return <main id="main" className="wrap hobbies" aria-label={es ? 'Sobre mí' : 'About me'}>
  <a className="case-back" href="/#contact" data-title="Bruno Salas"><ArrowLeft size={18}/>{es ? 'Volver al portafolio' : 'Back to the portfolio'}</a>
  <header className="hob-head" data-zone={es ? 'Sobre mí' : 'About me'}><span className="kicker">{es ? 'Sobre mí' : 'About me'}</span><h1>{es ? 'Fuera del código.' : 'Away from code.'}</h1><p>{es ? 'Música y viajes.' : 'Music and travel.'}</p></header>
  <h2 className="hob-h" data-zone={es ? 'Música' : 'Music'}>{es ? 'Música' : 'Music'}</h2>
  <div className="hob-videos">{VIDEOS.map(v => {
   const [title, text] = es ? v.es : v.en;
   return <figure key={v.src} className={`hob-video v-${v.src}${v.h > v.w ? ' tall' : ' wide'}`}>
    <video src={`/media/about/${v.src}.mp4`} poster={`/media/about/${v.src}.jpg`} controls playsInline preload="none" width={v.w} height={v.h} aria-label={title}/>
    <figcaption><strong>{title}</strong><span>{text}</span></figcaption>
   </figure>;
  })}</div>
  <h2 className="hob-h" data-zone={es ? 'Viajes' : 'Travel'}>{es ? 'Viajes' : 'Travel'}</h2>
  <p className="hob-lead">{es ? 'Me gusta tomar fotos, conocer lugares nuevos y aprender de otras culturas.' : 'I like taking photos, visiting new places and learning about other cultures.'}</p>
  <div className="hob-photos" tabIndex={0} role="region" aria-label={es ? 'Fotos de viajes' : 'Travel photos'}>{PHOTOS.map(([src, w, h]) => <img key={src} src={`/media/about/${src}.webp`} width={w} height={h} loading="lazy" alt={es ? 'Foto de un viaje' : 'Travel photo'}/>)}</div>
 </main>;
}
