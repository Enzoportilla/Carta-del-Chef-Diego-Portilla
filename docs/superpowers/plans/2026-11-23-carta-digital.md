# Carta Digital Chef Diego Portilla: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (ejecución **nativa**, elegida por el usuario). Pasos con checkbox (`- [ ]`). Al empezar, copiar este archivo a `docs/superpowers/plans/2026-11-23-carta-digital.md`.

**Goal:** publicar en GitHub Pages una carta mobile-first con carrito, pedido por WhatsApp y panel de stock, precios, visibilidad y fotos, con datos en Supabase.

**Architecture:** SPA estática; `#/admin` es el panel y cualquier otro hash, la carta. Los productos viven en Supabase y los protege RLS. Negocio, categorías y transferencia quedan fijos en `src/data.js`. La lógica del carrito es pura y se prueba con `node --test`.

**Tech Stack:** Vite 6, React 18, `@supabase/supabase-js` 2, CSS a mano, GitHub Actions.

**Spec:** `CLAUDE.md`, `docs/requisitos.md`, `docs/identidad-visual.md` y las decisiones de abajo.

## Context

`/workspace` solo tiene documentos y el logo. El repo de destino existe y está vacío; el proyecto Supabase `tzvzkfdztzvvlbqnsheh` responde. La referencia (`Enzoportilla/Carta-Digital`, del mismo usuario) se leyó completa y sirve de base. Clon para consultar: `/tmp/claude-1000/-workspace/3b851abe-c10d-4d6c-a92f-a98b50091b7a/scratchpad/ref/src` (si no está, volver a clonar).

**Se reutiliza y adapta:** `cart.js` y sus tests, `leer`/`guardar`/`copiar`, `Paso`, `Pedido` (`<dialog>`), `Login`/`Fila`/`Panel`, `deploy.yml`.
**Se omite:** venta por kilo, formatos agrupados, react-router, singlefile, animación "volar", toda la estética de granja.

**Decisiones del usuario (2026-11-23):**
- Productos sin precio: cargados pero ocultos.
- Panel igual a la referencia (stock, precio, visible) **más** subida de fotos. Crear productos o categorías y la configuración de CLAUDE.md quedan fuera de esta versión.
- Ejecución nativa.

**Diferencias con la referencia, exigidas por CLAUDE.md:** lo agotado se muestra como "Agotado" (la referencia lo esconde); pago por transferencia, con datos visibles al confirmar.

## Global Constraints

- Interfaz en español (Chile). CLP sin decimales, `$12.990`. Zona horaria America/Santiago.
- WhatsApp en formato `569XXXXXXXX`.
- Solo la clave anon/publishable llega al navegador; nunca `service_role`. `.env` fuera de git.
- `base: '/Carta-del-Chef-Diego-Portilla/'` (respeta mayúsculas). Dev en `0.0.0.0:5173`, con `usePolling` (carpeta de Windows).
- El repo es público: commits con `273568464+Enzoportilla@users.noreply.github.com` (config local), no con el correo personal.
- Commits terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. El push se confirma con el usuario.
- No inventar descripciones, fotos, teléfonos ni datos bancarios.

## Review Focus

1. Producto que se agota o baja de stock con el carrito ya guardado: se quita o se ajusta, y se avisa (T2, T4).
2. Usuario con sesión pero sin rol admin, o sesión vencida: un update con RLS afecta 0 filas sin error; el panel no debe decir "Guardado" (T5).
3. `localStorage` corrupto, bloqueado o con cantidades inválidas: la carta abre igual (T2).
4. Teléfono en formatos chilenos (`9 1234 5678`, `+56 9…`, `569…`): se normaliza o se pide corregir (T2).
5. Visible sin precio: imposible desde el panel y desde la base (T1, T5).

## Diseño (frontend-design)

**Idea:** una carta de restaurante, no una grilla de tarjetas. Listado tipográfico con línea de puntos entre nombre y precio, que se ve terminado con o sin fotos.

**Elemento memorable: la cordillera.** La navegación de categorías es un perfil de montañas dorado, con un cerro por categoría. La estrella del logo se posa en la cumbre activa y se desplaza al hacer scroll. Es lo único decorativo; el resto queda quieto.

