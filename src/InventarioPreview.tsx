import { SAMPLE, eanBits, shopping } from './inventario-logic';
import './inventario.css';

// Portada del inventario: el celular lee un código y el producto sube en la lista.
export default function InventarioPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es', bits = eanBits(SAMPLE[0].code);
 return <div className="ivp" aria-hidden="true">
  <div className="ivp-phone">
   <svg viewBox="0 0 95 40" preserveAspectRatio="none">{[...bits].map((b, i) => b === '1' ? <rect key={i} x={i} y="0" width="1" height="40"/> : null)}</svg>
   <i/><em>+1 {SAMPLE[0].name}</em>
  </div>
  <div className="ivp-list">
   {SAMPLE.slice(0, 4).map((p, i) => <div key={p.code} className={p.stock < p.min ? 'low' : ''}><span>{p.name}</span><b>{i === 0 ? p.stock + 1 : p.stock}</b></div>)}
   <small style={{ color: 'var(--muted)', fontSize: 12 }}>{es ? `${shopping(SAMPLE).length} productos bajo el mínimo → lista de compras` : `${shopping(SAMPLE).length} products below minimum → shopping list`}</small>
  </div>
 </div>;
}
