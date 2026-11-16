/* =====================================================================
   COMIC ILLUSTRATIONS for the left-hand pages.
   Each drawing is a small SVG made of a few inked shapes on a halftone
   background with a starburst. content.js picks one with  art:'football'.

   To use your own picture instead, put the file in assets/ and write
   img:'assets/my-picture.png'  in that entry of content.js.

   To add a drawing: add a new line to ICONS. The canvas is 300 wide and
   400 tall, and the drawing should sit around the middle (150, 200).
   ===================================================================== */
const INK = '#1e1b18', CREAM = '#f3e6c4', MUSTARD = '#e0a526', ORANGE = '#ff5a1f', BURGUNDY = '#8a1c2e', TEAL = '#1f5f5b', WHITE = '#fffaf0';

const ICONS = {
  chip: `<rect x="95" y="145" width="110" height="110" rx="8" fill="${TEAL}"/><rect x="125" y="175" width="50" height="50" fill="${MUSTARD}"/>
    <path d="M110 145v-28M150 145v-28M190 145v-28M110 255v28M150 255v28M190 255v28M95 165h-28M95 200h-28M95 235h-28M205 165h28M205 200h28M205 235h28" fill="none"/>`,
  server: `<rect x="85" y="125" width="130" height="44" rx="6" fill="${CREAM}"/><rect x="85" y="178" width="130" height="44" rx="6" fill="${MUSTARD}"/><rect x="85" y="231" width="130" height="44" rx="6" fill="${CREAM}"/>
    <circle cx="108" cy="147" r="6" fill="${ORANGE}"/><circle cx="108" cy="200" r="6" fill="${TEAL}"/><circle cx="108" cy="253" r="6" fill="${ORANGE}"/><path d="M135 147h60M135 200h60M135 253h60" fill="none"/>`,
  cap: `<path d="M150 135 250 180 150 225 50 180Z" fill="${INK}"/><path d="M95 205v45q55 34 110 0v-45l-55 25Z" fill="${BURGUNDY}"/><path d="M250 180v62" fill="none"/><circle cx="250" cy="250" r="10" fill="${MUSTARD}"/>`,
  megaphone: `<path d="M80 180 190 130v140L80 220Z" fill="${ORANGE}"/><rect x="62" y="178" width="26" height="44" rx="6" fill="${CREAM}"/><path d="M105 226l12 44h26l-14-52" fill="${MUSTARD}"/><path d="M212 165l28-16M216 200h34M212 235l28 16" fill="none"/>`,
  football: `<path d="M60 150h180v120M60 150v120M60 190h180M60 230h180M105 150v120M150 150v120M195 150v120" fill="none" stroke-width="3"/>
    <circle cx="150" cy="215" r="52" fill="${WHITE}"/><path d="M150 190l24 17-9 28h-30l-9-28Z" fill="${INK}"/><path d="M150 190v-27M174 207l25-9M165 235l16 22M135 235l-16 22M126 207l-25-9" fill="none" stroke-width="4"/>`,
  stage: `<path d="M150 285c-46-58-62-84-62-110a62 62 0 0 1 124 0c0 26-16 52-62 110Z" fill="${ORANGE}"/><circle cx="150" cy="176" r="34" fill="${CREAM}"/>
    <path d="M140 192v-34l26-7v32" fill="none" stroke-width="5"/><circle cx="134" cy="193" r="7" fill="${INK}"/><circle cx="160" cy="184" r="7" fill="${INK}"/>`,
  ship: `<path d="M65 215h170l-22 46H88Z" fill="${BURGUNDY}"/><rect x="105" y="180" width="90" height="35" fill="${CREAM}"/><rect x="128" y="142" width="22" height="38" fill="${ORANGE}"/><rect x="158" y="152" width="18" height="28" fill="${ORANGE}"/>
    <path d="M50 280q18-14 36 0t36 0 36 0 36 0 36 0" fill="none"/><circle cx="122" cy="197" r="5" fill="${INK}"/><circle cx="150" cy="197" r="5" fill="${INK}"/><circle cx="178" cy="197" r="5" fill="${INK}"/>`,
  chat: `<path d="M65 130h120a14 14 0 0 1 14 14v52a14 14 0 0 1-14 14h-70l-28 26v-26H65a14 14 0 0 1-14-14v-52a14 14 0 0 1 14-14Z" fill="${WHITE}"/>
    <path d="M135 200h100a14 14 0 0 1 14 14v40a14 14 0 0 1-14 14h-12v24l-26-24h-62a14 14 0 0 1-14-14v-40a14 14 0 0 1 14-14Z" fill="${MUSTARD}"/>
    <circle cx="95" cy="170" r="7" fill="${INK}"/><circle cx="125" cy="170" r="7" fill="${INK}"/><circle cx="155" cy="170" r="7" fill="${INK}"/>`,
  heart: `<path d="M150 280C70 225 58 185 74 156c16-28 56-28 76 4 20-32 60-32 76-4 16 29 4 69-76 124Z" fill="${ORANGE}"/><path d="M55 210h50l14-30 22 58 20-44 12 16h72" fill="none" stroke="${WHITE}" stroke-width="7"/>`,
  globe: `<circle cx="150" cy="195" r="78" fill="${TEAL}"/><ellipse cx="150" cy="195" rx="34" ry="78" fill="none"/><path d="M72 195h156M84 155h132M84 235h132" fill="none"/>
    <circle cx="92" cy="278" r="14" fill="${MUSTARD}"/><circle cx="150" cy="292" r="14" fill="${ORANGE}"/><circle cx="208" cy="278" r="14" fill="${CREAM}"/>`,
  browser: `<rect x="60" y="130" width="180" height="140" rx="10" fill="${WHITE}"/><path d="M60 162h180" fill="none"/><circle cx="80" cy="146" r="5" fill="${ORANGE}"/><circle cx="98" cy="146" r="5" fill="${MUSTARD}"/><circle cx="116" cy="146" r="5" fill="${TEAL}"/>
    <rect x="78" y="180" width="60" height="70" fill="${MUSTARD}"/><path d="M152 186h70M152 208h70M152 230h46" fill="none"/>`,
  brackets: `<path d="M118 140 62 200l56 60M182 140l56 60-56 60M165 128l-30 144" fill="none" stroke-width="13"/>`,
  network: `<path d="M80 150 150 200 80 250M150 200h72M150 200 222 140M150 200l72 62M80 150v100" fill="none"/>
    <circle cx="80" cy="150" r="18" fill="${MUSTARD}"/><circle cx="80" cy="250" r="18" fill="${MUSTARD}"/><circle cx="150" cy="200" r="24" fill="${ORANGE}"/><circle cx="222" cy="140" r="16" fill="${CREAM}"/><circle cx="222" cy="200" r="16" fill="${CREAM}"/><circle cx="222" cy="262" r="16" fill="${CREAM}"/>`,
  wrench: `<path d="M150 118l14 22 26-4 4 26 22 14-14 22 14 22-22 14-4 26-26-4-14 22-14-22-26 4-4-26-22-14 14-22-14-22 22-14 4-26 26 4Z" fill="${MUSTARD}"/><circle cx="150" cy="200" r="30" fill="${CREAM}"/>`,
  team: `<circle cx="100" cy="170" r="26" fill="${MUSTARD}"/><path d="M58 262q0-50 42-50t42 50Z" fill="${MUSTARD}"/><circle cx="200" cy="170" r="26" fill="${TEAL}"/><path d="M158 262q0-50 42-50t42 50Z" fill="${TEAL}"/>
    <circle cx="150" cy="190" r="30" fill="${ORANGE}"/><path d="M100 290q0-58 50-58t50 58Z" fill="${ORANGE}"/>`,
  paper: `<path d="M85 115h95l40 40v140H85Z" fill="${WHITE}"/><path d="M180 115v40h40" fill="${CREAM}"/><path d="M105 180h90M105 205h90M105 230h60" fill="none"/>
    <circle cx="205" cy="268" r="26" fill="${ORANGE}"/><path d="M193 268l9 9 16-18" fill="none" stroke="${WHITE}"/>`,
  flask: `<path d="M128 120h44M136 120v56l-50 88a16 16 0 0 0 14 24h100a16 16 0 0 0 14-24l-50-88v-56" fill="${WHITE}"/><path d="M108 240h84l22 40a8 8 0 0 1-7 12H93a8 8 0 0 1-7-12Z" fill="${TEAL}"/>
    <circle cx="135" cy="262" r="8" fill="${CREAM}"/><circle cx="165" cy="250" r="5" fill="${CREAM}"/><circle cx="196" cy="140" r="9" fill="${MUSTARD}"/><circle cx="214" cy="112" r="6" fill="${MUSTARD}"/>`,
  envelope: `<rect x="60" y="140" width="180" height="120" rx="8" fill="${WHITE}"/><path d="M60 148l90 66 90-66" fill="none"/><path d="M60 252l62-52M240 252l-62-52" fill="none" stroke-width="4"/><circle cx="226" cy="140" r="20" fill="${ORANGE}"/>`,
  resume: `<path d="M85 115h130v170H85Z" fill="${WHITE}"/><circle cx="118" cy="152" r="16" fill="${MUSTARD}"/><path d="M146 144h52M146 162h36M103 196h94M103 218h94" fill="none"/>
    <circle cx="205" cy="268" r="28" fill="${TEAL}"/><path d="M205 252v30M192 270l13 13 13-13" fill="none" stroke="${WHITE}"/>`,
};

