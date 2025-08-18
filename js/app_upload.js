
import { appCategories } from './demo-data.js';

const stepsTotal = 4;

const state = 
{
  title: '',
  author: '',
  review: '',
  imageData: '',  
  category: '',
  location: {}    
};

function renderStepper(cur) 
{
  const el = document.getElementById('stepper');

  if (!el) 
    return;


  el.innerHTML = Array.from({ length: stepsTotal })
    .map((_, i) => 
    {
      const cls = i < cur ? 'step done' : (i === cur ? 'step active' : 'step');
      return `<div class="${cls}"></div>`;
    })
    .join('');
}


function mountStep(idx) 
{
  const host = document.getElementById('stepWrap');
  const tpl  = document.getElementById(`step${idx + 1}`);
  if (host && tpl) host.replaceChildren(tpl.content.cloneNode(true));
  renderStepper(idx);

  if (idx === 0) 
    {
    const title  = document.getElementById('upTitle');
    const author = document.getElementById('upAuthor');
    const review = document.getElementById('upReview');
    const imgInp = document.getElementById('upImage');
    const imgPrev= document.getElementById('upPreview');
    const autoBtn= document.getElementById('btnAutofill');

    if (title)  title.value  = state.title || '';
    if (author) author.value = state.author || '';
    if (review) review.value = state.review || '';
    if (imgPrev && state.imageData) imgPrev.src = state.imageData;

    if (imgInp) 
    {
      imgInp.addEventListener('change', e => 
      {
        const f = e.target.files?.[0]; 

        if (!f) 
          return;

        const r = new FileReader();
        r.onload = () => 
        {
          state.imageData = r.result;

          if (imgPrev) 
            imgPrev.src = state.imageData;
        };
        r.readAsDataURL(f);
      });
    }

    
    if (autoBtn) 
    {
      autoBtn.addEventListener('click', async () => 
      {
        const q = (title?.value || '').trim();

        if (!q) 
          return alert('Type title or ISBN first');

        try 
        {
          const url = `${API_BASE}/api/ext/books?q=${encodeURIComponent(q)}`;
          const res = await fetch(url);
          const data = await res.json();

          if (!data.items || !data.items.length) 
            return alert('No suggestions');

          const best = data.items[0];

          if (title)  title.value  = best.title  || title.value;
          if (author) author.value = best.author || author.value;

          if (best.cover) 
          {
            state.imageData = best.cover; 

            if (imgPrev) 
              imgPrev.src = best.cover;

          }
          alert('Autofilled ✓');
        } catch (e) 
        {
          alert('Autofill failed: ' + (e?.message || e));
        }
      });
    }
  }


  if (idx === 1) 
  {
    const list = document.getElementById('upCats');
    if (list) 
    {
      list.innerHTML = appCategories
        .map(c => `
          <button type="button" class="tile${state.category===c?' active':''}" data-c="${c}">
            <span>${c}</span><span>${state.category===c?'✓':'○'}</span>
          </button>
        `).join('');
      list.addEventListener('click', e => 
        {
        const t = e.target.closest('.tile'); 

        if (!t) 
          return;

        state.category = t.dataset.c;

        Array.from(list.children).forEach(n => n.classList.remove('active'));
        t.classList.add('active');
      });
    }
  }


  if (idx === 2) 
  {
    const list = document.getElementById('upConfirmCat');

    if (list) 
    {
      list.innerHTML = state.category
        ? `<div class="tile"><b>${state.category}</b><span>✓</span></div>`
        : `<div class="muted">Select a category first.</div>`;
    }

  }


  if (idx === 3) 
  {
    const useGeoBtn = document.getElementById('useGeo');

    if (useGeoBtn) 
    {
      useGeoBtn.addEventListener('click', () => 
      {
        if (!navigator.geolocation)
          return alert('Geolocation not supported');

        navigator.geolocation.getCurrentPosition(
          pos => 
          {
            state.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            alert('Location captured');
          },
          () => alert('Failed to get location')
        );
      });
    }
  }
}

export function init() 
{
  let cur = 0;
  mountStep(cur);

  const backBtn = document.getElementById('backBtn');
  backBtn && backBtn.addEventListener('click', () => 
  {
    if (cur > 0) { cur--; mountStep(cur); }
  });

  const nextBtn = document.getElementById('nextBtn');
  nextBtn && nextBtn.addEventListener('click', async () => {

    if (cur === 0) 
    {
      const title  = document.getElementById('upTitle');
      const author = document.getElementById('upAuthor');
      const review = document.getElementById('upReview');

      state.title  = (title?.value || '').trim();
      state.author = (author?.value || '').trim();
      state.review = (review?.value || '').trim();

      if (!state.title || !state.author)
        return alert('Fill title and author');

    }


    if (cur < stepsTotal - 1) 
    {
      cur++;
      mountStep(cur);
      return;
    }

    try 
    {
      const upCountry = document.getElementById('upCountry') || { value: '' };
      const upState   = document.getElementById('upState')   || { value: '' };
      const upCity    = document.getElementById('upCity')    || { value: '' };
      const upStreet  = document.getElementById('upStreet')  || { value: '' };

      const payload = 
      {
        title:  state.title,
        author: state.author,
        review: state.review,
        cover:  state.imageData || '',
        genre:  state.category || '',
        tags:   state.category ? [state.category] : [],
        pickup: [upCountry.value, upState.value, upCity.value, upStreet.value].filter(Boolean).join(', '),
        loc:    state.location || null
      };

      await window.api.books.create(payload);
      alert('Submitted ✓');
      location.hash = '#/my';
    } catch (e) 
    {
      const msg = e?.message || String(e);
      if (msg === 'NO_TOKEN') 
      {
        alert('Please log in first');
        location.href = 'login.html';
      } else 
      {
        alert('Failed: ' + msg);
      }
    }
  });
}
