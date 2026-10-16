// Dados criados exclusivamente para demonstração pública. Nenhum registro real.
window.DEMO_ROWS = Array.from({length:27}, (_,i) => {
  const status = ['Aguardando','Em operação','Finalizado','Cancelado / No show'][i % 9 < 4 ? 0 : i % 9 < 6 ? 1 : i % 9 < 8 ? 2 : 3];
  const arrived = status !== 'Cancelado / No show' && i % 4 !== 0;
  return {
    id:`DEMO-${String(i+1).padStart(3,'0')}`,
    schedule:i%7===0?'Inclusão anterior':i%5===0?'Inclusão':`${String(7+Math.floor(i/3)).padStart(2,'0')}:${['00','20','40'][i%3]}`,
    priorDay:i%7===0,
    operation:i%3===0?'Descarregamento':'Carregamento',
    carrier:`Transportadora Exemplo ${String(i+1).padStart(2,'0')}${arrived?' - Motorista Fictício '+(i+1):''}`,
    client:i%8===0?'':`Cliente Demonstração ${String(i+1).padStart(2,'0')}`,
    orders:`DEMO${100+i} DEMO${200+i}`,redOrders:i%6===0?[`DEMO${200+i}`]:[],
    weight:i===12?'':1250+i*375,status,
    orderStatus:['Aguardando produção','Conferido','Na doca','Verificar','Separado'][i%5],
    notes:i%6===0?'Exemplo fictício de pedido em tratamento.':'',
    owner:i%4===0?'Equipe Exemplo A / Equipe Exemplo B':'Equipe Exemplo A',
    dock:status==='Em operação'?String(i%4+1).padStart(2,'0'):'',
    arrivalTime:arrived?'07:10':'',startTime:['Em operação','Finalizado'].includes(status)?'08:00':'',endTime:status==='Finalizado'?'09:15':''
  };
});
