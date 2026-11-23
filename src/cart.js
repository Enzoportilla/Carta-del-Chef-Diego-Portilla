// Lógica pura del carrito y del mensaje de WhatsApp (sin React, se prueba con node --test).
// Carrito: { [id de producto]: cantidad de packs }

import { NEGOCIO } from './data.js'

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
export const precio = (n) => clp.format(n)

// El carrito viene de localStorage: puede traer cualquier cosa.
const limpiar = (carrito) =>
  Object.fromEntries(Object.entries(carrito ?? {}).filter(([, n]) => Number.isInteger(n) && n > 0))

export function cambiar(carrito, producto, delta) {
  const { [producto.id]: actual = 0, ...resto } = limpiar(carrito)
  const cantidad = Math.min(Math.min(actual, producto.stock) + delta, producto.stock)
  return cantidad > 0 ? { ...resto, [producto.id]: cantidad } : resto
}

export function resumen(carrito, productos) {
  const pedido = limpiar(carrito)
  const lineas = productos
    .filter((p) => pedido[p.id] && p.stock > 0)
    .map((producto) => {
      const cantidad = Math.min(pedido[producto.id], producto.stock)
      return { producto, cantidad, subtotal: cantidad * producto.precio_clp }
    })
  return {
    lineas,
    total: lineas.reduce((s, l) => s + l.subtotal, 0),
    unidades: lineas.reduce((s, l) => s + l.cantidad, 0),
    ajustado: lineas.length < Object.keys(pedido).length || lineas.some((l) => l.cantidad < pedido[l.producto.id]),
  }
}

// Celular chileno → '569XXXXXXXX'; null si no lo es.
export function telefonoInternacional(texto) {
  const digitos = String(texto ?? '').replace(/\D/g, '').replace(/^56(?=9\d{8}$)/, '')
  return /^9\d{8}$/.test(digitos) ? `56${digitos}` : null
}

export const anticipacion = (lineas) =>
  NEGOCIO.anticipacion[lineas.some((l) => l.producto.categoria === 'eventos') ? 'eventos' : 'carta']

// 'AAAA-MM-DD' dentro de n días, contando desde hoy en Chile y no en la zona del teléfono.
export function fechaDesde(dias, ahora = new Date()) {
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora)
  const fecha = new Date(`${hoy}T00:00:00Z`)
  fecha.setUTCDate(fecha.getUTCDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

const largo = new Intl.DateTimeFormat('es-CL', { dateStyle: 'full', timeZone: 'UTC' })
export const fechaTexto = (fecha) => largo.format(new Date(`${fecha}T00:00:00Z`)).replace(',', '')

export const nombreLinea = (p) => (p.formato ? `${p.nombre} (${p.formato})` : p.nombre)

export function mensajePedido({ lineas, total }, { fecha, entrega, nombre, apellido, telefono, direccion, comuna, referencias, comentario }) {
  const limpio = (t) => t?.trim()
  const destino = [limpio(direccion), limpio(comuna)].filter(Boolean).join(', ')
  return [
    `Hola Chef Diego, soy ${[limpio(nombre), limpio(apellido)].filter(Boolean).join(' ')} y mi pedido es:`,
    '',
    ...lineas.map((l) => `- ${l.cantidad} × ${nombreLinea(l.producto)}: ${precio(l.subtotal)}`),
    '',
    `Total: ${precio(total)}`,
    '',
    ...(fecha ? [`Fecha: ${fechaTexto(fecha)}`] : []),
    entrega === 'delivery'
      ? `Entrega: delivery a ${destino}${limpio(referencias) ? ` (${limpio(referencias)})` : ''}`
      : 'Entrega: retiro. ¿A qué hora puedo pasar?',
    'Pago: transferencia bancaria',
    `Teléfono: +${telefonoInternacional(telefono) ?? limpio(telefono) ?? ''}`,
    ...(limpio(comentario) ? [`Comentario: ${limpio(comentario)}`] : []),
  ].join('\n')
}

export const enlaceWhatsApp = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
