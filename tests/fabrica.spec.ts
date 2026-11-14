import { test, expect } from '@playwright/test';

// Línea, Tolerancia y Relevo con archivos como los de una planta de verdad.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem('bruno-intro', '1')); });

test('Línea: an Excel with a title, totals and a duplicate batch is read right, saved to history and printed', async ({ page }) => {
 await page.goto('/proyectos/planta/app');
 const prod = ['Reporte de producción,,,,,,,', 'Planta Norte · impreso 10/03/2026,,,,,,,',
  'Fecha,Turno,Línea,Lote,Plan,Piezas producidas,Min programados,Ciclo ideal',
  '2026-03-09,Matutino,L1,4411,400,392,450,60', '2026-03-09,Matutino,L1,4411,400,392,450,60', '2026-03-09,Matutino,L2,4412,330,318,450,72',
  'Total,,,,1130,1102,1350,'].join('\n');
 await page.locator('.pl-file').first().locator('input[type=file]').setInputFiles({ name: 'produccion_planta_norte.csv', mimeType: 'text/csv', buffer: Buffer.from(prod) });
 await expect(page.locator('.pl-file').first()).toContainText('3 filas');
 await expect(page.locator('.pl-fit')).toContainText('Empecé en la fila 3');
 await expect(page.locator('.pl-fit')).toContainText('sin la fila de totales');
 await expect(page.locator('.pl-filter')).toContainText('Lote repetido');
 await page.getByRole('button', { name: 'Guardar en el historial' }).click();
 await expect(page.locator('.pl-history tbody tr')).toHaveCount(1);
 await page.getByRole('button', { name: 'Imprimir o PDF' }).click();
 const doc = page.frameLocator('iframe.print-doc');
 await expect(doc.locator('h1')).toHaveText('Reporte de planta');
 await expect(doc.locator('table').first()).toContainText('L2');
 // El historial sigue ahí al volver otro día.
 await page.reload();
 await expect(page.locator('.pl-history tbody tr')).toHaveCount(1);
});

test('Tolerancia: a CMM export with a title, decimal commas and two dimensions; each one keeps its tolerance', async ({ page }) => {
 await page.goto('/proyectos/graficas-de-control/app');
 const rows = ['Reporte CMM;;', 'Pieza:;B-21;', 'Lote:;4411;', 'muestra;diametro_mm;largo_mm'];
 for (let g = 1; g <= 10; g++) for (let k = 0; k < 3; k++) rows.push(`${g};${(25 + ((g * 7 + k * 3) % 9 - 4) / 1000).toFixed(3).replace('.', ',')};${(80 + ((g * 5 + k) % 7 - 3) / 100).toFixed(2).replace('.', ',')}`);
 rows[8] = rows[8].replace(/;[^;]+$/, ';N/A');
 await page.locator('.spc input[type=file]').setInputFiles({ name: 'cmm_b21.csv', mimeType: 'text/csv', buffer: Buffer.from(rows.join('\r\n')) });
 const read = page.locator('.spc-read');
 await expect(read).toContainText('fila 4');
 await expect(read).toContainText('coma decimal');
 await expect(page.locator('.spc-features tbody tr')).toHaveCount(2);
 await expect(page.getByLabel('Medición')).toHaveValue('2'); // la última cota numérica
 await expect(read).toContainText('1 celda no es número'); // el N/A del largo
 await page.getByLabel(/Tolerancia mínima/).fill('79,9');
 await page.getByLabel(/Tolerancia máxima/).fill('80.1');
 await expect(page.locator('.spc-kpis')).toContainText('Cpk');
 await page.locator('.spc-features').getByRole('button', { name: 'diametro_mm' }).click();
 await expect(page.getByLabel(/Tolerancia máxima/)).toHaveValue('');
 await page.locator('.spc-features').getByRole('button', { name: 'largo_mm' }).click();
 await expect(page.getByLabel(/Tolerancia máxima/)).toHaveValue('80.1');
 await page.getByRole('button', { name: 'Guardar estudio' }).click();
 await expect(page.locator('.spc-studies tbody tr')).toHaveCount(1);
 await expect(page.locator('.spc-studies')).toContainText('largo_mm');
 await page.getByRole('button', { name: 'Imprimir o PDF' }).click();
 const doc = page.frameLocator('iframe.print-doc');
 await expect(doc.locator('h1')).toHaveText('largo_mm');
 await expect(doc.locator('svg.spc-chart')).toHaveCount(2);
});

test('Relevo: own lines and people, alphanumeric batches, a repeating defect and the handover history', async ({ page }) => {
 await page.goto('/proyectos/entrega-de-turno/app');
 const board = page.locator('.sh');
 await expect(board.locator('.sh-repeat')).toContainText('Burbuja en pintura');
 await expect(board.locator('.sh-repeat')).toContainText('2 veces');
 await board.getByRole('button', { name: 'Líneas y personas' }).click();
 await board.getByLabel('Agregar a líneas').fill('Pintura 2');
 await board.getByLabel('Agregar a líneas').press('Enter');
 await board.getByLabel('Agregar a responsables').fill('J. Pérez');
 await board.locator('.sh-chipedit').nth(1).getByRole('button', { name: 'Agregar' }).click();
 await board.getByRole('button', { name: 'Nueva incidencia' }).click();
 await board.locator('.sh-new').getByLabel('Línea').selectOption('Pintura 2');
 await board.getByLabel('Lote').fill('A-2311');
 await board.getByLabel('Defecto').fill('Escurrimiento en defensa');
 await board.getByRole('button', { name: 'Registrar' }).click();
 const card = board.locator('.c-open .sh-card', { hasText: 'A-2311' });
 await expect(card).toContainText('Pintura 2');
 await card.getByRole('button', { expanded: false }).click();
 await card.getByLabel('Responsable').selectOption('J. Pérez');
 await expect(board.locator('.c-doing .sh-card', { hasText: 'A-2311' })).toContainText('J. Pérez');
 await board.getByRole('button', { name: 'Entregar turno' }).click();
 await expect(board.locator('.sh-history li')).toHaveCount(1);
 await expect(board.locator('.sh-history')).toContainText('4 pendientes');
 await page.reload();
 await expect(board.locator('.sh-history li')).toHaveCount(1);
 await expect(board.locator('.sh-filters')).toContainText('Pintura 2');
});
