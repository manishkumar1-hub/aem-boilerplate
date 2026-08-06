/* eslint-disable */
/**
 * Product Details Block (PDP)
 * Renders complete product gallery, pricing, variant options, and Add to Cart action.
 */
export default async function decorate(block) {
  // Extract SKU from Google Doc table or fallback
  const skuElement = block.querySelector('div > div');
  const sku = skuElement ? skuElement.textContent.trim() : 'VA01-BLACK';

  // Clear raw table markup
  block.innerHTML = '';

  // Create PDP UI Container
  const pdpWrapper = document.createElement('div');
  pdpWrapper.className = 'pdp-wrapper';
  pdpWrapper.innerHTML = `
    <div class="pdp-gallery">
      <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop" alt="Nike Air Max Enterprise Edition" />
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

      <!-- Variant Selectors -->
      <div class="pdp-options">
        <label>Select Size (US):</label>
        <div class="size-options">
          <button class="size-btn">8</button>
          <button class="size-btn active">9</button>
          <button class="size-btn">10</button>
          <button class="size-btn">11</button>
        </div>
      </div>

      <!-- Actions -->
      <div class="pdp-actions">
        <button id="add-to-cart-btn" class="pdp-cart-btn">Add to Cart 🛒</button>
      </div>
    </div>
  `;

  block.appendChild(pdpWrapper);

  // Interactive Size Selection
  const sizeBtns = block.querySelectorAll('.size-btn');
  sizeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Interactive Add to Cart Behavior
  const cartBtn = block.querySelector('#add-to-cart-btn');
  cartBtn?.addEventListener('click', () => {
    cartBtn.textContent = 'Added to Cart! ✓';
    cartBtn.style.backgroundColor = '#2e7d32';
    setTimeout(() => {
      cartBtn.textContent = 'Add to Cart 🛒';
      cartBtn.style.backgroundColor = '';
    }, 2000);
  });
}
