import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('portfolio has working bilingual navigation, project pages and CV', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {level:1})).toContainText('Desarrollo web');
  await page.getByRole('button', { name:'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByRole('link', {name:'View projects',exact:true})).toBeVisible();
  await page.getByRole('button', { name:'Cambiar a español' }).click();
  await page.locator('.project-punto').getByRole('link',{name:'Ver proyecto',exact:true}).click();
  await expect(page).toHaveURL(/\/proyectos\/punto-u$/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Punto U');
  await expect(page.getByRole('heading',{name:'Cómo funciona'})).toBeVisible();
  await expect(page.locator('.how li')).toHaveCount(3);
  await expect(page.locator('.case-phone iframe')).toHaveAttribute('src','https://punto-u-app.vercel.app');
  await page.locator('.case-next a').click();
  await expect(page).toHaveURL(/\/proyectos\/club-nfc$/);
  expect((await request.get('/cv/Bruno-Salas-ES.pdf')).status()).toBe(200);
  expect((await request.get('/og.png')).status()).toBe(200);
});

test('mobile and desktop have no horizontal overflow or serious accessibility errors', async ({ page }) => {
  test.setTimeout(180000);
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    for (const path of ['/','/proyectos/club-nfc','/proyectos/analizador-csv','/proyectos/entrega-de-turno']) {
      await page.goto(path,{waitUntil:'networkidle'});
      await expect(page.getByRole('heading',{level:1})).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth), `${path} @${width}`).toBe(true);
      const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(scan.violations, `${path} @${width}`).toEqual([]);
    }
  }
});

test('landing stays a summary: heavy demos live on their own pages', async ({page})=>{
 await page.goto('/');
 await expect(page.locator('.dw-workbench')).toHaveCount(0);
 await expect(page.locator('.ld-stage')).toHaveCount(0);
 await expect(page.locator('.sh')).toHaveCount(0);
 await expect(page.locator('body')).not.toContainText(/en desarrollo|in development/i);
 expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThan(10000);
 await page.locator('.hs-tabs button').nth(1).click();
 await page.locator('.hs-pos0').click();
 await expect(page).toHaveURL(/\/proyectos\/analizador-csv$/);
});

test('shift handover: an incident cannot be closed without evidence, and the handover lists what is open', async ({page,request})=>{
 await page.goto('/proyectos/entrega-de-turno');
 const board=page.locator('.sh');
 await board.getByLabel('Lote').fill('4480');
 await board.getByLabel('Defecto').fill('Soldadura incompleta');
 await board.getByRole('button',{name:'Registrar'}).click();
 const item=board.locator('.sh-item').first();
 await expect(item).toContainText('INC-233');
 await item.getByLabel('Responsable').selectOption('M. Salinas');
 await expect(item.getByRole('button',{name:'Cerrar'})).toBeDisabled();
 await item.getByRole('button',{name:'Adjuntar evidencia'}).click();
 await item.getByRole('button',{name:'Cerrar'}).click();
 await expect(item).toContainText('cerrada con evidencia');
 await board.getByRole('button',{name:'Entregar turno'}).click();
 await expect(board.locator('.sh-summary')).toContainText('INC-231');
 await expect(board.locator('.sh-summary')).not.toContainText('INC-233');
 await page.goto('/');
 await expect(page.locator('a[download]').first()).toHaveAttribute('href','/cv/Bruno-Salas-ES.pdf');
 await page.getByRole('button', { name:'Switch to English' }).click();
 await expect(page.locator('a[download]').first()).toHaveAttribute('href','/cv/Bruno-Salas-EN.pdf');
 await page.getByRole('button', { name:'Cambiar a español' }).click();
 expect((await request.get('/cv/Bruno-Salas-EN.pdf')).status()).toBe(200);
});

test('game scenes gallery includes the forest and opens full screen',async({page})=>{
 await page.goto('/');
 const thumbs=page.locator('.pano-thumbs button');
 await thumbs.first().scrollIntoViewIfNeeded();
 await expect(thumbs).toHaveCount(5);
 await thumbs.nth(1).click();
 await expect(page.locator('.pano-stage img.on')).toHaveAttribute('src','/media/rogue-forest-first-person.webp');
 await page.locator('.pano-stage').click();
 await expect(page.locator('.pano-dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.pano-dialog')).toBeHidden();
});

test('3D style comparison responds to keyboard and style pairs',async({page})=>{
 await page.goto('/');
 const slider=page.getByRole('slider',{name:'Comparación de estilos sobre el modelo'});
 await slider.scrollIntoViewIfNeeded();await slider.focus();await slider.press('ArrowRight');
 await expect(slider).toHaveValue('51');
 await page.locator('#graphics').getByRole('button',{name:/^Cel shading/}).click();
 await expect(page.locator('.model-lab .original-side-labels')).toContainText('Cel shading');
 await expect(page.locator('#graphics')).not.toContainText('Definitive');
});

test('csv analyzer page: mind map, automatic fixes and second sample',async({page})=>{
 await page.goto('/proyectos/analizador-csv');
 const map=page.locator('.dw-mindmap');await map.scrollIntoViewIfNeeded();
 await expect(map.locator('.mm-branch')).toHaveCount(10);
 const problems=page.locator('.dw-kpis div').nth(3).locator('dd');
 await expect(problems).toHaveText('7');
 await page.getByRole('button',{name:/Arreglar lo automático/}).click();
 await expect(problems).toHaveText('1'); // sólo queda la regla de negocio, que no se arregla sola
 await expect(page.locator('.dw-kpis div').first().locator('dd')).toHaveText('22');
 await page.getByRole('button',{name:'Organismo de agua'}).click();
 await expect(page.locator('.dw-issues')).toContainText('Negativos en «dias_para_atender»');
});

test('customer club demo joins, stamps once per day and sends each message',async({page})=>{
 await page.goto('/proyectos/club-nfc');
 const club=page.locator('main');
 const chip=club.getByRole('button',{name:/Apoyar el celular en el chip/});
 await chip.click();
 await club.getByRole('button',{name:'Agregar a mi Wallet'}).click();
 await expect(club.locator('.ld-pass-count')).toHaveText('1/8');
 await chip.click(); // mismo día: no suma
 await expect(club.locator('.ld-pass-count')).toHaveText('1/8');
 await expect(club.locator('.ld-log')).toContainText('no suma sello');
 await club.getByRole('button',{name:/\+2 horas/}).click();
 await expect(club.locator('.ld-chat')).toContainText('una reseña nos ayuda');
 await club.getByRole('button',{name:'Dejar reseña en Google'}).click();
 await expect(club.locator('.ld-kpis div').nth(3).locator('dd')).toHaveText('1');
 await club.getByRole('button',{name:/Su cumpleaños/}).click();
 await expect(club.locator('.ld-chat')).toContainText('cumpleaños');
 await club.getByRole('button',{name:/Enviar campaña/}).click();
 await club.getByRole('button',{name:'Reservar mesa'}).click();
 await expect(club.locator('.ld-chat')).toContainText('4 personas');
});
