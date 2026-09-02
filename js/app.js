const API_URL =
    "https://script.google.com/macros/s/AKfycbyAl92YO1VnX5yzVG2ueFYCKtP6lGhmB0K4V7CiEDbtCNuCjknRBnB9YhyMTjyJt55O/exec";

const CLAVE_CATALOGO = "insuvenir_productos_v2";

const CLAVE_CATALOGO_LOCAL =
    "insuvenir_catalogo_cache_v1";;

let categoriaSeleccionada = "";
let todosLosProductos = [];
let productosDestacados = [];


/* ===========================
   INICIO
=========================== */

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    prepararBuscador();
    activarSliderHome();
});


/* ===========================
   CARGAR PRODUCTOS
=========================== */

async function cargarProductos() {

    const grilla =
        document.getElementById(
            "grilla-productos"
        );

    if (!grilla) return;


    /* ===========================
       1. INTENTAR CACHE LOCAL
    =========================== */

    const productosCache =
        obtenerCatalogoCache_();


    if (productosCache.length > 0) {

        aplicarCatalogo_(
            productosCache
        );

    } else {

        grilla.innerHTML = `
            <p class="mensaje-catalogo">
                Cargando productos...
            </p>
        `;

    }


    /* ===========================
       2. ACTUALIZAR DESDE API
    =========================== */

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


        if (
            !Array.isArray(productos) ||
            productos.length === 0
        ) {

            throw new Error(
                "La API no devolvió productos válidos."
            );

        }


        /* ===========================
           3. GUARDAR CACHE NUEVA
        =========================== */

        localStorage.setItem(
            CLAVE_CATALOGO_LOCAL,
            JSON.stringify(productos)
        );


        /*
         * Producto.js ya utiliza esta
         * clave en sessionStorage.
         */

        sessionStorage.setItem(
            CLAVE_CATALOGO,
            JSON.stringify(productos)
        );


        /* ===========================
           4. ACTUALIZAR LA PANTALLA
        =========================== */

        aplicarCatalogo_(
            productos
        );


    } catch (error) {

        console.warn(
            "No se pudo actualizar el catálogo desde la API.",
            error
        );


        /*
         * Si ya mostramos la cache,
         * no hacemos nada más.
         */

        if (productosCache.length > 0) {
            return;
        }


        /*
         * Solo mostramos error si tampoco
         * había catálogo guardado.
         */

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
/* ===========================
   LEER CACHE LOCAL
=========================== */

function obtenerCatalogoCache_() {

    try {

        const contenido =
            localStorage.getItem(
                CLAVE_CATALOGO_LOCAL
            );


        if (!contenido) {
            return [];
        }


        const productos =
            JSON.parse(contenido);


        if (
            !Array.isArray(productos) ||
            productos.length === 0
        ) {

            return [];

        }


        return productos;


    } catch (error) {

        console.warn(
            "No se pudo leer la cache del catálogo.",
            error
        );


        localStorage.removeItem(
            CLAVE_CATALOGO_LOCAL
        );


        return [];

    }

}


/* ===========================
   APLICAR CATALOGO
=========================== */

function aplicarCatalogo_(
    productos
) {

    todosLosProductos =
        productos;


    productosDestacados =
        todosLosProductos.filter(
            producto =>
                producto.destacado === true
        );


    /*
     * Dejamos también el catálogo
     * disponible para producto.js.
     */

    sessionStorage.setItem(
        CLAVE_CATALOGO,
        JSON.stringify(
            todosLosProductos
        )
    );


    crearCategorias();

    mostrarDestacados();

}

/* ===========================
   CATEGORIAS
=========================== */

function crearCategorias() {

    const contenedor =
        document.getElementById(
            "grilla-categorias"
        );

    if (!contenedor) return;

    const categorias = [
        ...new Set(
            todosLosProductos
                .map(
                    producto =>
                        String(
                            producto.categoria || ""
                        ).trim()
                )
                .filter(Boolean)
        )
    ].sort(
        (a, b) =>
            a.localeCompare(
                b,
                "es"
            )
    );

    if (categorias.length === 0) {

        contenedor.innerHTML =
            "";

        return;
    }

    contenedor.innerHTML = `

        <button
            type="button"
            class="tarjeta-categoria categoria-activa"
            data-categoria=""
        >

            <span class="icono-categoria">
    <img
        src="img/TODOS.png"
        alt="Todos"
        class="imagen-categoria"
        loading="lazy"
    >
</span>

            <strong>
                TODOS
            </strong>

        </button>


        ${categorias
            .map(
                categoria => `

                    <button
                        type="button"
                        class="tarjeta-categoria"
                        data-categoria="${escaparHTML(
                            categoria
                        )}"
                    >

                        <span class="icono-categoria">
                            ${obtenerIconoCategoria(
                                categoria
                            )}
                        </span>

                        <strong>
                            ${escaparHTML(
                                categoria
                            )}
                        </strong>

                    </button>

                `
            )
            .join("")
        }
    `;

    activarCategorias();
}


