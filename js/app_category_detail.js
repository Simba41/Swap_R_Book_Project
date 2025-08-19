const defaultCover = 'images/def_user.png';



function getParam(name)
{
  const m = location.hash.match(new RegExp(`[?&]${name}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

export async function init()
{
  const genre = getParam('g') || '';
  const titleEl   = document.getElementById('catName');
  const resultsEl = document.getElementById('catResults');
  const tplBook   = document.getElementById('tpl-book-card');
  const tplEmpty  = document.getElementById('tpl-empty');

  if (!resultsEl || !tplBook) 
    return;


  titleEl && (titleEl.textContent = genre || 'All');

  async function load()
  {
    try 
    {
      const data = await window.api.books.list({ genre });
      return Array.isArray(data.items) ? data.items : [];
    } catch 
    { 
      return []; 
    }
  }

  function render(arr)
  {
    if (!arr.length) 
    {
      if (tplEmpty) resultsEl.replaceChildren(tplEmpty.content.firstElementChild.cloneNode(true));
      else resultsEl.innerHTML = '<div class="muted">No books yet.</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    arr.forEach(b =>
    {
      const n = tplBook.content.firstElementChild.cloneNode(true);
      n.dataset.id = b._id || b.id || '';
      n.querySelector('.cover').src = b.cover || defaultCover;
      n.querySelector('.cover').alt = `${b.title} cover`;
      n.querySelector('.book-title').textContent = b.title;
      n.querySelector('.book-author').textContent = b.author;
      const badges = n.querySelector('.badges');
      badges.replaceChildren(...(b.tags||[]).map(t=>{const s=document.createElement('span');s.className='badge';s.textContent=t;return s;}));
      frag.appendChild(n);
    });
    resultsEl.replaceChildren(frag);
  }

  render(await load());

  resultsEl.addEventListener('click', e =>
  {
    const card = e.target.closest('.card-book'); if(!card) return;
    location.hash = `#/book?id=${encodeURIComponent(card.dataset.id)}`;
  });

  const dqBtn = document.getElementById('dqBtn');
  dqBtn && dqBtn.addEventListener('click', async () =>
  {
    const q = (document.getElementById('dq').value||'').trim();
    const data = await window.api.books.list({ genre, q });
    render(Array.isArray(data.items) ? data.items : []);
  });
}
