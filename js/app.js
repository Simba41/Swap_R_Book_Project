const app = document.getElementById('app');
const tabs = document.querySelectorAll('.tabbar .tab');

const routes = 
{
  '/home':        { view: 'app_home.html',            module: () => import('./app_home.js') },
  '/categories':  { view: 'app_category.html',        module: () => import('./app_category.js') },
  '/category':    { view: 'app_category_detail.html', module: () => import('./app_category_detail.js') },
  '/book':        { view: 'app_book.html',            module: () => import('./app_book.js') },
};

async function loadHTML(fileName)
{
  const res = await fetch(`./${fileName}`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load ${fileName}`);
  return res.text();
}

function setActiveTab(hash)
{
  tabs.forEach(t => t.classList.toggle('active', t.getAttribute('href') === hash));
}

async function router()
{
  const hash = location.hash || '#/home';
  setActiveTab(hash);
  const key = hash.replace('#','').split('?')[0];
  const route = routes[key] || routes['/home'];

  try 
  {
    app.innerHTML = await loadHTML(route.view);
    const mod = await route.module();
    if (typeof mod.init === 'function') await mod.init();
  } catch (err) 
  {
    app.innerHTML = `<p class="muted">Error: ${err.message}</p>`;
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
