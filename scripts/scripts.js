/* eslint-disable */
import {
  sampleRUM, // <-- [ADDED FOR RUM TELEMETRY]
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

// ==========================================================================
// 1. BOILERPLATE UTILITY FUNCTIONS (Pre-built by Adobe)
// ==========================================================================

/**
 * [BOILERPLATE - DEFAULT]
 * Moves all specified attributes from a source element to a target element.
 * @param {Element} from The element to copy attributes from
 * @param {Element} to The element to copy attributes to
 * @param {Array} attributes Optional array of attribute names
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * [BOILERPLATE - DEFAULT]
 * Moves authoring instrumentation attributes (Universal Editor/AEM tracking)
 * from one element to another.
 * @param {Element} from The element to copy attributes from
 * @param {Element} to The element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * [BOILERPLATE - DEFAULT]
 * Asynchronously loads custom fonts (styles/fonts.css) and sets a session flag.
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

// ==========================================================================
// 2. AUTO-BLOCKING MECHANICS (EDS #15)
// ==========================================================================

/**
 * [MANISH ADDED - CUSTOM AUTO-BLOCK]
 * Scans the DOM for standalone YouTube URLs in plain paragraphs and 
 * automatically wraps them into an 'embed' block container without requiring author tables.
 * @param {Element} main The main container element
 */
function buildEmbedBlocks(main) {
  main.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]').forEach((a) => {
    const parent = a.closest('p, h1, h2, h3, h4, h5, h6');
    if (parent) {
      // Changed 'embed' to 'embedd'
      const embedBlock = buildBlock('embedd', [[a.cloneNode(true)]]);
      parent.replaceWith(embedBlock);
    }
  });
}

/**
 * [MANISH ADDED - CUSTOM AUTO-BLOCK]
 * Scans the top paragraph for a fire emoji '🔥' and automatically converts
 * plain author text into a styled 'announcement' banner block.
 * @param {Element} main The main container element
 */
function buildAnnouncementBlock(main) {
  const firstParagraph = main.querySelector('p');
  if (firstParagraph && firstParagraph.textContent.includes('🔥')) {
    const section = firstParagraph.closest('div');
    const block = buildBlock('announcement', { elems: [firstParagraph] });
    section.prepend(block);
  }
}

/**
 * [BOILERPLATE STRUCTURE + MANISH CUSTOM AUTO-BLOCKS]
 * Orchestrates all automated block generation before sections are loaded.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // [MANISH ADDED] Auto-block standalone YouTube URLs into video embed components
    buildEmbedBlocks(main);

    // [MANISH ADDED] Auto-block top promo text starting with 🔥 into announcement banner
    buildAnnouncementBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

// ==========================================================================
// 3. DOM DECORATION HELPERS (Pre-built by Adobe)
// ==========================================================================

/**
 * [BOILERPLATE - DEFAULT]
 * Decorates formatted links (strong/em) and converts them into styled button components.
 * @param {HTMLElement} main The main container element
 */
export function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) { // primary button
      a.classList.add('primary');
      strong.replaceWith(a);
    } else { // secondary button
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * [BOILERPLATE - DEFAULT]
 * Master DOM decorator executed during initial render.
 * Executes icon rendering, auto-block generation, section partitioning, block decoration, and button styling.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);     // <-- Triggers Manish's Auto-Blockers here!
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

// ==========================================================================
// 4. SIDEKICK EXTENSION API INTEGRATION (EDS #8)
// ==========================================================================

/**
 * [SIDEKICK EXTENSION HANDLER]
 * Robust listener for custom Sidekick toolbar events with automatic visual feedback.
 */
window.addEventListener('custom:purge-cache', async (event) => {
  // Query sidekick element explicitly
  const sk = document.querySelector('aem-sidekick, helix-sidekick');
  const activePath = event.detail?.location?.pathname || window.location.pathname;

  // Helper function to guarantee notification display
  const notify = (message, level = 'info') => {
    if (sk && typeof sk.notify === 'function') {
      sk.notify(message, level);
    } else {
      // Fallback popup if Sidekick toast is unavailable
      alert(`[Sidekick ${level.toUpperCase()}]: ${message}`);
    }
  };

  notify(`Purging CDN edge cache for ${activePath}...`, 'info');

  try {
    const response = await fetch(`https://admin.hlx.page/cache/owner/repo/main${activePath}`, {
      method: 'POST',
    });

    if (response.ok) {
      notify('CDN Edge Cache purged successfully!', 'success');
    } else {
      notify('Failed to purge CDN cache.', 'error');
    }
  } catch {
    notify('Network error during cache purge.', 'error');
  }
});


// ==========================================================================
// 5. CORE PAGE LIFECYCLE PHASES (EDS #14 + RUM INTEGRATION)
// ==========================================================================

/**
 * [BOILERPLATE - EDS #14] PHASE 1: EAGER LOADING
 * Loads high-priority above-the-fold content to reach Largest Contentful Paint (LCP) immediately.
 * @param {Element} doc The document element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  // ----------------------------------------------------------------------
  // RUM CHECKPOINT 1: Top of Page & Initial Load Telemetry
  // Measures Time to First Byte (TTFB) and initial view initialization.
  // ----------------------------------------------------------------------
  sampleRUM('top');

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* If desktop or fonts already cached in sessionStorage, load fonts.css immediately */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * [BOILERPLATE - EDS #14] PHASE 2: LAZY LOADING
 * Loads secondary elements: Header, Footer, below-the-fold sections, lazy CSS, and fonts.
 * @param {Element} doc The document element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  // ----------------------------------------------------------------------
  // RUM CHECKPOINT 2: Core Web Vitals (CWV) Telemetry
  // Measures site-wide LCP, CLS, and INP metrics across all loaded blocks.
  // ----------------------------------------------------------------------
  sampleRUM('cwv');
}

/**
 * [BOILERPLATE - EDS #14] PHASE 3: DELAYED LOADING
 * Postpones non-critical tasks (analytics, chatbots, tracking scripts) by 3 seconds 
 * so they don't impact Core Web Vitals or user interaction.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => {
    // ----------------------------------------------------------------------
    // RUM CHECKPOINT 3: Delayed Session & Interaction Depth
    // Captures scroll depth and deferred engagement telemetry.
    // ----------------------------------------------------------------------
    sampleRUM('lazy');

    import('./delayed.js');
  }, 3000);
}

/**
 * [BOILERPLATE - DEFAULT]
 * Main Entry Point: Sequentially triggers Eager -> Lazy -> Delayed execution pipeline.
 */
async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// Start the page execution pipeline
loadPage();