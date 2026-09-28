# 10 · Qué le hace falta a cada proyecto

**Meta:** que cada proyecto sea algo que un negocio podría instalar y usar, y que su GitHub enseñe cómo está hecha la app de verdad.

Escrito el 28-09-2026 después de revisar cada página y cada repo. Cada punto dice **qué**, **por qué** y **tamaño** (S = horas, M = 1–2 días, L = semana o más). ✅ = hecho en esta tanda.

---

## Portafolio (general)

| # | Qué | Por qué | Tamaño |
|---|---|---|---|
| G1 | ✅ Portada en tres apartados: **Útiles para el mercado**, **En desarrollo** y **Otros códigos** con tu GitHub | Lo pediste; separa lo que ya funciona de lo que va en camino | S |
| G2 | ✅ Aviso «¿Te sirve para tu negocio? Escríbeme» al final de cada proyecto | Hoy la página enseña, pero no invita a contratar | S |
| G3 | ✅ README del portafolio sin «Qué sigue» ni «Técnica»; con los tres apartados | Lo pediste; los planes viven aquí, no en GitHub | S |
| G4 | ✅ Avisos cortos con icono en todos los proyectos (no sólo el Analizador): Planta, Inventario, Turno, SPC | Oraciones tipo «Se encontraron…» suenan a alerta automática; un icono + 3 palabras se lee más rápido | M |
| G5 | Una imagen para compartir por proyecto (la que sale al mandar el enlace por WhatsApp) | Hoy todos comparten la misma portada | M |
| G6 | Una línea «Para quién es» en cada proyecto (café, taller, planta, tienda) | Quien llega de un anuncio se reconoce más rápido | S |
| G7 | Revisar la versión en inglés con la misma regla de brevedad | Se tradujo del texto largo | M |

## NFC para negocios

| # | Qué | Por qué | Tamaño |
|---|---|---|---|
| N1 | Panel del negocio: visitas por día, clientes que regresan, premios canjeados | Es lo que el dueño paga; hoy sólo lo ve el cliente | L (necesita Supabase, que ya está vivo) |
| N2 | Sello firmado para que no se pueda copiar el enlace de un celular a otro (firma HMAC; o chips NTAG 424 DNA con código que cambia en cada toque) | Sin esto, un cliente puede compartir su tarjeta llena | M / L |
| N3 | Varias sucursales con la misma tarjeta | Cadenas pequeñas (2–5 locales) son el cliente natural | M |
| N4 | Caducidad del premio y recordatorio por WhatsApp («te falta 1 sello») | Hace que vuelvan, que es el objetivo | M |
| N5 | Hoja de venta: qué incluye el kit (chips, base impresa, configuración) y cuánto cuesta | Para ofrecerlo tal cual a un café | S |
| N6 | App Android nativa con el lector NFC | Ya marcada «en desarrollo» | L |

## Analizador de CSV

| # | Qué | Por qué | Tamaño |
|---|---|---|---|
| C1 | ✅ Orden nuevo: lo encontrado primero, luego la tabla; el mapa y las fichas de columnas a su pestaña «Columnas» | La página estaba muy cargada y lo importante quedaba al fondo | S |
| C2 | ✅ Sin el recuadro «Esto es un ejemplo» (repetía la línea del archivo y el botón de subir) | Información repetida | S |
| C3 | ✅ «Cómo funciona» en una línea por paso; avisos con icono («6 con arreglo automático», «1 por revisar») | Más breve | S |
| C4 | ✅ Validar datos de México: RFC, CURP, correo, teléfono a 10 dígitos, código postal | Es lo que más se equivoca en reportes reales y ningún limpiador gratis lo hace | M |
| C5 | Guardar reglas propias por tipo de reporte («en inspecciones, rechazadas ≤ revisadas») | Para usarlo cada semana con el mismo reporte sin configurarlo otra vez | M |
| C6 | Leer archivos grandes sin trabar la página (trabajador en segundo plano) | Un reporte de 200 000 filas hoy congela el navegador unos segundos | M |
| C7 | Reporte de calidad en PDF (qué había, qué se corrigió) | Para entregarlo a quien pidió la limpieza | M |
| C8 | App de escritorio (PySide6) como la de Gráficas de control | Plan 09 | L |

## Planta: consolidador y OEE

| # | Qué | Por qué | Tamaño |
|---|---|---|---|
| P1 | ✅ Metas por línea configurables (hoy 85 % fijo) | Cada línea tiene su meta real | S |
| P2 | Guardar semanas anteriores y comparar (en el navegador) | La tendencia es lo que pide un gerente | M |
| P3 | ✅ Plantilla de Excel descargable con las columnas esperadas | Menos errores al subir | S |
| P4 | ✅ Pareto de defectos (no sólo de paros) | Calidad lo pide junto con el OEE | S |
| P5 | ✅ Avisos con icono en «Incoherencias entre reportes» | G4 | S |
| P6 | App de escritorio que vigile una carpeta y actualice sola | Así lo usan en planta: el MES deja el archivo, la app lo toma | L |

