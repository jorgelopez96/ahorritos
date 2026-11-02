import { test } from 'node:test'
import assert from 'node:assert/strict'
import { agregar, cambiarCantidad, alternarTachado, vaciar, total, cantidadDe, contar, leer, textoParaCompartir, claveDe } from '../src/lista.js'

const leche = { cadena: 'dia', ean: '1', nombre: 'Leche 1 L', precio: 1000, imagen: null, url: 'u1' }
const arroz = { cadena: 'carrefour', ean: '2', nombre: 'Arroz', precio: 500.5, imagen: null, url: 'u2' }

test('agregar separa por súper y suma cantidad si ya estaba', () => {
  let l = agregar({}, leche, 'Leche La Serenísima 1 L')
  l = agregar(l, leche, 'Leche La Serenísima 1 L')
  l = agregar(l, arroz, 'Arroz Gallo')
  assert.deepEqual(Object.keys(l), ['dia', 'carrefour'])
  assert.equal(l.dia[0].cantidad, 2)
  assert.equal(l.dia[0].nombre, 'Leche La Serenísima 1 L')
  assert.equal(cantidadDe(l, leche), 2)
  assert.equal(contar(l), 2)
})

test('bajar a cero saca el producto y el súper vacío desaparece', () => {
  let l = agregar({}, leche, 'Leche')
  l = cambiarCantidad(l, 'dia', '1', -1)
  assert.deepEqual(l, {})
})

test('tachar no cambia el total, vaciar borra solo ese súper', () => {
  let l = agregar(agregar(agregar({}, leche, 'Leche'), leche, 'Leche'), arroz, 'Arroz')
  l = alternarTachado(l, 'dia', '1')
  assert.equal(l.dia[0].tachado, true)
  assert.equal(total(l.dia), 2000)
  assert.equal(total(l.carrefour), 500.5)
  l = vaciar(l, 'dia')
  assert.deepEqual(Object.keys(l), ['carrefour'])
})

test('no rompe con lo que haya guardado mal en el navegador', () => {
  assert.deepEqual(leer('no es json'), {})
  assert.deepEqual(leer(null), {})
  assert.deepEqual(leer('{"dia":"roto","coto":[{"clave":"3","nombre":"X","precio":10,"cantidad":1}]}'), { coto: [{ clave: '3', nombre: 'X', precio: 10, cantidad: 1 }] })
})

test('arma el texto para compartir con cantidades y total', () => {
  const items = [
    { clave: '1', nombre: 'Leche 1 L', precio: 1000, cantidad: 2, tachado: true },
    { clave: '2', nombre: 'Arroz', precio: 500.5, cantidad: 1, tachado: false },
  ]
  assert.equal(
    textoParaCompartir('Día', items),
    'Compras en Día\n• 2 × Leche 1 L: $2.000\n• Arroz: $500,50\nTotal: $2.500,50',
  )
})

test('claveDe identifica el producto por ean, o por link si no tiene', () => {
  assert.equal(claveDe(leche), '1')
  assert.equal(claveDe({ ...leche, ean: null }), 'u1')
  const l = cambiarCantidad(agregar({}, leche, 'Leche'), 'dia', claveDe(leche), -1)
  assert.deepEqual(l, {})
})
