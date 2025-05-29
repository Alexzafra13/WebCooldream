// =============================================
// COOLDREAM - JavaScript Optimizado y Consolidado
// =============================================

// Configuración global y constantes
const CONFIG = {
    transitions: {
        fast: 300,
        smooth: 600,
        loader: 1500  // Reducido de 2.5s a 1.5s para carga más rápida
    },
    scroll: {
        headerOffset: 80,
        hideThreshold: 500
    },
    animation: {
        observerThreshold: 0.1,
        observerMargin: '0px 0px -100px 0px',
        staggerDelay: 100
    }
};

// Cache de elementos del DOM
const DOM = {};

// Estado global
const STATE = {
    lastScroll: 0,
    currentVideo: 'invierno',
    videoTimeout: null,
    isMarqueeDragging: false,
    marqueeStartX: 0,
    marqueePosition: 0,
    marqueeAnimationId: null,
    marqueeVelocity: 0,
    marqueeWidth: 0,
    cloneWidth: 0,
    isMarqueeHovered: false,
    isCarouselDragging: false,
    carouselStartX: 0,
    carouselScrollLeft: 0,
    carouselVelocity: 0,
    carouselMomentumID: null,
    hasMoved: false
};

// =============================================
// 1. INICIALIZACIÓN Y CACHE DE DOM
// =============================================
function initDOMCache() {
    // Elementos principales
    DOM.loader = document.getElementById('loader');
    DOM.navbar = document.getElementById('navbar');
    DOM.menuToggle = document.getElementById('menuToggle');
    DOM.navUl = document.querySelector('nav ul');
    
    // Carousel
    DOM.carousel = document.querySelector('.carousel-container');
    DOM.prevBtn = document.getElementById('prevBtn');
    DOM.nextBtn = document.getElementById('nextBtn');
    DOM.indicators = document.getElementById('indicators');
    DOM.cards = document.querySelectorAll('.video-card');
    
    // Marquee
    DOM.marqueeTrack = document.querySelector('.marquee-track');
    
    // Videos
    DOM.bgVideos = document.querySelectorAll('.bg-video');
    
    // Elementos para observar
    DOM.observeElements = document.querySelectorAll('.section-header, .video-card, .tour-item');
}

// =============================================
// 2. LOADER
// =============================================
function initLoader() {
    if (!DOM.loader) return;
    
    setTimeout(() => {
        DOM.loader.classList.add('hidden');
        document.body.style.overflow = 'visible';
        
        // Iniciar animaciones después del loader
        setTimeout(() => {
            DOM.observeElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                observer.observe(el);
            });
        }, 300);
    }, CONFIG.transitions.loader);
}

// =============================================
// 3. NAVEGACIÓN
// =============================================
function initNavigation() {
    if (!DOM.navbar) return;
    
    // Scroll handler con throttle
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 10);
        }
    });
    
    // Mobile menu
    if (DOM.menuToggle) {
        DOM.menuToggle.addEventListener('click', toggleMobileMenu);
        
        // Cerrar menú al hacer click en enlaces
        document.querySelectorAll('nav ul a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!DOM.navbar.contains(e.target) && DOM.navUl.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
    
    // Smooth scroll para enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', smoothScrollTo);
    });
}

function handleScroll() {
    const currentScroll = window.pageYOffset;
    
    // Añadir/quitar clase scrolled
    if (currentScroll > 50) {
        DOM.navbar.classList.add('scrolled');
    } else {
        DOM.navbar.classList.remove('scrolled');
    }
    
    // Auto-hide navbar
    if (currentScroll > STATE.lastScroll && currentScroll > CONFIG.scroll.hideThreshold) {
        DOM.navbar.style.transform = 'translateY(-100%)';
    } else {
        DOM.navbar.style.transform = 'translateY(0)';
    }
    
    STATE.lastScroll = currentScroll;
    
    // Parallax para hero
    const heroCenter = document.querySelector('.hero-center');
    const bottomMarquee = document.querySelector('.bottom-marquee');
    
    if (heroCenter) {
        heroCenter.style.transform = `translateY(${currentScroll * 0.3}px)`;
        heroCenter.style.opacity = 1 - (currentScroll * 0.001);
    }
    
    if (bottomMarquee) {
        bottomMarquee.style.transform = `translateY(${currentScroll * -0.2}px)`;
    }
}

