/* ===========================
   CARRITO INSUVENIR
=========================== */

const CLAVE_CARRITO = "insuvenir_carrito_v1";
const WHATSAPP_CARRITO = "5492233464815";


document.addEventListener(
    "DOMContentLoaded",
    () => {
        crearInterfazCarrito_();
        renderizarCarrito_();
    }
);


/* ===========================
   API PUBLICA
=========================== */

window.InsuvenirCarrito = {

    agregar(datos) {

        const carrito = leerCarrito_();

        const familia =
            String(datos.familia || "").trim();

        const color =
            String(datos.color || "").trim();

        const cantidad =
            Math.max(
                1,
                Number(datos.cantidad || 1)
            );

        const stockMax =
            Math.max(
                0,
                Number(datos.stockMax || 0)
            );

        const clave =
            crearClaveItem_(
                familia,
                color
            );

        const existente =
            carrito.find(
                item =>
                    item.clave === clave
            );


        if (existente) {

            const nuevaCantidad =
                existente.cantidad +
                cantidad;

            existente.cantidad =
                Math.min(
                    nuevaCantidad,
                    stockMax
                );

            existente.stockMax =
                stockMax;

        } else {

            carrito.push({

                clave,

                familia,

                nombre:
                    String(
                        datos.nombre ||
                        "Producto"
                    ),

                color,

                cantidad:
                    Math.min(
                        cantidad,
                        stockMax
                    ),

                stockMax,

                precio1:
                    Number(
                        datos.precio1 || 0
                    ),

                precio2:
                    Number(
                        datos.precio2 || 0
                    ),

                precio3:
                    Number(
                        datos.precio3 || 0
                    ),

                foto:
                    String(
                        datos.foto || ""
                    )

            });

        }


        guardarCarrito_(carrito);

        renderizarCarrito_();

        mostrarAvisoCarrito_(
            "Agregado al carrito ✓"
        );

        return true;
    },


    abrir() {
        abrirCarrito_();
    },


    cantidad() {
        return leerCarrito_().length;
    }

};


/* ===========================
   STORAGE
=========================== */

function leerCarrito_() {

    try {

        const contenido =
            localStorage.getItem(
                CLAVE_CARRITO
            );

        if (!contenido) {
            return [];
        }

        const carrito =
            JSON.parse(contenido);

        return Array.isArray(carrito)
            ? carrito
            : [];

    } catch (error) {

        console.error(
            "No se pudo leer el carrito.",
            error
        );

        return [];

    }

}


function guardarCarrito_(carrito) {

    localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
    );

}


/* ===========================
   CLAVE PRODUCTO + COLOR
=========================== */

function crearClaveItem_(
    familia,
    color
) {

    return (
        String(familia).trim() +
        "__" +
        String(color || "")
            .trim()
            .toUpperCase()
    );

}


/* ===========================
   INTERFAZ
=========================== */

function crearInterfazCarrito_() {

    if (
        document.getElementById(
            "carrito-panel"
        )
    ) {
        return;
    }


    /* BOTON HEADER */

    const menuDerecha =
        document.querySelector(
            ".menu-derecha"
        );

    if (menuDerecha) {

        const boton =
            document.createElement(
                "button"
            );

        boton.type = "button";

        boton.className =
            "carrito-header";

        boton.setAttribute(
            "aria-label",
            "Abrir carrito"
        );

        boton.innerHTML = `
            <span class="carrito-header-icono">
                🛒
            </span>

            <span
                class="carrito-contador"
                id="carrito-contador"
            >
                0
            </span>
        `;

        boton.addEventListener(
            "click",
            abrirCarrito_
        );

        menuDerecha.appendChild(
            boton
        );

    }


    /* OVERLAY */

    const overlay =
        document.createElement(
            "div"
        );

    overlay.className =
        "carrito-overlay";

    overlay.id =
        "carrito-overlay";

    overlay.addEventListener(
        "click",
        cerrarCarrito_
    );


    /* PANEL */

    const panel =
        document.createElement(
            "aside"
        );

    panel.className =
        "carrito-panel";

    panel.id =
        "carrito-panel";

    panel.innerHTML = `

        <div class="carrito-panel-header">

            <h2>
                Tu pedido
            </h2>

            <button
                type="button"
                class="carrito-cerrar"
                id="carrito-cerrar"
                aria-label="Cerrar carrito"
            >
                ×
            </button>

        </div>


        <div
            class="carrito-items"
            id="carrito-items"
        ></div>


        <div class="carrito-panel-footer">

            <div class="carrito-total">

                <span>
                    Total estimado
                </span>

                <strong
                    id="carrito-total"
                >
                    $ 0
                </strong>

            </div>


            <button
                type="button"
                class="carrito-finalizar"
                id="carrito-finalizar"
            >
                Finalizar pedido por WhatsApp
            </button>


            <button
                type="button"
                class="carrito-vaciar"
                id="carrito-vaciar"
            >
                Vaciar carrito
            </button>

        </div>

    `;


    document.body.appendChild(
        overlay
    );

    document.body.appendChild(
        panel
    );


    document
        .getElementById(
            "carrito-cerrar"
        )
        .addEventListener(
            "click",
            cerrarCarrito_
        );


    document
        .getElementById(
            "carrito-finalizar"
        )
        .addEventListener(
            "click",
            finalizarCarrito_
        );


    document
        .getElementById(
            "carrito-vaciar"
        )
        .addEventListener(
            "click",
            vaciarCarrito_
        );

}


