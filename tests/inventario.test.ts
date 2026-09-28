import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eanBits, isEan13, makeEan, SAMPLE, shopping } from '../src/inventario-logic.ts';

test('dígito verificador y barras de un EAN-13', () => {
 assert.equal(isEan13('4006381333931'), true);
 assert.equal(isEan13('4006381333932'), false);
 assert.equal(makeEan('750100000001').length, 13);
 const bits = eanBits('4006381333931');
 assert.equal(bits.length, 95);
 assert.ok(bits.startsWith('101') && bits.endsWith('101') && bits.slice(45, 50) === '01010');
});

test('la lista de compras lleva cada producto bajo mínimo al doble del mínimo', () => {
 const list = shopping(SAMPLE);
 assert.ok(list.every(p => p.stock < p.min));
 const pan = list.find(p => p.name.startsWith('Pan'))!;
 assert.equal(pan.order, pan.min * 2 - pan.stock);
});

test('EAN-8, UPC-A y códigos internos quedan en una sola forma por producto', async () => {
 const { isEan8, makeEan8, normalizeCode, codeKind, ean8Bits, printable } = await import('../src/inventario-logic.ts');
 assert.equal(isEan8('96385074'), true); // ejemplo clásico de EAN-8
 assert.equal(isEan8('96385075'), false);
 assert.equal(makeEan8('9638507'), '96385074');
 assert.equal(ean8Bits('96385074').length, 67);
 // El mismo producto leído como UPC-A (12) o como EAN-13 (13) es un solo código.
 assert.equal(normalizeCode('036000291452'), '0036000291452');
 assert.equal(normalizeCode('0036000291452'), '0036000291452');
 assert.equal(codeKind('0036000291452'), 'UPC-A');
 assert.equal(normalizeCode(' 750 1000 00001-7 '), '7501000000017');
 assert.equal(normalizeCode('abc-123 x'), 'ABC-123 X');
 assert.equal(codeKind('ABC-123'), 'Code 128');
 assert.equal(printable('96385074') && printable('4006381333931') && !printable('ABC-123'), true);
});

test('catálogo del proveedor: agrega los nuevos, actualiza los que ya están y respeta lo contado', async () => {
 const { importCatalog, SAMPLE } = await import('../src/inventario-logic.ts');
 const agua = SAMPLE[0];
 const r = importCatalog(SAMPLE, ['Código de barras', 'Descripción', 'Precio', 'Mínimo'], [
  [agua.code, 'Agua natural 1 L', '$15.50', '30'],
  ['7501000000119', 'Galletas surtidas', '27', ''],
  ['', 'Sin código', '10', '1'],
 ]);
 assert.deepEqual([r.added, r.updated, r.skipped], [1, 1, 1]);
 const a = r.products.find(p => p.code === agua.code)!;
 assert.deepEqual([a.price, a.min, a.stock], [15.5, 30, agua.stock]);
 assert.equal(r.products.find(p => p.name === 'Galletas surtidas')!.stock, 0);
 assert.deepEqual(importCatalog(SAMPLE, ['precio'], [['1']]).missing, ['código', 'producto']);
});

test('valor en tienda y vendido hoy, a precio de venta', async () => {
 const { stockValue, soldToday } = await import('../src/inventario-logic.ts');
 const ps = [{ code: 'A', name: 'a', stock: 3, min: 1, price: 10 }, { code: 'B', name: 'b', stock: 2, min: 1 }];
 assert.equal(stockValue(ps), 30);
 const now = new Date(2026, 8, 28, 15).getTime(), ayer = now - 24 * 3600e3;
 const moves = [{ at: now - 1000, code: 'A', name: 'a', delta: -2, mode: 'out' as const }, { at: ayer, code: 'A', name: 'a', delta: -5, mode: 'out' as const }, { at: now, code: 'A', name: 'a', delta: 4, mode: 'in' as const }];
 assert.equal(soldToday(ps, moves, now), 20);
});
