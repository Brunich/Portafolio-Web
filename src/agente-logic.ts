// Asistente de IA local (en desarrollo): lo que decide el agente, sin interfaz y sin modelo.
// En la demo del portafolio estas reglas simulan al modelo; en la versión real un modelo local (Qwen3 8B con Ollama)
// elige la herramienta, y estas mismas reglas quedan como barandal: sólo lee, cita la fuente y escala lo que no sabe.

export const fold = (s: string) => s.toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();

// ---------- Atención al cliente: una refaccionaria de ejemplo ----------
export type Product = { sku: string; name: string; price: number; stock: number; tags: string[] };
export type Order = { folio: string; status: string; eta: string };
export const SHOP = {
 name: 'Refaccionaria Del Norte',
 hours: 'lunes a viernes de 8:00 a 19:00 y sábados de 9:00 a 14:00',
 address: 'Av. Ruiz Cortines 1450, Monterrey',
 phone: '81 5550 0199',
 products: [
  { sku: 'BAL-2211', name: 'Balatas delanteras Tsuru', price: 489, stock: 12, tags: ['balatas', 'frenos', 'tsuru', 'nissan'] },
  { sku: 'BAL-3109', name: 'Balatas delanteras Aveo', price: 545, stock: 0, tags: ['balatas', 'frenos', 'aveo', 'chevrolet'] },
  { sku: 'ACE-5W30', name: 'Aceite sintético 5W-30 (4 L)', price: 720, stock: 30, tags: ['aceite', '5w30', 'sintetico'] },
  { sku: 'FIL-A120', name: 'Filtro de aire Versa', price: 210, stock: 7, tags: ['filtro', 'aire', 'versa', 'nissan'] },
  { sku: 'BAT-4210', name: 'Batería 42 meses', price: 2350, stock: 4, tags: ['bateria', 'acumulador'] },
  { sku: 'BUJ-IR4', name: 'Bujías de iridio (juego de 4)', price: 980, stock: 9, tags: ['bujias', 'iridio', 'afinacion'] },
 ] as Product[],
 orders: [
  { folio: 'P-1042', status: 'en camino', eta: 'hoy antes de las 18:00' },
  { folio: 'P-1043', status: 'listo para recoger en mostrador', eta: 'desde las 12:00' },
  { folio: 'P-1044', status: 'esperando pieza del proveedor', eta: 'jueves' },
 ] as Order[],
};

export type Step = { tool: string; detail: string };
export type Reply = { text: string; intent: 'saludo' | 'horario' | 'ubicacion' | 'precio' | 'existencia' | 'pedido' | 'escalar'; source?: string; steps: Step[]; escalate?: boolean };
const money = (n: number) => `$${n.toLocaleString('es-MX')}`;

function findProducts(q: string) {
 const words = fold(q).split(' ').filter(w => w.length > 2);
 const scored = SHOP.products.map(p => ({ p, s: words.filter(w => p.tags.some(t => t.startsWith(w) || w.startsWith(t)) || fold(p.name).includes(w)).length }));
 const best = Math.max(0, ...scored.map(x => x.s));
 return best ? scored.filter(x => x.s === best).map(x => x.p) : [];
}

