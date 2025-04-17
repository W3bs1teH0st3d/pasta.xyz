// Частицы (оставляем без изменений)
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particlesArray = [];
let mouse = { x: null, y: null, radius: 120 };
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
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;

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
    ctx.shadowBlur = 12;
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

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();
  }
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

// Плавная прокрутка
document.querySelectorAll('.scroll-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Бургер-меню
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (!navToggle || !navLinks) {
  console.error('Ошибка: .nav-toggle или .nav-links не найдены в DOM');
} else {
  navToggle.addEventListener('click', () => {
    console.log('Кнопка бургер-меню нажата');
    navLinks.classList.toggle('active');
    console.log('Класс .active добавлен/удален:', navLinks.classList.contains('active'));
  });
}

// Управление вкладками
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Удаляем активный класс у всех кнопок и панелей
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      // Добавляем активный класс к текущей кнопке и соответствующей панели
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
});

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