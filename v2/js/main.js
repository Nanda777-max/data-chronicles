/* =====================================================================
   THE DATA CHRONICLES, VERSION 2: main scene (living room and a box of books)
   Text, page layouts, the character and the ball are shared with version 1 (../site/js).
   Sections of this file:
     1. Setup (renderer, camera, lights, helpers)
     2. Bookshelf and decorations
     3. Books (built from content.js)
     4. Character and ball
     5. Hover, click and keyboard
     6. Opening, reading and closing a book
     7. Layout for different screen shapes
     8. The animation loop
   Text and projects live in content.js. You should rarely need to edit here.
   ===================================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BOOKS, LINES } from '../../site/js/content.js';
import { renderPage } from '../../site/js/pages.js';
import { createHero } from '../../site/js/character.js';
import { createBall } from '../../site/js/ball.js';
import { createRoom } from './room.js';

/* ---------------------------------------------------------------------
   1. SETUP
   --------------------------------------------------------------------- */
const $ = id => document.getElementById(id);
const canvas = $('stage');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;   // visitor asked for less motion
const SPEED = REDUCED ? .02 : 1;                                          // shortens the opening sequence for them

/* wait for the comic font so spines and covers are lettered with it */
try { await Promise.race([document.fonts.load('80px Bangers'), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* fall back below */ }
const FONT = document.fonts.check('80px Bangers') ? 'Bangers' : 'Impact';

const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const FOV = 34, VIEW = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2));   // VIEW x distance = visible height
const camera = new THREE.PerspectiveCamera(FOV, 1, .1, 100);
scene.add(camera);

const hemi = new THREE.HemisphereLight(0xffffff, 0xd9d4cb, 1.25); scene.add(hemi);   // soft, even light for the white room
const sun = new THREE.DirectionalLight(0xffe2b0, 2.0);                    // main light, casts the shadows
sun.position.set(-5, 11, 12);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
Object.assign(sun.shadow.camera, { left:-18, right:18, top:14, bottom:-6, near:1, far:55 }); sun.shadow.radius = 6;
scene.add(sun);

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = p => p * p * (3 - 2 * p);
const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, ...extra });
function shadowed(m) { m.castShadow = m.receiveShadow = true; return m; }
function box(w, h, d, mat, x = 0, y = 0, z = 0) { const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); return m; }
function rbox(w, h, d, mat, x = 0, y = 0, z = 0, r = .035) { const m = shadowed(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat)); m.position.set(x, y, z); return m; }   // bevelled edges
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function halftone(g, w, h, color, step = 14, r = 2.6) {
  g.fillStyle = color;
  for (let y = 0; y < h; y += step) for (let x = (y / step % 2) * step / 2; x < w; x += step) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
}

/* optional sound: off until the visitor switches it on */
let audio = null;
function sfx(kind, strength = 1) {
  if (!audio) return;
  const t = audio.currentTime, gain = audio.createGain(); gain.connect(audio.destination);
  if (kind === 'thud') {                                   // ball bounce or kick
    const o = audio.createOscillator(); o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(70, t + .12);
    gain.gain.setValueAtTime(Math.min(.3, .08 * strength), t); gain.gain.exponentialRampToValueAtTime(.001, t + .15); o.connect(gain); o.start(t); o.stop(t + .16);
  } else {                                                 // paper swish for books and pages
    const n = audio.createBufferSource(), buf = audio.createBuffer(1, 4410, 44100), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const f = audio.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = kind === 'flip' ? 2600 : 1200;
    n.buffer = buf; n.connect(f); f.connect(gain); gain.gain.value = .09 * strength; n.start(t);
  }
}
$('sound').onclick = e => {
  if (audio) { audio.close(); audio = null; } else audio = new (window.AudioContext || window.webkitAudioContext)();
  e.currentTarget.textContent = 'Sound: ' + (audio ? 'on' : 'off'); e.currentTarget.setAttribute('aria-pressed', !!audio);
};

/* ---------------------------------------------------------------------
   2. THE ROOM (built in room.js) AND THE STAGE
   "shelf" is the group that holds everything the visitor can pick up: the
   books, the character and the ball. Its origin is the middle of the
   cardboard box, so all positions below are measured from the box.
   (It keeps the name it had in version 1, where it was a bookshelf.)
   --------------------------------------------------------------------- */
const room = createRoom({ scene, hemi, sun, FONT });
const W = room.crate.BW, D = room.crate.BD;          // inside width and depth of the box
const Y_BOOKS = room.crate.LIFT + 1.02;               // height of the packing layer the books stand on
const H = 4.6;                                       // rough height of the box with books in it (used to frame the camera)
const shelf = new THREE.Group(); shelf.position.copy(room.crate.REST); scene.add(shelf);
const spot = new THREE.SpotLight(0xfff0c8, 0, 0, .3, .7, 0); spot.position.set(0, Y_BOOKS + 5, 5); shelf.add(spot, spot.target);   // picks out the book you point at
const paper = toon('#f6ecd0');

/* ---------------------------------------------------------------------
   3. BOOKS
   Each book is a small assembly: page block + back cover + spine + a front
   cover on a hinge, so it can really open. Spine and cover artwork are
   painted on a canvas from the entries in content.js.
   --------------------------------------------------------------------- */
const BOOK_D = 1.9, COVER_T = .045, PAGE_W = BOOK_D * .93;   // book depth (spine to fore-edge), cover thickness, page width

