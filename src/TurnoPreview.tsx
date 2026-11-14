import './shift-handover.css';

// Portada de Entrega de turno: las tarjetas pasan de abierta a en curso a cerrada y la bitácora lo va anotando.
export default function TurnoPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 const cols = es ? ['Abiertas', 'En curso', 'Cerradas'] : ['Open', 'In progress', 'Closed'];
 // Mismos folios, líneas y personas que el tablero de la demo.
 const cards: [string, string, string, string][] = [['INC-232', es ? 'Torque fuera de rango' : 'Torque out of range', 'sev-0', 'L1'], ['INC-231', es ? 'Burbuja en pintura de cofre' : 'Paint bubble on hood', 'sev-1', 'L2'], ['INC-229', es ? 'Fuga en sello de parabrisas' : 'Windshield seal leak', 'sev-1', 'L3']];
 const log = es ? ['INC-232 → en curso · R. Garza', 'INC-229 ✓ cerrada con evidencia · L. Treviño', 'INC-231 → en curso · M. Salinas'] : ['INC-232 → in progress · R. Garza', 'INC-229 ✓ closed with evidence · L. Treviño', 'INC-231 → in progress · M. Salinas'];
 return <div className="shp" aria-hidden="true">
  <div className="shp-cols">{cols.map((c, i) => <div key={c} className={`shp-col c${i}`}><span><i/>{c}</span></div>)}</div>
  {cards.map(([id, d, s, ln], i) => <div key={id} className={`shp-card k${i} ${s}`}><em>{s === 'sev-0' ? (es ? 'CRÍTICA' : 'CRITICAL') : (es ? 'MAYOR' : 'MAJOR')} · {ln}</em><code>{id}</code><b>{d}</b><span className="shp-sla"><i/></span></div>)}
  <ol className="shp-log">{log.map((l, i) => <li key={l} style={{ ['--i' as string]: i }}><time>{`0${7 + i}:1${i}:0${i * 3}`}</time>{l}</li>)}</ol>
 </div>;
}
