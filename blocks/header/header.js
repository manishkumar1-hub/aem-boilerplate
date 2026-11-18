/* eslint-disable */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

const FALLBACK_ICONS = {
  search: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>`,
  cart: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>`,
  chevron: `<svg class="nav-chevron" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="5 7.5 10 12.5 15 7.5"/>
  </svg>`,
};

function getStoredCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('eds_cart'));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function filterProductStore(rawTerm) {
  const normalized = rawTerm.replace(/-/g, ' ').trim();
  const query = normalized.toLowerCase() === 'all' ? '' : normalized;
  const searchInput = document.querySelector('.product-search');
  if (searchInput) {
    searchInput.value = query;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function closeAllMenus(nav) {
  if (!nav) return;
  toggleAllNavSections(nav.querySelector('.nav-sections'), false);
  const profile = nav.querySelector('.profile-dropdown');
  if (profile) profile.setAttribute('aria-expanded', 'false');
  if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
    nav.setAttribute('aria-expanded', 'false');
    document.body.style.overflowY = '';
    const btn = nav.querySelector('.nav-hamburger button');
    if (btn) btn.setAttribute('aria-label', 'Open navigation');
  }
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    closeAllMenus(nav);
    const drawer = document.querySelector('.cart-drawer[aria-hidden="false"]');
    if (drawer) drawer.setAttribute('aria-hidden', 'true');
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    closeAllMenus(nav);
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  if (focused.classList.contains('nav-drop') && (e.code === 'Enter' || e.code === 'Space')) {
    e.preventDefault();
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(focused.closest('.nav-sections'), false);
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');

  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, false);
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

function decorateBrand(navBrand) {
  const existingLink = navBrand.querySelector('a');
  const edsIcon = navBrand.querySelector('.icon');

  const link = document.createElement('a');
  link.href = existingLink ? existingLink.getAttribute('href') : '/';
  link.className = 'brand-link';

  if (edsIcon) link.append(edsIcon);

  const brandText = document.createElement('span');
  brandText.className = 'brand-text';
  brandText.innerHTML = 'Shop<span>Sphere</span>';
  link.append(brandText);

  navBrand.replaceChildren(link);
}

function decorateSections(navSections, nav) {
  const topItems = navSections.querySelectorAll(':scope .default-content-wrapper > ul > li');

  topItems.forEach((navSection) => {
    const subList = navSection.querySelector(':scope > ul');
    if (!subList) return;

    navSection.classList.add('nav-drop');
    navSection.setAttribute('aria-expanded', 'false');

    const labelText = [...navSection.childNodes]
      .filter((node) => node !== subList)
      .map((node) => node.textContent.trim())
      .join(' ')
      .trim();

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-drop-trigger';
    trigger.innerHTML = `<span>${labelText}</span>${FALLBACK_ICONS.chevron}`;

    [...navSection.childNodes].forEach((node) => {
      if (node !== subList) node.remove();
    });
    navSection.prepend(trigger);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = navSection.getAttribute('aria-expanded') === 'true';
      toggleAllNavSections(navSections, false);
      navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });

    // Make every dropdown item clickable (whether <a> or plain <li> text)
    subList.querySelectorAll('li').forEach((subItem) => {
      const subLink = subItem.querySelector('a');
      const itemLabel = subItem.textContent.trim();

      if (!subLink) {
        const anchor = document.createElement('a');
        anchor.href = `#search=${itemLabel.toLowerCase().replace(/\s+/g, '-')}`;
        anchor.textContent = itemLabel;
        subItem.replaceChildren(anchor);
      }

      const activeLink = subItem.querySelector('a');
      activeLink.addEventListener('click', (e) => {
        const href = activeLink.getAttribute('href') || '';
        if (href.startsWith('#search=')) {
          e.preventDefault();
          const rawTerm = decodeURIComponent(href.replace('#search=', ''));
          closeAllMenus(nav);
          filterProductStore(rawTerm);
        }
      });
    });
  });
}

function attachIconWithFallback(button, edsIcon, fallbackSvg) {
  if (edsIcon) {
    const img = edsIcon.querySelector('img');
    if (img) {
      img.addEventListener('error', () => {
        edsIcon.remove();
        button.insertAdjacentHTML('afterbegin', fallbackSvg);
      });
    }
    button.append(edsIcon);
  } else {
    button.insertAdjacentHTML('afterbegin', fallbackSvg);
  }
}