```
┌──────────────────────────┐
│        [ LOGO ]          │  centrado (el logo es simétrico)
│ Panes, dulces y masas    │
│ hechos por el chef.      │
│ Arma tu pedido y envíalo │
│ por WhatsApp.            │
├──────────────────────────┤
│   ★                      │  sticky
│  /\__/\___/\____/\__     │  cordillera SVG
│ Panes Sopaipillas Dulces │
├──────────────────────────┤
│ PANES                    │  resto alineado a la izquierda
│ Pan árabe ........ $2.000│
│ 5 unidades de 70 g       │
│                [Agregar] │
│ Roscas ........... $2.000│
│ 4 unidades · Agotado     │
├──────────────────────────┤
│ Ver mi pedido (3)  $6.000│  barra fija dorada
└──────────────────────────┘
```

- **Color** (exacto de `identidad-visual.md`): `--noche #060B0F` fondo, `--grafito #13171B` pedido y campos, `--crema #F0E2B3` texto, `--marfil #F8F1CD` énfasis, `--dorado #AF8B55` precios/botones/cordillera, `--ambar #DE9A51` estrella, cantidad y errores. Texto sobre dorado: `--noche` (≈6:1).
- **Tipografía** (Google Fonts): Cinzel 600 en títulos y nombres (minúsculas = versalitas, como el logo); Lato 400/700 en texto y precios (`tabular-nums`). Escala 15/17/20/28 px.
- **Layout:** columna de 44rem; desde 64rem, dos columnas por categoría. Foto opcional de 88 px a la izquierda; sin foto no queda hueco. Radio 2px, sin sombras. Pedido: hoja inferior en celular, lateral de 28rem en escritorio.
- **Movimiento:** solo la estrella y la apertura del pedido. Respeta `prefers-reduced-motion`.
- **Revisión anti-genérico:** se descartaron tarjetas redondeadas, etiquetas en mayúsculas espaciadas, flechas en botones y gradientes. Negro + dorado es exigencia de marca; lo distintivo lo ponen la cordillera y la línea de puntos. Logo con `mix-blend-mode: lighten` para fundir su fondo.
- **Textos:** "Agregar", "Ver mi pedido", "Enviar por WhatsApp", "Copiar datos", "Agotado". Pedido vacío: "Tu pedido está vacío. Vuelve a la carta y toca Agregar."
- **Accesibilidad:** objetivos táctiles ≥44px, foco visible marfil, `aria-live` al agregar, SVG con `aria-hidden`.

## Catálogo inicial (20 productos; un ítem del carrito = un pack)

| Categoría (`id`) | id · Nombre · formato · precio |
|---|---|
| Panes (`panes`) | `fugazza` Fugazza, 5 unidades de 50 g, 2000 · `pan-arabe` Pan árabe, 5 unidades de 70 g, 2000 · `pan-amasado` Pan amasado, 5 unidades de 80 g, 2000 · `pan-integral` Pan integral, 5 unidades de 80 g, 3000 · `roscas` Roscas, 4 unidades de 65–70 g, 2000 · `pan-de-naranjas` Pan de naranjas, 2 unidades de 50 g, 1000 · `dobladas` Dobladas, 5 unidades de 80 g, 2000 · `doblada-con-queso` Doblada con queso, 4 unidades de 80 g, 2500 · `pan-con-chicharron` Pan con chicharrón, 4 unidades de 75–80 g, 2500 |
| Sopaipillas (`sopaipillas`) | `sopaipilla-seca` Sopaipilla seca, 1 unidad de 12 cm, 400 · `sopaipilla-pasada` Sopaipilla pasada, 2 unidades de 10 cm, 1000 · `calzon-roto` Calzón roto, 3 unidades de 15 cm, 1000 |
| Dulces (`dulces`) | `torta-hojarasca` Torta hojarasca, 1 unidad de 10 cm, 2500 · `mini-chileno` Mini chileno, 4 unidades, 2000 · `rollos-canela` Rollos de canela, 4 unidades, 2000 · `dona-rellena` Dona rellena, 65 g, **null** · `empolvados` Empolvados, 30 g, con manjar, **null** |
| Salados y masas (`salados`) | `falafel` Falafel, 4 unidades de 25 g, **null** · `masa-empanada` Masa de empanada, 130 g, **null** · `empanada-queso` Empanada de queso, con 58 g de queso, **null** |

- Con precio: `activo=true`, `stock=10` (**valor de ejemplo**, ajustar en el panel). Precio null: `activo=false`, `stock=0`.
- "Queso 700 queso, 20 maicena 100 agua" se interpreta como receta de relleno y **no** se publica. Tampoco las notas de molde y corte ("molde de galletas grande 1 antes", "1 cuarta 4 dedos", "disco más grande").

