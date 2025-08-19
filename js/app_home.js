const defaultCover = 'images/def_user.png';

export async function init()
{
  const nameEl = document.getElementById('userName');
  if (nameEl) 
  {
    try 
    {
      const me = await window.api.me(); 
      const full = [me?.firstName, me?.lastName].filter(Boolean).join(' ');
      nameEl.textContent = full || 'Friend';
    } catch 
    {
      nameEl.textContent = 'Friend';
    }
  }

  const bell  = document.getElementById('btnBell');
  const heart = document.getElementById('btnHeart');
  const badge = document.getElementById('bellBadge');
  try 
  {
    const c = (JSON.parse(localStorage.getItem('notifications')||'[]')||[]).filter(n=>!n.read).length;
    if (c>0){ badge.style.display='grid'; badge.textContent=String(c); }
  } catch {}
  
  bell && bell.addEventListener('click', ()=> location.hash = '#/notifications');
  heart && heart.addEventListener('click',()=> location.hash = '#/likes');
  msgs && msgs.addEventListener('click', ()=> location.hash = '#/messages');

  const chips = document.getElementById('chips');

  if (chips) 
  {
    try 
    {
      const genres = await window.api.books.genres();
      chips.replaceChildren(
        ...(Array.isArray(genres) ? genres : []).map(g=>{
          const b=document.createElement('button');
          b.className='chip';
          b.textContent=g;
          b.addEventListener('click', async ()=>
          {
            const data = await window.api.books.list({ genre: g });
            render(Array.isArray(data.items) ? data.items : []);
          });

          return b;
        })
      );
    } catch 
    {
      chips.innerHTML = '';
    }
  }

  const list = document.getElementById('books');
  const tpl  = document.getElementById('tpl-book-card');

  if (!list || !tpl) 
    return;

  async function loadBooks(params={})
  {
    try 
    {
      const data = await window.api.books.list(params);
      return Array.isArray(data.items) ? data.items : [];
    } catch 
    { 
      return []; 
    }
  }




  function render(arr)
  {
    const frag = document.createDocumentFragment();
    arr.forEach(b =>
    {
      const card = tpl.content.firstElementChild.cloneNode(true);
      card.dataset.id = b._id || b.id || '';
      const cover = card.querySelector('.cover');
      cover.src = b.cover || defaultCover;
      cover.alt = `${b.title||''} cover`;
      card.querySelector('.book-title').textContent  = b.title  || '';
      card.querySelector('.book-author').textContent = b.author || '';
      const badges = card.querySelector('.badges');
      badges.replaceChildren(...((b.tags||[]).map(t=>
      {
        const s=document.createElement('span'); s.className='badge'; s.textContent=t; return s;
      })));
      frag.appendChild(card);
    });
    list.replaceChildren(frag);
  }

  render(await loadBooks());

  list.addEventListener('click', (e) =>
  {
    const card = e.target.closest('.card-book');

    if (!card) 
      return;

    
    location.hash = `#/book?id=${encodeURIComponent(card.dataset.id)}`;
  });

  const btn = document.getElementById('qBtn');
  btn && btn.addEventListener('click', async () =>
  {
    const q = document.getElementById('q').value.trim();
    const data = await window.api.books.list({ q });
    render(Array.isArray(data.items) ? data.items : []);
  });
}
