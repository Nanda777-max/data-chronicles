/* =====================================================================
   PAGE LAYOUT COMPONENTS
   This file decides how a page LOOKS. What a page SAYS lives in content.js.

   A page in content.js is a list of "blocks". Each block is one of the
   building pieces below (a headline, a timeline, a row of big numbers, a
   comic panel ...). renderPage() turns that list into the HTML for one
   page of the open book.

   To add a new kind of block: add a function to BLOCKS, then use its name
   in content.js, e.g.  { myblock: ... }.
   ===================================================================== */
import { illustration, icon } from './art.js';

const esc = s => String(s);
const todo = text => `<span class="todo">${text}</span>`;

const BLOCKS = {
  /* large comic headline. { title:'...', small:true (optional) } */
  title: (v, o) => `<h2 class="t ${o.small ? 'sm' : ''}">${esc(v)}</h2>`,
  /* one or two sentences under a headline */
  lead: v => `<p class="lead">${v}</p>`,
  /* normal paragraph */
  text: v => `<p class="tx">${v}</p>`,
  /* speech bubble said by you, with your photo */
  bubble: v => `<div class="say"><img src="assets/profile.jpg" alt=""><p>${v}</p></div>`,
  /* narrator caption box (yellow strip) */
  caption: v => `<p class="narr">${v}</p>`,
  /* row of big numbers: [{ n:'63/104', l:'live matches called' }] */
  stats: v => `<div class="stats n${v.length}">${v.map(s => `<div><b>${s.n}</b><span>${s.l}</span></div>`).join('')}</div>`,
  /* one huge statement, for the single most important fact on a page */
  callout: v => `<p class="callout">${v}</p>`,
  /* vertical timeline: [{ when:'2019', what:'...', note:'...' }] */
  timeline: v => `<ol class="tl">${v.map(e => `<li><span class="when">${e.when}</span><div><b>${e.what}</b>${e.note ? `<span>${e.note}</span>` : ''}</div></li>`).join('')}</ol>`,
  /* comic panels side by side or stacked: [{ cap:'Problem', h:'...', p:'...' }]. Add cols:2 for two columns. */
  panels: (v, o) => `<div class="panels ${o.cols === 2 ? 'c2' : ''}">${v.map(p => `<section class="panel ${p.dark ? 'dark' : ''}"><span class="cap">${p.cap}</span>${p.h ? `<h3>${p.h}</h3>` : ''}<p>${p.p}</p></section>`).join('')}</div>`,
  /* an illustration from art.js. { art:'football', sfx:'GOAL!' } */
  art: (v, o, b) => `<figure class="fig grow" style="--tint:${b.tint}">${illustration(v, b.tint, o.sfx)}</figure>`,
  /* your own picture. If the file is not there yet, a labelled placeholder is shown instead. */
  img: (v, o) => `<figure class="fig shot grow"><img src="${v}" alt="${o.alt || ''}" onerror="this.parentNode.classList.add('missing');this.remove()"><figcaption>${o.alt || 'Picture'}: add ${v}</figcaption></figure>`,
  /* how something works, as boxes joined by arrows: ['Data', 'Features', 'Model'] */
  flow: v => `<div class="flow">${v.map(s => `<span>${s}</span>`).join('<i>➜</i>')}</div>`,
  /* technology tags */
  chips: (v, o) => `<div class="chips">${o.label ? `<em>${o.label}</em>` : ''}${v.map(t => `<span>${t}</span>`).join('')}</div>`,
  /* link buttons: [{ label:'GitHub', url:'...' }]. A link without a url shows as a placeholder. */
  links: v => `<div class="links">${v.map(l => l.url ? `<a href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>` : todo(l.label + ': add link')).join('')}</div>`,
  /* bullet points */
  list: v => `<ul class="ls">${v.map(t => `<li>${t}</li>`).join('')}</ul>`,
  /* job heading: { role, company, dates, place } */
  job: v => `<div class="job"><span class="dates">${v.dates}</span><h3>${v.role}</h3><p>${v.company}${v.place ? ' · ' + v.place : ''}</p></div>`,
  /* skill groups with a small drawing each: [{ icon:'brackets', name:'Programming', items:[...] }] */
  groups: v => `<div class="groups">${v.map(g => `<section><header>${icon(g.icon)}<h3>${g.name}</h3></header><div class="chips">${g.items.map(t => `<span>${t}</span>`).join('')}</div>${g.note ? `<p>${g.note}</p>` : ''}</section>`).join('')}</div>`,
  /* research card with a status stamp: { status:'Completed', h:'...', p:'...' } */
  paper: v => `<section class="paper"><span class="stamp ${v.status === 'Completed' ? 'done' : ''}">${v.status}</span><h3>${v.h}</h3><p>${v.p}</p></section>`,
  /* a clearly marked gap for you to fill in later */
  todo: v => `<p class="gap">${todo('To fill in')} ${v}</p>`,
};

/* Build one page.
   page  = { kicker:'File 01', layout:'...', blocks:[ ... ] } from content.js
   b     = the book it belongs to       n = page number (starts at 0)      total = pages in this book
   nav   = { prev:true/false, next:true/false }: whether there is a page to turn to on that side */
export function renderPage(page, b, n, total, nav) {
  if (!page) return '';
  const body = page.blocks.map(block => {
    const key = Object.keys(block).find(k => BLOCKS[k]);
    return key ? BLOCKS[key](block[key], block, b) : '';
  }).join('');
  return `<div class="sheet ${b.theme} ${page.layout || ''}">
    <header class="ph"><span>${b.title}</span><span>${page.kicker || 'Issue #0' + (b.i + 1)}</span></header>
    <div class="pb">${body}</div>
    <footer class="pf">
      <span class="hint ${nav.prev ? '' : 'off'}">◀ back</span>
      <span class="no">${n + 1} / ${total}</span>
      <span class="hint ${nav.next ? '' : 'off'}">drag or click ▶</span>
    </footer>
    ${nav.next ? '<span class="curl" aria-hidden="true"></span>' : ''}
  </div>`;
}
