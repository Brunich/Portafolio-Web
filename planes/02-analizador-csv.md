# Plan 02 · Analizador de CSV (`/proyectos/analizador-csv`, repo `analizador-csv`)

**Meta:** que abra cualquier reporte que te pase alguien (de Excel, grande o feo), te diga en 5 segundos qué está mal y lo deje listo.

## Ya arreglado hoy (comprobado con archivos reales)
- CSV de Excel en español (Windows-1252 y UTF-16), filas cortas o con datos de más, líneas vacías, tabuladores, `.xlsx`. 60 000 filas en ~2 s; SQL sobre ellas en <1 s. Hay pruebas unitarias y de navegador.

## Errores
| # | Qué pasa | Estado |
|---|---|---|
| A1 | Sale **gris azulado** en vez de morado en el portafolio (su CSS carga tarde y gana) | ✅ |
| A2 | En celular, el mapa de columnas y las tarjetas de columnas **repiten la misma información**: la página mide 7 500 px | ✅ |
| A3 | En celular se cortan «Problemas» en las cifras y la pestaña «Preguntar con SQL» | ✅ |
| A4 | El mapa en escritorio deja ~300 px vacíos hasta que entra en pantalla (se anima al aparecer); en capturas y al cargar se ve un hueco | ✅ |
| A5 | 10 columnas en rejilla de 5 dejan «inspector» sola en una fila | ✅ |
| A6 | «ver todas» mide 15 px de alto: difícil de tocar | ✅ |
| A7 | Con 60 000 filas, el aviso «Las celdas marcadas…» y la tabla sólo enseñan 10; no hay paginación ni forma de saltar a la fila con problema | 🔎 revisar el flujo |
| A8 | Excel con varias hojas: se abre la primera con datos, sin avisar cuál ni dejar elegir | ✅ (por diseño; falta avisar) |
| A9 | Fechas de Excel con hora (`2026-03-02 14:00`) o con meses en texto («2 mar 2026») no se reconocen como fecha | 🔎 falta probarlo |

## Mejoras de diseño
- Paleta morada en tabla, tarjetas y botones.
- En celular: mapa **o** tarjetas, no ambos; tabla con la primera columna fija.
- «Qué encontré» más visual: cada problema con un mini ejemplo («03/03/2026 → 2026-03-03»).
- Estado de carga para archivos grandes (barra «leyendo 60 000 filas…») en vez de congelarse 2 s.

## Tandas
1. **T1 · Color y celular (A1, A2, A3, A6).**
   *Listo cuando:* a 390 px la página mide ≤ 4 500 px, no hay texto cortado y el panel es morado (color medido).
2. **T2 · Archivos reales II (A8, A9, carga).** Selector de hoja de Excel, más formatos de fecha, barra de progreso con una prueba de 60 000 filas.
3. **T3 · Encontrar y arreglar (A7, «Qué encontré» visual).** Saltar a la fila con problema, paginación, antes/después en cada regla.
4. **T4 · Siguiente nivel.** Comparar dos cortes del mismo reporte (qué filas son nuevas, cuáles cambiaron).

## Estado al 28-09-2026
**Hecho y validado técnicamente**
- T1: morado; en celular cifras 2×2, pestañas completas, una sola vista de columnas con «Ver las N columnas» (7 441 → 5 807 px).
- T2: `dates.ts` lee 2 mar 2026, 02-03-26, «2 de marzo de 2026», con hora, y rechaza fechas imposibles (pruebas); selector de hoja de Excel (prueba con un libro de 3 hojas); aviso «Leyendo…» en archivos grandes.
- T3: páginas de 100 filas; la regla de fechas muestra el antes → después (las demás reglas todavía no); histogramas sin que un atípico los aplaste.
- Medido: 60 000 filas (2,3 MB) abren en 1,2 s en producción; página siguiente 0,2 s; búsqueda 0,2 s.

**Falta**
- T4: comparar dos cortes del mismo reporte.
- En celular, «Qué encontré» sigue debajo de la tabla; valorar subirlo.
- T4 (28-09): pestaña **Comparar**: filas nuevas, las que ya no están y cada celda que cambió, con llave adivinada (acepta pocos folios repetidos y avisa); 60 000 vs 60 000 filas en < 1 s (prueba). Ejemplos antes → después en todas las reglas que se arreglan solas; en celular «Qué encontré» va antes de la tabla; aviso con lenguaje de reporte («Se encontraron incoherencias · revisar»).
