import { currentUser } from './demo-data.js';

export function init()
{
  document.getElementById('profName').textContent  = currentUser.name || 'User';
  document.getElementById('profEmail').textContent = currentUser.email || '';

  const file = document.getElementById('profFile');
  const img  = document.getElementById('profImg');

  document.getElementById('profPlus').addEventListener('click', ()=> file.click());
  file.addEventListener('change', e=>
  {
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>
    { 
      localStorage.setItem('avatar_data', r.result); img.src=r.result; 
    }; 
    r.readAsDataURL(f);
  });

  // восстановление сохранённого
  const saved = localStorage.getItem('avatar_data'); if (saved) img.src = saved;

  document.getElementById('logoutBtn').addEventListener('click', ()=>
  {
    localStorage.removeItem('token');
    alert('Logged out (demo)');
    location.href = 'login.html';
  });
}
