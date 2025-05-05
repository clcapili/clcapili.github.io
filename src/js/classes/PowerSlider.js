class PowerSlider {
    constructor(element, options) {
        this.element = element;
        
        let bulkOptions = JSON.parse(this.element.getAttribute('data-bulk-options') || '{}');
        this.options = __.lang.extend(true, PowerSlider.DEFAULTS, { ...bulkOptions }, typeof options == 'object' && options);
 
        // Core elements
        this.carouselEl = this.element.querySelector('.carousel.slide.flexed-slider');
        this.carouselInner = this.element.querySelector('.carousel-inner');
        this.slides = this.element.querySelectorAll('.carousel-item');
        this.indicatorsContainer = this.element.querySelector('.carousel-indicators');
        this.progressContainer = this.element.querySelector('.progress');
        this.progressThumb = this.element.querySelector('.progress-bar');
       
        // State and values
        this.chunkIndex = 0;
        this.indicatorsArr = [];
        this.bsCarousel = null;
        this.gapValue = parseFloat(getComputedStyle(this.carouselInner).gap);

        this.init();
    }

    init() {
        if (this.carouselEl) {
            this.bsCarousel = new bootstrap.Carousel(this.carouselEl, {
                interval: this.options.slideInterval,
                wrap: true
            });
        }

        if (this.options.dotIndicators) {
            this.initIndicators();
        }

        this.updateLayout();
        this.initEvents();
    }

    initIndicators() {
        if (!this.indicatorsContainer || !this.slides.length) return;

        this.slides.forEach((slide, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';

            btn.setAttribute('data-bs-target', '.carousel-instance');
            btn.setAttribute('data-bs-slide-to', index);
            btn.setAttribute('aria-label', 'Slide ' + (index + 1));

            if (index === 0) {
                btn.classList.add('active');
                btn.setAttribute('aria-current', 'true');
            }

            this.indicatorsContainer.appendChild(btn);
            this.indicatorsArr.push(btn);

            btn.addEventListener('click', () => this.goToIndexByClick(index));
        });
    }

    initEvents() {
        window.addEventListener('resize', () => this.updateLayout());

        if (this.carouselEl) {
            this.carouselEl.addEventListener('slide.bs.carousel', (event) => this.handleSlide(event));
            this.carouselEl.addEventListener('slid.bs.carousel', () => this.handleSlid());
        }
    }

    getBreakpoint() {
        const windowSize = window.innerWidth;
        if (windowSize < 768) return 'mobile';
        if (windowSize < 992) return 'tablet';
        return 'desktop';
    }

    getSlidesPerView() {
        const theBreakpoint = this.getBreakpoint();
        return this.options.slidesperview[theBreakpoint];
    }

    isGridMode() {
        const theBreakpoint = this.getBreakpoint();
        return !!this.options.actAsGrid[theBreakpoint];
    }

    getItemsPerRow() {
        const theBreakpoint = this.getBreakpoint();
        return this.options.itemsPerRow[theBreakpoint];
    }

    updateProgressBar(currentIndex) {
        if (!this.progressThumb || this.isGridMode()) return;

        const slidesPerView = this.getSlidesPerView();
        const total = this.slides.length;
        let shown = slidesPerView + currentIndex;

        if (shown > total) shown = total;

        const progressWidth = (shown / total) * 100;
        this.progressThumb.style.width = progressWidth + '%';
    }

    highlightIndicators(currentIndex) {
        const slidesPerView = this.getSlidesPerView();
        const first = currentIndex;
        let last = currentIndex + slidesPerView - 1;

        if (last >= this.slides.length) last = this.slides.length - 1;

        this.indicatorsArr.forEach(btn => {
            btn.classList.remove('active');
            btn.removeAttribute('aria-current');
        });

        for (let i = first; i <= last; i++) {
            if (this.indicatorsArr[i]) {
                this.indicatorsArr[i].classList.add('active');
                this.indicatorsArr[i].setAttribute('aria-current', 'true');
            }
        }
    }

    setSlidesWidth() {

        let itemsShown = 0;
        const containerWidth = this.carouselInner.parentElement.clientWidth;

        if(this.isGridMode()) {
            itemsShown = this.getItemsPerRow();
        } else {
            itemsShown = this.getSlidesPerView();
        }

        if (itemsShown > 1) {
            const slideWidthPx = (containerWidth - this.gapValue * (itemsShown - 1)) / itemsShown;

            this.slides.forEach(slide => {
                slide.style.flex = `0 0 ${slideWidthPx}px`;
            });
        } else {
            this.slides.forEach(slide => {
                slide.style.flex = `0 0 ${containerWidth}px`;
            });
        }
    }

    goToChunk(newIndex) {
        this.chunkIndex = newIndex;
        this.carouselInner.style.flexWrap = 'nowrap';

        const slidesPerView = this.getSlidesPerView();
        let offsetPx = 0;

        if (slidesPerView > 1) {
            offsetPx = -(document.getElementsByClassName('carousel-item')[0].clientWidth + this.gapValue) * this.chunkIndex;
        } else {
            offsetPx = -(this.carouselInner.parentElement.clientWidth + this.gapValue) * this.chunkIndex;

        }

        this.carouselInner.style.transform = `translateX(${offsetPx}px)`;

        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.chunkIndex);
        });

        this.highlightIndicators(this.chunkIndex);
        this.updateProgressBar(this.chunkIndex);
    }


    goToIndexByClick(index) {
        if (this.isGridMode()) return;
        
        const slidesPerView = this.getSlidesPerView();
        let newIndex = index - (slidesPerView - 1);
        
        if (newIndex < 0) newIndex = 0;
        
        const lastPos = this.slides.length - slidesPerView;
        
        if (newIndex > lastPos) newIndex = lastPos;
        
        this.goToChunk(newIndex);
    }

    applyGridMode() {
        if (this.bsCarousel) this.bsCarousel.pause();

        const prevBtn = this.element.querySelector('.carousel-control-prev');
        const nextBtn = this.element.querySelector('.carousel-control-next');

        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (this.indicatorsContainer) this.indicatorsContainer.style.display = 'none';
        if (this.progressContainer) this.progressContainer.style.display = 'none';

        this.carouselInner.style.flexWrap = 'wrap';
        
        this.setSlidesWidth();

        this.carouselInner.style.transform = 'translateX(0)';
    }

    showSliderNavigation() {
        const prevBtn = this.element.querySelector('.carousel-control-prev');
        const nextBtn = this.element.querySelector('.carousel-control-next');

        if (prevBtn) prevBtn.style.display = '';
        if (nextBtn) nextBtn.style.display = '';
        if (this.indicatorsContainer) this.indicatorsContainer.style.display = '';
        if (this.progressContainer) this.progressContainer.style.display = '';

        this.goToChunk(this.chunkIndex);
    }

    updateLayout() {
        if (this.isGridMode()) {
            this.applyGridMode();
        } else {
            this.setSlidesWidth();
            this.showSliderNavigation();
        }
    }

    handleSlide(event) {
        if (this.isGridMode()) {
            event.preventDefault();
            return;
        }

        const slidesPerView = this.getSlidesPerView();
        const lastPos = this.slides.length - slidesPerView;

        if (event.direction === 'left') {
            this.chunkIndex++;
            if (this.chunkIndex > lastPos) this.chunkIndex = 0;
        } else {
            this.chunkIndex--;
            if (this.chunkIndex < 0) this.chunkIndex = lastPos;
        }
        
        this.goToChunk(this.chunkIndex);
        event.to = this.chunkIndex;
    }

    handleSlid() {
        if (!this.isGridMode()) {
            this.slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === this.chunkIndex);
            });
            this.highlightIndicators(this.chunkIndex);
        }
    }
}

PowerSlider.DEFAULTS = {
    arrowNavigation: false,
    isBleeding: false,
    autoplay: false,
    playInterval: 5000,
    slidesperview: {
        desktop: 1,
        tablet: 1,
        mobile: 1
    },
    actAsGrid: {
        desktop: false,
        tablet: false,
        mobile: false,
    },
    itemsPerRow: {
        desktop: 1,
        tablet: 1,
        mobile: 1
    },
    dotIndicators: false,
    progressBar: false
};

export default PowerSlider;