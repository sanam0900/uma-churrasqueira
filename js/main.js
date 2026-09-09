/* ===========================
   Three.js Hero + Animations
   =========================== */

(function () {
  // Force page to top on load (prevents Elfsight or hash from auto-scrolling)
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
  history.scrollRestoration = 'manual';

  // ---- Navbar scroll ----
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  navToggle && navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
    navbar.classList.toggle('menu-open');
  });

  // Close menu when a nav link is tapped
  navLinks && navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navbar.classList.remove('menu-open');
    });
  });

  // Close menu on scroll
  window.addEventListener('scroll', () => {
    if (navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navbar.classList.remove('menu-open');
    }
  }, { passive: true });

  // ---- Set min date on reservation form ----
  const dateInput = document.getElementById('resDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // ---- Reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const heroReveals = document.querySelectorAll('.hero .reveal-up');

  // Hero elements reveal on load
  setTimeout(() => {
    heroReveals.forEach(el => el.classList.add('visible'));
  }, 100);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => {
    if (!el.closest('.hero')) observer.observe(el);
  });

  // ---- Three.js Hero Canvas ----
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x111111, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Fog for depth
  scene.fog = new THREE.FogExp2(0x111111, 0.06);

  // ---- Ember Particles ----
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const velocities = [];

  const emberColors = [
    new THREE.Color(0xD4A017),
    new THREE.Color(0xE05A00),
    new THREE.Color(0xFF8C00),
    new THREE.Color(0xFFD700),
    new THREE.Color(0x2D7D79),
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

    const col = emberColors[Math.floor(Math.random() * emberColors.length)];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i] = Math.random() * 4 + 1;

    velocities.push({
      x: (Math.random() - 0.5) * 0.006,
      y: Math.random() * 0.012 + 0.003,
      z: (Math.random() - 0.5) * 0.004,
    });
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---- Grill Grid (decorative plane) ----
  const grillGroup = new THREE.Group();
  const lineColor = new THREE.Color(0xD4A017);
  const lineMat = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.15 });

  for (let i = -4; i <= 4; i++) {
    const pts = [new THREE.Vector3(-4, i * 0.5, 0), new THREE.Vector3(4, i * 0.5, 0)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    grillGroup.add(new THREE.Line(geo, lineMat));
  }
  for (let i = -8; i <= 8; i++) {
    const pts = [new THREE.Vector3(i * 0.5, -2, 0), new THREE.Vector3(i * 0.5, 2, 0)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    grillGroup.add(new THREE.Line(geo, lineMat));
  }

  grillGroup.position.set(0, -2.5, -2);
  grillGroup.rotation.x = -0.4;
  scene.add(grillGroup);

  // ---- Ambient glow sphere ----
  const glowGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xE05A00,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(0, -1.5, -1);
  scene.add(glow);

  // ---- Teal ambient ring ----
  const torusGeo = new THREE.TorusGeometry(2.5, 0.015, 8, 80);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x2D7D79,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(torusGeo, torusMat);
  ring.position.set(0, 0, -3);
  scene.add(ring);

  // ---- Mouse parallax ----
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---- Resize ----
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---- Animation Loop ----
  const clock = new THREE.Clock();
  let frame = 0;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    frame++;

    // Update ember positions
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3]     += velocities[i].x + Math.sin(t * 0.5 + i) * 0.001;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;

      // Reset when out of bounds
      if (pos[i * 3 + 1] > 6) {
        pos[i * 3]     = (Math.random() - 0.5) * 18;
        pos[i * 3 + 1] = -6;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Rotate grill slightly
    grillGroup.rotation.y = Math.sin(t * 0.3) * 0.05 + mouseX * 0.04;

    // Ring rotation
    ring.rotation.x = t * 0.15;
    ring.rotation.y = t * 0.25;

    // Glow pulse
    glowMat.opacity = 0.04 + Math.sin(t * 1.5) * 0.02;

    // Camera drift with mouse
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 0.15 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
})();
