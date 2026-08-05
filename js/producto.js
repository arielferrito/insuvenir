const API_URL =
  "https://script.google.com/macros/s/AKfycbyAl92YO1VnX5yzVG2ueFYCKtP6lGhmB0K4V7CiEDbtCNuCjknRBnB9YhyMTjyJt55O/exec";

const CLAVE_CATALOGO = "insuvenir_productos_v3";

document.addEventListener(
  "DOMContentLoaded",
  cargarProducto
);


async function cargarProducto() {
  const parametros =
    new URLSearchParams(window.location.search);

  const familia = parametros.get("familia");

  if (!familia) {
    mostrarError("No se indicó qué producto abrir.");
    return;
  }

  /*
   * Primero busca un catálogo actualizado
   * dentro del almacenamiento de la sesión.
   */
  const productoGuardado =
    obtenerProductoGuardado_(familia);

  if (productoGuardado) {
    mostrarFicha(productoGuardado);
    return;
  }

  /*
   * Si no existe o pertenece a una versión vieja,
   * vuelve a consultar la API.
   */
  try {
    const respuesta = await fetch(API_URL, {
      cache: "no-store"
    });

    if (!respuesta.ok) {
      throw new Error(
        "No se pudo consultar la API."
      );
    }

    const productos = await respuesta.json();

    if (!Array.isArray(productos)) {
      throw new Error(
        productos.error ||
        "La API devolvió un formato incorrecto."
      );
    }

    sessionStorage.setItem(
      CLAVE_CATALOGO,
      JSON.stringify(productos)
    );

    const producto =
      buscarProductoPorFamilia_(
        productos,
        familia
      );

    if (!producto) {
      mostrarError(
        "No encontramos este producto."
      );
      return;
    }

    mostrarFicha(producto);

  } catch (error) {
    console.error(error);

    mostrarError(
      "No pudimos cargar el producto."
    );
  }
}


function obtenerProductoGuardado_(familia) {
  const clavesPosibles = [
    CLAVE_CATALOGO,
    "insuvenir_productos_v2",
    "insuvenir_productos"
  ];

  for (const clave of clavesPosibles) {
    const contenido =
      sessionStorage.getItem(clave);

    if (!contenido) {
      continue;
    }

    try {
      const productos = JSON.parse(contenido);

      const producto =
        buscarProductoPorFamilia_(
          productos,
          familia
        );

      if (!producto) {
        continue;
      }

      /*
       * Si el producto guardado no tiene todavía
       * la propiedad "colores", pertenece a una
       * versión anterior y no debe utilizarse.
       */
      const tieneDatosDeColores =
        Object.prototype.hasOwnProperty.call(
          producto,
          "colores"
        );

      if (!tieneDatosDeColores) {
        continue;
      }

      return producto;

    } catch (error) {
      console.warn(
        `No se pudo leer ${clave}.`,
        error
      );
    }
  }

  return null;
}


function buscarProductoPorFamilia_(
  productos,
  familia
) {
  if (!Array.isArray(productos)) {
    return null;
  }

  return productos.find(item =>
    String(item.familia).trim() ===
    String(familia).trim()
  ) || null;
}


function mostrarFicha(producto) {
  const contenedor =
    document.getElementById("ficha-producto");

  const nombre = escaparHTML(
    producto.producto || "Producto"
  );

  const descripcion = escaparHTML(
    producto.descripcion ||
    "Insumo para souvenirs."
  );

  const fotos = obtenerFotos(producto);

  const stock = Number(
    producto.stock || 0
  );

  const colores =
    Array.isArray(producto.colores)
      ? producto.colores.filter(color =>
          color &&
          color.nombre &&
          Number(color.stock || 0) > 0
        )
      : [];

  const colorInicial =
    colores.length > 0
      ? colores[0]
      : null;

  const estado = escaparHTML(
    producto.estado ||
    (stock > 0
      ? "En Stock"
      : "Sin Stock")
  );

  const claseEstado =
    stock > 0
      ? "estado-disponible"
      : "estado-sin-stock";

  const selectorColores =
    crearSelectorColores_(colores);

  const textoDisponibilidad =
    colorInicial
      ? `Disponibles en ${escaparHTML(
          colorInicial.nombre
        )}: ${Number(
          colorInicial.stock
        )} unidades`
      : stock > 0
        ? `Disponibilidad estimada: ${stock} unidades`
        : "Producto momentáneamente sin stock";

  contenedor.innerHTML = `
    <div class="ficha-galeria">

      <div class="foto-principal">
        <img
          id="foto-principal"
          src="${fotos[0]}"
          alt="${nombre}"
        >
      </div>

      <div class="miniaturas">
        ${fotos
          .map((foto, indice) => `
            <button
              type="button"
              class="miniatura ${
                indice === 0
                  ? "miniatura-activa"
                  : ""
              }"
              data-foto="${foto}"
              aria-label="Ver imagen ${indice + 1}"
            >
              <img
                src="${foto}"
                alt="${nombre} ${indice + 1}"
              >
            </button>
          `)
          .join("")}
      </div>

    </div>

    <div class="ficha-informacion">

      <span class="estado-producto ${claseEstado}">
        ${estado}
      </span>

      <h1>${nombre}</h1>

      <p class="ficha-descripcion">
        ${descripcion}
      </p>

      ${selectorColores}

      <div class="tabla-precios">

        <h2>Precios por cantidad</h2>

        <div class="fila-precio">
          <span>1 a 19 unidades</span>
          <strong>
            ${formatearPrecio(producto.precio1)}
          </strong>
        </div>

        <div class="fila-precio">
          <span>20 a 49 unidades</span>
          <strong>
            ${formatearPrecio(producto.precio2)}
          </strong>
        </div>

        <div class="fila-precio destacado-precio">
          <span>50 unidades o más</span>
          <strong>
            ${formatearPrecio(producto.precio3)}
          </strong>
        </div>

      </div>

      <p
        class="stock-ficha"
        id="stock-ficha"
      >
        ${textoDisponibilidad}
      </p>

      <a
        href="index.html#productos"
        class="boton boton-principal boton-volver"
      >
        Volver al catálogo
      </a>

    </div>
  `;

  activarMiniaturas();
  activarColores();
}


