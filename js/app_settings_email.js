export async function init()
{
  const email=document.getElementById('email');
  try
  { 
    const me = await window.api.me(); 
    email.value=me.email||'';              
  }catch{}

  document.getElementById('save').addEventListener('click', async ()=>
  { 
    try
    { 
      await window.api.users.update({ email: email.value.trim() }); 
      alert('Updated ✓'); 
      location.hash = '#/settings'; 
    }catch(e)
    { 
      alert(e?.message||String(e)); 
    }
  });
} 
