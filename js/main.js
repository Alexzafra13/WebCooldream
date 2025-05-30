// =============================================
// COOLDREAM - JavaScript Optimizado y Corregido
// =============================================

// Configuración global
const CONFIG = {
    transitions: { fast: 300, smooth: 600, loader: 1500 },
    scroll: { headerOffset: 80, hideThreshold: 500 },
    animation: { threshold: 0.1, margin: '0px 0px -100px 0px', stagger: 100 }
};

// Estado global
const STATE = {
    scroll: { last: 0 },
    video: { current: 'invierno', timeout: null, loaded: {}, promise: null },
    marquee: { 
        dragging: false, 
        startX: 0, 
        position: 0, 
        velocity: 0, 
        hovered: false,
        animationId: null,
        cloneWidth: 0
    },
    carousel: { 
        dragging: false, 
        startX: 0, 
        scrollLeft: 0, 
        velocity: 0,
        hasMoved: false
    }
};

// Cache DOM
const DOM = {};

// =============================================
// UTILIDADES
// =============================================
const utils = {
    throttle(func, delay) {
        let timeout;
        return (...args) => {
            if (!timeout) {
                timeout = setTimeout(() => {
                    func(...args);
                    timeout = null;
                }, delay);
            }
        };
    },
    
    createObserver(callback, options = {}) {
        return new IntersectionObserver(callback, {
            threshold: options.threshold || CONFIG.animation.threshold,
            rootMargin: options.margin || CONFIG.animation.margin
        });
    }
};

// =============================================
// MÓDULOS
// =============================================

// Módulo de Navegación
const Navigation = {
    init() {
        if (!DOM.navbar) return;
        
        window.addEventListener('scroll', utils.throttle(() => this.handleScroll(), 10));
        
        if (DOM.menuToggle) {
            DOM.menuToggle.addEventListener('click', e => this.toggleMenu(e));
            
            // Cerrar menú al hacer click en enlaces
            document.querySelectorAll('nav ul a').forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
            
            // Cerrar menú al hacer click fuera
            document.addEventListener('click', e => {
                if (!DOM.navbar.contains(e.target) && DOM.navUl.classList.contains('active')) {
                    this.closeMenu();
                }
            });
        }
        
        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', e => this.smoothScroll(e));
        });
    },
    
    handleScroll() {
        const current = window.pageYOffset;
        
        DOM.navbar.classList.toggle('scrolled', current > 50);
        
        // Auto-hide navbar
        if (current > STATE.scroll.last && current > CONFIG.scroll.hideThreshold) {
            DOM.navbar.style.transform = 'translateY(-100%)';
        } else {
            DOM.navbar.style.transform = 'translateY(0)';
        }
        
        STATE.scroll.last = current;
        
        // Parallax
        if (DOM.heroCenter) {
            DOM.heroCenter.style.transform = `translateY(${current * 0.3}px)`;
            DOM.heroCenter.style.opacity = 1 - (current * 0.001);
        }
        
        if (DOM.bottomMarquee) {
            DOM.bottomMarquee.style.transform = `translateY(${current * -0.2}px)`;
        }
    },
    
    toggleMenu(e) {
        e.stopPropagation();
        DOM.navUl.classList.toggle('active');
        DOM.menuToggle.classList.toggle('active');
    },
    
    closeMenu() {
        DOM.navUl.classList.remove('active');
        DOM.menuToggle.classList.remove('active');
    },
    
    smoothScroll(e) {
        e.preventDefault();
        const target = document.querySelector(e.currentTarget.getAttribute('href'));
        if (target) {
            const offset = target.getBoundingClientRect().top + window.pageYOffset - CONFIG.scroll.headerOffset;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
    }
};

