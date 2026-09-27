import './loyalty-demo.css';

const GOAL = 8;

// Portada de la tarjeta de proyecto: los sellos se llenan en bucle y llega el WhatsApp.
export default function ClubPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="ld-preview" aria-hidden="true">
  <span className="ld-preview-chip">NFC<i/><i/></span>
  <div className="ld-pass">
   <div className="ld-pass-top"><span className="ld-brand">EC</span><div><strong>El Cerrito</strong><small>{es ? 'Taquería · Monterrey' : 'Taquería · Monterrey'}</small></div></div>
   <div className="ld-stamps">{Array.from({ length: GOAL }, (_, i) => <span key={i} style={{ ['--i' as string]: i }}>{i === GOAL - 1 ? '★' : ''}</span>)}</div>
  </div>
  <div className="ld-bubble"><p>{es ? '¿Qué tal estuvo todo hoy? Si te gustó, una reseña nos ayuda muchísimo.' : 'How was everything today? If you liked it, a review helps us a lot.'}</p><span className="ld-preview-btn">{es ? 'Dejar reseña en Google' : 'Leave a Google review'}</span></div>
 </div>;
}
