(() => 
  {
    const form = document.getElementById('loginForm');
    const btn  = document.getElementById('submitBtn') || form.querySelector('button[type="submit"]');
    const msg  = document.getElementById('formMsg');

    function setMsg(text, type = '')
    {

      if (!msg)
        return;


      msg.textContent = text || '';
      msg.className = `msg ${type}`;
    }

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    form.addEventListener('submit', async (e) =>
    {
      e.preventDefault();
      setMsg('');

      const data = Object.fromEntries(new FormData(form).entries());
      const { email, password } = data;

      if (!validEmail(email))               
        return setMsg('Please enter a valid email.', 'error');  


      if (!password || password.length < 8) 
        return setMsg('Password must be at least 8 characters.', 'error');


      btn && (btn.disabled = true);

      try 
      {
        const { token, user } = await window.api.login(email, password);
        window.setToken(token);
        setMsg(`Welcome back, ${user.firstName}! Redirecting…`, 'success');

        location.replace('app.html'); 
        return;

      } catch (error) 
      {
        setMsg(error.message, 'error');
      } finally 
      {
        btn && (btn.disabled = false);
      }
  });
})();
