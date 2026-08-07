const API_URL =
  "https://script.google.com/macros/s/AKfycbyAl92YO1VnX5yzVG2ueFYCKtP6lGhmB0K4V7CiEDbtCNuCjknRBnB9YhyMTjyJt55O/exec";

const CLAVE_CATALOGO = "insuvenir_productos_v2";

let categoriaSeleccionada = "";
let todosLosProductos = [];
let productosDestacados = [];


document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  prepararBuscador();
});


async function cargarProductos() {
  const grilla =
    document.getElementById("grilla-productos");

  if (!grilla) {
    return;
  }

  grilla.innerHTML = `
    <p class="mensaje-catalogo">
      Cargando productos...
    </p>
  `;

  try {
    const respuesta = await fetch(API_URL, {
      cache: "no-store"
    });

    if (!respuesta.ok) {
      throw new Error(
        "No se pudo consultar la API."
      );
    }

    const productos =
      await respuesta.json();

    if (!Array.isArray(productos)) {
      throw new Error(
        productos.error ||
        "La API devolvió un formato incorrecto."
      );
    }

    todosLosProductos = productos;
    crearCategorias();

    productosDestacados =
      todosLosProductos.filter(
        producto =>
          producto.destacado === true
      );

    sessionStorage.setItem(
      CLAVE_CATALOGO,
      JSON.stringify(todosLosProductos)
    );

    mostrarDestacados();

  } catch (error) {
    console.error(error);

    grilla.innerHTML = `
      <div class="mensaje-error">
        <strong>
          No pudimos cargar los productos.
        </strong>

        <span>
          Actualizá la página dentro de unos segundos.
        </span>
      </div>
    `;
  }
}

function crearCategorias() {
  const contenedor =
    document.getElementById("grilla-categorias");

  if (!contenedor) {
    return;
  }

  const categorias = [
    ...new Set(
      todosLosProductos
        .map(producto =>
          String(producto.categoria || "").trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  if (categorias.length === 0) {
    contenedor.innerHTML = "";
    return;
  }

  contenedor.innerHTML = `
    <button
      type="button"
      class="tarjeta-categoria categoria-activa"
      data-categoria=""
    >
      <span class="icono-categoria">
        ✨
      </span>

      <strong>
        TODOS
      </strong>
    </button>

    ${categorias
      .map(categoria => `
        <button
          type="button"
          class="tarjeta-categoria"
          data-categoria="${escaparHTML(categoria)}"
        >
          <span class="icono-categoria">
            ${obtenerIconoCategoria(categoria)}
          </span>

          <strong>
            ${escaparHTML(categoria)}
          </strong>
        </button>
      `)
      .join("")}
  `;

  activarCategorias();
}


function activarCategorias() {
  const botones =
    document.querySelectorAll(
      ".tarjeta-categoria"
    );

  botones.forEach(boton => {
    boton.addEventListener("click", () => {

      botones.forEach(item =>
        item.classList.remove(
          "categoria-activa"
        )
      );

      boton.classList.add(
        "categoria-activa"
      );

      categoriaSeleccionada =
        boton.dataset.categoria || "";

      const buscador =
        document.getElementById("buscador");

      if (buscador) {
        buscador.value = "";
      }

      actualizarTituloResultados("");

      if (!categoriaSeleccionada) {
        mostrarProductos(
          todosLosProductos,
          "No hay productos disponibles."
        );
        return;
      }

      const productosCategoria =
        todosLosProductos.filter(producto =>
          normalizarTexto(producto.categoria) ===
          normalizarTexto(categoriaSeleccionada)
        );

      mostrarProductos(
        productosCategoria,
        "No hay productos en esta categoría."
      );

      document
        .getElementById("productos")
        ?.scrollIntoView({
          behavior: "smooth"
        });
    });
  });
}


function obtenerIconoCategoria(categoria) {
  const iconos = {
    VASOS: "🥤",
    VALIJITAS: "💼",
    BOTELLAS: "🧴",
    BALDECITOS: "🪣",
    BOLSITAS: "🛍️",
    LUNCHERAS: "🍱",
    INSUMOS: "🎨",
    COMBOS: "🎁"
  };

  return iconos[
    normalizarTexto(categoria).toUpperCase()
  ] || "✨";
}
function prepararBuscador() {
  const buscador =
    document.getElementById("buscador");

  if (!buscador) {
    return;
  }

  buscador.addEventListener(
    "input",
    () => {
      const consulta =
        normalizarTexto(
          buscador.value
        );

      if (!consulta) {
        mostrarDestacados();
        return;
      }

      const resultados =
        todosLosProductos.filter(
          producto => {
            const nombre =
              normalizarTexto(
                producto.producto
              );

            const descripcion =
              normalizarTexto(
                producto.descripcion
              );

            const familia =
              normalizarTexto(
                producto.familia
              );

            return (
              nombre.includes(consulta) ||
              descripcion.includes(consulta) ||
              familia.includes(consulta)
            );
          }
        );

      mostrarResultadosBusqueda(
        resultados,
        buscador.value.trim()
      );
    }
  );
}


function mostrarDestacados() {
  const productosAMostrar =
    productosDestacados.length > 0
      ? productosDestacados
      : todosLosProductos.slice(0, 6);

  actualizarTituloResultados("");

  mostrarProductos(
    productosAMostrar,
    "Todavía no hay productos destacados."
  );
}


function mostrarResultadosBusqueda(
  productos,
  consulta
) {
  actualizarTituloResultados(
    productos.length === 1
      ? `1 resultado para “${consulta}”`
      : `${productos.length} resultados para “${consulta}”`
  );

  mostrarProductos(
    productos,
    "No encontramos productos con esa búsqueda."
  );
}


function actualizarTituloResultados(texto) {
  const resultado =
    document.getElementById(
      "resultado-busqueda"
    );

  if (resultado) {
    resultado.textContent = texto;
  }
}


function mostrarProductos(
  productos,
  mensajeVacio
) {
  const grilla =
    document.getElementById(
      "grilla-productos"
    );

  if (!grilla) {
    return;
  }

  if (productos.length === 0) {
    grilla.innerHTML = `
      <p class="mensaje-catalogo">
        ${escaparHTML(mensajeVacio)}
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
    producto.descripcion ||
    "Insumo para souvenirs."
  );

  const precio = formatearPrecio(
    producto.precio1
  );

  const stock = Number(
    producto.stock || 0
  );

  const estado = escaparHTML(
    producto.estado ||
    (stock > 0
      ? "Disponible"
      : "Sin stock")
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
    `producto.html?familia=${encodeURIComponent(
      producto.familia
    )}`;

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
  const id = String(
    idFoto || ""
  ).trim();

  if (!id) {
    return `
      <div class="foto-placeholder">
        <span>INSUVENIR</span>
        <small>Próximamente foto</small>
      </div>
    `;
  }

  const url =
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      id
    )}&sz=w1000`;

  return `
    <img
      src="${url}"
      alt="${nombre}"
      loading="lazy"
      onerror="
        this.parentElement.innerHTML =
        '<div class=&quot;foto-placeholder&quot;><span>INSUVENIR</span><small>Foto no disponible</small></div>'
      "
    >
  `;
}


function formatearPrecio(valor) {
  const numero = Number(
    valor || 0
  );

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }
  ).format(numero);
}


function normalizarTexto(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}


function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