export function answer(message: string): Reply {
 const q = fold(message);
 if (!q) return { text: '¿En qué te ayudo?', intent: 'saludo', steps: [] };
 const folio = /\bp ?-? ?(\d{4})\b/.exec(q);
 if (folio || /pedido|orden|folio|envio|llega/.test(q)) {
  const o = folio && SHOP.orders.find(x => x.folio === `P-${folio[1]}`);
  if (o) return { text: `Tu pedido ${o.folio} está ${o.status}; ${o.eta}.`, intent: 'pedido', source: `pedidos · ${o.folio}`, steps: [{ tool: 'buscar_pedido', detail: `folio = ${o.folio}` }] };
  if (folio) return { text: `No encuentro el pedido P-${folio[1]}. Te comunico con una persona para revisarlo.`, intent: 'escalar', escalate: true, steps: [{ tool: 'buscar_pedido', detail: `folio = P-${folio[1]} · sin resultado` }, { tool: 'escalar', detail: 'pedido no encontrado' }] };
  return { text: '¿Me compartes tu número de pedido? Empieza con P, por ejemplo P-1042.', intent: 'pedido', steps: [] };
 }
 if (/horario|hora|abren|cierran|abierto/.test(q)) return { text: `Abrimos ${SHOP.hours}.`, intent: 'horario', source: 'datos del negocio · horario', steps: [{ tool: 'datos_negocio', detail: 'horario' }] };
 if (/donde|direccion|ubicacion|ubicados|sucursal/.test(q)) return { text: `Estamos en ${SHOP.address}.`, intent: 'ubicacion', source: 'datos del negocio · dirección', steps: [{ tool: 'datos_negocio', detail: 'dirección' }] };
 const found = findProducts(q);
 if (found.length && /precio|cuesta|cuanto|vale|costo/.test(q)) {
  const p = found[0];
  return { text: `${p.name}: ${money(p.price)}${p.stock ? `, con ${p.stock} en existencia` : '; ahorita está agotado'}.`, intent: 'precio', source: `catálogo · ${p.sku}`, steps: [{ tool: 'buscar_catalogo', detail: `«${message.trim()}» → ${p.sku}` }] };
 }
 if (found.length) {
  const list = found.slice(0, 3).map(p => `${p.name} (${money(p.price)}${p.stock ? '' : ', agotado'})`).join('; ');
  return { text: `Tengo esto: ${list}. ¿Cuál te interesa?`, intent: 'existencia', source: `catálogo · ${found.slice(0, 3).map(p => p.sku).join(', ')}`, steps: [{ tool: 'buscar_catalogo', detail: `${found.length} coincidencias` }] };
 }
 if (/^(hola|buenas|buen dia|buenos dias|buenas tardes|que tal)\b/.test(q)) return { text: `¡Hola! Soy el asistente de ${SHOP.name}. Te ayudo con precios, existencias, horario o el estado de tu pedido.`, intent: 'saludo', steps: [] };
 // Lo que no está en sus datos no se inventa: se pasa a una persona.
 return { text: `Eso no lo tengo en mis datos. Te comunico con una persona del mostrador (${SHOP.phone}).`, intent: 'escalar', escalate: true, steps: [{ tool: 'escalar', detail: 'sin fuente para contestar' }] };
}

// ---------- Consultas a la base interna, sólo lectura ----------
export type Query = { ok: true; sql: string; explain: string } | { ok: false; reason: string };
const WRITE = /\b(borra|borrar|elimina|eliminar|actualiza|actualizar|modifica|cambia|cambiar|inserta|agrega|agregar|drop|delete|update|insert)\b/;
const LINE = /\b(?:linea|l) ?([123])\b/;

// De pregunta en español a SQL con plantillas. El modelo real propone la consulta; esta capa decide si se deja pasar.
export function toSql(question: string): Query {
 const q = fold(question);
 if (WRITE.test(q)) return { ok: false, reason: 'El asistente sólo lee la base: no borra, no cambia ni agrega datos. Eso lo hace una persona desde su sistema.' };
 const line = LINE.exec(q)?.[1], where: string[] = [];
 if (line) where.push(`linea = 'L${line}'`);
 const w = (extra?: string) => { const all = extra ? [...where, extra] : where; return all.length ? ` WHERE ${all.join(' AND ')}` : ''; };
 if (/abiert|pendiente|sin cerrar/.test(q)) return { ok: true, sql: `SELECT folio, linea, defecto, severidad, abierta_desde FROM incidencias${w("estado = 'abierta'")} ORDER BY abierta_desde`, explain: 'Incidencias que siguen abiertas' + (line ? ` en la L${line}` : '') };
 if (/rechaz|scrap|defectuos/.test(q)) return { ok: true, sql: `SELECT linea, SUM(rechazadas) AS rechazadas, ROUND(100.0 * SUM(rechazadas) / SUM(revisadas), 1) AS pct FROM lotes${w()} GROUP BY linea ORDER BY pct DESC`, explain: 'Porcentaje de rechazo por línea' };
 if (/defecto|falla|problema/.test(q) && /mas|comun|frecuente|top/.test(q)) return { ok: true, sql: `SELECT defecto, COUNT(*) AS veces FROM incidencias${w()} GROUP BY defecto ORDER BY veces DESC LIMIT 5`, explain: 'Defectos más frecuentes' };
 if (/produ|piezas|cumpl|plan/.test(q)) return { ok: true, sql: `SELECT linea, SUM(plan) AS plan, SUM(producidas) AS producidas, ROUND(100.0 * SUM(producidas) / SUM(plan), 1) AS cumplimiento FROM lotes${w()} GROUP BY linea ORDER BY linea`, explain: 'Producción contra el plan' };
 if (/lote/.test(q)) return { ok: true, sql: `SELECT lote, linea, fecha, producidas, rechazadas FROM lotes${w()} ORDER BY fecha DESC, lote LIMIT 10`, explain: 'Últimos lotes' };
 return { ok: false, reason: 'No encontré a qué parte de la base se refiere. Prueba con incidencias abiertas, rechazo, defectos o producción; la versión con modelo entiende preguntas más libres.' };
}

