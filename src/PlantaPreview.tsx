import { parseCsv } from './csv';
import { consolidate, SAMPLE_PROD, SAMPLE_QUAL, SAMPLE_STOPS } from './planta-logic';
import './planta.css';

// Portada de Planta: los tres reportes entran, se cruzan y salen el OEE de cada línea, en qué se pierde y lo que no cuadró.
// Todo sale del mismo ejemplo que la demo; sólo la línea más baja va en aviso.
const RESULT = consolidate(parseCsv(SAMPLE_PROD), parseCsv(SAMPLE_QUAL), parseCsv(SAMPLE_STOPS));
const LOW = Math.min(...RESULT.lines.map(l => l.oee));
const pct = (v: number) => Math.round(v * 100);

export default function PlantaPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 const parts: [string, 'A' | 'R' | 'Q'][] = es ? [['Disp.', 'A'], ['Rend.', 'R'], ['Cal.', 'Q']] : [['Avail.', 'A'], ['Perf.', 'R'], ['Qual.', 'Q']];
 return <div className="plp" aria-hidden="true">
  <div className="plp-flow"><span>{es ? 'Producción' : 'Production'}</span><i/><span>{es ? 'Calidad' : 'Quality'}</span><i/><span>{es ? 'Detenciones' : 'Stops'}</span></div>
  <div className="plp-rings">{RESULT.lines.map(l => <div key={l.linea} className={l.oee === LOW && l.oee < .85 ? 'warn' : ''}>
   <div className="pl-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" className="pl-track"/><circle cx="60" cy="60" r="50" className="pl-arc" pathLength={100} style={{ ['--o' as string]: `${100 - l.oee * 100}px` }}/></svg><span><b>{pct(l.oee)}</b><small>OEE %</small></span></div>
   <span className="plp-name">{es ? 'Línea' : 'Line'} {l.linea.slice(1)}</span>
   <dl className="plp-parts">{parts.map(([n, k]) => <div key={k}><dt>{n}</dt><dd><i style={{ ['--w' as string]: `${pct(l[k])}%` }}/></dd><dd>{pct(l[k])}</dd></div>)}</dl>
  </div>)}</div>
  <div className="plp-ex">
   <p>{es ? `${RESULT.exceptions.length} cosas no cuadran` : `${RESULT.exceptions.length} things don’t add up`}</p>
   <ul>{RESULT.exceptions.slice(0, 5).map(x => <li key={x.text[0] + x.where}><b>{es ? x.text[0] : x.text[1]}</b><span>{x.where}</span></li>)}</ul>
  </div>
 </div>;
}
