import { appCategories } from './demo-data.js';

const stepsTotal = 4;

const state = 
{
  title:'', author:'', review:'', imageData:'', category:'', location:{}
};

function renderStepper(cur)
{
  const el = document.getElementById('stepper');
  el.innerHTML = Array.from({length:stepsTotal}).map((_,i)=>
  {
    const cls = i<cur? 'step done' : (i===cur? 'step active' : 'step');
    return `<div class="${cls}"></div>`;
  }).join('');
}


function mountStep(idx)
{
  const host = document.getElementById('stepWrap');
  const tpl  = document.getElementById(`step${idx+1}`);
  host.replaceChildren(tpl.content.cloneNode(true));
  renderStepper(idx);

  if (idx===0){
    const title = document.getElementById('upTitle');
    const author= document.getElementById('upAuthor');
    const review= document.getElementById('upReview');
    const img   = document.getElementById('upImage');
    title.value = state.title; author.value = state.author; review.value = state.review;
    img.addEventListener('change', e=>
    {
      const f=e.target.files?.[0]; if(!f) return;
      const r=new FileReader(); r.onload=()=> state.imageData=r.result; r.readAsDataURL(f);
    });
  }

  if (idx===1)
  {
    const list = document.getElementById('upCats');
    list.innerHTML = appCategories.map(c=>`
      <button class="tile" data-c="${c}">
        <span>${c}</span><span>○</span>
      </button>`).join('');
      list.addEventListener('click', e=>
      {
        const t=e.target.closest('.tile'); if(!t) return;
        state.category = t.dataset.c;
        Array.from(list.children).forEach(n=>n.classList.remove('active'));
        t.classList.add('active');
      });
  }

  if (idx===2)
  {
    const list = document.getElementById('upConfirmCat');
    list.innerHTML = state.category
      ? `<div class="tile"><b>${state.category}</b><span>✓</span></div>`
      : `<div class="muted">Select a category first.</div>`;
  }

  if (idx===3)
  {
    document.getElementById('useGeo').addEventListener('click', ()=>
    {
      if (!navigator.geolocation) 
        return alert('Geolocation not supported');
      
      navigator.geolocation.getCurrentPosition(pos=>
      {
        state.location = 
        { 
          lat:pos.coords.latitude, lng:pos.coords.longitude 
        };

        alert('Location captured');

      }, ()=> alert('Failed to get location'));
    });
  }
}




export function init()
{
  let cur=0;
  mountStep(cur);

  document.getElementById('backBtn').addEventListener('click', ()=>
  {
    if (cur>0) cur--, mountStep(cur);
  });


  document.getElementById('nextBtn').addEventListener('click', ()=>
  {
    if (cur===0)
    {
      state.title  = document.getElementById('upTitle').value.trim();
      state.author = document.getElementById('upAuthor').value.trim();
      state.review = document.getElementById('upReview').value.trim();
      if (!state.title || !state.author) 
        return alert('Fill title and author');
    }
    if (cur<stepsTotal-1)
    { 
        cur++; mountStep(cur); 
    }
    else 
    {
      alert('Submitted (demo)');
      location.hash = '#/my';
    }
  });
}
