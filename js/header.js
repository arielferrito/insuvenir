document.addEventListener(
    "DOMContentLoaded",
    () => {

        activarHeaderMobileScroll();

        activarMenuCategorias();

    }
);


/* ===========================
   HEADER MOBILE AL SCROLL
=========================== */

function activarHeaderMobileScroll() {

    const header =
        document.querySelector(
            ".header"
        );

    if (!header) {
        return;
    }


    function actualizarHeader() {

        if (
            window.innerWidth > 600
        ) {

            header.classList.remove(
                "header-mobile-reducido"
            );

            return;
        }


        if (
            window.scrollY > 120
        ) {

            header.classList.add(
                "header-mobile-reducido"
            );

        } else {

            header.classList.remove(
                "header-mobile-reducido"
            );

        }

    }


    window.addEventListener(
        "scroll",
        actualizarHeader
    );


    window.addEventListener(
        "resize",
        actualizarHeader
    );


    actualizarHeader();
}


/* ===========================
   MENU CATEGORIAS
=========================== */

function activarMenuCategorias() {

    const menus =
        document.querySelectorAll(
            ".menu-desplegable"
        );


    menus.forEach(
        menu => {

            const boton =
                menu.querySelector(
                    ".menu-desplegable-boton"
                );

            const contenido =
                menu.querySelector(
                    ".menu-desplegable-contenido"
                );


            if (
                !boton ||
                !contenido
            ) {
                return;
            }


            boton.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();
                    evento.stopPropagation();


                    const estabaAbierto =
                        menu.classList.contains(
                            "menu-desplegable-abierto"
                        );


                    document
                        .querySelectorAll(
                            ".menu-desplegable-abierto"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "menu-desplegable-abierto"
                                );

                            }
                        );


                    if (
                        estabaAbierto
                    ) {
                        return;
                    }


                    /* MOBILE:
                       empieza justo debajo
                       del boton Categorias
                    */

                    if (
                        window.innerWidth <= 600
                    ) {

                        const posicionBoton =
                            boton.getBoundingClientRect();


                        contenido.style.setProperty(
                            "--submenu-top",
                            `${posicionBoton.bottom}px`
                        );

                    } else {

                        contenido.style.removeProperty(
                            "--submenu-top"
                        );

                    }


                    menu.classList.add(
                        "menu-desplegable-abierto"
                    );

                }
            );

        }
    );


    /* ===========================
       CERRAR AL TOCAR AFUERA
    =========================== */

    document.addEventListener(
        "click",
        evento => {

            if (
                evento.target.closest(
                    ".menu-desplegable"
                )
            ) {
                return;
            }


            document
                .querySelectorAll(
                    ".menu-desplegable-abierto"
                )
                .forEach(
                    item => {

                        item.classList.remove(
                            "menu-desplegable-abierto"
                        );

                    }
                );

        }
    );

}
