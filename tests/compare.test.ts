import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../src/csv.ts';
import { compareTables, guessKey, changesByColumn, diffRows } from '../src/compare.ts';

const ayer = parseCsv('folio,estatus,piezas,inspector\nQ-1,Abierta,120,R. Garza\nQ-2,Abierta,98,L. Treviño\nQ-3,Cerrada,80,A. Cantú\nQ-4,Abierta,77,R. Garza');
const hoy = parseCsv('Folio,Estatus,Piezas,Turno\nQ-2,Cerrada,98,Matutino\nQ-3,Cerrada,80,Nocturno\nQ-1,Cerrada,121,Matutino\nQ-5,Abierta,60,Vespertino');

test('adivina la llave aunque cambien mayúsculas y el orden de las filas', () => {
 assert.equal(guessKey(ayer, hoy), 'folio');
});

test('encuentra nuevas, las que ya no están y cada celda que cambió', () => {
 const d = compareTables(ayer, hoy);
 assert.deepEqual(d.added.map(r => r[0]), ['Q-5']);
 assert.deepEqual(d.removed.map(r => r[0]), ['Q-4']);
 assert.equal(d.same, 1); // Q-3 no cambió en las columnas que comparten
 const q1 = d.changed.find(c => c.key === 'Q-1')!;
 assert.deepEqual(q1.changes, [{ column: 'estatus', before: 'Abierta', after: 'Cerrada' }, { column: 'piezas', before: '120', after: '121' }]);
 assert.deepEqual(d.newColumns, ['Turno']);
 assert.deepEqual(d.goneColumns, ['inspector']);
 assert.deepEqual(changesByColumn(d)[0], ['estatus', 2]);
 assert.equal(diffRows(d, hoy.headers, ayer.headers).length, 1 + 1 + 3);
});

test('sin columna llave compara filas completas y respeta las repetidas', () => {
 const a = parseCsv('linea,defecto\nL1,Rayón\nL1,Rayón\nL2,Golpe');
 const b = parseCsv('linea,defecto\nL1,Rayón\nL3,Burbuja\nL2,Golpe');
 const d = compareTables(a, b);
 assert.equal(d.key, null);
 assert.equal(d.same, 2);
 assert.deepEqual(d.added, [['L3', 'Burbuja']]);
 assert.deepEqual(d.removed, [['L1', 'Rayón']]);
});

test('60 000 filas contra 60 000 en menos de un segundo', () => {
 const mk = (shift: number) => ['folio,estatus,piezas', ...Array.from({ length: 60000 }, (_, i) => `Q-${i + shift},${i % 7 ? 'Abierta' : 'Cerrada'},${80 + (i % 50)}`)].join('\n');
 const a = parseCsv(mk(0)), b = parseCsv(mk(100));
 const t = performance.now(); const d = compareTables(a, b);
 assert.ok(performance.now() - t < 1000);
 assert.equal(d.added.length, 100);
 assert.equal(d.removed.length, 100);
});

test('un folio repetido no impide usarlo de llave: se compara una vez y se avisa', () => {
 const rows = (extra: string) => ['folio,estatus', ...Array.from({ length: 40 }, (_, i) => `Q-${i},Abierta`), extra].join('\n');
 const a = parseCsv(rows('Q-3,Abierta')), b = parseCsv(rows('Q-3,Abierta').replace('Q-7,Abierta', 'Q-7,Cerrada'));
 const d = compareTables(a, b);
 assert.equal(d.key, 'folio');
 assert.equal(d.changed.length, 1);
 assert.equal(d.duplicates, 2);
});
