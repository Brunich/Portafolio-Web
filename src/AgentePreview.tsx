import './agente.css';

// Portada del asistente local: una conversación corta que se repite, con el sello de «tus datos no salen».
export default function AgentePreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="agp" aria-hidden="true"><div className="agp-box">
  <span className="agp-msg u">{es ? '¿Cuánto cuestan las balatas del Tsuru?' : 'How much are the Tsuru brake pads?'}</span>
  <span className="agp-msg b">{es ? '$489, y tenemos 12 en existencia. Fuente: catálogo · BAL-2211' : '$489, with 12 in stock. Source: catalog · BAL-2211'}</span>
  <span className="agp-msg u">{es ? '¿Hacen factura con otro RFC?' : 'Can you invoice another tax ID?'}</span>
  <span className="agp-msg b">{es ? 'Eso no lo tengo en mis datos: te comunico con una persona.' : 'That is not in my data: handing you to a person.'}</span>
  <span className="agp-chip">{es ? 'Modelo local · tus datos no salen' : 'Local model · your data stays'}</span>
 </div></div>;
}
