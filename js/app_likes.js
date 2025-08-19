const defaultCover = 'images/def_user.png';
const LIKE_PREFIX = 'like_';




function getLikedIds()
{
  const ids = [];
  for (let i=0; i<localStorage.length; i++) 
  {
    const k = localStorage.key(i);
    if (k && k.startsWith(LIKE_PREFIX) && localStorage.getItem(k) === '1') 
    {
      ids.push(k.slice(LIKE_PREFIX.length));
    }
  }

  return ids;
}

export async function init()
{
  const list = document.getElementById('favList');
  const tpl  = document.getElementById('tpl-book-card');
  const empty= document.getElementById('tpl-empty');

  const favIds = getLikedIds();

  if (!favIds.length)
  {
    list.replaceChildren(empty.content.firstElementChild.cloneNode(true));
    return;
  }
  
  const books = (await Promise.all(
    favIds.map(async (id) => 
    {
      try 
      { 
        return await window.api.books.get(id); 
      }
      catch 
      { 
        return null; 
      }
    })
  )).filter(Boolean);



  if (!books.length) 
  {
    list.replaceChildren(empty.content.firstElementChild.cloneNode(true));
    return;
  }


  const frag = document.createDocumentFragment();


  books.forEach((b) =>
  {
    const n = tpl.content.firstElementChild.cloneNode(true);

    const bid = b?._id || b?.id || '';
    n.dataset.id = bid;

    const coverEl = n.querySelector('.cover');
    coverEl.src = b?.cover || defaultCover;
    coverEl.alt = `${b?.title || 'Book'} cover`;

    n.querySelector('.book-title').textContent  = b?.title  || '';
    n.querySelector('.book-author').textContent = b?.author || '';

    const badges = n.querySelector('.badges');

    badges.replaceChildren(...((b?.tags || []).map((t) =>
    {
      const s = document.createElement('span');
      s.className = 'badge';
      s.textContent = t;
      return s;
    })));

    frag.appendChild(n);
  });

  list.replaceChildren(frag);

  list.addEventListener('click', (e) =>
  {
    const card = e.target.closest('.card-book');

    if (!card) 
      return;
    
    location.hash = `#/book?id=${encodeURIComponent(card.dataset.id)}`;
  });
}
