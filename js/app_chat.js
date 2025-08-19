function getHashParam(name)
{
  const m = location.hash.match(new RegExp(`[?&]${name}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

function displayName(u)
{
  return u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'User';
}

export async function init()
{
  const withId = getHashParam('with');
  const bookId = getHashParam('book') || null;

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
    avatar.innerHTML = (displayName(buddy).slice(0,1).toUpperCase()) || '👤';

  const openProfile = (e)=>{ e.preventDefault?.(); if (withId) location.hash = `#/user?id=${encodeURIComponent(withId)}`; };
  avatar.addEventListener('click', openProfile);
  openProfileBtn.addEventListener('click', openProfile);

  const feed = document.getElementById('chatFeed');
  const text = document.getElementById('chatText');
  const sendBtn = document.getElementById('sendBtn');

  async function loadHistory()
  {
    try 
    {
      const res = await window.api.messages.list(withId, bookId); 
      return res.items || [];
    } catch (e) 
    {
      console.error(e);
      return [];
    }
  }

  function render(items)
  {
    feed.innerHTML = items.map(msg => `
      <div class="msg ${String(msg.from) === String(myId) ? 'me' : 'them'}">
        <div class="bubble">${msg.text}</div>
        <div class="time muted">${new Date(msg.createdAt || Date.now()).toLocaleTimeString()}</div>
      </div>
    `).join('');
    feed.scrollTop = feed.scrollHeight;
  }

  async function refresh()
  {
    const items = await loadHistory();
    render(items);
  }

  sendBtn.addEventListener('click', async () =>
  {
    const v = (text.value || '').trim();

    if (!v) 
      return;

    try 
    {
      await window.api.messages.send(withId, v, bookId);
      text.value = '';
      await refresh();
    } catch (e) {
      alert(e?.message || String(e));
    }
  });


  const confirmBtn = document.getElementById('confirmBtn');
  function swapKey(withId, bookId){ return `swap_${withId}_${bookId}`; }
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
    location.hash = `#/report?to=${encodeURIComponent(withId)}&book=${encodeURIComponent(bookId||'')}`;
  });

  await refresh();
  renderConfirm();
}
