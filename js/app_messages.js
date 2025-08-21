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
    console.error(' load conversations error:', e);
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

    if (c.with) withId = String(c.with);
    else if (c.peerId) withId = String(c.peerId);
    else if (c.peer && (c.peer._id || c.peer.id)) withId = String(c.peer._id || c.peer.id);
    else if (convStr) 
    {
      const parts = String(convStr).split('_');
      const a = parts[0], b = parts[1];
      const myId = String(me?.id || me?._id || '');
      withId = (String(a) === myId) ? b : a;
    }


    let user = c.peer || null;
    if (!user && withId) 
    {
      try 
      {
        user = await window.api.users.get(withId); 
      } catch {}
    }

    let displayName = 'User';
    if (user) 
    {
      const fn = user.firstName || '';
      const ln = user.lastName || '';
      const full = [fn, ln].filter(Boolean).join(' ').trim();
      displayName = full || user.email || 'User';
    }

    const title = el.querySelector('.conv-title');
    const sub   = el.querySelector('.conv-sub');

    title.textContent = displayName;
    sub.textContent = (c.bookTitle ? `About: ${c.bookTitle}. ` : '')
      + new Date(c.updatedAt || Date.now()).toLocaleString()
      + (c.lastText ? ` — ${String(c.lastText).slice(0, 80)}` : '');

    el.addEventListener('click', () => 
    {
      const bookId = el.dataset.book || '';
      const target = `#/chat?with=${encodeURIComponent(withId)}${bookId ? `&book=${encodeURIComponent(bookId)}` : ''}`;
      location.hash = target;
    });

    frag.appendChild(el);
  }

  list.replaceChildren(frag);
}
