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

  if (!btn || !ta)
    return;

  btn.addEventListener('click', async () => {
    const text = (ta.value || '').trim();

    if (!text) 
    {
      alert('Please write your report.');
      ta.focus();

      return;
    }

    if (text.length > 5000) 
    {
      alert('Report is too long (max 5000 characters).');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';

    try 
    {
      await window.api.reports.create({ to, book, text });
      alert('Report sent ✓');
      const back = '#/chat' + (to ? `?with=${encodeURIComponent(to)}&book=${encodeURIComponent(book)}` : '');
      location.hash = back;
    } catch (e) 
    {
      alert('Failed to send report: ' + (e?.message || e));
    } finally 
    {
      btn.disabled = false;
      btn.textContent = 'Send';
    }
  });
}
