// Lógica pura del carrito y del mensaje de WhatsApp (sin React, se prueba con node --test).
// Carrito: { [id de producto]: cantidad de packs }

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

export const nombreLinea = (p) => (p.formato ? `${p.nombre} (${p.formato})` : p.nombre)

export function mensajePedido({ lineas, total }, { entrega, nombre, telefono, direccion, comuna, referencias, comentario }) {
  const limpio = (t) => t?.trim()
  const destino = [limpio(direccion), limpio(comuna)].filter(Boolean).join(', ')
  return [
    `Hola Chef Diego, soy ${limpio(nombre) ?? ''} y mi pedido es:`,
    '',
    ...lineas.map((l) => `- ${l.cantidad} × ${nombreLinea(l.producto)}: ${precio(l.subtotal)}`),
    '',
    `Total: ${precio(total)}${entrega === 'delivery' ? ' más envío' : ''}`,
    '',
    entrega === 'delivery'
      ? `Entrega: delivery a ${destino}${limpio(referencias) ? ` (${limpio(referencias)})` : ''}. ¿Cuánto cuesta el envío?`
      : 'Entrega: retiro. ¿Cuándo puedo pasar?',
    'Pago: transferencia bancaria',
    `Teléfono: +${telefonoInternacional(telefono) ?? limpio(telefono) ?? ''}`,
    ...(limpio(comentario) ? [`Comentario: ${limpio(comentario)}`] : []),
  ].join('\n')
}

export const enlaceWhatsApp = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
