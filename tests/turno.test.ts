import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canMove, H, isLate, nextId, pendingOf, sample, shiftNow, summaryText, validLot } from '../src/turno-logic.ts';

const now = Date.UTC(2026, 8, 28, 15);
const items = sample(now);

test('nada empieza sin responsable y nada se cierra sin foto', () => {
 const open = items.find(i => i.id === 'INC-231')!;
 const torque = items.find(i => i.id === 'INC-232')!;
 const seal = items.find(i => i.id === 'INC-229')!;
 assert.deepEqual(canMove(open, 'doing'), { ok: false, why: 'owner' });
 assert.deepEqual(canMove(torque, 'closed'), { ok: false, why: 'evidence' });
 assert.deepEqual(canMove(seal, 'closed'), { ok: true });
 assert.deepEqual(canMove(seal, 'doing'), { ok: false, why: 'same' });
 assert.deepEqual(canMove(open, 'open'), { ok: false, why: 'same' });
});

test('la crítica va primero y el SLA marca lo que ya se pasó', () => {
 const p = pendingOf(items);
 assert.equal(p[0].id, 'INC-232');
 assert.equal(p.length, 3);
 assert.equal(isLate(p[0], now), true); // 2,6 h sobre 2 h
 assert.equal(isLate({ ...p[0], at: now - 1 * H }, now), false);
 assert.equal(isLate(items.find(i => i.status === 'closed')!, now), false);
});

test('turnos de 8 horas y folios que siguen', () => {
 assert.equal(shiftNow(new Date(2026, 8, 28, 7)).name, 'Matutino');
 assert.equal(shiftNow(new Date(2026, 8, 28, 15)).next, 'nocturno');
 const n = shiftNow(new Date(2026, 8, 28, 2));
 assert.equal(n.name, 'Nocturno');
 assert.equal(n.left, 4);
 assert.equal(nextId(items), 'INC-233');
 assert.equal(validLot('4480'), true);
 assert.equal(validLot('A-2311'), true);
 assert.equal(validLot('26L0457'), true);
 assert.equal(validLot('44'), false);
 assert.equal(validLot('4480 ; drop'), false);
});

test('el resumen avisa lo que queda sin dueño y fuera de tiempo', () => {
 const s = summaryText(items, true, new Date(now), now);
 assert.match(s, /3 pendientes, 1 sin responsable, 1 fuera de tiempo/);
 assert.match(s, /SIN RESPONSABLE/);
 assert.ok(s.indexOf('INC-232') < s.indexOf('INC-231'));
 assert.match(summaryText(items, false, new Date(now), now), /3 open/);
});

test('cierre promedio y Excel del mes: horas desde que se registró hasta que se cerró', async () => {
 const { closeStats, exportRows, fmtHours, sample, H } = await import('../src/turno-logic.ts');
 const now = Date.now(), items = sample(now);
 const s = closeStats(items);
 assert.equal(s.n, 2);
 assert.ok(Math.abs(s.avg! - 3.3) < 1e-9); // (6.5 − 4.9) y (30 − 25) h
 assert.equal(s.onTime, 2); // Menor: 24 h de SLA; Mayor: 8 h
 assert.equal(fmtHours(1.6), '1 h 36');
 const late = { ...items[0], status: 'closed' as const, closedAt: items[0].at + 3 * H }; // Crítica: 2 h de SLA
 assert.equal(closeStats([late]).onTime, 0);
 const rows = exportRows(items, true);
 assert.equal(rows.length, items.length + 1);
 assert.deepEqual(rows.find(r => r[0] === 'INC-226')!.slice(-2), [1.6, 'sí']);
});

test('un defecto que vuelve en la misma línea se marca para causa raíz', async () => {
 const { repeats, defectKey } = await import('../src/turno-logic.ts');
 assert.equal(defectKey('Burbuja en pintura del cofre'), defectKey('burbuja  en la pintura de cofre.'));
 const rep = repeats(items, 7, now);
 assert.equal(rep.length, 1);
 assert.equal(rep[0].line, 'L2'); assert.equal(rep[0].count, 2); assert.equal(rep[0].open, true);
 // Mismo defecto en otra línea, o fuera de la ventana, no cuenta.
 assert.equal(repeats(items, 1, now).length, 0);
});
