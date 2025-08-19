
'use strict';

let CATEGORIES = [];
const stepsTotal = 4;

const state = 
{
  title: '',
  author: '',
  review: '',
  imageData: '',  // dataURL 
  category: '',
  location: {}    // {lat, lng}
};

function renderStepper(cur) 
{
  const el = document.getElementById('stepper');

  if (!el) 
    return;

  el.innerHTML = Array.from({ length: stepsTotal })
    .map((_, i) => `<div class="step ${i < cur ? 'done' : (i === cur ? 'active' : '')}"></div>`)
    .join('');
}



async function compressImage(file, maxSide = 1200, quality = 0.82) 
{
  return new Promise((resolve, reject) => 
  {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => 
    {
      const img = new Image();
      img.onload = () => 
      {
        let { width: w, height: h } = img;
        const ratio = Math.max(w, h) / maxSide;

        if (ratio > 1) 
        { 
          w = Math.round(w / ratio);
          h = Math.round(h / ratio); 
        }

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const data = canvas.toDataURL('image/jpeg', quality);
        resolve(data);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function mountStep(idx) 
{
  const host = document.getElementById('stepWrap');
  const tpl  = document.getElementById(`step${idx + 1}`);

  if (host && tpl) host.replaceChildren(tpl.content.cloneNode(true));

  renderStepper(idx);

  if (idx === 0) 
  {
    const title   = document.getElementById('upTitle');
    const author  = document.getElementById('upAuthor');
    const review  = document.getElementById('upReview');
    const imgInp  = document.getElementById('upImage');
    const imgPrev = document.getElementById('upPreview');
    const autoBtn = document.getElementById('btnAutofill');

    if (title)  title.value  = state.title || '';
    if (author) author.value = state.author || '';
    if (review) review.value = state.review || '';
    if (imgPrev && state.imageData) imgPrev.src = state.imageData;

    imgInp && imgInp.addEventListener('change', async (e) => 
    {
      const f = e.target.files?.[0];

      if (!f) 
        return;

      try 
      {
        state.imageData = await compressImage(f);   

        if (imgPrev) imgPrev.src = state.imageData;

      } catch (err) 
      {
        console.warn('compress failed', err);
      }
    });

    autoBtn && autoBtn.addEventListener('click', async () => 
    {
      const q = (title?.value || '').trim();

      if (!q) 
        return alert('Type title or ISBN first');

      try 
      {
        const res  = await fetch(`${API_BASE}/api/ext/books?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const best = data?.items?.[0];

        if (!best) 
          return alert('No suggestions');

        if (best.title)  title.value  = best.title;
        if (best.author) author.value = best.author;
        if (best.cover)  
        { 
          state.imageData = best.cover;
          imgPrev && (imgPrev.src = best.cover); 
        }

        alert('Autofilled ✓');
      } catch (e) 
      { 
        alert('Autofill failed: ' + (e?.message || e)); 
      }
    });
  }

  if (idx === 1) 
    {
    const list = document.getElementById('upCats');

    if (!list) 
      return;

    const cats = Array.isArray(CATEGORIES) ? CATEGORIES : [];
    list.innerHTML = cats.map(c => `
      <button type="button" class="tile${state.category===c?' active':''}" data-c="${c}" aria-pressed="${state.category===c?'true':'false'}">
        <span>${c}</span><span>${state.category===c?'✓':'○'}</span>
      </button>
    `).join('');


    list.addEventListener('click', (e) => {
      const t = e.target.closest('button.tile'); if (!t) return;
      state.category = t.dataset.c;
      [...list.children].forEach(n => {
        const on = (n === t);
        n.classList.toggle('active', on);
        n.setAttribute('aria-pressed', on ? 'true' : 'false');
        const marks = n.querySelectorAll('span'); if (marks[1]) marks[1].textContent = on ? '✓' : '○';
      });
      btnNext?.removeAttribute('disabled');         // **ADDED**: разрешаем продолжить
    });

    // **ADDED**: если ещё не выбрано — блокируем Continue
    if (!state.category && btnNext) btnNext.setAttribute('disabled', 'disabled');
  }

  if (idx === 2) 
  {
    const list = document.getElementById('upConfirmCat');
    if (list)
      list.innerHTML = state.category
        ? `<div class="tile"><b>${state.category}</b><span>✓</span></div>`
        : `<div class="muted">Select a category first.</div>`;
  }

  if (idx === 3) 
  {
    document.getElementById('useGeo')?.addEventListener('click', () => {

      if (!navigator.geolocation) 
        return alert('Geolocation not supported');

      navigator.geolocation.getCurrentPosition(
        pos => { state.location = { lat: pos.coords.latitude, lng: pos.coords.longitude }; alert('Location captured'); },
        ()  => alert('Failed to get location')
      );
    });
  }
}

async function loadCategories() 
{
  try 
  {
    const raw = await window.api.books.genres();            
    return Array.isArray(raw) ? raw : (raw?.items || []);
  } catch 
  { 
    return []; 
  }
}

export async function init() 
{
  
  CATEGORIES = await loadCategories();
  if (!Array.isArray(CATEGORIES)) CATEGORIES = [];

  let cur = 0;
  mountStep(cur);

  document.getElementById('backBtn')?.addEventListener('click', () => 
  {
    if (cur > 0) { cur--; mountStep(cur); }
  });

  document.getElementById('nextBtn')?.addEventListener('click', async () => {
    if (cur === 0) 
    {
      state.title  = (document.getElementById('upTitle')?.value  || '').trim();
      state.author = (document.getElementById('upAuthor')?.value || '').trim();
      state.review = (document.getElementById('upReview')?.value || '').trim();

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
      { alert('Please log in first'); 
        location.href = 'login.html'; 
      }
      else alert('Failed: ' + msg);
    }
  });
}