/* ===========================
   ACTIVAR CATEGORIAS
=========================== */

function activarCategorias() {

    const botones =
        document.querySelectorAll(
            ".tarjeta-categoria"
        );

    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    botones.forEach(
                        item =>
                            item.classList.remove(
                                "categoria-activa"
                            )
                    );

                    boton.classList.add(
                        "categoria-activa"
                    );

                    categoriaSeleccionada =
                        boton.dataset.categoria ||
                        "";

                    const buscador =
                        document.getElementById(
                            "buscador"
                        );

                    if (buscador) {

                        buscador.value =
                            "";
                    }

                    actualizarTituloResultados(
                        ""
                    );

                    if (
                        !categoriaSeleccionada
                    ) {

                        mostrarProductos(
                            todosLosProductos,
                            "No hay productos disponibles."
                        );

                        return;
                    }

                    const productosCategoria =
                        todosLosProductos.filter(
                            producto =>
                                normalizarTexto(
                                    producto.categoria
                                ) ===
                                normalizarTexto(
                                    categoriaSeleccionada
                                )
                        );

                    mostrarProductos(
                        productosCategoria,
                        "No hay productos en esta categoría."
                    );

                    document
                        .getElementById(
                            "productos"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });
                }
            );
        }
    );
}


/* ===========================
   ICONOS CATEGORIAS
=========================== */

function obtenerIconoCategoria(
    categoria
) {

    const imagenes = {

        TODOS:
            "img/TODOS.png",

        VASOS:
            "img/VASOS.png",

        VALIJITAS:
            "img/VALIJITAS.png",

        BOTELLITAS:
            "img/BOTELLITAS.png",

        BALDECITOS:
            "img/BALDECITOS.png",

        BOLSITAS:
            "img/BOLSITAS.png",

        LUNCHERAS:
            "img/LUNCHERAS.png",

        ACCESORIOS:
            "img/ACCESORIOS.png"
    };

    const clave =
        normalizarTexto(
            categoria
        ).toUpperCase();

    const imagen =
        imagenes[clave];

    if (!imagen) {
        return "✨";
    }

    return `
        <img
            src="${imagen}"
            alt="${escaparHTML(
                categoria
            )}"
            class="imagen-categoria"
            loading="lazy"
        >
    `;
}


/* ===========================
   BUSCADOR
=========================== */

function prepararBuscador() {

    const buscador =
        document.getElementById(
            "buscador"
        );

    if (!buscador) return;

    buscador.addEventListener(
        "input",
        () => {

            const consultaOriginal =
                buscador.value.trim();

            const consulta =
                normalizarTexto(
                    consultaOriginal
                );

            if (!consulta) {

                mostrarDestacados();

                return;
            }

            const resultados =
                todosLosProductos.filter(
                    producto =>
                        productoCoincide(
                            producto,
                            consulta
                        )
                );

            mostrarResultadosBusqueda(
                resultados,
                consultaOriginal
            );
        }
    );
}


