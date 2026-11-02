import { CADENAS } from '../lib/cadenas.js'
import { cantidadDe } from './lista.js'
import { plata } from './plata.js'
import { linkPedidosYa, linkRappi } from './delivery.js'

const esAndroid = /Android/i.test(navigator.userAgent)

const Tachito = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
)

export default function Tarjeta({ tarjeta, lista, onAgregar, onCambiar }) {
  return (
    <article className="tarjeta">
      <div className="producto">
        {tarjeta.imagen ? <img src={tarjeta.imagen} alt="" loading="lazy" /> : <div className="sin-foto" />}
        <h2>{tarjeta.nombre}</h2>
      </div>
      <ul className="precios">
        {tarjeta.ofertas.map((o) => {
          const mejor = tarjeta.ofertas.length > 1 && o.precio === tarjeta.minimo
          const enLista = cantidadDe(lista, o)
          return (
            <li key={o.cadena + o.url} className={mejor ? 'mejor' : ''}>
              <a href={o.url} target="_blank" rel="noopener noreferrer">
                <img src={CADENAS[o.cadena].logo} alt="" />
                <span className="cadena">
                  {CADENAS[o.cadena].nombre}
                  {o.precioLista && <s>antes {plata(o.precioLista)}</s>}
                </span>
                <span className="monto">
                  {mejor && <span className="etiqueta">Más barato</span>}
                  {plata(o.precio)}
                </span>
              </a>
              {!enLista && (
                <button type="button" className="agregar" onClick={() => onAgregar(o)} aria-label={`Agregar a la lista de ${CADENAS[o.cadena].nombre}`}>
                  +
                </button>
              )}
              {enLista > 0 && (
                <div className="en-lista">
                  <span>En tu lista</span>
                  <div className="cantidad">
                    <button type="button" onClick={() => onCambiar(o, -1)} aria-label={enLista === 1 ? 'Sacar de la lista' : 'Sacar uno'}>
                      {enLista === 1 ? <Tachito /> : '−'}
                    </button>
                    <span aria-label="cantidad">{enLista}</span>
                    <button type="button" onClick={() => onAgregar(o)} aria-label="Sumar uno">
                      +
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <div className="pedir">
        <a href={linkRappi(tarjeta.nombre)} target="_blank" rel="noopener noreferrer">
          <img src="/logos/rappi.png" alt="" />
          Ver en Rappi
        </a>
        {/* Sin ubicación en el link: PedidosYa usa la dirección que cada uno tiene guardada */}
        <a href={linkPedidosYa(tarjeta.nombre, esAndroid)} {...(esAndroid ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
          <img src="/logos/pedidosya.png" alt="" />
          Ver en PedidosYa
        </a>
      </div>
    </article>
  )
}
