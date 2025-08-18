import { demoBooks, defaultCover } from './demo-data.js';

const norm = s => (s || '').toString().replace(/\s*-\s*/g, '-').trim().toLowerCase();
const getParam = n => (location.hash.match(new RegExp(`[?&]${n}=([^&]+)`))||[])[1] ? decodeURIComponent(RegExp.$1) : '';

function unreadCount()
{
  try
  { 
    return (JSON.parse(localStorage.getItem('notifications')||'[]')||[]).filter(n=>!n.read).length; 
  }
  catch
  { 
    return 0; 
  }
}

export function init()
{
  const bell = document.getElementById('btnBell');
  const heart = document.getElementById('btnHeart');
  const badge = document.getElementById('bellBadge');
  const c = unreadCount();
  if (c>0){ badge.style.display='grid'; badge.textContent=String(c); }
  bell.addEventListener('click', ()=> location.hash = '#/notifications');
  heart.addEventListener('click',()=> location.hash = '#/likes');

  const genre = getParam('g') || '';
  const gnorm = norm(genre);

  const titleEl   = document.getElementById('catName');
  const resultsEl = document.getElementById('catResults');
  const tplBook   = document.getElementById('tpl-book-card');
  const tplEmpty  = document.getElementById('tpl-empty');

  titleEl.textContent = genre || 'All';

  function render(arr)
  {
    if (!arr.length)
    {
      resultsEl.replaceChildren(tplEmpty.content.firstElementChild.cloneNode(true));
      return;
    }
    const frag = document.createDocumentFragment();
    arr.forEach(b => 
    {
      const n = tplBook.content.firstElementChild.cloneNode(true);
      n.dataset.id = b.id;
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

  const base = (demoBooks||[]).filter(b=>
  {
    if (!gnorm) return true;
    if (b.genre && norm(b.genre)===gnorm) return true;
    if (Array.isArray(b.tags) && b.tags.some(t=>norm(t)===gnorm)) return true;
    return false;
  });
  render(base);

  resultsEl.addEventListener('click', e=>
  {
    const card = e.target.closest('.card-book'); if(!card) return;
    location.hash = `#/book?id=${encodeURIComponent(card.dataset.id)}`;
  });

  document.getElementById('dqBtn').addEventListener('click', ()=>
  {
    const q = (document.getElementById('dq').value||'').trim().toLowerCase();
    if (!q) return render(base);
    render(base.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)));
  });
}
