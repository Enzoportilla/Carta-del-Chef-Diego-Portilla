import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIAS, NEGOCIO } from './data.js'
import { supabase, urlFoto } from './supabase.js'
import { cambiar, precio, resumen } from './cart.js'
import { guardar, leer } from './almacen.js'
import Paso from './Paso.jsx'

const CLAVE = 'chef-diego-pedido'

// Perfiles de cerro (100 × 40) y altura de su cumbre; empiezan y terminan a la misma altura para unirse entre sí.
const CERROS = [
  { cumbre: 8, perfil: 'M0 38L22 27L30 30L50 8L63 22L70 18L100 38', nieve: 'M50 8L41.8 17L46 15.5L49 19L53 15L58.4 17Z' },
  { cumbre: 13, perfil: 'M0 38L30 24L36 26L50 13L74 30L80 27L100 38', nieve: 'M50 13L42.5 20L47 18.5L51 22L55 18L59.9 20Z' },
  { cumbre: 5, perfil: 'M0 38L18 30L34 14L39 18L50 5L72 26L80 24L100 38', nieve: 'M50 5L42.4 14L46 12.5L50 17L54 12L59.4 14Z' },
]

function Cordillera({ categorias, activa }) {
  const nav = useRef(null)
  const [estrella, setEstrella] = useState(null)

  useLayoutEffect(() => {
    const ubicar = () => {
      const a = nav.current.querySelector('[aria-current]')
      if (!a) return
      const i = categorias.findIndex((c) => c.id === activa)
      setEstrella({ x: a.offsetLeft + a.offsetWidth / 2, y: CERROS[i % CERROS.length].cumbre / 40 })
      // Mueve solo la barra: scrollIntoView también desplazaría la página.
      nav.current.scrollTo({ left: a.offsetLeft - (nav.current.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' })
    }
    const ro = new ResizeObserver(ubicar)
    ro.observe(nav.current)
    for (const a of nav.current.querySelectorAll('a')) ro.observe(a) // el ancho cambia al llegar la tipografía
    return () => ro.disconnect()
  }, [categorias, activa])

  return (
    <nav className="cordillera" aria-label="Categorías" ref={nav}>
      {categorias.map((c, i) => (
        <a key={c.id} href={`#${c.id}`} aria-current={c.id === activa ? 'true' : undefined}>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <path d={CERROS[i % CERROS.length].perfil} />
            <path className="nieve" d={CERROS[i % CERROS.length].nieve} />
          </svg>
          {c.nombre}
        </a>
      ))}
      {estrella && (
        <svg className="estrella" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `translate(${estrella.x}px, calc(${estrella.y} * var(--alto-cerro)))` }}>
          <path d="M12 2l2.9 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8l-6.5 3.9 1.8-7.3L1.6 9.5l7.5-.6z" />
        </svg>
      )}
    </nav>
  )
}

function Producto({ producto, cantidad, onCambiar }) {
  const agotado = producto.stock <= 0
  return (
    <li className={`producto${agotado ? ' producto--agotado' : ''}`}>
      {producto.foto && (
        <img className="producto__foto" src={urlFoto(producto.foto)} alt="" width="88" height="88" loading="lazy"
          onError={(e) => { e.currentTarget.hidden = true }} />
      )}
      <div className="producto__cuerpo">
        <div className="renglon">
          <h3>{producto.nombre}</h3>
          <span className="puntos" aria-hidden="true" />
          <p className="precio">{precio(producto.precio_clp)}</p>
        </div>
        {producto.descripcion && <p className="producto__desc">{producto.descripcion}</p>}
        <div className="producto__pie">
          <p>{producto.formato}</p>
          {agotado ? <p className="agotado">Agotado</p>
            : cantidad ? <Paso producto={producto} cantidad={cantidad} onCambiar={onCambiar} />
              : <button type="button" className="agregar" aria-label={`Agregar ${producto.nombre}`} onClick={() => onCambiar(producto, 1)}>Agregar</button>}
        </div>
      </div>
    </li>
  )
}

export default function App() {
  const [carrito, setCarrito] = useState(() => leer(CLAVE) ?? {})
  const [productos, setProductos] = useState(null) // null = cargando
  const [error, setError] = useState(false)
  const [activa, setActiva] = useState(null)
  const [abierto, setAbierto] = useState(false)
  const [aviso, setAviso] = useState('')
  useEffect(() => guardar(CLAVE, carrito), [carrito])

  const cargar = async () => {
    setError(false)
    const { data, error } = await supabase.from('productos').select('*').eq('activo', true).order('orden')
    if (error) { console.error(error); setError(true); return }
    setProductos(data)
  }
  useEffect(() => { cargar() }, [])

  const categorias = useMemo(() => CATEGORIAS.filter((c) => productos?.some((p) => p.categoria === c.id)), [productos])
  // Mientras no hay productos el pedido guardado no se toca ni se da por agotado.
  const res = useMemo(() => resumen(productos ? carrito : {}, productos ?? []), [carrito, productos])
  const cantidades = Object.fromEntries(res.lineas.map((l) => [l.producto.id, l.cantidad]))
  const hayPedido = res.lineas.length > 0 || res.ajustado

  const onCambiar = (producto, delta) => {
    setCarrito((c) => cambiar(c, producto, delta))
    setAviso(`${delta > 0 ? 'Agregaste' : 'Quitaste'} ${producto.nombre}`)
  }

  useEffect(() => {
    if (!categorias.length) return
    // Activa = la última sección cuyo inicio ya pasó el 45% de la pantalla.
    const revisar = () => {
      const pasadas = categorias.filter((c) => document.getElementById(c.id).getBoundingClientRect().top < window.innerHeight * 0.45)
      setActiva((pasadas.at(-1) ?? categorias[0]).id)
    }
    revisar()
    window.addEventListener('scroll', revisar, { passive: true })
    return () => window.removeEventListener('scroll', revisar)
  }, [categorias])

  return (
    <>
      <header className="portada">
        <h1><img src={`${import.meta.env.BASE_URL}img/logo-chef-diego-portilla.png`} alt={NEGOCIO.nombre} width="641" height="394" /></h1>
        <p>Panes, dulces y masas hechos por el chef. Arma tu pedido y envíalo por WhatsApp.</p>
      </header>

      {categorias.length > 0 && <Cordillera categorias={categorias} activa={activa} />}

      <main className="carta">
        {error && (
          <div className="estado" role="alert">
            <p>No pudimos cargar la carta. Revisa tu conexión a internet.</p>
            <button type="button" className="agregar" onClick={cargar}>Reintentar</button>
          </div>
        )}
        {!error && !productos && <p className="estado" role="status">Cargando la carta…</p>}
        {productos?.length === 0 && <p className="estado">Por ahora no hay productos en la carta.</p>}
        {categorias.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-titulo`}>
            <h2 id={`${c.id}-titulo`}>{c.nombre}</h2>
            <ul className="lista">
              {productos.filter((p) => p.categoria === c.id).map((p) => (
                <Producto key={p.id} producto={p} cantidad={cantidades[p.id]} onCambiar={onCambiar} />
              ))}
            </ul>
          </section>
        ))}
      </main>

      {(NEGOCIO.retiro || NEGOCIO.whatsapp) && (
        <footer className="pie">
          {NEGOCIO.retiro && <p>Retiro: {NEGOCIO.retiro}</p>}
          {NEGOCIO.whatsapp && <p><a href={`https://wa.me/${NEGOCIO.whatsapp}`}>Escribir por WhatsApp</a></p>}
        </footer>
      )}

      {hayPedido && (
        <div className="barra">
          <button type="button" onClick={() => setAbierto(true)}>
            <span>Ver mi pedido</span>
            <span className="barra__cuenta">{res.unidades}</span>
            <span className="barra__total">{precio(res.total)}</span>
          </button>
        </div>
      )}
      <p className="solo-lector" aria-live="polite">{aviso}</p>
    </>
  )
}
