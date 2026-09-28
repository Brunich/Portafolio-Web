import { useEffect, useRef, useState } from 'react';
import type { Database, SqlJsStatic } from 'sql.js';
import { PaperPlaneRight, Lock, UserSwitch, Database as DbIcon } from '@phosphor-icons/react';
import { answer, toSql, isSafeSql, recommend, OPTIONS, SAMPLE_DB, SHOP } from './agente-logic';
import type { Reply } from './agente-logic';
import './agente.css';

// Asistente de IA local, en desarrollo: una simulación honesta de lo que hará.
// Aquí las respuestas salen de reglas; en la versión real las da un modelo local y estas reglas lo vigilan.
type Tab = 'chat' | 'db' | 'quote' | 'config';
type Msg = { from: 'user' | 'bot'; text: string; reply?: Reply };

let engine: Promise<SqlJsStatic> | undefined;
const loadEngine = () => engine ??= Promise.all([import('sql.js'), import('sql.js/dist/sql-wasm.wasm?url')]).then(([m, w]) => m.default({ locateFile: () => w.default }));

const CONFIG = `# agente.yaml — lo que el negocio decide, sin tocar código
negocio: Suministros Industriales Norte
modelo: qwen3:8b          # corre en el equipo del negocio con Ollama
tono: amable, breve, de usted
herramientas:
  catalogo:  { archivo: catalogo.xlsx }
  pedidos:   { base: postgres://solo_lectura@local/pedidos, tablas: [pedidos] }
  datos_negocio: { horario: "L-V 8:00-19:00, S 9:00-14:00" }
reglas:
  - nunca escribir en la base (usuario de sólo lectura)
  - citar la fuente de cada dato
  - si no hay fuente, escalar a una persona
escalar_a: whatsapp:+52 81 5550 0199
registro: conversaciones 30 días, sin datos de tarjeta`;

