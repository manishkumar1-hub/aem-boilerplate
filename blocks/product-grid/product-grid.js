/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */

/**
 * Product Grid block for Google Docs document-based authoring.
 * Converts a four-column product table into responsive product cards.
 */
import './product-grid.css';

export default function decorate(block) {
  const rows = [...block.children];

  // Find the header row containing Image, Product, Details and Price.
  const headerIndex = rows.findIndex((row) => {
    const text = row.textContent.toLowerCase();
    return text.includes('image')
      && text.includes('product')
      && text.includes('details')
      && text.includes('price');
  });

  const productRows = rows.filter((row, index) => index !== headerIndex);

  const grid = document.createElement('div');
  grid.className = 'product-grid-container';

  productRows.forEach((row) => {
    const cells = [...row.children];

    // Expected columns: Image | Product | Details | Price
    if (cells.length < 4) return;

    const image = cells[0].querySelector('picture, img');
    const productName = cells[1].textContent.trim();
    const details = cells[2].textContent.trim();
    const priceText = cells[3].textContent.trim();

    const card = document.createElement('article');
    card.className = 'product-grid-card';

    if (image) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'product-grid-image';

      const imageElement = image.cloneNode(true);
      const img = imageElement.matches('img')
        ? imageElement
        : imageElement.querySelector('img');

      if (img) {
        img.loading = 'lazy';
        img.alt = img.alt || productName;
      }

      imageWrapper.append(imageElement);
      card.append(imageWrapper);
    }

    const content = document.createElement('div');
    content.className = 'product-grid-content';

    const title = document.createElement('h3');
    title.className = 'product-grid-title';
    title.textContent = productName;
    content.append(title);

    const description = document.createElement('p');
    description.className = 'product-grid-description';
    description.textContent = details;
    content.append(description);

    const price = document.createElement('p');
    price.className = 'product-grid-price';
    price.textContent = /^\d/.test(priceText) ? `₹${priceText}` : priceText;
    content.append(price);

    card.append(content);
    grid.append(card);
  });

  block.replaceChildren(grid);
}
