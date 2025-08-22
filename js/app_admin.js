export async function init() 
{
  const feed = document.getElementById('adminFeed');

  try 
  {
    const m = await window.api.admin.metrics();
    document.getElementById('metrics').textContent =
      `USERS: ${m.users}  BOOKS: ${m.books}  MSGS: ${m.messages}  NOTIFS: ${m.notifications}`;
  } catch 
  {
    document.getElementById('metrics').textContent = 'metrics error';
  }

  const fmtUser = (u) => 
  {
    if (!u) 
      return '-';

    if (typeof u === 'string') 
      return u;

    const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return full || u.email || (u._id || '-');
  };


  async function listConversations() 
  {
    const data = await window.api.admin.conversations();
    if (!data.items.length) 
    {
      feed.innerHTML = '<p class="muted">No conversations</p>';
      return;
    }
    let html = 
    `<h2>Conversations</h2>
    <table class="admin-table">
      <thead>
        <tr><th>From</th><th>To</th><th>Updated</th><th>Last Text</th></tr>
      </thead><tbody>`;

    for (const c of data.items) 
    {
      html += `<tr data-conv="${c.conv}" class="chat-item">
        <td>${fmtUser(c.from)}</td>
        <td>${fmtUser(c.to)}</td>
        <td>${new Date(c.updatedAt).toLocaleString()}</td>
        <td>${c.lastText || ''}</td>
      </tr>`;
    }
    html += `</tbody></table>`;
    feed.innerHTML = html;
    feed.querySelectorAll('.chat-item').forEach(tr => 
    {
      tr.addEventListener('click', () => showConversation(tr.dataset.conv));
    });
  }

  async function showConversation(convId) 
  {
    const data = await window.api.admin.messages({ conv: convId });
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

  async function listAllMessages() 
  {
    const data = await window.api.admin.messages({ page: 1, limit: 200 });
    let html = 
    `<h2>All Messages (latest)</h2>`;

    if (!data.items || !data.items.length) 
    {
      html += 
      '<p class="muted">No messages</p>';
      feed.innerHTML = html;
      return;
    }

    html += 
    `<table class="admin-table"><thead>
      <tr><th>Date</th><th>From</th><th>To</th><th>Text</th><th>Conv</th></tr>
    </thead><tbody>`;

    for (const m of data.items) 
    {
      html += 
      `<tr>
        <td>${new Date(m.createdAt).toLocaleString()}</td>
        <td>${fmtUser(m.from)}</td>
        <td>${fmtUser(m.to)}</td>
        <td>${m.text}</td>
        <td>${m.conv}</td>
      </tr>`;
    }
    html += `</tbody></table>`;
    feed.innerHTML = html;
  }

  document.getElementById('btnMsgsAdmin')?.addEventListener('click', listConversations);
  document.getElementById('btnAllMsgs')?.addEventListener('click', listAllMessages);


  document.getElementById('uSearch')?.addEventListener('click', async () => 
  {
    const q = document.getElementById('uq').value.trim();
    const data = await window.api.admin.users({ q });

    feed.innerHTML = 
    `<h2>Users</h2>
    <table class="admin-table">
      <thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
      <tbody>
        ${data.items.map(u => `
          <tr>
            <td>${fmtUser(u)}</td>
            <td>${u.role}</td>
            <td>${u.banned ? 'BANNED' : 'Active'}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  });


  document.getElementById('bSearch')?.addEventListener('click', async () => 
  {
    const q = document.getElementById('bq').value.trim();
    const data = await window.api.admin.books({ q });
    feed.innerHTML = 
    `<h2>Books</h2>
    <table class="admin-table">
      <thead><tr><th>Title</th><th>Author</th></tr></thead>
      <tbody>
        ${data.items.map(b => `
          <tr>
            <td>${b.title}</td>
            <td>${b.author}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  });


  document.getElementById('showReports')?.addEventListener('click', async () => 
  {
    const data = await window.api.admin.reports();
    feed.innerHTML = 
    `<h2>Reports</h2>
    <table class="admin-table">
      <thead><tr><th>Text</th><th>Status</th></tr></thead>
      <tbody>
        ${data.items.map(r => `
          <tr>
            <td>${r.text}</td>
            <td>${r.status}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  });


  document.getElementById('showChanges')?.addEventListener('click', async () => 
  {
    const data = await window.api.admin.changes();
    feed.innerHTML = 
    `<h2>Changes</h2>
    <table class="admin-table">
      <thead><tr><th>User</th><th>Field</th><th>From</th><th>To</th></tr></thead>
      <tbody>
        ${data.items.map(c => `
          <tr>
            <td>${c.userId}</td>
            <td>${c.field}</td>
            <td>${c.from}</td>
            <td>${c.to}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  });
}
