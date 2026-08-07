/* eslint-disable */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

// 1. Persistence Helpers (localStorage)
function getStoredCart() {
  try {
    return JSON.parse(localStorage.getItem('eds_cart')) || [];
  } catch (e) {
    return [];
  }
}

function saveStoredCart(items) {
  localStorage.setItem('eds_cart', JSON.stringify(items));
}

/**
 * Sets up Mini-Cart Badge, LocalStorage Persistence, and Slide-Out Cart Drawer
 */
function setupMiniCart(nav) {
  let tools = nav.querySelector('.nav-tools');
  if (!tools) {
    tools = document.createElement('div');
    tools.className = 'nav-tools';
    nav.append(tools);
  }

  // Mini-Cart Header Badge
  const cartBadge = document.createElement('div');
  cartBadge.className = 'mini-cart-badge';
  cartBadge.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #111;
    color: #fff;
    padding: 6px 14px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    margin-left: auto;
    transition: transform 0.2s ease, background-color 0.2s ease;
    user-select: none;
  `;

  let cartItems = getStoredCart();

  const updateBadgeCount = () => {
    const totalCount = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);
    cartBadge.innerHTML = `🛒 Cart (<span id="cart-count">${totalCount}</span>)`;
  };

  updateBadgeCount();
  tools.append(cartBadge);

  // Create Slide-Out Cart Drawer Container
  const cartDrawer = document.createElement('div');
  cartDrawer.className = 'cart-drawer';
  cartDrawer.style.cssText = `
    position: fixed;
    top: 0;
    right: -400px;
    width: 350px;
    height: 100vh;
    background: #fff;
    box-shadow: -4px 0 20px rgba(0,0,0,0.15);
    z-index: 10000;
    transition: right 0.3s ease;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    color: #111;
    font-family: inherit;
  `;

  const renderDrawerContent = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0).toFixed(2);

    cartDrawer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:12px;">
        <h3 style="margin:0; font-size:1.2rem;">Your Cart 🛒</h3>
        <button id="close-drawer-btn" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
      </div>

      <div style="flex:1; overflow-y:auto; padding:15px 0;">
        ${cartItems.length === 0 ? '<p style="color:#666; text-align:center; margin-top:40px;">Your cart is empty.</p>' : ''}
        ${cartItems.map((item) => `
          <div style="display:flex; gap:12px; margin-bottom:15px; border-bottom:1px solid #f5f5f5; padding-bottom:10px; align-items:center;">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop" style="width:50px; height:50px; border-radius:6px; object-fit:cover;" />
            <div style="flex:1;">
              <div style="font-weight:700; font-size:0.9rem;">Nike Air Max</div>
              <div style="font-size:0.8rem; color:#666;">SKU: ${item.sku} | Size: ${item.size || '9'}</div>
              <div style="font-weight:700; color:#0066cc; font-size:0.9rem;">Qty: ${item.qty || 1} × $${item.price}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="border-top:1px solid #eee; padding-top:15px;">
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.1rem; margin-bottom:15px;">
          <span>Subtotal:</span>
          <span style="color:#0066cc;">$${subtotal}</span>
        </div>
        <button id="checkout-btn" ${cartItems.length === 0 ? 'disabled' : ''} style="
          width:100%;
          padding:12px;
          background:${cartItems.length === 0 ? '#ccc' : '#111'};
          color:#fff;
          border:none;
          border-radius:8px;
          font-weight:700;
          font-size:1rem;
          cursor:${cartItems.length === 0 ? 'not-allowed' : 'pointer'};
          transition: background-color 0.2s;
        ">Proceed to Checkout 💳</button>
      </div>
    `;

    // Close button click
    cartDrawer.querySelector('#close-drawer-btn')?.addEventListener('click', () => {
      cartDrawer.style.right = '-400px';
    });

    // Checkout button click
    cartDrawer.querySelector('#checkout-btn')?.addEventListener('click', () => {
      const btn = cartDrawer.querySelector('#checkout-btn');
      btn.textContent = 'Processing Checkout... ⏳';
      btn.style.backgroundColor = '#2e7d32';

      setTimeout(() => {
        alert('🎉 Order Placed Successfully! Order #EDS-98241 Confirmed.');
        cartItems = [];
        saveStoredCart(cartItems);
        updateBadgeCount();
        renderDrawerContent();
        cartDrawer.style.right = '-400px';
      }, 1500);
    });
  };

  document.body.appendChild(cartDrawer);

  // Toggle drawer when clicking mini-cart badge
  cartBadge.addEventListener('click', () => {
    renderDrawerContent();
    cartDrawer.style.right = cartDrawer.style.right === '0px' ? '-400px' : '0px';
  });

  // Listen for 'cart:add' event from Product Details Block
  window.addEventListener('cart:add', (e) => {
    const detail = e.detail || {};
    const newItem = {
      sku: detail.sku || 'VA01-BLACK',
      size: detail.size || '9',
      price: detail.price || 149.99,
      qty: 1,
    };

    const existingIndex = cartItems.findIndex((i) => i.sku === newItem.sku && i.size === newItem.size);
    if (existingIndex > -1) {
      cartItems[existingIndex].qty = (cartItems[existingIndex].qty || 1) + 1;
    } else {
      cartItems.push(newItem);
    }

    saveStoredCart(cartItems);
    updateBadgeCount();

    // Pulse badge highlight
    cartBadge.style.transform = 'scale(1.15)';
    cartBadge.style.backgroundColor = '#0066cc';
    setTimeout(() => {
      cartBadge.style.transform = 'scale(1)';
      cartBadge.style.backgroundColor = '#111';
    }, 300);
  });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand?.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // Setup Mini-Cart Badge + LocalStorage + Cart Drawer Overlay
  setupMiniCart(nav);

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}