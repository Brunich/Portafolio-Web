import './planta.css';

// Portada de Planta: los tres reportes entran, se cruzan y salen tres anillos de OEE (datos del ejemplo).
const LINES: [string, number, string][] = [['L1', .828, 'good'], ['L2', .786, 'mid'], ['L3', .807, 'mid']];

export default function PlantaPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="plp" aria-hidden="true">
  <div className="plp-flow"><span>{es ? 'Producción' : 'Production'}</span><i/><span>{es ? 'Calidad' : 'Quality'}</span><i/><span>{es ? 'Paros' : 'Stops'}</span></div>
  <div className="plp-rings">{LINES.map(([l, v, tone]) => <div key={l}>
   <div className={`pl-ring tone-${tone}`}><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" className="pl-track"/><circle cx="60" cy="60" r="50" className="pl-arc" pathLength={100} style={{ ['--o' as string]: `${100 - v * 100}px` }}/></svg><span><b>{Math.round(v * 100)}</b><small>OEE %</small></span></div>
   {es ? 'Línea' : 'Line'} {l.slice(1)}
  </div>)}</div>
 </div>;
}
