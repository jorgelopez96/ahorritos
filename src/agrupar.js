import { coincide } from '../lib/texto.js'

const limpio = (s) => s.replace(/\s+/g, ' ').trim()

export const agrupar = (ofertas, q) => {
  const relevantes = ofertas.filter((o) => coincide(`${o.nombre} ${o.marca}`, q))
  const tarjetas = new Map()
  for (const o of relevantes.length ? relevantes : ofertas) {
    const clave = o.ean ?? `${o.cadena}:${o.url}`
    if (!tarjetas.has(clave)) tarjetas.set(clave, [])
    tarjetas.get(clave).push(o)
  }
  return [...tarjetas].map(([clave, lista]) => {
    lista.sort((a, b) => a.precio - b.precio)
    const nombres = lista.map((o) => limpio(o.nombre))
    return {
      clave,
      nombre: nombres.reduce((a, b) => (b.length > a.length ? b : a)),
      imagen: lista.find((o) => o.imagen)?.imagen ?? null,
      ofertas: lista,
      minimo: lista[0].precio,
    }
  }).sort((a, b) => a.minimo - b.minimo)
}