// Módulo de Videos
const VideoManager = {
    changeTimeout: null,
    
    init() {
        if (!DOM.bgVideos.length) return;
        
        DOM.bgVideos.forEach(video => {
            video.preload = 'none';
            video.style.opacity = '0';
            video.style.transition = 'opacity 0.5s ease';
            
            // Guardar y quitar src
            const src = video.src || video.querySelector('source')?.src;
            if (src) {
                video.dataset.videoSrc = src;
                video.removeAttribute('src');
                video.querySelector('source')?.remove();
            }
        });
        
        // Cargar primer video
        setTimeout(() => {
            const firstVideo = DOM.bgVideos[0];
            if (firstVideo) {
                this.loadVideo(firstVideo);
                STATE.video.current = firstVideo.id.replace('video-', '');
            }
        }, 100);
    },
    
    loadVideo(video) {
        if (!video || STATE.video.loaded[video.id]) {
            if (STATE.video.loaded[video.id]) {
                video.classList.add('active');
                video.style.opacity = '1';
                this.playVideo(video);
            }
            return;
        }
        
        const videoSrc = video.dataset.videoSrc;
        if (videoSrc) {
            const source = document.createElement('source');
            source.src = videoSrc;
            source.type = 'video/mp4';
            video.appendChild(source);
            video.load();
            
            STATE.video.loaded[video.id] = true;
            
            video.addEventListener('loadeddata', () => {
                video.classList.add('active');
                video.style.opacity = '1';
                this.playVideo(video);
            }, { once: true });
        }
    },
    
    playVideo(video) {
        if (!video) return;
        
        if (STATE.video.promise) {
            STATE.video.promise.catch(() => {});
        }
        
        STATE.video.promise = video.play();
        
        if (STATE.video.promise) {
            STATE.video.promise.then(() => {
                STATE.video.promise = null;
            }).catch(error => {
                if (error.name !== 'AbortError') {
                    console.error('Video play error:', error);
                }
                STATE.video.promise = null;
            });
        }
    },
    
    changeVideo(name) {
        if (STATE.video.current === name) return;
        
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = null;
        }
        
        const currentEl = document.getElementById(`video-${STATE.video.current}`);
        if (currentEl) currentEl.style.opacity = '0';
        
        this.changeTimeout = setTimeout(() => {
            DOM.bgVideos.forEach(v => {
                v.classList.remove('active');
                if (!v.paused) v.pause();
            });
            
            const target = document.getElementById(`video-${name}`);
            if (target) {
                if (!STATE.video.loaded[target.id]) {
                    this.loadVideo(target);
                } else {
                    target.classList.add('active');
                    if (target.currentTime > 0) target.currentTime = 0;
                    
                    setTimeout(() => {
                        target.style.opacity = '1';
                        this.playVideo(target);
                    }, 50);
                }
                STATE.video.current = name;
            }
            
            this.changeTimeout = null;
        }, 300);
    }
};

