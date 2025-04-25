// carousel
const carousels = document.querySelectorAll('.carousel-block');
if (carousels.length > 0) {
    for (let i = 0; i < carousels.length; i++) {
        new Hofstra.PowerSlider(carousels[i]);
    }
}

/* libs.js & site.js generated from Hofstra WP JS (main.js) */