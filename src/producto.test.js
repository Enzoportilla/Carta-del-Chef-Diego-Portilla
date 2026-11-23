import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as producto from './producto.js'

test('id desde el nombre: sin tildes, espacios ni símbolos (sirve de ruta para la foto)', () => {
  assert.equal(producto.idDesdeNombre('  Pan de Ñuñoa & ají (80 g) '), 'pan-de-nunoa-aji-80-g')
  assert.equal(producto.idDesdeNombre('Pan Árabe'), 'pan-arabe') // mismo id que la semilla: detecta repetidos
  for (const t of ['', '  ', '¡!', '🍞']) assert.equal(producto.idDesdeNombre(t), '')
})

test('precio: número CLP, vacío = sin definir, lo demás inválido', () => {
  for (const [t, n] of [['2000', 2000], ['2.000', 2000], ['$ 12.990', 12990], ['', null], ['  ', null]]) assert.equal(producto.leerPrecio(t), n, t)
  for (const t of ['0', '-500', '2000,50', '2.00', 'abc', '1e3']) assert.equal(producto.leerPrecio(t), undefined, t)
})

test('stock: entero desde cero', () => {
  for (const [t, n] of [['0', 0], [' 12 ', 12]]) assert.equal(producto.leerStock(t), n, t)
  for (const t of ['', '-1', '2,5', '1.000', '0x10', 'x']) assert.equal(producto.leerStock(t), undefined, t)
})
