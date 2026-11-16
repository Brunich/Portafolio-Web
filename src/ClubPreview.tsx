import './loyalty-demo.css';

const GOAL = 8, DONE = 5;

// Portada de la tarjeta de proyecto: caen cinco sellos de ocho, el último hueco es el premio y llega el WhatsApp.
// Se queda en 5 de 8 para que se entienda qué falta y qué se gana, no una tarjeta ya llena.
export default function ClubPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="ld-preview-fit" aria-hidden="true"><div className="ld-preview">
  <span className="ld-preview-chip">NFC<i/><i/></span>
  <div className="ld-pass">
   <div className="ld-pass-top"><span className="ld-brand">EC</span><div><strong>El Cerro</strong><small>{es ? 'Restaurante · Monterrey' : 'Restaurant · Monterrey'}</small></div></div>
   <div className="ld-stamps">{Array.from({ length: GOAL }, (_, i) => <span key={i} className={i < DONE ? 'got' : i === GOAL - 1 ? 'prize' : undefined} style={{ ['--i' as string]: i }}></span>)}</div>
   <div className="ld-preview-foot"><b>{DONE} {es ? 'de' : 'of'} {GOAL}</b><span>{es ? 'Al llenarla: postre de la casa' : 'When full: house dessert'}</span></div>
  </div>
  <div className="ld-bubble"><p>{es ? '¿Qué tal estuvo todo hoy? Si te gustó, una reseña nos ayuda muchísimo.' : 'How was everything today? If you liked it, a review helps us a lot.'}</p><span className="ld-preview-btn">{es ? 'Dejar reseña en Google' : 'Leave a Google review'}</span></div>
 </div></div>;
}
