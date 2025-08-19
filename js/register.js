(() => 
{
  const form = document.getElementById('registerForm');
  const btn  = document.getElementById('submitBtn') || form.querySelector('button[type="submit"]');
  const msg  = document.getElementById('formMsg');

  function setMsg(text, type = '') { if (!msg) return; msg.textContent = text || ''; msg.className = `msg ${type}`; }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  form.addEventListener('submit', async (e) =>
  {
    e.preventDefault();
    setMsg('');

    const data = Object.fromEntries(new FormData(form).entries());
    const { firstName, lastName, email, password, confirm } = data;

    if (!firstName || firstName.length < 2)  return setMsg('Please enter your first name.', 'error');
    if (!lastName  || lastName.length  < 2)  return setMsg('Please enter your last name.', 'error');
    if (!validEmail(email))                  return setMsg('Please enter a valid email.', 'error');
    if (!password || password.length < 8)    return setMsg('Password must be at least 8 characters.', 'error');
    if (password !== confirm)                return setMsg('Passwords do not match.', 'error');

    btn && (btn.disabled = true);

    try 
    {
      await window.api.register({ firstName, lastName, email, password });
      setMsg('Account created. Redirecting…', 'success');
      setTimeout(() => location.replace('login.html'), 700); // 700 мс на чтение сообщения
    } catch (error) 
    {
      setMsg(error.message, 'error');
    } finally 
    {
      btn && (btn.disabled = false);
    }
  });
})();
