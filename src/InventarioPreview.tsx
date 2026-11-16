import { SAMPLE, eanBits, shopping } from './inventario-logic';
import './inventario.css';

// Portada del inventario: el celular lee un código y el producto sube en la lista.
// En marcos altos se ven además el modo de escaneo y el pedido que se arma con lo que falta.
export default function InventarioPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es', bits = eanBits(SAMPLE[0].code), low = shopping(SAMPLE);
 return <div className="ivp" aria-hidden="true"><div className="ivp-grid">
  <div className="ivp-modes"><span className="on">{es ? 'Entrada' : 'Stock in'}</span><span>{es ? 'Salida' : 'Issue'}</span><span>{es ? 'Conteo físico' : 'Stock count'}</span></div>
  <div className="ivp-phone">
   <svg viewBox="0 0 95 40" preserveAspectRatio="none">{[...bits].map((b, i) => b === '1' ? <rect key={i} x={i} y="0" width="1" height="40"/> : null)}</svg>
   <i/><em>+1 {SAMPLE[0].name}</em>
  </div>
  <div className="ivp-list">
   {SAMPLE.slice(0, 6).map((p, i) => <div key={p.code} className={p.stock < p.min ? 'low' : ''}><span>{p.name}</span><b>{i === 0 ? p.stock + 1 : p.stock}<small>{es ? 'mín' : 'min'} {p.min}</small></b></div>)}
   <small>{es ? `${low.length} productos bajo el mínimo → lista de reposición` : `${low.length} products below minimum → reorder list`}</small>
  </div>
  <div className="ivp-order">
   <p><strong>{es ? 'Pedido al proveedor' : 'Supplier order'}</strong><span>{es ? `${low.length} productos · por WhatsApp` : `${low.length} products · via WhatsApp`}</span></p>
   <ul>{low.slice(0, 4).map(p => <li key={p.code}><span>{p.name}</span><b>{p.order}</b></li>)}</ul>
  </div>
 </div></div>;
}
