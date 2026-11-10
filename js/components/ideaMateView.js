import { getIdeaMateIdeas } from '../ideamate.js';
import { escapeHtml, showToast } from '../utils.js';

const IDEA_MATE_STORAGE_KEY = 'ideaBank_ideas';
const WELCOME = 'ideamate_welcome_seen_v2';
const SPECIALTIES = ['Clinic Growth','Ayurveda','Cardiology','Conservative Dentistry','Dental Public Health','Dentistry','Endodontics','Emergency Medicine','Endocrinology','Family Medicine','General Physician','Gastroenterology','Homeopathy','Implant Dentistry','Internal Medicine','Maxillofacial Surgery','Oral & Maxillofacial Pathology','Oral Medicine','Oral Surgery','Orthodontics','Paediatric Dentistry','Periodontics','Prosthodontics','Public Health Dentistry','Neurology','Obstetrics & Gynaecology','Oncology','Ophthalmology','Orthopaedics','Otolaryngology (ENT)','Paediatrics','Psychiatry','Pulmonology','Radiology','Rheumatology','Urology','Dental Hygiene'].sort((a,b)=>a.localeCompare(b));
const read = () => getIdeaMateIdeas();
const save = (items) => localStorage.setItem(IDEA_MATE_STORAGE_KEY, JSON.stringify(items));
const ensureTutorialIdea = (specialty) => {
  const ideas = read();
  if (specialty !== 'General Physician' || ideas.some((idea) => idea.specialty === specialty)) return ideas;
  ideas.push({ id: `ideamate-tutorial-${Date.now()}`, title: 'When should everyday fatigue be checked by a doctor?', description: 'Explain when persistent or unexplained tiredness deserves a medical review, which warning signs matter, and why self-checks do not replace an evaluation.', category: 'Patient education', subcategory: 'Common symptoms', specialty, status: 'fresh', createdAt: new Date().toISOString(), useCount: 0, isDefault: true, isUserCreated: false });
  save(ideas);
  return ideas;
};
const matches = (ideas, specialty) => ideas.filter((idea) => { if (!specialty) return true; if (specialty === 'Clinic Growth') return idea.isDefault === true && !idea.specialty; const text = [idea.title,idea.description,idea.category,idea.subcategory,idea.specialty].join(' ').toLowerCase(); return text.includes(specialty.toLowerCase()) || (specialty === 'General Physician' && /general|primary|common|patient|clinical/.test(text)); });

function welcome(container, rerender) {
  const options = SPECIALTIES.map((s) => `<option value="${escapeHtml(s)}"></option>`).join('');
  container.innerHTML = `<div class="settings-shell"><section class="card" style="max-width:720px;margin:32px auto;padding:28px"><p class="settings-eyebrow">Welcome to IdeaMate</p><h2 class="settings-title">Come up with ideas and manage ideas</h2><p class="settings-subtitle">IdeaMate has a growing bank of content ideas for multiple medical specialties. Choose your specialty and we’ll show the most relevant ideas available.</p><div class="form-group"><label class="form-label" for="ideamate-specialty">Your specialty</label><select class="form-select" id="ideamate-specialty"><option value="">Select a specialty</option>${options}</select></div><p id="ideamate-specialty-message" class="settings-helper" aria-live="polite"></p><div class="flex gap-2" style="justify-content:flex-end"><button class="btn btn-primary" id="ideamate-begin" disabled>Continue</button></div></section></div>`;
  const oldSpecialtyControl = document.getElementById('ideamate-specialty');
  const specialtyInput = document.createElement('input'); specialtyInput.id = oldSpecialtyControl.id; specialtyInput.className = oldSpecialtyControl.className; specialtyInput.placeholder = 'Type to search specialties…'; specialtyInput.autocomplete = 'off'; oldSpecialtyControl.replaceWith(specialtyInput);
  const select = specialtyInput;
  const datalist = document.createElement('datalist'); datalist.id = 'ideamate-specialty-options'; datalist.innerHTML = options; select.parentNode.appendChild(datalist);
  select.setAttribute('list', 'ideamate-specialty-options');
  select.oninput = () => { const exact = SPECIALTIES.find((s) => s.toLowerCase() === select.value.trim().toLowerCase()); document.getElementById('ideamate-begin').disabled = !exact; if (exact) select.value = exact; };
  select.onchange = () => { document.getElementById('ideamate-begin').disabled = !select.value; document.getElementById('ideamate-specialty-message').textContent = select.value ? `We’ll load ${select.value} ideas when available.` : ''; };
  document.getElementById('ideamate-begin').onclick = () => { localStorage.setItem(WELCOME,'1'); localStorage.setItem('ideamate_specialty',select.value); ensureTutorialIdea(select.value); rerender(); tutorial(); };
}

