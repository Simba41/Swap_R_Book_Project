async function loadNotifs() 
{
  try 
  {
    const d = await window.api.notifications.list();
    return Array.isArray(d?.items) ? d.items : [];
  } catch (e) 
  {
    console.error(" loadNotifs error:", e);
    return [];
  }
}

async function markRead(id) 
{
  try 
  {
    await window.api.notifications.read(id);
  } catch (e) 
  {
    console.error(" markRead error:", e);
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
    const d = await window.api.notifications.list(true); 
    arr = Array.isArray(d?.items) ? d.items : [];
  } catch (e) 
  {
    console.error(" updateBellBadge error:", e);
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

async function tryMarkAllRead() 
{
  try 
  {
    await fetch(`${window.API_BASE}/api/notifications/read-all`, 
    {
      method: 'PUT',
      headers: 
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.getToken()}`
      }
    });
  } catch (e) 
  {
   
  }
}

export async function init() 
{
  const list  = document.getElementById('notifList');
  const tpl   = document.getElementById('tpl-item');
  const empty = document.getElementById('tpl-empty');

  const arr = await loadNotifs();

  if (!arr.length) 
    {
    if (empty) list.replaceChildren(empty.content.firstElementChild.cloneNode(true));
    await updateBellBadge();
    return;
  }

  const frag = document.createDocumentFragment();

  for (const n of arr) 
  {
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.dataset.id = n._id;

    const title = n.title || (n.type === 'message' ? 'New message' : 'Notification');
    const txt   = n.text  || '(no text)';
    const link  = n.link  || '';

    el.querySelector('.n-title').textContent = title;
    el.querySelector('.n-time').textContent  = new Date(n.createdAt || Date.now()).toLocaleString();
    el.querySelector('.n-text').textContent  = txt;

    const btn = el.querySelector('.n-open');
    if (btn) 
    {
      btn.addEventListener('click', async () => 
      {
        await markRead(n._id);
        await updateBellBadge();
        if (link) location.hash = link;
      });
    }

    if (!n.read) el.style.borderColor = '#1B497D';
    frag.appendChild(el);
  }

  list.replaceChildren(frag);

  await tryMarkAllRead();
  await updateBellBadge();
}
