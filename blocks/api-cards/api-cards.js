const CART_STORAGE_KEY = 'eds_cart';

function getCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    // Ignore storage quota errors in restricted browser modes
  }
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
}

function formatMoney(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function formatCategoryLabel(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * API Cards Block - Dynamic catalog with URL state sync, category pills,
 * sorting, <dialog> quick-view modal, cart panel, and chaos debug flags.
 * @param {Element} block The api-cards block element
 */
export default async function decorate(block) {
  const authoredLink = block.querySelector('a');
  const apiUrl = authoredLink ? authoredLink.href : block.textContent.trim();

  if (!apiUrl) {
    block.textContent = 'Please configure an API URL in the API Cards table.';
    return;
  }

  // Read initial URL state (?category=beauty&sort=price-asc&q=mascara&debug=slow)
  const initialParams = new URLSearchParams(window.location.search);
  const debugMode = initialParams.get('debug'); // 'slow' | 'error' | null
  let activeCategory = initialParams.get('category') || 'all';
  let activeSort = initialParams.get('sort') || 'default';

  // 1. Build Toolbar (Search + Sort + Cart Summary)
  const toolbar = document.createElement('div');
  toolbar.className = 'api-cards-toolbar';

  const controlsLeft = document.createElement('div');
  controlsLeft.className = 'api-cards-controls-left';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'product-search'; // Preserves Header & Footer #search= integration
  searchInput.placeholder = 'Search products by name or category...';
  searchInput.setAttribute('aria-label', 'Search products');

  if (initialParams.get('q')) {
    searchInput.value = initialParams.get('q');
  } else if (window.location.hash.startsWith('#search=')) {
    const rawTerm = decodeURIComponent(window.location.hash.replace('#search=', '')).replace(/-/g, ' ').trim();
    searchInput.value = rawTerm.toLowerCase() === 'all' ? '' : rawTerm;
  }

  const sortSelect = document.createElement('select');
  sortSelect.className = 'api-cards-sort';
  sortSelect.setAttribute('aria-label', 'Sort products');
  [
    { value: 'default', label: 'Sort: Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' },
  ].forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    if (value === activeSort) option.selected = true;
    sortSelect.append(option);
  });

  controlsLeft.append(searchInput, sortSelect);

  const cartSummary = document.createElement('div');
  cartSummary.className = 'api-cards-cart-summary';
  cartSummary.setAttribute('aria-live', 'polite');

  toolbar.append(controlsLeft, cartSummary);

  // 2. Dynamic Category Pills Bar (Populated from API response)
  const categoryBar = document.createElement('div');
  categoryBar.className = 'api-cards-categories';
  categoryBar.setAttribute('role', 'group');
  categoryBar.setAttribute('aria-label', 'Filter by product category');

  // 3. Dedicated Cart Items Panel
  const cartPanel = document.createElement('div');
  cartPanel.className = 'api-cards-cart-panel';

  // 4. Product Grid
  const list = document.createElement('ul');
  list.className = 'api-cards-grid';

  const loading = document.createElement('li');
  loading.className = 'api-cards-status';
  loading.textContent = debugMode === 'slow'
    ? 'Simulating slow network (2.5s)...'
    : 'Loading live products...';
  list.append(loading);

  // 5. Native HTML5 <dialog> Quick-View Modal
  const modal = document.createElement('dialog');
  modal.className = 'api-cards-modal';
  modal.setAttribute('aria-labelledby', 'quick-view-title');

  block.replaceChildren(toolbar, categoryBar, cartPanel, list, modal);

  let allProducts = [];

  const syncUrlState = () => {
    const url = new URL(window.location.href);
    const query = searchInput.value.trim();

    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');

    if (activeCategory && activeCategory !== 'all') url.searchParams.set('category', activeCategory);
    else url.searchParams.delete('category');

    if (activeSort && activeSort !== 'default') url.searchParams.set('sort', activeSort);
    else url.searchParams.delete('sort');

    window.history.replaceState({}, '', url);
  };

  const renderCategoryPills = () => {
    categoryBar.textContent = '';
    const categories = ['all', ...new Set(allProducts.map((p) => p.category).filter(Boolean))];

    categories.forEach((cat) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'api-cards-pill';
      pill.dataset.category = cat;
      const isSelected = activeCategory === cat;
      pill.classList.toggle('is-active', isSelected);
      pill.setAttribute('aria-pressed', String(isSelected));
      pill.textContent = cat === 'all' ? 'All Products' : formatCategoryLabel(cat);
      categoryBar.append(pill);
    });
  };

  const renderCartSection = () => {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartSummary.textContent = `Cart: ${totalItems} ${totalItems === 1 ? 'item' : 'items'} | Total: ${formatMoney(totalPrice)}`;

    cartPanel.textContent = '';

    if (!cart.length) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'api-cards-cart-empty';
      emptyMsg.textContent = 'Your cart is empty.';
      cartPanel.append(emptyMsg);
      return;
    }

    const panelHeader = document.createElement('div');
    panelHeader.className = 'api-cards-cart-header';

    const panelTitle = document.createElement('h3');
    panelTitle.textContent = `Selected Cart Items (${totalItems})`;

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'api-cards-clear-btn';
    clearBtn.dataset.action = 'clear';
    clearBtn.textContent = 'Clear Cart';

    panelHeader.append(panelTitle, clearBtn);

    const cartList = document.createElement('ul');
    cartList.className = 'api-cards-cart-list';

    cart.forEach((item) => {
      const row = document.createElement('li');
      row.className = 'api-cards-cart-row';

      const info = document.createElement('div');
      info.className = 'api-cards-cart-item-info';

      if (item.image) {
        const thumb = document.createElement('img');
        thumb.src = item.image;
        thumb.alt = item.name;
        thumb.width = 44;
        thumb.height = 44;
        info.append(thumb);
      }

      const textWrap = document.createElement('div');
      const itemName = document.createElement('strong');
      itemName.textContent = item.name;

      const itemMeta = document.createElement('span');
      itemMeta.textContent = `${formatMoney(item.price)} × ${item.quantity} = ${formatMoney(item.price * item.quantity)}`;

      textWrap.append(itemName, itemMeta);
      info.append(textWrap);

      const rowActions = document.createElement('div');
      rowActions.className = 'api-cards-cart-row-actions';

      const decBtn = document.createElement('button');
      decBtn.type = 'button';
      decBtn.className = 'api-cards-mini-btn';
      decBtn.dataset.action = 'decrease';
      decBtn.dataset.id = String(item.id);
      decBtn.setAttribute('aria-label', `Decrease quantity of ${item.name}`);
      decBtn.textContent = '−';

      const qtyBadge = document.createElement('span');
      qtyBadge.className = 'api-cards-mini-qty';
      qtyBadge.textContent = String(item.quantity);

      const incBtn = document.createElement('button');
      incBtn.type = 'button';
      incBtn.className = 'api-cards-mini-btn';
      incBtn.dataset.action = 'increase';
      incBtn.dataset.id = String(item.id);
      incBtn.setAttribute('aria-label', `Increase quantity of ${item.name}`);
      incBtn.textContent = '+';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'api-cards-remove-btn';
      removeBtn.dataset.action = 'remove';
      removeBtn.dataset.id = String(item.id);
      removeBtn.textContent = 'Remove';

      rowActions.append(decBtn, qtyBadge, incBtn, removeBtn);
      row.append(info, rowActions);
      cartList.append(row);
    });

    cartPanel.append(panelHeader, cartList);
  };

  const getFilteredAndSortedProducts = () => {
    const query = searchInput.value.toLowerCase().trim();

    const filtered = allProducts.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesQuery = !query
        || product.title.toLowerCase().includes(query)
        || (product.category && product.category.toLowerCase().includes(query))
        || (product.description && product.description.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });

    const sorted = [...filtered];
    if (activeSort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (activeSort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (activeSort === 'rating-desc') sorted.sort((a, b) => b.rating - a.rating);

    return sorted;
  };

  const renderProducts = (products) => {
    list.textContent = '';

    if (!products.length) {
      const empty = document.createElement('li');
      empty.className = 'api-cards-status';
      empty.textContent = 'No products matched your filter criteria.';
      list.append(empty);
      return;
    }

    const cart = getCart();
    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      const card = document.createElement('li');
      card.className = 'api-cards-item';

      const imageBtn = document.createElement('button');
      imageBtn.type = 'button';
      imageBtn.className = 'api-cards-image-btn';
      imageBtn.dataset.action = 'quick-view';
      imageBtn.dataset.id = String(product.id);
      imageBtn.setAttribute('aria-label', `Quick view ${product.title}`);

      const image = document.createElement('img');
      image.src = product.thumbnail;
      image.alt = product.title;
      image.loading = 'lazy';
      image.width = 240;
      image.height = 180;
      imageBtn.append(image);

      const content = document.createElement('div');
      content.className = 'api-cards-content';

      const title = document.createElement('h3');
      const titleBtn = document.createElement('button');
      titleBtn.type = 'button';
      titleBtn.className = 'api-cards-title-btn';
      titleBtn.dataset.action = 'quick-view';
      titleBtn.dataset.id = String(product.id);
      titleBtn.textContent = product.title;
      title.append(titleBtn);

      const description = document.createElement('p');
      description.className = 'api-cards-desc';
      description.textContent = product.description;

      const metaRow = document.createElement('div');
      metaRow.className = 'api-cards-meta';

      const price = document.createElement('span');
      price.className = 'api-cards-price';
      price.textContent = formatMoney(product.price);

      const rating = document.createElement('span');
      rating.className = 'api-cards-rating';
      rating.textContent = `★ ${product.rating} / 5`;

      metaRow.append(price, rating);

      const actions = document.createElement('div');
      actions.className = 'api-cards-actions';

      const existingItem = cart.find((item) => item.id === product.id);
      if (existingItem) {
        const qtyControl = document.createElement('div');
        qtyControl.className = 'api-cards-qty';

        const decBtn = document.createElement('button');
        decBtn.type = 'button';
        decBtn.className = 'api-cards-qty-btn';
        decBtn.dataset.action = 'decrease';
        decBtn.dataset.id = String(product.id);
        decBtn.setAttribute('aria-label', `Decrease quantity of ${product.title}`);
        decBtn.textContent = '−';

        const qtyText = document.createElement('span');
        qtyText.className = 'api-cards-qty-value';
        qtyText.textContent = String(existingItem.quantity);

        const incBtn = document.createElement('button');
        incBtn.type = 'button';
        incBtn.className = 'api-cards-qty-btn';
        incBtn.dataset.action = 'increase';
        incBtn.dataset.id = String(product.id);
        incBtn.setAttribute('aria-label', `Increase quantity of ${product.title}`);
        incBtn.textContent = '+';

        qtyControl.append(decBtn, qtyText, incBtn);
        actions.append(qtyControl);
      } else {
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'api-cards-add-btn';
        addBtn.dataset.action = 'add';
        addBtn.dataset.id = String(product.id);
        addBtn.textContent = 'Add to Cart';
        actions.append(addBtn);
      }

      content.append(title, description, metaRow, actions);
      card.append(imageBtn, content);
      fragment.append(card);
    });

    list.append(fragment);
  };

  const openQuickView = (product) => {
    modal.textContent = '';

    const modalCard = document.createElement('div');
    modalCard.className = 'api-cards-modal-inner';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'api-cards-modal-close';
    closeBtn.setAttribute('aria-label', 'Close product details');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => modal.close());

    const body = document.createElement('div');
    body.className = 'api-cards-modal-body';

    const img = document.createElement('img');
    img.src = product.images?.[0] || product.thumbnail;
    img.alt = product.title;
    img.width = 280;
    img.height = 280;

    const details = document.createElement('div');
    details.className = 'api-cards-modal-details';

    const badge = document.createElement('span');
    badge.className = 'api-cards-modal-badge';
    badge.textContent = `${formatCategoryLabel(product.category || 'product')} • ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}`;

    const heading = document.createElement('h2');
    heading.id = 'quick-view-title';
    heading.textContent = product.title;

    const desc = document.createElement('p');
    desc.textContent = product.description;

    const priceLine = document.createElement('div');
    priceLine.className = 'api-cards-modal-price';
    priceLine.textContent = `${formatMoney(product.price)} `;
    if (product.discountPercentage) {
      const discount = document.createElement('span');
      discount.textContent = `(${Math.round(product.discountPercentage)}% OFF)`;
      priceLine.append(discount);
    }

    const modalAddBtn = document.createElement('button');
    modalAddBtn.type = 'button';
    modalAddBtn.className = 'api-cards-add-btn';
    modalAddBtn.dataset.action = 'add';
    modalAddBtn.dataset.id = String(product.id);
    modalAddBtn.textContent = 'Add to Cart';

    details.append(badge, heading, desc, priceLine, modalAddBtn);
    body.append(img, details);
    modalCard.append(closeBtn, body);
    modal.append(modalCard);

    modal.showModal();
  };

  // Close modal when clicking the backdrop outside modalCard
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });

  // 6. Fetch Live Products (with Performance Marks & Chaos Debug Support)
  try {
    performance.mark('api-cards-fetch-start');

    if (debugMode === 'error') {
      throw new Error('Simulated 500 API outage via ?debug=error');
    }

    if (debugMode === 'slow') {
      await new Promise((resolve) => { setTimeout(resolve, 2500); });
    }

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    allProducts = Array.isArray(data.products) ? data.products : [];

    performance.mark('api-cards-fetch-end');
    performance.measure('API Cards Network Fetch', 'api-cards-fetch-start', 'api-cards-fetch-end');

    renderCategoryPills();
    renderCartSection();
    renderProducts(getFilteredAndSortedProducts());
  } catch (error) {
    list.textContent = '';
    const errMessage = document.createElement('li');
    errMessage.className = 'api-cards-status api-cards-error';
    errMessage.textContent = `Unable to load products (${error.message}). Remove ?debug=error or try again.`;
    list.append(errMessage);
    return;
  }

  // 7. Search, Category Pill & Sort Listeners
  searchInput.addEventListener('input', () => {
    syncUrlState();
    renderProducts(getFilteredAndSortedProducts());
  });

  sortSelect.addEventListener('change', () => {
    activeSort = sortSelect.value;
    syncUrlState();
    renderProducts(getFilteredAndSortedProducts());
  });

  categoryBar.addEventListener('click', (event) => {
    const pill = event.target.closest('button[data-category]');
    if (!pill) return;

    activeCategory = pill.dataset.category;
    syncUrlState();
    renderCategoryPills();
    renderProducts(getFilteredAndSortedProducts());
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#search=')) {
      const rawTerm = decodeURIComponent(window.location.hash.replace('#search=', '')).replace(/-/g, ' ').trim();
      searchInput.value = rawTerm.toLowerCase() === 'all' ? '' : rawTerm;
      activeCategory = 'all';
      syncUrlState();
      renderCategoryPills();
      renderProducts(getFilteredAndSortedProducts());
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // 8. Single Delegated Listener for Cart Actions & Quick-View Modal
  block.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const { action } = button.dataset;

    if (action === 'clear') {
      saveCart([]);
      renderCartSection();
      renderProducts(getFilteredAndSortedProducts());
      return;
    }

    const productId = Number(button.dataset.id);
    const product = allProducts.find((item) => item.id === productId);

    if (action === 'quick-view') {
      if (product) openQuickView(product);
      return;
    }

    const cart = getCart();
    const index = cart.findIndex((item) => item.id === productId);

    if (action === 'remove') {
      if (index > -1) cart.splice(index, 1);
    } else if (action === 'add' || action === 'increase') {
      if (index > -1) {
        cart[index].quantity += 1;
      } else if (product) {
        cart.push({
          id: product.id,
          name: product.title,
          price: product.price,
          image: product.thumbnail,
          quantity: 1,
        });
      }
      if (modal.open && button.closest('.api-cards-modal')) {
        button.textContent = 'Added to Cart ✓';
        setTimeout(() => modal.close(), 500);
      }
    } else if (action === 'decrease' && index > -1) {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      } else {
        cart.splice(index, 1);
      }
    }

    saveCart(cart);
    renderCartSection();
    renderProducts(getFilteredAndSortedProducts());
  });

  window.addEventListener('cart:updated', () => {
    renderCartSection();
    renderProducts(getFilteredAndSortedProducts());
  });
}
