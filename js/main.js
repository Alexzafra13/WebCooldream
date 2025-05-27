// Loader
window.addEventListener('load', () => {
    let progress = 0;
    const loaderProgress = document.getElementById('loaderProgress');
    const loader = document.getElementById('loader');
    
    const loadInterval = setInterval(() => {
        progress += 10;
        loaderProgress.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 300);
        }
    }, 100);
});

// Video Background Change on Hover
const marqueeItems = document.querySelectorAll('.marquee-item');
const bgVideos = document.querySelectorAll('.bg-video');
let currentVideo = 'default';
let videoTimeout;

// Función para cambiar video
function changeVideo(videoName) {
    // Fade out all videos
    bgVideos.forEach(video => {
        video.classList.remove('active');
        video.pause();
    });
    
    // Fade in target video
    const targetVideo = document.getElementById(`video-${videoName}`);
    if (targetVideo) {
        console.log('Cambiando a video:', videoName);
        targetVideo.classList.add('active');
        targetVideo.currentTime = 0;
        targetVideo.play().catch(err => {
            console.error('Error playing video:', err);
        });
        currentVideo = videoName;
    } else {
        console.error('No se encontró el video:', videoName);
    }
}

// Preload all videos
window.addEventListener('DOMContentLoaded', () => {
    bgVideos.forEach(video => {
        console.log('Video encontrado:', video.id);
        video.load();
    });
    
    // Usar el primer video disponible como default
    const firstVideo = document.querySelector('.bg-video');
    if (firstVideo) {
        firstVideo.classList.add('active');
        firstVideo.play();
    }
});

marqueeItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        const videoName = this.dataset.video;
        console.log('Hover sobre:', videoName);
        
        clearTimeout(videoTimeout);
        changeVideo(videoName);
    });
    
    item.addEventListener('mouseleave', function() {
        clearTimeout(videoTimeout);
        
        videoTimeout = setTimeout(() => {
            // Volver al primer video
            const firstVideo = document.querySelector('.bg-video');
            if (firstVideo) {
                changeVideo(firstVideo.id.replace('video-', ''));
            }
        }, 1000);
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navUl = document.querySelector('nav ul');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navUl.classList.toggle('active');
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            if (navUl) {
                navUl.classList.remove('active');
            }
        }
    });
});

// Video Cards
const videoCards = document.querySelectorAll('.video-card');

videoCards.forEach(card => {
    const video = card.querySelector('video');
    const youtubeUrl = card.dataset.youtube;
    
    card.addEventListener('mouseenter', () => {
        if (video) video.play();
    });
    
    card.addEventListener('mouseleave', () => {
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    });
    
    card.addEventListener('click', (e) => {
        if (e.target.closest('.video-link')) {
            return;
        }
        
        if (youtubeUrl && youtubeUrl !== 'URL_DE_YOUTUBE_AQUI') {
            window.open(youtubeUrl, '_blank');
        }
    });
});

// Tour tickets
const ticketBtns = document.querySelectorAll('.ticket-btn:not(:disabled)');
ticketBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        window.open('https://tuvendedordetickets.com', '_blank');
    });
});

// ===== CAROUSEL DRAG & DROP FUNCTIONALITY =====
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

// Actualizar estado de botones
function updateButtons() {
    const scrollPosition = carousel.scrollLeft;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    
    prevBtn.disabled = scrollPosition <= 0;
    nextBtn.disabled = scrollPosition >= maxScroll - 10;
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
});

carousel.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - touchStartX) * 2;
    const prevScrollLeft = carousel.scrollLeft;
    carousel.scrollLeft = touchScrollLeft - walk;
    velocity = carousel.scrollLeft - prevScrollLeft;
});

carousel.addEventListener('touchend', () => {
    beginMomentumTracking();
});

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
    if (e.key === 'ArrowRight') {
        nextBtn.click();
    } else if (e.key === 'ArrowLeft') {
        prevBtn.click();
    }
});

// Wheel para scroll horizontal
carousel.addEventListener('wheel', (e) => {
    e.preventDefault();
    carousel.scrollLeft += e.deltaY;
});

// Inicializar
updateButtons();
updateIndicators();