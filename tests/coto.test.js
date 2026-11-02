import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseCoto } from '../lib/coto.js'

const ofertas = parseCoto(JSON.parse(readFileSync(new URL('./fixtures/coto.json', import.meta.url))))

test('encuentra los registros anidados y arma la oferta', () => {
  const o = ofertas.find((x) => x.ean === '7790742358608')
  assert.equal(o.cadena, 'coto')
  assert.equal(o.precio, 3244)
  assert.equal(o.precioLista, null)
  assert.equal(o.marca, 'LA SERENISIMA')
  assert.equal(o.url, 'https://www.cotodigital.com.ar/sitios/cdigi/categoria?Ntt=7790742358608')
  assert.ok(o.imagen.startsWith('https://'))
})

test('deduplica por ean quedándose con el más barato', () => {
  assert.equal(ofertas.filter((x) => x.ean === '7790742358608').length, 1)
})

test('descarta precio 0 y electro', () => {
  assert.deepEqual(ofertas.map((x) => x.ean).sort(), ['7790742352101', '7790742352200', '7790742358608', '7790742448200'])
})

test('aplica la rebaja directa de Coto (20%Dto) pero no las de "Llevando N"', () => {
  const rebajado = ofertas.find((x) => x.ean === '7790742352101')
  assert.equal(rebajado.precio, 1979.2)
  assert.equal(rebajado.precioLista, 2474)
  const porCantidad = ofertas.find((x) => x.ean === '7790742352200')
  assert.equal(porCantidad.precio, 2474)
  assert.equal(porCantidad.precioLista, null)
})
