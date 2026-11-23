export default async function decorate(block) {
  // 1. Extract the API URL authored in the Google Doc by the content author
  const link = block.querySelector('a');
  const apiUrl = link ? link.href : block.textContent.trim();

  // 2. Clear the block and set up the UI containers
  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'product-store-wrapper';

  // Create Search Bar
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'product-search';
  searchInput.placeholder = 'Search products...';
  searchInput.setAttribute('aria-label', 'Search products');

  // Create Grid Container
  const grid = document.createElement('div');
  grid.className = 'product-grid';
  grid.innerHTML = '<div class="skeleton">Loading live products...</div>'; // Reserve space to prevent CLS

  container.append(searchInput, grid);
  block.append(container);

  let allProducts = []; // Store fetched products globally for the search filter

  // 3. Fetch the live data from the API
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    // dummyjson.com returns an object containing a 'products' array
    allProducts = data.products || [];

    // eslint-disable-next-line no-use-before-define
    renderProducts(allProducts, grid);
  } catch (error) {
    grid.innerHTML = '<p class="error-msg">Sorry, products are currently unavailable.</p>';
    return;
  }

  // 4. Implement Live Search Filtering
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = allProducts.filter((product) => product.title.toLowerCase().includes(query)
      || (product.category && product.category.toLowerCase().includes(query)));
    // eslint-disable-next-line no-use-before-define
    renderProducts(filtered, grid);
  });

  // 5. Add to Cart Logic using Event Delegation
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;

    const productId = Number(btn.dataset.id);
    const selectedProduct = allProducts.find((p) => p.id === productId);

    if (selectedProduct) {
      // eslint-disable-next-line no-use-before-define
      updateCart(selectedProduct);
    }
  });
}

/**
 * Helper: Renders the product array into the grid DOM
 */
function renderProducts(products, gridElement) {
  if (products.length === 0) {
    gridElement.innerHTML = '<p class="no-results">No products matched your search.</p>';
    return;
  }

  gridElement.textContent = ''; // Clear previous items

  const fragment = document.createDocumentFragment();
  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';

    // We use innerHTML here safely because the data comes from a trusted API
    card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" width="200" height="200" />
      <div class="product-info">
        <h3>${product.title}</h3>
        <p class="product-desc">${product.description.substring(0, 60)}...</p>
        <span class="product-price">$${product.price}</span>
        <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    `;
    fragment.append(card);
  });

  gridElement.append(fragment);
}

/**
 * Helper: Updates localStorage and dispatches event for the Header cart badge
 */
function updateCart(product) {
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('eds_cart')) || [];
  } catch (e) {
    cart = [];
  }

  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Map API fields to your cart structure
    cart.push({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.thumbnail,
      quantity: 1,
    });
  }

  localStorage.setItem('eds_cart', JSON.stringify(cart));
  // Alert the header to update the cart badge immediately
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
}
