/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */
export default function decorate(block) {
  // Step 1: Get product rows from the block
  const rows = [...block.children];
  const productRows = rows.slice(1);

  // Step 2: Create main container
  const container = document.createElement('div');
  container.className = 'product-store-container';

  // Step 3: Create search input
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search products...';
  search.className = 'product-search';
  search.setAttribute('aria-label', 'Search products');

  // Step 4: Create cart summary
  const cartSummary = document.createElement('div');
  cartSummary.className = 'cart-summary';

  // Step 5: Create product grid
  const productGrid = document.createElement('div');
  productGrid.className = 'product-grid';

  // Step 6: Add elements to container
  container.append(search, cartSummary, productGrid);

  // Step 7: Read product data from Google Docs
  const products = productRows
    .filter((row) => row.children.length >= 3)
    .map((row, index) => {
      const image = row.children[0].querySelector('img');

      const name = row.children[1].textContent.trim();

      const price = Number(
        row.children[2].textContent.trim().replace(/[^\d.]/g, ''),
      );

      return {
        id: index + 1,
        name,
        price,
        image: image ? image.src : '',
      };
    })
    .filter((product) => product.name && Number.isFinite(product.price));

  // Step 8: Create cart array
  const cart = [];

  // Step 9: Update cart summary
  function updateCart() {
    const totalItems = cart.length;

    const totalPrice = cart.reduce(
      (sum, product) => sum + product.price,
      0,
    );

    cartSummary.textContent = `Cart: ${totalItems} items | Total: ₹${totalPrice}`;
  }

  // Step 10: Add product to cart
  function addToCart(product) {
    cart.push(product);

    updateCart();
  }

  // Step 11: Display product cards
  function displayProducts(items) {
    productGrid.replaceChildren();

    if (items.length === 0) {
      const message = document.createElement('p');
      message.className = 'no-products';
      message.textContent = 'No products found.';
      productGrid.append(message);
      return;
    }

    items.forEach((product) => {
      const card = document.createElement('div');
      card.className = 'product-card';

      if (product.image) {
        const image = document.createElement('img');
        image.src = product.image;
        image.alt = product.name;
        image.loading = 'lazy';
        card.append(image);
      }

      const title = document.createElement('h3');
      title.textContent = product.name;

      const price = document.createElement('p');
      price.className = 'product-price';
      price.textContent = `₹${product.price.toLocaleString('en-IN')}`;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'add-to-cart';
      button.textContent = 'Add to Cart';

      button.addEventListener('click', () => {
        addToCart(product);
      });

      card.append(title, price, button);

      productGrid.append(card);
    });
  }

  // Step 12: Search functionality
  search.addEventListener('input', () => {
    const searchValue = search.value.trim().toLowerCase();

    // eslint-disable-next-line max-len
    const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchValue));

    displayProducts(filteredProducts);
  });

  // Step 13: Replace original block content
  block.replaceChildren(container);

  // Step 14: Display initial products and cart
  displayProducts(products);
  updateCart();
}