// Segunda barrera: aunque la consulta venga del modelo, sólo pasan SELECT sobre tablas permitidas.
export const ALLOWED_TABLES = ['lotes', 'incidencias'];
export function isSafeSql(sql: string) {
 const s = sql.trim().toLowerCase();
 if (!s.startsWith('select') || s.includes(';')) return false;
 if (/\b(insert|update|delete|drop|alter|create|attach|pragma|replace)\b/.test(s)) return false;
 const tables = [...s.matchAll(/\b(?:from|join)\s+([a-z_]+)/g)].map(m => m[1]);
 return tables.length > 0 && tables.every(t => ALLOWED_TABLES.includes(t));
}

export const SAMPLE_DB = `
CREATE TABLE lotes (lote TEXT, linea TEXT, fecha TEXT, plan INT, producidas INT, revisadas INT, rechazadas INT);
INSERT INTO lotes VALUES
('4411','L1','2026-03-09',400,392,392,4),('4412','L2','2026-03-09',330,318,318,7),('4413','L3','2026-03-09',300,291,291,5),
('4414','L1','2026-03-09',400,377,377,3),('4415','L2','2026-03-09',330,262,262,19),('4416','L3','2026-03-09',300,286,286,6),
('4420','L1','2026-03-10',400,396,396,3),('4421','L2','2026-03-10',330,322,322,6),('4422','L3','2026-03-10',300,288,288,4),
('4423','L1','2026-03-10',400,351,351,5),('4424','L2','2026-03-10',330,315,330,6),('4425','L3','2026-03-10',300,279,279,4);
CREATE TABLE incidencias (folio TEXT, linea TEXT, defecto TEXT, severidad TEXT, estado TEXT, abierta_desde TEXT);
INSERT INTO incidencias VALUES
('INC-226','L1','Rayón en puerta','Menor','cerrada','2026-03-09 07:40'),('INC-229','L3','Fuga en sello de parabrisas','Mayor','abierta','2026-03-09 05:16'),
('INC-231','L2','Burbuja en pintura','Mayor','abierta','2026-03-10 08:52'),('INC-232','L1','Torque fuera de rango','Crítica','abierta','2026-03-10 07:40'),
('INC-233','L2','Fuga en sello de parabrisas','Mayor','cerrada','2026-03-10 11:05'),('INC-234','L2','Holgura en puerta','Menor','abierta','2026-03-10 13:20');
`;

// ---------- Dónde instalarlo y cuánto cuesta (precios consultados el 28-09-2026) ----------
export type Need = { users: number; messagesPerDay: number; hasPc: boolean; noMonthly: boolean };
export type Option = { id: 'pc' | 'vps' | 'gpu' | 'hora'; name: [string, string]; monthlyUsd: number; upfrontUsd: number; fits: [string, string] };
export const OPTIONS: Option[] = [
 { id: 'pc', name: ['PC del negocio con RTX 3060 de 12 GB', 'Business PC with a 12 GB RTX 3060'], monthlyUsd: 0, upfrontUsd: 1100, fits: ['Sin mensualidad; los datos nunca salen del local.', 'No monthly fee; data never leaves the premises.'] },
 { id: 'vps', name: ['Servidor sin GPU (8 vCPU, 24 GB)', 'CPU-only server (8 vCPU, 24 GB)'], monthlyUsd: 20, upfrontUsd: 0, fits: ['Barato, pero lento: para pocas consultas al día.', 'Cheap but slow: for a few queries a day.'] },
 { id: 'gpu', name: ['Servidor con GPU de 24 GB (Hetzner GEX45)', '24 GB GPU server (Hetzner GEX45)'], monthlyUsd: 250, upfrontUsd: 245, fits: ['Rápido y sin equipo en el local; varios usuarios a la vez.', 'Fast, nothing on premises; several users at once.'] },
 { id: 'hora', name: ['GPU por hora (RTX 4090)', 'Hourly GPU (RTX 4090)'], monthlyUsd: 248, upfrontUsd: 0, fits: ['Para demos y pruebas; se apaga cuando no se usa.', 'For demos and trials; switch it off when idle.'] },
];
export function recommend(n: Need): Option['id'] {
 if (n.hasPc || n.noMonthly) return 'pc';
 if (n.messagesPerDay <= 40 && n.users <= 2) return 'vps';
 return 'gpu';
}
