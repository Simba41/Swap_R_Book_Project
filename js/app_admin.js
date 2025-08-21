
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
    let html = `<h2>Conversations</h2><ul class="chat-list">`;
    for (const c of data.items) 
    {
      html += `<li data-conv="${c.conv}" class="chat-item">
        <b>${fmtUser(c.from)}</b> ↔ <b>${fmtUser(c.to)}</b><br>
        ${new Date(c.updatedAt).toLocaleString()} — ${c.lastText || ''}
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
    let html = `<h2>All Messages (latest)</h2>`;
    if (!data.items || !data.items.length) 
      {
      html += '<p class="muted">No messages</p>';
      feed.innerHTML = html;
      return;
    }
    html += `<table class="admin-table"><thead>
      <tr><th>Date</th><th>From</th><th>To</th><th>Text</th><th>Conv</th></tr>
    </thead><tbody>`;
    for (const m of data.items) 
    {
      html += `<tr>
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
    feed.innerHTML = '<h2>Users</h2><ul>' + data.items.map(
      u => `<li>${fmtUser(u)} — ${u.role} ${u.banned ? '[BANNED]' : ''}</li>`
    ).join('') + '</ul>';
  });

  document.getElementById('bSearch')?.addEventListener('click', async () => 
  {
    const q = document.getElementById('bq').value.trim();
    const data = await window.api.admin.books({ q });
    feed.innerHTML = '<h2>Books</h2><ul>' + data.items.map(
      b => `<li>${b.title} — ${b.author}</li>`
    ).join('') + '</ul>';
  });

  document.getElementById('showReports')?.addEventListener('click', async () => 
  {
    const data = await window.api.admin.reports();
    feed.innerHTML = '<h2>Reports</h2><ul>' + data.items.map(
      r => `<li>${r.text} — status: ${r.status}</li>`
    ).join('') + '</ul>';
  });

  document.getElementById('showChanges')?.addEventListener('click', async () => 
  {
    const data = await window.api.admin.changes();
    feed.innerHTML = '<h2>Changes</h2><ul>' + data.items.map(
      c => `<li>User ${c.userId}: ${c.field} "${c.from}" → "${c.to}"</li>`
    ).join('') + '</ul>';
  });
}
