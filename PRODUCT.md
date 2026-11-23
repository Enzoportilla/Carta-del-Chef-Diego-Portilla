# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Clientes frecuentes:** ya conocen los productos y quieren repetir un pedido rápido, casi siempre desde el celular.
- **Clientes nuevos que llegan por redes:** necesitan entender qué se vende, en qué cantidades y cómo se pide.
- **Organizadores de eventos:** buscan menús por persona o paquetes de 100 unidades.
- **Chef Diego Portilla:** recibe los pedidos por WhatsApp y usa el panel desde su celular.
- **Enzo:** también usa el panel, desde el computador.

## Product Purpose

Carta en línea para los productos del Chef Diego Portilla: el cliente recorre las categorías, arma un pedido y lo envía por WhatsApp. Hay éxito cuando el mensaje llega completo (productos, cantidades, total, retiro o delivery, nombre, apellido y teléfono) y el chef puede coordinar sin volver a preguntar lo básico.

## Positioning

Un chef que prepara por encargo, tanto para el día a día como para eventos, con repostería y masas chilenas, y trato directo por WhatsApp sin intermediarios. (Confirmado por el usuario el 2026-11-23.)

## Operating Context

- El pedido se confirma en dos pasos: "Confirmar pedido" revisa datos, stock y precios; después "Enviar por WhatsApp" abre el chat con el mensaje escrito. No se guarda ni descuenta stock: llega al chef solo cuando el cliente lo envía.
- El pago (transferencia bancaria) y la entrega se coordinan con el chef en la conversación. La web no muestra costos de envío.
- Los pedidos requieren **2 días de anticipación; los eventos, 1 semana**. Hoy la web no lo informa ni lo valida.
- El chef ajusta stock a mano en el panel; no baja solo con cada pedido.
- Carta publicada en GitHub Pages; productos, sesión y fotos en Supabase. Ver `docs/publicacion.md`.

## Capabilities and Constraints

- Carta por categorías: Panes, Sopaipillas, Dulces, Salados y masas, Eventos. Una categoría sin productos visibles no aparece.
- Un ítem del carrito es un **formato** (por ejemplo, 5 unidades de 70 g). En eventos es una persona o un paquete de 100 unidades. La cantidad se puede escribir.
- Sin stock se muestra "Agotado" y no se puede agregar. Sin precio, el producto queda oculto.
- Panel `#/admin`: stock, precio, visible, foto, nombre, formato y agregar productos. Solo cuentas con rol de administrador.
- WhatsApp, datos de transferencia, retiro y categorías están fijos en `src/data.js` (público).
- Español de Chile; precios en CLP sin decimales (`$12.990`); zona horaria America/Santiago; celulares chilenos.
- Delivery limitado a ciertas comunas. **Por definir:** cuáles.
- **Por definir:** datos de transferencia, dirección y horario de retiro, mínimo para eventos, stock real y precio de los 5 productos ocultos.

## Brand Commitments

- Nombre: **Chef Diego Portilla**. Logo: `public/img/logo-chef-diego-portilla.png` (fondo negro, no transparente), al inicio de la carta.
- Colores del logo y reglas de uso: `docs/identidad-visual.md`.
- Pedido del usuario (2026-11-23): que la carta se vea ligera y mantenga el logo al inicio; el botón de WhatsApp en verde con letras blancas y su símbolo.
- Frase fija: "El pago y la entrega se coordinan con el Chef en la conversación."

## Evidence on Hand

- Catálogo y precios entregados por el usuario: `supabase/schema.sql` (los valores vigentes están en Supabase).
- Logo en PNG de 641 × 394 px. No hay versión vectorial.
- No hay fotos de productos en el repositorio, testimonios, reseñas, prensa, resolución sanitaria ni clientes citables. No inventarlos.
- Por confirmar con el usuario: los textos "mini pampitas" y "chandell" de los menús de eventos.

## Product Principles

1. **Pedir tiene que ser más fácil que escribir el mensaje a mano.** Pocos pasos, pensados para el celular.
2. **El pedido llega completo.** El chef no debería tener que preguntar qué, cuánto ni a quién.
3. **La carta es la verdad.** Precio y disponibilidad se comprueban antes de enviar; lo agotado se muestra.
4. **Claro para quien llega por primera vez, rápido para quien vuelve.** Qué trae cada formato se entiende sin preguntar.
5. **El chef se vale solo.** Lo cotidiano se cambia desde el panel, sin tocar código.

## Accessibility & Inclusion

Sin requisito formal definido. Se mantiene lo ya construido: botones de al menos 44 px en la carta, foco visible, textos legibles sobre fondo claro y respeto por la preferencia de menos movimiento.
