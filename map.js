
// map.js - initializes leaflet map (no geocoding included)
let globalMap=null;
function initMap(){
  const mapEl = document.getElementById('map');
  if(globalMap) return globalMap;
  globalMap = L.map('map').setView([-15, -55], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18}).addTo(globalMap);
  return globalMap;
}
window.addEventListener('load', initMap);
