# Plan 00 · Portafolio (lo que comparten todas las páginas)

Auditoría del 28-09-2026: 12 páginas, escritorio 1440 px y celular 390 px, con axe (todos los niveles), consola, desbordes y objetivos táctiles. Capturas en el chat.
**Leyenda:** ✅ comprobado · 🔎 sospecha por verificar.

## Errores

| # | Qué pasa | Dónde | Estado |
|---|---|---|---|
| G1 | **En celular, toda página de proyecto se rompe**: el encabezado sigue en dos columnas; el título se corta («Analizad», «Inventari») y la animación queda apretada a un lado | `.case-head` en las 7 páginas `/proyectos/*` | ✅ |
| G2 | El botón flotante de «siguiente zona» (`.zone-nav`) **tapa texto** a la derecha: «Cómo funciona» de Turno, la tarjeta de `/nfc` («Arriba»), párrafos en celular | `brand.css .zone-nav` | ✅ |
| G3 | Los estilos de los componentes que cargan tarde **pisan la paleta morada**: el analizador sale gris azulado (`--dw-bg:#1e2029` en vez de `#1b1629`) | `data-workbench.css` gana a `brand.css` | ✅ |
| G4 | `/propuestas` ya no existe y cae a la portada (la reescritura sigue en `vercel.json`) | `App.tsx route()`, `vercel.json` | ✅ |
| G5 | Los títulos saltan de nivel (h2 → h4) | analizador, planta, turno (`heading-order`) | ✅ |
| G6 | Objetivos táctiles de menos de 24 px: marca «Bruno Salas portafolio» (18 px de alto), «ver todas» (15 px), «ejemplo .xlsx» (17 px), «Hecho por Bruno Salas» | varias | ✅ |
| G7 | 5 imágenes sin `width`/`height`: la página «brinca» al cargar | portada (Punto U, templo, costa) | ✅ |
| G8 | «Cómo funciona»: 4 o 5 pasos en rejilla de 3 dejan uno o dos huérfanos abajo; en capturas de página completa el texto sale cortado por la animación de revelado | NFC (4), analizador (5) | ✅ huérfanos · 🔎 corte (puede ser sólo la captura) |
| G9 | La vitrina de la portada muestra NFC, CSV y **Punto U** (que hoy no carga datos); no aparecen Planta, Inventario ni Turno | `HeroShowcase.tsx` | ✅ |
| G10 | Portada en celular: 15 000 px de alto; cada fila de proyecto repite pitch, métricas y etiquetas | `ProjectRow` | ✅ |

## Mejoras de diseño
- Un solo lenguaje de color: todo panel en `--surface` morado; hoy conviven grises azulados (analizador, demo del restaurante en NFC) con morado.
- Colores vivos que chocan con «nada chillante»: botón WhatsApp verde `#25D366` en Planta; muestras de color de la tarjeta de sellos (rosa `#e46a8b`, amarillo `#e8b04a`, azul `#5aa7e6`).
- Espacios muertos: huecos grandes antes de «Siguiente proyecto» y columnas desbalanceadas (Planta «Paros por causa», Inventario columna izquierda).
- Imagen para compartir (Open Graph) con la portada del reel; hoy el enlace en WhatsApp o LinkedIn sale sin vista previa.

## Tandas
1. **T1 · Celular primero (G1, G2, G6).** Encabezado de proyecto en una columna por debajo de 860 px, con el título a tamaño fluido; el botón flotante no tapa nada (margen o zona segura); objetivos táctiles ≥ 44 px.
   *Listo cuando:* las 7 páginas a 390 px no tienen texto cortado ni tapado (capturas antes y después), y la prueba de desborde pasa.
2. **T2 · Consistencia (G3, G5, G7, G8, color).** Paleta blindada con `:root .dw-…`; orden de títulos; tamaños de imagen; rejilla de «Cómo funciona» que se adapta al número de pasos.
   *Listo cuando:* axe da 0 avisos también en `best-practice`, y no hay paneles grises.
3. **T3 · Portada (G4, G9, G10, OG).** Quitar o rehacer `/propuestas`; vitrina con los proyectos nuevos; filas más cortas en celular; imagen para compartir.
   *Listo cuando:* la portada en celular mide ≤ 9 000 px y el enlace se ve con vista previa en WhatsApp.
4. **T4 · Publicar.** `vercel --prod` con tu permiso, y recorrido en tu celular real.

## Estado al 28-09-2026
**Hecho y validado técnicamente**
- T1: encabezado en una columna a 390 px en las 7 páginas (prueba `on a phone every project header…`); botón flotante que se esconde al bajar y no tapa texto (0 choques medidos en escritorio y celular); objetivos táctiles a 44 px.
- T2: paleta morada en analizador, gráfica, demo del restaurante, sellos y menú (conversión que conserva la luminosidad); títulos h4→h3; imágenes con tamaño; «Cómo funciona» en una fila según el número de pasos. **axe: 0 avisos en 24 combinaciones, incluidas best-practice.**
- T3: Planta sustituye a Punto U en la vitrina; `og.png` nuevo (la imagen existía, pero era la versión gris: corregido el diagnóstico original); `/propuestas` fuera; filas de la portada más cortas en celular (15 083 → 12 893 px).

**Falta**
- T4: publicar con `vercel --prod` (espera tu «sí, publica») y recorrerlo en tu celular: eso es la validación en uso.
- La portada en celular sigue larga (perfil y experiencia); decidir si se recorta.
