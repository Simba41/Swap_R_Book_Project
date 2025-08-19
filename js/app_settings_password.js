export async function init()
{
  document.getElementById('save').addEventListener('click', async ()=>
  {
    const cur=document.getElementById('cur').value;  
    const npw=document.getElementById('npw').value;  
    if (!npw || npw.length<8)
    {                       
      alert('Use at least 8 characters');    

      return;                                      
    }
    try
    { 
      await window.api.users.password(
      {              
        currentPassword: cur, 
        newPassword: npw 
      }); 
      alert('Password changed ✓');                   
      location.hash = '#/settings';                 
    }catch(e)
    { 
      alert(e?.message||String(e));                  
    }
  });
} 
