# Estado del portafolio

## Cambios
Proyecto en Programming Brunich/Proyectos/Proyectos APPs y web/bruno-portfolio. Galería con capturas propias del bosque nuevo, vistas tres cuartos y primera persona; se excluyó el segundo monitor. Comparador con cámara fija y presets originales Definitive, Intermedio y 3D sin pixelado de Godot. Retiradas imágenes de la escena aislada rechazada. No se modificaron escenas ni shaders del juego. CV descargable inglés original, mapas de automatización y perfil al final se conservan.

## Pruebas
2026-09-26: build TypeScript/Vite y cinco pruebas Playwright aprobados; navegación bilingüe, CV, mapas, galería, comparador con ratón/teclado, responsive y axe. Capturas de escritorio y móvil inspeccionadas. Producción HTTP 200, imágenes 1600×900 cargadas, deslizador responde, sin errores JavaScript.

## Publicación
https://bruno-portfolio-azure.vercel.app/#graphics
Deployment dpl_AKLhpGPSENrkMeYVMxSeWw1Hznh9 READY. Servidor local 127.0.0.1:5173. Acceso directo del escritorio apunta a la ubicación actual.

## Pendientes y siguiente acción
Comparador basado en imágenes reales, no ejecución de shaders en navegador. Capturador temporal en IA Rogue/tmp/portfolio_real_capture.gd; produjo las tres imágenes pero el lanzador reporta cinco errores preexistentes de propiedades Terrain3D. No se declara limpia la ejecución del motor ni se repararon asuntos ajenos.
Planes existentes: carpeta hermana Mapa de impacto y Programming Brunich/Proyectos/PROYECTOS CODIGO/Proyecto_Trazabilidad_Calidad. Validar un caso concreto con Bruno antes de implementar los productos. Sin métricas ni integraciones productivas inventadas. Siguiente acción: revisar con Bruno el encuadre publicado antes de ampliar escenas.

## Reencuadre 2026-09-26 (noche)
Hecho en local, commit 7ef045a, SIN publicar en Vercel: bosque sin HUD, retrato recortado a la cara, Punto U en vista móvil con marco de teléfono, acentos rotos del mapa de impacto (7 bytes latin-1 en App.tsx). Build y 5/5 Playwright en verde. Antes/ahora en qa/antes-ahora.png.
Siguiente acción: que Bruno apruebe el encuadre y publicar (vercel --prod); luego elegir mejoras interactivas de la lista entregada en el chat.

## Interactivos 2026-09-26 (noche, 2ª tanda)
Sin fondos blancos (Punto U y VibeMap en oscuro). Nuevo: río de código bajo la portada (CodeRiver), sección Datos con analizador CSV + mapa mental (árbol en móvil), explorador de impacto animado en Flujos, Punto U en vivo (iframe), comparador por parejas con lupa ×3 y carrusel de 5 panorámicas. Build y 6/6 Playwright+axe en verde. SIN publicar.
Hallazgos: el Supabase de Punto U no existe (NXDOMAIN) → la app no guarda perfiles. El logo cortado es Punto U/src/PuntoU.jsx:705-706 (justifyContent center en contenedor con scroll; arreglo: "safe center").
Siguiente acción: Bruno lo ve y aprueba publicar; decidir si se capturan más escenas del juego para el comparador (requiere lanzar Godot con --windowed).

## 3ª tanda 2026-09-27
Fuera «Definitive» del sitio. Comparador 3D en WebGL sobre Null (classic_null_v2.glb): pixel art / cel / 3D, división, giro, zoom y tamaño de píxel; ~240 fps en la RTX 4070 tras arreglar un bucle de render que se duplicaba (daba 0,5 fps). OJO: la malla base de Null viene de un modelo de referencia (README del donante): el sitio no dice que Bruno la modeló. VibeMap: esquema con su formato real (flechas numeradas por función, sin metáforas). Punto U: texto de favores; en vivo funciona en modo local (PuntoU.jsx:159/171). Analizador CSV rehecho (quality.ts, samples.ts). 6/6 pruebas. SIN publicar.
Siguiente acción: Bruno revisa en local; con su «publica», `vercel --prod`.

## 4ª tanda 2026-09-27
Proyectos = Punto U, Analizador de CSV, VibeMap, IA Rogue (Mapa de impacto y Continuidad quedan como propuestas en Flujos). Métricas sólo verificables: IA Rogue 18→55 fps, 13,3→7,1 ms, 831 baterías (NO se usa el conteo de líneas). 12 pruebas unitarias (npm run test:unit) + 6 Playwright, verdes. CI en .github/workflows/ci.yml: sin validar hasta que exista remoto en GitHub.
Punto U (otro proyecto, sin git propio): PuntoU.jsx:706 justifyContent "safe center"; logo de -30 px a 24 px a 390x844. Compilado en local, NO desplegado.
Siguiente acción: Bruno aprueba publicar el portafolio y el arreglo de Punto U; crear repo en GitHub para el CI.