function spineTex(b, i) {
  return canvasTex(256, 1024, (g, w, h) => {
    g.fillStyle = b.color; g.fillRect(0, 0, w, h); halftone(g, w, h, 'rgba(0,0,0,.14)');
    g.fillStyle = b.ink; g.fillRect(0, 150, w, 10); g.fillRect(0, h - 150, w, 10);
    g.beginPath(); g.arc(w / 2, 80, 48, 0, 7); g.fill();
    g.fillStyle = b.color; g.font = `64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('0' + (i + 1), w / 2, 86);
    g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2);                 // the title reads from bottom to top
    let size = 150; const title = b.title.toUpperCase(); g.font = `${size}px ${FONT}`;
    while (g.measureText(title).width > 660) { size -= 6; g.font = `${size}px ${FONT}`; }
    g.fillStyle = b.ink; g.fillText(title, 0, 8); g.restore();
    g.font = `44px ${FONT}`; g.fillText('NKS', w / 2, h - 75);
  });
}
/* cover artwork: one drawing routine per motif, so every book looks different but related */
const MOTIFS = {
  burst(g, w, h) { g.translate(w / 2, h * .6); for (let a = 0; a < 24; a += 2) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 1200, a * Math.PI / 12, (a + 1) * Math.PI / 12); g.fill(); } },
  scatter(g, w, h) { for (let i = 0; i < 46; i++) { const x = 60 + (i * 97 % 520), y = h - 120 - x * .9 + (i * 53 % 260) - 130; g.beginPath(); g.arc(x, y, 9 + i % 4 * 5, 0, 7); g.fill(); } },
  bars(g, w, h) { [.35, .5, .42, .68, .6, .86].forEach((v, i) => g.fillRect(50 + i * 92, h - 40 - v * 560, 66, v * 560)); },
  rings(g, w, h) { g.lineWidth = 30; g.strokeStyle = g.fillStyle; [[200, 640, 150], [430, 760, 110], [400, 520, 70]].forEach(([x, y, r]) => { g.setLineDash([34, 20]); g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); }); g.setLineDash([]); },
  orbit(g, w, h) { g.lineWidth = 16; g.strokeStyle = g.fillStyle; g.translate(w / 2, h * .66); for (let k = 0; k < 3; k++) { g.rotate(Math.PI / 3); g.beginPath(); g.ellipse(0, 0, 250, 90, 0, 0, 7); g.stroke(); } g.beginPath(); g.arc(0, 0, 46, 0, 7); g.fill(); },
  arrow(g, w, h) { g.beginPath(); g.moveTo(90, h - 130); g.lineTo(380, h - 420); g.lineTo(300, h - 500); g.lineTo(570, h - 540); g.lineTo(530, h - 270); g.lineTo(450, h - 350); g.lineTo(160, h - 60); g.closePath(); g.fill(); },
};
function coverTex(b, i) {
  return canvasTex(640, 1024, (g, w, h) => {
    g.fillStyle = b.color; g.fillRect(0, 0, w, h);
    g.save(); g.globalAlpha = .2; g.fillStyle = b.ink; (MOTIFS[b.motif] || MOTIFS.burst)(g, w, h); g.restore();
    halftone(g, w, h, 'rgba(0,0,0,.12)', 16, 3);
    g.strokeStyle = b.ink; g.lineWidth = 14; g.strokeRect(22, 22, w - 44, h - 44);
    g.fillStyle = b.ink; g.fillRect(22, 22, 250, 78);
    g.fillStyle = b.color; g.font = `50px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('ISSUE #0' + (i + 1), 44, 64);
    g.fillStyle = b.ink; g.textAlign = 'center';
    b.title.toUpperCase().split(' ').forEach((word, k) => {
      let s = 180; g.font = `${s}px ${FONT}`; while (g.measureText(word).width > 540) { s -= 8; g.font = `${s}px ${FONT}`; }
      g.fillText(word, w / 2, 250 + k * 165);
    });
    g.font = `46px ${FONT}`; g.fillText(b.hint.toUpperCase(), w / 2, h - 86);
  });
}
const pageTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f6ecd0'; g.fillRect(0, 0, w, h); halftone(g, w, h, 'rgba(110,20,35,.07)', 12, 2); });
const pageMat = toon('#ffffff', { map:pageTex });

const books = [], pickable = [];
let cursorX = -W / 2 + .3;
BOOKS.forEach((data, i) => {
  const b = { ...data, i }, g = new THREE.Group(), col = toon(b.color);
  g.add(box(b.t - 2 * COVER_T, b.h * .95, BOOK_D * .95, [pageMat, paper, paper, paper, paper, paper], 0, 0, -BOOK_D * .025));          // page block
  g.add(box(COVER_T, b.h, BOOK_D, col, -b.t / 2 + COVER_T / 2, 0, 0));                                                                // back cover
  g.add(box(b.t, b.h, COVER_T, [col, col, col, col, toon('#ffffff', { map:spineTex(b, i) }), col], 0, 0, BOOK_D / 2 - COVER_T / 2));   // spine
  const hinge = new THREE.Group(); hinge.position.set(b.t / 2 - COVER_T / 2, 0, BOOK_D / 2 - COVER_T);                                // the front cover swings here
  hinge.add(box(COVER_T, b.h, BOOK_D - COVER_T, [toon('#ffffff', { map:coverTex(b, i) }), pageMat, col, col, col, col], 0, 0, -(BOOK_D - COVER_T) / 2));
  g.add(hinge);
  const lean = b.lean || 0;                                                                                                            // a leaning book rests on its neighbour
  b.home = new THREE.Vector3(cursorX + b.t / 2 + lean * b.h * .5, Y_BOOKS + b.h / 2 + lean * b.t * .45, -.05);
  b.homeQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, lean));
  g.position.copy(b.home); g.quaternion.copy(b.homeQ);
  g.traverse(o => { if (o.isMesh) { o.userData.book = i; pickable.push(o); } });
  shelf.add(g);
  /* motion state: the book is pulled toward `to` (position) and `toQ` (rotation) like a weight on a spring */
  Object.assign(b, { g, hinge, vel:new THREE.Vector3(), to:b.home.clone(), toQ:b.homeQ.clone(), stiff:170, drag:22, cover:0, wob:0, wobT:0 });
  books.push(b);
  cursorX += b.t + .05 + lean * b.h * .55;
});
/* the delivery: books begin sunk inside the box, out of sight, and rise once it has rolled in */
let intro = REDUCED ? 2 : 0;
books.forEach(b => { b.g.position.y -= 3.2; b.to.copy(b.g.position); b.g.visible = false; b.risen = false; });

