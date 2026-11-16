import './csv-chart.css';

// Portada del analizador: los problemas del reporte y cuáles se arreglan con un clic.
// Los números son los del ejemplo de la planta (7 problemas → 1 que requiere criterio).
// Termina con lo arreglado en verde, la regla de negocio en ámbar y el anillo en 6 de 7.
const BARS: { es: string; en: string; n: number; stays?: 'rule' | 'info' }[] = [
 { es: 'Escrito de varias formas', en: 'Written several ways', n: 2 },
 { es: 'Fechas mezcladas', en: 'Mixed dates', n: 1 },
 { es: 'Espacios sobrantes', en: 'Extra spaces', n: 1 },
 { es: 'Filas repetidas', en: 'Duplicate rows', n: 1 },
 { es: 'Separador de miles', en: 'Thousands separator', n: 1 },
 { es: 'Regla de negocio', en: 'Business rule', n: 1, stays: 'rule' },
];
// Cada barra cuenta problemas, no celdas: suman los 7 del anillo
const MAX = 2;

export default function CsvChart({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="cc-frame" aria-hidden="true"><div className="cc">
  <div className="cc-gauge">
   <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" className="cc-track"/><circle cx="60" cy="60" r="50" className="cc-arc" pathLength={100}/></svg>
   {/* Número y rótulo cambian juntos: 7 problemas al cargar, 1 por revisar al terminar */}
   <div className="cc-score"><b><span className="cc-before">7</span><span className="cc-after">1</span></b><small><span>{es ? 'problemas' : 'issues'}</span><span>{es ? 'por revisar' : 'to review'}</span></small></div>
  </div>
  <div className="cc-bars">
   {BARS.map((b, i) => <div key={b.en} className={`cc-row${b.stays ? ` stays-${b.stays}` : ''}`} style={{ ['--w' as string]: `${(b.n / MAX) * 100}%`, ['--d' as string]: `${i * .12}s` }}>
    <span className="cc-label">{es ? b.es : b.en}</span>
    <span className="cc-bar"><i/></span>
    <span className="cc-n">{b.n}</span>
   </div>)}
   <span className="cc-legend"><i className="fix"/>{es ? 'automático' : 'automatic'}<i className="rule"/>{es ? 'por revisar' : 'to review'}</span>
  </div>
 </div></div>;
}
