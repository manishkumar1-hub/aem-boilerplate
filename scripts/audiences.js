/*
 * audiences.js
 * ------------------------------------------------------------------
 * Central place to define WHO each visitor is.
 * Each audience is a name -> function that returns true / false for
 * the CURRENT visitor. This mirrors the pattern used by Adobe's
 * official `aem-experimentation` plugin (const AUDIENCES = { ... }).
 *
 * Everything here resolves in the browser and stores no personal
 * data, so it is safe to use without cookie consent for a demo.
 * ------------------------------------------------------------------
 */

export const AUDIENCES = {
  // --- Device (resolved from the viewport width) ---
  mobile: () => window.innerWidth < 600,
  desktop: () => window.innerWidth >= 600,

  // --- Returning visitor (simple flag in localStorage) ---
  returning: () => {
    try {
      return localStorage.getItem('eds-visited') === 'true';
    } catch (e) {
      return false;
    }
  },

  // --- Rough "in India" guess from the browser timezone ---
  // (No IP lookup needed. Good enough to demo geo-style targeting.)
  india: () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';
    } catch (e) {
      return false;
    }
  },

  // --- Time-boxed campaign window for the Diwali offer ---
  // Adjust the dates each year. Outside this window the audience
  // simply does not match, so the default fragment shows instead.
  diwali: () => {
    const now = Date.now();
    const start = new Date('2026-10-25T00:00:00').getTime();
    const end = new Date('2026-11-05T23:59:59').getTime();
    return now >= start && now <= end;
  },

  // Define your own custom audiences here as needed.
};

/**
 * Mark this visitor as "seen" so the `returning` audience matches
 * on their next visit.
 */
export function rememberVisit() {
  try {
    localStorage.setItem('eds-visited', 'true');
  } catch (e) { /* storage blocked - ignore */ }
}

/**
 * Decide which audience applies to the current visitor.
 * Priority:
 *   1) ?audience=<name> in the URL  -> used for PREVIEWING a variant
 *   2) the first audience in `order` whose function returns true
 *   3) 'default'
 *
 * @param {string[]} order Audience names to test, MOST SPECIFIC FIRST.
 * @returns {string} the resolved audience name, or 'default'
 */
export function resolveAudience(order) {
  // 1) Manual override for previewing, e.g. ?audience=mobile
  const forced = new URLSearchParams(window.location.search).get('audience');
  if (forced) return forced.toLowerCase();

  // 2) First matching audience wins (that's why order matters)
  const match = order.find((name) => AUDIENCES[name] && AUDIENCES[name]());
  return match || 'default';
}