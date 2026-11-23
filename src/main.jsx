import { lazy, StrictMode, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

const Admin = lazy(() => import('./Admin.jsx'))

// GitHub Pages no reescribe rutas: el panel vive en un hash. Los demás hash son anclas de la carta.
function Raiz() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const alCambiar = () => setHash(location.hash)
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])
  return hash === '#/admin' ? <Suspense fallback={null}><Admin /></Suspense> : <App />
}

createRoot(document.getElementById('root')).render(<StrictMode><Raiz /></StrictMode>)