function toggleMobileMenu(e) {
    e.stopPropagation();
    DOM.navUl.classList.toggle('active');
    DOM.menuToggle.classList.toggle('active');
}

function closeMobileMenu() {
    DOM.navUl.classList.remove('active');
    DOM.menuToggle.classList.remove('active');
}

function smoothScrollTo(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - CONFIG.scroll.headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// =============================================
// 4. VIDEO BACKGROUND
// =============================================
let videoChangeTimeout = null;
let videoPlayPromise = null;
let videosLoaded = {};

function initVideoBackground() {
    if (!DOM.bgVideos.length) return;
    
    // Configurar videos pero NO cargar aún
    DOM.bgVideos.forEach(video => {
        video.preload = 'none'; // Cambiar a 'none' para evitar precarga
        video.style.opacity = '0';
        video.style.transition = 'opacity 0.5s ease';
        
        // Guardar el src original y quitarlo
        if (video.src) {
            video.dataset.videoSrc = video.src;
            video.removeAttribute('src');
        } else if (video.querySelector('source')) {
            const source = video.querySelector('source');
            video.dataset.videoSrc = source.src;
            source.remove();
        }
    });
    
    // Cargar y activar solo el primer video
    setTimeout(() => {
        const firstVideo = DOM.bgVideos[0];
        if (firstVideo) {
            loadAndPlayVideo(firstVideo);
            STATE.currentVideo = firstVideo.id.replace('video-', '');
        }
    }, 100);
}

function loadAndPlayVideo(video) {
    if (!video || videosLoaded[video.id]) {
        // Si ya está cargado, solo reproducir
        if (videosLoaded[video.id]) {
            video.classList.add('active');
            video.style.opacity = '1';
            playVideoSafely(video);
        }
        return;
    }
    
    // Cargar el video por primera vez
    const videoSrc = video.dataset.videoSrc;
    if (videoSrc) {
        const source = document.createElement('source');
        source.src = videoSrc;
        source.type = 'video/mp4';
        video.appendChild(source);
        
        video.load();
        videosLoaded[video.id] = true;
        
        video.addEventListener('loadeddata', () => {
            video.classList.add('active');
            video.style.opacity = '1';
            playVideoSafely(video);
        }, { once: true });
    }
}

function playVideoSafely(video) {
    if (!video) return;
    
    // Cancelar cualquier promesa de reproducción anterior
    if (videoPlayPromise) {
        videoPlayPromise.then(() => {
            // Video anterior terminó, proceder
        }).catch(() => {
            // Ignorar error del video anterior
        });
    }
    
    // Intentar reproducir el nuevo video
    videoPlayPromise = video.play();
    
    if (videoPlayPromise) {
        videoPlayPromise.then(() => {
            // Video reproduciéndose correctamente
            videoPlayPromise = null;
        }).catch(error => {
            // Solo mostrar error si no es por interrupción
            if (error.name !== 'AbortError') {
                console.error('Error playing video:', error);
            }
            videoPlayPromise = null;
        });
    }
}

function changeVideo(videoName) {
    if (STATE.currentVideo === videoName) return;
    
    // Cancelar cambio de video anterior si existe
    if (videoChangeTimeout) {
        clearTimeout(videoChangeTimeout);
        videoChangeTimeout = null;
    }
    
    // Cancelar promesa de video anterior
    if (videoPlayPromise) {
        videoPlayPromise = null;
    }
    
    // Fade out el video actual
    const currentVideoEl = document.getElementById(`video-${STATE.currentVideo}`);
    if (currentVideoEl) {
        currentVideoEl.style.opacity = '0';
    }
    
    // Cambiar al nuevo video con delay
    videoChangeTimeout = setTimeout(() => {
        // Pausar todos los videos primero
        DOM.bgVideos.forEach(video => {
            video.classList.remove('active');
            if (!video.paused) {
                video.pause();
            }
        });
        
        // Cargar y activar el nuevo video
        const targetVideo = document.getElementById(`video-${videoName}`);
        if (targetVideo) {
            // Si el video no está cargado, cargarlo primero
            if (!videosLoaded[targetVideo.id]) {
                loadAndPlayVideo(targetVideo);
            } else {
                // Si ya está cargado, solo activarlo
                targetVideo.classList.add('active');
                
                if (targetVideo.currentTime > 0) {
                    targetVideo.currentTime = 0;
                }
                
                setTimeout(() => {
                    targetVideo.style.opacity = '1';
                    playVideoSafely(targetVideo);
                }, 50);
            }
            
            STATE.currentVideo = videoName;
        }
        
        videoChangeTimeout = null;
    }, 300);
}

// =============================================
// 5. MARQUEE INFINITO
// =============================================
function initMarquee() {
    if (!DOM.marqueeTrack) return;
    
    // Detener animación CSS
    DOM.marqueeTrack.style.animation = 'none';
    DOM.marqueeTrack.style.cursor = 'grab';
    
    createMarqueeClones();
    setupMarqueeEvents();
    updateMarqueeWidths();
    
    // Iniciar animación
    setTimeout(() => {
        if (!STATE.isMarqueeDragging && !STATE.isMarqueeHovered) {
            startMarqueeAnimation();
        }
    }, 100);
    
    window.addEventListener('resize', updateMarqueeWidths);
}

function createMarqueeClones() {
    const originalContent = DOM.marqueeTrack.querySelector('.marquee-content');
    if (DOM.marqueeTrack.querySelectorAll('.marquee-content').length > 2) return;
    
    // Crear 2 clones
    for (let i = 0; i < 2; i++) {
        const clone = originalContent.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        DOM.marqueeTrack.appendChild(clone);
    }
    
    // Añadir eventos a todos los items
    DOM.marqueeTrack.querySelectorAll('.marquee-item').forEach(item => {
        item.addEventListener('mouseenter', handleMarqueeItemHover);
        item.addEventListener('mouseleave', handleMarqueeItemLeave);
    });
}

function updateMarqueeWidths() {
    const firstContent = DOM.marqueeTrack.querySelector('.marquee-content');
    STATE.cloneWidth = firstContent.offsetWidth;
    STATE.marqueeWidth = STATE.cloneWidth * 3;
}

function setupMarqueeEvents() {
    // Mouse events
    DOM.marqueeTrack.addEventListener('mousedown', startMarqueeDrag);
    document.addEventListener('mousemove', dragMarquee);
    document.addEventListener('mouseup', endMarqueeDrag);
    
    // Touch events
    DOM.marqueeTrack.addEventListener('touchstart', startMarqueeDrag, { passive: false });
    document.addEventListener('touchmove', dragMarquee, { passive: false });
    document.addEventListener('touchend', endMarqueeDrag);
    
    // Hover events
    DOM.marqueeTrack.addEventListener('mouseenter', () => {
        STATE.isMarqueeHovered = true;
        stopMarqueeAnimation();
    });
    
    DOM.marqueeTrack.addEventListener('mouseleave', () => {
        STATE.isMarqueeHovered = false;
        if (!STATE.isMarqueeDragging) {
            setTimeout(() => {
                if (!STATE.isMarqueeDragging && !STATE.isMarqueeHovered) {
                    startMarqueeAnimation();
                }
            }, 100);
        }
    });
    
    DOM.marqueeTrack.addEventListener('selectstart', e => e.preventDefault());
}

function startMarqueeAnimation() {
    if (STATE.isMarqueeDragging || STATE.isMarqueeHovered) return;
    
    const speed = 0.5;
    
    function animate() {
        if (!STATE.isMarqueeDragging && !STATE.isMarqueeHovered) {
            STATE.marqueePosition -= speed;
            
            if (Math.abs(STATE.marqueePosition) >= STATE.cloneWidth) {
                STATE.marqueePosition += STATE.cloneWidth;
            }
            
            DOM.marqueeTrack.style.transform = `translateX(${STATE.marqueePosition}px)`;
            STATE.marqueeAnimationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function stopMarqueeAnimation() {
    if (STATE.marqueeAnimationId) {
        cancelAnimationFrame(STATE.marqueeAnimationId);
        STATE.marqueeAnimationId = null;
    }
}

function startMarqueeDrag(e) {
    e.preventDefault();
    STATE.isMarqueeDragging = true;
    DOM.marqueeTrack.style.cursor = 'grabbing';
    
    stopMarqueeAnimation();
    
    STATE.marqueeStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    STATE.marqueeVelocity = 0;
}

function dragMarquee(e) {
    if (!STATE.isMarqueeDragging) return;
    
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX - STATE.marqueeStartX;
    
    STATE.marqueeVelocity = deltaX;
    STATE.marqueePosition += deltaX * 0.8;
    
    // Loop infinito
    if (STATE.marqueePosition > 0) {
        STATE.marqueePosition -= STATE.cloneWidth;
    } else if (STATE.marqueePosition < -STATE.cloneWidth * 2) {
        STATE.marqueePosition += STATE.cloneWidth;
    }
    
    DOM.marqueeTrack.style.transform = `translateX(${STATE.marqueePosition}px)`;
    STATE.marqueeStartX = currentX;
    
    detectCenterItem();
}

function endMarqueeDrag() {
    if (!STATE.isMarqueeDragging) return;
    
    STATE.isMarqueeDragging = false;
    DOM.marqueeTrack.style.cursor = 'grab';
    
    applyMarqueeMomentum();
}

function applyMarqueeMomentum() {
    let velocity = STATE.marqueeVelocity * 0.5;
    const deceleration = 0.95;
    
    function animate() {
        if (Math.abs(velocity) > 0.1) {
            STATE.marqueePosition += velocity;
            velocity *= deceleration;
            
            // Loop infinito
            if (STATE.marqueePosition > 0) {
                STATE.marqueePosition -= STATE.cloneWidth;
            } else if (STATE.marqueePosition < -STATE.cloneWidth * 2) {
                STATE.marqueePosition += STATE.cloneWidth;
            }
            
            DOM.marqueeTrack.style.transform = `translateX(${STATE.marqueePosition}px)`;
            detectCenterItem();
            
            requestAnimationFrame(animate);
        } else {
            // Reanudar animación automática
            setTimeout(() => {
                if (!STATE.isMarqueeDragging && !STATE.isMarqueeHovered) {
                    startMarqueeAnimation();
                }
            }, 1000);
        }
    }
    
    animate();
}

let lastDetectedVideo = null;
let videoDebounceTimeout = null;

function detectCenterItem() {
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
        
        // Efectos visuales según distancia
        const scale = Math.max(0.8, 1 - (distance / window.innerWidth) * 0.3);
        const opacity = Math.max(0.6, 1 - (distance / window.innerWidth) * 0.4);
        
        item.style.transform = `scale(${scale})`;
        item.style.opacity = opacity;
    });
    
    // Cambiar video solo si es diferente y con debounce
    if (closestItem && closestItem.dataset.video) {
        const newVideo = closestItem.dataset.video;
        
        if (newVideo !== lastDetectedVideo) {
            lastDetectedVideo = newVideo;
            
            // Cancelar cambio anterior
            if (videoDebounceTimeout) {
                clearTimeout(videoDebounceTimeout);
            }
            
            // Debounce para evitar cambios muy rápidos
            videoDebounceTimeout = setTimeout(() => {
                if (!STATE.videoTimeout) {
                    changeVideo(newVideo);
                }
                videoDebounceTimeout = null;
            }, 150);
        }
    }
}

function handleMarqueeItemHover(e) {
    if (!STATE.isMarqueeDragging) {
        const videoName = e.currentTarget.dataset.video;
        clearTimeout(STATE.videoTimeout);
        STATE.videoTimeout = null;
        changeVideo(videoName);
    }
}

function handleMarqueeItemLeave() {
    if (!STATE.isMarqueeDragging) {
        clearTimeout(STATE.videoTimeout);
        STATE.videoTimeout = setTimeout(() => {
            detectCenterItem();
            STATE.videoTimeout = null;
        }, 500);
    }
}

// =============================================
// 6. CAROUSEL DE VIDEOS
// =============================================
function initCarousel() {
    if (!DOM.carousel || !DOM.cards.length) return;
    
    createIndicators();
    setupCarouselEvents();
    updateButtons();
    snapToNearest();
}

function createIndicators() {
    DOM.cards.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => scrollToCard(index));
        DOM.indicators.appendChild(indicator);
    });
}

