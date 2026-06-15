
const APP = window.APP_DATA;
let lang = localStorage.getItem('trip-lang-en-start-v3-costco') || 'en';
let activeRegion = 'all';
let activeLife = 'costco';
const REGION_CHOICES = [
  {id:'la', icon:'🌴', label:{zh:'LA', en:'LA', vi:'LA'}},
  {id:'sf', icon:'🎪', label:{zh:'SF / Berkeley', en:'SF / Berkeley', vi:'SF / Berkeley'}},
  {id:'yosemite', icon:'🏞️', label:{zh:'Yosemite', en:'Yosemite', vi:'Yosemite'}},
  {id:'fallon', icon:'🛣️', label:{zh:'Fallon', en:'Fallon', vi:'Fallon'}},
  {id:'twinfalls', icon:'💦', label:{zh:'Twin Falls', en:'Twin Falls', vi:'Twin Falls'}},
  {id:'yellowstone', icon:'♨️', label:{zh:'Yellowstone', en:'Yellowstone', vi:'Yellowstone'}},
  {id:'grandteton', icon:'⛰️', label:{zh:'Grand Teton', en:'Grand Teton', vi:'Grand Teton'}},
  {id:'slc', icon:'🏛️', label:{zh:'Salt Lake City', en:'Salt Lake City', vi:'Salt Lake City'}},
  {id:'moab', icon:'🪨', label:{zh:'Moab / Arches', en:'Moab / Arches', vi:'Moab / Arches'}},
  {id:'page', icon:'🌵', label:{zh:'Page / Monument Valley', en:'Page / Monument Valley', vi:'Page / Monument Valley'}},
  {id:'vegas', icon:'🎰', label:{zh:'Las Vegas', en:'Las Vegas', vi:'Las Vegas'}}
];
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function t(v){ return typeof v === 'string' ? v : (v?.[lang] || v?.zh || v?.en || ''); }
function C(k){ return APP.copy[lang][k] || APP.copy.zh[k] || k; }
function tr(v){ return v?.[lang] || v?.zh || v?.en || ''; }
function regionDays(id){
  if(id==='all') return APP.days;
  if(id==='fallon') return APP.days.filter(d=>d.weather==='fallon' || d.region==='fallon');
  if(id==='twinfalls') return APP.days.filter(d=>d.weather==='twinfalls' || d.region==='twinfalls');
  return APP.days.filter(d=>d.region===id);
}
window.selectRegion=function(id){
  activeRegion=id;
  showView('areaView');
  renderArea();
  const head=document.querySelector('#areaView .page-head');
  if(head) head.scrollIntoView({behavior:'smooth', block:'start'});
};
function setLang(l){ lang=l; localStorage.setItem('trip-lang-en-start-v3-costco',l); document.documentElement.lang=l==='zh'?'zh-Hant':l; const sel=$('#languageSelect'); if(sel) sel.value=l; render(); }
function maps(q){ return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }
function nav(q){ return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q); }
function photoQuery(s){ return (s?.query || t(s?.title) || 'US west road trip landmark').replace(/\s+/g,' ').trim(); }
function unsplashPhoto(q){ return 'https://source.unsplash.com/900x520/?' + encodeURIComponent(q + ' travel landmark'); }
function fallbackPhoto(q){ return unsplashPhoto(q || 'US national park scenic'); }
async function commonsPhoto(q){
  const url='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=1&gsrsearch=' + encodeURIComponent(q) + '&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*';
  const r=await fetch(url);
  if(!r.ok) throw new Error('commons');
  const data=await r.json();
  const pages=data.query?.pages;
  if(!pages) throw new Error('no image');
  const first=Object.values(pages)[0];
  return first.imageinfo?.[0]?.thumburl || first.imageinfo?.[0]?.url;
}
function coverPhoto(day){ const q = day.region==='la'?'Los Angeles California':day.region==='sf'?'San Francisco Golden Gate Bridge':day.region==='yosemite'?'Yosemite National Park':day.region==='yellowstone'?'Yellowstone National Park':day.region==='grandteton'?'Grand Teton National Park':day.region==='slc'?'Salt Lake City Utah':day.region==='moab'?'Arches National Park Moab':day.region==='page'?'Horseshoe Bend Page Arizona':day.region==='vegas'?'Las Vegas Strip':t(day.title); return fallbackPhoto(q); }
function tripDay(){ const now=new Date(); const year=now.getFullYear(); const start=new Date(year,5,16); const end=new Date(year,6,7); if(now>=start && now<=end){ return Math.min(22, Math.floor((now-start)/86400000)+1);} return 1; }
function renderStaticText(){ $$('[data-i18n]').forEach(el=>{ el.textContent=C(el.dataset.i18n); }); }
function renderHighlights(){ $('#highlightGrid').innerHTML=APP.highlights.map(h=>`<article class="mini-card"><span class="icon">${h.icon}</span><h3>${t(h.title)}</h3><p>${t(h.text)}</p></article>`).join(''); }
function weatherBox(day){ const wp=APP.weatherPlaces[day.weather]; const id=`w-${day.day}`; return `<div class="info-box weather-box" data-weather-key="${day.weather}" data-weather-id="${id}"><strong>${C('weather')} · ${wp.label}</strong><p class="weather-live" id="${id}">${C('loadingWeather')}</p><p class="weather-meta" id="${id}-meta"></p><a class="weather-link" href="${wp.link}" target="_blank" rel="noopener">${C('openWeather')}</a></div>`; }
function dayCard(day, full=false){ return `<article class="day-card" id="day${day.day}"><div class="day-cover" style="background-image:url('${coverPhoto(day)}')"><div class="day-cover-content"><span class="badge">Day ${day.day} · ${day.date}</span><h3>${t(day.title)}</h3></div></div><div class="day-body"><p class="day-summary">${t(day.summary)}</p><div class="day-info-grid"><div class="info-box"><strong>${C('stay')}</strong><p>${day.stay}</p><a class="weather-link" href="${maps(day.stayMap||day.stay)}" target="_blank" rel="noopener">${C('map')}</a></div>${weatherBox(day)}<div class="info-box"><strong>${C('outfit')}</strong><p>${t(day.outfit)}</p></div><div class="info-box"><strong>${C('note')}</strong><p>${t(day.note)}</p></div></div><div class="today-lines">${day.lines.map(l=>`<div class="today-line"><span class="time">${l.time}</span><strong>${t(l.title)}</strong></div>`).join('')}</div>${full?`<h3 class="details-title">${C('details')}</h3><div class="place-grid">${day.stops.map(stopCard).join('')}</div>`:''}</div></article>`; }
function stopCard(s){ const q=photoQuery(s); return `<article class="stop-card"><div class="img-wrap" data-title="${t(s.title)}"><img class="stop-img" src="${fallbackPhoto(q)}" data-photo-query="${q.replace(/"/g,'&quot;')}" alt="${t(s.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove();this.parentElement.classList.add('image-failed')"></div><div class="stop-body"><span class="tag">${t(s.type)}</span><h4>${t(s.title)}</h4><p>${t(s.desc)}</p><div class="detail-grid"><div class="detail"><strong>${C('ticket')}</strong><span>${t(s.ticket)}</span></div><div class="detail"><strong>${C('hours')}</strong><span>${t(s.hours)}</span></div><div class="detail"><strong>${C('parking')}</strong><span>${t(s.parking)}</span></div><div class="detail"><strong>${C('tip')}</strong><span>${t(s.tip)}</span></div></div><div class="card-actions"><a class="pill-btn" href="${s.nav}" target="_blank" rel="noopener">🧭 ${C('nav')}</a><a class="map-btn" href="${s.map}" target="_blank" rel="noopener">📍 ${C('map')}</a><a class="map-btn" href="${s.official}" target="_blank" rel="noopener">ℹ️ ${C('official')}</a></div></div></article>`; }
function renderToday(){ const day=APP.days.find(d=>d.day===tripDay()) || APP.days[0]; $('#todayCard').innerHTML=dayCard(day,false); loadPlacePhotos(); loadWeather(); }
function renderRegionSheet(){ const box=$('#regionSheetGrid'); if(!box) return; box.innerHTML=REGION_CHOICES.map(r=>`<button class="sheet-card" data-region-sheet="${r.id}"><span class="sheet-card-icon">${r.icon}</span><strong>${tr(r.label)}</strong></button>`).join(''); $$('#regionSheetGrid .sheet-card').forEach(b=>b.onclick=()=>{ activeRegion=b.dataset.regionSheet; closeRegionSheet(); showView('areaView'); renderArea(); window.scrollTo({top:0,behavior:'smooth'});}); }


