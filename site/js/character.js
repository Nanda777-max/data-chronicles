/* =====================================================================
   THE CHARACTER
   A low-poly comic figure built from simple shapes: big curly hair,
   six-sided glasses, mustard jacket with a bar-chart badge and an
   orange scarf. Every shape has a black "ink" shell around it, which gives
   the drawn comic outline.

   createHero() returns an object. main.js tells it what to do by setting
   flags (pointing, sitting ...) or calling cheer(), kick(), flinch(),
   walkTo(). update() then moves the joints smoothly toward that pose.

   To use a sculpted .glb model later, replace the body-building part and
   keep the same flags and methods.
   ===================================================================== */
import * as THREE from 'three';

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export function createHero() {
  const COL = { skin:'#b9825a', dark:'#15130f', jacket:'#e0a526', tee:'#f3e6c4', badge:'#6e1423', scarf:'#ff5a1f', pants:'#2a2622', shoe:'#f3e6c4' };
  const mat = c => new THREE.MeshToonMaterial({ color:c });
  const ink = new THREE.MeshBasicMaterial({ color:0x15130f, side:THREE.BackSide });

  /* add one shape, plus its ink outline shell */
  function add(geo, material, parent, x = 0, y = 0, z = 0, outline = 1.09) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z); m.castShadow = true; parent.add(m);
    if (outline) { const o = new THREE.Mesh(geo, ink); o.scale.setScalar(outline); m.add(o); }
    return m;
  }

  const SCALE = 1, LEG = .39;
  const group = new THREE.Group();          // feet are at y = 0 of this group
  group.scale.setScalar(SCALE);

  /* legs: each hangs from a hip joint so it can swing, kick and fold for sitting */
  const legs = [-1, 1].map(s => {
    const hip = new THREE.Group(); hip.position.set(s * .115, LEG, 0); group.add(hip);
    add(new THREE.BoxGeometry(.14, .36, .15), mat(COL.pants), hip, 0, -.18, 0);
    add(new THREE.BoxGeometry(.17, .09, .27), mat(COL.shoe), hip, 0, -.345, .05);
    return hip;
  });

  /* everything above the hips */
  const body = new THREE.Group(); body.position.y = LEG; group.add(body);
  const torsoGeo = new THREE.CylinderGeometry(.2, .26, .44, 7); torsoGeo.rotateY(Math.PI / 7);
  add(torsoGeo, mat(COL.jacket), body, 0, .22, 0, 1.07);
  add(new THREE.BoxGeometry(.13, .34, .02), mat(COL.tee), body, 0, .23, .222, 0);                 // tee under the open jacket
  [[-.035, .05], [0, .09], [.035, .13]].forEach(([x, h]) =>                                       // bar-chart badge
    add(new THREE.BoxGeometry(.026, h, .02), mat(COL.badge), body, x, .13 + h / 2, .234, 0));
  const scarfGeo = new THREE.CylinderGeometry(.19, .23, .11, 7); scarfGeo.rotateY(Math.PI / 7);
  add(scarfGeo, mat(COL.scarf), body, 0, .475, 0, 1.08);
  const tails = [[-.07, .3], [.06, .22]].map(([x, len]) => {                                      // scarf tails that sway
    const p = new THREE.Group(); p.position.set(x, .46, -.2); body.add(p);
    add(new THREE.BoxGeometry(.09, len, .03), mat(COL.scarf), p, 0, -len / 2, 0, 1.12);
    return p;
  });

  const arms = [-1, 1].map(s => {
    const shoulder = new THREE.Group(); shoulder.position.set(s * .28, .4, 0); body.add(shoulder);
    add(new THREE.BoxGeometry(.12, .34, .12), mat(COL.jacket), shoulder, 0, -.17, 0);
    add(new THREE.IcosahedronGeometry(.075, 0), mat(COL.skin), shoulder, 0, -.39, 0);
    return shoulder;
  });

  const head = new THREE.Group(); head.position.y = .8; body.add(head);
  const skull = add(new THREE.IcosahedronGeometry(.3, 1), mat(COL.skin), head, 0, 0, 0, 1.06); skull.scale.set(1, 1.02, .96);
  add(new THREE.BoxGeometry(.11, .022, .02), mat(COL.dark), head, 0, -.135, .285, 0);                 // mouth
  add(new THREE.IcosahedronGeometry(.05, 0), mat(COL.skin), head, 0, -.03, .3, 0);                // nose
  [[0, .27, -.02, .2], [-.19, .22, .02, .17], [.19, .22, .02, .17], [-.1, .29, .13, .15], [.1, .29, .13, .15], [0, .2, -.2, .19],
   [-.26, .08, -.08, .15], [.26, .08, -.08, .15], [-.15, .33, -.08, .14], [.15, .33, -.08, .14], [0, .36, .04, .13]]
    .forEach(([x, y, z, r]) => add(new THREE.IcosahedronGeometry(r, 0), mat(COL.dark), head, x, y, z, 0));   // curly hair clumps
  const lens = new THREE.MeshBasicMaterial({ color:0xf3e6c4, transparent:true, opacity:.28 });
  const eyes = [], brows = [];
  [-.118, .118].forEach(x => {
    add(new THREE.TorusGeometry(.1, .024, 5, 6), mat(COL.dark), head, x, .03, .285, 0);           // six-sided glasses
    const l = new THREE.Mesh(new THREE.CircleGeometry(.085, 6), lens); l.position.set(x, .03, .284); head.add(l);
    eyes.push(add(new THREE.SphereGeometry(.03, 8, 6), mat(COL.dark), head, x, .03, .272, 0));
    brows.push(add(new THREE.BoxGeometry(.11, .03, .03), mat(COL.dark), head, x, .165, .285, 0));
  });
  add(new THREE.BoxGeometry(.06, .022, .022), mat(COL.dark), head, 0, .04, .295, 0);              // glasses bridge

  /* ---------- behaviour ---------- */
  const hero = {
    group, radius:.27, height:1.32,
    pointing:false, sitting:false, waving:false,           // flags main.js switches on and off
    look:{ x:0, y:0 },                                     // where the head looks: -1..1 left/right and down/up
    baseY:0, walking:false,
    _walk:null, _cheer:0, _kick:0, _flinch:0, _phase:0, _blink:2, _hop:0,
    cheer() { this._cheer = 1.5; },
    kick() { this._kick = .42; },
    flinch() { this._flinch = .55; },
    /* walk along the shelf to (x, z); done() is called on arrival */
    walkTo(x, z, done) { this._walk = { x, z, done }; this.sitting = false; },
    stop() { this._walk = null; },

    update(dt, t, still) {
      const g = group;
      /* walking */
      let moving = false, face = this.pointing ? -.75 : this.look.x * .45 + .12;
      if (this._walk) {
        const dx = this._walk.x - g.position.x, dz = this._walk.z - g.position.z, d = Math.hypot(dx, dz);
        if (d < .04) { const done = this._walk.done; this._walk = null; if (done) done(); }
        else { const step = Math.min(d, 2.1 * dt); g.position.x += dx / d * step; g.position.z += dz / d * step; face = Math.atan2(dx, dz); moving = true; }
      }
      this.walking = moving;
      g.rotation.y = damp(g.rotation.y, face, moving ? 12 : 5, dt);
      this._phase += dt * (moving ? 11 : 0);
      const swing = moving ? Math.sin(this._phase) : 0;

      /* timers for the short one-off moves */
      this._cheer = Math.max(0, this._cheer - dt); this._kick = Math.max(0, this._kick - dt); this._flinch = Math.max(0, this._flinch - dt);
      const cheering = this._cheer > 0, sit = this.sitting && !moving && !cheering;

      /* height: sit lowers the body, cheering and walking add small hops */
      const hop = cheering ? Math.abs(Math.sin(t * 10)) * .2 : moving ? Math.abs(Math.sin(this._phase)) * .05 : 0;
      this._hop = damp(this._hop, sit ? -(LEG - .08) * SCALE : 0, 9, dt);
      g.position.y = this.baseY + this._hop + hop;

      /* legs */
      const kick = this._kick > 0 ? Math.sin(Math.PI * (1 - this._kick / .42)) : 0;
      legs[0].rotation.x = damp(legs[0].rotation.x, sit ? -1.5 : -swing * .7, 14, dt);
      legs[1].rotation.x = damp(legs[1].rotation.x, sit ? -1.5 : swing * .7 - kick * 1.5, kick ? 30 : 14, dt);
      legs[0].rotation.z = damp(legs[0].rotation.z, sit ? -.12 : 0, 9, dt); legs[1].rotation.z = -legs[0].rotation.z;

      /* arms: [left, right]. Books are on the character's left, so the left arm does the pointing. */
      let lz = -.1, rz = .1, lx = swing * .6, rx = -swing * .6;
      if (this.pointing) { lz = -1.85; lx = -.25; }
      if (this.waving) { rz = 2.55 + Math.sin(t * 12) * .32; }
      if (cheering) { lz = -2.75; rz = 2.75; }
      if (this._flinch > 0) { lz = -1.1; rz = 1.1; lx = rx = -.5; }
      if (sit) { lx = rx = -.35; }
      arms[0].rotation.z = damp(arms[0].rotation.z, lz, 11, dt); arms[1].rotation.z = damp(arms[1].rotation.z, rz, 11, dt);
      arms[0].rotation.x = damp(arms[0].rotation.x, lx, 11, dt); arms[1].rotation.x = damp(arms[1].rotation.x, rx, 11, dt);

      /* body: breathing, shifting weight from foot to foot, leaning back when hit */
      body.scale.y = 1 + (still ? 0 : Math.sin(t * 2.2) * .012);
      body.position.x = still || moving ? 0 : Math.sin(t * .7) * .018;
      body.rotation.z = still || moving ? 0 : Math.sin(t * .7) * .025;
      body.rotation.x = damp(body.rotation.x, this._flinch > 0 ? -.3 : moving ? .12 : 0, 12, dt);

      /* head follows the look target; brows lift when surprised or cheering; eyes blink */
      head.rotation.y = damp(head.rotation.y, this.look.x * .7 - (this.pointing ? .5 : 0), 7, dt);
      head.rotation.x = damp(head.rotation.x, -this.look.y * .35, 7, dt);
      const browY = .165 + (this._flinch > 0 || cheering ? .05 : 0);
      brows.forEach(b => { b.position.y = damp(b.position.y, browY, 14, dt); });
      this._blink -= dt; if (this._blink < -.12) this._blink = 2 + Math.random() * 3;
      eyes.forEach(e => { e.scale.y = this._blink < 0 ? .12 : 1; });

      /* scarf tails trail behind when moving and sway a little when still */
      tails.forEach((p, i) => { p.rotation.x = damp(p.rotation.x, (moving ? .7 : .12) + (still ? 0 : Math.sin(t * 2 + i) * .08), 6, dt); });
    },
  };
  return hero;
}
