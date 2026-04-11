// Typing effect for hero
const typedEl = document.getElementById('typed-text');
if (typedEl) {
    const phrases = ['Hello, World.', 'I build things.', 'I solve problems.', 'I am ...'];
    let phraseIdx = 0;
    let charIdx = 0;
    let state = 'typing'; // typing | pausing | deleting

    function typeLoop() {
        const current = phrases[phraseIdx];
        const isLast = phraseIdx === phrases.length - 1;

        if (state === 'typing') {
            charIdx++;
            typedEl.textContent = current.substring(0, charIdx);
            if (charIdx === current.length) {
                if (isLast) return; // stop on last phrase
                state = 'pausing';
                setTimeout(typeLoop, 1500);
                return;
            }
            setTimeout(typeLoop, 80);
        } else if (state === 'pausing') {
            state = 'deleting';
            setTimeout(typeLoop, 40);
        } else if (state === 'deleting') {
            charIdx--;
            typedEl.textContent = current.substring(0, charIdx);
            if (charIdx === 0) {
                state = 'typing';
                phraseIdx++;
                setTimeout(typeLoop, 300);
                return;
            }
            setTimeout(typeLoop, 40);
        }
    }
    setTimeout(typeLoop, 600);
}

// Initialize Lenis smooth scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Intersection Observer for scroll animations
const observers = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('appear');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
});

document.querySelectorAll('.fade-in').forEach(el => {
    observers.observe(el);
});

// Canvas Particle Network Background
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 0.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        const isLight = document.body.classList.contains('light-mode');
        ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(this.x, this.y, this.radius * 2, this.radius * 2);
    }
}

function initParticles() {
    particles = [];
    const numParticles = Math.min(Math.floor((width * height) / 15000), 100);
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                const isLight = document.body.classList.contains('light-mode');
                ctx.strokeStyle = isLight ? `rgba(0, 0, 0, ${0.15 - distance / 1000})` : `rgba(255, 255, 255, ${0.15 - distance / 1000})`;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// Navbar Glass Effect on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        const isLight = document.body.classList.contains('light-mode');
        navbar.style.background = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)';
        navbar.style.padding = '15px 5%';
        navbar.style.boxShadow = `4px 4px 0px ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`;
    } else {
        navbar.style.background = 'var(--glass-bg)';
        navbar.style.padding = '20px 5%';
        navbar.style.boxShadow = 'none';
    }
});

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        themeToggle.textContent = document.body.classList.contains('light-mode') ? 'NIGHT' : 'DAY';
    });
}

// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const navOverlay = document.getElementById('nav-overlay');

function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    navOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

if (hamburger) {
    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('open');
        if (isOpen) {
            closeMenu();
        } else {
            hamburger.classList.add('active');
            navLinks.classList.add('open');
            navOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    });
}

if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
}

// Close menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
});