function setupCarouselEvents() {
    // Navegación con flechas
    if (DOM.prevBtn && DOM.nextBtn) {
        DOM.prevBtn.addEventListener('click', () => {
            const currentIndex = getNearestCard();
            if (currentIndex > 0) scrollToCard(currentIndex - 1);
        });
        
        DOM.nextBtn.addEventListener('click', () => {
            const currentIndex = getNearestCard();
            if (currentIndex < DOM.cards.length - 1) scrollToCard(currentIndex + 1);
        });
    }
    
    // Drag events
    DOM.carousel.addEventListener('mousedown', startCarouselDrag);
    DOM.carousel.addEventListener('touchstart', startCarouselDrag, { passive: true });
    DOM.carousel.addEventListener('mousemove', dragCarousel);
    DOM.carousel.addEventListener('touchmove', dragCarousel, { passive: false });
    DOM.carousel.addEventListener('mouseup', endCarouselDrag);
    DOM.carousel.addEventListener('touchend', endCarouselDrag);
    DOM.carousel.addEventListener('mouseleave', endCarouselDrag);
    
    // Scroll event
    DOM.carousel.addEventListener('scroll', () => {
        updateButtons();
        const nearestIndex = getNearestCard();
        updateActiveCard(nearestIndex);
    });
    
    // Wheel event
    DOM.carousel.addEventListener('wheel', (e) => {
        e.preventDefault();
        DOM.carousel.scrollLeft += e.deltaY;
        
        clearTimeout(DOM.carousel.wheelTimeout);
        DOM.carousel.wheelTimeout = setTimeout(snapToNearest, 150);
    }, { passive: false });
    
    // Fix para enlaces en móvil
    setupMobileLinks();
}

