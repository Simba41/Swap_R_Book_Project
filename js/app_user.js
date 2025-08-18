import { users, demoBooks, currentUser, defaultCover } from './demo-data.js';

const getParam = n => (location.hash.match(new RegExp(`[?&]${n}=([^&]+)`))||[])[1] ? decodeURIComponent(RegExp.$1) : '';

function distanceKm(a,b)
{
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const h=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

export function init()
{
  const id = getParam('id');
  const user = users.find(u=>u.id===id);

  if (!user)
  { 
    document.getElementById('app').innerHTML='<p class="muted">User not found.</p>'; 
    return; 
  }

  document.getElementById('uName').textContent = user.name;
  document.getElementById('uBio').textContent  = user.bio || '';

  if (user.loc && currentUser.loc)
  {
    document.getElementById('uDist').textContent = `${distanceKm(currentUser.loc, user.loc).toFixed(1)} km from you`;
  }


  const mine = (demoBooks||[]).filter(b => b.ownerId === user.id);
  const list = document.getElementById('uBooks');
  const tpl  = document.getElementById('tpl-book');
  const frag = document.createDocumentFragment();
  mine.forEach(b=>
  {
    const n=tpl.content.firstElementChild.cloneNode(true);
    n.dataset.id=b.id;
    n.querySelector('.cover').src=b.cover||defaultCover;
    n.querySelector('.book-title').textContent=b.title;
    n.querySelector('.book-author').textContent=b.author;
    const badges=n.querySelector('.badges');
    badges.replaceChildren(...(b.tags||[]).map(t=>{const s=document.createElement('span');s.className='badge';s.textContent=t;return s;}));
    frag.appendChild(n);
  });

  list.replaceChildren(frag);
  list.addEventListener('click', e=>
  {
    const card=e.target.closest('.card-book'); 
    if(!card) 
      return;

    location.hash = `#/book?id=${encodeURIComponent(card.dataset.id)}`;

  });


  document.getElementById('uReport').addEventListener('click',(e)=>{e.preventDefault();location.hash=`#/report?to=${encodeURIComponent(user.id)}`;});
  document.getElementById('uChat').addEventListener('click',(e)=>{e.preventDefault();location.hash=`#/chat?with=${encodeURIComponent(user.id)}`;});
}
