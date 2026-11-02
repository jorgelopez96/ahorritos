import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizar, coincide, esExcluido } from '../lib/texto.js'

test('normalizar saca tildes, mayúsculas y espacios de más', () => {
  assert.equal(normalizar('  Café ACEITE  '), 'cafe aceite')
})

test('coincide exige todas las palabras buscadas', () => {
  assert.equal(coincide('Leche La Serenísima 1 L', 'leche serenisima'), true)
  assert.equal(coincide('Galletitas Leche', 'leche serenisima'), false)
  assert.equal(coincide('Aceite Natura', 'ACEITE'), true)
})

test('esExcluido saca electro y tecnología', () => {
  assert.equal(esExcluido(['/Electro/Pequeños Electrodomésticos/']), true)
  assert.equal(esExcluido(['Tecnología', 'Celulares']), true)
  assert.equal(esExcluido(['/Almacén/Aceites/']), false)
  assert.equal(esExcluido([]), false)
})

test('los plurales de la búsqueda encuentran el singular', () => {
  assert.equal(coincide('Huevo Blanco Grande 6 Ud.', 'huevos'), true)
  assert.equal(coincide('Fideo spaghetti Bulnez', 'fideos'), true)
  assert.equal(coincide('Galletitas Oreo', 'galletitas'), true)
})