/* ===========================
   ABRIR / CERRAR
=========================== */

function abrirCarrito_() {

    document
        .getElementById(
            "carrito-panel"
        )
        ?.classList.add(
            "carrito-panel-abierto"
        );

    document
        .getElementById(
            "carrito-overlay"
        )
        ?.classList.add(
            "carrito-overlay-visible"
        );

}


function cerrarCarrito_() {

    document
        .getElementById(
            "carrito-panel"
        )
        ?.classList.remove(
            "carrito-panel-abierto"
        );

    document
        .getElementById(
            "carrito-overlay"
        )
        ?.classList.remove(
            "carrito-overlay-visible"
        );

}


/* ===========================
   RENDER
=========================== */

function renderizarCarrito_() {

    const carrito =
        leerCarrito_();

    const contador =
        document.getElementById(
            "carrito-contador"
        );

    if (contador) {

        contador.textContent =
            carrito.length;

        contador.style.display =
            carrito.length > 0
                ? "flex"
                : "none";

    }


    const contenedor =
        document.getElementById(
            "carrito-items"
        );

    if (!contenedor) {
        return;
    }


    if (carrito.length === 0) {

        contenedor.innerHTML = `

            <div class="carrito-vacio">

                <span>
                    🛒
                </span>

                <p>
                    Todavía no agregaste productos.
                </p>

                <small>
                    Podés seguir recorriendo el catálogo.
                </small>

            </div>

        `;

        actualizarTotalCarrito_(
            carrito
        );

        return;
    }


    contenedor.innerHTML =
        carrito
            .map(
                (item, indice) => {

                    const precio =
                        obtenerPrecioItem_(
                            item
                        );

                    const subtotal =
                        precio *
                        item.cantidad;


                    return `

                        <article
                            class="carrito-item"
                        >

                            ${
                                item.foto
                                    ? `
                                        <img
                                            src="${item.foto}"
                                            alt=""
                                            class="carrito-item-foto"
                                        >
                                    `
                                    : ""
                            }


                            <div class="carrito-item-info">

                                <strong class="carrito-item-nombre">
                                    ${escaparCarrito_(item.nombre)}
                                </strong>


                                ${
                                    item.color
                                        ? `
                                            <span class="carrito-item-color">
                                                Color: ${escaparCarrito_(item.color)}
                                            </span>
                                        `
                                        : ""
                                }


                                <span class="carrito-item-precio">
                                    ${formatearCarrito_(precio)} c/u
                                </span>


                                <div class="carrito-item-controles">

                                    <button
                                        type="button"
                                        data-accion="restar"
                                        data-indice="${indice}"
                                    >
                                        −
                                    </button>


                                    <span>
                                        ${item.cantidad}
                                    </span>


                                    <button
                                        type="button"
                                        data-accion="sumar"
                                        data-indice="${indice}"
                                    >
                                        +
                                    </button>


                                    <button
                                        type="button"
                                        class="carrito-quitar"
                                        data-accion="quitar"
                                        data-indice="${indice}"
                                    >
                                        Quitar
                                    </button>

                                </div>


                                <strong class="carrito-item-subtotal">
                                    ${formatearCarrito_(subtotal)}
                                </strong>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    contenedor
        .querySelectorAll(
            "[data-accion]"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    manejarAccionItem_
                );

            }
        );


    actualizarTotalCarrito_(
        carrito
    );

}


/* ===========================
   SUMAR / RESTAR / QUITAR
=========================== */

function manejarAccionItem_(evento) {

    const boton =
        evento.currentTarget;

    const indice =
        Number(
            boton.dataset.indice
        );

    const accion =
        boton.dataset.accion;

    const carrito =
        leerCarrito_();

    const item =
        carrito[indice];

    if (!item) {
        return;
    }


    if (accion === "sumar") {

        if (
            item.cantidad <
            item.stockMax
        ) {

            item.cantidad++;

        } else {

            mostrarAvisoCarrito_(
                "Alcanzaste el stock disponible."
            );

        }

    }


    if (accion === "restar") {

        item.cantidad =
            Math.max(
                1,
                item.cantidad - 1
            );

    }


    if (accion === "quitar") {

        carrito.splice(
            indice,
            1
        );

    }


    guardarCarrito_(
        carrito
    );

    renderizarCarrito_();

}


/* ===========================
   PRECIO
=========================== */

function obtenerPrecioItem_(
    item
) {

    const cantidad =
        Number(
            item.cantidad || 1
        );


    if (cantidad >= 50) {

        return Number(
            item.precio3 || 0
        );

    }


    if (cantidad >= 20) {

        return Number(
            item.precio2 || 0
        );

    }


    return Number(
        item.precio1 || 0
    );

}


/* ===========================
   TOTAL
=========================== */

function actualizarTotalCarrito_(
    carrito
) {

    const total =
        carrito.reduce(
            (acumulado, item) => {

                return (
                    acumulado +
                    obtenerPrecioItem_(item) *
                    Number(item.cantidad || 0)
                );

            },
            0
        );


    const elemento =
        document.getElementById(
            "carrito-total"
        );

    if (elemento) {

        elemento.textContent =
            formatearCarrito_(
                total
            );

    }

}


/* ===========================
   VACIAR
=========================== */

function vaciarCarrito_() {

    localStorage.removeItem(
        CLAVE_CARRITO
    );

    renderizarCarrito_();

}


/* ===========================
   WHATSAPP
=========================== */

function finalizarCarrito_() {

    const carrito =
        leerCarrito_();

    if (
        carrito.length === 0
    ) {

        mostrarAvisoCarrito_(
            "El carrito está vacío."
        );

        return;
    }


    let total = 0;


    const lineas = [

        "¡Hola! Quiero realizar el siguiente pedido:",
        ""

    ];


    carrito.forEach(
        item => {

            const precio =
                obtenerPrecioItem_(
                    item
                );

            const subtotal =
                precio *
                item.cantidad;

            total += subtotal;


            lineas.push(
                `• ${item.nombre}`
            );


            if (item.color) {

                lineas.push(
                    `  Color: ${item.color}`
                );

            }


            lineas.push(
                `  Cantidad: ${item.cantidad} unidades`
            );

            lineas.push(
                `  Precio unitario: ${formatearCarrito_(precio)}`
            );

            lineas.push(
                `  Subtotal: ${formatearCarrito_(subtotal)}`
            );

            lineas.push("");

        }
    );


    lineas.push(
        `TOTAL ESTIMADO: ${formatearCarrito_(total)}`
    );

    lineas.push("");

    lineas.push(
        "Quedo atento a la confirmación de disponibilidad."
    );


    const mensaje =
        lineas.join("\n");


    const url =
        `https://wa.me/${WHATSAPP_CARRITO}` +
        `?text=${encodeURIComponent(mensaje)}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* ===========================
   AVISO
=========================== */

function mostrarAvisoCarrito_(
    mensaje
) {

    let aviso =
        document.getElementById(
            "aviso-carrito"
        );


    if (!aviso) {

        aviso =
            document.createElement(
                "div"
            );

        aviso.id =
            "aviso-carrito";

        aviso.className =
            "aviso-carrito";

        document.body.appendChild(
            aviso
        );

    }


    aviso.textContent =
        mensaje;


    aviso.classList.add(
        "aviso-carrito-visible"
    );


    clearTimeout(
        aviso._temporizador
    );


    aviso._temporizador =
        setTimeout(
            () => {

                aviso.classList.remove(
                    "aviso-carrito-visible"
                );

            },
            1800
        );

}


/* ===========================
   FORMATO
=========================== */

function formatearCarrito_(
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
        Number(valor || 0)
    );

}


/* ===========================
   HTML SEGURO
=========================== */

function escaparCarrito_(
    texto
) {

    return String(
        texto || ""
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
