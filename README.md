# Bruno Salas · Portafolio

[![CI](https://github.com/Brunich/bruno-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Brunich/bruno-portfolio/actions/workflows/ci.yml)

**En vivo: https://bruno-portfolio-azure.vercel.app**

Estudiante de Ingeniería en Software en la UANL (2023–2028). Este repositorio es mi portafolio y también el código de los proyectos que se prueban en él: todos corren en el navegador, sin servidor.

![Portada del portafolio](public/og.png)

## Proyectos

| Proyecto | Qué hace | Pruébalo | Código |
|---|---|---|---|
| **NFC para negocios** | Atención a clientes con un tap: sellos en el Wallet y mensajes de WhatsApp en el momento justo (reseña, regreso, cumpleaños). | [/proyectos/club-nfc](https://bruno-portfolio-azure.vercel.app/proyectos/club-nfc) | [`LoyaltyDemo.tsx`](src/LoyaltyDemo.tsx) |
| **Analizador de CSV** | Encuentra duplicados, valores mal escritos, fechas mezcladas y reglas rotas; corrige lo mecánico con un clic y dibuja cómo está organizado el archivo. | [/proyectos/analizador-csv](https://bruno-portfolio-azure.vercel.app/proyectos/analizador-csv) | [`quality.ts`](src/quality.ts) · [`csv.ts`](src/csv.ts) · [`DataWorkbench.tsx`](src/DataWorkbench.tsx) |
| **Entrega de turno** | Incidencias de calidad con responsable, evidencia y cierre; al final del turno sale el resumen de lo pendiente. | [/proyectos/entrega-de-turno](https://bruno-portfolio-azure.vercel.app/proyectos/entrega-de-turno) | [`ShiftHandover.tsx`](src/ShiftHandover.tsx) |
| **VibeMap** | Hackathon, equipo de 3: diagrama numerado de cómo fluye el código de un proyecto. | [/proyectos/vibemap](https://bruno-portfolio-azure.vercel.app/proyectos/vibemap) | [Repositorio del equipo](https://github.com/CharlsMex24/VibeMap_Hackathon) |
| **Punto U** | Estudiantes de la UANL publican favores en un mapa del campus. Web y Android. | [punto-u-app.vercel.app](https://punto-u-app.vercel.app) | [Punto-U-app](https://github.com/Brunich/Punto-U-app) |
| **IA Rogue** | Game dev: roguelike 3D en Godot. Aquí, el comparador de estilos sobre el protagonista y la galería por cámaras. | [Game dev](https://bruno-portfolio-azure.vercel.app/#graphics) | [`ModelLab.tsx`](src/ModelLab.tsx) (three.js) |

### Cómo funciona cada uno, en corto

- **NFC para negocios.** El chip abre una URL; la primera vez pide nombre, WhatsApp y cumpleaños. La tarjeta de sellos vive en el Wallet. Una regla evita trampas (un sello al día) y una línea de tiempo dispara cada mensaje. La demo simula el Wallet y WhatsApp; en producción serían PassKit/Google Wallet y la API de WhatsApp Cloud.
- **Analizador de CSV.** Parser propio (comillas, `,` o `;`), tipo detectado por columna y cada regla de calidad como función pura con su corrección. Lo que requiere criterio (vacíos, reglas de negocio) se marca, nunca se inventa. La copia limpia se protege contra fórmulas al abrirla en Excel.
- **Entrega de turno.** Cada incidencia pasa por abierta → en curso → cerrada, y el cierre exige responsable y evidencia. «Entregar turno» genera la lista de pendientes para el siguiente equipo.

## Técnica

- React 19, TypeScript y Vite. Cada página de proyecto carga su demo sólo cuando se abre (`React.lazy`).
- three.js para el comparador 3D: toon shading con rampas, contorno por casco invertido y pixelado con un render target de baja resolución.
- Movimiento con `IntersectionObserver` y CSS; todo se pausa con un botón y respeta `prefers-reduced-motion`.
- El reel de motion design ([`motion/reel.html`](motion/reel.html)) es un canvas determinista: `node motion/render.mjs` lo exporta a 60 fps con desenfoque de movimiento.

## Correr y probar

```bash
npm install
npm run dev          # http://127.0.0.1:5173
npm run test:unit    # reglas del analizador (node:test)
npm test             # recorridos y accesibilidad con Playwright + axe
```

Las pruebas de Playwright recorren cada demo (el club, el analizador y la entrega de turno), revisan que no haya desbordes en móvil y pasan axe en cada página.

## Qué sigue

1. **NFC para negocios, con backend real:** Supabase para visitas y clientes, pases firmados de Wallet y la API de WhatsApp en modo prueba.
2. **Entrega de turno, con persistencia:** guardar incidencias, permisos por rol y exportar la entrega a PDF.
3. **Analizador de CSV como paquete propio:** soporte para XLSX y una CLI.
4. **Punto U:** volver a conectar su base de datos y publicar el APK.
5. **VibeMap:** una demo en vivo que no dependa de una clave propia.

Los datos de ejemplo son sintéticos y de empresas ficticias. La procedencia de cada imagen está en [`public/media/SOURCES.md`](public/media/SOURCES.md).
