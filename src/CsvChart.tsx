import './csv-chart.css';

// Portada del analizador: lo que encuentra y lo que queda después de un clic, como gráfica.
// Los números son los del ejemplo de la planta (7 problemas → 1 que requiere criterio).
const BARS: { es: string; en: string; n: number; stays?: 'rule' | 'info' }[] = [
 { es: 'Escrito de varias formas', en: 'Written several ways', n: 3 },
 { es: 'Fechas mezcladas', en: 'Mixed dates', n: 3 },
 { es: 'Espacios sobrantes', en: 'Extra spaces', n: 2 },
 { es: 'Filas repetidas', en: 'Duplicate rows', n: 1 },
 { es: 'Separador de miles', en: 'Thousands separator', n: 1 },
 { es: 'Regla de negocio', en: 'Business rule', n: 1, stays: 'rule' },
];
const MAX = 3;

export default function CsvChart({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 return <div className="cc" aria-hidden="true">
  <div className="cc-gauge">
   <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" className="cc-track"/><circle cx="60" cy="60" r="50" className="cc-arc" pathLength={100}/></svg>
   <div className="cc-score"><b><span className="cc-before">7</span><span className="cc-after">1</span></b><small>{es ? 'problemas' : 'issues'}</small></div>
  </div>
  <div className="cc-bars">
   <span className="cc-title">{es ? 'Qué encontró · qué queda' : 'What it found · what remains'}</span>
   {BARS.map((b, i) => <div key={b.en} className={`cc-row${b.stays ? ` stays-${b.stays}` : ''}`} style={{ ['--w' as string]: `${(b.n / MAX) * 100}%`, ['--d' as string]: `${i * .12}s` }}>
    <span className="cc-label">{es ? b.es : b.en}</span>
    <span className="cc-bar"><i/></span>
    <span className="cc-n">{b.n}</span>
   </div>)}
   <span className="cc-legend"><i className="fix"/>{es ? 'se corrige solo' : 'fixed automatically'}<i className="rule"/>{es ? 'requiere criterio' : 'needs judgment'}</span>
  </div>
 </div>;
}
