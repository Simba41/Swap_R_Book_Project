import { demoBooks, users, currentUser, defaultCover } from './demo-data.js';

function getHashParam(name)
{
  const m = location.hash.match(new RegExp(`[?&]${name}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

// (км)
function distanceKm(a, b)
{
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function getBook(id)
{ 
  return (demoBooks || []).find(b => b.id === id); 
}

function getUser(id)
{ 
  return (users || []).find(u => u.id === id) || { name:'User' }; 
}

function likeKey(id)
{ 
  return `like_${id}`; 
}

export function init()
{
  const id = getHashParam('id');
  const book = getBook(id);
  if (!book)
  {
    document.getElementById('app').innerHTML = `<p class="muted">Book not found.</p>`;
    return;
  }

  const owner = getUser(book.ownerId);

  const topAvatar = document.getElementById('bkOwnerAvatar');
  const topName   = document.getElementById('bkOwnerTopName');
  const topDist   = document.getElementById('bkOwnerTopDist');
  const profileBtn= document.getElementById('ownerProfileBtn');
  const chatTop   = document.getElementById('chatBtnTop');

  topName.textContent = owner.name || 'User';


  if (owner.avatar)
  {
    topAvatar.innerHTML = `<img src="${owner.avatar}" alt="${owner.name}">`;
  } else 
  {
    topAvatar.innerHTML = owner.name ? owner.name[0].toUpperCase() : '👤';
  }


  topAvatar.addEventListener('click', (e)=>{ e.preventDefault?.(); location.hash = `#/user?id=${owner.id}`; });
  profileBtn.addEventListener('click', (e)=>{ e.preventDefault(); location.hash = `#/user?id=${owner.id}`; });
  chatTop.addEventListener('click', ()=> location.hash = `#/chat?with=${encodeURIComponent(owner.id)}&book=${encodeURIComponent(book.id)}`);

  if (owner.loc && currentUser.loc)
  {
    topDist.textContent = `${distanceKm(currentUser.loc, owner.loc).toFixed(1)} km from you`;
  } else 
  {
    topDist.textContent = '';
  }


  const cover  = document.getElementById('bkCover');
  const title  = document.getElementById('bkTitle');
  const author = document.getElementById('bkAuthor');
  const badges = document.getElementById('bkBadges');
  const pickup = document.getElementById('bkPickup');
  const dist   = document.getElementById('bkDistance');
  const own    = document.getElementById('bkOwner');

  cover.src = book.cover || defaultCover;
  cover.alt = `${book.title} cover`;
  title.textContent  = book.title;
  author.textContent = book.author;
  badges.innerHTML   = (book.tags || []).map(t => `<span class="badge">${t}</span>`).join('');
  pickup.textContent = book.pickup || '—';
  own.textContent    = owner.name;

  if (owner.loc && currentUser.loc)
  {
    dist.textContent = `${distanceKm(currentUser.loc, owner.loc).toFixed(1)} km from you`;
  } else 
  {
    dist.textContent = '';
  }


  const likeBtn  = document.getElementById('likeBtn');
  const likeStat = document.getElementById('likeStat');
  const liked = localStorage.getItem(likeKey(id)) === '1';
  renderLike(liked);
  likeBtn.addEventListener('click', () => 
  {
    const now = !(localStorage.getItem(likeKey(id)) === '1');
    localStorage.setItem(likeKey(id), now ? '1' : '0');
    renderLike(now);
  });

  
  function renderLike(state)
  {
    likeBtn.textContent = state ? '♥ Liked' : '♡ Like';
    likeBtn.classList.toggle('primary', state);
    likeStat.textContent = state ? 'Added to your likes.' : '';
  }


  const chatBtn = document.getElementById('chatBtn');
  chatBtn.addEventListener('click', () => 
  {
    location.hash = `#/chat?with=${encodeURIComponent(owner.id)}&book=${encodeURIComponent(book.id)}`;
  });
}
