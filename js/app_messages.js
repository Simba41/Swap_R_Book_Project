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
    convs = await window.api.messages.list(me._id); 
  } catch(e) 
  {
    console.error(e);
  }

  if (!convs.items || !convs.items.length) 
    {
    list.replaceChildren(empty.content.firstElementChild.cloneNode(true));
    return;
  }

  const frag = document.createDocumentFragment();

  for (const c of convs.items) 
  {
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.dataset.with = c.with;
    el.dataset.book = c.book || '';

    let user=null, book=null;
    try 
    { 
      user = await window.api.users.get(c.with); 
    } catch {}

    try 
    { 
      if (c.book) book = await window.api.books.get(c.book); 
    } catch {}

    const title = el.querySelector('.conv-title');
    const sub   = el.querySelector('.conv-sub');

    title.textContent = (user?.name) || 'User';
    sub.textContent = (book ? `About: ${book.title}. ` : '') 
                      + new Date(c.updatedAt || c.createdAt).toLocaleString()
                      + (c.lastText ? ` — ${c.lastText.slice(0,80)}` : '');

    el.addEventListener('click', ()=>
    {
      const withId = el.dataset.with;
      const bookId = el.dataset.book || '';
      location.hash = `#/chat?with=${encodeURIComponent(withId)}${bookId?`&book=${encodeURIComponent(bookId)}`:''}`;
    });

    frag.appendChild(el);
  }

  list.replaceChildren(frag);
}
