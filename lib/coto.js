import { CADENAS, HEADERS } from './cadenas.js'
import { esExcluido } from './texto.js'

const registros = (o, out = []) => {
  if (Array.isArray(o)) o.forEach((v) => registros(v, out))
  else if (o && typeof o === 'object') {
    if ('product.eanPrincipal' in o) out.push(o)
    else Object.values(o).forEach((v) => registros(v, out))
  }
  return out
}

// Rebaja directa ("20%Dto"). Las que piden "Llevando N" (6x4, 50% 2da) no cuentan.
const rebajaDirecta = (descuentos) => {
  try {
    const d = JSON.parse(descuentos).find((x) => !x.textoLlevando && /%\s*dto/i.test(x.textoDescuento))
    return d ? parseFloat(d.precioDesc) : null
  } catch {
    return null
  }
}

export const parseCoto = (json) => {
  const porEan = new Map()
  for (const r of registros(json)) {
    const v = (k) => r[k]?.[0]
    const contado = parseFloat(v('sku.activePrice'))
    const rebaja = rebajaDirecta(v('product.dtoDescuentos'))
    const precio = rebaja > 0 && rebaja < contado ? rebaja : contado
    const ean = v('product.eanPrincipal') || null
    if (!(precio > 0) || !v('product.displayName') || esExcluido(r['allAncestors.displayName'] ?? [])) continue
    const oferta = {
      cadena: 'coto',
      ean,
      nombre: v('product.displayName'),
      marca: v('product.brand') ?? '',
      precio,
      precioLista: contado > precio ? contado : null,
      imagen: v('product.mediumImage.url') ?? null,
      url: `https://www.cotodigital.com.ar/sitios/cdigi/categoria?Ntt=${encodeURIComponent(ean ?? v('product.displayName'))}`,
    }
    const clave = ean ?? oferta.nombre
    if (!porEan.has(clave) || porEan.get(clave).precio > precio) porEan.set(clave, oferta)
  }
  return [...porEan.values()]
}

// Coto no deja elegir sucursal ni informa stock de forma legible: precio por defecto.
export const buscarCoto = async (q) => {
  const r = await fetch(`${CADENAS.coto.base}/sitios/cdigi/categoria?Ntt=${encodeURIComponent(q)}&format=json`, { headers: HEADERS, signal: AbortSignal.timeout(6000) })
  if (!r.ok) throw new Error(`coto: HTTP ${r.status}`)
  return parseCoto(await r.json())
}
