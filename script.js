class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.8 + 0.2;
    this.pulseSpeed = Math.random() * 0.02 + 0.005;
    this.pulseOffset = Math.random() * Math.PI * 2;
    this.baseOpacity = this.opacity;
    this.hue = 217;
    this.saturation = Math.random() > 0.6 ? 70 + Math.floor(Math.random() * 20) : 0;
    this.isAccent = this.saturation > 0;
  }

  update(time) {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0) this.x = this.canvas.width;
    if (this.x > this.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.canvas.height;
    if (this.y > this.canvas.height) this.y = 0;

    this.opacity = this.baseOpacity * (0.5 + 0.5 * Math.sin(time * this.pulseSpeed + this.pulseOffset));
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    if (this.isAccent) {
      ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, 62%)`;
    } else {
      ctx.fillStyle = '#fdfbf7';
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 120;
    this.animationId = null;
    this.startTime = Date.now();

    this.resize();
    this.init();
    this.animate();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(new Particle(this.canvas));
    }
  }

  animate() {
    const elapsed = Date.now() - this.startTime;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      p.update(elapsed);
      p.draw(this.ctx);
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem('particleCanvas');

  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.querySelector('.theme-icon');

  const savedTheme = localStorage.getItem('theme');
  let initialTheme;

  if (savedTheme) {
    initialTheme = savedTheme;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    initialTheme = prefersDark ? 'dark' : 'light';
  }

  setTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (themeIcon) {
      themeIcon.textContent = theme === 'light' ? '\u2600' : '\u263E';
    }
  }
});

function toggleAbout() {
  const el = document.getElementById('aboutSection');
  if (el) el.classList.toggle('active');
}

function toggleConnect() {
  const el = document.getElementById('connectSection');
  if (el) el.classList.toggle('active');
}

function openWordleModal() {
  const modal = document.getElementById('wordleModal');
  if (!modal) return;
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
}

function closeWordleModal() {
  const modal = document.getElementById('wordleModal');
  if (!modal) return;
  modal.classList.remove('active');
  setTimeout(() => { modal.style.display = 'none'; }, 200);
  document.body.style.overflow = '';
}

window.onclick = function (event) {
  const modal = document.getElementById('wordleModal');
  if (modal && event.target === modal) {
    closeWordleModal();
  }
};
