

function getHashParam(name)
{
  const m = location.hash.match(new RegExp(`[?&]${name}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

function displayName(u)
{
  return u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'User';
}

function convKey(withId, bookId) 
{ 
  return `conv_${withId}_${bookId}`; 
}


function swapKey(withId, bookId) 
{ 
  return `swap_${withId}_${bookId}`; 
}

export async function init()
{
  const withId = getHashParam('with');
  const bookId = getHashParam('book');

  let me = null;
  try 
  { 
    me = await window.api.me(); 
  } catch 
  { 
    me = null; 
  }

  const myId = me?.id || me?._id || 'guest';

  const buddy = withId ? await window.api.users.get(withId).catch(()=>null) : null;
  const book  = bookId ? await window.api.books.get(bookId).catch(()=>null) : null;

  const avatar = document.getElementById('chatPeerAvatar');
  const openProfileBtn = document.getElementById('openProfileBtn');
  document.getElementById('chatWith').textContent = displayName(buddy);
  document.getElementById('chatMeta').textContent = book ? `About: ${book.title}` : '';

  if (buddy?.avatar)
    avatar.innerHTML = `<img src="${buddy.avatar}" alt="${displayName(buddy)}">`;
  else
    avatar.innerHTML = displayName(buddy).slice(0,1).toUpperCase() || '👤';

  const openProfile = (e)=>
  { 
      e.preventDefault?.(); 
      if (withId) location.hash = `#/user?id=${encodeURIComponent(withId)}`;
  };

  avatar.addEventListener('click', openProfile);
  openProfileBtn.addEventListener('click', openProfile);

  const feed = document.getElementById('chatFeed');
  const text = document.getElementById('chatText');

  function loadConv()
  {
    try 
    { 
      return JSON.parse(localStorage.getItem(convKey(withId, bookId)) || '[]'); 
    }
    catch 
    { 
      return []; 
    }
  }
  function saveConv(arr) 
  { 
    localStorage.setItem(convKey(withId, bookId), JSON.stringify(arr)); 
  }

  function renderConv()
  {
    const arr = loadConv();
    feed.innerHTML = arr.map(msg => `
      <div class="msg ${msg.from === myId ? 'me' : 'them'}">
        <div class="bubble">${msg.text}</div>
        <div class="time muted">${new Date(msg.ts).toLocaleTimeString()}</div>
      </div>
    `).join('');
    feed.scrollTop = feed.scrollHeight;
  }

  document.getElementById('sendBtn').addEventListener('click', () =>
  {
    const v = (text.value || '').trim();

    if (!v) 
      return;

    const arr = loadConv();
    arr.push({ from: myId, to: withId, text: v, ts: Date.now() });
    saveConv(arr);
    text.value = '';
    renderConv();
  });

  const confirmBtn = document.getElementById('confirmBtn');
  function renderConfirm()
  {
    const state = localStorage.getItem(swapKey(withId, bookId)) || 'none';
    const otherConfirmed = localStorage.getItem(swapKey(withId, bookId) + '_other') === '1';
    confirmBtn.textContent = state === 'me' ? 'Swap confirmed ✓' : 'Confirm swap';
    confirmBtn.classList.toggle('primary', state === 'me');
    document.getElementById('chatMeta').textContent =
      (book ? `About: ${book.title}. ` : '') +
      (state === 'me' ? 'You confirmed. ' : '') +
      (otherConfirmed ? 'Partner confirmed ✓' : 'Waiting partner...');
  }

  confirmBtn.addEventListener('click', () =>
  {
    const cur = localStorage.getItem(swapKey(withId, bookId));
    const next = cur === 'me' ? 'none' : 'me';
    localStorage.setItem(swapKey(withId, bookId), next);
    renderConfirm();
  });

  const reportBtn = document.getElementById('reportBtn');
  reportBtn.addEventListener('click', (e) =>
  {
    e.preventDefault();
    location.hash = `#/report?to=${encodeURIComponent(withId)}&book=${encodeURIComponent(bookId)}`;
  });

  renderConv();
  renderConfirm();
}
