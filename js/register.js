(() => {
  const form = document.getElementById('registerForm');
  const btn  = document.getElementById('submitBtn');
  const msg  = document.getElementById('formMsg');

  const apiURL = '/api/auth/register'; 

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
        const { firstName, lastName, email, password, confirm } = data;

        if (!firstName || firstName.length < 2)  return setMsg('Please enter your first name.', 'error');
        if (!lastName  || lastName.length  < 2)  return setMsg('Please enter your last name.', 'error');
        if (!validEmail(email))                  return setMsg('Please enter a valid email.', 'error');
        if (!password || password.length < 8)    return setMsg('Password must be at least 8 characters.', 'error');
        if (password !== confirm)                return setMsg('Passwords do not match.', 'error');


        btn.disabled = true;

        try 
        {
            const res = await fetch(apiURL, 
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, password })
                }                  );

            if (!res.ok) 
            {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Registration failed');
            }

            setMsg('Account created. Redirecting…', 'success');
      
            setTimeout(() => window.location.href = 'login.html', 700);

        } catch (error) 
        {
            setMsg(error.message, 'error');
        } finally 
        {
            btn.disabled = false;
        }
    }           );
})();
