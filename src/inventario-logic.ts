// Inventario: productos con código de barras (EAN-13, EAN-8, UPC-A o códigos internos), movimientos y lo que hay que resurtir.
export type Product = { code: string; name: string; stock: number; min: number; counted?: number; price?: number };
export type Move = { at: number; code: string; name: string; delta: number; mode: Mode };
export type Mode = 'in' | 'out' | 'count';

// Dígito verificador EAN-13: posiciones impares ×1 y pares ×3.
export const eanCheck = (twelve: string) => String((10 - [...twelve].reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0) % 10) % 10);
export const isEan13 = (code: string) => /^\d{13}$/.test(code) && eanCheck(code.slice(0, 12)) === code[12];
export const makeEan = (twelve: string) => twelve + eanCheck(twelve);
// EAN-8 (dulces, productos chicos): los siete primeros dígitos pesan 3,1,3,1…
const ean8Check = (seven: string) => String((10 - [...seven].reduce((s, d, i) => s + Number(d) * (i % 2 ? 1 : 3), 0) % 10) % 10);
export const isEan8 = (code: string) => /^\d{8}$/.test(code) && ean8Check(code.slice(0, 7)) === code[7];
export const makeEan8 = (seven: string) => seven + ean8Check(seven);

// Lo que lee la cámara, en una sola forma por producto: un UPC-A de 12 dígitos es el mismo EAN-13 con un 0 delante,
// y un código interno (Code 128) conserva letras y guiones.
export function normalizeCode(raw: string) {
 const t = raw.trim();
 if (!t) return '';
 if (/^[\d\s-]+$/.test(t)) {
  const d = t.replace(/\D/g, '');
  return d.length === 12 && isEan13('0' + d) ? '0' + d : d;
 }
 return t.toUpperCase().replace(/\s+/g, ' ');
}
export const codeKind = (code: string) => isEan13(code) ? (code.startsWith('0') ? 'UPC-A' : 'EAN-13') : isEan8(code) ? 'EAN-8' : /^\d+$/.test(code) ? 'numérico' : 'Code 128';
export const printable = (code: string) => isEan13(code) || isEan8(code);

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const R = L.map(p => [...p].map(b => (b === '0' ? '1' : '0')).join(''));
const G = R.map(p => [...p].reverse().join(''));
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

// Las 95 barras de un EAN-13 como texto de unos y ceros.
export function eanBits(code: string) {
 const d = [...code].map(Number), par = PARITY[d[0]];
 let bits = '101';
 for (let i = 1; i <= 6; i++) bits += (par[i - 1] === 'L' ? L : G)[d[i]];
 bits += '01010';
 for (let i = 7; i <= 12; i++) bits += R[d[i]];
 return bits + '101';
}

// Las 67 barras de un EAN-8: cuatro dígitos con patrón L, separador y cuatro con patrón R.
export function ean8Bits(code: string) {
 const d = [...code].map(Number);
 return '101' + d.slice(0, 4).map(n => L[n]).join('') + '01010' + d.slice(4).map(n => R[n]).join('') + '101';
}

// Etiqueta en SVG: barras, número legible y nombre del producto.
export function labelSvg(p: Product, module = 2) {
 const short = p.code.length === 8, bits = short ? ean8Bits(p.code) : eanBits(p.code), q = 11 * module, w = bits.length * module + q * 2, h = 70 * module;
 const mid = short ? 31 : 45, end = bits.length - 3;
 let bars = '';
 for (let i = 0; i < bits.length;) { if (bits[i] === '1') { let j = i; while (bits[j] === '1') j++; const guard = i < 3 || (i >= mid && i < mid + 5) || i >= end; bars += `<rect x="${q + i * module}" y="${8 * module}" width="${(j - i) * module}" height="${(guard ? 52 : 46) * module}"/>`; i = j; } else i++; }
 const esc = (s: string) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h + 16 * module}" width="${w}" height="${h + 16 * module}"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${bars}</g><text x="${w / 2}" y="${62 * module}" font-family="monospace" font-size="${7 * module}" text-anchor="middle" letter-spacing="${module}">${p.code}</text><text x="${w / 2}" y="${75 * module}" font-family="Arial, sans-serif" font-size="${6.5 * module}" font-weight="700" text-anchor="middle">${esc(p.name.slice(0, 26))}</text></svg>`;
}

