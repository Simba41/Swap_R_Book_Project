(function () 
{
  const PROD = 'https://swap-r-book-project-server.onrender.com';
  window.API_BASE = PROD;

  window.getToken   = () => localStorage.getItem('token') || '';
  window.setToken   = (t) => localStorage.setItem('token', t);
  window.clearToken = () => localStorage.removeItem('token');
})();

async function apiFetch(path, { auth=false, method='GET', body, headers={} } = {}) 
{
  const h = { 'Content-Type': 'application/json', ...headers };

  if (auth) 
  {
    const t = window.getToken();

    if (!t) 
      throw new Error('NO_TOKEN');

    h.Authorization = `Bearer ${t}`;
  }

  const res  = await fetch(`${API_BASE}${path}`, { 
    method, 
    headers: h, 
    body: body ? JSON.stringify(body) : undefined 
  });

  let data = null;
  try 
  { 
    data = await res.json(); 
  } catch {}

  if (!res.ok) 
  {
    const msg = (data && data.message) ? data.message : `HTTP ${res.status}`;
    if (res.status === 401) 
    {
      window.clearToken();
      if (!/login\.html$/i.test(location.pathname)) location.href = 'login.html';
    }
    throw new Error(msg);
  }
  return data;
}

function buildQuery(obj={}) 
{
  const q = new URLSearchParams();
  for (const [k,v] of Object.entries(obj))
    if (v!==undefined && v!==null && v!=='') q.set(k,v);
  const s = q.toString();
  return s ? `?${s}` : '';
}

window.api = 
{
  login:    (email, password) => apiFetch('/api/auth/login',    { method:'POST', body:{ email, password } }),
  register: (payload)         => apiFetch('/api/auth/register', { method:'POST', body: payload }),
  me:       async ()          => (await apiFetch('/api/auth/me', { auth:true })).user,

  users: 
  {
    get:     async (id) => (await apiFetch(`/api/users/${id}`, { method:'GET' })).user,
    update:  async (payload) => (await apiFetch('/api/users/me', { method:'PUT', auth:true, body: payload })).user,
    password:({ currentPassword, newPassword }) =>
              apiFetch('/api/users/me/password', { method:'PUT', auth:true, body:{ currentPassword, newPassword } }),
  },

  books: 
  {
    list:   (params={}) => apiFetch('/api/books' + buildQuery(params), { method:'GET' }),
    genres: async ()    => (await apiFetch('/api/books/genres', { method:'GET' })).items || [],
    get:    (id)        => apiFetch(`/api/books/${id}`, { method:'GET' }),
    create: (p)         => apiFetch('/api/books', { method:'POST', auth:true, body:p }),
    update: (id,p)      => apiFetch(`/api/books/${id}`, { method:'PUT', auth:true, body:p }),
    remove: (id)        => apiFetch(`/api/books/${id}`, { method:'DELETE', auth:true }),
    like:   (id)        => apiFetch(`/api/books/${id}/like`, { method:'POST', auth:true }),
    unlike: (id)        => apiFetch(`/api/books/${id}/like`, { method:'DELETE', auth:true }),
    liked:  ()          => apiFetch('/api/books' + buildQuery({ liked:'me' }), { method:'GET', auth:true }),
  },

  messages: 
  {
    list: (params={}) => apiFetch('/api/messages' + buildQuery(params), { auth:true }),
    send: ({ to, text, book=null }) =>
          apiFetch('/api/messages/send', { method:'POST', auth:true, body:{ to, text, book } }),
  },

  notifications: 
  {
    list: (unread=false) => apiFetch('/api/notifications' + buildQuery({ unread: unread ? 'true' : 'false' }), { auth:true }),
    read: (id)           => apiFetch(`/api/notifications/${id}/read`, { method:'PUT', auth:true }),
  },

  reports: 
  { 
    create: (payload) => apiFetch('/api/reports', { method:'POST', auth:true, body: payload }) 
  },

  swaps: 
  {
    get:    (p) => apiFetch('/api/swaps' + buildQuery(p), { auth:true }),
    toggle: (p) => apiFetch('/api/swaps/toggle', { method:'POST', auth:true, body:p }),
  },

  admin: 
  {
    metrics: ()          => apiFetch('/api/admin/metrics', { auth:true }),
    users:   (params={}) => apiFetch('/api/admin/users' + buildQuery(params), { auth:true }),
    ban:     (id)        => apiFetch(`/api/admin/users/${id}/ban`,   { method:'PUT', auth:true }),
    unban:   (id)        => apiFetch(`/api/admin/users/${id}/unban`, { method:'PUT', auth:true }),
    books:   (params={}) => apiFetch('/api/admin/books' + buildQuery(params), { auth:true }),
    messages:(params={}) => apiFetch('/api/admin/messages' + buildQuery(params), { auth:true }),
    reports: (params={}) => apiFetch('/api/admin/reports' + buildQuery(params), { auth:true }),
    resolveReport: (id)  => apiFetch(`/api/admin/reports/${id}/resolve`, { method:'PUT', auth:true }),
    changes: (params={}) => apiFetch('/api/admin/changes' + buildQuery(params), { auth:true }),
  },
};
