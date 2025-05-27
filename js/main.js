// =============================================
// COOLDREAM - JavaScript Principal Optimizado
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
// 3. VIDEO BACKGROUND & MARQUEE INFINITO
// =============================================
const marqueeTrack = document.querySelector('.marquee-track');
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

// === MARQUEE INFINITO MEJORADO ===
let isMarqueeDragging = false;
let marqueeStartX = 0;
let marqueePosition = 0;
let marqueeAnimationId = null;
let marqueeVelocity = 0;
let marqueeWidth = 0;
let cloneWidth = 0;

// Inicializar marquee infinito
function initInfiniteMarquee() {
    // Detener la animación CSS
    marqueeTrack.style.animation = 'none';
    marqueeTrack.style.cursor = 'grab';
    
    // Crear clones para efecto infinito
    createMarqueeClones();
    
    // Configurar eventos
    setupMarqueeEvents();
    
    // Calcular anchos
    updateMarqueeWidths();
    
    // Iniciar animación después de un delay
    setTimeout(() => {
        if (!isMarqueeDragging) {
            startMarqueeAnimation();
        }
    }, 100);
    
    // Actualizar anchos al cambiar tamaño de ventana
    window.addEventListener('resize', updateMarqueeWidths);
}

// Crear clones del contenido para loop infinito
function createMarqueeClones() {
    // Obtener el contenido original (primer .marquee-content)
    const originalContent = marqueeTrack.querySelector('.marquee-content');
    
    // Si ya hay clones, no crear más
    if (marqueeTrack.querySelectorAll('.marquee-content').length > 2) return;
    
    // Crear 2 clones adicionales para un total de 3
    for (let i = 0; i < 2; i++) {
        const clone = originalContent.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        marqueeTrack.appendChild(clone);
    }
    
    // Actualizar la referencia a todos los items (incluyendo clones)
    const allItems = marqueeTrack.querySelectorAll('.marquee-item');
    
    // Añadir eventos a todos los items
    allItems.forEach(item => {
        item.addEventListener('mouseenter', handleItemHover);
        item.addEventListener('mouseleave', handleItemLeave);
    });
}

// Calcular anchos del marquee
function updateMarqueeWidths() {
    const firstContent = marqueeTrack.querySelector('.marquee-content');
    cloneWidth = firstContent.offsetWidth;
    marqueeWidth = cloneWidth * 3; // 3 copias del contenido
}

// Configurar eventos del marquee
function setupMarqueeEvents() {
    // Mouse events
    marqueeTrack.addEventListener('mousedown', startMarqueeDrag);
    document.addEventListener('mousemove', dragMarquee);
    document.addEventListener('mouseup', endMarqueeDrag);
    
    // Touch events
    marqueeTrack.addEventListener('touchstart', startMarqueeDrag, { passive: false });
    document.addEventListener('touchmove', dragMarquee, { passive: false });
    document.addEventListener('touchend', endMarqueeDrag);
    
    // Prevenir selección de texto
    marqueeTrack.addEventListener('selectstart', e => e.preventDefault());
}

