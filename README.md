# Bruno Salas · Portafolio

[![CI](https://github.com/Brunich/bruno-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Brunich/bruno-portfolio/actions/workflows/ci.yml)

**En vivo: https://bruno-portfolio-azure.vercel.app**

Estudiante de Ingeniería en Software en la UANL (2023–2028). Este repositorio es mi portafolio y también el código de los proyectos que se prueban en él: todos corren en el navegador, sin servidor.

![Portada del portafolio](public/og.png)

## Proyectos

| Proyecto | Qué hace | Pruébalo | Código |
|---|---|---|---|
| **NFC para negocios** | Tarjeta de sellos real: un chip NFC (o su QR) abre la tarjeta del negocio, suma un sello al día y al llenarla se canjea el premio. Para que el cliente vuelva sin quitarle tiempo. | [/proyectos/club-nfc](https://bruno-portfolio-azure.vercel.app/proyectos/club-nfc) · [/nfc](https://bruno-portfolio-azure.vercel.app/nfc) | [`Stamp.tsx`](src/Stamp.tsx), [`LoyaltyDemo.tsx`](src/LoyaltyDemo.tsx) |
| **Analizador de CSV** | Encuentra duplicados, valores mal escritos, fechas mezcladas y reglas rotas; corrige lo mecánico con un clic y dibuja cómo está organizado el archivo. | [/proyectos/analizador-csv](https://bruno-portfolio-azure.vercel.app/proyectos/analizador-csv) | [`quality.ts`](src/quality.ts) · [`csv.ts`](src/csv.ts) · [`DataWorkbench.tsx`](src/DataWorkbench.tsx) |
| **Entrega de turno** | Tablero de incidencias de calidad (abierta → en curso → cerrada) con responsable y foto de evidencia; al final sale el resumen para copiar o mandar por WhatsApp. | [/proyectos/entrega-de-turno](https://bruno-portfolio-azure.vercel.app/proyectos/entrega-de-turno) | [`ShiftHandover.tsx`](src/ShiftHandover.tsx) |
| **VibeMap** | Hackathon, equipo de 3: sueltas la carpeta de un proyecto y lo ves como mapa mental (entrada, quién usa a quién, alertas). TS, JS, Python y GDScript. | [vibemap-brunich.vercel.app](https://vibemap-brunich.vercel.app) | [Brunich/VibeMap](https://github.com/Brunich/VibeMap) |
| **Punto U** | Estudiantes de la UANL publican favores en un mapa del campus. Web y Android. | [punto-u-app.vercel.app](https://punto-u-app.vercel.app) | [Punto-U-app](https://github.com/Brunich/Punto-U-app) |
| **IA Rogue** | Game dev: roguelike 3D en Godot. Aquí, el comparador de estilos sobre el protagonista y la galería por cámaras. | [Game dev](https://bruno-portfolio-azure.vercel.app/#graphics) | [`ModelLab.tsx`](src/ModelLab.tsx) (three.js) |

### Cómo funciona cada uno, en corto

- **NFC para negocios.** En [/nfc](https://bruno-portfolio-azure.vercel.app/nfc) se arma la tarjeta (nombre, sellos, premio, color) y se graba el enlace en un chip NTAG215 (desde Chrome en Android con Web NFC, o con la app NFC Tools). Al acercar el celular se abre `/sello`: suma un sello al día, guardado en el celular del cliente, y al llenarla se canjea el premio. La página del proyecto trae además una simulación del día a día con WhatsApp.
- **Analizador de CSV.** Parser propio (comillas, `,` o `;`), tipo detectado por columna y cada regla de calidad como función pura con su corrección. Lo que requiere criterio (vacíos, reglas de negocio) se marca, nunca se inventa. La copia limpia se protege contra fórmulas al abrirla en Excel.
- **Entrega de turno.** Tablero de tres columnas; el cierre exige responsable y una foto de evidencia (se toma con la cámara del celular). Se guarda en el navegador. «Entregar turno» ordena lo pendiente por severidad y lo deja listo para copiar o mandar por WhatsApp.

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

1. **NFC para negocios, con panel del negocio:** guardar visitas en Supabase para que el negocio vea a sus clientes.
2. **Entrega de turno, compartida:** que todo el turno vea el mismo tablero y exportar la entrega a PDF.
3. **Analizador de CSV como paquete propio:** soporte para XLSX y una CLI.
4. **Punto U:** volver a conectar su base de datos y publicar el APK.

Los datos de ejemplo son sintéticos y de empresas ficticias. La procedencia de cada imagen está en [`public/media/SOURCES.md`](public/media/SOURCES.md).
