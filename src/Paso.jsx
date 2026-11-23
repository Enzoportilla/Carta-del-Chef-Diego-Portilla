import { useState } from 'react'
import { leerStock } from './producto.js'
import { Mas, Menos } from './Iconos.jsx'

// Se puede escribir la cantidad: un menú para 30 personas no se arma tocando +.
function Cantidad({ producto, cantidad, onCambiar }) {
  const [texto, setTexto] = useState(null) // null = no se está escribiendo

  const aplicar = () => {
    if (texto === null) return
    const n = leerStock(texto)
    setTexto(null)
    if (n !== undefined && n !== cantidad) onCambiar(producto, n - cantidad)
  }
  return (
    <input inputMode="numeric" value={texto ?? cantidad} maxLength={4} aria-label={`Cantidad de ${producto.nombre}`}
      onChange={(e) => setTexto(e.target.value)} onBlur={aplicar}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }} />
  )
}

// El + es siempre el mismo botón: no se mueve ni pierde el foco cuando aparecen − y la cantidad.
export default function Paso({ producto, cantidad = 0, onCambiar }) {
  return (
    <div className={`paso${cantidad ? ' paso--elegido' : ''}`} role="group" aria-label={producto.nombre}>
      {cantidad > 0 && (
        <>
          <button type="button" onClick={() => onCambiar(producto, -1)} aria-label={`Quitar ${producto.nombre}`}><Menos /></button>
          <Cantidad producto={producto} cantidad={cantidad} onCambiar={onCambiar} />
        </>
      )}
      <button type="button" className="paso__mas" onClick={() => onCambiar(producto, 1)} disabled={cantidad >= producto.stock} aria-label={`Agregar ${producto.nombre}`}><Mas /></button>
    </div>
  )
}