function tutorial() {
  const steps = [
    ['Ideas are recorded here', 'Use Record an idea whenever something comes to mind. Ideas from Contentmate and your own notes can live in this database.'],
    ['See the full trail', 'The table shows your ideas, specialty, status, and use count. Save ideas for later; used ideas stay marked so they do not keep returning.'],
    ['Give me an idea', 'When you have time, press Give me an idea to get a random unused idea. Choose I will use this when you want to turn it into content.'],
    ['Turn an idea into a script', 'Using an idea opens the Contentmate workflow, where you add clinical context and generate the script prompt pack.']
  ];
  let index=0; const overlay=document.createElement('div'); overlay.className='tutorial-prompt-overlay'; overlay.innerHTML=`<div class="tutorial-prompt-card"><p class="settings-eyebrow">IdeaMate tutorial</p><h3 id="ideamate-tutorial-title"></h3><p id="ideamate-tutorial-body"></p><div class="tutorial-prompt-actions"><button class="btn btn-ghost" id="ideamate-tutorial-skip">Exit</button><button class="btn btn-primary" id="ideamate-tutorial-next">Next</button></div></div>`; document.body.appendChild(overlay);
  const render=()=>{document.getElementById('ideamate-tutorial-title').textContent=steps[index][0];document.getElementById('ideamate-tutorial-body').textContent=steps[index][1];document.getElementById('ideamate-tutorial-next').textContent=index===steps.length-1?'Revise this in Contentmate':'Next';};
  document.getElementById('ideamate-tutorial-next').onclick=()=>{if(index===steps.length-1){overlay.remove();window.dispatchEvent(new Event('contentmate-replay-tutorial'));}else{index++;render();}};
  document.getElementById('ideamate-tutorial-skip').onclick=()=>{overlay.remove();}; render();
}

function discovery(container, idea, openModal, rerender) {
  const card = document.getElementById('ideamate-discovery'); card.style.display = 'block';
  card.innerHTML = `<h3>${escapeHtml(idea.title)}</h3><p class="idea-meta-label">${escapeHtml(idea.category || 'Uncategorized')}${idea.subcategory ? ` · ${escapeHtml(idea.subcategory)}` : ''}</p><p>${escapeHtml(idea.description || 'Add clinical context before converting this into a script.')}</p><button class="btn btn-accent btn-sm" id="discovery-use">I will use this</button> <button class="btn btn-secondary btn-sm" id="discovery-edit">Edit</button> <button class="btn btn-secondary btn-sm" id="discovery-other">Other idea</button> <button class="btn btn-ghost btn-sm" id="discovery-trash">Trash</button>`;
  document.getElementById('discovery-use').onclick = () => { const items=read(), item=items.find((x)=>x.id===idea.id); if(item){item.status='used';item.useCount=(item.useCount||0)+1;item.usedAt=new Date().toISOString();save(items);} openModal('insightCreate',{prefillTitle:idea.title,source:'ideamate'}); };
  document.getElementById('discovery-edit').onclick = () => { idea.title=window.prompt('Edit idea title',idea.title)||idea.title; save(read()); rerender(); };
  document.getElementById('discovery-other').onclick = () => document.getElementById('btn-ideamate-random').click();
  document.getElementById('discovery-trash').onclick = () => { idea.status='trashed'; save(read()); rerender(); };
}

