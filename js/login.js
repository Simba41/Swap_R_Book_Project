
function qs(id)
{ 
  return document.getElementById(id); 
}

function setBusy(busy)
{
  const btn = qs('btnLogin');
  btn.disabled = !!busy;
  btn.textContent = busy ? 'Signing in…' : 'Sign in';
}

function showMsg(text, danger=false)
{
  const el = qs('msg');
  el.textContent = text || '';
  el.style.color = danger ? '#b00020' : 'var(--muted,#6B7280)';
}

function validate()
{
  const ok = (qs('email').value.trim() !== '' && qs('pass').value.trim() !== '');
  qs('btnLogin').disabled = !ok;
}

async function doLogin()
{
  const email = qs('email').value.trim();
  const pass  = qs('pass').value.trim();

  if (!email || !pass) 
    return;

  setBusy(true); showMsg('');
  try
  {
    const res = await window.api.login(email, pass);

    if (!res || !res.token) 
      throw new Error('No token');

    window.setToken(res.token);
    location.href = 'app.html#/home';

  }catch(e)
  {
    const msg = (e && e.message) || '';
    if (/banned/i.test(msg))      showMsg('Your account is banned.', true);
    else if (/401|credentials|invalid/i.test(msg)) showMsg('Invalid email or password.', true);
    else                          showMsg('Failed: ' + msg, true);
    setBusy(false);
  }
}

export function init(){}


document.addEventListener('DOMContentLoaded', ()=>
{
  const email = qs('email');
  const pass  = qs('pass');
  const btn   = qs('btnLogin');

  email.addEventListener('input', validate);
  pass.addEventListener('input',  validate);

  // на Enter — логин
  [email, pass].forEach(inp => inp.addEventListener('keydown', (e)=>
  {
    if (e.key === 'Enter' && !btn.disabled) doLogin();
  }));

  btn.addEventListener('click', doLogin);

  try
  {
    if (window.getToken && window.getToken())
    {
      location.href = 'app.html#/home';
    }
  }catch{}
});