function Chat({ es }: { es: boolean }) {
 const t = (a: string, b: string) => (es ? a : b);
 const [msgs, setMsgs] = useState<Msg[]>(() => [{ from: 'bot', text: answer('hola').text }]);
 const [text, setText] = useState('');
 const list = useRef<HTMLOListElement>(null);
 useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' }); }, [msgs]);
 const send = (q: string) => { if (!q.trim()) return; const r = answer(q); setMsgs(m => [...m, { from: 'user', text: q }, { from: 'bot', text: r.text, reply: r }]); setText(''); };
 const last = [...msgs].reverse().find(m => m.reply)?.reply;
 const tries = [t('¿Cuánto cuesta el rodamiento 6205?', 'How much is the 6205 bearing?'), t('¿Tienen aceite hidráulico?', 'Do you have hydraulic oil?'), t('Mi pedido P-1043', 'My order P-1043'), t('¿Hacen factura con otro RFC?', 'Can you invoice another tax ID?')];
 return <div className="ag-chat">
  <div className="ag-phone">
   <header><span className="ag-avatar">SN</span><div><strong>{SHOP.name}</strong><small><Lock size={11} weight="bold"/>{t('Asistente local · tus datos no salen', 'Local assistant · your data stays')}</small></div></header>
   <ol ref={list} aria-live="polite">{msgs.map((m, i) => <li key={i} className={`ag-msg ${m.from}${m.reply?.escalate ? ' esc' : ''}`}>{m.text}{m.reply?.source && <small>{t('Fuente', 'Source')}: {m.reply.source}</small>}{m.reply?.escalate && <small><UserSwitch size={12}/> {t('Pasado a una persona', 'Handed to a person')}</small>}</li>)}</ol>
   <form onSubmit={e => { e.preventDefault(); send(text); }}><input value={text} onChange={e => setText(e.target.value)} placeholder={t('Escribe como cliente…', 'Type as a customer…')} aria-label={t('Mensaje', 'Message')}/><button type="submit" aria-label={t('Enviar', 'Send')}><PaperPlaneRight size={18} weight="fill"/></button></form>
  </div>
  <aside className="ag-trace">
   <p className="ag-label">{t('Prueba con', 'Try')}</p>
   <div className="ag-tries">{tries.map(q => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>
   <p className="ag-label">{t('Qué hizo el agente', 'What the agent did')}</p>
   {last ? <ol className="ag-steps"><li><b>{t('Intención', 'Intent')}</b><span>{last.intent}</span></li>{last.steps.map((s, i) => <li key={i}><b>{s.tool}</b><span>{s.detail}</span></li>)}{last.source && <li><b>{t('Cita', 'Cites')}</b><span>{last.source}</span></li>}</ol> : <p className="ag-muted">{t('Escribe algo y aquí ves qué herramienta usó y de dónde sacó el dato.', 'Type something to see which tool it used and where the data came from.')}</p>}
   <p className="ag-sim">{t('Simulación en tu navegador: las respuestas salen de reglas. En la versión real las escribe un modelo local (Qwen3 8B con Ollama) y estas mismas reglas lo vigilan.', 'Simulated in your browser with rules. The real version writes answers with a local model (Qwen3 8B on Ollama), with these same rules as guardrails.')}</p>
  </aside>
 </div>;
}

function DbAsk({ es }: { es: boolean }) {
 const t = (a: string, b: string) => (es ? a : b);
 const db = useRef<Database | null>(null);
 const [q, setQ] = useState(t('¿Qué incidencias siguen abiertas en la línea 2?', 'Which incidents are still open on line 2?'));
 const [out, setOut] = useState<{ sql?: string; explain?: string; cols?: string[]; rows?: unknown[][]; error?: string } | null>(null);
 async function run(question = q) {
  const r = toSql(question);
  if (!r.ok) { setOut({ error: r.reason }); return; }
  if (!isSafeSql(r.sql)) { setOut({ error: t('Consulta bloqueada: no es de sólo lectura.', 'Query blocked: not read-only.') }); return; }
  if (!db.current) { const SQL = await loadEngine(); db.current = new SQL.Database(); db.current.run(SAMPLE_DB); }
  const res = db.current.exec(r.sql)[0];
  setOut({ sql: r.sql, explain: r.explain, cols: res?.columns ?? [], rows: res?.values ?? [] });
 }
 useEffect(() => { void run(); /* primera consulta de ejemplo */ }, []);
 const tries = es ? ['¿Qué incidencias siguen abiertas en la línea 2?', 'Rechazo por línea', 'Defectos más comunes', 'Producción contra el plan', 'Borra las incidencias cerradas'] : ['incidencias abiertas en la línea 2', 'rechazo por línea', 'defectos más comunes', 'producción contra el plan', 'borra las incidencias cerradas'];
 return <div className="ag-db">
  <form className="ag-ask" onSubmit={e => { e.preventDefault(); void run(); }}><DbIcon size={20}/><input value={q} onChange={e => setQ(e.target.value)} aria-label={t('Pregunta a la base', 'Ask the database')}/><button type="submit" className="dw-primary">{t('Preguntar', 'Ask')}</button></form>
  <div className="ag-tries">{tries.map(x => <button key={x} onClick={() => { setQ(x); void run(x); }}>{x}</button>)}</div>
  {out?.error && <p className="ag-block" role="status"><Lock size={16}/>{out.error}</p>}
  {out?.sql && <>
   <p className="ag-label">{out.explain} · {t('consulta de sólo lectura', 'read-only query')}</p>
   <pre className="ag-sql"><code>{out.sql}</code></pre>
   <div className="ag-table" tabIndex={0} role="region" aria-label={t('Resultado', 'Result')}><table><thead><tr>{out.cols!.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead><tbody>{out.rows!.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{String(v)}</td>)}</tr>)}</tbody></table>{!out.rows!.length && <p className="ag-muted">{t('Sin resultados.', 'No results.')}</p>}</div>
  </>}
  <p className="ag-sim">{t('Base de ejemplo (SQLite en tu navegador). En la instalación real el agente entra con un usuario que sólo puede leer, y además cada consulta pasa por un filtro que sólo deja SELECT sobre tablas permitidas.', 'Sample database (SQLite in your browser). In a real install the agent logs in with a read-only user, and every query also passes a filter that only allows SELECT on permitted tables.')}</p>
 </div>;
}

