import { useEffect, useRef, useState } from 'react'
import { CADENAS } from '../lib/cadenas.js'
import { agrupar } from './agrupar.js'
import { leerZona } from '../lib/zona.js'
import { agregar, contar, leer } from './lista.js'
import Tarjeta from './Tarjeta.jsx'
import Lista from './Lista.jsx'
import Zona from './Zona.jsx'

const IDS = Object.keys(CADENAS)
const GUARDADO = 'ahorritos-lista'
const GUARDADO_ZONA = 'ahorritos-zona'

export default function App() {
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [ofertas, setOfertas] = useState([])
  const [estados, setEstados] = useState({})
  const [lista, setLista] = useState(() => leer(localStorage.getItem(GUARDADO)))
  const [viendoLista, setViendoLista] = useState(false)
  const [zona, setZona] = useState(() => leerZona(localStorage.getItem(GUARDADO_ZONA)))
  const [eligiendoZona, setEligiendoZona] = useState(false)
  const numero = useRef(0)

  useEffect(() => {
    localStorage.setItem(GUARDADO, JSON.stringify(lista))
  }, [lista])

  const elegirZona = (z) => {
    setZona(z)
    localStorage.setItem(GUARDADO_ZONA, JSON.stringify(z))
    setEligiendoZona(false)
    if (busqueda) lanzar(busqueda, z.cp)
  }

  const buscar = (e) => {
    e.preventDefault()
    const q = texto.trim()
    if (q.length < 2) return
    document.activeElement?.blur() // baja el teclado para que se vean los resultados
    setEligiendoZona(false)
    lanzar(q, zona.cp)
  }

  const lanzar = (q, cp) => {
    const n = ++numero.current
    setBusqueda(q)
    setOfertas([])
    setEstados(Object.fromEntries(IDS.map((id) => [id, 'cargando'])))
    for (const id of IDS) {
      fetch(`/api/buscar?cadena=${id}&q=${encodeURIComponent(q)}&cp=${cp}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          if (n !== numero.current) return
          setOfertas((prev) => [...prev, ...d.ofertas])
          setEstados((prev) => ({ ...prev, [id]: 'listo' }))
        })
        .catch(() => n === numero.current && setEstados((prev) => ({ ...prev, [id]: 'error' })))
    }
  }

  const tarjetas = busqueda ? agrupar(ofertas, busqueda) : []
  const terminado = busqueda && IDS.every((id) => estados[id] !== 'cargando')
  const sinConexion = busqueda && IDS.every((id) => estados[id] === 'error')

  return (
    <>
      <header className="arriba">
        <div className="titulo">
          <h1>Ahorritos</h1>
          <button type="button" className="boton-lista" onClick={() => setViendoLista(!viendoLista)}>
            {viendoLista ? (
              '← Volver a buscar'
            ) : (
              <>
                <svg className="icono-anotador" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="4" width="16" height="18" rx="2" />
                  <path d="M8 2v4M12 2v4M16 2v4M8 11h8M8 15h8M8 19h5" />
                </svg>
                Mi lista ({contar(lista)})
              </>
            )}
          </button>
        </div>
        {!viendoLista && (
          <>
            <form className="buscador" onSubmit={buscar} role="search">
              <input
                type="search"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="¿Qué estás buscando? Ej: leche, aceite, fideos"
                aria-label="Producto a buscar"
                enterKeyHint="search"
              />
              <button type="submit">Buscar</button>
            </form>
            <button type="button" className="boton-zona" onClick={() => setEligiendoZona(!eligiendoZona)} aria-expanded={eligiendoZona}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              Precios de {zona.localidad}
              <span>{eligiendoZona ? 'Cerrar' : 'Cambiar'}</span>
            </button>
          </>
        )}
        {!viendoLista && busqueda && (
          <ul className="estados" aria-live="polite">
            {IDS.map((id) => (
              <li key={id} className={estados[id]}>
                <img src={CADENAS[id].logo} alt="" />
                {CADENAS[id].nombre}
                <span>{estados[id] === 'cargando' ? '…' : estados[id] === 'error' ? 'no respondió' : '✓'}</span>
              </li>
            ))}
          </ul>
        )}
      </header>

      {viendoLista ? (
        <main>
          <Lista lista={lista} setLista={setLista} />
        </main>
      ) : (
        <main>
          {eligiendoZona && <Zona zona={zona} onElegir={elegirZona} />}
          {!busqueda && <p className="vacio">Escribí un producto y te mostramos en qué super sale más barato.</p>}
          {busqueda && !terminado && tarjetas.length === 0 && <p className="vacio">Buscando precios…</p>}
          {tarjetas.map((t) => (
            <Tarjeta key={t.clave} tarjeta={t} lista={lista} onAgregar={(o) => setLista((l) => agregar(l, o, t.nombre))} />
          ))}
          {sinConexion && <p className="vacio">No pudimos conectarnos con los supermercados. Revisá tu conexión y probá de nuevo.</p>}
          {terminado && !sinConexion && tarjetas.length === 0 && (
            <p className="vacio">No encontramos «{busqueda}». Probá con menos palabras o con otra marca.</p>
          )}
        </main>
      )}

      <footer>
        Precios de las tiendas online, zona {zona.localidad} (CP {zona.cp}). Jumbo y Coto muestran su precio general. En el local pueden
        variar.
      </footer>
    </>
  )
}
