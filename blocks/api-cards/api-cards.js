/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */
export default async function decorate(block) {
  const list = document.createElement('ul');

  const loading = document.createElement('p');
  loading.textContent = 'Loading products...';
  block.replaceChildren(loading);

  try {
    const response = await fetch('https://dummyjson.com/products?limit=6');

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();

    data.products.forEach((product) => {
      const card = document.createElement('li');

      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'api-cards-image';

      const image = document.createElement('img');
      image.src = product.thumbnail;
      image.alt = product.title;
      image.loading = 'lazy';

      imageWrapper.append(image);

      const content = document.createElement('div');
      content.className = 'api-cards-content';

      const title = document.createElement('h3');
      title.textContent = product.title;

      const description = document.createElement('p');
      description.textContent = product.description;

      const price = document.createElement('p');
      price.className = 'api-cards-price';
      price.textContent = `$${product.price}`;

      const rating = document.createElement('p');
      rating.textContent = `Rating: ${product.rating} / 5`;

      content.append(title, description, price, rating);
      card.append(imageWrapper, content);
      list.append(card);
    });

    block.replaceChildren(list);
  } catch (error) {
    console.error('API Error:', error);

    const message = document.createElement('p');
    message.textContent = 'Unable to load products. Please try again.';
    block.replaceChildren(message);
  }
}
