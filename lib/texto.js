export const normalizar = (s = '') =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()

// "huevos" tiene que encontrar "Huevo": se le saca el plural a cada palabra buscada.
const singular = (palabra) => (palabra.length > 3 ? palabra.replace(/(es|s)$/, '') : palabra)

export const coincide = (texto, q) => {
  const t = normalizar(texto)
  return normalizar(q).split(' ').every((palabra) => t.includes(singular(palabra)))
}

const EXCLUIDAS = ['electro', 'tecnolog', 'informatic', 'celular', 'televis', 'audio', 'climatiz', 'computa', 'consola', 'gaming']

export const esExcluido = (categorias) =>
  categorias.some((c) => EXCLUIDAS.some((x) => normalizar(c).includes(x)))
