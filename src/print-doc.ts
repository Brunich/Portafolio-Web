// Un reporte para imprimir o guardar en PDF, con el formato de la hoja de proceso en tinta sobre blanco.
// Siempre en claro, aunque la app esté en oscuro: va a papel.
// Va en un iframe escondido y no en una ventana nueva, para que el navegador no lo bloquee.
export const esc = (s: string | number) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const CSS = `@page{margin:14mm}*{box-sizing:border-box}body{margin:0;font:12.5px/1.45 Archivo,'Helvetica Neue',Arial,sans-serif;color:#1c1d1a;background:#fff}
header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:2px solid #1c1d1a;padding-bottom:8px;margin-bottom:14px}
h1{margin:0;font-size:21px;font-weight:700}header p{margin:2px 0 0;color:#4a4c46}header small{color:#4a4c46;text-align:right;font-family:'JetBrains Mono',Consolas,monospace;font-size:10.5px}
h2{margin:20px 0 6px;padding-bottom:3px;border-bottom:1px solid #1c1d1a;font:700 11px 'JetBrains Mono',Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:0;border:1px solid #1c1d1a}.kpis div{border-right:1px solid #1c1d1a;padding:7px 10px}.kpis div:last-child{border-right:0}
.kpis dt{font:600 10px 'JetBrains Mono',Consolas,monospace;color:#4a4c46;text-transform:uppercase;letter-spacing:.06em}.kpis dd{margin:2px 0 0;font:700 19px 'JetBrains Mono',Consolas,monospace}
table{width:100%;border-collapse:collapse;font-size:11.5px}th,td{text-align:left;padding:4px 8px;border-bottom:1px solid #b9b5a8;vertical-align:top}
th{border-bottom:1.5px solid #1c1d1a;font:700 10px 'JetBrains Mono',Consolas,monospace;text-transform:uppercase;letter-spacing:.05em}td.n,th.n{text-align:right;font-family:'JetBrains Mono',Consolas,monospace;font-variant-numeric:tabular-nums}
.bad{color:#8f2a1d;font-weight:700}.ok{color:#2c5e38;font-weight:700}.warn{color:#7a5a0c;font-weight:700}
.note{margin:6px 0 0;color:#4a4c46}figure{margin:0;break-inside:avoid}svg{max-width:100%;height:auto}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}.sign div{border-top:1px solid #1c1d1a;padding-top:4px;font:10.5px 'JetBrains Mono',Consolas,monospace;color:#4a4c46}
tr,li{break-inside:avoid}`;

export function printDoc(title: string, body: string, lang: 'es' | 'en' = 'es') {
 document.querySelector('iframe.print-doc')?.remove();
 const f = document.createElement('iframe');
 f.className = 'print-doc'; f.title = title; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
 f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
 document.body.append(f);
 const d = f.contentDocument!;
 d.open(); d.write(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}</body></html>`); d.close();
 setTimeout(() => { f.contentWindow?.focus(); f.contentWindow?.print(); }, 120);
}
