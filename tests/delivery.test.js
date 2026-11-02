import { test } from 'node:test'
import assert from 'node:assert/strict'
import { linkPedidosYa } from '../src/delivery.js'

test('fuera de Android va a la búsqueda web de PedidosYa', () => {
  assert.equal(linkPedidosYa('Leche 1 L', false), 'https://www.pedidosya.com.ar/restaurantes?query=Leche%201%20L')
})

test('en Android abre la app y, si no está instalada, la búsqueda web', () => {
  const url = linkPedidosYa('Leche 1 L', true)
  assert.ok(url.startsWith('intent://www.pedidosya.com.ar/search?query=Leche%201%20L#Intent;'))
  assert.ok(url.includes(';scheme=https;package=com.pedidosya;'))
  assert.ok(url.includes('S.browser_fallback_url=' + encodeURIComponent('https://www.pedidosya.com.ar/restaurantes?query=Leche%201%20L')))
  assert.ok(url.endsWith(';end'))
})
