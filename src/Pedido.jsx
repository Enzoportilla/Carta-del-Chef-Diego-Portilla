import { useEffect, useRef, useState } from 'react'
import { NEGOCIO, TRANSFERENCIA } from './data.js'
import { enlaceWhatsApp, mensajePedido, precio, resumen, telefonoInternacional } from './cart.js'
import { guardar, leer } from './almacen.js'
import Paso from './Paso.jsx'

const CLAVE = 'chef-diego-pedido-datos'
const COORDINAR = 'El pago y la entrega se coordinan con el Chef en la conversación.'
const VACIO = { entrega: 'retiro', nombre: '', apellido: '', telefono: '', direccion: '', comuna: '', referencias: '', comentario: '' }

function leerDatos() {
  const previo = leer(CLAVE) ?? {}
  const datos = { ...VACIO }
  for (const k in VACIO) if (typeof previo[k] === 'string') datos[k] = previo[k]
  if (datos.entrega !== 'delivery') datos.entrega = 'retiro'
  return datos
}

// navigator.clipboard no existe fuera de https en algunos navegadores; se cae al método antiguo.
async function copiar(texto, dialogo) {
  try { await navigator.clipboard.writeText(texto); return true } catch { /* sigue abajo */ }
  const t = Object.assign(document.createElement('textarea'), { value: texto, readOnly: true })
  t.style.cssText = 'position:fixed;opacity:0'
  dialogo.append(t); t.select() // dentro del diálogo: el resto de la página está inerte
  const ok = document.execCommand('copy'); t.remove()
  return ok
}

const datosTransferencia = (total) => [
  ['Banco', TRANSFERENCIA.banco], ['Tipo de cuenta', TRANSFERENCIA.tipo], ['Número', TRANSFERENCIA.numero],
  ['RUT', TRANSFERENCIA.rut], ['Nombre', TRANSFERENCIA.titular], ['Correo', TRANSFERENCIA.correo], ['Monto', total],
].filter(([, v]) => v)

