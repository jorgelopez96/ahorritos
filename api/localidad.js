import { buscarLocalidades, limpiarCp } from '../lib/zona.js'

export default async function handler(req, res) {
  const cp = limpiarCp(req.query.cp)
  if (!cp) return res.status(400).json({ error: 'código postal inválido' })
  try {
    const zona = await buscarLocalidades(cp)
    if (!zona) return res.status(404).json({ error: 'no encontrado' })
    res.setHeader('Cache-Control', 's-maxage=86400')
    return res.status(200).json(zona)
  } catch {
    return res.status(502).json({ error: 'no respondió' })
  }
}
