import './styles.css';
import {MOCK_PEOPLE} from './data/mock.js';
import {evaluatePerson,evaluateSelection,groupSummary} from './lib/consent.js';

const STORE='mow-zgody-lab-v1';
const state=load();
let tab='registry';
const app=document.querySelector('#app');

function load(){
  try{return JSON.parse(localStorage.getItem(STORE))||{people:structuredClone(MOCK_PEOPLE),audit:[]}}
  catch{return {people:structuredClone(MOCK_PEOPLE),audit:[]}}
}
function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function esc(x=''){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function labelStatus(p){const e=evaluatePerson(p);return `<span class="badge ${e.level}">${e.level==='ok'?'ZGODA':e.level==='blocked'?'BLOKADA':'WERYFIKACJA'}</span>`}
function audit(text){state.audit.unshift({at:new Date().toISOString(),text});state.audit=state.audit.slice(0,100);save()}

function shell(body){
  app.innerHTML=`<header class="top"><div class="top-inner"><div class="brand">MOW Fanpage – Zgody <span class="lab">LAB / dane fikcyjne</span></div><nav class="tabs"><button data-tab="registry" aria-pressed="${tab==='registry'}">Rejestr</button><button data-tab="photo" aria-pressed="${tab==='photo'}">Sprawdź zdjęcie</button><button data-tab="audit" aria-pressed="${tab==='audit'}">Historia</button></nav></div></header><main>${body}</main>`;
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
}

function registry(){
  const groups=[...new Set(state.people.map(p=>p.group))];
  shell(`<section class="card"><h1>Hipotetyczny rejestr zgód</h1><p class="fake"><b>Tryb testowy:</b> używamy wyłącznie fikcyjnych danych. Nie wpisuj realnych wychowanków przed formalnym zatwierdzeniem zakresu danych i zabezpieczeń.</p><div class="actions"><button class="primary" id="addPerson">Dodaj fikcyjną osobę</button><button id="reset">Przywróć dane testowe</button></div></section>${groups.map(group=>`<section class="card"><h2>${esc(group)}</h2><div class="people">${state.people.filter(p=>p.group===group).map(p=>`<article class="person"><div><b>${esc(p.name)}</b><small>${p.kind==='adult'?'osoba dorosła / współpracownik':'wychowanek'} · dokument: ${esc(p.documentRef||'brak')}</small><small>Facebook: ${p.channels.facebook?'tak':'nie'} · WWW: ${p.channels.www?'tak':'nie'} · ważna do: ${esc(p.validTo||'—')}</small></div><div>${labelStatus(p)}</div></article>`).join('')}</div></section>`).join('')}`);
  document.querySelector('#reset').onclick=()=>{if(confirm('Przywrócić fikcyjne dane początkowe?')){state.people=structuredClone(MOCK_PEOPLE);audit('Przywrócono dane testowe.');render()}};
  document.querySelector('#addPerson').onclick=addPerson;
}

function addPerson(){
  shell(`<section class="card"><h1>Dodaj fikcyjną osobę</h1><form id="personForm" class="grid"><label>Imię i nazwisko<input name="name" required></label><label>Grupa<input name="group" required></label><label>Typ<select name="kind"><option value="ward">Wychowanek</option><option value="adult">Dorosły / współpracownik</option></select></label><label>Status<select name="status"><option value="active">Aktywna</option><option value="limited">Ograniczona</option><option value="none">Brak</option><option value="revoked">Cofnięta</option><option value="verify">Do weryfikacji</option></select></label><label>Ważna od<input type="date" name="validFrom"></label><label>Ważna do<input type="date" name="validTo"></label><label>Numer dokumentu<input name="documentRef"></label><label>Wersja formularza<input name="formVersion" value="2026-01"></label><label class="checkbox"><input type="checkbox" name="facebook"> Facebook MOW</label><label class="checkbox"><input type="checkbox" name="www"> Strona WWW</label><label class="checkbox"><input type="checkbox" name="print"> Druk</label><label class="checkbox wide"><input type="checkbox" name="youthObjection"> Sprzeciw wychowanka</label><div class="actions wide"><button class="primary">Zapisz fikcyjny rekord</button><button type="button" id="cancel">Anuluj</button></div></form></section>`);
  document.querySelector('#cancel').onclick=()=>{tab='registry';render()};
  document.querySelector('#personForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);const p={id:crypto.randomUUID(),name:f.get('name').trim(),group:f.get('group').trim(),kind:f.get('kind'),status:f.get('status'),validFrom:f.get('validFrom')||null,validTo:f.get('validTo')||null,channels:{facebook:f.has('facebook'),www:f.has('www'),print:f.has('print')},documentRef:f.get('documentRef').trim()||null,formVersion:f.get('formVersion').trim()||null,youthObjection:f.has('youthObjection')};state.people.push(p);audit(`Dodano testowy rekord: ${p.name}.`);tab='registry';render()};
}

function photo(){
  const groups=[...new Set(state.people.filter(p=>p.kind==='ward').map(p=>p.group))];
  shell(`<section class="card"><h1>Sprawdź hipotetyczne zdjęcie</h1><p class="muted">Ten moduł testuje model: najpierw grupa/grupy, ręczne wyjątki tylko gdy są potrzebne. Bez rozpoznawania twarzy.</p><div class="grid"><label>Typ zdjęcia<select id="photoType"><option value="group">Osoby / grupa</option><option value="event">Reportaż / szeroki plan wydarzenia</option><option value="portrait">Portret / mała grupa</option></select></label><label>Kanał<select id="channel"><option value="facebook">Facebook MOW</option><option value="www">Strona WWW</option><option value="print">Druk</option></select></label></div></section><section class="card"><h2>1. Wybierz grupę lub grupy</h2><div class="people">${groups.map(g=>`<label class="checkbox"><input type="checkbox" data-group="${esc(g)}"> ${esc(g)} <span id="sum-${esc(g)}"></span></label>`).join('')}</div><label class="checkbox"><input type="checkbox" id="allFromGroups"> Potwierdzam, że wszystkie rozpoznawalne osoby na zdjęciu należą do wybranych grup.</label></section><section class="card"><h2>2. Dodaj wyjątki / osoby spoza grup</h2><label>Wyszukaj osobę<select id="extra"><option value="">— wybierz —</option>${state.people.map(p=>`<option value="${p.id}">${esc(p.name)} · ${esc(p.group)}</option>`).join('')}</select></label><div class="actions"><button id="addExtra">Dodaj osobę</button></div><div id="extras"></div><label class="checkbox"><input type="checkbox" id="unknown"> Jest co najmniej jedna rozpoznawalna osoba, której nie potrafię zidentyfikować.</label></section><section class="card"><h2>3. Wynik</h2><div id="result" class="notice">Wybierz grupę lub osobę.</div><div class="actions"><button class="primary" id="saveCheck">Zapisz wynik testu</button></div></section>`);
  const extras=new Set();
  const refresh=()=>{
    const channel=document.querySelector('#channel').value;
    for(const g of groups){const s=groupSummary(state.people,g,channel);document.querySelector(`#sum-${CSS.escape(g)}`).innerHTML=`<span class="badge ${s.level}">${s.ok.length}/${s.total} OK</span>`}
    const selectedGroups=[...document.querySelectorAll('[data-group]:checked')].map(x=>x.dataset.group);
    const selectedPeople=new Map();
    for(const g of selectedGroups) for(const p of state.people.filter(x=>x.group===g)) selectedPeople.set(p.id,p);
    for(const id of extras){const p=state.people.find(x=>x.id===id);if(p)selectedPeople.set(p.id,p)}
    const result=evaluateSelection([...selectedPeople.values()],{channel,unknown:document.querySelector('#unknown').checked});
    document.querySelector('#extras').innerHTML=[...extras].map(id=>{const p=state.people.find(x=>x.id===id);return p?`<article class="person"><div><b>${esc(p.name)}</b><small>${esc(p.group)}</small></div><button data-remove="${id}">Usuń</button></article>`:''}).join('');
    document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{extras.delete(b.dataset.remove);refresh()});
    const text=result.level==='ok'?`✅ Wszystkie wybrane rekordy są zgodne dla kanału ${channel}.`:result.level==='blocked'?`⛔ Są osoby z brakiem/cofnięciem/ograniczeniem zgody. Wymagana zmiana zdjęcia albo decyzja moderatora.`:`⚠️ Wynik wymaga weryfikacji moderatora.`;
    document.querySelector('#result').innerHTML=`<b>${text}</b><div class="summary"><div class="metric"><b>${result.ok.length}</b>zgody aktywne</div><div class="metric"><b>${result.review.length+(result.unknown?1:0)}</b>do weryfikacji</div><div class="metric"><b>${result.blocked.length}</b>blokady</div></div>${result.blocked.concat(result.review).map(x=>`<p><b>${esc(x.person.name)}</b>: ${esc(x.reason)}</p>`).join('')}`;
    return {selectedGroups,result,channel,allFromGroups:document.querySelector('#allFromGroups').checked,photoType:document.querySelector('#photoType').value};
  };
  document.querySelectorAll('[data-group],#channel,#unknown,#photoType,#allFromGroups').forEach(el=>el.onchange=refresh);
  document.querySelector('#addExtra').onclick=()=>{const id=document.querySelector('#extra').value;if(id){extras.add(id);refresh()}};
  document.querySelector('#saveCheck').onclick=()=>{const x=refresh();audit(`Test zdjęcia: typ ${x.photoType}, kanał ${x.channel}, grupy: ${x.selectedGroups.join(', ')||'brak'}, wynik: ${x.result.level}.`);alert('Wynik testu zapisany w historii.');};
  refresh();
}

function history(){
  shell(`<section class="card"><h1>Historia testów</h1><p class="muted">Docelowo będzie to audyt: kto, kiedy, jaki status sprawdził i na podstawie jakiej wersji zgody.</p>${state.audit.length?state.audit.map(x=>`<div class="audit"><b>${new Date(x.at).toLocaleString('pl-PL')}</b><br>${esc(x.text)}</div>`).join(''):'Brak wpisów.'}</section>`);
}

function render(){if(tab==='registry')registry();else if(tab==='photo')photo();else history()}
render();
