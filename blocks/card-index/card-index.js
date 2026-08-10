export default async function decorate(block) {
     const resp = await fetch('/query-index.json');
     const { data } = await resp.json();

     block.textContent = '';
     data.forEach((page) => {
       const card = document.createElement('a');
       card.className = 'card';
       card.href = page.path;
       card.innerHTML = `
         ${page.image ? `<img src="${page.image}" alt="${page.title}">` : ''}
         <h3>${page.title || page.path}</h3>
         <p>${page.description || ''}</p>
       `;
       block.append(card);
     });
   }
   