export async function init()
{
  const email = document.getElementById('email');
  const save  = document.getElementById('save');

  if (!email || !save) 
    return;

  try
  {
    const me = await window.api.me();
    email.value = me.email || '';
  } catch {}

  function isEmail(v) 
  {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  save.addEventListener('click', async () => 
  {
    const v = email.value.trim();

    if (!isEmail(v)) 
    {
      alert('Enter a valid email');
      email.focus();
      return;
    }

    save.disabled = true; save.textContent = 'Saving…';

    try 
    {
      await window.api.users.update({ email: v });
      alert('Updated ✓');
      location.hash = '#/settings';
    } catch (e) 
    {
      alert(e?.message || String(e));
    } finally 
    {
      save.disabled = false; save.textContent = 'Save';
    }
  });
}
