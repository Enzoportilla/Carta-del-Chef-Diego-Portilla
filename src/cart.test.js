import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as cart from './cart.js'

const p = (id, precio_clp, stock, nombre = id, formato = null) => ({ id, nombre, formato, precio_clp, stock })

test('precio en CLP sin decimales', () => {
  assert.equal(cart.precio(12990).replace(/\s/g, ''), '$12.990')
})

test('cambiar suma, topa en el stock y elimina en cero', () => {
  assert.deepEqual(cart.cambiar({}, p('roscas', 2000, 2), 1), { roscas: 1 })
  assert.deepEqual(cart.cambiar({ roscas: 2 }, p('roscas', 2000, 2), 1), { roscas: 2 })
  assert.deepEqual(cart.cambiar({ roscas: 1, fugazza: 1 }, p('roscas', 2000, 2), -1), { fugazza: 1 })
})

test('cambiar parte de la cantidad que se ve: lo guardado sobre el stock se topa antes de restar', () => {
  assert.deepEqual(cart.cambiar({ roscas: 9 }, p('roscas', 2000, 3), -1), { roscas: 2 })
})

test('resumen suma subtotales y unidades', () => {
  const r = cart.resumen({ fugazza: 2, roscas: 1 }, [p('fugazza', 2000, 5), p('roscas', 2500, 5)])
  assert.equal(r.total, 6500)
  assert.equal(r.unidades, 3)
  assert.deepEqual(r.lineas.map((l) => l.subtotal), [4000, 2500])
  assert.equal(r.ajustado, false)
})

test('resumen quita lo agotado o retirado y ajusta al stock, avisando', () => {
  const agotado = cart.resumen({ roscas: 1 }, [p('roscas', 2000, 0)])
  assert.deepEqual(agotado.lineas, [])
  assert.equal(agotado.ajustado, true)
  const corto = cart.resumen({ roscas: 9 }, [p('roscas', 2000, 3)])
  assert.equal(corto.lineas[0].cantidad, 3)
  assert.equal(corto.ajustado, true)
  assert.equal(cart.resumen({ viejo: 1 }, [p('roscas', 2000, 3)]).ajustado, true)
})

test('un carrito guardado corrupto no rompe ni cobra', () => {
  for (const malo of [[], 'x', null, 7, { roscas: -1 }, { roscas: 1.5 }, { roscas: 'a' }, { roscas: null }]) {
    assert.equal(cart.resumen(malo, [p('roscas', 2000, 3)]).total, 0)
    assert.deepEqual(cart.cambiar(malo, p('roscas', 2000, 3), 1), { roscas: 1 })
  }
})

test('teléfono chileno a formato internacional', () => {
  for (const t of ['9 1234 5678', '912345678', '+56 9 1234 5678', '56912345678', '+56-9-1234-5678', '(+56) 9 1234 5678']) assert.equal(cart.telefonoInternacional(t), '56912345678')
  for (const t of ['', undefined, '123', 'abc', '+54 9 1234 5678', '9123456789']) assert.equal(cart.telefonoInternacional(t), null)
})

const datos = { entrega: 'delivery', nombre: ' Ana ', apellido: ' Pérez ', telefono: '9 1234 5678', direccion: 'Los Aromos 12', comuna: 'Ñuñoa', referencias: 'portón negro', comentario: '  ' }
const res = cart.resumen?.({ 'pan-arabe': 2 }, [p('pan-arabe', 2000, 5, 'Pan árabe', '5 unidades de 70 g')])

test('mensaje de delivery lleva detalle, total, entrega, pago y teléfono', () => {
  const msg = cart.mensajePedido(res, datos)
  assert.ok(msg.startsWith('Hola Chef Diego, soy Ana Pérez y mi pedido es:'))
  assert.match(msg, /- 2 × Pan árabe \(5 unidades de 70 g\): \$\s?4\.000/)
  assert.match(msg, /Total: \$\s?4\.000/)
  assert.match(msg, /Entrega: delivery a Los Aromos 12, Ñuñoa \(portón negro\)/)
  assert.match(msg, /Pago: transferencia bancaria/)
  assert.match(msg, /Teléfono: \+56912345678/)
  assert.doesNotMatch(msg, /Comentario|undefined|null|envío|cuesta/)
})

test('mensaje de retiro no incluye la dirección guardada', () => {
  const msg = cart.mensajePedido(res, { ...datos, entrega: 'retiro', comentario: 'sin sal' })
  assert.match(msg, /Entrega: retiro/)
  assert.doesNotMatch(msg, /Los Aromos|portón/)
  assert.match(msg, /Comentario: sin sal/)
})

test('enlace de WhatsApp codifica el mensaje completo', () => {
  const url = new URL(cart.enlaceWhatsApp('56912345678', 'Hola & ñ #1\nTotal: $2.000'))
  assert.equal(url.pathname, '/56912345678')
  assert.equal(url.searchParams.get('text'), 'Hola & ñ #1\nTotal: $2.000')
})
