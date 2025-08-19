function parseKey(k)
{ 
  const m=k.match(/^conv_(.+?)_(.+)$/); 
  return m?{withId:m[1],bookId:(m[2]==='null'||m[2]==='none')?null:m[2]}:null; 
} 

function loadConv(k)
{ 
  try{ return JSON.parse(localStorage.getItem(k)||'[]'); }catch{return [];} 
} 

export async function init()
{
  const list = document.getElementById('msgList');
  const tpl  = document.getElementById('tpl-conv');
  const empty= document.getElementById('tpl-empty');

  const keys = [];
  for (let i=0; i<localStorage.length; i++)
  {
    const k = localStorage.key(i);
    if (k && k.startsWith('conv_')) keys.push(k);
  }

  const items = [];
  for (const k of keys)
  {
    const meta = parseKey(k);
    if (!meta) continue;
    const arr = loadConv(k);
    if (!arr.length) continue; 
    const last = arr[arr.length-1];
    items.push({ key:k, ...meta, lastTs:last.ts||Date.now(), lastText:last.text||'' });
  }

  items.sort((a,b)=>b.lastTs-a.lastTs);

  if (!items.length)
  { 
    list.replaceChildren(empty.content.firstElementChild.cloneNode(true)); 
    return; 
  }

  const frag = document.createDocumentFragment();

  for (const it of items)
  {
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.dataset.with = it.withId;
    el.dataset.book = it.bookId || '';

    let user=null, book=null;
    try{ user = await window.api.users.get(it.withId); }catch{}
    try{ if (it.bookId) book = await window.api.books.get(it.bookId); }catch{}

    const title = el.querySelector('.conv-title');
    const sub   = el.querySelector('.conv-sub');

    title.textContent = (user?.name) || 'User';
    sub.textContent = (book ? `About: ${book.title}. ` : '') 
                      + new Date(it.lastTs).toLocaleString() 
                      + ' — ' + it.lastText.slice(0,80);

    el.addEventListener('click', ()=>{
      const withId = el.dataset.with;
      const bookId = el.dataset.book || '';
      location.hash = `#/chat?with=${encodeURIComponent(withId)}${bookId?`&book=${encodeURIComponent(bookId)}`:''}`;
    });

    frag.appendChild(el);
  }

  list.replaceChildren(frag);
}
