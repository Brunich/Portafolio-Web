// Exporta reel.html cuadro por cuadro. Uso:
//   node motion/render.mjs            → video completo en motion/out/reel.mp4
//   node motion/render.mjs 1.2 5.9 …  → sólo esos instantes, como PNG, para revisar
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url)), out = join(here, 'out'), frames = join(tmpdir(), 'bruno-reel-frames'); // fuera de OneDrive: son 900 PNG temporales
const FPS = 60, SECONDS = 15, times = process.argv.slice(2).map(Number);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(pathToFileURL(join(here, 'reel.html')).href + '?export');
await page.evaluate(() => window.ready);
const grab = async (t, file) => {
 const data = await page.evaluate(t => { window.render(t); return document.getElementById('c').toDataURL('image/png'); }, t);
 writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
};
if (times.length) {
 for (const t of times) await grab(t, join(out, `t${t.toFixed(2)}.png`));
} else {
 rmSync(frames, { recursive: true, force: true }); mkdirSync(frames);
 for (let f = 0; f < FPS * SECONDS; f++) await grab(f / FPS, join(frames, `f${String(f).padStart(4, '0')}.png`));
 const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(frames, 'f%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(out, 'reel.mp4')], { stdio: 'inherit' });
 if (r.status !== 0) process.exit(r.status ?? 1);
}
await browser.close();