// Módulo Marquee
const Marquee = {
    lastDetectedVideo: null,
    videoDebounceTimeout: null,
    
    init() {
        if (!DOM.marqueeTrack) return;
        
        DOM.marqueeTrack.style.animation = 'none';
        DOM.marqueeTrack.style.cursor = 'grab';
        
        this.createClones();
        this.setupEvents();
        this.updateWidths();
        
        setTimeout(() => {
            if (!STATE.marquee.dragging && !STATE.marquee.hovered) {
                this.startAnimation();
            }
        }, 100);
        
        window.addEventListener('resize', () => this.updateWidths());
    },
    
    createClones() {
        const original = DOM.marqueeTrack.querySelector('.marquee-content');
        if (DOM.marqueeTrack.querySelectorAll('.marquee-content').length > 2) return;
        
        for (let i = 0; i < 2; i++) {
            const clone = original.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            DOM.marqueeTrack.appendChild(clone);
        }
        
        DOM.marqueeTrack.querySelectorAll('.marquee-item').forEach(item => {
            item.addEventListener('mouseenter', () => this.handleItemHover(item));
            item.addEventListener('mouseleave', () => this.handleItemLeave());
        });
    },
    
    updateWidths() {
        const firstContent = DOM.marqueeTrack.querySelector('.marquee-content');
        STATE.marquee.cloneWidth = firstContent.offsetWidth;
    },
    
    setupEvents() {
        // Mouse events
        DOM.marqueeTrack.addEventListener('mousedown', e => this.startDrag(e));
        document.addEventListener('mousemove', e => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // Touch events
        DOM.marqueeTrack.addEventListener('touchstart', e => this.startDrag(e), { passive: false });
        document.addEventListener('touchmove', e => this.drag(e), { passive: false });
        document.addEventListener('touchend', () => this.endDrag());
        
        // Hover events
        DOM.marqueeTrack.addEventListener('mouseenter', () => {
            STATE.marquee.hovered = true;
            this.stopAnimation();
        });
        
        DOM.marqueeTrack.addEventListener('mouseleave', () => {
            STATE.marquee.hovered = false;
            if (!STATE.marquee.dragging) {
                setTimeout(() => {
                    if (!STATE.marquee.dragging && !STATE.marquee.hovered) {
                        this.startAnimation();
                    }
                }, 100);
            }
        });
        
        DOM.marqueeTrack.addEventListener('selectstart', e => e.preventDefault());
    },
    
    startAnimation() {
        if (STATE.marquee.dragging || STATE.marquee.hovered) return;
        
        const speed = 0.5;
        
        const animate = () => {
            if (!STATE.marquee.dragging && !STATE.marquee.hovered) {
                STATE.marquee.position -= speed;
                
                if (Math.abs(STATE.marquee.position) >= STATE.marquee.cloneWidth) {
                    STATE.marquee.position += STATE.marquee.cloneWidth;
                }
                
                DOM.marqueeTrack.style.transform = `translateX(${STATE.marquee.position}px)`;
                STATE.marquee.animationId = requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    stopAnimation() {
        if (STATE.marquee.animationId) {
            cancelAnimationFrame(STATE.marquee.animationId);
            STATE.marquee.animationId = null;
        }
    },
    
    startDrag(e) {
        e.preventDefault();
        STATE.marquee.dragging = true;
        DOM.marqueeTrack.style.cursor = 'grabbing';
        
        this.stopAnimation();
        
        STATE.marquee.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        STATE.marquee.velocity = 0;
    },
    
    drag(e) {
        if (!STATE.marquee.dragging) return;
        
        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const deltaX = currentX - STATE.marquee.startX;
        
        STATE.marquee.velocity = deltaX;
        STATE.marquee.position += deltaX * 0.8;
        
        // Loop infinito
        if (STATE.marquee.position > 0) {
            STATE.marquee.position -= STATE.marquee.cloneWidth;
        } else if (STATE.marquee.position < -STATE.marquee.cloneWidth * 2) {
            STATE.marquee.position += STATE.marquee.cloneWidth;
        }
        
        DOM.marqueeTrack.style.transform = `translateX(${STATE.marquee.position}px)`;
        STATE.marquee.startX = currentX;
        
        this.detectCenterItem();
    },
    
    endDrag() {
        if (!STATE.marquee.dragging) return;
        
        STATE.marquee.dragging = false;
        DOM.marqueeTrack.style.cursor = 'grab';
        
        this.applyMomentum();
    },
    
    applyMomentum() {
        let velocity = STATE.marquee.velocity * 0.5;
        const deceleration = 0.95;
        
        const animate = () => {
            if (Math.abs(velocity) > 0.1) {
                STATE.marquee.position += velocity;
                velocity *= deceleration;
                
                if (STATE.marquee.position > 0) {
                    STATE.marquee.position -= STATE.marquee.cloneWidth;
                } else if (STATE.marquee.position < -STATE.marquee.cloneWidth * 2) {
                    STATE.marquee.position += STATE.marquee.cloneWidth;
                }
                
                DOM.marqueeTrack.style.transform = `translateX(${STATE.marquee.position}px)`;
                this.detectCenterItem();
                
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    if (!STATE.marquee.dragging && !STATE.marquee.hovered) {
                        this.startAnimation();
                    }
                }, 1000);
            }
        };
        
        animate();
    },
    
    detectCenterItem() {
        const centerX = window.innerWidth / 2;
        const allItems = DOM.marqueeTrack.querySelectorAll('.marquee-item');
        let closestItem = null;
        let closestDistance = Infinity;
        
        allItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenterX = rect.left + rect.width / 2;
            const distance = Math.abs(itemCenterX - centerX);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
            
            const scale = Math.max(0.8, 1 - (distance / window.innerWidth) * 0.3);
            const opacity = Math.max(0.6, 1 - (distance / window.innerWidth) * 0.4);
            
            item.style.transform = `scale(${scale})`;
            item.style.opacity = opacity;
        });
        
        if (closestItem && closestItem.dataset.video) {
            const newVideo = closestItem.dataset.video;
            
            if (newVideo !== this.lastDetectedVideo) {
                this.lastDetectedVideo = newVideo;
                
                if (this.videoDebounceTimeout) {
                    clearTimeout(this.videoDebounceTimeout);
                }
                
                this.videoDebounceTimeout = setTimeout(() => {
                    if (!STATE.video.timeout) {
                        VideoManager.changeVideo(newVideo);
                    }
                    this.videoDebounceTimeout = null;
                }, 150);
            }
        }
    },
    
    handleItemHover(item) {
        if (!STATE.marquee.dragging) {
            const videoName = item.dataset.video;
            clearTimeout(STATE.video.timeout);
            STATE.video.timeout = null;
            VideoManager.changeVideo(videoName);
        }
    },
    
    handleItemLeave() {
        if (!STATE.marquee.dragging) {
            clearTimeout(STATE.video.timeout);
            STATE.video.timeout = setTimeout(() => {
                this.detectCenterItem();
                STATE.video.timeout = null;
            }, 500);
        }
    }
};

