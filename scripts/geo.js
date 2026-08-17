/*
 * geo.js
 * ------------------------------------------------------------------
 * Detects the visitor's COUNTRY in the browser.
 *
 * NOTE: this is a CLIENT-SIDE stand-in for real edge geo-routing.
 * A real setup detects the country at the CDN edge (before the page
 * loads). Here we detect it in the browser AFTER load, using a free
 * IP-geolocation service. Same concept, later + slower - which is
 * exactly WHY real projects push this to the edge.
 * ------------------------------------------------------------------
 */

let cached = null;

/**
 * Returns a two-letter country code like 'IN', 'US', or 'ZZ' (unknown).
 * Order of resolution:
 *   1) ?country=IN in the URL  -> test override (no network call)
 *   2) a value already looked up this browser session
 *   3) a live IP-geolocation lookup (free, no API key)
 */
export async function getCountry() {
  if (cached) return cached;

  // 1) Test override so you can demo any country without a VPN
  const forced = new URLSearchParams(window.location.search).get('country');
  if (forced) {
    cached = forced.toUpperCase();
    return cached;
  }

  // 2) Reuse this session's value if we already looked it up
  try {
    const saved = sessionStorage.getItem('eds-country');
    if (saved) {
      cached = saved;
      return cached;
    }
  } catch (e) { /* storage blocked - ignore */ }

  // 3) Ask a free IP-geolocation service (with a 2s safety timeout)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timer);
    const data = await resp.json();
    cached = (data && data.success && data.country_code)
      ? data.country_code.toUpperCase()
      : 'ZZ';
  } catch (e) {
    cached = 'ZZ'; // network failed / blocked -> unknown, fall back to default
  }

  try { sessionStorage.setItem('eds-country', cached); } catch (e) { /* ignore */ }
  return cached;
}
