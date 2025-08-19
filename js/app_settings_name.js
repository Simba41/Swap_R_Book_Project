export async function init()
{
  const fn=document.getElementById('fn'); 
  const ln=document.getElementById('ln'); 
  try
  { 
    const me = await window.api.me(); 
    fn.value=me.firstName||'';            
    ln.value=me.lastName||'';           
  }catch{}

  document.getElementById('save').addEventListener('click', async ()=>
{
    try
    { 
        await window.api.users.update(
        { 
            firstName: fn.value.trim(), 
            lastName: ln.value.trim() 
        }); 
      alert('Updated ✓'); 
      location.hash = '#/settings'; 
    }catch(e)
    { 
      alert(e?.message||String(e)); 
    }
  });
} 
