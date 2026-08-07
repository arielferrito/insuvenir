const API_URL =
  "https://script.google.com/macros/s/AKfycbyAl92YO1VnX5yzVG2ueFYCKtP6lGhmB0K4V7CiEDbtCNuCjknRBnB9YhyMTjyJt55O/exec";

const CLAVE_CATALOGO = "insuvenir_productos_v2";
const NUMERO_WHATSAPP = "5492233464815";

document.addEventListener("DOMContentLoaded", cargarProducto);


async function cargarProducto() {
  const parametros = new URLSearchParams(window.location.search);
  const familia = parametros.get("familia");

  if (!familia) {
    mostrarError("No se indicó qué producto abrir.");
    return;
  }

  const productoGuardado = obtenerProductoGuardado_(familia);

  if (productoGuardado) {
    mostrarFicha(productoGuardado);
    return;
  }

  try {
    const respuesta = await fetch(API_URL, {
      cache: "no-store"
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo consultar la API.");
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

    const producto = buscarProductoPorFamilia_(
      productos,
      familia
    );

    if (!producto) {
      mostrarError("No encontramos este producto.");
      return;
    }

    mostrarFicha(producto);

  } catch (error) {
    console.error(error);
    mostrarError("No pudimos cargar el producto.");
  }
}


function obtenerProductoGuardado_(familia) {
  const contenido = sessionStorage.getItem(CLAVE_CATALOGO);

  if (!contenido) {
    return null;
  }

  try {
    const productos = JSON.parse(contenido);

    const producto = buscarProductoPorFamilia_(
      productos,
      familia
    );

    if (!producto) {
      return null;
    }

    /*
     * Evita usar una versión antigua del catálogo
     * que todavía no incluía colores.
     */
    if (
      !Object.prototype.hasOwnProperty.call(
        producto,
        "colores"
      )
    ) {
      return null;
    }

    return producto;

  } catch (error) {
    console.warn(
      "No se pudo leer el catálogo guardado.",
      error
    );

    sessionStorage.removeItem(CLAVE_CATALOGO);
    return null;
  }
}


function buscarProductoPorFamilia_(productos, familia) {
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
  const stock = Number(producto.stock || 0);

  const colores = Array.isArray(producto.colores)
    ? producto.colores.filter(color =>
        color &&
        color.nombre &&
        Number(color.stock || 0) > 0
      )
    : [];

  const colorInicial =
    colores.length > 0 ? colores[0] : null;

  const estado = escaparHTML(
    producto.estado ||
    (stock > 0 ? "En Stock" : "Sin Stock")
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
        )}: ${Number(colorInicial.stock)} unidades`
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

      <section class="modulo-cotizacion">

        <h2>Calculá tu pedido</h2>

        <label
          class="etiqueta-cantidad"
          for="cantidad"
        >
          Cantidad
        </label>

        <div class="selector-cantidad">

          <button
            type="button"
            id="restar-cantidad"
            class="boton-cantidad"
            aria-label="Restar una unidad"
          >
            −
          </button>

          <input
            id="cantidad"
            class="campo-cantidad"
            type="number"
            inputmode="numeric"
            min="1"
            step="1"
            value="1"
          >

          <button
            type="button"
            id="sumar-cantidad"
            class="boton-cantidad"
            aria-label="Sumar una unidad"
          >
            +
          </button>

        </div>

        <p
          class="mensaje-escala"
          id="mensaje-escala"
        ></p>

        <div class="resumen-cotizacion">

          <div class="dato-cotizacion">
            <span>Precio unitario</span>
            <strong id="precio-unitario"></strong>
          </div>

          <div class="dato-cotizacion total-cotizacion">
            <span>Total estimado</span>
            <strong id="total-estimado"></strong>
          </div>

        </div>

        <button
          type="button"
          id="btn-whatsapp"
          class="boton-whatsapp"
        >
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M16.04 3C8.85 3 3 8.78 3 15.9c0 2.52.74 4.98 2.14 7.07L3 29l6.28-2.02a13.2 13.2 0 0 0 6.75 1.83h.01C23.22 28.81 29 23.03 29 15.9 29 8.78 23.22 3 16.04 3Zm0 23.63h-.01a11 11 0 0 1-5.61-1.53l-.4-.24-3.73 1.2 1.22-3.61-.26-.42A10.69 10.69 0 0 1 5.18 15.9c0-5.92 4.87-10.73 10.86-10.73 2.9 0 5.63 1.12 7.68 3.15a10.62 10.62 0 0 1 3.1 7.58c0 5.92-4.83 10.73-10.78 10.73Zm5.96-8.04c-.33-.16-1.94-.95-2.24-1.06-.3-.11-.52-.16-.74.16-.22.33-.85 1.06-1.04 1.28-.19.22-.38.25-.71.08-.33-.16-1.38-.5-2.63-1.61a9.7 9.7 0 0 1-1.82-2.24c-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.57-.08-.16-.74-1.77-1.01-2.42-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.7 0 1.59 1.17 3.13 1.33 3.35.16.22 2.3 3.47 5.57 4.87.78.33 1.38.53 1.85.68.78.24 1.49.21 2.05.13.63-.09 1.94-.79 2.21-1.55.27-.76.27-1.41.19-1.55-.08-.14-.3-.22-.63-.38Z"
            />
          </svg>

          Consultar por WhatsApp
        </button>

        <p class="aclaracion-cotizacion">
          El pedido y la disponibilidad serán confirmados
          por nuestro equipo antes de procesarlo.
        </p>

      </section>

      <a
        href="index.html#productos"
        class="enlace-volver"
      >
        ← Volver al catálogo
      </a>

    </div>
  `;

  activarMiniaturas();
  activarColores();
  activarCotizador(producto);
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
    document.querySelectorAll(".opcion-color");

  const disponibilidad =
    document.getElementById("stock-ficha");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      botones.forEach(item =>
        item.classList.remove(
          "opcion-color-activa"
        )
      );

      boton.classList.add(
        "opcion-color-activa"
      );

      const color = boton.dataset.color;
      const stock = Number(
        boton.dataset.stock || 0
      );

      if (disponibilidad) {
        disponibilidad.textContent =
          `Disponibles en ${color}: ${stock} unidades`;
      }

      sessionStorage.setItem(
        "insuvenir_color_seleccionado",
        color
      );
    });
  });
}