## Gráficas de control (SPC)

| # | Qué | Por qué | Tamaño |
|---|---|---|---|
| S1 | ✅ App de escritorio con 4 vistas, apartados y animaciones; `.exe` en Releases | Hecho | — |
| S2 | Firmar el `.exe` o dar instalador | Windows muestra «SmartScreen: aplicación no reconocida» al abrir un `.exe` sin firma; espanta a un cliente | M (certificado de pago) |
| S3 | Gráficas por atributos (p, np, c, u): piezas malas, defectos por pieza | Muchas plantas cuentan defectos, no miden | M |
| S4 | Guardar los límites por característica y vigilar con ellos (no recalcular cada vez) | Así se usa en la práctica | M |
| S5 | Reporte PDF de una página para el turno | Hoy es PNG | S |
| S6 | Varias características del mismo archivo (diámetro, largo, peso) | Un archivo real trae varias | M |

## Inventario con la cámara

| # | Qué | Por qué | Tamaño |
|---|---|---|---|
| I1 | ✅ Importar el catálogo desde Excel (código, nombre, precio, mínimo) | Nadie da de alta 300 productos uno por uno | S |
| I2 | ✅ Valor del inventario y ventas del día | Es lo primero que pregunta el dueño | S |
| I3 | Lotes y fecha de caducidad con aviso | Farmacias y abarrotes lo necesitan | M |
| I4 | Dos celulares de la misma tienda sincronizados | Hoy cada celular tiene su inventario | L (Supabase) |
| I5 | ✅ Aviso con icono en «bajo el mínimo» | G4 | S |
| I6 | App Android nativa (CameraX + ML Kit) | Ya marcada «en desarrollo» | L |

## Entrega de turno

| # | Qué | Por qué | Tamaño |
|---|---|---|---|
| T1 | Tablero compartido entre los celulares del turno | Hoy vive en un solo celular | L (Supabase en tiempo real) |
| T2 | ✅ Tiempo promedio de cierre por línea y por severidad | Mide si el problema se atiende | S |
| T3 | ✅ Exportar el mes a Excel | Para el reporte mensual de calidad | S |
| T4 | Escalar solo: si una crítica lleva 2 turnos abierta, avisar al supervisor | Evita que se quede olvidada | M |
| T5 | App Android nativa con cámara y avisos | Ya marcada «en desarrollo» | L |

## Asistente de IA local (en desarrollo)

| # | Qué | Por qué | Tamaño |
|---|---|---|---|
| A1 | Prototipo real: Docker con Ollama + Qwen3 8B + el agente + un panel | Pasar de demo a algo instalable | L (cuando haya espacio) |
| A2 | 50 preguntas de prueba con su respuesta esperada, y medir aciertos | Sin esto no se puede decir que «contesta bien» | M |
| A3 | Conectarlo a WhatsApp Business | Es donde escriben los clientes | M |
| A4 | Bitácora de lo que contestó y de lo que escaló | El dueño necesita revisar | M |

## Otros códigos

| # | Qué | Por qué | Tamaño |
|---|---|---|---|
| U1 | Punto U: tarea programada semanal que consulte Supabase para que no vuelva a pausarse | El plan gratis pausa el proyecto tras una semana sin uso; por eso estaba caído | S (hay que guardar la clave pública como secreto del repo: lo haces tú) |
| U2 | Punto U: logo cortado en pantallas bajas (`PuntoU.jsx:705-706`) | Bug conocido | S |
| U3 | Punto U: publicar el APK en Releases | Ya existe la versión Android | S |
| V1 | VibeMap: pegar la URL de un repo de GitHub en vez de subir la carpeta | Más fácil de probar | M |

---

## Plan por fases

**Fase 1 · rápidas (esta semana):** G4, G6, C4, P1, P3, P4, I1, I2, T2, T3, S5, U1, U2.
**Fase 2 · lo que se vende:** N1, N2, N5, C5, P2, S2, S3, S4, I3.
**Fase 3 · nativas y compartidas:** C8, P6, T1, I4, apps Android (N6, I6, T5), A1–A4.

## Avance

- **28-09 · tanda 1:** G4, C4 (con el ejemplo nuevo «Padrón de clientes»).
- **28-09 · tanda 2:** P1 (meta por línea en cada anillo), P3 (ya existía: «ejemplo .xlsx» en cada archivo), P4, I1, I2, T2, T3.

## Siguiente acción

Lo que queda de la fase 1: G6 (para quién es), S5 (PDF del SPC) y U1–U2 (Punto U). Después, fase 2. El portal de empleados tiene su propio plan: `11-portal-empleados.md`.
