// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            
            // Specific animations per element
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

// Observe elements
document.querySelectorAll('.section-header, .video-card, .tour-item').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
});

// Specific animation functions
function animateVideoCard(card) {
    const cards = document.querySelectorAll('.video-card');
    const index = Array.from(cards).indexOf(card);
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    }, index * 100);
}

function animateTourItem(item) {
    const items = document.querySelectorAll('.tour-item');
    const index = Array.from(items).indexOf(item);
    
    setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
    }, index * 100);
}

function animateSectionHeader(header) {
    header.style.opacity = '1';
    header.style.transform = 'translateY(0)';
    
    // Animate title and subtitle separately
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

// Number animation
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

// Parallax effect for hero elements
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroCenter = document.querySelector('.hero-center');
    const bottomMarquee = document.querySelector('.bottom-marquee');
    
    if (heroCenter) {
        heroCenter.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroCenter.style.opacity = 1 - (scrolled * 0.001);
    }
    
    if (bottomMarquee) {
        bottomMarquee.style.transform = `translateY(${scrolled * -0.2}px)`;
    }
});

// Magnetic button effect
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

// Ripple effect on click
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
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

// Add ripple to all buttons
const allButtons = document.querySelectorAll('button, .cta-button, .video-link, .social-link');
allButtons.forEach(button => {
    button.addEventListener('click', createRipple);
});

// Add ripple CSS dynamically
const style = document.createElement('style');
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

// Export functions for global use
window.animateNumbers = animateNumbers;
window.typeWriter = typeWriter;