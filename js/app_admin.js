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

  function fmtUser(u) 
  {

    if (!u) 
      return '-';
    if (typeof u === 'string')
     return u;
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();

    return name || u.email || (u._id || '-');
  }

  exports.listConversations = async (_req, res, next) => 
  {
  try 
  {
    const convs = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: 
        {
          _id: '$conv',
          lastText: { $first: '$text' },
          from: { $first: '$from' },
          to: { $first: '$to' },
          updatedAt: { $first: '$createdAt' }
        }
      }
    ]);

    if (!convs.length) 
      return res.json({ items: [] });

    const ids = [];
    convs.forEach(c => 
    { 
      if (c.from) ids.push(c.from); 
      if (c.to) ids.push(c.to); 
    });

    const users = await User.find({ _id: { $in: ids } })
      .select('_id firstName lastName email');

    const map = {};
    users.forEach(u => { map[u._id] = u; });

    const items = convs.map(c => (
    {
      conv: c._id,
      lastText: c.lastText,
      updatedAt: c.updatedAt,
      from: map[c.from] || c.from,
      to: map[c.to] || c.to
    }));

    res.json({ items });
  } catch (e) {
    next(e);
  }
};

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

  document.getElementById('btnMsgsAdmin')?.addEventListener('click', listConversations);

  document.getElementById('uSearch')?.addEventListener('click', async () => 
  {
    const q = document.getElementById('uq').value.trim();
    const data = await window.api.admin.users({ q });
    feed.innerHTML = '<h2>Users</h2><ul>' + data.items.map(
      u => `<li>${u.firstName} ${u.lastName} (${u.email}) — ${u.role} ${u.banned ? '[BANNED]' : ''}</li>`
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
