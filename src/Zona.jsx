import { useEffect, useState } from 'react'
import { limpiarCp } from '../lib/zona.js'

export default function Zona({ zona, onElegir, onCerrar }) {
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('')
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    const conEsc = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', conEsc)
    return () => document.removeEventListener('keydown', conEsc)
  }, [onCerrar])

  const buscar = async (e) => {
    e.preventDefault()
    const cp = limpiarCp(texto)
    setResultado(null)
    if (!cp) return setEstado('El código postal tiene 4 números, por ejemplo 1686.')
    setEstado('Buscando…')
    try {
      const r = await fetch(`/api/localidad?cp=${cp}`)
      if (r.status === 404) return setEstado(`No encontramos el código postal ${cp}. Revisá los números.`)
      if (!r.ok) throw new Error()
      setResultado(await r.json())
      setEstado('')
    } catch {
      setEstado('No pudimos consultar el código postal. Probá de nuevo en un rato.')
    }
  }

  return (
    <div className="capa" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <section className="zona" role="dialog" aria-modal="true" aria-labelledby="zona-titulo">
        <button type="button" className="zona-cerrar" onClick={onCerrar} aria-label="Cerrar">
          ×
        </button>
        <h2 id="zona-titulo">¿Dónde hacés las compras?</h2>
        <p>Ahora estás viendo precios de <strong>{zona.localidad}</strong> (CP {zona.cp}).</p>
        <form onSubmit={buscar} className="zona-form">
          <input
            inputMode="numeric"
            autoComplete="postal-code"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: 1686"
            aria-label="Tu código postal"
            maxLength={8}
            autoFocus
          />
          <button type="submit">Ver localidades</button>
        </form>
        {estado && <p className="zona-estado" aria-live="polite">{estado}</p>}
        {resultado && (
          <>
            <p>Elegí tu localidad ({resultado.provincia}):</p>
            <div className="zona-opciones">
              {resultado.localidades.map((l) => (
                <button key={l} type="button" onClick={() => onElegir({ cp: resultado.cp, localidad: l })}>
                  {l}
                </button>
              ))}
            </div>
          </>
        )}
        <p className="zona-nota">Día, ChangoMás y Carrefour muestran los precios de tu zona. Jumbo y Coto muestran su precio general.</p>
      </section>
    </div>
  )
}
