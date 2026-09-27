import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('portfolio has working bilingual navigation, project details and CV', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {level:1})).toContainText('Desarrollo web');
  await page.getByRole('button', { name:'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByRole('link', {name:'View projects',exact:true})).toBeVisible();
  await page.getByRole('button', { name:'Cambiar a español' }).click();
  await page.locator('#projects summary').first().click();
  await expect(page.getByText('El reto', {exact:true}).first()).toBeVisible();
  expect((await request.get('/cv/Bruno-Salas-ES.pdf')).status()).toBe(200);
});

test('mobile and desktop have no horizontal overflow or serious accessibility errors', async ({ page }) => {
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/',{waitUntil:'networkidle'});
    await expect(page.getByRole('heading',{level:1})).toContainText('Desarrollo web');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(scan.violations).toEqual([]);
  }
});

test('workflow maps explain steps and English CV is downloadable', async ({page,request})=>{
 await page.goto('/');
 await page.locator('.automation-options button').nth(1).click();
 await page.locator('.workflow-map button').nth(3).click();
 await expect(page.locator('.step-explanation')).toContainText('registros dispersos');
 await expect(page.locator('a[download]').first()).toHaveAttribute('href','/cv/Bruno-Salas-EN.pdf');
 expect((await request.get('/cv/Bruno-Salas-EN.pdf')).status()).toBe(200);
 await expect(page.locator('#lab')).toHaveCount(0);
});

test('original forest gallery switches between authentic views',async({page})=>{
 await page.goto('/');
 const scene=page.locator('#graphics');
 await scene.scrollIntoViewIfNeeded();
 await expect(scene.locator('.original-scene')).toHaveAttribute('src','/media/rogue-forest-overview.webp');
 await scene.getByRole('button',{name:'Primera persona',exact:true}).click();
 await expect(scene.locator('.original-scene')).toHaveAttribute('src','/media/rogue-forest-first-person.webp');
 await expect(scene.locator('.original-scene')).toBeVisible();
 expect(await scene.locator('.original-scene').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth===1600)).toBe(true);
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

test('csv mind map, impact explorer and panoramas respond',async({page})=>{
 await page.goto('/');
 const map=page.locator('.dw-mindmap');await map.scrollIntoViewIfNeeded();
 await expect(map.locator('.mm-branch')).toHaveCount(10);
 const problems=page.locator('.dw-kpis div').nth(3).locator('dd');
 await expect(problems).toHaveText('7');
 await page.getByRole('button',{name:/Arreglar lo automático/}).click();
 await expect(problems).toHaveText('1'); // sólo queda la regla de negocio, que no se arregla sola
 await expect(page.locator('.dw-kpis div').first().locator('dd')).toHaveText('22');
 await page.getByRole('button',{name:'Organismo de agua'}).click();
 await expect(page.locator('.dw-issues')).toContainText('Negativos en «dias_para_atender»');
 await page.locator('#automation').scrollIntoViewIfNeeded();
 await page.locator('.ie-scenarios button').nth(2).click();
 await expect(page.locator('.ie-report')).toContainText('orders.service.ts');
 await expect(page.locator('.ie-report')).toContainText('orders.service.test.ts');
 await page.locator('.pano-thumbs button').nth(1).click();
 await page.locator('.pano-stage').click();
 await expect(page.locator('.pano-dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.pano-dialog')).toBeHidden();
});

test('customer club demo joins, stamps once per day and sends each message',async({page})=>{
 await page.goto('/');
 const club=page.locator('#club');await club.scrollIntoViewIfNeeded();
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
 await expect(page.locator('.pano-thumbs button')).toHaveCount(2);
});
