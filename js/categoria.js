const API_URL =
"https://script.google.com/macros/s/AKfycbyAl92YO1VnX5yzVG2ueFYCKtP6lGhmB0K4V7CiEDbtCNuCjknRBnB9YhyMTjyJt55O/exec";


document.addEventListener(
    "DOMContentLoaded",
    cargarCategoria
);


async function cargarCategoria() {

    const slug =
        obtenerSlugCategoria();

    if (!slug) {

        mostrarError(
            "No encontramos esta categoría."
        );

        return;
    }


    const categoria =
        slug
            .replaceAll("-", " ")
            .trim()
            .toUpperCase();


    actualizarEncabezado(
        categoria
    );


    try {

        const respuesta =
            await fetch(
                API_URL,
                {
                    cache: "no-store"
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo consultar la API."
            );
        }


        const productos =
            await respuesta.json();


        if (!Array.isArray(productos)) {

            throw new Error(
                "La API devolvió un formato incorrecto."
            );
        }


        const productosCategoria =
            productos.filter(
                producto =>
                    normalizarTexto(
                        producto.categoria
                    ) ===
                    normalizarTexto(
                        categoria
                    )
            );


        mostrarProductos(
            productosCategoria
        );


    } catch (error) {

        console.error(error);

        mostrarError(
            "No pudimos cargar los productos."
        );
    }
}


/* ===========================
   DETECTAR CATEGORIA
=========================== */

function obtenerSlugCategoria() {

    const partes =
        window.location.pathname
            .split("/")
            .filter(Boolean);

    return partes.length > 0
        ? partes[0].toLowerCase()
        : "";
}


/* ===========================
   TITULO Y SEO
=========================== */

function actualizarEncabezado(
    categoria
) {

    const nombre =
        formatearNombreCategoria(
            categoria
        );


    const titulo =
        document.getElementById(
            "titulo-categoria"
        );

    const descripcion =
        document.getElementById(
            "descripcion-categoria"
        );


    if (titulo) {

        titulo.textContent =
            nombre;
    }


    if (descripcion) {

        descripcion.textContent =
            `Explorá nuestros productos de ${nombre.toLowerCase()} y consultá stock, colores y precios por cantidad.`;
    }


    document.title =
        `${nombre} | Insuvenir`;


    const meta =
        document.getElementById(
            "meta-description"
        );


    if (meta) {

        meta.setAttribute(
            "content",
            `${nombre} para souvenirs. Consultá productos, stock, colores y precios por cantidad en Insuvenir.`
        );
    }
}


/* ===========================
   MOSTRAR PRODUCTOS
=========================== */

function mostrarProductos(
    productos
) {

    const grilla =
        document.getElementById(
            "grilla-categoria"
        );


    if (!grilla) return;


    if (productos.length === 0) {

        grilla.innerHTML = `
            <p class="mensaje-catalogo">
                No hay productos disponibles
                en esta categoría.
            </p>
        `;

        return;
    }


    grilla.innerHTML =
        productos
            .map(
                crearTarjetaProducto
            )
            .join("");
}


/* ===========================
   TARJETA
=========================== */

function crearTarjetaProducto(
    producto
) {

    const nombre =
        escaparHTML(
            producto.producto ||
            "Producto"
        );


    const stock =
        Number(
            producto.stock || 0
        );


    const precio =
        formatearPrecio(
            producto.precio1
        );


    const estado =
        stock > 0
            ? "Disponible"
            : "Sin stock";


    const claseEstado =
        stock > 0
            ? "estado-disponible"
            : "estado-sin-stock";


    const imagen =
        obtenerImagen(
            producto.idFoto,
            nombre
        );


    const url =
        `/producto.html?familia=${encodeURIComponent(
            producto.familia
        )}`;


    return `

        <article class="producto">

            <div class="foto">

                ${imagen}

            </div>


            <div class="producto-contenido">

                <span
                    class="estado-producto ${claseEstado}"
                >
                    ${estado}
                </span>


                <h3>
                    ${nombre}
                </h3>


                <p class="precio">
                    ${precio}
                </p>


                <a
                    href="${url}"
                    class="boton-producto"
                >
                    Ver producto
                </a>

            </div>

        </article>
    `;
}


/* ===========================
   IMAGEN
=========================== */

function obtenerImagen(
    idFoto,
    nombre
) {

    const id =
        String(
            idFoto || ""
        ).trim();


    if (!id) {

        return `
            <div class="foto-placeholder">

                <span>
                    INSUVENIR
                </span>

                <small>
                    Próximamente foto
                </small>

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
        >
    `;
}


/* ===========================
   ERROR
=========================== */

function mostrarError(
    mensaje
) {

    const grilla =
        document.getElementById(
            "grilla-categoria"
        );


    if (!grilla) return;


    grilla.innerHTML = `
        <div class="mensaje-error">

            <strong>
                ${escaparHTML(mensaje)}
            </strong>

        </div>
    `;
}


/* ===========================
   UTILIDADES
=========================== */

function formatearNombreCategoria(
    categoria
) {

    const texto =
        String(
            categoria || ""
        ).toLowerCase();


    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );
}


function formatearPrecio(
    valor
) {

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    ).format(
        Number(
            valor || 0
        )
    );
}


function normalizarTexto(
    valor
) {

    return String(
        valor || ""
    )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );
}


function escaparHTML(
    texto
) {

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