/* loose pages that physically turn. Two are enough: they are reused for every flip. */
const leaves = [0, 1].map(() => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 14, 1), toon('#ffffff', { map:pageTex, side:THREE.DoubleSide }));
  m.visible = false; m.frustumCulled = false;
  return { m, p:1, dir:1, done:null };
});
/* A leaf's position is `p`: 0 = lying where it started, 1 = fully turned over.
   dir +1 turns right-to-left (next page), dir -1 turns left-to-right (previous page).
   While the visitor holds the page, p follows the pointer. When `goal` is set, it glides there by itself. */
function startLeaf(b, dir) {
  const l = leaves.find(k => !k.m.visible) || leaves[0];
  b.g.add(l.m); l.m.visible = true; Object.assign(l, { p:0, dir, b, goal:null, rate:7, done:null });
  return l;
}
function flip(b, dir, done, rate = 7) {
  const l = startLeaf(b, dir); l.goal = 1; l.rate = REDUCED ? 200 : rate; l.done = done; sfx('flip'); return l;
}
function updateLeaf(l, dt) {
  if (!l.m.visible) return;
  if (l.goal !== null) { l.p = damp(l.p, l.goal, l.rate, dt); if (Math.abs(l.goal - l.p) < .015) l.p = l.goal; }
  const phi = l.dir > 0 ? -Math.PI * l.p : -Math.PI * (1 - l.p), b = l.b;
  const pos = l.m.geometry.attributes.position, hx = b.t / 2 - COVER_T + .012, hz = BOOK_D / 2 - COVER_T, half = b.h * .95 / 2;
  for (let i = 0; i < pos.count; i++) {
    const u = (i % 15) / 14, r = u * PAGE_W;
    /* the outer edge of the paper lags behind the spine edge, which makes the page bend as it turns */
    const a = Math.max(-Math.PI, Math.min(0, phi + l.dir * .85 * u * Math.sin(Math.PI * l.p)));
    pos.setXYZ(i, hx + (-a / Math.PI) * (COVER_T + .012) - Math.sin(a) * r, i < 15 ? half : -half, hz - Math.cos(a) * r);
  }
  pos.needsUpdate = true; l.m.geometry.computeVertexNormals();
  if (l.goal !== null && l.p === l.goal) { l.m.visible = false; const d = l.done; l.done = null; if (d) d(l.goal === 1); }
}

/* ---------------------------------------------------------------------
   4. CHARACTER AND BALL
   Both live on the upper board, to the right of the books.
   --------------------------------------------------------------------- */
const hero = createHero();
const HOME = new THREE.Vector3(W / 2 + 1.5, 0, .5);   // where the character normally stands: on the floor beside the box
hero.baseY = 0; hero.group.position.copy(HOME); shelf.add(hero.group);

const BALL_R = .34;
const ballTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e1b18';
  for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(20 + i * 30, i % 2 ? 40 : 90, 13, 0, 7); g.fill(); } });
const ballMesh = shadowed(new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 24, 16), toon('#ffffff', { map:ballTex })));
ballMesh.add(new THREE.Mesh(ballMesh.geometry, new THREE.MeshBasicMaterial({ color:0x15130f, side:THREE.BackSide })).translateX(0)); ballMesh.children[0].scale.setScalar(1.05);
ballMesh.position.set(W / 2 + 2.7, BALL_R, 1.3); shelf.add(ballMesh);
/* the play area: the living-room floor, from the sofa to past the balcony door, wall to front */
const ball = createBall(ballMesh, BALL_R, {
  x0:-W / 2 - 6, x1:W / 2 + 6.2, y0:BALL_R, y1:6.5, z0:-4.9 + BALL_R, z1:3.0,
});
ball.onBounce = speed => sfx('thud', speed / 6);
let played = false, heroBusy = false, hitCooldown = 0;       // `played` is true once the visitor has thrown the ball

/* speech bubble */
const bubble = $('bubble'); let bubbleTimer = 0;
function say(text, seconds = 2.6) { bubble.textContent = text; bubbleTimer = seconds; }
say('Delivery!', 4);

/* ---------------------------------------------------------------------
   5. HOVER, CLICK AND KEYBOARD
   --------------------------------------------------------------------- */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(0, 0), ring = $('ring');
let mode = 'intro';              // 'intro' | 'shelf' | 'opening' | 'open' | 'closing'
let hovered = -1, opened = -1, overBall = false, idle = 0, dragMoved = false, dragZ = 0;
const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(.1, -.12, 0));   // hovered book tips forward and turns its cover a little

