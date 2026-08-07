/* eslint-disable */
/**
 * Product Details Block (PDP)
 * Emits global 'cart:add' event when items are added.
 */
export default async function decorate(block) {
  const skuElement = block.querySelector('div > div');
  const sku = skuElement ? skuElement.textContent.trim() : 'VA01-BLACK';

  block.innerHTML = '';

  const pdpWrapper = document.createElement('div');
  pdpWrapper.className = 'pdp-wrapper';
  pdpWrapper.innerHTML = `
    <div class="pdp-gallery">
      <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop" alt="Nike Air Max" />
    </div>
    <div class="pdp-info">
      <span class="pdp-badge">In Stock</span>
      <h1 class="pdp-title">Nike Air Max Enterprise Edition</h1>
      <p class="pdp-sku">SKU: <strong>${sku}</strong></p>
      
      <div class="pdp-price">
        <span class="currency">$</span><span class="amount">149.99</span>
      </div>
      
      <p class="pdp-description">
        Engineered specifically for high-performance Edge Delivery Services workflows. Features 100/100 Lighthouse score cushioning and zero-framework agility.
      </p>

      <div class="pdp-options">
        <label>Select Size (US):</label>
        <div class="size-options">
          <button class="size-btn">8</button>
          <button class="size-btn active">9</button>
          <button class="size-btn">10</button>
          <button class="size-btn">11</button>
        </div>
      </div>

      <div class="pdp-actions">
        <button id="add-to-cart-btn" class="pdp-cart-btn">Add to Cart 🛒</button>
      </div>
    </div>
  `;

  block.appendChild(pdpWrapper);

  // Size Selector Logic
  let selectedSize = '9';
  const sizeBtns = block.querySelectorAll('.size-btn');
  sizeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.textContent.trim();
    });
  });

  // Add to Cart + Event Bus Emission
  const cartBtn = block.querySelector('#add-to-cart-btn');
  cartBtn?.addEventListener('click', () => {
    // 1. Visual Button Feedback
    cartBtn.textContent = 'Added to Cart! ✓';
    cartBtn.style.backgroundColor = '#2e7d32';
    setTimeout(() => {
      cartBtn.textContent = 'Add to Cart 🛒';
      cartBtn.style.backgroundColor = '';
    }, 2000);

    // 2. Publish Event to Global Event Bus
    const event = new CustomEvent('cart:add', {
      detail: {
        sku,
        size: selectedSize,
        price: 149.99,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);
  });
}