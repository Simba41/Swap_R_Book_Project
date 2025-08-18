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

export function init()
{
  const list = document.getElementById('notifList');
  const tpl  = document.getElementById('tpl-item');
  const empty= document.getElementById('tpl-empty');

  const arr = loadNotifs();

  if (!arr.length)
  { 
    list.replaceChildren(empty.content.firstElementChild.cloneNode(true)); 
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
      if (n.link) location.hash = n.link; else alert('Opened (demo)');
    });

    if (!n.read) 
      el.style.borderColor = '#1B497D';

    frag.appendChild(el);
  });
  
  list.replaceChildren(frag);
}
