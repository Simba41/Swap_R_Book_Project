export async function init()
{
  let me = null;
  try 
  { 
    me = await window.api.me(); 
  } catch 
  { 
    me = null; 
  }

  const fullName = [me?.firstName, me?.lastName].filter(Boolean).join(' ') || 'Friend';
  document.getElementById('profName').textContent  = fullName;
  document.getElementById('profEmail').textContent = me?.email || '';

  const file = document.getElementById('profFile');
  const img  = document.getElementById('profImg');
  
  const adminTile = document.getElementById('adminTile'); 
  if (adminTile) adminTile.style.display = (me?.role === 'admin') ? '' : 'none';

  document.getElementById('profPlus').addEventListener('click', ()=> file.click());
  file.addEventListener('change', e =>
  {
    const f = e.target.files?.[0]; 

    if (!f) 
      return;

    const r = new FileReader(); 
    r.onload = () => 
    { 
      localStorage.setItem('avatar_data', r.result); 
      img.src = r.result; 
    }; 

    r.readAsDataURL(f);
  });

  const saved = localStorage.getItem('avatar_data'); 

  if (saved) 
    img.src = saved;

  document.getElementById('logoutBtn').addEventListener('click', () =>
  {
    window.clearToken?.();
    alert('Logged out');
    location.href = 'login.html';
  });
}