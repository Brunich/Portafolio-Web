import './spc.css';

// Portada de Gráficas de control: la gráfica de individuos se dibuja sola y, como en la app, abajo va su rango móvil.
// Al final la herramienta se desgasta: los puntos suben y el rango móvil también se dispara.
const PTS = [0.1, -0.4, 0.3, 0.6, -0.2, -0.7, 0.2, 0.4, -0.3, 0.1, 0.5, -0.1, 0.8, 1.2, 1.7, 2.3, 3.4];
const MR = PTS.slice(1).map((z, i) => Math.abs(z - PTS[i]));
const MR_BAR = MR.slice(0, 12).reduce((a, b) => a + b, 0) / 12;

export default function SpcPreview({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 const W = 320, H = 180, x = (i: number) => 18 + i * (W - 36) / (PTS.length - 1), y = (z: number) => H / 2 - z * 22;
 // Rango móvil con su límite superior (3.267 × MR promedio), en la misma escala horizontal
 const H2 = 96, top = 3.267 * MR_BAR, y2 = (r: number) => H2 - 14 - r / Math.max(top, ...MR) * (H2 - 30);
 return <div className="spcp" aria-hidden="true">
  <svg viewBox={`0 0 ${W} ${H}`}>
   <text className="ttl" x={W / 2} y={10} textAnchor="middle">{es ? 'Individuos' : 'Individuals'}</text>
   <rect className="zone" x={18} width={W - 36} y={y(2)} height={y(-2) - y(2)}/>
   <line className="lim" x1={18} x2={W - 18} y1={y(3)} y2={y(3)}/><line className="lim" x1={18} x2={W - 18} y1={y(-3)} y2={y(-3)}/>
   <line className="cl" x1={18} x2={W - 18} y1={y(0)} y2={y(0)}/>
   <text x={18} y={y(3) - 6}>{es ? 'LSC' : 'UCL'}</text><text x={18} y={y(-3) + 14}>{es ? 'LIC' : 'LCL'}</text>
   <path className="ln" pathLength={1} d={PTS.map((z, i) => `${i ? 'L' : 'M'}${x(i)},${y(z)}`).join('')}/>
   {PTS.map((z, i) => <circle key={i} className={i >= 14 ? 'bad' : ''} cx={x(i)} cy={y(z)} r={i >= 14 ? 4.5 : 3}/>)}
   {/* A la izquierda del último punto y no encima: arriba está el título de la gráfica */}
   <text className="tag" x={x(PTS.length - 1) - 10} y={y(PTS[PTS.length - 1]) + 4} textAnchor="end">{es ? 'desgaste' : 'tool wear'}</text>
  </svg>
  <svg viewBox={`0 0 ${W} ${H2}`}>
   <text className="ttl" x={W / 2} y={10} textAnchor="middle">{es ? 'Rango móvil' : 'Moving range'}</text>
   <line className="lim" x1={18} x2={W - 18} y1={y2(top)} y2={y2(top)}/>
   <line className="cl" x1={18} x2={W - 18} y1={y2(MR_BAR)} y2={y2(MR_BAR)}/>
   <line className="base" x1={18} x2={W - 18} y1={y2(0)} y2={y2(0)}/>
   <text x={18} y={y2(top) - 5}>{es ? 'LSC' : 'UCL'}</text>
   <path className="ln" pathLength={1} d={MR.map((r, i) => `${i ? 'L' : 'M'}${x(i + 1)},${y2(r)}`).join('')}/>
   {MR.map((r, i) => <circle key={i} className={r > top ? 'bad' : ''} cx={x(i + 1)} cy={y2(r)} r={r > top ? 4 : 2.6}/>)}
  </svg>
 </div>;
}
