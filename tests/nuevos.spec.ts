import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';

// Proyectos nuevos: gráficas y SQL del analizador, planta, inventario, menú y PIN de canje.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem('bruno-intro', '1')); });

test('csv analyzer: charts from suggestions and SQL queries that can be charted', async ({ page }) => {
 await page.goto('/proyectos/analizador-csv');
 await page.getByRole('tab', { name: 'Graficar' }).click();
 await expect(page.locator('.ch-ideas button')).toHaveCount(4);
 await page.getByRole('button', { name: 'Dona' }).click();
 await expect(page.locator('.ch-canvas svg path.ch-seg').first()).toBeVisible();
 await page.getByRole('tab', { name: 'Preguntar con SQL' }).click();
 await expect(page.getByRole('button', { name: 'Ejecutar' })).toBeEnabled({ timeout: 15000 });
 await page.getByLabel('Consulta SQL').fill('SELECT linea, COUNT(*) AS n FROM datos GROUP BY linea ORDER BY linea;');
 await page.getByRole('button', { name: 'Ejecutar' }).click();
 await expect(page.locator('.sq-meta[role=status]')).toContainText('3 filas');
 await page.getByLabel('Consulta SQL').fill('SELECT nada FROM datos');
 await page.getByRole('button', { name: 'Ejecutar' }).click();
 await expect(page.locator('.sq-err')).toContainText('no such column');
 await page.locator('.sq-examples button').nth(1).click();
 await page.getByRole('button', { name: 'Graficar este resultado' }).click();
 await expect(page.locator('.ch-canvas svg')).toBeVisible();
 await expect(page.getByRole('button', { name: /Volver a todo el archivo/ })).toBeVisible();
});