// Módulo Carousel
const Carousel = {
    wheelTimeout: null,
    momentumId: null,
    
    init() {
        if (!DOM.carousel || !DOM.cards.length) return;
        
        this.createIndicators();
        this.setupEvents();
        this.updateButtons();
        this.snapToNearest();
    },
    
    createIndicators() {
        DOM.cards.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.scrollToCard(index));
            DOM.indicators.appendChild(indicator);
        });
    },
    
    setupEvents() {
        // Botones de navegación
        if (DOM.prevBtn && DOM.nextBtn) {
            DOM.prevBtn.addEventListener('click', () => {
                const currentIndex = this.getNearestCard();
                if (currentIndex > 0) this.scrollToCard(currentIndex - 1);
            });
            
            DOM.nextBtn.addEventListener('click', () => {
                const currentIndex = this.getNearestCard();
                if (currentIndex < DOM.cards.length - 1) this.scrollToCard(currentIndex + 1);
            });
        }
        
        // Drag events
        DOM.carousel.addEventListener('mousedown', e => this.startDrag(e));
        DOM.carousel.addEventListener('touchstart', e => this.startDrag(e), { passive: true });
        DOM.carousel.addEventListener('mousemove', e => this.drag(e));
        DOM.carousel.addEventListener('touchmove', e => this.drag(e), { passive: false });
        DOM.carousel.addEventListener('mouseup', () => this.endDrag());
        DOM.carousel.addEventListener('touchend', () => this.endDrag());
        DOM.carousel.addEventListener('mouseleave', () => this.endDrag());
        
        // Scroll event
        DOM.carousel.addEventListener('scroll', () => {
            this.updateButtons();
            const nearestIndex = this.getNearestCard();
            this.updateActiveCard(nearestIndex);
        });
        
        // Wheel event
        DOM.carousel.addEventListener('wheel', e => {
            e.preventDefault();
            DOM.carousel.scrollLeft += e.deltaY;
            
            clearTimeout(this.wheelTimeout);
            this.wheelTimeout = setTimeout(() => this.snapToNearest(), 150);
        }, { passive: false });
        
        // Fix para enlaces en móvil
        this.setupMobileLinks();
    },
    
    scrollToCard(index) {
        const card = DOM.cards[index];
        if (!card) return;
        
        const cardRect = card.getBoundingClientRect();
        const containerRect = DOM.carousel.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const offset = cardCenter - containerCenter;
        
        DOM.carousel.scrollTo({
            left: DOM.carousel.scrollLeft + offset,
            behavior: 'smooth'
        });
        
        this.updateActiveCard(index);
    },
    
    updateActiveCard(index) {
        DOM.cards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
            card.classList.toggle('prev', i < index);
            card.classList.toggle('next', i > index);
        });
        
        document.querySelectorAll('.indicator').forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    },
    
    getNearestCard() {
        const containerRect = DOM.carousel.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        
        DOM.cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(cardCenter - containerCenter);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });
        
        return nearestIndex;
    },
    
    updateButtons() {
        const currentIndex = this.getNearestCard();
        if (DOM.prevBtn && DOM.nextBtn) {
            DOM.prevBtn.disabled = currentIndex === 0;
            DOM.nextBtn.disabled = currentIndex === DOM.cards.length - 1;
        }
    },
    
    startDrag(e) {
        if (e.target.closest('.video-link')) return;
        
        STATE.carousel.dragging = true;
        STATE.carousel.hasMoved = false;
        DOM.carousel.classList.add('dragging');
        STATE.carousel.startX = (e.type.includes('touch') ? e.touches[0].pageX : e.pageX) - DOM.carousel.offsetLeft;
        STATE.carousel.scrollLeft = DOM.carousel.scrollLeft;
        STATE.carousel.startTime = Date.now();
        cancelAnimationFrame(this.momentumId);
    },
    
    drag(e) {
        if (!STATE.carousel.dragging) return;
        
        if (e.target.closest('.video-link')) {
            STATE.carousel.dragging = false;
            DOM.carousel.classList.remove('dragging');
            return;
        }
        
        const x = (e.type.includes('touch') ? e.touches[0].pageX : e.pageX) - DOM.carousel.offsetLeft;
        const walk = (STATE.carousel.startX - x) * 1.5;
        
        if (Math.abs(walk) > 5) {
            STATE.carousel.hasMoved = true;
            if (e.type === 'touchmove' && STATE.carousel.hasMoved) {
                e.preventDefault();
            }
        }
        
        DOM.carousel.scrollLeft = STATE.carousel.scrollLeft + walk;
        STATE.carousel.velocity = walk / (Date.now() - STATE.carousel.startTime);
    },
    
    endDrag() {
        if (!STATE.carousel.dragging) return;
        
        STATE.carousel.dragging = false;
        DOM.carousel.classList.remove('dragging');
        
        if (!STATE.carousel.hasMoved) return;
        
        const absVelocity = Math.abs(STATE.carousel.velocity);
        if (absVelocity > 0.5) {
            this.applyMomentum();
        } else {
            this.snapToNearest();
        }
    },
    
    applyMomentum() {
        const deceleration = 0.92;
        
        const animate = () => {
            if (Math.abs(STATE.carousel.velocity) > 0.1) {
                DOM.carousel.scrollLeft += STATE.carousel.velocity * 20;
                STATE.carousel.velocity *= deceleration;
                this.momentumId = requestAnimationFrame(animate);
            } else {
                this.snapToNearest();
            }
        };
        
        animate();
    },
    
    snapToNearest() {
        const nearestIndex = this.getNearestCard();
        this.scrollToCard(nearestIndex);
    },
    
    setupMobileLinks() {
        document.querySelectorAll('.video-link').forEach(link => {
            link.addEventListener('click', e => {
                if (STATE.carousel.hasMoved || DOM.carousel.classList.contains('dragging')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            
            link.addEventListener('mousedown', e => {
                e.stopPropagation();
            });
        });
    }
};

// Módulo de Animaciones
const Animations = {
    init() {
        const observer = utils.createObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    if (entry.target.classList.contains('video-card')) {
                        this.animateVideoCard(entry.target);
                    } else if (entry.target.classList.contains('tour-item')) {
                        this.animateTourItem(entry.target);
                    } else if (entry.target.classList.contains('section-header')) {
                        this.animateSectionHeader(entry.target);
                    }
                }
            });
        });
        
        DOM.observeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    },
    
    animateVideoCard(card) {
        const cards = document.querySelectorAll('.video-card');
        const index = Array.from(cards).indexOf(card);
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }, index * CONFIG.animation.stagger);
    },
    
    animateTourItem(item) {
        const items = document.querySelectorAll('.tour-item');
        const index = Array.from(items).indexOf(item);
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            item.style.transition = 'all 0.6s ease';
        }, index * CONFIG.animation.stagger);
    },
    
    animateSectionHeader(header) {
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
        header.style.transition = 'all 0.8s ease';
        
        const title = header.querySelector('.section-title');
        const subtitle = header.querySelector('.section-subtitle');
        
        if (title) {
            title.classList.add('text-reveal');
        }
        
        if (subtitle) {
            setTimeout(() => {
                subtitle.style.opacity = '1';
            }, 300);
        }
    }
};