function scrollToCard(index) {
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
    
    updateActiveCard(index);
}

function updateActiveCard(index) {
    DOM.cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
        card.classList.toggle('prev', i < index);
        card.classList.toggle('next', i > index);
    });
    
    document.querySelectorAll('.indicator').forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
}

function getNearestCard() {
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
}

function updateButtons() {
    const currentIndex = getNearestCard();
    if (DOM.prevBtn && DOM.nextBtn) {
        DOM.prevBtn.disabled = currentIndex === 0;
        DOM.nextBtn.disabled = currentIndex === DOM.cards.length - 1;
    }
}

function startCarouselDrag(e) {
    if (e.target.closest('.video-link')) return;
    
    STATE.isCarouselDragging = true;
    STATE.hasMoved = false;
    DOM.carousel.classList.add('dragging');
    STATE.carouselStartX = (e.type.includes('touch') ? e.touches[0].pageX : e.pageX) - DOM.carousel.offsetLeft;
    STATE.carouselScrollLeft = DOM.carousel.scrollLeft;
    STATE.carouselStartTime = Date.now();
    cancelAnimationFrame(STATE.carouselMomentumID);
}

function dragCarousel(e) {
    if (!STATE.isCarouselDragging) return;
    
    if (e.target.closest('.video-link')) {
        STATE.isCarouselDragging = false;
        DOM.carousel.classList.remove('dragging');
        return;
    }
    
    const x = (e.type.includes('touch') ? e.touches[0].pageX : e.pageX) - DOM.carousel.offsetLeft;
    const walk = (STATE.carouselStartX - x) * 1.5;
    
    if (Math.abs(walk) > 5) {
        STATE.hasMoved = true;
        if (e.type === 'touchmove' && STATE.hasMoved) {
            e.preventDefault();
        }
    }
    
    DOM.carousel.scrollLeft = STATE.carouselScrollLeft + walk;
    STATE.carouselVelocity = walk / (Date.now() - STATE.carouselStartTime);
}