function setHover(i) {
  if (mode !== 'shelf' || i === hovered) return;
  hovered = i; idle = 0; hero.sitting = false;
  ring.classList.toggle('hot', i >= 0);
  books.forEach((b, k) => {
    b.stiff = 170; b.drag = 22;
    b.to.copy(b.home); b.toQ.copy(b.homeQ);
    if (i < 0) return;
    if (k === i) { b.to.y += .85; b.toQ.copy(b.homeQ).multiply(tilt); }                 // rise out of the box and tip toward the viewer
  });
  hero.pointing = i >= 0;
  if (i >= 0) { nudge(i, .028); say(books[i].say, 3); sfx('slide', .6); if (!heroBusy) hero.walkTo(HOME.x, HOME.z); }
}
/* make the books either side of book i rock, as if it brushed them on the way out */
function nudge(i, amount) { for (const k of [i - 1, i + 1]) if (books[k]) { books[k].wob = amount; books[k].wobT = 0; } }
function pointerRay(e) { mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, camera); }
/* where the pointer ray crosses the vertical plane the ball is being dragged in (in shelf coordinates) */
const inv = new THREE.Matrix4(), localRay = new THREE.Ray(), dragPoint = new THREE.Vector3();
function dragTarget() {
  localRay.copy(ray.ray).applyMatrix4(inv.copy(shelf.matrixWorld).invert());
  const k = (dragZ - localRay.origin.z) / localRay.direction.z;
  return dragPoint.copy(localRay.origin).addScaledVector(localRay.direction, k);
}
addEventListener('pointermove', e => {
  ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
  if (mode === 'open') ring.classList.toggle('hot', !!e.target.closest('.pg, button, a'));
});
const brushPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 2.6), brushHit = new THREE.Vector3();
canvas.addEventListener('pointermove', e => {
  pointerRay(e); idle = 0;
  if (ray.ray.intersectPlane(brushPlane, brushHit)) room.brush(brushHit.x, mouse.y);   // plants and curtains feel the pointer
  if (ball.dragging) { dragMoved = true; ball.dragTo(dragTarget()); return; }
  if (mode !== 'shelf') return;
  overBall = ray.intersectObject(ballMesh, false).length > 0;
  ring.classList.toggle('grab', overBall);
  const hit = overBall ? null : ray.intersectObjects(pickable, false)[0];
  setHover(hit ? hit.object.userData.book : -1);
  if (!overBall && !hit && ray.intersectObjects(room.clickables, false).length) ring.classList.add('hot');   // the sun and the lamp are clickable
});
canvas.addEventListener('pointerdown', e => {
  pointerRay(e); dragMoved = false;
  if (mode !== 'shelf') return;
  if (ray.intersectObject(ballMesh, false).length) {            // pick up the ball
    canvas.setPointerCapture(e.pointerId); dragZ = Math.max(.1, ball.p.z); ball.grab(); played = true; heroBusy = false; hero.stop();
    setHover(-1); say(LINES.grab, 2);
  } else {                                                       // on touch screens there is no hover, so a tap selects first
    const hit = ray.intersectObjects(pickable, false)[0]; setHover(hit ? hit.object.userData.book : -1);
  }
});
canvas.addEventListener('pointerup', () => {
  if (ball.dragging) { ball.release(); return; }
  if (mode === 'shelf' && hovered >= 0 && !dragMoved) openBook(hovered);
  else if (mode === 'shelf' && !dragMoved) { const line = room.click(ray); if (line) { say(line, 2.4); sfx('thud', .5); } }
});
canvas.addEventListener('pointerleave', () => { if (!ball.dragging) setHover(-1); });

/* keyboard: arrows choose a book, Enter opens it, Escape closes, arrows turn pages while reading */
addEventListener('keydown', e => {
  if (mode === 'open') {
    if (e.key === 'Escape') closeBook();
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
    return;
  }
  if (mode !== 'shelf' || (document.activeElement !== canvas && document.activeElement !== document.body)) return;
  if (e.key === 'ArrowRight') setHover(Math.min(books.length - 1, hovered + 1));
  if (e.key === 'ArrowLeft') setHover(Math.max(0, hovered < 0 ? 0 : hovered - 1));
  if ((e.key === 'Enter' || e.key === ' ') && hovered >= 0) { e.preventDefault(); openBook(hovered); }
});
/* bottom navigation: a plain second route to every section */
books.forEach((b, i) => { const n = document.createElement('button'); n.textContent = b.hint; n.onclick = () => openBook(i); $('nav').appendChild(n); });

/* ---------------------------------------------------------------------
   6. OPENING, READING AND CLOSING A BOOK
   The sequence: pull the book out of the shelf, carry it to the middle of
   the screen while turning its cover to face the reader, swing the cover
   open, riffle two pages, then show the content on the paper.
   --------------------------------------------------------------------- */
let timers = [], spread = 0, perView = 2;
const pgL = $('pgL'), pgR = $('pgR'), reader = $('reader'), look = new THREE.Vector3(), camHome = new THREE.Vector3();
const later = (ms, fn) => timers.push(setTimeout(fn, ms * SPEED));
let dim = 0, dimTo = 0;                                         // darkens the shelf behind an open book
const veil = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({ color:0x1a0508, transparent:true, opacity:0, depthWrite:false }));
veil.position.z = -9.5; veil.visible = false; camera.add(veil);

/* position and rotation (in shelf coordinates) that put the open book flat in front of the camera */
function readingPose(b) {
  const fwd = look.clone().sub(camHome).normalize();
  const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, fwd);
  const two = perView === 2;
  const dist = Math.max(b.h / (VIEW * (two ? .8 : .72)), (two ? 2 : 1) * BOOK_D / (VIEW * camera.aspect * .96));   // close enough that the book fills most of the screen
  const p = camHome.clone().addScaledVector(fwd, dist).addScaledVector(up, dist * VIEW * (two ? -.025 : -.01));   // a little low, leaving room on top for the character
  if (two) p.addScaledVector(right, BOOK_D / 2);                 // puts the spine on the centre line of the screen
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(fwd.clone().negate(), up, right.clone().negate()));
  return { pos:shelf.worldToLocal(p), quat:shelf.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q) };
}

