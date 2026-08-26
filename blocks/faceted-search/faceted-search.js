/* eslint-disable */
import { createOptimizedPicture } from '../../scripts/aem.js';

let allItems = [];
const PAGE_SIZE = 6;

const fallbackProducts = [
  { title: 'Wireless Noise-Canceling Headphones', description: 'Premium audio hardware', category: 'electronics', image: '' },
  { title: 'Ergonomic Standing Desk', description: 'Workspace comfort furniture', category: 'furniture', image: '' },
  { title: 'Mechanical RGB Keyboard', description: 'Tactile gaming keyboard', category: 'electronics', image: '' },
  { title: 'Ultra-Wide 4K Monitor', description: 'High resolution display', category: 'electronics', image: '' },
];

function renderResults(container, items, page) {
  const start = (page - 1) * PAGE_SIZE;
  const paginatedItems = items.slice(start, start + PAGE_SIZE);
  const fragment = document.createDocumentFragment();

  if (paginatedItems.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'no-results';
    emptyMsg.textContent = 'No matching products found.';
    fragment.appendChild(emptyMsg);
  } else {
    paginatedItems.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'search-card';

      if (item.image) {
        const pic = createOptimizedPicture(item.image, item.title, false, [{ width: '400' }]);
        card.appendChild(pic);
      }

      const title = document.createElement('h3');
      title.textContent = item.title;
      card.appendChild(title);

      if (item.description) {
        const desc = document.createElement('p');
        desc.textContent = item.description;
        card.appendChild(desc);
      }

      fragment.appendChild(card);
    });
  }

  container.replaceChildren(fragment);
}

export default async function decorate(block) {
  try {
    const resp = await fetch('/query-index.json');
    if (resp.ok) {
      const json = await resp.json();
      allItems = json.data && json.data.length > 0 ? json.data : fallbackProducts;
    } else {
      allItems = fallbackProducts;
    }
  } catch {
    allItems = fallbackProducts;
  }

  block.innerHTML = `
    <div class="search-controls">
      <input type="text" id="search-input" placeholder="Search products..." />
    </div>
    <div class="search-results-grid"></div>
  `;

  const input = block.querySelector('#search-input');
  const resultsGrid = block.querySelector('.search-results-grid');

  renderResults(resultsGrid, allItems, 1);

  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allItems.filter((item) =>
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
    renderResults(resultsGrid, filtered, 1);
  });
}