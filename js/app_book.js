const defaultCover = 'images/def_user.png';


const getParam = name => 
{
  const m = location.hash.match(new RegExp(`[?&]${name}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : '';
};

function displayName(u)
{
  return u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Owner';
}



export async function init()
{
  const id = getParam('id');
  if (!id) 
  {
    document.getElementById('app').innerHTML = `<p class="muted">Book not found.</p>`;
      return;
  }

  const book = await window.api.books.get(id).catch(()=>null);  

  if (!book) 
  {
    document.getElementById('app').innerHTML = `<p class="muted">Book not found.</p>`;
      return;
  }


  const ownerId = book.ownerId && (book.ownerId._id || book.ownerId) || '';
  const owner   = ownerId ? await window.api.users.get(ownerId).catch(()=>null) : null; 

  const topAvatar = document.getElementById('bkOwnerAvatar');
  const topName   = document.getElementById('bkOwnerTopName');
  const topDist   = document.getElementById('bkOwnerTopDist');
  const profileBtn= document.getElementById('ownerProfileBtn');
  const chatTop   = document.getElementById('chatBtnTop');

  topName && (topName.textContent = displayName(owner));

  if (topAvatar) topAvatar.innerHTML = (owner && owner.avatar)
    ? `<img src="${owner.avatar}" alt="${owner.name}">`
    : (owner && owner.name ? owner.name[0].toUpperCase() : '👤');



  topAvatar && topAvatar.addEventListener('click', (e)=>{ e.preventDefault?.(); if(ownerId) location.hash = `#/user?id=${ownerId}`; });

  profileBtn && profileBtn.addEventListener('click', (e)=>{ e.preventDefault(); if(ownerId) location.hash = `#/user?id=${ownerId}`; });

  chatTop && chatTop.addEventListener('click', ()=> ownerId && (location.hash = `#/chat?with=${encodeURIComponent(ownerId)}&book=${encodeURIComponent(book._id || id)}`));

  topDist && (topDist.textContent = '');

  const cover  = document.getElementById('bkCover');
  const title  = document.getElementById('bkTitle');
  const author = document.getElementById('bkAuthor');
  const badges = document.getElementById('bkBadges');
  const pickup = document.getElementById('bkPickup');
  const dist   = document.getElementById('bkDistance');
  const own    = document.getElementById('bkOwner');


  if (cover)  { cover.src = book.cover || defaultCover; cover.alt = `${book.title} cover`; }
  if (title)  title.textContent  = book.title || '';
  if (author) author.textContent = book.author || '';
  if (badges) badges.innerHTML   = (book.tags || []).map(t => `<span class="badge">${t}</span>`).join('');
  if (pickup) pickup.textContent = book.pickup || '—';
  if (own)    own.textContent    = (owner && owner.name) || 'Owner';
  if (dist)   dist.textContent   = '';

  const likeBtn  = document.getElementById('likeBtn');
  const likeStat = document.getElementById('likeStat');
  const likeKey  = (bookId)=>`like_${bookId}`;
  const liked    = localStorage.getItem(likeKey(book._id || id)) === '1';
  renderLike(liked);

  likeBtn && likeBtn.addEventListener('click', () =>
  {
    const k = likeKey(book._id || id);
    const now = !(localStorage.getItem(k) === '1');
    localStorage.setItem(k, now ? '1' : '0');
    renderLike(now);
  });

  function renderLike(state)
  {
    if (!likeBtn || !likeStat) return;
    likeBtn.textContent = state ? '♥ Liked' : '♡ Like';
    likeBtn.classList.toggle('primary', state);
    likeStat.textContent = state ? 'Added to your likes.' : '';
  }

  const chatBtn = document.getElementById('chatBtn');
  chatBtn && chatBtn.addEventListener('click', () =>
  {
    if (!ownerId) 
      return;
    
    location.hash = `#/chat?with=${encodeURIComponent(ownerId)}&book=${encodeURIComponent(book._id || id)}`;
  });
}
