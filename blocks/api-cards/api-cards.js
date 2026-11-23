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

/**
 * API Cards Block - Fetches products dynamically from an authored API URL
 * with live search filtering and cart state synchronization.
 * @param {Element} block The api-cards block element
 */
export default async function decorate(block) {
  // 1. Extract the API URL authored in the Google Doc table
  const authoredLink = block.querySelector('a');
  const apiUrl = authoredLink ? authoredLink.href : block.textContent.trim();

  if (!apiUrl) {
    block.textContent = 'Please configure an API URL in the API Cards table.';
    return;
  }

  // 2. Build Search Bar, Cart Summary Bar, and Grid Containers
  const toolbar = document.createElement('div');
  toolbar.className = 'api-cards-toolbar';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'product-search'; // Keeps Header & Footer #search= links working
  searchInput.placeholder = 'Search products by name or category...';
  searchInput.setAttribute('aria-label', 'Search products');

  const cartSummary = document.createElement('div');
  cartSummary.className = 'api-cards-cart-summary';
  cartSummary.setAttribute('aria-live', 'polite');

  toolbar.append(searchInput, cartSummary);

  const list = document.createElement('ul');
  list.className = 'api-cards-grid';

  const loading = document.createElement('li');
  loading.className = 'api-cards-status';
  loading.textContent = 'Loading live products...';
  list.append(loading);

  block.replaceChildren(toolbar, list);

  let allProducts = [];

  const updateCartSummary = () => {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartSummary.textContent = `Cart: ${totalItems} ${totalItems === 1 ? 'item' : 'items'} | Total: ${formatMoney(totalPrice)}`;
  };

  const renderProducts = (products) => {
    list.textContent = '';

    if (!products.length) {
      const empty = document.createElement('li');
      empty.className = 'api-cards-status';
      empty.textContent = 'No products matched your search.';
      list.append(empty);
      return;
    }

    const cart = getCart();
    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      const card = document.createElement('li');
      card.className = 'api-cards-item';

      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'api-cards-image';

      const image = document.createElement('img');
      image.src = product.thumbnail;
      image.alt = product.title;
      image.loading = 'lazy';
      image.width = 240;
      image.height = 180;
      imageWrapper.append(image);

      const content = document.createElement('div');
      content.className = 'api-cards-content';

      const title = document.createElement('h3');
      title.textContent = product.title;

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
      card.append(imageWrapper, content);
      fragment.append(card);
    });

    list.append(fragment);
  };

  const getFilteredProducts = () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return allProducts;
    return allProducts.filter((product) => (
      product.title.toLowerCase().includes(query)
      || (product.category && product.category.toLowerCase().includes(query))
      || (product.description && product.description.toLowerCase().includes(query))
    ));
  };

  // 3. Fetch Live Products from Authored Endpoint
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    allProducts = Array.isArray(data.products) ? data.products : [];

    updateCartSummary();
    renderProducts(getFilteredProducts());
  } catch (error) {
    list.textContent = '';
    const errMessage = document.createElement('li');
    errMessage.className = 'api-cards-status';
    errMessage.textContent = 'Unable to load products. Please try again later.';
    list.append(errMessage);
    return;
  }

  // 4. Live Search Filtering
  searchInput.addEventListener('input', () => {
    renderProducts(getFilteredProducts());
  });

  // 5. Event Delegation for Add / Increase / Decrease Cart Actions
  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const productId = Number(button.dataset.id);
    const { action } = button.dataset;
    const product = allProducts.find((item) => item.id === productId);
    if (!product) return;

    const cart = getCart();
    const index = cart.findIndex((item) => item.id === productId);

    if (action === 'add' || action === 'increase') {
      if (index > -1) {
        cart[index].quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.title,
          price: product.price,
          image: product.thumbnail,
          quantity: 1,
        });
      }
    } else if (action === 'decrease' && index > -1) {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      } else {
        cart.splice(index, 1);
      }
    }

    saveCart(cart);
    updateCartSummary();
    renderProducts(getFilteredProducts());
  });

  // 6. Stay Synced if User Removes Items from the Header Cart Drawer
  window.addEventListener('cart:updated', () => {
    updateCartSummary();
    renderProducts(getFilteredProducts());
  });
}
