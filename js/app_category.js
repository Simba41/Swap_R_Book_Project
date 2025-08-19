function getHashParam(name)
{
  const m = location.hash.match(new RegExp(`[?&]${name}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

export async function init()
{
  const list   = document.getElementById('categoryList');
  const tplCat = document.getElementById('tpl-category-card');

  if (!list) return;

  const genre = getHashParam('g');
  if (genre)
  {
    let books = [];
    try
    {
      const res = await window.api.books.list(); 
      books = Array.isArray(res?.items) ? res.items : [];
    } catch {}

    const g = String(genre).toLowerCase();
    const filtered = books.filter(b =>
    {
      const tags  = (b.tags || []).map(t => String(t).toLowerCase());
      const g1    = String(b.genre || b.category || '').toLowerCase();
      return tags.includes(g) || g1 === g;
    });

    if (!filtered.length)
    {
      list.innerHTML = `<p class="muted">No books in “${genre}” yet.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();
    for (const b of filtered)
    {
      const n = document.createElement('article');
      n.className = 'card soft';
      n.innerHTML = `
        <div><b>${b.title || ''}</b> — ${b.author || ''}</div>
        <div class="muted">${(b.tags||[]).join(', ')}</div>`;
      n.addEventListener('click', () => {
        const id = b._id || b.id;
        if (id) location.hash = `#/book?id=${encodeURIComponent(id)}`;
      });
      frag.appendChild(n);
    }
    list.replaceChildren(frag);
    return;
  }


  if (!tplCat) return;

  let categories = [];
  try
  {
    const raw = await window.api.books.genres();
    categories = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
  } catch { categories = []; }

  const frag = document.createDocumentFragment();
  categories.forEach(c =>
  {
    const node = tplCat.content.firstElementChild.cloneNode(true);
    node.dataset.genre = c;
    node.querySelector('.category-title').textContent = c;
    frag.appendChild(node);
  });
  list.replaceChildren(frag);

  list.addEventListener('click', (e) =>
  {
    const btn = e.target.closest('.category-card');
    if (!btn) return;
    const genre = btn.dataset.genre;
    location.hash = `#/category?g=${encodeURIComponent(genre)}`;
  });
}
