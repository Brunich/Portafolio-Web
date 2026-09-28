# Plan 08 · Agente de IA local (propuesta para platicar)

**Meta:** ofrecer a un negocio un asistente que atienda clientes o revise su base de datos interna **sin pagar API por cada mensaje** y sin que sus datos salgan de su equipo; instalado por ti, en su máquina o en un servidor rentado.

## Qué haría (casos concretos)
1. **Atención al cliente por WhatsApp o web:** contesta con el catálogo, horarios, precios y estado de pedido; lo que no sabe lo pasa a una persona.
2. **Consultas a la base interna en español:** «¿qué lotes de la L2 quedaron abiertos esta semana?» → consulta **de sólo lectura** a su base (Postgres, MySQL, Excel) y contesta con la tabla.
3. **Revisiones programadas:** cada noche revisa la base con reglas (como el analizador de CSV) y manda un resumen: faltantes, duplicados, pedidos atorados.

## Cómo funciona
- Modelo abierto corriendo con **Ollama** (gratis; tu PATH lo menciona pero hoy no está instalado: reinstalarlo es lo primero para el prototipo).
- Modelo sugerido: **Qwen3 8B** (bueno en español, licencia Apache 2.0, cabe en 8–12 GB de VRAM); Qwen3 14B si hay 16–24 GB.
- Las herramientas que puede usar se definen en un archivo de configuración: qué tablas lee, qué preguntas no contesta, a quién escala. **Nunca escribe en la base.**
- Un panel sencillo para el dueño: conversaciones, preguntas sin respuesta y un botón para corregirlas.

## Dónde corre y cuánto cuesta (precios consultados el 28-09-2026)
| Opción | Qué es | Costo | Para quién |
|---|---|---|---|
| A · PC del negocio | PC con RTX 3060 12 GB (sólo la tarjeta: ~$7,800–8,300 MXN en Amazon MX) | Pago único; la PC completa, *sospecho* $18–25 mil MXN (falta cotizar) | Negocio que no quiere mensualidades y tiene dónde dejarla prendida |
| B · VPS sin GPU | Contabo, 8 vCPU / 24 GB RAM (~$20 USD/mes) | Barato | Volumen bajo; con CPU un modelo de 8B responde lento (*sospecha*, falta medirlo) |
| C · Servidor con GPU | Hetzner GEX45: RTX PRO 4000 de 24 GB, €214/mes + €209 de alta | Mensual fijo | Varios usuarios, respuesta rápida, sin equipo en el local |
| D · GPU por hora | RunPod RTX 4090: $0.34/h (community) o $0.74/h (secure) | ~$248/mes si está prendida 24/7 | Pruebas y demos; no para producción continua |

**Qué te cobrarías tú** (a platicar): instalación y configuración (pago único) + mantenimiento mensual (actualizar respuestas, revisar lo que no supo contestar). El cliente paga el equipo o el servidor aparte.

## En el portafolio (cuando lo decidamos)
- Página «Asistente local» con una conversación de ejemplo, el diagrama de cómo se conecta y una **calculadora**: eliges usuarios y mensajes al día → te recomienda la opción A–D con su costo.
- Un repo con el instalador (Docker Compose: Ollama + el agente + el panel) para que instalarlo sea un comando.

## Riesgos que hay que decir de frente
- Un modelo de 8B se equivoca más que uno grande: por eso sólo lee, cita de dónde sacó el dato y escala lo que no sabe.
- La privacidad es el argumento de venta: los datos no salen; hay que respetarlo también en los registros.
- La velocidad en CPU sin GPU hay que medirla antes de venderla.

## Preguntas para decidir juntos
1. ¿Empezamos por atención al cliente (WhatsApp) o por consultas a la base interna?
2. ¿Tu amigo puede contarte qué hace el suyo y qué le pagan? Sirve para poner precio.
3. ¿Reinstalo Ollama y hago un prototipo con un catálogo de ejemplo, para medir la velocidad real en tu laptop?

## Fuentes
- Hetzner GEX45: https://dohohub.com/news/hetzner-gex45-entry-level-gpu-server
- RunPod RTX 4090: https://www.synpixcloud.com/blog/rtx-4090-cloud-rental-worth-it y https://www.usagepricing.com/blueprint/activity/runpod-2026-09-20-secure-cloud-price-hike
- Contabo: https://cybernews.com/best-web-hosting/contabo-review/pricing/
- RTX 3060 en México: https://www.amazon.com.mx/rtx-3060-12gb/s?k=rtx+3060+12gb
- Modelos locales: https://www.layer3labs.io/guides/best-local-llms y https://www.sitepoint.com/best-local-llm-models-2026/