/* ===========================
   BUSQUEDA INTELIGENTE
=========================== */

function productoCoincide(
    producto,
    consulta
) {

    const campos = [
        producto.producto,
        producto.descripcion,
        producto.familia,
        producto.categoria
    ];

    return campos.some(
        campo =>
            textoCoincide(
                normalizarTexto(
                    campo
                ),
                consulta
            )
    );
}


function textoCoincide(
    texto,
    consulta
) {

    if (
        !texto ||
        !consulta
    ) {

        return false;
    }

    if (
        texto.includes(
            consulta
        )
    ) {

        return true;
    }

    const palabrasTexto =
        texto.split(
            /\s+/
        );

    const palabrasConsulta =
        consulta.split(
            /\s+/
        );

    return palabrasConsulta.every(
        palabraBuscada =>
            palabrasTexto.some(
                palabraTexto =>
                    palabrasSimilares(
                        palabraTexto,
                        palabraBuscada
                    )
            )
    );
}


/* ===========================
   SIMILITUD
=========================== */

function palabrasSimilares(
    palabra1,
    palabra2
) {

    if (
        palabra1.includes(
            palabra2
        ) ||
        palabra2.includes(
            palabra1
        )
    ) {

        return true;
    }

    const singular1 =
        quitarPlural(
            palabra1
        );

    const singular2 =
        quitarPlural(
            palabra2
        );

    if (
        singular1 ===
        singular2
    ) {

        return true;
    }

    const distancia =
        distanciaLevenshtein(
            palabra1,
            palabra2
        );

    const largo =
        Math.max(
            palabra1.length,
            palabra2.length
        );

    if (
        largo <= 4
    ) {

        return distancia <= 1;
    }

    if (
        largo <= 8
    ) {

        return distancia <= 2;
    }

    return distancia <= 3;
}


function quitarPlural(
    palabra
) {

    if (
        palabra.length > 4 &&
        palabra.endsWith(
            "es"
        )
    ) {

        return palabra.slice(
            0,
            -2
        );
    }

    if (
        palabra.length > 3 &&
        palabra.endsWith(
            "s"
        )
    ) {

        return palabra.slice(
            0,
            -1
        );
    }

    return palabra;
}


function distanciaLevenshtein(
    a,
    b
) {

    const matriz =
        Array.from(
            {
                length:
                    b.length + 1
            },
            () =>
                new Array(
                    a.length + 1
                ).fill(0)
        );

    for (
        let i = 0;
        i <= b.length;
        i++
    ) {

        matriz[i][0] =
            i;
    }

    for (
        let j = 0;
        j <= a.length;
        j++
    ) {

        matriz[0][j] =
            j;
    }

    for (
        let i = 1;
        i <= b.length;
        i++
    ) {

        for (
            let j = 1;
            j <= a.length;
            j++
        ) {

            if (
                b[i - 1] ===
                a[j - 1]
            ) {

                matriz[i][j] =
                    matriz[
                        i - 1
                    ][
                        j - 1
                    ];

            } else {

                matriz[i][j] =
                    Math.min(
                        matriz[
                            i - 1
                        ][
                            j - 1
                        ] + 1,

                        matriz[
                            i
                        ][
                            j - 1
                        ] + 1,

                        matriz[
                            i - 1
                        ][
                            j
                        ] + 1
                    );
            }
        }
    }

    return matriz[
        b.length
    ][
        a.length
    ];
}


/* ===========================
   DESTACADOS
=========================== */

function mostrarDestacados() {

    const productosAMostrar =
        productosDestacados.length > 0
            ? productosDestacados
            : todosLosProductos.slice(
                0,
                6
            );

    actualizarTituloResultados(
        ""
    );

    mostrarProductos(
        productosAMostrar,
        "Todavía no hay productos destacados."
    );
}


/* ===========================
   RESULTADOS BUSQUEDA
=========================== */

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


