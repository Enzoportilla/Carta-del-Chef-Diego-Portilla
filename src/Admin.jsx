import { useEffect, useRef, useState } from 'react'
import { supabase, urlFoto } from './supabase.js'
import { CATEGORIAS } from './data.js'

const ERRORES_LOGIN = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Esta cuenta aún no está confirmada. Confírmala en Supabase.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
}

function Login() {
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const entrar = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setEnviando(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: f.get('correo'), password: f.get('clave') })
    setEnviando(false)
    if (error) setError(ERRORES_LOGIN[error.code] ?? (error.code ? `No se pudo entrar (${error.code}).` : 'No se pudo entrar. Revisa tu conexión.'))
  }

  return (
    <form className="admin__login" onSubmit={entrar}>
      <h1>Panel del chef</h1>
      <label className="campo"><span>Correo</span><input name="correo" type="email" autoComplete="username" required /></label>
      <label className="campo"><span>Contraseña</span><input name="clave" type="password" autoComplete="current-password" required /></label>
      <button type="submit" className="enviar" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      <p className="aviso" role="alert">{error}</p>
    </form>
  )
}

// Recorta al centro y achica: las fotos de celular pesan varios MB.
async function prepararFoto(archivo) {
  const img = await createImageBitmap(archivo)
  const lado = Math.min(img.width, img.height)
  const lienzo = Object.assign(document.createElement('canvas'), { width: 800, height: 800 })
  lienzo.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 800, 800)
  return new Promise((ok, mal) => lienzo.toBlob((b) => (b ? ok(b) : mal(new Error('sin imagen'))), 'image/jpeg', 0.85))
}

function Fila({ p, onGuardar, onFoto, onAviso }) {
  const [stockTxt, setStockTxt] = useState(String(p.stock))
  const [precioTxt, setPrecioTxt] = useState(String(p.precio_clp ?? ''))
  const [subiendo, setSubiendo] = useState(false)
  useEffect(() => setStockTxt(String(p.stock)), [p.stock])
  useEffect(() => setPrecioTxt(String(p.precio_clp ?? '')), [p.precio_clp])

  const guardarStock = () => {
    if (/^\d+$/.test(stockTxt.trim())) {
      const n = Number(stockTxt)
      setStockTxt(String(n))
      if (n !== p.stock) onGuardar(p, { stock: n })
    } else {
      setStockTxt(String(p.stock))
      onAviso('El stock debe ser un número entero, sin puntos ni comas.')
    }
  }
  const guardarPrecio = () => {
    const texto = precioTxt.replace(/[$\s]/g, '')
    const valido = /^(\d+|\d{1,3}(\.\d{3})+)$/.test(texto) // 2000 o 2.000
    const n = valido ? Number(texto.replaceAll('.', '')) : null
    if (texto ? !n : p.activo) {
      setPrecioTxt(String(p.precio_clp ?? ''))
      return onAviso(texto ? 'El precio debe ser un número mayor que cero, sin decimales.' : 'Oculta el producto antes de quitar el precio.')
    }
    setPrecioTxt(String(n ?? ''))
    if (n !== p.precio_clp) onGuardar(p, { precio_clp: n })
  }
  const elegirFoto = async (e) => {
    const [archivo] = e.target.files
    e.target.value = '' // permite volver a elegir el mismo archivo
    if (!archivo) return
    setSubiendo(true)
    await onFoto(p, archivo)
    setSubiendo(false)
  }
  const alEnter = (e) => e.key === 'Enter' && e.currentTarget.blur()

  return (
    <li className={`fila${p.activo ? '' : ' fila--oculta'}`}>
      <label className="fila__foto">
        {p.foto && <img src={urlFoto(p.foto)} alt="" width="64" height="64" loading="lazy" />}
        <span>{subiendo ? 'Subiendo…' : p.foto ? 'Cambiar foto' : 'Subir foto'}</span>
        <input type="file" accept="image/*" disabled={subiendo} onChange={elegirFoto} aria-label={`Foto de ${p.nombre}`} />
      </label>
      <div className="fila__nombre">
        <h3>{p.nombre}</h3>
        <p className="nota">{p.formato}</p>
        {p.precio_clp === null ? <p className="aviso">Falta el precio</p>
          : !p.activo ? <p className="aviso">Oculto</p>
            : p.stock === 0 && <p className="aviso">Agotado</p>}
      </div>
      <div className="paso" role="group" aria-label={`Stock de ${p.nombre}`}>
        <button type="button" disabled={p.stock === 0} onClick={() => onGuardar(p, { stock: p.stock - 1 })} aria-label={`Restar stock de ${p.nombre}`}>−</button>
        <input inputMode="numeric" value={stockTxt} aria-label={`Stock de ${p.nombre}`} onChange={(e) => setStockTxt(e.target.value)} onBlur={guardarStock} onKeyDown={alEnter} />
        <button type="button" onClick={() => onGuardar(p, { stock: p.stock + 1 })} aria-label={`Sumar stock de ${p.nombre}`}>+</button>
      </div>
      <label className="fila__precio">
        <span aria-hidden="true">$</span>
        <input inputMode="numeric" value={precioTxt} aria-label={`Precio de ${p.nombre}`} onChange={(e) => setPrecioTxt(e.target.value)} onBlur={guardarPrecio} onKeyDown={alEnter} />
      </label>
      <label className="fila__visible">
        <input type="checkbox" checked={p.activo} disabled={p.precio_clp === null} onChange={(e) => onGuardar(p, { activo: e.target.checked })} />
        <span>Visible</span>
      </label>
    </li>
  )
}

