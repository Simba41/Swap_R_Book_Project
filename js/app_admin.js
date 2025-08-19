export async function init(){
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
    const q=document.getElementById('uq').value||'';
    const data = await window.api.admin.users({ q, limit:50, page:1 });

    if (!data.items.length) 
    { 
      feed.innerHTML='<p class="muted">No users</p>';
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
    feed.innerHTML=html;

    feed.querySelectorAll('button[data-act]').forEach(btn=>
    {
      btn.addEventListener('click', async ()=>
      {
        const id=btn.dataset.id, act=btn.dataset.act;

        if (act==='ban') 
          await window.api.admin.ban(id);

        else await window.api.admin.unban(id);

        await listUsers();
      });
    });
  }

  async function listBooks()
  {
    const q=document.getElementById('bq').value||'';
    const data = await window.api.admin.books({ q, limit:50, page:1 });

    if (!data.items.length) 
    { 
      feed.innerHTML='<p class="muted">No books</p>'; 
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
    feed.innerHTML=html;

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
      feed.innerHTML='<p class="muted">No reports</p>'; 
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
    feed.innerHTML=html;

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
      feed.innerHTML='<p class="muted">No changes</p>'; 
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
    feed.innerHTML=html;
  }

  document.getElementById('uSearch').addEventListener('click', listUsers);
  document.getElementById('bSearch').addEventListener('click', listBooks);
  document.getElementById('showReports').addEventListener('click', listReports);
  document.getElementById('showChanges').addEventListener('click', listChanges);
}
