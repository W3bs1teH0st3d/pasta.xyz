/* Copyright (c) 2025 Pasta.xyz All rights reserved. Unauthorized use prohibited. */
/* Questions to discord: https://discord.gg/9dMNYANZ */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: null, y: null, radius: 200 };
const isMobile = window.innerWidth <= 768;
const gridLines = 20;
const horizonY = canvas.height * 0.4;
const starsArray = [];
const maxStars = 30;
const particlesArray = [];
const maxParticles = 20;

class GridLine {
    constructor(isVertical, index) {
        this.isVertical = isVertical;
        this.index = index;
        this.depth = index / gridLines;
        this.color = `rgba(255, 51, 51, ${0.2 - this.depth * 0.15})`;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmplitude = 40 + this.depth * 60; // Увеличена амплитуда для выразительности
    }

    update() {
        this.waveOffset += 0.01 * (1 - this.depth); // Медленные волны
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.8 - this.depth * 0.4;
        ctx.shadowBlur = 3;
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
                // Пошаговое рисование для выразительных волн
                for (let x = 0; x <= canvas.width; x += 40) { // Шаг 40 для оптимизации
                    const waveY = perspectiveY + Math.sin(x * 0.008 + this.waveOffset) * this.waveAmplitude;
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
        this.opacity = Math.random() * 0.2 + 0.1;
        this.twinkleSpeed = Math.random() * 0.05 + 0.02;
        this.twinkleOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.twinkleOffset += this.twinkleSpeed;
        this.opacity = 0.15 + Math.sin(this.twinkleOffset) * 0.1;
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
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * 0.6 - 0.3;
        this.life = Math.random() * 100 + 50;
        this.opacity = 0.5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.opacity = (this.life / 100) * 0.5;
        if (mouse.x && mouse.y) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                this.speedX += dx * 0.0005;
                this.speedY += dy * 0.0005;
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

const gridArray = [];
let backgroundCache = null;
let lastFrameTime = 0;
const targetFPS = 30;
const frameInterval = 1000 / targetFPS;

function init() {
    gridArray.length = 0;
    starsArray.length = 0;
    particlesArray.length = 0;

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

        for (let i = 0; i < 3; i++) {
            const y = horizonY - 10 + i * 5;
            cacheCtx.strokeStyle = `rgba(255, 51, 51, ${0.08 - i * 0.02})`;
            cacheCtx.lineWidth = 1;
            cacheCtx.beginPath();
            cacheCtx.moveTo(0, y);
            cacheCtx.lineTo(canvas.width, y);
            cacheCtx.stroke();
        }
    }
    ctx.drawImage(backgroundCache, 0, 0);

    ctx.strokeStyle = `rgba(255, 51, 51, ${0.15 + Math.sin(Date.now() * 0.002) * 0.05})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(canvas.width, horizonY);
    ctx.stroke();
}

function animate(currentTime) {
    if (currentTime - lastFrameTime < frameInterval) {
        requestAnimationFrame(animate);
        return;
    }
    lastFrameTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    let horizonOffset = (!isMobile && mouse.x && mouse.y) 
        ? (mouse.y - canvas.height / 2) * 0.03 
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

    gridArray.forEach(line => {
        line.update();
        line.draw();
    });

    requestAnimationFrame(animate);
}

init();
requestAnimationFrame(animate);

let lastMouseUpdate = 0;
const mouseThrottle = 32;

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
