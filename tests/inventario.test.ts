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
