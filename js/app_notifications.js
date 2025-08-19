function loadNotifs()
{
  try
  { 
    return JSON.parse(localStorage.getItem('notifications')||'[]'); 
  }
  catch
  { 
    return []; 
  }
}


function saveNotifs(arr)
{ 
  localStorage.setItem('notifications', JSON.stringify(arr)); 
}


function updateBellBadge()
{
  const badge = document.getElementById('bellBadge');

  if (!badge) 
    return;

  const arr = loadNotifs();
  const c = (arr||[]).filter(n=>!n.read).length;

  if (c>0) 
  { 
      badge.style.display='grid'; 
      badge.textContent=String(c); 
  }
  else 
  { 
    badge.style.display='none'; 
    badge.textContent='0'; 
  }
}



export function init()
{
  const list = document.getElementById('notifList');
  const tpl  = document.getElementById('tpl-item');
  const empty= document.getElementById('tpl-empty');

  const arr = loadNotifs();

  if (!arr.length)
  { 
    list.replaceChildren(empty.content.firstElementChild.cloneNode(true)); 
    updateBellBadge();
    return; 
  }

  const frag = document.createDocumentFragment();

  arr.forEach(n=>
  {
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.dataset.id = n.id;
    el.querySelector('.n-title').textContent = n.title || 'Notification';
    el.querySelector('.n-time').textContent  = new Date(n.ts||Date.now()).toLocaleString();
    el.querySelector('.n-text').textContent  = n.text || '';
    el.querySelector('.n-open').addEventListener('click', ()=>
    
    {
      n.read = true; saveNotifs(arr);
      saveNotifs(arr);
      updateBellBadge();
      if (n.link) location.hash = n.link; else alert('Opened (demo)');
    });

    if (!n.read) 
      el.style.borderColor = '#1B497D';

    frag.appendChild(el);
  });
  
  list.replaceChildren(frag);
  updateBellBadge();
}
