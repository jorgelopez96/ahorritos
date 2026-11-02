import { CADENAS } from '../lib/cadenas.js'
import { cantidadDe } from './lista.js'
import { plata } from './plata.js'

export default function Tarjeta({ tarjeta, lista, onAgregar }) {
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
              <button
                type="button"
                className={enLista ? 'agregar en-lista' : 'agregar'}
                onClick={() => onAgregar(o)}
                aria-label={`Agregar a la lista de ${CADENAS[o.cadena].nombre}${enLista ? ` (ya hay ${enLista})` : ''}`}
              >
                {enLista ? `${enLista} ✓` : '+'}
              </button>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