test('csv analyzer opens what Excel in Spanish saves: accents, broken rows and .xlsx', async ({ page }) => {
 await page.goto('/proyectos/analizador-csv');
 const input = page.locator('.dw-workbench input[type=file]').first();
 await input.setInputFiles({ name: 'excel.csv', mimeType: 'text/csv', buffer: Buffer.from('Línea;Estación;Piezas\r\nL1;Carrocería;120\r\nL2;Pintura\r\n\r\n', 'latin1') });
 await expect(page.locator('.dw-workbench th', { hasText: 'Estación' })).toBeVisible();
 await expect(page.locator('.dw-note')).toContainText('1 fila corta completada');
 await expect(page.locator('.dw-error')).toHaveCount(0);
 const XLSX = await import('xlsx');
 const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Fecha', 'Línea', 'Piezas'], ['2026-03-01', 'L1', 120]]), 'Hoja1');
 await input.setInputFiles({ name: 'reporte.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) });
 await expect(page.locator('.dw-workbench th', { hasText: 'Fecha' })).toBeVisible();
});

test('plant: three reports cross-check into exceptions and OEE per line', async ({ page }) => {
 await page.goto('/proyectos/planta');
 await expect(page.locator('.pl-line')).toHaveCount(3);
 await expect(page.locator('.pl-kpis div').nth(1).locator('dd')).toHaveText('9');
 await expect(page.locator('.pl-ex')).toContainText('lote 4482');
 await page.locator('.pl-limit input').fill('8');
 await expect(page.locator('.pl-kpis div').nth(1).locator('dd')).toHaveText('8');
 await page.locator('.pl-filter button', { hasText: 'Sin inspección' }).click();
 await expect(page.locator('.pl-ex li')).toHaveCount(2);
});

test('inventory: typed codes move stock, unknown codes get registered, and a label photo is read', async ({ page }) => {
 await page.goto('/proyectos/inventario');
 const agua = page.locator('.inv-products li', { hasText: 'Agua natural' });
 await expect(agua.locator('.inv-stock b')).toHaveText('34');
 await page.getByLabel('Código de barras').fill('7501000000012');
 await page.getByRole('button', { name: 'Aplicar' }).click();
 await expect(agua.locator('.inv-stock b')).toHaveText('35');
 await page.getByRole('radio', { name: /Venta/ }).click();
 await page.getByLabel('Código de barras').fill('7501000000012');
 await page.getByRole('button', { name: 'Aplicar' }).click();
 await expect(agua.locator('.inv-stock b')).toHaveText('34');
 await page.getByLabel('Código de barras').fill('7509999999991');
 await page.getByRole('button', { name: 'Aplicar' }).click();
 await page.getByPlaceholder('Nombre del producto').fill('Galletas de avena');
 await page.getByRole('button', { name: 'Guardar' }).click();
 await expect(page.locator('.inv-products')).toContainText('Galletas de avena');
 await page.getByRole('radio', { name: /Entrada/ }).click();
 await page.getByRole('button', { name: /Etiquetas con código/ }).click();
 const svg = await page.locator('.inv-sheet figure').first().innerHTML();
 const png = await page.evaluate(async s => {
  const img = new Image(); img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s))); await img.decode();
  const c = document.createElement('canvas'); c.width = img.width * 2; c.height = img.height * 2;
  const x = c.getContext('2d')!; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/png').split(',')[1];
 }, svg);
 await page.locator('.inv-photo input').setInputFiles({ name: 'etiqueta.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
 await expect(agua.locator('.inv-stock b')).toHaveText('35', { timeout: 15000 });
});

test('menu: the customer builds an order, and the builder makes a link that fits a chip', async ({ page }) => {
 await page.goto('/menu?mesa=7');
 await page.getByRole('button', { name: 'Agregar Al pastor (4)' }).click();
 await page.getByRole('button', { name: 'Agregar otro' }).click();
 await page.getByRole('button', { name: 'Agregar Agua fresca 1 L' }).click();
 await expect(page.locator('.mn-cart-sum')).toContainText('3 en tu pedido');
 await expect(page.locator('.mn-cart-sum')).toContainText('$218');
 await page.goto('/nfc#menu');
 await expect(page.getByLabel('Enlace del menú')).toHaveValue(/\/menu#/);
 await page.getByLabel('Mesa (opcional: un QR por mesa)').fill('12');
 await expect(page.getByLabel('Enlace del menú')).toHaveValue(/\/menu\?mesa=12#/);
 await expect(page.locator('.mb-chip')).toContainText('NTAG21');
});

test('stamp card with PIN: a wrong PIN does not redeem, the right one does', async ({ page }) => {
 const k = createHash('sha256').update('cafe-prueba:2468').digest('hex').slice(0, 10);
 await page.goto(`/sello?n=Cafe%20Prueba&m=3&p=Un%20cafe&k=${k}&demo`);
 for (let i = 0; i < 2; i++) await page.getByRole('button', { name: /Demo/ }).click();
 await page.getByRole('button', { name: 'Canjear premio' }).click();
 await page.getByLabel('PIN').fill('1111');
 await page.getByRole('button', { name: 'Sí, canjeado' }).click();
 await expect(page.locator('.st-err')).toHaveText('PIN incorrecto.');
 await page.getByLabel('PIN').fill('2468');
 await page.getByRole('button', { name: 'Sí, canjeado' }).click();
 await expect(page.locator('.st-count')).toHaveText('0/3');
});

test('on a phone every project header is one column, the title fits and the floating button waits until you scroll up', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 });
 for (const slug of ['club-nfc', 'analizador-csv', 'planta', 'graficas-de-control', 'inventario', 'entrega-de-turno', 'vibemap', 'punto-u']) {
  await page.goto(`/proyectos/${slug}`);
  const head = await page.locator('.case-head').evaluate(e => ({ cols: getComputedStyle(e).gridTemplateColumns.split(' ').length, h1: e.querySelector('h1')!.getBoundingClientRect().right, doc: document.documentElement.scrollWidth }));
  expect(head.cols, slug).toBe(1);
  expect(head.h1, slug).toBeLessThanOrEqual(390);
  expect(head.doc, slug).toBe(390);
 }
 await expect(page.locator('.zone-nav')).toHaveClass(/is-hidden/);
 await page.mouse.wheel(0, 1200); await page.waitForTimeout(300);
 await page.mouse.wheel(0, -400);
 await expect(page.locator('.zone-nav')).not.toHaveClass(/is-hidden/);
});

