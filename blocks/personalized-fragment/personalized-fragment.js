/*
 * Personalized Fragment Block
 * ------------------------------------------------------------------
 * Swaps in a DIFFERENT fragment depending on the visitor's audience.
 * Built directly on top of the standard Fragment block's
 * loadFragment() -> we do NOT duplicate the loading logic.
 *
 * Authoring (a table in your Google Doc / Word page):
 *
 *   +-----------------------+-----------------------------------+
 *   | Personalized Fragment |                                   |
 *   +-----------------------+-----------------------------------+
 *   | default               | /fragments/diwali-offer           |
 *   | mobile                | /fragments/diwali-offer-mobile    |
 *   | returning             | /fragments/diwali-offer-returning |
 *   +-----------------------+-----------------------------------+
 *
 *   - Column 1 = audience name (must match a key in audiences.js,
 *     or the special word `default`).
 *   - Column 2 = the fragment path (a link to the fragment doc).
 *   - The `default` row is REQUIRED and is used when nothing matches.
 *   - Rows are tested TOP-DOWN, so put the most specific audience
 *     highest.
 * ------------------------------------------------------------------
 */

// Reuse the loader from the standard Fragment block you already have.
// eslint-disable-next-line import/no-cycle
import { loadFragment } from '../fragment/fragment.js';
import { resolveAudience, rememberVisit } from '../../scripts/audiences.js';

/**
 * Read the authored table into { map, order }.
 *   map   = { default: '/path', mobile: '/path', ... }
 *   order = ['mobile', 'returning', ...]  (everything except default)
 */
function readRows(block) {
  const map = {};
  const order = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const audience = cells[0].textContent.trim().toLowerCase();
    const link = cells[1].querySelector('a');
    const path = link ? link.getAttribute('href') : cells[1].textContent.trim();
    if (!audience || !path) return;
    map[audience] = path;
    if (audience !== 'default') order.push(audience);
  });
  return { map, order };
}

export default async function decorate(block) {
  const { map, order } = readRows(block);

  // Decide who this visitor is, THEN pick the fragment.
  // We resolve BEFORE loading, so we never render the wrong variant
  // first -> no flicker / FOOC.
  const audience = resolveAudience(order);
  const path = map[audience] || map.default;

  // Pre-hide + reserve space while we fetch, so the page does not jump.
  block.classList.add('personalized-fragment--loading');
  block.dataset.audience = audience; // handy for debugging in DevTools

  block.textContent = ''; // remove the authored table markup

  if (path) {
    const fragment = await loadFragment(path);
    if (fragment) block.replaceChildren(...fragment.childNodes);
  }

  // Reveal the resolved fragment.
  block.classList.remove('personalized-fragment--loading');

  // Remember this visit so `returning` can match next time.
  rememberVisit();
}
