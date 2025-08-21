// assets/detail.js — robust interactions + map init when Map tab opens

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Tooltip ---------- */
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);
  const showTip = (text, x, y) => {
    tooltip.innerHTML = text;
    const pad = 12;
    const maxLeft = Math.min(window.innerWidth - 260, x + pad);
    tooltip.style.left = Math.max(8, maxLeft) + 'px';
    tooltip.style.top = Math.max(8, y + pad) + 'px';
    tooltip.classList.add('show');
  };
  const hideTip = () => tooltip.classList.remove('show');

  /* ---------- KPI counters ---------- */
  document.querySelectorAll('.kpi .num').forEach(node => {
    const end = Number(node.getAttribute('data-end') || 0);
    const dur = 700;
    let started = false;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / dur);
            node.textContent = Math.floor(p * end).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(node);
  });

  /* ---------- KPI expand ---------- */
  document.querySelectorAll('.kpi').forEach(k => {
    k.addEventListener('click', () => k.classList.toggle('expanded'));
    k.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); k.click(); }
    });
  });

  /* ---------- Tabs ---------- */
  const tabButtons = Array.from(document.querySelectorAll('.tab'));
  const tabPanels  = Array.from(document.querySelectorAll('.tab-panel'));
  let mapInitialized = false;
  let mapInstance = null;

  function switchTab(i){
    tabButtons.forEach((b, idx)=> b.classList.toggle('active', idx === i));
    tabPanels.forEach((p, idx)=> p.style.display = (idx === i ? 'block' : 'none'));

    // Map is tab index 1
    if (i === 1) {
      initMapIfNeeded().then(() => {
        if (mapInstance && typeof mapInstance.invalidateSize === 'function'){
          setTimeout(()=> mapInstance.invalidateSize(), 250);
        }
      }).catch(err => console.warn('Map init error:', err));
    }
  }
  tabButtons.forEach((b, idx)=> b.addEventListener('click', ()=> switchTab(idx)));
  switchTab(0); // default tab

  /* ---------- Mini timeline ---------- */
  const mini = document.querySelectorAll('.mini-item');
  const detailTitle = document.querySelector('.timeline-detail h3');
  const detailBody  = document.querySelector('.timeline-detail p');
  const clearActiveMini = () => mini.forEach(m => m.classList.remove('active'));

  mini.forEach(m => {
    m.addEventListener('click', () => {
      clearActiveMini(); m.classList.add('active');
      detailTitle.textContent = m.dataset.title || '';
      detailBody.textContent  = m.dataset.desc || '';
      detailTitle.parentElement.classList.remove('flash'); void detailTitle.parentElement.offsetWidth;
      detailTitle.parentElement.classList.add('flash');
    });
    m.addEventListener('mousemove', e => { if (m.dataset.tip) showTip(m.dataset.tip, e.clientX, e.clientY); });
    m.addEventListener('mouseout', hideTip);
    m.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); m.click(); } });
  });
  if (mini[0]) mini[0].click();

  /* ---------- Charts ---------- */
  function initCharts() {
    if (typeof Chart === 'undefined') return;

    const chSignal = document.getElementById('ch-signal');
    if (chSignal) {
      new Chart(chSignal, {
        type: 'line',
        data: {
          labels: ['Aug','Sep','Oct','Nov','Dec'],
          datasets: [{
            label: 'Signals (illustrative)',
            data: [0,1,1,4,12],
            tension: 0.28,
            borderColor: '#0b74d1',
            backgroundColor: 'rgba(11,116,209,0.09)',
            pointRadius: 4, pointBackgroundColor: '#0b74d1'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    const chCat = document.getElementById('ch-categories');
    if (chCat) {
      new Chart(chCat, {
        type: 'doughnut',
        data: {
          labels: ['Market', 'Household', 'Healthcare', 'Unknown'],
          datasets: [{ data: [45,25,10,20], backgroundColor: ['#60a5fa','#34d399','#fda4af','#c7d2fe'] }]
        },
        options: { responsive:true, plugins: { legend: { position: 'bottom' } } }
      });
    }

    const chAct = document.getElementById('ch-actions');
    if (chAct) {
      new Chart(chAct, {
        type: 'bar',
        data: {
          labels: ['Alert', 'Investigate', 'Sequence', 'Advisory'],
          datasets: [{ data: [30,60,20,40], backgroundColor: '#7dd3fc' }]
        },
        options: { responsive:true, plugins: { legend: { display:false } }, scales: { y: { beginAtZero:true } } }
      });
    }
  }
  initCharts();

  /* ---------- Lightbox ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    document.querySelectorAll('.gallery img').forEach(img => {
      img.addEventListener('click', () => {
        lightbox.querySelector('img').src = img.src;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden','false');
      });
    });
    const close = lightbox.querySelector('.close');
    if (close) close.addEventListener('click', () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); } });
  }

  /* ---------- Quiz ---------- */
  document.querySelectorAll('.quiz').forEach(qz => {
    const submitBtn = qz.querySelector('button.submit') || qz.querySelector('.submit') || qz.querySelector('button');
    const result = qz.querySelector('.result') || (() => { const d = document.createElement('div'); d.className = 'result'; qz.appendChild(d); return d; })();
    if (!submitBtn) return;

    submitBtn.addEventListener('click', () => {
      let total = 0, correct = 0;
      qz.querySelectorAll('.q').forEach(q => {
        total++;
        const ans = q.dataset.answer;
        const sel = q.querySelector('input[type=radio]:checked');
        if (sel && sel.value === ans) correct++;
      });
      const pass = correct >= Math.ceil(total * 0.7);
      result.style.display = 'block';
      result.textContent = pass ? `Nice! ${correct}/${total} correct.` : `Try again — ${correct}/${total} correct.`;
      result.style.color = pass ? 'var(--success)' : '#b91c1c';
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // expose diagram helper for inline SVG events
  window.__diagram = { showTip, hideTip };

  /* ==================== MAP: initialize only when Map tab opens ==================== */
  function initMapIfNeeded(){
    return new Promise((resolve, reject) => {
      if (mapInitialized && mapInstance) { resolve(mapInstance); return; }

      // Ensure Leaflet is loaded
      let tries = 0;
      (function waitL(){
        if (typeof L !== 'undefined') {
          try {
            const map = L.map('map', {
              minZoom: 2, maxZoom: 6, zoom: 2, center:[25,90],
              scrollWheelZoom: false, worldCopyJump: true
            });

            const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors', maxZoom: 18
            }).addTo(map);

            tiles.on('tileerror', function(){
              const el = document.getElementById('map');
              if (el && !el.querySelector('.map-offline-note')){
                const note = document.createElement('div');
                note.className = 'map-offline-note';
                note.style.cssText = 'position:absolute;left:12px;top:12px;padding:8px 10px;background:rgba(255,255,255,0.9);border-radius:8px;color:#111;box-shadow:0 6px 18px rgba(0,0,0,0.08);z-index:999';
                note.textContent = 'Map tiles could not load (internet required).';
                el.appendChild(note);
              }
            });

            const wuhan = { name:'Wuhan (China)', lat:30.5928, lon:114.3055, note:'Initial cluster reported here.' };
            const targets = [
              {name:'Bangkok, Thailand', lat:13.7563, lon:100.5018, note:'Early exported case in Thailand.'},
              {name:'Tokyo, Japan', lat:35.6762, lon:139.6503, note:'Early travel-associated case.'},
              {name:'Seoul, South Korea', lat:37.5665, lon:126.9780, note:'Imported case reported.'},
              {name:'Seattle, USA', lat:47.6062, lon:-122.3321, note:'Early North America detection.'},
              {name:'Paris, France', lat:48.8566, lon:2.3522, note:'Early European detection.'},
              {name:'Sydney, Australia', lat:-33.8688, lon:151.2093, note:'Early Oceania detection.'}
            ];

            // Pulsing Wuhan marker
            const wIcon = L.divIcon({ className: 'pulse-marker' });
            const wMarker = L.marker([wuhan.lat, wuhan.lon], { icon: wIcon }).addTo(map);
            wMarker.bindPopup(`<strong>${wuhan.name}</strong><br/><small>${wuhan.note}</small>`);

            // Small red markers
            const targetMarkers = targets.map(t => {
              const ico = L.divIcon({ className: 'small-red' });
              const m = L.marker([t.lat, t.lon], { icon: ico }).addTo(map);
              m.bindPopup(`<strong>${t.name}</strong><br/><small>${t.note}</small>`);
              return m;
            });

            // Fit to bounds
            const all = [[wuhan.lat, wuhan.lon], ...targets.map(t => [t.lat, t.lon])];
            map.fitBounds(L.latLngBounds(all).pad(0.25));

            // Dashed lines sequentially
            let delay = 300;
            targets.forEach((t, idx) => {
              setTimeout(() => {
                L.polyline([[wuhan.lat, wuhan.lon], [t.lat, t.lon]], {
                  color: 'rgba(220,40,40,0.9)', weight: 2.2, opacity: 0.95, dashArray: '6 6'
                }).addTo(map);

                const el = targetMarkers[idx].getElement && targetMarkers[idx].getElement();
                if (el){ el.style.transition = 'transform .45s ease'; el.style.transform = 'scale(1.45)'; setTimeout(()=> el.style.transform = 'scale(1)', 600); }
              }, delay);
              delay += 200;
            });

            mapInstance = map;
            mapInitialized = true;
            window.__map = map;

            resolve(mapInstance);
          } catch (e) {
            reject(e);
          }
        } else {
          tries++;
          if (tries > 60) return reject(new Error('Leaflet not loaded.'));
          setTimeout(waitL, 50);
        }
      })();
    });
  }

  // expose for debugging if needed
  window.__initMapIfNeeded = initMapIfNeeded;

});