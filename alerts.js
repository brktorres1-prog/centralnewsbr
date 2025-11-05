
// alerts.js - visual alerts only (no sound)
let lastKnownCount = 0;
function checkForNewItems(count){
  if(lastKnownCount === 0){ lastKnownCount = count; return; }
  if(count > lastKnownCount){
    const diff = count - lastKnownCount;
    showVisualAlert(diff + ' novas ocorrências encontradas');
    lastKnownCount = count;
  }
}
function showVisualAlert(message){
  const div = document.createElement('div');
  div.className = 'visual-alert';
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(()=>div.classList.add('visible'),100);
  setTimeout(()=>{ div.classList.remove('visible'); setTimeout(()=>div.remove(),400); },6000);
}
