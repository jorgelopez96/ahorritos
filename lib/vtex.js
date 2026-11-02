import { CODIGO_POSTAL, HEADERS } from './cadenas.js'
import { esExcluido } from './texto.js'

export const parseVtex = (json, cadena) =>
  (json.products ?? []).flatMap((p) => {
    const item = p.items?.[0]
    const oferta = item?.sellers?.[0]?.commertialOffer
    if (!oferta || !p.productName || !(oferta.Price > 0) || !(oferta.AvailableQuantity > 0) || esExcluido(p.categories ?? [])) return []
    return [{
      cadena: cadena.id,
      ean: item.ean || null,
      nombre: p.productName,
      marca: p.brand ?? '',
      precio: oferta.Price,
      // Jumbo a veces manda ListPrice multiplicado por 100: más del doble no se muestra.
      precioLista: oferta.ListPrice > oferta.Price && oferta.ListPrice <= oferta.Price * 2 ? oferta.ListPrice : null,
      imagen: item.images?.[0]?.imageUrl ?? null,
      url: `${cadena.base}/${p.linkText}/p`,
    }]
  })

const regiones = {}

const region = (cadena, cp, signal) => {
  if (!cadena.region) return null
  const clave = `${cadena.id}:${cp}`
  regiones[clave] ??= fetch(`${cadena.base}/api/checkout/pub/regions?country=ARG&postalCode=${cp}`, { headers: HEADERS, signal })
    .then((r) => r.json())
    .then((d) => d[0]?.id ?? Promise.reject())
    .catch(() => {
      delete regiones[clave] // se reintenta en la próxima búsqueda
      return null
    })
  return regiones[clave]
}

const pedir = async (url, cadena, signal) => {
  const r = await fetch(url, { headers: HEADERS, signal })
  if (!r.ok) throw new Error(`${cadena.id}: HTTP ${r.status}`)
  return r.json()
}

export const buscarVtex = async (cadena, q, cp = CODIGO_POSTAL) => {
  const signal = AbortSignal.timeout(6000) // un solo corte para región + búsqueda + respaldo
  const id = await region(cadena, cp, signal)
  const json = await pedir(`${cadena.base}/api/io/_v/api/intelligent-search/product_search/?query=${encodeURIComponent(q)}&count=24${id ? `&regionId=${id}` : ''}`, cadena, signal)
  if (json.products?.length) return parseVtex(json, cadena)
  // Ante palabras genéricas ("cafe") Carrefour redirige a una categoría y no manda productos.
  const clasico = await pedir(`${cadena.base}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=23`, cadena, signal)
  return parseVtex({ products: clasico }, cadena)
}
