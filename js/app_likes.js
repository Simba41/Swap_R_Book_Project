import { demoBooks, defaultCover } from './demo-data.js';

const likeKey = id => `like_${id}`;

export function init()
{
  const favIds = (demoBooks||[]).map(b=>b.id).filter(id => localStorage.getItem(likeKey(id))==='1');
  const favBooks = (demoBooks||[]).filter(b => favIds.includes(b.id));

  const list = document.getElementById('favList');
  const tpl  = document.getElementById('tpl-book-card');
  const empty= document.getElementById('tpl-empty');

  if (!favBooks.length)
  { 
    list.replaceChildren(empty.content.firstElementChild.cloneNode(true)); 
    return; 
  }

  const frag = document.createDocumentFragment();
  favBooks.forEach(b=>
  {
    const n = tpl.content.firstElementChild.cloneNode(true);
    n.dataset.id=b.id;
    n.querySelector('.cover').src = b.cover||defaultCover;
    n.querySelector('.book-title').textContent = b.title;
    n.querySelector('.book-author').textContent = b.author;
    const badges = n.querySelector('.badges');
    badges.replaceChildren(...(b.tags||[]).map(t=>{const s=document.createElement('span');s.className='badge';s.textContent=t;return s;}));
    frag.appendChild(n);
  });

  list.replaceChildren(frag);

  list.addEventListener('click', e=>
  {
    const card=e.target.closest('.card-book'); if(!card) return;
    location.hash = `#/book?id=${encodeURIComponent(card.dataset.id)}`;
  });
}
