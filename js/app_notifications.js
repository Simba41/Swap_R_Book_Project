async function loadNotifs() 
{
  try 
  {
    return await window.api.notifications.list(); 
  } catch(e) 
  {
    console.error(e);
    return [];
  }
}

async function markRead(id) 
{
  try 
  { 
    await window.api.notifications.read(id); 
  } catch(e) 
  { 
    console.error(e); 
  }
}

export async function updateBellBadge() 
{
  const badge = document.getElementById('bellBadge');

  if (!badge) 
    return;

  let arr = [];
  try 
  { 
    arr = await window.api.notifications.list(true); 
  } 
  catch(e)
  { 
    console.error(e); 
  }

  const c = arr.length;

  if (c > 0) 
  {
    badge.style.display = 'grid';
    badge.textContent = String(c);
  } else 
  {
    badge.style.display = 'none';
    badge.textContent = '0';
  }
}

export async function init()
{
  const list = document.getElementById('notifList');
  const tpl  = document.getElementById('tpl-item');
  const empty= document.getElementById('tpl-empty');

  const arr = await loadNotifs();

  if (!arr.length) 
  {
    list.replaceChildren(empty.content.firstElementChild.cloneNode(true));
    await updateBellBadge();
    return;
  }

  const frag = document.createDocumentFragment();

  for (const n of arr) 
  {
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.dataset.id = n._id;
    el.querySelector('.n-title').textContent = n.title || 
       (n.type==='message' ? 'New message' : 'Notification');
    el.querySelector('.n-time').textContent  = new Date(n.createdAt||Date.now()).toLocaleString(); 
    el.querySelector('.n-text').textContent  = n.text || '';

    el.querySelector('.n-open').addEventListener('click', async () => 
    {
      await markRead(n._id);
      await updateBellBadge();

      if (n.link) location.hash = n.link; else alert(n.text || 'Opened');
    });

    if (!n.read) 
      el.style.borderColor = '#1B497D';

    frag.appendChild(el);
  }

  list.replaceChildren(frag);
  await updateBellBadge();
}
