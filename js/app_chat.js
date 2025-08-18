import { users, demoBooks, currentUser } from './demo-data.js';

function getHashParam(name)
{
  const m = location.hash.match(new RegExp(`[?&]${name}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}
function getUser(id)
{ 
  return (users || []).find(u => u.id === id) || { name:'User' }; 
}

function getBook(id)
{ 
  return (demoBooks || []).find(b => b.id === id) || null; 
}

function convKey(withId, bookId)
{ 
  return `conv_${withId}_${bookId}`; 
}


function swapKey(withId, bookId)
{ 
  return `swap_${withId}_${bookId}`; 
}

export function init()
{
  const withId = getHashParam('with');
  const bookId = getHashParam('book');
  const buddy  = getUser(withId);
  const book   = getBook(bookId);

  const avatar = document.getElementById('chatPeerAvatar');
  const openProfileBtn = document.getElementById('openProfileBtn');
  document.getElementById('chatWith').textContent = buddy.name || 'User';
  document.getElementById('chatMeta').textContent = book ? `About: ${book.title}` : '';

  if (buddy.avatar)
  {
    avatar.innerHTML = `<img src="${buddy.avatar}" alt="${buddy.name}">`;
  } else 
  {
    avatar.innerHTML = buddy.name ? buddy.name[0].toUpperCase() : '👤';
  }

  const openProfile = (e)=>{ e.preventDefault?.(); location.hash = `#/user?id=${encodeURIComponent(buddy.id)}`; };
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
      <div class="msg ${msg.from === currentUser.id ? 'me' : 'them'}">
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
    arr.push({ from: currentUser.id, to: withId, text: v, ts: Date.now() });
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
    location.hash = `#/report?to=${encodeURIComponent(buddy.id)}&book=${encodeURIComponent(bookId)}`;
  });

  renderConv();
  renderConfirm();
}