function endCarouselDrag(e) {
    if (!STATE.isCarouselDragging) return;
    
    STATE.isCarouselDragging = false;
    DOM.carousel.classList.remove('dragging');
    
    if (!STATE.hasMoved) return;
    
    const absVelocity = Math.abs(STATE.carouselVelocity);
    if (absVelocity > 0.5) {
        applyCarouselMomentum();
    } else {
        snapToNearest();
    }
}

function applyCarouselMomentum() {
    const deceleration = 0.92;
    
    function animate() {
        if (Math.abs(STATE.carouselVelocity) > 0.1) {
            DOM.carousel.scrollLeft += STATE.carouselVelocity * 20;
            STATE.carouselVelocity *= deceleration;
            STATE.carouselMomentumID = requestAnimationFrame(animate);
        } else {
            snapToNearest();
        }
    }
    
    animate();
}

function snapToNearest() {
    const nearestIndex = getNearestCard();
    scrollToCard(nearestIndex);
}

function setupMobileLinks() {
    document.querySelectorAll('.video-link').forEach(link => {
        let tapStartTime;
        let tapStartX;
        let tapStartY;
        let isTap = false;
        
        link.addEventListener('touchstart', (e) => {
            tapStartTime = Date.now();
            tapStartX = e.touches[0].clientX;
            tapStartY = e.touches[0].clientY;
            isTap = true;
            e.stopPropagation();
        }, { passive: true });
        
        link.addEventListener('touchmove', (e) => {
            const moveX = e.touches[0].clientX;
            const moveY = e.touches[0].clientY;
            const diffX = Math.abs(moveX - tapStartX);
            const diffY = Math.abs(moveY - tapStartY);
            
            if (diffX > 10 || diffY > 10) {
                isTap = false;
            }
        }, { passive: true });
        
        link.addEventListener('touchend', (e) => {
            const tapDuration = Date.now() - tapStartTime;
            
            if (isTap && tapDuration < 300) {
                e.preventDefault();
                e.stopPropagation();
                
                setTimeout(() => {
                    window.open(link.href, '_blank');
                }, 50);
            }
        });
        
        link.addEventListener('click', (e) => {
            if (STATE.hasMoved || DOM.carousel.classList.contains('dragging')) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        link.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
    });
}

// =============================================
// 7. ANIMACIONES SCROLL (Intersection Observer)
// =============================================
const observerOptions = {
    threshold: CONFIG.animation.observerThreshold,
    rootMargin: CONFIG.animation.observerMargin
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            
            // Animaciones específicas
            if (entry.target.classList.contains('video-card')) {
                animateVideoCard(entry.target);
            } else if (entry.target.classList.contains('tour-item')) {
                animateTourItem(entry.target);
            } else if (entry.target.classList.contains('section-header')) {
                animateSectionHeader(entry.target);
            }
        }
    });
}, observerOptions);

