export async function init() {
  const list  = document.getElementById('msgList');
  const tpl   = document.getElementById('tpl-conv');
  const empty = document.getElementById('tpl-empty');

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
    convs = Array.isArray(res?.items) ? res.items : [];
  } catch (e) 
  {
    console.error(e);
  }

  if (!convs.length) 
  {
    if (empty) list.replaceChildren(empty.content.firstElementChild.cloneNode(true));
    return;
  }



  const frag = document.createDocumentFragment();

  for (const c of convs) 
  {
    const el = tpl.content.firstElementChild.cloneNode(true);

    const convStr = c.conv || '';
    el.dataset.conv = convStr;
    el.dataset.book = c.book || '';


    const peer = c.peer || {};
    const withId = peer._id || c.with || '';
    const name = [peer.firstName, peer.lastName].filter(Boolean).join(' ').trim()
              || peer.email
              || 'User';

    const title = el.querySelector('.conv-title');
    const sub   = el.querySelector('.conv-sub');

    if (title) title.textContent = name;
    if (sub) 
    {
      const when = new Date(c.updatedAt || Date.now()).toLocaleString();
      const last = c.lastText ? ` — ${String(c.lastText).slice(0, 80)}` : '';
      const about = c.book ? `About: ${c.bookTitle || ''}. ` : ''; 
      sub.textContent = `${about}${when}${last}`;
    }

    el.addEventListener('click', () => 
    {
      const bookId = el.dataset.book || '';
      const hash = `#/chat?with=${encodeURIComponent(withId)}${bookId ? `&book=${encodeURIComponent(bookId)}` : ''}`;
      location.hash = hash;
    });

    frag.appendChild(el);
  }

  list.replaceChildren(frag);
}
