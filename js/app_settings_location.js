export async function init()
{
  const lat=document.getElementById('lat'), lng=document.getElementById('lng');

  try
  { 
    const me = await window.api.me(); 

    if (me?.loc)
    { 
      lat.value=me.loc.lat||''; 
      lng.value=me.loc.lng||''; 
    } 
  }catch{}

  document.getElementById('useGeo').addEventListener('click', ()=>
    {  

    if (!navigator.geolocation)
    { 
      alert('Geolocation not supported'); 
      return; 
    }
    navigator.geolocation.getCurrentPosition(p=>
    { 
      lat.value = String(p.coords.latitude.toFixed(6)); 
      lng.value = String(p.coords.longitude.toFixed(6)); 
    }, ()=> alert('Failed to get location'));
  });

  document.getElementById('save').addEventListener('click', async ()=>
{ 
    const vlat = parseFloat(lat.value), vlng=parseFloat(lng.value);    
    if (!Number.isFinite(vlat) || !Number.isFinite(vlng)) 
    {            
      alert('Enter valid numbers');                                  
      return; 
    }
    try
    { 
      await window.api.users.update({ loc:{ lat:vlat, lng:vlng } });  
      alert('Location saved ✓');                                      
      location.hash = '#/settings';                                    
    }catch(e)
    { 
      alert(e?.message||String(e));                                
    }
  });
} 
