export async function init()
{
  try
  {
    const m = await window.api.admin.metrics();
    document.getElementById('metrics').textContent =
      `USERS: ${m.users}  BOOKS: ${m.books}  MSGS: ${m.messages}  NOTIFS: ${m.notifications}`;
  }
  catch
  {
    document.getElementById('metrics').textContent = 'metrics error';
  }

  const feed = document.getElementById('adminFeed');

  async function httpGet(url, params)
  {
    const qs = params && Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
    const headers = { 'Content-Type': 'application/json' };
    if (window.getToken)
    {
      const t = window.getToken();
      if (t) headers.Authorization = `Bearer ${t}`;
    }
    const res = await fetch(url + qs, { headers, credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  const adminApi =
  {
    conversations: async () =>
      (window.api?.admin?.conversations ? window.api.admin.conversations() : httpGet('/api/admin/conversations')),

    messages: async (p) =>
      (window.api?.admin?.messages ? window.api.admin.messages(p) : httpGet('/api/admin/messages', p))
  };


  async function listUsers()
  {
    const q = document.getElementById('uq').value || '';
    const data = await window.api.admin.users({ q, limit:50, page:1 });

    if (!data.items.length)
    {
      feed.innerHTML = '<p class="muted">No users</p>';
      return;
    }

    let html = `<table class="admin-table"><thead>
      <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Banned</th><th>Action</th></tr>
    </thead><tbody>`;

    for (const u of data.items)
    {
      html += `<tr>
        <td>${u._id}</td>
        <td>${u.firstName||''} ${u.lastName||''}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.banned}</td>
        <td>
          <button data-act="${u.banned?'unban':'ban'}" data-id="${u._id}" class="btn small">
            ${u.banned?'Unban':'Ban'}
          </button>
        </td>
      </tr>`;
    }
    html += `</tbody></table>`;
    feed.innerHTML = html;

    feed.querySelectorAll('button[data-act]').forEach(btn =>
    {
      btn.addEventListener('click', async () =>
      {
        const id  = btn.dataset.id;
        const act = btn.dataset.act;

        if (act === 'ban') await window.api.admin.ban(id);
        else               await window.api.admin.unban(id);

        await listUsers();
      });
    });
  }


  async function listBooks()
  {
    const q = document.getElementById('bq').value || '';
    const data = await window.api.admin.books({ q, limit:50, page:1 });

    if (!data.items.length)
    {
      feed.innerHTML = '<p class="muted">No books</p>';
      return;
    }

    let html = `<table class="admin-table"><thead>
      <tr><th>ID</th><th>Title</th><th>Author</th><th>Owner</th><th>Action</th></tr>
    </thead><tbody>`;

    for (const b of data.items)
    {
      html += `<tr>
        <td>${b._id}</td>
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.ownerId}</td>
        <td><button data-del="${b._id}" class="btn small danger">Delete</button></td>
      </tr>`;
    }

    html += `</tbody></table>`;
    feed.innerHTML = html;

    feed.querySelectorAll('button[data-del]').forEach(btn =>
    {
      btn.addEventListener('click', async () =>
      {
        await window.api.books.remove(btn.dataset.del);
        await listBooks();
      });
    });
  }


  async function listReports()
  {
    const data = await window.api.admin.reports({ limit:50, page:1 });

    if (!data.items.length)
    {
      feed.innerHTML = '<p class="muted">No reports</p>';
      return;
    }

    let html = `<table class="admin-table"><thead>
      <tr><th>ID</th><th>From</th><th>To</th><th>Book</th><th>Text</th><th>Resolved</th><th>Action</th></tr>
    </thead><tbody>`;

    for (const r of data.items)
    {
      html += `<tr>
        <td>${r._id}</td>
        <td>${r.from||'-'}</td>
        <td>${r.to||'-'}</td>
        <td>${r.book||'-'}</td>
        <td>${r.text}</td>
        <td>${r.resolved}</td>
        <td><button data-res="${r._id}" class="btn small">Resolve</button></td>
      </tr>`;
    }
    html += `</tbody></table>`;
    feed.innerHTML = html;

    feed.querySelectorAll('button[data-res]').forEach(btn =>
    {
      btn.addEventListener('click', async () =>
      {
        await window.api.admin.resolveReport(btn.dataset.res);
        await listReports();
      });
    });
  }


  async function listChanges()
  {
    const data = await window.api.admin.changes({ limit:50, page:1 });

    if (!data.items.length)
    {
      feed.innerHTML = '<p class="muted">No changes</p>';
      return;
    }

    let html = `<table class="admin-table"><thead>
      <tr><th>Date</th><th>User</th><th>Field</th><th>From</th><th>To</th></tr>
    </thead><tbody>`;

    for (const c of data.items)
    {
      html += `<tr>
        <td>${new Date(c.createdAt).toLocaleString()}</td>
        <td>${c.userId}</td>
        <td>${c.field}</td>
        <td>${c.from}</td>
        <td>${c.to}</td>
      </tr>`;
    }
    html += `</tbody></table>`;
    feed.innerHTML = html;
  }


  function fmtUser(u)
  {
    if (!u) return '-';
    if (typeof u === 'string') return u;
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name || u.email || (u._id || '-');
  }

  async function listConversations()
  {
    const data = await adminApi.conversations();

    if (!data.items.length)
    {
      feed.innerHTML = '<p class="muted">No conversations</p>';
      return;
    }

    let html = `<h2>Conversations</h2><ul class="chat-list">`;
    for (const c of data.items)
    {
      html += `<li data-conv="${c.conv}" class="chat-item">
        <b>${fmtUser(c.from)}</b> ↔ <b>${fmtUser(c.to)}</b><br>
        ${new Date(c.updatedAt).toLocaleString()} — ${c.lastText}
      </li>`;
    }
    html += `</ul>`;
    feed.innerHTML = html;

    feed.querySelectorAll('.chat-item').forEach(li =>
    {
      li.addEventListener('click', () => showConversation(li.dataset.conv));
    });
  }

  async function showConversation(convId)
  {
    const data = await adminApi.messages({ conv: convId });

    if (!data.items.length)
    {
      feed.innerHTML = '<p class="muted">No messages in this conversation</p>';
      return;
    }

    let html = `<button id="backToConvs" class="btn">← Back</button>`;
    html += `<table class="admin-table"><thead>
      <tr><th>Date</th><th>From</th><th>To</th><th>Text</th></tr>
    </thead><tbody>`;

    for (const m of data.items)
    {
      html += `<tr>
        <td>${new Date(m.createdAt).toLocaleString()}</td>
        <td>${fmtUser(m.from)}</td>
        <td>${fmtUser(m.to)}</td>
        <td>${m.text}</td>
      </tr>`;
    }

    html += `</tbody></table>`;
    feed.innerHTML = html;

    document.getElementById('backToConvs').addEventListener('click', listConversations);
  }


  document.getElementById('uSearch').addEventListener('click', listUsers);
  document.getElementById('bSearch').addEventListener('click', listBooks);
  document.getElementById('showReports').addEventListener('click', listReports);
  document.getElementById('showChanges').addEventListener('click', listChanges);

  const ctrl = document.querySelector('.admin-controls');
  if (ctrl && !ctrl.querySelector('#btnMsgsAdmin'))
  {
    const btnMsgs = document.createElement('button');
    btnMsgs.id = 'btnMsgsAdmin';
    btnMsgs.className = 'btn';
    btnMsgs.textContent = 'Messages';
    btnMsgs.addEventListener('click', listConversations);
    ctrl.appendChild(btnMsgs);
  }
}
