# Portafolio de Bruno Salas

Sitio personal: https://bruno-portfolio-azure.vercel.app

Estudiante de Ingeniería en Software (UANL). El sitio muestra proyectos que se pueden probar ahí mismo:

- **Analizador de CSV** (`src/quality.ts`, `src/csv.ts`): encuentra duplicados, valores escritos de varias formas, fechas mezcladas y reglas de negocio rotas; corrige lo mecánico y marca lo que requiere criterio. Todo corre en el navegador.
- **Comparador 3D** (`src/ModelLab.tsx`): el protagonista de IA Rogue en pixel art, cel shading y 3D con three.js.
- **Mapa de impacto** (`src/ImpactExplorer.tsx`): qué archivos se ven afectados por un cambio, siguiendo las importaciones.

## Correr

```bash
npm install
npm run dev
```

## Pruebas

```bash
npm run test:unit   # reglas del analizador (node:test)
npm test            # recorrido completo y accesibilidad (Playwright + axe)
```

Los datos de ejemplo son sintéticos y de empresas ficticias.
