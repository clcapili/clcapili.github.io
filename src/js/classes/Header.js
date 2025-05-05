class Header {
    constructor(element, options) {
        this.element = element;
        this.options = __.lang.extend(true, Header.DEFAULTS, this.element.dataset, typeof options == 'object' && options);

        // desktop
        this.headerDesktop = this.element.querySelector('.header-desktop');
        this.hamburgerDesktop = this.element.querySelector('.menu-hamburger-desktop');
        this.desktopNavItems = this.element.querySelectorAll('.nav-item');
        this.activeDesktopSubMenu = null;

        // mobile
        this.headerMobile = this.element.querySelector('.header-mobile');
        this.hamburgerMobile = this.element.querySelector('.menu-hamburger-mobile');
        this.mobileNavItems = this.element.querySelectorAll('.mobile-nav-item a');
        this.activeMobileSubMenuLink = null;

        // alert
        this.alertElement = document.querySelector('.alert');
        this.mainElement = document.querySelector('.main');
        this.pageHeader = document.querySelector('.page-header');

        this.initAlertListeners();

        // events
        this.initEvents();
    }

    initEvents() {
        // desktop
        this.hamburgerDesktop.addEventListener('click', () => this.toggleDesktopMenu());

        this.desktopNavItems.forEach((item) => {
            const trigger = item.querySelector('.nav-item-label');
            if (trigger) {
                __.event.on(trigger, 'click', (e) => {
                    e.preventDefault();
                    this.showDesktopSubmenu(e, item);
                });

                __.event.on(trigger, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.keyCode === 13) {
                        this.showDesktopSubmenu(e, item);
                    }
                });
            }
        });
        
        // mobile
        this.hamburgerMobile.addEventListener('click', () => this.toggleMobileMenu());

        this.mobileNavItems.forEach((element) => {
            __.event.on(element, 'click', () => this.toggleMobileMenu());
        });

        const mobileSubmenuItems = this.element.querySelectorAll('.mobile-nav-item.with-submenu');
        for (let i = 0; i < mobileSubmenuItems.length; i++) {
            __.event.on(mobileSubmenuItems[i], 'click', (e) => this.showMobileSubmenu(e));
        }
    }

    toggleDesktopMenu() {
        this.hamburgerDesktop.classList.toggle('menu-open');
        this.hamburgerDesktop.classList.toggle('menu-close');
        this.headerDesktop.classList.toggle('open');
        
        document.body.classList.toggle('desktop-menu-open');
        document.documentElement.classList.toggle('desktop-menu-open');
        
        const span = this.hamburgerDesktop.querySelector('span');
        if (span) {
            span.textContent = this.hamburgerDesktop.classList.contains('menu-open') ? 'Close' : 'Menu';
        }
    }

    showDesktopSubmenu(e, menuItem) {
        e.stopPropagation();
    
        const { submenu: submenuId } = menuItem.dataset;
        const submenu = document.getElementById(submenuId);
        if (!submenu) return;
    
        if (menuItem.classList.contains('active')) return;
    
        this.desktopNavItems.forEach((item) => {
            item.classList.remove('active');
            const id = item.dataset.submenu;
            const sub = document.getElementById(id);
            if (sub) sub.classList.remove('open');
        });
    
        const images = this.element.querySelectorAll('.desktop-submenu-img');
        images.forEach(img => {
            img.classList.remove('show');
        });
    
        const activeImg = this.element.querySelector(`.desktop-submenu-img[data-submenu="${submenuId}"]`);
        if (activeImg) activeImg.classList.add('show');
    
        menuItem.classList.add('active');
        submenu.classList.add('open');
    
        this.activeDesktopSubMenu = submenu;
        this.activeDesktopNavItem = menuItem;
    }    
    
    toggleMobileMenu() {
        this.hamburgerMobile.classList.toggle('menu-open');
        this.hamburgerMobile.classList.toggle('menu-close');
        this.headerMobile.classList.toggle('open');
        
        document.body.classList.toggle('mobile-menu-open');
        document.documentElement.classList.toggle('mobile-menu-open');

        if (this.activeMobileSubMenuLink) {
            this.activeMobileSubMenuLink.classList.remove('active');
            this.activeMobileSubMenuLink = null;
        }

        const span = this.hamburgerMobile.querySelector('span');
        if (span) {
            span.textContent = this.hamburgerMobile.classList.contains('menu-open') ? 'Close' : 'Menu';
        }
    }

    showMobileSubmenu(event) {
        const link = event.delegateTarget;
        const isActive = link.classList.contains('active');
        const submenu = link.querySelector('.mobile-submenu');
    
        if (isActive) {
            link.classList.remove('active');
            link.querySelector('.nav-link').blur();

            if (submenu) submenu.classList.remove('open');
            this.activeMobileSubMenuLink = null;
            return;
        }
    
        if (this.activeMobileSubMenuLink && this.activeMobileSubMenuLink !== link) {
            this.activeMobileSubMenuLink.classList.remove('active');
            const previousSubmenu = this.activeMobileSubMenuLink.querySelector('.mobile-submenu');

            if (previousSubmenu) previousSubmenu.classList.remove('open');
        }
    
        link.classList.toggle('active');
        if (submenu) submenu.classList.toggle('open');
    
        this.activeMobileSubMenuLink = link;
    }

    // alert detection and margin adjustements
    initAlertListeners() {
        if (!this.alertElement) return;

        this.adjustMainMargin();

        window.addEventListener('resize', () => {
            this.adjustMainMargin();
        });

        this.alertElement.addEventListener('closed.bs.alert', this.onAlertClosed.bind(this));
    }

    adjustMainMargin() {
        if (!this.alertElement || !this.mainElement) return;

        const alertHeight = this.alertElement.offsetHeight;
        this.mainElement.style.transform = `translateY(${alertHeight}px)`;

        let nextElement = this.mainElement.nextElementSibling;

        while (nextElement) {
            if (nextElement.tagName == "footer") {
                nextElement.style.transform = "translateY(50px)";
                break;
            } else {
                nextElement.style.transform = "translateY(50px)";
            }
            nextElement = nextElement.nextElementSibling;
        }

            if (window.scrollY == 0) {
                window.scrollTo(0, 0);
            }
        }

    onAlertClosed() {
        if (!this.mainElement) return;

        const mainMarginTop = parseInt(window.getComputedStyle(this.mainElement).marginTop) || 0;

        this.mainElement.style.transform = "translateY(0)";

        let nextElement = this.mainElement.nextElementSibling;

        while (nextElement) {
            nextElement.style.transform = "none";
            if (nextElement.tagName.toLowerCase() === "footer") {
                break;
            }
            nextElement = nextElement.nextElementSibling;
        }

        if (window.scrollY == 0) {
            window.scrollTo(0, 0);

        }

        if(this.pageHeader) {
            const pageHeaderMarginTop = parseInt(window.getComputedStyle(this.pageHeader).marginTop) || 0;
            const newHeaderMarginTop = pageHeaderMarginTop - mainMarginTop;
            this.pageHeader.style.marginTop = newHeaderMarginTop + 'px';
        }
    }
}

Header.DEFAULTS = {};

export default Header;