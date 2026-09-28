// Exporta reel.html cuadro por cuadro. Uso:
//   node motion/render.mjs                 → video completo en motion/out/bruno-salas-reel.mp4
//   node motion/render.mjs sheet 1 2.5 …   → hoja de contactos con esos instantes (motion/out/sheet.jpg)
//   node motion/render.mjs 1.2 5.9 …       → sólo esos instantes, como PNG, para revisar
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url)), out = join(here, 'out'), frames = join(tmpdir(), 'bruno-reel-frames'); // fuera de OneDrive: son miles de PNG temporales
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
 const total = Math.round(FPS * await page.evaluate(() => window.DUR));
 rmSync(frames, { recursive: true, force: true }); mkdirSync(frames);
 for (let f = 0; f < total; f++) { await grab(f / FPS, join(frames, `f${String(f).padStart(5, '0')}.png`), true); if (f % 300 === 0) console.log(`${f}/${total}`); }
 await browser.close(); // libera memoria: con el navegador abierto, x264 se quedó sin ella
 const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(frames, 'f%05d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-threads', '4', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(out, 'bruno-salas-reel.mp4')], { stdio: 'inherit' });
 if (r.status !== 0) process.exit(r.status ?? 1);
 console.log('listo:', join(out, 'bruno-salas-reel.mp4'));
}
if (browser.isConnected()) await browser.close();
