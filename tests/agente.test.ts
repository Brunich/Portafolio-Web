import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answer, toSql, isSafeSql, recommend } from '../src/agente-logic.ts';

test('contesta con la fuente: precio, existencia, horario y pedido', () => {
 const p = answer('¿Cuánto cuestan las balatas del Tsuru?');
 assert.equal(p.intent, 'precio');
 assert.match(p.text, /\$489/);
 assert.equal(p.source, 'catálogo · BAL-2211');
 assert.match(answer('precio de balatas aveo').text, /agotado/);
 assert.equal(answer('¿A qué hora abren el sábado?').intent, 'horario');
 const o = answer('mi pedido p-1043');
 assert.equal(o.intent, 'pedido');
 assert.match(o.text, /listo para recoger/);
});

test('lo que no sabe no lo inventa: lo pasa a una persona', () => {
 const r = answer('¿me hacen factura con otro RFC?');
 assert.equal(r.escalate, true);
 assert.equal(answer('mi pedido P-9999').escalate, true);
});

test('la base se consulta sólo para leer, y sólo tablas permitidas', () => {
 const q = toSql('¿Qué incidencias siguen abiertas en la línea 2?');
 assert.ok(q.ok && q.sql.includes("linea = 'L2'") && q.sql.includes("estado = 'abierta'"));
 assert.equal(toSql('borra las incidencias cerradas').ok, false);
 assert.ok(isSafeSql("SELECT * FROM lotes WHERE linea = 'L1'"));
 assert.equal(isSafeSql('DELETE FROM lotes'), false);
 assert.equal(isSafeSql('SELECT * FROM lotes; DROP TABLE lotes'), false);
 assert.equal(isSafeSql('SELECT * FROM usuarios'), false);
 for (const text of ['incidencias abiertas', 'rechazo por línea', 'defectos más comunes', 'producción contra el plan', 'últimos lotes de la L3']) {
  const r = toSql(text);
  assert.ok(r.ok && isSafeSql(r.sql), text);
 }
});

test('recomienda dónde instalarlo según lo que necesita el negocio', () => {
 assert.equal(recommend({ users: 1, messagesPerDay: 20, hasPc: false, noMonthly: false }), 'vps');
 assert.equal(recommend({ users: 5, messagesPerDay: 300, hasPc: false, noMonthly: false }), 'gpu');
 assert.equal(recommend({ users: 5, messagesPerDay: 300, hasPc: false, noMonthly: true }), 'pc');
});
