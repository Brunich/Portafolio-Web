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

test('original style comparison responds to pointer and keyboard',async({page})=>{
 await page.goto('/');
 const slider=page.getByRole('slider',{name:'Comparación de estilos originales'});
 await slider.scrollIntoViewIfNeeded();await slider.focus();await slider.press('ArrowRight');
 await expect(slider).toHaveValue('51');
 const box=await slider.boundingBox();if(!box)throw new Error('Missing comparator');
 await page.mouse.click(box.x+box.width*.75,box.y+box.height/2);
 expect(Number(await slider.inputValue())).toBeGreaterThan(65);
 await page.locator('#graphics').getByRole('button',{name:/^Intermedio/}).click();
 await expect(page.locator('.original-comparator img').nth(1)).toHaveAttribute('src','/media/shader-original/forest_1.webp');
});

test('csv mind map, impact explorer and panoramas respond',async({page})=>{
 await page.goto('/');
 const map=page.locator('.dw-mindmap');await map.scrollIntoViewIfNeeded();
 await expect(map.locator('.mm-branch')).toHaveCount(6);
 await expect(page.locator('.dw-stats')).toContainText('1');
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
