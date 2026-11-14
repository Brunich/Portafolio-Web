import { parseCsv } from './csv';
import { consolidate, SAMPLE_PROD, SAMPLE_QUAL, SAMPLE_STOPS } from './planta-logic';
import './planta.css';

// Portada de Planta: los tres reportes entran, se cruzan y salen tres anillos de OEE. Las cifras salen del mismo ejemplo que la demo.
const RESULT = consolidate(parseCsv(SAMPLE_PROD), parseCsv(SAMPLE_QUAL), parseCsv(SAMPLE_STOPS));
const LINES: [string, number, string][] = RESULT.lines.map(l => [l.linea, l.oee, l.oee >= .85 ? 'good' : l.oee >= .65 ? 'mid' : 'low']);

export default function PlantaPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="plp" aria-hidden="true">
  <div className="plp-flow"><span>{es ? 'Producción' : 'Production'}</span><i/><span>{es ? 'Calidad' : 'Quality'}</span><i/><span>{es ? 'Detenciones' : 'Stops'}</span></div>
  <div className="plp-rings">{LINES.map(([l, v, tone]) => <div key={l}>
   <div className={`pl-ring tone-${tone}`}><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" className="pl-track"/><circle cx="60" cy="60" r="50" className="pl-arc" pathLength={100} style={{ ['--o' as string]: `${100 - v * 100}px` }}/></svg><span><b>{Math.round(v * 100)}</b><small>OEE %</small></span></div>
   <span className="plp-name">{es ? 'Línea' : 'Line'} {l.slice(1)}</span>
  </div>)}</div>
 </div>;
}