function Quote({ es }: { es: boolean }) {
 const t = (a: string, b: string) => (es ? a : b), L = es ? 0 : 1;
 const [users, setUsers] = useState(3), [msgs, setMsgs] = useState(120), [hasPc, setHasPc] = useState(false), [noMonthly, setNoMonthly] = useState(false);
 const pick = recommend({ users, messagesPerDay: msgs, hasPc, noMonthly });
 const usd = (n: number) => `US$${n.toLocaleString('en-US')}`;
 return <div className="ag-quote">
  <div className="ag-form">
   <label>{t('Personas que lo usan a la vez', 'People using it at once')}<input type="range" min={1} max={20} value={users} onChange={e => setUsers(+e.target.value)}/><b>{users}</b></label>
   <label>{t('Mensajes o consultas al día', 'Messages or queries per day')}<input type="range" min={10} max={1000} step={10} value={msgs} onChange={e => setMsgs(+e.target.value)}/><b>{msgs}</b></label>
   <label className="ag-check"><input type="checkbox" checked={hasPc} onChange={e => setHasPc(e.target.checked)}/>{t('Ya tiene una PC con tarjeta de video', 'Already has a PC with a graphics card')}</label>
   <label className="ag-check"><input type="checkbox" checked={noMonthly} onChange={e => setNoMonthly(e.target.checked)}/>{t('Prefiere no pagar mensualidad', 'Prefers no monthly fee')}</label>
  </div>
  <ul className="ag-options">{OPTIONS.map(o => <li key={o.id} className={o.id === pick ? 'pick' : ''}>
   {o.id === pick && <span className="ag-badge">{t('Recomendado', 'Recommended')}</span>}
   <strong>{o.name[L]}</strong><p>{o.fits[L]}</p>
   <dl><div><dt>{t('Pago inicial', 'Upfront')}</dt><dd>{o.upfrontUsd ? `~${usd(o.upfrontUsd)}` : '—'}</dd></div><div><dt>{t('Al mes', 'Monthly')}</dt><dd>{o.monthlyUsd ? `~${usd(o.monthlyUsd)}` : t('$0', '$0')}</dd></div></dl>
  </li>)}</ul>
  <p className="ag-sim">{t('Costos del equipo o servidor consultados el 28-09-2026 (la PC es una estimación). La instalación y el mantenimiento se cotizan aparte.', 'Hardware and server costs checked on 2026-09-28 (the PC is an estimate). Setup and maintenance are quoted separately.')}</p>
 </div>;
}

export default function Agente({ lang }: { lang: 'es' | 'en' }) {
 const es = lang === 'es', t = (a: string, b: string) => (es ? a : b);
 const [tab, setTab] = useState<Tab>('chat');
 return <div className="ag">
  <p className="ag-dev"><span>{t('En desarrollo · aprendiendo', 'In development · learning')}</span>{t('Esta página muestra lo que hará. La versión con modelo local es el siguiente paso.', 'This page shows what it will do. The version with a local model is the next step.')}</p>
  <div className="dw-tabs nfc-tabs ag-tabs" role="tablist">{([['chat', t('Atención al cliente', 'Customer service')], ['db', t('Consultar la base', 'Query the database')], ['quote', t('Dónde instalarlo', 'Where to run it')], ['config', t('Configuración', 'Configuration')]] as const).map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>)}</div>
  {tab === 'chat' && <Chat es={es}/>}
  {tab === 'db' && <DbAsk es={es}/>}
  {tab === 'quote' && <Quote es={es}/>}
  {tab === 'config' && <div className="ag-config"><p>{t('El negocio decide qué lee el agente, cómo habla y a quién le pasa lo que no sabe, en un archivo; no hace falta tocar código.', 'The business decides what the agent reads, how it talks and who gets what it cannot answer, in one file; no code changes.')}</p><pre className="ag-sql"><code>{CONFIG}</code></pre></div>}
 </div>;
}
