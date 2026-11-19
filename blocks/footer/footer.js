import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function applyCategoryFilter(rawTerm) {
  const searchInput = document.querySelector('.product-search');
  if (!searchInput) return false;

  const normalized = decodeURIComponent(rawTerm).replace(/-/g, ' ').trim();
  searchInput.value = normalized.toLowerCase() === 'all' ? '' : normalized;
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return true;
}

function decorateFooterBrand(footer) {
  const firstCol = footer.querySelector('.columns > div > div:first-child');
  if (!firstCol) return;

  const brandParagraph = firstCol.querySelector('p:first-child');
  if (!brandParagraph) return;

  const edsIcon = brandParagraph.querySelector('.icon');
  brandParagraph.className = 'footer-brand';
  brandParagraph.textContent = '';

  if (edsIcon) {
    brandParagraph.append(edsIcon);
  }

  const brandText = document.createElement('span');
  brandText.className = 'footer-brand-text';

  const primaryWord = document.createTextNode('Shop');
  const accentWord = document.createElement('span');
  accentWord.textContent = 'Sphere';

  brandText.append(primaryWord, accentWord);
  brandParagraph.append(brandText);
}

function wireCategoryLinks(footer) {
  footer.querySelectorAll('a[href*="#search="]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hashPart = link.getAttribute('href').split('#search=')[1];
      if (!hashPart) return;

      if (applyCategoryFilter(hashPart)) {
        event.preventDefault();
      }
    });
  });

  // Apply filter automatically if user arrived from another page via #search=...
  if (window.location.hash.startsWith('#search=')) {
    const initialTerm = window.location.hash.replace('#search=', '');
    setTimeout(() => applyCategoryFilter(initialTerm), 150);
  }
}

/**
 * Loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  decorateFooterBrand(footer);
  wireCategoryLinks(footer);

  block.append(footer);
}
