import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../src/csv.ts';
import { consolidate, defectPareto, mapColumns, SAMPLE_PROD, SAMPLE_QUAL, SAMPLE_STOPS } from '../src/planta-logic.ts';

const r = consolidate(parseCsv(SAMPLE_PROD), parseCsv(SAMPLE_QUAL), parseCsv(SAMPLE_STOPS));

test('reconoce las columnas por nombre, sin importar acentos ni mayúsculas', () => {
 assert.deepEqual(mapColumns('prod', ['Fecha', 'Turno', 'Línea', 'Lote', 'Plan', 'Piezas producidas', 'Min programados', 'Ciclo ideal (s)']).missing, []);
 assert.deepEqual(mapColumns('qual', ['fecha', 'turno', 'linea', 'lote']).missing, ['rev', 'rej']);
});

test('encuentra lo que no cuadra entre producción y calidad', () => {
 const rules = r.exceptions.map(e => `${e.rule} ${e.where}`);
 assert.ok(rules.some(x => x.startsWith('sin-inspeccion') && x.includes('lote 4419')));
 assert.ok(rules.some(x => x.startsWith('sin-produccion') && x.includes('lote 4482')), 'lote mal escrito en calidad');
 assert.ok(rules.some(x => x.startsWith('revisadas') && x.includes('lote 4424')));
 assert.ok(rules.some(x => x.startsWith('rechazo') && x.includes('lote 4415')));
 assert.ok(rules.some(x => x.startsWith('paro') && x.includes('L3')));
});

test('el OEE es disponibilidad × rendimiento × calidad', () => {
 const l2 = r.lines.find(l => l.linea === 'L2')!;
 assert.equal(l2.prog, 6 * 450);
 assert.equal(l2.stops, 18 + 64 + 12 + 16);
 assert.ok(Math.abs(l2.oee - l2.A * l2.R * l2.Q) < 1e-9);
 assert.ok(l2.oee > 0.5 && l2.oee < 0.95, `OEE L2 ${l2.oee}`);
 assert.equal(r.pareto[0][0], 'Falla en robot de soldadura');
});

test('turno nocturno que cruza la medianoche y fechas dd/mm de Excel: el lote se cruza igual', () => {
 const prod = parseCsv('fecha,turno,linea,lote,plan,producidas,min programados,ciclo\n09/03/2026,Nocturno,L1,77,100,98,450,60\n2026-03-09,Matutino,L1,78,100,99,450,60');
 // Calidad anota el lote nocturno con el día en que lo inspeccionó (ya 10 de marzo) y otro formato de fecha.
 const qual = parseCsv('fecha,turno,linea,lote,revisadas,rechazadas\n10 mar 2026,noche,Linea 1,77,98,1\n9/3/2026,1,L1,78,99,0');
 const r = consolidate(prod, qual, null);
 assert.equal(r.orphans.length, 0);
 assert.equal(r.lots.filter(l => l.rev !== undefined).length, 2);
 assert.ok(!r.exceptions.some(e => e.rule === 'sin-produccion' || e.rule === 'sin-inspeccion'));
 // Pero un día que no es el anterior sí se marca: no se esconde un error de captura.
 const lejos = consolidate(prod, parseCsv('fecha,turno,linea,lote,revisadas,rechazadas\n12/03/2026,Nocturno,L1,77,98,1\n2026-03-09,Matutino,L1,78,99,0'), null);
 assert.equal(lejos.orphans.length, 1);
});

test('una columna con nombre raro se asigna a mano y manda sobre la adivinada', () => {
 const headers = ['Fecha de producción', 'Turno', 'Línea', 'No. de orden', 'Meta', 'Piezas OK', 'Tiempo disponible', 'Ciclo'];
 const auto = mapColumns('prod', headers);
 assert.deepEqual(auto.missing, ['lote', 'prod']);
 const hand = mapColumns('prod', headers, { lote: 3, prod: 5 });
 assert.deepEqual(hand.missing, []);
 assert.equal(hand.map.lote, 3);
 // Un índice fuera del archivo se ignora.
 assert.deepEqual(mapColumns('prod', headers, { lote: 40 }).missing, ['lote', 'prod']);
});

