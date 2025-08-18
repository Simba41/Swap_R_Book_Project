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

  btn.addEventListener('click', () => 
  {
    const text = (ta.value || '').trim();
    if (!text) 
      return alert('Please write your report.');
    
    // демо-отправка
    console.log('REPORT_SENT', { to, book, text });
    alert('Report has been sent to admin (demo).');
    location.hash = '#/chat' + (to ? `?with=${encodeURIComponent(to)}&book=${encodeURIComponent(book)}` : '');
  });
}
