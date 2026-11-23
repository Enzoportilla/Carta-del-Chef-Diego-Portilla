# Carta Digital — Chef Diego Portilla

## Qué es este proyecto
Carta digital (menú web) para los productos que comercializa el chef Diego Portilla.
Los clientes navegan los productos, arman un carrito y envían el pedido por WhatsApp.
Un panel de administración permite al chef gestionar productos y stock.

## Funcionalidades principales
1. **Carta pública**
   - Listado de productos por categoría (foto, nombre, descripción, precio).
   - Productos sin stock se muestran como "Agotado" y no se pueden agregar.
   - Diseño mobile-first (la mayoría de los clientes entrará desde el celular).
2. **Carrito**
   - Agregar / quitar productos y cambiar cantidades.
   - Persistencia del carrito en el navegador (localStorage, con try/catch).
   - Resumen con subtotal y total.
3. **Checkout por WhatsApp**
   - Elegir **delivery** (dirección, comuna, referencias, posible costo de envío) o **retiro**.
   - Datos del cliente: nombre y teléfono.
   - Pago por **transferencia bancaria**: mostrar datos de transferencia al confirmar.
   - Generar un mensaje de pedido ordenado y abrir `https://wa.me/<numero>?text=<mensaje>`.
4. **Panel de administración**
   - Acceso protegido (login).
   - Crear / editar / desactivar productos y categorías.
   - Editar stock y precios.
   - Configuración: número de WhatsApp, datos de transferencia, costos de delivery, horarios.

## Convenciones
- Idioma de la interfaz y del código visible al usuario: **español (Chile)**.
- Moneda: **CLP**, sin decimales, formato `$12.990` (`Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })`).
- Zona horaria: America/Santiago.
- Teléfonos en formato internacional para WhatsApp (`569XXXXXXXX`).
- Nunca guardar contraseñas ni credenciales en el repositorio; usar variables de entorno (`.env`, ignorado por git).

## Entorno de desarrollo
- Se trabaja dentro de un **dev container** (`.devcontainer/`): Debian + Node.js 22 + git + gh + Claude Code.
- Carpeta de trabajo en el contenedor: `/workspace`. Zona horaria America/Santiago.
- Puertos reenviados: 5173 (Vite), 3000 (app/API), 4173 (preview), 8080 (estático).
- Los servidores de desarrollo deben escuchar en `0.0.0.0` para ser accesibles desde Windows.
- Instrucciones de uso: `docs/contenedor.md`.

## Identidad visual
- Logo: `public/img/logo-chef-diego-portilla.png`. Paleta y estilo: `docs/identidad-visual.md`.
- Estilo: negro + dorado + crema, elegante, con motivo de montañas.

## Estructura de carpetas
```
/.devcontainer  Configuración del contenedor de desarrollo
/docs        Requisitos, decisiones y notas del proyecto
/src         Código fuente (React)
/supabase    Esquema, permisos y semilla
/public      Logo e ícono (las fotos de productos viven en Supabase Storage)
```

## Estado
- [x] Estructura base del proyecto
- [x] Contenedor de desarrollo para Claude Code
- [x] Stack y hosting: Vite + React, Supabase, GitHub Pages (ver `docs/decisiones.md`)
- [x] Logo recibido (`public/img/logo-chef-diego-portilla.png`) y paleta en `docs/identidad-visual.md`
- [x] Tipografías: Cinzel y Lato
- [x] Catálogo inicial (`supabase/schema.sql`; faltan precios, fotos y stock real)
- [x] Construir carta + carrito
- [x] Checkout WhatsApp (faltan número y datos de transferencia en `src/data.js`)
- [x] Panel `#/admin`: stock, precio, visible y fotos
- [ ] Panel: crear productos y categorías, configuración
- [ ] Publicación (pasos en `docs/publicacion.md`)

## Cómo trabajar en este proyecto
- Antes de implementar una funcionalidad nueva, revisar `docs/requisitos.md` y `docs/decisiones.md`.
- Registrar cada decisión importante en `docs/decisiones.md` (fecha, decisión, motivo).
- Mantener la sección **Estado** de este archivo al día.