// Animación automática del marquee
function startMarqueeAnimation() {
    if (isMarqueeDragging) return;
    
    const speed = 0.5; // Velocidad de la animación
    
    function animate() {
        if (!isMarqueeDragging) {
            marqueePosition -= speed;
            
            // Loop infinito: cuando llega al final de un clon, vuelve al inicio
            if (Math.abs(marqueePosition) >= cloneWidth) {
                marqueePosition += cloneWidth;
            }
            
            marqueeTrack.style.transform = `translateX(${marqueePosition}px)`;
            detectCenterItem();
            
            marqueeAnimationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Detener animación
function stopMarqueeAnimation() {
    if (marqueeAnimationId) {
        cancelAnimationFrame(marqueeAnimationId);
        marqueeAnimationId = null;
    }
}

// Iniciar drag
function startMarqueeDrag(e) {
    e.preventDefault();
    isMarqueeDragging = true;
    marqueeTrack.style.cursor = 'grabbing';
    
    // Detener animación
    stopMarqueeAnimation();
    
    // Guardar posición inicial
    marqueeStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    marqueeVelocity = 0;
}

// Arrastrar marquee
function dragMarquee(e) {
    if (!isMarqueeDragging) return;
    
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX - marqueeStartX;
    
    // Calcular velocidad para momentum
    marqueeVelocity = deltaX - (marqueeVelocity || 0);
    
    // Aplicar movimiento
    marqueePosition += deltaX * 0.8;
    
    // Loop infinito durante el drag
    if (marqueePosition > 0) {
        marqueePosition -= cloneWidth;
    } else if (marqueePosition < -cloneWidth * 2) {
        marqueePosition += cloneWidth;
    }
    
    marqueeTrack.style.transform = `translateX(${marqueePosition}px)`;
    marqueeStartX = currentX;
    
    // Detectar item central
    detectCenterItem();
}

// Terminar drag
function endMarqueeDrag() {
    if (!isMarqueeDragging) return;
    
    isMarqueeDragging = false;
    marqueeTrack.style.cursor = 'grab';
    
    // Aplicar momentum
    applyMomentum();
}

// Aplicar momentum después del drag
function applyMomentum() {
    let velocity = marqueeVelocity * 0.5;
    const deceleration = 0.95;
    
    function animate() {
        if (Math.abs(velocity) > 0.1) {
            marqueePosition += velocity;
            velocity *= deceleration;
            
            // Loop infinito
            if (marqueePosition > 0) {
                marqueePosition -= cloneWidth;
            } else if (marqueePosition < -cloneWidth * 2) {
                marqueePosition += cloneWidth;
            }
            
            marqueeTrack.style.transform = `translateX(${marqueePosition}px)`;
            detectCenterItem();
            
            requestAnimationFrame(animate);
        } else {
            // Reanudar animación automática
            setTimeout(() => {
                if (!isMarqueeDragging) {
                    startMarqueeAnimation();
                }
            }, 1000);
        }
    }
    
    animate();
}

// Detectar item central y aplicar efectos
function detectCenterItem() {
    const centerX = window.innerWidth / 2;
    const allItems = marqueeTrack.querySelectorAll('.marquee-item');
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
        
        // Aplicar efectos visuales según distancia
        const scale = Math.max(0.8, 1 - (distance / window.innerWidth) * 0.3);
        const opacity = Math.max(0.6, 1 - (distance / window.innerWidth) * 0.4);
        
        item.style.transform = `scale(${scale})`;
        item.style.opacity = opacity;
    });
    
    // Cambiar video según el item central
    if (closestItem && closestItem.dataset.video) {
        const videoName = closestItem.dataset.video;
        if (!videoTimeout) {
            changeVideo(videoName);
        }
    }
}

// Manejar hover en items
function handleItemHover(e) {
    if (!isMarqueeDragging) {
        const videoName = e.currentTarget.dataset.video;
        clearTimeout(videoTimeout);
        videoTimeout = null;
        changeVideo(videoName);
    }
}

function handleItemLeave() {
    if (!isMarqueeDragging) {
        clearTimeout(videoTimeout);
        videoTimeout = setTimeout(() => {
            changeVideo('invierno');
            videoTimeout = null;
        }, 2000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initInfiniteMarquee);

// =============================================
// 4. CAROUSEL DE VIDEOS MEJORADO
// =============================================
const carousel = document.querySelector('.carousel-container');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicators = document.getElementById('indicators');
const cards = document.querySelectorAll('.video-card');

// Variables para drag mejorado
let isDown = false;
let startX;
let scrollLeft;
let velocity = 0;
let momentumID;
let startTime;

// Crear indicadores
cards.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.classList.add('indicator');
    if (index === 0) indicator.classList.add('active');
    indicator.addEventListener('click', () => scrollToCard(index));
    indicators.appendChild(indicator);
});

// Función mejorada para scroll a una tarjeta específica
function scrollToCard(index) {
    const card = cards[index];
    if (!card) return;
    
    const cardRect = card.getBoundingClientRect();
    const containerRect = carousel.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    const containerCenter = containerRect.left + containerRect.width / 2;
    const offset = cardCenter - containerCenter;
    
    carousel.scrollTo({
        left: carousel.scrollLeft + offset,
        behavior: 'smooth'
    });
    
    updateActiveCard(index);
}

// Actualizar card activa
function updateActiveCard(index) {
    cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
        card.classList.toggle('prev', i < index);
        card.classList.toggle('next', i > index);
    });
    
    document.querySelectorAll('.indicator').forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
}