function openBook(i) {
  if (mode !== 'shelf') return;
  setHover(-1); mode = 'opening'; opened = i; const b = books[i];
  document.body.classList.add('reading'); ring.classList.remove('hot', 'grab');
  dimTo = .72; hero.pointing = false; hero.cheer(); say(LINES.opened, 2.2); sfx('slide');
  if (!REDUCED) { $('lines').classList.remove('go'); void $('lines').offsetWidth; $('lines').classList.add('go'); }
  b.g.traverse(o => { if (o.isMesh) o.receiveShadow = false; });   // an open book is lit evenly: shadows on the pages would flicker
  spread = 0;
  nudge(i, .075);
  b.stiff = 70; b.drag = 14; b.to.copy(b.home); b.to.y += 3.2; b.toQ.copy(b.homeQ);            // 1. lift it out of the box
  later(430, () => { const pose = readingPose(b); b.stiff = 34; b.drag = 10.5; b.to.copy(pose.pos); b.toQ.copy(pose.quat); });   // 2. carry and turn (heavy, settles slowly)
  later(1500, () => { b.cover = -Math.PI; sfx('slide', .8); });                                  // 3. cover swings open
  later(2250, () => flip(b, 1, null, 6));                                                      // 4. two pages riffle past
  later(2520, () => flip(b, 1, null, 6));
  later(3200, () => {
    /* lock the book, its cover and the camera in place so nothing drifts under the text */
    b.g.position.copy(b.to); b.g.quaternion.copy(b.toQ); b.vel.set(0, 0, 0); b.hinge.rotation.y = b.cover;
    camera.position.copy(camHome); camera.lookAt(look);
    mode = 'open'; showSpread(); reader.classList.add('show'); $('close').focus({ preventScroll:true }); perchOn(); });
}

function closeBook() {
  if (mode !== 'open' && mode !== 'opening') return;
  timers.forEach(clearTimeout); timers = [];
  const b = books[opened]; mode = 'closing';
  pgL.classList.remove('show'); pgR.classList.remove('show'); reader.classList.remove('show');
  flipper.style.display = 'none'; fl = null; turning = false; hold = null; perchOff();
  b.cover = 0; sfx('slide', .8);
  later(520, () => { b.stiff = 40; b.drag = 11; b.toQ.copy(b.homeQ); b.to.copy(b.home); b.to.y += 3.2; dimTo = 0; });   // carry it back above its slot
  later(1350, () => { b.stiff = 90; b.drag = 17; b.to.copy(b.home); });                                               // lower it into the box
  later(1900, () => { b.g.traverse(o => { if (o.isMesh) o.receiveShadow = true; }); mode = 'shelf'; opened = -1; hovered = -1; document.body.classList.remove('reading'); hero.sitting = false; say(LINES.closed, 2.5); canvas.focus({ preventScroll:true }); });
}
$('close').onclick = closeBook;

/* The open book shows two pages at a time on wide screens and one at a time on phones.
   A "view" is what you see between page turns. `spread` is the number of the current view. */
const views = () => { const total = books[opened].pages.length; return perView === 2 ? Math.ceil(total / 2) : total; };
function pageHTML(index) {
  const b = books[opened], total = b.pages.length;
  return renderPage(b.pages[index], b, index, total, { prev:index > 0, next:index < total - 1 });
}
/* fill the left / right page for view number i (skipped if it is already showing) */
let shownL = -1, shownR = -1;
function setLeft(i) { if (shownL !== i) { pgL.innerHTML = pageHTML(i * 2); shownL = i; } }
function setRight(i) { if (shownR !== i) { pgR.innerHTML = pageHTML(perView === 2 ? i * 2 + 1 : i); shownR = i; } }
function showSpread() {
  const total = views();
  spread = Math.min(spread, total - 1);
  placePages();
  shownL = shownR = -1;
  setRight(spread);
  if (perView === 2) { setLeft(spread); pgL.classList.add('show'); } else pgL.classList.remove('show');
  pgR.classList.add('show'); pgL.scrollTop = pgR.scrollTop = 0;
  $('count').textContent = `${spread + 1} / ${total}`;
  $('prev').disabled = spread === 0; $('next').disabled = spread >= total - 1;
}

/* ---- the character rides on the open book ----
   While a book is open the character stands on its top edge, shrunk to fit, and hops across to
   the other page every time a page turns. "perch" is the invisible stand it is placed on. */
const perch = new THREE.Group(); perch.scale.setScalar(.26); scene.add(perch);
let perched = false, perchSide = 1, perchT = 1;
const perchFrom = new THREE.Vector3(), perchTo = new THREE.Vector3();
const FLIP_LINES = ['Next!', 'Ooh, this one.', 'Keep going.', 'Good bit coming.', 'Read on!'];
function perchSpot(side) {                 // a point on the top edge of the left (-1) or right (+1) page
  const b = books[opened], hz = BOOK_D / 2 - COVER_T, along = perView === 2 ? side : 1;
  return ghost.localToWorld(new THREE.Vector3(b.t / 2 - .12, b.h / 2 * .98, hz - along * PAGE_W * .55));
}
function perchOn() {
  const b = books[opened]; perched = true; perchSide = perView === 2 ? -1 : 1;
  ghost.position.copy(b.to); ghost.quaternion.copy(b.toQ); shelf.updateMatrixWorld(true);
  perch.quaternion.copy(ghost.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));   // face the reader
  perch.position.copy(perchSpot(perchSide)); perchTo.copy(perch.position); perchT = 1;
  hero.stop(); hero.sitting = hero.pointing = false; heroBusy = false;
  perch.add(hero.group); hero.group.position.set(0, 0, 0); hero.group.rotation.y = 0;
  say(LINES.opened, 2);
}
function perchHop() {
  if (!perched) return;
  if (perView === 2) perchSide = -perchSide;
  perchFrom.copy(perch.position); perchTo.copy(perchSpot(perchSide)); perchT = 0;
  say(FLIP_LINES[Math.floor(Math.random() * FLIP_LINES.length)], 1.6);
}
function perchOff() { if (!perched) return; perched = false; shelf.add(hero.group); hero.group.position.copy(HOME); }
function updatePerch(dt) {
  if (!perched || perchT >= 1) return;
  perchT = Math.min(1, perchT + dt / (REDUCED ? .01 : .55));
  perch.position.lerpVectors(perchFrom, perchTo, smooth(perchT));
  perch.position.y += Math.sin(Math.PI * perchT) * (perView === 2 ? .2 : .14);          // the arc of the jump
}