function actualizarTituloResultados(
    texto
) {

    const resultado =
        document.getElementById(
            "resultado-busqueda"
        );

    if (resultado) {

        resultado.textContent =
            texto;
    }
}


/* ===========================
   MOSTRAR PRODUCTOS
=========================== */

function mostrarProductos(
    productos,
    mensajeVacio
) {

    const grilla =
        document.getElementById(
            "grilla-productos"
        );

    if (!grilla) return;

    if (
        productos.length === 0
    ) {

        grilla.innerHTML = `
            <p class="mensaje-catalogo">
                ${escaparHTML(
                    mensajeVacio
                )}
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
   TARJETA PRODUCTO
=========================== */

function crearTarjetaProducto(
    producto
) {

    const nombre =
        escaparHTML(
            producto.producto ||
            "Producto"
        );

    const precio =
        formatearPrecio(
            producto.precio1
        );

    const stock =
        Number(
            producto.stock ||
            0
        );

    const estado =
        escaparHTML(
            producto.estado ||
            (
                stock > 0
                    ? "Disponible"
                    : "Sin stock"
            )
        );

    const claseEstado =
        stock > 0
            ? "estado-disponible"
            : "estado-sin-stock";

    const imagen =
        obtenerImagen(
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
                    class="boton-producto"
                    href="${urlProducto}"
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
            idFoto ||
            ""
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
            onerror="
                this.parentElement.innerHTML =
                '<div class=&quot;foto-placeholder&quot;><span>INSUVENIR</span><small>Foto no disponible</small></div>'
            "
        >
    `;
}


/* ===========================
   PRECIO
=========================== */

function formatearPrecio(
    valor
) {

    const numero =
        Number(
            valor ||
            0
        );

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    ).format(
        numero
    );
}


/* ===========================
   NORMALIZAR TEXTO
=========================== */

function normalizarTexto(
    valor
) {

    return String(
        valor ||
        ""
    )
        .trim()
        .toLowerCase()
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );
}


/* ===========================
   HTML SEGURO
=========================== */

function escaparHTML(
    texto
) {

    return String(
        texto
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* ===========================
   SLIDER HOME
=========================== */

function activarSliderHome() {

    const slides =
        document.querySelectorAll(
            ".slide"
        );

    const puntos =
        document.querySelectorAll(
            ".slider-punto"
        );

    if (
        slides.length === 0
    ) {

        return;
    }

    let indiceActual =
        0;

    let temporizador =
        null;


    function mostrarSlide(
        indice
    ) {

        if (
            indice < 0 ||
            indice >= slides.length
        ) {

            return;
        }

        slides.forEach(
            slide =>
                slide.classList.remove(
                    "activo"
                )
        );

        puntos.forEach(
            punto =>
                punto.classList.remove(
                    "activo"
                )
        );

        slides[indice]
            .classList.add(
                "activo"
            );

        if (
            puntos[indice]
        ) {

            puntos[indice]
                .classList.add(
                    "activo"
                );
        }

        indiceActual =
            indice;
    }


    function siguienteSlide() {

        const nuevoIndice =
            (
                indiceActual + 1
            ) % slides.length;

        mostrarSlide(
            nuevoIndice
        );
    }


    function iniciarCambioAutomatico() {

        if (
            temporizador
        ) {

            clearInterval(
                temporizador
            );
        }

        if (
            slides.length <= 1
        ) {

            return;
        }

        temporizador =
            setInterval(
                siguienteSlide,
                5000
            );
    }


    puntos.forEach(
        punto => {

            punto.addEventListener(
                "click",
                () => {

                    const indice =
                        Number(
                            punto.dataset.slide
                        );

                    if (
                        !Number.isInteger(
                            indice
                        )
                    ) {

                        return;
                    }

                    mostrarSlide(
                        indice
                    );

                    iniciarCambioAutomatico();
                }
            );
        }
    );


    mostrarSlide(
        0
    );

    iniciarCambioAutomatico();
}