## Archivos

```
package.json · vite.config.js · index.html · .env.example · .github/workflows/deploy.yml
supabase/schema.sql      tabla, RLS, bucket de fotos, semilla
src/main.jsx             elige carta o panel por hash
src/data.js              NEGOCIO, TRANSFERENCIA, CATEGORIAS
src/supabase.js          cliente + urlFoto()
src/cart.js, cart.test.js   lógica pura
src/App.jsx              portada, cordillera, carta, barra
src/Pedido.jsx           canasto, datos, confirmación
src/Admin.jsx            login, stock, precio, visible, foto
src/styles.css
```
Borrar `src/.gitkeep` y `public/.gitkeep`.

---

### Task 1: Base del proyecto y esquema de Supabase

**Files:** Create `package.json`, `vite.config.js`, `index.html`, `.env.example`, `src/data.js`, `src/supabase.js`, `supabase/schema.sql`

**Produces:**
- `NEGOCIO = { nombre, whatsapp: '', retiro: '' }`, `TRANSFERENCIA = null | { banco, tipo, numero, rut, titular, correo }`, `CATEGORIAS = [{ id, nombre }]` (orden de la tabla)
- `supabase`; `urlFoto(ruta: string): string` (bucket público `fotos`)
- Fila `productos`: `{ id, categoria, nombre, formato, precio_clp, stock, descripcion, foto, orden, activo }`

- [ ] `git init -b main`; config local `core.fileMode false` y correo noreply; remote `origin`
- [ ] `package.json` como la referencia, sin `react-router-dom` ni `vite-plugin-singlefile`; `npm install`. `vite.config.js` con `base`, `server.host: true`, `usePolling`. `index.html` con `lang="es-CL"`, `theme-color #060B0F`, fuentes y favicon
- [ ] `schema.sql`, repetible sin duplicar:
  - `productos`: `id text pk`, `categoria text` con check de las 4 categorías, `precio_clp integer null check (>=0)`, `stock integer not null default 0 check (>=0)`, `check (not activo or precio_clp is not null)`
  - `public.es_admin()`: `(auth.jwt()->'app_metadata'->>'rol') = 'admin'`
  - RLS: `anon` y `authenticated` leen `activo`; admin lee todo y actualiza. Sin insert ni delete (el panel no los usa). Grants explícitos: `select` a ambos, `update` a `authenticated`
  - Bucket `fotos` público, 2 MB, solo `image/jpeg`; insert/select/delete en `storage.objects` solo para `es_admin()`
  - Semilla con `on conflict (id) do nothing`
- [ ] Verificar: `npm run build` sin errores; la semilla tiene 20 filas (9 panes, 3 sopaipillas, 5 dulces, 3 salados), 15 activas
- [ ] Commit `feat: base del proyecto y esquema de Supabase`

### Task 2: Lógica del carrito (TDD)

**Files:** Create `src/cart.js`; Test `src/cart.test.js`

**Produces** (carrito = `{ [id]: cantidad }`):
- `precio(n): string`
- `cambiar(carrito, producto, delta): carrito` (entre 0 y stock; en 0 elimina)
- `resumen(carrito, productos): { lineas: [{ producto, cantidad, subtotal }], total, unidades, ajustado: boolean }`
- `telefonoInternacional(texto): string | null`
- `mensajePedido(res, { entrega, nombre, telefono, direccion, comuna, referencias, comentario }): string`
- `enlaceWhatsApp(numero, texto): string`

- [ ] Escribir tests (`p(id, precio, stock)` es un helper de fila):

