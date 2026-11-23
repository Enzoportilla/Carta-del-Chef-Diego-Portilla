import { useEffect, useRef, useState } from 'react'
import { supabase, urlFoto } from './supabase.js'
import { CATEGORIAS } from './data.js'
import { idDesdeNombre, idLibre, leerPrecio, leerStock, nombreRepetido } from './producto.js'

const ERRORES_LOGIN = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Esta cuenta aún no está confirmada. Confírmala en Supabase.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
}

const STOCK_MALO = 'El stock debe ser un número entero, sin puntos ni comas.'
const NOMBRE_MALO = 'Escribe un nombre con letras o números.'
const NOMBRE_REPETIDO = 'Ya existe un producto con ese nombre.'
const PRECIO_MALO = 'El precio debe ser un número mayor que cero, sin decimales.'

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

function Fila({ p, repetido, onGuardar, onFoto, onAviso }) {
  const [nombreTxt, setNombreTxt] = useState(p.nombre)
  const [formatoTxt, setFormatoTxt] = useState(p.formato ?? '')
  const [stockTxt, setStockTxt] = useState(String(p.stock))
  const [precioTxt, setPrecioTxt] = useState(String(p.precio_clp ?? ''))
  const [subiendo, setSubiendo] = useState(false)
  useEffect(() => setNombreTxt(p.nombre), [p.nombre])
  useEffect(() => setFormatoTxt(p.formato ?? ''), [p.formato])
  useEffect(() => setStockTxt(String(p.stock)), [p.stock])
  useEffect(() => setPrecioTxt(String(p.precio_clp ?? '')), [p.precio_clp])

  const guardarNombre = () => {
    const nombre = nombreTxt.trim()
    const problema = !idDesdeNombre(nombre) ? NOMBRE_MALO : repetido(nombre, p.id) && NOMBRE_REPETIDO
    setNombreTxt(problema ? p.nombre : nombre)
    if (problema) onAviso(problema)
    else if (nombre !== p.nombre) onGuardar(p, { nombre })
  }
  const guardarFormato = () => {
    const formato = formatoTxt.trim() || null
    setFormatoTxt(formato ?? '')
    if (formato !== p.formato) onGuardar(p, { formato })
  }
  const guardarStock = () => {
    const n = leerStock(stockTxt)
    setStockTxt(String(n ?? p.stock))
    if (n === undefined) onAviso(STOCK_MALO)
    else if (n !== p.stock) onGuardar(p, { stock: n })
  }
  const guardarPrecio = () => {
    const n = leerPrecio(precioTxt)
    if (n === undefined || (n === null && p.activo)) {
      setPrecioTxt(String(p.precio_clp ?? ''))
      return onAviso(n === undefined ? PRECIO_MALO : 'Oculta el producto antes de quitar el precio.')
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
        <input className="fila__titulo" value={nombreTxt} maxLength={60} aria-label={`Nombre de ${p.nombre}`} onChange={(e) => setNombreTxt(e.target.value)} onBlur={guardarNombre} onKeyDown={alEnter} />
        <input value={formatoTxt} maxLength={60} placeholder="Agregar formato" aria-label={`Formato de ${p.nombre}`} onChange={(e) => setFormatoTxt(e.target.value)} onBlur={guardarFormato} onKeyDown={alEnter} />
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

function Nuevo({ repetido, onAgregar, onAviso }) {
  const plegable = useRef(null)
  const ocupado = useRef(false) // el estado llega tarde para frenar un doble toque
  const [agregando, setAgregando] = useState(false)

  const agregar = async (e) => {
    e.preventDefault()
    if (ocupado.current) return
    const form = e.currentTarget
    const d = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, v.trim()]))
    const id = idDesdeNombre(d.nombre)
    const precio_clp = leerPrecio(d.precio)
    const stock = leerStock(d.stock)
    if (!id) return onAviso(NOMBRE_MALO)
    if (repetido(d.nombre)) return onAviso(NOMBRE_REPETIDO)
    if (precio_clp === undefined) return onAviso(PRECIO_MALO)
    if (stock === undefined) return onAviso(STOCK_MALO)
    ocupado.current = true; setAgregando(true)
    const agregado = await onAgregar({
      id, categoria: d.categoria, nombre: d.nombre, formato: d.formato || null, descripcion: d.descripcion || null,
      precio_clp, stock, activo: precio_clp !== null,
    })
    ocupado.current = false; setAgregando(false)
    if (agregado) { form.reset(); plegable.current.open = false }
  }

  return (
    <details className="nuevo" ref={plegable}>
      <summary>Agregar producto</summary>
      <form onSubmit={agregar}>
        <label className="campo"><span>Nombre</span><input name="nombre" required maxLength={60} /></label>
        <label className="campo"><span>Categoría</span>
          <select name="categoria">{CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
        </label>
        <label className="campo"><span>Formato (opcional)</span><input name="formato" maxLength={60} placeholder="5 unidades de 70 g" /></label>
        <div className="campos-dos">
          <label className="campo"><span>Precio</span><input name="precio" inputMode="numeric" placeholder="2000" /></label>
          <label className="campo"><span>Stock</span><input name="stock" inputMode="numeric" required /></label>
        </div>
        <label className="campo"><span>Descripción (opcional)</span><textarea name="descripcion" rows={2} maxLength={300} /></label>
        <p className="nota">Con precio aparece de inmediato en la carta. Sin precio queda oculto. La foto se sube después, en la lista.</p>
        <button type="submit" className="enviar" disabled={agregando}>{agregando ? 'Agregando…' : 'Agregar producto'}</button>
      </form>
    </details>
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

  const repetido = (nombre, idPropio) => nombreRepetido(nombre, filas, idPropio)

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

  const agregar = async (producto) => {
    setAviso('')
    const orden = Math.max(0, ...guardadas.map((f) => f.orden)) + 10 // al final de su categoría
    const { data, error } = await supabase.from('productos').insert({ ...producto, id: idLibre(producto.id, guardadas.map((f) => f.id)), orden }).select().single()
    if (error) {
      console.error(error)
      setAviso({
        23505: NOMBRE_REPETIDO,
        42501: 'Falta el permiso en Supabase para agregar productos, o venció la sesión. Sal y vuelve a entrar.',
      }[error.code] ?? 'No se pudo agregar el producto. Inténtalo de nuevo.')
      return false
    }
    setGuardadas((fs) => [...fs, data])
    setAviso(`Se agregó ${data.nombre}.`)
    return true
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
      {filas && <Nuevo repetido={repetido} onAgregar={agregar} onAviso={setAviso} />}
      {CATEGORIAS.map((c) => (
        <section key={c.id}>
          <h2>{c.nombre}</h2>
          <ul>{filas?.filter((f) => f.categoria === c.id).map((f) => <Fila key={f.id} p={f} repetido={repetido} onGuardar={guardar} onFoto={guardarFoto} onAviso={setAviso} />)}</ul>
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
