export async function init()
{
  const list   = document.getElementById('categoryList');
  const tplCat = document.getElementById('tpl-category-card');

  if (!list || !tplCat) 
    return;


  let categories = [];
  try 
  {
    const raw = await window.api.books.genres();
    categories = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
  } catch 
  { 
    categories = []; 
  }

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

    if (!btn) 
      return;
    const genre = btn.dataset.genre;

    
    location.hash = `#/category?g=${encodeURIComponent(genre)}`;
  });
}
