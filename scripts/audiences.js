/*
 * audiences.js
 * ------------------------------------------------------------------
 * Central place to define WHO each visitor is.
 * Each audience is a name -> function returning true/false.
 * (Same shape as Adobe's official experimentation plugin.)
 *
 * UPDATED for EDS #23: added GEO audiences (in / us / eu) that read
 * the country resolved by geo.js and stored on window.__edsCountry.
 * ------------------------------------------------------------------
 */

export const AUDIENCES = {
  // --- Device ---
  mobile: () => window.innerWidth < 600,
  desktop: () => window.innerWidth >= 600,

  // --- Returning visitor ---
  returning: () => {
    try {
      return localStorage.getItem('eds-visited') === 'true';
    } catch (e) {
      return false;
    }
  },

  // --- GEO audiences (NEW) ---
  // These read the country that geo.js resolved (window.__edsCountry).
  // The block sets that value BEFORE calling resolveAudience().
  in: () => window.__edsCountry === 'IN',
  us: () => window.__edsCountry === 'US',
  eu: () => ['DE', 'FR', 'IT', 'ES', 'NL', 'IE', 'PL', 'SE', 'BE', 'AT', 'PT', 'FI', 'DK', 'GR']
    .includes(window.__edsCountry),

  // --- Time-boxed campaign ---
  diwali: () => {
    const now = Date.now();
    const start = new Date('2026-10-25T00:00:00').getTime();
    const end = new Date('2026-11-05T23:59:59').getTime();
    return now >= start && now <= end;
  },
};

export function rememberVisit() {
  try {
    localStorage.setItem('eds-visited', 'true');
  } catch (e) { /* ignore */ }
}

/**
 * Decide which audience applies.
 *   1) ?audience=<name> override (forces a variant directly)
 *   2) first matching audience in `order`
 *   3) 'default'
 */
export function resolveAudience(order) {
  const forced = new URLSearchParams(window.location.search).get('audience');
  if (forced) return forced.toLowerCase();

  const match = order.find((name) => AUDIENCES[name] && AUDIENCES[name]());
  return match || 'default';
}