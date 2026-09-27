import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, cleanRows, summarize, exportCsv } from '../src/csv.ts';

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
test('rejects malformed rows and quotes without silently dropping content', () => {
 assert.throws(() => parseCsv('a,b\n1,2,3'), /ROW_WIDTH:2:2:3/);
 assert.throws(() => parseCsv('a,b\n1,"oops'), /UNCLOSED_QUOTE/);
 assert.throws(() => parseCsv('a,b\n1,"ok"oops'), /INVALID_QUOTE/);
 assert.throws(() => parseCsv('a,b\n\n1,2'), /ROW_WIDTH/);
 assert.throws(() => parseCsv(''), /EMPTY/);
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
