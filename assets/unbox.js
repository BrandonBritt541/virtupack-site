/* ============================================================
   VIRTUPACK — assets/unbox.js
   Three.js unbox digitize reveal animation
   ============================================================ */

(function () {
  'use strict';

  try {
    const container = document.getElementById('unbox-reveal');
    if (!container || typeof THREE === 'undefined') {
      if (container) container.style.display = 'none';
      return;
    }

    // ── Scene ─────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 3000);
    camera.position.set(280, 220, 280);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0x8ab8ff, 1.4);
    dirLight.position.set(100, 200, 100);
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0x4da3ff, 0.8, 300);
    rimLight.position.set(120, 60, 120);
    scene.add(rimLight);

    // ── Resize ────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // ── Constants ───────────────────────────────────────────────
    const BW = 200, BH = 180, BD = 200;
    const HALF_W = BW / 2, HALF_H = BH / 2, HALF_D = BD / 2;
    const KRAFT  = 0xc4935a;
    const BLUE   = 0x4da3ff;

    const group = new THREE.Group();
    scene.add(group);

    const solidObjects = [];

    // ── Solid panel helper ─────────────────────────────────────────
    function addSolid(geo, color, px, py, pz, rx, ry, rz) {
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color, roughness: 0.85, side: THREE.DoubleSide,
      }));
      m.position.set(px, py, pz);
      m.rotation.set(rx, ry, rz);
      group.add(m);
      solidObjects.push(m);
      return m;
    }

    // ── Box panels ───────────────────────────────────────────────
    addSolid(new THREE.PlaneGeometry(BW, BD), KRAFT, 0, -HALF_H, 0, -Math.PI / 2, 0, 0);
    addSolid(new THREE.PlaneGeometry(BW, BH), KRAFT, 0, 0,  HALF_D, 0, 0, 0);
    addSolid(new THREE.PlaneGeometry(BW, BH), KRAFT, 0, 0, -HALF_D, 0, Math.PI, 0);
    addSolid(new THREE.PlaneGeometry(BD, BH), KRAFT, -HALF_W, 0, 0, 0,  Math.PI / 2, 0);
    addSolid(new THREE.PlaneGeometry(BD, BH), KRAFT,  HALF_W, 0, 0, 0, -Math.PI / 2, 0);

    // ── Corrugation lines ─────────────────────────────────────────
    for (let i = -3; i <= 3; i++) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(BW - 4, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x8b6335 })
      );
      strip.position.set(0, i * 22, HALF_D + 0.2);
      group.add(strip);
      solidObjects.push(strip);
    }

    // ── Flaps ─────────────────────────────────────────────────
    const LA = Math.PI / 6, SA = Math.PI / 9;
    const FL = HALF_D, FS = HALF_W;

    addSolid(new THREE.PlaneGeometry(BW, FL), KRAFT,
      0, HALF_H + Math.sin(LA) * FL / 2, HALF_D + Math.cos(LA) * FL / 2, -LA, 0, 0);
    addSolid(new THREE.PlaneGeometry(BW, FL), KRAFT,
      0, HALF_H + Math.sin(LA) * FL / 2, -HALF_D - Math.cos(LA) * FL / 2, LA, Math.PI, 0);
    addSolid(new THREE.PlaneGeometry(BD, FS), KRAFT,
      -HALF_W - Math.cos(SA) * FS / 2, HALF_H + Math.sin(SA) * FS / 2, 0, 0,  Math.PI / 2, SA);
    addSolid(new THREE.PlaneGeometry(BD, FS), KRAFT,
       HALF_W + Math.cos(SA) * FS / 2, HALF_H + Math.sin(SA) * FS / 2, 0, 0, -Math.PI / 2, -SA);

    // ── Kraft paper (crumpled) ──────────────────────────────────────
    const paperDefs = [
      [-30, HALF_H + 30, -20,  0.4,  0.2,  0.1],
      [ 25, HALF_H + 45,  15, -0.2,  0.5,  0.3],
      [  5, HALF_H + 20, -35,  0.1, -0.3, -0.2],
      [-15, HALF_H + 38,  30,  0.3,  0.8, -0.1],
    ];

    paperDefs.forEach(([px, py, pz, rx, ry, rz]) => {
      const geo = new THREE.PlaneGeometry(55, 55, 5, 5);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, (Math.random() - 0.5) * 18);
        pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 8);
        pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 8);
      }
      geo.computeVertexNormals();
      addSolid(geo, 0xd4a853, px, py, pz, rx, ry, rz);
    });

    // ── Product (stays solid through reveal) ───────────────────────
    const product = new THREE.Mesh(
      new THREE.BoxGeometry(80, 120, 80),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.7, metalness: 0.1 })
    );
    product.position.set(0, HALF_H - 60 + 45, 0);
    group.add(product);

    // ── Wireframe group ─────────────────────────────────────────────
    const wireGroup = new THREE.Group();
    wireGroup.visible = false;
    group.add(wireGroup);

    const wireEntries = [];

    function addWire(geo, color, targetOpacity, px, py, pz, rx, ry, rz) {
      const wGeo = new THREE.WireframeGeometry(geo);
      const mat  = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });
      const ls   = new THREE.LineSegments(wGeo, mat);
      if (px !== undefined) { ls.position.set(px, py, pz); ls.rotation.set(rx, ry, rz); }
      wireGroup.add(ls);
      wireEntries.push({ ls, targetOpacity });

      // Glow copy
      const gMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });
      const gls  = new THREE.LineSegments(new THREE.WireframeGeometry(geo), gMat);
      gls.scale.setScalar(1.04);
      if (px !== undefined) { gls.position.set(px, py, pz); gls.rotation.set(rx, ry, rz); }
      wireGroup.add(gls);
      wireEntries.push({ ls: gls, targetOpacity: 0.2 });
    }

    addWire(new THREE.BoxGeometry(BW, BH, BD), BLUE, 0.9);
    addWire(new THREE.BoxGeometry(BW, 2, FL), 0x2a85ff, 0.7, 0, HALF_H + 10,  HALF_D + FL / 2, 0, 0, 0);
    addWire(new THREE.BoxGeometry(BW, 2, FL), 0x2a85ff, 0.7, 0, HALF_H + 10, -HALF_D - FL / 2, 0, 0, 0);
    paperDefs.forEach(([px, py, pz, rx, ry, rz]) => {
      addWire(new THREE.PlaneGeometry(55, 55, 3, 3), 0x6ab8ff, 0.5, px, py, pz, rx, ry, rz);
    });

    // ── Particles ───────────────────────────────────────────────
    const scatterParts = [];

    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function buildParticles() {
      for (let i = 0; i < 600; i++) {
        const geo = new THREE.PlaneGeometry(3, 3);
        const mat = new THREE.MeshBasicMaterial({
          color: BLUE, transparent: true, opacity: 1,
          side: THREE.DoubleSide, depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);

        const face = Math.floor(Math.random() * 6);
        let x = 0, y = 0, z = 0;
        if (face === 0) { x =  HALF_W; y = (Math.random() - 0.5) * BH; z = (Math.random() - 0.5) * BD; }
        if (face === 1) { x = -HALF_W; y = (Math.random() - 0.5) * BH; z = (Math.random() - 0.5) * BD; }
        if (face === 2) { y =  HALF_H; x = (Math.random() - 0.5) * BW; z = (Math.random() - 0.5) * BD; }
        if (face === 3) { y = -HALF_H; x = (Math.random() - 0.5) * BW; z = (Math.random() - 0.5) * BD; }
        if (face === 4) { z =  HALF_D; x = (Math.random() - 0.5) * BW; y = (Math.random() - 0.5) * BH; }
        if (face === 5) { z = -HALF_D; x = (Math.random() - 0.5) * BW; y = (Math.random() - 0.5) * BH; }

        mesh.position.set(x, y, z);
        const dir = new THREE.Vector3(x, y, z).normalize();
        dir.x += (Math.random() - 0.5) * 0.7;
        dir.y += (Math.random() - 0.5) * 0.7;
        dir.z += (Math.random() - 0.5) * 0.7;
        dir.normalize();

        const speed = 100 + Math.random() * 180;
        scatterParts.push({ mesh, dir, speed, sx: x, sy: y, sz: z });
        group.add(mesh);
      }
    }

    function disposeParticle(p) {
      group.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      p.disposed = true;
    }

    // ── Animation loop ─────────────────────────────────────────────
    let phase = 'rotating', digitizeStart = 0;
    const DIGITIZE_DUR = 1500;

    function animate(ts) {
      requestAnimationFrame(animate);
      const clock = ts || 0;

      group.rotation.y += 0.004;

      if (phase === 'rotating' && clock > 2000) {
        phase         = 'digitize';
        digitizeStart = clock;
        solidObjects.forEach(m => { m.visible = false; });
        wireGroup.visible = true;
        buildParticles();
      }

      if (phase === 'digitize') {
        const t  = Math.min((clock - digitizeStart) / DIGITIZE_DUR, 1);
        const te = easeInOut(t);
        const fadeT = Math.max(0, (t - 0.3) / 0.7);

        wireEntries.forEach(e => {
          e.ls.material.opacity = fadeT * e.targetOpacity;
        });

        scatterParts.forEach(p => {
          if (p.disposed) return;
          const travel = te * p.speed;
          p.mesh.position.set(p.sx + p.dir.x * travel, p.sy + p.dir.y * travel, p.sz + p.dir.z * travel);
          p.mesh.material.opacity = Math.max(0, 1 - te * 1.5);
          if (p.mesh.material.opacity <= 0) disposeParticle(p);
        });

        if (t >= 1) {
          scatterParts.forEach(p => { if (!p.disposed) disposeParticle(p); });
          wireEntries.forEach(e => { e.ls.material.opacity = e.targetOpacity; });
          phase = 'reveal';
        }
      }

      if (phase === 'reveal') {
        const breath = 1 + 0.02 * Math.sin(clock * 0.00209);
        wireEntries.forEach(e => { e.ls.scale.setScalar(breath); });
      }

      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);

  } catch (err) {
    const c = document.getElementById('unbox-reveal');
    if (c) c.style.display = 'none';
  }
})();
