export default function Paso({ producto, cantidad, onCambiar }) {
  return (
    <div className="paso" role="group" aria-label={`Cantidad de ${producto.nombre}`}>
      <button type="button" onClick={() => onCambiar(producto, -1)} aria-label={`Quitar ${producto.nombre}`}>−</button>
      <output>{cantidad}</output>
      <button type="button" onClick={() => onCambiar(producto, 1)} disabled={cantidad >= producto.stock} aria-label={`Agregar ${producto.nombre}`}>+</button>
    </div>
  )
}
