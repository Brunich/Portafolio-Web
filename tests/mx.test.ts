import { test } from 'node:test';
import assert from 'node:assert/strict';
import { curpOk, detectIssues } from '../src/quality.ts';

// CURP inventada con su dígito verificador calculado a mano: suma de valor × (18 − posición), 10 − (suma mod 10).
const body = 'GOMA800101HNLRRN0', ABC = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const dv = (10 - [...body].reduce((s, ch, i) => s + ABC.indexOf(ch) * (18 - i), 0) % 10) % 10;
const CURP = body + dv;

test('CURP: el dígito verificador separa la buena de la que tiene un dígito cambiado', () => {
 assert.ok(curpOk(CURP));
 assert.ok(!curpOk(body + ((dv + 1) % 10)));
 assert.ok(!curpOk('GOMA800101HNLRRN'));
});

test('datos de México: se da formato a lo mecánico y lo demás queda marcado', () => {
 const headers = ['nombre', 'RFC', 'CURP', 'Teléfono', 'Correo', 'C.P.'];
 const rows = [
  ['Ana', 'goma-800101-ab1', CURP.toLowerCase(), '+52 81 1234 5678', ' Ana@Correo.MX ', '1000'],
  ['Luis', 'XXXX991399AB1', 'NOESCURP', '12345', 'luis@', '64000'],
 ];
 const issues = detectIssues(headers, rows).filter(i => i.id.startsWith('mx-'));
 assert.equal(issues.length, 5);
 let fixed = rows;
 for (const i of issues) if (i.fix) fixed = i.fix(fixed);
 assert.deepEqual(fixed[0].slice(1), ['GOMA800101AB1', CURP, '8112345678', 'ana@correo.mx', '01000']);
 // Lo que no se arregla con formato se queda igual y sigue marcado (el CP 64000 de Luis ya era válido).
 assert.deepEqual(fixed[1].slice(1), rows[1].slice(1));
 assert.equal(detectIssues(headers, fixed).filter(i => i.id.startsWith('mx-') && !i.fix).length, 4);
});

test('columnas que no son de México no se revisan con estas reglas', () => {
 assert.equal(detectIssues(['folio', 'modelo'], [['Q-1', 'M-21'], ['Q-2', 'M-34']]).filter(i => i.id.startsWith('mx-')).length, 0);
});