/* Build one illustration. `tint` is the book's cover colour, used for the background. */
export function illustration(key, tint, word) {
  const id = 'h' + Math.random().toString(36).slice(2, 8);
  const icon = ICONS[key] || ICONS.paper;
  /* points of the starburst behind the drawing */
  let burst = '';
  for (let i = 0; i < 28; i++) { const r = i % 2 ? 108 : 138, a = i * Math.PI / 14; burst += `${150 + Math.cos(a) * r},${200 + Math.sin(a) * r} `; }
  return `<svg viewBox="0 48 300 304" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Comic illustration">
    <defs><pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.2" fill="rgba(30,27,24,.22)"/><circle cx="9" cy="9" r="2.2" fill="rgba(30,27,24,.22)"/></pattern></defs>
    <rect x="-600" y="-600" width="1500" height="1600" fill="url(#${id})"/>
    <polygon points="${burst}" fill="${CREAM}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">${icon}</g>
    ${word ? `<text x="150" y="342" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="46" fill="${ORANGE}" stroke="${INK}" stroke-width="2" transform="rotate(-6 150 360)">${word}</text>` : ''}
  </svg>`;
}

/* A small version of a drawing, without the background, for use beside a heading. */
export function icon(key) {
  return `<svg class="ico" viewBox="40 100 220 200" aria-hidden="true"><g stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${ICONS[key] || ICONS.paper}</g></svg>`;
}
