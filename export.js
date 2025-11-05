
// export.js - CSV and PDF export helpers
function exportToPdf(){
  const items = Array.from(document.querySelectorAll('.news-item')).map(div=>{
    return {
      title: div.querySelector('.news-title a').textContent,
      link: div.querySelector('.news-title a').href,
      desc: div.querySelector('.news-desc').textContent,
      meta: div.querySelector('.news-meta').textContent
    };
  });
  let html = '<html><head><title>Exportar Notícias</title></head><body><h1>CON - Export</h1><p>Data: '+new Date().toLocaleString()+'</p><ul>';
  items.forEach(it=>{ html += '<li><a href="'+it.link+'">'+it.title+'</a><p>'+it.desc+'</p><small>'+it.meta+'</small></li><hr/>' });
  html += '</ul></body></html>';
  const w = window.open('about:blank','_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(()=>w.print(),500);
}

document.addEventListener('click', function(e){
  if(e.target && e.target.id==='exportPdf') exportToPdf();
});