```js
assert.equal(precio(12990).replace(/\s/g, ''), '$12.990')
// cambiar: suma, tope en stock, elimina en cero
assert.deepEqual(cambiar({ roscas: 2 }, p('roscas', 2000, 2), 1), { roscas: 2 })
assert.deepEqual(cambiar({ roscas: 1 }, p('roscas', 2000, 2), -1), {})
// resumen: total, agotado, ajuste, desconocido y basura
assert.equal(resumen({ fugazza: 2, roscas: 1 }, [p('fugazza', 2000, 5), p('roscas', 2000, 5)]).total, 6000)
assert.deepEqual(resumen({ roscas: 1 }, [p('roscas', 2000, 0)]).lineas, [])
assert.equal(resumen({ roscas: 1 }, [p('roscas', 2000, 0)]).ajustado, true)
assert.equal(resumen({ roscas: 9 }, [p('roscas', 2000, 3)]).lineas[0].cantidad, 3)
assert.equal(resumen({ viejo: 1 }, [p('roscas', 2000, 3)]).ajustado, true)
for (const malo of [[], 'x', null, { roscas: -1 }, { roscas: 1.5 }, { roscas: 'a' }])
  assert.equal(resumen(malo, [p('roscas', 2000, 3)]).total, 0)
// teléfono
for (const t of ['9 1234 5678', '+56 9 1234 5678', '56912345678']) assert.equal(telefonoInternacional(t), '56912345678')
for (const t of ['', '123', 'abc', '+54 9 1234 5678']) assert.equal(telefonoInternacional(t), null)
// mensaje delivery
assert.ok(msg.startsWith('Hola Chef Diego, soy Ana Pérez y mi pedido es:'))
assert.match(msg, /- 2 × Pan árabe \(5 unidades de 70 g\): \$\s?4\.000/)
assert.match(msg, /Total: \$\s?4\.000/)
assert.match(msg, /Entrega: delivery a Los Aromos 12, Ñuñoa \(portón negro\)/)
assert.match(msg, /Pago: transferencia bancaria/)
assert.match(msg, /Teléfono: \+56912345678/)
assert.doesNotMatch(msg, /Comentario|undefined|null/)
// retiro no filtra la dirección guardada
assert.match(msgRetiro, /Entrega: retiro/); assert.doesNotMatch(msgRetiro, /Los Aromos/)
```

- [ ] `npm test` → falla; implementar; `npm test` → pasa
- [ ] Commit `feat: lógica del carrito`

### Task 3: Carta pública

**Files:** Create `src/main.jsx`, `src/App.jsx`, `src/styles.css`

**Consumes:** T1, T2. **Produces:** estado `carrito` (`localStorage['chef-diego-pedido']`, con try/catch) y `App` que pasa a `Pedido` `{ abierto, onCerrar, res, onCambiar, onVaciar }`.

- [ ] `main.jsx`: con `location.hash === '#/admin'` carga `Admin` (`lazy`); escucha `hashchange`
- [ ] `App`: portada, cordillera con estrella (`IntersectionObserver` para la categoría activa; un cerro por categoría, sin número fijo), listado, barra fija. Anclas nativas `href="#panes"`. Consulta con `.eq('activo', true)`: el admin con sesión también ve los ocultos por RLS
- [ ] Estados: cargando, error con Reintentar, sin productos, Agotado (sin botón), tope de stock (+ deshabilitado)
- [ ] `styles.css` según Diseño
- [ ] Verificar con Playwright desde el scratchpad, interceptando `**/rest/v1/productos*`, a 360, 390 y 1280 px: sin scroll horizontal, capturas revisadas y corregidas, agregar → recargar → el carrito sigue; `localStorage` con JSON roto o que lanza → la carta abre
- [ ] Commit `feat: carta pública`

### Task 4: Pedido y checkout

**Files:** Create `src/Pedido.jsx`; Modify `src/App.jsx`, `src/styles.css`

- [ ] `<dialog>` con líneas, subtotales, total y aviso si `res.ajustado` ("Cambió el stock: actualizamos tu pedido."); el pedido ajustado se persiste al enviar
- [ ] Datos: nombre y teléfono obligatorios (`setCustomValidity` si `telefonoInternacional` da null); retiro o delivery (dirección y comuna obligatorias, referencias opcionales); nota "El costo de envío se confirma por WhatsApp"; comentario
- [ ] Antes de enviar, volver a leer los productos; si cambió el stock o el precio, mostrar el aviso y no abrir WhatsApp. Abrir la ventana de forma síncrona en el clic y asignarle la URL después (evita el bloqueo de popups); si falla la lectura, avisar y cerrar la ventana
- [ ] Confirmación: datos de transferencia con "Copiar datos" (solo si `TRANSFERENCIA`), total, enlace "Abrir WhatsApp de nuevo" y "Vaciar pedido". No se vacía solo
- [ ] Sin `NEGOCIO.whatsapp`: botón de envío deshabilitado con explicación; "Copiar mensaje" sigue funcionando
- [ ] Verificar con Playwright: la URL `wa.me` decodificada coincide con `mensajePedido`; teléfono inválido bloquea; stock reducido entre carga y envío muestra el aviso; Escape cierra y devuelve el foco
- [ ] Commit `feat: pedido por WhatsApp`

