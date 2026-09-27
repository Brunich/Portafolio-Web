import { useMemo, useState } from 'react';
import './impact-explorer.css';

type Node = { id: string; x: number; y: number; role: [string, string]; test?: boolean };
const NODES: Node[] = [
 { id: 'Checkout.tsx', x: 120, y: 110, role: ['pantalla de pago', 'checkout screen'] },
 { id: 'OrderSummary.tsx', x: 120, y: 290, role: ['resumen del pedido', 'order summary'] },
 { id: 'useOrder.ts', x: 350, y: 110, role: ['estado y validación', 'state and validation'] },
 { id: 'useOrder.test.ts', x: 350, y: 330, role: ['pruebas del estado', 'state tests'], test: true },
 { id: 'orders.service.ts', x: 580, y: 110, role: ['habla con el servidor', 'talks to the server'] },
 { id: 'orders.service.test.ts', x: 580, y: 330, role: ['pruebas del servicio', 'service tests'], test: true },
 { id: 'api/client.ts', x: 800, y: 70, role: ['conexión HTTP', 'HTTP connection'] },
 { id: 'types/order.ts', x: 800, y: 230, role: ['forma del pedido', 'order shape'] },
];
// [quien importa, lo importado]
const IMPORTS: [string, string][] = [
 ['Checkout.tsx', 'useOrder.ts'], ['Checkout.tsx', 'OrderSummary.tsx'], ['OrderSummary.tsx', 'types/order.ts'],
 ['useOrder.ts', 'orders.service.ts'], ['useOrder.ts', 'types/order.ts'], ['orders.service.ts', 'api/client.ts'],
 ['orders.service.ts', 'types/order.ts'], ['useOrder.test.ts', 'useOrder.ts'], ['orders.service.test.ts', 'orders.service.ts'],
];
const SCENARIOS: { file: string; label: [string, string] }[] = [
 { file: 'useOrder.ts', label: ['Cambiar una regla de validación', 'Change a validation rule'] },
 { file: 'types/order.ts', label: ['Agregar un campo al pedido', 'Add a field to the order'] },
 { file: 'api/client.ts', label: ['Cambiar la URL del servidor', 'Change the server URL'] },
];
const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
const NW = 168, NH = 52;
const edgePath = (from: Node, to: Node) => {
 const mx = (from.x + to.x) / 2;
 return `M${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`;
};

