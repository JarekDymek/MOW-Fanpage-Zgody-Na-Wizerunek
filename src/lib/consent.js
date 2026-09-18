export function isoToday(){return new Date().toISOString().slice(0,10)}

export function evaluatePerson(person, channel='facebook', today=isoToday()){
  if(!person) return {level:'review',reason:'Osoba nieznana lub brak wpisu w rejestrze.'};
  if(person.kind==='ward' && person.youthObjection) return {level:'blocked',reason:'Odnotowany sprzeciw wychowanka.'};
  if(person.status==='revoked') return {level:'blocked',reason:'Zgoda została cofnięta.'};
  if(person.status==='none') return {level:'blocked',reason:'Brak zgody.'};
  if(person.status==='verify') return {level:'review',reason:'Status wymaga weryfikacji dokumentu źródłowego.'};
  if(person.validFrom && today < person.validFrom) return {level:'review',reason:'Zgoda jeszcze nie obowiązuje.'};
  if(person.validTo && today > person.validTo) return {level:'review',reason:'Zgoda wygasła.'};
  if(!person.channels?.[channel]) return {level:'blocked',reason:`Brak zgody dla kanału: ${channel}.`};
  return {level:'ok',reason:'Zgoda aktualna dla wskazanego kanału.'};
}

export function evaluateSelection(people,{channel='facebook',unknown=false,today=isoToday()}={}){
  const results=people.map(person=>({person,...evaluatePerson(person,channel,today)}));
  const blocked=results.filter(x=>x.level==='blocked');
  const review=results.filter(x=>x.level==='review');
  const ok=results.filter(x=>x.level==='ok');
  const level=blocked.length?'blocked':(review.length||unknown?'review':'ok');
  return {level,ok,review,blocked,unknown,total:people.length};
}

export function groupSummary(people,group,channel='facebook',today=isoToday()){
  const groupPeople=people.filter(p=>p.group===group);
  return evaluateSelection(groupPeople,{channel,today});
}
