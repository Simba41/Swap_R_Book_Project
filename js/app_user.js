const defaultCover = 'images/def_user.png';

const getParam = (n) => 
{
  const m = location.hash.match(new RegExp(`[?&]${n}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : '';
};

function distanceKm(a,b)
{
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const h=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;

  return 2*R*Math.asin(Math.sqrt(h));
}

export async function init()
{
  const id = getParam('id');

  const user = id ? await window.api.users.get(id).catch(()=>null) : null;
  if (!user)
  { 
    document.getElementById('app').innerHTML = '<p class="muted">User not found.</p>'; 
    return; 
  }

  let me = null;
  try 
  { 
    me = await window.api.me(); 
  } catch 
  { 
    me = null; 
  }

  document.getElementById('uName').textContent = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
  const whereEl = document.getElementById('uWhere'); 
  if (whereEl) 
  { 
    if (user.loc && typeof user.loc.lat==='number' && typeof user.loc.lng==='number') 
      whereEl.textContent = `Location: ${user.loc.lat.toFixed(4)}, ${user.loc.lng.toFixed(4)}`;
    else whereEl.textContent = 'Location: —'; 
  } 
  
  document.getElementById('uBio').textContent  = user.bio || '';

  if (user.loc && me?.loc && user.loc.lat && me.loc.lat)
  {
    document.getElementById('uDist').textContent = `${distanceKm(me.loc, user.loc).toFixed(1)} km from you`;
  }

  const all = await window.api.books.list().catch(()=>({ items: [] }));
  const mine = (Array.isArray(all.items) ? all.items : []).filter(b => 
  {
    const oid = b?.ownerId && (b.ownerId._id || b.ownerId);
    return String(oid) === String(id);
  });

  const list = document.getElementById('uBooks');
  const tpl  = document.getElementById('tpl-book');
  const frag = document.createDocumentFragment();
  mine.forEach(b=>
  {
    const n = tpl.content.firstElementChild.cloneNode(true);
    n.dataset.id = b._id || b.id;
    n.querySelector('.cover').src = b.cover || defaultCover;
    n.querySelector('.book-title').textContent = b.title || '';
    n.querySelector('.book-author').textContent = b.author || '';
    const badges = n.querySelector('.badges');
    badges.replaceChildren(...(b.tags||[]).map(t=>{
      const s=document.createElement('span');
       s.className='badge';
       s.textContent=t; 
      return s;
    }));
    frag.appendChild(n);
  });

  list.replaceChildren(frag);
  list.addEventListener('click', e =>
  {
    const card = e.target.closest('.card-book'); 

    if(!card) 
      return;
    
    location.hash = `#/book?id=${encodeURIComponent(card.dataset.id)}`;
  });

  document.getElementById('uReport').addEventListener('click',(e)=>
  {
    e.preventDefault(); location.hash = `#/report?to=${encodeURIComponent(id)}`;
  });
  document.getElementById('uChat').addEventListener('click',(e)=>
  {
    e.preventDefault(); location.hash = `#/chat?with=${encodeURIComponent(id)}`;
  });
}
