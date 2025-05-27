// =============================================
// COOLDREAM - JavaScript Principal
// =============================================

// =============================================
// 1. LOADER
// =============================================
window.addEventListener('load', () => {
    let progress = 0;
    const loaderProgress = document.getElementById('loaderProgress');
    const loader = document.getElementById('loader');
    
    const loadInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        loaderProgress.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.style.overflow = 'visible';
            }, 300);
        }
    }, 100);
});

// =============================================
// 2. NAVEGACIÓN
// =============================================
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navUl = document.querySelector('nav ul');

// Efecto scroll navbar
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Ocultar/mostrar navbar al hacer scroll
    if (currentScroll > lastScroll && currentScroll > 500) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// Mobile menu
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navUl.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Animación del hamburger menu
        const spans = menuToggle.querySelectorAll('span');
        if (menuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(7px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Smooth scroll para enlaces
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Cerrar menú móvil si está abierto
            if (navUl.classList.contains('active')) {
                navUl.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        }
    });
});

// =============================================
// 3. VIDEO BACKGROUND & MARQUEE
// =============================================
const marqueeItems = document.querySelectorAll('.marquee-item');
const bgVideos = document.querySelectorAll('.bg-video');
let currentVideo = 'invierno';
let videoTimeout;

// Función para cambiar video con transición suave
function changeVideo(videoName) {
    if (currentVideo === videoName) return;
    
    // Fade out todos los videos
    bgVideos.forEach(video => {
        video.style.opacity = '0';
    });
    
    // Fade in el video objetivo después de un pequeño delay
    setTimeout(() => {
        bgVideos.forEach(video => {
            video.classList.remove('active');
            video.pause();
        });
        
        const targetVideo = document.getElementById(`video-${videoName}`);
        if (targetVideo) {
            targetVideo.classList.add('active');
            targetVideo.currentTime = 0;
            targetVideo.play().catch(err => {
                console.error('Error playing video:', err);
            });
            
            setTimeout(() => {
                targetVideo.style.opacity = '1';
            }, 50);
            
            currentVideo = videoName;
        }
    }, 300);
}

// Precargar videos
window.addEventListener('DOMContentLoaded', () => {
    bgVideos.forEach(video => {
        video.load();
        video.style.opacity = '0';
        video.style.transition = 'opacity 0.5s ease';
    });
    
    // Activar el primer video
    const firstVideo = document.querySelector('.bg-video');
    if (firstVideo) {
        firstVideo.classList.add('active');
        firstVideo.style.opacity = '1';
        firstVideo.play().catch(err => {
            console.error('Error playing first video:', err);
        });
    }
});

// Eventos hover marquee
marqueeItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        const videoName = this.dataset.video;
        clearTimeout(videoTimeout);
        changeVideo(videoName);
    });
    
    item.addEventListener('mouseleave', function() {
        clearTimeout(videoTimeout);
        videoTimeout = setTimeout(() => {
            changeVideo('invierno');
        }, 2000);
    });
});

// =============================================
// 4. CAROUSEL DE VIDEOS
// =============================================
const carousel = document.querySelector('.carousel-container');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicators = document.getElementById('indicators');
const cards = document.querySelectorAll('.video-card');

// Variables para drag
let isDown = false;
let startX;
let scrollLeft;
let momentumID;
let velocity = 0;

// Crear indicadores
cards.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.classList.add('indicator');
    if (index === 0) indicator.classList.add('active');
    indicator.addEventListener('click', () => scrollToCard(index));
    indicators.appendChild(indicator);
});

// Función para actualizar indicadores
function updateIndicators() {
    const scrollPosition = carousel.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 32; // width + gap
    const activeIndex = Math.round(scrollPosition / cardWidth);
    
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === activeIndex);
    });
}

// Función para scroll a una tarjeta específica
function scrollToCard(index) {
    const cardWidth = cards[0].offsetWidth + 32;
    carousel.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
    });
}

