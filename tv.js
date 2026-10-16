const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statuses=["Aguardando","Em operação","Finalizado","Cancelado / No show"];
const arrived=d=>{const value=(d.carrier||'').trim();if(!value)return null;const p=value.split(/\s+-\s+/).map(s=>s.trim());return /^\d+$/.test(p[0])?(p.length===3&&!!p[2]):(p.length===2&&!!p[1]);};
function summarizeWeights(rows){
 const summary={count:rows.length,total:0,missing:0,C:{count:0,total:0,missing:0},D:{count:0,total:0,missing:0},U:{count:0,total:0,missing:0}};
 for(const row of rows){const group=summary[row.operation==='Carregamento'?'C':row.operation==='Descarregamento'?'D':'U'];group.count++;const w=row.weight;const known=w!==''&&w!==null&&w!==undefined&&Number.isFinite(Number(w));if(known){summary.total+=Number(w)/1000;group.total+=Number(w)/1000}else{summary.missing++;group.missing++}}
 return summary;
}
const tonnes=value=>value.toLocaleString('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:3})+' T';
function renderMetrics(rows){
 return [['OPERAÇÕES NO PAINEL',rows,'↗'],...statuses.map((status,i)=>[status.toUpperCase(),rows.filter(d=>d.status===status),['◷','⇄','✓','×'][i]])].map(([label,group,icon])=>{
 const m=summarizeWeights(group);
 const weight=(sum,missing,count)=>count>0&&missing===count?'Peso não informado':tonnes(sum)+(missing?' parcial':'');
 return `<div class="metric"><small>${esc(label)}</small><strong>${m.count.toString().padStart(2,'0')}</strong><span class="metric-icon" aria-hidden="true">${icon}</span><div class="metric-weight">${esc(weight(m.total,m.missing,m.count))}</div><div class="metric-split">${['C','D'].map(key=>`<div title="${key==='C'?'Carregamento':'Descarregamento'}"><b>${key}</b><span>${m[key].count} op.</span><em>${esc(weight(m[key].total,m[key].missing,m[key].count))}</em></div>`).join('')}</div>${m.U.count?`<div class="metric-warning">${m.U.count} op. com tipo não classificado · ${esc(weight(m.U.total,m.U.missing,m.U.count))}</div>`:''}${m.missing?`<div class="metric-warning">${m.missing} operação(ões) sem peso</div>`:''}</div>`;
 }).join('');
}
// TV runtime — no network requests or administration code.
const records=window.DEMO_ROWS;
let page=0,paused=false,lastSlot=-1;
const pageSize=4;
function dateInBrazil(offset=0){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));const d=new Date(Date.UTC(Number(v.year),Number(v.month)-1,Number(v.day)+offset));return d.toLocaleDateString('pt-BR',{timeZone:'UTC'});}
function render(){
 const pages=Math.ceil(records.length/pageSize);page=(page+pages)%pages;
 $('#metrics').innerHTML=renderMetrics(records);
 $('#pagination').textContent=`Página ${page+1} de ${pages} · ${paused?'pausado':'alterna a cada 15 s'}`;
 $('#rows').innerHTML=records.slice(page*pageSize,page*pageSize+pageSize).map(d=>{
 const state=['wait','active','done','cancel'][statuses.indexOf(d.status)];
 const schedule=d.priorDay?'Inclusão do dia '+dateInBrazil(-1):d.schedule==='Inclusão'?'Inclusão de hoje':d.schedule;
 return `<tr><td><strong class="${d.priorDay?'carry':d.schedule==='Inclusão'?'inclusion':'schedule mono'}">${esc(schedule)}</strong><small>${esc(d.id)}</small></td><td><strong>${d.operation==='Carregamento'?'↗':'↙'} ${esc(d.operation)}</strong><small>${esc(d.carrier)}</small></td><td><strong>${esc(d.client)}</strong><div class="orders">${d.orders.split(' ').map(p=>`<span class="order ${d.redOrders.includes(p)?'red':''}">${esc(p)}</span>`).join('')}</div>${d.notes?`<div class="notes">${esc(d.notes)}</div>`:''}</td><td><span class="tag ${arrived(d)?'arrived':''}">${arrived(d)?'● Chegou':'Não chegou'}</span></td><td class="dock">${esc(d.dock)}</td><td><span class="tag ${state}">${esc(d.status)}</span><small>${esc(d.orderStatus)}</small></td><td><strong class="mono">${d.weight===''?'':Number(d.weight).toLocaleString('pt-BR')+' kg'}</strong><small>${esc(d.owner)}</small></td><td class="mono"><small>Entrada ${esc(d.arrivalTime||'—')}<br>Início ${esc(d.startTime||'—')}<br>Fim ${esc(d.endTime||'—')}</small></td></tr>`;
 }).join('');
}
function tick(){
 $('#clock').textContent=new Date().toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo'});
 $('#date').textContent=dateInBrazil()+' · BRASÍLIA';
 const slot=Math.floor(Date.now()/15000);
 if(!paused&&slot!==lastSlot){page=slot%Math.ceil(records.length/pageSize);render();}lastSlot=slot;
}
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'Retomar páginas':'Pausar páginas';if(!paused)lastSlot=-1;render();tick();};
function manual(delta){paused=true;$('#pause').textContent='Retomar páginas';page+=delta;render();}
$('#previous').onclick=()=>manual(-1);$('#next').onclick=()=>manual(1);
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#notice').textContent='Use F11 no navegador para tela cheia.';}};
 document.addEventListener('fullscreenchange',()=>{$('#fullscreen').textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia';});
 tick();setInterval(tick,1000);
