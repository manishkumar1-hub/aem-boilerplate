/* eslint-disable import/no-unresolved */
import { render as renderPDP } from '@dropins/storefront-pdp/containers/ProductDetails.js';

export default async function decorate(block) {
  // Extract SKU from table or fallback
  const skuElement = block.querySelector('div > div');
  const sku = skuElement ? skuElement.textContent.trim() : 'VA01-BLACK';

  // Mount the Drop-in UI into the block container
  await renderPDP(block, {
    sku,
  });
}
