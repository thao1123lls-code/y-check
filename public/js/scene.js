(function () {
  'use strict';
  var host = document.getElementById('scene');
  if (!host) return;
  if (!window.THREE) { host.style.display = 'none'; return; }

  var T = THREE;
  var calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var isMobile = matchMedia('(max-width:900px)').matches;

  try {
    var W = host.clientWidth || 520, H = host.clientHeight || 520;
    var r = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 2));
    r.setSize(W, H);
    r.outputEncoding = T.sRGBEncoding;
    r.toneMapping = T.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.18;
    host.appendChild(r.domElement);

    var sc = new T.Scene();
    var cam = new T.PerspectiveCamera(30, W / H, 0.1, 100);
    cam.position.set(0, 0.2, 16.5);

    /* ===== Procedural Studio Environment Map (phản xạ kim loại & thủy tinh thật) ===== */
    try {
      var pmrem = new T.PMREMGenerator(r);
      pmrem.compileEquirectangularShader();
      var envScene = new T.Scene();
      envScene.background = new T.Color(0x0b1715);

      function softbox(color, w, h, pos, rot) {
        var m = new T.Mesh(
          new T.PlaneGeometry(w, h),
          new T.MeshBasicMaterial({ color: color, side: T.DoubleSide })
        );
        m.position.set(pos[0], pos[1], pos[2]);
        if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
        envScene.add(m);
      }
      softbox(0xffffff, 18, 10, [10, 10, 10], [-0.5, 0.7, 0]);
      softbox(0xd9f5ec, 16, 12, [-12, 4, 6], [0, -1.0, 0]);
      softbox(0xffe7c2, 12, 6, [0, -10, 8], [1.1, 0, 0]);
      softbox(0x52c4a0, 14, 14, [0, 6, -14], [0, 0, 0]);

      var envRT = pmrem.fromScene(envScene, 0.04);
      sc.environment = envRT.texture;
      pmrem.dispose();
    } catch (e) {}

    /* ===== Hệ thống chiếu sáng Studio 3 điểm ===== */
    sc.add(new T.HemisphereLight(0xe6f4ef, 0x071311, 0.65));
    var keyLight = new T.DirectionalLight(0xfffaf2, 1.35);
    keyLight.position.set(6, 9, 10);
    sc.add(keyLight);

    var rimLight = new T.DirectionalLight(0x72e6c3, 0.85);
    rimLight.position.set(-8, 4, -6);
    sc.add(rimLight);

    var fillLight = new T.PointLight(0xffd28a, 0.45, 30);
    fillLight.position.set(5, -6, 6);
    sc.add(fillLight);

    /* ===== Procedural Textures: Vân thấu kính Fresnel & Nhôm phay xước ===== */
    function makeFresnelBump() {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var x = c.getContext('2d');
      x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256);
      for (var rad = 122; rad > 6; rad -= 9) {
        x.beginPath(); x.arc(128, 128, rad, 0, Math.PI * 2);
        x.strokeStyle = rad % 18 === 0 ? '#dcdcdc' : '#404040';
        x.lineWidth = 3.2; x.stroke();
      }
      var tex = new T.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    function makeGlowTex() {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var x = c.getContext('2d');
      var g = x.createRadialGradient(128, 128, 4, 128, 128, 128);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.22, 'rgba(255,255,255,0.55)');
      g.addColorStop(0.55, 'rgba(255,255,255,0.12)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      return new T.CanvasTexture(c);
    }

    function makeBrushedMetal() {
      var c = document.createElement('canvas'); c.width = 256; c.height = 256;
      var x = c.getContext('2d');
      x.fillStyle = '#888'; x.fillRect(0, 0, 256, 256);
      for (var i = 0; i < 420; i++) {
        var y = Math.random() * 256;
        var v = 110 + Math.floor(Math.random() * 48);
        x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
        x.fillRect(0, y, 256, 1);
      }
      var tex = new T.CanvasTexture(c);
      tex.wrapS = tex.wrapT = T.RepeatWrapping;
      return tex;
    }

    var fresnelTex = makeFresnelBump();
    var glowTex = makeGlowTex();
    var brushedTex = makeBrushedMetal();

    /* ===== Nhóm chính ===== */
    var rig = new T.Group();
    sc.add(rig);

    /* ===== Vật liệu công nghiệp cao cấp (Dieter Rams / Optical Lab) ===== */
    var bodyMat = new T.MeshPhysicalMaterial({
      color: 0x17201e,
      roughness: 0.34,
      metalness: 0.68,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
      bumpMap: brushedTex,
      bumpScale: 0.008
    });
    var trimMat = new T.MeshStandardMaterial({
      color: 0xc9d2ce,
      roughness: 0.22,
      metalness: 0.92,
      bumpMap: brushedTex,
      bumpScale: 0.004
    });
    var darkBezelMat = new T.MeshStandardMaterial({
      color: 0x0e1413,
      roughness: 0.45,
      metalness: 0.55
    });
    var brassMat = new T.MeshStandardMaterial({
      color: 0xd4b074,
      roughness: 0.28,
      metalness: 0.88
    });

    /* ===== 1. Vỏ hộp tín hiệu CNC bo góc + viền titan ===== */
    function roundedRectShape(w, h, rad) {
      var s = new T.Shape();
      s.moveTo(-w + rad, -h);
      s.lineTo(w - rad, -h); s.quadraticCurveTo(w, -h, w, -h + rad);
      s.lineTo(w, h - rad); s.quadraticCurveTo(w, h, w - rad, h);
      s.lineTo(-w + rad, h); s.quadraticCurveTo(-w, h, -w, h - rad);
      s.lineTo(-w, -h + rad); s.quadraticCurveTo(-w, -h, -w + rad, -h);
      return s;
    }

    var housingGeo = new T.ExtrudeGeometry(roundedRectShape(1.42, 3.72, 0.58), {
      depth: 1.32,
      bevelEnabled: true,
      bevelSize: 0.14,
      bevelThickness: 0.16,
      bevelSegments: 6,
      curveSegments: 24
    });
    housingGeo.center();
    rig.add(new T.Mesh(housingGeo, bodyMat));

    // Khung viền kim loại mảnh phía trước
    var frameOuter = roundedRectShape(1.48, 3.78, 0.62);
    var frameHole = roundedRectShape(1.36, 3.66, 0.54);
    frameOuter.holes.push(frameHole);
    var frameGeo = new T.ExtrudeGeometry(frameOuter, { depth: 0.06, bevelEnabled: false, curveSegments: 24 });
    frameGeo.center();
    var frameMesh = new T.Mesh(frameGeo, trimMat);
    frameMesh.position.z = 0.78;
    rig.add(frameMesh);

    // 4 ốc vít CNC nhỏ ở 4 góc mặt trước
    [[-1.08, 3.35], [1.08, 3.35], [-1.08, -3.35], [1.08, -3.35]].forEach(function (p) {
      var bolt = new T.Mesh(new T.CylinderGeometry(0.055, 0.055, 0.08, 16), trimMat);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(p[0], p[1], 0.8);
      rig.add(bolt);
    });

    // Chân trụ thanh mảnh + cổ nối đồng thau
    var neck = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.28, 32), brassMat);
    neck.position.set(0, -3.96, 0);
    rig.add(neck);

    var pole = new T.Mesh(new T.CylinderGeometry(0.28, 0.34, 6.2, 28), bodyMat);
    pole.position.set(0, -7.1, 0);
    rig.add(pole);

    /* ===== 2. Ba cụm đèn tín hiệu có mái che (Visor) + Thấu kính Fresnel ===== */
    var lampColors = [0xff3b30, 0xffaa1d, 0x22c96d];
    var ys = [2.32, 0, -2.32];
    var lampMats = [];
    var glowMats = [];
    var pointLights = [];

    lampColors.forEach(function (hex, idx) {
      var y = ys[idx];

      // Hốc đen sâu
      var recess = new T.Mesh(new T.CylinderGeometry(0.92, 0.92, 0.24, 40), darkBezelMat);
      recess.rotation.x = Math.PI / 2;
      recess.position.set(0, y, 0.72);
      rig.add(recess);

      // Vòng bezel kim loại phay
      var bezel = new T.Mesh(new T.TorusGeometry(0.95, 0.075, 20, 64), trimMat);
      bezel.position.set(0, y, 0.85);
      rig.add(bezel);

      // Mái che cong phía trên (Visor công nghiệp)
      var visorGeo = new T.CylinderGeometry(1.01, 1.01, 0.72, 32, 1, true, -Math.PI * 0.42, Math.PI * 0.84);
      var visorMat = new T.MeshStandardMaterial({
        color: 0x161f1d, roughness: 0.38, metalness: 0.65, side: T.DoubleSide
      });
      var visor = new T.Mesh(visorGeo, visorMat);
      visor.rotation.x = Math.PI / 2;
      visor.rotation.y = Math.PI;
      visor.position.set(0, y + 0.02, 1.12);
      rig.add(visor);

      // Thấu kính lồi Fresnel phát sáng
      var lMat = new T.MeshPhysicalMaterial({
        color: hex,
        emissive: hex,
        emissiveIntensity: 0.14,
        roughness: 0.16,
        metalness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        bumpMap: fresnelTex,
        bumpScale: 0.045
      });
      var lens = new T.Mesh(new T.SphereGeometry(0.86, 48, 32), lMat);
      lens.scale.z = 0.42;
      lens.position.set(0, y, 0.82);
      rig.add(lens);
      lampMats.push(lMat);

      // Quầng sáng Volumetric Glow mềm mại
      var sp = new T.Sprite(new T.SpriteMaterial({
        map: glowTex,
        color: hex,
        transparent: true,
        opacity: 0,
        blending: T.AdditiveBlending,
        depthWrite: false
      }));
      sp.scale.set(5.4, 5.4, 1);
      sp.position.set(0, y, 1.48);
      rig.add(sp);
      glowMats.push(sp.material);

      // Nguồn sáng điểm nhẹ hắt lên mái che và kính lúp
      var pl = new T.PointLight(hex, 0, 5.5);
      pl.position.set(0, y, 1.85);
      rig.add(pl);
      pointLights.push(pl);
    });

    /* ===== 3. Kính lúp quang học (Optical Loupe) cao cấp ===== */
    var loupe = new T.Group();
    rig.add(loupe);

    // Gọng ngoài titan + vòng nhấn đồng thau bên trong
    loupe.add(new T.Mesh(new T.TorusGeometry(1.38, 0.11, 24, 90), trimMat));
    loupe.add(new T.Mesh(new T.TorusGeometry(1.26, 0.032, 16, 72), brassMat));

    // Thấu kính thủy tinh lồi 2 mặt có độ bóng quang học
    var glassMat = new T.MeshPhysicalMaterial({
      color: 0xdffef7,
      transparent: true,
      opacity: 0.22,
      roughness: 0.04,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      side: T.DoubleSide,
      depthWrite: false
    });
    var glassLens = new T.Mesh(new T.SphereGeometry(1.25, 48, 32), glassMat);
    glassLens.scale.z = 0.14;
    loupe.add(glassLens);

    // Khớp cổ + tay cầm nhám phối kim loại
    var collar = new T.Mesh(new T.CylinderGeometry(0.16, 0.18, 0.42, 24), brassMat);
    collar.rotation.z = -3 * Math.PI / 4;
    collar.position.set(1.26, -1.26, 0);
    loupe.add(collar);

    var handle = new T.Mesh(new T.CylinderGeometry(0.16, 0.21, 2.35, 28), bodyMat);
    handle.rotation.z = -3 * Math.PI / 4;
    handle.position.set(2.15, -2.15, 0);
    loupe.add(handle);

    var endCap = new T.Mesh(new T.SphereGeometry(0.21, 24, 16), trimMat);
    endCap.position.set(2.98, -2.98, 0);
    loupe.add(endCap);

    loupe.position.z = 2.45;

    /* ===== 4. Vòng hiệu chuẩn quang học (Calibration Rings) phía sau ===== */
    var orbitGroup = new T.Group();
    orbitGroup.position.z = -1.6;
    sc.add(orbitGroup);

    var ring1 = new T.Mesh(
      new T.TorusGeometry(4.6, 0.014, 12, 120),
      new T.MeshBasicMaterial({ color: 0x62bfa2, transparent: true, opacity: 0.24 })
    );
    ring1.rotation.x = 0.35;
    orbitGroup.add(ring1);

    var ring2 = new T.Mesh(
      new T.TorusGeometry(5.6, 0.01, 12, 140),
      new T.MeshBasicMaterial({ color: 0xe6c78a, transparent: true, opacity: 0.15 })
    );
    ring2.rotation.y = 0.55;
    ring2.rotation.x = -0.25;
    orbitGroup.add(ring2);

    // Hạt bụi sáng chiều sâu tinh tế
    var pCount = isMobile ? 55 : 110;
    var pPos = [];
    for (var i = 0; i < pCount; i++) {
      pPos.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10 - 2.5);
    }
    var pGeo = new T.BufferGeometry();
    pGeo.setAttribute('position', new T.Float32BufferAttribute(pPos, 3));
    var pts = new T.Points(pGeo, new T.PointsMaterial({
      color: 0xbfe9da, size: 0.055, transparent: true, opacity: 0.42
    }));
    sc.add(pts);

    /* ===== 5. Trạng thái & Tương tác (Kéo xoay 3D + Đồng bộ Soi tin) ===== */
    // mode: 'auto' | 'r' (0) | 'a' (1) | 'g' (2)
    var activeMode = 'auto';
    var mx = 0, my = 0;
    var dragging = false, lastX = 0, lastY = 0;
    var dragYaw = 0, dragPitch = 0;
    var t = 0, visible = true;

    var cur = {
      ei: [0.14, 0.14, 0.14],
      gl: [0, 0, 0],
      pl: [0, 0, 0],
      lx: 0, ly: 0,
      ry: -0.34, rx: 0.04
    };

    function updateSceneButtons(mode) {
      document.querySelectorAll('[data-scene-mode]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-scene-mode') === mode));
      });
    }

    window.ycheckSetSignal = function (mode) {
      if (mode !== 'r' && mode !== 'a' && mode !== 'g' && mode !== 'auto') mode = 'auto';
      activeMode = mode;
      updateSceneButtons(mode);
      if (calm) draw(1);
    };

    document.querySelectorAll('[data-scene-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        window.ycheckSetSignal(b.getAttribute('data-scene-mode'));
      });
    });

    // Kéo xoay trực tiếp trên khung 3D
    host.style.cursor = 'grab';
    host.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.scene-hud')) return;
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      host.style.cursor = 'grabbing';
    });
    addEventListener('pointerup', function () {
      dragging = false;
      host.style.cursor = 'grab';
    });
    addEventListener('pointermove', function (e) {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
      if (dragging) {
        dragYaw += (e.clientX - lastX) * 0.008;
        dragPitch = Math.max(-0.45, Math.min(0.45, dragPitch + (e.clientY - lastY) * 0.006));
        lastX = e.clientX; lastY = e.clientY;
        if (calm) draw(1);
      }
    });

    function draw(k) {
      var tgtE = [0.1, 0.1, 0.1], tgtG = [0, 0, 0], tgtP = [0, 0, 0];
      var tx = 0, ty = 0, targetYaw = -0.32;

      if (activeMode === 'auto') {
        var phase = (t * 0.42) % 3;
        var activeIdx = Math.floor(phase);
        for (var i = 0; i < 3; i++) {
          var isAct = i === activeIdx;
          tgtE[i] = isAct ? 2.35 : 0.08;
          tgtG[i] = isAct ? 0.82 : 0;
          tgtP[i] = isAct ? 1.5 : 0;
        }
        tx = Math.sin(t * 0.55) * 0.42;
        ty = ys[activeIdx];
        targetYaw = -0.32 + Math.sin(t * 0.32) * 0.16;
      } else {
        var idx = activeMode === 'r' ? 0 : activeMode === 'a' ? 1 : 2;
        for (var j = 0; j < 3; j++) {
          tgtE[j] = j === idx ? 2.6 : 0.07;
          tgtG[j] = j === idx ? 0.92 : 0;
          tgtP[j] = j === idx ? 1.85 : 0;
        }
        tx = 0;
        ty = ys[idx];
        targetYaw = idx === 0 ? -0.22 : idx === 1 ? -0.08 : 0.14;
      }

      for (var n = 0; n < 3; n++) {
        cur.ei[n] += (tgtE[n] - cur.ei[n]) * k;
        cur.gl[n] += (tgtG[n] - cur.gl[n]) * k;
        cur.pl[n] += (tgtP[n] - cur.pl[n]) * k;
        lampMats[n].emissiveIntensity = cur.ei[n];
        glowMats[n].opacity = cur.gl[n];
        pointLights[n].intensity = cur.pl[n];
      }

      cur.lx += (tx - cur.lx) * k;
      cur.ly += (ty - cur.ly) * k;
      loupe.position.x = cur.lx;
      loupe.position.y = cur.ly;
      loupe.rotation.z = Math.sin(t * 0.65) * 0.045;
      loupe.rotation.y = Math.sin(t * 0.5) * 0.08;

      if (!dragging) {
        dragYaw *= 0.96;
        dragPitch *= 0.96;
      }

      cur.ry += (targetYaw + dragYaw + mx * 0.28 - cur.ry) * k;
      cur.rx += (dragPitch + my * 0.14 - cur.rx) * k;
      rig.rotation.y = cur.ry;
      rig.rotation.x = cur.rx;
      rig.position.y = Math.sin(t * 0.9) * 0.09;

      ring1.rotation.z = t * 0.09;
      ring2.rotation.z = -t * 0.06;
      pts.rotation.y = t * 0.025;

      r.render(sc, cam);
    }

    function resize() {
      var w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      r.setSize(w, h);
      cam.aspect = w / h;
      cam.position.z = w / h < 0.85 ? 20.5 : 16.5;
      cam.updateProjectionMatrix();
      if (calm) draw(1);
    }

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    else addEventListener('resize', resize);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(host);
    }

    resize();
    if (calm) {
      draw(1);
    } else {
      (function loop() {
        requestAnimationFrame(loop);
        if (!visible) return;
        t += 0.016;
        draw(0.075);
      })();
    }
  } catch (e) {
    host.style.display = 'none';
  }
})();
