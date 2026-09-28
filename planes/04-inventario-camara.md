# Plan 04 · Inventario con la cámara (`/proyectos/inventario`, repo `inventario-camara`)

**Meta:** que una tiendita lleve su inventario con el celular, sin comprar lector ni instalar nada.

## Lo que ya funciona (comprobado)
- Lee EAN-13 desde foto (prueba con etiqueta generada), entradas y salidas, lista de resurtido, etiquetas imprimibles, vibración en vez de sonido.

## Errores
| # | Qué pasa | Estado |
|---|---|---|
| I1 | Encabezado roto en celular (G1) | ✅ |
| I2 | Dice «Prueba con las etiquetas **de abajo**», pero abajo no hay etiquetas: aparecen sólo al tocar «Etiquetas con código» | ✅ |
| I3 | Columna izquierda corta junto a una lista larga: hueco grande abajo a la izquierda en escritorio | ✅ |
| I4 | Sólo lee EAN-13: los códigos de 8 dígitos (EAN-8, comunes en dulces) y UPC-A de productos importados, sin probar | 🔎 falta probarlo |
| I5 | La cámara no se probó en un celular real (sólo foto y código escrito) | 🔎 falta probarlo en uso |
| I6 | No hay forma de buscar un producto por nombre ni de borrar uno | ✅ |

## Mejoras de diseño
- Visor de cámara con guía animada y un destello suave al leer (sin sonido).
- La lista con agrupación «bajo el mínimo» arriba y un mini gráfico de movimientos del día.
- Etiquetas imprimibles en hoja carta con recorte, vista previa antes de imprimir.

## Tandas
1. **T1 · Arreglos (I1, I2, I3).**
2. **T2 · Más códigos (I4).** EAN-8, UPC-A, Code128; pruebas con imágenes generadas.
3. **T3 · Uso diario (I6).** Buscar, editar, borrar; historial por producto.
4. **T4 · Prueba en tu celular (I5).** Escanear 5 productos reales de tu casa; eso lo valida en uso.

## Estado al 28-09-2026
**Hecho y validado técnicamente**
- T1: el texto ya no manda a «etiquetas de abajo»: abre las etiquetas y baja a ellas; columna de la cámara fija al bajar.
- T2: EAN-8 (etiqueta generada y leída desde foto en la prueba), UPC-A = mismo producto que su EAN-13, códigos internos con letras (Code 128).
- T3: buscar por nombre o código, historial por producto, nombre editable, borrar con deshacer.
- La impresión de etiquetas ya no deja páginas en blanco.

**Falta**
- T4: escanear 5 productos reales con tu celular (validación en uso de la cámara).
