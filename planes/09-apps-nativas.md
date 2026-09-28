# 09 · Apps nativas (que los repos no sean sólo web)

**Meta:** que cada proyecto sea algo que un negocio podría instalar y usar, y que el GitHub enseñe cómo está hecha la app de verdad, no una copia de la web.

## Estado (28-09-2026)

| Proyecto | Nativa | Estado |
| --- | --- | --- |
| Gráficas de control | Python + PySide6 (Windows) | **Hecha.** Repo `graficas-de-control`, v1.0.0 con `.exe` en Releases. La web pasó a `web/`. |
| Planta OEE | Python + PySide6 | Siguiente. Reusar `spc/tema.py` y el patrón `Lienzo` de `spc/graficas.py`. |
| Analizador CSV | Python + PySide6 | Después de Planta. SQLite ya viene en Python. |
| NFC para negocios | Android (Kotlin + Compose, NFC) | **En desarrollo**, marcado así en el portafolio y el README. |
| Inventario con cámara | Android (Kotlin + CameraX + ML Kit) | **En desarrollo**, marcado igual. |
| Entrega de turno | Android (Kotlin + Compose, cámara, notificaciones) | **En desarrollo**, marcado igual. |

## Evidencia válida

- La lógica de Python da lo mismo que la web: el ejemplo del buje genera las mismas 125 mediciones byte a byte (prueba con huella SHA-256 en `tests/test_logica.py`).
- 15 pruebas con pytest, incluida la ventana sin pantalla (`QT_QPA_PLATFORM=offscreen`); CI verde en Ubuntu.
- El `.exe` (PyInstaller, ~50 MB) arrancó y siguió vivo 12 s en esta máquina.

## Qué aprendí en la primera

- Sin pantalla, Qt no encuentra fuentes en Windows: `QT_QPA_FONTDIR=C:\Windows\Fonts`.
- `deleteLater` no borra al momento: esconder el widget antes, o se encima con lo nuevo.
- Con texto que se parte en renglones, la altura sale de `layout.totalHeightForWidth(ancho)`.
- pytest en CI necesita `pythonpath = ["."]`; en local funcionaba sólo por `python -m pytest`.
- Pruebas y capturas usan `SPC_AJUSTES` (un .ini aparte) para no tocar los ajustes del usuario.

## Pendiente

- Android: necesita Android Studio + SDK (~10-15 GB). Hoy hay ~49 GB libres; decidir cuándo instalar.
- Orden propuesto para Android: Inventario (el más vistoso: cámara), luego NFC, luego Turno.
- Planta en PySide6: mismo esqueleto (lateral de datos, veredicto, vistas con segmentos, apartados a la derecha).

## Siguiente acción

Empezar Planta OEE en PySide6 copiando el esqueleto de `graficas-de-control`.
