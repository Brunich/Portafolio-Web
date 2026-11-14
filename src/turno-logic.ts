// Lógica de Entrega de turno, sin interfaz: reglas para mover incidencias, tiempos y el resumen.
export type Status = 'open' | 'doing' | 'closed';
export type Sev = 'Crítica' | 'Mayor' | 'Menor';
export type Incident = { id: string; line: string; lot: string; defect: string; sev: Sev; status: Status; owner: string; action: string; photo: string; at: number; closedAt?: number };
export type Log = { at: number; id: string; text: string; tone: 'new' | 'move' | 'ok' | 'err' | 'info' };
export const OWNERS = ['R. Garza', 'L. Treviño', 'A. Cantú', 'M. Salinas'];
export const SEV_EN: Record<Sev, string> = { 'Crítica': 'Critical', 'Mayor': 'Major', 'Menor': 'Minor' };
export const RANK: Record<Sev, number> = { 'Crítica': 0, 'Mayor': 1, 'Menor': 2 };
export const SLA: Record<Sev, number> = { 'Crítica': 2, 'Mayor': 8, 'Menor': 24 }; // horas para cerrarla
export const H = 60 * 60 * 1000;

export const sample = (now = Date.now()): Incident[] => [
 { id: 'INC-232', line: 'L1', lot: '4420', defect: 'Torque fuera de rango en rueda', sev: 'Crítica', status: 'doing', owner: 'R. Garza', action: 'Recalibrar la llave 3', photo: '', at: now - 2.6 * H },
 { id: 'INC-231', line: 'L2', lot: '4424', defect: 'Burbuja en pintura de cofre', sev: 'Mayor', status: 'open', owner: '', action: '', photo: '', at: now - 1.4 * H },
 { id: 'INC-229', line: 'L3', lot: '4422', defect: 'Fuga en sello de parabrisas', sev: 'Mayor', status: 'doing', owner: 'L. Treviño', action: 'Cambiar lote de sellador', photo: 'demo', at: now - 5 * H },
 { id: 'INC-226', line: 'L1', lot: '4411', defect: 'Rayón en puerta trasera', sev: 'Menor', status: 'closed', owner: 'A. Cantú', action: 'Pulido y reinspección', photo: 'demo', at: now - 6.5 * H, closedAt: now - 4.9 * H },
 { id: 'INC-221', line: 'L2', lot: '4412', defect: 'Burbuja en pintura del cofre', sev: 'Mayor', status: 'closed', owner: 'M. Salinas', action: 'Repintado y limpieza de pistola', photo: 'demo', at: now - 30 * H, closedAt: now - 25 * H },
];

// Líneas y personas de la planta: cada quien las cambia por las suyas.
export type Config = { lines: string[]; people: string[] };
export const DEFAULT_CONFIG: Config = { lines: ['L1', 'L2', 'L3'], people: [...OWNERS] };

// Lo que se entregó en cada cambio de turno, para que el que llega pueda ver qué se dijo antes.
export type Handover = { at: number; shift: string; pending: number; late: number; orphan: number; closed: number; text: string };

// Un defecto que vuelve en la misma línea no se arregla con otra incidencia: pide una acción de fondo (8D).
const STOP = new Set(['en', 'de', 'del', 'la', 'el', 'los', 'las', 'por', 'con', 'y', 'a', 'al']);
export const defectKey = (s: string) => s.toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w)).join(' ');
export function repeats(items: Incident[], days = 7, now = Date.now()) {
 const m = new Map<string, Incident[]>();
 items.filter(i => now - i.at <= days * 24 * H).forEach(i => { const k = `${i.line}|${defectKey(i.defect)}`; m.set(k, [...(m.get(k) ?? []), i]); });
 return [...m.values()].filter(g => g.length >= 2).map(g => ({ line: g[0].line, defect: g[0].defect, count: g.length, ids: g.map(i => i.id), open: g.some(i => i.status !== 'closed'), last: Math.max(...g.map(i => i.at)) })).sort((a, b) => b.count - a.count || b.last - a.last);
}
export const sampleLog = (items: Incident[]): Log[] => items.map(i => ({ at: i.at, id: i.id, tone: 'new' as const, text: `registrada · ${i.line} · lote ${i.lot} · ${i.sev.toUpperCase()}` })).sort((a, b) => b.at - a.at); // la más nueva arriba, como en la consola

// Turnos de planta: matutino 06–14, vespertino 14–22, nocturno 22–06.
export function shiftNow(d = new Date()) {
 const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
 const [name, start, next] = (h >= 6 && h < 14 ? ['Matutino', 6, 'vespertino'] : h >= 14 && h < 22 ? ['Vespertino', 14, 'nocturno'] : ['Nocturno', 22, 'matutino']) as [string, number, string];
 const elapsed = (h - start + 24) % 24;
 return { name, next, progress: elapsed / 8, left: Math.max(0, 8 - elapsed) };
}