export const IdeaMateView = { render(container, navigateTo, openModal) {
  const rerender=()=>this.render(container,navigateTo,openModal);
  if(!localStorage.getItem(WELCOME)){welcome(container,rerender);return;}
  const specialty=localStorage.getItem('ideamate_specialty')||'', all=ensureTutorialIdea(specialty), showingMine=container.dataset.ideamateFilter==='mine';
  const ideas=matches(all,specialty).filter((x)=>x.status!=='trashed'&&(!showingMine||x.isUserCreated===true));
  const count=(s)=>ideas.filter((x)=>x.status===s).length;
  container.innerHTML=`<div class="settings-shell"><header class="settings-hero"><p class="settings-eyebrow">IdeaMate · ${escapeHtml(specialty||'All specialties')}</p><h2 class="settings-title">Your idea bank</h2><p class="settings-subtitle">Record every idea, see what has been used, and turn a strong idea into a script when you have time.</p><div class="flex gap-2" style="flex-wrap:wrap"><button class="btn btn-primary" id="btn-ideamate-new">Record an idea</button><button class="btn btn-accent" id="btn-ideamate-random">Give me an idea</button><button class="btn btn-secondary" id="btn-ideamate-mine">${showingMine?'Show all ideas':'Show my ideas'}</button><button class="btn btn-ghost" id="btn-ideamate-change">Change specialty</button></div></header><div class="ideamate-stats"><div class="ideamate-stat"><span>Ideas shown</span><strong>${ideas.length}</strong></div><div class="ideamate-stat"><span>Fresh</span><strong>${count('fresh')+ideas.filter((x)=>!x.status).length}</strong></div><div class="ideamate-stat"><span>Saved</span><strong>${count('saved')}</strong></div><div class="ideamate-stat"><span>Used</span><strong>${count('used')}</strong></div><div class="ideamate-stat"><span>Trash</span><strong>${all.filter((x)=>x.status==='trashed').length}</strong></div></div><section class="card" id="ideamate-discovery" style="display:none;margin:18px 0;padding:18px"></section><section class="card" id="ideamate-table" style="padding:18px;overflow:auto"></section></div>`;
  const table=document.getElementById('ideamate-table');
  if(!ideas.length) table.innerHTML=`<div class="text-center" style="padding:30px;color:var(--text-tertiary)">We don’t have ${escapeHtml(specialty)} ideas yet, but we might soon. You can record your own idea now.</div>`;
  else { table.innerHTML='<h3>Ideas in this database</h3><p style="color:var(--text-secondary);font-size:13px">Used ideas stay tracked so they do not keep coming back.</p><table style="width:100%;min-width:680px;border-collapse:collapse"><thead><tr><th style="text-align:left">Idea</th><th>Status</th><th>Used</th><th>Actions</th></tr></thead><tbody id="ideamate-rows"></tbody></table>'; const rows=document.getElementById('ideamate-rows'); ideas.forEach((idea)=>{const row=document.createElement('tr');row.style.borderTop='1px solid var(--border-subtle)';row.innerHTML=`<td style="padding:12px 0"><strong>${escapeHtml(idea.title)}</strong><div style="font-size:12px;color:var(--text-tertiary)">${escapeHtml(idea.category||'Uncategorized')}</div><div style="font-size:12px;color:var(--text-tertiary)">${escapeHtml(idea.description||'')}</div></td><td>${escapeHtml(idea.status||'fresh')}</td><td>${idea.useCount||0}</td><td><button class="btn btn-accent btn-sm" data-use>Use</button> <button class="btn btn-secondary btn-sm" data-save>${idea.status==='saved'?'Unsave':'Save'}</button> <button class="btn btn-ghost btn-sm" data-edit>Edit</button></td>`;row.querySelector('[data-use]').onclick=()=>discovery(container,idea,openModal,rerender);row.querySelector('[data-save]').onclick=()=>{idea.status=idea.status==='saved'?'fresh':'saved';save(all);rerender();};row.querySelector('[data-edit]').onclick=()=>{const title=window.prompt('Edit idea title',idea.title);if(title===null)return;const description=window.prompt('Edit idea description',idea.description||'');const category=window.prompt('Edit category',idea.category||'');const subcategory=window.prompt('Edit subcategory',idea.subcategory||'');idea.title=title.trim()||idea.title;idea.description=description===null?idea.description:description.trim();idea.category=category===null?idea.category:category.trim();idea.subcategory=subcategory===null?idea.subcategory:subcategory.trim();save(all);rerender();};rows.appendChild(row);});}
  document.getElementById('btn-ideamate-new').onclick=()=>openModal('insightCreate',{source:'ideamate'});
  document.getElementById('btn-ideamate-mine').onclick=()=>{container.dataset.ideamateFilter=showingMine?'':'mine';rerender();};
  document.getElementById('btn-ideamate-change').onclick=()=>{localStorage.removeItem(WELCOME);welcome(container,rerender);};
  document.getElementById('btn-ideamate-random').onclick=()=>{const pool=ideas.filter((x)=>x.status!=='saved');if(!pool.length){showToast(`No fresh ${specialty} ideas are available yet.`,'info');return;}discovery(container,pool[Math.floor(Math.random()*pool.length)],openModal,rerender);};
} };
