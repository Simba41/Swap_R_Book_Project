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

export async function updateBellBadge() {
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
    const txt   = n.text  || '';
    const link  = n.link  || '';

    const titleEl = el.querySelector('.n-title');
    const timeEl  = el.querySelector('.n-time');
    const textEl  = el.querySelector('.n-text');
    if (titleEl) titleEl.textContent = title;
    if (timeEl)  timeEl.textContent  = new Date(n.createdAt || Date.now()).toLocaleString();
    if (textEl)  textEl.textContent  = txt;

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


  try 
  { 
    await window.api.notifications.readAll?.(); 
  } catch {}
  await updateBellBadge();
}
