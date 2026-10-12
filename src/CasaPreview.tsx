import './casa-preview.css';

// Portada de La Casa del Ángel: la página real en computadora y en celular, recorriéndose sola.
export default function CasaPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="cap">
  <div className="cap-web"><span className="cap-dots" aria-hidden="true"><i/><i/><i/><b>la-casa-del-angel.vercel.app</b></span><img src="/media/casa-angel-web-recorrido.webp" width="1000" height="3264" alt={es ? 'Página de La Casa del Ángel en computadora' : 'La Casa del Ángel website on desktop'} loading="lazy"/></div>
  <div className="cap-phone"><img src="/media/casa-angel-movil-recorrido.webp" width="390" height="3400" alt={es ? 'La misma página en el celular' : 'The same page on a phone'} loading="lazy"/></div>
 </div>;
}
