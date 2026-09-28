# Plan 07 · Gráficas de control (`/proyectos/graficas-de-control`, repo `graficas-de-control`)

**Meta:** que un supervisor suba las mediciones de una pieza y sepa si la máquina se está desajustando antes de que salga pieza mala.

## Hecho y validado técnicamente (29-09-2026)
- X̄-R con subgrupos o I-MR con lecturas sueltas; límites con un periodo base (si el cálculo incluye el problema, lo esconde: prueba).
- Las 5 reglas de Western Electric, cada una con qué suele significar en el piso; Cp, Cpk, Pp, Ppk y piezas fuera de tolerancia.
- Ejemplo: diámetro de un buje con desgaste de herramienta desde la muestra 18; sólo marca de la 20 en adelante.
- Celular: la gráfica se desliza y abre en lo más reciente. axe 0 avisos. Repo propio con CI en verde.

## Falta
- Gráficas p y c (defectos por atributo) y exportar la gráfica como imagen.
- Probarlo con mediciones reales de tu trabajo (validación en uso).