// Lo que se acaba de confirmar: se muestra tal cual aunque el carrito cambie después.
function Confirmacion({ enviado, onCopiar, onVaciar, aviso }) {
  const datos = TRANSFERENCIA && datosTransferencia(precio(enviado.total))
  return (
    <>
      <p>Envía el mensaje para que el chef reciba tu pedido.</p>
      {/* Enlace real y no window.open: funciona también dentro de Instagram y Facebook. */}
      <a className="enviar enviar--whatsapp" href={enviado.url} target="_blank" rel="noopener">Enviar por WhatsApp</a>
      <p className="nota">{COORDINAR}</p>
      {datos && (
        <section className="transferencia" aria-labelledby="transferencia-titulo">
          <h3 id="transferencia-titulo">Datos para transferir</h3>
          <dl>{datos.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <button type="button" className="agregar" onClick={() => onCopiar(datos.map((d) => d.join(': ')).join('\n'), 'Datos copiados.')}>Copiar datos</button>
        </section>
      )}
      <p className="aviso" role="status">{aviso}</p>
      <button type="button" className="vaciar" onClick={onVaciar}>Vaciar pedido</button>
    </>
  )
}

export default function Pedido({ abierto, onCerrar, res, ajuste, carrito, onCambiar, onVaciar, onRecargar }) {
  const dialogo = useRef(null)
  const formulario = useRef(null)
  const [datos, setDatos] = useState(leerDatos)
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(null)
  useEffect(() => guardar(CLAVE, datos), [datos])

  useEffect(() => {
    const d = dialogo.current
    if (abierto && !d.open) { setAviso(''); setEnviado(null); d.showModal() }
    if (!abierto && d.open) d.close()
  }, [abierto])

  const campo = (k) => ({ value: datos[k], onChange: (e) => setDatos({ ...datos, [k]: e.target.value }) })
  const texto = (k) => ({ ...campo(k), required: true, pattern: '.*\\S.*', title: 'Completa este campo' })
  const mensaje = mensajePedido(res, datos)

  const confirmar = async (e) => {
    e.preventDefault()
    if (!NEGOCIO.whatsapp || enviando) return
    setEnviando(true); setAviso('')
    const actuales = await onRecargar()
    setEnviando(false)
    if (!actuales) return setAviso('No pudimos confirmar el stock. Revisa tu conexión y vuelve a intentarlo.')
    const ahora = resumen(carrito, actuales)
    if (mensajePedido(ahora, datos) !== mensaje) return setAviso('Cambió la carta y actualizamos tu pedido. Revísalo y vuelve a confirmar.')
    setEnviado({ url: enlaceWhatsApp(NEGOCIO.whatsapp, mensaje), total: ahora.total })
    dialogo.current.scrollTo(0, 0)
  }

  const copiarYAvisar = async (t, exito) =>
    setAviso((await copiar(t, dialogo.current)) ? exito : 'No se pudo copiar. Mantén presionado el texto para copiarlo a mano.')

  return (
    <dialog ref={dialogo} className="pedido" aria-labelledby="pedido-titulo" onClose={onCerrar}
      onClick={(e) => e.target === dialogo.current && onCerrar()}>
      <div className="pedido__hoja">
        <header className="pedido__cabeza">
          <h2 id="pedido-titulo">{enviado ? 'Falta un paso' : 'Tu pedido'}</h2>
          <button type="button" className="cerrar" onClick={onCerrar}>Cerrar</button>
        </header>

        {enviado ? <Confirmacion enviado={enviado} onCopiar={copiarYAvisar} onVaciar={onVaciar} aviso={aviso} /> : (
          <form ref={formulario} onSubmit={confirmar} inert={enviando ? '' : undefined}>
            {ajuste && !aviso && <p className="aviso" role="status">Cambió el stock: actualizamos tu pedido.</p>}
            {res.lineas.length === 0 ? (
              <>
                <p>Tu pedido está vacío. Vuelve a la carta y toca + en lo que quieras pedir.</p>
                <p className="aviso" role="status">{aviso}</p>
              </>
            ) : (
              <>
                <ul className="lineas">
                  {res.lineas.map(({ producto, cantidad, subtotal }) => (
                    <li key={producto.id}>
                      <div>
                        <p className="lineas__nombre">{producto.nombre}</p>
                        <p className="nota">{producto.formato}</p>
                      </div>
                      <p className="precio">{precio(subtotal)}</p>
                      <Paso producto={producto} cantidad={cantidad} onCambiar={onCambiar} />
                    </li>
                  ))}
                </ul>
                <p className="total"><span>Total</span><span>{precio(res.total)}</span></p>

                <fieldset className="entrega">
                  <legend>¿Cómo lo recibes?</legend>
                  {[['retiro', 'Retiro'], ['delivery', 'Delivery']].map(([v, t]) => (
                    <label key={v}>
                      <input type="radio" name="entrega" value={v} checked={datos.entrega === v} onChange={campo('entrega').onChange} />
                      <span>{t}</span>
                    </label>
                  ))}
                </fieldset>
                {datos.entrega === 'delivery' ? (
                  <>
                    <label className="campo"><span>Dirección</span><input autoComplete="street-address" {...texto('direccion')} /></label>
                    <label className="campo"><span>Comuna</span><input autoComplete="address-level2" {...texto('comuna')} /></label>
                    <label className="campo"><span>Referencias (opcional)</span><input {...campo('referencias')} /></label>
                  </>
                ) : NEGOCIO.retiro && <p className="nota">{NEGOCIO.retiro}</p>}

                <div className="campos-dos">
                  <label className="campo"><span>Nombre</span><input autoComplete="given-name" {...texto('nombre')} /></label>
                  <label className="campo"><span>Apellido</span><input autoComplete="family-name" {...texto('apellido')} /></label>
                </div>
                <label className="campo"><span>Teléfono</span>
                  <input required type="tel" autoComplete="tel" placeholder="9 1234 5678" {...campo('telefono')}
                    ref={(el) => el?.setCustomValidity(telefonoInternacional(datos.telefono) ? '' : 'Escribe un celular chileno, por ejemplo 9 1234 5678')} />
                </label>
                <label className="campo"><span>Comentario (opcional)</span><textarea rows={2} {...campo('comentario')} /></label>

                <p className="aviso" role="status">{aviso}</p>
                <button type="submit" className="enviar" disabled={!NEGOCIO.whatsapp || enviando}>{enviando ? 'Confirmando stock…' : 'Confirmar pedido'}</button>
                {!NEGOCIO.whatsapp && <p className="nota">El envío por WhatsApp aún no está disponible. Puedes copiar el mensaje.</p>}
                <button type="button" className="agregar" onClick={() => formulario.current.reportValidity() && copiarYAvisar(mensaje, 'Mensaje copiado.')}>Copiar mensaje</button>
                <p className="nota">{COORDINAR}</p>
                <button type="button" className="vaciar" onClick={onVaciar}>Vaciar pedido</button>
              </>
            )}
          </form>
        )}
      </div>
    </dialog>
  )
}
