/* eslint-disable */
import { createOptimizedPicture } from '../../scripts/aem.js';

let allItems = [];
let currentPage = 1;
const PAGE_SIZE = 6;

const fallbackProducts = [
  { title: 'Wireless Noise-Canceling Headphones', description: 'Premium audio hardware', category: 'electronics', image: '', path: '/products/headphones' },
  { title: 'Ergonomic Standing Desk', description: 'Workspace comfort furniture', category: 'furniture', image: '', path: '/products/desk' },
  { title: 'Mechanical RGB Keyboard', description: 'Tactile gaming keyboard', category: 'electronics', image: '', path: '/products/keyboard' },
  { title: 'Ultra-Wide 4K Monitor', description: 'High resolution display', category: 'electronics', image: '', path: '/products/monitor' },
  { title: 'Leather Office Chair', description: 'Luxury seating', category: 'furniture', image: '', path: '/products/chair' },
  { title: 'USB-C Fast Charger', description: 'Power supply kit', category: 'electronics', image: '', path: '/products/charger' },
];

function getURLState() {
  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get('q') || '',
    category: params.get('category') || 'all',
    page: parseInt(params.get('page') || '1', 10),
  };
}

function syncURLState(query, category, page) {
  const url = new URL(window.location.href);
  if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
  if (category !== 'all') url.searchParams.set('category', category); else url.searchParams.delete('category');
  if (page > 1) url.searchParams.set('page', page); else url.searchParams.delete('page');
  window.history.replaceState({}, '', url.toString());
}

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
      // CHANGED: Create an <a> element instead of a <div> so cards are fully clickable links
      const card = document.createElement('a');
      card.className = 'search-card';
      card.href = item.path || '#';

      if (item.image) {
        const pic = createOptimizedPicture(item.image, item.title, false, [{ width: '400' }]);
        card.appendChild(pic);
      }

      const title = document.createElement('h3');
      title.textContent = item.title;
      card.appendChild(title);

      if (item.category) {
        const badge = document.createElement('span');
        badge.className = 'category-badge';
        badge.textContent = item.category;
        card.appendChild(badge);
      }

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

function renderPagination(paginationContainer, totalItems, page, onPageChange) {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← Prev';
  prevBtn.disabled = page === 1;
  prevBtn.addEventListener('click', () => onPageChange(page - 1));
  paginationContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i += 1) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    if (i === page) pageBtn.classList.add('active');
    pageBtn.addEventListener('click', () => onPageChange(i));
    paginationContainer.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = page === totalPages;
  nextBtn.addEventListener('click', () => onPageChange(page + 1));
  paginationContainer.appendChild(nextBtn);
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

  const initialState = getURLState();
  currentPage = initialState.page;

  const categories = ['all', ...new Set(allItems.map((item) => item.category).filter(Boolean))];

  block.innerHTML = `
    <div class="search-controls">
      <input type="text" id="search-input" placeholder="Search products..." value="${initialState.query}" />
      <select id="category-select">
        ${categories.map((cat) => `<option value="${cat}" ${cat === initialState.category ? 'selected' : ''}>${cat.toUpperCase()}</option>`).join('')}
      </select>
    </div>
    <div class="search-results-grid"></div>
    <div class="pagination-controls"></div>
  `;

  const input = block.querySelector('#search-input');
  const select = block.querySelector('#category-select');
  const resultsGrid = block.querySelector('.search-results-grid');
  const paginationControls = block.querySelector('.pagination-controls');

  function updateUI() {
    const query = input.value.toLowerCase().trim();
    const selectedCat = select.value;

    const filtered = allItems.filter((item) => {
      const matchesQuery = !query ||
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query));

      const matchesCat = selectedCat === 'all' || item.category === selectedCat;
      return matchesQuery && matchesCat;
    });

    const maxPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    if (currentPage > maxPages) currentPage = 1;

    syncURLState(query, selectedCat, currentPage);
    renderResults(resultsGrid, filtered, currentPage);
    renderPagination(paginationControls, filtered.length, currentPage, (newPage) => {
      currentPage = newPage;
      updateUI();
    });
  }

  input.addEventListener('input', () => {
    currentPage = 1;
    updateUI();
  });

  select.addEventListener('change', () => {
    currentPage = 1;
    updateUI();
  });

  updateUI();
}