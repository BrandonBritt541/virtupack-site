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
    camera.position.set(300, 260, 300);
    camera.lookAt(0, 60, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // ── Resize ────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // ── Corrugated cardboard texture ──────────────────────────
    function createCorrugatedTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#c4935a';
      ctx.fillRect(0, 0, 512, 512);

      for (let y = 0; y < 512; y += 6) {
        ctx.fillStyle = 'rgba(255, 220, 150, 0.25)';
        ctx.fillRect(0, y, 512, 2);
        ctx.fillStyle = 'rgba(80, 40, 10, 0.18)';
        ctx.fillRect(0, y + 3, 512, 2);
      }

      for (let i = 0; i < 8000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const alpha = Math.random() * 0.04;
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fillRect(x, y, 1, 1);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 3);
      return texture;
    }

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xfff5e6, 0.45));

    const mainLight = new THREE.DirectionalLight(0xfff8f0, 0.9);
    mainLight.position.set(150, 300, 200);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.3);
    fillLight.position.set(-150, 200, -100);
    scene.add(fillLight);

    const shadowLight = new THREE.DirectionalLight(0x3a2010, 0.15);
    shadowLight.position.set(0, -100, 0);
    scene.add(shadowLight);

    // Spotlight above product: group.y=50 + product.y=100 → world y=150
    const spotLight = new THREE.SpotLight(0xffffff, 0.4);
    spotLight.position.set(0, 420, 0);
    spotLight.angle = Math.PI / 8;
    spotLight.penumbra = 0.35;
    spotLight.target.position.set(0, 150, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // ── Materials ─────────────────────────────────────────────
    const corrTex = createCorrugatedTexture();

    const kraftMat = new THREE.MeshStandardMaterial({
      map:       corrTex,
      color:     0xc4935a,
      roughness: 0.9,
      metalness: 0.0,
    });

    const paperMat = new THREE.MeshStandardMaterial({
      color:     0xc8924a,
      roughness: 0.95,
      metalness: 0.0,
    });

    const productMat = new THREE.MeshStandardMaterial({
      color:     0x2a2a2a,
      roughness: 0.7,
      metalness: 0.2,
    });

    const BLUE = 0x4da3ff;

    // ── Groups ────────────────────────────────────────────────
    const group = new THREE.Group();
    group.position.y = 50;
    scene.add(group);

    const solidGroup = new THREE.Group();
    group.add(solidGroup);

    const wireGroup = new THREE.Group();
    wireGroup.visible = false;
    group.add(wireGroup);

    const solidMeshes = [];

    // ── Helper: box wall mesh ─────────────────────────────────
    function addBox(geo, mat, px, py, pz, rx, ry, rz) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(px, py, pz);
      if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
      solidGroup.add(m);
      solidMeshes.push(m);
      return m;
    }

    // ── BOX BODY ──────────────────────────────────────────────
    addBox(new THREE.BoxGeometry(200, 10, 200), kraftMat, 0, -85, 0);
    addBox(new THREE.BoxGeometry(200, 180, 8),  kraftMat, 0, 0,   100);
    addBox(new THREE.BoxGeometry(200, 180, 8),  kraftMat, 0, 0,  -100);
    addBox(new THREE.BoxGeometry(8,  180, 200), kraftMat, -100, 0, 0);
    addBox(new THREE.BoxGeometry(8,  180, 200), kraftMat,  100, 0, 0);

    // ── FLAPS ─────────────────────────────────────────────────
    // Long flaps (front/back): -30° opens tips upward
    // Short flaps (left/right): ±25° opens tips upward
    function addFlap(geo, pivotX, pivotY, pivotZ, rx, rz, localX, localZ) {
      const pivot = new THREE.Object3D();
      pivot.position.set(pivotX, pivotY, pivotZ);
      if (rx) pivot.rotation.x = rx;
      if (rz) pivot.rotation.z = rz;
      solidGroup.add(pivot);

      const m = new THREE.Mesh(geo, kraftMat);
      m.position.set(localX || 0, 0, localZ || 0);
      pivot.add(m);
      solidMeshes.push(m);
      return pivot;
    }

    addFlap(new THREE.BoxGeometry(200, 8, 100), 0,    90,  100, -Math.PI * 30 / 180, null,  0,   50);
    addFlap(new THREE.BoxGeometry(200, 8, 100), 0,    90, -100,  Math.PI * 30 / 180, null,  0,  -50);
    addFlap(new THREE.BoxGeometry(100, 8, 200), -100, 90,    0,  null, -Math.PI * 25 / 180, -50,   0);
    addFlap(new THREE.BoxGeometry(100, 8, 200),  100, 90,    0,  null,  Math.PI * 25 / 180,  50,   0);

    // ── KRAFT PAPER (packed ring inside box) ──────────────────
    // 8 clumps at radius 55; 3 tall (tips ~y=105), 5 lower (tips ~y=100)
    const paperClumps = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const r     = 55;
      const tall  = i < 3;
      return {
        x:  Math.cos(angle) * r,
        z:  Math.sin(angle) * r,
        y:  tall ? 85 : 80,
        sx: 1.3 + (i % 3) * 0.1,
        sy: tall ? 0.75 : 0.6,
        sz: 1.3 + (i % 3) * 0.1,
      };
    });

    paperClumps.forEach(({ x, y, z, sx, sy, sz }) => {
      const geo = new THREE.SphereGeometry(28, 6, 5);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 18);
        pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 14);
        pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 18);
      }
      geo.computeVertexNormals();

      const m = new THREE.Mesh(geo, paperMat.clone());
      m.scale.set(sx, sy, sz);
      m.position.set(x, y + (Math.random() - 0.5) * 6, z);
      solidGroup.add(m);
      solidMeshes.push(m);
    });

    // ── PRODUCT (cylinder, stays solid always) ────────────────
    // Box opening at y=90; top 50 above = y=140; center at y=100
    const product = new THREE.Mesh(
      new THREE.CylinderGeometry(35, 35, 80, 32),
      productMat
    );
    product.position.set(0, 100, 0);
    group.add(product);

    // ── WIRE HELPER ───────────────────────────────────────────
    const wireEntries = [];

    function addEdgeWire(geo, color, targetOpacity, parent, px, py, pz, rx, ry, rz) {
      const eGeo = new THREE.EdgesGeometry(geo);
      const mat  = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });
      const ls   = new THREE.LineSegments(eGeo, mat);
      if (px !== undefined) {
        ls.position.set(px, py, pz);
        ls.rotation.set(rx || 0, ry || 0, rz || 0);
      }
      (parent || wireGroup).add(ls);
      wireEntries.push({ ls, targetOpacity });

      const gMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });
      const gls  = new THREE.LineSegments(new THREE.EdgesGeometry(geo), gMat);
      gls.scale.setScalar(1.05);
      if (px !== undefined) {
        gls.position.set(px, py, pz);
        gls.rotation.set(rx || 0, ry || 0, rz || 0);
      }
      (parent || wireGroup).add(gls);
      wireEntries.push({ ls: gls, targetOpacity: 0.15 });
    }

    addEdgeWire(new THREE.BoxGeometry(200, 10, 200), BLUE, 0.9, null, 0, -85, 0);
    addEdgeWire(new THREE.BoxGeometry(200, 180, 8),  BLUE, 0.9, null, 0,  0,   100);
    addEdgeWire(new THREE.BoxGeometry(200, 180, 8),  BLUE, 0.9, null, 0,  0,  -100);
    addEdgeWire(new THREE.BoxGeometry(8,  180, 200), BLUE, 0.9, null, -100, 0, 0);
    addEdgeWire(new THREE.BoxGeometry(8,  180, 200), BLUE, 0.9, null,  100, 0, 0);

    const FLAP_COLOR = 0x2a85ff;
    function addFlapWire(geo, pivotX, pivotY, pivotZ, pivotRx, pivotRz, localX, localZ) {
      const pivotObj = new THREE.Object3D();
      pivotObj.position.set(pivotX, pivotY, pivotZ);
      if (pivotRx) pivotObj.rotation.x = pivotRx;
      if (pivotRz) pivotObj.rotation.z = pivotRz;
      wireGroup.add(pivotObj);

      const eGeo = new THREE.EdgesGeometry(geo);
      const mat  = new THREE.LineBasicMaterial({ color: FLAP_COLOR, transparent: true, opacity: 0 });
      const ls   = new THREE.LineSegments(eGeo, mat);
      ls.position.set(localX || 0, 0, localZ || 0);
      pivotObj.add(ls);
      wireEntries.push({ ls, targetOpacity: 0.7 });

      const gMat = new THREE.LineBasicMaterial({ color: FLAP_COLOR, transparent: true, opacity: 0 });
      const gls  = new THREE.LineSegments(new THREE.EdgesGeometry(geo), gMat);
      gls.scale.setScalar(1.05);
      gls.position.set(localX || 0, 0, localZ || 0);
      pivotObj.add(gls);
      wireEntries.push({ ls: gls, targetOpacity: 0.15 });
    }

    addFlapWire(new THREE.BoxGeometry(200, 8, 100), 0,    90,  100, -Math.PI*30/180, null,  0,   50);
    addFlapWire(new THREE.BoxGeometry(200, 8, 100), 0,    90, -100,  Math.PI*30/180, null,  0,  -50);
    addFlapWire(new THREE.BoxGeometry(100, 8, 200), -100, 90,    0,  null, -Math.PI*25/180, -50,   0);
    addFlapWire(new THREE.BoxGeometry(100, 8, 200),  100, 90,    0,  null,  Math.PI*25/180,  50,   0);

    paperClumps.forEach(({ x, y, z, sx, sy, sz }) => {
      const eGeo = new THREE.EdgesGeometry(new THREE.SphereGeometry(28, 6, 5));
      const mat  = new THREE.LineBasicMaterial({ color: 0x6ab8ff, transparent: true, opacity: 0 });
      const ls   = new THREE.LineSegments(eGeo, mat);
      ls.scale.set(sx, sy, sz);
      ls.position.set(x, y, z);
      wireGroup.add(ls);
      wireEntries.push({ ls, targetOpacity: 0.5 });

      const gMat = new THREE.LineBasicMaterial({ color: 0x6ab8ff, transparent: true, opacity: 0 });
      const gls  = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.SphereGeometry(28, 6, 5)), gMat);
      gls.scale.set(sx * 1.05, sy * 1.05, sz * 1.05);
      gls.position.set(x, y, z);
      wireGroup.add(gls);
      wireEntries.push({ ls: gls, targetOpacity: 0.15 });
    });

    // ── PARTICLES ─────────────────────────────────────────────
    const scatterParts = [];

    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function buildParticles() {
      for (let i = 0; i < 500; i++) {
        const geo = new THREE.PlaneGeometry(3, 3);
        const mat = new THREE.MeshBasicMaterial({
          color: BLUE, transparent: true, opacity: 1,
          side: THREE.DoubleSide, depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);

        const face = Math.floor(Math.random() * 6);
        let x = 0, y = 0, z = 0;
        if (face === 0) { x =  100; y = (Math.random() - 0.5) * 180; z = (Math.random() - 0.5) * 200; }
        if (face === 1) { x = -100; y = (Math.random() - 0.5) * 180; z = (Math.random() - 0.5) * 200; }
        if (face === 2) { z =  100; x = (Math.random() - 0.5) * 200; y = (Math.random() - 0.5) * 180; }
        if (face === 3) { z = -100; x = (Math.random() - 0.5) * 200; y = (Math.random() - 0.5) * 180; }
        if (face === 4) { y =  90;  x = (Math.random() - 0.5) * 200; z = (Math.random() - 0.5) * 200; }
        if (face === 5) { y = -90;  x = (Math.random() - 0.5) * 200; z = (Math.random() - 0.5) * 200; }

        mesh.position.set(x, y, z);
        const dir = new THREE.Vector3(x, y, z).normalize();
        dir.x += (Math.random() - 0.5) * 0.8;
        dir.y += (Math.random() - 0.5) * 0.8;
        dir.z += (Math.random() - 0.5) * 0.8;
        dir.normalize();

        scatterParts.push({ mesh, dir, speed: 90 + Math.random() * 160, sx: x, sy: y, sz: z });
        group.add(mesh);
      }
    }

    function disposeParticle(p) {
      group.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      p.disposed = true;
    }

    // ── ANIMATION LOOP ─────────────────────────────────────────
    let phase = 'rotating', digitizeStart = 0;
    const DIGITIZE_DUR = 1500;

    function animate(ts) {
      requestAnimationFrame(animate);
      const clock = ts || 0;

      group.rotation.y += 0.003;

      if (phase === 'rotating' && clock > 2000) {
        phase         = 'digitize';
        digitizeStart = clock;
        solidGroup.visible = false;
        wireGroup.visible  = true;
        buildParticles();
      }

      if (phase === 'digitize') {
        const t     = Math.min((clock - digitizeStart) / DIGITIZE_DUR, 1);
        const te    = easeInOut(t);
        const fadeT = Math.max(0, (t - 0.25) / 0.75);

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
        wireGroup.scale.setScalar(breath);
      }

      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);

  } catch (err) {
    const c = document.getElementById('unbox-reveal');
    if (c) c.style.display = 'none';
  }
})();