test('an Excel workbook with several sheets opens the one with data and lets you switch', async ({ page }) => {
 await page.goto('/proyectos/analizador-csv');
 const XLSX = await import('xlsx');
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Reporte semanal']]), 'Portada');
 XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Fecha', 'Línea', 'Piezas'], ['2 mar 2026', 'L1', 120], ['2026-03-03', 'L2', 98]]), 'Producción');
 XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Folio', 'Defecto'], ['Q-1', 'Rayón'], ['Q-2', 'Golpe'], ['Q-3', 'Rayón']]), 'Calidad');
 await page.locator('.dw-workbench input[type=file]').setInputFiles({ name: 'semana.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) });
 const sheet = page.getByLabel('Hoja de Excel');
 await expect(sheet).toHaveValue('Producción');
 await expect(page.locator('.dw-kpis dd').nth(0)).toHaveText('2');
 await expect(page.locator('.dw-workbench')).toContainText('Fechas en 2 formatos');
 await sheet.selectOption('Calidad');
 await expect(page.locator('.dw-kpis dd').nth(0)).toHaveText('3');
 await expect(page.locator('.dw-sheet')).toContainText('abrí «Calidad»');
});

test('plant: a report with odd column names gets mapped by hand, and exceptions can be ticked off', async ({ page }) => {
 await page.goto('/proyectos/planta');
 const csv = 'Fecha de producción,Turno,Línea,No. de orden,Meta,Piezas OK,Tiempo disponible,Ciclo\n2026-03-09,Matutino,L1,4411,400,392,450,60\n2026-03-09,Matutino,L2,4412,330,318,450,72';
 await page.locator('.pl-file').first().locator('input[type=file]').setInputFiles({ name: 'mi_reporte.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
 const box = page.locator('.pl-file').first();
 await expect(box.locator('.pl-miss')).toContainText('Dime cuál es cuál');
 await box.locator('.pl-miss label', { hasText: 'lote' }).locator('select').selectOption({ label: 'No. de orden' });
 await box.locator('.pl-miss label', { hasText: 'producidas' }).locator('select').selectOption({ label: 'Piezas OK' });
 await expect(box.locator('.pl-mapped')).toContainText('asignadas a mano');
 await expect(page.locator('.pl-total')).toBeVisible();
 await expect(page.locator('.pl-shifts tbody tr')).toHaveCount(1);
 const first = page.locator('.pl-ex li').first();
 await first.getByLabel('Revisada').check();
 await expect(first).toHaveClass(/is-done/);
 await expect(page.locator('.pl-progress')).toContainText('1 de');
});

test('inventory: EAN-8 labels are read from a photo, internal codes keep letters, and search, delete and undo work', async ({ page }) => {
 await page.goto('/proyectos/inventario');
 const add = async (code: string, name: string) => {
  await page.getByLabel('Código de barras').fill(code);
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await page.getByPlaceholder('Nombre del producto').fill(name);
  await page.getByRole('button', { name: 'Guardar' }).click();
 };
 await add('96385074', 'Chicle de menta');
 await add('abc-123', 'Tornillo interno');
 await expect(page.locator('.inv-products')).toContainText('ABC-123');
 // La etiqueta EAN-8 que genera la página se fotografía y se lee: entra una pieza más.
 await page.getByRole('button', { name: /Etiquetas con código/ }).click();
 const fig = page.locator('.inv-sheet figure', { hasText: '96385074' });
 const png = await fig.evaluate(async el => {
  const s = el.innerHTML, img = new Image(); img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s))); await img.decode();
  const c = document.createElement('canvas'); c.width = img.width * 3; c.height = img.height * 3;
  const x = c.getContext('2d')!; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/png').split(',')[1];
 });
 await page.locator('.inv-photo input').setInputFiles({ name: 'chicle.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
 const chicle = page.locator('.inv-products > li', { hasText: 'Chicle de menta' });
 await expect(chicle.locator('.inv-stock b')).toHaveText('2');
 // Buscar, abrir, borrar y deshacer.
 await page.getByLabel('Buscar producto').fill('tornillo');
 await expect(page.locator('.inv-products > li')).toHaveCount(1);
 await page.locator('.inv-name', { hasText: 'Tornillo interno' }).click();
 await expect(page.locator('.inv-kind')).toHaveText('Code 128');
 await page.getByRole('button', { name: 'Borrar producto' }).click();
 await expect(page.locator('.inv-products > li')).toHaveCount(0);
 await page.getByRole('button', { name: 'Deshacer' }).click();
 await expect(page.locator('.inv-products > li')).toHaveCount(1);
});

test('shift handover on a touch phone: a card goes from open to closed with taps only', async ({ browser }) => {
 const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
 const page = await ctx.newPage();
 await page.addInitScript(() => sessionStorage.setItem('bruno-intro', '1'));
 await page.goto('/proyectos/entrega-de-turno');
 const board = page.locator('.sh');
 // En celular se ve una columna a la vez.
 await expect(board.locator('.sh-col.c-doing')).toBeHidden();
 const card = board.locator('.sh-card', { hasText: 'INC-231' });
 await card.getByRole('button', { name: 'Pasar a en curso' }).tap(); // sin responsable: no se mueve y se abre para asignarlo
 await card.getByLabel('Responsable').selectOption('A. Cantú');
 await board.getByRole('tab', { name: /En curso/ }).tap();
 const doing = board.locator('.c-doing .sh-card', { hasText: 'INC-231' });
 await expect(doing).toBeVisible();
 await doing.getByRole('button', { name: 'Tomar foto de evidencia' }).tap();
 await page.locator('input[type=file][accept="image/*"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') });
 await doing.getByRole('button', { name: 'Cerrar incidencia' }).tap();
 await board.getByRole('tab', { name: /Cerradas/ }).tap();
 await expect(board.locator('.c-closed .sh-card').first()).toContainText('INC-231');
 await ctx.close();
});

test('shift handover with 60 incidents: filters by line and severity, and long columns fold', async ({ page }) => {
 await page.addInitScript(() => {
  const now = Date.now(), H = 36e5, sev = ['Crítica', 'Mayor', 'Menor'];
  const items = Array.from({ length: 60 }, (_, n) => ({ id: `INC-${300 + n}`, line: `L${1 + n % 3}`, lot: String(4400 + n), defect: `Defecto ${n}`, sev: sev[Math.floor(n / 3) % 3], status: n % 4 === 0 ? 'closed' : n % 4 === 1 ? 'doing' : 'open', owner: n % 4 < 2 ? 'R. Garza' : '', action: '', photo: n % 4 === 0 ? 'demo' : '', at: now - (n % 20) * H / 4 }));
  localStorage.setItem('bruno-turno-v3', JSON.stringify({ items, log: [] }));
 });
 await page.goto('/proyectos/entrega-de-turno');
 const open = page.locator('.sh-col.c-open');
 await expect(open.locator('h3 span')).toHaveText('30');
 await expect(open.locator('.sh-card')).toHaveCount(6);
 await open.getByRole('button', { name: 'Ver 24 más' }).click();
 await expect(open.locator('.sh-card')).toHaveCount(30);
 await page.locator('.sh-filters').getByRole('button', { name: 'L2', exact: true }).click();
 await page.locator('.sh-filters').getByRole('button', { name: 'Crítica', exact: true }).click();
 await expect(open.locator('h3 span')).toHaveText('4'); // abiertas de L2 y críticas en los datos de arriba
 await expect(open.locator('.sh-card')).toHaveCount(4);
});

test('a live demo whose server is down shows real screenshots and says why, instead of an empty app', async ({ page }) => {
 await page.route('**/*supabase.co/**', r => r.abort());
 await page.route('https://vibemap-brunich.vercel.app/**', r => r.abort());
 await page.goto('/proyectos/punto-u');
 await expect(page.locator('.live-note')).toContainText('no está respondiendo');
 await expect(page.locator('.live-shots img')).toHaveCount(2);
 await expect(page.locator('.demo-punto-copy h2')).toHaveText('Así se ve la app.');
 await page.goto('/proyectos/vibemap');
 await expect(page.locator('.live-shots img')).toHaveCount(1);
 await expect(page.locator('.case-browser iframe')).toHaveCount(0);
});

test('csv analyzer compares two snapshots of the same report and lists what changed', async ({ page }) => {
 await page.goto('/proyectos/analizador-csv');
 const input = page.locator('.dw-workbench input[type=file]').first();
 await input.setInputFiles({ name: 'ayer.csv', mimeType: 'text/csv', buffer: Buffer.from('folio,estatus,piezas\nQ-1,Abierta,120\nQ-2,Abierta,98\nQ-3,Cerrada,80\nQ-4,Abierta,77') });
 await page.getByRole('tab', { name: 'Comparar' }).click();
 await page.locator('.cmp input[type=file]').setInputFiles({ name: 'hoy.csv', mimeType: 'text/csv', buffer: Buffer.from('folio,estatus,piezas\nQ-2,Cerrada,98\nQ-3,Cerrada,80\nQ-1,Cerrada,121\nQ-5,Abierta,60') });
 await expect(page.getByLabel('Emparejar filas por')).toHaveValue('folio');
 await expect(page.locator('.cmp-kpis .k-changed dd')).toHaveText('2');
 await expect(page.locator('.cmp-list')).toContainText('Abierta→Cerrada');
 await page.locator('.cmp-kpis .k-added button').click();
 await expect(page.locator('.cmp-list')).toContainText('Q-5');
 const dl = page.waitForEvent('download');
 await page.getByRole('button', { name: /Descargar diferencias/ }).click();
 expect((await dl).suggestedFilename()).toBe('diferencias.csv');
});

test('control charts: the sample flags the tool wear, and a plain column of readings becomes an individuals chart', async ({ page }) => {
 await page.goto('/proyectos/graficas-de-control');
 await expect(page.locator('.spc-verdict')).toHaveClass(/bad/);
 await expect(page.locator('.spc-verdict')).toContainText('Fuera de control');
 await expect(page.locator('.spc-signals')).toContainText('Regla 1');
 await expect(page.locator('.spc-kpis')).toContainText('Cpk');
 // Una sola columna de lecturas, sin subgrupos ni tolerancia: individuales y rango móvil.
 const readings = ['temperatura_C', ...[70.1, 70.4, 69.8, 70.0, 70.3, 69.9, 70.2, 70.1, 69.7, 70.0, 70.2, 69.9]].join('\n');
 await page.locator('.spc input[type=file]').setInputFiles({ name: 'horno.csv', mimeType: 'text/csv', buffer: Buffer.from(readings) });
 await expect(page.locator('.spc-state small')).toContainText('I-MR');
 await expect(page.locator('.spc-verdict')).toHaveClass(/ok/);
 await expect(page.locator('.spc-okmsg')).toBeVisible();
 await page.getByLabel(/Tolerancia máxima/).fill('70.2');
 await expect(page.locator('.spc-kpis')).toContainText('Fuera de tolerancia');
});
