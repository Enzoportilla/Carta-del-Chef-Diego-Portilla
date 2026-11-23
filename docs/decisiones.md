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
