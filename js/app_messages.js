function displayName(u) 
{

  if (!u) 
    return 'User';

  const fn = (u.firstName||'').trim();
  const ln = (u.lastName||'').trim();
  const full = [fn, ln].filter(Boolean).join(' ').trim();
  return full || u.email || 'User';
}

export async function init() 
{
  const list = document.getElementById('msgList');
  const tpl  = document.getElementById('tpl-conv');
  const empty= document.getElementById('tpl-empty');

  let me = null;
  try 
  { 
    me = await window.api.me(); 
  } catch {}

  if (!me) 
  { 
    list.innerHTML = `<p class="muted">Not logged in</p>`; 
    return; 
  }

  let convs = [];
  try 
  {
    const res = await window.api.messages.list();
    convs = res.items || [];
  } catch (e) 
  {
    console.error('messages.list error:', e);
  }

  if (!convs.length) 
  {
    list.replaceChildren(empty.content.firstElementChild.cloneNode(true));
    return;
  }

  const frag = document.createDocumentFragment();

  for (const c of convs) 
  {
    const el = tpl.content.firstElementChild.cloneNode(true);

    const convStr = c.conv || c._id || '';
    el.dataset.conv = convStr;
    el.dataset.book = c.book || '';


    let withId = '';
    if (c.with) 
    {
      withId = String(c.with);
    } else if (c.peerId) 
    {
      withId = String(c.peerId);
    } else if (convStr) 
    {
      const parts = String(convStr).split('_');
      const a = parts[0], b = parts[1];
      const myId = String(me?.id || me?._id || '');
      withId = (String(a) === myId) ? b : a;
    }



    let peer = null;
    if (c.peer && (c.peer._id || c.peer.email)) 
    {
      peer = c.peer;
    } else if (withId) 
    {
      
      try 
      { 
        peer = await window.api.users.get(withId); 
      } catch {}
    }


    let book = null;
    try 
    { 
      if (c.book) book = await window.api.books.get(c.book); 
    } catch {}

    const title = el.querySelector('.conv-title');
    const sub   = el.querySelector('.conv-sub');

    title.textContent = displayName(peer);
    sub.textContent   = (book ? `About: ${book.title}. ` : '')
                      + new Date(c.updatedAt || Date.now()).toLocaleString()
                      + (c.lastText ? ` — ${String(c.lastText).slice(0,80)}` : '');

    el.addEventListener('click', () => 
    {
      const bookId = el.dataset.book || '';
      location.hash = `#/chat?with=${encodeURIComponent(withId)}${bookId ? `&book=${encodeURIComponent(bookId)}` : ''}`;
    });

    frag.appendChild(el);
  }

  list.replaceChildren(frag);
}
