const API_URL =
  "https://script.google.com/macros/s/AKfycbyAl92YO1VnX5yzVG2ueFYCKtP6lGhmB0K4V7CiEDbtCNuCjknRBnB9YhyMTjyJt55O/exec";

document.addEventListener("DOMContentLoaded", cargarProductos);

async function cargarProductos() {
  const grilla = document.getElementById("grilla-productos");

  grilla.innerHTML = `
    <p class="mensaje-catalogo">
      Cargando productos...
    </p>
  `;

  try {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
      throw new Error("No se pudo consultar la API.");
    }

    const productos = await respuesta.json();

    if (!Array.isArray(productos)) {
      throw new Error(productos.error || "La API devolvió un formato incorrecto.");
    }

    const destacados = productos.filter(
      producto => producto.destacado === true
    );

    // Mientras configuramos los destacados, muestra los primeros productos.
    const productosAMostrar =
      destacados.length > 0
        ? destacados
        : productos.slice(0, 6);

    mostrarProductos(productosAMostrar);

  } catch (error) {
    console.error(error);

    grilla.innerHTML = `
      <div class="mensaje-error">
        <strong>No pudimos cargar los productos.</strong>
        <span>Actualizá la página dentro de unos segundos.</span>
      </div>
    `;
  }
}


function mostrarProductos(productos) {
  const grilla = document.getElementById("grilla-productos");

  if (productos.length === 0) {
    grilla.innerHTML = `
      <p class="mensaje-catalogo">
        Todavía no hay productos destacados.
      </p>
    `;
    return;
  }

  grilla.innerHTML = productos
    .map(crearTarjetaProducto)
    .join("");
}


function crearTarjetaProducto(producto) {
  const nombre = escaparHTML(
    producto.producto || "Producto"
  );

  const descripcion = escaparHTML(
    producto.descripcion || "Insumo para souvenirs."
  );

  const precio = formatearPrecio(
    producto.precio1
  );

  const stock = Number(
    producto.stock || 0
  );

  const estado = escaparHTML(
    producto.estado ||
    (stock > 0 ? "Disponible" : "Sin stock")
  );

  const claseEstado =
    stock > 0
      ? "estado-disponible"
      : "estado-sin-stock";

  const imagen = obtenerImagen(
    producto.idFoto,
    nombre
  );

  const urlProducto =
    `producto.html?familia=${encodeURIComponent(producto.familia)}`;

  return `
    <article class="producto">

      <div class="foto">
        ${imagen}
      </div>

      <div class="producto-contenido">

        <span class="estado-producto ${claseEstado}">
          ${estado}
        </span>

        <h3>${nombre}</h3>

        <p class="descripcion-producto">
          ${descripcion}
        </p>

        <p class="precio">
          Desde ${precio}
        </p>

        ${
          stock > 0
            ? `
              <a
                class="boton-producto"
                href="${urlProducto}"
              >
                Ver producto
              </a>
            `
            : `
              <span
                class="boton-producto boton-producto-desactivado"
              >
                Sin stock
              </span>
            `
        }

      </div>

    </article>
  `;
}


function obtenerImagen(idFoto, nombre) {
  const id = String(idFoto || "").trim();

  if (!id) {
    return `
      <div class="foto-placeholder">
        <span>INSUVENIR</span>
        <small>Próximamente foto</small>
      </div>
    `;
  }

  const url =
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1000`;

  return `
    <img
      src="${url}"
      alt="${nombre}"
      loading="lazy"
      onerror="this.parentElement.innerHTML=
        '<div class=&quot;foto-placeholder&quot;><span>INSUVENIR</span><small>Foto no disponible</small></div>'"
    >
  `;
}


function formatearPrecio(valor) {
  const numero = Number(valor || 0);

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(numero);
}


function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
