# Plan 06 · VibeMap y Punto U

## VibeMap (`/proyectos/vibemap`)
| # | Qué pasa | Estado |
|---|---|---|
| V1 | Encabezado roto en celular (G1) | ✅ |
| V2 | La demo embebida repite puntos de referencia sin nombre (`landmark-unique`, 3 casos) | ✅ |
| V3 | La demo es un iframe de otro dominio: si ese despliegue cae, la página queda vacía sin aviso | 🔎 |

**Tandas.** T1: V1 y V2. T2: captura de respaldo que aparece si el iframe no carga.

## Punto U (`/proyectos/punto-u`)
| # | Qué pasa | Estado |
|---|---|---|
| U1 | **No carga datos:** el servidor de Supabase `wugsixqhygqvamgywymn.supabase.co` ya no existe en el DNS. Sospecho que el proyecto gratuito se pausó por inactividad. La app abre, pero vacía. | ✅ el fallo · 🔎 la causa |
| U2 | Es lo que se muestra en la vitrina de la portada | ✅ |
| U3 | Imágenes sin tamaño (la página brinca al cargar) | ✅ |

**Tandas.**
- T1: tú entras a supabase.com y revisas si el proyecto está pausado (reactivarlo es un clic en su panel). Es tu cuenta, así que no lo toco.
- T2: si no se puede reactivar, quitarlo de la vitrina y mostrar capturas en vez de la app en vivo.

## Estado al 28-09-2026
**Hecho y validado técnicamente**
- Punto U: la página prueba su servidor; si no responde, enseña capturas de la app con un aviso y cambia el texto. Hoy cae en ese caso: `wugsixqhygqvamgywymn.supabase.co` sigue sin existir en el DNS (observado hoy).
- VibeMap: el mismo respaldo si su despliegue cae (hoy responde 200). Pruebas simulan los dos estados.

**Falta**
- U1: que revises en supabase.com si el proyecto está pausado (sospecha, no comprobada). En cuanto conteste, la página vuelve sola a la app en vivo.
- V2 (`landmark-unique` dentro del iframe) es del repo de VibeMap; no lo toqué.
- V2 resuelto del lado del portafolio (28-09): encabezado, contenido y pie con nombre propio; axe 0 avisos con el iframe incluido. VibeMap sola ya daba 0. Su repo se publica solo al subir a GitHub: no se toca sin tu permiso.
