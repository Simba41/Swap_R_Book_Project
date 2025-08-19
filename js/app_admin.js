export async function init()
{
 
  try
  {
    const m = await window.api.admin.metrics();
    document.getElementById('metrics').textContent = `USERS:${m.users}  BOOKS:${m.books}  MSGS:${m.messages}  NOTIFS:${m.notifications}`;
  }catch(e)
  {
    document.getElementById('metrics').textContent = 'metrics error';
  }

  const feed = document.getElementById('adminFeed');

  async function listUsers()
  {
    const q=document.getElementById('uq').value||'';
    const data = await window.api.admin.users({ q, limit:50, page:1 });
    const lines = data.items.map(u=>`${u._id}  ${u.firstName||''} ${u.lastName||''} <${u.email}>  role:${u.role}  banned:${u.banned}`);
    feed.textContent = lines.join('\n') + (lines.length? '\n\nClick a user id to ban/unban, or type ban:<id>, unban:<id>.' : '\nNo users.');
  }

  async function listBooks()
  {
    const q=document.getElementById('bq').value||'';
    const data = await window.api.admin.books({ q, limit:50, page:1 });
    const lines = data.items.map(b=>`${b._id}  "${b.title}" by ${b.author}  owner:${b.ownerId}`);
    feed.textContent = lines.join('\n') + (lines.length? '\n\nType delbook:<id> to delete.' : '\nNo books.');
  }

  async function listReports()
  {
    try
    {
      const data = await window.api.admin.reports({ limit:50, page:1 });
      const lines = data.items.map(r=>`${r._id}  from:${r.from||'-'}  to:${r.to||'-'}  book:${r.book||'-'}  "${r.text}"  resolved:${r.resolved}`);
      feed.textContent = lines.join('\n') + (lines.length? '\n\nType resolve:<id> to resolve.' : '\nNo reports.');
    }catch(e)
    {
      feed.textContent = 'Failed to load reports';
    }
  }

  document.getElementById('uSearch').addEventListener('click', listUsers);
  document.getElementById('bSearch').addEventListener('click', listBooks);
  document.getElementById('showReports').addEventListener('click', listReports);
  document.getElementById('showChanges').addEventListener('click', async ()=>
  { 
    const data = await window.api.admin.changes({ limit:50, page:1 }); 
    feed.textContent = data.items.map(c=>`${c.createdAt}  user:${c.userId}  ${c.field}  ${c.from} -> ${c.to}`).join('\n') || 'No changes.'; 
  });

  feed.addEventListener('click', async (e)=>
  {
    const cmd = prompt('Command (ban:<id> | unban:<id> | delbook:<id> | resolve:<id> | notify:<text>)');
    if (!cmd) return;
    if (cmd.startsWith('ban:')){ const id=cmd.slice(4).trim(); await window.api.admin.ban(id); alert('Banned ✓'); await listUsers(); }
    else if (cmd.startsWith('unban:')){ const id=cmd.slice(6).trim(); await window.api.admin.unban(id); alert('Unbanned ✓'); await listUsers(); }
    else if (cmd.startsWith('delbook:')){ const id=cmd.slice(8).trim(); await window.api.books.remove(id); alert('Deleted ✓'); await listBooks(); }
    else if (cmd.startsWith('resolve:')){ const id=cmd.slice(8).trim(); await window.api.admin.resolveReport(id); alert('Resolved ✓'); await listReports(); }
    else if (cmd.startsWith('notify:')){ const text=cmd.slice(7).trim(); await window.api.admin.notify({ text }); alert('Sent ✓'); }
  });
} 
