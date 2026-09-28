import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, cleanRows, summarize, exportCsv, decodeBytes } from '../src/csv.ts';

test('reads BOM, semicolon, quoted separators, escaped quotes and multiline values', () => {
 const result = parseCsv('\uFEFFname;note\r\nAna;"hello; ""world""\r\nagain"\r\n');
 assert.deepEqual(result.headers, ['name','note']);
 assert.deepEqual(result.rows, [['Ana','hello; "world"\r\nagain']]);
});
test('preserves empty cells and makes duplicate or empty headers unambiguous', () => {
 const result = parseCsv('a,a,a (2),\n1,,3,');
 assert.equal(new Set(result.headers).size, 4);
 assert.deepEqual(result.rows,[['1','','3','']]);
 assert.deepEqual(summarize(result.rows), {rows:1, missing:2, duplicates:0});
});
test('tolerates what Excel tolerates, without dropping a single value', () => {
 const blank = parseCsv('a,b\r\n1,2\r\n\r\n\n');
 assert.deepEqual(blank.rows, [['1', '2']]);
 assert.equal(blank.fixes?.blank, 2);
 const ragged = parseCsv('a,b,c\n1,2\n3,4,5\n');
 assert.deepEqual(ragged.rows, [['1', '2', ''], ['3', '4', '5']]);
 assert.equal(ragged.fixes?.short, 1);
 const extra = parseCsv('a,b\n1,2,3\n4,5,\n');
 assert.equal(extra.headers.length, 3);
 assert.deepEqual(extra.rows, [['1', '2', '3'], ['4', '5', '']]);
 assert.equal(extra.fixes?.long, 1);
 assert.deepEqual(parseCsv('a,b\n5" tornillo,2').rows, [['5" tornillo', '2']]);
 assert.deepEqual(parseCsv('a\tb\n1\t2').headers, ['a', 'b']);
 assert.deepEqual(parseCsv('a|b\n1|2').rows, [['1', '2']]);
 assert.throws(() => parseCsv('a,b\n1,"oops'), /UNCLOSED_QUOTE/);
 assert.throws(() => parseCsv('a,b\n1,"ok"oops'), /INVALID_QUOTE/);
 assert.throws(() => parseCsv(''), /EMPTY/);
 assert.throws(() => parseCsv('\n\n,\n'), /EMPTY/);
});
test('decodes what Excel in Spanish actually saves', () => {
 const latin = new Uint8Array([0x4c, 0xed, 0x6e, 0x65, 0x61, 0x2c, 0x4e, 0x0a, 0x4c, 0x31, 0x2c, 0x31]);
 assert.equal(parseCsv(decodeBytes(latin.buffer)).headers[0], 'Línea');
 const utf16 = new Uint8Array([0xff, 0xfe, ...[...'Año\tN\n1\t2'].flatMap(c => [c.charCodeAt(0) & 255, c.charCodeAt(0) >> 8])]);
 assert.deepEqual(parseCsv(decodeBytes(utf16.buffer)).headers, ['Año', 'N']);
 const utf8 = new TextEncoder().encode('\uFEFFNiño,Café\n1,2');
 assert.deepEqual(parseCsv(decodeBytes(utf8.buffer as ArrayBuffer)).headers, ['Niño', 'Café']);
});
test('a big report still parses fast', () => {
 const lines = ['folio,fecha,turno,linea,piezas'];
 for (let i = 0; i < 60000; i++) lines.push(`Q-${i},2026-03-${String(1 + i % 28).padStart(2, '0')},Matutino,L${1 + i % 3},${100 + i % 50}`);
 const t0 = performance.now(); const d = parseCsv(lines.join('\n')); const ms = performance.now() - t0;
 assert.equal(d.rows.length, 60000);
 assert.ok(ms < 1500, `tardó ${ms} ms`);
});
test('cleans explicitly and counts exact duplicate rows after trimming', () => {
 const rows = [[' A ','1'], ['A','1'], ['B',' ']];
 assert.deepEqual(cleanRows(rows,true,true), [['A','1'],['B','']]);
 assert.deepEqual(rows[0], [' A ','1']);
 assert.equal(summarize(cleanRows(rows,true,false)).duplicates,1);
});
test('export neutralizes formulas including whitespace and headers, preserves negative numbers', () => {
 const output = exportCsv(['=header','value'], [['  =SUM(A1)','-12.5'],['@evil','+cmd'],['comma,quote"','line\nnew']]);
 const parsed = parseCsv(output);
 assert.deepEqual(parsed.headers,["'=header",'value']);
 assert.deepEqual(parsed.rows,[["'  =SUM(A1)",'-12.5'],["'@evil","'+cmd"],['comma,quote"','line\nnew']]);
});