function animateVideoCard(card) {
    const cards = document.querySelectorAll('.video-card');
    const index = Array.from(cards).indexOf(card);
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }, index * CONFIG.animation.staggerDelay);
}

function animateTourItem(item) {
    const items = document.querySelectorAll('.tour-item');
    const index = Array.from(items).indexOf(item);
    
    setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.style.transition = 'all 0.6s ease';
    }, index * CONFIG.animation.staggerDelay);
}

function animateSectionHeader(header) {
    header.style.opacity = '1';
    header.style.transform = 'translateY(0)';
    header.style.transition = 'all 0.8s ease';
    
    // Animar título y subtítulo
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

// =============================================
// 8. EFECTOS ADICIONALES
// =============================================

// Ripple effect
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

// Magnetic button effect
function initMagneticButtons() {
    const magneticButtons = document.querySelectorAll('.cta-button, .ticket-btn, .social-link');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

// =============================================
// 9. GESTIÓN DE CONCIERTOS
// =============================================
function initConcerts() {
    const concertsList = document.getElementById('concertsList');
    const noConcerts = document.getElementById('noConcerts');
    const concertItems = concertsList?.querySelectorAll('.concert-item') || [];
    
    if (!concertsList) return;
    
    // Si no hay conciertos, mostrar mensaje
    if (concertItems.length === 0) {
        concertsList.style.display = 'none';
        if (noConcerts) noConcerts.style.display = 'block';
    }
    
    // Filtrar conciertos pasados
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    concertItems.forEach(item => {
        const concertDate = new Date(item.dataset.date);
        if (concertDate < today) {
            item.classList.add('past');
        }
    });
}

// =============================================
// 10. UTILIDADES
// =============================================

// Typewriter effect
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Animate numbers
function animateNumbers() {
    const numbers = document.querySelectorAll('[data-number]');
    
    numbers.forEach(num => {
        const target = parseInt(num.dataset.number);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateNumber = () => {
            current += increment;
            if (current < target) {
                num.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateNumber);
            } else {
                num.textContent = target.toLocaleString();
            }
        };
        
        updateNumber();
    });
}

// =============================================
// 11. LAZY LOADING YOUTUBE
// =============================================
function initLazyYouTube() {
    const iframes = document.querySelectorAll('iframe[data-src]');
    
    if ('IntersectionObserver' in window) {
        const iframeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    if (iframe.dataset.src && iframe.src === 'about:blank') {
                        iframe.src = iframe.dataset.src;
                        iframe.removeAttribute('data-src');
                        iframeObserver.unobserve(iframe);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        iframes.forEach(iframe => iframeObserver.observe(iframe));
    } else {
        // Fallback para navegadores antiguos
        iframes.forEach(iframe => {
            if (iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
            }
        });
    }
}

// =============================================
// 12. INICIALIZACIÓN PRINCIPAL
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Cachear elementos del DOM
    initDOMCache();
    
    // Inicializar componentes
    initNavigation();
    initVideoBackground();
    initMarquee();
    initCarousel();
    initConcerts();
    initMagneticButtons();
    initLazyYouTube(); // Añadir lazy loading de YouTube
    
    // Añadir ripple effect
    const rippleElements = document.querySelectorAll('button, .ticket-btn, .video-link, .social-link');
    rippleElements.forEach(element => {
        element.addEventListener('click', createRipple);
    });
    
    // Añadir CSS para ripple dinámicamente
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
            
            button, .cta-button, .video-link, .social-link {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Prevenir zoom en móviles
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });
    
    // Optimizar videos para móviles y ahorro de energía
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target.classList.contains('bg-video')) {
                    if (!entry.isIntersecting && !entry.target.paused) {
                        entry.target.pause();
                    } else if (entry.isIntersecting && entry.target.classList.contains('active') && entry.target.paused) {
                        playVideoSafely(entry.target);
                    }
                }
            });
        });
        
        DOM.bgVideos.forEach(video => {
            videoObserver.observe(video);
        });
    }
    
    console.log('CoolDream website initialized - Optimized version');
});

// Inicializar loader cuando la ventana cargue completamente
window.addEventListener('load', initLoader);

// Exportar funciones para uso global
window.animateNumbers = animateNumbers;
window.typeWriter = typeWriter;