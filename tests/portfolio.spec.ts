import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('portfolio has working bilingual navigation, project pages and CV', async ({ page, request }) => {
 // El servidor de Punto U se simula arriba: esta prueba revisa la página, no el estado de Supabase.
 await page.route('**/*supabase.co/**', r => r.fulfill({ status: 200, body: '' }));
  await page.goto('/');
  await expect(page.getByRole('heading', {level:1})).toContainText('Desarrollo web');
  await page.getByRole('button', { name:'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByRole('link', {name:'View projects',exact:true})).toBeVisible();
  await page.getByRole('button', { name:'Cambiar a español' }).click();
  await page.locator('.others-grid a[href="/proyectos/punto-u"]').click(); // Punto U va en «Otros trabajos»
  await expect(page).toHaveURL(/\/proyectos\/punto-u$/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Punto U');
  await expect(page.getByRole('heading',{name:'Cómo funciona'})).toBeVisible();
  await expect(page.locator('.how li')).toHaveCount(3);
  await page.locator('.case-next a').click();
  await expect(page).toHaveURL(/\/proyectos\/asistente-ia-local$/);
  expect((await request.get('/cv/Bruno-Salas-ES.pdf')).status()).toBe(200);
  expect((await request.get('/og.png')).status()).toBe(200);
});

test('mobile and desktop have no horizontal overflow or serious accessibility errors', async ({ page }) => {
  test.setTimeout(360000);
  // Sin animaciones: el contraste se mide en el estado final, no a media transición.
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    for (const path of ['/','/proyectos/club-nfc','/proyectos/club-nfc/app','/proyectos/analizador-csv','/proyectos/analizador-csv/app','/proyectos/entrega-de-turno','/proyectos/la-casa-del-angel','/proyectos/graficas-de-control','/proyectos/asistente-ia-local','/proyectos/vibemap','/proyectos/punto-u','/proyectos/ia-rogue','/sobre-mi','/proyectos/planta','/proyectos/inventario','/menu','/nfc']) {
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
 // Índice de once, un proyecto por parada en este orden y tres tarjetas de «Otros trabajos».
 await expect(page.locator('.project-index li')).toHaveCount(11);
 const order = await page.locator('#projects .row').evaluateAll(rows=>rows.map(r=>r.id));
 expect(order).toEqual(['p-turno','p-planta','p-spc','p-inventario','p-csv','p-casa','p-club']);
 await expect(page.locator('#p-turno .group-line')).toContainText('misma planta');
 await expect(page.locator('#p-turno .row-num')).toHaveText('01 / 07');
 await expect(page.locator('.others-grid li')).toHaveCount(3);
 // Sin lemas viejos de folleto.
 for (const old of ['Todas se pueden probar.','Hobby profesional','Hablemos de tu proyecto','Tráiler de IA Rogue']) await expect(page.locator('main')).not.toContainText(old);
 // «En desarrollo» sólo donde es cierto: otros trabajos, el juego, la línea de Android y los datos de cada fila.
 const withDev = await page.evaluate(()=>[...document.querySelectorAll('main *')]
  .filter(el=>el.children.length===0 && /en desarrollo|in development/i.test(el.textContent ?? ''))
  .map(el=>el.closest('.others-grid, .others-more, #graphics, .facts') ? 'ok' : (el.parentElement?.className ?? el.tagName)));
 expect(withDev.length).toBeGreaterThan(0);
 for (const c of withDev) expect(c).toBe('ok');
 // El límite cuida que no vuelvan los apartados largos.
 expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThan(15000);
 // Tres accesos en el inicio: pasar encima cambia la vista grande, la fila abre la app y la flecha lleva a la ficha.
 const access = page.locator('.hx-list > li');
 await expect(access).toHaveCount(3);
 await access.nth(1).hover();
 await expect(access.nth(1)).toHaveClass(/\bon\b/);
 await expect(access.nth(1).locator('.hx-page')).toHaveAttribute('href','/proyectos/entrega-de-turno');
 await expect(access.nth(2).locator('.hx-open')).toHaveAttribute('href',/la-casa-del-angel\.vercel\.app/);
 // Lo interno abre en la misma pestaña con el telón; la app trae su «volver» a la ficha.
 await access.nth(0).locator('.hx-open').click();
 await expect(page).toHaveURL(/\/proyectos\/planta\/app$/);
 await page.locator('.ax-back').click();
 await expect(page).toHaveURL(/\/proyectos\/planta$/);
 await expect(page.locator('html')).not.toHaveClass(/is-app/);
});

test('internal links stay in the tab; external ones open a new one and say so', async ({page})=>{
 await page.goto('/proyectos/planta');
 await page.locator('.case-action').click();
 await expect(page).toHaveURL(/\/proyectos\/planta\/app$/);
 await expect(page.locator('.ax-back')).toBeVisible();
 await page.locator('.ax-back').click();
 await expect(page).toHaveURL(/\/proyectos\/planta$/);
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 for (const path of ['/','/proyectos/planta','/proyectos/vibemap','/proyectos/club-nfc']) {
  await page.goto(path);
  const bad = await page.evaluate(()=>[...document.querySelectorAll<HTMLAnchorElement>('main a[href], footer a[href]')].filter(a=>{
   const out = new URL(a.href).origin !== location.origin && a.protocol.startsWith('http');
   return out ? a.target !== '_blank' || !/noopener/.test(a.rel) || !/noreferrer/.test(a.rel) || !a.querySelector('.sr-only') : a.target === '_blank' && a.pathname.startsWith('/proyectos/');
  }).map(a=>a.href));
  expect(bad, path).toEqual([]);
 }
});

test('shift handover: an incident cannot be closed without evidence, and the handover lists what is open', async ({page,request})=>{
 await page.goto('/proyectos/entrega-de-turno/app');
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

test('game block: cover, three thumbnails, pixel toggle and the IA Rogue page', async ({page})=>{
 await page.goto('/');
 const block=page.locator('#graphics');
 await expect(block.locator('.gd-stop h3')).toHaveText('IA Rogue');
 await expect(block.locator('.gd-thumbs a')).toHaveCount(3);
 const pixel=block.locator('.gd-pixel img');
 await pixel.scrollIntoViewIfNeeded();
 await expect(pixel).toHaveAttribute('src','/media/escenas/templo-noche-pixel.webp');
 await block.getByRole('button',{name:'Pixel art',exact:true}).click();
 await expect(pixel).toHaveAttribute('src','/media/escenas/templo-noche-suave.webp');
 await block.getByRole('link',{name:'Ver la ficha de IA Rogue'}).click();
 await expect(page).toHaveURL(/\/proyectos\/ia-rogue$/);
 await expect(page.getByRole('heading',{level:1})).toHaveText('IA Rogue');
 await expect(page.locator('#lugares figure')).toHaveCount(6);
 await expect(page.locator('#agua figure')).toHaveCount(3);
 // Fotos 16:9 con tamaño, alt real y carga diferida; el pie dice lugar / cámara / hora.
 for (const img of await page.locator('#lugares img, #agua img').all()) {
  await expect(img).toHaveAttribute('loading','lazy');
  await expect(img).toHaveAttribute('width','1600');
  await expect(img).toHaveAttribute('height','900');
  expect((await img.getAttribute('alt'))!.length).toBeGreaterThan(20);
 }
 await expect(page.locator('#agua .rg-cap').first().locator('span')).toHaveCount(3);
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
 await page.goto('/proyectos/analizador-csv/app');
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
 await page.goto('/proyectos/club-nfc/app');
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

test('the first visit opens straight on the start, with no intro in between',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#intro')).toHaveCount(0);
 await expect(page.getByRole('heading',{level:1})).toContainText('Desarrollo web');
});

test('on desktop each wheel step moves one zone, and the index jumps to a project',async({page})=>{
 await page.setViewportSize({width:1440,height:860});
 await page.goto('/');
 await expect(page.locator('html')).toHaveClass(/paged/);
 await page.mouse.move(700,400);
 await page.mouse.wheel(0,120);
 await expect(page.locator('main [data-zone].zone-in')).toHaveAttribute('data-zone','Proyectos');
 await page.waitForTimeout(400);
 await page.mouse.wheel(0,120);
 await expect(page.locator('main [data-zone].zone-in')).toHaveAttribute('data-zone','Entrega de turno');
 await page.locator('.topnav').getByRole('link',{name:'Proyectos',exact:true}).click();
 await page.locator('.project-index button',{hasText:'Inventario con la cámara'}).click();
 await expect(page.locator('main [data-zone].zone-in')).toHaveAttribute('data-zone','Inventario con la cámara');
 // Los enlaces de la barra siguen llevando a secciones que existen tras el reordenamiento.
 for (const id of ['projects','about','graphics','motion','contact']) await expect(page.locator(`#${id}`)).toHaveCount(1);
});

test('the three-styles character fits whole in one wheel stop, even on a small laptop',async({page})=>{
 await page.setViewportSize({width:1366,height:768});
 await page.goto('/');
 await expect(page.locator('html')).toHaveClass(/paged/);
 await page.locator('.topnav').getByRole('link',{name:'Game dev',exact:true}).click();
 await expect(page.locator('main [data-zone].zone-in')).toHaveAttribute('data-zone','Game dev');
 await page.waitForTimeout(1200);
 await page.mouse.move(700,400);
 // Se avanza hasta la parada del personaje (una rueda desde Game dev, con margen por si el telón tarda)
 for(let i=0;i<4;i++){
  if(await page.locator('main [data-zone].zone-in').getAttribute('data-zone')==='Tres estilos')break;
  await page.mouse.wheel(0,120);
  await page.waitForTimeout(1700);
 }
 await expect(page.locator('main [data-zone].zone-in')).toHaveAttribute('data-zone','Tres estilos');
 await page.waitForTimeout(1200);
 const box=await page.locator('.model-lab').evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom};});
 expect(box.top).toBeGreaterThan(74);
 expect(box.bottom).toBeLessThanOrEqual(768);
});
test('about me lives on its own page, reached from the contact section', async ({page})=>{
 await page.goto('/');
 await expect(page.locator('#hobbies')).toHaveCount(0);
 await page.locator('.contact-about').click();
 await expect(page).toHaveURL(/\/sobre-mi$/);
 await expect(page.locator('.hob-video video')).toHaveCount(4);
 await expect(page.locator('.hob-photos img')).toHaveCount(9);
});