test('el resumen por turno suma lo de cada turno', () => {
 const r = consolidate(parseCsv(SAMPLE_PROD), parseCsv(SAMPLE_QUAL), parseCsv(SAMPLE_STOPS));
 assert.deepEqual(r.shifts.map(s => s.turno), ['Matutino', 'Vespertino', 'Nocturno']);
 assert.equal(r.shifts.reduce((a, s) => a + s.prod, 0), r.lots.reduce((a, l) => a + l.prod, 0));
 assert.equal(r.shifts.reduce((a, s) => a + s.stops, 0), r.pareto.reduce((a, p) => a + p[1], 0));
});

test('OEE por día: un día por fecha del reporte, y cada uno entre 0 y 1', async () => {
 const { byDay } = await import('../src/planta-logic.ts');
 const days = byDay(r);
 assert.deepEqual(days.map(d => d.fecha), ['2026-03-09', '2026-03-10']);
 assert.ok(days.every(d => d.oee > 0 && d.oee < 1 && d.lines.length === 3));
 // Un día con más paros tiene menos disponibilidad: el 9 tuvo 160 min de paro y el 10, 106.
 assert.ok(days[0].A < days[1].A);
});

test('Pareto de defectos: suma las piezas rechazadas de cada defecto, de mayor a menor', () => {
 const d = defectPareto(r);
 assert.ok(d.length > 1);
 assert.equal(d.reduce((s, x) => s + x[1], 0), r.lots.reduce((s, l) => s + (l.rej ?? 0), 0));
 assert.ok(d.every((x, i) => !i || x[1] <= d[i - 1][1]));
});

test('un Excel real: título arriba, totales abajo y un lote capturado dos veces', async () => {
 const { fitGrid } = await import('../src/planta-logic.ts');
 const raw = parseCsv(['Reporte de producción,,,,,,,', 'Planta Norte · impreso 10/03/2026,,,,,,,', ',,,,,,,',
  'Fecha,Turno,Línea,Lote,Plan,Piezas producidas,Min programados,Ciclo ideal',
  '2026-03-09,Matutino,L1,4411,400,392,450,60', '2026-03-09,Matutino,L1,4411,400,392,450,60', '2026-03-09,Matutino,L2,4412,330,318,450,72',
  'Total,,,,1130,1102,1350,'].join('\n'));
 const fit = fitGrid('prod', raw);
 assert.equal(fit.titleRows, 3);
 assert.equal(fit.totalRows, 1);
 assert.equal(fit.grid.headers[5], 'Piezas producidas');
 assert.equal(fit.grid.rows.length, 3);
 const q = parseCsv('fecha,turno,linea,lote,revisadas,rechazadas\n2026-03-09,Matutino,L1,4411,392,2\n2026-03-09,Matutino,L2,4412,318,3');
 const res = consolidate(fit.grid, q, null);
 assert.equal(res.exceptions.filter(e => e.rule === 'duplicado').length, 1);
 // Sin título ni totales, el archivo queda igual.
 const same = fitGrid('prod', parseCsv(SAMPLE_PROD));
 assert.equal(same.titleRows, 0); assert.equal(same.totalRows, 0); assert.equal(same.grid.rows.length, parseCsv(SAMPLE_PROD).rows.length);
});

test('el historial guarda cada periodo una vez y lo más reciente primero', async () => {
 const { snapshot, addSnapshot } = await import('../src/planta-logic.ts');
 const a = snapshot(r, 1);
 assert.equal(a.from, '2026-03-09'); assert.equal(a.to, '2026-03-10'); assert.equal(a.lines.length, 3);
 let h = addSnapshot([], a);
 h = addSnapshot(h, { ...a, at: 2, oee: 0.5 }); // mismo periodo corregido: reemplaza
 assert.equal(h.length, 1); assert.equal(h[0].oee, 0.5);
 h = addSnapshot(h, { ...a, id: 'otro', from: '2026-03-11', to: '2026-03-11' });
 assert.equal(h[0].from, '2026-03-11');
});