function activarCotizador(producto) {
  const campoCantidad =
    document.getElementById("cantidad");

  const botonRestar =
    document.getElementById("restar-cantidad");

  const botonSumar =
    document.getElementById("sumar-cantidad");

  const botonWhatsapp =
    document.getElementById("btn-whatsapp");

  if (
    !campoCantidad ||
    !botonRestar ||
    !botonSumar ||
    !botonWhatsapp
  ) {
    return;
  }

  function obtenerCantidadValida() {
    const cantidad = Math.floor(
      Number(campoCantidad.value)
    );

    return Number.isFinite(cantidad) && cantidad >= 1
      ? cantidad
      : 1;
  }

  function actualizarCotizacion() {
    const cantidad = obtenerCantidadValida();

    const cotizacion =
      calcularCotizacion_(producto, cantidad);

    document.getElementById(
      "precio-unitario"
    ).textContent = formatearPrecio(
      cotizacion.precioUnitario
    );

    document.getElementById(
      "total-estimado"
    ).textContent = formatearPrecio(
      cotizacion.total
    );

    document.getElementById(
      "mensaje-escala"
    ).textContent =
      cotizacion.mensajeEscala;
  }

  campoCantidad.addEventListener("focus", () => {
    if (campoCantidad.value === "1") {
      campoCantidad.value = "";
    }
  });

  campoCantidad.addEventListener("blur", () => {
    campoCantidad.value =
      obtenerCantidadValida();

    actualizarCotizacion();
  });

  campoCantidad.addEventListener(
    "input",
    actualizarCotizacion
  );

  botonRestar.addEventListener("click", () => {
    campoCantidad.value =
      Math.max(
        1,
        obtenerCantidadValida() - 1
      );

    actualizarCotizacion();
  });

  botonSumar.addEventListener("click", () => {
    campoCantidad.value =
      obtenerCantidadValida() + 1;

    actualizarCotizacion();
  });

  botonWhatsapp.addEventListener("click", () => {
    const cantidad =
      obtenerCantidadValida();

    const cotizacion =
      calcularCotizacion_(
        producto,
        cantidad
      );

    const colorSeleccionado =
      document.querySelector(
        ".opcion-color-activa"
      );

    const color =
      colorSeleccionado
        ? colorSeleccionado.dataset.color
        : "";

    const mensaje = [
      "¡Hola! 😊",
      "",
      "Quisiera consultar por el siguiente producto:",
      "",
      `📦 Producto: ${producto.producto}`,
      color ? `🎨 Color: ${color}` : "",
      `🔢 Cantidad: ${cantidad} unidades`,
      `💰 Precio estimado: ${formatearPrecio(
        cotizacion.total
      )}`,
      "",
      "Quedo atento a la confirmación de disponibilidad.",
      "",
      "¡Muchas gracias!"
    ]
      .filter(linea => linea !== "")
      .join("\n");

    const url =
      `https://wa.me/${NUMERO_WHATSAPP}` +
      `?text=${encodeURIComponent(mensaje)}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  });

  actualizarCotizacion();
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
    document.getElementById("ficha-producto");

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
