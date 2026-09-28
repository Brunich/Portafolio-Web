import './spc.css';

// Portada de Gráficas de control: una gráfica que se dibuja sola; al final la herramienta se desgasta y avisa.
const PTS = [0.1, -0.4, 0.3, 0.6, -0.2, -0.7, 0.2, 0.4, -0.3, 0.1, 0.5, -0.1, 0.8, 1.2, 1.7, 2.3, 3.4];

export default function SpcPreview({ lang }: { lang: 'es' | 'en' }) {
 const W = 320, H = 180, x = (i: number) => 18 + i * (W - 36) / (PTS.length - 1), y = (z: number) => H / 2 - z * 22;
 return <div className="spcp" aria-hidden="true"><svg viewBox={`0 0 ${W} ${H}`}>
  <rect className="zone" x={18} width={W - 36} y={y(2)} height={y(-2) - y(2)}/>
  <line className="lim" x1={18} x2={W - 18} y1={y(3)} y2={y(3)}/><line className="lim" x1={18} x2={W - 18} y1={y(-3)} y2={y(-3)}/>
  <line className="cl" x1={18} x2={W - 18} y1={y(0)} y2={y(0)}/>
  <text x={W - 18} y={y(3) - 6} textAnchor="end">LSC</text><text x={W - 18} y={y(-3) + 14} textAnchor="end">LIC</text>
  <path className="ln" pathLength={1} d={PTS.map((z, i) => `${i ? 'L' : 'M'}${x(i)},${y(z)}`).join('')}/>
  {PTS.map((z, i) => <circle key={i} className={i >= 14 ? 'bad' : ''} cx={x(i)} cy={y(z)} r={i >= 14 ? 4.5 : 3}/>)}
  <text className="tag" x={x(PTS.length - 1) - 4} y={y(PTS[PTS.length - 1]) - 10} textAnchor="end">{lang === 'es' ? 'desgaste' : 'tool wear'}</text>
 </svg></div>;
}
