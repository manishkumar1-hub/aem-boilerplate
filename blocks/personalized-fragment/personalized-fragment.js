/*
 * Personalized Fragment Block
 * ------------------------------------------------------------------
 * Swaps in a different fragment depending on the visitor's audience.
 *
 * UPDATED for EDS #23: now detects the visitor's COUNTRY first (via
 * geo.js), stores it on window.__edsCountry, THEN resolves the
 * audience - so geo audiences (in / us / eu) can match.
 *
 * Authoring table example:
 *   | Personalized Fragment |                          |
 *   | in                    | /fragments/offer-in      |
 *   | us                    | /fragments/offer-us      |
 *   | default               | /fragments/diwali-offer  |
 * ------------------------------------------------------------------
 */

// eslint-disable-next-line import/no-cycle
import { loadFragment } from '../fragment/fragment.js';
import { resolveAudience, rememberVisit } from '../../scripts/audiences.js';
import { getCountry } from '../../scripts/geo.js';

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

  // NEW: detect the visitor's country BEFORE resolving, so the geo
  // audiences (in / us / eu) have a value to check.
  window.__edsCountry = await getCountry();

  // Decide who this visitor is, then pick the fragment path.
  const audience = resolveAudience(order);
  const path = map[audience] || map.default;

  // Pre-hide + reserve space while we fetch (no flicker, no jump).
  block.classList.add('personalized-fragment--loading');
  block.dataset.audience = audience;
  block.dataset.country = window.__edsCountry; // handy for debugging

  block.textContent = '';

  if (path) {
    const fragment = await loadFragment(path);
    if (fragment) block.replaceChildren(...fragment.childNodes);
  }

  block.classList.remove('personalized-fragment--loading');
  rememberVisit();
}