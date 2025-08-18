import { currentUser, demoCategories, demoBooks, defaultCover } from './demo-data.js';

export function init()
{
  const nameEl = document.getElementById('userName');
  if (nameEl) nameEl.textContent = currentUser?.name || 'Friend';

  const bell = document.getElementById('btnBell');
  const heart = document.getElementById('btnHeart');
  const badge = document.getElementById('bellBadge');
  const c = (() => 
    {
      try 
      { 
        return (JSON.parse(localStorage.getItem('notifications')||'[]')||[]).filter(n=>!n.read).length; 
      }
      catch 
      { 
        return 0; 
      }
    })();


  if (c>0)
    { 
      badge.style.display='grid'; badge.textContent=String(c); 
    }

  bell.addEventListener('click', ()=> location.hash = '#/notifications');
  heart.addEventListener('click',()=> location.hash = '#/likes');

  const chips = document.getElementById('chips');
  if (chips) 
    chips.innerHTML = (demoCategories||[]).map(c => `<span class="chip">${c}</span>`).join('');


  const list = document.getElementById('books');
  const tpl  = document.getElementById('tpl-book-card');


  if (list && tpl)
    {
      const frag = document.createDocumentFragment();
      (demoBooks || []).forEach(b => 
        {
          const card = tpl.content.firstElementChild.cloneNode(true);
          card.dataset.id = b.id;
          const img   = card.querySelector('.cover');
          const title = card.querySelector('.book-title');
          const auth  = card.querySelector('.book-author');
          const badges= card.querySelector('.badges');
          img.src = b.cover || defaultCover;
          img.alt = `${b.title} cover`;
          title.textContent = b.title;
          auth.textContent  = b.author;
          badges.replaceChildren(...((b.tags||[]).map(t=>{const s=document.createElement('span');s.className='badge';s.textContent=t;return s;})));
          frag.appendChild(card);
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


  const btn = document.getElementById('qBtn');
  if (btn) 
    btn.addEventListener('click', () => 
  {
    const q = document.getElementById('q').value.trim();
    if(!q) return;
    alert('Search (demo): ' + q);
  });
}