function crearSelectorColores_(colores) {
  if (colores.length === 0) {
    return "";
  }

  return `
    <section class="selector-colores">

      <h2>Elegí un color</h2>

      <div class="lista-colores">

        ${colores
          .map((color, indice) => `
            <button
              type="button"
              class="opcion-color ${
                indice === 0
                  ? "opcion-color-activa"
                  : ""
              }"
              data-color="${escaparHTML(color.nombre)}"
              data-stock="${Number(color.stock || 0)}"
            >
              ${escaparHTML(color.nombre)}
            </button>
          `)
          .join("")}

      </div>

    </section>
  `;
}


function activarColores() {
  const botones =
    document.querySelectorAll(
      ".opcion-color"
    );

  const disponibilidad =
    document.getElementById(
      "stock-ficha"
    );

  if (!disponibilidad) {
    return;
  }

  botones.forEach(boton => {
    boton.addEventListener(
      "click",
      () => {
        botones.forEach(item =>
          item.classList.remove(
            "opcion-color-activa"
          )
        );

        boton.classList.add(
          "opcion-color-activa"
        );

        const color =
          boton.dataset.color;

        const stock = Number(
          boton.dataset.stock || 0
        );

        disponibilidad.textContent =
          `Disponibles en ${color}: ${stock} unidades`;

        sessionStorage.setItem(
          "insuvenir_color_seleccionado",
          color
        );
      }
    );
  });
}


function obtenerFotos(producto) {
  const ids =
    Array.isArray(producto.fotos)
      ? [...producto.fotos]
      : [];

  if (
    ids.length === 0 &&
    producto.idFoto
  ) {
    ids.push(producto.idFoto);
  }

  if (ids.length === 0) {
    return [crearPlaceholder()];
  }

  return ids.map(id =>
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      id
    )}&sz=w1400`
  );
}


function activarMiniaturas() {
  const principal =
    document.getElementById(
      "foto-principal"
    );

  const miniaturas =
    document.querySelectorAll(
      ".miniatura"
    );

  if (!principal) {
    return;
  }

  miniaturas.forEach(boton => {
    boton.addEventListener(
      "click",
      () => {
        principal.src =
          boton.dataset.foto;

        miniaturas.forEach(item =>
          item.classList.remove(
            "miniatura-activa"
          )
        );

        boton.classList.add(
          "miniatura-activa"
        );
      }
    );
  });
}


function crearPlaceholder() {
  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1000"
        height="1000"
        viewBox="0 0 1000 1000"
      >
        <rect
          width="1000"
          height="1000"
          fill="#f7edf4"
        />

        <text
          x="50%"
          y="48%"
          text-anchor="middle"
          font-family="Arial"
          font-size="70"
          font-weight="bold"
          fill="#d96ca6"
        >
          INSUVENIR
        </text>

        <text
          x="50%"
          y="57%"
          text-anchor="middle"
          font-family="Arial"
          font-size="32"
          fill="#8b7b84"
        >
          Próximamente foto
        </text>
      </svg>
    `)
  );
}


function mostrarError(mensaje) {
  const contenedor =
    document.getElementById(
      "ficha-producto"
    );

  contenedor.innerHTML = `
    <div class="mensaje-error">

      <strong>
        ${escaparHTML(mensaje)}
      </strong>

      <a
        href="index.html"
        class="boton boton-principal"
      >
        Volver al inicio
      </a>

    </div>
  `;
}


function formatearPrecio(valor) {
  const numero = Number(valor || 0);

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }
  ).format(numero);
}


function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
