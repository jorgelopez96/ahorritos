import { CADENAS, CODIGO_POSTAL } from '../lib/cadenas.js'
import { buscarVtex } from '../lib/vtex.js'
import { buscarCoto } from '../lib/coto.js'
import { normalizar } from '../lib/texto.js'
import { limpiarCp } from '../lib/zona.js'

export const buscar = async (cadenaId, q, cp) => {
  const cadena = Object.hasOwn(CADENAS, cadenaId) && CADENAS[cadenaId]
  if (!cadena) throw new Error(`cadena desconocida: ${cadenaId}`)
  return cadena.tipo === 'coto' ? buscarCoto(q) : buscarVtex(cadena, q, cp)
}

export default async function handler(req, res) {
  const { cadena } = req.query
  const q = typeof req.query.q === 'string' ? normalizar(req.query.q) : ''
  const cp = req.query.cp === undefined ? CODIGO_POSTAL : limpiarCp(req.query.cp)
  if (!Object.hasOwn(CADENAS, cadena) || !cp || q.length < 2 || q.length > 80) return res.status(400).json({ error: 'pedido inválido' })
  try {
    const ofertas = await buscar(cadena, q, cp)
    if (ofertas.length) res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    return res.status(200).json({ cadena, ofertas })
  } catch {
    return res.status(502).json({ cadena, error: 'no respondió' })
  }
}
