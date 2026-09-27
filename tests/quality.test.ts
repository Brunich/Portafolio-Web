import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, profileColumns } from '../src/csv.ts';
import { detectIssues, toNumber } from '../src/quality.ts';
import { SAMPLES } from '../src/samples.ts';

const ids = (csv: string) => { const d = parseCsv(csv); return detectIssues(d.headers, d.rows).map(i => i.id); };
const fixAll = (csv: string) => {
 const d = parseCsv(csv); let rows = d.rows;
 for (let pass = 0; pass < 4; pass++) { const f = detectIssues(d.headers, rows).filter(i => i.fix); if (!f.length) break; f.forEach(i => { rows = i.fix!(rows); }); }
 return { headers: d.headers, rows };
};

test('reads thousands separators as numbers, not decimals', () => {
 assert.equal(toNumber('1,120'), 1120);
 assert.equal(toNumber('12'), 12);
 assert.ok(Number.isNaN(toNumber('1,2')));
});
test('flags business-rule violations without fixing them', () => {
 const issues = detectIssues(['folio', 'piezas_revisadas', 'piezas_rechazadas'], [['A', '10', '2'], ['B', '79', '81']]);
 const rule = issues.find(i => i.id === 'rule-rej');
 assert.ok(rule && !rule.fix);
 assert.deepEqual(rule.rows, [1]);
});
test('unifies the same value written with different case, accents or spaces', () => {
 const { rows } = fixAll('id,estacion\n1,Pintura\n2,Pintura\n3,PINTURA \n4,pintura\n5,Carrocería\n6,carroceria');
 assert.deepEqual(rows.map(r => r[1]), ['Pintura', 'Pintura', 'Pintura', 'Pintura', 'Carrocería', 'Carrocería']);
});
test('converts day/month dates to ISO only when both formats are mixed', () => {
 assert.ok(ids('fecha\n2026-03-02\n03/03/2026').includes('date-0'));
 assert.ok(!ids('fecha\n02/03/2026\n03/03/2026').includes('date-0'));
 assert.deepEqual(fixAll('fecha\n2026-03-02\n03/03/2026').rows, [['2026-03-02'], ['2026-03-03']]);
});
test('removes exact duplicates but keeps the first one', () => {
 const { rows } = fixAll('id,v\nA,1\nB,2\nA,1');
 assert.deepEqual(rows, [['A', '1'], ['B', '2']]);
});
test('never fills blanks by itself', () => {
 const { rows } = fixAll('inspector\nR. Garza\n\nR. Garza');
 assert.equal(rows[1][0], '');
});
test('the plant sample ends with only the business rule after automatic fixes', () => {
 const { headers, rows } = fixAll(SAMPLES[0].csv);
 const left = detectIssues(headers, rows).filter(i => i.severity !== 'info').map(i => i.id);
 assert.deepEqual(left, ['rule-rej']);
 assert.equal(rows.length, 22);
 const estacion = profileColumns(headers, rows).find(p => p.name === 'estacion')!;
 assert.equal(estacion.unique, 4);
});
