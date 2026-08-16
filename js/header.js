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
