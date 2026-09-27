// Ilustración del formato de salida de VibeMap (diagrama Mermaid con flechas numeradas por
// función real + explicación con los mismos números), aplicado al código de este sitio.
// No es una captura: la app real tiene tema claro y necesita la API de Gemini.
const STEPS: { from: string; call: string; to: string; es: string; en: string }[] = [
 { from: 'DataWorkbench', call: 'loadFile()', to: 'csv.ts', es: 'lee el archivo y rechaza lo que no sea UTF-8', en: 'reads the file and rejects non-UTF-8 input' },
 { from: 'csv.ts', call: 'parseCsv()', to: 'CsvData', es: 'detecta el separador y respeta las comillas', en: 'detects the delimiter and respects quotes' },
 { from: 'CsvData', call: 'profileColumns()', to: 'perfil', es: 'decide el tipo de cada columna', en: 'infers each column type' },
 { from: 'perfil', call: '<CsvMindMap/>', to: 'SVG', es: 'dibuja el mapa de la estructura', en: 'draws the structure map' },
];

export default function VibeSketch({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es';
 const nodes = [STEPS[0].from, ...STEPS.map(s => s.to)];
 return <div className="vibe-sketch" aria-hidden="true">
  <div className="vs-bar"><i/><i/><i/><span>VibeMap · DataWorkbench.tsx</span></div>
  <div className="vs-body">
   <div className="vs-flow">
    {nodes.map((n, i) => <div key={n} className="vs-step" style={{ ['--i' as string]: i }}>
     <span className="vs-node">{n}</span>
     {i < STEPS.length && <span className="vs-edge"><b>{i + 1}.</b> {STEPS[i].call}</span>}
    </div>)}
   </div>
   <ol className="vs-notes">{STEPS.map((s, i) => <li key={s.call} style={{ ['--i' as string]: i + 1 }}><b>{i + 1}.</b> <code>{s.call}</code> {es ? s.es : s.en}</li>)}</ol>
  </div>
  <p className="vs-caption">{es ? 'Formato de VibeMap aplicado al código de este sitio: cada flecha es una función real y su número coincide con la explicación.' : 'VibeMap’s format applied to this site’s code: every arrow is a real function and its number matches the explanation.'}</p>
 </div>;
}
