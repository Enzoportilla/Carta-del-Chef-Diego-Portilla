// Lectura de lo que el chef escribe en el panel (sin React, se prueba con node --test).

// undefined = no se entiende lo escrito.
export function leerPrecio(texto) {
  const limpio = texto.replace(/[$\s]/g, '')
  if (!limpio) return null
  if (!/^(\d+|\d{1,3}(\.\d{3})+)$/.test(limpio)) return undefined // 2000 o 2.000
  return Number(limpio.replaceAll('.', '')) || undefined
}

export const leerStock = (texto) => (/^\d+$/.test(texto.trim()) ? Number(texto) : undefined)

// 'Pan árabe' → 'pan-arabe'
export const idDesdeNombre = (nombre) =>
  nombre.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
