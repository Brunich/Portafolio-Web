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
