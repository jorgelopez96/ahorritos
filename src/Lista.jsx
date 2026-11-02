import { useState } from 'react'
import { CADENAS } from '../lib/cadenas.js'
import { alternarTachado, cambiarCantidad, textoParaCompartir, total, vaciar } from './lista.js'
import { plata } from './plata.js'

// En el celular abre el menú de compartir (WhatsApp, etc.); si no hay, copia al portapapeles.
const compartir = async (texto) => {
  if (navigator.share) {
    try {
      await navigator.share({ text: texto })
      return null
    } catch (e) {
      if (e.name === 'AbortError') return null
    }
  }
  await navigator.clipboard.writeText(texto)
  return 'copiado'
}

export default function Lista({ lista, setLista }) {
  const [borrando, setBorrando] = useState(null)
  const [copiado, setCopiado] = useState(null)
  const cadenas = Object.keys(CADENAS).filter((id) => lista[id])

  if (!cadenas.length) {
    return <p className="vacio">Tu lista está vacía. Buscá un producto y tocá + al lado del super donde lo vas a comprar.</p>
  }

  return (
    <>
      <p className="ayuda">Tocá un producto para tacharlo cuando lo pongas en el changuito.</p>
      {cadenas.map((id) => {
        const items = lista[id]
        const faltan = items.filter((i) => !i.tachado)
        return (
          <section key={id} className="tarjeta lista">
            <h2 className="lista-titulo">
              <img src={CADENAS[id].logo} alt="" />
              {CADENAS[id].nombre}
            </h2>
            <ul>
              {items.map((i) => (
                <li key={i.clave} className={i.tachado ? 'tachado' : ''}>
                  <button type="button" className="item" aria-pressed={i.tachado} onClick={() => setLista((l) => alternarTachado(l, id, i.clave))}>
                    <span className="item-nombre">{i.nombre}</span>
                    <span className="item-precio">
                      {i.cantidad > 1 && `${i.cantidad} × ${plata(i.precio)} = `}
                      {plata(i.precio * i.cantidad)}
                    </span>
                  </button>
                  <div className="cantidad">
                    <button type="button" aria-label={`Sacar uno de ${i.nombre}`} onClick={() => setLista((l) => cambiarCantidad(l, id, i.clave, -1))}>−</button>
                    <span aria-label="cantidad">{i.cantidad}</span>
                    <button type="button" aria-label={`Sumar uno de ${i.nombre}`} onClick={() => setLista((l) => cambiarCantidad(l, id, i.clave, 1))}>+</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="lista-total">
              <span>Total</span>
              <strong>{plata(total(items))}</strong>
            </div>
            {faltan.length > 0 && faltan.length < items.length && (
              <p className="lista-falta">Te falta agarrar {faltan.length}: {plata(total(faltan))}</p>
            )}
            <button
              type="button"
              className="compartir"
              onClick={async () => {
                const r = await compartir(textoParaCompartir(CADENAS[id].nombre, items)).catch(() => null)
                setCopiado(r ? id : null)
              }}
            >
              {copiado === id ? '¡Copiado! Pegalo donde quieras' : `Compartir lista de ${CADENAS[id].nombre}`}
            </button>
            <button
              type="button"
              className="borrar"
              onClick={() => {
                if (borrando !== id) return setBorrando(id)
                setLista((l) => vaciar(l, id))
                setBorrando(null)
              }}
            >
              {borrando === id ? `¿Seguro? Tocá de nuevo para borrar la lista de ${CADENAS[id].nombre}` : `Borrar lista de ${CADENAS[id].nombre}`}
            </button>
          </section>
        )
      })}
      <p className="ayuda">Precios al momento de agregar cada producto. Se guarda solo en este celular.</p>
    </>
  )
}