function buildCartDrawer() {
  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Shopping Cart Drawer');

  const renderDrawer = (items) => {
    const subtotal = items.reduce(
      (sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)),
      0,
    );

    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <h3>Your Cart</h3>
        <button type="button" class="cart-drawer-close" aria-label="Close cart">×</button>
      </div>
      <div class="cart-drawer-body">
        ${items.length === 0
    ? '<p class="cart-drawer-empty">Your cart is empty.</p>'
    : items.map((item) => `
            <div class="cart-drawer-item">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : ''}
              <div class="cart-drawer-info">
                <div class="cart-drawer-name">${item.name}</div>
                <div class="cart-drawer-meta">Qty: ${item.quantity} × ₹${Number(item.price).toLocaleString('en-IN')}</div>
              </div>
              <div class="cart-drawer-subtotal">₹${(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}</div>
            </div>
          `).join('')}
      </div>
      <div class="cart-drawer-footer">
        <div class="cart-drawer-total">
          <span>Subtotal</span>
          <span>₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        <button type="button" class="cart-drawer-cta">View & Manage Cart</button>
      </div>
    `;

    drawer.querySelector('.cart-drawer-close')?.addEventListener('click', () => {
      drawer.setAttribute('aria-hidden', 'true');
    });

    drawer.querySelector('.cart-drawer-cta')?.addEventListener('click', () => {
      drawer.setAttribute('aria-hidden', 'true');
      const cartSummary = document.querySelector('.cart-summary');
      if (cartSummary) {
        cartSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  renderDrawer(getStoredCart());
  document.body.append(drawer);

  return {
    open() {
      renderDrawer(getStoredCart());
      drawer.setAttribute('aria-hidden', 'false');
    },
    sync(items) {
      renderDrawer(items);
    },
  };
}

function decorateTools(navTools, nav) {
  const searchIcon = navTools.querySelector('.icon-search');
  const cartIcon = navTools.querySelector('.icon-cart');

  const profileItem = navTools.querySelector('li:last-child');
  const profileSubList = profileItem ? profileItem.querySelector('ul') : null;
  const userName = profileItem
    ? [...profileItem.childNodes]
      .filter((n) => n !== profileSubList && !n.classList?.contains('icon'))
      .map((n) => n.textContent.trim())
      .join('')
      .trim() || 'Manish'
    : 'Manish';

  const toolsGroup = document.createElement('div');
  toolsGroup.className = 'header-tools-group';

  // 1. Search Button
  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.className = 'tool-icon-btn';
  searchBtn.setAttribute('aria-label', 'Search products');
  attachIconWithFallback(searchBtn, searchIcon, FALLBACK_ICONS.search);
  searchBtn.addEventListener('click', () => {
    closeAllMenus(nav);
    const searchInput = document.querySelector('.product-search');
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchInput.focus();
    }
  });

  // 2. Cart Button + Live Badge + Slide-Out Drawer
  const cartDrawer = buildCartDrawer();
  const cartBtn = document.createElement('button');
  cartBtn.type = 'button';
  cartBtn.className = 'tool-icon-btn cart-tool-btn';
  cartBtn.setAttribute('aria-label', 'Open shopping cart');
  attachIconWithFallback(cartBtn, cartIcon, FALLBACK_ICONS.cart);

  const cartBadge = document.createElement('span');
  cartBadge.className = 'cart-badge';

  const updateCartUI = (items) => {
    const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    cartBadge.textContent = count;
    cartBadge.hidden = count === 0;
    cartDrawer.sync(items);
  };

  updateCartUI(getStoredCart());
  cartBtn.append(cartBadge);

  cartBtn.addEventListener('click', () => {
    closeAllMenus(nav);
    cartDrawer.open();
  });

  window.addEventListener('cart:updated', (e) => {
    const updatedItems = Array.isArray(e.detail?.cart) ? e.detail.cart : getStoredCart();
    updateCartUI(updatedItems);
    cartBtn.classList.add('is-bumping');
    setTimeout(() => cartBtn.classList.remove('is-bumping'), 300);
  });

  // 3. Vertical Divider
  const divider = document.createElement('span');
  divider.className = 'tools-divider';
  divider.setAttribute('aria-hidden', 'true');

  // 4. User Profile Dropdown
  const profileDropdown = document.createElement('div');
  profileDropdown.className = 'profile-dropdown';
  profileDropdown.setAttribute('aria-expanded', 'false');

  const profileTrigger = document.createElement('button');
  profileTrigger.type = 'button';
  profileTrigger.className = 'profile-trigger';
  profileTrigger.innerHTML = `
    <span class="profile-avatar">${userName.charAt(0).toUpperCase()}</span>
    <span class="profile-name">${userName}</span>
    ${FALLBACK_ICONS.chevron}
  `;

  profileTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = profileDropdown.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(nav.querySelector('.nav-sections'), false);
    profileDropdown.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });

  profileDropdown.append(profileTrigger);
  if (profileSubList) {
    profileSubList.className = 'profile-menu-list';
    profileDropdown.append(profileSubList);
  }

  toolsGroup.append(searchBtn, cartBtn, divider, profileDropdown);
  navTools.replaceChildren(toolsGroup);
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
  const navSections = nav.querySelector('.nav-sections');
  const navTools = nav.querySelector('.nav-tools');

  if (navBrand) decorateBrand(navBrand);
  if (navSections) decorateSections(navSections, nav);
  if (navTools) decorateTools(navTools, nav);

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
    <span class="nav-hamburger-icon"></span>
  </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllMenus(nav);
  });

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}