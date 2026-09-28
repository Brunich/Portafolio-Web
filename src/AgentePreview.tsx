import './agente.css';

// Portada del asistente local: una conversación corta que se repite, con el sello de «tus datos no salen».
export default function AgentePreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="agp" aria-hidden="true"><div className="agp-box">
  <span className="agp-msg u">{es ? '¿Cuánto cuesta el rodamiento 6205?' : 'How much is the 6205 bearing?'}</span>
  <span className="agp-msg b">{es ? '$185, con 40 en existencia. Fuente: catálogo · ROD-6205' : '$185, with 40 in stock. Source: catalog · ROD-6205'}</span>
  <span className="agp-msg u">{es ? '¿Hacen factura con otro RFC?' : 'Can you invoice another tax ID?'}</span>
  <span className="agp-msg b">{es ? 'Eso no lo tengo en mis datos: te comunico con una persona.' : 'That is not in my data: handing you to a person.'}</span>
  <span className="agp-chip">{es ? 'Modelo local · tus datos no salen' : 'Local model · your data stays'}</span>
 </div></div>;
}
