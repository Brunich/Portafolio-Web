import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// La intro de la primera visita se salta: se prueba aparte.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem('bruno-intro', '1')); });

test('portfolio has working bilingual navigation, project pages and CV', async ({ page, request }) => {
 // El servidor de Punto U se simula arriba: esta prueba revisa la página, no el estado de Supabase.
 await page.route('**/*supabase.co/**', r => r.fulfill({ status: 200, body: '' }));
  await page.goto('/');
  await expect(page.getByRole('heading', {level:1})).toContainText('Desarrollo web');
  await page.getByRole('button', { name:'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByRole('link', {name:'View projects',exact:true})).toBeVisible();
  await page.getByRole('button', { name:'Cambiar a español' }).click();
  await page.locator('.other-card.project-punto').click(); // Punto U va en «Otros proyectos»
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
    for (const path of ['/','/proyectos/club-nfc','/proyectos/analizador-csv','/proyectos/entrega-de-turno','/proyectos/planta','/proyectos/inventario','/menu','/nfc']) {
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
 // «En desarrollo» sólo en su apartado (y la fila del asistente): ningún proyecto de la lista principal debe parecer a medias.
 const withDev = await page.evaluate(()=>[...document.querySelectorAll('body *')]
  .filter(el=>el.children.length===0 && /en desarrollo|in development/i.test(el.textContent ?? ''))
  .map(el=>el.closest('.project-agente, .others.is-dev, .zone-dots') ? 'project-agente' : (el.parentElement?.className ?? el.tagName)));
 expect(withDev.length).toBeGreaterThan(0);
 for (const c of withDev) expect(c).toContain('project-agente');
 // Siete proyectos, cada uno en su pantalla: el límite cuida que no vuelvan los apartados largos.
 expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThan(14000);
 await page.locator('.hs-tabs button').nth(1).click();
 await page.locator('.hs-pos0 .ha-nav').getByRole('button',{name:'Completo'}).click();
 await expect(page.locator('.hs-pos0 .ha-csv-full')).toBeVisible();
 await page.locator('.hs-pos0 .ha-nav').getByRole('link',{name:'Abrir'}).click();
 await expect(page).toHaveURL(/\/proyectos\/analizador-csv#demo$/);
 await expect(page.locator('#demo')).toBeInViewport();
});

test('shift handover: an incident cannot be closed without evidence, and the handover lists what is open', async ({page,request})=>{
 await page.goto('/proyectos/entrega-de-turno');
 const board=page.locator('.sh');
 await board.getByRole('button',{name:'Nueva incidencia'}).click();
 await board.getByLabel('Lote').fill('4480');
 await board.getByLabel('Defecto').fill('Soldadura incompleta');
 await board.getByRole('button',{name:'Registrar'}).click();
 const item=board.locator('.c-open .sh-card',{hasText:'INC-233'});
 await expect(item).toContainText('Soldadura incompleta');
 await item.getByRole('button',{expanded:false}).click();
 await item.getByLabel('Responsable').selectOption('M. Salinas');
 const card=board.locator('.c-doing .sh-card',{hasText:'INC-233'});
 await expect(card.getByRole('button',{name:'Sin evidencia no se cierra'})).toBeDisabled();
 await card.getByRole('button',{name:'Tomar foto de evidencia'}).click();
 await page.locator('input[type=file][accept="image/*"]').setInputFiles({name:'foto.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64')});
 await card.getByRole('button',{name:'Cerrar incidencia'}).click();
 await expect(board.locator('.c-closed')).toContainText('INC-233');
 await board.getByRole('button',{name:'Entregar turno'}).click();
 await expect(board.locator('.sh-summary')).toContainText('INC-231');
 await expect(board.locator('.sh-summary > ol')).not.toContainText('INC-233'); // no está pendiente…
 await expect(board.locator('.sh-proofs')).toContainText('INC-233'); // …sale con su evidencia
 await page.goto('/');
 await expect(page.locator('a[download]').first()).toHaveAttribute('href','/cv/Bruno-Salas-ES.pdf');
 await page.getByRole('button', { name:'Switch to English' }).click();
 await expect(page.locator('a[download]').first()).toHaveAttribute('href','/cv/Bruno-Salas-EN.pdf');
 await page.getByRole('button', { name:'Cambiar a español' }).click();
 expect((await request.get('/cv/Bruno-Salas-EN.pdf')).status()).toBe(200);
});

test('game scenes gallery: cameras, and the temple toggles its pixel art', async ({page})=>{
 await page.goto('/');
 const thumbs=page.locator('.pano-thumbs button');
 await thumbs.first().scrollIntoViewIfNeeded();
 await expect(thumbs).toHaveCount(4);
 await thumbs.nth(0).click();
 const stage=page.locator('.pano-stage img.on');
 await expect(stage).toHaveAttribute('src','/media/escenas/templo-noche-pixel.webp');
 await page.getByRole('button',{name:'Pixel art',exact:true}).click();
 await expect(stage).toHaveAttribute('src','/media/escenas/templo-noche-suave.webp');
 await thumbs.nth(2).click();
 await expect(page.getByRole('button',{name:'Pixel art',exact:true})).toHaveCount(0);
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
 // Lo primero que se ve al entrar a la demo es lo encontrado, arriba de la tabla; el mapa vive en «Columnas».
 const found=await page.locator('.cf').boundingBox(), table=await page.locator('.dw-tablewrap').boundingBox();
 expect(found!.y).toBeLessThan(table!.y);
 await expect(page.locator('.cf-chip.fix')).toContainText('6 con arreglo automático');
 await page.getByRole('tab',{name:'Columnas'}).click();
 const map=page.locator('.dw-mindmap');await map.scrollIntoViewIfNeeded();
 await expect(map.locator('.mm-branch')).toHaveCount(10);
 await page.getByRole('tab',{name:'Revisar y limpiar'}).click();
 const problems=page.locator('.dw-kpis div').nth(3).locator('dd');
 await expect(problems).toHaveText('7');
 await page.getByRole('button',{name:/Arreglar lo automático/}).click();
 await expect(problems).toHaveText('1'); // sólo queda la regla de negocio, que no se arregla sola
 await expect(page.locator('.dw-kpis div').first().locator('dd')).toHaveText('22');
 await page.getByRole('button',{name:'Organismo de agua'}).click();
 await expect(page.locator('.cf')).toContainText('Negativos en «dias_para_atender»');
 // El padrón de clientes enseña las reglas de México: RFC, teléfono, correo y CP con formato de un clic.
 await page.getByRole('button',{name:'Padrón de clientes'}).click();
 await expect(page.locator('.cf')).toContainText('RFC inválido en «rfc»');
 await page.getByRole('button',{name:/Arreglar lo automático/}).click();
 await expect(page.locator('.dw-tablewrap')).toContainText('FCU190711K21');
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
 await expect(club.locator('.ld-kpis div').nth(3).locator('dd')).toHaveText('19'); // 18 del mes + la de Mariana
 await club.getByRole('button',{name:/Su cumpleaños/}).click();
 await expect(club.locator('.ld-chat')).toContainText('cumpleaños');
 await club.getByRole('button',{name:/Enviar campaña/}).click();
 await club.getByRole('button',{name:'Reservar mesa'}).click();
 await expect(club.locator('.ld-chat')).toContainText('4 personas');
});

test('stamp card from the NFC chip: one stamp a day, and the reward resets it',async({page})=>{
 await page.goto('/sello?n=Cafe%20Prueba&m=5&p=Un%20cafe&c=5fcfa9');
 await expect(page.locator('.st-count')).toHaveText('1/5');
 await expect(page.getByRole('heading',{level:1})).toHaveText('¡Bienvenido a Cafe Prueba!');
 await page.reload();
 await expect(page.locator('.st-count')).toHaveText('1/5');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Ya tienes el sello de hoy.');
 await page.goto('/sello?n=Cafe%20Prueba&m=5&p=Un%20cafe&c=5fcfa9&demo');
 await page.getByRole('button',{name:/Demo/}).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('¡Sello de hoy listo!');
 for (let i=0;i<3;i++) await page.getByRole('button',{name:/Demo/}).click();
 await expect(page.locator('.st-count')).toHaveText('5/5');
 await page.getByRole('button',{name:'Canjear premio'}).click();
 await page.getByRole('button',{name:'Sí, canjeado'}).click();
 await expect(page.locator('.st-count')).toHaveText('0/5');
 await page.goto('/nfc');
 await page.getByLabel('Nombre del negocio').fill('Café Prueba');
 await expect(page.getByLabel('Enlace del chip')).toHaveValue(/\/sello\?n=Caf%C3%A9\+Prueba&m=8/);
});

test('first visit shows the intro and it gets out of the way',async({browser})=>{
 const page=await browser.newPage();
 await page.goto('/');
 await expect(page.locator('#intro')).toBeVisible();
 await expect(page.locator('#intro')).toHaveCount(0,{timeout:6000});
 await expect(page.getByRole('heading',{level:1})).toContainText('Desarrollo web');
 await page.close();
});

test('on desktop each wheel step moves one zone, and the index jumps to a project',async({page})=>{
 await page.setViewportSize({width:1440,height:860});
 await page.goto('/');
 await expect(page.locator('html')).toHaveClass(/paged/);
 await page.mouse.move(700,400);
 await page.mouse.wheel(0,120);
 await expect(page.locator('.zone-dots .on')).toContainText('Proyectos');
 await page.waitForTimeout(400);
 await page.mouse.wheel(0,120);
 await expect(page.locator('.zone-dots .on')).toContainText('NFC para negocios');
 await page.locator('.zone-dots').getByRole('button',{name:'Proyectos',exact:true}).click();
 await page.locator('.project-index button',{hasText:'Entrega de turno'}).click();
 await expect(page.locator('.zone-dots .on')).toContainText('Entrega de turno');
});
