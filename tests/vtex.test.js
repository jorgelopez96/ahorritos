import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseVtex, buscarVtex } from '../lib/vtex.js'
import { CADENAS } from '../lib/cadenas.js'

const json = JSON.parse(readFileSync(new URL('./fixtures/vtex-carrefour.json', import.meta.url)))
const ofertas = parseVtex(json, CADENAS.carrefour)

test('arma ofertas con ean, precio y link', () => {
  const o = ofertas.find((x) => x.ean === '7790272001029')
  assert.equal(o.cadena, 'carrefour')
  assert.equal(o.precio, 5899)
  assert.equal(o.precioLista, 7469)
  assert.equal(o.url, 'https://www.carrefour.com.ar/aceite-de-girasol-natura-1-5-lts/p')
  assert.ok(o.imagen.startsWith('https://'))
})

test('precioLista es null cuando no hay rebaja', () => {
  assert.equal(ofertas.find((x) => x.ean === '7790272001005').precioLista, null)
})

test('descarta precio 0, sin stock y electro', () => {
  assert.deepEqual(ofertas.map((x) => x.ean), ['7790272001029', '7790272000831', '7790272001005'])
})

test('ignora precios de lista disparatados (Jumbo manda x100)', () => {
  const [o] = parseVtex({ products: [{ productName: 'Leche', linkText: 'leche', items: [{ ean: '9', images: [], sellers: [{ commertialOffer: { Price: 2050, ListPrice: 205000, AvailableQuantity: 5 } }] }] }] }, CADENAS.jumbo)
  assert.equal(o.precioLista, null)
})

test('si la búsqueda inteligente no trae nada (Carrefour redirige "cafe"), usa el buscador clásico', async (t) => {
  const prod = { productName: 'Café molido 500 g', linkText: 'cafe', items: [{ ean: '7', images: [], sellers: [{ commertialOffer: { Price: 9000, ListPrice: 9000, AvailableQuantity: 5 } }] }] }
  const urls = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    urls.push(url)
    const body = url.includes('intelligent-search') ? { products: [], redirect: '/Desayuno-y-merienda/Cafe' } : [prod]
    return { ok: true, json: async () => body }
  })
  const ofertas = await buscarVtex(CADENAS.jumbo, 'cafe')
  assert.equal(ofertas[0].ean, '7')
  assert.ok(urls[1].includes('/api/catalog_system/pub/products/search?ft=cafe'))
})

test('pide la región del código postal elegido', async (t) => {
  const urls = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    urls.push(url)
    return { ok: true, json: async () => (url.includes('regions') ? [{ id: 'R5000' }] : { products: [] }) }
  })
  await buscarVtex(CADENAS.carrefour, 'leche', '5000').catch(() => {})
  assert.ok(urls[0].includes('postalCode=5000'))
  assert.ok(urls[1].includes('regionId=R5000'))
})
