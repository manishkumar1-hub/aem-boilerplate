/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */
/**
 * Product Grid block - decorates product cards.
 */
import './product-grid.css';

export default function decorate(block) {
  const rows = [...block.children];

  block.classList.add('product-grid');

  rows.forEach((row) => {
    const cells = [...row.children];

    if (!cells.length) return;

    row.classList.add('product-grid-card');

    // Configure product image.
    const image = row.querySelector('picture img, img');

    if (image) {
      image.loading = 'lazy';
      image.alt = image.alt || 'Product image';
    }

    // Style product headings.
    const headings = row.querySelectorAll('h1, h2, h3, h4');

    headings.forEach((heading) => {
      heading.classList.add('product-grid-title');
    });

    // Style product links.
    const links = [...row.querySelectorAll('a')];

    links.forEach((link) => {
      link.classList.add('product-grid-link');
    });

    // Identify and style the price cell.
    const price = cells.find((cell) => {
      const text = cell.textContent.trim();
      return /^(₹|\$)/.test(text);
    });

    if (price) {
      price.classList.add('product-grid-price');
    }
  });
}
