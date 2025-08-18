import { appCategories, demoCategories } from './demo-data.js';

const CATEGORY_CSS = 'css/category.css';

function ensureCategoryCSS() {
  if (!document.querySelector('link[data-page="category"]')) 
  {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CATEGORY_CSS;
    link.dataset.page = 'category';
    document.head.appendChild(link);
  }
}

export function init() 
{
  ensureCategoryCSS();

  const categories =
    (Array.isArray(appCategories) && appCategories.length ? appCategories : demoCategories) || [];

  const list   = document.getElementById('categoryList');
  const tplCat = document.getElementById('tpl-category-card');

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
