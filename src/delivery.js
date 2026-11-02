// PedidosYa excluye /restaurantes de los links que abren su app, así que en Android
// se le pide a la app directamente (intent) y, si no está instalada, se abre la web.
export const linkPedidosYa = (nombre, esAndroid) => {
  const q = encodeURIComponent(nombre)
  const web = `https://www.pedidosya.com.ar/restaurantes?query=${q}`
  if (!esAndroid) return web
  return `intent://www.pedidosya.com.ar/search?query=${q}#Intent;scheme=https;package=com.pedidosya;S.browser_fallback_url=${encodeURIComponent(web)};end`
}

export const linkRappi = (nombre) => `https://www.rappi.com.ar/search?query=${encodeURIComponent(nombre)}`
