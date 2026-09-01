import { fetchPlaceholders } from '../../scripts/aem.js';

function getLocale() {
  const seg = window.location.pathname.split('/')[1];
  return ['en', 'fr', 'de'].includes(seg) ? seg : 'en';
}

export default async function decorate(block) {
  const ph = await fetchPlaceholders(`/${getLocale()}`);
  block.textContent = '';
  const title = document.createElement('h2');
  title.textContent = ph.ctaTitle ?? 'Special offer';
  const button = document.createElement('a');
  button.className = 'button';
  button.href = '#';
  button.textContent = ph.addToCart ?? 'Add to cart';
  block.append(title, button);
}