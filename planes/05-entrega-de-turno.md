# Plan 05 · Entrega de turno (`/proyectos/entrega-de-turno`, repo `entrega-de-turno`)

**Meta:** que el turno que entra sepa en 30 segundos qué quedó pendiente, quién lo tiene y qué ya se cerró con evidencia.

## Lo que ya funciona (comprobado)
- Tablero con 3 columnas, reglas de cierre (responsable + foto), SLA por severidad, bitácora tipo consola, resumen para WhatsApp. Pruebas unitarias de las reglas.

## Errores
| # | Qué pasa | Estado |
|---|---|---|
| T1 | Encabezado roto en celular (G1) | ✅ |
| T2 | El botón flotante tapa el paso 03 de «Cómo funciona» | ✅ |
| T3 | Arrastrar tarjetas depende del *drag and drop* del navegador, que en celular casi no funciona con el dedo; en celular sólo se puede mover abriendo la tarjeta | 🔎 probar en celular real |
| T4 | La portada animada muestra la bitácora de ejemplo con horas 07:10–09:12, que no coinciden con el reloj real del tablero | ✅ menor |
| T5 | Con muchas incidencias, cada columna crece sin límite (no hay «ver más» ni filtro por línea) | ✅ |
| T6 | Las fotos viven sólo en ese navegador: si se cambia de celular, se pierden (limitación conocida) | ✅ por diseño |

## Mejoras de diseño
- En celular: las columnas como pestañas deslizables (Abiertas / En curso / Cerradas) en vez de apiladas.
- Mover tarjetas con botones «→ En curso», «✓ Cerrar» visibles en celular.
- Resumen de entrega como tarjeta imprimible o PDF con las fotos.
- Filtro por línea (L1/L2/L3) y por severidad.

## Tandas
1. **T1 · Celular (T1, T2, T3).** Pestañas y botones para mover sin arrastrar.
   *Listo cuando:* a 390 px se puede mover una tarjeta de Abiertas a Cerradas sólo con toques (prueba de navegador con pantalla táctil).
2. **T2 · Volumen (T5).** Filtros y «ver más»; prueba con 60 incidencias.
3. **T3 · Entrega formal.** PDF del turno con fotos.
4. **T4 · Compartido (T6).** Sincronizar entre celulares; necesita servidor y es decisión tuya.
