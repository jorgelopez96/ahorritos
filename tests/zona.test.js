import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseLocalidades, limpiarCp, leerZona } from '../lib/zona.js'
import handler from '../api/localidad.js'

test('separa las localidades que comparten código postal', () => {
  assert.deepEqual(parseLocalidades({ postalCode: '1686', city: 'Hurlingham::William Morris', state: 'Buenos Aires' }), {
    cp: '1686', provincia: 'Buenos Aires', localidades: ['Hurlingham', 'William Morris'],
  })
  assert.equal(parseLocalidades({ postalCode: '9999', city: '', state: '' }), null)
})

test('acepta el código postal nuevo (B1686ABC) y rechaza lo que no es', () => {
  assert.equal(limpiarCp('1686'), '1686')
  assert.equal(limpiarCp(' b1686abc '), '1686')
  assert.equal(limpiarCp('168'), null)
  assert.equal(limpiarCp(['1686']), null)
})

test('el endpoint de localidad valida el código postal', async () => {
  const res = { headers: {}, setHeader: (k, v) => (res.headers[k] = v), status: (c) => ((res.code = c), res), json: (b) => ((res.body = b), res) }
  await handler({ query: { cp: 'abc' } }, res)
  assert.equal(res.code, 400)
})

test('leerZona usa Hurlingham si no hay nada guardado o está roto', () => {
  const porDefecto = { cp: '1686', localidad: 'Hurlingham' }
  assert.deepEqual(leerZona(null), porDefecto)
  assert.deepEqual(leerZona('{roto'), porDefecto)
  assert.deepEqual(leerZona('{"cp":"12","localidad":"X"}'), porDefecto)
  assert.deepEqual(leerZona('{"cp":"5000","localidad":"Córdoba"}'), { cp: '5000', localidad: 'Córdoba' })
})