### Task 5: Panel de administración

**Files:** Create `src/Admin.jsx`; Modify `src/styles.css`

- [ ] Login con `signInWithPassword`. Si la sesión no tiene `app_metadata.rol === 'admin'`: "Esta cuenta no tiene permiso" y botón Salir
- [ ] Fila: stock +/− y campo (entero ≥0), precio (vacío permitido = null), visible (deshabilitado sin precio: "Falta el precio"; borrar el precio de un producto visible se rechaza)
- [ ] Guardar con `.update(c).eq('id', id).select().single()`: 0 filas cuenta como error → "No se guardó el cambio" y recarga
- [ ] Foto: `createImageBitmap` → canvas 800×800 recortado al centro → JPEG 0.85 → sube a `${id}-${Date.now()}.jpg` → actualiza la fila → borra la anterior. Si falla la fila, borra la nueva. Formato no legible: "Usa una foto JPG o PNG"
- [ ] Verificar con Playwright y API simulada: login fallido, sin rol, guardado, update que devuelve 0 filas no muestra "Guardado", visible bloqueado sin precio
- [ ] Commit `feat: panel de stock, precios y fotos`

### Task 6: Publicación y documentación

**Files:** Create `.github/workflows/deploy.yml`; Modify `docs/decisiones.md`, `docs/requisitos.md`, `docs/identidad-visual.md` (tipografías), `CLAUDE.md` (Estado), `README.md`; Create `docs/publicacion.md` (los pasos de abajo)

- [ ] Workflow de la referencia + paso que falla si falta un secret (sin él la página queda en blanco)
- [ ] `npm ci && npm test && npm run build`; `npm run preview` abre bajo la ruta base
- [ ] Commit `ci: publicación en GitHub Pages`; revisión final de toda la rama por un revisor independiente (parte del modo nativo); corregir
- [ ] Con confirmación del usuario: `git push -u origin main`

## Pasos para dejarlo implementado (tu parte)

**Datos que necesito** (la app funciona sin ellos, pero no recibe pedidos): número de WhatsApp, datos de transferencia, dirección y horario de retiro. Van en `src/data.js` de un repo **público** y además se muestran en la web: entrégame solo los que aceptes publicar.

1. **Supabase → SQL Editor:** pegar y ejecutar `supabase/schema.sql`.
2. **Authentication → Users → Add user → Create new user:** correo y contraseña del chef, con *Auto Confirm User*.
3. **SQL Editor**, para darle el rol (no se sube al repo):
   ```sql
   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"rol":"admin"}' where email = 'CORREO_DEL_CHEF';
   ```
4. **Authentication → Sign In / Providers:** desactivar *Allow new users to sign up*.
5. **Project Settings → API Keys:** copiar la clave *publishable/anon* (no la `service_role`/`secret`). Local: `cp .env.example .env` y pegarla. URL: `https://tzvzkfdztzvvlbqnsheh.supabase.co`.
6. **GitHub → Settings → Secrets and variables → Actions:** crear `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
7. **GitHub → Settings → Pages → Source:** *GitHub Actions*.
8. **Push:** si el contenedor pide credenciales, ejecutar `! gh auth login`. Hacer los pasos 6 y 7 antes del push.
9. **Revisar:** https://enzoportilla.github.io/Carta-del-Chef-Diego-Portilla/ y `…/#/admin`. Ajustar stock real, subir fotos y poner precio a los 5 ocultos.

## Verification (de punta a punta, con la base real)

- `curl` con la clave anon: lista 15 productos; `PATCH` anónimo no modifica nada; subir al bucket sin sesión es rechazado.
- Usuario sin rol: no puede actualizar `productos`. Usuario admin: sí.
- Desde un celular: agregar, recargar, enviar por delivery y por retiro; el mensaje llega completo al WhatsApp del chef.
- Stock en 0 desde el panel → aparece "Agotado" al recargar la carta.
- Subir y reemplazar una foto desde el celular.

## Riesgos conocidos

- El stock no baja solo con cada pedido (igual que la referencia): dos clientes pueden pedir el último pack.
- El plan gratuito de Supabase puede pausar el proyecto por inactividad; la carta mostraría el error con Reintentar.
