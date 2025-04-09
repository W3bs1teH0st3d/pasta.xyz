/* Copyright (c) 2025 Pasta.xyz All rights reserved. Unauthorized use prohibited. */
/* Questions to discord: https://discord.gg/9dMNYANZ */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: null, y: null, radius: 250 };
const isMobile = window.innerWidth <= 768;
const gridLines = 30;
const horizonY = canvas.height * 0.4;
const starsArray = [];
const maxStars = 45; // Уменьшено для оптимизации
const particlesArray = [];
const maxParticles = 35; // Уменьшено для оптимизации
const glowArray = [];

class GridLine {
    constructor(isVertical, index) {
        this.isVertical = isVertical;
        this.index = index;
        this.depth = index / gridLines;
        this.color = `rgba(255, 51, 51, ${0.3 - this.depth * 0.2})`; // Более прозрачно
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmplitude = 40 + this.depth * 60;
    }

    update() {
        this.waveOffset += 0.01 * (1 - this.depth); // Замедленные волны
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1 - this.depth * 0.5;
        ctx.shadowBlur = 5; // Уменьшено свечение
        ctx.shadowColor = '#ff3333';
        ctx.beginPath();

        if (this.isVertical) {
            const x = (this.index / gridLines) * canvas.width;
            const perspectiveX = canvas.width / 2 + (x - canvas.width / 2) * (1 - this.depth);
            ctx.moveTo(perspectiveX, horizonY);
            ctx.lineTo(x, canvas.height);
        } else {
            const y = horizonY + (canvas.height - horizonY) * (this.index / gridLines);
            const perspectiveY = horizonY + (y - horizonY) * (1 - this.depth);
            ctx.moveTo(0, perspectiveY);
            if (this.index < gridLines / 2) {
                for (let x = 0; x <= canvas.width; x += 20) { // Шаг увеличен для оптимизации
                    const waveY = perspectiveY + Math.sin(x * 0.005 + this.waveOffset) * this.waveAmplitude;
                    ctx.lineTo(x, waveY);
                }
            } else {
                ctx.lineTo(canvas.width, perspectiveY);
            }
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * horizonY;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.3 + 0.1; // Более прозрачно
        this.twinkleSpeed = Math.random() * 0.06 + 0.03;
        this.twinkleOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.twinkleOffset += this.twinkleSpeed;
        this.opacity = 0.2 + Math.sin(this.twinkleOffset) * 0.1; // Уменьшена яркость
    }

    draw() {
        ctx.fillStyle = `rgba(255, 51, 51, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = horizonY + Math.random() * (canvas.height - horizonY);
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.life = Math.random() * 120 + 60;
        this.opacity = 0.6; // Уменьшена начальная прозрачность
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.opacity = (this.life / 120) * 0.7; // Более плавное затухание
        if (mouse.x && mouse.y) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                this.speedX += dx * 0.001;
                this.speedY += dy * 0.001;
            }
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 51, 51, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Glow {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = Math.random() * 30 + 20;
        this.opacity = 0.3; // Более прозрачно
        this.growthRate = 0.5;
    }

    update() {
        this.radius += this.growthRate;
        this.opacity -= 0.005;
        if (this.opacity <= 0) this.radius = this.maxRadius;
    }

    draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `rgba(255, 51, 51, ${this.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 51, 51, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

const gridArray = [];
let backgroundCache = null;

function init() {
    gridArray.length = 0;
    starsArray.length = 0;
    particlesArray.length = 0;
    glowArray.length = 0;

    for (let i = 0; i < gridLines; i++) {
        gridArray.push(new GridLine(true, i));
        gridArray.push(new GridLine(false, i));
    }

    for (let i = 0; i < maxStars; i++) {
        starsArray.push(new Star());
    }

    for (let i = 0; i < maxParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function drawBackground() {
    if (!backgroundCache) {
        backgroundCache = document.createElement('canvas');
        backgroundCache.width = canvas.width;
        backgroundCache.height = canvas.height;
        const cacheCtx = backgroundCache.getContext('2d');

        const gradient = cacheCtx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.3, '#1a1a1a');
        gradient.addColorStop(1, '#000000');
        cacheCtx.fillStyle = gradient;
        cacheCtx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 5; i++) {
            const y = horizonY - 10 + i * 5;
            cacheCtx.strokeStyle = `rgba(255, 51, 51, ${0.1 - i * 0.02})`; // Уменьшена яркость
            cacheCtx.lineWidth = 1;
            cacheCtx.beginPath();
            cacheCtx.moveTo(0, y);
            cacheCtx.lineTo(canvas.width, y);
            cacheCtx.stroke();
        }
    }
    ctx.drawImage(backgroundCache, 0, 0);

    ctx.strokeStyle = `rgba(255, 51, 51, ${0.2 + Math.sin(Date.now() * 0.002) * 0.1})`; // Более прозрачный горизонт
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(canvas.width, horizonY);
    ctx.stroke();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    let horizonOffset = (!isMobile && mouse.x && mouse.y) 
        ? (mouse.y - canvas.height / 2) * 0.05 
        : 0;

    starsArray.forEach(star => {
        star.update();
        star.draw();
    });

    particlesArray.forEach((particle, i) => {
        particle.update();
        particle.draw();
        if (particle.life <= 0) {
            particlesArray[i] = new Particle();
        }
    });

    if (Math.random() < 0.03 && glowArray.length < 10) { // Ограничение количества свечений
        glowArray.push(new Glow(Math.random() * canvas.width, horizonY + Math.random() * (canvas.height - horizonY)));
    }
    glowArray.forEach((glow, i) => {
        glow.update();
        glow.draw();
        if (glow.opacity <= 0) glowArray.splice(i, 1);
    });

    gridArray.forEach(line => {
        line.update();
        line.draw();
    });

    requestAnimationFrame(animate);
}

init();
animate();

let lastMouseUpdate = 0;
const mouseThrottle = 16;

if (!isMobile) {
    window.addEventListener('mousemove', (event) => {
        const now = performance.now();
        if (now - lastMouseUpdate < mouseThrottle) return;
        lastMouseUpdate = now;
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });
} else {
    canvas.addEventListener('touchmove', (event) => {
        const touch = event.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
    });
    canvas.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        backgroundCache = null;
        init();
    }, 200);
});

document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (!navToggle || !navLinks) {
    console.error('Navigation elements not found');
} else {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

const themes = [
    { class: '', icon: 'fa-moon' },
    { class: 'soft-dark', icon: 'fa-adjust' },
    { class: 'light', icon: 'fa-sun' }
];
const toggleButton = document.querySelector('.theme-toggle');
let currentTheme = 0;

toggleButton.addEventListener('click', () => {
    currentTheme = (currentTheme + 1) % themes.length;
    document.body.className = themes[currentTheme].class;
    const icon = toggleButton.querySelector('i');
    icon.className = `fa ${themes[currentTheme].icon}`;
});
