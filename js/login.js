(() => {
  const form = document.getElementById('loginForm');
  const btn  = document.getElementById('submitBtn');
  const msg  = document.getElementById('formMsg');

  const apiURL = '/api/auth/login'; 

  function setMsg(text, type = '') 
  {
    msg.textContent = text || '';
    msg.className = `msg ${type}`;
  }

  function validEmail(v) 
  {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener('submit', async (e) => 
    {
        e.preventDefault();
        setMsg('');

        const data = Object.fromEntries(new FormData(form).entries());
        const { email, password } = data;

        if (!validEmail(email))               return setMsg('Please enter a valid email.', 'error');
        if (!password || password.length < 8) return setMsg('Password must be at least 8 characters.', 'error');

        btn.disabled = true;

        try 
        {
            const res = await fetch(apiURL, 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) 
            {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Sign in failed');
            }

            setMsg('Welcome back! Redirecting…', 'success');
      
            setTimeout(() => (window.location.href = 'browse.html'), 700);
        } catch (error) 
        {
            setMsg(error.message, 'error');
        } finally 
        {
            btn.disabled = false;
        }
  });
})();
