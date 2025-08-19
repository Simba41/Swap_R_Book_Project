export async function init()
{
  try 
  {
    const m = await window.api.admin.metrics();
    document.getElementById('metrics').textContent =
      `USERS: ${m.users}  BOOKS: ${m.books}  MSGS: ${m.messages}  NOTIFS: ${m.notifications}`;
  } catch 
  {
    document.getElementById('metrics').textContent = 'metrics error';
  }

  const feed = document.getElementById('adminFeed');

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

    feed.querySelectorAll('button[data-act]').forEach(btn=>
    {
      btn.addEventListener('click', async ()=>{
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

    feed.querySelectorAll('button[data-del]').forEach(btn=>
    {
      btn.addEventListener('click', async ()=>
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

    feed.querySelectorAll('button[data-res]').forEach(btn=>
    {
      btn.addEventListener('click', async ()=>
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

  let msgPage = 1;
  const msgLimit = 50;

  function fmtUser(u)
  {
    if (!u) 
      return '-';

    if (typeof u === 'string') 
      return u; 

    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();

    return name || u.email || (u._id || '-');
  }

  async function listMessages()
  {
    const data = await window.api.admin.messages({ page: msgPage, limit: msgLimit });

    if (!data.items || !data.items.length)
    {
      feed.innerHTML = '<p class="muted">No messages</p>';
      return;
    }

    let html = `<div class="row" style="margin-bottom:12px">
      <input id="mq" class="input" placeholder="Search in messages..."/>
      <button id="mGo" class="btn">Search</button>
    </div>`;

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

    html += `<div class="pager" style="margin-top:12px;display:flex;gap:8px;align-items:center">
      <button id="mPrev" class="btn" ${data.page<=1?'disabled':''}>Prev</button>
      <span>Page ${data.page} / ${data.pages||1}</span>
      <button id="mNext" class="btn" ${data.page>=data.pages?'disabled':''}>Next</button>
    </div>`;

    feed.innerHTML = html;


    feed.querySelector('#mPrev')?.addEventListener('click', async ()=>
    {
      if (msgPage > 1) 
      { 
        msgPage--; 
        await listMessages(); 
      }
    });
    feed.querySelector('#mNext')?.addEventListener('click', async ()=>
    {
      if (!data.pages || msgPage < data.pages) 
      { 
        msgPage++; 
        await listMessages(); 
      }
    });
    feed.querySelector('#mGo')?.addEventListener('click', async ()=>
    {
      const q = (feed.querySelector('#mq')?.value || '').trim();
      msgPage = 1;
      const res = await window.api.admin.messages({ page: msgPage, limit: msgLimit, q });

      if (!res.items || !res.items.length)
      {
        feed.innerHTML = '<p class="muted">No messages</p>';
        return;
      }


      const backup = { items: res.items, page: res.page, pages: res.pages };


      feed.innerHTML = '';
      await listMessages();
    });
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
    btnMsgs.addEventListener('click', listMessages);
    ctrl.appendChild(btnMsgs);
  }
}
