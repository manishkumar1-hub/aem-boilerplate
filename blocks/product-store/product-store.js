/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */

/**
 * Product Store Block
 *
 * Features:
 * 1. Display Products
 * 2. Search Products
 * 3. Add to Cart
 * 4. Remove from Cart
 * 5. Increase Quantity
 * 6. Decrease Quantity
 * 7. Calculate Cart Total
 * 8. Save Cart using localStorage
 */

// Main EDS block decoration function
export default function decorate(block) {
  // STEP 1: Get product rows from Google Docs
  const rows = [...block.children];
  const productRows = rows.slice(1);

  // STEP 2: Create main container
  const container = document.createElement('div');
  container.className = 'product-store-container';

  // STEP 3: Create search input
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search products...';
  search.className = 'product-search';
  search.setAttribute('aria-label', 'Search products');

  // STEP 4: Create cart summary
  const cartSummary = document.createElement('div');
  cartSummary.className = 'cart-summary';

  // STEP 5: Create cart items container
  const cartItems = document.createElement('div');
  cartItems.className = 'cart-items';

  // STEP 6: Create product grid
  const productGrid = document.createElement('div');
  productGrid.className = 'product-grid';

  // STEP 7: Add elements to main container
  container.append(
    search,
    cartSummary,
    cartItems,
    productGrid,
  );

  // STEP 8: Read product data from Google Docs
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
    .filter((product) => (
      product.name
      && Number.isFinite(product.price)
      && product.price >= 0
    ));

  // STEP 9: Retrieve previously saved cart
  let cart = [];

  try {
    const savedCart = JSON.parse(
      localStorage.getItem('eds_cart'),
    );

    if (Array.isArray(savedCart)) {
      cart = savedCart.filter((item) => (
        item
        && Number.isFinite(item.id)
        && typeof item.name === 'string'
        && Number.isFinite(item.price)
        && Number.isFinite(item.quantity)
        && item.quantity > 0
      ));
    }
  } catch (error) {
    cart = [];
  }

  // STEP 10: Update cart and display cart items
  function updateCart() {
    // Save the latest cart in browser storage
    localStorage.setItem(
      'eds_cart',
      JSON.stringify(cart),
    );

    // Calculate total quantity
    const totalItems = cart.reduce(
      (sum, product) => sum + product.quantity,
      0,
    );

    // Calculate total price
    const totalPrice = cart.reduce(
      (sum, product) => (
        sum + (product.price * product.quantity)
      ),
      0,
    );

    // Update cart summary
    cartSummary.textContent = (
      `Cart: ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`
      + ` | Total: ₹${totalPrice.toLocaleString('en-IN')}`
    );

    // Clear previous cart display
    cartItems.replaceChildren();

    // Check whether cart is empty
    if (cart.length === 0) {
      const message = document.createElement('p');

      message.textContent = 'Your cart is empty.';

      cartItems.append(message);
    } else {
      // Display each cart product
      cart.forEach((product) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        // Product name
        const name = document.createElement('span');
        name.textContent = product.name;

        // Product subtotal
        const price = document.createElement('span');

        price.textContent = (
          `₹${(product.price * product.quantity).toLocaleString('en-IN')}`
        );

        // Quantity controls container
        const quantityControls = document.createElement('div');
        quantityControls.className = 'quantity-controls';

        // Decrease quantity button
        const decreaseButton = document.createElement('button');

        decreaseButton.textContent = '−';
        decreaseButton.className = 'quantity-button';
        decreaseButton.type = 'button';
        decreaseButton.setAttribute('aria-label', `Decrease ${product.name} quantity`);

        decreaseButton.addEventListener('click', () => {
          if (product.quantity > 1) {
            product.quantity -= 1;
          } else {
            cart.splice(cart.indexOf(product), 1);
          }

          updateCart();
        });

        // Display current quantity
        const quantity = document.createElement('span');

        quantity.className = 'quantity-value';
        quantity.textContent = product.quantity;

        // Increase quantity button
        const increaseButton = document.createElement('button');

        increaseButton.textContent = '+';
        increaseButton.className = 'quantity-button';
        increaseButton.type = 'button';
        increaseButton.setAttribute('aria-label', `Increase ${product.name} quantity`);

        increaseButton.addEventListener('click', () => {
          product.quantity += 1;

          updateCart();
        });

        // Add quantity controls
        quantityControls.append(
          decreaseButton,
          quantity,
          increaseButton,
        );

        // Remove product button
        const removeButton = document.createElement('button');

        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-button';
        removeButton.type = 'button';

        removeButton.addEventListener('click', () => {
          const index = cart.indexOf(product);

          if (index !== -1) {
            cart.splice(index, 1);
          }

          updateCart();
        });

        // Add elements to cart item
        cartItem.append(
          name,
          price,
          quantityControls,
          removeButton,
        );

        cartItems.append(cartItem);
      });
    }

    // Notify other blocks that the cart has changed
    window.dispatchEvent(
      new CustomEvent('cart:updated', {
        detail: { cart },
      }),
    );
  }

  // STEP 11: Add product to cart
  function addToCart(product) {
    // Check whether product already exists
    const existingProduct = cart.find(
      (item) => item.id === product.id,
    );

    if (existingProduct) {
      // Increase existing product quantity
      existingProduct.quantity += 1;
    } else {
      // Add new product with quantity 1
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    updateCart();
  }

  // STEP 12: Display product cards
  function displayProducts(items) {
    productGrid.replaceChildren();

    // Check whether products are available
    if (items.length === 0) {
      const message = document.createElement('p');

      message.className = 'no-products';
      message.textContent = 'No products found.';

      productGrid.append(message);

      return;
    }

    // Create individual product cards
    items.forEach((product) => {
      const card = document.createElement('div');
      card.className = 'product-card';

      // Product image
      if (product.image) {
        const image = document.createElement('img');

        image.src = product.image;
        image.alt = product.name;
        image.loading = 'lazy';

        card.append(image);
      }

      // Product name
      const title = document.createElement('h3');
      title.textContent = product.name;

      // Product price
      const price = document.createElement('p');

      price.className = 'product-price';
      price.textContent = (
        `₹${product.price.toLocaleString('en-IN')}`
      );

      // Add to Cart button
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'add-to-cart';
      button.textContent = 'Add to Cart';

      button.addEventListener('click', () => {
        addToCart(product);
      });

      // Add card elements
      card.append(title, price, button);

      productGrid.append(card);
    });
  }

  // STEP 13: Search functionality
  search.addEventListener('input', () => {
    const searchValue = search.value.trim().toLowerCase();

    const filteredProducts = products.filter((product) => (
      product.name.toLowerCase().includes(searchValue)
    ));

    displayProducts(filteredProducts);
  });

  // STEP 14: Replace original block content
  block.replaceChildren(container);

  // STEP 15: Display initial products and restore cart
  displayProducts(products);

  updateCart();
}
