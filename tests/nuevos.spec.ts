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