// Ripple Effect
function createRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// =============================================
// INICIALIZACIÓN
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM
    Object.assign(DOM, {
        loader: document.getElementById('loader'),
        navbar: document.getElementById('navbar'),
        menuToggle: document.getElementById('menuToggle'),
        navUl: document.querySelector('nav ul'),
        carousel: document.querySelector('.carousel-container'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        indicators: document.getElementById('indicators'),
        cards: document.querySelectorAll('.video-card'),
        marqueeTrack: document.querySelector('.marquee-track'),
        bgVideos: document.querySelectorAll('.bg-video'),
        heroCenter: document.querySelector('.hero-center'),
        bottomMarquee: document.querySelector('.bottom-marquee'),
        observeElements: document.querySelectorAll('.section-header, .video-card, .tour-item')
    });
    
    // Inicializar módulos
    Navigation.init();
    VideoManager.init();
    Marquee.init();
    Carousel.init();
    
    // Lazy loading para YouTube iframes
    if ('IntersectionObserver' in window) {
        const iframeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    if (iframe.dataset.src && !iframe.src) {
                        iframe.src = iframe.dataset.src;
                        iframe.removeAttribute('data-src');
                        iframeObserver.unobserve(iframe);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        document.querySelectorAll('iframe[data-src]').forEach(iframe => {
            iframeObserver.observe(iframe);
        });
    }
    
    // Gestión de conciertos
    const concertsList = document.getElementById('concertsList');
    const noConcerts = document.getElementById('noConcerts');
    const concertItems = concertsList?.querySelectorAll('.concert-item') || [];
    
    if (concertItems.length === 0) {
        if (concertsList) concertsList.style.display = 'none';
        if (noConcerts) noConcerts.style.display = 'block';
    }
    
    // Añadir ripple effect
    const rippleElements = document.querySelectorAll('button, .ticket-btn, .video-link, .social-link');
    rippleElements.forEach(element => {
        element.addEventListener('click', createRipple);
    });
    
    // Añadir CSS para ripple
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Prevenir zoom en móviles
    document.addEventListener('gesturestart', e => e.preventDefault());
    
    // Optimizar videos para móviles
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target.classList.contains('bg-video')) {
                    if (!entry.isIntersecting && !entry.target.paused) {
                        entry.target.pause();
                    } else if (entry.isIntersecting && entry.target.classList.contains('active') && entry.target.paused) {
                        VideoManager.playVideo(entry.target);
                    }
                }
            });
        });
        
        DOM.bgVideos.forEach(video => {
            videoObserver.observe(video);
        });
    }
    
    console.log('CoolDream website initialized - Optimized version 2.0');
});

// Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        if (DOM.loader) {
            DOM.loader.classList.add('hidden');
            document.body.style.overflow = 'visible';
            setTimeout(() => Animations.init(), 300);
        }
    }, CONFIG.transitions.loader);
});