// Detectar card más cercana al centro
function getNearestCard() {
    const containerRect = carousel.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    cards.forEach((card, index) => {
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

// Navegación con flechas
if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        const currentIndex = getNearestCard();
        if (currentIndex > 0) scrollToCard(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        const currentIndex = getNearestCard();
        if (currentIndex < cards.length - 1) scrollToCard(currentIndex + 1);
    });
}

// Actualizar estado de botones
function updateButtons() {
    const currentIndex = getNearestCard();
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === cards.length - 1;
    }
}

// Drag mejorado para móvil y desktop
carousel.addEventListener('mousedown', startDrag);
carousel.addEventListener('touchstart', startDrag, { passive: false });
carousel.addEventListener('mousemove', drag);
carousel.addEventListener('touchmove', drag, { passive: false });
carousel.addEventListener('mouseup', endDrag);
carousel.addEventListener('touchend', endDrag);
carousel.addEventListener('mouseleave', endDrag);

function startDrag(e) {
    isDown = true;
    carousel.classList.add('dragging');
    startX = (e.type.includes('touch') ? e.touches[0].pageX : e.pageX) - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    startTime = Date.now();
    cancelAnimationFrame(momentumID);
    
    // Prevenir comportamiento por defecto en móvil
    if (e.type === 'touchstart') {
        e.preventDefault();
    }
}

function drag(e) {
    if (!isDown) return;
    
    // Prevenir scroll vertical en móvil
    if (e.type === 'touchmove') {
        e.preventDefault();
    }
    
    const x = (e.type.includes('touch') ? e.touches[0].pageX : e.pageX) - carousel.offsetLeft;
    const walk = (startX - x) * 1.5;
    carousel.scrollLeft = scrollLeft + walk;
    
    // Calcular velocidad
    velocity = walk / (Date.now() - startTime);
}

function endDrag() {
    if (!isDown) return;
    
    isDown = false;
    carousel.classList.remove('dragging');
    
    // Aplicar momentum o snap
    const absVelocity = Math.abs(velocity);
    if (absVelocity > 0.5) {
        applyMomentum();
    } else {
        snapToNearest();
    }
}

// Momentum scrolling simplificado
function applyMomentum() {
    const deceleration = 0.92;
    
    function animate() {
        if (Math.abs(velocity) > 0.1) {
            carousel.scrollLeft += velocity * 20;
            velocity *= deceleration;
            momentumID = requestAnimationFrame(animate);
        } else {
            snapToNearest();
        }
    }
    
    animate();
}

// Snap a la card más cercana
function snapToNearest() {
    const nearestIndex = getNearestCard();
    scrollToCard(nearestIndex);
}

// Event listeners para actualizar UI
carousel.addEventListener('scroll', () => {
    updateButtons();
    const nearestIndex = getNearestCard();
    updateActiveCard(nearestIndex);
});

// Wheel para scroll horizontal
carousel.addEventListener('wheel', (e) => {
    e.preventDefault();
    carousel.scrollLeft += e.deltaY;
    
    clearTimeout(carousel.wheelTimeout);
    carousel.wheelTimeout = setTimeout(snapToNearest, 150);
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
    snapToNearest();
    
    // Prevenir zoom en móviles
    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });
    
    // Log de inicialización
    console.log('CoolDream website initialized - Optimized version');
});