export default function ImpactExplorer({ lang, paused }: { lang: 'es' | 'en'; paused: boolean }) {
 const es = lang === 'es', L = es ? 0 : 1;
 const [changed, setChanged] = useState('useOrder.ts');
 const [run, setRun] = useState(0);
 const pick = (file: string) => { setChanged(file); setRun(r => r + 1); };
 // Recorrido inverso de importaciones: quién se entera si cambia `changed`, y a qué distancia.
 const depth = useMemo(() => {
  const d: Record<string, number> = { [changed]: 0 };
  const queue = [changed];
  while (queue.length) {
   const cur = queue.shift()!;
   for (const [importer, imported] of IMPORTS) if (imported === cur && d[importer] === undefined) { d[importer] = d[cur] + 1; queue.push(importer); }
  }
  return d;
 }, [changed]);
 const affected = NODES.filter(n => n.id !== changed && depth[n.id] !== undefined);
 const direct = affected.filter(n => depth[n.id] === 1 && !n.test);
 const chain = affected.filter(n => depth[n.id] > 1 && !n.test);
 const tests = affected.filter(n => n.test);
 const untouched = NODES.length - affected.length - 1;
 const reason = (n: Node) => IMPORTS.filter(([a, b]) => a === n.id && depth[b] !== undefined && depth[b] < depth[n.id]).map(([, b]) => b)[0];
 const STEP = 0.55;

 return <div className="impact-explorer" data-paused={paused}>
  <div className="ie-head">
   <div><span className="proposal-status">{es ? 'Demostración · repositorio de ejemplo' : 'Demo · sample repository'}</span><h3>{es ? '¿Qué se rompe si toco este archivo?' : 'What breaks if I touch this file?'}</h3><p>{es ? 'Elige un cambio o toca cualquier archivo. La onda sigue las importaciones hacia atrás: todo lo que se ilumina depende de lo que cambiaste.' : 'Pick a change or tap any file. The wave follows imports backwards: everything that lights up depends on what you changed.'}</p></div>
   <div className="ie-scenarios">{SCENARIOS.map(s => <button key={s.file} aria-pressed={changed === s.file} onClick={() => pick(s.file)}>{s.label[L]}<small>{s.file}</small></button>)}</div>
  </div>
  <div className="ie-body">
   <div className="ie-graph">
    <svg viewBox="0 0 920 400" role="group" aria-label={es ? `Grafo de importaciones. Cambio en ${changed}; afecta a ${affected.map(n => n.id).join(', ') || 'ningún archivo'}.` : `Import graph. Change in ${changed}; affects ${affected.map(n => n.id).join(', ') || 'no files'}.`}>
     <defs>
      <filter id="ie-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <marker id="ie-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z" fill="#737e8d"/></marker>
     </defs>
     <text className="ie-col" x="120" y="28" textAnchor="middle">{es ? 'INTERFAZ' : 'INTERFACE'}</text>
     <text className="ie-col" x="350" y="28" textAnchor="middle">{es ? 'ESTADO' : 'STATE'}</text>
     <text className="ie-col" x="580" y="28" textAnchor="middle">{es ? 'SERVICIOS' : 'SERVICES'}</text>
     <text className="ie-col" x="800" y="28" textAnchor="middle">{es ? 'BASE' : 'FOUNDATION'}</text>
     {IMPORTS.map(([a, b]) => {
      const lit = depth[a] !== undefined && depth[b] !== undefined && depth[a] === depth[b] + 1;
      return <path key={a + b + (lit ? run : "")} className={`ie-edge${lit ? ' ie-lit' : ''}`} d={edgePath(byId[a], byId[b])} markerEnd="url(#ie-arrow)" style={lit ? { ['--d' as string]: `${depth[b] * STEP}s` } : undefined}/>;
     })}
     <g key={run}>
      {!paused && IMPORTS.filter(([a, b]) => depth[a] !== undefined && depth[b] !== undefined && depth[a] === depth[b] + 1).map(([a, b]) => <circle key={a + b} r="5" className="ie-pulse" filter="url(#ie-glow)">
       <animateMotion dur={`${STEP}s`} begin={`${depth[b] * STEP}s`} fill="freeze" path={edgePath(byId[b], byId[a])} calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1"/>
       <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.8;1" dur={`${STEP}s`} begin={`${depth[b] * STEP}s`} fill="freeze"/>
      </circle>)}
     </g>
     {NODES.map(n => {
      const d = depth[n.id];
      const state = n.id === changed ? 'ie-changed' : d === undefined ? 'ie-calm' : n.test ? 'ie-test' : 'ie-hit';
      return <g key={`${n.id}-${run}`} className={`ie-node ${state}`} style={{ ['--d' as string]: `${(d ?? 0) * STEP}s` }} onClick={() => pick(n.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(n.id); } }} tabIndex={0} role="button" aria-label={`${n.id}: ${n.role[L]}`}>
       {n.id === changed && <circle className="ie-ring" cx={n.x} cy={n.y} r="40"/>}
       <rect x={n.x - NW / 2} y={n.y - NH / 2} width={NW} height={NH} rx="11"/>
       <text x={n.x} y={n.y - 4} textAnchor="middle" className="ie-file">{n.id}</text>
       <text x={n.x} y={n.y + 14} textAnchor="middle" className="ie-role">{n.role[L]}</text>
       {d !== undefined && d > 0 && <text x={n.x + NW / 2 - 8} y={n.y - NH / 2 - 7} textAnchor="end" className="ie-depth">{d === 1 ? (es ? 'directo' : 'direct') : (es ? `en cadena · ${d}` : `chain · ${d}`)}</text>}
      </g>;
     })}
    </svg>
    <p className="ie-legend"><span><i className="lg-changed"/>{es ? 'lo que cambias' : 'what you change'}</span><span><i className="lg-hit"/>{es ? 'se ve afectado' : 'affected'}</span><span><i className="lg-test"/>{es ? 'prueba a correr' : 'test to run'}</span><span>{es ? 'flecha = «importa a»' : 'arrow = “imports”'}</span></p>
   </div>
   <aside className="ie-report" aria-live="polite" key={changed}>
    <h4>{es ? 'Cambias' : 'You change'} <code>{changed}</code></h4>
    <p className="ie-muted">{byId[changed].role[L]}</p>
    {[[es ? 'Se entera directo' : 'Directly affected', direct], [es ? 'Se entera en cadena' : 'Affected down the chain', chain]].map(([title, list]) => (list as Node[]).length > 0 && <div key={title as string}><h5>{title as string}</h5><ul>{(list as Node[]).map((n, i) => <li key={n.id} style={{ ['--i' as string]: i }}><code>{n.id}</code><span>{es ? `importa ${reason(n)}` : `imports ${reason(n)}`}</span></li>)}</ul></div>)}
    <h5>{es ? 'Pruebas que conviene correr' : 'Tests worth running'}</h5>
    {tests.length ? <ul>{tests.map((n, i) => <li key={n.id} style={{ ['--i' as string]: i }}><code>{n.id}</code></li>)}</ul> : <p className="ie-warn">{es ? 'Ninguna prueba cubre este cambio: sería lo primero que escribiría.' : 'No test covers this change: that is the first thing I would write.'}</p>}
    <p className="ie-safe">{es ? `${untouched} archivo${untouched === 1 ? '' : 's'} no se toca${untouched === 1 ? '' : 'n'}: no hace falta revisarlo${untouched === 1 ? '' : 's'}.` : `${untouched} file${untouched === 1 ? '' : 's'} untouched: no need to review.`}</p>
   </aside>
  </div>
 </div>;
}