// La regla del tablero: nada empieza sin responsable y nada se cierra sin responsable y foto.
export type MoveCheck = { ok: true } | { ok: false; why: 'owner' | 'evidence' | 'same' };
export function canMove(i: Incident, to: Status): MoveCheck {
 if (i.status === to) return { ok: false, why: 'same' };
 if (to !== 'open' && !i.owner) return { ok: false, why: 'owner' };
 if (to === 'closed' && !i.photo) return { ok: false, why: 'evidence' };
 return { ok: true };
}

// Horas desde que se registró, y qué tanto del SLA ya se comió (1 = fuera de tiempo).
export const ageHours = (i: Incident, now = Date.now()) => (now - i.at) / H;
export const slaUsed = (i: Incident, now = Date.now()) => Math.min(1, ageHours(i, now) / SLA[i.sev]);
export const isLate = (i: Incident, now = Date.now()) => i.status !== 'closed' && ageHours(i, now) > SLA[i.sev];

// Qué tan rápido se cierran: promedio de horas desde que se registró hasta que se cerró, y cuántas dentro de su SLA.
export function closeStats(items: Incident[]) {
 const done = items.filter(i => i.status === 'closed' && i.closedAt);
 const hours = done.map(i => (i.closedAt! - i.at) / H);
 const bySev = (['Crítica', 'Mayor', 'Menor'] as Sev[]).map(s => { const h = done.filter(i => i.sev === s).map(i => (i.closedAt! - i.at) / H); return [s, h.length ? h.reduce((a, b) => a + b, 0) / h.length : null] as const; });
 return { n: done.length, avg: hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : null, onTime: done.filter(i => (i.closedAt! - i.at) / H <= SLA[i.sev]).length, bySev };
}
export const fmtHours = (h: number) => h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

// Filas para el Excel del mes: todo el historial, con cuánto tardó cada cierre.
export function exportRows(items: Incident[], es: boolean) {
 const t = (a: string, b: string) => (es ? a : b), d = (n?: number) => n ? new Date(n).toLocaleString(es ? 'es-MX' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }) : '';
 const state: Record<Status, string> = { open: t('Abierta', 'Open'), doing: t('En curso', 'In progress'), closed: t('Cerrada', 'Closed') };
 return [[t('Folio', 'ID'), t('Línea', 'Line'), t('Lote', 'Batch'), t('Defecto', 'Defect'), t('Severidad', 'Severity'), t('Estado', 'Status'), t('Responsable', 'Owner'), t('Acción', 'Action'), t('Registrada', 'Logged'), t('Cerrada', 'Closed'), t('Horas para cerrar', 'Hours to close'), t('Dentro de tiempo', 'On time')],
  ...[...items].sort((a, b) => a.at - b.at).map(i => { const h = i.closedAt ? Math.round((i.closedAt - i.at) / H * 10) / 10 : '';
   return [i.id, i.line, i.lot, i.defect, es ? i.sev : SEV_EN[i.sev], state[i.status], i.owner, i.action, d(i.at), d(i.closedAt), h, h === '' ? '' : (h as number) <= SLA[i.sev] ? t('sí', 'yes') : 'no']; })];
}

export const pendingOf = (items: Incident[]) => items.filter(i => i.status !== 'closed').sort((a, b) => RANK[a.sev] - RANK[b.sev] || a.at - b.at);
export const nextId = (items: Incident[]) => `INC-${Math.max(232, ...items.map(i => Number(i.id.slice(4)) || 0)) + 1}`;
// Cada planta numera sus lotes a su manera (4480, A-2311, 26L0457): letras, números y guiones.
export const validLot = (lot: string) => /^[A-Za-z0-9][A-Za-z0-9-]{2,19}$/.test(lot.trim());

// El texto que se manda al siguiente turno (WhatsApp o portapapeles).
export function summaryText(items: Incident[], es: boolean, when = new Date(), now = Date.now()) {
 const t = (a: string, b: string) => (es ? a : b);
 const pending = pendingOf(items), orphan = pending.filter(i => !i.owner).length, late = pending.filter(i => isLate(i, now)).length;
 return [
  t(`Entrega de turno · ${when.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}`, `Shift handover · ${when.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`),
  t(`${pending.length} pendientes${orphan ? `, ${orphan} sin responsable` : ''}${late ? `, ${late} fuera de tiempo` : ''}:`, `${pending.length} open${orphan ? `, ${orphan} without owner` : ''}${late ? `, ${late} overdue` : ''}:`),
  ...pending.map(i => `• [${es ? i.sev : SEV_EN[i.sev]}] ${i.id} ${i.defect} (${i.line}, ${t('lote', 'batch')} ${i.lot}) — ${i.owner || t('SIN RESPONSABLE', 'NO OWNER')}${i.action ? ` · ${i.action}` : ''}`),
 ].join('\n');
}