/* ---- turning pages ----
   The page that turns is a real piece of the page (an HTML element) rotated in 3D around the
   spine, so its text and pictures stay printed on it for the whole turn, like a real book:
     - the front of the turning page shows the page you are leaving,
     - its back shows the page you are arriving at,
     - the page underneath is revealed as it lifts.
   Buttons and arrow keys turn a page for you. On the paper itself you hold the page: press and
   drag sideways and it follows your hand. Let go past a third of the way and it finishes;
   let go earlier and it falls back. A plain click turns the page too. */
const flipStage = $('flipStage'), flipper = $('flipper'), faceA = $('faceA'), faceB = $('faceB');
let turning = false, hold = null, fl = null;        // fl = the turn in progress
const canTurn = dir => mode === 'open' && !turning && spread + dir >= 0 && spread + dir < views();

function beginFlip(dir) {
  const two = perView === 2, next = spread + dir;
  const from = two && dir < 0 ? pgL : pgR, r = from.getBoundingClientRect();
  /* what is printed on the two sides of the turning page */
  if (two) {
    faceA.innerHTML = from.innerHTML;                                        // the page being lifted
    faceB.innerHTML = pageHTML(dir > 0 ? next * 2 : next * 2 + 1);           // what lands on the other side
  } else {
    faceA.innerHTML = dir > 0 ? pgR.innerHTML : pageHTML(next);              // phones: one page, plain paper on the back
    faceB.innerHTML = '';
  }
  faceA.style.fontSize = faceB.style.fontSize = from.style.fontSize;
  Object.assign(flipper.style, { left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px',
    transformOrigin:two && dir < 0 ? 'right center' : 'left center', display:'block' });
  flipStage.style.perspective = (innerHeight / VIEW) + 'px';                 // same viewpoint as the 3D camera
  /* reveal the page that was underneath the one being lifted */
  if (two) { if (dir > 0) { shownR = -1; setRight(next); } else { shownL = -1; setLeft(next); } }
  else if (dir > 0) { shownR = -1; setRight(next); }
  fl = { dir, next, two, p:0, goal:null, t:0, from:0, dur:.7 };
  turning = true; sfx('flip', .7); drawFlip(); perchHop();
}
function drawFlip() {
  /* p runs from 0 (not turned) to 1 (fully turned over) */
  const angle = fl.two ? -180 * fl.p * fl.dir : (fl.dir > 0 ? -180 * fl.p : -180 * (1 - fl.p));
  flipper.style.transform = `rotateY(${angle.toFixed(2)}deg)`;
  flipper.style.setProperty('--shade', Math.sin(Math.PI * fl.p).toFixed(3));   // the page darkens while it is edge-on
}
function glideTo(goal) { fl.goal = goal; fl.from = fl.p; fl.t = 0; fl.dur = REDUCED ? .01 : Math.max(.28, .8 * Math.abs(goal - fl.p)); }
function updateFlip(dt) {
  if (!fl) return;
  if (fl.goal !== null) {
    fl.t = Math.min(1, fl.t + dt / fl.dur);
    fl.p = fl.from + (fl.goal - fl.from) * smooth(fl.t);
    if (fl.t >= 1) {                                   // the turn is over: commit it or put the page back
      if (fl.goal === 1) spread = fl.next;
      flipper.style.display = 'none'; fl = null; turning = false;
      if (mode === 'open') showSpread();
      return;
    }
  }
  drawFlip();
}
function turn(dir) { if (canTurn(dir)) { beginFlip(dir); glideTo(1); } }
$('next').onclick = () => turn(1); $('prev').onclick = () => turn(-1);

for (const el of [pgL, pgR]) {
  el.addEventListener('pointerdown', e => {
    if (mode !== 'open' || turning || e.target.closest('a') || e.button > 0) return;
    hold = { x0:e.clientX, started:false, dir:0, width:pgR.getBoundingClientRect().width * (perView === 2 ? 1.6 : .85), side:el === pgL ? -1 : 1 };
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!hold) return;
    const dx = e.clientX - hold.x0;
    if (!hold.started) {
      if (Math.abs(dx) < 6) return;                                   // not a drag yet
      /* two pages: the right page turns forward, the left page turns back. One page: the drag direction decides. */
      hold.dir = perView === 2 ? hold.side : (dx < 0 ? 1 : -1);
      if (!canTurn(hold.dir)) { hold = null; return; }
      hold.started = true; beginFlip(hold.dir);
    }
    if (fl) fl.p = THREE.MathUtils.clamp(-dx * hold.dir / hold.width, 0, 1);   // how far the page has been pulled across
  });
  const letGo = e => {
    if (!hold) return;
    const h = hold; hold = null;
    if (!h.started) {                                                 // a click without dragging
      if (e.type === 'pointerup') { const r = pgR.getBoundingClientRect(); turn(perView === 2 ? h.side : (e.clientX < r.left + r.width * .33 ? -1 : 1)); }
      return;
    }
    if (fl) glideTo(fl.p > .33 ? 1 : 0);
  };
  el.addEventListener('pointerup', letGo); el.addEventListener('pointercancel', letGo);
}

/* Put the two HTML pages exactly on top of the 3D paper.
   This is worked out once from where the open book comes to rest (not from the
   moving book every frame), so the text sits perfectly still while you read. */
