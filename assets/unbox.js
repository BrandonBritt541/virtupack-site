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
    camera.position.set(220, 180, 280);
    camera.lookAt(0, 20, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(150, 300, 200);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xaaccff, 0.3);
    fillLight.position.set(-200, 100, -100);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x4da3ff, 0.6, 250);
    rimLight.position.set(-80, 120, -80);
    scene.add(rimLight);

    // ── Resize ────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // ── Materials ─────────────────────────────────────────────
    const KRAFT_COLOR   = 0xc4935a;
    const KRAFT_DARK    = 0x8b5e3c;
    const PAPER_COLOR   = 0xc8924a;
    const PRODUCT_COLOR = 0x2a2a2a;
    const BLUE          = 0x4da3ff;

    const kraftMat = new THREE.MeshStandardMaterial({
      color: KRAFT_COLOR, roughness: 0.85, metalness: 0.0,
    });
    const kraftInnerMat = new THREE.MeshStandardMaterial({
      color: KRAFT_DARK, roughness: 0.9, metalness: 0.0,
    });
    const paperMat = new THREE.MeshStandardMaterial({
      color: PAPER_COLOR, roughness: 0.95, metalness: 0.0,
    });
    const productMat = new THREE.MeshStandardMaterial({
      color: PRODUCT_COLOR, roughness: 0.7, metalness: 0.2,
    });

    // ── Groups ────────────────────────────────────────────────
    const group     = new THREE.Group();
    scene.add(group);

    const solidGroup = new THREE.Group();
    group.add(solidGroup);

    const wireGroup  = new THREE.Group();
    wireGroup.visible = false;
    group.add(wireGroup);

    // Track solid meshes (excluding product) for particle source + hide
    const solidMeshes = [];

    // ── Helper: double-sided box mesh ─────────────────────────
    function addBox(geo, mat, px, py, pz, rx, ry, rz) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(px, py, pz);
      if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
      solidGroup.add(m);
      solidMeshes.push(m);
      return m;
    }

    // ── BOX BODY ──────────────────────────────────────────────
    // Bottom
    addBox(new THREE.BoxGeometry(200, 10, 200), kraftMat, 0, -85, 0);
    // Front wall  (z+)
    addBox(new THREE.BoxGeometry(200, 180, 8),  kraftMat, 0, 0,  100);
    // Back wall   (z-)
    addBox(new THREE.BoxGeometry(200, 180, 8),  kraftMat, 0, 0, -100);
    // Left wall   (x-)
    addBox(new THREE.BoxGeometry(8,  180, 200), kraftMat, -100, 0, 0);
    // Right wall  (x+)
    addBox(new THREE.BoxGeometry(8,  180, 200), kraftMat,  100, 0, 0);

    // ── FLAPS ─────────────────────────────────────────────────
    function addFlap(isLong, pivotX, pivotZ, hingeAxis, angle) {
      const flapW = isLong ? 200 : 100;
      const flapD = 100;
      const pivot = new THREE.Object3D();
      pivot.position.set(pivotX, 90, pivotZ);
      solidGroup.add(pivot);

      const geo = new THREE.BoxGeometry(flapW, 8, flapD);
      const m   = new THREE.Mesh(geo, kraftMat);
      m.position.set(0, 0, flapD / 2);
      pivot.add(m);
      solidMeshes.push(m);

      if (hingeAxis === 'x')      pivot.rotation.x = angle;
      else if (hingeAxis === 'z') pivot.rotation.z = angle;
      else if (hingeAxis === 'y') pivot.rotation.y = angle;

      return pivot;
    }

    addFlap(true, 0, 100, 'x', Math.PI * 50 / 180);

    const fp2 = new THREE.Object3D();
    fp2.position.set(0, 90, -100);
    fp2.rotation.x = -Math.PI * 50 / 180;
    solidGroup.add(fp2);
    {
      const geo = new THREE.BoxGeometry(200, 8, 100);
      const m   = new THREE.Mesh(geo, kraftMat);
      m.position.set(0, 0, -50);
      fp2.add(m);
      solidMeshes.push(m);
    }

    const fp3 = new THREE.Object3D();
    fp3.position.set(-100, 90, 0);
    fp3.rotation.z = Math.PI * 40 / 180;
    solidGroup.add(fp3);
    {
      const geo = new THREE.BoxGeometry(100, 8, 200);
      const m   = new THREE.Mesh(geo, kraftMat);
      m.position.set(-50, 0, 0);
      fp3.add(m);
      solidMeshes.push(m);
    }

    const fp4 = new THREE.Object3D();
    fp4.position.set(100, 90, 0);
    fp4.rotation.z = -Math.PI * 40 / 180;
    solidGroup.add(fp4);
    {
      const geo = new THREE.BoxGeometry(100, 8, 200);
      const m   = new THREE.Mesh(geo, kraftMat);
      m.position.set(50, 0, 0);
      fp4.add(m);
      solidMeshes.push(m);
    }

    // ── KRAFT PAPER (crumpled clumps) ─────────────────────────
    const paperClumps = [
      { x: -55, z: -55, sx: 1.6, sy: 0.6, sz: 1.6 },
      { x:  55, z: -55, sx: 1.4, sy: 0.8, sz: 1.4 },
      { x: -55, z:  55, sx: 1.5, sy: 0.7, sz: 1.5 },
      { x:  55, z:  55, sx: 1.6, sy: 0.6, sz: 1.6 },
      { x:   0, z: -70, sx: 1.3, sy: 0.9, sz: 1.2 },
      { x:   0, z:  70, sx: 1.4, sy: 0.7, sz: 1.3 },
      { x: -70, z:   0, sx: 1.2, sy: 0.8, sz: 1.5 },
      { x:  70, z:   0, sx: 1.3, sy: 0.9, sz: 1.4 },
    ];

    paperClumps.forEach(({ x, z, sx, sy, sz }) => {
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
      m.position.set(x, -30 + Math.random() * 20, z);
      solidGroup.add(m);
      solidMeshes.push(m);
    });

    // ── PRODUCT (cylinder, stays solid always) ────────────────
    const product = new THREE.Mesh(
      new THREE.CylinderGeometry(35, 35, 80, 32),
      productMat
    );
    product.position.set(0, 15, 0);
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
    addEdgeWire(new THREE.BoxGeometry(200, 180, 8),  BLUE, 0.9, null, 0,  0,  100);
    addEdgeWire(new THREE.BoxGeometry(200, 180, 8),  BLUE, 0.9, null, 0,  0, -100);
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

    addFlapWire(new THREE.BoxGeometry(200, 8, 100), 0, 90,  100,  Math.PI*50/180, null, 0, 50);
    addFlapWire(new THREE.BoxGeometry(200, 8, 100), 0, 90, -100, -Math.PI*50/180, null, 0, -50);
    addFlapWire(new THREE.BoxGeometry(100, 8, 200), -100, 90, 0, null,  Math.PI*40/180, -50, 0);
    addFlapWire(new THREE.BoxGeometry(100, 8, 200),  100, 90, 0, null, -Math.PI*40/180,  50, 0);

    paperClumps.forEach(({ x, z, sx, sy, sz }) => {
      const eGeo = new THREE.EdgesGeometry(new THREE.SphereGeometry(28, 6, 5));
      const mat  = new THREE.LineBasicMaterial({ color: 0x6ab8ff, transparent: true, opacity: 0 });
      const ls   = new THREE.LineSegments(eGeo, mat);
      ls.scale.set(sx, sy, sz);
      ls.position.set(x, -30, z);
      wireGroup.add(ls);
      wireEntries.push({ ls, targetOpacity: 0.5 });

      const gMat = new THREE.LineBasicMaterial({ color: 0x6ab8ff, transparent: true, opacity: 0 });
      const gls  = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.SphereGeometry(28, 6, 5)), gMat);
      gls.scale.set(sx * 1.05, sy * 1.05, sz * 1.05);
      gls.position.set(x, -30, z);
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
