import './shift-handover.css';

// Portada de la tarjeta: tarjetas que pasan de abierta a en curso a cerrada.
export default function TurnoPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 const cols = es ? ['Abierta', 'En curso', 'Cerrada'] : ['Open', 'In progress', 'Closed'];
 return <div className="shp" aria-hidden="true">
  {cols.map((c, i) => <div key={c} className={`shp-col c${i}`}><span>{c}</span></div>)}
  {['Torque fuera de rango', 'Burbuja en pintura', 'Fuga en sello'].map((d, i) => <div key={d} className={`shp-card k${i}`}><i/><b>{d}</b><small>L{i + 1} · {es ? 'Lote' : 'Batch'} 44{6 + i}8</small></div>)}
 </div>;
}
