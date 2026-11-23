import { useEffect, useRef, useState } from 'react'
import { COORDINAR, NEGOCIO, TRANSFERENCIA } from './data.js'
import { enlaceWhatsApp, mensajePedido, precio, resumen, telefonoInternacional } from './cart.js'
import { guardar, leer } from './almacen.js'
import Paso from './Paso.jsx'

const CLAVE = 'chef-diego-pedido-datos'
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

// Dos toques: vaciar no se puede deshacer.
function Vaciar({ onVaciar }) {
  const [seguro, setSeguro] = useState(false)
  return (
    <button type="button" className="vaciar" onClick={() => (seguro ? onVaciar() : setSeguro(true))} onBlur={() => setSeguro(false)}>
      {seguro ? 'Toca otra vez para vaciar' : 'Vaciar pedido'}
    </button>
  )
}

// Lo que se acaba de confirmar: se muestra tal cual aunque el carrito cambie después.
function Confirmacion({ enviado, onCopiar, onVaciar, aviso }) {
  const datos = TRANSFERENCIA && datosTransferencia(precio(enviado.total))
  return (
    <>
      <p>Envía el mensaje para que el chef reciba tu pedido.</p>
      {/* Enlace real y no window.open: funciona también dentro de Instagram y Facebook. */}
      <a className="enviar enviar--whatsapp" href={enviado.url} target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
        Enviar por WhatsApp
      </a>
      <p className="nota">{COORDINAR}</p>
      {datos && (
        <section className="transferencia" aria-labelledby="transferencia-titulo">
          <h3 id="transferencia-titulo">Datos para transferir</h3>
          <dl>{datos.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <button type="button" className="agregar" onClick={() => onCopiar(datos.map((d) => d.join(': ')).join('\n'), 'Datos copiados.')}>Copiar datos</button>
        </section>
      )}
      <p className="aviso" role="status">{aviso}</p>
      <Vaciar onVaciar={onVaciar} />
    </>
  )
}

export default function Pedido({ abierto, onCerrar, res, ajuste, carrito, onCambiar, onVaciar, onRecargar }) {
  const dialogo = useRef(null)
  const formulario = useRef(null)
  const titulo = useRef(null)
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

  useEffect(() => { if (enviado) titulo.current.focus() }, [enviado])

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
          <h2 id="pedido-titulo" ref={titulo} tabIndex={-1}>{enviado ? 'Falta un paso' : 'Tu pedido'}</h2>
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

                <p className="nota">
                  Pide con {NEGOCIO.anticipacion.carta} de anticipación{res.lineas.some((l) => l.producto.categoria === 'eventos') && `; eventos, con ${NEGOCIO.anticipacion.eventos}`}. {COORDINAR}
                </p>
                <p className="aviso" role="status">{aviso}</p>
                <button type="submit" className="enviar" disabled={!NEGOCIO.whatsapp || enviando}>{enviando ? 'Confirmando stock…' : 'Confirmar pedido'}</button>
                {!NEGOCIO.whatsapp && <p className="nota">El envío por WhatsApp aún no está disponible. Puedes copiar el mensaje.</p>}
                <div className="pedido__otras">
                  <button type="button" className="vaciar" onClick={() => formulario.current.reportValidity() && copiarYAvisar(mensaje, 'Mensaje copiado.')}>Copiar mensaje</button>
                  <Vaciar key={abierto} onVaciar={onVaciar} />
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </dialog>
  )
}
