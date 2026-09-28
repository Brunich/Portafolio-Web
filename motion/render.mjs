// Exporta reel.html cuadro por cuadro. Uso:
//   node motion/render.mjs                 → video completo en motion/out/bruno-salas-reel.mp4
//   node motion/render.mjs sheet 1 2.5 …   → hoja de contactos con esos instantes (motion/out/sheet.jpg)
//   node motion/render.mjs 1.2 5.9 …       → sólo esos instantes, como PNG, para revisar
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url)), out = join(here, 'out');
const FPS = 60, args = process.argv.slice(2), isSheet = args[0] === 'sheet', times = (isSheet ? args.slice(1) : args).map(Number);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => { console.error('Error en la página:', e.message); process.exit(1); });
await page.goto(pathToFileURL(join(here, 'reel.html')).href + '?export');
await page.evaluate(() => window.ready);
const save = (data, file) => writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
const grab = async (t, file, blur) => save(await page.evaluate(([t, blur]) => { blur ? window.frame(t) : window.render(t); return document.getElementById('c').toDataURL('image/png'); }, [t, blur]), file);
if (isSheet) save(await page.evaluate(ts => window.sheet(ts), times), join(out, 'sheet.jpg'));
else if (times.length) for (const t of times) await grab(t, join(out, `t${t.toFixed(2)}.png`), false);
else {
 // Los cuadros van directo a ffmpeg por una tubería: 3000 PNG en disco son ~9 GB y llenaron el disco una vez.
 const total = Math.round(FPS * await page.evaluate(() => window.DUR)), file = join(out, 'bruno-salas-reel.mp4');
 const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-threads', '4', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
 const done = new Promise(ok => ff.on('close', ok));
 for (let f = 0; f < total; f++) {
  const data = await page.evaluate(t => { window.frame(t); return document.getElementById('c').toDataURL('image/png'); }, f / FPS);
  if (!ff.stdin.write(Buffer.from(data.split(',')[1], 'base64'))) await new Promise(ok => ff.stdin.once('drain', ok));
  if (f % 300 === 0) console.log(`${f}/${total}`);
 }
 ff.stdin.end(); const code = await done;
 if (code !== 0) { console.error('ffmpeg falló:', code); process.exit(1); }
 console.log('listo:', file);
}
if (browser.isConnected()) await browser.close();
