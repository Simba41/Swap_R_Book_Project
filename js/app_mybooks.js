

const defaultCover = 'images/def_user.png';


export async function init()
{
  const list = document.getElementById('mine');
  const tpl  = document.getElementById('tpl-mybook-card');

  if (!list || !tpl) 
    return;

  let me = null;
  try 
  { 
    me = await window.api.me(); 
  } catch 
  { 
    me = null; 
  }

  const myId = me?.id || me?._id || '';

  let items = [];
  try 
  {
    const data = await window.api.books.list();
    items = Array.isArray(data?.items) ? data.items : [];
  } catch 
  { 
    items = []; 
  }

  const myBooks = items.filter(b => 
  {
    const oid = b?.ownerId && (b.ownerId._id || b.ownerId);

    return myId && (String(oid) === String(myId));
  });

  const frag = document.createDocumentFragment();
  (myBooks || []).forEach(b =>
  {
    const card   = tpl.content.firstElementChild.cloneNode(true);
    
    if (b._id || b.id) card.dataset.id = b._id || b.id;

    const img    = card.querySelector('.cover');
    const title  = card.querySelector('.book-title');
    const author = card.querySelector('.book-author');
    const badges = card.querySelector('.badges');
    const review = card.querySelector('.book-review');

    img.src = b.cover || defaultCover;
    img.alt = `${b.title || 'Book'} cover`;
    title.textContent  = b.title  || '';
    author.textContent = b.author || '';
    review.textContent = b.review || '';

    badges.replaceChildren(...((b.tags || []).map(t => 
    {
      const s = document.createElement('span');
      s.className = 'badge';
      s.textContent = t;

      return s;
    })));

    frag.appendChild(card);
  });

  list.replaceChildren(frag);

  list.addEventListener('click', (e) =>
  {
    const card = e.target.closest('.card-book');

    if (!card || !card.dataset.id) 
      return;
    
    location.hash = `#/book?id=${encodeURIComponent(card.dataset.id)}`;
  });
}
