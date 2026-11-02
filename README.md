# Ahorritos

Comparador de precios de supermercados argentinos. Buscás un producto y te muestra cuánto sale en Día, ChangoMás, Carrefour, Coto y Jumbo, con el más barato marcado.

**En vivo:** https://ahorritos.vercel.app

## Por qué lo hice

Quería dejar de comprar a ciegas y saber en qué súper me convenía cada cosa. Lo armé pensando en mi familia, que lo usa desde el celular parada en la góndola, así que tiene letra grande, botones cómodos y nada escondido.

## Qué hace

- Busca en las cinco cadenas en paralelo y muestra los resultados a medida que llegan. Si un súper no responde, el resto se muestra igual.
- Junta el mismo producto de distintas cadenas por código de barras (EAN), aunque cada súper lo llame distinto.
- Marca el precio más bajo y, si hay rebaja, muestra el precio anterior tachado.
- Lista de compras por súper: sumás productos, cambiás cantidades, los tachás cuando los ponés en el changuito y compartís la lista por WhatsApp. Se guarda en el navegador, sin cuentas.
- Elegís tu zona con el código postal y trae los precios de esa zona (en las cadenas que lo permiten).

## Cómo funciona

- **Front:** React + Vite.
- **Back:** funciones serverless en Vercel (`api/`). El navegador no puede consultar a los supers directo por CORS, así que una función hace de intermediaria y devuelve todo en un formato común.
- **Fuentes:** Día, ChangoMás, Carrefour y Jumbo usan VTEX (búsqueda pública + región por código postal). Coto tiene su propio JSON, con los descuentos directos en un campo aparte.
- **Tests:** `node --test`, sin dependencias extra.

Algunos detalles que aparecieron en el camino:

- Carrefour, ante búsquedas genéricas como "café", no devuelve productos sino una redirección a una categoría; en ese caso uso el buscador clásico de VTEX.
- Jumbo a veces manda el precio de lista multiplicado por 100, así que ignoro "rebajas" mayores al 50%.
- "Huevos" no encontraba "Huevo": la búsqueda le saca el plural a cada palabra antes de comparar.

## Correrlo local

```bash
npm install
npm run dev     # app + API en http://localhost:5173
npm test
```

## Límites

- Son los precios de las tiendas online; en el local pueden variar.
- Jumbo y Coto no dejan elegir zona y muestran su precio general.
- No incluye descuentos bancarios ni promos por cantidad (2x1, 2da al 50%).
