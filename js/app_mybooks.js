import { demoMyBooks, defaultCover } from './demo-data.js';

export function init()
{
  const list = document.getElementById('mine');
  const tpl  = document.getElementById('tpl-mybook-card');

  if (!list || !tpl) 
    return;

  const frag = document.createDocumentFragment();

  (demoMyBooks || []).forEach(b => 
  {
    const card   = tpl.content.firstElementChild.cloneNode(true);
    const img    = card.querySelector('.cover');
    const title  = card.querySelector('.book-title');
    const author = card.querySelector('.book-author');
    const badges = card.querySelector('.badges');
    const review = card.querySelector('.book-review');

    if (b.id) 
      card.dataset.id = b.id;

    img.src = b.cover || defaultCover;
    img.alt = `${b.title} cover`;
    title.textContent  = b.title || '';
    author.textContent = b.author || '';
    review.textContent = b.review || 'This is your demo book.';

    badges.replaceChildren
    (
      ...((b.tags || []).map(t => 
      {
        const s = document.createElement('span');
        s.className = 'badge';
        s.textContent = t;
        return s;
      }))
    );

    frag.appendChild(card);
  });

  list.replaceChildren(frag);

  list.addEventListener('click', (e) => 
  {
    const card = e.target.closest('.card-book');
    if (!card || !card.dataset.id) return;
    location.hash = `#/book?id=${encodeURIComponent(card.dataset.id)}`;
  });
}
