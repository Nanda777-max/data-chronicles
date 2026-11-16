/* =====================================================================
   VERSION 2: THE LIVING ROOM
   A soft white room (walls, floor, sofa and lamp are all near-white with
   gentle shadows), so the coloured things stand out: the brown cardboard
   box, the terracotta plant pots, the books and the ocean beyond the balcony.

   createRoom() builds everything and returns:
     crate        sizes and resting place of the cardboard box (main.js stands the books in it)
     clickables   things the pointer can click (the sun and the floor lamp)
     click(ray)   handles such a click and returns what the character should say
     brush(x, y)  tells the plants where the pointer is so they can rustle
     update(...)  runs every frame: the delivery, waves, curtains, plants, light
   ===================================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export function createRoom({ scene, hemi, sun, FONT }) {
  const WHITE = '#f1efea', SHADE = '#e3e0d9', INK = '#1e1b18', POT = '#b5562f', LEAF = '#2f8f6b', LEAF2 = '#1f6f55';
  /* soft, matt materials give the smooth "neumorphic" look; toon materials keep the coloured props comic-like */
  const soft = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness:.95, metalness:0, ...extra });
  const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, ...extra });
  const sh = m => { m.castShadow = m.receiveShadow = true; return m; };
  const add = (m, parent = scene) => { parent.add(m); return m; };
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); return m; };
  const rbox = (w, h, d, mat, x = 0, y = 0, z = 0, r = .12) => { const m = sh(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat)); m.position.set(x, y, z); return m; };
  function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

  scene.background = new THREE.Color(WHITE);
  const WALL_Z = -4, DOOR = { x0:4.4, x1:10.2, top:7.4 }, MID = (4.4 + 10.2) / 2;

  /* ---------- walls and floor ---------- */
  const wallMat = soft(WHITE);
  function wallPiece(x0, x1, y0, y1) { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), wallMat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, WALL_Z); m.receiveShadow = true; scene.add(m); }
  wallPiece(-26, DOOR.x0, 0, 16); wallPiece(DOOR.x1, 28, 0, 16); wallPiece(DOOR.x0, DOOR.x1, DOOR.top, 16);
  /* rounded door surround and skirting board, standing slightly proud of the wall */
  add(rbox(.5, DOOR.top + .3, .5, soft(WHITE), DOOR.x0 - .2, DOOR.top / 2, WALL_Z + .05, .2)); add(rbox(.5, DOOR.top + .3, .5, soft(WHITE), DOOR.x1 + .2, DOOR.top / 2, WALL_Z + .05, .2));
  add(rbox(DOOR.x1 - DOOR.x0 + .9, .5, .5, soft(WHITE), MID, DOOR.top + .1, WALL_Z + .05, .2));
  add(rbox(30.4, .4, .2, soft(WHITE), -11, .2, WALL_Z + .08, .08));
  /* soft raised shapes on the wall */
  [[-7.6, 7.6, 1.5], [-4.9, 6.2, .95], [-2.6, 8.1, .6]].forEach(([x, y, r]) => { const d = sh(new THREE.Mesh(new THREE.CylinderGeometry(r, r, .16, 48), soft(WHITE))); d.rotation.x = Math.PI / 2; d.position.set(x, y, WALL_Z + .08); scene.add(d); });
  const floorTex = tex(512, 512, (g, w, h) => { g.fillStyle = '#e9e6df'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(120,112,100,.16)'; g.fillRect(0, i * 64, w, 2); g.fillRect((i * 173) % w, i * 64, 2, 64); } });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(9, 5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(56, 26), soft('#ffffff', { map:floorTex })); floor.rotation.x = -Math.PI / 2; floor.position.set(1, 0, WALL_Z + 13); floor.receiveShadow = true; scene.add(floor);
  const rug = sh(new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, .07, 56), soft('#f7f5f0'))); rug.position.set(3.4, .035, 1.5); rug.scale.z = .58; scene.add(rug);
  const rugRing = sh(new THREE.Mesh(new THREE.TorusGeometry(3.5, .06, 8, 64), soft(SHADE))); rugRing.rotation.x = Math.PI / 2; rugRing.position.set(3.4, .08, 1.5); rugRing.scale.y = .58; scene.add(rugRing);

  /* ---------- sofa, shelf and lamp (all white, so they read as part of the room) ---------- */
  const sofa = add(new THREE.Group()); sofa.position.set(-4.6, 0, -2.3);
  sofa.add(rbox(5.4, .95, 2.3, soft(WHITE), 0, .8, 0, .3), rbox(5.4, 1.7, .7, soft(SHADE), 0, 1.75, -.85, .32), rbox(.8, 1.4, 2.3, soft(SHADE), -2.6, 1.15, 0, .32), rbox(.8, 1.4, 2.3, soft(SHADE), 2.6, 1.15, 0, .32));
  const cushion = rbox(1.15, 1.15, .45, toon('#e0a526'), -1.4, 1.85, -.3, .2); cushion.rotation.set(-.25, 0, .2); sofa.add(cushion);
  const cushion2 = rbox(1.0, 1.0, .4, toon('#8a1c2e'), 1.3, 1.8, -.3, .18); cushion2.rotation.set(-.2, 0, -.15); sofa.add(cushion2);
  add(rbox(3.2, .22, .9, soft(WHITE), -6.0, 4.4, WALL_Z + .5, .1));                                 // floating wall shelf
  const lamp = add(new THREE.Group()); lamp.position.set(-.9, 0, -3);
  const lampShade = sh(new THREE.Mesh(new THREE.CylinderGeometry(.5, .95, 1.2, 28, 1, true), new THREE.MeshStandardMaterial({ color:WHITE, roughness:.9, side:THREE.DoubleSide, emissive:'#ffb060', emissiveIntensity:0 })));
  const lampParts = [sh(new THREE.Mesh(new THREE.CylinderGeometry(.55, .6, .14, 28), soft(SHADE))), sh(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 5.2, 10), soft(SHADE))), lampShade];
  lampParts[0].position.y = .07; lampParts[1].position.y = 2.6; lampShade.position.y = 5.4; lamp.add(...lampParts);
  const lampGlow = new THREE.PointLight(0xffb060, 0, 16, 2); lampGlow.position.set(0, 5.1, .4); lamp.add(lampGlow);
  let lampOn = false, sunset = false;

  /* ---------- balcony and ocean ---------- */
  function skyTex(evening) { return tex(512, 512, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * .55);
    (evening ? [[0, '#5a1430'], [.45, '#d2452e'], [.8, '#ff8a3a'], [1, '#ffd98a']] : [[0, '#3fa9e0'], [.6, '#8fd3f2'], [1, '#e6f6fb']]).forEach(([s, c]) => sky.addColorStop(s, c)); g.fillStyle = sky; g.fillRect(0, 0, w, h * .55);
    if (!evening) { g.fillStyle = 'rgba(255,255,255,.9)'; [[90, 80, 46], [140, 96, 36], [380, 130, 40], [430, 118, 30]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); }   // clouds
    const sea = g.createLinearGradient(0, h * .55, 0, h * .86);
    (evening ? [[0, '#f59a4a'], [.25, '#1f7f7a'], [1, '#14504d']] : [[0, '#3fd0d6'], [.4, '#16a6b8'], [1, '#0d7f9c']]).forEach(([s, c]) => sea.addColorStop(s, c)); g.fillStyle = sea; g.fillRect(0, h * .55, w, h * .31);
    g.fillStyle = evening ? '#e8c58a' : '#f6e2b3'; g.fillRect(0, h * .86, w, h * .14);                                   // sand
  }); }
  const skies = [skyTex(false), skyTex(true)];
  const backdrop = add(new THREE.Mesh(new THREE.PlaneGeometry(32, 17), new THREE.MeshBasicMaterial({ map:skies[0] }))); backdrop.position.set(MID, 4.6, -16);
  const sunDisc = add(new THREE.Mesh(new THREE.CircleGeometry(1.0, 40), new THREE.MeshBasicMaterial({ color:0xfff3b0 }))); sunDisc.position.set(MID + 1.3, 6.1, -15.9);
  const waves = [0, 1, 2, 3, 4].map(i => { const m = add(new THREE.Mesh(new THREE.PlaneGeometry(9 - i, .08), new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:.7 }))); m.position.set(MID, 3.7 - i * .42, -15.8); return m; });
  add(box(DOOR.x1 - DOOR.x0 + 1.6, .2, 3.0, soft('#f6f4ef'), MID, -.1, WALL_Z - 1.5));                                   // balcony floor
  add(rbox(DOOR.x1 - DOOR.x0 + 1.6, .16, .16, soft(WHITE), MID, 1.65, WALL_Z - 2.9, .06));
  for (let x = DOOR.x0 - .6; x <= DOOR.x1 + .7; x += .55) add(box(.07, 1.65, .07, soft(WHITE), x, .82, WALL_Z - 2.9));
  const palm = add(new THREE.Group()); palm.position.set(DOOR.x0 + 1.0, 0, -11);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.15, .24, 6.8, 8), toon('#7a5230')); trunk.position.y = 3.4; trunk.rotation.z = -.12; palm.add(trunk);
  const fronds = [...Array(7)].map((_, i) => { const p = new THREE.Group(); p.position.set(.42, 6.7, 0); p.rotation.y = i * .9;
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.45, 3.0, 4), toon(i % 2 ? LEAF : LEAF2)); leaf.scale.z = .15; leaf.position.set(1.3, -.25, 0); leaf.rotation.z = -1.95; p.add(leaf); palm.add(p); return p; });
  const curtains = [DOOR.x0 + .6, DOOR.x1 - .6].map(x => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 7.0, 6, 14), new THREE.MeshStandardMaterial({ color:'#ffffff', roughness:1, side:THREE.DoubleSide, transparent:true, opacity:.86 }));
    m.position.set(x, 3.7, WALL_Z + .5); m.castShadow = true; m.userData.base = m.geometry.attributes.position.array.slice(); m.userData.push = 0; scene.add(m); return m; });
  add(rbox(DOOR.x1 - DOOR.x0 + 1.2, .12, .12, soft(SHADE), MID, 7.25, WALL_Z + .5, .05));                                // curtain rail

  /* ---------- plants in terracotta pots ---------- */
  function makePlant(x, y, z, scale) {
    const g = add(new THREE.Group()); g.position.set(x, y, z); g.scale.setScalar(scale);
    const pot = sh(new THREE.Mesh(new THREE.CylinderGeometry(.64, .46, .98, 14), toon(POT))); pot.position.y = .49; g.add(pot);
    const rim = sh(new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, .16, 14), toon('#c8693c'))); rim.position.y = .96; g.add(rim);
    const leaves = [...Array(8)].map((_, i) => { const stem = new THREE.Group(); stem.position.y = .95; stem.rotation.y = i * .82; const len = 1.6 + (i % 3) * .5;
      const blade = sh(new THREE.Mesh(new THREE.SphereGeometry(.5, 8, 6), toon(i % 2 ? LEAF : LEAF2))); blade.scale.set(.5, len, .08); blade.position.y = len * .55;
      const tilt = new THREE.Group(); tilt.rotation.z = .35 + (i % 4) * .14; tilt.add(blade); stem.add(tilt); g.add(stem); return { tilt, base:tilt.rotation.z, phase:i * 1.3 }; });
    return { g, leaves, rustle:0 };
  }
  const plants = [makePlant(1.0, 0, -3.0, 1.2), makePlant(11.4, 0, -2.6, 1.0), makePlant(-6.0, 4.5, WALL_Z + .5, .42)];
  const hang = add(new THREE.Group()); hang.position.set(2.9, 10.2, WALL_Z + 1.2);
  hang.add(box(.03, 3.0, .03, soft(INK), 0, -1.5, 0)); const hpot = sh(new THREE.Mesh(new THREE.SphereGeometry(.48, 14, 8, 0, 7, 1.4, 1.8), toon(POT))); hpot.position.y = -3.1; hang.add(hpot);
  const vines = [...Array(5)].map((_, i) => { const v = new THREE.Group(); v.position.set(Math.cos(i * 1.26) * .34, -3.15, Math.sin(i * 1.26) * .34); hang.add(v);
    let parent = v; const links = []; for (let k = 0; k < 6 + i % 3; k++) { const l = new THREE.Group(); l.position.y = k ? -.3 : 0; parent.add(l); const bead = sh(new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 0), toon(k % 2 ? LEAF : LEAF2))); bead.position.y = -.15; l.add(bead); links.push(l); parent = l; }
    return { links, phase:i }; });

  /* ---------- the cardboard box on its trolley ---------- */
  const BW = 4.9, BH = 1.5, BD = 2.0, LIFT = .46, REST = new THREE.Vector3(3.4, 0, 1.4);
  const crate = add(new THREE.Group()); crate.position.copy(REST);
  const card = toon('#ffffff', { map:tex(256, 256, (g, w, h) => { g.fillStyle = '#b98a55'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { g.fillStyle = `rgba(60,35,10,${.05 + (x % 12) * .008})`; g.fillRect(x, 0, 2, h); } }) });
  const cardIn = toon('#8a6238');
  crate.add(box(BW + .5, .12, BD + .4, toon('#3b2110'), 0, LIFT - .1, 0));
  const wheels = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => { const w = sh(new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .14, 14), toon(INK))); w.rotation.x = Math.PI / 2; w.position.set(sx * (BW / 2 - .1), .2, sz * (BD / 2 + .02)); crate.add(w); return w; });
  crate.add(box(BW, .06, BD, cardIn, 0, LIFT, 0), box(BW, BH, .06, card, 0, LIFT + BH / 2, -BD / 2), box(BW, BH, .06, card, 0, LIFT + BH / 2, BD / 2), box(.06, BH, BD, card, -BW / 2, LIFT + BH / 2, 0), box(.06, BH, BD, card, BW / 2, LIFT + BH / 2, 0));
  crate.add(box(BW - .1, 1.0, BD - .1, cardIn, 0, LIFT + .52, 0));                                                       // packing layer the books stand on
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .8), new THREE.MeshBasicMaterial({ map:tex(380, 160, (g, w, h) => { g.fillStyle = '#f3e6c4'; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#6e1423'; g.font = `64px ${FONT}`; g.textAlign = 'center'; g.fillText('NKS COMICS', w / 2, 72); g.fillStyle = INK; g.font = `38px ${FONT}`; g.fillText('FRAGILE · THIS WAY UP', w / 2, 126); }) }));
  label.position.set(-1.1, LIFT + .7, BD / 2 + .04); crate.add(label);
  const flaps = [[0, -BD / 2, BW, BD / 2, 'x', -1], [0, BD / 2, BW, BD / 2, 'x', 1], [-BW / 2, 0, BD, BW / 5, 'z', 1], [BW / 2, 0, BD, BW / 5, 'z', -1]].map(([x, z, len, depth, axis, s]) => {
    const hinge = new THREE.Group(); hinge.position.set(x, LIFT + BH, z); crate.add(hinge);
    hinge.add(axis === 'x' ? box(len, .05, depth, card, 0, 0, -s * depth / 2) : box(depth, .05, len, card, s * depth / 2, 0, 0));
    return { hinge, axis, s, open:0 };
  });

  const SUNLIGHT = new THREE.Color(0xfff4e0), EVENING = new THREE.Color(0xffa860), SKY = new THREE.Color(0xffffff), SKY_EVE = new THREE.Color(0xffd9b0);
  let pointerX = 99, pointerY = 0, lastX = REST.x;

  return {
    crate:{ BW, BH, BD, LIFT, REST },
    clickables:[sunDisc, ...lampParts],
    /* a click on the sun or the lamp; returns the line for the character to say, or '' */
    click(ray) {
      if (ray.intersectObject(sunDisc).length) { sunset = !sunset; backdrop.material.map = skies[+sunset]; sunDisc.material.color.set(sunset ? 0xffd27a : 0xfff3b0); sunDisc.position.y = sunset ? 4.9 : 6.1; return sunset ? 'Golden hour. My favourite.' : 'Back to a beach day.'; }
      if (ray.intersectObjects(lampParts).length) { lampOn = !lampOn; return lampOn ? 'Ooh, mood lighting.' : 'Saving power. Smart.'; }
      return '';
    },
    /* on upright screens the hanging plant would hang over the lettering, so it is put away */
    setCompact(flag) { hang.visible = !flag; },
    brush(x, y) { pointerX = x; pointerY = y; plants.forEach(p => { if (Math.abs(x - p.g.position.x) < 1.4 && y < .25) p.rustle = 1; }); },
    /* intro runs from 0 upward: 0 to .5 the trolley rolls in, then the flaps open (main.js raises the books) */
    update(dt, t, intro, still) {
      const roll = Math.min(1, intro / .5), e = 1 - Math.pow(1 - roll, 3);
      crate.position.x = -19 + (REST.x + 19) * e + (roll > .8 ? Math.sin(roll * Math.PI) * .5 : 0);                       // rolls in and overshoots a little
      wheels.forEach(w => { w.rotation.z -= (crate.position.x - lastX) / .2; }); lastX = crate.position.x;
      const settle = Math.min(1, intro / .62); crate.rotation.z = Math.sin(settle * Math.PI * 3) * .03 * (1 - settle);    // wobble as it stops
      flaps.forEach((f, i) => { f.open = damp(f.open, intro > .52 + i * .03 ? 1 : 0, 9, dt); const a = f.open * 2.25 * f.s; if (f.axis === 'x') f.hinge.rotation.x = a; else f.hinge.rotation.z = a; });

      const k = still ? 0 : 1;                                                                                             // "still" = visitor asked for less motion
      waves.forEach((w, i) => { w.position.x = MID + Math.sin(t * .5 + i * 1.7) * 1.4 * k; w.material.opacity = .45 + .25 * Math.sin(t + i) * k; });
      fronds.forEach((f, i) => { f.rotation.z = Math.sin(t * 1.1 + i) * .07 * k; }); palm.rotation.z = Math.sin(t * .6) * .015 * k;
      curtains.forEach(c => { c.userData.push = damp(c.userData.push, Math.abs(pointerX - c.position.x) < 1.2 && pointerY > -.5 ? 1 : 0, 4, dt);
        const pos = c.geometry.attributes.position, base = c.userData.base;
        for (let i = 0; i < pos.count; i++) { const y = base[i * 3 + 1], down = (3.5 - y) / 7; pos.setX(i, base[i * 3] + Math.sin(t * 1.5 + y * 1.2) * .1 * down * k); pos.setZ(i, Math.sin(t * 1.9 + y * 1.6 + base[i * 3] * 2) * (.14 + c.userData.push * .45) * down * k); }
        pos.needsUpdate = true; c.geometry.computeVertexNormals(); });
      plants.forEach(p => { p.rustle = Math.max(0, p.rustle - dt * .9); p.leaves.forEach(l => { l.tilt.rotation.z = l.base + (Math.sin(t * 1.3 + l.phase) * .05 + Math.sin(t * 16 + l.phase) * .09 * p.rustle) * k; }); });
      vines.forEach(v => v.links.forEach((l, n) => { l.rotation.z = Math.sin(t * 1.4 + v.phase + n * .5) * .06 * k; l.rotation.x = Math.cos(t * 1.1 + v.phase + n * .4) * .05 * k; }));

      /* light: bright and neutral by day, warm and lower at sunset */
      sun.color.lerp(sunset ? EVENING : SUNLIGHT, .06); hemi.color.lerp(sunset ? SKY_EVE : SKY, .06);
      sun.intensity = damp(sun.intensity, sunset ? 1.5 : 1.9, 3, dt); hemi.intensity = damp(hemi.intensity, sunset ? .95 : 1.25, 3, dt);
      lampGlow.intensity = damp(lampGlow.intensity, lampOn ? 70 : 0, 8, dt); lampShade.material.emissiveIntensity = damp(lampShade.material.emissiveIntensity, lampOn ? 1.2 : 0, 8, dt);
    },
  };
}
