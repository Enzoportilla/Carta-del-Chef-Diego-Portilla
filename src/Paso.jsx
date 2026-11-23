// El + es siempre el mismo botón: no se mueve ni pierde el foco cuando aparecen − y la cantidad.
export default function Paso({ producto, cantidad = 0, onCambiar }) {
  return (
    <div className={`paso${cantidad ? ' paso--elegido' : ''}`} role="group" aria-label={`Cantidad de ${producto.nombre}`}>
      {cantidad > 0 && (
        <>
          <button type="button" onClick={() => onCambiar(producto, -1)} aria-label={`Quitar ${producto.nombre}`}>−</button>
          <output>{cantidad}</output>
        </>
      )}
      <button type="button" className="paso__mas" onClick={() => onCambiar(producto, 1)} disabled={cantidad >= producto.stock} aria-label={`Agregar ${producto.nombre}`}>+</button>
    </div>
  )
}
