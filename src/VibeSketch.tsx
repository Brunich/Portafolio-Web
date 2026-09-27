// Esquema oscuro de lo que hace VibeMap: una carpeta entra y sale un mapa mental con analogías.
// La app real tiene tema claro; esto es una ilustración rotulada, no una captura.
export default function VibeSketch({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 const branches: [string, string, number][] = es
  ? [['api/', 'el mesero', 70], ['components/', 'el comedor', 150], ['utils/', 'la cocina', 230]]
  : [['api/', 'the waiter', 70], ['components/', 'the dining room', 150], ['utils/', 'the kitchen', 230]];
 return <div className="vibe-sketch" aria-hidden="true">
  <span className="vibe-tag">{es ? 'ESQUEMA DEL RESULTADO' : 'RESULT SKETCH'}</span>
  <p className="vibe-word">VibeMap</p>
  <svg viewBox="0 0 520 300">
   <defs><linearGradient id="vibe-grad" x1="0" x2="1"><stop offset="0" stopColor="#7c83ff"/><stop offset=".55" stopColor="#b57cff"/><stop offset="1" stopColor="#ff7cc8"/></linearGradient></defs>
   <g className="vibe-folder"><rect x="14" y="128" width="118" height="44" rx="10"/><text x="73" y="155" textAnchor="middle">{es ? 'mi-proyecto/' : 'my-project/'}</text></g>
   <path className="vibe-flow" d="M136 150 C 170 150, 170 150, 204 150" pathLength={1}/>
   <g className="vibe-root"><circle cx="236" cy="150" r="30"/><text x="236" y="155" textAnchor="middle">App</text></g>
   {branches.map(([dir, analogy, y], i) => <g key={dir} className="vibe-branch" style={{ ['--i' as string]: i }}>
    <path d={`M266 150 C 300 150, 300 ${y}, 330 ${y}`} pathLength={1}/>
    <rect x="330" y={y - 17} width="174" height="34" rx="9"/>
    <text x="344" y={y + 5}><tspan className="vibe-dir">{dir}</tspan><tspan className="vibe-an" dx="8">{analogy}</tspan></text>
   </g>)}
  </svg>
  <p className="vibe-caption">{es ? 'Como un restaurante: cada carpeta explicada con una analogía.' : 'Like a restaurant: each folder explained with an analogy.'}</p>
 </div>;
}
