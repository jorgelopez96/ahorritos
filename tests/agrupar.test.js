import { test } from 'node:test'
import assert from 'node:assert/strict'
import { agrupar } from '../src/agrupar.js'

const of = (cadena, ean, nombre, precio, extra = {}) => ({ cadena, ean, nombre, marca: '', precio, precioLista: null, imagen: null, url: `https://x/${cadena}/${nombre}`, ...extra })

test('junta por ean con la más barata primero', () => {
  const [t] = agrupar([of('dia', '1', 'Leche 1 L', 3000), of('carrefour', '1', 'Leche La Serenísima 1 L', 2269)], 'leche')
  assert.deepEqual(t.ofertas.map((o) => o.cadena), ['carrefour', 'dia'])
  assert.equal(t.minimo, 2269)
  assert.equal(t.nombre, 'Leche La Serenísima 1 L')
})

test('sin ean va en tarjeta propia', () => {
  const ts = agrupar([of('coto', null, 'Leche suelta', 1000), of('dia', null, 'Leche suelta', 1100)], 'leche')
  assert.equal(ts.length, 2)
})

test('ordena por el precio más bajo de cada tarjeta', () => {
  const ts = agrupar([of('dia', '1', 'Leche A', 3000), of('dia', '2', 'Leche B', 1000), of('coto', '3', 'Leche C', 2000)], 'leche')
  assert.deepEqual(ts.map((t) => t.minimo), [1000, 2000, 3000])
})

test('filtra lo que no coincide, y si no queda nada muestra todo', () => {
  assert.equal(agrupar([of('dia', '1', 'Galletitas Choco', 500), of('dia', '2', 'Leche', 900)], 'leche').length, 1)
  assert.equal(agrupar([of('dia', '1', 'Galletitas Choco', 500)], 'leche').length, 1)
})

test('usa la primera imagen disponible y limpia espacios del nombre', () => {
  const [t] = agrupar([of('dia', '1', 'Leche', 900), of('coto', '1', 'Leche  NATURA   1 L', 950, { imagen: 'https://img' })], 'leche')
  assert.equal(t.imagen, 'https://img')
  assert.equal(t.nombre, 'Leche NATURA 1 L')
})
