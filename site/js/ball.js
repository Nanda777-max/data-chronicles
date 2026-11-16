/* =====================================================================
   THE BALL: small hand-written physics (gravity, bounce, rolling friction)
   The ball lives inside a box-shaped play area on the shelf, described by
   `bounds`. While the visitor drags it, it follows the pointer and
   remembers how fast it was moving, so letting go throws it.
   ===================================================================== */
import * as THREE from 'three';

export function createBall(mesh, radius, bounds) {
  const GRAVITY = 20, BOUNCE_FLOOR = .58, BOUNCE_WALL = .66, ROLL_FRICTION = 1.5, MAX_THROW = 13;
  const prev = new THREE.Vector3(), axis = new THREE.Vector3();
  const ball = {
    mesh, radius, bounds,
    p: mesh.position,               // position (shelf coordinates)
    v: new THREE.Vector3(),         // velocity
    dragging: false, target: new THREE.Vector3(),
    restTime: 0,                    // seconds it has been lying still
    onBounce: null,                 // main.js sets this to play a sound

    grab() { this.dragging = true; this.target.copy(this.p); this.v.set(0, 0, 0); },
    dragTo(point) { this.target.copy(point); clampTo(this.target); },
    release() { this.dragging = false; if (this.v.length() > MAX_THROW) this.v.setLength(MAX_THROW); },
    onFloor() { return this.p.y <= bounds.y0 + .002; },

    update(dt) {
      prev.copy(this.p);
      if (this.dragging) {
        /* follow the pointer with a little lag, and keep a running estimate of the speed for the throw */
        this.p.lerp(this.target, 1 - Math.exp(-22 * dt));
        this.v.lerp(axis.copy(this.p).sub(prev).divideScalar(dt), .3);
        this.restTime = 0;
      } else {
        this.v.y -= GRAVITY * dt;
        this.p.addScaledVector(this.v, dt);
        /* bounce off the six sides of the play area */
        for (const [k, lo, hi] of [['x', bounds.x0, bounds.x1], ['z', bounds.z0, bounds.z1], ['y', bounds.y0, bounds.y1]]) {
          const e = k === 'y' ? BOUNCE_FLOOR : BOUNCE_WALL;
          if (this.p[k] < lo) { this.p[k] = lo; if (this.v[k] < 0) { hit(this, -this.v[k]); this.v[k] *= -e; } }
          if (this.p[k] > hi) { this.p[k] = hi; if (this.v[k] > 0) { hit(this, this.v[k]); this.v[k] *= -e; } }
        }
        if (this.onFloor()) {
          if (Math.abs(this.v.y) < 1.1) this.v.y = 0;                       // stop tiny bounces
          const f = Math.exp(-ROLL_FRICTION * dt); this.v.x *= f; this.v.z *= f;
          if (Math.hypot(this.v.x, this.v.z) < .06) this.v.x = this.v.z = 0;
        }
        this.restTime = this.v.lengthSq() < .001 ? this.restTime + dt : 0;
      }
      /* spin the ball so it looks like it rolls in the direction it travels */
      const dx = this.p.x - prev.x, dz = this.p.z - prev.z, d = Math.hypot(dx, dz);
      if (d > 1e-5) mesh.rotateOnWorldAxis(axis.set(dz / d, 0, -dx / d), d / radius);
    },
  };
  function clampTo(v) {
    v.x = Math.min(bounds.x1, Math.max(bounds.x0, v.x)); v.y = Math.min(bounds.y1, Math.max(bounds.y0, v.y)); v.z = Math.min(bounds.z1, Math.max(bounds.z0, v.z));
  }
  function hit(b, speed) { if (b.onBounce && speed > 1.2) b.onBounce(speed); }
  return ball;
}
