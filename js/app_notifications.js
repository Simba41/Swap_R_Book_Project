async function loadNotifs() 
{
  try 
  {
    const d = await window.api.notifications.list(); 
    return Array.isArray(d?.items) ? d.items : [];
  } catch (e) 
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
  } catch (e) 
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
    const d = await window.api.notifications.list(true);
    arr = Array.isArray(d?.items) ? d.items : [];
  } catch (e) 
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

    const title = n.title ?? n.data?.title ?? (n.type === 'message' ? 'New message' : 'Notification');
    const txt   = n.text  ?? n.data?.text  ?? '';
    const link  = n.link  ?? n.data?.link  ?? '';

    el.querySelector('.n-title').textContent = title;
    el.querySelector('.n-time').textContent  = new Date(n.createdAt || Date.now()).toLocaleString();
    el.querySelector('.n-text').textContent  = txt;

    el.querySelector('.n-open').addEventListener('click', async () => {
      await markRead(n._id);
      await updateBellBadge();
      if (link) location.hash = link;
    });

    
    if (!n.read) el.style.borderColor = '#1B497D';
    frag.appendChild(el);
  }

  list.replaceChildren(frag);
  await updateBellBadge();
}