function renderRegionNotes(){
  const note = APP.regionNotes?.[activeRegion];
  if(!note) return '';
  return `<section class="region-notes-card"><div class="region-notes-head"><span>💡</span><div><h3>${t(note.title)}</h3><p>${C('regionNoteSubtitle')}</p></div></div><div class="region-notes-grid">${note.items.map(it=>`<article><span class="note-icon">${it.icon}</span><strong>${t(it.title)}</strong><p>${t(it.text)}</p></article>`).join('')}</div></section>`;
}

function updateRegionArrows(){
  const rail=$('#regionChips'), left=$('#regionLeft'), right=$('#regionRight');
  if(!rail || !left || !right) return;
  const max=Math.max(0, rail.scrollWidth-rail.clientWidth);
  const can=max>4;
  left.style.display=right.style.display=can?'grid':'none';
  left.disabled=rail.scrollLeft<=2;
  right.disabled=rail.scrollLeft>=max-2;
}
function setupRegionScroller(){
  const rail=$('#regionChips');
  if(!rail) return;
  const left=$('#regionLeft'), right=$('#regionRight');
  if(!rail.dataset.sliderBound){
    rail.dataset.sliderBound='1';
    rail.addEventListener('click', e=>{ const chip=e.target.closest('.chip'); if(chip && chip.dataset.region) window.selectRegion(chip.dataset.region); });
    left?.addEventListener('click',()=>rail.scrollBy({left:-Math.max(220, rail.clientWidth*.75), behavior:'smooth'}));
    right?.addEventListener('click',()=>rail.scrollBy({left:Math.max(220, rail.clientWidth*.75), behavior:'smooth'}));
    rail.addEventListener('scroll', updateRegionArrows, {passive:true});
    window.addEventListener('resize', updateRegionArrows);
    rail.addEventListener('wheel', e=>{
      if(rail.scrollWidth<=rail.clientWidth) return;
      if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){
        rail.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, {passive:false});
  }
  setTimeout(updateRegionArrows, 0);
}
function renderRegions(){
  const rail=$('#regionChips');
  rail.innerHTML=REGION_CHOICES.map(r=>`<button class="chip ${r.id===activeRegion?'active':''}" type="button" data-region="${r.id}" onclick="selectRegion('${r.id}')">${r.icon} ${tr(r.label)}</button>`).join('');
  $$('#regionChips .chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      activeRegion=chip.dataset.region;
      renderArea();
      const head=document.querySelector('#areaView .page-head');
      if(head) head.scrollIntoView({behavior:'smooth', block:'start'});
      else window.scrollTo({top:0,behavior:'smooth'});
    });
  });
  setupRegionScroller();
  setTimeout(updateRegionArrows, 0);
}
function renderArea(){
  renderRegions();
  const list=regionDays(activeRegion);
  $('#dayList').innerHTML = renderRegionNotes() + list.map(d=>dayCard(d,true)).join('');
  loadPlacePhotos();
  loadWeather();
}
function renderGuide(){ $('#guideGrid').innerHTML=APP.guideCards.map(g=>`<article class="guide-card"><span class="icon">${g.icon}</span><h3>${t(g.title)}</h3><p>${t(g.text)}</p></article>`).join(''); $('#packingGrid').innerHTML=APP.packingSections.map((s,si)=>`<article class="packing-card"><h3>${s.icon} ${t(s.title)}</h3><ul>${s.items.map((it,ii)=>{const id=`pack-${si}-${ii}`; const checked=localStorage.getItem(id)==='1'?'checked':''; return `<li><label class="check-row"><input type="checkbox" data-check-id="${id}" ${checked}><span>${t(it)}</span></label></li>`}).join('')}</ul></article>`).join(''); $$('input[data-check-id]').forEach(i=>i.onchange=()=>localStorage.setItem(i.dataset.checkId,i.checked?'1':'0')); }
function lifeCard(r){ const q=r[3]||r[2]; return `<article class="life-card"><small>${r[0]}</small><h3>${r[1]}</h3><p>${r[2]}</p><div class="card-actions"><a class="pill-btn" target="_blank" rel="noopener" href="${nav(q)}">🧭 ${C('nav')}</a><a class="map-btn" target="_blank" rel="noopener" href="${maps(q)}">📍 ${C('map')}</a></div></article>`; }
function renderLife(){
  const stays = APP.stays || [];
  const costcos = APP.costcos || [];
  $('#lifeContent').innerHTML = `<section class="life-section"><h3 class="life-section-title">🏨 ${C('stays')}</h3><div class="life-grid">${stays.map(lifeCard).join('')}</div></section><section class="life-section"><h3 class="life-section-title">🛒 ${C('costco')}</h3><div class="life-grid">${costcos.map(lifeCard).join('')}</div></section>`;
}
async function loadPlacePhotos(){ const imgs=$$('.stop-img[data-photo-query]'); for(const img of imgs){ if(img.dataset.loaded) continue; const q=img.dataset.photoQuery; img.dataset.loaded='1'; commonsPhoto(q).then(url=>{ if(url) img.src=url; }).catch(()=>{}); } }
async function loadWeather(){ const boxes=$$('.weather-box'); for(const box of boxes){ const key=box.dataset.weatherKey, id=box.dataset.weatherId, wp=APP.weatherPlaces[key]; const el=document.getElementById(id), meta=document.getElementById(id+'-meta'); if(!wp || !el) continue; if(el.dataset.loaded===lang) continue; try{ const url=`https://api.open-meteo.com/v1/forecast?latitude=${wp.lat}&longitude=${wp.lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`; const res=await fetch(url); if(!res.ok) throw new Error('weather'); const data=await res.json(); const temp=data.current?.temperature_2m; const wind=data.current?.wind_speed_10m; el.textContent = temp!==undefined ? `${C('currentWeather')}：${Math.round(temp)}°C${wind!==undefined?` · wind ${Math.round(wind)} km/h`:''}` : C('weatherUnavailable'); if(meta && data.current?.time) meta.textContent = `Updated: ${data.current.time.replace('T',' ')}`; el.dataset.loaded=lang; }catch(e){ el.innerHTML=`<a class="weather-link" href="${wp.link}" target="_blank" rel="noopener">${C('weatherUnavailable')}</a>`; }} }
function openRegionSheet(){ const el=$('#regionSheet'); if(!el) return; renderRegionSheet(); el.classList.add('open'); el.setAttribute('aria-hidden','false'); document.body.classList.add('sheet-open'); }
function closeRegionSheet(){ const el=$('#regionSheet'); if(!el) return; el.classList.remove('open'); el.setAttribute('aria-hidden','true'); document.body.classList.remove('sheet-open'); }
function showView(viewId){ $$('.view').forEach(v=>v.classList.toggle('active',v.id===viewId)); $$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===viewId)); if(viewId==='areaView') renderArea(); if(viewId==='guideView') renderGuide(); if(viewId==='lifeView') renderLife(); window.scrollTo({top:0,behavior:'smooth'}); }
function render(){ renderStaticText(); const sel=$('#languageSelect'); if(sel) sel.value=lang; renderHighlights(); renderToday(); renderRegionSheet(); renderArea(); renderGuide(); renderLife(); loadPlacePhotos(); loadWeather(); }
$('#languageSelect')?.addEventListener('change', e=>setLang(e.target.value));
$$('.bottom-nav button').forEach(b=>b.onclick=()=>{ if(b.dataset.view==='areaView'){ openRegionSheet(); } else { showView(b.dataset.view); }});
$('#sheetClose')?.addEventListener('click', closeRegionSheet);
$('#sheetBackdrop')?.addEventListener('click', closeRegionSheet);
render();
