export default async function decorate(block) {
  const apiUrl = 'https://dummyjson.com/products/1';

  // Reserve DOM footprint to prevent CLS
  block.innerHTML = '<div class="skeleton">Loading product...</div>';

  try {
    const response = await fetch(apiUrl);
    const product = await response.json();

    // 🔍 DEV STEP: Inspect 'product' payload object in DevTools Scope panel
    // eslint-disable-next-line no-debugger

    // Render API payload into DOM
    block.innerHTML = `
      <div class="product-card-container">
        <img src="${product.thumbnail}" alt="${product.title}" width="150" />
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <span class="price">$${product.price}</span>
      </div>
    `;
  } catch (error) {
    block.innerHTML = '<p class="error-msg">Product unavailable.</p>';
  }
}
