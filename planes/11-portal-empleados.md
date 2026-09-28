# 11 · Portal de empleados (proyecto nuevo, en desarrollo)

**Meta:** una web que una empresa pueda usar de verdad para que cada empleado entre con su cuenta, tenga su foto y sus datos, haga peticiones (vacaciones, permisos, equipo) y suba documentos, con la seguridad básica que exige cualquier empresa y los avisos legales de México.

Escrito el 28-09-2026. Va al final de las tandas, como pidió Bruno; mientras, aparece en el portafolio en «En desarrollo».

---

## Qué hace

| Parte | Para el empleado | Para RR. HH. / supervisor |
|---|---|---|
| **Cuenta** | Entra con correo y contraseña; puede activar un segundo paso (código de app) | Da de alta, suspende y reactiva cuentas; nadie se registra solo |
| **Perfil** | Foto circular pequeña, nombre, puesto, área, teléfono de emergencia | Ve el directorio de su área |
| **Peticiones** | Pide vacaciones, permiso, equipo o constancia; ve en qué va cada una | Aprueba o rechaza con comentario; todo queda registrado |
| **Documentos** | Sube lo que le piden (INE, comprobante, incapacidad) | Descarga con enlace temporal; nada queda público |
| **Avisos** | Recibe avisos de la empresa y de sus peticiones | Publica avisos por área |
| **Bitácora** | Ve sus últimos inicios de sesión | Ve quién hizo qué y cuándo (auditoría) |

## Seguridad (lo mínimo que se revisa en una empresa)

**Inicio de sesión**
- Contraseña de 12 caracteres o más y revisión contra contraseñas filtradas (servicio público con *k-anonimato*: nunca se manda la contraseña).
- Intentos fallidos: tras 5 seguidos, la cuenta espera 15 minutos y el tiempo crece si sigue; también se limita por IP. El mensaje siempre es el mismo («correo o contraseña incorrectos») para no revelar qué cuentas existen.
- Verificación anti-bots (Cloudflare Turnstile) sólo después del tercer intento fallido, para no molestar al que entra bien.
- Aviso por correo cuando alguien entra desde un equipo nuevo.
- Segundo paso opcional (TOTP con Google Authenticator o similar); obligatorio para RR. HH. y administradores.
- Recuperar contraseña: enlace de un solo uso que caduca en 15 minutos; al usarlo se cierran las demás sesiones.

**Sesiones**
- Cookies `HttpOnly`, `Secure` y `SameSite`; nada del token en `localStorage`.
- Cierre por inactividad (30 min) y duración máxima (12 h); el token de renovación cambia en cada uso.
- «Cerrar sesión en todos lados» desde el perfil.

**Datos y permisos**
- Cuatro papeles: empleado, supervisor, RR. HH., administrador. Cada consulta a la base pasa por reglas en la propia base (*Row Level Security*): un empleado sólo puede leer lo suyo aunque alguien manipule la página.
- Toda entrada se valida en el servidor (esquemas con `zod`), no sólo en el formulario.
- Bitácora de auditoría que no se puede editar: quién, qué, cuándo, desde qué IP.

**Foto y archivos**
- Foto: JPG, PNG o WebP de hasta 2 MB; se recorta en círculo y se reduce a 256 × 256 en el navegador, se le quitan los datos EXIF (ubicación del teléfono) y se guarda en un almacén privado.
- Documentos: se revisa el tipo real del archivo (no sólo la extensión), límite de tamaño, y se descargan con enlaces que caducan en minutos.

**La página**
- HTTPS con HSTS, política de contenido (CSP) estricta, cabeceras de seguridad, sin scripts de terceros innecesarios.
- Dependencias revisadas solas (Dependabot) y pruebas de seguridad en CI.

## Legal (México)

- **Aviso de privacidad** según la Ley Federal de Protección de Datos Personales en Posesión de los Particulares: qué datos se piden, para qué, a quién se transfieren y cómo ejercer los derechos ARCO (acceso, rectificación, cancelación, oposición).
- **Términos de uso** internos: uso aceptable, confidencialidad, qué pasa con la cuenta al salir de la empresa.
- Consentimiento al primer ingreso, guardado con fecha y versión del aviso.
- Plazo de conservación de documentos y borrado al terminar la relación laboral.
- Datos sensibles (salud en incapacidades) separados y con acceso sólo de RR. HH.

*Nota: el texto legal final lo debe revisar un abogado de la empresa que lo use; el portal deja la estructura y los registros de consentimiento.*

## Cómo se construye

| Pieza | Elección | Por qué |
|---|---|---|
| Interfaz | React + TypeScript + Vite (como el portafolio) | Ya dominado; se reutiliza el tema |
| Autenticación, base y archivos | Supabase (Auth + Postgres + Storage) | Ya se usa en Punto U; trae límites de intentos, TOTP, RLS y almacenamiento privado |
| Lógica sensible | Funciones en el servidor (Edge Functions) | Bloqueo de cuenta, auditoría y aprobaciones no pueden vivir en el navegador |
| Correo | Resend o el SMTP de la empresa | Avisos de nuevo equipo y de peticiones |
| Pruebas | Playwright + pruebas de reglas RLS | Se prueba que un empleado NO pueda ver lo de otro |

## Fases

| Fase | Qué | Tamaño |
|---|---|---|
| F0 | Pantallas en papel: entrar, perfil, peticiones, bandeja de RR. HH. | S |
| F1 | Cuenta: entrar, salir, recuperar contraseña, bloqueo por intentos, papeles | L |
| F2 | Perfil con foto circular (recorte, reducción, sin EXIF) | M |
| F3 | Peticiones con flujo de aprobación y avisos | L |
| F4 | Documentos privados con enlaces temporales | M |
| F5 | Bitácora de auditoría y panel de administrador | M |
| F6 | Aviso de privacidad, términos, consentimiento, segundo paso | M |
| F7 | Demo en el portafolio: empresa ficticia con cuentas de prueba que se reinicia cada noche | S |

## Evidencia para darlo por hecho

- Prueba automática: 6 intentos fallidos bloquean la cuenta y el mensaje no cambia entre «no existe» y «contraseña mal».
- Prueba automática: con la sesión de un empleado, pedir los datos de otro regresa vacío (RLS).
- La foto guardada mide 256 × 256 y no trae EXIF.
- Revisión con la lista OWASP ASVS nivel 1.

## Siguiente acción

F0 cuando terminen las tandas de mejoras: dibujar las cuatro pantallas con el mismo tema del portafolio.
