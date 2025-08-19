

(function () 
{
  const PROD = 'https://swap-r-book-project-server.onrender.com';
  window.API_BASE = PROD;

  window.getToken   = () => localStorage.getItem('token') || '';
  window.setToken   = (t) => localStorage.setItem('token', t);
  window.clearToken = () => localStorage.removeItem('token');
})();


async function apiFetch(
  path,
  { auth = false, method = 'GET', body, headers = {} } = {}
) {
  const h = { 'Content-Type': 'application/json', ...headers };

  if (auth) 
  {
    const t = getToken();

    if (!t) 
      throw new Error('NO_TOKEN');

    h.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try 
  {
    data = await res.json();
  } catch 
  {
    data = null;
  }

  if (!res.ok) 
    {
    const msg = (data && data.message) ? data.message : `HTTP ${res.status}`;
    
    if (res.status === 401) 
    {
      clearToken();
      
      if (!/login\.html$/i.test(location.pathname)) 
      {
        location.href = 'login.html';
      }
    }
    throw new Error(msg);
  }

  return data;
}


function buildQuery(obj = {}) 
{
  const q = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => 
  {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

window.api = {
  
  login:    (email, password) => apiFetch('/api/auth/login',    { method: 'POST', body: { email, password } }),
  register: (payload)         => apiFetch('/api/auth/register', { method: 'POST', body: payload }),

  
  me:       async () => (await apiFetch('/api/auth/me', { method: 'GET', auth: true })).user,

  users: { get: (id) => apiFetch(`/api/users/${id}`, { method: 'GET' }) },

  books: {
    list:   (params = {})   => apiFetch('/api/books' + buildQuery(params), { method: 'GET' }),
    
    genres: async ()        => (await apiFetch('/api/books/genres', { method: 'GET' })).items || [],
    get:    (id)            => apiFetch(`/api/books/${id}`,                { method: 'GET' }),
    create: (payload)       => apiFetch('/api/books',                      { method: 'POST',   auth: true, body: payload }),
    update: (id, payload)   => apiFetch(`/api/books/${id}`,                { method: 'PUT',    auth: true, body: payload }),
    remove: (id)            => apiFetch(`/api/books/${id}`,                { method: 'DELETE', auth: true }),
  },
};
