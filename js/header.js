document.addEventListener(
    "DOMContentLoaded",
    () => {
        activarHeaderMobileScroll();
    }
);


function activarHeaderMobileScroll() {

    const header =
        document.querySelector(".header");

    if (!header) {
        return;
    }


    function actualizarHeader() {

        if (window.innerWidth > 600) {

            header.classList.remove(
                "header-mobile-reducido"
            );

            return;
        }


        if (window.scrollY > 120) {

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

document.addEventListener("DOMContentLoaded", () => {

    const menus =
        document.querySelectorAll(
            ".menu-desplegable"
        );

    menus.forEach(menu => {

        const boton =
            menu.querySelector(
                ".menu-desplegable-boton"
            );

        if (!boton) return;


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
                    .forEach(item => {

                        item.classList.remove(
                            "menu-desplegable-abierto"
                        );

                    });


                if (!estabaAbierto) {

    const header =
        document.querySelector(".header");

    const contenido =
        menu.querySelector(
            ".menu-desplegable-contenido"
        );


    if (
        header &&
        contenido &&
        window.innerWidth <= 600
    ) {

        const abajoHeader =
            header.getBoundingClientRect().bottom;

        contenido.style.setProperty(
            "--submenu-top",
            `${abajoHeader}px`
        );

    }


    menu.classList.add(
        "menu-desplegable-abierto"
    );

}

            }
        );

    });


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
                .forEach(item => {

                    item.classList.remove(
                        "menu-desplegable-abierto"
                    );

                });

        }
    );

});
