# Plan 01 · NFC para negocios (`/proyectos/club-nfc`, `/nfc`, `/sello`, `/menu`, repo `nfc-negocios`)

**Meta:** que puedas comprar un chip, grabarlo en 2 minutos y dejarlo en un negocio real sin explicar nada.

## Lo que ya funciona (comprobado)
- La tarjeta de sellos suma uno al día, se canjea con PIN, y el enlace lleva los datos del negocio.
- Tamaños medidos de los enlaces: sellos con WhatsApp y PIN, 117 bytes (NTAG213); con enlace de reseña, 171 bytes (NTAG215); menú completo, ~920 bytes (sólo QR); menú sin descripciones, ~555 bytes (NTAG216). Hay prueba unitaria.

## Errores
| # | Qué pasa | Estado |
|---|---|---|
| N1 | En celular el encabezado del caso se rompe (ver G1 del plan general) | ✅ |
| N2 | El botón flotante tapa la tarjeta en `/nfc` («Arriba») y el paso 03 en celular | ✅ |
| N3 | La demo «Así se ve en el restaurante» usa la paleta vieja gris azulada, y su panel queda vacío («0 0 0 0») hasta que tocas algo: se ve muerta | ✅ |
| N4 | El nombre de ejemplo por defecto en `/nfc` es «El Cerro», y la demo del restaurante también: El Cerro sale dos veces seguidas al bajar | ✅ |
| N5 | El botón «Grabar en el chip» sólo existe en Chrome de Android, y en escritorio no se explica por qué no está | 🔎 revisar el texto |
| N6 | El enlace que genera usa el dominio en el que estás: si alguien arma su tarjeta en una copia local, graba `127.0.0.1` | ✅ (sólo local, pero conviene avisar) |
| N7 | Nada detiene grabar un enlace que no cabe en el chip elegido: el aviso de tamaño sólo existe en el menú, no en la tarjeta de sellos | ✅ |

## Mejoras de diseño
- Palomitas de los sellos: hoy son un «✓» de texto chico; que sean un sello (ícono dibujado) con la inicial del negocio.
- Muestras de color más apagadas, alineadas con la marca (sin rosa ni amarillo vivos).
- La demo del restaurante con estado inicial vivo: una visita ya hecha y una animación del celular acercándose.
- En `/sello`, un estado vacío más cálido la primera vez («Bienvenido a Café Aurora») y una animación del sello del día.

## Tandas
1. **T1 · Arreglos (N1, N2, N4, N7).** Tarjeta de sellos con aviso de chip («cabe en NTAG213/215»), igual que el menú; nombre de ejemplo distinto.
   *Listo cuando:* la prueba unitaria cubre el aviso de sellos, y a 390 px no hay nada tapado.
2. **T2 · Demo viva (N3).** Paleta morada, estado inicial con una visita y panel con datos.
   *Listo cuando:* la captura sin tocar nada ya cuenta la historia.
3. **T3 · Guía de compra y grabado dentro de `/nfc`.** Qué chip comprar (NTAG215 de 25 mm; anti-metal sobre metal; evitar MIFARE Classic), grabarlo en Android desde la página y en iPhone con NFC Tools, y una prueba de «¿quedó bien grabado?» (leer el chip y comparar).
4. **T4 · Prueba en el mundo real.** Tú compras 10 stickers y grabamos uno juntos. Esa es la validación en uso: hasta entonces queda en «validado técnicamente».
