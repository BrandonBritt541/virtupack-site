/* ============================================================
   VIRTUPACK — assets/unbox.js
   Three.js unbox / digitize reveal animation
   ============================================================ */

(function () {
  'use strict';

  try {
    const container = document.getElementById('unbox-reveal');
    if (!container || typeof THREE === 'undefined') {
      if (container) container.style.display = 'none';
      return;
    }

    // ── Scene setup ───────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 2000);
    camera.position.set(0, 80, 400);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0x8ab8ff, 1.2);
    dirLight.position.set(0, 300, 200);
    scene.add(dirLight);

    // ── Responsive resize ─────────────────────────────────────────
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // ── Solid box ───────────────────────────────────────────────
    const BOX_SIZE = 200;
    const boxGeo   = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    const boxMat   = new THREE.MeshLambertMaterial({ color: 0xc4935a });
    const solidBox = new THREE.Mesh(boxGeo, boxMat);
    scene.add(solidBox);

    // ── Wireframe box (hidden until reveal) ───────────────────────
    const wireGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x4da3ff, transparent: true, opacity: 0 });
    const wireBox = new THREE.LineSegments(wireGeo, wireMat);
    scene.add(wireBox);

    // ── State ───────────────────────────────────────────────────
    const PARTICLE_COUNT    = 600;
    const DIGITIZE_DURATION = 2500; // ms
    const particles         = [];
    let phase               = 'solid';   // solid → digitize → reveal
    let digitizeStart       = 0;
    let clock               = 0;
    let animId;

    // ── Build particles ───────────────────────────────────────────
    function buildParticles() {
      const half = BOX_SIZE / 2;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const geo = new THREE.PlaneGeometry(6, 6);
        const mat = new THREE.MeshBasicMaterial({
          color:       0x4da3ff,
          transparent: true,
          opacity:     1,
          side:        THREE.DoubleSide,
          depthWrite:  false,
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Random surface position on the box
        const face = Math.floor(Math.random() * 6);
        let x = 0, y = 0, z = 0;
        if (face === 0) { x =  half; y = (Math.random() - 0.5) * BOX_SIZE; z = (Math.random() - 0.5) * BOX_SIZE; }
        if (face === 1) { x = -half; y = (Math.random() - 0.5) * BOX_SIZE; z = (Math.random() - 0.5) * BOX_SIZE; }
        if (face === 2) { y =  half; x = (Math.random() - 0.5) * BOX_SIZE; z = (Math.random() - 0.5) * BOX_SIZE; }
        if (face === 3) { y = -half; x = (Math.random() - 0.5) * BOX_SIZE; z = (Math.random() - 0.5) * BOX_SIZE; }
        if (face === 4) { z =  half; x = (Math.random() - 0.5) * BOX_SIZE; y = (Math.random() - 0.5) * BOX_SIZE; }
        if (face === 5) { z = -half; x = (Math.random() - 0.5) * BOX_SIZE; y = (Math.random() - 0.5) * BOX_SIZE; }

        mesh.position.set(x, y, z);

        // Outward scatter velocity
        const speed = 80 + Math.random() * 160;
        const dir   = new THREE.Vector3(x, y, z).normalize();
        dir.x += (Math.random() - 0.5) * 0.6;
        dir.y += (Math.random() - 0.5) * 0.6;
        dir.z += (Math.random() - 0.5) * 0.6;
        dir.normalize();

        particles.push({ mesh, dir, speed, startX: x, startY: y, startZ: z });
        scene.add(mesh);
      }
    }

    // ── Cubic-bezier easing (ease-in-out) ───────────────────────────
    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // ── Dispose particle ────────────────────────────────────────────
    function disposeParticle(p) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      p.disposed = true;
    }

    // ── Animate ─────────────────────────────────────────────────
    function animate(ts) {
      animId = requestAnimationFrame(animate);
      clock  = ts || 0;

      // ── Phase: solid — wait 1 second then kick off digitize
      if (phase === 'solid') {
        if (clock > 1000) {
          phase         = 'digitize';
          digitizeStart = clock;
          solidBox.visible = false;
          buildParticles();
        }
      }

      // ── Phase: digitize — scatter particles, fade, reveal wire
      if (phase === 'digitize') {
        const elapsed = clock - digitizeStart;
        const t       = Math.min(elapsed / DIGITIZE_DURATION, 1);
        const te      = easeInOut(t);

        // Fade wireframe in during second half
        wireMat.opacity = Math.max(0, (t - 0.4) / 0.6);

        particles.forEach(p => {
          if (p.disposed) return;
          const travel = te * p.speed;
          p.mesh.position.set(
            p.startX + p.dir.x * travel,
            p.startY + p.dir.y * travel,
            p.startZ + p.dir.z * travel,
          );
          p.mesh.material.opacity = Math.max(0, 1 - te * 1.4);
          if (p.mesh.material.opacity <= 0 && !p.disposed) disposeParticle(p);
        });

        if (t >= 1) {
          // Clean up any remaining particles
          particles.forEach(p => { if (!p.disposed) disposeParticle(p); });
          phase = 'reveal';
        }
      }

      // ── Phase: reveal — rotate wireframe, breathing scale
      if (phase === 'reveal') {
        wireBox.rotation.y += 0.003;
        const breath = 1 + 0.02 * Math.sin(clock * 0.0015);
        wireBox.scale.setScalar(breath);
      }

      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);

  } catch (err) {
    const container = document.getElementById('unbox-reveal');
    if (container) container.style.display = 'none';
  }
})();
