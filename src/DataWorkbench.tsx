import { useMemo, useRef, useState } from 'react';
import { cleanRows, exportCsv, parseCsv, profileColumns, summarize } from './csv';
import CsvMindMap from './CsvMindMap';
import type { CsvData } from './csv';
import './data-workbench.css';

const DEMO = 'fecha,producto,categoría,facultad,unidades,precio\n2026-03-02, Cuaderno ,Papelería,FIME,12,35\n2026-03-02,Lápiz,Papelería,FCFM,24,8\n2026-03-03,Mochila,Accesorios,FIME,,420\n2026-03-02,Lápiz,Papelería,FCFM,24,8\n2026-03-04,Calculadora,Electrónica,FIME,5,310\n2026-03-05,Regla,Papelería,Arquitectura,8,15\n2026-03-06,Carpeta,Papelería,FIME,15,22\n2026-03-06,Audífonos,Electrónica,FCFM,3,250\n2026-03-09,Termo,Accesorios,Medicina,7,180\n2026-03-10,Marcatextos,Papelería,Derecho,30,12\n2026-03-11,Memoria USB,Electrónica,FIME,9,140\n2026-03-12,Lonchera,Accesorios,,4,160';
const LIMIT = 2 * 1024 * 1024;
export default function DataWorkbench({lang,compact=false}:{lang:'es'|'en';compact?:boolean}) {
 const es=lang==='es';
 const t=(a:string,b:string)=>es?a:b;
 const [data,setData]=useState<CsvData>(()=>parseCsv(DEMO));
 const [source,setSource]=useState('demo');
 const [paste,setPaste]=useState('');
 const [query,setQuery]=useState('');
 const [trim,setTrim]=useState(false);
 const [dedupe,setDedupe]=useState(false);
 const [error,setError]=useState('');
 const [phase,setPhase]=useState<'report'|'parse'>('report');
 const [hover,setHover]=useState<number|null>(null);
 const [dragging,setDragging]=useState(false);
 const [version,setVersion]=useState(0);
 const upload=useRef<HTMLInputElement>(null);
 const rows=useMemo(()=>cleanRows(data.rows,trim,dedupe),[data,trim,dedupe]);
 const stats=useMemo(()=>summarize(rows),[rows]);
 const profile=useMemo(()=>profileColumns(data.headers,rows),[data,rows]);
 const matches=useMemo(()=>rows.filter(r=>r.some(v=>v.toLocaleLowerCase().includes(query.toLocaleLowerCase()))),[rows,query]);
 const visible=matches.slice(0,compact?3:8);
 function describeError(err:unknown) {
  const [kind,row,expected,actual]=(err instanceof Error?err.message:'READ').split(':');
  if(kind==='ROW_WIDTH') return t(`Registro ${row}: se esperaban ${expected} columnas y hay ${actual}. Revisa los separadores y las comillas.`,`Record ${row}: expected ${expected} columns, found ${actual}. Check delimiters and quotes.`);
  if(kind==='EMPTY')return t('El CSV está vacío. Incluye una fila de encabezados y tus datos.','CSV is empty. Include a header row and your data.');
  if(kind==='SIZE')return t('El archivo supera 2 MB. Prueba con un CSV más pequeño.','File exceeds 2 MB. Try a smaller CSV.');
  if(kind==='TYPE')return t('Selecciona un archivo con extensión .csv.','Choose a file with a .csv extension.');
  if(kind==='UNCLOSED_QUOTE'||kind==='INVALID_QUOTE')return t(`Comillas inválidas en el registro ${row}. Encierra el campo completo y escapa comillas como "".`,`Invalid quotes in record ${row}. Quote the entire field and escape quotes as "".`);
  return t('No se pudo leer el archivo. Usa un CSV codificado en UTF-8.','Could not read the file. Use a UTF-8 encoded CSV.');
 }
 function analyze(text:string,name:string) {
  if(new Blob([text]).size>LIMIT)throw new Error('SIZE');
  const parsed=parseCsv(text);
  setData(parsed);setSource(name);setTrim(false);setDedupe(false);setQuery('');setError('');setHover(null);setVersion(v=>v+1);
 }
 async function loadFile(file:File) {
  setPhase('parse');setError('');
  try {
   if(!/\.csv$/i.test(file.name))throw new Error('TYPE');
   if(file.size>LIMIT)throw new Error('SIZE');
   const buffer=await file.arrayBuffer();
   analyze(new TextDecoder('utf-8',{fatal:true}).decode(buffer),file.name);
  }catch(err){setError(describeError(err));}finally{setPhase('report');}
 }
 function download() {
  const url=URL.createObjectURL(new Blob(['\uFEFF',exportCsv(data.headers,rows)],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='csv-limpio.csv';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <div className={`dw-workbench${compact?' dw-compact':''}${dragging?' dw-dragging':''}`} aria-label={t('Inspector de CSV','CSV inspector')} onDragOver={e=>{if(compact)return;e.preventDefault();setDragging(true);}} onDragLeave={e=>{if(e.currentTarget===e.target)setDragging(false);}} onDrop={e=>{if(compact)return;e.preventDefault();setDragging(false);const f=e.dataTransfer.files?.[0];if(f)void loadFile(f);}}>
  {dragging&&<div className="dw-dropveil" aria-hidden="true">{t('Suelta tu CSV aquí','Drop your CSV here')}</div>}
  <div className="dw-topline"><span className="dw-appmark"><span aria-hidden="true">▤</span> CSV / LAB</span><span className="dw-private"><i aria-hidden="true"/> {t('100% local','100% local')}</span></div>
  <div className="dw-heading"><div><p className="dw-eyebrow">{t('DE ARCHIVO A INFORMACIÓN','FROM FILE TO INSIGHT')}</p><h3>{t('Entiende tus datos.','Understand your data.')}</h3></div><span className="dw-filebadge">.csv</span></div>
  {!compact&&<p className="dw-help">{t('Sube tu CSV, encuentra vacíos y duplicados, y descarga una copia limpia. La primera fila se usa como encabezado.','Upload your CSV, find blanks and duplicates, and download a clean copy. The first row becomes the header.')}</p>}
  {!compact&&<><div className="dw-actions"><input ref={upload} type="file" accept=".csv,text/csv" hidden onChange={e=>{const f=e.target.files?.[0];if(f)void loadFile(f);e.target.value='';}}/><button className="dw-primary" disabled={phase==='parse'} onClick={()=>upload.current?.click()}>{t('Subir CSV','Upload CSV')} <span aria-hidden="true">↑</span></button><button disabled={phase==='parse'} onClick={()=>analyze(DEMO,'demo')}>{t('Cargar ejemplo','Load sample')}</button><span className="dw-filehint">{t('o arrástralo aquí · UTF-8 · 2 MB máx.','or drag it here · UTF-8 · 2 MB max.')}</span></div>
  <details className="dw-paste"><summary>{t('O pegar datos CSV','Or paste CSV data')}</summary><label>{t('Contenido CSV','CSV content')}<textarea value={paste} onChange={e=>setPaste(e.target.value)} placeholder={'nombre,valor\nAna,12'} rows={4}/></label><button disabled={!paste.trim()||phase==='parse'} onClick={()=>{try{analyze(paste,'paste');}catch(err){setError(describeError(err));}}}>{t('Analizar texto','Analyze text')}</button></details></>}
  <div className="dw-source"><span>{source==='demo'?t('Datos sintéticos · ejemplo educativo','Synthetic data · educational sample'):source==='paste'?t('Texto pegado','Pasted text'):source}</span><span role="status">{phase==='parse'?t('Leyendo archivo…','Reading file…'):t('Análisis listo','Analysis ready')}</span></div>
  {error&&<p className="dw-error" role="alert">{error} {t('Se conserva el análisis anterior.','Previous analysis is preserved.')}</p>}
  <dl className="dw-stats">{[[stats.rows,t('Filas','Rows')],[data.headers.length,t('Columnas','Columns')],[stats.missing,t('Vacíos','Blanks')],[stats.duplicates,t('Duplicados','Duplicates')]].map(([value,label])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  {!compact&&<><div className="dw-cleaning"><label><input type="checkbox" checked={trim} onChange={e=>setTrim(e.target.checked)}/>{t('Recortar espacios','Trim whitespace')}</label><label><input type="checkbox" checked={dedupe} onChange={e=>setDedupe(e.target.checked)}/>{t('Quitar filas idénticas','Remove identical rows')}</label></div><label className="dw-search">{t('Buscar en todas las columnas','Search all columns')}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('Ej. Papelería','e.g. Papelería')}/></label></>}
  {!compact&&<><p className="dw-eyebrow dw-mapheading">{t('CÓMO ESTÁ ORGANIZADO','HOW IT IS ORGANIZED')}</p><CsvMindMap lang={lang} file={source} rows={stats.rows} columns={profile} hover={hover} onHover={setHover} runKey={`${version}-${trim}-${dedupe}`}/></>}
  <div className="dw-tablewrap" tabIndex={0} role="region" aria-label={t('Vista previa de datos','Data preview')}><table><thead><tr>{data.headers.map((h,i)=><th key={i} scope="col" className={hover===i?'dw-hot':''} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}>{h}</th>)}</tr></thead><tbody>{visible.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j} className={hover===j?'dw-hot':''}>{v.trim()?v:<span className="dw-empty">{t('vacío','blank')}</span>}</td>)}</tr>)}</tbody></table>{!matches.length&&<p className="dw-noresults">{t('Sin coincidencias. Prueba otra búsqueda.','No matches. Try another search.')}</p>}</div>
  <div className="dw-footer"><span>{t(`${visible.length} de ${matches.length} filas${query?' coincidentes':''}`,`${visible.length} of ${matches.length}${query?' matching':''} rows`)}</span>{compact?<a href="#data">{t('Abrir herramienta','Open tool')} <span aria-hidden="true">↗</span></a>:<button className="dw-primary" disabled={phase==='parse'} onClick={download}>{t('Descargar CSV','Download CSV')} <span aria-hidden="true">↓</span></button>}</div>
  {!compact&&<p className="dw-help dw-note">{t('La descarga incluye todas las filas después de limpiar, sin aplicar la búsqueda. Las fórmulas se exportan como texto seguro. No se envían archivos a ningún servidor.','Download includes all cleaned rows, regardless of search. Formulas are exported as safe text. Files are never sent to a server.')}</p>}
 </div>;
}
