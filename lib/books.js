
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
const assert=(c,m)=>{if(!c)throw Error(m)};
function calculate(data){
 assert(data&&data.version===1&&Array.isArray(data.items)&&Array.isArray(data.events),'Not a Tallynest backup.');
 assert(data.items.length<=5000&&data.events.length<=50000,'Backup is too large.');
 assert(typeof data.name==='string'&&data.name.length<=100,'Invalid business name.');
 assert(Number.isFinite(data.openingCash)&&data.openingCash>=0&&data.openingCash<=1e12,'Invalid opening cash.');
 const stock=Object.create(null),ids=new Set(),invoices=Object.create(null),rows=[];let cash=data.openingCash,lastDate='';
 for(const p of data.items){assert(typeof p.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(p.id)&&!stock[p.id]&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=100&&typeof p.unit==='string'&&p.unit.length<=30,'Invalid item.');stock[p.id]={qty:0,value:0,name:p.name,unit:p.unit};}
 for(const e of data.events){
  assert(e&&typeof e.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(e.id)&&!ids.has(e.id),'Duplicate or invalid transaction.');ids.add(e.id);
  assert(typeof e.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&!Number.isNaN(Date.parse(e.date)),'Invalid transaction date.');
  assert(typeof e.note==='string'&&e.note.length<=500&&typeof e.party==='string'&&e.party.length<=100,'Invalid transaction details.');
  assert(['opening','purchase','sale','expense','loss','receipt','payment','capital','draw'].includes(e.type),'Invalid transaction type.');
  if(e.void===true)continue;
  assert(e.date>=lastDate,'Transactions must be recorded in date order.');lastDate=e.date;
  let revenue=0,cogs=0,expense=0,inflow=0,outflow=0,total=0;
  if(['opening','purchase','sale','loss'].includes(e.type)){
   const s=stock[e.item];assert(s,'Choose an existing item.');assert(Number.isFinite(e.qty)&&e.qty>=0.01&&e.qty<=1e9&&Math.abs(e.qty*100-Math.round(e.qty*100))<0.00001,'Quantity must be positive.');
   assert(Number.isFinite(e.price)&&e.price>=0&&e.price<=1e9,'Unit price must be zero or greater.');
   total=round(e.qty*e.price);assert(total<=1e12,'Transaction exceeds supported amount.');
   if(e.type==='opening'||e.type==='purchase'){s.qty=round(s.qty+e.qty);s.value=round(s.value+total);}
   else{assert(e.qty<=s.qty,'Not enough stock for this transaction.');const cost=e.qty===s.qty?s.value:round(s.value/s.qty*e.qty);s.qty=round(s.qty-e.qty);s.value=round(s.value-cost);if(e.type==='sale'){revenue=total;cogs=cost;}else{expense=cost;total=cost;}}
   if(e.type==='sale'||e.type==='purchase'){
    assert(Number.isFinite(e.paid)&&e.paid>=0&&e.paid<=total,'Paid amount must be between zero and the total.');
    assert(e.paid===total||e.party.trim().length>0,'Add a customer or supplier for credit transactions.');
    invoices[e.id]={id:e.id,type:e.type,party:e.party||'Walk-in',total,balance:round(total-e.paid),date:e.date};
    if(e.type==='sale')inflow=e.paid;else outflow=e.paid;
   }
  }else{
   assert(Number.isFinite(e.amount)&&e.amount>0&&e.amount<=1e12,'Amount must be positive.');total=e.amount;
   if(e.type==='receipt'||e.type==='payment'){
    const inv=invoices[e.ref];assert(inv&&inv.type===(e.type==='receipt'?'sale':'purchase'),'Choose a matching credit transaction.');assert(e.amount<=inv.balance,'Payment exceeds the outstanding balance.');inv.balance=round(inv.balance-e.amount);
   }
   if(e.type==='receipt'||e.type==='capital')inflow=total;else outflow=total;
   if(e.type==='expense')expense=total;
  }
  cash=round(cash+inflow-outflow);rows.push({...e,total,revenue,cogs,expense,inflow,outflow,cash});
 }
 return{stock,invoices,rows,cash,lastDate,receivable:round(Object.values(invoices).filter(i=>i.type==='sale').reduce((s,i)=>s+i.balance,0)),payable:round(Object.values(invoices).filter(i=>i.type==='purchase').reduce((s,i)=>s+i.balance,0))};
}
function summary(rows){const sum=k=>round(rows.reduce((s,e)=>s+e[k],0));const revenue=sum('revenue'),cogs=sum('cogs'),expense=sum('expense');return{revenue,cogs,expense,profit:round(revenue-cogs-expense),inflow:sum('inflow'),outflow:sum('outflow'),net:round(sum('inflow')-sum('outflow'))};}
export {calculate,summary,round};