const FALLO = 'No se guardó el cambio'

function Panel() {
  const [guardadas, setGuardadas] = useState(null) // lo que está en la base
  const [pendientes, setPendientes] = useState([]) // cambios aún sin confirmar, en orden
  const [aviso, setAviso] = useState('')
  const cola = useRef(Promise.resolve())

  const cargar = async () => {
    const { data, error } = await supabase.from('productos').select('*').order('orden')
    if (error) return setAviso('No se pudo cargar la lista. Revisa tu conexión y recarga la página.')
    setGuardadas(data)
  }
  useEffect(() => { cargar() }, [])

  // Se ve lo guardado más lo pendiente: si un cambio falla, al sacarlo de pendientes vuelve el valor real.
  const aplicar = (fs, { id, cambios }) => fs.map((f) => (f.id === id ? { ...f, ...cambios } : f))
  const filas = guardadas && pendientes.reduce(aplicar, guardadas)

  // En orden: cada cambio espera al anterior, así el último toque es el que queda.
  const guardar = ({ id, nombre }, cambios) => {
    const cambio = { id, cambios }
    if (!pendientes.length) setAviso('')
    setPendientes((ps) => [...ps, cambio])
    cola.current = cola.current.then(async () => {
      // single(): sin permiso o con la sesión vencida RLS actualiza 0 filas sin dar error.
      const { error } = await supabase.from('productos').update(cambios).eq('id', id).select().single()
      setPendientes((ps) => ps.filter((c) => c !== cambio))
      if (error) {
        console.error(error)
        setAviso(`${FALLO} de ${nombre}. Inténtalo de nuevo.`)
        return false
      }
      setGuardadas((fs) => aplicar(fs, cambio))
      setAviso((a) => (a.startsWith(FALLO) ? a : 'Guardado')) // un acierto posterior no tapa la falla
      return true
    })
    return cola.current
  }

  const guardarFoto = async (p, archivo) => {
    setAviso('')
    let foto
    try { foto = await prepararFoto(archivo) } catch { return setAviso('No se pudo leer la imagen. Usa una foto JPG o PNG.') }
    const bucket = supabase.storage.from('fotos')
    const ruta = `${p.id}-${Date.now()}.jpg`
    const { error } = await bucket.upload(ruta, foto, { contentType: 'image/jpeg' })
    if (error) { console.error(error); return setAviso('No se pudo subir la foto. Inténtalo de nuevo.') }
    const guardada = await guardar(p, { foto: ruta })
    const sobrante = guardada ? p.foto : ruta
    if (sobrante) await bucket.remove([sobrante])
  }

  return (
    <>
      <header className="admin__cabeza">
        <h1>Stock y precios</h1>
        <a href="#">Ver carta</a>
        <button type="button" className="cerrar" onClick={() => supabase.auth.signOut()}>Salir</button>
      </header>
      {!filas && !aviso && <p>Cargando…</p>}
      {CATEGORIAS.map((c) => (
        <section key={c.id}>
          <h2>{c.nombre}</h2>
          <ul>{filas?.filter((f) => f.categoria === c.id).map((f) => <Fila key={f.id} p={f} onGuardar={guardar} onFoto={guardarFoto} onAviso={setAviso} />)}</ul>
        </section>
      ))}
      <p className="admin__aviso" role="status">{aviso}</p>
    </>
  )
}

export default function Admin() {
  const [sesion, setSesion] = useState(undefined) // undefined = revisando
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s))
    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <main className="admin">
      {sesion === undefined ? <p>Cargando…</p>
        : !sesion ? <Login />
          // Solo orienta: el permiso real lo exige RLS.
          : sesion.user.app_metadata.rol === 'admin' ? <Panel /> : (
            <div className="admin__login">
              <p>Esta cuenta no tiene permiso para editar la carta. Si te lo acaban de dar, sal y vuelve a entrar.</p>
              <button type="button" className="agregar" onClick={() => supabase.auth.signOut()}>Salir</button>
            </div>
          )}
    </main>
  )
}
