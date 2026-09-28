# Plan 03 · Planta: consolidador y OEE (`/proyectos/planta`, repo `planta-oee`)

**Meta:** que un supervisor suba los tres reportes del turno y en un minuto tenga el OEE, lo que no cuadra y el Excel para su jefe.

## Lo que ya funciona (comprobado)
- Cruza producción, calidad y paros; 9 excepciones en el ejemplo; OEE por línea; Excel de 4 hojas. Desde hoy lee CSV de Excel en español con acentos.

## Errores
| # | Qué pasa | Estado |
|---|---|---|
| P1 | Encabezado roto en celular (G1) | ✅ |
| P2 | Si falta una columna, sólo dice «Falta: fecha, turno…» pero no deja **decir cuál columna es cuál** (p. ej. «Fecha de producción» → fecha) | ✅ |
| P3 | «ejemplo .xlsx» mide 17 px de alto (difícil de tocar) | ✅ |
| P4 | Botón WhatsApp verde vivo `#25D366`, fuera de paleta | ✅ |
| P5 | «Paros por causa» es corto y deja la columna derecha vacía junto a la lista larga de «Lo que no cuadra» | ✅ |
| P6 | La lista de excepciones no se puede exportar sola ni marcar como revisada | ✅ |
| P7 | Turnos que cruzan medianoche (nocturno 22–06) y fechas en formato `dd/mm/aaaa` de Excel: falta probar que el cruce no los separe | 🔎 falta probarlo |

## Mejoras de diseño
- Anillos con animación de llenado sincronizada, y la marca del 85 % más legible.
- «Dónde se pierde el tiempo»: leyenda con minutos visibles al pasar el dedo.
- Excepciones agrupadas por lote, con ícono por tipo, en vez de una lista plana.
- En celular, filtros como carrusel horizontal (hoy se envuelven en 4 filas).

## Tandas
1. **T1 · Arreglos visibles (P1, P3, P4, P5).**
   *Listo cuando:* no hay huecos de más de 200 px ni verde vivo, y a 390 px no hay nada cortado.
2. **T2 · Columnas a mano (P2).** Cuando una columna no se reconoce, se elige de una lista. Prueba con un Excel real de nombres raros.
3. **T3 · Datos difíciles (P7).** Turno nocturno y fechas dd/mm; pruebas unitarias.
4. **T4 · Seguimiento (P6).** Marcar excepciones como revisadas y exportarlas; histórico semanal del OEE.

## Estado al 28-09-2026
**Hecho y validado técnicamente**
- T1: sin verde vivo, enlaces a 44 px, columna derecha con «Por turno» (peor turno en rosa) y fija al bajar.
- T2: columnas no reconocidas se eligen de una lista (prueba de navegador con «No. de orden» y «Piezas OK»).
- T3: turno nocturno anotado con el día siguiente se cruza igual; uno de días después sigue marcándose; fechas dd/mm y con mes escrito (pruebas unitarias).
- T4 (parte): excepciones con palomita de revisada y exportación a CSV.

**Falta**
- Histórico semanal del OEE (necesita guardar turnos anteriores).
- Probar con un Excel real de tu trabajo: eso lo valida en uso.
- (29-09) OEE por día sacado de las fechas del reporte, con la meta del 85 % y el cambio por línea. Textos: «Incoherencias entre reportes», «Dato inválido».
