
const slides = 
[
    { 
        img:'images/onboarding-1.png',
        h:'📘 List Your Books 📘',
        p:'Snap a photo, add book info, catchy review, and tell us about your book. The more details, the better!' 
    },

    {
        img:'images/onboarding-2.png',
        h:'🔎 Browse and Discover 🔍',
        p:'Explore a world of books! Find interesting titles from other readers.' 
    },

    {
        img:'images/onboarding-3.png',
        h:'🤝 Propose a Swap 🤝',
        p:'Found something you like? Make an offer to swap your book. It’s that simple!' 
    }
];

const img  = document.getElementById('img');
const h2   = document.getElementById('h2');
const p    = document.getElementById('p');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const bars = [...document.querySelectorAll('#bars b')];
const card = document.getElementById('card');

let i = 0;

function show() 
{
  const s = slides[i];
  img.src = s.img;
  img.alt = s.h.replace(/📘|🔎|🤝/g,'').trim();
  h2.textContent = s.h;
  p.textContent  = s.p;
  bars.forEach((b,idx)=>b.classList.toggle('active', idx===i));
  prev.disabled = (i===0);
  next.disabled = (i===slides.length-1);
}

prev.onclick = () => { if (i>0) { i--; show(); } };

next.onclick = () => { if (i<slides.length-1) { i++; show(); } };

let x0 = null;
card.addEventListener('touchstart', e => x0 = e.touches[0].clientX);
card.addEventListener('touchend', e => 
    {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (dx > 40) prev.click();
        if (dx < -40) next.click();
        x0 = null;
    }
                    );

show();