// Navegación con flechas
if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + 32;
        const currentPosition = carousel.scrollLeft;
        const currentIndex = Math.round(currentPosition / cardWidth);
        if (currentIndex > 0) {
            scrollToCard(currentIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + 32;
        const currentPosition = carousel.scrollLeft;
        const currentIndex = Math.round(currentPosition / cardWidth);
        if (currentIndex < cards.length - 1) {
            scrollToCard(currentIndex + 1);
        }
    });
}

// Actualizar estado de botones
function updateButtons() {
    const scrollPosition = carousel.scrollLeft;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    
    if (prevBtn && nextBtn) {
        prevBtn.disabled = scrollPosition <= 0;
        nextBtn.disabled = scrollPosition >= maxScroll - 10;
    }
}

// Drag functionality
carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.classList.add('dragging');
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    cancelMomentumTracking();
});

carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.classList.remove('dragging');
});

carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.classList.remove('dragging');
    beginMomentumTracking();
});

carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
    const prevScrollLeft = carousel.scrollLeft;
    carousel.scrollLeft = scrollLeft - walk;
    velocity = carousel.scrollLeft - prevScrollLeft;
});

// Touch support
let touchStartX = 0;
let touchScrollLeft = 0;

carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX - carousel.offsetLeft;
    touchScrollLeft = carousel.scrollLeft;
    cancelMomentumTracking();
}, { passive: true });

carousel.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - touchStartX) * 2;
    const prevScrollLeft = carousel.scrollLeft;
    carousel.scrollLeft = touchScrollLeft - walk;
    velocity = carousel.scrollLeft - prevScrollLeft;
}, { passive: true });

carousel.addEventListener('touchend', () => {
    beginMomentumTracking();
}, { passive: true });

// Momentum scrolling
function beginMomentumTracking() {
    cancelMomentumTracking();
    momentumID = requestAnimationFrame(momentumLoop);
}

function cancelMomentumTracking() {
    cancelAnimationFrame(momentumID);
}

function momentumLoop() {
    carousel.scrollLeft += velocity;
    velocity *= 0.95;
    if (Math.abs(velocity) > 0.5) {
        momentumID = requestAnimationFrame(momentumLoop);
    } else {
        // Snap to nearest card
        const cardWidth = cards[0].offsetWidth + 32;
        const targetIndex = Math.round(carousel.scrollLeft / cardWidth);
        scrollToCard(targetIndex);
    }
}

// Event listeners para actualizar UI
carousel.addEventListener('scroll', () => {
    updateIndicators();
    updateButtons();
});

// Navegación con teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && nextBtn) {
        nextBtn.click();
    } else if (e.key === 'ArrowLeft' && prevBtn) {
        prevBtn.click();
    }
});

// Wheel para scroll horizontal
carousel.addEventListener('wheel', (e) => {
    e.preventDefault();
    carousel.scrollLeft += e.deltaY;
}, { passive: false });

// =============================================
// 5. ANIMACIONES SCROLL
// =============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            
            // Animaciones específicas por elemento
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

// Observar elementos
document.querySelectorAll('.section-header, .video-card, .tour-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    observer.observe(el);
});

// Funciones de animación específicas
function animateVideoCard(card) {
    const cards = document.querySelectorAll('.video-card');
    const index = Array.from(cards).indexOf(card);
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }, index * 100);
}

function animateTourItem(item) {
    const items = document.querySelectorAll('.tour-item');
    const index = Array.from(items).indexOf(item);
    
    setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.style.transition = 'all 0.6s ease';
    }, index * 100);
}

function animateSectionHeader(header) {
    header.style.opacity = '1';
    header.style.transform = 'translateY(0)';
    header.style.transition = 'all 0.8s ease';
}

// =============================================
// 6. RIPPLE EFFECT
// =============================================
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

// Añadir ripple a todos los botones
const rippleElements = document.querySelectorAll('button, .ticket-btn, .video-link, .social-link');
rippleElements.forEach(element => {
    element.addEventListener('click', createRipple);
});

// =============================================
// 7. INICIALIZACIÓN
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes
    updateButtons();
    updateIndicators();
    
    // Prevenir zoom en móviles
    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });
    
    // Log de inicialización
    console.log('CoolDream website initialized');
});