// Tienda de ejemplo (productos genéricos, códigos inventados con dígito verificador válido).
export const SAMPLE: Product[] = [
 ['750100000001', 'Agua natural 1 L', 34, 24, 14], ['750100000002', 'Refresco de cola 600 ml', 12, 24, 19], ['750100000003', 'Leche entera 1 L', 18, 12, 29],
 ['750100000004', 'Pan de caja grande', 6, 8, 52], ['750100000005', 'Huevo blanco 12 pzas', 9, 6, 48], ['750100000006', 'Frijol negro 1 kg', 15, 6, 38],
 ['750100000007', 'Arroz blanco 1 kg', 4, 6, 31], ['750100000008', 'Aceite vegetal 1 L', 11, 5, 45], ['750100000009', 'Café soluble 120 g', 3, 4, 89],
 ['750100000010', 'Papel higiénico 4 rollos', 20, 10, 42],
].map(([twelve, name, stock, min, price]) => ({ code: makeEan(twelve as string), name: name as string, stock: stock as number, min: min as number, price: price as number }));

// Catálogo del proveedor (Excel o CSV): reconoce columnas por nombre y actualiza lo que ya existe.
// Las existencias sólo cambian si el archivo trae esa columna; si no, se respeta lo contado en la tienda.
const plain = (h: string) => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const pick = (headers: string[], words: string[]) => headers.findIndex(h => words.some(w => plain(h).includes(w)));
const num = (v: string | undefined) => { const n = Number((v ?? '').replace(/[$,\s]/g, '')); return Number.isFinite(n) ? n : NaN; };
export function importCatalog(products: Product[], headers: string[], rows: string[][]) {
 const c = { code: pick(headers, ['codigo', 'code', 'ean', 'sku', 'barras', 'upc']), name: pick(headers, ['producto', 'nombre', 'descripcion', 'name', 'articulo']),
  stock: pick(headers, ['existencia', 'stock', 'inventario', 'cantidad']), min: pick(headers, ['minimo', 'min']), price: pick(headers, ['precio', 'price', 'pvp']) };
 if (c.code < 0 || c.name < 0) return { products, added: 0, updated: 0, skipped: rows.length, missing: [c.code < 0 ? 'código' : '', c.name < 0 ? 'producto' : ''].filter(Boolean) };
 const out = products.map(p => ({ ...p })), at = new Map(out.map((p, i) => [p.code, i]));
 let added = 0, updated = 0, skipped = 0;
 for (const r of rows) {
  const code = normalizeCode(r[c.code] ?? ''), name = (r[c.name] ?? '').trim();
  if (!code || !name) { skipped++; continue; }
  const stock = c.stock >= 0 ? num(r[c.stock]) : NaN, min = c.min >= 0 ? num(r[c.min]) : NaN, price = c.price >= 0 ? num(r[c.price]) : NaN;
  const i = at.get(code);
  if (i === undefined) { out.push({ code, name, stock: Number.isFinite(stock) ? stock : 0, min: Number.isFinite(min) ? min : 5, ...(Number.isFinite(price) ? { price } : {}) }); at.set(code, out.length - 1); added++; }
  else { const p = out[i]; p.name = name; if (Number.isFinite(stock)) p.stock = stock; if (Number.isFinite(min)) p.min = min; if (Number.isFinite(price)) p.price = price; updated++; }
 }
 return { products: out, added, updated, skipped, missing: [] as string[] };
}

// Valor del inventario (a precio de venta) y lo vendido hoy.
export const stockValue = (ps: Product[]) => ps.reduce((s, p) => s + p.stock * (p.price ?? 0), 0);
export function soldToday(ps: Product[], moves: Move[], now = Date.now()) {
 const start = new Date(now); start.setHours(0, 0, 0, 0);
 const price = new Map(ps.map(p => [p.code, p.price ?? 0]));
 return moves.filter(m => m.mode === 'out' && m.at >= start.getTime()).reduce((s, m) => s + -m.delta * (price.get(m.code) ?? 0), 0);
}

// Lo que hay que pedir: llevar cada producto bajo mínimo al doble del mínimo.
export const shopping = (ps: Product[]) => ps.filter(p => p.stock < p.min).map(p => ({ ...p, order: p.min * 2 - p.stock }));
