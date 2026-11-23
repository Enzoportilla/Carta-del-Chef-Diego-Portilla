# Registro de decisiones

| Fecha | Decisión | Motivo |
|-------|----------|--------|
| 2026-11-22 | Se crea la estructura base del proyecto | Inicio del proyecto |
| 2026-11-22 | Desarrollo dentro de un dev container (Node 22 + Claude Code) | Entorno aislado y reproducible, sin instalar herramientas en Windows |
| 2026-11-23 | Stack: Vite + React, sin servidor; datos, login y fotos en Supabase; GitHub Pages | Misma base que la carta de referencia; gratis y sin servidor que mantener |
| 2026-11-23 | Un ítem del carrito es un pack (p. ej. 5 unidades); el stock se cuenta en packs | Así está definida la lista de precios |
| 2026-11-23 | Lo agotado se muestra como "Agotado"; lo que no tiene precio queda oculto | CLAUDE.md y pedido del usuario |
| 2026-11-23 | Panel: stock, precio, visible y fotos. WhatsApp, transferencia, retiro y categorías quedan en `src/data.js` | Alcance elegido por el usuario; crear productos, categorías y configuración quedan para después |
| 2026-11-23 | El panel exige `app_metadata.rol = admin` en RLS | Aunque el registro público quede abierto, nadie más puede editar |
| 2026-11-23 | El stock no baja solo con cada pedido; se vuelve a consultar justo antes de enviar | El público no puede escribir en la base |
| 2026-11-23 | Títulos en Cinzel y texto en Lato | Cinzel sigue las versalitas del logo |
| 2026-11-23 | "Confirmar pedido" revisa el stock y luego muestra un enlace "Enviar por WhatsApp" junto a los datos de transferencia | Abrir la ventana por código falla dentro de Instagram y Facebook; un enlace real funciona siempre |
| 2026-11-23 | La web no menciona costos de envío: "El pago y la entrega se coordinan con el Chef en la conversación" | Pedido del usuario |
| 2026-11-23 | Apellido obligatorio para confirmar el pedido | Pedido del usuario |
| 2026-11-23 | Diseño claro: portada negra con el logo y carta sobre blanco nieve; el "+" reemplaza al botón "Agregar" | Pedido del usuario: que se vea más ligero |
| 2026-11-23 | El panel permite agregar productos (no borrarlos: se ocultan con "Visible"). El id sale del nombre, así no se repiten | Pedido del usuario |
| 2026-11-23 | Nombre y formato se editan en la lista del panel; el id no cambia al renombrar y no se permiten nombres repetidos | Pedido del usuario; el id fijo conserva los carritos guardados y las fotos |
| 2026-11-23 | Eventos es una categoría más: los menús se piden por persona y los paquetes por 100 unidades; la cantidad se puede escribir | Usa el mismo carrito, mensaje y panel; el chef puede cambiar precios y agregar menús |
| 2026-11-23 | Stock 999 en eventos equivale a sin límite | Se hacen por encargo; en 0 se muestra "Agotado" |
| 2026-11-23 | Datos de transferencia sin publicar, productos sin precio ocultos, eventos sin mínimo, comunas de delivery sin definir | Respuestas del usuario |
| 2026-11-23 | La web informa la anticipación (2 días; eventos, 1 semana) desde `src/data.js`; no la valida | Pulido con Impeccable (borrador): el cliente no tenía cómo saberlo |
| 2026-11-23 | En Eventos, los menús por persona se separan de los paquetes según el formato "Por persona" | El precio por persona se leía como total |
| 2026-11-23 | "Vaciar pedido" pide un segundo toque; "Copiar mensaje" pasa a enlace secundario | Se perdía el pedido con un toque y competía con "Confirmar" |
| 2026-11-23 | El pedido pide fecha y exige la anticipación (2 días; 1 semana si incluye un evento), contada en hora de Chile | Pedido del usuario; el Chef tenía que preguntar la fecha |
