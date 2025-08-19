function getHashParam(name)
{
  const m = location.hash.match(new RegExp(`[?&]${name}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

export function init()
{
  const to   = getHashParam('to')   || '';
  const book = getHashParam('book') || '';
  const btn  = document.getElementById('rpSend');
  const ta   = document.getElementById('rpText');

  btn.addEventListener('click', async () => 
  {
    const text = (ta.value || '').trim();

    if (!text) 
      return alert('Please write your report.');

    try
    {
      const headers = { 'Content-Type': 'application/json' };
      const t = window.getToken?.();

      if (t) 
        headers.Authorization = `Bearer ${t}`;

      const res = await fetch(`${API_BASE}/api/reports`, 
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ to, book, text })
      });

      if (res.ok) 
      {
        alert('Report sent ✓');
        location.hash = '#/chat' + (to ? `?with=${encodeURIComponent(to)}&book=${encodeURIComponent(book)}` : '');
        return;
      }
    }
    catch {}

    console.log('REPORT_SENT_DEMO', { to, book, text });
    alert('Report queued locally (demo).');
    location.hash = '#/chat' + (to ? `?with=${encodeURIComponent(to)}&book=${encodeURIComponent(book)}` : '');
  });
}
