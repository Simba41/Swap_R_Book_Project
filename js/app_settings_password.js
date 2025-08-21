export async function init() 
{
  const save = document.getElementById('save');
  const cur  = document.getElementById('cur');
  const npw  = document.getElementById('npw');

  if (!save || !cur || !npw) 
    return;


  save.addEventListener('click', async () => 
  {
    const currentPassword = cur.value;
    const newPassword     = npw.value;

    if (!currentPassword) 
    { 
      alert('Enter current password'); 
      cur.focus(); 
      return; 
    }


    if (!newPassword || newPassword.length < 8) 
    {
      alert('Use at least 8 characters'); npw.focus(); 
      return;
    }

    save.disabled = true; save.textContent = 'Saving…';

    try 
    {
      await window.api.users.password({ currentPassword, newPassword });
      alert('Password changed ✓');
      location.hash = '#/settings';
    } catch (e) 
    {
      alert(e?.message || String(e));
    } finally 
    {
      save.disabled = false; save.textContent = 'Save';
      cur.value = ''; npw.value = '';
    }
  });
}
