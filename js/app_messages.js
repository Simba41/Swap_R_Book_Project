export async function init()
{
  const list = document.getElementById('msgList');
  const tpl  = document.getElementById('tpl-conv');
  const empty= document.getElementById('tpl-empty');

  let me = null;
  try { me = await window.api.me(); } catch {}

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
  }
  catch(e) 
  { 
    console.error(e); 
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
    if (c.with) withId = c.with;
    else if (convStr)
    {
      const parts = String(convStr).split('_');
      const a = parts[0], b = parts[1];
      const myId = me?.id || me?._id || '';
      withId = (String(a) === String(myId)) ? b : a;
    }

    let user = null, book = null;

    try 
    { 
      if (withId) user = await window.api.users.get(withId);
     
    } catch {}
    try 
    { 
      if (c.book)  book = await window.api.books.get(c.book); 
    } catch {}

    const title = el.querySelector('.conv-title');
    const sub   = el.querySelector('.conv-sub');

    title.textContent = (user?.name) || 'User';
    sub.textContent = (book ? `About: ${book.title}. ` : '')
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