const ghost = new THREE.Object3D(); shelf.add(ghost);          // stand-in for the book at its resting pose
const refCam = new THREE.PerspectiveCamera(FOV, 1, .1, 100);   // the camera at its resting position
const corner = new THREE.Vector3();
function placePage(el, b, z0, z1) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const x = b.t / 2 + .01, half = b.h * .95 / 2;
  for (const [y, z] of [[half, z0], [-half, z0], [half, z1], [-half, z1]]) {
    ghost.localToWorld(corner.set(x, y, z)).project(refCam);
    const sx = (corner.x * .5 + .5) * innerWidth, sy = (-corner.y * .5 + .5) * innerHeight;
    x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
  }
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  el.style.left = x0 + 'px'; el.style.top = y0 + 'px'; el.style.width = (x1 - x0) + 'px'; el.style.height = (y1 - y0) + 'px';
  el.style.fontSize = Math.max(9, (y1 - y0) / (perView === 2 ? 40 : 46)).toFixed(1) + 'px';   // text scales with the size of the book on screen
}
function placePages() {
  if (opened < 0) return;
  const b = books[opened], hz = BOOK_D / 2 - COVER_T;
  ghost.position.copy(b.to); ghost.quaternion.copy(b.toQ); shelf.updateMatrixWorld(true);
  refCam.aspect = camera.aspect; refCam.updateProjectionMatrix(); refCam.position.copy(camHome); refCam.lookAt(look); refCam.updateMatrixWorld(true);
  placePage(pgR, b, hz - .03, hz - PAGE_W);
  if (perView === 2) placePage(pgL, b, hz + .03, hz + PAGE_W);
}

/* ---------------------------------------------------------------------
   7. LAYOUT FOR DIFFERENT SCREEN SHAPES
   Wide screens: lettering on the left, the room on the right, two-page spread.
   Upright screens: lettering on top, the box below and closer, one page at a time.
   --------------------------------------------------------------------- */
function layout() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  const wide = camera.aspect >= 1.25, box = room.crate.REST;
  perView = wide && w >= 900 ? 2 : 1;
  document.body.classList.toggle('two', perView === 2);   // lets the styles know whether one or two pages are showing
  room.setCompact(!wide);
  if (wide) {
    /* lettering on the left; the box, the character and the balcony fill the right */
    const dist = Math.max(18, 18.6 / (VIEW * camera.aspect));
    camHome.set(1.3, 4.5, dist); look.set(1.3, 2.9, 0);
  } else {
    /* Measure the free space between the bottom of the lettering and the top of the navigation,
       then pull the camera back just far enough for the box, books and character to fit inside it. */
    const top = $('intro').getBoundingClientRect().bottom + 18, bottom = $('nav').getBoundingClientRect().top - 12;
    const free = Math.max(140, bottom - top) / h;                          // free space as a share of the window height
    const dist = Math.max(9.6 / (VIEW * camera.aspect), (H + 1) / (VIEW * free));
    const centre = .5 - (top + bottom) / 2 / h;                            // how far above the middle of the window the free space sits
    look.set(box.x + 1.2, H / 2 - centre * VIEW * dist, 0); camHome.set(look.x, look.y + .9, dist + box.z);
  }
  shelf.updateMatrixWorld(true);
  if (mode === 'open') {   // window resized while reading: move the book to the new reading position at once
    const b = books[opened], pose = readingPose(b); b.to.copy(pose.pos); b.toQ.copy(pose.quat);
    b.g.position.copy(b.to); b.g.quaternion.copy(b.toQ); b.vel.set(0, 0, 0); camera.position.copy(camHome); showSpread();
    if (perched) { perchT = 1; perch.position.copy(perchSpot(perchSide)); }
  }
}
addEventListener('resize', layout); layout();
camera.position.copy(camHome); camera.lookAt(look);

/* ---------------------------------------------------------------------
   8. THE ANIMATION LOOP (runs every frame)
   --------------------------------------------------------------------- */
