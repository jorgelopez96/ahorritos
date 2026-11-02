import { test } from 'node:test'
import assert from 'node:assert/strict'
import handler, { buscar } from '../api/buscar.js'

const respuesta = () => {
  const res = { headers: {}, setHeader: (k, v) => (res.headers[k] = v), status: (c) => ((res.code = c), res), json: (b) => ((res.body = b), res) }
  return res
}

test('cadena inexistente o búsqueda corta dan 400', async () => {
  await assert.rejects(buscar('inexistente', 'leche'))
  const res = respuesta()
  await handler({ query: { cadena: 'dia', q: 'l' } }, res)
  assert.equal(res.code, 400)
})

test('si la cadena falla, el handler responde 502 sin romper', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('caída') })
  await assert.rejects(buscar('dia', 'leche'))
  const res = respuesta()
  await handler({ query: { cadena: 'coto', q: 'leche' } }, res)
  assert.equal(res.code, 502)
  assert.deepEqual(res.body, { cadena: 'coto', error: 'no respondió' })
})

test('rechaza q repetido, muy largo o cadenas heredadas del prototipo', async () => {
  for (const query of [{ cadena: 'dia', q: ['a', 'b'] }, { cadena: 'dia', q: 'x'.repeat(81) }, { cadena: 'constructor', q: 'leche' }]) {
    const res = respuesta()
    await handler({ query }, res)
    assert.equal(res.code, 400)
  }
})

test('no cachea respuestas vacías', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ contents: [] }) }))
  const res = respuesta()
  await handler({ query: { cadena: 'coto', q: 'xqzwv' } }, res)
  assert.equal(res.code, 200)
  assert.equal(res.headers['Cache-Control'], undefined)
})

test('un código postal inválido da 400', async () => {
  const res = respuesta()
  await handler({ query: { cadena: 'dia', q: 'leche', cp: 'xx' } }, res)
  assert.equal(res.code, 400)
})
