/* Copyright (c) 2025 Pasta.xyz All rights reserved. Unauthorized use prohibited. */
/* Questions to discord: https://discord.gg/9dMNYANZ */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particlesArray = [];
let mouse = { x: null, y: null, radius: 140 };
const isMobile = window.innerWidth <= 768;
const maxParticles = isMobile ? 50 : 120;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 4 + 1;
    this.speedX = Math.random() * 0.6 - 0.3;
    this.speedY = Math.random() * 0.6 - 0.3;
    this.color = `rgba(255, 51, 51, ${Math.random() * 0.6 + 0.2})`;
    this.life = Math.random() * 120 + 60;
    this.depth = Math.random();
  }
  update(scrollY) {
    this.x += this.speedX * (1 - this.depth);
    this.y += this.speedY * (1 - this.depth) + scrollY * this.depth * 0.05;

    if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
    if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

    if (!isMobile && mouse.x && mouse.y) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        this.x -= (dx / distance) * 2.5;
        this.y -= (dy / distance) * 2.5;
      }
    }

    this.life -= 1;
    if (this.life <= 0) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.life = Math.random() * 120 + 60;
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff3333';
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function init() {
  for (let i = 0; i < maxParticles; i++) {
    particlesArray.push(new Particle());
  }
}

function connectParticles() {
  for (let i = 0; i < particlesArray.length; i++) {
    for (let j = i + 1; j < particlesArray.length; j++) {
      let dx = particlesArray[i].x - particlesArray[j].x;
      let dy = particlesArray[i].y - particlesArray[j].y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        ctx.strokeStyle = `rgba(255, 51, 51, ${1 - distance / 100})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scrollY = window.scrollY;
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update(scrollY);
    particlesArray[i].draw();
  }
  if (!isMobile) connectParticles();
  requestAnimationFrame(animate);
}

init();
animate();

if (!isMobile) {
  window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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
  console.error('error');
} else {
  navToggle.addEventListener('click', () => {
    console.log('menu');
    navLinks.classList.toggle('active');
    console.log('log:', navLinks.classList.contains('active'));
  });
}

// Переключение тем
const toggleButton = document.querySelector('.theme-toggle');
const body = document.body;
let currentTheme = 0;

toggleButton.addEventListener('click', () => {
  currentTheme = (currentTheme + 1) % 3;
  const icon = toggleButton.querySelector('i');

  if (currentTheme === 0) {
    body.classList.remove('soft-dark', 'light');
    icon.classList.remove('fa-sun', 'fa-adjust');
    icon.classList.add('fa-moon');
  } else if (currentTheme === 1) {
    body.classList.remove('light');
    body.classList.add('soft-dark');
    icon.classList.remove('fa-moon', 'fa-sun');
    icon.classList.add('fa-adjust');
  } else {
    body.classList.remove('soft-dark');
    body.classList.add('light');
    icon.classList.remove('fa-moon', 'fa-adjust');
    icon.classList.add('fa-sun');
  }
});