const clock = new THREE.Clock(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), wobQ = new THREE.Quaternion(), aimQ = new THREE.Quaternion(), wobE = new THREE.Euler();
function tick() {
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  idle += dt; hitCooldown -= dt;

  /* the delivery: the box rolls in (room.js), then each book rises out of it in turn */
  if (mode === 'intro') {
    intro += dt / 3.6;
    books.forEach((b, i) => { if (!b.risen && intro > .66 + i * .055) { b.risen = true; b.g.visible = true; b.stiff = 90; b.drag = 11; b.to.copy(b.home); sfx('slide', .4); } });
    if (intro > 1.15) { mode = 'shelf'; say(LINES.hello, 3.5); }
  }
  room.update(dt, t, intro, REDUCED);

  /* camera: drifts slightly with the pointer for depth; holds still while reading */
  const par = REDUCED || mode !== 'shelf' ? 0 : 1;
  camera.position.x = damp(camera.position.x, camHome.x + mouse.x * .8 * par, 3, dt);
  camera.position.y = damp(camera.position.y, camHome.y + mouse.y * .45 * par, 3, dt);
  camera.position.z = damp(camera.position.z, camHome.z, 3, dt);
  camera.lookAt(look);

  /* books: spring toward their targets (this is what gives them weight and a little overshoot) */
  for (const b of books) {
    if (REDUCED) { b.g.position.copy(b.to); b.g.quaternion.copy(b.toQ); b.hinge.rotation.y = b.cover; continue; }
    tmp.copy(b.to).sub(b.g.position).multiplyScalar(b.stiff).addScaledVector(b.vel, -b.drag);
    b.vel.addScaledVector(tmp, dt); b.g.position.addScaledVector(b.vel, dt);
    if (b.wob > .002) {                                             // rocking after a neighbour was pulled out
      b.wobT += dt; b.wob *= Math.exp(-3.2 * dt);
      wobQ.setFromEuler(wobE.set(0, 0, Math.sin(b.wobT * 19) * b.wob)); b.g.quaternion.slerp(aimQ.copy(b.toQ).multiply(wobQ), 1 - Math.exp(-30 * dt));
    } else b.g.quaternion.slerp(b.toQ, 1 - Math.exp(-(b.stiff > 100 ? 12 : 5.2) * dt));
    b.hinge.rotation.y = damp(b.hinge.rotation.y, b.cover, 4.6, dt);
  }
  updateFlip(dt); updatePerch(dt);
  leaves.forEach(l => updateLeaf(l, dt));

  /* spotlight on the book you point at, and the dark veil behind an open book */
  if (hovered >= 0) { spot.position.x = books[hovered].home.x + .6; spot.target.position.copy(books[hovered].g.position); }
  spot.intensity = damp(spot.intensity, hovered >= 0 && mode === 'shelf' ? 1.5 : 0, 8, dt);
  dim = damp(dim, dimTo, 4, dt); veil.material.opacity = dim; veil.visible = dim > .01;

  /* ball physics, and the ball bumping into the character */
  ball.update(dt);
  /* the ball bounces off the cardboard box */
  const bxHalf = W / 2 + .3 + BALL_R, bzHalf = D / 2 + .25 + BALL_R;
  if (!ball.dragging && Math.abs(ball.p.x) < bxHalf && Math.abs(ball.p.z) < bzHalf && ball.p.y < room.crate.LIFT + room.crate.BH + BALL_R) {
    if (bxHalf - Math.abs(ball.p.x) < bzHalf - Math.abs(ball.p.z)) { const side = Math.sign(ball.p.x) || 1; ball.p.x = side * bxHalf; if (ball.v.x * side < 0) ball.v.x *= -.6; }
    else { const side = Math.sign(ball.p.z) || 1; ball.p.z = side * bzHalf; if (ball.v.z * side < 0) ball.v.z *= -.6; }
  }
  const hp = hero.group.position, dx = ball.p.x - hp.x, dz = ball.p.z - hp.z, gap = Math.hypot(dx, dz), reach = hero.radius + BALL_R;
  if (!ball.dragging && !perched && gap < reach && ball.p.y - BALL_R < hero.height) {
    const nx = gap > .001 ? dx / gap : 1, nz = gap > .001 ? dz / gap : 0, into = ball.v.x * nx + ball.v.z * nz;
    ball.p.x = hp.x + nx * reach; ball.p.z = hp.z + nz * reach;                          // push the ball out of the character
    if (into < 0) { ball.v.x -= 1.5 * into * nx; ball.v.z -= 1.5 * into * nz; }          // and bounce it away
    if (into < -2 && hitCooldown < 0) { hero.flinch(); say(LINES.hit, 1.4); sfx('thud', 1); hitCooldown = 1; }
  }
  /* kick it back: after the visitor has thrown the ball and it has stopped, the character walks over and kicks it */
  if (played && !heroBusy && !ball.dragging && mode === 'shelf' && ball.onFloor() && ball.restTime > .7 && (ball.p.x > W / 2 + .8 || ball.p.z > D / 2 + 1.1)) {   // only when it can be reached without walking through the box
    heroBusy = true; played = false; hero.pointing = false;
    let side = ball.p.x > (ball.bounds.x0 + ball.bounds.x1) / 2 ? 1 : -1;                 // stand on the far side, kick toward the roomier side
    const standX = ball.p.x + side * (reach + .06);
    if (standX < ball.bounds.x0 || standX > ball.bounds.x1) side = -side;                 // never walk out of the room
    hero.walkTo(ball.p.x + side * (reach + .06), THREE.MathUtils.clamp(ball.p.z, -3, 2.8), () => {
      hero.kick();
      setTimeout(() => { ball.v.set(-side * (3.2 + Math.random() * 1.5), 5.2, (Math.random() - .5) * 1.2); say(LINES.kick, 1.6); sfx('thud', 1.2); }, 150);
      setTimeout(() => { hero.walkTo(HOME.x, HOME.z, () => { heroBusy = false; say(LINES.yourTurn, 2.2); }); }, 900);
    });
  }

  /* character: watches the ball while it moves, otherwise the pointer; waves hello; sits down after a while */
  const ballBusy = ball.dragging || ball.v.lengthSq() > .3;
  if (ballBusy) { hero.look.x = THREE.MathUtils.clamp(dx * .6, -1, 1); hero.look.y = THREE.MathUtils.clamp((ball.p.y - 1) * .5, -1, 1); }
  else if (hovered >= 0 && mode === 'shelf') {                       // look toward the book being pointed at
    hero.look.x = THREE.MathUtils.clamp((books[hovered].home.x - hp.x) * .3, -1, 1); hero.look.y = .25;
  } else { hero.look.x = mouse.x; hero.look.y = mouse.y; }
  hero.waving = !REDUCED && mode === 'intro';
  if (mode === 'shelf' && idle > 14 && !heroBusy && !ballBusy) hero.sitting = true;
  if (mode === 'shelf' && idle < 1 && hero.sitting) hero.sitting = false;
  hero.update(dt, t, REDUCED);

  /* speech bubble follows the character's head */
  bubbleTimer -= dt; if (bubbleTimer < 0 && bubble.textContent !== LINES.idle) bubble.textContent = LINES.idle;
  hero.group.getWorldPosition(tmp2); tmp2.y += perched ? .46 : 1.6; tmp2.project(camera);
  bubble.style.left = (tmp2.x * .5 + .5) * innerWidth + 'px'; bubble.style.top = (-tmp2.y * .5 + .5) * innerHeight + 'px';
  bubble.style.opacity = (mode === 'open' ? bubbleTimer > 0 : mode !== 'opening') ? 1 : 0;   // while reading, only when it has something to say

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
$('loading').classList.add('done'); setTimeout(() => { $('loading').style.display = 'none'; }, 700);

/* handles for testing from the browser console */
window.__site = { books, ball, hero, leaves, openBook, closeBook, turn, setHover, room, get mode() { return mode; } };
