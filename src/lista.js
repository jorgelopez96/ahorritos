import { plata } from './plata.js'

// Lista de compras: { [cadena]: [{ clave, nombre, imagen, url, precio, cantidad, tachado }] }
// El precio queda como estaba al agregar; cada súper tiene su propia lista.

const claveDe = (oferta) => oferta.ean ?? oferta.url

const conItems = (lista, cadena, items) => {
  const { [cadena]: _, ...resto } = lista
  return items.length ? { ...resto, [cadena]: items } : resto
}

export const agregar = (lista, oferta, nombre) => {
  const items = lista[oferta.cadena] ?? []
  const clave = claveDe(oferta)
  const existe = items.some((i) => i.clave === clave)
  return {
    ...lista,
    [oferta.cadena]: existe
      ? items.map((i) => (i.clave === clave ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...items, { clave, nombre, imagen: oferta.imagen, url: oferta.url, precio: oferta.precio, cantidad: 1, tachado: false }],
  }
}

export const cambiarCantidad = (lista, cadena, clave, delta) =>
  conItems(lista, cadena, (lista[cadena] ?? [])
    .map((i) => (i.clave === clave ? { ...i, cantidad: i.cantidad + delta } : i))
    .filter((i) => i.cantidad > 0))

export const alternarTachado = (lista, cadena, clave) =>
  conItems(lista, cadena, (lista[cadena] ?? []).map((i) => (i.clave === clave ? { ...i, tachado: !i.tachado } : i)))

export const vaciar = (lista, cadena) => conItems(lista, cadena, [])

export const total = (items) => items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)

export const cantidadDe = (lista, oferta) => lista[oferta.cadena]?.find((i) => i.clave === claveDe(oferta))?.cantidad ?? 0

export const contar = (lista) => Object.values(lista).reduce((n, items) => n + items.length, 0)

const valido = (i) => i && typeof i.clave === 'string' && typeof i.nombre === 'string' && i.precio > 0 && i.cantidad > 0

export const leer = (texto) => {
  try {
    const datos = JSON.parse(texto)
    return Object.fromEntries(
      Object.entries(datos ?? {})
        .map(([cadena, items]) => [cadena, Array.isArray(items) ? items.filter(valido) : []])
        .filter(([, items]) => items.length),
    )
  } catch {
    return {}
  }
}

export const textoParaCompartir = (nombreCadena, items) =>
  [
    `Compras en ${nombreCadena}`,
    ...items.map((i) => `• ${i.cantidad > 1 ? `${i.cantidad} × ` : ''}${i.nombre}: ${plata(i.precio * i.cantidad)}`),
    `Total: ${plata(total(items))}`,
  ].join('\n')
