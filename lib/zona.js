import { CADENAS, CODIGO_POSTAL, HEADERS } from './cadenas.js'

// Acepta "1686" o el código nuevo "B1686ABC"; devuelve los 4 números o null.
export const limpiarCp = (valor) => (typeof valor === 'string' ? (valor.match(/\d{4}/)?.[0] ?? null) : null)

// VTEX junta las localidades de un mismo código postal con "::".
export const parseLocalidades = (json) => {
  const localidades = (json?.city ?? '').split('::').map((l) => l.trim()).filter(Boolean)
  return localidades.length ? { cp: json.postalCode, provincia: json.state, localidades } : null
}

export const buscarLocalidades = async (cp) => {
  for (const cadena of [CADENAS.carrefour, CADENAS.dia]) {
    try {
      const r = await fetch(`${cadena.base}/api/checkout/pub/postal-code/ARG/${cp}`, { headers: HEADERS, signal: AbortSignal.timeout(5000) })
      if (r.ok) return parseLocalidades(await r.json())
    } catch {
      // probamos con la siguiente cadena
    }
  }
  throw new Error('no se pudo consultar el código postal')
}

export const ZONA_POR_DEFECTO = { cp: CODIGO_POSTAL, localidad: 'Hurlingham' }

export const leerZona = (texto) => {
  try {
    const z = JSON.parse(texto)
    return /^\d{4}$/.test(z?.cp) && typeof z.localidad === 'string' ? { cp: z.cp, localidad: z.localidad } : ZONA_POR_DEFECTO
  } catch {
    return ZONA_POR_DEFECTO
  }
}
