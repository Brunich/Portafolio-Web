// Un reporte limpio para imprimir o guardar en PDF: hoja blanca y tablas, sin el tema oscuro de la app.
// Va en un iframe escondido y no en una ventana nueva, para que el navegador no lo bloquee.
export const esc = (s: string | number) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const CSS = `@page{margin:14mm}*{box-sizing:border-box}body{margin:0;font:13px/1.45 system-ui,'Segoe UI',Roboto,sans-serif;color:#16181d}
header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:2px solid #16181d;padding-bottom:10px;margin-bottom:16px}
h1{margin:0;font-size:22px;letter-spacing:-.01em}header p{margin:2px 0 0;color:#555}header small{color:#555;text-align:right}
h2{margin:22px 0 8px;font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#333}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0}.kpis div{border:1px solid #d5d7dc;border-radius:8px;padding:8px 10px}
.kpis dt{font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.05em}.kpis dd{margin:2px 0 0;font-size:20px;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:5px 8px;border-bottom:1px solid #e1e3e8;vertical-align:top}
th{background:#f2f3f5;font-weight:600}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.bad{color:#b4232f;font-weight:600}.ok{color:#17734a;font-weight:600}.warn{color:#9a6200;font-weight:600}
.note{margin:6px 0 0;color:#555}figure{margin:0;break-inside:avoid}svg{max-width:100%;height:auto}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}.sign div{border-top:1px solid #16181d;padding-top:4px;font-size:11px;color:#555}
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
