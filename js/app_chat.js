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
  const bookId = getHashParam('book');

  if (!withId) 
  {
    document.getElementById('app').innerHTML = `<p class="muted">Chat not found.</p>`;
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
  const myId = me?.id || me?._id || '';


  const buddy = withId ? await window.api.users.get(withId).catch(()=>null) : null;
  const book  = bookId ? await window.api.books.get(bookId).catch(()=>null) : null;


  const avatar = document.getElementById('chatPeerAvatar');
  const openProfileBtn = document.getElementById('openProfileBtn');
  document.getElementById('chatWith').textContent = displayName(buddy);
  document.getElementById('chatMeta').textContent = book ? `About: ${book.title}` : '';

  if (buddy?.avatar) 
  {
    avatar.innerHTML = `<img src="${buddy.avatar}" alt="${displayName(buddy)}">`;
  } else 
  {
    avatar.innerHTML = displayName(buddy).slice(0,1).toUpperCase() || '👤';
  }

  const openProfile = (e) => 
  { 
    e.preventDefault?.(); 
    if (withId) location.hash = `#/user?id=${encodeURIComponent(withId)}`;
  };
  avatar.addEventListener('click', openProfile);
  openProfileBtn.addEventListener('click', openProfile);

  const feed = document.getElementById('chatFeed');
  const text = document.getElementById('chatText');
  const sendBtn = document.getElementById('sendBtn');



  async function loadConversation() 
  {
    try 
    {
      const data = await window.api.messages.list({ with: withId, book: bookId });
      renderConv(data.items || []);
    } catch (e) 
    {
      feed.innerHTML = `<p class="muted">Failed to load conversation</p>`;
    }
  }

  function renderConv(arr) 
  {
    feed.innerHTML = arr.map(msg => `
      <div class="msg ${String(msg.from) === String(myId) ? 'me' : 'them'}">
        <div class="bubble">${msg.text}</div>
        <div class="time muted">${new Date(msg.createdAt).toLocaleString()}</div>
      </div>
    `).join('');
    feed.scrollTop = feed.scrollHeight;
  }




  sendBtn.addEventListener('click', async () => 
  {
    const v = (text.value || '').trim();

    if (!v) 
      return;

    try 
    {
      await window.api.messages.send({ to: withId, book: bookId, text: v });
      text.value = '';
      await loadConversation();
    } catch (e) 
    {
      alert('Failed: ' + (e?.message || e));
    }
  });



  const confirmBtn = document.getElementById('confirmBtn');
  async function renderConfirm() 
  {
    try 
    {
      const data = await window.api.swaps.get({ with: withId, book: bookId });
      const meConfirmed = data.meConfirmed;
      const otherConfirmed = data.otherConfirmed;

      confirmBtn.textContent = meConfirmed ? 'Swap confirmed ✓' : 'Confirm swap';
      confirmBtn.classList.toggle('primary', meConfirmed);

      document.getElementById('chatMeta').textContent =
        (book ? `About: ${book.title}. ` : '') +
        (meConfirmed ? 'You confirmed. ' : '') +
        (otherConfirmed ? 'Partner confirmed ✓' : 'Waiting partner...');
    } catch 
    {
      confirmBtn.textContent = 'Confirm swap';
    }
  }

  confirmBtn.addEventListener('click', async () => 
  {
    try 
    {
      await window.api.swaps.toggle({ with: withId, book: bookId });
      await renderConfirm();
    } catch (e) 
    {
      alert('Failed: ' + (e?.message || e));
    }
  });



  const reportBtn = document.getElementById('reportBtn');
  reportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = `#/report?to=${encodeURIComponent(withId)}&book=${encodeURIComponent(bookId)}`;
  });

  await loadConversation();
  await renderConfirm();
}
