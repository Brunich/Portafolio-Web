// Comparar dos cortes del mismo reporte (el de ayer y el de hoy): qué filas son nuevas, cuáles ya no están
// y qué celdas cambiaron. Las filas se emparejan por una columna llave (folio, id…) que se adivina sola.
export type Table = { headers: string[]; rows: string[][] };
export type CellChange = { column: string; before: string; after: string };
export type Changed = { key: string; row: string[]; changes: CellChange[] };
export type Diff = {
 key: string | null; // columna llave; null = sin llave, se compara la fila completa
 added: string[][]; removed: string[][]; changed: Changed[]; same: number;
 newColumns: string[]; goneColumns: string[]; duplicates: number;
};

const fold = (s: string) => s.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const cell = (v: string | undefined) => (v ?? '').trim();

// La llave: una columna con el mismo nombre en los dos archivos, casi sin vacíos ni repetidos (hasta 5 %: un reporte
// real trae su folio duplicado de vez en cuando, y eso se avisa aparte), que más filas empareja.
// Ante un empate gana la que se llama como llave (folio, id, clave…) y luego la que va más a la izquierda.
export function guessKey(a: Table, b: Table): string | null {
 const LIKE = /^(id|folio|clave|codigo|sku|lote|numero|no|orden|pedido|ticket|matricula)/;
 let best: { name: string; score: number } | null = null;
 a.headers.forEach((h, i) => {
  const j = b.headers.findIndex(x => fold(x) === fold(h));
  if (j < 0) return;
  const va = a.rows.map(r => cell(r[i])), vb = b.rows.map(r => cell(r[j]));
  const loose = (v: string[]) => v.filter(x => !x).length + v.length - new Set(v.filter(Boolean)).size > v.length * 0.05;
  if (!va.length || !vb.length || loose(va) || loose(vb)) return;
  const inA = new Set(va), shared = vb.filter(v => inA.has(v)).length;
  const score = shared / Math.max(1, Math.min(va.length, vb.length)) + (LIKE.test(fold(h)) ? 0.5 : 0) - i * 0.001;
  if (shared && (!best || score > best.score)) best = { name: h, score };
 });
 return best ? (best as { name: string }).name : null;
}

export function compareTables(a: Table, b: Table, key = guessKey(a, b)): Diff {
 const colsB = b.headers.map(fold), colsA = a.headers.map(fold);
 const shared = a.headers.map((h, i) => ({ h, i, j: colsB.indexOf(fold(h)) })).filter(c => c.j >= 0);
 const newColumns = b.headers.filter(h => !colsA.includes(fold(h))), goneColumns = a.headers.filter(h => !colsB.includes(fold(h)));
 if (!key) {
  // Sin llave: una fila es «la misma» si todas sus celdas en común coinciden (cuenta repetidas).
  const sig = (r: string[], pick: (c: typeof shared[number]) => number) => shared.map(c => cell(r[pick(c)])).join('\u0001');
  const pool = new Map<string, number>(); a.rows.forEach(r => { const s = sig(r, c => c.i); pool.set(s, (pool.get(s) ?? 0) + 1); });
  const added: string[][] = []; let same = 0;
  b.rows.forEach(r => { const s = sig(r, c => c.j), n = pool.get(s) ?? 0; if (n) { pool.set(s, n - 1); same++; } else added.push(r); });
  const left = new Map(pool), removed = a.rows.filter(r => { const s = sig(r, c => c.i), n = left.get(s) ?? 0; if (n) { left.set(s, n - 1); return true; } return false; });
  return { key: null, added, removed, changed: [], same, newColumns, goneColumns, duplicates: 0 };
 }
 const ka = a.headers.findIndex(h => fold(h) === fold(key)), kb = b.headers.findIndex(h => fold(h) === fold(key));
 const byA = new Map<string, string[]>(); let duplicates = 0;
 a.rows.forEach(r => { const k = cell(r[ka]); if (byA.has(k)) duplicates++; else byA.set(k, r); });
 const seen = new Set<string>(), added: string[][] = [], changed: Changed[] = []; let same = 0;
 b.rows.forEach(r => {
  const k = cell(r[kb]);
  if (seen.has(k)) { duplicates++; return; }
  seen.add(k);
  const old = byA.get(k);
  if (!old) { added.push(r); return; }
  const changes = shared.filter(c => c.i !== ka && cell(old[c.i]) !== cell(r[c.j])).map(c => ({ column: c.h, before: cell(old[c.i]), after: cell(r[c.j]) }));
  if (changes.length) changed.push({ key: k, row: r, changes }); else same++;
 });
 const removed = [...byA].filter(([k]) => !seen.has(k)).map(([, r]) => r);
 return { key, added, removed, changed, same, newColumns, goneColumns, duplicates };
}

// Qué columnas cambian más: para decir «casi todo el cambio está en estatus».
export function changesByColumn(d: Diff) {
 const m = new Map<string, number>();
 d.changed.forEach(c => c.changes.forEach(x => m.set(x.column, (m.get(x.column) ?? 0) + 1)));
 return [...m].sort((x, y) => y[1] - x[1]);
}

// Todo el resultado en una tabla, para descargarla: tipo de cambio, llave, columna, antes y después.
export function diffRows(d: Diff, headersB: string[], headersA: string[]): string[][] {
 const k = (r: string[], hs: string[]) => d.key ? r[hs.findIndex(h => fold(h) === fold(d.key!))] ?? '' : '';
 return [
  ...d.added.map(r => ['nueva', k(r, headersB), '', '', r.join(' | ')]),
  ...d.removed.map(r => ['ya no está', k(r, headersA), '', r.join(' | '), '']),
  ...d.changed.flatMap(c => c.changes.map(x => ['cambió', c.key, x.column, x.before, x.after])),
 ];
}
