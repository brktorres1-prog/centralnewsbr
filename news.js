
// news.js - enhanced for PRO: fetch feeds, categorize, update charts and alerts
const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
let config = {};
let fontes = [];
let roads = [];
let articles = [];

async function loadJSON(path){ const r = await fetch(path); return r.json(); }

function nowStr(){ const d=new Date(); return d.toLocaleString(); }

function updateDateTime(){ const el = document.getElementById('datetime'); el.textContent = (new Date()).toLocaleString(); }
setInterval(updateDateTime,1000);
updateDateTime();

async function init(){
  config = await loadJSON('config.json');
  fontes = await loadJSON('fontes.json');
  roads = await loadJSON('roads.json');
  populateRoads();
  document.getElementById('refreshBtn').addEventListener('click', fetchAllFeeds);
  document.getElementById('downloadCsv').addEventListener('click', downloadCsv);
  document.getElementById('exportPdf').addEventListener('click', ()=>{});
  document.getElementById('mapBtn').addEventListener('click', ()=>{ window.scrollTo({top:document.getElementById('map').offsetTop - 80, behavior:'smooth'}); });
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('typeFilter').addEventListener('change', applyFilters);
  document.getElementById('regionFilter').addEventListener('change', applyFilters);
  document.getElementById('roadFilter').addEventListener('change', applyFilters);
  await fetchAllFeeds();
  setInterval(fetchAllFeeds, (config.update_interval_minutes||10)*60*1000);
}

function populateRoads(){
  const sel = document.getElementById('roadFilter');
  sel.innerHTML = '<option value="all">Todas as Rodovias</option>';
  (roads.BRs||[]).forEach(r=>{
    const opt = document.createElement('option'); opt.value = r; opt.textContent = r; sel.appendChild(opt);
  });
}

async function fetchAllFeeds(){
  const newsList = document.getElementById('newsList');
  newsList.innerHTML = '<div>Carregando notícias...</div>';
  articles = [];
  for(const f of fontes){
    try{
      const url = RSS2JSON + encodeURIComponent(f.url);
      const resp = await fetch(url);
      if(!resp.ok) continue;
      const j = await resp.json();
      if(j.items){
        j.items.forEach(item=>{
          articles.push({
            title: item.title||'',
            description: item.description||'',
            link: item.link||'',
            pubDate: item.pubDate||item.isoDate||'',
            source: f.name||f.url
          });
        });
      }
    }catch(e){
      console.warn('feed error', f.url, e);
    }
  }
  const uniq = {}; articles = articles.filter(a=>{ if(uniq[a.link]) return false; uniq[a.link]=true; return true; });
  document.getElementById('last-collection').textContent = 'Última coleta: ' + nowStr() + ' • ' + articles.length + ' itens';
  categorizeAndRender();
}

function categorizeAndRender(){
  const keywords = config.categories || {};
  articles.forEach(a=>{
    a.category = 'Outros';
    const text = (a.title + ' ' + a.description).toLowerCase();
    for(const [cat, words] of Object.entries(keywords)){
      for(const w of words){
        if(text.includes(w.toLowerCase())){ a.category = cat; break; }
      }
      if(a.category !== 'Outros') break;
    }
  });
  applyFilters();
}

function applyFilters(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const type = document.getElementById('typeFilter').value;
  const region = document.getElementById('regionFilter').value;
  const road = document.getElementById('roadFilter').value;
  let filtered = articles.filter(a=>{
    if(q && !(a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))) return false;
    if(type !== 'all' && a.category !== type) return false;
    if(region !== 'all' && !(a.title.includes(region) || a.description.includes(region))) return false;
    if(road !== 'all' && !(a.title.includes(road) || a.description.includes(road))) return false;
    return true;
  });
  renderList(filtered);
  updateStats(filtered);
  const summary = { byType: {}, byRegion: {} };
  filtered.forEach(a=>{ summary.byType[a.category] = (summary.byType[a.category]||0)+1; 
    const reg = guessRegion(a); summary.byRegion[reg] = (summary.byRegion[reg]||0)+1;
  });
  try{ updateCharts(summary); }catch(e){}
  try{ checkForNewItems(filtered.length); }catch(e){}
}

function guessRegion(a){
  const text = (a.title+' '+a.description).toLowerCase();
  if(text.includes('sudeste')||text.includes('são paulo')||text.includes('sp')) return 'Sudeste';
  if(text.includes('sul')||text.includes('rs')||text.includes('sc')||text.includes('pr')) return 'Sul';
  if(text.includes('centro-oeste')||text.includes('go')||text.includes('ms')||text.includes('mt')) return 'Centro-Oeste';
  if(text.includes('norte')||text.includes('am')||text.includes('pa')||text.includes('ro')) return 'Norte';
  if(text.includes('nordeste')||text.includes('pe')||text.includes('ba')||text.includes('ce')) return 'Nordeste';
  return 'Desconhecida';
}

function renderList(list){
  const container = document.getElementById('newsList');
  container.innerHTML = '';
  if(list.length === 0){ container.innerHTML = '<div>Nenhuma notícia encontrada.</div>'; return; }
  list.slice(0,300).forEach(item=>{
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `<div class="news-title"><a href="${item.link}" target="_blank">${escapeHtml(item.title)}</a></div>
      <div class="news-desc">${escapeHtml(stripTags(item.description).slice(0,350))}</div>
      <div class="news-meta">${item.source} • ${item.pubDate}</div>`;
    container.appendChild(div);
  });
}

function updateStats(list){
  const total = list.length;
  const accidents = list.filter(a=>a.category==='Acidente').length;
  const interd = list.filter(a=>a.category==='Interdição').length;
  const trans = list.filter(a=>a.category==='Trânsito / Lentidão').length;
  const roub = list.filter(a=>a.category==='Roubo / Furto').length;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-acidentes').textContent = accidents;
  document.getElementById('stat-interdicoes').textContent = interd;
  document.getElementById('stat-transito').textContent = trans;
  document.getElementById('stat-roubo').textContent = roub;
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function stripTags(s){ return (s||'').replace(/(<([^>]+)>)/gi, ""); }

function downloadCsv(){
  const items = Array.from(document.querySelectorAll('.news-item')).map(div=>{
    return {
      title: div.querySelector('.news-title a').textContent,
      link: div.querySelector('.news-title a').href,
      desc: div.querySelector('.news-desc').textContent,
      meta: div.querySelector('.news-meta').textContent
    };
  });
  const csv = toCsv(items);
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'con_pro_export.csv'; a.click(); URL.revokeObjectURL(url);
}

function toCsv(rows){
  if(!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(',')];
  rows.forEach(r=>{
    lines.push(keys.map(k=>`"${(r[k]||'').replace(/"/g,'""')}"`).join(','));
  });
  return lines.join('\n');
}

window.addEventListener('load', init);
