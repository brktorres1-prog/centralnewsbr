
// charts.js - render charts using Chart.js based on aggregated data from news.js
let chartType=null, chartRegion=null;
function updateCharts(summary){
  const ctxType = document.getElementById('chartType').getContext('2d');
  const ctxRegion = document.getElementById('chartRegion').getContext('2d');
  const labelsType = Object.keys(summary.byType);
  const dataType = Object.values(summary.byType);
  const labelsRegion = Object.keys(summary.byRegion);
  const dataRegion = Object.values(summary.byRegion);

  if(chartType) chartType.destroy();
  if(chartRegion) chartRegion.destroy();

  chartType = new Chart(ctxType, {
    type: 'bar',
    data: { labels: labelsType, datasets: [{ label: 'Ocorrências', data: dataType }]},
    options: { responsive:true, maintainAspectRatio:false }
  });

  chartRegion = new Chart(ctxRegion, {
    type: 'pie',
    data: { labels: labelsRegion, datasets: [{ label: 'Por região', data: dataRegion }]},
    options: { responsive:true, maintainAspectRatio:false }
  });
}
