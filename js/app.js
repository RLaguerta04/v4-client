// ── BRIEF state ──
let activeTrend=null,spotTracked=false;
// Shared View uses social posts; MediaWatch uses news articles. Use this to word user-visible copy accordingly.
function _SOC(){return !!(window.WS_DATA&&window.WS_DATA.socialMentions);}
function _wPost(cap){return _SOC()?(cap?'Post':'post'):(cap?'Article':'article');}
function _wPosts(cap){return _SOC()?(cap?'Posts':'posts'):(cap?'Articles':'articles');}
const MC={'TV':'media-tv','Online':'media-online','Print':'media-print','Radio':'media-radio','Social':'media-social'};

// ── Workspace data layer ──
// Each page chooses a workspace by loading a data file (e.g. js/data-shared.js) before app.js,
// which sets window.WS + window.WS_DATA. wsData() returns the workspace's own copy of a dataset:
//   • explicit override in WS_DATA  → use it (fully custom Shared View content)
//   • non-default workspace, no override → an independent deep clone of the MediaWatch default
//   • MediaWatch (no WS flag) → the default as-is (zero change)
// This keeps one shared engine (app.js) while each workspace's content stays independent.
function wsData(k,def){
  if(window.WS_DATA&&window.WS_DATA[k])return window.WS_DATA[k];
  if(window.WS&&window.WS!=='mediawatch'){try{return JSON.parse(JSON.stringify(def));}catch(e){return def;}}
  return def;
}
// Tag the document with the workspace so CSS can theme it (Shared View = blue, MediaWatch = coral)
if(window.WS&&window.WS!=='mediawatch'&&document.body)document.body.classList.add('ws-'+window.WS);

let trendStories=[
  {id:0,rank:1,tier:'T1',hl:'Jimenez/PLDT executive rivalry — telco competitive landscape narrative',why:"Triggered by 'DITO Telecommunity' — Jimenez's pointed remarks on PLDT competitors picked up across Tier 1 business outlets, broadcast, and radio within 24 hours.",chips:[{cls:'c-neu',t:'Neutral'},{cls:'c-vel',t:'12 '+_wPosts()+' / 1 day'},{cls:'c-ch',t:'Online'},{cls:'c-ch',t:'Print'},{cls:'c-ch',t:'TV'},{cls:'c-ch',t:'Radio'}],tracked:false,ave:'PHP 4.41M',articles:[
    {media:'Print',source:'Philippine Daily Inquirer',hl:"BIZ BUZZ: Jimenez twits PLDT's foes",date:'14 hours ago',ave:'PHP 397K',score:96,dateRank:14},
    {media:'Online',source:'INQUIRER PLUS',hl:'BIZ BUZZ: Jimenez twits PLDTs foes Inquirer Plus',date:'14 hours ago',ave:'PHP 206K',score:91,dateRank:14},
    {media:'Online',source:'Philstar Online',hl:"PLDTs 'butcher COO publicly slices telco rivals",date:'15 hours ago',ave:'PHP 631K',score:84,dateRank:15},
    {media:'TV',source:'ABS-CBN News',hl:'Telco war escalates: Jimenez vs. Reyes feud explained',date:'16 hours ago',ave:'PHP 890K',score:82,dateRank:16},
    {media:'TV',source:'CNN Philippines',hl:"What Jimenez's PLDT remarks mean for DITO",date:'17 hours ago',ave:'PHP 710K',score:79,dateRank:17},
    {media:'Online',source:'Rappler',hl:"Why Jimenez's PLDT comments matter — analyst reaction",date:'18 hours ago',ave:'PHP 245K',score:76,dateRank:18},
    {media:'Online',source:'BusinessWorld',hl:'Telco competition heats up as Jimenez fires back',date:'19 hours ago',ave:'PHP 410K',score:73,dateRank:19},
    {media:'Online',source:'Manila Bulletin',hl:"DITO's Jimenez addresses PLDT criticism head-on",date:'20 hours ago',ave:'PHP 280K',score:71,dateRank:20},
    {media:'Radio',source:'DZRH News',hl:'Telco rivalry: Jimenez sa PLDT, sumagot',date:'21 hours ago',ave:'PHP 75K',score:68,dateRank:21},
    {media:'Online',source:'GMA News Online',hl:'PLDT COO responds to DITO Jimenez statements',date:'22 hours ago',ave:'PHP 340K',score:67,dateRank:22},
    {media:'Social',source:'X / Twitter',hl:'#Jimenez trends as PLDT-DITO feud goes public',date:'1 day ago',ave:'PHP 45K',score:64,dateRank:24},
    {media:'Online',source:'Tech in Asia',hl:'Philippines telco war: a tale of two execs',date:'1 day ago',ave:'PHP 180K',score:61,dateRank:24},
  ]},
  {id:1,rank:2,tier:'T1',hl:"DITO crowned Philippines' fastest mobile network — Opensignal recognition",why:"Triggered by 'DITO Telecommunity' — independent Opensignal benchmark recognition. Reinforces network performance positioning.",chips:[{cls:'c-pos',t:'Positive'},{cls:'c-vel',t:'2 '+_wPosts()+' / 1 day'},{cls:'c-ch',t:'Online'}],tracked:false,ave:'PHP 281K',articles:[
    {media:'Online',source:'Inquirer Online',hl:'DITO reigns supreme as the Philippines fastest mobile network by Opens...',date:'1 day ago',ave:'PHP 190K',score:94},
    {media:'Online',source:'Manila Shaker Philippines',hl:'DITO StreamZone199 Now Available',date:'23 hours ago',ave:'PHP 91K',score:78},
  ]},
  {id:2,rank:3,tier:'T1',hl:'DITO 5G expansion to Visayas — coverage push intensifies',why:"Triggered by 'DITO Telecommunity' — geographic expansion narrative tied to telco competition. Positive sentiment across regional and national outlets.",chips:[{cls:'c-pos',t:'Positive'},{cls:'c-ch',t:'Online'},{cls:'c-ch',t:'Business'}],tracked:false,ave:'PHP 334K',articles:[
    {media:'Online',source:'BusinessWorld',hl:'Telco war heats up as DITO expands 5G coverage to Visayas',date:'3 days ago',ave:'PHP 256K',score:92},
    {media:'Online',source:'SunStar Cebu',hl:'DITO Telecommunity opens new flagship store in Cebu City',date:'4 days ago',ave:'PHP 78K',score:81},
  ]},
  {id:3,rank:4,tier:'T2',hl:'DITO enterprise partnerships — Visayan Electric & LGU digital push',why:"Triggered by 'DITO Telecommunity' — B2B and government partnerships frame the brand as a digital transformation enabler.",chips:[{cls:'c-pos',t:'Positive'},{cls:'c-ch',t:'Online'}],tracked:false,ave:'PHP 326K',articles:[
    {media:'Online',source:'Insider Ph',hl:'Visayan Electric eyes smarter energy services with DITO',date:'2 days ago',ave:'PHP 184K',score:88},
    {media:'Online',source:'Manila Bulletin',hl:'DITO partners with local government for digital transformation push',date:'3 days ago',ave:'PHP 142K',score:85},
  ]},
];
trendStories=wsData('trendStories',trendStories);


function openBrief(){
  // open the brief if collapsed (used by the Tier 1 stat deep-link)
  if(!document.getElementById('b-body').classList.contains('open')) toggleBrief();
}
function toggleBrief(){
  const body=document.getElementById('b-body'),chev=document.getElementById('b-chev'),top=document.getElementById('b-top'),label=document.getElementById('b-chev-label');
  const open=body.classList.toggle('open');
  chev.classList.toggle('open',open);top.classList.toggle('open',open);
  label.textContent=open?'Hide brief':'View full brief';
  if(open){
    body.querySelectorAll('.mm-pane').forEach(p=>p.classList.remove('act'));
    body.querySelectorAll('.mm-tab').forEach(t=>t.classList.remove('act'));
    document.getElementById('pane-spot').classList.add('act');
    body.querySelector('.mm-tab').classList.add('act');
    activeTrend=null;
    renderTrendRows();
    rerenderList('spot');
  }
}

function switchBriefTab(name,el){
  const body=document.getElementById('b-body');
  body.querySelectorAll('.mm-pane').forEach(p=>p.classList.remove('act'));
  body.querySelectorAll('.mm-tab').forEach(t=>t.classList.remove('act'));
  document.getElementById('pane-'+name).classList.add('act');
  el.classList.add('act');
  if(name!=='trend'){
    activeTrend=null;
    renderTrendRows();
  }
}

function renderTrendRows(){
  const c=document.getElementById('trend-rows');if(!c)return;
  const anyOpen=activeTrend!==null;
  c.innerHTML=trendStories.map(s=>{
    const sc=s.chips[0].cls==='c-neg'?'#991b1b':s.chips[0].cls==='c-pos'?'#15803d':'#1d4ed8';
    const isOpen=activeTrend===s.id;
    const dimmed=anyOpen&&!isOpen;
    return `
    <div class="tr-card${isOpen?' active-tr':''}${dimmed?' dimmed':''}">
      <div class="tr-row" onclick="selectTrend(${s.id})">
        <div class="tr-num">#${s.rank}</div>
        <div class="tr-body">
          <div class="tr-hl">${s.hl}</div>
          <div class="tr-meta"><span style="font-weight:600;color:#181d26">${s.tier}</span><span style="color:${sc};font-weight:500">${s.chips[0].t}</span><span style="color:#e4e6ea">·</span><span>${s.articles.length} ${_wPosts()}</span><span style="color:#e4e6ea">·</span><span class="tot-ave">${s.ave}</span></div>
        </div>
        <i data-lucide="chevron-down" class="tr-arrow"></i>
      </div>
      <div class="tr-detail${isOpen?' open':''}" id="tr-detail-${s.id}">
        <div class="tr-detail-inner">
          <div class="chips" style="margin-bottom:16px">${s.chips.map(ch=>`<span class="chip ${ch.cls}">${ch.t}</span>`).join('')}</div>
          <div class="detail-actions">
            <button class="btn-nl" onclick="event.stopPropagation();showNewsletter(trendStories.find(x=>x.id===${s.id}))"><i data-lucide="mail" class="icon-lg"></i> Send as newsletter</button>
            <button class="btn-primary" onclick="event.stopPropagation();showAIReport(trendStories.find(x=>x.id===${s.id}))"><i data-lucide="file-text" class="icon-lg"></i> Generate AI report</button>
            <button class="${s.tracked?'btn-track tracked':'btn-track'}" id="td-track-${s.id}" onclick="event.stopPropagation();trackTrend(${s.id})">
              <i data-lucide="${s.tracked?'check':'megaphone'}" class="icon-lg"></i> ${s.tracked?'Tracked':'Track this story'}
            </button>
            <button class="btn-primary" onclick="event.stopPropagation();exportStory(${s.id})"><i data-lucide="download" class="icon-lg"></i> Export</button>
          </div>
          <div class="why-strip">
            <span class="why-strip-lbl"><i data-lucide="zap"></i> Why this was picked</span>
            <span class="why-strip-txt">${s.why}</span>
          </div>
          <div id="al-trend-${s.id}"></div>
        </div>
      </div>
    </div>`;
  }).join('');
  initIcons();
  if(activeTrend!==null) rerenderList('trend-'+activeTrend);
}

// per-list state: sort key, active filter, expanded toggle
const alState={};
const aveNum=s=>parseFloat(String(s).replace(/[^0-9.]/g,''))||0;

function articlesForList(listId){
  // Shared View: the brief's coverage lists (spotlight + trending) and the tracker's matched articles
  // (trk-<id>) show social posts, not news articles.
  const social=window.WS_DATA&&window.WS_DATA.socialMentions;
  if(social&&(listId==='spot'||listId.startsWith('trend-')||listId.startsWith('trk-'))) return social;
  if(listId==='spot') return trendStories[0].articles;
  if(listId.startsWith('trend-')) return (trendStories.find(s=>s.id===parseInt(listId.split('-')[1]))||{}).articles||[];
  return [];
}

function renderArticleList(articles,listId){
  const state=alState[listId]||(alState[listId]={sort:'sim',filters:[],page:1});
  // Shared View brief: social posts get a dedicated row layout (Source · Post · Sentiment · Influencer · Match · As of)
  if(articles[0]&&articles[0].platform) return renderSocialArticleList(articles,listId,state);
  const sel=state.filters||(state.filters=[]);
  const mediaTypes=[...new Set(articles.map(a=>a.media))].filter(m=>m!=='Social');
  let filtered=sel.length===0?articles.slice():articles.filter(a=>sel.includes(a.media));
  if(state.sort==='sim')filtered.sort((a,b)=>b.score-a.score);
  else if(state.sort==='date')filtered.sort((a,b)=>(a.dateRank||0)-(b.dateRank||0));
  else if(state.sort==='ave')filtered.sort((a,b)=>aveNum(b.ave)-aveNum(a.ave));

  const showControls=articles.length>=10;
  const PER_PAGE=10;
  const totalPages=Math.max(1,Math.ceil(filtered.length/PER_PAGE));
  let page=state.page||1;if(page>totalPages)page=totalPages;if(page<1)page=1;state.page=page;
  const start=(page-1)*PER_PAGE;
  const visible=filtered.slice(start,start+PER_PAGE);

  const sortLabels={sim:'Similarity',date:'Most recent',ave:'Highest AVE'};
  const controls=showControls?`
    <div class="art-filter-bar">
      <div class="at-type-dd al-sort-dd" id="al-sort-dd-${listId}">
        <div class="fc" onclick="toggleAlSort('${listId}',event)">
          <span>Sort: ${sortLabels[state.sort]||'Similarity'}</span>
          <i data-lucide="chevron-down"></i>
        </div>
        <div class="at-type-menu al-sort-menu" id="al-sort-menu-${listId}">
          ${[['sim','Similarity'],['date','Most recent'],['ave','Highest AVE']].map(([v,l])=>`<div class="at-type-opt${state.sort===v?' active':''}" onclick="setSort('${listId}','${v}')"><span>Sort: ${l}</span></div>`).join('')}
        </div>
      </div>
      <span class="art-count">All coverage — ${articles.length} article${articles.length!==1?'s':''}</span>
      <div class="art-media-pills">
        <span class="art-pill${sel.length===0?' on':''}" onclick="clearFilters('${listId}')">All</span>
        ${mediaTypes.map(m=>`<span class="art-pill${sel.includes(m)?' on':''}" onclick="toggleFilter('${listId}','${m}')">${sel.includes(m)?'<i data-lucide="check"></i> ':''}${m}</span>`).join('')}
      </div>
    </div>`:`
    <div class="art-filter-bar"><span class="art-count">All coverage — ${articles.length} article${articles.length!==1?'s':''}</span></div>`;

  let pager='';
  if(totalPages>1){
    let ws=Math.max(1,page-2),we=Math.min(totalPages,ws+4);ws=Math.max(1,we-4);
    const win=[];for(let i=ws;i<=we;i++)win.push(i);
    pager=`<div class="al-pager">
      <span class="al-pg-info">${start+1}-${Math.min(start+PER_PAGE,filtered.length)} of ${filtered.length} ${_wPosts()}</span>
      <div class="pg-btns">
        <button class="pgb arrow"${page===1?' disabled':''} onclick="setArtPage('${listId}',${page-1})"><i data-lucide="chevron-left"></i></button>
        ${win.map(n=>`<button class="pgb${n===page?' on':''}" onclick="setArtPage('${listId}',${n})">${n}</button>`).join('')}
        <button class="pgb arrow"${page===totalPages?' disabled':''} onclick="setArtPage('${listId}',${page+1})"><i data-lucide="chevron-right"></i></button>
      </div>
    </div>`;
  }

  const empty=filtered.length===0?`<div class="al-empty">No ${_wPosts()} match this filter.</div>`:'';

  const rows=visible.map((a,i)=>{
    const ic=ATicn[a.media]||{cls:'type-online',icon:'newspaper'};
    const sc=a.score>=85?'sc-hi':a.score>=70?'sc-mid':'sc-lo';
    const barColor=a.score>=85?'#16a34a':a.score>=70?'#d97706':'#9ca3af';
    return`<tr class="match-tbl-row" style="animation-delay:${i*0.03}s;cursor:pointer" onclick="previewArticle('${listId}','${encodeURIComponent(a.hl)}')">
      <td><div class="hl-cell"><span class="hl-icon ${ic.cls}" data-btip="${_makeTip({label:a.media})}"><i data-lucide="${ic.icon}"></i></span><div><div class="match-hl">${a.hl}</div></div></div></td>
      <td style="width:150px"><div class="pub-name">${a.source}</div><div class="pub-cat">${a.media}</div></td>
      <td style="width:110px"><span class="match-ave">${a.ave}</span></td>
      <td style="width:130px"><span class="art-score-val ${sc}">${a.score}% match</span><div class="match-score-track" style="margin-top:4px"><div class="match-score-fill" style="width:${a.score}%;background:${barColor}"></div></div></td>
      <td style="width:110px;white-space:nowrap"><div class="date-main">${a.date}</div></td>
    </tr>`;
  }).join('');
  const table=filtered.length===0?'':`<table class="tbl match-tbl"><thead><tr>
    <th style="width:40%">Headline</th>
    <th style="width:17%">Outlet</th>
    <th style="width:13%">AVE</th>
    <th style="width:16%">Match</th>
    <th style="width:14%">Date</th>
  </tr></thead><tbody>${rows}</tbody></table>`;

  return `<div class="article-list">
    ${controls}
    ${empty}
    ${table}
    ${pager}
  </div>`;
}

// Shared View brief coverage rendered as social rows (mirrors the mentions table) + retained Match column.
function renderSocialArticleList(articles,listId,state){
  const sel=state.filters||(state.filters=[]);
  const platforms=[...new Set(articles.map(a=>a.platform))];
  const reachNum=s=>{const m=String(s||'').replace(/,/g,'').match(/([\d.]+)\s*([km]?)/i);if(!m)return 0;let n=parseFloat(m[1]);if(/k/i.test(m[2]))n*=1e3;return n;};
  const platSel=sel.filter(v=>platforms.includes(v));   // ignore stray non-platform filter values
  let filtered=platSel.length===0?articles.slice():articles.filter(a=>platSel.includes(a.platform));
  if(state.sort==='reach')filtered.sort((a,b)=>reachNum(b.reach)-reachNum(a.reach));
  else if(state.sort!=='date')filtered.sort((a,b)=>(b.match||0)-(a.match||0));   // 'sim' (default); 'date' keeps data order
  const PER_PAGE=10;
  const totalPages=Math.max(1,Math.ceil(filtered.length/PER_PAGE));
  let page=state.page||1;if(page>totalPages)page=totalPages;if(page<1)page=1;state.page=page;
  const start=(page-1)*PER_PAGE;
  const visible=filtered.slice(start,start+PER_PAGE);
  const showControls=articles.length>=10;
  const sortLabels={sim:'Similarity',date:'Most recent',reach:'Highest reach'};
  const controls=showControls?`
    <div class="art-filter-bar">
      <div class="at-type-dd al-sort-dd" id="al-sort-dd-${listId}">
        <div class="fc" onclick="toggleAlSort('${listId}',event)"><span>Sort: ${sortLabels[state.sort]||'Similarity'}</span><i data-lucide="chevron-down"></i></div>
        <div class="at-type-menu al-sort-menu" id="al-sort-menu-${listId}">
          ${[['sim','Similarity'],['date','Most recent'],['reach','Highest reach']].map(([v,l])=>`<div class="at-type-opt${state.sort===v?' active':''}" onclick="setSort('${listId}','${v}')"><span>Sort: ${l}</span></div>`).join('')}
        </div>
      </div>
      <span class="art-count">All coverage — ${articles.length} post${articles.length!==1?'s':''}</span>
      <div class="art-media-pills">
        <span class="art-pill${sel.length===0?' on':''}" onclick="clearFilters('${listId}')">All</span>
        ${platforms.map(pl=>{const p=SOCIAL_PLATFORMS[pl]||{label:pl};return`<span class="art-pill${sel.includes(pl)?' on':''}" onclick="toggleFilter('${listId}','${pl}')">${sel.includes(pl)?'<i data-lucide="check"></i> ':''}${p.label}</span>`;}).join('')}
      </div>
    </div>`:`
    <div class="art-filter-bar"><span class="art-count">All coverage — ${articles.length} post${articles.length!==1?'s':''}</span></div>`;
  let pager='';
  if(totalPages>1){
    let ws=Math.max(1,page-2),we=Math.min(totalPages,ws+4);ws=Math.max(1,we-4);
    const win=[];for(let i=ws;i<=we;i++)win.push(i);
    pager=`<div class="al-pager">
      <span class="al-pg-info">${start+1}-${Math.min(start+PER_PAGE,filtered.length)} of ${filtered.length} posts</span>
      <div class="pg-btns">
        <button class="pgb arrow"${page===1?' disabled':''} onclick="setArtPage('${listId}',${page-1})"><i data-lucide="chevron-left"></i></button>
        ${win.map(n=>`<button class="pgb${n===page?' on':''}" onclick="setArtPage('${listId}',${n})">${n}</button>`).join('')}
        <button class="pgb arrow"${page===totalPages?' disabled':''} onclick="setArtPage('${listId}',${page+1})"><i data-lucide="chevron-right"></i></button>
      </div>
    </div>`;
  }
  const empty=filtered.length===0?`<div class="al-empty">No posts match this filter.</div>`:'';
  const all=(window.WS_DATA&&window.WS_DATA.socialMentions)||[];
  const rows=visible.map((a,i)=>{
    const gi=all.indexOf(a);
    const p=SOCIAL_PLATFORMS[a.platform]||{icon:'fa-globe',color:'#6b7280',label:a.platform||'—'};
    const t=SOCIAL_TYPES[a.type]||{icon:'message-square',cls:'type-online'};
    const sc=a.match>=85?'sc-hi':a.match>=70?'sc-mid':'sc-lo';
    const barColor=a.match>=85?'#16a34a':a.match>=70?'#d97706':'#9ca3af';
    return`<tr class="match-tbl-row" style="animation-delay:${i*0.03}s;cursor:pointer" onclick="previewSocialPost('${listId}',${gi})">
      <td><div class="hl-cell"><span class="hl-text soc-post" data-btip="${_makeTip({detail:a.post||''})}">${a.post||''}</span></div></td>
      <td style="width:54px"><span class="soc-src" title="${p.label}">${socIcon(p)}</span></td>
      <td class="tbl-sent-cell" style="width:120px">${sentimentCellHtml(a.sentiment)}</td>
      <td style="width:140px"><span class="soc-influencer">${a.influencer||''}</span></td>
      <td style="width:130px"><span class="art-score-val ${sc}">${a.match}% match</span><div class="match-score-track" style="margin-top:4px"><div class="match-score-fill" style="width:${a.match}%;background:${barColor}"></div></div></td>
      <td style="width:110px;white-space:nowrap"><div class="date-main">${a.date||''}</div><div class="date-ago">${a.ago||''}</div></td>
    </tr>`;
  }).join('');
  const table=filtered.length===0?'':`<table class="tbl match-tbl"><thead><tr>
    <th style="width:40%">Post</th>
    <th style="width:8%">Source</th>
    <th style="width:12%">Sentiment</th>
    <th style="width:16%">Influencer</th>
    <th style="width:13%">Match</th>
    <th style="width:11%">As of</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
  return `<div class="article-list">
    ${controls}
    ${empty}
    ${table}
    ${pager}
  </div>`;
}
function rerenderList(listId){
  const host=document.getElementById('al-'+listId);
  if(host){host.innerHTML=renderArticleList(articlesForList(listId),listId);initIcons();}
}
function alStateFor(listId){return alState[listId]||(alState[listId]={sort:'sim',filters:[],page:1});}
function setSort(listId,val){const s=alStateFor(listId);s.sort=val;s.page=1;rerenderList(listId);}
// Custom sort dropdown (tracker-style) — per-list menu id; selecting re-renders the list (closes it)
function toggleAlSort(listId,e){e.stopPropagation();document.getElementById('al-sort-menu-'+listId)?.classList.toggle('open');}
document.addEventListener('click',function(){document.querySelectorAll('.al-sort-menu.open').forEach(m=>m.classList.remove('open'));});
function clearFilters(listId){const s=alStateFor(listId);s.filters=[];s.page=1;rerenderList(listId);}
function toggleFilter(listId,val){const s=alStateFor(listId);s.filters=s.filters||[];const i=s.filters.indexOf(val);if(i>=0)s.filters.splice(i,1);else s.filters.push(val);s.page=1;rerenderList(listId);}
function setArtPage(listId,page){const s=alStateFor(listId);s.page=page;rerenderList(listId);}

// ── Media Source dropdown (mentions filter bar) ──
// Labels mirror the design mockup; `val` maps each to the feed's media field
// (Blogs/Provincial/Tabloid/Magazine have no articles → selecting only those empties the feed).
const MS_OPTIONS=[
  {label:'Online News',val:'Online'},
  {label:'Blogs',val:'Blogs'},
  {label:'Broadsheet',val:'Print'},
  {label:'Provincial',val:'Provincial'},
  {label:'Tabloid',val:'Tabloid'},
  {label:'Magazine',val:'Magazine'},
  {label:'TV',val:'TV'},
  {label:'Radio',val:'Radio'},
];
let msSel=new Set(MS_OPTIONS.map(o=>o.label));   // default: all selected
function msRender(){
  const menu=document.getElementById('ms-menu');if(!menu)return;
  const allOn=msSel.size===MS_OPTIONS.length;
  menu.innerHTML=`<div class="ms-title">Media Source</div><div class="ms-divider"></div>
    <label class="ms-opt"><input type="checkbox" ${allOn?'checked':''} onchange="msToggleAll(this.checked)"><span>Select All</span></label>
    ${MS_OPTIONS.map(o=>`<label class="ms-opt"><input type="checkbox" ${msSel.has(o.label)?'checked':''} onchange="msToggleOne('${o.label}',this.checked)"><span>${o.label}</span></label>`).join('')}
    <button class="ms-apply" onclick="msApply()">Apply</button>`;
}
function msClose(){
  const m=document.getElementById('ms-menu');
  if(!m||m.style.display==='none'||m.classList.contains('closing'))return;
  m.classList.add('closing');
  setTimeout(()=>{m.style.display='none';m.classList.remove('closing');},180);
}
function msToggle(e){
  e.stopPropagation();
  const m=document.getElementById('ms-menu');if(!m)return;
  const open=m.style.display!=='none'&&!m.classList.contains('closing');
  if(open){msClose();return;}
  m.classList.remove('closing');msRender();m.style.display='block';
}
function msToggleAll(on){msSel=on?new Set(MS_OPTIONS.map(o=>o.label)):new Set();msRender();}
function msToggleOne(label,on){if(on)msSel.add(label);else msSel.delete(label);msRender();}
function msLabel(){
  if(msSel.size===MS_OPTIONS.length)return'All media';
  if(msSel.size===0)return'No media';
  const arr=MS_OPTIONS.filter(o=>msSel.has(o.label)).map(o=>o.label);
  return arr.length===1?arr[0]:`${arr[0]}, +${arr.length-1}`;
}
function msApply(){
  const lbl=document.getElementById('ms-label');if(lbl)lbl.textContent=msLabel();
  const allOn=msSel.size===MS_OPTIONS.length;
  const vals=allOn?[]:[...new Set(MS_OPTIONS.filter(o=>msSel.has(o.label)).map(o=>o.val))];
  const s=alStateFor('spot');s.filters=vals;s.page=1;rerenderList('spot');
  msClose();
}
document.addEventListener('click',function(e){
  const menu=document.getElementById('ms-menu'),btn=document.getElementById('ms-btn');
  if(menu&&menu.style.display!=='none'&&!menu.contains(e.target)&&btn&&!btn.contains(e.target))msClose();
});

// ── All Filters dropdown (mentions) — UI control, applied state remembered ──
const afxState={emphasis:'All',tonality:'All',sentiment:'All',min:0,max:10};
function afxFill(lo,hi){const f=document.getElementById('afx-fill');if(f){f.style.left=(lo/10*100)+'%';f.style.width=((hi-lo)/10*100)+'%';}}
function afxSyncFromRange(){
  const lo=+document.getElementById('afx-min-range').value,hi=+document.getElementById('afx-max-range').value;
  document.getElementById('afx-min-num').value=lo;document.getElementById('afx-max-num').value=hi;afxFill(lo,hi);
}
function afxRange(which){
  const lo=document.getElementById('afx-min-range'),hi=document.getElementById('afx-max-range');
  if(+lo.value>+hi.value){if(which==='min')lo.value=hi.value;else hi.value=lo.value;}
  afxSyncFromRange();
}
function afxNum(which){
  const lo=document.getElementById('afx-min-range'),hi=document.getElementById('afx-max-range');
  const nl=document.getElementById('afx-min-num'),nh=document.getElementById('afx-max-num');
  let a=Math.max(0,Math.min(10,parseInt(nl.value,10)||0)),b=Math.max(0,Math.min(10,parseInt(nh.value,10)||0));
  if(a>b){if(which==='min')a=b;else b=a;}
  lo.value=a;hi.value=b;nl.value=a;nh.value=b;afxFill(a,b);
}
function afxRadioVal(group){const el=document.querySelector('input[name="afx-'+group+'"]:checked');return el?el.value:'All';}
function afxReset(){
  ['emphasis','tonality','sentiment'].forEach(g=>{const el=document.querySelector('input[name="afx-'+g+'"][value="'+afxState[g]+'"]');if(el)el.checked=true;});
  document.getElementById('afx-min-range').value=afxState.min;
  document.getElementById('afx-max-range').value=afxState.max;
  afxSyncFromRange();
}
function afxBadge(){
  let n=0;
  if(afxState.emphasis!=='All')n++;
  if(afxState.tonality!=='All')n++;
  if(afxState.sentiment!=='All')n++;
  if(afxState.min!==0||afxState.max!==10)n++;
  const b=document.getElementById('afx-badge');if(b){b.textContent=n;b.style.display=n?'inline-flex':'none';}
}
function afxApply(){
  afxState.emphasis=afxRadioVal('emphasis');
  afxState.tonality=afxRadioVal('tonality');
  afxState.sentiment=afxRadioVal('sentiment');
  afxState.min=+document.getElementById('afx-min-range').value;
  afxState.max=+document.getElementById('afx-max-range').value;
  afxBadge();afxClose();
}
function afxClose(){
  const m=document.getElementById('afx-menu');
  if(!m||m.style.display==='none'||m.classList.contains('closing'))return;
  m.classList.add('closing');
  setTimeout(()=>{m.style.display='none';m.classList.remove('closing');},180);
}
function afxToggle(e){
  e.stopPropagation();
  const m=document.getElementById('afx-menu');if(!m)return;
  const open=m.style.display!=='none'&&!m.classList.contains('closing');
  if(open){afxClose();return;}
  m.classList.remove('closing');afxReset();m.style.display='block';
}
document.addEventListener('click',function(e){
  const menu=document.getElementById('afx-menu'),btn=document.getElementById('afx-btn');
  if(menu&&menu.style.display!=='none'&&!menu.contains(e.target)&&btn&&!btn.contains(e.target))afxClose();
});

// ── Saved filters (mentions) — bookmark button saves + lists filter views ──
const SF_KEY='mw-saved-filters';
let savedFilters=(function(){try{return JSON.parse(localStorage.getItem(SF_KEY)||'[]');}catch(e){return[];}})();
function sfPersist(){try{localStorage.setItem(SF_KEY,JSON.stringify(savedFilters));}catch(e){}}
function sfEsc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function sfCapture(){
  return {media:[...msSel],afx:{...afxState},search:(document.querySelector('.fc-search input')||{}).value||''};
}
function sfApplyState(s){
  msSel=new Set(s.media&&s.media.length?s.media:MS_OPTIONS.map(o=>o.label));
  const allOn=msSel.size===MS_OPTIONS.length;
  const vals=allOn?[]:[...new Set(MS_OPTIONS.filter(o=>msSel.has(o.label)).map(o=>o.val))];
  const st=alStateFor('spot');st.filters=vals;st.page=1;rerenderList('spot');
  const lbl=document.getElementById('ms-label');if(lbl)lbl.textContent=msLabel();
  if(s.afx){Object.assign(afxState,s.afx);afxBadge();}
  const si=document.querySelector('.fc-search input');if(si)si.value=s.search||'';
}
function sfBadge(){const b=document.getElementById('sf-badge');if(b){b.textContent=savedFilters.length;b.style.display=savedFilters.length?'inline-flex':'none';}}
function sfToast(msg){if(typeof showTrackerToast==='function')showTrackerToast(msg);}
let sfConfirm=-1;
// Build a readable summary of the filters a view captures (only the parts that differ from default)
function sfMediaSummary(media){
  const sel=new Set(media||[]);
  if(sel.size===0||sel.size===MS_OPTIONS.length)return null;
  const labels=MS_OPTIONS.filter(o=>sel.has(o.label)).map(o=>o.label);
  return labels.length<=2?labels.join(', '):labels.length+' sources';
}
function sfSummaryParts(s){
  const p=[],m=sfMediaSummary(s.media);if(m)p.push(m);
  const x=s.afx||{};
  if(x.emphasis&&x.emphasis!=='All')p.push('Emphasis: '+x.emphasis);
  if(x.tonality&&x.tonality!=='All')p.push(x.tonality);
  if(x.sentiment&&x.sentiment!=='All')p.push('Sentiment: '+x.sentiment);
  if((x.min!=null&&x.min!==0)||(x.max!=null&&x.max!==10))p.push('SV '+(x.min||0)+'–'+(x.max==null?10:x.max));
  if(s.search)p.push('“'+s.search+'”');
  return p;
}
function sfSummaryText(s){const p=sfSummaryParts(s);return p.length?p.join(' · '):('All '+_wPosts()+' (no filters)');}
function sfIsEmpty(s){return sfSummaryParts(s).length===0;}
function sfDefaultName(s){return sfSummaryParts(s).slice(0,2).join(' · ');}
function sfSameState(a,b){return JSON.stringify({m:[...(a.media||[])].sort(),x:a.afx,q:a.search})===JSON.stringify({m:[...(b.media||[])].sort(),x:b.afx,q:b.search});}
function sfRender(){
  const m=document.getElementById('sf-menu');if(!m)return;
  const cur=sfCapture(),curEmpty=sfIsEmpty(cur);
  const list=savedFilters.length?savedFilters.map((f,i)=>{
    if(i===sfConfirm)return `<div class="sf-item sf-confirm"><span class="sf-item-name">Remove “${sfEsc(f.name)}”?</span><button class="sf-cf-yes" onclick="event.stopPropagation();sfDelete(${i})">Remove</button><button class="sf-cf-no" onclick="event.stopPropagation();sfCancelDelete()">Cancel</button></div>`;
    const active=sfSameState(f.state,cur),sub=sfEsc(sfSummaryText(f.state));
    return `<div class="sf-item${active?' on':''}" onclick="sfApply(${i})">
      <i data-lucide="${active?'check':'bookmark'}"></i>
      <div class="sf-item-main"><span class="sf-item-name" title="${sfEsc(f.name)}">${sfEsc(f.name)}</span><span class="sf-item-sub" title="${sub}">${sub}</span></div>
      <span class="sf-item-del" onclick="event.stopPropagation();sfAskDelete(${i})" title="Delete"><i data-lucide="x"></i></span>
    </div>`;
  }).join(''):`<div class="sf-empty">No saved filters yet</div>`;
  m.innerHTML=`<div class="sf-title">Saved Filters</div>
    <div class="sf-list">${list}</div>
    <div class="sf-divider"></div>
    ${curEmpty?'<div class="sf-hint">No active filters to save</div>':''}
    <div class="sf-save-row">
      <input type="text" id="sf-name" placeholder="${curEmpty?'Set a filter first…':(sfEsc(sfDefaultName(cur))||'Name this view…')}"${curEmpty?' disabled':''} onkeydown="if(event.key==='Enter')sfSave()">
      <button class="sf-save-btn"${curEmpty?' disabled':''} onclick="sfSave()">Save</button>
    </div>`;
  initIcons();
}
function sfSave(){
  const cur=sfCapture();
  if(sfIsEmpty(cur))return;
  const dup=savedFilters.findIndex(f=>sfSameState(f.state,cur));
  if(dup>=0){sfToast('Already saved as “'+savedFilters[dup].name+'”');return;}
  const input=document.getElementById('sf-name');
  const name=((input&&input.value||'').trim())||sfDefaultName(cur)||('Filter '+(savedFilters.length+1));
  savedFilters.push({name,state:cur});
  sfPersist();sfBadge();sfConfirm=-1;sfRender();sfToast('View saved');
}
function sfApply(i){const f=savedFilters[i];if(!f)return;sfApplyState(f.state);sfToast('Applied “'+f.name+'”');sfClose();}
function sfAskDelete(i){sfConfirm=i;sfRender();}
function sfCancelDelete(){sfConfirm=-1;sfRender();}
function sfDelete(i){savedFilters.splice(i,1);sfConfirm=-1;sfPersist();sfBadge();sfRender();sfToast('View removed');}
function sfClose(){
  const m=document.getElementById('sf-menu');
  if(!m||m.style.display==='none'||m.classList.contains('closing'))return;
  m.classList.add('closing');setTimeout(()=>{m.style.display='none';m.classList.remove('closing');},180);
}
function sfToggle(e){
  e.stopPropagation();
  const m=document.getElementById('sf-menu');if(!m)return;
  const open=m.style.display!=='none'&&!m.classList.contains('closing');
  if(open){sfClose();return;}
  sfConfirm=-1;m.classList.remove('closing');sfRender();m.style.display='block';
}
document.addEventListener('click',function(e){
  const menu=document.getElementById('sf-menu'),btn=document.getElementById('sf-btn');
  if(menu&&menu.style.display!=='none'&&!menu.contains(e.target)&&btn&&!btn.contains(e.target))sfClose();
});
sfBadge();

function selectTrend(id){
  activeTrend=(activeTrend===id)?null:id;
  renderTrendRows();
}

function toggleWhy(el){el.classList.toggle('open');}

function extractKeywords(text){
  const stop=new Set(['and','the','for','was','are','with','from','that','this','have','been','were','their','they','also','into','over','its','has','had','but','not','all','can','her','his','about','will','one','said','more','which','when','than','what','then','some','him','would','your','our','out','how','did','get','may','new','any']);
  return[...new Set(text.replace(/[^a-zA-Z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>3&&!stop.has(w.toLowerCase())).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()))].slice(0,6);
}

// Tracked stories persist across pages (mentions → tracker) via localStorage
const TRK_KEY='mw-tracked';
function trkLoad(){try{return JSON.parse(localStorage.getItem(TRK_KEY)||'[]');}catch(e){return[];}}
function trkSave(arr){try{localStorage.setItem(TRK_KEY,JSON.stringify(arr));}catch(e){}}
function trkPersist(na){
  const arr=trkLoad();
  if(arr.some(e=>e.title===na.title))return;
  arr.unshift({title:na.title,type:na.type,date:na.date,content:na.content,matches:na.matches||[]});
  trkSave(arr);
}
function aveToVal(s){const n=parseFloat(String(s).replace(/[^0-9.]/g,''))||0;return /m/i.test(s)?Math.round(n*1e6):/k/i.test(s)?Math.round(n*1e3):Math.round(n);}
function addToTracker(title,type,content,matches){
  const today=new Date().toISOString().split('T')[0];
  const na={id:atNid++,title,type,date:today,content,matches:matches||[]};
  acts.unshift(na);
  trackerSel=na.id;
  freshTrack[na.id]=true;
  scanKwOff[na.id]=new Set();
  trkPersist(na);
  showTrackerToast(title,na.id);
  const nb=document.getElementById('nb-tracker');
  if(nb)nb.textContent=acts.length;
}

function showSimpleToast(msg,icon){
  let t=document.getElementById('simple-toast');
  if(t)t.remove();
  t=document.createElement('div');t.id='simple-toast';
  t.style.cssText='position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#181d26;color:#fff;font-size:12.5px;font-family:Inter,sans-serif;padding:11px 18px;border-radius:8px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.18);z-index:9999;max-width:420px;animation:toastLife 3.8s ease-out forwards';
  t.innerHTML=`<i data-lucide="${icon||'circle-check'}" style="color:#86efac;width:14px;height:14px"></i><span>${msg}</span><button onclick="this.closest('div').remove()" style="background:transparent;border:none;color:rgba(255,255,255,0.5);cursor:pointer;padding:0 4px;font-size:14px;line-height:1;margin-left:6px">×</button>`;
  document.body.appendChild(t);
  initIcons();
  t._t=setTimeout(()=>{if(t.parentNode)t.remove();},3800);
}

function showTrackerToast(title,id,toastType){
  if(toastType==='nl'){showSimpleToast('Newsletter sent successfully','send');return;}
  if(toastType==='rpt'){showSimpleToast('AI report sent successfully','send');return;}
  if(toastType==='dl'){showSimpleToast('Report downloaded as PDF','download');return;}
  let toast=document.getElementById('global-track-toast');
  if(!toast){
    toast=document.createElement('div');
    toast.id='global-track-toast';
    toast.style.cssText='position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#181d26;color:#fff;font-size:12.5px;font-family:Inter,sans-serif;padding:11px 18px;border-radius:8px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.18);z-index:9999;max-width:420px';
    document.body.appendChild(toast);
  }
  toast.innerHTML=`<i data-lucide="circle-check" style="color:#86efac;width:14px;height:14px"></i><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Added to Activity Tracker</span><button onclick="goPage('tracker')" style="font-size:11px;padding:3px 10px;background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:4px;cursor:pointer;font-family:inherit;flex-shrink:0">View</button><button onclick="ttDismiss(this.closest('#global-track-toast'))" style="background:transparent;border:none;color:rgba(255,255,255,0.5);cursor:pointer;padding:0 2px;font-size:14px;line-height:1">×</button>`;
  toast.style.display='flex';
  // Replay the fade-up entrance on every show (reflow reset)
  toast.style.animation='none';void toast.offsetWidth;
  toast.style.animation='ttUp 0.34s cubic-bezier(0.22,1,0.36,1) both';
  initIcons();
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>ttDismiss(toast),4000);
}
function ttDismiss(el){
  el=el||document.getElementById('global-track-toast');
  if(!el)return;
  clearTimeout(el._t);
  el.style.animation='ttDown 0.26s cubic-bezier(0.4,0,1,1) both';
  setTimeout(()=>{if(el.parentNode)el.remove();},250);
}

function trackSpot(){
  if(spotTracked)return;spotTracked=true;
  const btn=document.getElementById('spot-track-btn');
  btn.className='btn-track tracked';
  btn.innerHTML='<i data-lucide="check"></i> Tracked';
  initIcons();
  document.getElementById('spot-toast').classList.add('show');
  const story=trendStories[0];
  const matches=(story.articles||[]).map((a,i)=>({id:'sp'+i,media:a.media,source:a.source,title:a.hl,date:a.date,value:aveToVal(a.ave),score:a.score?a.score/100:0,manual:false}));
  addToTracker(story.hl,'Trending',story.why,matches);
}

function trackTrend(id){
  const s=trendStories.find(x=>x.id===id);if(!s||s.tracked)return;
  s.tracked=true;
  const btn=document.getElementById('td-track-'+id);
  if(btn){btn.className='btn-track tracked';btn.innerHTML='<i data-lucide="check"></i> Tracked';initIcons();}
  addToTracker(s.hl,'Trending',s.why);
}

let _nlStory=null,_rptStory=null;

function _storyForContext(){
  // find which trend story is open, fallback to spotlight (id 0)
  if(activeTrend!==null){const s=trendStories.find(x=>x.id===activeTrend);if(s)return s;}
  return trendStories[0];
}

function showNewsletter(story){
  _nlStory=story||_storyForContext();
  const s=_nlStory;
  document.getElementById('nl-subject').value=`MediaWatch Digest: ${s.hl}`;
  document.getElementById('nl-to').value='';
  // build preview
  const MC={'TV':'#c2410c','Online':'#6b4de8','Print':'#1d4ed8','Radio':'#b45309','Social':'#15803d'};
  const topArts=s.articles.slice(0,5);
  const restArts=s.articles.slice(5);
  const totalAVE=s.ave;
  const sentChip=s.chips[0];
  const sentColor=sentChip.cls==='c-pos'?'#15803d':sentChip.cls==='c-neg'?'#b91c1c':'#1b61c9';

  // media breakdown counts
  const mediaCounts={};
  s.articles.forEach(a=>{ mediaCounts[a.media]=(mediaCounts[a.media]||0)+1; });

  // scorecard rows — label ···· value newspaper style
  const topPub=topArts[0]?topArts[0].source:'—';
  const scoreRows=[
    ['Total Articles', s.articles.length],
    ['Combined AVE',   totalAVE],
    ['Top Publisher',  topPub],
    ['Sentiment',      `<span style="color:${sentColor};font-weight:600">${sentChip.t}</span>`],
    ['Coverage',       Object.entries(mediaCounts).map(([m,n])=>`<span style="color:${MC[m]||'#41454d'};font-weight:600">${m}</span> ${n}`).join(' &nbsp;·&nbsp; ')],
  ].map(([lbl,val])=>`
    <tr>
      <td style="padding:7px 0;border-bottom:1px solid #e4e6ea;font-size:12px;color:#6b7280;width:44%">${lbl}</td>
      <td style="padding:7px 0;border-bottom:1px solid #e4e6ea;font-size:12px;color:#181d26;font-weight:500;text-align:right">${val}</td>
    </tr>`).join('');

  // top 5 story cards — newspaper editorial style
  const storyCards=topArts.map((a,i)=>`
    <div style="padding:14px 0;border-bottom:1px solid #e4e6ea">
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:5px">
        <span style="font-size:11px;font-weight:700;color:#6b7280;flex-shrink:0;min-width:16px">${i+1}.</span>
        <div style="flex:1">
          <div style="font-size:13.5px;font-weight:600;color:#1b61c9;line-height:1.4;margin-bottom:4px;text-decoration:underline;text-decoration-color:rgba(27,97,201,0.3)">${a.hl}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:${i===0?'8px':'0'}">${a.source} &nbsp;·&nbsp; ${a.media} &nbsp;·&nbsp; ${a.date} &nbsp;·&nbsp; <span style="font-weight:600;color:#181d26">${a.ave}</span></div>
          ${i===0?`<div style="font-size:12.5px;color:#41454d;line-height:1.7">${s.why}</div>`:''}
        </div>
      </div>
    </div>`).join('');

  // key observations — derived from media counts + sentiment + tier
  const mediaList=Object.entries(mediaCounts).map(([m,n])=>`${n} ${m}`).join(', ');
  const observations=[
    `Story reached <strong>${s.articles.length} outlets</strong> within 24 hours, spanning ${mediaList} — indicating strong cross-channel resonance.`,
    `Overall sentiment is <strong style="color:${sentColor}">${sentChip.t}</strong>, with Tier 1 outlets including ${topArts.slice(0,2).map(a=>a.source).join(' and ')} leading coverage.`,
    `AVE of <strong>${totalAVE}</strong> signals significant earned media value. Top-performing ${_wPost()} from ${topPub} (${topArts[0]?topArts[0].ave:'—'}).`,
  ].map(o=>`<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px"><span style="color:#181d26;font-size:13px;flex-shrink:0;margin-top:1px">→</span><div style="font-size:12.5px;color:#41454d;line-height:1.6">${o}</div></div>`).join('');

  // secondary list
  const restList=restArts.length?restArts.map(a=>`
    <div style="padding:6px 0;border-bottom:1px solid #f0f1f3;display:flex;align-items:baseline;gap:8px">
      <span style="font-size:10.5px;font-weight:600;color:${MC[a.media]||'#41454d'};flex-shrink:0;min-width:36px">${a.media}</span>
      <span style="font-size:12px;color:#41454d;line-height:1.4;flex:1">${a.hl}</span>
      <span style="font-size:11px;color:#6b7280;white-space:nowrap;flex-shrink:0">${a.source}</span>
    </div>`).join(''):'';

  const dateStr=new Date().toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  document.getElementById('nl-preview').innerHTML=`
    <div style="background:#f5f4f0;padding:16px;font-family:'Inter',sans-serif">
      <div style="background:#fff;border:1px solid #e4e6ea;border-radius:8px;overflow:hidden">

        <!-- Top bar: brand + date -->
        <div style="background:#f5f4f0;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e4e6ea">
          <img src="mmi-logo-purple.svg" alt="MediaWatch" style="height:18px;width:auto;display:block">
          <div style="font-size:10.5px;color:#6b7280">${dateStr}</div>
        </div>

        <!-- Hero: headline + subhead + body -->
        <div style="padding:24px 24px 20px;border-bottom:2px solid #181d26">
          <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;margin-bottom:8px">Daily Digest &nbsp;·&nbsp; ${s.tier} Story</div>
          <div style="font-size:22px;font-weight:700;color:#181d26;line-height:1.25;font-family:'Inter Tight',sans-serif;margin-bottom:10px;letter-spacing:-0.3px">${s.hl}</div>
          <div style="font-size:12.5px;color:#6b7280;margin-bottom:12px">${sentChip.t} sentiment &nbsp;·&nbsp; ${s.articles.length} ${_wPosts()} &nbsp;·&nbsp; ${totalAVE} combined AVE</div>
          <div style="font-size:13px;color:#41454d;line-height:1.75">DITO Telecommunity's media presence surged this period, driven by executive commentary that cut across all major channels. The story gained rapid ${s.tier} traction within 24 hours, recorded across ${Object.keys(mediaCounts).join(', ')}. ${s.why}</div>
        </div>

        <!-- Dark CTA strip -->
        <div style="background:#181d26;padding:14px 24px;text-align:center;border-bottom:1px solid #e4e6ea">
          <span style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#fff">View Full Coverage &nbsp;→</span>
        </div>

        <!-- Stats scorecard -->
        <div style="padding:16px 24px;border-bottom:1px solid #e4e6ea;background:#f5f4f0">
          <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;margin-bottom:10px">This Period at a Glance</div>
          <table style="width:100%;border-collapse:collapse">${scoreRows}</table>
        </div>

        <!-- Stories section -->
        <div style="padding:20px 24px;border-bottom:1px solid #e4e6ea">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase">Stories Shaping the Week</div>
            <div style="flex:1;height:1px;background:#e4e6ea"></div>
          </div>
          ${storyCards}
        </div>

        <!-- Key observations -->
        <div style="padding:18px 24px;border-bottom:1px solid #e4e6ea;background:#f5f4f0">
          <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;margin-bottom:12px">Key Strategic Observations</div>
          ${observations}
        </div>

        <!-- Also worth monitoring -->
        ${restArts.length?`
        <div style="padding:16px 24px;border-bottom:1px solid #e4e6ea">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase">Worth Monitoring</div>
            <div style="flex:1;height:1px;background:#e4e6ea"></div>
          </div>
          ${restList}
        </div>`:''}

        <!-- Footer -->
        <div style="background:#181d26;padding:16px 24px;text-align:center">
          <div style="margin-bottom:8px;display:flex;justify-content:center"><img src="mmi-logo-purple.svg" alt="MediaWatch" style="height:18px;width:auto;display:block;filter:brightness(0) invert(1);opacity:0.7"></div>
          <div style="font-size:10.5px;color:rgba(255,255,255,0.45)">Sent to your team &nbsp;·&nbsp; DITO Telecommunity Communications &nbsp;·&nbsp; <span style="text-decoration:underline;cursor:pointer;color:rgba(255,255,255,0.45)">Unsubscribe</span></div>
        </div>

      </div>
    </div>`;
  const ov=document.getElementById('nl-overlay');
  ov.style.display='block';
  const sb=document.getElementById('sidebar');
  _nlSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
  if(sb)sb.classList.add('collapsed');
  requestAnimationFrame(()=>{ ov.classList.add('open'); document.body.classList.add('nl-open'); });
}

function closeNewsletter(){
  const ov=document.getElementById('nl-overlay');
  ov.classList.remove('open');
  document.body.classList.remove('nl-open');
  const sb=document.getElementById('sidebar');
  if(sb&&!_nlSidebarWasCollapsed)sb.classList.remove('collapsed');
  setTimeout(()=>{ov.style.display='none';},280);
}

function sendNewsletter(){
  const to=document.getElementById('nl-to').value.trim();
  if(!to){document.getElementById('nl-to').focus();document.getElementById('nl-to').style.borderColor='#d44';return;}
  document.getElementById('nl-to').style.borderColor='#ddd';
  closeNewsletter();
  showTrackerToast('Newsletter sent to '+to,null,'nl');
}

function showAIReport(story){
  _rptStory=story||_storyForContext();
  const s=_rptStory;
  document.getElementById('rpt-title').textContent='AI Report — '+s.hl.substring(0,55)+(s.hl.length>55?'…':'');
  document.getElementById('rpt-send-bar').style.display='none';
  document.getElementById('rpt-to').value='';
  const body=document.getElementById('rpt-body');
  body.innerHTML=`<div class="rpt-loading"><div class="rpt-spinner"></div><div style="font-size:13px;color:#888">Generating AI report…</div></div>`;
  const ov=document.getElementById('rpt-overlay');
  ov.style.display='block';
  const sb=document.getElementById('sidebar');
  _rptSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
  if(sb)sb.classList.add('collapsed');
  requestAnimationFrame(()=>{ov.classList.add('open');document.body.classList.add('rpt-open');});
  setTimeout(()=>{
    const sentChip=s.chips[0];
    const sentColor=sentChip.cls==='c-pos'?'#15803d':sentChip.cls==='c-neg'?'#991b1b':'#1d4ed8';
    const topSrc=[...new Set(s.articles.slice(0,4).map(a=>a.source))].join(', ');
    const channels=[...new Set(s.articles.map(a=>a.media))];
    const channelStr=channels.join(', ');
    const aveBreakdown=s.articles.slice(0,4).map(a=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e4e6ea;font-size:13px"><span style="color:#41454d">${a.source}</span><span style="font-weight:600;color:#181d26">${a.ave}</span></div>`).join('');
    const recItems=[
      s.chips[0].cls==='c-neg'?'Issue a formal response within 12 hours to neutralize negative framing.':'Amplify positive coverage through owned channels and social boost.',
      `Engage top ${s.articles[0].source} journalist for follow-up feature placement.`,
      `Monitor ${channels.includes('Social')?'social sentiment':'secondary outlet pickup'} over the next 48 hours for sentiment shifts.`,
      'Prepare spokesperson talking points aligned to current narrative thread.',
    ];
    body.innerHTML=`
      <div style="padding:22px 26px;display:flex;flex-direction:column;gap:20px">
        <div>
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#181d26;text-transform:uppercase;margin-bottom:6px">Executive Summary</div>
          <div style="font-size:13.5px;color:#41454d;line-height:1.7">${s.why} Coverage spans <strong>${channelStr}</strong> with <strong>${s.articles.length} ${_wPosts()}</strong> and total AVE of <strong>${s.ave}</strong>. The dominant sentiment is <strong style="color:${sentColor}">${sentChip.t.toLowerCase()}</strong>.</div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#181d26;text-transform:uppercase;margin-bottom:12px">Key Stories</div>
          ${s.articles.slice(0,4).map((a,i)=>`<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e4e6ea;align-items:flex-start"><div style="width:22px;height:22px;border-radius:50%;background:#181d26;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i+1}</div><div style="flex:1"><div style="font-size:14px;font-weight:600;color:#181d26;line-height:1.4">${a.hl}</div><div style="font-size:12.5px;color:#6b7280;margin-top:3px">${a.source} · ${a.date} · ${a.ave}</div></div></div>`).join('')}
          ${s.articles.length>4?`<div style="font-size:12px;color:#6b7280;padding:8px 0">+${s.articles.length-4} additional ${_wPosts()} not shown</div>`:''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="background:#f7f8fa;border-radius:8px;padding:14px;border:1px solid #e4e6ea">
            <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#181d26;text-transform:uppercase;margin-bottom:10px">Channel Breakdown</div>
            ${channels.map(ch=>{const cnt=s.articles.filter(a=>a.media===ch).length;const pct=Math.round(cnt/s.articles.length*100);return`<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12.5px;color:#41454d;margin-bottom:3px"><span>${ch}</span><span>${cnt} ${_wPosts()}</span></div><div style="background:#e4e6ea;border-radius:3px;height:4px"><div style="background:#181d26;height:4px;border-radius:3px;width:${pct}%"></div></div></div>`;}).join('')}
          </div>
          <div style="background:#f7f8fa;border-radius:8px;padding:14px;border:1px solid #e4e6ea">
            <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#181d26;text-transform:uppercase;margin-bottom:10px">AVE Breakdown</div>
            ${aveBreakdown}
            <div style="display:flex;justify-content:space-between;padding:8px 0 0;font-size:13.5px;font-weight:700"><span style="color:#41454d">Total</span><span style="color:#181d26">${s.ave}</span></div>
          </div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#181d26;text-transform:uppercase;margin-bottom:12px">Recommendations</div>
          ${recItems.map((r,i)=>`<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #e4e6ea;font-size:13.5px;color:#41454d;line-height:1.5"><i data-lucide="circle-check" style="color:#16a34a;margin-top:2px;flex-shrink:0"></i>${r}</div>`).join('')}
        </div>
        <div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:6px;padding:12px 14px;font-size:12px;color:#92400e"><i data-lucide="alert-triangle" style="margin-right:6px"></i>Generated by AI — verify figures against source ${_wPosts()} before distribution.</div>
      </div>`;
    document.getElementById('rpt-send-bar').style.display='flex';
  },1600);
}

let _rptSidebarWasCollapsed=false;
function closeAIReport(){
  const ov=document.getElementById('rpt-overlay');
  ov.classList.remove('open');
  document.body.classList.remove('rpt-open');
  const sb=document.getElementById('sidebar');
  if(sb&&!_rptSidebarWasCollapsed)sb.classList.remove('collapsed');
  setTimeout(()=>{ov.style.display='none';},280);
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&document.getElementById('rpt-overlay')?.classList.contains('open'))closeAIReport();
});

// ── Export modal ──
function openExport(){
  const ov=document.getElementById('exp-overlay');
  ov.style.display='flex';
  requestAnimationFrame(()=>ov.classList.add('open'));
  validateExport();
  initIcons();
}
// ── Compare Topics modal (dashboard) ──
const COMPARE_CATS=[
  {group:'Company News - DITO Telecommunity',topics:['Brand Identity','Awards & Recognition','CSR & Public Affairs','Product & Plans','Connectivity & Network','Products & Plans','Corporate & Investors','Tech & Innovation','Regulatory & Policy']},
  {group:'Competitor News - Globe Telecom',topics:['Brand and Identity','Awards and Recognition','CSR and Public Affairs','Connectivity and Network','Products and Plans','Corporate and Investors','Tech and Innovation','Regulatory and Policy']},
  {group:'Competitor News - PLDT / Smart Communications',topics:['(Brand & Identity)','(Awards & Recognition)','(CSR & Public Affairs)','(Connectivity & Network)','(Products & Plans)','(Corporate & Investors)','(Tech & Innovation)','(Regulatory & Policy)','(Connectivity & Speed)','(Mobile & Plans)','(Industry & Market)','(Awards & Benchmarks)','(CSR & Social Impact)']},
  {group:'Competitor News - Converge ICT',topics:['Brand & Identity','Awards & Recognition','CSR & Public Affairs','Connectivity & Network','Products & Plans','Corporate & Investors','Tech & Innovation','Regulatory & Policy']}
];
function renderCompareModal(){
  const body=document.getElementById('cmp-body');if(!body)return;
  body.innerHTML=COMPARE_CATS.map((c,gi)=>
    `<label class="cmp-group"><input type="checkbox" class="cmp-cb cmp-parent" data-g="${gi}" onchange="cmpParentToggle(${gi})"><span>${c.group}</span></label>`+
    c.topics.map(t=>`<label class="cmp-topic"><input type="checkbox" class="cmp-cb cmp-child" data-g="${gi}" onchange="cmpUpdate()"><span>${t}</span></label>`).join('')
  ).join('');
}
function openCompareModal(){
  const ov=document.getElementById('cmp-overlay');if(!ov)return;
  renderCompareModal();
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
  cmpUpdate();initIcons();
}
function closeCompareModal(){const ov=document.getElementById('cmp-overlay');if(ov){ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},180);}}
function cmpParentToggle(gi){
  const parent=document.querySelector('.cmp-parent[data-g="'+gi+'"]');
  document.querySelectorAll('.cmp-child[data-g="'+gi+'"]').forEach(ch=>{ch.checked=parent.checked;ch.disabled=parent.checked;});
  cmpUpdate();
}
function cmpUpdate(){
  // A "selection" = a whole checked group (parent) OR each standalone checked topic (parent unchecked). Compare needs ≥2.
  let count=0;
  COMPARE_CATS.forEach((c,gi)=>{
    const parent=document.querySelector('.cmp-parent[data-g="'+gi+'"]');
    if(parent&&parent.checked)count++;
    else count+=document.querySelectorAll('.cmp-child[data-g="'+gi+'"]:checked').length;
  });
  const btn=document.getElementById('cmp-compare');
  if(btn)btn.disabled=count<2;
}
function doCompare(){
  const sel=[];
  COMPARE_CATS.forEach((c,gi)=>{
    const parent=document.querySelector('.cmp-parent[data-g="'+gi+'"]');
    const anyChild=document.querySelectorAll('.cmp-child[data-g="'+gi+'"]:checked').length>0;
    if((parent&&parent.checked)||anyChild)sel.push(c.group);
  });
  closeCompareModal();
  if(window.openCompareView)window.openCompareView(sel);
}
function closeExport(){
  const ov=document.getElementById('exp-overlay');
  ov.classList.remove('open');
  setTimeout(()=>{ov.style.display='none';},250);
}
function validateExport(){
  const to=document.getElementById('exp-to').value.trim();
  const ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
  document.getElementById('exp-send').disabled=!ok;
}
function sendExport(){
  const to=document.getElementById('exp-to').value.trim();
  const type=document.getElementById('exp-type').value;
  const fmt=document.getElementById('exp-format').value;
  closeExport();
  showSimpleToast(`${type} (${fmt}) sent to <strong style="font-weight:600">${to}</strong>`,'send');
}

// ── Mention detail drawer ──
let mentionData=[
  {outlet:'Inquirer',sub:'Philippine Daily Inquirer',author:'Daxim L. Lucas',date:'May 25, 2026',ago:'14h ago',section:'Business',ave:'PHP 397.9K',title:"BIZ BUZZ: Jimenez twits PLDT's foes",sv:4.33,chart:[4,18,7,9,5,12,2,1,3],brand:'positive',tone:'positive',authorScore:'3.21',avgSv:'4.33',keywords:[['dito tel',1],['pldt',2],['jimenez',1]],entities:['PLDT','DITO Telecommunity','Eric Alberto','Smart Communications','Globe Telecom','Converge ICT','Manny V. Pangilinan','Dennis Uy','NTC','5G']},
  {type:'tv',outlet:'ANC',sub:'ANC 24/7',author:'Michelle Ong, Stanley A. Palisada',date:'June 16, 2026',ago:'9h ago',section:'News',ave:'PHP 62.6K',title:'Globe forms intelligence and trust office for stronger AI, cybersecurity capabilities',sv:5.65,chart:[3,7,10,8,11,6,4,2,1],brand:'positive',tone:'positive',authorScore:'2.10',avgSv:'5.65',keywords:[['globe telecom',1]],entities:['Globe Telecom','Globe','Anton Reynaldo Bonifacio'],program:'Market Edge',segment:'News',length:'00:00:34',aired:'June 16, 2026 05:33 AM',poster:'image/imgi_227_maxresdefault.jpg',transcript:'Good morning and welcome back to Market Edge here on ANC. Topping our Weekend Corporate Stories this hour is Globe Telecom, which has just announced a major reorganization of its technology and governance teams.\nThe telco giant is consolidating its key transformation and trust-enabling groups into a single unit it is calling the Intelligence and Trust Office. Globe says the new office will help strengthen its enterprise-wide artificial intelligence, data, and cybersecurity functions, as well as its broader digital trust capabilities.\nIn a statement, the company said the move is designed to sustain its long-term sustainability goals while sharpening its focus on customer protection and responsible innovation. Globe Chief Information Security Officer Anton Reynaldo Bonifacio will lead the new office, reporting directly to the office of the chief executive.\nAccording to the company, the new structure brings together teams that were previously spread across several departments, including data governance, network security, fraud prevention, and privacy compliance. Globe believes that uniting them will allow faster and more coordinated responses to emerging threats.\nExecutives say the timing is deliberate. With more transactions, more services, and more customer touchpoints moving online, the company argues that trust has become as important to its business as network coverage and pricing.\nAnalysts we spoke with say the restructuring reflects a wider industry trend, as telecommunications firms face mounting pressure to secure customer data and to deploy AI responsibly. They add that consolidating these functions under one leader should speed up decision-making and reduce duplication across the organization.\nOne technology analyst told this program that the creation of a dedicated trust office is a signal to enterprise clients in particular. Large corporate customers, the analyst said, increasingly want assurances about how their data is handled before signing long-term contracts.\nAnother market watcher noted that the move could help Globe stand out in a crowded field. As competitors race to expand coverage, positioning the brand around security and responsible AI may appeal to government agencies, banks, and other regulated industries.\nThe announcement also comes as the wider sector invests heavily in artificial intelligence. Globe has said it intends to use AI across customer service, fraud detection, and network optimization, and the new office is expected to set the guardrails for how those tools are built and deployed.\nOn the question of jobs, the company said the reorganization is not a cost-cutting exercise. Globe described it as a realignment of existing talent, with most affected staff moving into the new office rather than leaving the company.\nTurning now to the market reaction. Globe shares were little changed in early trading following the announcement, with investors largely viewing the reorganization as a long-term governance play rather than a near-term earnings driver.\nTraders we monitored said the muted move was expected, given that the restructuring does not change the near-term revenue outlook. Even so, several flagged it as a positive for the longer-term investment case.\nCompetitors are watching closely. Industry sources suggest rival carriers may announce similar initiatives in the coming months, as the pressure to demonstrate strong data governance grows across the sector.\nThere is also a regulatory dimension. With data privacy rules tightening and authorities paying closer attention to how companies handle personal information, a dedicated trust office could help Globe stay ahead of compliance requirements.\nConsumer advocates offered cautious support. They welcomed the focus on customer protection, but said the real test will be whether the new office translates into clearer policies, faster breach responses, and better support for ordinary subscribers.\nFor its part, Globe says it will share more details about the office and its roadmap in the coming weeks, including how it plans to measure progress on data protection and responsible AI.\nWe will have more on this story, including reaction from industry groups and regulators, later in the program. We will also speak with a panel of analysts about what the reorganization means for the broader telecommunications race.\nBut for now, that is the latest from the corporate desk. After the break, we turn to the markets, the peso, and the trading week ahead. Stay with us here on Market Edge. Back to you.'},
  {type:'tv',outlet:'CNN PH',sub:'CNN Philippines',author:'Rico Hizon',date:'May 25, 2026',ago:'16h ago',section:'News',ave:'PHP 710.0K',title:'Telco war escalates: Jimenez vs. Reyes feud explained',sv:4.82,chart:[5,9,12,7,10,6,3,2,1],brand:'neutral',tone:'mixed',authorScore:'3.40',avgSv:'4.82',keywords:[['pldt',2],['dito',1],['jimenez',1]],entities:['PLDT','DITO Telecommunity','Eric Alberto'],program:'The Final Word',segment:'News',length:'00:02:15',aired:'May 25, 2026 09:00 PM',poster:'image/imgi_304_hqdefault.jpg',transcript:'Good evening, I am Rico Hizon, and this is The Final Word. Our top story tonight: the rivalry between two of the biggest telecommunications companies in the country has spilled out into the open, and we break down what it means for ordinary consumers.\nIt started earlier this week when DITO Telecommunity chief Eric Alberto made a series of pointed remarks aimed squarely at incumbent PLDT. Within hours, the comments were picked up across business outlets, broadcast, and radio, fueling a very public exchange between the two camps.\nTo help us make sense of it all, we are joined by a panel of industry analysts. They argue that the feud, while dramatic, is ultimately a sign of intensifying competition, the kind that could benefit subscribers through lower prices and faster network expansion.\nOur panel also points to the race to roll out 5G coverage across the Visayas and Mindanao as the real battleground. Whoever earns the trust of regional markets, they say, will likely define the next phase of the telecommunications war.\nWe also asked whether regulators should step in. The consensus was that the agencies should keep a close watch, but allow market forces to play out, so long as service quality and consumer protection are not compromised.\nWe will be right back with reaction from consumer groups and a closer look at the latest subscriber numbers, right after the break. Stay with us here on The Final Word.'},
  {type:'radio',outlet:'DZRH',sub:'DZRH News',author:'Mon Jocson',date:'May 25, 2026',ago:'21h ago',section:'News',ave:'PHP 75.0K',title:'Telco rivalry: Jimenez sa PLDT, sumagot',sv:2.64,chart:[2,5,8,6,9,4,3,2,1],brand:'neutral',tone:'mixed',authorScore:'1.80',avgSv:'2.64',keywords:[['pldt',1],['dito',1],['jimenez',1]],entities:['PLDT','DITO Telecommunity','Eric Alberto'],program:'Damdaming Bayan',segment:'News',length:'00:03:42',aired:'May 25, 2026 06:15 AM',transcript:'Magandang umaga, and welcome to DZRH News. We begin this hour with the escalating rivalry between the two biggest telecommunications players in the country, after DITO Telecommunity chief Eric Alberto fired fresh remarks at incumbent PLDT.\nAyon sa aming mga ulat, the comments were picked up quickly across radio, online, and broadcast outlets, and have reignited debate about competition and pricing in the telecommunications sector.\nAnalysts we reached by phone say the public exchange, while heated, is a sign of a maturing market. They argue that stronger competition should, over time, mean better service and lower costs for ordinary subscribers.\nPLDT, for its part, has yet to issue a formal response. We will bring you their statement as soon as it is released.\nFor now, consumer groups are urging both companies to focus less on the war of words and more on improving coverage in the provinces. The National Telecommunications Commission has not announced any new action on the matter.\nWe will have a full update at the top of the next hour. Ito ang DZRH, ang inyong bagong himpapawid. Stay tuned.'},
  {type:'broadsheet',outlet:'BusinessWorld',sub:'BusinessWorld',author:'Ashley Erika O. Jose',date:'Jun 16, 2026',ago:'1d ago',section:'Economy / Corporate News',ave:'PHP 462.2K',title:'Globe creates intelligence office as AI push accelerates',sv:3.92,chart:[4,9,12,8,11,6,3,2,1],brand:'positive',tone:'positive',authorScore:'2.74',avgSv:'3.92',keywords:[['globe',2],['ai',1]],entities:['Globe Telecom','Globe'],page:'S1/B1',pdfUrl:'PDF/cl15.pdf',fullImage:'image/2.png'},
  {type:'provincial',outlet:'SunStar Cebu',sub:'SunStar Cebu',author:'John Rey Saavedra',date:'Jun 15, 2026',ago:'2d ago',section:'Local Business',ave:'PHP 88.2K',title:'DITO expands Visayas footprint with new Cebu data hub',sv:2.41,chart:[3,6,9,7,10,5,3,2,1],brand:'positive',tone:'positive',authorScore:'1.90',avgSv:'2.41',keywords:[['dito',2],['cebu',1]],entities:['DITO Telecommunity','Cebu'],page:'A3',pdfUrl:'PDF/cl15.pdf',fullImage:'image/2.png'},
  {type:'tabloid',outlet:'Bulgar',sub:'Bulgar',author:'Staff Writer',date:'Jun 14, 2026',ago:'3d ago',section:'Negosyo',ave:'PHP 41.5K',title:'Telco giants nagbangayan: presyo ng data, bababa raw',sv:1.62,chart:[2,5,7,4,8,3,2,1,1],brand:'neutral',tone:'mixed',authorScore:'1.20',avgSv:'1.62',keywords:[['telco',1],['data',1]],entities:['PLDT','DITO Telecommunity'],page:'7',pdfUrl:'PDF/cl15.pdf',fullImage:'image/2.png'},
  {type:'magazine',outlet:'Esquire PH',sub:'Esquire Philippines',author:'Patricia Reyes',date:'Jun 10, 2026',ago:'7d ago',section:'Business Features',ave:'PHP 156.0K',title:'The trust race: how Philippine telcos are reinventing themselves',sv:3.18,chart:[4,7,11,9,12,8,5,3,2],brand:'positive',tone:'positive',authorScore:'2.60',avgSv:'3.18',keywords:[['telco',2],['trust',1]],entities:['Globe Telecom','PLDT','DITO Telecommunity'],page:'F1',pdfUrl:'PDF/cl15.pdf',fullImage:'image/2.png'},
  {outlet:'Inquirer Plus',sub:'INQUIRER PLUS',author:'Daxim L. Lucas',date:'May 25, 2026',ago:'14h ago',section:'News',ave:'PHP 206.5K',title:'BIZ BUZZ: Jimenez twits PLDTs foes Inquirer Plus',sv:1.8,chart:[3,6,9,12,7,4,2,1,1],brand:'neutral',tone:'mixed',authorScore:'1.40',avgSv:'1.80',keywords:[['dito tel',1],['pldt',1]],entities:[]},
  {outlet:'Philstar',sub:'Philstar Online',author:'Elijah Tubayan',date:'May 25, 2026',ago:'15h ago',section:'News',ave:'PHP 631.0K',title:"PLDTs 'butcher COO publicly slices telco rivals",sv:4.14,chart:[5,8,11,9,14,7,3,2,1],brand:'negative',tone:'negative',authorScore:'2.88',avgSv:'4.14',keywords:[['pldt',3],['telco',2],['dito',1]],entities:['PLDT','Smart Communications']},
  {type:'blog',outlet:'Manila Shaker',sub:'Manila Shaker Philippines',author:'Ramon Castillo',date:'May 24, 2026',ago:'23h ago',section:'News',ave:'PHP 91.8K',title:'DITO StreamZone199 Now Available',sv:1.14,chart:[2,4,6,3,8,5,2,1,1],brand:'positive',tone:'positive',authorScore:'0.92',avgSv:'1.14',keywords:[['dito',2],['streamzone',1]],entities:['DITO Telecommunity']},
  {outlet:'Yahoo PH',sub:'Yahoo Philippines',author:'Staff Writer',date:'May 24, 2026',ago:'1d ago',section:'News',ave:'PHP 98.4K',title:'Iridium, Planet Labs, and Ziff Davis Shares Skyrocket, What You Need T...',sv:5.23,chart:[6,9,14,11,8,12,5,3,2],brand:'positive',tone:'positive',authorScore:'4.10',avgSv:'5.23',keywords:[['iridium',2],['planet labs',1],['ziff davis',1]],entities:['Iridium','Planet Labs','Ziff Davis']},
  {outlet:'Inquirer',sub:'Inquirer Online',author:'Lawrence Agcaoili',date:'May 23, 2026',ago:'1d ago',section:'News',ave:'PHP 190.5K',title:'DITO reigns supreme as the Philippines fastest mobile network by Opens...',sv:5.22,chart:[5,10,16,12,9,7,4,2,1],brand:'positive',tone:'positive',authorScore:'4.05',avgSv:'5.22',keywords:[['dito',3],['opensignal',1],['5g',2]],entities:['DITO Telecommunity','Opensignal']},
  {outlet:'Insider Ph',sub:'Insider Ph',author:'Maria Santos',date:'May 23, 2026',ago:'2d ago',section:'News',ave:'PHP 184.7K',title:'Visayan Electric eyes smarter energy services with DITO',sv:1.33,chart:[2,5,7,4,6,3,2,1,1],brand:'neutral',tone:'mixed',authorScore:'1.10',avgSv:'1.33',keywords:[['dito',1],['visayan electric',1]],entities:['DITO Telecommunity','Visayan Electric']},
  {outlet:'Manila Bulletin',sub:'Manila Bulletin',author:'Bernie Cahiles-Magkilat',date:'May 22, 2026',ago:'3d ago',section:'Technology',ave:'PHP 142.3K',title:'DITO partners with local government for digital transformation push',sv:2.87,chart:[3,7,10,8,11,6,4,2,1],brand:'positive',tone:'positive',authorScore:'2.30',avgSv:'2.87',keywords:[['dito',2],['digital',1],['government',1]],entities:['DITO Telecommunity']},
  {outlet:'BusinessWorld',sub:'Business World Online',author:'Ashley Erika O. Jose',date:'May 22, 2026',ago:'3d ago',section:'Business',ave:'PHP 256.1K',title:'Telco war heats up as DITO expands 5G coverage to Visayas',sv:3.41,chart:[4,18,7,9,5,12,2,1,3],brand:'neutral',tone:'positive',authorScore:'0.00',avgSv:'0.00',keywords:[['dito tel',1],['dito telecommunity',1]],entities:[]},
  {outlet:'SunStar Cebu',sub:'SunStar Cebu',author:'John Rey Saavedra',date:'May 21, 2026',ago:'4d ago',section:'Local News',ave:'PHP 78.9K',title:'DITO Telecommunity opens new flagship store in Cebu City',sv:2.05,chart:[3,6,8,5,9,4,2,1,1],brand:'positive',tone:'positive',authorScore:'1.65',avgSv:'2.05',keywords:[['dito',2],['cebu',1],['store',1]],entities:['DITO Telecommunity','Cebu City']}
];
// Additional mock mentions so the card grid fills 12 per page and pagination spans multiple pages
(function(){
  const src=[
    ['Rappler','Rappler','News','positive','positive','DITO boosts rural connectivity across Mindanao'],
    ['GMA News','GMA News Online','News','neutral','mixed','Globe answers DITO 5G expansion with new cell sites'],
    ['ABS-CBN','ABS-CBN News','News','negative','negative','PLDT shares dip amid intensifying telco rivalry'],
    ['The Manila Times','The Manila Times','Business','positive','positive','Smart rolls out upgraded unlimited data plans'],
    ['Business Mirror','Business Mirror','Business','neutral','positive','DITO crosses 10M subscriber milestone'],
    ['Tech in Asia','Tech in Asia','Technology','positive','positive','DITO Sky home internet enters beta testing'],
    ['Manila Standard','Manila Standard','News','neutral','mixed','Consumer group ranks PH mobile networks for 2026'],
    ['Daily Tribune','Daily Tribune','Business','negative','negative','Regulator reviews spectrum allocation for telcos'],
    ['Interaksyon','Interaksyon','News','positive','positive','DITO partners with LGUs for free public WiFi'],
    ['Unbox PH','Unbox Ph','Technology','positive','positive','DITO wins 2026 customer satisfaction award','blog'],
    ['YugaTech','YugaTech','Technology','neutral','positive','Mobile data prices fall as competition heats up','blog'],
    ['BizNews Asia','BizNews Asia','Business','positive','positive','DITO eyes IPO as it nears profitability'],
    ['Adobo Magazine','Adobo Magazine','Business','neutral','mixed','Telco infrastructure sharing deal signed'],
    ['PhilNews','PhilNews PH','News','positive','positive','DITO expands fiber footprint in Luzon']
  ];
  const charts=[[3,7,10,8,11,6,4,2,1],[2,5,9,12,7,4,3,1,1],[5,8,11,9,14,7,3,2,1],[4,6,8,5,9,4,2,1,1]];
  src.forEach((m,k)=>{
    const sv=+(((k*0.41+1.3)%4.5)+0.6).toFixed(2);
    mentionData.push({type:m[6],outlet:m[0],sub:m[1],author:'Staff Writer',date:'May 20, 2026',ago:(k+5)+'d ago',section:m[2],ave:'PHP '+(60+k*21)+'K',title:m[5],sv:sv,chart:charts[k%charts.length],brand:m[3],tone:m[4],authorScore:(1+(k%4)).toFixed(2),avgSv:sv.toFixed(2),keywords:[['dito',1],['telco',1]],entities:['DITO Telecommunity']});
  });
})();
mentionData=wsData('mentionData',mentionData);

let mdActive=-1;
let mdMode='split';            // default view: 'split' (docked) | 'modal' (overlay) | 'reader' (3-pane)
let mdSidebarWasCollapsed=false;
let _nlSidebarWasCollapsed=false;
let mdPage=0;                  // article-list pagination
const MD_PER_PAGE=10;
let tblPage=0;                 // table pagination (list + detail mode)
const TBL_PER_PAGE=10;          // full list view
const TBL_DETAIL_PER_PAGE=15;   // detail / split view
function tblPerPage(){const p=document.getElementById('page-mentions');return p&&p.classList.contains('detail-open')?TBL_DETAIL_PER_PAGE:TBL_PER_PAGE;}
function mdTotalPages(){return Math.max(1,Math.ceil(mentionData.length/MD_PER_PAGE));}
function gotoMdPage(p){
  mdPage=Math.max(0,Math.min(p,mdTotalPages()-1));
  const host=mdMode==='reader'?document.getElementById('mr-list'):document.getElementById('mention-list');
  if(host){host.innerHTML=renderMentionList();initIcons();}
}
function highlightMentionRow(idx){
  document.querySelectorAll('.tbl tbody tr').forEach(tr=>tr.classList.toggle('row-selected',parseInt(tr.dataset.idx)===idx));
}
// Shared View supplies social posts; MediaWatch uses news mentions
function mentTableData(){return (window.WS_DATA&&window.WS_DATA.socialMentions)||mentionData;}
function tblTotalPages(){return Math.max(1,Math.ceil(mentTableData().length/tblPerPage()));}
function renderTableRow(d,globalIdx){
  const sentClass={positive:'pos',negative:'neg',neutral:'neu'}[d.brand]||'none';
  const sentLabel={positive:'Positive',negative:'Negative',neutral:'Neutral'}[d.brand]||'Not set';
  return `<tr data-idx="${globalIdx}">
    <td><span class="tcb"></span></td>
    <td><span class="sv-val">${d.sv}</span></td>
    <td><span class="ave-val">${d.ave}</span></td>
    <td><div class="hl-cell"><span class="hl-icon type-${articleType(d)}" data-btip="${_makeTip({label:typeLabel(d)})}" ><i data-lucide="${typeIcon(d)}"></i></span><span class="hl-text">${d.title}</span></div></td>
    <td><div class="pub-name">${d.sub}</div><div class="pub-cat">${d.section}</div></td>
    <td class="tbl-sent-cell">${sentimentCellHtml(d.brand)}</td>
    <td><div class="date-main">${d.date}</div><div class="date-ago">${d.ago}</div></td>
    <td><span class="row-dots">⋯</span></td>
  </tr>`;
}
// Social platform registry — add a platform by adding one entry (Font Awesome brand + brand color)
const SOCIAL_PLATFORMS={
  facebook:{icon:'fa-facebook',color:'#1877f2',label:'Facebook'},
  twitter:{icon:'fa-x-twitter',color:'#000000',label:'X (Twitter)'},
  instagram:{icon:'fa-instagram',color:'#e4405f',label:'Instagram'},
  youtube:{icon:'fa-youtube',color:'#ff0000',label:'YouTube'},
  reddit:{icon:'fa-reddit',color:'#ff4500',label:'Reddit'},
  tiktok:{icon:'fa-tiktok',color:'#111111',label:'TikTok'}
};
// Post-type registry — add a type by adding one entry (lucide icon + design-system tint class)
const SOCIAL_TYPES={
  Text:{icon:'align-left',cls:'type-online'},
  Photo:{icon:'image',cls:'type-blog'},
  Video:{icon:'video',cls:'type-tv'}
};
let mdSocialActive=-1;
function renderSocialRow(d,gIdx){
  const p=SOCIAL_PLATFORMS[d.platform]||{icon:'fa-globe',color:'#6b7280',label:d.platform||'—'};
  const t=SOCIAL_TYPES[d.type]||{icon:'message-square',cls:'type-online'};
  return `<tr class="${gIdx===mdSocialActive?'row-selected':''}" data-idx="${gIdx}">
    <td><span class="tcb"></span></td>
    <td><span class="sv-val">${d.reach}</span></td>
    <td><span class="eng-score">${d.engScore}</span></td>
    <td><div class="hl-cell"><span class="hl-text soc-post" data-btip="${_makeTip({detail:d.post||''})}">${d.post||''}</span></div></td>
    <td><span class="soc-src" title="${p.label}">${socIcon(p)}</span></td>
    <td class="tbl-sent-cell">${sentimentCellHtml(d.sentiment)}</td>
    <td><span class="soc-influencer">${d.influencer||''}</span></td>
    <td><div class="date-main">${d.date||''}</div><div class="date-ago">${d.ago||''}</div></td>
    <td><span class="row-dots">⋯</span></td>
  </tr>`;
}
function renderTableRows(){
  const isDetail=document.getElementById('page-mentions').classList.contains('detail-open');
  const data=mentTableData(),social=data!==mentionData;
  const total=data.length,pages=tblTotalPages();
  tblPage=Math.max(0,Math.min(tblPage,pages-1));
  const pp=tblPerPage();                                     // 10 in list view, 15 in detail
  const start=tblPage*pp;
  const end=Math.min(start+pp,total);
  const tbody=document.getElementById('tbl-tbody');
  if(!tbody)return;
  tbody.innerHTML=data.slice(start,end).map((d,k)=>social?renderSocialRow(d,start+k):renderTableRow(d,start+k)).join('');
  const footer=document.querySelector('.tbl-footer');
  if(footer)footer.style.display=(isDetail||mentionsView==='cards')?'none':'flex';
  if(isDetail){
    const infoEl=document.getElementById('tbl-pg-info');
    if(infoEl)infoEl.textContent=`${start+1}–${end} of ${total}`;
    const btnsEl=document.getElementById('tbl-detail-pg-btns');
    if(btnsEl){
      let h=`<button class="pgb arrow" onclick="goTblPage(tblPage-1)"${tblPage<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
      for(let p=0;p<pages;p++)h+=`<button class="pgb${p===tblPage?' on':''}" onclick="goTblPage(${p})">${p+1}</button>`;
      h+=`<button class="pgb arrow" onclick="goTblPage(tblPage+1)"${tblPage>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
      btnsEl.innerHTML=h;
    }
  }else{
    const infoEl=document.getElementById('tbl-list-pg-info');
    const btnsEl=document.getElementById('tbl-list-pg-btns');
    if(infoEl)infoEl.textContent=`${start+1}–${end} of ${total} results`;
    if(btnsEl){
      let h=`<button class="pgb arrow" onclick="goTblPage(tblPage-1)"${tblPage<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
      for(let p=0;p<pages;p++){h+=`<button class="pgb${p===tblPage?' on':''}" onclick="goTblPage(${p})">${p+1}</button>`;}
      h+=`<button class="pgb arrow" onclick="goTblPage(tblPage+1)"${tblPage>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
      btnsEl.innerHTML=h;
    }
  }
  if(mdActive>=0)highlightMentionRow(mdActive);
  // Detail view (non-social): swap the condensed table for the reusable ti-arttbl rail
  const pm=document.getElementById('page-mentions');
  if(pm){
    if(isDetail&&social&&window.renderSocialDetailRail){pm.classList.add('ment-rail');window.renderSocialDetailRail();}
    else if(isDetail&&!social&&window.renderMentDetailRail){pm.classList.add('ment-rail');window.renderMentDetailRail();}
    else pm.classList.remove('ment-rail');
  }
  initIcons();
}
function goTblPage(n){
  tblPage=Math.max(0,Math.min(n,tblTotalPages()-1));
  renderTableRows();
  const sc=document.querySelector('.tbl-scroll');if(sc)sc.scrollTop=0;
}
let mdListScrollTop=0; // persists list scroll position across reader entry/exit
function setMdMode(mode){
  if(mode===mdMode)return;
  // Save list scroll position before entering reader
  if(mode==='reader'){
    const list=document.getElementById('mention-list');
    if(list)mdListScrollTop=list.scrollTop;
  }
  // Fade out current reader before switching away from it
  if(mdMode==='reader'&&mode==='split'){
    const reader=document.getElementById('mention-reader');
    if(reader){
      reader.classList.add('is-exiting');
      setTimeout(()=>_applyMdMode(mode),200);
      return;
    }
  }
  _applyMdMode(mode);
}
function _applyMdMode(mode){
  mdMode=mode;
  const ov=document.getElementById('mention-overlay');
  const sb=document.querySelector('.sidebar');
  const main=document.querySelector('.main');
  if(mode==='reader'){
    // Open full-screen reader overlay
    ov.classList.add('reader');ov.classList.remove('split');
    if(main){main.classList.add('md-reader-on');main.classList.remove('md-split');}
    if(sb){mdSidebarWasCollapsed=sb.classList.contains('collapsed');sb.classList.add('collapsed');}
    ov.style.display='flex';
    requestAnimationFrame(()=>ov.classList.add('open'));
    renderMentionView();
    const reader=document.getElementById('mention-reader');
    if(reader){reader.classList.remove('is-exiting');reader.classList.add('is-entering');setTimeout(()=>reader.classList.remove('is-entering'),300);}
    const ahc=document.getElementById('ah-reader-ctrls');
    if(ahc){ahc.innerHTML=renderReaderHeaderCtrls();ahc.style.display='flex';}
  } else {
    // Return to inline layout: close overlay, re-render inline detail
    ov.classList.remove('reader');ov.classList.remove('split');ov.classList.remove('open');
    setTimeout(()=>ov.style.display='none',300);
    if(main){main.classList.remove('md-reader-on');main.classList.remove('md-split');}
    if(sb&&!mdSidebarWasCollapsed)sb.classList.remove('collapsed');
    const ahc=document.getElementById('ah-reader-ctrls');
    if(ahc){ahc.innerHTML='';ahc.style.display='none';}
    requestAnimationFrame(()=>{
      renderTableRows();
      if(mentionData[mdActive])renderInlineDetail(mentionData[mdActive]);
    });
  }
}
function renderMentionList(){
  const total=mentionData.length,pages=mdTotalPages();
  if(mdPage>=pages)mdPage=pages-1;
  const start=mdPage*MD_PER_PAGE,end=Math.min(start+MD_PER_PAGE,total);
  const sentCls={positive:'pos',negative:'neg',neutral:'neu'};
  const svMin=1.0,svMax=5.5;
  const items=mentionData.slice(start,end).map((d,k)=>{const j=start+k;
    const pct=Math.round(60+((Math.min(Math.max(parseFloat(d.sv)||1,svMin),svMax)-svMin)/(svMax-svMin))*36);
    const cls=pct>=85?'sc-hi':pct>=70?'sc-mid':'sc-lo';
    return `<div class="md-li${j===mdActive?' active':''}" id="md-li-${j}" onclick="selectMention(${j})">
    <span class="md-li-ico type-${articleType(d)}" data-btip="${_makeTip({label:typeLabel(d)})}"><i data-lucide="${typeIcon(d)}"></i></span>
    <div class="md-li-body">
      <div class="md-li-title">${d.title}</div>
      <div class="md-li-meta">
        <span class="md-li-dot ${sentCls[d.brand]||'neu'}" title="${d.brand} sentiment"></span>
        <span class="md-li-src">${d.outlet}</span>
        <span class="md-li-mid">·</span>
        <span class="md-li-ago">${d.ago||d.date}</span>
      </div>
    </div>
    <i data-lucide="chevron-right" class="md-li-chev"></i>
  </div>`;}).join('');
  let pgBtns=`<button class="pgb arrow" onclick="gotoMdPage(${mdPage-1})"${mdPage<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
  for(let p=0;p<pages;p++)pgBtns+=`<button class="pgb${p===mdPage?' on':''}" onclick="gotoMdPage(${p})">${p+1}</button>`;
  pgBtns+=`<button class="pgb arrow" onclick="gotoMdPage(${mdPage+1})"${mdPage>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
  const pager=`<div class="ent-list-pager md-list-pager-std">
    <div class="pg-info">${start+1}–${end} of ${total}</div>
    <div class="pg-btns">${pgBtns}</div>
  </div>`;
  return `<div class="md-list-header">Mentions · ${total}</div>${items}${pager}`;
}
let mdSpotCtx=null,mdSpotArticle=null;   // spotlight/trending origin context for a distinct detail layout
function spotStoryFor(listId){
  if(listId==='spot')return trendStories[0];
  if(listId&&listId.indexOf('trend-')===0)return trendStories.find(s=>s.id===+listId.split('-')[1])||null;
  return null;
}
function openMention(i){
  if(!mentionData[i])return;
  mdSpotCtx=null;mdSpotArticle=null;
  openDetailFor(mentionData[i],i);
}
// Open the inline detail layout for a mention object. idx is its index in mentionData
// when it's a real feed item; omit it for a synthesized preview (e.g. spotlight-only coverage).
function openDetailFor(d,idx){
  mdActive=(idx!=null?idx:-1);
  mdMode='split';
  if(idx!=null)tblPage=Math.floor(idx/TBL_DETAIL_PER_PAGE);
  const sb=document.querySelector('.sidebar');
  mdSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
  if(sb)sb.classList.add('collapsed');
  _updateDetailReturnBtn();
  const page=document.getElementById('page-mentions');
  page.classList.add('detail-open');
  page.classList.toggle('spot-detail',!!mdSpotCtx);
  document.getElementById('article-detail-panel')?.classList.remove('social-detail');
  renderTableRows();
  renderInlineDetail(d);
}
// Shared View: open a social post in the split preview (collapsed Post·Sentiment list + post detail)
function openSocialPost(idx){
  const list=window.WS_DATA&&window.WS_DATA.socialMentions;if(!list||!list[idx])return;
  // The social-post split preview lives on the mentions page; on other pages (e.g. the tracker's
  // social coverage table) the row is display-only.
  if(!document.getElementById('page-mentions'))return;
  mdSocialActive=idx;mdActive=-1;mdSpotCtx=null;mdMode='split';
  const sb=document.querySelector('.sidebar');
  mdSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
  if(sb)sb.classList.add('collapsed');
  _updateDetailReturnBtn();
  const page=document.getElementById('page-mentions');
  page.classList.add('detail-open');page.classList.remove('spot-detail');
  if(idx>=0)tblPage=Math.floor(idx/TBL_DETAIL_PER_PAGE);
  renderTableRows();
  renderSocialDetail(idx);
}
// Open a social post FROM the spotlight — keeps the spotlight context (Tier 1 panel + coverage), like the news flow.
function previewSocialPost(listId,idx){
  const list=window.WS_DATA&&window.WS_DATA.socialMentions;if(!list||!list[idx])return;
  // Tracker: an activity's coverage → open the activity-style preview (same 3-column layout)
  if(document.getElementById('page-tracker')&&listId&&listId.indexOf('trk-')===0)return previewActSocialPost(+listId.split('-')[1],idx);
  if(!document.getElementById('page-mentions'))return;   // display-only on other pages
  mdSpotCtx=spotStoryFor(listId);mdSpotArticle=mdSpotCtx?{listId}:null;
  if(!mdSpotCtx)return openSocialPost(idx);   // not a spotlight list → plain preview
  mdSocialActive=idx;mdActive=-1;mdMode='split';
  const sb=document.querySelector('.sidebar');
  mdSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
  if(sb)sb.classList.add('collapsed');
  _updateDetailReturnBtn();
  const page=document.getElementById('page-mentions');
  page.classList.add('detail-open');page.classList.add('spot-detail');
  renderSocialDetail(idx);
}
// Per-platform official embed → fixed-height iframe src (null ⇒ show the "View Post" fallback card)
function socialEmbedSrc(platform,url,width){
  if(!url)return null;
  try{
    if(platform==='facebook'){const w=Math.round(Math.max(350,Math.min(750,width||500)));return 'https://www.facebook.com/plugins/post.php?href='+encodeURIComponent(url)+'&show_text=true&width='+w;}
    if(platform==='youtube'){const m=url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);return m?'https://www.youtube.com/embed/'+m[1]:null;}
    if(platform==='twitter'){const m=url.match(/status\/(\d+)/);return m?'https://platform.twitter.com/embed/Tweet.html?id='+m[1]+'&theme=light':null;}
    if(platform==='instagram'){const m=url.match(/\/(p|reel|tv)\/([\w-]+)/);return m?'https://www.instagram.com/'+m[1]+'/'+m[2]+'/embed':null;}
    if(platform==='tiktok'){const m=url.match(/video\/(\d+)/);return m?'https://www.tiktok.com/embed/v2/'+m[1]:null;}
    if(platform==='reddit')return 'https://www.redditmedia.com'+url.replace(/^https?:\/\/(www\.)?reddit\.com/,'')+'?ref_source=embed&embed=true&theme=light';
  }catch(e){}
  return null;
}
function renderSocialDetail(idx){
  const list=window.WS_DATA&&window.WS_DATA.socialMentions,s=list&&list[idx];if(!s)return;
  const p=SOCIAL_PLATFORMS[s.platform]||{icon:'fa-globe',color:'#6b7280',label:s.platform||'—'};
  const framed=mdSpotCtx||mdActCtx;   // opened from a spotlight (mentions) or activity (tracker) → show the coverage panel
  const layout=document.getElementById('article-detail-panel');if(layout)layout.classList.toggle('social-detail',!framed);
  const left=document.getElementById('adp-col-left');if(left&&framed)left.innerHTML=mdSpotCtx?renderSpotPanel(s):renderActPanel();
  // ── Middle column: post details (mirrors the mentions.html middle column) ──
  const mid=document.getElementById('adp-col-mid');
  if(mid){
    const av=(s.influencer||'?').replace(/^@/,'').charAt(0).toUpperCase();
    const toneVal={positive:'positive',neutral:'mixed',negative:'negative'}[s.sentiment]||'mixed';
    const kw=(s.keywords||[]).map(([t,n])=>`<span class="md-kw-pill">${t}${n?' - '+n:''}</span>`).join('')||'<span class="soc-empty">No keywords</span>';
    // Typed entity pills (reuses entityPillHtml from the news detail). Capped to ≤5 in data so no "Show all" modal is needed.
    const ents=(s.entities||[]).slice(0,5).map(n=>entityPillHtml(n,entCountMap(s))).join('')||'<span class="soc-empty">No entities extracted for this post</span>';
    const mrow=(k,v)=>`<div class="adp-meta-row"><span class="adp-meta-k">${k}</span><span class="adp-meta-v">${v}</span></div>`;
    // Estimated Reach falls back to ~10% of follower count when the post has no reach figure ('-'),
    // so the tile never shows a bare dash. Keeps data-shared.js honest while staying plausible.
    const parseFollowers=str=>{if(!str)return 0;const m=String(str).replace(/,/g,'').match(/([\d.]+)\s*([KM]?)/i);if(!m)return 0;let n=parseFloat(m[1]);if(/k/i.test(m[2]))n*=1e3;else if(/m/i.test(m[2]))n*=1e6;return n;};
    const fmtReach=n=>n>=1e6?(n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,'')+'M':n>=1e3?Math.round(n/1e3)+'K':Math.round(n).toString();
    const reachVal=(s.reach&&s.reach!=='-')?s.reach:(()=>{const f=parseFollowers(s.followers);return f?'~'+fmtReach(f*0.1):'~1.2K';})();
    mid.innerHTML=`
      <div class="adp-card adp-metric">
        <div class="adp-metric-tiles static">
          <div class="adp-mtile"><span class="adp-mtile-lbl">Estimated Reach</span><span class="adp-mtile-val">${reachVal}</span></div>
          <div class="adp-mtile"><span class="adp-mtile-lbl">Engagement Score</span><span class="adp-mtile-val">${s.engScore!=null?s.engScore:'—'}</span></div>
        </div>
        <div class="soc-meta"><i data-lucide="clock"></i><span>As of <b>${s.date||''}${s.time?' '+s.time:''}</b> · UTC</span></div>
      </div>
      <div class="adp-card-pair">
        <div class="adp-card">
          ${mrow('Platform',p.label)+mrow('Type',s.type||'—')+mrow('Influencer',s.influencer||'—')+mrow('Est. Reach',s.reach||'—')+mrow('Posted',`${s.date||''}<br><span style="font-size:11px;font-weight:400;color:var(--muted)">${s.ago||''}</span>`)}
        </div>
        <div class="adp-card">
          <div class="adp-card-hd">Influencer</div>
          <div class="md-author-row"><span class="md-author-avatar" style="background:${p.color}">${av}</span><span class="md-author-name">${(s.influencer||'').replace(/^@/,'')}</span></div>
          <div class="soc-infl-plat" style="margin:-6px 0 12px 42px">${p.label}</div>
          <div class="md-stats">
            <div><div class="md-stat-lbl">Influencer Score</div><div class="md-stat-val">${s.influencerScore||'—'}</div></div>
            <div><div class="md-stat-lbl">Followers</div><div class="md-stat-val">${s.followers||'—'}</div></div>
          </div>
        </div>
      </div>
      <div class="adp-card">
        <div class="adp-sent-grid">
          <div><div class="adp-card-hd">Brand Sentiment</div>${mdSelector('brand',s.sentiment,MD_SENTIMENT_OPTS)}</div>
          <div><div class="adp-card-hd">Post Tone</div>${mdSelector('tone',toneVal,MD_TONE_OPTS)}</div>
        </div>
      </div>
      <div class="adp-card-pair-half">
        <div class="adp-card"><div class="adp-card-hd">Keywords</div><div class="md-kw">${kw}</div></div>
        <div class="adp-card"><div class="adp-card-hd">Entities</div><div class="md-kw">${ents}</div></div>
      </div>
      <div class="soc-mid-caption"><i data-lucide="info"></i><span>These details are from the last capture and don't update after scraping — the embedded post may show newer live content.</span></div>`;
  }
  // ── Right column: self-contained content card (image · caption · platform-specific engagement) ──
  renderSocialRight();
  initIcons();
}
// Per-platform sizing for the (opt-in) live embed. ratio → responsive aspect box; h → fixed height.
// Standardized container: all feed platforms share one height (STD_FEED_H); scroll handles overflow.
// Only video (YouTube) diverges — it keeps a responsive 16:9 box so a landscape clip isn't letterboxed.
const STD_FEED_H=620;
const SOCIAL_EMBED_SIZE={youtube:{ratio:'16 / 9'},tiktok:{h:STD_FEED_H},instagram:{h:STD_FEED_H},twitter:{h:STD_FEED_H},facebook:{h:STD_FEED_H},reddit:{h:STD_FEED_H}};
// X/Twitter's embedded-tweet iframe reports its rendered height via postMessage — grow the frame to
// fit so the tweet shows in full (no fixed-height cap, no internal scroll). Other platforms keep the
// fixed height as a fallback. Runs once (module-level); only touches the live X embed.
window.addEventListener('message',function(e){
  if(typeof e.origin!=='string'||!/twitter\.com|x\.com/.test(e.origin))return;
  let d=e.data;if(typeof d==='string'){try{d=JSON.parse(d);}catch(_){return;}}
  const emb=d&&d['twttr.embed'];
  if(!emb||emb.method!=='twttr.private.resize')return;
  const h=emb.params&&emb.params[0]&&emb.params[0].height;
  if(!h)return;
  const iframe=document.querySelector('.soc-embed');
  if(iframe&&/platform\.twitter\.com|twitter\.com\/embed/.test(iframe.src||'')){
    const frame=iframe.closest('.soc-embed-frame');
    if(frame){frame.style.height=Math.ceil(h)+'px';frame.style.aspectRatio='auto';}
  }
});
// Renders the right column in one of two modes:
//   'card'  → a post card built entirely from our own data (never breaks, consistent across platforms)
//   'embed' → the live platform iframe (lazy, per-platform size, skeleton while loading)
// Because iframes are cross-origin we cannot detect a failed/blank/deleted embed, so the card is the
// default and the embed is a deliberate, reversible enhancement.
// Platform-aware engagement metrics: platform → ordered [dataKey, label, lucide-icon].
// Add a platform (or reorder/rename metrics) by editing one entry. The card reads post.engagement[dataKey].
const SOCIAL_ENGAGEMENT={
  facebook:[['reactions','Reactions','thumbs-up'],['comments','Comments','message-circle'],['shares','Shares','share-2']],
  instagram:[['likes','Likes','heart'],['comments','Comments','message-circle']],
  twitter:[['likes','Likes','heart'],['replies','Replies','message-circle'],['reposts','Reposts','repeat-2']],
  linkedin:[['reactions','Reactions','thumbs-up'],['comments','Comments','message-circle'],['reposts','Reposts','repeat-2']],
  youtube:[['views','Views','play'],['likes','Likes','thumbs-up'],['comments','Comments','message-circle']],
  tiktok:[['likes','Likes','heart'],['comments','Comments','message-circle'],['shares','Shares','share-2']],
  reddit:[['upvotes','Upvotes','arrow-up'],['comments','Comments','message-circle']]
};
// Compact count formatter: 640 → "640", 5900 → "5.9K", 128000 → "128K", 1.2M
function fmtCount(n){n=+n||0;if(n>=1e6)return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';if(n>=1e3)return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';return String(Math.round(n));}
// Facebook reaction breakdown — split a total into the 6 reaction types with realistic proportions.
function _fbReactions(total){
  total=+total||0;
  const types=[['👍','Like',0.68],['❤️','Love',0.16],['😆','Haha',0.08],['😮','Wow',0.04],['😢','Sad',0.025],['😠','Angry',0.015]];
  return types.map(([emoji,label,pct])=>({emoji,label,count:Math.max(0,Math.round(total*pct))})).filter(r=>r.count>0);
}
// Shared comment pool — a stable, seeded selection renders per post (no per-post authoring).
const SOCIAL_COMMENTS=[
  {author:'Maria Santos',text:'Finally! Been waiting for this 🙌'},
  {author:'Juan dela Cruz',text:'Is this available nationwide na?'},
  {author:'Anna Reyes',text:'Signing up today, thanks for sharing!'},
  {author:'Paolo Mendoza',text:'How\'s the coverage in the province?'},
  {author:'Grace Lim',text:'Ang bilis naman ng speeds ngayon 🔥'},
  {author:'Marco Villanueva',text:'Switched last month, no regrets so far.'},
  {author:'Bea Cruz',text:'Does it work with my current phone?'},
  {author:'Nathan Ong',text:'Good value for the price, honestly.'},
  {author:'Isabel Garcia',text:'Sana all may ganito 😅'},
  {author:'Kevin Tan',text:'Any promo code available right now?'},
  {author:'Liza Ramos',text:'Subscriber since day one 💪'},
  {author:'Diego Flores',text:'The 5G rollout is really picking up.'},
  {author:'Camille Aquino',text:'Nice! Sharing this with the fam.'},
  {author:'Rafael Bautista',text:'Customer service needs work though.'},
  {author:'Trina Gomez',text:'Waiting for this in our area 🙏'},
  {author:'Miguel Torres',text:'Solid coverage here in Metro Manila.'}
];
const _CMT_COLORS=['#1877f2','#16a34a','#e4405f','#f97316','#8b5cf6','#0891b2','#db2777','#d97706'];
function _cmtColor(str){let h=0;for(let i=0;i<(str||'').length;i++)h=(h*31+str.charCodeAt(i))>>>0;return _CMT_COLORS[h%_CMT_COLORS.length];}
// Deterministic per-post comments (stable across renders): seeds from the post, picks distinct pool entries.
function _socComments(post){
  const seed=(post.influencer||'')+'|'+(post.post||'').slice(0,16);
  let h=0;for(let i=0;i<seed.length;i++)h=(h*31+seed.charCodeAt(i))>>>0;
  const n=6+(h%3);   // 6–8 comments
  const times=['1h','2h','3h','5h','7h','9h','12h','15h','18h','1d','2d'];
  const out=[];
  for(let i=0;i<n;i++){
    const c=SOCIAL_COMMENTS[(h+i*7)%SOCIAL_COMMENTS.length];   // step 7 → distinct picks
    const hh=(h+i*2654435761)>>>0;
    out.push({author:c.author,text:c.text,time:times[hh%times.length],likes:(hh>>>6)%38});
  }
  return out;
}
window.toggleSocComments=function(btn){
  const box=btn.closest('.soc-comments');if(!box)return;
  const expand=btn.dataset.exp!=='1';
  box.querySelectorAll('.soc-cmt-extra').forEach(e=>{e.hidden=!expand;});
  btn.dataset.exp=expand?'1':'';
  btn.textContent=expand?'Show fewer comments':('View all '+btn.dataset.count+' comments');
};
// Third column: the social post in the news-article preview layout (title · byline · actions · image · caption · engagement).
function renderSocialRight(mode){
  const right=document.getElementById('adp-col-right');if(!right)return;
  const list=window.WS_DATA&&window.WS_DATA.socialMentions,s=list&&list[mdSocialActive];if(!s)return;
  const p=SOCIAL_PLATFORMS[s.platform]||{icon:'fa-globe',color:'#6b7280',label:s.platform||'—'};
  const handle=(s.influencer||'').replace(/^@/,''),av=(handle||'?').charAt(0).toUpperCase();
  const un=!!s.unavailable;
  const unavailNotice=`<div class="soc-card-unavail"><i data-lucide="alert-triangle"></i><span>This post is no longer available — showing the last saved snapshot.</span></div>`;
  // Post image (with colored platform placeholder fallback when missing or the image fails to load)
  const media=s.thumb
    ? `<div class="soc-card-media"><img src="${s.thumb}" alt="" loading="lazy" onerror="this.closest('.soc-card-media').classList.add('failed')"><span class="soc-card-ph" style="background:${p.color}">${socIcon(p,'')}</span>${s.type==='Video'?'<span class="soc-card-play"><i data-lucide="play"></i></span>':''}<span class="adp-hero-credit">${p.label.toUpperCase()}</span></div>`
    : '';   // no image on the post → omit the media block entirely (no placeholder)
  // Platform-specific engagement — render each metric the platform defines, skipping any that's missing.
  const eng=s.engagement||{},metrics=SOCIAL_ENGAGEMENT[s.platform];
  const stat=(ic,lbl,val)=>(val==null||val==='')?'':`<span class="soc-eng-stat"><i data-lucide="${ic}"></i><b>${fmtCount(val)}</b><span class="soc-eng-lbl">${lbl}</span></span>`;
  // Facebook: the Reactions stat reveals a per-type breakdown popover on hover
  const reactStat=(ic,lbl,val)=>{
    if(val==null||val==='')return '';
    const br=_fbReactions(val);
    const rows=br.map(r=>`<div class="soc-react-row"><span class="soc-react-emoji">${r.emoji}</span><span class="soc-react-lbl">${r.label}</span><span class="soc-react-num">${fmtCount(r.count)}</span></div>`).join('');
    return `<span class="soc-eng-stat soc-react-stat"><i data-lucide="${ic}"></i><b>${fmtCount(val)}</b><span class="soc-eng-lbl">${lbl}</span><div class="soc-react-pop">${rows}</div></span>`;
  };
  let engHtml=metrics?metrics.map(([k,lbl,ic])=>(s.platform==='facebook'&&k==='reactions')?reactStat(ic,lbl,eng[k]):stat(ic,lbl,eng[k])).join(''):'';
  if(!engHtml){ // unknown platform or no engagement captured → generic fallback (reach · engagement · followers)
    const raw=(ic,lbl,val)=>(val==null||val===''||val==='-')?'':`<span class="soc-eng-stat"><i data-lucide="${ic}"></i><b>${val}</b><span class="soc-eng-lbl">${lbl}</span></span>`;
    engHtml=raw('eye','Reach',s.reach)+raw('activity','Engagement',s.engScore)+raw('users','Followers',s.followers);
  }
  right.innerHTML=`<div class="adp-article soc-article${un?' is-unavail':''}">
    ${un?unavailNotice:''}
    <div class="soc-hd">
      <span class="soc-hd-av" style="background:${p.color}">${av}</span>
      <div class="soc-hd-body">
        <div class="soc-hd-name">${handle||p.label}<i data-lucide="badge-check" class="soc-title-tick"></i></div>
        <div class="soc-hd-byline">
          ${socIcon(p)}
          <span>${p.label}</span>
          <span class="soc-hd-dot"></span>
          <span>${s.ago||s.date||''}</span>
        </div>
      </div>
    </div>
    <div class="qa-row">
      <button class="qa-btn" onclick="qaEmail(event)"><i data-lucide="mail"></i> Send via Email</button>
      <button class="qa-btn" onclick="qaPdf(event)"><i data-lucide="file-down"></i> Export as PDF</button>
      <a class="qa-btn soc-view-btn" href="${s.url||'#'}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> View Post</a>
    </div>
    ${media}
    <p class="adp-excerpt">${s.post||''}</p>
    ${engHtml?`<div class="soc-card-engagement">${engHtml}</div>`:''}
    ${(()=>{const cm=_socComments(s),shown=3,cnt=(eng.comments!=null?eng.comments:cm.length);
      if(!cm.length)return '';
      const items=cm.map((c,i)=>`<div class="soc-cmt${i>=shown?' soc-cmt-extra':''}"${i>=shown?' hidden':''}>
        <span class="soc-cmt-av" style="background:${_cmtColor(c.author)}">${(c.author||'?').charAt(0).toUpperCase()}</span>
        <div class="soc-cmt-body"><div class="soc-cmt-head"><span class="soc-cmt-author">${c.author}</span><span class="soc-cmt-time">· ${c.time}</span></div><div class="soc-cmt-text">${c.text}</div>${c.likes?`<div class="soc-cmt-meta"><i data-lucide="heart"></i> ${c.likes}</div>`:''}</div>
      </div>`).join('');
      return `<div class="soc-comments">${items}${cm.length>shown?`<button class="soc-cmt-more" data-count="${cnt}" onclick="toggleSocComments(this)">View all ${cnt} comments</button>`:''}</div>`;
    })()}
  </div>`;
  initIcons();
}
// Contextual header-bar back button — label/handler swap based on whether the user is in
// the spotlight preview flow (mdSpotCtx) or the plain article-detail flow.
function _updateDetailReturnBtn(){
  const ret=document.getElementById('fc-detail-return');
  if(!ret)return;
  if(mdSpotCtx){
    ret.innerHTML=`<i data-lucide="arrow-left"></i> Back to spotlight`;
  }else{
    ret.innerHTML=`<i data-lucide="arrow-left"></i> Mentions feed`;
  }
  ret.style.display='inline-flex';
  initIcons();
}
function detailReturn(){
  if(mdSpotCtx)backToSpotlight();
  else closeMention();
}
// Preview a coverage row (spotlight / trending list) in the mention-detail layout.
// Real feed items open their full detail; spotlight-only items use a synthesized object.
// Shared-element open: morph the clicked headline into the preview's title via the View Transitions
// API. Falls back to a plain open when unsupported or when the user prefers reduced motion.
function vtOpen(srcSel,doOpen){
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!document.startViewTransition||reduce){doOpen();return;}
  const src=srcSel&&document.querySelector(srcSel);
  if(src)src.style.viewTransitionName='vt-art-title';
  const tgtSel='#adp-col-right .adp-title';
  const t=document.startViewTransition(()=>{
    doOpen();
    const tgt=document.querySelector(tgtSel);
    if(tgt)tgt.style.viewTransitionName='vt-art-title';
  });
  const cleanup=()=>{
    if(src)src.style.viewTransitionName='';
    const tgt=document.querySelector(tgtSel);
    if(tgt)tgt.style.viewTransitionName='';
  };
  t.finished.then(cleanup,cleanup);
}
function previewArticle(listId,hlEnc){
  const hl=decodeURIComponent(hlEnc);
  const arts=articlesForList(listId)||[];
  const a=arts.find(x=>x.hl===hl);if(!a)return;
  mdSpotCtx=spotStoryFor(listId);
  mdSpotArticle=mdSpotCtx?{listId,hl}:null;
  const idx=mentionData.findIndex(d=>d.title===hl);
  vtOpen('#al-'+listId+' .match-tbl-row[data-hl="'+hlEnc+'"] .match-hl',
    ()=>openDetailFor(idx>=0?mentionData[idx]:spotToMention(a),idx>=0?idx:null));
}
// Coverage-list pagination (spotlight + tracker activity panels share the same component)
const SPOT_COV_PER_PAGE=10;
let spotCovPage={},actCovPage={};
function _covPager(curr,total,pages,handler,perPage){
  perPage=perPage||SPOT_COV_PER_PAGE;
  if(total<=perPage)return'';
  const start=curr*perPage,end=Math.min(start+perPage,total);
  let btns=`<button class="pgb arrow" onclick="${handler}(${curr-1})"${curr<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
  for(let p=0;p<pages;p++)btns+=`<button class="pgb${p===curr?' on':''}" onclick="${handler}(${p})">${p+1}</button>`;
  btns+=`<button class="pgb arrow" onclick="${handler}(${curr+1})"${curr>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
  return `<div class="tbl-footer ent-pager spot-cov-pager"><div class="pg-info">${start+1}–${end} of ${total} results</div><div class="pg-btns">${btns}</div></div>`;
}
function rerenderSpotPanel(){
  const col=document.getElementById('adp-col-left');
  if(col&&mdSpotCtx){
    // Find the currently rendered detail object — use the active list/hl for refresh
    const listId=mdSpotArticle?mdSpotArticle.listId:'spot';
    const arts=articlesForList(listId)||[];
    const hl=mdSpotArticle?mdSpotArticle.hl:(arts[0]&&arts[0].hl);
    const idx=hl?mentionData.findIndex(d=>d.title===hl):-1;
    const d=idx>=0?mentionData[idx]:(hl?spotToMention(arts.find(x=>x.hl===hl)):{});
    col.innerHTML=renderSpotPanel(d);
    initIcons();
  }
}
function goSpotCovPage(n){
  const listId=mdSpotArticle?mdSpotArticle.listId:'spot';
  const arts=articlesForList(listId)||[];
  const pages=Math.max(1,Math.ceil(arts.length/SPOT_COV_PER_PAGE));
  spotCovPage[listId]=Math.max(0,Math.min(n,pages-1));
  rerenderSpotPanel();
}
function rerenderActPanel(){
  const col=document.getElementById('adp-col-left');
  if(col&&mdActCtx)col.innerHTML=renderActPanel();
  initIcons();
}
function goActCovPage(n){
  if(!mdActCtx)return;
  const total=(mdActCtx.matches||[]).length;
  const pages=Math.max(1,Math.ceil(total/SPOT_COV_PER_PAGE));
  actCovPage[mdActCtx.id]=Math.max(0,Math.min(n,pages-1));
  rerenderActPanel();
}
// Left column for spotlight-origin detail: story header + why + chips + scoped coverage list
function renderSpotPanel(d){
  const s=mdSpotCtx;if(!s)return'';
  const listId=mdSpotArticle?mdSpotArticle.listId:'spot';
  const arts=articlesForList(listId)||[];
  const isSocial=!!(arts[0]&&arts[0].platform);   // Shared View: spotlight coverage is social posts
  const all=isSocial?((window.WS_DATA&&window.WS_DATA.socialMentions)||[]):null;
  // Flip to the active item's page so the highlight is visible
  const activeIdx=isSocial?arts.indexOf(all[mdSocialActive]):arts.findIndex(x=>x.hl===(mdSpotArticle?mdSpotArticle.hl:d.title));
  if(activeIdx>=0&&spotCovPage[listId]==null)spotCovPage[listId]=Math.floor(activeIdx/SPOT_COV_PER_PAGE);
  const total=arts.length;
  const pages=Math.max(1,Math.ceil(total/SPOT_COV_PER_PAGE));
  let page=Math.max(0,Math.min(spotCovPage[listId]||0,pages-1));
  spotCovPage[listId]=page;
  const pageArts=arts.slice(page*SPOT_COV_PER_PAGE,page*SPOT_COV_PER_PAGE+SPOT_COV_PER_PAGE);
  const chips=(s.chips||[]).map(ch=>`<span class="chip ${ch.cls}">${ch.t}</span>`).join('');
  const rows=isSocial
    ? pageArts.map(a=>{
        const gi=all.indexOf(a),p=SOCIAL_PLATFORMS[a.platform]||{icon:'fa-globe',color:'#6b7280',label:a.platform||'—'};
        const sc=a.match>=85?'sc-hi':a.match>=70?'sc-mid':'sc-lo';
        return `<div class="spot-cov-li${gi===mdSocialActive?' active':''}" onclick="previewSocialPost('${listId}',${gi})">
          <span class="spot-cov-plat">${socIcon(p)}</span>
          <div class="spot-cov-body"><div class="spot-cov-hl">${a.post||''}</div><div class="spot-cov-meta">${a.influencer||''} · ${a.date||''}</div></div>
          <span class="spot-cov-match-cell"><span class="art-score-val ${sc}">${a.match}% match</span></span>
        </div>`;
      }).join('')
    : pageArts.map(a=>{
        const ic=ATicn[a.media]||{cls:'type-online',icon:'newspaper'},sc=a.score>=85?'sc-hi':a.score>=70?'sc-mid':'sc-lo',curHl=mdSpotArticle?mdSpotArticle.hl:d.title;
        return `<div class="spot-cov-li${a.hl===curHl?' active':''}" onclick="selectSpotArticle('${encodeURIComponent(a.hl)}')">
          <span class="md-li-ico ${ic.cls}"><i data-lucide="${ic.icon}"></i></span>
          <div class="spot-cov-body"><div class="spot-cov-hl">${a.hl}</div><div class="spot-cov-meta">${a.source} · ${a.date}</div></div>
          <span class="spot-cov-match-cell"><span class="art-score-val ${sc}">${a.score}% match</span></span>
        </div>`;
      }).join('');
  return `<div class="spot-panel">
    <div class="spot-act-head">
      <div class="spot-tier"><i data-lucide="star" class="icon-sm"></i> Tier 1 Spotlight</div>
      <div class="spot-panel-title" data-btip="${_makeTip({detail:s.hl})}">${s.hl}</div>
    </div>
    <div class="spot-panel-why"><span class="spot-why-lbl"><i data-lucide="zap"></i> Why this was picked</span><span class="spot-why-txt">${s.why}</span></div>
    <div class="chips spot-panel-chips">${chips}</div>
    <div class="spot-cov-tbl">
      <div class="spot-cov-thd"><span>${isSocial?'Post':'Headline'}</span><span class="spot-cov-match-cell">Match</span></div>
      <div class="spot-cov-list">${rows}</div>
    </div>
    ${_covPager(page,total,pages,'goSpotCovPage')}
  </div>`;
}
function selectSpotArticle(hlEnc){
  const hl=decodeURIComponent(hlEnc);
  const listId=mdSpotArticle?mdSpotArticle.listId:'spot';
  const arts=articlesForList(listId)||[];
  const a=arts.find(x=>x.hl===hl);if(!a)return;
  mdSpotArticle={listId,hl};
  // Flip to the page containing the new active item if it's not currently visible
  const activeIdx=arts.findIndex(x=>x.hl===hl);
  if(activeIdx>=0)spotCovPage[listId]=Math.floor(activeIdx/SPOT_COV_PER_PAGE);
  const idx=mentionData.findIndex(d=>d.title===hl);
  mdActive=(idx>=0?idx:-1);
  renderInlineDetail(idx>=0?mentionData[idx]:spotToMention(a));
}
function backToSpotlight(){
  const listId=mdSpotArticle?mdSpotArticle.listId:'spot';
  mdSpotCtx=null;mdSpotArticle=null;
  document.getElementById('page-mentions').classList.remove('spot-detail');
  closeMention();
  const tabs=document.querySelectorAll('.mm-tab');
  const trend=listId.indexOf('trend-')===0;
  const t=tabs[trend?1:0];if(t)switchBriefTab(trend?'trend':'spot',t);
}
function spotToMention(a){
  const tmpl=JSON.parse(JSON.stringify(mentionData[0]||{}));   // clone a real mention → every field exists
  const typeMap={Print:'broadsheet',Online:'online',TV:'tv',Radio:'radio',Social:'blog'};
  const sv=Math.max(1,a.score/20);
  return Object.assign(tmpl,{
    title:a.hl,sub:a.source,outlet:a.source,type:typeMap[a.media]||'online',
    ave:a.ave,sv:+sv.toFixed(2),avgSv:sv.toFixed(2),authorScore:(sv*0.8).toFixed(2),
    date:a.date,ago:a.date,section:'News',author:'Staff Writer',brand:'neutral',tone:'neutral'
  });
}
// ── Tracker article preview: open a matched article in the 3-column detail, framed by its activity ──
const TYPE_ACCENT={'Press Release':'#4f46e5','Event':'#2563eb','Crisis':'#dc2626','Trending':'#d97706','Product':'#16a34a'};
let mdActCtx=null,mdActMatch=null;
function matchToMention(m){
  const idx=mentionData.findIndex(d=>d.title===m.title);
  if(idx>=0)return mentionData[idx];
  const tmpl=JSON.parse(JSON.stringify(mentionData[0]||{}));
  const typeMap={Print:'broadsheet',Online:'online',TV:'tv',Radio:'radio',Social:'blog'};
  const sv=Math.max(1,(m.score?m.score*5:2));
  return Object.assign(tmpl,{
    title:m.title,sub:m.source,outlet:m.source,type:typeMap[m.media]||'online',
    ave:fv(m.value),sv:+sv.toFixed(2),avgSv:sv.toFixed(2),authorScore:(sv*0.8).toFixed(2),
    date:m.date,ago:timeAgo(m.date),section:'News',author:'Staff Writer',brand:'neutral',tone:'neutral'
  });
}
function previewMatch(actId,matchId){
  const a=acts.find(x=>x.id===actId);if(!a)return;
  const m=(a.matches||[]).find(x=>x.id===matchId);if(!m)return;
  vtOpen('#mr-'+matchId+' .match-hl',()=>{
    mdActCtx=a;mdActMatch=matchId;mdSpotCtx=null;
    const sb=document.querySelector('.sidebar');
    mdSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
    if(sb)sb.classList.add('collapsed');
    const page=document.getElementById('page-tracker');
    if(page)page.classList.add('tk-detail-open');
    const panel=document.getElementById('article-detail-panel');
    if(panel)panel.style.setProperty('--ctx-accent',TYPE_ACCENT[a.type]||'#7c3aed');
    _updateTrackerReturnBtn(true);
    renderInlineDetail(matchToMention(m));
  });
}
// Tracker (Shared View): open a social post from an activity's coverage — same 3-column preview as the mentions spotlight.
function previewActSocialPost(actId,idx){
  const a=acts.find(x=>x.id===actId);if(!a)return;
  const list=window.WS_DATA&&window.WS_DATA.socialMentions;if(!list||!list[idx])return;
  mdActCtx=a;mdActMatch=null;mdSpotCtx=null;mdSocialActive=idx;mdActive=-1;mdMode='split';
  const sb=document.querySelector('.sidebar');
  mdSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
  if(sb)sb.classList.add('collapsed');
  const page=document.getElementById('page-tracker');
  if(page)page.classList.add('tk-detail-open');
  const panel=document.getElementById('article-detail-panel');
  if(panel)panel.style.setProperty('--ctx-accent',TYPE_ACCENT[a.type]||'#7c3aed');
  _updateTrackerReturnBtn(true);
  renderSocialDetail(idx);
}
// Header back-button toggle for the tracker activity-preview flow.
// Swap: hide "New activity" + show "Back to activity" when previewing.
function _updateTrackerReturnBtn(inDetail){
  const ret=document.getElementById('tk-detail-return');
  const newBtn=document.getElementById('tk-btn-new');
  if(ret)ret.style.display=inDetail?'inline-flex':'none';
  if(newBtn)newBtn.style.display=inDetail?'none':'inline-flex';
  if(inDetail)initIcons();
}
function selectActMatch(matchId){
  if(!mdActCtx)return;
  const matches=mdActCtx.matches||[];
  const m=matches.find(x=>x.id===matchId);if(!m)return;
  mdActMatch=matchId;
  // Flip to the page containing the new active match
  const idx=matches.findIndex(x=>x.id===matchId);
  if(idx>=0)actCovPage[mdActCtx.id]=Math.floor(idx/SPOT_COV_PER_PAGE);
  renderInlineDetail(matchToMention(m));
}
function backToActivity(){
  mdActCtx=null;mdActMatch=null;
  const page=document.getElementById('page-tracker');
  if(page)page.classList.remove('tk-detail-open');
  const sb=document.querySelector('.sidebar');
  if(sb&&!mdSidebarWasCollapsed)sb.classList.remove('collapsed');
  _updateTrackerReturnBtn(false);
}
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape'||!mdActCtx)return;
  if(document.getElementById('ent-modal')?.classList.contains('open'))return;
  if(document.getElementById('bs-lightbox')?.classList.contains('open'))return;
  backToActivity();
});
function renderActPanel(){
  const a=mdActCtx;if(!a)return'';
  const tc=(typeof TC!=='undefined'&&TC[a.type])?TC[a.type]:{icon:'flame'};
  // Shared View: the activity's coverage is social posts, not news matches
  const socialCov=(window.WS_DATA&&window.WS_DATA.socialMentions)?(articlesForList('trk-'+a.id)||[]):null;
  const isSocial=!!(socialCov&&socialCov[0]&&socialCov[0].platform);
  const all=isSocial?socialCov:null;
  const items=isSocial?socialCov:(a.matches||[]);
  // Auto-flip to the page containing the active item (first render only)
  if(isSocial){
    const ai=items.indexOf(all[mdSocialActive]);
    if(ai>=0&&actCovPage[a.id]==null)actCovPage[a.id]=Math.floor(ai/SPOT_COV_PER_PAGE);
  }else if(mdActMatch&&actCovPage[a.id]==null){
    const idx=items.findIndex(m=>m.id===mdActMatch);
    if(idx>=0)actCovPage[a.id]=Math.floor(idx/SPOT_COV_PER_PAGE);
  }
  const total=items.length;
  const pages=Math.max(1,Math.ceil(total/SPOT_COV_PER_PAGE));
  let page=Math.max(0,Math.min(actCovPage[a.id]||0,pages-1));
  actCovPage[a.id]=page;
  const pageItems=items.slice(page*SPOT_COV_PER_PAGE,page*SPOT_COV_PER_PAGE+SPOT_COV_PER_PAGE);
  const rows=isSocial
    ? pageItems.map(x=>{
        const gi=all.indexOf(x),p=SOCIAL_PLATFORMS[x.platform]||{icon:'fa-globe',color:'#6b7280',label:x.platform||'—'};
        const sc=x.match>=85?'sc-hi':x.match>=70?'sc-mid':'sc-lo';
        return `<div class="spot-cov-li${gi===mdSocialActive?' active':''}" onclick="previewActSocialPost(${a.id},${gi})">
          <span class="spot-cov-plat">${socIcon(p)}</span>
          <div class="spot-cov-body"><div class="spot-cov-hl">${x.post||''}</div><div class="spot-cov-meta">${x.influencer||''} · ${x.date||''}</div></div>
          <span class="spot-cov-match-cell"><span class="art-score-val ${sc}">${x.match}% match</span></span>
        </div>`;
      }).join('')
    : pageItems.map(m=>{
        const ic=ATicn[m.media]||{cls:'type-online',icon:'newspaper'},pct=m.score?Math.round(m.score*100):null,sc=pct>=85?'sc-hi':pct>=70?'sc-mid':'sc-lo';
        return `<div class="spot-cov-li${m.id===mdActMatch?' active':''}" onclick="selectActMatch('${m.id}')">
          <span class="md-li-ico ${ic.cls}"><i data-lucide="${ic.icon}"></i></span>
          <div class="spot-cov-body"><div class="spot-cov-hl">${m.title}</div><div class="spot-cov-meta">${m.source} · ${m.date}</div></div>
          ${pct?`<span class="spot-cov-match-cell"><span class="art-score-val ${sc}">${pct}% match</span></span>`:''}
        </div>`;
      }).join('');
  return `<div class="spot-panel ctx-act">
    <div class="spot-act-head">
      <div class="spot-tier ctx-tier"><i data-lucide="${tc.icon}" class="icon-sm"></i> ${a.type}</div>
      <div class="spot-panel-title" data-btip="${_makeTip({detail:a.title})}">${a.title}</div>
    </div>
    ${a.content?`<div class="spot-panel-why"><span class="spot-why-lbl"><i data-lucide="zap"></i> Activity context</span><span class="spot-why-txt">${a.content.length>180?a.content.slice(0,180)+'…':a.content}</span></div>`:''}
    <div class="spot-cov-tbl">
      <div class="spot-cov-thd"><span>${isSocial?'Post':'Headline'}</span><span class="spot-cov-match-cell">Match</span></div>
      <div class="spot-cov-list">${rows}</div>
    </div>
    ${_covPager(page,total,pages,'goActCovPage')}
  </div>`;
}
function selectMention(i){
  if(!mentionData[i])return;
  mdActive=i;
  // flip the list to the active item's page if needed (otherwise the list keeps its scroll)
  const pageOf=Math.floor(i/MD_PER_PAGE),pageChanged=pageOf!==mdPage;
  if(pageChanged)mdPage=pageOf;
  if(mdMode==='reader'){
    // update only the article panes; the list column stays put
    document.getElementById('mr-main').innerHTML=renderReaderMain(mentionData[i]);
    renderReaderSide(mentionData[i]);
    const art=document.getElementById('mr-main');if(art)art.scrollTop=0;
    const left=document.querySelector('.mr-panel-left');if(left)left.scrollTop=0;
    const ahc=document.getElementById('ah-reader-ctrls');if(ahc)ahc.innerHTML=renderReaderHeaderCtrls(); // refresh prev/next state
    if(pageChanged){const l=document.getElementById('mr-list');if(l)l.innerHTML=renderMentionList();}
  }else{
    renderInlineDetail(mentionData[i]);
    highlightMentionRow(i);
  }
  initIcons();
}
function mdNav(dir){
  const next=mdActive+dir;
  if(next<0||next>=mentionData.length)return;
  selectMention(next);
  const li=document.getElementById('md-li-'+next);
  if(li)li.scrollIntoView({block:'nearest'});
}
function toggleMdList(){
  document.getElementById('mention-shell').classList.toggle('list-open');
}
function closeMention(){
  if(mdMode==='reader'){
    // From reader: return to inline layout, keep detail-open
    returnToFeed();
    return;
  }
  // From inline: close detail entirely, restore filter bar, sidebar and full table
  const ret=document.getElementById('fc-detail-return');
  if(ret)ret.style.display='none';
  const sb=document.querySelector('.sidebar');
  if(sb&&!mdSidebarWasCollapsed)sb.classList.remove('collapsed');
  const page=document.getElementById('page-mentions');
  page.classList.remove('detail-open');
  page.classList.remove('theater');
  mdSocialActive=-1;
  document.getElementById('article-detail-panel')?.classList.remove('social-detail');
  tblPage=0;
  renderTableRows();
  highlightMentionRow(-1);
  mdMode='split';
}
// Return from reader to split view — keeps overlay open, sidebar visible, active article highlighted
function returnToFeed(){
  // Save panel scroll before switching
  const panelLeft=document.querySelector('.mr-panel-left');
  if(panelLeft)mdListScrollTop=panelLeft.scrollTop;
  setMdMode('split');
}
// Keyboard nav while the drawer is open (↑/↓ = prev/next, Esc = close)
document.addEventListener('keydown',function(e){
  const ov=document.getElementById('mention-overlay');
  if(!ov||!ov.classList.contains('open'))return;
  if(e.key==='ArrowDown'){e.preventDefault();mdNav(1);}
  else if(e.key==='ArrowUp'){e.preventDefault();mdNav(-1);}
  else if(e.key==='Escape'){closeMention();}
});
const MD_BRAND={positive:['pos','smile','Positive'],negative:['neg','frown','Negative'],neutral:['neu','meh','Neutral']};
const MD_TONE={positive:['pos','thumbs-up','Positive'],negative:['neg','thumbs-down','Negative'],mixed:['neu','minus','Mixed']};
function mdBadge(map,val){const[c,ic,lbl]=map[val]||map[Object.keys(map)[0]];return `<span class="md-badge ${c}"><i data-lucide="${ic}"></i>${lbl}</span>`;}
// Icon-based 3-option selectors for Brand Sentiment (faces) and Article Tone (thumbs)
const MD_SENTIMENT_OPTS=[['positive','smile','Good for Brand','pos'],['neutral','meh','Neutral','neu'],['negative','frown','Bad for Brand','neg']];
const MD_TONE_OPTS=[['positive','thumbs-up','Positive Tone','pos'],['mixed','minus','Neutral Tone','neu'],['negative','thumbs-down','Negative Tone','neg']];
const MD_SOCIALS=[['fa-facebook-f','#1877F2'],['fa-x-twitter','#000000'],['fa-instagram','#E4405F'],['fa-linkedin-in','#0A66C2'],['fa-youtube','#FF0000'],['fa-pinterest-p','#E60023'],['fa-reddit-alien','#FF4500'],['fa-tiktok','#111111']];
// X logo as inline SVG (Font Awesome 6.4.0 predates fa-x-twitter, so we draw it — works on every page)
const X_SVG='<svg class="md-soc-x" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>';
// Platform icon HTML — draws the X logo via inline SVG (FA 6.4.0 lacks fa-x-twitter), else the FA brand icon.
// color: defaults to the platform color; pass '' to inherit (e.g. white on a colored placeholder).
function socIcon(p,color){
  const c=color!==undefined?color:(p&&p.color);
  const st=c?` style="color:${c}"`:'';
  return (p&&p.icon==='fa-x-twitter')
    ? `<svg class="soc-x-ico" viewBox="0 0 24 24" fill="currentColor"${st} aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>`
    : `<i class="fa-brands ${p?p.icon:'fa-globe'}"${st}></i>`;
}
function renderSocialIcons(){
  return `<div class="md-socials">${MD_SOCIALS.map(([c,col])=>`<span class="md-soc" style="background:${col}" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'">${c==='fa-x-twitter'?X_SVG:`<i class="fa-brands ${c}"></i>`}</span>`).join('')}</div>`;
}
// Shared View: one platform icon per influencer, stably assigned from the name
const ONE_SOC_SET=[['fa-facebook-f','#1877F2'],['fa-x-twitter','#000000'],['fa-instagram','#E4405F'],['fa-youtube','#FF0000'],['fa-reddit-alien','#FF4500'],['fa-tiktok','#111111']];
function _oneSocFor(name){let h=0;const s=String(name||'');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return ONE_SOC_SET[h%ONE_SOC_SET.length];}
function renderOneSocialIcon(name){const [c,col]=_oneSocFor(name);return `<div class="md-socials"><span class="md-soc" style="background:${col}">${c==='fa-x-twitter'?X_SVG:`<i class="fa-brands ${c}"></i>`}</span></div>`;}
function oneSocialBadge(name){const [c,col]=_oneSocFor(name);return `<span class="ent-row-soc" style="background:${col}">${c==='fa-x-twitter'?X_SVG:`<i class="fa-brands ${c}"></i>`}</span>`;}
function oneSocialInline(name){const [c,col]=_oneSocFor(name);return `<span class="ent-title-soc" style="color:${col}">${c==='fa-x-twitter'?X_SVG:`<i class="fa-brands ${c}"></i>`}</span>`;}
// Entities: typed icon + color (type inferred from the name)
const ENT_TYPES={org:['building-2','#0d9488'],person:['user','#2563eb'],location:['map-pin','#d97706'],other:['tag','#6b7280']};
function entityType(name){
  if(/\b(City|Visayas|Luzon|Mindanao|Philippines|Manila|Cebu|Davao|Quezon)\b/i.test(name))return 'location';
  if(/\b(Inc|Corp|Communications?|Telecommunity|Labs?|Electric|Networks?|Davis|Opensignal|PLDT|DITO|Globe|Smart|Iridium|Telecom|Media|Mobile)\b/i.test(name)||name===name.toUpperCase())return 'org';
  if(/^[A-Z][a-zA-Z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-zA-Z]+/.test(name))return 'person';
  return 'org';
}
const ENT_TYPE_LABELS={org:'Organisation',person:'Person',location:'Location',other:'Other'};
function entityPillHtml(name,countMap){
  const type=entityType(name);
  const [ic,col]=ENT_TYPES[type]||ENT_TYPES.org;
  const count=(countMap&&countMap[name])||1;
  const typeLabel=ENT_TYPE_LABELS[type]||'Organisation';
  const wikiSlug=encodeURIComponent(name.replace(/\s+/g,'_'));
  const tid=_makeTip({entityName:name,entityType:typeLabel,entityCount:count,wikiSlug});
  return `<span class="md-ent-pill" data-btip="${tid}"><span class="md-ent-ico" style="background:${col}"><i data-lucide="${ic}"></i></span>${name}</span>`;
}
// Entities block: first 6 pills + a "Show all" button (opens the full-list modal)
function entCountMap(d){
  const map={};
  (d.entities||[]).forEach(n=>{map[n]=(map[n]||0)+1;});
  return map;
}
function renderEntities(d){
  const ents=d.entities||[];
  if(!ents.length)return `<div class="md-entities-empty">No entities extracted for this ${_wPost()}</div>`;
  const cm=entCountMap(d);
  const shown=ents.slice(0,5).map(n=>entityPillHtml(n,cm)).join('');
  const more=ents.length>5?`<button class="ent-more" onclick="openEntities(event)">Show all ${ents.length}</button>`:'';
  return `<div class="md-kw">${shown}${more}</div>`;
}
function openEntities(e){
  if(e)e.stopPropagation();
  const d=mentionData[mdActive];if(!d)return;
  const modal=document.getElementById('ent-modal');if(!modal)return;
  const body=document.getElementById('ent-modal-body'),title=document.getElementById('ent-modal-title');
  const cm=entCountMap(d);
  if(body)body.innerHTML=`<div class="md-kw">${(d.entities||[]).map(n=>entityPillHtml(n,cm)).join('')}</div>`;
  if(title)title.textContent=`Entities · ${(d.entities||[]).length}`;
  modal.classList.add('open');initIcons();
}
function closeEntities(){const m=document.getElementById('ent-modal');if(m)m.classList.remove('open');}
function mdSelector(field,val,opts){
  const active=opts.find(o=>o[0]===val);   // no match → nothing selected yet
  const label=active?`<span class="md-sel-lbl ${active[3]}">${active[2]}</span>`:`<span class="md-sel-lbl none">Not set</span>`;
  return `<div class="md-sel">
    ${opts.map(([v,ic,lbl,cls])=>`<button class="md-sel-btn ${cls}${v===val?' on':''}" data-btip="${_makeTip({label:lbl})}" onclick="setMdField('${field}','${v}')"><i data-lucide="${ic}"></i></button>`).join('')}
    ${label}
  </div>`;
}
function setMdField(field,val){
  if(!mentionData[mdActive])return;
  // toggle: clicking the active option clears it back to the unselected state
  mentionData[mdActive][field]=(mentionData[mdActive][field]===val)?'':val;
  const cur=mentionData[mdActive][field];
  if(mdMode==='reader'){
    renderReaderSide(mentionData[mdActive]);
  }else{
    renderInlineDetail(mentionData[mdActive]);
  }
  if(field==='brand'){                 // keep the list dot AND the table column in sync (grey when unset)
    const li=document.getElementById('md-li-'+mdActive),dot=li&&li.querySelector('.md-li-dot');
    if(dot)dot.className='md-li-dot '+({positive:'pos',negative:'neg',neutral:'neu'}[cur]||'neu');
    const trow=document.querySelector('.tbl tbody tr[data-idx="'+mdActive+'"]'),sc=trow&&trow.querySelector('.tbl-sent-cell');
    if(sc)sc.innerHTML=sentimentCellHtml(cur);
    const card=document.getElementById('mention-card-'+mdActive),csc=card&&card.querySelector('.tbl-sent');
    if(csc)csc.outerHTML=sentimentCellHtml(cur);   // keep card view pill in sync too
  }
  initIcons();
}
// Mentions table sentiment column (injected from mentionData, kept in sync with the selectors)
function sentimentCellHtml(brand){
  const m={positive:['pos','Positive'],neutral:['neu','Neutral'],negative:['neg','Negative']}[brand];
  return m?`<span class="tbl-sent ${m[0]}"><span class="tbl-sent-dot"></span>${m[1]}</span>`
          :`<span class="tbl-sent none"><span class="tbl-sent-dot"></span>Not set</span>`;
}
function initSentimentColumn(){
  document.querySelectorAll('.tbl tbody tr').forEach((tr,i)=>{
    if(tr.querySelector('.tbl-sent-cell'))return;       // don't double-inject
    const d=mentionData[i];if(!d)return;
    const td=document.createElement('td');
    td.className='tbl-sent-cell';
    td.innerHTML=sentimentCellHtml(d.brand);
    tr.insertBefore(td,tr.children[5]);                 // after Publication (idx 4), before Date
  });
}
// ── Mentions Table / Card view ──
let mentionsView='table';
let mcPage=0; const MC_PER_PAGE=12;
function renderMentionCards(){
  const total=mentionData.length,pages=Math.max(1,Math.ceil(total/MC_PER_PAGE));
  if(mcPage>=pages)mcPage=pages-1;
  const start=mcPage*MC_PER_PAGE,end=Math.min(start+MC_PER_PAGE,total);
  const cards=mentionData.slice(start,end).map((d,k)=>{const i=start+k;const hasImg=['online','blog','tv'].includes(articleType(d));return `<div class="mc-card" id="mention-card-${i}" style="animation-delay:${(k*0.03).toFixed(2)}s" onclick="openMention(${i})">
    ${hasImg?`<div class="mc-thumb"><img src="https://picsum.photos/seed/${encodeURIComponent(d.outlet+d.sv)}/480/270" alt=""></div>`:''}
    <div class="mc-body">
      <div class="mc-top">
        <span class="mc-ico type-${articleType(d)}" data-btip="${_makeTip({label:typeLabel(d)})}"><i data-lucide="${typeIcon(d)}"></i></span>
        <div class="mc-pub"><div class="mc-pub-name">${d.sub}</div><div class="mc-pub-cat">${d.section}</div></div>
        ${sentimentCellHtml(d.brand)}
      </div>
      <div class="mc-hl">${d.title}</div>
      <div class="mc-foot">
        <span class="mc-metric"><span class="mc-metric-lbl">SV</span> ${d.sv}</span><span class="mc-dot">·</span>
        <span class="mc-metric ave">${d.ave}</span><span class="mc-dot">·</span>
        <span>${d.ago||d.date}</span>
      </div>
    </div>
  </div>`;}).join('');
  let nums='';for(let p=0;p<pages;p++){nums+=`<button class="pgb${p===mcPage?' on':''}" onclick="gotoMcPage(${p})">${p+1}</button>`;}
  const pager=`<div class="mc-pager">
    <div class="pg-info">${start+1}–${end} of ${total} results</div>
    <div class="pg-btns">
      <button class="pgb arrow" onclick="gotoMcPage(${mcPage-1})" ${mcPage<=0?'disabled':''}><i data-lucide="chevron-left"></i></button>
      ${nums}
      <button class="pgb arrow" onclick="gotoMcPage(${mcPage+1})" ${mcPage>=pages-1?'disabled':''}><i data-lucide="chevron-right"></i></button>
    </div>
  </div>`;
  return `<div class="mc-grid">${cards}</div>${pager}`;
}
function gotoMcPage(p){
  const pages=Math.max(1,Math.ceil(mentionData.length/MC_PER_PAGE));
  mcPage=Math.max(0,Math.min(p,pages-1));
  document.getElementById('mentions-cards').innerHTML=renderMentionCards();
  initIcons();
}
function playViewAnim(el){if(!el)return;el.style.animation='none';void el.offsetWidth;el.style.animation='viewIn 0.28s cubic-bezier(0.22,1,0.36,1) both';}
function setMentionsView(v){
  mentionsView=v;
  const tableWrap=document.querySelector('.tbl-scroll'),cards=document.getElementById('mentions-cards'),footer=document.querySelector('.tbl-footer');
  const tb=document.getElementById('tvb-table'),cb=document.getElementById('tvb-cards');
  if(tb)tb.classList.toggle('on',v==='table');
  if(cb)cb.classList.toggle('on',v==='cards');
  if(v==='cards'){
    cards.innerHTML=renderMentionCards();
    cards.style.display='block';
    if(tableWrap)tableWrap.style.display='none';
    if(footer)footer.style.display='none';   // cards have their own pager
    initIcons();
    playViewAnim(cards);
  }else{
    cards.style.display='none';
    if(tableWrap)tableWrap.style.display='block';
    if(footer)footer.style.display='flex';
    playViewAnim(tableWrap);
  }
}
function renderModeToggle(){
  return `<div class="md-mode-toggle">
    <button class="md-mode-btn ${mdMode==='split'?'on':''}" onclick="setMdMode('split')" title="Split view"><i data-lucide="columns-2"></i></button>
    <button class="md-mode-btn ${mdMode==='reader'?'on':''}" onclick="setMdMode('reader')" title="Reader view"><i data-lucide="book-open"></i></button>
  </div>`;
}
// Story Value bar chart block (shared by the detail panel and the reader analytics pane)
function chartDayLabels(d,mode){
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const base=new Date(d.date);base.setHours(0,0,0,0);
  const n=d.chart.length;
  if(mode==='month'){
    // group bars into ~3 week buckets labelled by week start
    return d.chart.map((_,j)=>{
      const dt=new Date(base);dt.setDate(base.getDate()-(n-1-j));
      const wk=Math.floor(j/(n/3));
      return j===0||Math.floor((j-1)/(n/3))!==wk?`${MONTHS[dt.getMonth()]} W${Math.ceil(dt.getDate()/7)}`:'';
    });
  }
  return d.chart.map((_,j)=>{const dt=new Date(base);dt.setDate(base.getDate()-(n-1-j));return `${MONTHS[dt.getMonth()]} ${dt.getDate()}`;});
}
function mdChartBlock(d,mode){
  mode=mode||'day';
  const rawMax=Math.max(...d.chart,1),hi=d.chart.indexOf(rawMax),step=2;
  const axisMax=Math.max(Math.ceil(rawMax/step)*step,step);
  const labels=chartDayLabels(d,mode);
  const avePerDay=buildAvePerDay(d);
  const bars=d.chart.map((v,j)=>{
    const tid=_makeTip({date:labels[j],coverage:v,sv:d.sv,ave:fmtAve(avePerDay[j])});
    return `<div class="md-bar${j===hi?' hi':''}" style="height:${Math.max(v/axisMax*100,2)}%;animation-delay:${(j*0.04).toFixed(2)}s" data-btip="${tid}"><span class="md-bar-lbl">${labels[j]}</span></div>`;
  }).join('');
  let axis='',grid='';
  for(let t=axisMax;t>=0;t-=step){const pct=(t/axisMax*100).toFixed(2);axis+=`<span class="md-axis-tick" style="bottom:${pct}%">${t}</span>`;if(t>0)grid+=`<span class="md-gridline" style="bottom:${pct}%"></span>`;}
  return `<div class="md-chart-wrap"><div class="md-axis">${axis}</div><div class="md-chart md-chart--labeled">${grid}${bars}</div></div>`;
}
// ── Frequency distribution (Story Value + AVE) — reuses the shared md-chart primitives so it matches the design system ──
function parseAve(s){let n=parseFloat(String(s).replace(/[^0-9.]/g,''))||0;if(/m/i.test(s))n*=1e6;else if(/k/i.test(s))n*=1e3;return n;}
function fmtAve(n){if(n>=1e6)return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';if(n>=1e3)return Math.round(n/1e3)+'K';return Math.round(n);}
function buildFreq(d){
  const vols=d.chart,BINS=6;
  const max=Math.max(...vols,1),size=max/BINS||1;
  const svCounts=new Array(BINS).fill(0),aveSums=new Array(BINS).fill(0);
  const total=vols.reduce((a,b)=>a+b,0)||1,rate=parseAve(d.ave)/total;
  vols.forEach(v=>{const b=Math.min(BINS-1,Math.floor(v/size));svCounts[b]++;aveSums[b]+=v*rate;});
  return {svCounts,aveSums};
}
function buildAvePerDay(d){
  const total=d.chart.reduce((a,b)=>a+b,0)||1,rate=parseAve(d.ave)/total;
  return d.chart.map(v=>v*rate);
}
function freqChart(bins,opts){
  opts=opts||{};
  const max=Math.max(...bins,1),hi=bins.indexOf(Math.max(...bins));
  const labels=opts.labels||[];
  const labeled=labels.length===bins.length;
  const bars=bins.map((v,j)=>{
    const lbl=labeled?`<span class="md-bar-lbl">${labels[j]}</span>`:'';
    const tipAttr=labeled?`data-btip="${_makeTip({date:labels[j],ave:opts.fmt?opts.fmt(v):v,coverage:Math.round(v)})}"`:'';
    return `<div class="md-bar ${opts.cls||''}${j===hi?' hi':''}" style="height:${Math.max(v/max*100,2)}%;animation-delay:${(j*0.04).toFixed(2)}s" ${tipAttr}>${lbl}</div>`;
  }).join('');
  const T=opts.ticks||4;let axis='',grid='';
  for(let k=T;k>=0;k--){const val=max*k/T,pct=(k/T*100).toFixed(2);axis+=`<span class="md-axis-tick" style="bottom:${pct}%">${opts.fmt?opts.fmt(val):Math.round(val)}</span>`;if(k>0)grid+=`<span class="md-gridline" style="bottom:${pct}%"></span>`;}
  return `<div class="md-chart-wrap"><div class="md-axis">${axis}</div><div class="md-chart${labeled?' md-chart--labeled':''}">${grid}${bars}</div></div>`;
}
function toggleFreq(btn){
  const panel=document.getElementById('adp-freq');
  if(!panel)return;
  if(panel.hasAttribute('hidden')){panel.removeAttribute('hidden');btn.textContent='Hide Frequency Distribution';initIcons();}
  else{panel.setAttribute('hidden','');btn.textContent='Show Frequency Distribution';}
}

// Combined Story Value / AVE card — switch which metric's chart is shown
function switchMetric(tab,key){
  const card=tab.closest('.adp-metric');
  if(!card)return;
  card.querySelectorAll('.adp-mtile').forEach(t=>t.classList.toggle('act',t===tab));
  card.querySelectorAll('.adp-metric-pane').forEach(p=>p.toggleAttribute('hidden',p.dataset.m!==key));
}
// ── Article type (Online News vs Cable TV) ──
// Article-type registry — add a type by adding one entry here
const ARTICLE_TYPES={online:{icon:'newspaper',label:'Online News'},tv:{icon:'tv',label:'TV'},blog:{icon:'rss',label:'Blog'},radio:{icon:'radio',label:'Radio'},broadsheet:{icon:'file-text',label:'Broadsheet'},provincial:{icon:'map-pin',label:'Provincial'},tabloid:{icon:'scroll-text',label:'Tabloid'},magazine:{icon:'book-open',label:'Magazine'}};
function articleType(d){return (d&&ARTICLE_TYPES[d.type])?d.type:'online';}
function typeLabel(d){return ARTICLE_TYPES[articleType(d)].label;}
function isPdfPreview(d){return ['broadsheet','provincial','tabloid','magazine'].includes(articleType(d));} // print types share the PDF preview
function isTV(d){return !!(d&&d.type==='tv');}          // TV uses the <video> media element
function isBroadcast(d){return !!(d&&(d.type==='tv'||d.type==='radio'));} // TV + Radio share the player + transcript layout
function typeIcon(d){return ARTICLE_TYPES[articleType(d)].icon;}
// Meta rows for the detail/reader sidebar — broadcast fields for TV, web fields otherwise (p = class prefix 'adp'|'mr')
function renderMetaRows(d,p){
  const mentions=d.chart.reduce((a,b)=>a+b,0);
  const row=(k,v)=>`<div class="${p}-meta-row"><span class="${p}-meta-k">${k}</span><span class="${p}-meta-v">${v}</span></div>`;
  if(isBroadcast(d)){
    return row('Mentions',mentions)+row(d.type==='radio'?'Station':'Network',d.sub)+row('Program',d.program||'—')+row('Segment Type',d.segment||'News')+row('Length',d.length||'—')+row('Est. Reach',d.ave)+row('Aired',`${d.aired||d.date}<br><span style="font-size:11px;font-weight:400;color:var(--muted)">${d.ago}</span>`);
  }
  return row('Mentions',mentions)+row('Publisher',d.sub)+row('Section',d.section)+row('Emphasis','mention')+row('Est. Reach',d.ave)+row('Published',`${d.date}<br><span style="font-size:11px;font-weight:400;color:var(--muted)">${d.ago}</span>`);
}
// Cable TV broadcast card — title + source/date + video player (p = class prefix 'adp'|'mr')
function renderTVCard(d,p){
  const radio=d.type==='radio';
  const poster=d.poster||`https://picsum.photos/seed/${encodeURIComponent(d.outlet+d.sv)}/880/495`;
  const src=d.audioUrl||d.videoUrl||'Video/Tensyon%20sumiklab%20sa%20pagitan.mp4';
  const head=`
    <h1 class="${p}-title">${d.title}</h1>
    <div class="${p}-byline">
      <span class="${p}-pub">${d.sub}</span>
      <span class="${p}-pub-dot"></span>
      <span class="${p}-posted">Aired ${d.aired||d.date}</span>
    </div>
    ${renderArticleActions(d,p)}`;
  if(radio){
    // SoundCloud-style waveform: deterministic bar heights seeded from the title
    const N=140,ti=d.title||d.sub||'';
    let seed=0;for(let i=0;i<ti.length;i++)seed=(seed*31+ti.charCodeAt(i))>>>0;
    let s=seed||1;const rnd=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
    const bars=Array.from({length:N},()=>`<i style="--h:${(0.1+Math.pow(rnd(),0.55)*0.9).toFixed(3)}"></i>`).join('');
    return `${head}
    <div class="tv-player tv-player-radio rw" onclick="tvVideoClick(event)" title="Play / pause">
      <audio class="tv-video" src="${src}" preload="metadata"></audio>
      <div class="rw-head">
        <button class="rw-play" onclick="tvTogglePlay(event)" aria-label="Play / pause"><i data-lucide="play" class="tvi tvi-play"></i><i data-lucide="pause" class="tvi tvi-pause"></i></button>
        <div class="rw-meta"><span class="rw-title">${d.outlet||d.sub}</span></div>
        <div class="rw-right">
          <span class="rw-ago">${d.ago||d.date}</span>
          <div class="rw-tools" onclick="event.stopPropagation()">
            <button class="rw-tool" title="Theater mode" onclick="toggleTheater(event)"><i data-lucide="gallery-horizontal-end"></i></button>
            <button class="rw-tool" title="Full screen" onclick="playerFullscreen(event)"><i data-lucide="maximize"></i></button>
          </div>
        </div>
      </div>
      <div class="rw-wave" onclick="rwSeekClick(event)" onmousemove="rwHover(event)" onmouseleave="rwHoverOut(event)">
        <div class="rw-bars">${bars}</div>
        <div class="rw-bars rw-fill">${bars}</div>
        <div class="rw-scrub"></div>
        <div class="rw-playhead"></div>
        <span class="rw-tip">0:00</span>
        <span class="rw-cur">0:00</span>
        <span class="rw-tot">0:00</span>
      </div>
    </div>`;
  }
  return `${head}
    <div class="tv-player" onclick="tvVideoClick(event)" title="Play clip">
      <video class="tv-video" src="${src}" poster="${poster}" preload="metadata" playsinline></video>
      <span class="tv-net">${(d.outlet||d.sub).toUpperCase()}</span>
      <button class="tv-play" aria-label="Play"><i data-lucide="play"></i></button>
      <div class="tv-bar" onclick="event.stopPropagation()">
        <button class="tv-cbtn tv-toggle" title="Play / Pause" onclick="tvTogglePlay(event)"><i data-lucide="play" class="tvi tvi-play"></i><i data-lucide="pause" class="tvi tvi-pause"></i></button>
        <input class="tv-seek" type="range" min="0" max="100" value="0" step="0.1" oninput="tvSeek(this)" aria-label="Seek">
        <span class="tv-time">0:00 / 0:00</span>
        <button class="tv-cbtn tv-mute" title="Mute" onclick="tvMute(event)"><i data-lucide="volume-2" class="tvi tvi-on"></i><i data-lucide="volume-x" class="tvi tvi-off"></i></button>
        <button class="tv-cbtn" title="Theater mode" onclick="toggleTheater(event)"><i data-lucide="gallery-horizontal-end"></i></button>
        <button class="tv-cbtn" title="Full screen" onclick="playerFullscreen(event)"><i data-lucide="maximize"></i></button>
      </div>
    </div>`;
}
// Cable TV transcript section — toolbar (search/size/copy/download) + paragraphs + AI disclaimer
function renderTVTranscript(d){
  return `
    <div class="tv-transcript">
      <div class="tv-trans-toolbar">
        <div class="tv-trans-hd"><i data-lucide="captions"></i> Broadcast transcript</div>
        <div class="tv-trans-tools">
          <div class="tv-trans-search">
            <i data-lucide="search"></i>
            <input type="text" placeholder="Search transcript…" oninput="tvTranscriptSearch(this)" aria-label="Search transcript">
            <span class="tv-trans-count"></span>
          </div>
          <button class="tv-tbtn" title="Text size" onclick="tvTextSize(this)"><i data-lucide="type"></i></button>
          <button class="tv-tbtn" title="Copy transcript" onclick="tvTranscriptCopy(this)"><i data-lucide="copy"></i></button>
          <button class="tv-tbtn" title="Download transcript (.txt)" data-title="${(d.title||'transcript').replace(/"/g,'')}" onclick="tvTranscriptDownload(this)"><i data-lucide="download"></i></button>
        </div>
      </div>
      <div class="tv-trans-body">
        ${(d.transcript||'Transcript not available for this segment.').split('\n').map(t=>`<p>${t}</p>`).join('')}
      </div>
    </div>
    <div class="tv-disclaimer">Note: Transcript generated by an AI speech-to-text system and may contain inaccuracies. Verify significant details independently.</div>`;
}
// Transcript toolbar actions
function tvTransBody(el){const w=el.closest('.tv-transcript');return w&&w.querySelector('.tv-trans-body');}
function tvTransText(body){return Array.from(body.querySelectorAll('p')).map(p=>p.textContent).join('\n\n');}
function tvEsc(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function tvTranscriptSearch(input){
  const body=tvTransBody(input);if(!body)return;
  const q=input.value.trim();let count=0;
  const re=q?new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'):null;
  body.querySelectorAll('p').forEach(p=>{
    const text=p.textContent;
    p.innerHTML=re?tvEsc(text).replace(re,m=>{count++;return '<mark>'+m+'</mark>';}):tvEsc(text);
  });
  const c=input.parentElement.querySelector('.tv-trans-count');
  if(c)c.textContent=q?(count+' match'+(count!==1?'es':'')):'';
}
function tvTranscriptCopy(btn){
  const body=tvTransBody(btn);if(!body)return;
  const text=tvTransText(body);
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>showTrackerToast('Transcript copied to clipboard')).catch(()=>showTrackerToast('Copy failed'));
}
function tvTranscriptDownload(btn){
  const body=tvTransBody(btn);if(!body)return;
  const text=tvTransText(body);
  const name=((btn.dataset.title||'transcript').replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,60)||'transcript')+'.txt';
  const a=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  showTrackerToast('Transcript downloaded');
}
function tvTextSize(btn){
  const body=tvTransBody(btn);if(!body)return;
  const sizes=['','tv-size-lg','tv-size-sm'];
  body.classList.remove('tv-size-lg','tv-size-sm');
  const i=((parseInt(body.dataset.size||'0',10))+1)%sizes.length;
  body.dataset.size=i;if(sizes[i])body.classList.add(sizes[i]);
}
// Custom video controls (play/pause, seek, time, mute, theater, full screen)
function tvFmt(s){s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function tvVideoClick(e){const v=e.currentTarget.querySelector('.tv-video');if(!v)return;if(v.paused)v.play().catch(()=>{});else v.pause();}
function tvTogglePlay(e){e.stopPropagation();const v=e.currentTarget.closest('.tv-player').querySelector('.tv-video');if(!v)return;if(v.paused)v.play().catch(()=>{});else v.pause();}
function tvMute(e){e.stopPropagation();const v=e.currentTarget.closest('.tv-player').querySelector('.tv-video');if(v)v.muted=!v.muted;}
function tvSeek(input){const v=input.closest('.tv-player').querySelector('.tv-video');if(v&&v.duration)v.currentTime=(input.value/100)*v.duration;}
function rwSeekClick(e){e.stopPropagation();const wave=e.currentTarget,v=wave.closest('.tv-player').querySelector('.tv-video');if(!v||!v.duration)return;const r=wave.getBoundingClientRect();v.currentTime=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))*v.duration;}
function rwHover(e){const wave=e.currentTarget,v=wave.closest('.tv-player').querySelector('.tv-video'),r=wave.getBoundingClientRect(),x=Math.min(r.width,Math.max(0,e.clientX-r.left)),frac=r.width?x/r.width:0;wave.style.setProperty('--hx',x+'px');wave.classList.add('rw-hovering');const tip=wave.querySelector('.rw-tip');if(tip)tip.textContent=(v&&v.duration)?tvFmt(frac*v.duration):'0:00';}
function rwHoverOut(e){e.currentTarget.classList.remove('rw-hovering');}
// Bind each player's video to its bar (idempotent — safe to call after every render)
// Smooth word-karaoke driven by requestAnimationFrame (timeupdate is too coarse at ~4fps)
let tvCapRAF=0;
function stopCap(){if(tvCapRAF){cancelAnimationFrame(tvCapRAF);tvCapRAF=0;}}
function startCap(v){stopCap();const tick=()=>{if(v.paused||v.ended){tvCapRAF=0;return;}capTick(v);tvCapRAF=requestAnimationFrame(tick);};tvCapRAF=requestAnimationFrame(tick);}
function capTick(v){
  const tb=document.querySelector('.tv-trans-body');
  if(!tb||!tb.classList.contains('captions-on')||!v.duration)return;
  const ps=tb.querySelectorAll('p');if(!ps.length)return;
  const N=ps.length,prog=v.currentTime/v.duration;
  const idx=Math.min(N-1,Math.floor(prog*N));
  if(String(idx)!==v.dataset.capIdx){
    const prev=tb.querySelector('p.tv-cap-active');
    if(prev){prev.classList.remove('tv-cap-active');if(prev.dataset.txt!==undefined){prev.textContent=prev.dataset.txt;delete prev.dataset.txt;}}
    v.dataset.capIdx=idx;v.dataset.capWord='-1';
    const cp=ps[idx];cp.classList.add('tv-cap-active');
    if(cp.dataset.txt===undefined){
      cp.dataset.txt=cp.textContent;
      const lens=[];
      cp.innerHTML=cp.textContent.split(/(\s+)/).map(t=>{if(/^\s+$/.test(t))return t;lens.push(t.length);return `<span class="tv-w">${tvEsc(t)}</span>`;}).join('');
      const total=lens.reduce((a,b)=>a+b,0)||1;let acc=0;
      cp._ends=lens.map(l=>{acc+=l;return acc/total;});   // word duration ∝ length (natural cadence)
    }
    cp.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  const cp=ps[idx],words=cp.querySelectorAll('.tv-w');
  if(words.length){
    const within=Math.max(0,Math.min(0.9999,(prog-idx/N)*N));
    const ends=cp._ends||[];
    let widx=ends.findIndex(e=>within<e);if(widx<0)widx=words.length-1;
    if(String(widx)!==v.dataset.capWord){
      v.dataset.capWord=widx;
      words.forEach((w,i)=>{w.classList.toggle('tv-w-done',i<widx);w.classList.toggle('tv-w-now',i===widx);});
    }
  }
}
function tvWire(){
  document.querySelectorAll('.tv-video').forEach(function(v){
    if(v.dataset.wired)return; v.dataset.wired='1';
    const player=v.closest('.tv-player');
    const seek=player.querySelector('.tv-seek'),time=player.querySelector('.tv-time');
    const rwWave=player.querySelector('.rw-wave'),rwCur=player.querySelector('.rw-cur'),rwTot=player.querySelector('.rw-tot');
    const tbody=()=>document.querySelector('.tv-trans-body');
    v.addEventListener('play',()=>{player.classList.add('playing','vp-playing');const tb=tbody();if(tb)tb.classList.add('captions-on');startCap(v);});
    v.addEventListener('pause',()=>{player.classList.remove('vp-playing');const tb=tbody();if(tb)tb.classList.remove('captions-on');stopCap();});
    v.addEventListener('ended',()=>{stopCap();const tb=tbody();if(tb){tb.classList.remove('captions-on');tb.querySelectorAll('p.tv-cap-active').forEach(p=>{p.classList.remove('tv-cap-active');if(p.dataset.txt!==undefined){p.textContent=p.dataset.txt;delete p.dataset.txt;}});}v.dataset.capIdx='';v.dataset.capWord='';});
    v.addEventListener('volumechange',()=>player.classList.toggle('muted',v.muted||v.volume===0));
    v.addEventListener('loadedmetadata',()=>{if(time)time.textContent='0:00 / '+tvFmt(v.duration);if(rwTot)rwTot.textContent=tvFmt(v.duration);});
    v.addEventListener('timeupdate',()=>{
      if(seek&&v.duration)seek.value=(v.currentTime/v.duration)*100;
      if(time)time.textContent=tvFmt(v.currentTime)+' / '+tvFmt(v.duration||0);
      if(v.duration){const pc=(v.currentTime/v.duration)*100;if(rwWave)rwWave.style.setProperty('--rwp',pc+'%');if(rwCur)rwCur.textContent=tvFmt(v.currentTime);}
    });
  });
}
// Theater mode — expand video + transcript across both columns, hide the list + side cards
function toggleTheater(e){
  if(e)e.stopPropagation();
  const page=document.getElementById('page-mentions');
  if(page)page.classList.toggle('theater');
}
// Native full screen on the mock player element
function playerFullscreen(e){
  if(e)e.stopPropagation();
  const player=e&&e.currentTarget?e.currentTarget.closest('.tv-player'):document.querySelector('.tv-player');
  if(!player)return;
  if(document.fullscreenElement)document.exitFullscreen();
  else if(player.requestFullscreen)player.requestFullscreen();
}
// Esc leaves theater (when not in native fullscreen, which Esc handles itself)
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&!document.fullscreenElement){
    const em=document.getElementById('ent-modal');
    if(em&&em.classList.contains('open')){closeEntities();return;}
    const lb=document.getElementById('bs-lightbox');
    if(lb&&lb.classList.contains('open')){closeBroadsheet();return;}
    const page=document.getElementById('page-mentions');
    if(page&&page.classList.contains('theater'))page.classList.remove('theater');
  }
});
// ── Add any previewed article to the Activity Tracker (works from every preview / media type) ──
function _aveNum(d){
  if(typeof d.value==='number')return d.value;
  const m=/([0-9.]+)\s*([KM])?/i.exec(String(d.ave||d.value||'0').replace(/,/g,''));
  if(!m)return 0;let n=parseFloat(m[1])||0;const u=(m[2]||'').toUpperCase();
  if(u==='K')n*=1000;else if(u==='M')n*=1000000;return Math.round(n);
}
function _atArtMedia(d){return d.media||({tv:'TV',radio:'Radio',print:'Print'}[d.type]||'Online');}
function articleInActs(title){return acts.filter(a=>a.matches.some(m=>m.title===title));}
function _atArtBtn(d){
  const dl=s=>String(s==null?'':s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const n=articleInActs(d.title).length;
  const lbl=n?`<i data-lucide="folder-check"></i> In Tracker · ${n}`:`<i data-lucide="folder-plus"></i> Add to Tracker`;
  return `<button class="qa-btn qa-track${n?' qa-track-in':''}" onclick="openTrackArtMenu(this,event)" data-at-title="${dl(d.title)}" data-at-value="${_aveNum(d)}" data-at-media="${dl(_atArtMedia(d))}" data-at-source="${dl(d.sub||d.outlet||'')}" data-at-date="${dl(d.date||'')}">${lbl}</button>`;
}
let _trackArtCur=null,_trackArtBtn=null,_trackArtQuery='';
function _atEsc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function _trackBodyHTML(){
  const q=(_trackArtQuery||'').trim(),ql=q.toLowerCase();
  const filtered=acts.filter(a=>!ql||a.title.toLowerCase().includes(ql));
  const rows=filtered.map(a=>{const inIt=a.matches.some(m=>m.title===_trackArtCur.title);return `<div class="at-track-row${inIt?' on':''}">
      <button class="at-track-item at-track-toggle" title="${_atEsc(a.title)}" onclick="atTrackToggle(${a.id})"><i data-lucide="${inIt?'check':'plus'}"></i><span>${_atEsc(a.title)}</span></button>
      ${inIt?`<button class="at-track-open" title="Open in Activity Tracker" onclick="atTrackOpen(${a.id})"><i data-lucide="arrow-up-right"></i></button>`:''}
    </div>`;}).join('')||`<div class="at-track-empty">No matching activities</div>`;
  const newRow=`<button class="at-track-item at-track-new" onclick="atTrackNew()"><i data-lucide="folder-plus"></i><span>${q?'Create “'+_atEsc(q)+'”':'New activity from this article'}</span></button>`;
  return `<div class="at-track-list">${rows}</div>${newRow}`;
}
function _renderTrackBody(){const el=document.getElementById('at-track-body');if(!el)return;el.innerHTML=_trackBodyHTML();initIcons();}
function _trackMenuSearch(v){_trackArtQuery=v;_renderTrackBody();}
function openTrackArtMenu(btn,e){
  if(e)e.stopPropagation();
  closeTrackArtMenu();
  _trackArtCur={title:btn.dataset.atTitle,value:+btn.dataset.atValue||0,media:btn.dataset.atMedia,source:btn.dataset.atSource,date:btn.dataset.atDate};
  _trackArtBtn=btn;_trackArtQuery='';
  const menu=document.createElement('div');menu.className='at-track-menu';menu.id='at-track-menu';
  menu.innerHTML=`<div class="at-track-menu-hd">Add to activity</div>
    <div class="at-track-search"><i data-lucide="search"></i><input id="at-track-q" type="text" autocomplete="off" placeholder="Search or name an activity…" oninput="_trackMenuSearch(this.value)"></div>
    <div id="at-track-body">${_trackBodyHTML()}</div>`;
  document.body.appendChild(menu);
  const r=btn.getBoundingClientRect();
  menu.style.top=(r.bottom+6)+'px';
  menu.style.left=Math.max(8,Math.min(r.left,window.innerWidth-menu.offsetWidth-8))+'px';
  initIcons();
  setTimeout(()=>{document.addEventListener('mousedown',_atMenuOutside);const q=document.getElementById('at-track-q');if(q)q.focus();},0);
}
function _atMenuOutside(e){const m=document.getElementById('at-track-menu');if(m&&!m.contains(e.target))closeTrackArtMenu();}
function closeTrackArtMenu(){const m=document.getElementById('at-track-menu');if(m)m.remove();document.removeEventListener('mousedown',_atMenuOutside);}
function _atUpdateBtn(){
  if(!_trackArtBtn||!_trackArtCur)return;
  const n=articleInActs(_trackArtCur.title).length;
  _trackArtBtn.innerHTML=n?`<i data-lucide="folder-check"></i> In Tracker · ${n}`:`<i data-lucide="folder-plus"></i> Add to Tracker`;
  _trackArtBtn.classList.toggle('qa-track-in',n>0);
  initIcons();
}
// Toggle the article's membership in an activity (add ⇄ remove) — the picker stays open for multi-assignment
function atTrackToggle(aid){
  const art=_trackArtCur;if(!art)return;
  const a=acts.find(x=>x.id===aid);if(!a)return;
  if(a.matches.some(m=>m.title===art.title)){
    a.matches=a.matches.filter(m=>m.title!==art.title);
    if(typeof renderDetailOnly==='function')renderDetailOnly();
    if(typeof showSimpleToast==='function')showSimpleToast(`Removed from <strong style="font-weight:600">${_atEsc(a.title)}</strong>`,'circle-minus');
  }else{
    addMan(aid,art.title,art.value,art.media,art.source,art.date);
  }
  const nb=document.getElementById('nb-tracker');if(nb)nb.textContent=acts.length;
  _renderTrackBody();
  _atUpdateBtn();
}
function atTrackOpen(aid){viewArtInTracker(aid);}
function atTrackNew(){
  const art=_trackArtCur;if(!art)return;
  closeTrackArtMenu();
  const prefill=(_trackArtQuery||'').trim();
  const types=['Press Release','Event','Crisis','Trending','Product'];
  let ov=document.getElementById('at-newact-overlay');if(ov)ov.remove();
  ov=document.createElement('div');ov.className='at-newact-overlay';ov.id='at-newact-overlay';
  ov.onclick=e=>{if(e.target===ov)closeNewAct();};
  ov.innerHTML=`<div class="at-newact-modal">
    <div class="na-modal-hd">
      <div><div class="na-modal-title">New activity</div><div class="na-modal-sub">Add details about your activity, then add this article to it.</div></div>
      <button class="na-x" onclick="closeNewAct()" title="Close"><i data-lucide="x"></i></button>
    </div>
    <div class="na-form">
      <div class="na-field na-col2"><label class="form-label">Title <span style="color:var(--s-coral)">*</span></label><input class="form-input" type="text" id="na-title" placeholder="e.g. DITO 5G Launch Press Release" value="${_atEsc(prefill)}"></div>
      <div class="na-field"><label class="form-label">Type <span style="color:var(--s-coral)">*</span></label>
        <div class="at-type-dd ft-dd">
          <div class="form-select ft-trigger" id="na-ft-trigger" onclick="naFtToggle(event)"><span id="na-ft-label" class="ft-ph">Select type...</span></div>
          <div class="at-type-menu ft-menu" id="na-ft-menu">${types.map(t=>`<div class="at-type-opt" onclick="naFtPick('${t}')"><span>${t}</span></div>`).join('')}</div>
          <input type="hidden" id="na-type" value="">
        </div>
      </div>
      <div class="na-field"><label class="form-label">Date released</label><input class="form-input" type="date" id="na-date" value="${new Date().toISOString().split('T')[0]}"></div>
      <div class="na-field na-col2"><label class="form-label">Content <span style="color:var(--s-coral)">*</span></label><textarea class="form-textarea" id="na-content" placeholder="Paste your press release or activity summary here..." style="min-height:150px"></textarea></div>
    </div>
    <div class="na-foot">
      <span class="na-scan-note"><i data-lucide="paperclip"></i> “${_atEsc(art.title)}” will be added to this activity</span>
      <div class="na-foot-btns">
        <button class="btn-ghost" onclick="closeNewAct()"><i data-lucide="x" style="width:12px;height:12px"></i> Cancel</button>
        <button class="at-btn-scan" onclick="atCreateActivity()"><i data-lucide="folder-plus" style="width:14px;height:14px"></i> Create new activity</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.classList.add('open'));
  initIcons();
  setTimeout(()=>document.getElementById('na-title')?.focus(),80);
}
function closeNewAct(){const ov=document.getElementById('at-newact-overlay');if(!ov)return;ov.classList.remove('open');setTimeout(()=>ov.remove(),180);}
function naFtToggle(e){e.stopPropagation();const m=document.getElementById('na-ft-menu');if(m)m.classList.toggle('open');}
function naFtPick(val){const inp=document.getElementById('na-type');if(inp)inp.value=val;const lbl=document.getElementById('na-ft-label');if(lbl){lbl.textContent=val;lbl.classList.remove('ft-ph');}document.querySelectorAll('#na-ft-menu .at-type-opt').forEach(o=>o.classList.toggle('active',o.textContent.trim()===val));document.getElementById('na-ft-trigger')?.classList.remove('ft-error');document.getElementById('na-ft-menu')?.classList.remove('open');}
function atCreateActivity(){
  const art=_trackArtCur;if(!art)return;
  const title=(document.getElementById('na-title')?.value||'').trim();
  const type=document.getElementById('na-type')?.value||'';
  const dateISO=document.getElementById('na-date')?.value||'';
  const content=(document.getElementById('na-content')?.value||'').trim();
  const mark=(id,on)=>{const el=document.getElementById(id);if(el)el.classList.toggle('ft-error',on);};
  mark('na-title',!title);mark('na-ft-trigger',!type);mark('na-content',!content);
  if(!title||!type||!content)return;
  const na={id:atNid++,title,type,date:dateISO||art.date||'',content,matches:[{id:'man'+(atNid*7919),media:art.media,source:art.source,title:art.title,date:art.date,value:art.value,score:null,manual:true}]};
  acts.unshift(na);
  const nb=document.getElementById('nb-tracker');if(nb)nb.textContent=acts.length;
  if(typeof showSimpleToast==='function')showSimpleToast(`New activity <strong style="font-weight:600">${_atEsc(title)}</strong> created`,'circle-check');
  _atUpdateBtn();
  closeNewAct();
}
function viewArtInTracker(aid,e){
  if(e)e.stopPropagation();
  closeTrackArtMenu();
  if(window.goPage)goPage('tracker');
  trackerSel=aid;if(!trackerTabs[aid])trackerTabs[aid]='matches';
  if(typeof renderTracker==='function')renderTracker();
  if(typeof renderDetailOnly==='function')renderDetailOnly();
  setTimeout(()=>{const c=document.querySelector('.activity-card[data-id="'+aid+'"]');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},120);
}
// Quick share/download actions for a content preview (Email + PDF for all; + media download for TV/Radio)
function renderArticleActions(d,p){
  const src=d.videoUrl||d.audioUrl||'Video/Tensyon%20sumiklab%20sa%20pagitan.mp4';
  let extra='';
  if(d.type==='tv')extra=`<button class="qa-btn" onclick="qaDownload('${src}',event)"><i data-lucide="video"></i> Download Video</button>`;
  else if(d.type==='radio')extra=`<button class="qa-btn" onclick="qaDownload('${src}',event)"><i data-lucide="headphones"></i> Download Audio</button>`;
  else if(isPdfPreview(d))extra=`<button class="qa-btn" onclick="openBroadsheet('${d.fullImage||'image/2.png'}')"><i data-lucide="book-open"></i> Preview full broadsheet</button>`;
  // Online news: "Read Full Article" sits beside Export as PDF (moved up from the article body)
  const read=(!isPdfPreview(d)&&!isBroadcast(d))
    ?(p==='mr'
      ?`<button class="qa-btn mr-read"><i data-lucide="book-open"></i> Read Full Article</button>`
      :`<button class="qa-btn" onclick="setMdMode('reader')"><i data-lucide="book-open"></i> Read Full Article</button>`)
    :'';
  return `<div class="qa-row">
    <button class="qa-btn" onclick="qaEmail(event)"><i data-lucide="mail"></i> Send via Email</button>
    <button class="qa-btn" onclick="qaPdf(event)"><i data-lucide="file-down"></i> Export as PDF</button>
    ${read}
    ${extra}
    ${_atArtBtn(d)}
  </div>`;
}
function qaEmail(e){if(e)e.stopPropagation();showTrackerToast('Article sent via email');}
function qaPdf(e){if(e)e.stopPropagation();showTrackerToast('Exported as PDF');}
function qaDownload(src,e){if(e)e.stopPropagation();const a=document.createElement('a');a.href=src;a.download='';document.body.appendChild(a);a.click();a.remove();showTrackerToast('Download started');}
// Article body — Cable TV shows player + transcript together (used by reader); Online shows hero image + excerpt (p = class prefix 'adp'|'mr')
function renderArticleBody(d,p){
  if(isBroadcast(d)){
    return renderTVCard(d,p)+renderTVTranscript(d);
  }
  if(isPdfPreview(d)){
    const pdf=d.pdfUrl||'PDF/cl15.pdf';
    return `
      <h1 class="${p}-title">${d.title}</h1>
      <div class="${p}-byline">
        <span class="${p}-pub">${d.sub}</span>
        <span class="${p}-pub-dot"></span>
        <span class="${p}-posted">Published ${d.date}${d.page?' · Page '+d.page:''}</span>
      </div>
      ${renderArticleActions(d,p)}
      <div class="bs-pdf"><iframe src="${pdf}#view=Fit" title="${d.title}" loading="lazy"></iframe></div>`;
  }
  const excerpt=`This article from ${d.sub} covers "${d.title}". ${d.sub} reports on the developments around the story, its key players, and the wider market impact. Coverage continues across online, print and broadcast outlets as the narrative develops. Read the full piece at the source for complete context, quotes and figures…`;
  return `
    <h1 class="${p}-title">${d.title}</h1>
    <div class="${p}-byline">
      <span class="${p}-pub">${d.sub}</span>
      <span class="${p}-pub-dot"></span>
      <span class="${p}-posted">Posted on ${d.date}</span>
    </div>
    ${renderArticleActions(d,p)}
    <div class="${p}-hero">
      <img class="${p}-hero-img" src="https://picsum.photos/seed/${encodeURIComponent(d.outlet+d.sv)}/880/495" alt="">
      <span class="${p==='adp'?'adp-hero-credit':'mr-credit'}">${d.outlet.toUpperCase()}</span>
    </div>
    <p class="${p}-excerpt">${excerpt}</p>`;
}
// Full-broadsheet lightbox
function openBroadsheet(src){
  const lb=document.getElementById('bs-lightbox');if(!lb)return;
  const img=document.getElementById('bs-lb-img');if(img)img.src=src;
  lb.classList.add('open');
}
function closeBroadsheet(){
  const lb=document.getElementById('bs-lightbox');if(!lb)return;
  lb.classList.remove('open');
  const img=document.getElementById('bs-lb-img');if(img)img.src='';
}
// Reader (panes split out so article switches update without re-rendering the list)
function renderReaderSide(d){
  // Col 1 — metadata + author
  const kw=d.keywords.map(([t,n])=>`<span class="md-kw-pill">${t} - ${n}</span>`).join('');
  const entities=renderEntities(d);
  document.getElementById('mr-col-meta').innerHTML=`
    <div class="mr-card">
      <div class="mr-sv-row">
        <div><div class="mr-sv-lbl">Story Value</div><div class="mr-sv-num">${d.sv}</div></div>
        <div><div class="mr-sv-lbl">AVE</div><div class="mr-sv-num ave">${d.ave}</div></div>
      </div>
      <button class="mr-btn-freq">Show Frequency Distribution</button>
    </div>
    <div class="mr-card">
      ${renderMetaRows(d,'mr')}
    </div>
    <div class="mr-card">
      <div class="mr-card-hd">Author(s)</div>
      <div class="md-author-row"><span class="md-author-avatar">${d.author.charAt(0)}</span><span class="md-author-name">${d.author}</span></div>
      ${renderSocialIcons()}
      <div class="md-stats">
        <div><div class="md-stat-lbl">Author Score</div><div class="md-stat-val">${d.authorScore}</div></div>
        <div><div class="md-stat-lbl">Avg SV</div><div class="md-stat-val">${d.avgSv}</div></div>
      </div>
    </div>`;
  document.getElementById('mr-col-analytics').innerHTML=`
    <div class="mr-card">${renderReaderInsights(d)}</div>
    <div class="mr-card">
      <div class="mr-card-hd">Brand Sentiment</div>
      ${mdSelector('brand',d.brand,MD_SENTIMENT_OPTS)}
      <div class="mr-card-hd" style="margin-top:16px">Article Tone</div>
      ${mdSelector('tone',d.tone,MD_TONE_OPTS)}
    </div>
    <div class="mr-card"><div class="mr-card-hd">Keywords</div><div class="md-kw">${kw}</div></div>
    <div class="mr-card"><div class="mr-card-hd">Entities</div>${entities}</div>`;
  return '';
}
// Analytics folded into the reading flow as an "Insights" block (Story Value dedup'd to the meta sidebar)
function renderReaderInsights(d){
  return `
    <div class="mr-insights-hd">Insights</div>
    <div class="md-sec-lbl">Story Value · coverage volume <i data-lucide="info"></i></div>
    ${mdChartBlock(d)}
    <div class="md-sv-cap">Last ${d.chart.length} days</div>`;
}
function renderReaderMain(d){
  return `
    <div class="mr-col-article-inner">
      ${renderArticleBody(d,'mr')}
    </div>`;
}
// Reader header controls live in the app header (beside the avatar) while reader is open
function renderReaderHeaderCtrls(){
  return `
    ${renderModeToggle()}
    <button class="md-nav" onclick="mdNav(-1)" title="Previous (↑)" ${mdActive<=0?'disabled':''}><i data-lucide="chevron-up"></i></button>
    <button class="md-nav" onclick="mdNav(1)" title="Next (↓)" ${mdActive>=mentionData.length-1?'disabled':''}><i data-lucide="chevron-down"></i></button>
    <button class="ah-return-btn" onclick="returnToFeed()"><i data-lucide="arrow-left"></i> Return to Mentions Feed</button>`;
}
// Reader = compact list + 3-column stage (meta | analytics | article); controls render in the app header
function renderReader(d){
  return `
    <div class="mr-cols">
      <div class="md-list" id="mr-list">${renderMentionList()}</div>
      <div class="mr-stage">
        <div class="mr-panel-left">
          <div class="mr-col-meta" id="mr-col-meta"></div>
          <div class="mr-col-analytics" id="mr-col-analytics"></div>
        </div>
        <div class="mr-col-article" id="mr-main">${renderReaderMain(d)}</div>
      </div>
    </div>`;
}
// Render whichever view matches the active mode (clearing the other to avoid duplicate md-li IDs)
function renderMentionView(){
  const ahc=document.getElementById('ah-reader-ctrls');
  if(mdMode==='reader'){
    document.getElementById('mention-list').innerHTML='';
    document.getElementById('mention-panel').innerHTML='';
    const d=mentionData[mdActive];
    document.getElementById('mention-reader').innerHTML=renderReader(d);
    renderReaderSide(d);
    if(ahc){ahc.innerHTML=renderReaderHeaderCtrls();ahc.style.display='flex';}
  }else{
    document.getElementById('mention-reader').innerHTML='';
    document.getElementById('mention-list').innerHTML=renderMentionList();
    document.getElementById('mention-panel').innerHTML=renderMention(mentionData[mdActive]);
    if(ahc){ahc.innerHTML='';ahc.style.display='none';}
  }
  initIcons();
}
function renderMention(d){
  const rawMax=Math.max(...d.chart,1);
  const hi=d.chart.indexOf(rawMax);
  const step=2;
  const axisMax=Math.max(Math.ceil(rawMax/step)*step,step);
  const _labels=chartDayLabels(d,'day');
  const _avePerDay=buildAvePerDay(d);
  const bars=d.chart.map((v,j)=>{
    const tid=_makeTip({date:_labels[j],coverage:v,sv:d.sv,ave:fmtAve(_avePerDay[j])});
    return `<div class="md-bar${j===hi?' hi':''}" style="height:${Math.max(v/axisMax*100,2)}%;animation-delay:${(j*0.04).toFixed(2)}s" data-btip="${tid}"><span class="md-bar-lbl">${_labels[j]}</span></div>`;
  }).join('');
  let axis='',grid='';
  for(let t=axisMax;t>=0;t-=step){
    const pct=(t/axisMax*100).toFixed(2);
    axis+=`<span class="md-axis-tick" style="bottom:${pct}%">${t}</span>`;
    if(t>0)grid+=`<span class="md-gridline" style="bottom:${pct}%"></span>`;
  }
  const kw=d.keywords.map(([t,n])=>`<span class="md-kw-pill">${t} - ${n}</span>`).join('');
  const entities=renderEntities(d);
  return `
    <div class="md-head">
      <button class="md-nav md-list-toggle" onclick="toggleMdList()" title="Show list"><i data-lucide="menu"></i></button>
      <div class="md-head-main">
        <div class="md-title">${d.title}</div>
        <div class="md-meta" style="margin-top:6px;margin-bottom:0">
          <span>${d.sub}</span><span class="md-dot"></span>
          <span>${d.date}</span>
        </div>
      </div>
      <div class="md-head-actions">
        ${renderModeToggle()}
        <button class="md-nav" onclick="mdNav(-1)" title="Previous (↑)" ${mdActive<=0?'disabled':''}><i data-lucide="chevron-up"></i></button>
        <button class="md-nav" onclick="mdNav(1)" title="Next (↓)" ${mdActive>=mentionData.length-1?'disabled':''}><i data-lucide="chevron-down"></i></button>
        <button class="md-close" onclick="closeMention()" title="Close"><i data-lucide="x"></i></button>
      </div>
    </div>
    <div class="md-actions">
      <button class="md-icon-btn" title="Email"><i data-lucide="mail"></i></button>
      <button class="md-icon-btn" title="Save"><i data-lucide="bookmark"></i></button>
      <button class="md-icon-btn" title="Copy link"><i data-lucide="link"></i></button>
      <button class="md-icon-btn" title="Add"><i data-lucide="plus"></i></button>
      <div class="md-actions-right">
        <button class="md-btn-pdf">Download PDF</button>
        <button class="md-btn-read" onclick="setMdMode('reader')">Read Article</button>
      </div>
    </div>
    <div class="md-sec" style="border-top:none;padding-top:0">
      <div class="md-sec-lbl">Story Value <i data-lucide="info"></i></div>
      <div class="md-sv-num">${d.sv}</div>
      <div class="md-chart-wrap"><div class="md-axis">${axis}</div><div class="md-chart md-chart--labeled">${grid}${bars}</div></div>
      <div class="md-sv-cap">Coverage volume · last ${d.chart.length} days</div>
    </div>
    <div class="md-sec">
      <div class="md-sec-lbl">Brand Sentiment <i data-lucide="info"></i></div>
      ${mdSelector('brand',d.brand,MD_SENTIMENT_OPTS)}
      <div class="md-sec-lbl" style="margin-top:16px">Article Tone <i data-lucide="info"></i></div>
      ${mdSelector('tone',d.tone,MD_TONE_OPTS)}
    </div>
    <div class="md-sec">
      <div class="md-sec-lbl">Author(s)</div>
      <div class="md-author-row">
        <span class="md-author-avatar">${d.author.charAt(0)}</span>
        <span class="md-author-name">${d.author}</span>
      </div>
      ${renderSocialIcons()}
      <div class="md-stats">
        <div><div class="md-stat-lbl">Author Score</div><div class="md-stat-val">${d.authorScore}</div></div>
        <div><div class="md-stat-lbl">Avg SV</div><div class="md-stat-val">${d.avgSv}</div></div>
      </div>
    </div>
    <div class="md-sec md-sec-2col">
      <div>
        <div class="md-sec-lbl">Keywords</div>
        <div class="md-kw">${kw}</div>
      </div>
      <div>
        <div class="md-sec-lbl">Entities <i data-lucide="info"></i></div>
        ${entities}
      </div>
    </div>`;
}

function renderInlineDetail(d){
  const kw=d.keywords.map(([t,n])=>`<span class="md-kw-pill">${t} - ${n}</span>`).join('');
  const entities=renderEntities(d);
  const mentions=d.chart.reduce((a,b)=>a+b,0);
  const fq=buildFreq(d);

  // Left column: empty in normal mode; spotlight panel from a story; activity panel from the tracker
  // Only write the left column when there's a spot/act panel to show; otherwise leave it (Insights preview manages its own rail)
  if(mdSpotCtx||mdActCtx)document.getElementById('adp-col-left').innerHTML=mdSpotCtx?renderSpotPanel(d):renderActPanel();

  // Middle column (30%): all data cards stacked
  document.getElementById('adp-col-mid').innerHTML=`
    ${isBroadcast(d)?`<div class="adp-card adp-tv-card">${renderTVCard(d,'adp')}</div>`:''}
    <div class="adp-card adp-metric">
      <div class="adp-metric-tiles">
        <button class="adp-mtile act" onclick="switchMetric(this,'sv')"><span class="adp-mtile-lbl">Story Value</span><span class="adp-mtile-val">${d.sv}</span></button>
        <button class="adp-mtile" onclick="switchMetric(this,'ave')"><span class="adp-mtile-lbl">AVE</span><span class="adp-mtile-val ave">${d.ave}</span></button>
      </div>
      <div class="adp-metric-pane" data-m="sv">
        <div class="md-sec-lbl">Story Value · coverage volume <i data-lucide="info"></i></div>
        ${mdChartBlock(d,'day')}
        <div class="md-sv-cap">Last ${d.chart.length} days</div>
      </div>
      <div class="adp-metric-pane" data-m="ave" hidden>
        <div class="md-sec-lbl">AVE · distribution <i data-lucide="info"></i></div>
        ${freqChart(buildAvePerDay(d),{cls:'ave',ticks:4,fmt:fmtAve,labels:chartDayLabels(d,'day')})}
        <div class="md-sv-cap">Last ${d.chart.length} days</div>
      </div>
    </div>
    <div class="adp-card-pair">
      <div class="adp-card">
        ${renderMetaRows(d,'adp')}
      </div>
      <div class="adp-card">
        <div class="adp-card-hd">Author(s)</div>
        <div class="md-author-row"><span class="md-author-avatar">${d.author.charAt(0)}</span><span class="md-author-name">${d.author}</span></div>
        ${renderSocialIcons()}
        <div class="md-stats">
          <div><div class="md-stat-lbl">Author Score</div><div class="md-stat-val">${d.authorScore}</div></div>
          <div><div class="md-stat-lbl">Avg SV</div><div class="md-stat-val">${d.avgSv}</div></div>
        </div>
      </div>
    </div>
    <div class="adp-card">
      <div class="adp-sent-grid">
        <div>
          <div class="adp-card-hd">Brand Sentiment</div>
          ${mdSelector('brand',d.brand,MD_SENTIMENT_OPTS)}
        </div>
        <div>
          <div class="adp-card-hd">Article Tone</div>
          ${mdSelector('tone',d.tone,MD_TONE_OPTS)}
        </div>
      </div>
    </div>
    <div class="adp-card-pair-half">
      <div class="adp-card">
        <div class="adp-card-hd">Keywords</div>
        <div class="md-kw">${kw}</div>
      </div>
      <div class="adp-card">
        <div class="adp-card-hd">Entities</div>
        ${entities}
      </div>
    </div>`;

  // Right column (40%): Article content — video + transcript for Cable TV, image + excerpt for Online
  document.getElementById('adp-col-right').innerHTML=`
    <div class="adp-article">
      ${isBroadcast(d)?renderTVTranscript(d):renderArticleBody(d,'adp')}
    </div>`;

  initIcons();
}

function sendAIReport(){
  const to=document.getElementById('rpt-to').value.trim();
  if(!to){document.getElementById('rpt-to').focus();document.getElementById('rpt-to').style.borderColor='#d44';return;}
  document.getElementById('rpt-to').style.borderColor='#ddd';
  closeAIReport();
  showTrackerToast('AI report sent to '+to,null,'rpt');
}

function downloadAIReport(){
  closeAIReport();
  showTrackerToast('Report downloaded as PDF',null,'dl');
}

function showDemo(type,story){
  if(type==='newsletter')showNewsletter(story);
  else showAIReport(story);
}

function doGenerate(){
  const out=document.getElementById('ai-out'),btn=document.getElementById('gen-btn');
  out.classList.add('loading');out.textContent='Analysing coverage patterns for today...';btn.disabled=true;
  setTimeout(()=>{
    out.classList.remove('loading');
    out.textContent="Today's DITO Telecommunity coverage is dominated by two parallel narratives: Manny Jimenez's sharp BIZ BUZZ commentary on PLDT picked up across three Tier 1 outlets within 15 hours, and an independent Opensignal benchmark crowning DITO the country's fastest mobile network. Sentiment is split — the Jimenez story reads neutral but adversarial, while the Opensignal recognition and 5G Visayas expansion deliver clean positive frames worth amplifying. Volume is up 22% versus yesterday on the back of the BIZ BUZZ pickup; the next 24 hours will likely surface follow-up commentary from PLDT and analyst reaction to the Opensignal ranking. Watch the Cebu flagship store opening and the Visayan Electric partnership for regional pickup heading into the weekend.";
    btn.disabled=false;
  },900);
}

function applyAveColor(){
  const card=document.getElementById('ss-1');
  if(!card)return;
  const numEl=card.querySelector('.ss-num');
  if(!numEl)return;   // Shared View: ss-1 is the "top source" card (no numeric value to color)
  const val=parseFloat(numEl.dataset.val)||0;
  const target=parseFloat(card.dataset.target)||1;
  const el=card.querySelector('.ss-val');
  el.classList.remove('grn','red');
  el.classList.add(val>=target?'grn':'red');
}
// Media-type maps + tooltip helper, hoisted above the top-level mentions init below so
// renderArticleList can use them during the early spotlight render (avoids a TDZ ReferenceError).
const ATmc={'TV':'media-tv','Online':'media-online','Print':'media-print','Radio':'media-radio','Social':'media-social'};
const ATicn={'TV':{cls:'type-tv',icon:'tv'},'Online':{cls:'type-online',icon:'newspaper'},'Print':{cls:'type-broadsheet',icon:'file-text'},'Radio':{cls:'type-radio',icon:'radio'},'Social':{cls:'type-blog',icon:'share-2'}};
const _barTips=new Map();
let _barTipId=0;
function _makeTip(data){const id='bt'+(++_barTipId);_barTips.set(id,data);return id;}
// Static tip entries (for markup that can't call _makeTip at build time)
_barTips.set('btip-regen',{label:'Regenerate brief'});
if(document.getElementById('page-mentions')){
  renderTrendRows();
  applyAveColor();
  rerenderList('spot');
}

// Pagination interactivity
document.querySelectorAll('.pgb').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(btn.classList.contains('arrow')) return;
    document.querySelectorAll('.pgb').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
  });
});
// Checkbox toggle
document.querySelectorAll('.tcb').forEach(cb=>{
  cb.addEventListener('click',()=>{
    if(cb.style.background==='rgb(74, 63, 140)'){
      cb.style.background='#fff';
      cb.innerHTML='';
    } else {
      cb.style.background='#181d26';
      cb.style.borderColor='#181d26';
      cb.innerHTML='<i data-lucide="check" style="color:#fff;width:10px;height:10px;display:flex;align-items:center;justify-content:center;height:100%"></i>';
      initIcons();
    }
  });
});
// ── PAGE ROUTING (pages are now separate HTML files sharing this script) ──
let currentPage=document.getElementById('page-tracker')?'tracker'
               :document.getElementById('page-dashboard')?'dashboard'
               :document.getElementById('page-publishers')?'publishers'
               :document.getElementById('page-authors')?'authors'
               :document.getElementById('page-influencers')?'influencers'
               :document.getElementById('page-categories')?'categories':'mentions';
function goPage(page){
  if(currentPage===page)return;
  window.location.href=page+'.html';
}

// ── ACTIVITY TRACKER DATA ──
const TC={
  'Press Release':{cls:'type-pr',icls:'icon-pr',icon:'file-text'},
  'Event':{cls:'type-ev',icls:'icon-ev',icon:'calendar'},
  'Crisis':{cls:'type-cr',icls:'icon-cr',icon:'alert-triangle'},
  'Trending':{cls:'type-tr',icls:'icon-tr',icon:'flame'},
  'Product':{cls:'type-pd',icls:'icon-pd',icon:'box'},
};
const DB=[
  {media:'Online',source:'Manila Times Online',title:'DITO expands 5G footprint in Metro Manila',date:'May 20, 2026',value:312000},
  {media:'Print',source:'Philippine Daily Inquirer',title:'DITO Telecommunity posts record subscriber growth',date:'May 19, 2026',value:520000},
  {media:'TV',source:'ABS-CBN News',title:'DITO eyes Visayas coverage by Q3 2026',date:'May 18, 2026',value:890000},
  {media:'Online',source:'BusinessWorld',title:'DITO partners with Huawei for network upgrade',date:'May 17, 2026',value:195000},
  {media:'Online',source:'Rappler',title:'DITO StreamZone promo draws 2M new users',date:'May 16, 2026',value:245000},
  {media:'TV',source:'CNN Philippines',title:'DITO CME reports Q1 profit surge',date:'May 15, 2026',value:710000},
  {media:'Print',source:'Philippine Star',title:'DITO rated fastest network by Opensignal',date:'May 14, 2026',value:380000},
  {media:'Online',source:'One News PH',title:'DITO launches rural connectivity program',date:'May 13, 2026',value:175000},
  {media:'Social',source:'Facebook / DITO',title:'DITO 5G now live in 50 cities',date:'May 12, 2026',value:45000},
];
let acts=[
  {id:1,title:'DITO 5G Expansion — Visayas Coverage Push',type:'Press Release',date:'2026-05-18',content:'DITO Telecommunity accelerating 5G rollout across Visayas region. Coverage expansion to reach Cebu Iloilo Bacolod by Q3 2026. Partnership with Huawei for network infrastructure upgrade.',matches:[
    {id:'m1',media:'Online',source:'BusinessWorld',title:'Telco war heats up as DITO expands 5G coverage to Visayas',date:'Jun 22, 2026',value:256000,score:0.94,manual:false},
    {id:'m2',media:'Online',source:'SunStar Cebu',title:'DITO Telecommunity opens new flagship store in Cebu City',date:'Jun 21, 2026',value:78000,score:0.87,manual:false},
    {id:'m3',media:'TV',source:'ABS-CBN News',title:'DITO eyes Visayas coverage by Q3 2026',date:'Jun 18, 2026',value:890000,score:0.81,manual:false},
    {id:'m4',media:'Online',source:'Inquirer Online',title:'DITO reigns supreme as the Philippines fastest mobile network',date:'Jun 23, 2026',value:190000,score:0.76,manual:false},
  ]},
  {id:2,title:'Jimenez PLDT Rivalry — Executive Response',type:'Crisis',date:'2026-05-25',content:'Official response to PLDT executive statements on competitive landscape. Jimenez remarks on market positioning drove Tier 1 pickup across major outlets within 24 hours.',matches:[
    {id:'m6',media:'Print',source:'Philippine Daily Inquirer',title:"BIZ BUZZ: Jimenez twits PLDT's foes",date:'May 25, 2026',value:397000,score:0.96,manual:false},
    {id:'m7',media:'Online',source:'Inquirer Plus',title:'BIZ BUZZ: Jimenez twits PLDTs foes Inquirer Plus',date:'May 25, 2026',value:206000,score:0.91,manual:false},
    {id:'m8',media:'Online',source:'Philstar Online',title:"PLDTs 'butcher COO publicly slices telco rivals",date:'May 25, 2026',value:631000,score:0.88,manual:false},
    {id:'m9',media:'TV',source:'ABS-CBN News',title:'Telco war escalates: Jimenez vs. Reyes feud explained',date:'May 25, 2026',value:890000,score:0.83,manual:false},
  ]},
];
acts=wsData('acts',acts);
let atNid=3,trackerSel=null,trackerTabs={},msQ={},msF={},msR={},aiCache={},atTypeFilter='',atSearchFilter='',atAddOpen={},artFilter={},artSort={},artPage={},freshTrack={},scanKwOff={};
let trackerListPage=0;
const TRACKER_PER_PAGE=15;
function gotoTrackerListPage(n){trackerListPage=n;renderTracker();const sc=document.getElementById('at-list-scroll');if(sc)sc.scrollTop=0;}
const ART_PER_PAGE=10;
let atSelectMode=false,atSelected=new Set();
// Merge stories tracked from other pages (persisted in localStorage) into the activity list
(function mergeTrackedExtras(){
  trkLoad().forEach(e=>{
    if(acts.some(a=>a.title===e.title))return;
    acts.unshift({id:atNid++,title:e.title,type:e.type,date:e.date,content:e.content,matches:e.matches||[]});
  });
  const nb=document.getElementById('nb-tracker');
  if(nb)nb.textContent=acts.length;
})();
let matchSel={}; // per-activity selected match IDs: {actId: Set}

function fv(v){return v>=1000000?'PHP '+(v/1000000).toFixed(1)+'M':v>=1000?'PHP '+(v/1000).toFixed(0)+'K':'PHP '+v;}
function fmtActDate(s){if(!s)return'';const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(!m)return s;const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m[2]-1];return`${mo} ${+m[3]}, ${m[1]}`;}
function timeAgo(s){if(!s)return'';const then=new Date(s);if(isNaN(then))return'';const h=Math.round((Date.now()-then)/3600000);if(h<1)return'just now';if(h<24)return h+'h ago';const d=Math.round(h/24);if(d<7)return d+'d ago';return Math.round(d/7)+'w ago';}
function tAve(m){const t=m.reduce((s,x)=>s+x.value,0);return fv(t);}
function scC(s){if(!s)return{b:'#e4e6ea',t:'#9097a3'};if(s>=0.85)return{b:'#41454d',t:'#9097a3'};if(s>=0.7)return{b:'#6b7280',t:'#9097a3'};return{b:'#9097a3',t:'#9097a3'};}

const TBAR={'Press Release':'bar-pr','Event':'bar-ev','Crisis':'bar-cr','Trending':'bar-tr','Product':'bar-pd'};

function toggleAtTypeDD(e){
  e.stopPropagation();
  const menu=document.getElementById('at-type-menu');
  if(menu) menu.classList.toggle('open');
}
document.addEventListener('click',function(){
  const menu=document.getElementById('at-type-menu');
  if(menu) menu.classList.remove('open');
  const sortMenu=document.getElementById('art-sort-menu');
  if(sortMenu) sortMenu.classList.remove('open');
  document.querySelectorAll('.ti-hdr-menu.open').forEach(m=>m.classList.remove('open'));
});

function setAtFilter(k,v){
  if(k==='type'){
    atTypeFilter=v;
    const label=document.getElementById('at-type-label');
    if(label) label.textContent=v||'All Types';
    document.querySelectorAll('.at-type-opt').forEach(o=>{
      const txt=o.querySelector('span')?.textContent||'';
      o.classList.toggle('active', v===''?txt==='All Types':txt===v);
    });
    const menu=document.getElementById('at-type-menu');
    if(menu) menu.classList.remove('open');
  } else {
    atSearchFilter=v;
  }
  trackerListPage=0;
  renderTracker();
}


function renderTracker(){
  document.getElementById('nb-tracker').textContent=acts.length;

  // apply filters
  let visible=acts;
  if(atTypeFilter) visible=visible.filter(a=>a.type===atTypeFilter);
  if(atSearchFilter) visible=visible.filter(a=>a.title.toLowerCase().includes(atSearchFilter.toLowerCase())||a.content.toLowerCase().includes(atSearchFilter.toLowerCase()));

  // Pagination — standardized .ent-list-pager footer (hidden when not needed)
  const totalAt=visible.length;
  const pagesAt=Math.max(1,Math.ceil(totalAt/TRACKER_PER_PAGE));
  trackerListPage=Math.max(0,Math.min(trackerListPage,pagesAt-1));
  const startAt=trackerListPage*TRACKER_PER_PAGE,endAt=Math.min(startAt+TRACKER_PER_PAGE,totalAt);
  const pageVisible=visible.slice(startAt,endAt);
  const pagerEl=document.getElementById('at-list-pager');
  if(pagerEl){
    if(totalAt<=TRACKER_PER_PAGE){pagerEl.style.display='none';}
    else{
      pagerEl.style.display='flex';
      const info=document.getElementById('at-pg-info');if(info)info.textContent=`${startAt+1}–${endAt} of ${totalAt}`;
      const btns=document.getElementById('at-pg-btns');
      if(btns){
        let h=`<button class="pgb arrow" onclick="gotoTrackerListPage(${trackerListPage-1})"${trackerListPage<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
        for(let p=0;p<pagesAt;p++)h+=`<button class="pgb${p===trackerListPage?' on':''}" onclick="gotoTrackerListPage(${p})">${p+1}</button>`;
        h+=`<button class="pgb arrow" onclick="gotoTrackerListPage(${trackerListPage+1})"${trackerListPage>=pagesAt-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
        btns.innerHTML=h;
      }
    }
  }

  const listEl=document.getElementById('at-list-scroll');
  if(!listEl)return;
  if(pageVisible.length===0){
    listEl.innerHTML=`<div style="text-align:center;padding:40px 20px;color:#ccc;font-size:12px"><i data-lucide="search" style="width:20px;height:20px;display:block;margin-bottom:10px"></i>${atTypeFilter||atSearchFilter?'No activities match your filter.':'No activities yet. Click + New activity to get started.'}</div>`;
  } else {
    listEl.innerHTML=pageVisible.map((a,i)=>{
      const tc=TC[a.type]||TC['Press Release'];
      const barCls=TBAR[a.type]||'bar-pr';
      const isChecked=atSelected.has(a.id);
      return`<div class="activity-card${trackerSel===a.id&&!isChecked?' selected':''}${isChecked?' ac-checked':''}" data-id="${a.id}" style="animation-delay:${i*0.05}s" onclick="selAct(${a.id})">
        <div class="ac-type-bar ${barCls}"></div>
        <div class="ac-checkbox${isChecked?' checked':''}" onclick="event.stopPropagation();toggleAtCard(${a.id})">${isChecked?'<i data-lucide="check" style="width:10px;height:10px"></i>':''}</div>
        <div class="ac-icon ${tc.icls}" data-btip="${_makeTip({label:a.type})}"><i data-lucide="${tc.icon}"></i></div>
        <div class="card-acts" onclick="event.stopPropagation()">
          <div class="card-act-btn exp" onclick="downloadActivityCsv(${a.id})" title="Export CSV"><i data-lucide="download" style="width:10px;height:10px"></i></div>
          <div class="card-act-btn edit" onclick="showEdit(${a.id})" title="Edit"><i data-lucide="pencil" style="width:10px;height:10px"></i></div>
          <div class="card-act-btn del" onclick="confirmDelete(${a.id})" title="Delete"><i data-lucide="trash-2" style="width:10px;height:10px"></i></div>
        </div>
        <div class="ac-body">
          <div class="ac-title-text">${a.title}</div>
          <div class="ac-preview">${a.content}</div>
          <div class="ac-meta">
            <span class="ac-stat" style="color:#181d26;font-weight:500"><i data-lucide="link" style="width:10px;height:10px"></i> ${a.matches.length} matches</span>
            <span class="ac-stat" style="color:#16a34a;font-weight:600"><i data-lucide="circle-dollar-sign" style="width:10px;height:10px"></i> ${tAve(a.matches)}</span>
            <span class="ac-date ac-date-end">${fmtActDate(a.date)}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // update count badge
  const countEl=document.getElementById('at-list-count');
  if(countEl) countEl.textContent=visible.length;

  // render detail panel
  const detailEl=document.getElementById('at-detail-panel');
  if(!detailEl)return;
  if(trackerSel){
    detailEl.innerHTML=renderTrackerDetail();
  } else {
    detailEl.innerHTML=`<div class="at-empty-state"><i data-lucide="mouse-pointer-2"></i><p>Select an activity to view matched ${_wPosts()}</p></div>`;
  }
  initIcons();
}

function renderTrackerDetail(){
  const a=acts.find(x=>x.id===trackerSel);if(!a)return'';
  return`<div class="detail-wrap" id="dw">${renderDetailInner(a)}</div>`;
}

// Everything INSIDE the .detail-wrap frame — swapped on its own so the card
// frame stays mounted (no full-card flash) when switching activities.
function renderDetailInner(a){
  const tc=TC[a.type]||TC['Press Release'];
  const aiC=a.matches.filter(m=>!m.manual).length;
  const mnC=a.matches.filter(m=>m.manual).length;
  const total=a.matches.reduce((s,m)=>s+m.value,0);
  const avgScore=a.matches.filter(m=>m.score).length>0
    ?Math.round(a.matches.filter(m=>m.score).reduce((s,m,_,arr)=>s+m.score/arr.length,0)*100)
    :null;

  const aiMatches=a.matches.filter(m=>!m.manual);
  const manMatches=a.matches.filter(m=>m.manual);

  const allMatches=[...aiMatches,...manMatches];

  // coverage snapshot channels
  const channels=[...new Set(a.matches.map(m=>m.media))];
  const channelRows=channels.length>0
    ?channels.map(ch=>{
        const items=a.matches.filter(m=>m.media===ch),ave=items.reduce((s,m)=>s+m.value,0),mc2=ATmc[ch]||'media-online';
        return`<div class="dcov-ch-row">
          <span class="media-badge ${mc2}">${ch}</span>
          <span style="font-size:12.5px;color:#777">${items.length} article${items.length!==1?'s':''}</span>
          <span style="font-size:11px;color:#ddd">·</span>
          <span style="font-size:13px;font-weight:600;color:#276627">${fv(ave)}</span>
        </div>`;
      }).join('')
    :`<div style="font-size:12.5px;color:#ccc">No coverage yet</div>`;

  return`
    <!-- Inline radar overlay (shown during scan) -->
    <div class="detail-radar" id="dr-${a.id}" style="display:none">
      <div class="dr-card">
        <div class="dr-wrap">
          <div class="dr-ring dr-r1"></div>
          <div class="dr-ring dr-r2"></div>
          <div class="dr-ring dr-r3"></div>
          <div class="dr-center"></div>
          <svg width="80" height="80" style="position:absolute;top:0;left:0">
            <defs><radialGradient id="sg" cx="100%" cy="100%" r="100%"><stop offset="0%" stop-color="#181d26" stop-opacity="0.3"/><stop offset="100%" stop-color="#181d26" stop-opacity="0"/></radialGradient></defs>
            <g style="transform-origin:40px 40px;animation:radarSweep 2s linear infinite"><path d="M40,40 L40,0 A40,40,0,0,1,80,40 Z" fill="url(#sg)"/></g>
          </svg>
          <div class="dr-ping" style="top:18px;left:48px;animation-delay:0.3s"></div>
          <div class="dr-ping" style="top:45px;left:22px;animation-delay:1.1s"></div>
          <div class="dr-ping" style="top:28px;left:58px;animation-delay:1.7s"></div>
        </div>
        <div class="dr-counter" id="dr-ctr-${a.id}">0</div>
        <div class="dr-label" id="dr-lbl-${a.id}">Initializing scan...</div>
        <div class="dr-sublabel" id="dr-sub-${a.id}">Preparing similarity engine</div>
        <div class="dr-progress"><div class="dr-bar" id="dr-bar-${a.id}"></div></div>
      </div>
    </div>
    <!-- Header -->
    <div class="detail-head">
      <div class="ac-icon ac-icon--lg ${tc.icls}" style="flex-shrink:0;align-self:flex-start" data-btip="${_makeTip({label:a.type})}"><i data-lucide="${tc.icon}"></i></div>
      <div class="detail-head-body">
        <div class="detail-head-title">${a.title}</div>
        ${(!freshTrack[a.id]&&a.content)?`<div class="detail-head-desc" style="font-size:12.5px;color:var(--muted);line-height:1.45;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;cursor:default" data-btip="${_makeTip({detail:a.content})}">${a.content.length>100?a.content.slice(0,100)+'…':a.content}</div>`:''}
        <div class="detail-head-meta" style="margin-top:6px">
          <span class="dh-date"><i data-lucide="calendar"></i> ${fmtActDate(a.date)}</span>
        </div>
      </div>
      <div class="detail-head-actions">
        <button class="dh-kebab" id="dh-kebab-${a.id}" onclick="toggleDhMenu(event,${a.id})" title="More actions" aria-label="More actions"><i data-lucide="more-horizontal"></i></button>
        <div class="dh-menu" id="dh-menu-${a.id}">
          ${!freshTrack[a.id]?`<div class="dh-menu-item" onclick="dhAction(event,${a.id},'edit')"><i data-lucide="pencil"></i> Edit activity</div>
          <div class="dh-menu-item" onclick="dhAction(event,${a.id},'csv')"><i data-lucide="download"></i> Export</div>
          <div class="dh-menu-sep"></div>`:''}
          <div class="dh-menu-item danger" onclick="dhAction(event,${a.id},'delete')"><i data-lucide="trash-2"></i> Delete activity</div>
        </div>
      </div>
    </div>

    <!-- Coverage snapshot: hidden before scan -->
    ${!freshTrack[a.id]?`<div class="dcoverage">
      <div class="brief-stats at-kpi-strip" id="at-kpi-strip-${a.id}">
        <div class="ss" data-kpi-tip="0" data-kpi-channels="${encodeURIComponent(JSON.stringify(channels.map(ch=>{const items=a.matches.filter(m=>m.media===ch),ave=items.reduce((s,m)=>s+m.value,0);return{ch,ave,count:items.length,cls:ATmc[ch]||'media-online'};})))}">
          <span class="ss-scan-ring"></span>
          <div class="ss-ico ss-ico-2"><i data-lucide="circle-dollar-sign"></i></div>
          <div class="ss-val hero grn">${fv(total)}</div>
          <div class="ss-lbl">total AVE</div>
        </div>
        <div class="ss" data-kpi-tip="1">
          <span class="ss-scan-ring"></span>
          <div class="ss-ico ss-ico-1"><i data-lucide="sparkles"></i></div>
          <div class="ss-val">${aiC}</div>
          <div class="ss-lbl">AI matches</div>
        </div>
        <div class="ss" data-kpi-tip="2">
          <span class="ss-scan-ring"></span>
          <div class="ss-ico ss-ico-3"><i data-lucide="gauge"></i></div>
          <div class="ss-val">${avgScore!==null?avgScore+'%':'—'}</div>
          <div class="ss-lbl">avg similarity</div>
        </div>
        <div class="ss" data-kpi-tip="3">
          <span class="ss-scan-ring"></span>
          <div class="ss-ico ss-ico-4"><i data-lucide="hand"></i></div>
          <div class="ss-val${mnC===0?' muted':''}">${mnC}</div>
          <div class="ss-lbl">manually added</div>
        </div>
      </div>
    </div>`:''}

    <!-- Unified scrollable pane -->
    <div class="dpane">
      <div class="tk-scroll-sentinel"></div>

      <!-- Section header + filter bar: hidden before scan -->
      ${!freshTrack[a.id]?`<div class="dpane-section-hd">
        <span class="dpane-section-hd-label"><i data-lucide="newspaper" style="color:#181d26"></i> Matched ${_wPosts()}</span>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="at-btn-outline" onclick="openAISummary(${a.id})"><i data-lucide="sparkles" style="width:12px;height:12px"></i> AI summary</button>
          <button class="at-btn-outline" onclick="openAddArt(${a.id})"><i data-lucide="plus" style="width:12px;height:12px"></i> Add ${_wPost()}</button>
        </div>
      </div>
      <div class="art-filter-bar">
        <div class="at-type-dd" id="art-sort-dd">
          <div class="fc" onclick="toggleSortDD(event)">
            <span id="art-sort-label">Sort: ${({similarity:'Similarity',ave:'AVE',date:'Date'})[artSort[a.id]||'similarity']}</span>
            <i data-lucide="chevron-down"></i>
          </div>
          <div class="at-type-menu" id="art-sort-menu">
            ${[['similarity','Similarity'],['ave','AVE'],['date','Date']].map(([v,l])=>`<div class="at-type-opt${(artSort[a.id]||'similarity')===v?' active':''}" onclick="setArtSort(${a.id},'${v}')"><span>Sort: ${l}</span></div>`).join('')}
          </div>
        </div>
        <span class="art-count">All coverage — ${a.matches.length} article${a.matches.length!==1?'s':''}</span>
        <div class="art-media-pills" id="art-media-pills">${buildPills(a)}</div>
      </div>`:''}


      <!-- Article list — Shared View: social coverage table (same as mentions); MediaWatch: matched news articles -->
      ${(window.WS_DATA&&window.WS_DATA.socialMentions)
        ?`<div id="al-trk-${a.id}" class="art-list-region">${renderArticleList(window.WS_DATA.socialMentions,'trk-'+a.id)}</div>`
        :`<div id="art-list-region" class="art-list-region">${buildArtList(a)}</div>`}

    </div>
  `;
}

// Media-filter pills (rebuilt in isolation when a filter is toggled)
function buildPills(a){
  return ['All','Print','Online','TV','Radio'].map(x=>{const sel=artFilter[a.id]||[];if(x==='All')return `<span class="art-pill${sel.length===0?' on':''}" onclick="clearArtFilter(${a.id})">All</span>`;const on=sel.includes(x);return `<span class="art-pill${on?' on':''}" onclick="toggleArtFilter(${a.id},'${x}')">${on?'<i data-lucide="check"></i> ':''}${x}</span>`;}).join('');
}

// Article list (filter + sort applied) — extracted so it can be re-rendered alone
function buildArtList(a){
  const mSel=matchSel[a.id]||(matchSel[a.id]=new Set());
  const renderMatchRow=(m,i)=>{
    const mic=ATicn[m.media]||{cls:'type-online',icon:'newspaper'},pct=m.score?Math.round(m.score*100):null;
    const scoreCls=pct>=85?'sc-hi':pct>=70?'sc-mid':'sc-lo';
    const checked=mSel.has(m.id);
    // On add, animate only the new row; otherwise the usual staggered entrance.
    const aStyle=_addAnimNewId?(m.id===_addAnimNewId?'animation-delay:0s':'animation:none'):`animation-delay:${i*0.05}s`;
    return`<tr id="mr-${m.id}" class="match-tbl-row${checked?' match-row-checked':''}" style="${aStyle}">
      <td style="width:32px;text-align:center"><span class="tcb${checked?' tcb-on':''}" onclick="toggleMatchSel(${a.id},'${m.id}')">${checked?'<i data-lucide="check" style="width:9px;height:9px;color:#fff"></i>':''}</span></td>
      <td style="cursor:pointer" onclick="previewMatch(${a.id},'${m.id}')" title="Preview article">
        <div class="hl-cell">
          <span class="hl-icon ${mic.cls}" data-btip="${_makeTip({label:m.media})}"><i data-lucide="${mic.icon}"></i></span>
          <div>
            <div class="match-hl">${m.title}</div>
            ${m.manual?`<span style="font-size:10px;color:#854f0b;background:#faeeda;padding:1px 6px;border-radius:10px;font-weight:500;display:inline-block;margin-top:3px">Manual</span>`:''}
          </div>
        </div>
      </td>
      <td style="width:130px"><div class="pub-name">${m.source}</div><div class="pub-cat">${m.media}</div></td>
      <td style="width:100px"><span class="match-ave">${fv(m.value)}</span></td>
      <td style="width:120px">${pct?`<span class="art-score-val ${scoreCls}">${pct}% match</span><div class="match-score-track" style="margin-top:4px"><div class="match-score-fill" style="width:${pct}%;background:${pct>=85?'#16a34a':pct>=70?'#d97706':'#9ca3af'}"></div></div>`:'—'}</td>
      <td style="width:90px;white-space:nowrap"><div class="date-main">${m.date}</div><div class="date-ago">${timeAgo(m.date)}</div></td>
      <td style="width:36px;text-align:center"><div class="remove-btn" onclick="rmMatch(${a.id},'${m.id}')" title="Remove"><i data-lucide="trash-2" style="width:12px;height:12px"></i></div></td>
    </tr>`;
  };
  const af=artFilter[a.id]||[],as=artSort[a.id]||'similarity';
  let list=a.matches.filter(m=>af.length===0||af.includes(m.media));
  if(as==='ave') list=[...list].sort((a,b)=>b.value-a.value);
  else if(as==='date') list=[...list].sort((a,b)=>new Date(b.date)-new Date(a.date));
  else list=[...list].sort((a,b)=>(b.score||0)-(a.score||0));
  if(list.length===0&&a.matches.length===0&&freshTrack[a.id]){
    const kws=extractKeywords(a.title+' '+a.content);
    const off=scanKwOff[a.id]||new Set();
    const kwHtml=kws.map(k=>`<span class="scan-kw${off.has(k)?' off':''}" onclick="toggleScanKw(${a.id},'${k}')">${k}</span>`).join('');
    return`<div class="ready-banner">
      <div class="rb-icon"><i data-lucide="radio-tower"></i></div>
      <div class="rb-title">Story ready to scan</div>
      <div class="rb-sub">${a.title}</div>
      <div class="rb-from"><i data-lucide="arrow-up" style="width:10px;height:10px"></i> Tracked from Today's spotlight</div>
      <div class="scan-kw-row" style="justify-content:center;margin-bottom:20px">${kwHtml}</div>
      <button class="at-btn-ai" onclick="runScan(${a.id})" style="padding:9px 28px;font-size:13px"><i data-lucide="radio-tower" style="width:14px;height:14px"></i> Scan now</button>
      <button class="at-btn-ghost" onclick="dismissScan(${a.id})" style="font-size:11px;margin-top:8px;border:none;background:transparent;color:#bbb;cursor:pointer;font-family:'Inter',sans-serif">Dismiss</button>
    </div>`;
  }
  if(list.length===0&&a.matches.length===0) return`<div style="padding:28px 0;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px"><i data-lucide="search" style="width:20px;height:20px;color:#ddd"></i><div style="font-size:13px;font-weight:600;color:#aaa">No coverage yet</div><div style="font-size:12px;color:#ccc;margin-bottom:4px">Use "+ Add ${_wPost()}" to search and add coverage manually.</div></div>`;
  if(list.length===0) return`<div style="padding:18px 0;text-align:center;color:#ccc;font-size:12px">No ${_wPosts()} match this filter.</div>`;
  const selCount=mSel.size;
  const allChecked=list.length>0&&list.every(m=>mSel.has(m.id));
  const someChecked=selCount>0&&!allChecked;
  const delBar=selCount>0?`<div class="match-del-bar" id="mdb-${a.id}">
    <span class="match-del-bar-count">${selCount} article${selCount!==1?'s':''} selected</span>
    <div class="match-del-bar-actions">
      <button class="match-del-cancel" onclick="clearMatchSel(${a.id})">Cancel</button>
      <button class="match-del-btn" onclick="confirmMatchBulkDelete(${a.id})"><i data-lucide="trash-2" style="width:10px;height:10px"></i> Delete</button>
    </div>
  </div>`:'';
  // Pagination — slice the list, build a footer that matches mentions.html
  const total=list.length;
  const pages=Math.max(1,Math.ceil(total/ART_PER_PAGE));
  let page=Math.max(0,Math.min(artPage[a.id]||0,pages-1));
  artPage[a.id]=page;
  const start=page*ART_PER_PAGE;
  const end=Math.min(start+ART_PER_PAGE,total);
  const pageList=list.slice(start,end);
  let pager='';
  if(total>ART_PER_PAGE){
    let btns=`<button class="pgb arrow" onclick="goArtPage(${a.id},${page-1})"${page<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
    for(let p=0;p<pages;p++){btns+=`<button class="pgb${p===page?' on':''}" onclick="goArtPage(${a.id},${p})">${p+1}</button>`;}
    btns+=`<button class="pgb arrow" onclick="goArtPage(${a.id},${page+1})"${page>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
    pager=`<div class="tbl-footer"><div class="pg-info">${start+1}–${end} of ${total} results</div><div class="pg-btns">${btns}</div></div>`;
  }
  return`${delBar}<table class="tbl match-tbl"><thead><tr>
    <th style="width:32px;text-align:center"><span class="tcb${allChecked?' tcb-on':''}" style="${someChecked?'background:var(--ink-2);border-color:var(--ink-2)':''}" onclick="toggleMatchSelAll(${a.id})">${allChecked?'<i data-lucide="check" style="width:9px;height:9px;color:#fff"></i>':someChecked?'<i data-lucide="minus" style="width:9px;height:9px;color:#fff"></i>':''}</span></th>
    <th>Headline</th>
    <th style="width:130px">Outlet</th>
    <th style="width:100px">AVE</th>
    <th style="width:120px">Match</th>
    <th style="width:90px;white-space:nowrap">Date</th>
    <th style="width:36px"></th>
  </tr></thead><tbody>${pageList.map((m,i)=>renderMatchRow(m,i)).join('')}</tbody></table>${pager}`;
}
function goArtPage(id,n){
  const a=acts.find(x=>x.id===id);if(!a)return;
  const af=artFilter[id]||[];
  const total=a.matches.filter(m=>af.length===0||af.includes(m.media)).length;
  const pages=Math.max(1,Math.ceil(total/ART_PER_PAGE));
  artPage[id]=Math.max(0,Math.min(n,pages-1));
  renderArtListOnly(id);
  const region=document.getElementById('art-list-region');
  if(region)region.scrollIntoView({block:'nearest',behavior:'smooth'});
}

// Re-render ONLY the article list + pills (smooth — no full-section reload)
function renderArtListOnly(id){
  const a=acts.find(x=>x.id===id);if(!a)return;
  const region=document.getElementById('art-list-region');
  if(!region){renderDetailOnly();return;}
  region.innerHTML=buildArtList(a);
  const pills=document.getElementById('art-media-pills');
  if(pills)pills.innerHTML=buildPills(a);
  initIcons();
}

// ── AI summary slide-over (tracker activity) ──
let _aiCurId=null,_aiSidebarWasCollapsed=false;
function openAISummary(id){
  const a=acts.find(x=>x.id===id);if(!a)return;
  _aiCurId=id;
  const ov=document.getElementById('aireport-overlay');if(!ov)return;
  const sb=document.getElementById('sidebar');
  _aiSidebarWasCollapsed=!!(sb&&sb.classList.contains('collapsed'));
  if(sb)sb.classList.add('collapsed');
  renderAISummary();
  ov.style.display='block';
  requestAnimationFrame(()=>{ov.classList.add('open');document.body.classList.add('aireport-open');});
  initIcons();
}
function closeAISummary(){
  const ov=document.getElementById('aireport-overlay');if(!ov)return;
  ov.classList.remove('open');
  document.body.classList.remove('aireport-open');
  const sb=document.getElementById('sidebar');
  if(sb&&!_aiSidebarWasCollapsed)sb.classList.remove('collapsed');
  setTimeout(()=>{ov.style.display='none';},280);
}
function regenAISummary(){
  if(_aiCurId==null)return;
  delete aiCache[_aiCurId];
  renderAISummary();
}
function renderAISummary(){
  const id=_aiCurId;const a=acts.find(x=>x.id===id);if(!a)return;
  const body=document.getElementById('ai-rpt-body');if(!body)return;
  const regen=document.getElementById('ai-rpt-regen');
  if(aiCache[id]){
    body.innerHTML=buildAIPanel(aiCache[id]);
    if(regen){regen.disabled=false;regen.classList.remove('spin');}
    initIcons();
    return;
  }
  if(regen){regen.disabled=true;regen.classList.add('spin');}
  body.innerHTML=`<div class="ai-report-panel"><div class="ai-report-lbl"><i data-lucide="sparkles" style="width:12px;height:12px"></i> AI summary report</div><div class="ai-report-txt loading">Analysing coverage patterns and writing your summary...</div></div>`;
  initIcons();
  setTimeout(()=>{
    const txt=`Today's coverage of "${a.title}" generated ${a.matches.length} matched articles across ${[...new Set(a.matches.map(m=>m.media))].join(', ')} with a combined AVE of ${tAve(a.matches)}.\n\nThe AI-matched articles show strong thematic alignment with the source content, particularly around the core narrative. Sentiment across outlets trends neutral to positive, with Tier 1 publications providing the highest-value pickup.\n\nRecommendation: Prioritise amplification through Online and Print channels where engagement is highest. Monitor TV pickup for the next 24 hours.`;
    aiCache[id]=txt;
    if(_aiCurId!==id)return;
    const b=document.getElementById('ai-rpt-body');if(b)b.innerHTML=buildAIPanel(txt);
    const r=document.getElementById('ai-rpt-regen');if(r){r.disabled=false;r.classList.remove('spin');}
    initIcons();
  },1200);
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&document.getElementById('aireport-overlay')?.classList.contains('open'))closeAISummary();
});

function buildAIPanel(txt){
  const paras=txt.split(/\n\n+/).filter(p=>p.trim());
  const labels=['Coverage summary','Key insights','Recommendation'];
  const colors=['#181d26','#41454d','#16a34a'];
  return`<div class="ai-report-panel"><div class="ai-report-lbl"><i data-lucide="sparkles" style="width:12px;height:12px"></i> AI summary report</div>${paras.map((p,i)=>`<div style="margin-bottom:${i<paras.length-1?'12px':'0'}"><div style="font-size:10px;font-weight:600;color:${colors[i]||'#41454d'};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">${labels[i]||''}</div><div class="ai-report-txt">${p.trim()}</div></div>`).join('')}</div>`;
}

function dlCSV(id){
  const a=acts.find(x=>x.id===id);if(!a)return;
  const esc=v=>'"'+String(v).replace(/"/g,'""')+'"';
  let csv='MEDIA METER — ACTIVITY TRACKER REPORT\n';
  csv+=`Title:,${esc(a.title)}\nType:,${esc(a.type)}\nDate:,${esc(a.date)}\n\nMATCHED ARTICLES\n#,Media,Source,Headline,Date,AVE (PHP),Similarity,Type\n`;
  a.matches.forEach((m,i)=>{csv+=`${i+1},${esc(m.media)},${esc(m.source)},${esc(m.title)},${esc(m.date)},${m.value},${m.score?Math.round(m.score*100)+'%':'Manual'},${m.manual?'Manual':'AI-matched'}\n`;});
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=`ActivityTracker_${a.title.replace(/[^a-z0-9]/gi,'_')}.csv`;link.click();
  URL.revokeObjectURL(url);
}

function toggleMatchSel(aid,mid){
  const mSel=matchSel[aid]||(matchSel[aid]=new Set());
  if(mSel.has(mid))mSel.delete(mid);else mSel.add(mid);
  renderDetailOnly();
}
function toggleMatchSelAll(aid){
  const a=acts.find(x=>x.id===aid);if(!a)return;
  const mSel=matchSel[aid]||(matchSel[aid]=new Set());
  const af=artFilter[aid]||[],as=artSort[aid]||'similarity';
  let list=a.matches.filter(m=>af.length===0||af.includes(m.media));
  const allChecked=list.length>0&&list.every(m=>mSel.has(m.id));
  if(allChecked)list.forEach(m=>mSel.delete(m.id));
  else list.forEach(m=>mSel.add(m.id));
  renderDetailOnly();
}
function clearMatchSel(aid){
  matchSel[aid]=new Set();
  renderDetailOnly();
}
function confirmMatchBulkDelete(aid){
  const mSel=matchSel[aid];if(!mSel||mSel.size===0)return;
  const n=mSel.size;
  const ov=document.getElementById('confirm-overlay');
  const bx=document.getElementById('confirm-box');
  bx.innerHTML=`<div style="font-size:15px;font-weight:600;color:#181d26;margin-bottom:8px">Delete ${n} article${n!==1?'s':''}?</div>
    <div style="font-size:13px;color:#666;margin-bottom:20px">This will permanently remove ${n} selected article${n!==1?'s':''} from this activity.</div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button onclick="document.getElementById('confirm-overlay').style.display='none'" style="padding:8px 16px;border:1px solid #ddd;border-radius:6px;background:#fff;font-size:13px;cursor:pointer">Cancel</button>
      <button onclick="doMatchBulkDelete(${aid})" style="padding:8px 16px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600">Delete</button>
    </div>`;
  ov.style.display='flex';
}
function doMatchBulkDelete(aid){
  const a=acts.find(x=>x.id===aid);if(!a)return;
  const mSel=matchSel[aid];if(!mSel)return;
  a.matches=a.matches.filter(m=>!mSel.has(m.id));
  matchSel[aid]=new Set();
  document.getElementById('confirm-overlay').style.display='none';
  renderDetailOnly();
}
function rmMatch(aid,mid){
  const el=document.getElementById('mr-'+mid);
  if(el){el.classList.add('removing');setTimeout(()=>{const a=acts.find(x=>x.id===aid);if(a)a.matches=a.matches.filter(m=>m.id!==mid);renderDetailOnly();},250);}
}
function selAct(id){trackerSel=id;if(!trackerTabs[id])trackerTabs[id]='matches';renderDetailOnly();}
function closeDetail(){trackerSel=null;renderDetailOnly();}

function toggleDhMenu(e,id){
  e.stopPropagation();
  const menu=document.getElementById('dh-menu-'+id),btn=document.getElementById('dh-kebab-'+id);
  if(!menu)return;
  const wasOpen=menu.classList.contains('open');
  document.querySelectorAll('.dh-menu.open').forEach(m=>m.classList.remove('open'));
  document.querySelectorAll('.dh-kebab.open').forEach(b=>b.classList.remove('open'));
  if(!wasOpen){menu.classList.add('open');btn&&btn.classList.add('open');}
}
document.addEventListener('click',function(){
  document.querySelectorAll('.dh-menu.open').forEach(m=>m.classList.remove('open'));
  document.querySelectorAll('.dh-kebab.open').forEach(b=>b.classList.remove('open'));
});
function dhAction(e,id,action){
  e.stopPropagation();
  document.querySelectorAll('.dh-menu.open').forEach(m=>m.classList.remove('open'));
  document.querySelectorAll('.dh-kebab.open').forEach(b=>b.classList.remove('open'));
  if(action==='edit')showEdit(id);
  else if(action==='csv')downloadActivityCsv(id);
  else if(action==='delete')confirmDeleteActivity(id);
}
function confirmDeleteActivity(id){
  const a=acts.find(x=>x.id===id);if(!a)return;
  const ov=document.getElementById('confirm-overlay'),box=document.getElementById('confirm-box');
  ov.style.display='flex';
  box.innerHTML=`<div>
    <div class="confirm-title"><i data-lucide="alert-triangle" style="width:14px;height:14px;color:#a32d2d"></i> Delete activity?</div>
    <div class="confirm-body">Permanently delete <strong>${a.title}</strong> and all its matched ${_wPosts()}.<br><br><span style="color:#a32d2d;font-weight:500">This cannot be undone.</span></div>
    <div class="confirm-actions">
      <button class="at-btn-outline" onclick="closeConfirm()">Cancel</button>
      <button style="font-size:12px;padding:7px 16px;background:#a32d2d;color:#fff;border:none;border-radius:5px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-weight:500;font-family:inherit" onclick="doDeleteActivity(${id})"><i data-lucide="trash-2" style="width:12px;height:12px"></i> Delete</button>
    </div>
  </div>`;
  initIcons();
}
function doDeleteActivity(id){
  closeConfirm();
  const idx=acts.findIndex(x=>x.id===id);
  if(idx<0)return;
  acts.splice(idx,1);
  delete trackerTabs[id];delete msQ[id];delete msF[id];delete msR[id];delete aiCache[id];delete matchSel[id];
  if(trackerSel===id){
    const next=acts[idx]||acts[idx-1]||acts[0];
    trackerSel=next?next.id:null;
    if(next&&!trackerTabs[next.id])trackerTabs[next.id]='matches';
  }
  renderTracker();renderDetailOnly();
}
function downloadActivityCsv(id){
  const a=acts.find(x=>x.id===id);if(!a)return;
  const rows=[['Title','Source','Media','Date','AVE','Similarity','Manual']];
  (a.matches||[]).forEach(m=>{
    const sim=m.score!=null?Math.round(m.score*100)+'%':'';
    rows.push([m.title||'',m.source||'',m.media||'',m.date||'',m.value||0,sim,m.manual?'Yes':'No']);
  });
  const csv=rows.map(r=>r.map(c=>{const s=String(c==null?'':c);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=(a.title||'activity').replace(/[^a-z0-9-_ ]/gi,'').slice(0,60)+' - matches.csv';
  document.body.appendChild(link);link.click();document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
// Export a single brief story's coverage as CSV. Used by the Spotlight and Trending now
// action rows; matches the sibling buttons (newsletter / AI report / track) which also
// act on one story. Workspace-aware via trendStories (MediaWatch default or WS override).
function exportStory(id){
  const stories=(typeof trendStories!=='undefined'&&trendStories)||[];
  const s=stories.find(x=>x.id===id);if(!s)return;
  const esc=v=>{const t=String(v==null?'':v);return /[",\n]/.test(t)?'"'+t.replace(/"/g,'""')+'"':t;};
  const lines=[["MEDIA METER — STORY COVERAGE"]];
  lines.push(['Story',s.hl||'']);
  lines.push(['Tier',s.tier||'']);
  lines.push(['Sentiment',(s.chips&&s.chips[0]&&s.chips[0].t)||'']);
  lines.push(['Total AVE',s.ave||'']);
  lines.push(['Articles',(s.articles||[]).length]);
  lines.push([],['Headline','Media','Source','Date','AVE','Similarity']);
  (s.articles||[]).forEach(a=>lines.push([a.hl||'',a.media||'',a.source||'',a.date||'',a.ave||'',a.score!=null?a.score+'%':'']));
  const csv=lines.map(r=>r.map(esc).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=(s.hl||'story').replace(/[^a-z0-9-_ ]/gi,'').slice(0,60)+' - coverage.csv';
  document.body.appendChild(link);link.click();document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
function setTab(t){renderDetailOnly();}
// Per-panel observer for the tracker detail header shrink-on-scroll behavior
const _tkShrinkObs=new WeakMap();
function _wireTrackerShrinkObserver(panel){
  if(!panel||!('IntersectionObserver'in window))return;
  const head=panel.querySelector('.detail-head');
  const sentinel=panel.querySelector('.tk-scroll-sentinel');
  const scroller=panel.querySelector('.dpane');
  const prev=_tkShrinkObs.get(panel);if(prev)prev.disconnect();
  if(!head||!sentinel||!scroller)return;
  const obs=new IntersectionObserver(entries=>{
    head.classList.toggle('scrolled',!entries[0].isIntersecting);
  },{root:scroller,threshold:0});
  obs.observe(sentinel);
  _tkShrinkObs.set(panel,obs);
}

function renderDetailOnly(){
  const detailEl=document.getElementById('at-detail-panel');
  if(!detailEl)return;
  if(trackerSel){
    const a=acts.find(x=>x.id===trackerSel);
    const wrap=detailEl.querySelector('.detail-wrap');
    if(wrap&&a){
      // Frame already mounted — swap only the inner details (no full-card flash).
      // New child nodes auto-replay their CSS entrance animation, except on add
      // where we suppress the header/KPI entrance (only the new row animates).
      wrap.classList.toggle('detail-no-anim',!!_addAnimNewId);
      wrap.innerHTML=renderDetailInner(a);
    } else {
      detailEl.innerHTML=renderTrackerDetail();
    }
  } else {
    detailEl.innerHTML=`<div class="at-empty-state"><i data-lucide="mouse-pointer-2"></i><p>Select an activity to view matched ${_wPosts()}</p></div>`;
  }
  initIcons();
  wireKpiTooltips();
  _wireTrackerShrinkObserver(detailEl);
  // update selected state on list cards
  document.querySelectorAll('.activity-card').forEach(c=>{
    const id=parseInt(c.getAttribute('data-id'));
    c.classList.toggle('selected',id===trackerSel);
  });
}

function wireKpiTooltips(){}// no-op — delegation handled at document level below
(function(){
  const kpiInfo=[
    ['Total AVE','Advertising Value Equivalent — estimated media value of all matched '+_wPosts()+' for this activity.'],
    ['AI Matches','Articles automatically matched by the AI similarity engine based on your activity content.'],
    ['Avg Similarity','Average confidence score across all AI-matched '+_wPosts()+' — higher means a closer match.'],
    ['Manually Added','Articles added manually outside of AI matching — useful for coverage the engine may have missed.']
  ];
  function getKpiPop(){let p=document.getElementById('ss-pop');if(!p){p=document.createElement('div');p.id='ss-pop';document.body.appendChild(p);}return p;}
  function showKpiPop(card){
    const i=parseInt(card.getAttribute('data-kpi-tip'));
    const d=kpiInfo[i];if(!d)return;
    const pop=getKpiPop();
    let html=`<div class="ss-pop-title">${d[0]}</div><div class="ss-pop-body">${d[1]}</div>`;
    if(i===0&&card.dataset.kpiChannels){
      try{
        const chs=JSON.parse(decodeURIComponent(card.dataset.kpiChannels));
        const maxAve=Math.max(...chs.map(c=>c.ave),1);
        html+=`<div class="ss-pop-breakdown">${chs.map(c=>{
          const pct=Math.round(c.ave/maxAve*100);
          const chColor={'media-tv':'#a78bfa','media-online':'#60a5fa','media-print':'#86d9a8','media-radio':'#fcd34d'}[c.cls]||'rgba(255,255,255,0.4)';
          return`<div class="ss-pop-ch-row">
            <span class="ss-pop-ch-name">${c.ch}</span>
            <div class="ss-pop-bar-wrap"><div class="ss-pop-bar" style="width:${pct}%;background:${chColor}"></div></div>
            <span class="ss-pop-ch-ave">${fv(c.ave)}</span>
          </div>`;
        }).join('')}</div>`;
      }catch(e){}
    }
    pop.innerHTML=html;
    pop.classList.add('show');
    // two-pass: measure after paint so getBoundingClientRect is accurate
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const r=card.getBoundingClientRect(),pr=pop.getBoundingClientRect();
      let left=r.left+r.width/2-pr.width/2;
      left=Math.max(8,Math.min(left,window.innerWidth-pr.width-8));
      let top=r.top-pr.height-12;
      const flipped=top<8;
      if(flipped)top=r.bottom+12;
      pop.style.left=left+'px';pop.style.top=top+'px';
      pop.style.setProperty('--arrow-x',(r.left+r.width/2-left)+'px');
      pop.classList.toggle('ss-pop--below',flipped);
      pop.classList.toggle('ss-pop--above',!flipped);
    }));
  }
  document.addEventListener('mouseover',e=>{
    const card=e.target.closest('[data-kpi-tip]');
    if(card)showKpiPop(card);
  });
  document.addEventListener('mouseout',e=>{
    const card=e.target.closest('[data-kpi-tip]');
    if(card&&!card.contains(e.relatedTarget)){
      const pop=document.getElementById('ss-pop');if(pop)pop.classList.remove('show');
    }
  });
})();
function toggleScanKw(id,kw){
  if(!scanKwOff[id])scanKwOff[id]=new Set();
  if(scanKwOff[id].has(kw))scanKwOff[id].delete(kw);
  else scanKwOff[id].add(kw);
  renderDetailOnly();
}

function addScanKw(id,val){
  val=val.trim();if(!val)return;
  const a=acts.find(x=>x.id===id);if(!a)return;
  a.content=a.content+' '+val;
  renderDetailOnly();
}

function dismissScan(id){
  freshTrack[id]=false;
  renderDetailOnly();
}

function runScan(id){
  const a=acts.find(x=>x.id===id);if(!a)return;
  const ov=document.getElementById('dr-'+id);if(!ov)return;
  ov.style.display='flex';

  const steps=[
    {pct:8,  lbl:'Initializing scan...',        sub:'Loading similarity engine',               ctr:0},
    {pct:22, lbl:'Tokenizing your content...',   sub:'Breaking down key phrases and entities',  ctr:312},
    {pct:40, lbl:'Scanning '+_wPost()+' database...', sub:'Comparing against 3,437 verified '+_wPosts(),ctr:1204},
    {pct:60, lbl:'Calculating similarity scores...',sub:'Running vector comparisons',           ctr:2318},
    {pct:78, lbl:'Ranking results...',           sub:'Sorting by relevance score',              ctr:3062},
    {pct:92, lbl:'Finalising matches...',        sub:'Preparing your results',                  ctr:3437},
    {pct:100,lbl:'Scan complete!',               sub:'Matches found — review below',            ctr:3437},
  ];

  const bar=document.getElementById('dr-bar-'+id);
  const lbl=document.getElementById('dr-lbl-'+id);
  const sub=document.getElementById('dr-sub-'+id);
  const ctr=document.getElementById('dr-ctr-'+id);
  let step=0;

  function tick(){
    if(step>=steps.length){
      setTimeout(()=>{
        ov.style.display='none';
        const today=new Date();
        const fmt=d=>`${d.toLocaleString('en-PH',{month:'short'})} ${d.getDate()}, ${d.getFullYear()}`;
        const d1=fmt(today),d2=fmt(new Date(today-86400000)),d3=fmt(new Date(today-2*86400000)),d4=fmt(new Date(today-3*86400000)),d5=fmt(new Date(today-4*86400000)),d6=fmt(new Date(today-5*86400000));
        const scanMatches=[
          {id:'sc1',media:'Online',source:'BusinessWorld',title:`Telco war heats up as Jimenez fires back at PLDT rivals`,date:d1,value:397000,score:0.96,manual:false},
          {id:'sc2',media:'Print',source:'Philippine Daily Inquirer',title:`BIZ BUZZ: Jimenez twits PLDT's foes in pointed remarks`,date:d1,value:520000,score:0.93,manual:false},
          {id:'sc3',media:'TV',source:'ABS-CBN News',title:`Telco war escalates: Jimenez vs. Reyes feud explained`,date:d2,value:890000,score:0.88,manual:false},
          {id:'sc4',media:'Online',source:'Rappler',title:`Why Jimenez's PLDT comments matter — analyst reaction`,date:d2,value:245000,score:0.84,manual:false},
          {id:'sc5',media:'TV',source:'CNN Philippines',title:`What Jimenez's PLDT remarks mean for DITO's market push`,date:d3,value:710000,score:0.81,manual:false},
          {id:'sc6',media:'Online',source:'Philstar Online',title:`PLDT COO publicly responds to DITO Jimenez statements`,date:d3,value:631000,score:0.77,manual:false},
          {id:'sc7',media:'Online',source:'Manila Bulletin',title:`DITO's Jimenez addresses PLDT criticism head-on`,date:d4,value:280000,score:0.74,manual:false},
          {id:'sc8',media:'Radio',source:'DZRH News',title:`Telco rivalry: Jimenez sa PLDT, sumagot na`,date:d5,value:75000,score:0.70,manual:false},
        ];
        scanMatches.forEach(m=>{if(!a.matches.find(x=>x.id===m.id))a.matches.push(m);});
        freshTrack[id]=false;
        renderDetailOnly();
      },500);
      return;
    }
    const s=steps[step];
    bar.style.width=s.pct+'%';
    lbl.textContent=s.lbl;
    sub.textContent=s.sub;
    const from=parseInt((ctr.textContent||'0').replace(/,/g,''))||0;
    let cur=from,i=0,inc=(s.ctr-from)/20;
    const t=setInterval(()=>{
      cur+=inc;i++;
      ctr.textContent=Math.round(cur).toLocaleString();
      if(i>=20){ctr.textContent=s.ctr.toLocaleString();clearInterval(t);}
    },20);
    step++;
    setTimeout(tick,s.pct===100?600:520);
  }
  tick();
}

function clearArtFilter(id){artFilter[id]=[];artPage[id]=0;renderArtListOnly(id);}
function toggleArtFilter(id,val){const a=artFilter[id]||(artFilter[id]=[]);const i=a.indexOf(val);if(i>=0)a.splice(i,1);else a.push(val);artPage[id]=0;renderArtListOnly(id);}
function toggleSortDD(e){e.stopPropagation();const m=document.getElementById('art-sort-menu');if(m)m.classList.toggle('open');}
function setArtSort(id,val){
  artSort[id]=val;
  artPage[id]=0;
  // The sort dropdown lives in the filter bar (outside the re-rendered list region),
  // so update its label + active state directly, then close — mirrors setAtFilter('type').
  const lbl=document.getElementById('art-sort-label');
  if(lbl)lbl.textContent='Sort: '+({similarity:'Similarity',ave:'AVE',date:'Date'})[val];
  document.querySelectorAll('#art-sort-menu .at-type-opt').forEach(o=>{
    o.classList.toggle('active',(o.querySelector('span')?.textContent||'')==='Sort: '+({similarity:'Similarity',ave:'AVE',date:'Date'})[val]);
  });
  document.getElementById('art-sort-menu')?.classList.remove('open');
  renderArtListOnly(id);
}
// When set during a render, suppress the header/KPI entrance and animate only this row.
let _addAnimNewId=null;
function addMan(aid,title,value,media,source,date){
  const a=acts.find(x=>x.id===aid);if(!a)return;
  const oldMn=a.matches.filter(m=>m.manual).length;   // previous count — tween from here, not 0
  const newId='man'+Date.now();
  a.matches.unshift({id:newId,media,source,title,date,value,score:null,manual:true});
  artPage[aid]=0;                 // jump to first page so the new row is visible
  _addAnimNewId=newId;            // gate animation to just the new row for this render
  renderDetailOnly();
  _addAnimNewId=null;
  // Tween the "manually added" KPI number from its previous value
  const card=document.getElementById('at-kpi-strip-'+aid)?.querySelector('.ss:nth-child(4)');
  const val=card?.querySelector('.ss-val');
  if(val){
    val.classList.remove('muted');
    countUp(val,a.matches.filter(m=>m.manual).length,450,null,oldMn);
  }
  showSimpleToast(`Article added to <strong style="font-weight:600">${a.title}</strong>`,'circle-check');
}

// ── Add coverage slide-over (Search existing DB + Add manually) ──
let addArt={id:null,media:'',q:'',_results:[]};

let _aaSidebarWasCollapsed=false;
function openAddArt(id){
  addArt.id=id; addArt.media=''; addArt.q='';
  const ov=document.getElementById('addart-overlay');if(!ov)return;
  // Auto-collapse the left nav (mirrors openNewsletter); remember prior state to restore on close
  const sb=document.getElementById('sidebar');
  _aaSidebarWasCollapsed=!!(sb&&sb.classList.contains('collapsed'));
  if(sb)sb.classList.add('collapsed');
  const q=document.getElementById('aa-q');if(q)q.value='';
  renderAddArtPills();
  renderAddArtResults();
  // Two-step open (mirrors openNewsletter): mount off-screen, then add .open next
  // frame so the transform transition actually slides the panel in. The body class
  // shrinks .app-body (margin-right) in sync so the drawer pushes content, not overlays.
  ov.style.display='block';
  requestAnimationFrame(()=>{ov.classList.add('open');document.body.classList.add('addart-open');});
  initIcons();
  setTimeout(()=>document.getElementById('aa-q')?.focus(),120);
}
function closeAddArt(){
  const ov=document.getElementById('addart-overlay');if(!ov)return;
  ov.classList.remove('open');                       // slides out
  document.body.classList.remove('addart-open');     // content expands back in sync
  const sb=document.getElementById('sidebar');        // restore nav unless it was already collapsed
  if(sb&&!_aaSidebarWasCollapsed)sb.classList.remove('collapsed');
  setTimeout(()=>{ov.style.display='none';},280);    // hide after the 0.28s transition
}
function renderAddArtPills(){
  const el=document.getElementById('aa-pills');if(!el)return;
  el.innerHTML=['All','Online','Print','TV','Radio'].map(x=>{const v=x==='All'?'':x;return`<span class="ms-f${addArt.media===v?' on':''}" onclick="setAddArtMedia('${v}')">${x}</span>`;}).join('');
}
function setAddArtMedia(v){addArt.media=v;renderAddArtPills();renderAddArtResults();}
function addArtInput(v){addArt.q=v;renderAddArtResults();}
function renderAddArtResults(){
  const el=document.getElementById('addart-results');if(!el)return;
  const a=acts.find(x=>x.id===addArt.id);
  const q=(addArt.q||'').trim().toLowerCase();
  const existing=a?new Set(a.matches.map(m=>m.title)):new Set();
  let list=DB.filter(d=>!addArt.media||d.media===addArt.media);
  if(q)list=list.filter(d=>d.title.toLowerCase().includes(q)||d.source.toLowerCase().includes(q)||d.media.toLowerCase().includes(q));
  addArt._results=list;
  if(list.length===0){el.innerHTML=`<div class="aa-empty">${q?'No results — try different keywords, or use “Add manually”.':'No coverage in the library for this filter.'}</div>`;initIcons();return;}
  el.innerHTML=list.map((r,i)=>{
    const ic=ATicn[r.media]||{cls:'type-online',icon:'newspaper'},added=existing.has(r.title);
    return`<div class="match-row" data-aa-idx="${i}" style="animation-delay:${i*0.04}s">
      <span class="hl-icon ${ic.cls}" data-btip="${_makeTip({label:r.media})}"><i data-lucide="${ic.icon}"></i></span>
      <div class="match-main">
        <div class="match-hl">${r.title}</div>
        <div class="match-meta"><span class="match-source">${r.source}</span><span class="aa-dot">·</span><span class="match-date">${r.date}</span><span class="aa-dot">·</span><span class="match-ave">${fv(r.value)} AVE</span></div>
      </div>
      <div class="aa-action">${added?`<span class="aa-added"><i data-lucide="check"></i> Added</span>`:`<button class="at-btn-outline" onclick="addArtAddIdx(${i})"><i data-lucide="plus" style="width:12px;height:12px"></i> Add</button>`}</div>
    </div>`;
  }).join('');
  initIcons();
}
function addArtAddIdx(i){
  const r=(addArt._results||[])[i];if(!r||addArt.id==null)return;
  addMan(addArt.id,r.title,r.value,r.media,r.source,r.date);
  // Flip only the clicked row's action (Add → Added) with a pop — avoids re-animating
  // the whole list and keeps scroll position. Later searches/filters re-sync via full render.
  const act=document.querySelector(`#addart-results [data-aa-idx="${i}"] .aa-action`);
  if(act){act.innerHTML=`<span class="aa-added aa-pop"><i data-lucide="check"></i> Added</span>`;initIcons();}
  else renderAddArtResults();
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&document.getElementById('addart-overlay')?.classList.contains('open'))closeAddArt();
});

function showEdit(id){
  const a=acts.find(x=>x.id===id);if(!a)return;
  trackerSel=id;
  const detailEl=document.getElementById('at-detail-panel');if(!detailEl)return;
  detailEl.innerHTML=`<div class="detail-wrap" style="animation:fadeIn 0.2s ease">
    <div class="detail-head">
      <span style="font-size:13px;font-weight:600;color:#181d26;display:flex;align-items:center;gap:7px;flex:1"><i data-lucide="pencil" style="color:#181d26"></i> Edit activity</span>
      <button class="at-btn-ghost" onclick="renderDetailOnly()"><i data-lucide="x" style="width:12px;height:12px"></i> Cancel</button>
    </div>
    <div class="dpane" style="overflow-y:auto">
      <div class="edit-banner"><i data-lucide="alert-triangle" style="width:14px;height:14px"></i> Editing will not re-run the scan. Use "Add manually" to update matches after saving.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="grid-column:1/-1"><label class="form-label">Title</label><input class="form-input" type="text" id="e-title" value="${a.title}"></div>
        <div><label class="form-label">Type</label><select class="form-select" id="e-type">${['Press Release','Event','Crisis','Trending','Product'].map(t=>`<option${a.type===t?' selected':''}>${t}</option>`).join('')}</select></div>
        <div><label class="form-label">Date released</label><input class="form-input" type="date" id="e-date" value="${a.date}"></div>
        <div style="grid-column:1/-1"><label class="form-label">Content</label><textarea class="form-textarea" id="e-content">${a.content}</textarea></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:14px;border-top:1px solid #f0f0f6">
        <button class="at-btn-danger" onclick="confirmDelete(${id})"><i data-lucide="trash-2" style="width:12px;height:12px"></i> Delete</button>
        <div style="display:flex;gap:8px">
          <button class="at-btn-outline" onclick="renderDetailOnly()">Cancel</button>
          <button class="at-btn-new" onclick="saveEdit(${id})"><i data-lucide="save" style="width:12px;height:12px"></i> Save changes</button>
        </div>
      </div>
    </div>
  </div>`;
  initIcons();
}

function saveEdit(id){
  const a=acts.find(x=>x.id===id);if(!a)return;
  const title=document.getElementById('e-title').value.trim();
  const type=document.getElementById('e-type').value;
  const date=document.getElementById('e-date').value;
  const content=document.getElementById('e-content').value.trim();
  if(!title||!type||!date||!content){alert('Please fill in all fields.');return;}
  a.title=title;a.type=type;a.date=date;a.content=content;
  delete aiCache[id];trackerSel=id;trackerTabs[id]='matches';renderTracker();
  renderDetailOnly();
}

function confirmDelete(id){
  const a=acts.find(x=>x.id===id);if(!a)return;
  const ov=document.getElementById('confirm-overlay'),box=document.getElementById('confirm-box');
  ov.style.display='flex';
  box.innerHTML=`<div>
    <div class="confirm-title"><i data-lucide="alert-triangle" style="width:14px;height:14px;color:#a32d2d"></i> Delete activity?</div>
    <div class="confirm-body">Permanently delete <strong>"${a.title}"</strong> and all ${a.matches.length} matched ${_wPost()}${a.matches.length!==1?'s':''}?<br><br><span style="color:#a32d2d;font-weight:500">This cannot be undone.</span></div>
    <div class="confirm-actions">
      <button class="at-btn-outline" onclick="closeConfirm()">Cancel</button>
      <button style="font-size:12px;padding:7px 16px;background:#a32d2d;color:#fff;border:none;border-radius:5px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-weight:500;font-family:inherit" onclick="doDelete(${id})"><i data-lucide="trash-2" style="width:12px;height:12px"></i> Yes, delete</button>
    </div>
  </div>`;
  initIcons();
}

function doDelete(id){
  closeConfirm();acts=acts.filter(x=>x.id!==id);
  if(trackerSel===id)trackerSel=null;
  delete trackerTabs[id];delete msQ[id];delete msF[id];delete msR[id];delete aiCache[id];delete matchSel[id];
  renderTracker();renderDetailOnly();
}
function closeConfirm(){document.getElementById('confirm-overlay').style.display='none';}

function toggleAtSelect(){
  atSelectMode=true;atSelected.clear();
  const acts=document.querySelector('.at-list-header-actions');if(acts)acts.style.display='none';
  document.getElementById('at-select-bar').style.display='flex';
  document.getElementById('at-list-header').classList.add('select-mode');
  renderTracker();
}
function exitAtSelect(){
  atSelected.clear();
  const bar=document.getElementById('at-select-bar');if(bar)bar.style.display='none';
  const actions=document.getElementById('at-list-header-actions');if(actions)actions.style.display='flex';
  const label=document.getElementById('at-list-header-label');if(label)label.style.display='';
  renderTracker();
}
function _syncSelectBar(){
  const bar=document.getElementById('at-select-bar');
  const actions=document.getElementById('at-list-header-actions');
  const label=document.getElementById('at-list-header-label');
  const total=document.querySelectorAll('.activity-card').length;
  const allChecked=atSelected.size>=total&&total>0;
  const someChecked=atSelected.size>0&&!allChecked;
  if(atSelected.size>0){
    if(bar)bar.style.display='flex';
    if(actions)actions.style.display='none';
    if(label)label.style.display='none';
  } else {
    if(bar)bar.style.display='none';
    if(actions)actions.style.display='flex';
    if(label)label.style.display='';
  }
  const countEl=document.getElementById('at-select-count');
  if(countEl)countEl.textContent=atSelected.size+' selected';
  const delBtn=document.getElementById('at-bulk-delete-btn');
  if(delBtn)delBtn.disabled=atSelected.size===0;
  // update header checkbox state
  const hdCb=document.getElementById('at-hd-checkbox');
  if(hdCb){
    hdCb.classList.toggle('checked',allChecked);
    hdCb.classList.toggle('indeterminate',someChecked);
    hdCb.innerHTML=allChecked?'<i data-lucide="check" style="width:10px;height:10px"></i>':someChecked?'<span class="at-hd-cb-dash"></span>':'';
  }
  document.querySelectorAll('.activity-card').forEach(c=>{
    const cid=parseInt(c.getAttribute('data-id'));
    c.classList.toggle('ac-checked',atSelected.has(cid));
    const cb=c.querySelector('.ac-checkbox');
    if(cb){cb.classList.toggle('checked',atSelected.has(cid));cb.innerHTML=atSelected.has(cid)?'<i data-lucide="check" style="width:10px;height:10px"></i>':'';}
  });
  initIcons();
}
function toggleAtCard(id){
  if(atSelected.has(id))atSelected.delete(id);else atSelected.add(id);
  _syncSelectBar();
}
function toggleSelectAll(){
  const cards=document.querySelectorAll('.activity-card');
  const total=cards.length;
  if(atSelected.size>=total){
    atSelected.clear();
  } else {
    cards.forEach(c=>atSelected.add(parseInt(c.getAttribute('data-id'))));
  }
  _syncSelectBar();
}
function confirmBulkDelete(){
  if(atSelected.size===0)return;
  const ov=document.getElementById('confirm-overlay'),box=document.getElementById('confirm-box');
  ov.style.display='flex';
  box.innerHTML=`<div>
    <div class="confirm-title"><i data-lucide="alert-triangle" style="width:14px;height:14px;color:#a32d2d"></i> Delete ${atSelected.size} activit${atSelected.size===1?'y':'ies'}?</div>
    <div class="confirm-body">Permanently delete <strong>${atSelected.size} selected activit${atSelected.size===1?'y':'ies'}</strong> and all their matched ${_wPosts()}.<br><br><span style="color:#a32d2d;font-weight:500">This cannot be undone.</span></div>
    <div class="confirm-actions">
      <button class="at-btn-outline" onclick="closeConfirm()">Cancel</button>
      <button style="font-size:12px;padding:7px 16px;background:#a32d2d;color:#fff;border:none;border-radius:5px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-weight:500;font-family:inherit" onclick="doBulkDelete()"><i data-lucide="trash-2" style="width:12px;height:12px"></i> Yes, delete all</button>
    </div>
  </div>`;
  initIcons();
}
function doBulkDelete(){
  closeConfirm();
  atSelected.forEach(id=>{
    acts=acts.filter(x=>x.id!==id);
    if(trackerSel===id)trackerSel=null;
    delete trackerTabs[id];delete msQ[id];delete msF[id];delete msR[id];delete aiCache[id];delete matchSel[id];
  });
  exitAtSelect();
}

function showCreate(){
  trackerSel=null;
  const detailEl=document.getElementById('at-detail-panel');if(!detailEl)return;
  detailEl.innerHTML=`<div class="detail-wrap" style="animation:fadeIn 0.2s ease;position:relative">
    <div class="detail-radar" id="dr-create" style="display:none">
      <div class="dr-card">
        <div class="dr-wrap">
          <div class="dr-ring dr-r1"></div>
          <div class="dr-ring dr-r2"></div>
          <div class="dr-ring dr-r3"></div>
          <div class="dr-center"></div>
          <svg width="80" height="80" style="position:absolute;top:0;left:0">
            <defs><radialGradient id="sg2" cx="100%" cy="100%" r="100%"><stop offset="0%" stop-color="#181d26" stop-opacity="0.3"/><stop offset="100%" stop-color="#181d26" stop-opacity="0"/></radialGradient></defs>
            <g style="transform-origin:40px 40px;animation:radarSweep 2s linear infinite"><path d="M40,40 L40,0 A40,40,0,0,1,80,40 Z" fill="url(#sg2)"/></g>
          </svg>
          <div class="dr-ping" style="top:18px;left:48px;animation-delay:0.3s"></div>
          <div class="dr-ping" style="top:45px;left:22px;animation-delay:1.1s"></div>
          <div class="dr-ping" style="top:28px;left:58px;animation-delay:1.7s"></div>
        </div>
        <div class="dr-counter" id="dr-ctr-create">0</div>
        <div class="dr-label" id="dr-lbl-create">Initializing scan...</div>
        <div class="dr-sublabel" id="dr-sub-create">Preparing similarity engine</div>
        <div class="dr-progress"><div class="dr-bar" id="dr-bar-create"></div></div>
      </div>
    </div>
    <div class="dpane" style="overflow-y:auto;display:flex;align-items:center;justify-content:center;padding:24px">
      <div style="max-width:720px;width:100%">
      <div style="margin-bottom:24px">
        <div style="font-size:16px;font-weight:600;color:var(--ink);letter-spacing:-0.01em">New activity</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">Add details about your activity to find related coverage.</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="grid-column:1/-1"><label class="form-label">Title <span style="color:var(--s-coral)">*</span></label><input class="form-input" type="text" id="f-title" placeholder="e.g. DITO 5G Launch Press Release"></div>
        <div><label class="form-label">Type <span style="color:var(--s-coral)">*</span></label>
          <div class="at-type-dd ft-dd">
            <div class="form-select ft-trigger" id="ft-trigger" onclick="ftToggle(event)"><span id="ft-label" class="ft-ph">Select type...</span></div>
            <div class="at-type-menu ft-menu" id="ft-menu">${['Press Release','Event','Crisis','Trending','Product'].map(t=>`<div class="at-type-opt" onclick="ftPick('${t}')"><span>${t}</span></div>`).join('')}</div>
            <input type="hidden" id="f-type" value="">
          </div>
        </div>
        <div><label class="form-label">Date released</label><input class="form-input" type="date" id="f-date" value="${new Date().toISOString().split('T')[0]}"></div>
        <div style="grid-column:1/-1"><label class="form-label">Content <span style="color:var(--s-coral)">*</span></label><textarea class="form-textarea" id="f-content" placeholder="Paste your press release or activity summary here..." style="min-height:160px"></textarea></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">
        <span style="font-size:12px;color:var(--muted)"><i data-lucide="database" style="width:12px;height:12px;margin-right:3px"></i>Will scan across 3,437 ${_wPosts()}</span>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn-ghost" onclick="renderDetailOnly()"><i data-lucide="x" style="width:12px;height:12px"></i> Cancel</button>
          <button class="at-btn-scan" onclick="startScan()"><i data-lucide="search" style="width:14px;height:14px"></i> Scan for matches</button>
        </div>
      </div>
      </div>
    </div>
  </div>`;
  initIcons();
}

// Custom "Type" dropdown (replaces the native select; writes to hidden #f-type)
function ftToggle(e){e.stopPropagation();const m=document.getElementById('ft-menu');if(m)m.classList.toggle('open');}
function ftPick(val){
  const inp=document.getElementById('f-type');if(inp)inp.value=val;
  const lbl=document.getElementById('ft-label');if(lbl){lbl.textContent=val;lbl.classList.remove('ft-ph');}
  document.querySelectorAll('#ft-menu .at-type-opt').forEach(o=>o.classList.toggle('active',o.textContent.trim()===val));
  document.getElementById('ft-trigger')?.classList.remove('ft-error');
  document.getElementById('ft-menu')?.classList.remove('open');
}
document.addEventListener('click',function(){const m=document.getElementById('ft-menu');if(m)m.classList.remove('open');});

function startScan(){
  const title=document.getElementById('f-title').value.trim();
  const type=document.getElementById('f-type').value;
  const date=document.getElementById('f-date').value;
  const content=document.getElementById('f-content').value.trim();
  if(!title){document.getElementById('f-title').focus();document.getElementById('f-title').style.borderColor='#d44';return;}
  if(!type){document.getElementById('ft-trigger')?.classList.add('ft-error');return;}
  if(!content){document.getElementById('f-content').focus();document.getElementById('f-content').style.borderColor='#d44';return;}
  ['f-title','f-content'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.borderColor='';});
  document.getElementById('ft-trigger')?.classList.remove('ft-error');

  const ov=document.getElementById('dr-create');if(!ov)return;
  ov.style.display='flex';

  const steps=[
    {pct:8,  lbl:'Initializing scan...',        sub:'Loading similarity engine',               ctr:0},
    {pct:22, lbl:'Tokenizing your content...',   sub:'Breaking down key phrases and entities',  ctr:312},
    {pct:40, lbl:'Scanning '+_wPost()+' database...', sub:'Comparing against 3,437 verified '+_wPosts(),ctr:1204},
    {pct:60, lbl:'Calculating similarity scores...',sub:'Running vector comparisons',           ctr:2318},
    {pct:78, lbl:'Ranking results...',           sub:'Sorting by relevance score',              ctr:3062},
    {pct:92, lbl:'Finalising matches...',        sub:'Preparing your results',                  ctr:3437},
    {pct:100,lbl:'Scan complete!',               sub:'Matches found — review below',            ctr:3437},
  ];

  const bar=document.getElementById('dr-bar-create');
  const lbl=document.getElementById('dr-lbl-create');
  const sub=document.getElementById('dr-sub-create');
  const ctr=document.getElementById('dr-ctr-create');
  let step=0;

  function tick(){
    if(step>=steps.length){
      setTimeout(()=>{
        ov.style.display='none';
        const today=new Date();
        const fmt=d=>`${d.toLocaleString('en-PH',{month:'short'})} ${d.getDate()}, ${d.getFullYear()}`;
        const d1=fmt(today),d2=fmt(new Date(today-86400000)),d3=fmt(new Date(today-2*86400000)),d4=fmt(new Date(today-3*86400000));
        const na={id:atNid++,title,type,date,content,matches:[
          {id:'n1',media:'Online',source:'Manila Times Online',title:'DITO expands 5G footprint in Metro Manila',date:d1,value:312000,score:0.93,manual:false},
          {id:'n2',media:'Print',source:'Philippine Daily Inquirer',title:'DITO Telecommunity posts record subscriber growth',date:d2,value:520000,score:0.88,manual:false},
          {id:'n3',media:'TV',source:'ABS-CBN News',title:'DITO eyes Visayas coverage by Q3 2026',date:d3,value:890000,score:0.84,manual:false},
          {id:'n4',media:'Online',source:'BusinessWorld',title:'DITO partners with Huawei for network upgrade',date:d4,value:195000,score:0.79,manual:false},
        ]};
        acts.unshift(na);trackerSel=na.id;trackerTabs[na.id]='matches';renderTracker();renderDetailOnly();
      },500);
      return;
    }
    const s=steps[step];
    bar.style.width=s.pct+'%';
    lbl.textContent=s.lbl;
    sub.textContent=s.sub;
    const from=parseInt((ctr.textContent||'0').replace(/,/g,''))||0;
    let cur=from,i=0,inc=(s.ctr-from)/20;
    const t=setInterval(()=>{
      cur+=inc;i++;
      ctr.textContent=Math.round(cur).toLocaleString();
      if(i>=20){ctr.textContent=s.ctr.toLocaleString();clearInterval(t);}
    },20);
    step++;
    setTimeout(tick,480);
  }
  tick();
}

// Toggle left navigation sidebar (icon rotates, labels fade, width animates)
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ── Workspace switcher dropdown (sidebar selector) ──
const WS_OPTIONS=['MediaWatch','SharedView','AdWatch'];
const WS_MAP={MediaWatch:'mediawatch',SharedView:'shared',AdWatch:'adwatch'};
const WS_LABEL={mediawatch:'MediaWatch',shared:'SharedView',adwatch:'AdWatch'};
const wsNow=window.WS||'mediawatch';               // set by the loaded data file (data-shared.js etc.)
let wsCurrent=WS_LABEL[wsNow]||'MediaWatch';
function wsOpen(){
  const sel=document.querySelector('.sb-selector');if(!sel)return;
  let menu=document.getElementById('ws-menu');
  if(!menu){menu=document.createElement('div');menu.id='ws-menu';menu.className='ws-menu';document.body.appendChild(menu);}
  menu.innerHTML=WS_OPTIONS.map(o=>`<div class="ws-opt${o===wsCurrent?' active':''}" onclick="wsSelect('${o}')">${o}${o===wsCurrent?'<i data-lucide="check"></i>':''}</div>`).join('');
  const r=sel.getBoundingClientRect();
  menu.style.left=r.left+'px';menu.style.top=(r.bottom+4)+'px';menu.style.minWidth=r.width+'px';
  menu.style.display='block';
  if(typeof initIcons==='function')initIcons();
}
function wsToggle(e){
  if(e)e.stopPropagation();
  const sb=document.getElementById('sidebar');
  if(sb&&sb.classList.contains('collapsed')){toggleSidebar();return;}
  const menu=document.getElementById('ws-menu');
  if(menu&&menu.style.display==='block'){menu.style.display='none';return;}
  wsOpen();
}
function wsSelect(name){
  const menu=document.getElementById('ws-menu');if(menu)menu.style.display='none';
  const target=WS_MAP[name]||'mediawatch';
  if(target===wsNow)return;                          // already here
  if(target==='adwatch'){if(typeof showSimpleToast==='function')showSimpleToast('AdWatch workspace coming soon','sparkles');return;}
  // Map the current page to the target workspace (Influencers is Shared-only; Publishers/Authors are MediaWatch-only)
  const common=['mentions','tracker','dashboard','categories'];
  const page=common.includes(currentPage)?currentPage:'mentions';
  const inShared=wsNow==='shared';
  let url;
  if(target==='shared') url=(inShared?'':'shared/')+page+'.html';
  else url=(inShared?'../':'')+page+'.html';
  window.location.href=url;
}
(function wsInit(){
  const sel=document.querySelector('.sb-selector');if(!sel)return;
  sel.onclick=null;   // replace the inline expand-only handler — wsToggle does both
  sel.addEventListener('click',wsToggle);
  document.querySelectorAll('.sb-selector-label').forEach(el=>el.textContent=wsCurrent);
})();
document.addEventListener('click',function(e){
  const menu=document.getElementById('ws-menu'),sel=document.querySelector('.sb-selector');
  if(menu&&menu.style.display==='block'&&!menu.contains(e.target)&&sel&&!sel.contains(e.target))menu.style.display='none';
});
document.addEventListener('keydown',function(e){
  const menu=document.getElementById('ws-menu');
  if(e.key==='Escape'&&menu&&menu.style.display==='block')menu.style.display='none';
});

// Nav switching
document.querySelectorAll('.nav-i').forEach(n=>{
  n.addEventListener('click',()=>{
    document.querySelectorAll('.nav-i').forEach(x=>x.classList.remove('act'));
    n.classList.add('act');
  });
});

// ── Open article detail in a new tab (delegated: works for the brief article
//    lists AND the static Mentions table, including dynamically rendered rows) ──
function openArticleDetail(d){
  const u='article.html?'+new URLSearchParams({
    title:d.title||'',source:d.source||'',section:d.section||'',
    date:d.date||'',ave:d.ave||'',sv:d.sv||'',media:d.media||''
  }).toString();
  window.open(u,'_blank');
}
// "Read Article" → open the full article page in a new tab with the active mention's data
function openArticleTab(){
  const d=mentionData[mdActive];if(!d)return;
  openArticleDetail({title:d.title,source:d.sub,section:d.section,date:d.date,ave:d.ave,sv:d.sv});
}
document.addEventListener('click',function(e){
  // ignore clicks on interactive controls inside a row
  if(e.target.closest('input,button,a,select,.tcb,.row-dots,.remove-btn')) return;
  const ar=e.target.closest('.art-row');
  if(ar){
    openArticleDetail({
      title:ar.querySelector('.art-hl')?.textContent.trim(),
      source:ar.querySelector('.art-source')?.textContent.trim(),
      date:ar.querySelector('.art-date')?.textContent.trim(),
      ave:ar.querySelector('.art-ave')?.textContent.trim(),
      media:ar.querySelector('.media-badge')?.textContent.trim()
    });
    return;
  }
  const tr=e.target.closest('.tbl tbody tr');
  if(tr){
    if(window.WS_DATA&&window.WS_DATA.socialMentions){   // Shared View social table → social preview
      const gi=parseInt(tr.dataset.idx);
      if(!isNaN(gi))openSocialPost(gi);
      return;
    }
    const title=tr.querySelector('.hl-text')?.textContent.trim();
    if(!title) return; // header / non-article rows
    // open the right-side detail drawer for the clicked mention
    const rows=Array.from(tr.parentElement.querySelectorAll('tr'));
    const idx=rows.indexOf(tr);
    if(idx<0||idx>=mentionData.length)return;
    const ov=document.getElementById('mention-overlay');
    // in split view the table IS the list — just swap the docked detail; otherwise open the modal
    if(mdMode==='split' && ov.classList.contains('open')){ selectMention(idx); }
    else { openMention(idx); }
  }
});
function initIcons(){
  lucide.createIcons();
  document.querySelectorAll('[data-lucide] svg').forEach(svg=>{
    svg.removeAttribute('width');
    svg.removeAttribute('height');
  });
  if(typeof tvWire==='function')tvWire();
}
// ── Bar chart rich tooltip (state + _makeTip hoisted near the top for load-order) ──
(function(){
  const el=document.createElement('div');
  el.id='md-tooltip';
  document.body.appendChild(el);
  function anchorBelow(bar){
    const r=bar.getBoundingClientRect();
    el.classList.add('anchored');
    // wait one frame so offsetWidth is measured after content is set
    requestAnimationFrame(()=>{
      const W=el.offsetWidth,vw=window.innerWidth;
      let left=r.left+r.width/2-W/2;
      left=Math.max(6,Math.min(left,vw-W-6));
      el.style.left=left+'px';
      el.style.top=(r.bottom+8)+'px';
      // position arrow relative to icon center
      const arrowX=r.left+r.width/2-left;
      el.style.setProperty('--arrow-x',arrowX+'px');
    });
  }
  function show(bar,x,y){
    const t=_barTips.get(bar.dataset.btip);
    if(!t)return;
    el.classList.remove('anchored');
    let html='';
    if(t.label!=null||t.detail!=null){
      // Anchored tooltip with arrow (article type icon, KPI card, or a label-less brief)
      if(t.label!=null)html+=`<div class="tip-date">${t.label}</div>`;
      if(t.detail)html+=`<div class="tip-detail">${t.detail}</div>`;
      el.innerHTML=html;
      el.classList.toggle('has-detail',!!t.detail);
      el.classList.add('visible');
      anchorBelow(bar);
      return;
    } else if(t.entityName!=null){
      // Entity pill tooltip
      html+=`<div class="tip-date">${t.entityName}</div>`;
      html+=`<div class="tip-row"><span class="tip-lbl">Type</span><span class="tip-val">${t.entityType}</span></div>`;
      html+=`<div class="tip-row"><span class="tip-lbl">Mentions</span><span class="tip-val">${t.entityCount}</span></div>`;
      html+=`<div class="tip-links"><a class="tip-link" href="https://en.wikipedia.org/wiki/${t.wikiSlug}" target="_blank" rel="noopener">Wikipedia ↗</a><a class="tip-link" href="https://www.wikidata.org/wiki/Special:Search?search=${t.wikiSlug}" target="_blank" rel="noopener">Wikidata ↗</a></div>`;
    } else {
      // Bar chart tooltip
      html+=`<div class="tip-date">${t.date||''}</div>`;
      if(t.coverage!=null) html+=`<div class="tip-row"><span class="tip-lbl">Coverage</span><span class="tip-val">${t.coverage} mention${t.coverage!==1?'s':''}</span></div>`;
      if(t.ave!=null)      html+=`<div class="tip-row"><span class="tip-lbl">AVE</span><span class="tip-val">PHP ${t.ave}</span></div>`;
      if(t.sv!=null)       html+=`<div class="tip-row"><span class="tip-lbl">Story Value</span><span class="tip-val">${t.sv}</span></div>`;
    }
    el.innerHTML=html;
    el.classList.add('visible');
    move(x,y);
  }
  function move(x,y){
    if(el.classList.contains('anchored'))return;
    const W=el.offsetWidth,H=el.offsetHeight,vw=window.innerWidth,vh=window.innerHeight;
    el.style.left=(x+14+W>vw?x-W-8:x+14)+'px';
    el.style.top=(y-H/2<0?4:y+H/2>vh?vh-H-4:y-H/2)+'px';
  }
  function hide(){el.classList.remove('visible','anchored');}
  document.addEventListener('mouseover',e=>{const b=e.target.closest('[data-btip]');if(b)show(b,e.clientX,e.clientY);else hide();});
  document.addEventListener('mousemove',e=>{if(el.classList.contains('visible'))move(e.clientX,e.clientY);});
  document.addEventListener('mouseout',e=>{if(!e.target.closest('[data-btip]'))hide();});
})();
initIcons();
if(document.getElementById('page-mentions')){
  renderTableRows();
  document.querySelectorAll(".ss-trend:not(.neu)").forEach(function(t){ if(/[↓−-]/.test(t.textContent)) t.classList.add("neg"); });
}
// ── KPI card hover explainer popover (study 2) ──
(function(){
  const info={
    0:['Mentions today','Total media mentions captured today across all monitored sources (<span style="color:#4ade80;font-weight:600">↑22%</span> vs yesterday).'],
    1:['Combined AVE','Advertising Value Equivalent — estimated ad-spend value of today\'s coverage: <span style="color:#4ade80;font-weight:600">PHP 2.78M</span>.'],
    2:['Sentiment today','Overall tone of today\'s coverage — <span style="color:#4ade80;font-weight:600">22% positive</span> · <span style="color:#9ca3af;font-weight:600">68% neutral</span> · <span style="color:#f87171;font-weight:600">10% negative</span>.'],
    3:['Tier 1 '+_wPosts(),'Mentions from Tier 1 (top-priority) publications flagged today: <span style="color:#a78bfa;font-weight:600">3 '+_wPosts()+'</span>.']
  };
  let pop;
  function showPop(card,i){
    let d=info[i]; if(!d)return;
    if(i===1&&window.WS==='shared'){
      const posts=(window.WS_DATA&&window.WS_DATA.socialMentions)||[];
      const counts={};posts.forEach(pp=>{counts[pp.platform]=(counts[pp.platform]||0)+1;});
      const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
      const total=posts.length,top=sorted[0]||['',0];
      const lbl=k=>(SOCIAL_PLATFORMS[k]||{label:k}).label.replace(' (Twitter)','');
      const breakdown=sorted.map(([k,n])=>`${lbl(k)} ${n}`).join(' · ');
      d=['Top source',`<span style="color:#60a5fa;font-weight:600">${lbl(top[0])}</span> leads with ${top[1]} of ${total} posts.<br><span style="color:#9ca3af">${breakdown}</span>`];
    }
    if(i===2&&card.dataset.pos){
      d=['Sentiment today','Overall tone of today\'s coverage — <span style="color:#4ade80;font-weight:600">'+card.dataset.pos+'% positive</span> · <span style="color:#9ca3af;font-weight:600">'+card.dataset.neu+'% neutral</span> · <span style="color:#f87171;font-weight:600">'+card.dataset.neg+'% negative</span>.'];
    }
    if(!pop){pop=document.createElement('div');pop.id='ss-pop';document.body.appendChild(pop);}
    pop.innerHTML='<div class="ss-pop-title">'+d[0]+'</div>'+d[1];
    pop.classList.add('show');
    requestAnimationFrame(()=>{
      const r=card.getBoundingClientRect(),pr=pop.getBoundingClientRect();
      let left=r.left+r.width/2-pr.width/2;
      left=Math.max(8,Math.min(left,window.innerWidth-pr.width-8));
      let top=r.top-pr.height-12;
      const flipped=top<8;
      if(flipped)top=r.bottom+12;
      pop.style.left=left+'px';pop.style.top=top+'px';
      pop.style.setProperty('--arrow-x',(r.left+r.width/2-left)+'px');
      pop.classList.toggle('ss-pop--above',!flipped);
      pop.classList.toggle('ss-pop--below',flipped);
    });
  }
  function hidePop(){ if(pop)pop.classList.remove('show','ss-pop--above','ss-pop--below'); }
  document.querySelectorAll('.brief-stats .ss').forEach((c,i)=>{
    c.addEventListener('mouseenter',()=>showPop(c,i));
    c.addEventListener('mouseleave',hidePop);
  });
})();
// ── KPI scan-ring + count-up animation ──
function countUp(el,target,duration,onComplete,from){
  // ease-out-expo: rockets up fast, decelerates crisply into the final value.
  // `from` (default 0) lets callers tween an in-place change (e.g. 5 → 6) instead of resetting.
  from=from||0;
  el.textContent=from;
  const start=performance.now();
  const isFloat=(target%1!==0)||(from%1!==0);
  (function tick(now){
    const p=Math.min((now-start)/duration,1);
    const ease=p===1?1:1-Math.pow(2,-10*p);
    const cur=from+(target-from)*ease;
    el.textContent=isFloat?cur.toFixed(2):Math.round(cur);
    if(p<1){requestAnimationFrame(tick);}
    else{
      el.textContent=isFloat?target.toFixed(2):target;
      if(onComplete)onComplete();
    }
  })(start);
}
// ── Randomize the sentiment KPI card on each refresh (cycles positive / neutral / negative) ──
function randomizeSentiment(){
  const card=document.getElementById('ss-2');
  if(!card)return;
  // breakdowns each sum to 100; `cls` drives card bg via #ss-2:has(.ss-trend.X)
  const SENTS=[
    {label:'positive',cls:'pos',pos:74,neu:18,neg:8},
    {label:'positive',cls:'pos',pos:61,neu:30,neg:9},
    {label:'neutral', cls:'neu',pos:22,neu:68,neg:10},
    {label:'neutral', cls:'neu',pos:19,neu:55,neg:26},
    {label:'negative',cls:'neg',pos:14,neu:29,neg:57},
    {label:'negative',cls:'neg',pos:9, neu:33,neg:58},
  ];
  const s=SENTS[Math.floor(Math.random()*SENTS.length)];
  const dom=s.cls==='pos'?s.pos:s.cls==='neg'?s.neg:s.neu;
  const num=card.querySelector('.ss-num');
  if(num)num.dataset.val=dom;
  const trend=card.querySelector('.ss-trend');
  if(trend){trend.className='ss-trend '+s.cls;trend.textContent=s.label;}
  // stash breakdown so the hover popover stays in sync
  card.dataset.pos=s.pos;card.dataset.neu=s.neu;card.dataset.neg=s.neg;
  const bar=card.querySelector('.ss-sentbar');
  if(bar){
    bar.title=s.pos+'% positive · '+s.neu+'% neutral · '+s.neg+'% negative';
    const segs={'.ss-sent-pos':s.pos,'.ss-sent-neu':s.neu,'.ss-sent-neg':s.neg};
    Object.keys(segs).forEach(sel=>{const e=bar.querySelector(sel);if(e)e.style.width=segs[sel]+'%';});
  }
}
function refreshKPIs(){
  randomizeSentiment();
  const cards=document.querySelectorAll('.brief-stats .ss');
  cards.forEach((card,i)=>{
    setTimeout(()=>{
      // Reveal card: spring entry (fade + scale)
      card.classList.remove('kpi-refresh');void card.offsetWidth;card.classList.add('kpi-refresh');
      // Count-up; scan ring + settle pulse fire on completion
      card.querySelectorAll('.ss-num').forEach(el=>{
        const target=parseFloat(el.dataset.val);
        if(!isNaN(target)){
          countUp(el,target,700,()=>{
            // Lock-on: scan ring confirms, number settles
            const ring=card.querySelector('.ss-scan-ring');
            if(ring){ring.classList.remove('ping');void ring.offsetWidth;ring.classList.add('ping');}
            el.classList.remove('settling');void el.offsetWidth;el.classList.add('settling');
          });
        }
      });
    },i*120);
  });
}
// ── Brief scan intro animation (replayable via the regenerate button) ──
function runBriefScan(){
  const _soc=typeof _SOC==='function'&&_SOC();
  const phases=_soc?[
    {pct:15, label:'Scanning posts...',     sub:'Fetching latest social mentions',   count:12},
    {pct:38, label:'Analysing accounts...', sub:'Cross-referencing influencers',      count:28},
    {pct:62, label:'Scoring sentiment...',  sub:'Running tone analysis',              count:39},
    {pct:84, label:'Ranking posts...',      sub:'Sorting by engagement',              count:43},
    {pct:100,label:'3 stories found',       sub:'Brief ready',                        count:44},
  ]:[
    {pct:15, label:'Scanning coverage...',  sub:'Fetching latest mentions',       count:12},
    {pct:38, label:'Analysing sources...',  sub:'Cross-referencing publications', count:28},
    {pct:62, label:'Scoring sentiment...',  sub:'Running tone analysis',          count:39},
    {pct:84, label:'Ranking stories...',    sub:'Sorting by relevance score',     count:43},
    {pct:100,label:'3 Tier 1 stories found',sub:'Brief ready',                   count:44},
  ];
  const sources=_soc?[
    {src:'@DITOphofficial', status:'found',    tier:'', time:'14h ago'},
    {src:'@jmccautosupply', status:'found',    tier:'', time:'15h ago'},
    {src:'@iamsuperbianca', status:'found',    tier:'', time:'15h ago'},
    {src:'@bilyonaryo_ph',  status:'found',    tier:'', time:'19h ago'},
    {src:'@OfficialiWant',  status:'found',    tier:'', time:'20h ago'},
    {src:'@ofc_iwant',      status:'scanning', tier:'', time:''},
  ]:[
    {src:'Philippine Daily Inquirer', status:'found',    tier:'T1', time:'14h ago'},
    {src:'ABS-CBN News',              status:'found',    tier:'T1', time:'15h ago'},
    {src:'Philstar Online',           status:'found',    tier:'T2', time:'15h ago'},
    {src:'BusinessWorld',             status:'found',    tier:'T2', time:'19h ago'},
    {src:'Manila Bulletin',           status:'found',    tier:'T2', time:'20h ago'},
    {src:'Rappler',                   status:'scanning', tier:'',   time:''},
  ];
  let phaseIdx=0,srcIdx=0;
  // reset overlay + reveal state so the scan can replay on regenerate
  const _bso=document.getElementById('bso');
  if(_bso){_bso.style.display='flex';_bso.classList.remove('hide');}
  const _feed=document.getElementById('bso-feed');if(_feed)_feed.innerHTML='';
  const _bar=document.getElementById('bso-bar');if(_bar)_bar.style.width='0%';
  const _ctr=document.getElementById('bso-counter');if(_ctr)_ctr.textContent='0';
  ['.b-title-row','.b-spark-row'].forEach(s=>{const el=document.querySelector(s);if(el)el.classList.remove('revealed');});
  ['.b-ai-tag','.b-trending-flag'].forEach(s=>{const el=document.querySelector(s);if(el)el.classList.remove('chip-in');});
  // Zero out stat values so no final number is ever visible before count-up runs
  document.querySelectorAll('.brief-stats .ss-num').forEach(el=>{el.textContent='0';});
  function addSourceRow(){
    const feed=document.getElementById('bso-feed');
    if(!feed||srcIdx>=sources.length)return;
    const s=sources[srcIdx++];
    const row=document.createElement('div');
    row.className='bso-feed-row';
    row.innerHTML=
      `<span class="bso-feed-dot ${s.status}"></span>`+
      `<span class="bso-feed-src">${s.src}</span>`+
      (s.tier?`<span class="bso-feed-tier">${s.tier}</span>`:'')+
      (s.time?`<span class="bso-feed-time">${s.time}</span>`:'')+
      `<span class="bso-feed-status ${s.status}">${s.status==='found'?'found':'scanning...'}</span>`;
    feed.appendChild(row);
  }
  function runPhase(){
    const bso=document.getElementById('bso');
    if(!bso)return;
    const p=phases[phaseIdx];
    const bar=document.getElementById('bso-bar');
    const lbl=document.getElementById('bso-label');
    const sub=document.getElementById('bso-sub');
    const ctr=document.getElementById('bso-counter');
    if(bar)bar.style.width=p.pct+'%';
    if(lbl)lbl.textContent=p.label;
    if(sub)sub.textContent=p.sub;
    if(ctr)countUp(ctr,p.count,580);
    // drip in 1-2 source rows per phase
    addSourceRow();
    if(phaseIdx>0)setTimeout(addSourceRow,320);
    phaseIdx++;
    if(phaseIdx<phases.length){setTimeout(runPhase,750);}
    else{
      setTimeout(()=>{
        bso.classList.add('hide');
        setTimeout(()=>{bso.style.display='none';},400);
        const tr=document.querySelector('.b-title-row');
        const sr=document.querySelector('.b-spark-row');
        const ai=document.querySelector('.b-ai-tag');
        const tf=document.querySelector('.b-trending-flag');
        if(tr)tr.classList.add('revealed');
        if(sr)sr.classList.add('revealed');
        setTimeout(()=>{if(ai)ai.classList.add('chip-in');},120);
        setTimeout(()=>{if(tf)tf.classList.add('chip-in');},220);
        setTimeout(refreshKPIs,440);
      },600);
    }
  }
  setTimeout(runPhase,300);
}
window.addEventListener('DOMContentLoaded',runBriefScan);
// Regenerate button: replay the scan + refresh KPIs, and bump the freshness label
function regenerateBrief(e){
  if(e&&e.stopPropagation)e.stopPropagation();
  const btn=e&&e.currentTarget;
  if(btn){btn.classList.remove('spin');void btn.offsetWidth;btn.classList.add('spin');setTimeout(()=>btn.classList.remove('spin'),1000);}
  const u=document.querySelector('.b-updated');
  if(u)u.innerHTML='<i data-lucide="clock" class="icon-sm"></i> Updated just now';
  runBriefScan();
  if(window.initIcons)initIcons();
}
// ── ⌘K / Ctrl+K → focus filter search ──
document.addEventListener('keydown',function(e){
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){
    const input=document.querySelector('.fc-search input');
    if(input){e.preventDefault();input.focus();input.select();}
  }
});
// Hide ⌘K badge while input is focused, restore on blur
(function(){
  const input=document.querySelector('.fc-search input');
  const kbd=document.querySelector('.fc-search-kbd');
  if(!input||!kbd)return;
  input.addEventListener('focus',()=>kbd.style.opacity='0');
  input.addEventListener('blur',()=>kbd.style.opacity='1');
})();

// ── DASHBOARD (Recharts) ──
const DB_COLORS={positive:'#16a34a',neutral:'#9ca3af',negative:'#dc2626'};
const DB_PALETTE=['#181d26','#e94f37','#b9a4f7','#86d9a8','#fde2b6','#f9a8b9','#c1e84a','#94a3b8'];
let dbRoots={};
const RC=React.createElement;

function dbMount(id,el){
  const dom=document.getElementById(id);
  if(!dom)return;
  function mount(){if(!dbRoots[id])dbRoots[id]=ReactDOM.createRoot(dom);dbRoots[id].render(el);}
  if(dom.clientWidth>0){mount();return;}
  const ro=new ResizeObserver(()=>{if(dom.clientWidth>0){ro.disconnect();mount();}});
  ro.observe(dom);
}

// ── Shared article table (ti-arttbl) — top-level so mentions/publishers/authors can reuse it ──
  const TI_ICN={online:{cls:'type-online',icon:'newspaper'},broadsheet:{cls:'type-broadsheet',icon:'file-text'},provincial:{cls:'type-provincial',icon:'newspaper'},tabloid:{cls:'type-tabloid',icon:'newspaper'},blog:{cls:'type-blog',icon:'rss'},magazine:{cls:'type-magazine',icon:'book-open'},tv:{cls:'type-tv',icon:'tv'},radio:{cls:'type-radio',icon:'radio'}};
  const tiIcn=t=>TI_ICN[t||'online']||TI_ICN.online;
  // Insights article list as a paginated table (Headline · Sentiment · ⋯) — screenshot-2 style.
  function tiArtPagerBtns(cur,pages){
    let b=`<button class="ti-pgb" onclick="tiArtTblPage(this,${cur-1})"${cur<=1?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
    for(let p=1;p<=pages;p++)b+=`<button class="ti-pgb num${p===cur?' on':''}" onclick="tiArtTblPage(this,${p})">${p}</button>`;
    b+=`<button class="ti-pgb" onclick="tiArtTblPage(this,${cur+1})"${cur>=pages?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
    return b;
  }
  // Sentiment → [dot-class, label] for the row dot + filter segments
  function _sentInfo(brand){
    if(brand==='positive')return['pos','Positive'];
    if(brand==='negative')return['neg','Negative'];
    if(brand==='neutral') return['neu','Neutral'];
    return['none','Not set'];
  }
  // origI = index into insArts (used for click-through); pos = position within the filtered set (used for paging/hidden)
  function artTr(d,origI,pos,per){
    const sel=(_artMode==='select'&&origI===insPrevIdx)?' selected':'';
    const clickFn=_artMode==='select'?_artSelFn:'openInsArticle';
    const rowOpen=`<tr class="ti-arttbl-row${sel}" data-i="${origI}"${pos>=per?' hidden':''} onclick="${clickFn}(${origI})">`;
    const more=`<td class="ti-arttbl-act"><button class="ti-arttbl-more" title="More" onclick="event.stopPropagation()"><i data-lucide="more-horizontal"></i></button></td>`;
    if(_artVar==='social'){
      const st=(typeof SOCIAL_TYPES!=='undefined'&&SOCIAL_TYPES[d.type])||{icon:'message-square',cls:'type-online'};
      const p=(typeof SOCIAL_PLATFORMS!=='undefined'&&SOCIAL_PLATFORMS[d.platform])||{icon:'fa-globe',color:'#6b7280',label:d.platform||'—'};
      const[sc,slbl]=_sentInfo(d.sentiment);
      const pt=(d.post||'').replace(/"/g,'&quot;');
      return `${rowOpen}
      <td class="ti-arttbl-hl"><div class="ti-arttbl-hlwrap"><span class="soc-plat-ico" title="${p.label}">${socIcon(p)}</span><div class="ti-arttbl-hltext"><div class="ti-arttbl-titlerow"><span class="ti-row-sent-dot ${sc}" title="${slbl}"></span><span class="ti-arttbl-title" title="${pt}">${d.post||''}</span></div><span class="ti-arttbl-meta">${d.influencer||''}${d.date?' · '+d.date:''}</span></div></div></td>
      <td class="ti-arttbl-sv">${d.reach}</td>
      <td class="ti-arttbl-ave">${d.engScore}</td>
      ${more}
    </tr>`;
    }
    const ic=tiIcn(d.type);
    const[sc,slbl]=_sentInfo(d.brand);
    const t=(d.title||'').replace(/"/g,'&quot;');
    return `${rowOpen}
      <td class="ti-arttbl-hl"><div class="ti-arttbl-hlwrap"><span class="hl-icon ${ic.cls}"><i data-lucide="${ic.icon}"></i></span><div class="ti-arttbl-hltext"><div class="ti-arttbl-titlerow"><span class="ti-row-sent-dot ${sc}" title="${slbl}"></span><span class="ti-arttbl-title" title="${t}">${d.title}</span></div><span class="ti-arttbl-meta">${d.sub||''}${d.date?' · '+d.date:''}</span></div></div></td>
      <td class="ti-arttbl-sv">${d.sv}</td>
      <td class="ti-arttbl-ave">${d.ave}</td>
      ${more}
    </tr>`;
  }
  // Sentiment filter + sort state for the Insights article table
  let insSentFilter='all',insSort='newest',_artMode='open',insSelArt=null,_artSelFn='selectInsArticle',_artVar=null;
  const _artSorts=[['sv-high','Highest Story Value'],['sv-low','Lowest Story Value'],['newest','Newest '+_wPosts(true)],['oldest','Oldest '+_wPost(true)],['ave-high','Highest AVE'],['ave-low','Lowest AVE']];
  // Comparable date value: absolute "Mon DD, YYYY" → timestamp; relative "N days ago" → negative offset; else 0 (keeps order)
  function _artDateVal(d){
    const s=String(d.date||''),t=Date.parse(s);
    if(!isNaN(t))return t;
    const m=s.match(/(\d+)\s*(hour|day|week|month|year)/i);
    if(m){const mult={hour:3.6e6,day:8.64e7,week:6.048e8,month:2.628e9,year:3.156e10}[m[2].toLowerCase()]||0;return -(+m[1]*mult);}
    return 0;
  }
  function _sortInsArts(){
    const key={'sv-high':d=>-(+d.sv||0),'sv-low':d=>(+d.sv||0),'ave-high':d=>-parseAve(d.ave),'ave-low':d=>parseAve(d.ave),
      'reach-high':d=>-parseAve(d.reach),'reach-low':d=>parseAve(d.reach),'eng-high':d=>-(parseFloat(d.engScore)||0),'eng-low':d=>(parseFloat(d.engScore)||0),
      'newest':d=>-_artDateVal(d),'oldest':d=>_artDateVal(d)}[insSort];
    if(!key)return;
    insArts=insArts.map((d,i)=>[d,i]).sort((a,b)=>{const ka=key(a[0]),kb=key(b[0]);return ka!==kb?ka-kb:a[1]-b[1];}).map(x=>x[0]);
  }
  // Social posts carry sentiment on .sentiment; articles on .brand
  function _insSent(d){return _artVar==='social'?d.sentiment:d.brand;}
  function _insFilteredPairs(){return insArts.map((d,i)=>[d,i]).filter(p=>insSentFilter==='all'||_insSent(p[0])===insSentFilter);}
  function _artTblRowsHtml(per){
    const pairs=_insFilteredPairs();
    if(!pairs.length)return `<tr class="ti-arttbl-empty"><td colspan="4">No ${_artVar==='social'?'posts':'articles'} match this sentiment.</td></tr>`;
    return pairs.map(([d,origI],pos)=>artTr(d,origI,pos,per)).join('');
  }
  // ── Per-column header filter/sort menus ──
  const _SENT_VALS=['all','positive','neutral','negative'];
  function _artOpt(kind,val,label,dotCls){
    const active=(kind==='sent'?insSentFilter:insSort)===val;
    const dot=dotCls!==undefined?`<span class="ti-opt-dot ${dotCls}"></span>`:'';
    return `<div class="at-type-opt${active?' active':''}" data-val="${val}" onclick="tiArtPick(this,'${kind}','${val}')"><span class="ti-opt-l">${dot}${label}</span></div>`;
  }
  // col: 'sent' (Headline → sentiment + date sort), 'sv', 'ave'
  function _artHdrDD(title,col){
    const on = col==='sent'  ? (insSentFilter!=='all'||insSort==='oldest')
             : col==='sv'    ? (insSort==='sv-high'||insSort==='sv-low')
             : col==='reach' ? (insSort==='reach-high'||insSort==='reach-low')
             : col==='eng'   ? (insSort==='eng-high'||insSort==='eng-low')
             :                 (insSort==='ave-high'||insSort==='ave-low');
    let opts;
    if(col==='sent'){
      opts=_artOpt('sent','all','All','')+_artOpt('sent','positive','Positive','pos')+_artOpt('sent','neutral','Neutral','neu')+_artOpt('sent','negative','Negative','neg')
          +`<div class="at-type-sep"></div>`+_artOpt('sort','newest','Newest first')+_artOpt('sort','oldest','Oldest first');
    }else if(col==='sv'){
      opts=_artOpt('sort','sv-high','Highest first')+_artOpt('sort','sv-low','Lowest first');
    }else if(col==='reach'){
      opts=_artOpt('sort','reach-high','Highest first')+_artOpt('sort','reach-low','Lowest first');
    }else if(col==='eng'){
      opts=_artOpt('sort','eng-high','Highest first')+_artOpt('sort','eng-low','Lowest first');
    }else{
      opts=_artOpt('sort','ave-high','Highest first')+_artOpt('sort','ave-low','Lowest first');
    }
    const align=col==='sent'?'':' align-right';
    return `<div class="at-type-dd ti-hdr-dd"><span class="th-inner"><span class="ti-hdr-label" title="${title}">${title}</span><i data-lucide="filter" class="th-filter ti-hdr-ico${on?' on':''}" data-col="${col}" onclick="tiHdrMenu(event,this)"></i></span><div class="at-type-menu ti-hdr-menu${align}">${opts}</div></div>`;
  }
  window.tiHdrMenu=function(e,ico){
    e.stopPropagation();
    const dd=ico.closest('.at-type-dd'),menu=dd&&dd.querySelector('.ti-hdr-menu');if(!menu)return;
    const willOpen=!menu.classList.contains('open');
    document.querySelectorAll('.ti-hdr-menu.open').forEach(m=>m.classList.remove('open'));
    if(willOpen)menu.classList.add('open');
  };
  window.tiArtPick=function(el,kind,val){
    const wrap=el.closest('.ti-arttbl-wrap');if(!wrap)return;
    if(kind==='sent'){insSentFilter=val;}
    else if(_artMode==='select'){insSort=val;_sortInsArts();if(insSelArt)insPrevIdx=insArts.indexOf(insSelArt);}
    else{insSort=val;_sortInsArts();}
    _rebuildArtTblBody(wrap);
    _syncArtHdr(wrap);
    wrap.querySelectorAll('.ti-hdr-menu.open').forEach(m=>m.classList.remove('open'));
  };
  function _syncArtHdr(wrap){
    wrap.querySelectorAll('.ti-hdr-menu .at-type-opt').forEach(o=>{
      const v=o.dataset.val,isSent=_SENT_VALS.includes(v);
      o.classList.toggle('active',isSent?insSentFilter===v:insSort===v);
    });
    const set=(col,onState)=>{const ic=wrap.querySelector('.ti-hdr-ico[data-col="'+col+'"]');if(ic)ic.classList.toggle('on',onState);};
    set('sent',insSentFilter!=='all'||insSort==='oldest');
    set('sv',insSort==='sv-high'||insSort==='sv-low');
    set('ave',insSort==='ave-high'||insSort==='ave-low');
  }
  // Rebuild tbody + pager from the current sort+filter
  function _rebuildArtTblBody(wrap){
    const per=+wrap.dataset.per;
    const tbody=wrap.querySelector('tbody');if(tbody)tbody.innerHTML=_artTblRowsHtml(per);
    wrap.dataset.page=1;
    const total=_insFilteredPairs().length,pages=Math.max(1,Math.ceil(total/per)),shown=Math.min(per,total);
    const pager=wrap.querySelector('.ti-arttbl-pager');
    if(pager){
      pager.hidden=pages<=1;
      const info=pager.querySelector('.ti-arttbl-info');if(info)info.textContent=total?`1–${shown} of ${total}`:'0 of 0';
      const btns=pager.querySelector('.ti-arttbl-btns');if(btns)btns.innerHTML=tiArtPagerBtns(1,pages);
    }
    initIcons();
  }
  window.tiArtFilterSent=function(el,val){
    insSentFilter=val;
    const wrap=el.closest('.ti-arttbl-wrap');if(!wrap)return;
    wrap.querySelectorAll('.ti-sf-seg').forEach(b=>b.classList.toggle('on',b.dataset.val===val));
    _rebuildArtTblBody(wrap);
  };
  window.tiArtSort=function(el){
    insSort=el.value;
    const wrap=el.closest('.ti-arttbl-wrap');if(!wrap)return;
    _sortInsArts();
    _rebuildArtTblBody(wrap);
  };
  // Article preview (publishers-style 3-column) opened from an Insights table row.
  let insArts=[],insPrevIdx=-1,insSidebarWasCollapsed=false,insSrcSub='',insSrcTitle='';
  window.openInsArticle=function(i){
    const d=insArts[i];if(!d)return;
    if(d.platform&&window.WS_DATA&&window.WS_DATA.socialMentions)return openInsSocial(i);   // Shared View: social post → social preview
    const page=document.getElementById('page-dashboard');
    if(!page||!document.getElementById('adp-col-mid'))return;
    insPrevIdx=i;insSelArt=d;
    // Capture where this list came from (e.g. "Timeline · last 7 days" / "Jun 17, 2026") before closing the panel
    const s=(window.__curSrc?window.__curSrc():null);insSrcSub=(s&&s.sub&&s.sub())||'';insSrcTitle=(s&&s.detailTitle&&s.detailTitle())||'';
    if(window.closeInsights)window.closeInsights();          // tuck the Insights slide-over away
    const sb=document.querySelector('.sidebar');
    insSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
    if(sb)sb.classList.add('collapsed');
    mdSpotCtx=null;mdActCtx=null;mdActive=-1;                // display-only context
    page.classList.add('ent-detail-open');
    renderInlineDetail(d);
    _renderInsPrevList();
    initIcons();
  };
  // Shared View: open the social content-card preview (reuses renderSocialDetail) with a social rail on the left.
  function openInsSocial(i){
    const d=insArts[i];if(!d)return;
    const page=document.getElementById('page-dashboard');if(!page||!document.getElementById('adp-col-mid'))return;
    const list=window.WS_DATA.socialMentions,realIdx=list.indexOf(d);if(realIdx<0)return;
    const s=(window.__curSrc?window.__curSrc():null);insSrcSub=(s&&s.sub&&s.sub())||'';insSrcTitle=(s&&s.detailTitle&&s.detailTitle())||'';
    if(window.closeInsights)window.closeInsights();
    const sb=document.querySelector('.sidebar');insSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');if(sb)sb.classList.add('collapsed');
    mdSocialActive=realIdx;mdSpotCtx=null;mdActCtx=null;mdActive=-1;
    page.classList.add('ent-detail-open');
    renderSocialDetail(realIdx);                                         // middle + right social card (leaves the left col)
    const adp=document.getElementById('article-detail-panel');if(adp)adp.classList.remove('social-detail');   // keep the 3-column rail layout
    _renderInsSocialRail();
    initIcons();
  }
  function _renderInsSocialRail(){
    const left=document.getElementById('adp-col-left');if(!left)return;
    const list=window.WS_DATA&&window.WS_DATA.socialMentions;if(!list)return;
    insPrevIdx=mdSocialActive;insSelArt=list[mdSocialActive]||list[0]||null;
    left.innerHTML=`<div class="ins-rail-head">
        <span class="ti-head-badge"><i data-lucide="message-square"></i></span>
        <div class="ti-head-titles"><div class="ti-head-title">${insSrcTitle||'Social posts'}</div>${insSrcSub?`<div class="ti-head-sub">${insSrcSub}</div>`:''}</div>
      </div>
      ${renderArtTable(list,{mode:'select',onSelect:'selectInsSocial',variant:'social',preserve:true})}`;
  }
  window.selectInsSocial=function(pos){
    const list=window.WS_DATA&&window.WS_DATA.socialMentions;if(!list)return;
    const d=insArts[pos];if(!d)return;
    const realIdx=list.indexOf(d);if(realIdx<0)return;
    mdSocialActive=realIdx;insPrevIdx=pos;insSelArt=d;
    renderSocialDetail(realIdx);
    const adp=document.getElementById('article-detail-panel');if(adp)adp.classList.remove('social-detail');
    const wrap=document.querySelector('#adp-col-left .ti-arttbl-wrap');
    if(wrap)wrap.querySelectorAll('.ti-arttbl-row').forEach(r=>r.classList.toggle('selected',+r.dataset.i===pos));
    initIcons();
  };
  window.selectInsArticle=function(i){
    const d=insArts[i];if(!d)return;
    insPrevIdx=i;insSelArt=d;
    renderInlineDetail(d);
    // Move the highlight on the existing rail rows (no full rebuild → keeps filter/sort/scroll)
    const wrap=document.querySelector('#adp-col-left .ti-arttbl-wrap');
    if(wrap)wrap.querySelectorAll('.ti-arttbl-row').forEach(r=>r.classList.toggle('selected',+r.dataset.i===i));
    initIcons();
  };
  window.closeInsArticle=function(){
    const page=document.getElementById('page-dashboard');if(page)page.classList.remove('ent-detail-open');
    const sb=document.querySelector('.sidebar');
    if(sb&&!insSidebarWasCollapsed)sb.classList.remove('collapsed');
  };
  // Open the 3-column preview for an arbitrary article list + heading (Explore-view graphs / publisher cards).
  window.openInsArticlesFor=function(arts,title,sub){
    if(!arts||!arts.length)return;
    const page=document.getElementById('page-dashboard');
    if(!page||!document.getElementById('adp-col-mid'))return;
    insArts=arts;insPrevIdx=0;insSelArt=arts[0]||null;insSrcTitle=title||'';insSrcSub=sub||'';
    const sb=document.querySelector('.sidebar');
    insSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
    if(sb)sb.classList.add('collapsed');
    mdSpotCtx=null;mdActCtx=null;mdActive=-1;
    page.classList.add('ent-detail-open');
    renderInlineDetail(arts[0]);
    _renderInsPrevList();
    initIcons();
  };
  window.openInsPubArticles=function(name,el){window.openInsListPanel(getEntityArticles('pub',name),name,'Top Publisher',el);};
  // Left column: reuse the Insights article table (compact + select mode) so the rail matches the slide-over list.
  function _renderInsPrevList(){
    const left=document.getElementById('adp-col-left');if(!left)return;
    insSelArt=insArts[insPrevIdx]||insArts[0]||null;
    left.innerHTML=`<div class="ins-rail-head">
        <span class="ti-head-badge"><i data-lucide="file-text"></i></span>
        <div class="ti-head-titles"><div class="ti-head-title">${insSrcTitle||'Related articles'}</div>${insSrcSub?`<div class="ti-head-sub">${insSrcSub}</div>`:''}</div>
        <button class="btn-export ti-head-export" onclick="showTrackerToast('Articles exported')">Export</button>
      </div>
      ${renderArtTable(insArts,{mode:'select',preserve:true})}`;
  }
  // mentions.html detail view: render the current mentions feed as the ti-arttbl rail (reuses the Insights table).
  // Each row carries its real mentionData index (_mi) so sort/filter in the rail never desyncs selection.
  window.renderMentDetailRail=function(){
    const host=document.getElementById('ment-detail-rail');if(!host)return;
    const list=mentTableData().map((d,i)=>Object.assign({},d,{_mi:i}));
    insSelArt=list.find(x=>x._mi===mdActive)||list[0]||null;
    host.innerHTML=renderArtTable(list,{mode:'select',onSelect:'openMentionRail'});
    initIcons();
  };
  window.openMentionRail=function(pos){
    const d=insArts[pos];if(!d)return;
    insPrevIdx=pos;insSelArt=d;mdActive=d._mi;
    renderInlineDetail(mentionData[d._mi]);          // update the middle + right panels
    const wrap=document.querySelector('#ment-detail-rail .ti-arttbl-wrap');
    if(wrap)wrap.querySelectorAll('.ti-arttbl-row').forEach(r=>r.classList.toggle('selected',+r.dataset.i===pos));
    initIcons();
  };
  // Shared View (social): render the social posts as the ti-arttbl rail (Post · Source · Reach · Eng Score)
  window.renderSocialDetailRail=function(){
    const host=document.getElementById('ment-detail-rail');if(!host)return;
    const src=(window.WS_DATA&&window.WS_DATA.socialMentions)||[];
    const list=src.map((d,i)=>Object.assign({},d,{_mi:i}));
    insSelArt=list.find(x=>x._mi===mdSocialActive)||list[0]||null;
    host.innerHTML=renderArtTable(list,{mode:'select',onSelect:'openSocialRail',variant:'social'});
    initIcons();
  };
  window.openSocialRail=function(pos){
    const d=insArts[pos];if(!d)return;
    insPrevIdx=pos;insSelArt=d;mdSocialActive=d._mi;
    renderSocialDetail(d._mi);                        // update the middle + right panels (social post)
    const wrap=document.querySelector('#ment-detail-rail .ti-arttbl-wrap');
    if(wrap)wrap.querySelectorAll('.ti-arttbl-row').forEach(r=>r.classList.toggle('selected',+r.dataset.i===pos));
    initIcons();
  };
  // ── Shared View → Influencers: open the social post preview (reuses renderSocialDetail) with a publisher-style header rail ──
  window.openInflSocial=function(realIdx){
    const list=window.WS_DATA&&window.WS_DATA.socialMentions,s=list&&list[realIdx];
    const page=document.getElementById('page-authors');
    if(!s||!page||!document.getElementById('adp-col-mid'))return;
    const sb=document.querySelector('.sidebar');entSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');if(sb)sb.classList.add('collapsed');
    mdSocialActive=realIdx;mdSpotCtx=null;mdActCtx=null;mdActive=-1;
    page.classList.add('ent-detail-open');
    renderSocialDetail(realIdx);                                         // middle + right social card
    const adp=document.getElementById('article-detail-panel');if(adp)adp.classList.remove('social-detail');   // keep the 3-column rail layout
    _renderInflSocialRail();
    initIcons();
  };
  function _renderInflSocialRail(){
    const left=document.getElementById('adp-col-left');if(!left)return;
    const list=window.WS_DATA&&window.WS_DATA.socialMentions;if(!list)return;
    insPrevIdx=mdSocialActive;insSelArt=list[mdSocialActive]||list[0]||null;
    const name=authorSel||'';
    const arts=getEntityArticles('author',name);
    const avgSv=arts.length?(arts.reduce((s,d)=>s+(d.sv||0),0)/arts.length):0;
    const score=(avgSv*2).toFixed(2);
    const iStats=(window.WS_DATA.influencerStats&&window.WS_DATA.influencerStats[name])||{};
    const subs=fmtCount(iStats.subscribers||0);
    const sPost=list[mdSocialActive]||list[0]||{};   // header icon tracks the selected post's platform
    const hp=SOCIAL_PLATFORMS[sPost.platform]||{icon:'fa-globe',color:'#6b7280',label:sPost.platform||'—'};
    left.innerHTML=`<div class="ent-prev-head">
        <div class="ent-prev-head-l"><div class="spot-panel-title" data-btip="${_makeTip({label:name})}">${name}</div><span class="ent-prev-head-plat" id="infl-head-plat" title="${hp.label}">${socIcon(hp)}</span></div>
        <div class="ent-detail-stats">
          <div class="ent-stat"><div class="ent-stat-val">${score}</div><div class="ent-stat-lbl">Influencer Score</div></div>
          <div class="ent-stat"><div class="ent-stat-val">${subs}</div><div class="ent-stat-lbl">Subscribers</div></div>
          <div class="ent-stat"><div class="ent-stat-val">${arts.length}</div><div class="ent-stat-lbl">Total Post</div></div>
        </div>
      </div>
      ${renderArtTable(list,{mode:'select',onSelect:'selectInflSocial',variant:'social',preserve:true})}`;
  }
  window.selectInflSocial=function(pos){
    const list=window.WS_DATA&&window.WS_DATA.socialMentions;if(!list)return;
    const d=insArts[pos];if(!d)return;const realIdx=list.indexOf(d);if(realIdx<0)return;
    mdSocialActive=realIdx;insPrevIdx=pos;insSelArt=d;
    renderSocialDetail(realIdx);
    const adp=document.getElementById('article-detail-panel');if(adp)adp.classList.remove('social-detail');
    const hp=document.getElementById('infl-head-plat');
    if(hp){const p=SOCIAL_PLATFORMS[d.platform]||{icon:'fa-globe',color:'#6b7280',label:d.platform||'—'};hp.innerHTML=socIcon(p);hp.title=p.label;}
    const wrap=document.querySelector('#adp-col-left .ti-arttbl-wrap');
    if(wrap)wrap.querySelectorAll('.ti-arttbl-row').forEach(r=>r.classList.toggle('selected',+r.dataset.i===pos));
    initIcons();
  };
  function renderArtTable(arts,opts){
    opts=opts||{};
    insArts=arts;
    _artMode=opts.mode==='select'?'select':'open';
    _artSelFn=opts.onSelect||'selectInsArticle';
    _artVar=opts.variant||null;
    if(!opts.preserve){insSentFilter='all';insSort='newest';_sortInsArts();if(_artMode==='select'&&insSelArt)insPrevIdx=insArts.indexOf(insSelArt);}
    const compact=(opts.compact?' ti-arttbl-compact':'')+(_artVar==='social'?' ti-arttbl-social':'');
    const per=15,total=insArts.length,pages=Math.max(1,Math.ceil(total/per)),shown=Math.min(per,total);
    const thead=_artVar==='social'
      ? `<th>${_artHdrDD('Post','sent')}</th><th class="ti-c-sv">${_artHdrDD('Est. Reach','reach')}</th><th class="ti-c-ave">${_artHdrDD('Eng Score','eng')}</th><th class="ti-c-act" aria-label="actions"></th>`
      : `<th>${_artHdrDD('Headline','sent')}</th><th class="ti-c-sv">${_artHdrDD('Story Value','sv')}</th><th class="ti-c-ave">${_artHdrDD('AVE','ave')}</th><th class="ti-c-act" aria-label="actions"></th>`;
    return `<div class="ti-arttbl-wrap${compact}" data-per="${per}" data-page="1">
      <table class="ti-arttbl"><thead><tr>${thead}</tr></thead><tbody>${_artTblRowsHtml(per)}</tbody></table>
      <div class="ti-arttbl-pager"${pages>1?'':' hidden'}><div class="ti-arttbl-info">${total?`1–${shown} of ${total}`:'0 of 0'}</div><div class="ti-arttbl-btns">${tiArtPagerBtns(1,pages)}</div></div>
    </div>`;
  }
  // Dashboard Insights slide-over: Shared View → the social posts in the social variant; else the passed news articles.
  function renderInsTable(arts){
    if(window.WS_DATA&&window.WS_DATA.socialMentions)return renderArtTable(window.WS_DATA.socialMentions.slice(),{variant:'social'});   // slice: renderArtTable sorts in place
    return renderArtTable(arts);
  }
  window.tiArtTblPage=function(el,page){
    const wrap=el.closest('.ti-arttbl-wrap');if(!wrap)return;
    const per=+wrap.dataset.per,rows=[...wrap.querySelectorAll('tbody tr')],total=rows.length,pages=Math.max(1,Math.ceil(total/per));
    page=Math.max(1,Math.min(pages,page));wrap.dataset.page=page;
    rows.forEach((r,i)=>{r.hidden=!(i>=(page-1)*per&&i<page*per);});
    const start=(page-1)*per,end=Math.min(total,page*per);
    const info=wrap.querySelector('.ti-arttbl-info');if(info)info.textContent=`${start+1}–${end} of ${total}`;
    const btns=wrap.querySelector('.ti-arttbl-btns');if(btns)btns.innerHTML=tiArtPagerBtns(page,pages);
    initIcons();
  };

function initDashboard(){
  if(!window.Recharts||!window.Recharts.ResponsiveContainer){
    document.querySelectorAll('.db-chart-wrap').forEach(el=>{
      el.style.cssText+='display:flex;align-items:center;justify-content:center;';
      el.innerHTML='<span style="font-size:12px;color:#9ca3af">Chart library unavailable — check network</span>';
    });
    return;
  }
  const{
    ResponsiveContainer,ComposedChart,BarChart,ScatterChart,PieChart,
    Area,Line,Bar,Scatter,Pie,Cell,
    XAxis,YAxis,CartesianGrid,Tooltip,Legend,LabelList,Brush,ReferenceArea,Customized,Rectangle,Sector
  }=window.Recharts;
  const TT={
    contentStyle:{background:'#181d26',border:'none',borderRadius:6,padding:'8px 12px'},
    itemStyle:{color:'#fff',fontSize:12,fontFamily:'Inter'},
    labelStyle:{color:'#fff',fontSize:12,fontFamily:'Inter'}
  };

  // ── Timeline (composed: day-stripes + bollinger band + results bars + value line + brush) ──
  const TL_MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const TL_FULL=(function(){
    const end=new Date(2026,5,23),N=30;                 // 30 days ending Jun 23, 2026
    const tail={0:15,1:56,2:150,3:70,4:65,5:12,6:45,7:78,8:5}; // last 9 days = the screenshot
    const out=[];
    for(let i=N-1;i>=0;i--){
      const d=new Date(end);d.setDate(end.getDate()-i);
      const results=i<=8?tail[8-i]:30+((i*37)%70);
      const sv=0;                                       // constant → perfectly straight line
      const proj=0;
      out.push({
        date:`${d.getDate()}. ${TL_MONTHS[d.getMonth()]}`,
        fullDate:`${TL_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
        results,storyValue:sv,projAvg:proj,band:[proj-12,proj+12]   // constant straight band
      });
    }
    return out;
  })();
  function tlRow(color,name,val){
    return RC('div',{key:name,style:{display:'flex',alignItems:'center',gap:8,fontSize:12,margin:'3px 0'}},
      RC('span',{style:{width:7,height:7,borderRadius:'50%',background:color,flexShrink:0}}),
      RC('span',{style:{color:'rgba(255,255,255,0.62)',flex:1,whiteSpace:'nowrap'}},name),
      RC('span',{style:{color:'#fff',fontWeight:600,marginLeft:18}},val));
  }
  function TLTooltip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    const p=o.payload[0].payload;
    return RC('div',{style:{background:'#181d26',border:'none',borderRadius:8,padding:'10px 13px',boxShadow:'0 6px 20px rgba(0,0,0,0.28)',minWidth:232}},
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:7,fontSize:12.5}},p.fullDate),
      tlRow('#b9a4f7','Total Story Value',p.storyValue),
      tlRow('#9ca3af','Projected 7 days Average',p.projAvg),
      tlRow('#b9a4f7','Max 7 days Forecast',p.band[1]),
      tlRow('#cfc3f3','Min 7 days Forecast',p.band[0]),
      RC('div',{style:{height:1,background:'rgba(255,255,255,0.12)',margin:'7px 0'}}),
      tlRow('#16a34a','Total Results',p.results));
  }
  let tlRange=7,tlSelectedDate=null;
  function buildTimeline(rangeDays,mountId){
    if(!mountId)tlRange=rangeDays;
    const data=TL_FULL.slice(-rangeDays);
    const maxR=Math.max(...data.map(d=>d.results),10);
    // Alternating single-day stripes (zebra), full plot height
    const stripes=[];
    for(let i=0;i<data.length;i+=2)
      stripes.push(RC(ReferenceArea,{key:'st'+i,yAxisId:'r',x1:data[i].date,x2:data[i].date,fill:'rgba(24,29,38,0.04)',fillOpacity:1,stroke:'none'}));
    dbMount(mountId||'db-timeline',RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(ComposedChart,{data,margin:{top:16,right:18,bottom:4,left:48}},
        ...stripes,
        RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
        RC(XAxis,{dataKey:'date',scale:'point',padding:{left:40,right:40},tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false}),
        RC(YAxis,{yAxisId:'v',orientation:'left',domain:[-110,90],tick:false,axisLine:false,tickLine:false,width:0}),
        RC(YAxis,{yAxisId:'r',orientation:'left',domain:[0,Math.ceil(maxR*2.6)],tick:false,axisLine:false,tickLine:false,width:0}),
        RC(Customized,{component:(props)=>{
          const o=props.offset||{};const top=o.top||16,h=o.height||300,left=o.left||48;
          const rMax=Math.ceil(maxR*2.6);
          const title=(label,yFrac)=>{const y=top+h*yFrac;return RC('text',{key:'t'+label,x:11,y,transform:`rotate(-90 11 ${y})`,textAnchor:'middle',fontSize:10.5,fill:'#9ca3af'},label);};
          const num=(val,yFrac,key)=>RC('text',{key:'n'+key,x:left-7,y:top+h*yFrac+4,textAnchor:'end',fontSize:11,fill:'#6b7280'},val);
          return RC('g',{},
            title('Total Story Value',0.42),title('Total Results',0.80),
            num('0',0.45,'sv'),num('100',1-100/rMax,'r100'),num('0',0.985,'r0'));
        }}),
        RC(Tooltip,{content:TLTooltip,cursor:{stroke:'#9097a3',strokeWidth:1}}),
        RC(Legend,{verticalAlign:'bottom',height:40,iconSize:10,wrapperStyle:{fontSize:11,color:'#6b7280',paddingTop:18}}),
        RC(Area,{yAxisId:'v',type:'monotone',dataKey:'band',name:'Bollinger Bands',stroke:'none',fill:'#b9a4f7',fillOpacity:0.22,legendType:'circle',dot:false,activeDot:false}),
        RC(Bar,{yAxisId:'r',dataKey:'results',name:'Total Results Bar',fill:'#16a34a',maxBarSize:42,radius:[3,3,0,0],legendType:'circle',cursor:'pointer',
          onClick:(d)=>{const fd=d&&(d.fullDate||(d.payload&&d.payload.fullDate));if(fd)openTimelineDay(fd);}},
          data.map((d,i)=>RC(Cell,{key:'c'+i,fill:'#16a34a',fillOpacity:(tlSelectedDate&&d.fullDate!==tlSelectedDate)?0.3:1}))),
        RC(Line,{yAxisId:'v',type:'linear',dataKey:'projAvg',name:'Projected Average',stroke:'#9ca3af',strokeWidth:1.5,strokeDasharray:'4 3',dot:false,activeDot:false,legendType:'plainline'}),
        RC(Line,{yAxisId:'v',type:'linear',dataKey:'storyValue',name:'Total Story Value',stroke:'#b9a4f7',strokeWidth:1.75,dot:{r:3,fill:'#b9a4f7',stroke:'#fff',strokeWidth:1},activeDot:{r:5,fill:'#b9a4f7'},legendType:'plainline'}),
        RC(Brush,{dataKey:'date',height:36,stroke:'#d4d4d8',travellerWidth:8,tickFormatter:()=>''},
          RC(Area,{dataKey:'results',type:'monotone',stroke:'#16a34a',fill:'#86d9a8',fillOpacity:0.55}))
      )));
  }
  // ── Timeline Insights panel ──
  const toneColor=t=>t==='positive'?'#16a34a':t==='negative'?'#e94f37':'#9ca3af';
  const tlData=()=>TL_FULL.slice(-tlRange);
  const rangeLabel=()=>({3:'last 3 days',7:'last 7 days',15:'last 15 days',30:'last 30 days'}[tlRange]||('last '+tlRange+' days'));
  let tiOpen=false,tiMode='overview',tiKey=null,tiSource='timeline',_insSuppressClose=false;
  function dayArticles(day){
    const list=mentionData.filter(d=>d.date===day.fullDate);
    let seed=0;for(let i=0;i<day.fullDate.length;i++)seed=(seed*31+day.fullDate.charCodeAt(i))>>>0;
    const want=Math.max(3,Math.min(8,Math.round(day.results/14)));
    for(let k=0;list.length<want&&k<mentionData.length*3;k++){
      const cand=mentionData[(seed+k*7)%mentionData.length];
      if(!list.includes(cand))list.push(cand);
    }
    return list;
  }
  function artRow(d){
    const ic=tiIcn(d.type),src=d.sub||d.outlet||'';
    return `<div class="ti-art">
      <span class="hl-icon ${ic.cls}"><i data-lucide="${ic.icon}"></i></span>
      <div class="ti-art-main">
        <div class="ti-art-hl">${d.title}</div>
        <div class="ti-art-meta"><span>${src}</span><span class="aa-dot">·</span><span>${d.date}</span><span class="aa-dot">·</span><span>${d.ave||''}</span></div>
      </div>
      <span class="ti-sent-dot" style="background:${toneColor(d.tone)}" title="${d.tone||'neutral'}"></span>
    </div>`;
  }
  function tiAnalysis(){
    const data=tlData(),n=data.length,results=data.map(d=>d.results);
    const total=results.reduce((a,b)=>a+b,0),avg=Math.round(total/n);
    let peak=data[0],trough=data[0];
    data.forEach(d=>{if(d.results>peak.results)peak=d;if(d.results<trough.results)trough=d;});
    const first=data[0],last=data[n-1];
    const trendPct=first.results?Math.round(((last.results-first.results)/first.results)*100):0;
    let spike=null,drop=null;
    for(let i=1;i<n;i++){const delta=data[i].results-data[i-1].results;
      if(spike===null||delta>spike.delta)spike={day:data[i],delta};
      if(drop===null||delta<drop.delta)drop={day:data[i],delta};}
    const h=Math.max(1,Math.floor(n/3));
    const lastAvg=Math.round(results.slice(-h).reduce((a,b)=>a+b,0)/h);
    const prevAvg=Math.round(results.slice(-2*h,-h).reduce((a,b)=>a+b,0)/h)||lastAvg;
    const topDays=[...data].sort((a,b)=>b.results-a.results).slice(0,3);
    const srcMap={};
    data.forEach(d=>dayArticles(d).forEach(a=>{const s=a.sub||a.outlet;if(s)srcMap[s]=(srcMap[s]||0)+1;}));
    const topSources=Object.entries(srcMap).sort((a,b)=>b[1]-a[1]).slice(0,4);
    return {n,total,avg,peak,trough,first,last,trendPct,spike,drop,lastAvg,prevAvg,topDays,topSources};
  }
  function tiOverviewHTML(){
    const a=tiAnalysis();
    const tCls=a.trendPct>=0?'ti-up':'ti-down',tSign=a.trendPct>=0?'+':'';
    const momUp=a.lastAvg>=a.prevAvg;
    const topMax=a.topDays[0]?a.topDays[0].results:1;
    const srcMax=a.topSources[0]?a.topSources[0][1]:1;
    return `
      <div class="ti-narrative">Coverage ${a.trendPct>=0?'climbed':'eased'} over the ${rangeLabel()}, peaking on <b>${a.peak.date}</b> with <b>${a.peak.results}</b> results. The quietest day was <b>${a.trough.date}</b> (${a.trough.results}).</div>
      <div class="ti-stats">
        <div class="ti-stat"><div class="ti-stat-lbl">Total results</div><div class="ti-stat-val">${a.total.toLocaleString()}</div><div class="ti-stat-sub">across ${a.n} days</div></div>
        <div class="ti-stat"><div class="ti-stat-lbl">Peak day</div><div class="ti-stat-val">${a.peak.results}</div><div class="ti-stat-sub">${a.peak.date}</div></div>
        <div class="ti-stat"><div class="ti-stat-lbl">Daily average</div><div class="ti-stat-val">${a.avg}</div><div class="ti-stat-sub">results / day</div></div>
        <div class="ti-stat"><div class="ti-stat-lbl">Trend</div><div class="ti-stat-val ${tCls}">${tSign}${a.trendPct}%</div><div class="ti-stat-sub">first → last day</div></div>
      </div>
      <div>
        <div class="ti-sec-title"><i data-lucide="trending-up"></i> Key trends</div>
        <div class="ti-insight"><i data-lucide="${a.trendPct>=0?'arrow-up-right':'arrow-down-right'}"></i><div>Overall <b class="${tCls}">${tSign}${a.trendPct}%</b> from ${a.first.date} (${a.first.results}) to ${a.last.date} (${a.last.results}).</div></div>
        <div class="ti-insight"><i data-lucide="activity"></i><div>Momentum is <b>${momUp?'building':'cooling'}</b> — recent days average <b>${a.lastAvg}</b> vs ${a.prevAvg} earlier.</div></div>
        <div class="ti-insight"><i data-lucide="bar-chart-2"></i><div>Daily volume ranges <b>${a.trough.results}–${a.peak.results}</b> results.</div></div>
      </div>
      <div>
        <div class="ti-sec-title"><i data-lucide="zap"></i> Notable spikes &amp; drops</div>
        ${a.spike?`<div class="ti-callout" onclick="openTimelineDay('${a.spike.day.fullDate}')">
          <span class="ti-callout-ic" style="background:rgba(22,163,74,0.12);color:#16a34a"><i data-lucide="trending-up"></i></span>
          <div class="ti-callout-main"><div class="ti-callout-lbl">Spike on ${a.spike.day.date}</div><div class="ti-callout-sub">Biggest day-over-day rise</div></div>
          <span class="ti-callout-val ti-up">+${a.spike.delta}</span></div>`:''}
        ${a.drop?`<div class="ti-callout" onclick="openTimelineDay('${a.drop.day.fullDate}')">
          <span class="ti-callout-ic" style="background:rgba(233,79,55,0.12);color:#e94f37"><i data-lucide="trending-down"></i></span>
          <div class="ti-callout-main"><div class="ti-callout-lbl">Drop on ${a.drop.day.date}</div><div class="ti-callout-sub">Largest single-day fall</div></div>
          <span class="ti-callout-val ti-down">${a.drop.delta}</span></div>`:''}
      </div>
      <div>
        <div class="ti-sec-title"><i data-lucide="award"></i> Top days by volume</div>
        ${a.topDays.map((d,i)=>`<div class="ti-rank" onclick="openTimelineDay('${d.fullDate}')">
          <span class="ti-rank-no">${i+1}</span><span class="ti-rank-name">${d.fullDate}</span>
          <span class="ti-rank-bar"><span class="ti-rank-bar-fill" style="width:${Math.round(d.results/topMax*100)}%"></span></span>
          <span class="ti-rank-val">${d.results}</span></div>`).join('')}
      </div>
      <div>
        <div class="ti-sec-title"><i data-lucide="newspaper"></i> Top sources</div>
        ${a.topSources.map(([name,c],i)=>`<div class="ti-rank" style="cursor:default">
          <span class="ti-rank-no">${i+1}</span><span class="ti-rank-name">${name}</span>
          <span class="ti-rank-bar"><span class="ti-rank-bar-fill" style="width:${Math.round(c/srcMax*100)}%;background:#7c3aed"></span></span>
          <span class="ti-rank-val">${c}</span></div>`).join('')}
      </div>
      <div class="ti-foot"><i data-lucide="sparkles"></i><span>AI-generated summary derived from the current filter and date range. Click any bar in the chart for that day's ${_wPosts()}.</span></div>`;
  }
  function tiDetailHTML(){
    const data=tlData();
    const day=data.find(d=>d.fullDate===tiKey);
    if(!day)return tiOverviewHTML();
    const idx=data.indexOf(day),prev=idx>0?data[idx-1]:null;
    const delta=prev?day.results-prev.results:0;
    const total=data.reduce((s,d)=>s+d.results,0),share=total?Math.round(day.results/total*100):0;
    const rank=[...data].sort((a,b)=>b.results-a.results).findIndex(d=>d.fullDate===tiKey)+1;
    const arts=dayArticles(day),dCls=delta>=0?'ti-up':'ti-down',dSign=delta>=0?'+':'';
    return renderInsTable(arts);
  }
  // Source-aware panel controller (Timeline + Media Exposure plug in here)
  function tiHeadHTML(label,sub,detailTitle){
    const exportBtn=`<button class="btn-export ti-head-export" onclick="showTrackerToast('Articles exported')">Export</button>`;
    return tiMode==='overview'
      ?`<span class="ti-head-badge"><i data-lucide="sparkles"></i></span>
         <div class="ti-head-titles"><div class="ti-head-title">${label}</div><div class="ti-head-sub">${sub}</div></div>
         ${exportBtn}
         <button class="ti-x" onclick="closeInsights()" title="Close"><i data-lucide="x"></i></button>`
      :`<span class="ti-head-badge"><i data-lucide="file-text"></i></span>
         <div class="ti-head-titles"><div class="ti-head-title">${detailTitle}</div><div class="ti-head-sub">${sub}</div></div>
         ${exportBtn}
         <button class="ti-x" onclick="closeInsights()" title="Close"><i data-lucide="x"></i></button>`;
  }
  // Chart sources register here: {card, sub(), detailTitle(), overview(), detail(), clear()}
  const SRC={};
  SRC.timeline={card:'db-timeline-card',sub:()=>'Timeline · '+rangeLabel(),detailTitle:()=>tiKey,overview:()=>tiOverviewHTML(),detail:()=>tiDetailHTML(),clear:()=>{tlSelectedDate=null;buildTimeline(tlRange);}};
  // Ephemeral Insights source: an arbitrary article list. Explore-view graphs/cards slide the panel in with this.
  let exListArts=[],exListTitle='',exListSub='';
  SRC.exlist={card:null,sub:()=>exListSub,detailTitle:()=>exListTitle,overview:()=>renderInsTable(exListArts),detail:()=>renderInsTable(exListArts),clear:()=>{}};
  window.openInsListPanel=function(arts,title,sub,focusEl){
    if(!arts||!arts.length)return;
    exListArts=arts;exListTitle=title||'';exListSub=sub||'';
    tiSource='exlist';tiMode='detail';tiKey=null;
    tiRender();tiShow();
    // Focus the clicked element + dim the rest of the explore view (after tiShow, so tiSpotlight's clear doesn't wipe it)
    if(focusEl){
      focusEl.classList.add('is-focused');
      // .cmp-metric-view first so per-metric compare views spotlight the clicked card, not the whole view wrapper
      const inner=focusEl.closest('.cmp-metric-view,.db-explore-inner,.db-content-inner');
      let host=focusEl;while(host&&host.parentElement!==inner)host=host.parentElement;
      if(host)host.classList.add('has-focus');
      setTimeout(()=>focusEl.scrollIntoView({behavior:'smooth',block:'center'}),60);   // center the focused card
    }
  };
  // Helper: open the sliding article panel for a chart-mark click, focusing that chart's card.
  const openInsCard=(arts,title,sub,cardId)=>window.openInsListPanel(arts,title,sub,document.getElementById(cardId));
  // Article sets for chart-mark clicks: reuse real filters where possible, seeded mentionData sample otherwise.
  function _insSample(seedStr,n){
    let seed=0;for(let i=0;i<String(seedStr).length;i++)seed=(seed*31+String(seedStr).charCodeAt(i))>>>0;
    const out=[];for(let k=0;out.length<n&&k<mentionData.length*3;k++){const c=mentionData[(seed+k*7)%mentionData.length];if(!out.includes(c))out.push(c);}return out;
  }
  const _insByTone=t=>{const m={Positive:'positive',Neutral:'neutral',Negative:'negative'}[t]||t;const list=mentionData.filter(d=>(d.tone||d.brand)===m);return list.length?list:_insSample('tone-'+t,4);};
  window.openInsEntity=name=>openInsCard(_insSample('ent-'+name,6),name,'Entities Map','db-entities-card');
  const curSrc=()=>SRC[tiSource]||SRC.timeline; window.__curSrc=curSrc;
  function renderTIHead(){
    const head=document.getElementById('ti-head');if(!head)return;
    const s=curSrc();
    head.innerHTML=tiHeadHTML('Insights',s.sub(),s.detailTitle());
  }
  function tiBodyHTML(){const s=curSrc();return tiMode==='overview'?s.overview():s.detail();}
  function tiRender(){
    renderTIHead();
    const body=document.getElementById('ti-body');
    if(body){body.innerHTML=tiBodyHTML();body.classList.toggle('ti-body-flush',tiSource==='exlist'||(tiMode==='detail'&&(tiSource==='exposure'||tiSource==='emphasis'||tiSource==='timeline')));}
    initIcons();
  }
  const tiFocusCard=()=>document.getElementById(curSrc().card);
  function tiSpotlight(){
    document.querySelectorAll('.is-focused').forEach(e=>e.classList.remove('is-focused'));
    document.querySelectorAll('.has-focus').forEach(e=>e.classList.remove('has-focus'));
    const card=tiFocusCard();
    if(card){card.classList.add('is-focused');const row=card.closest('.db-row');if(row)row.classList.add('has-focus');}
    return card;
  }
  let _tiSidebarWasCollapsed=false;
  function tiShow(){
    const ov=document.getElementById('ti-overlay');if(!ov)return;
    ov.style.display='block';
    const firstOpen=!tiOpen;
    if(firstOpen){
      const sb=document.getElementById('sidebar');
      _tiSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
      if(sb)sb.classList.add('collapsed');
    }
    const card=tiSpotlight();
    if(firstOpen&&card)setTimeout(()=>card.scrollIntoView({behavior:'smooth',block:'center'}),60);
    requestAnimationFrame(()=>{ov.classList.add('open');document.body.classList.add('ins-open');});
    tiOpen=true;
    // Ignore the click that opened the panel so the click-outside handler doesn't immediately close it
    _insSuppressClose=true;setTimeout(()=>{_insSuppressClose=false;},0);
  }
  function tiClearSel(){Object.values(SRC).forEach(s=>s.clear&&s.clear());}
  function tiOpenSource(src){tiSource=src;tiMode='overview';tiKey=null;tiClearSel();tiRender();tiShow();}
  window.openTimelineInsights=()=>tiOpenSource('timeline');
  window.openExposureInsights=()=>tiOpenSource('exposure');
  window.openTimelineDay=function(fullDate){tiSource='timeline';tiMode='detail';tiKey=fullDate;tlSelectedDate=fullDate;buildTimeline(tlRange);tiRender();tiShow();};
  window.openExposureChannel=function(key){tiSource='exposure';tiMode='detail';tiKey=key;expSelected=key;renderExposure();tiRender();tiShow();};
  window.insBack=function(){tiMode='overview';tiKey=null;tiClearSel();tiRender();};
  window.closeInsights=function(){
    const ov=document.getElementById('ti-overlay');
    if(ov){ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);}
    document.body.classList.remove('ins-open');tiOpen=false;
    document.querySelectorAll('.is-focused,.has-focus').forEach(e=>e.classList.remove('is-focused','has-focus'));
    tiClearSel();
    const sb=document.getElementById('sidebar');
    if(sb&&!_tiSidebarWasCollapsed)sb.classList.remove('collapsed');
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&tiOpen)closeInsights();});
  // Click outside the focused card (or panel) closes the Insights panel.
  // Geometry-based (not .contains) so a bar click — which re-renders the chart and detaches
  // the clicked element — doesn't get mistaken for an outside click.
  document.addEventListener('click',e=>{
    if(!tiOpen||_insSuppressClose)return;
    const inRect=el=>{const r=el&&el.getBoundingClientRect();return r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;};
    if(inRect(document.getElementById('ti-overlay'))||inRect(document.querySelector('.is-focused')))return;
    closeInsights();
  });

  window.setTimelineRange=function(n){
    buildTimeline(n);
    document.querySelectorAll('.db-tl-range').forEach(b=>b.classList.toggle('on',+b.dataset.r===n));
    if(tiOpen&&tiSource==='timeline'){
      if(tiMode==='detail'&&!tlData().some(d=>d.fullDate===tiKey)){tiMode='overview';tiKey=null;tlSelectedDate=null;buildTimeline(n);}
      tiRender();
    }
  };
  buildTimeline(7);

  // ── Media Exposure (100% stacked channel share, single horizontal bar) ──
  // Shared (social) workspace shows Platform Exposure (post share) instead of Media Exposure (article share).
  const expIsSocial=!!(window.WS_DATA&&window.WS_DATA.socialMentions);
  const expSeries=expIsSocial?[
    {key:'facebook',label:'Facebook',color:'#3b7dd8',labelColor:'#fff'},
    {key:'twitter',label:'Twitter',color:'#29a3f0',labelColor:'#fff'},
    {key:'instagram',label:'Instagram',color:'#d6249f',labelColor:'#fff'}
  ]:[  // colors mirror the media-type icons (.hl-icon.type-*) used across the app
    {key:'online',label:'Online News',color:'#3b6098',labelColor:'#fff'},
    {key:'blogs',label:'Blogs',color:'#d97706',labelColor:'#fff'},
    {key:'broadsheet',label:'Broadsheet',color:'#4f46e5',labelColor:'#fff'},
    {key:'provincial',label:'Provincial',color:'#0891b2',labelColor:'#fff'},
    {key:'tabloid',label:'Tabloid',color:'#ea580c',labelColor:'#fff'},
    {key:'tv',label:'TV',color:'#7c3aed',labelColor:'#fff'},
    {key:'radio',label:'Radio',color:'#db2777',labelColor:'#fff'}
  ];
  const expData=expIsSocial
    ?[{name:'',facebook:81.16,twitter:17.39,instagram:1.45}]
    :[{name:'',online:55.24,blogs:16.43,broadsheet:8.62,provincial:1.64,tabloid:1.44,tv:13.35,radio:3.29}];
  function ExpTooltip(o){
    if(!o||!o.active)return null;
    return RC('div',{style:{background:'#181d26',border:'none',borderRadius:8,padding:'10px 13px',boxShadow:'0 6px 20px rgba(0,0,0,0.28)',minWidth:196}},
      ...expSeries.map(s=>RC('div',{key:s.key,style:{display:'flex',alignItems:'center',gap:8,fontSize:12,margin:'3px 0'}},
        RC('span',{style:{width:7,height:7,borderRadius:'50%',background:s.color,flexShrink:0}}),
        RC('span',{style:{color:'rgba(255,255,255,0.62)',flex:1,whiteSpace:'nowrap'}},s.label+':'),
        RC('span',{style:{color:'#fff',fontWeight:600,marginLeft:18}},expData[0][s.key]+'%'))));
  }
  let expSelected=null;   // channel locked open via Insights detail → dim the others
  function ExposureBar(){
    const [hov,setHov]=React.useState(null);   // hovered channel key → dim the others
    const dimKey=expSelected||hov;
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:expData,layout:'vertical',margin:{top:22,right:10,bottom:22,left:10},onMouseLeave:()=>setHov(null)},
        RC(XAxis,{type:'number',domain:[0,100],hide:true}),
        RC(YAxis,{type:'category',dataKey:'name',hide:true}),
        RC(Tooltip,{content:ExpTooltip,cursor:false}),
        ...expSeries.map((s,i)=>RC(Bar,{key:s.key,dataKey:s.key,stackId:'a',fill:s.color,maxBarSize:50,
          isAnimationActive:false,cursor:'pointer',
          fillOpacity:(dimKey&&dimKey!==s.key)?0.3:1,
          onMouseEnter:()=>setHov(s.key),
          onClick:expIsSocial?()=>openInsCard(window.WS_DATA.socialMentions,s.label,'Platform Exposure · post share','db-exposure-card'):()=>{const p=document.getElementById('page-dashboard');if(p&&p.classList.contains('explore-open')){const c=document.querySelector('.db-explore-wrap.on .db-explore-exp-chart');window.openInsListPanel(expChannelArticles(s.key),s.label,'Media Exposure',c&&c.closest('.db-card'));}else window.openExposureChannel(s.key);},
          radius:i===0?[5,0,0,5]:i===expSeries.length-1?[0,5,5,0]:0},
          RC(LabelList,{dataKey:s.key,position:'center',formatter:v=>v>=10?`${s.label.toUpperCase()}: ${v}%`:'',style:{fontSize:11,fontWeight:600,fill:s.labelColor}})
        ))
      ));
  }
  function renderExposure(){dbMount('db-exposure',RC(ExposureBar));}
  renderExposure();
  // Media Exposure Insights content (uses the shared artRow/tiIcn/toneColor helpers)
  const EXP_TOTAL=304;   // notional article total → online 55.24% ≈ 168 (matches the KPI card)
  const expChannelLabel=k=>{const s=expSeries.find(x=>x.key===k);return s?s.label:k;};
  function expChannelArticles(key){
    const M={online:d=>!d.type||d.type==='online',blogs:d=>d.type==='blog',broadsheet:d=>d.type==='broadsheet',provincial:d=>d.type==='provincial',tabloid:d=>d.type==='tabloid',tv:d=>d.type==='tv',radio:d=>d.type==='radio'};
    const m=M[key]||(()=>false),list=mentionData.filter(m);
    let seed=0;for(let i=0;i<key.length;i++)seed=(seed*31+key.charCodeAt(i))>>>0;
    const want=Math.max(3,Math.min(8,Math.round((expData[0][key]||0)/8)));
    for(let k=0;list.length<want&&k<mentionData.length*3;k++){const c=mentionData[(seed+k*7)%mentionData.length];if(!list.includes(c))list.push(c);}
    return list;
  }
  function expAnalysis(){
    const rows=expSeries.map(s=>({key:s.key,label:s.label,color:s.color,pct:expData[0][s.key],count:Math.round(expData[0][s.key]/100*EXP_TOTAL)})).sort((a,b)=>b.pct-a.pct);
    const top=rows[0],second=rows[1];
    const top3=+(rows.slice(0,3).reduce((a,r)=>a+r.pct,0)).toFixed(2);
    const tail=+(rows.slice(3).reduce((a,r)=>a+r.pct,0)).toFixed(2);
    const active=rows.filter(r=>r.pct>0).length;
    const mult=second&&second.pct?top.pct/second.pct:0;
    return {rows,top,second,top3,tail,active,mult,total:EXP_TOTAL};
  }
  function expOverviewHTML(){
    const a=expAnalysis(),max=a.rows[0].pct,last=a.rows[a.rows.length-1];
    return `
      <div class="ti-narrative"><b>${a.top.label}</b> dominates exposure at <b>${a.top.pct}%</b> (${a.top.count} ${_wPosts()})${a.mult>=1.5?`, over <b>${a.mult.toFixed(1)}×</b> the next channel (${a.second.label}, ${a.second.pct}%)`:''}. The top 3 channels carry <b>${a.top3}%</b> of all coverage.</div>
      <div class="ti-stats">
        <div class="ti-stat"><div class="ti-stat-lbl">Top channel</div><div class="ti-stat-val">${a.top.pct}%</div><div class="ti-stat-sub">${a.top.label}</div></div>
        <div class="ti-stat"><div class="ti-stat-lbl">Top-3 concentration</div><div class="ti-stat-val">${a.top3}%</div><div class="ti-stat-sub">of all coverage</div></div>
        <div class="ti-stat"><div class="ti-stat-lbl">Active channels</div><div class="ti-stat-val">${a.active}</div><div class="ti-stat-sub">with coverage</div></div>
        <div class="ti-stat"><div class="ti-stat-lbl">Long tail</div><div class="ti-stat-val">${a.tail}%</div><div class="ti-stat-sub">bottom ${a.rows.length-3} channels</div></div>
      </div>
      <div>
        <div class="ti-sec-title"><i data-lucide="lightbulb"></i> Key insights</div>
        <div class="ti-insight"><i data-lucide="crown"></i><div><b>${a.top.label}</b> leads with <b>${a.top.pct}%</b> (${a.top.count} ${_wPosts()})${a.mult>=1.5?` — ${a.mult.toFixed(1)}× the next channel`:''}.</div></div>
        <div class="ti-insight"><i data-lucide="pie-chart"></i><div>Coverage is <b>${a.top3>=70?'highly concentrated':'fairly spread'}</b> — the top 3 channels hold <b>${a.top3}%</b>.</div></div>
        <div class="ti-insight"><i data-lucide="trending-down"></i><div>Smallest channel is <b>${last.label}</b> at just <b>${last.pct}%</b>.</div></div>
      </div>
      <div>
        <div class="ti-sec-title"><i data-lucide="bar-chart-3"></i> Channel share</div>
        ${a.rows.map((r,i)=>`<div class="ti-rank" onclick="openExposureChannel('${r.key}')">
          <span class="ti-rank-no">${i+1}</span><span class="ti-rank-name">${r.label}</span>
          <span class="ti-rank-bar"><span class="ti-rank-bar-fill" style="width:${Math.round(r.pct/max*100)}%;background:${r.color}"></span></span>
          <span class="ti-rank-val">${r.pct}%</span></div>`).join('')}
      </div>
      <div class="ti-foot"><i data-lucide="sparkles"></i><span>AI-generated summary of channel share. Click any segment in the bar for that channel's ${_wPosts()}.</span></div>`;
  }
  function expDetailHTML(){
    const a=expAnalysis(),rows=a.rows,idx=rows.findIndex(r=>r.key===tiKey);
    if(idx<0)return expOverviewHTML();
    const r=rows[idx],above=idx>0?rows[idx-1]:null;
    const gap=above?+(above.pct-r.pct).toFixed(2):0;
    const arts=expChannelArticles(tiKey);
    return renderInsTable(arts);
  }
  SRC.exposure={card:'db-exposure-card',sub:()=>expIsSocial?'Platform Exposure · post share':'Media Exposure · article share',detailTitle:()=>expChannelLabel(tiKey),overview:()=>expOverviewHTML(),detail:()=>expDetailHTML(),clear:()=>{expSelected=null;renderExposure();}};

  // ── Channel summary cards (icons reuse the .hl-icon.type-* chips from mentions) ──
  const channelData=[
    {name:'Online News',icon:'newspaper',cls:'type-online',score:'7.74',sv:'0',ave:'62.0M',words:'485',articles:'269'},
    {name:'Blogs',icon:'rss',cls:'type-blog',score:'8.35',sv:'0',ave:'16.1M',words:'547',articles:'80'},
    {name:'Broadsheet',icon:'file-text',cls:'type-broadsheet',score:'1.28',sv:'0',ave:'10.9M',words:'418',articles:'42'},
    {name:'Provincial',icon:'map-pin',cls:'type-provincial',score:'7.96',sv:'0',ave:'638.5K',words:'382',articles:'8'},
    {name:'Tabloid',icon:'message-square',cls:'type-tabloid',score:'0.43',sv:'0',ave:'1.5M',words:'525',articles:'7'},
    {name:'TV',icon:'tv',cls:'type-tv',score:'5.53',sv:'0',ave:'84.8M',words:'1.3K',articles:'65'},
    {name:'Radio',icon:'radio',cls:'type-radio',score:'10',sv:'0',ave:'10.2M',words:'757',articles:'16'}
  ];
  // Social platform breakdown — reused in the Shared (social) workspace. Per-platform metric sets
  // (stats vary by platform), plus Facebook reactions and per-platform note lines. 3-col grid.
  const socialChannelData=[
    {platform:'facebook', stats:[['Avg. Inf. Score','0.01'],['Total Story Value','0.04'],['Video Posts','56'],['Total Posts','56'],['Total Likes','397'],['Comments','188']],
     reactions:[['👍','397'],['😮','25'],['❤️','319'],['😢','2'],['😆','32'],['😠','14']]},
    {platform:'twitter', stats:[['Avg. Inf. Score','0'],['Total Likes','8'],['Total Story Value','0'],['Retweets','0'],['Total Tweets','12']],
     notes:['1 tweet: 8 likes','1 tweet: 0 retweets']},
    {platform:'instagram', stats:[['Avg. Inf. Score','0'],['Total Likes','9'],['Total Story Value','0'],['Total Posts','1'],['Comments','2']],
     notes:['1 video: 9 likes','1 video: 0 views','1 video: 2 comments']},
    {platform:'youtube', stats:[['Avg. Inf. Score','0.02'],['Total Story Value','0.03'],['Video Posts','14'],['Total Views','4.2K'],['Total Likes','210'],['Comments','45']],
     notes:['1 video: 210 likes','1 video: 4.2K views','1 video: 45 comments']},
    {platform:'reddit', stats:[['Avg. Inf. Score','0.01'],['Total Story Value','0.01'],['Total Posts','8'],['Upvotes','96'],['Comments','63'],['Awards','3']],
     notes:['1 post: 96 upvotes','1 post: 63 comments']},
    {platform:'tiktok', stats:[['Avg. Inf. Score','0.03'],['Total Story Value','0.05'],['Video Posts','5'],['Total Likes','340'],['Comments','78'],['Shares','21']],
     notes:['1 video: 340 likes','1 video: 78 comments']}
  ];
  const chGrid=document.getElementById('db-channels');
  if(chGrid){
    const sub=(lbl,val)=>`<div class="db-ch-sub-stat"><span class="db-ch-sub-lbl">${lbl}</span><span class="db-ch-sub-val${val==='0'?' zero':''}">${val}</span></div>`;
    if(window.WS_DATA&&window.WS_DATA.socialMentions){
      chGrid.classList.add('soc-ch-grid');
      chGrid.innerHTML=socialChannelData.map(c=>{
        const p=SOCIAL_PLATFORMS[c.platform]||{icon:'fa-globe',color:'#6b7280',label:c.platform};
        const ico=p.icon==='fa-x-twitter'?X_SVG:`<i class="fa-brands ${p.icon}"></i>`;
        const stats=c.stats.map(([l,v])=>`<div class="soc-ch-stat"><span class="soc-ch-stat-lbl">${l}</span><span class="soc-ch-stat-val">${v}</span></div>`).join('');
        const reactions=c.reactions?`<div class="soc-ch-sec"><div class="soc-ch-sec-lbl">Reactions</div><div class="soc-ch-react">${c.reactions.map(([e,n])=>`<span class="soc-ch-react-i"><span class="soc-ch-react-e">${e}</span>${n}</span>`).join('')}</div></div>`:'';
        const noteIcon=t=>/retweet/i.test(t)?'repeat':/views/i.test(t)?'eye':/comments/i.test(t)?'message-circle':/upvotes/i.test(t)?'arrow-big-up':/shares/i.test(t)?'share-2':/awards/i.test(t)?'award':/likes/i.test(t)?'heart':'bar-chart-2';
        const notes=c.notes?`<div class="soc-ch-sec"><div class="soc-ch-sec-lbl">Breakdown</div><div class="soc-ch-notes">${c.notes.map(n=>`<div class="soc-ch-note"><i data-lucide="${noteIcon(n)}"></i>${n}</div>`).join('')}</div></div>`:'';
        return `<div class="db-ch-card soc-ch-card">
      <div class="db-ch-hd"><span class="db-ch-name">${p.label}</span><span class="hl-icon soc-ch-ico" style="background:${p.color}1a;color:${p.color}">${ico}</span></div>
      <div class="soc-ch-stats">${stats}</div>
      ${reactions}${notes}
    </div>`;}).join('');
    } else {
      chGrid.classList.remove('soc-ch-grid');
      chGrid.innerHTML=channelData.map(c=>`<div class="db-ch-card">
      <div class="db-ch-hd"><span class="hl-icon ${c.cls}"><i data-lucide="${c.icon}"></i></span><span class="db-ch-name">${c.name}</span></div>
      <div class="db-ch-hero"><div class="db-ch-hero-lbl">Total AVE</div><div class="db-ch-hero-val">${c.ave}</div></div>
      <div class="db-ch-sub">
        ${sub('Articles',c.articles)}${sub('Pub. Score',c.score)}
        ${sub('Avg Words',c.words)}${sub('Story Value',c.sv)}
      </div>
    </div>`).join('');
    }
    initIcons();
  }

  // ── Topic Emphasis (100% stacked: mention vs main; labels=%, tooltip=counts) ──
  const empSeries=[
    {key:'mention',label:'Mention',color:'#5b8def',labelColor:'#fff',count:7},
    {key:'main',label:'Main',color:'#a8e6c8',labelColor:'#2a5a40',count:1}
  ];
  const empData=[{name:'',mention:87.5,main:12.5}];
  function EmpTooltip(o){
    if(!o||!o.active)return null;
    return RC('div',{style:{background:'#181d26',border:'none',borderRadius:8,padding:'10px 13px',boxShadow:'0 6px 20px rgba(0,0,0,0.28)',minWidth:160}},
      ...empSeries.map(s=>RC('div',{key:s.key,style:{display:'flex',alignItems:'center',gap:8,fontSize:12,margin:'3px 0'}},
        RC('span',{style:{width:7,height:7,borderRadius:'50%',background:s.color,flexShrink:0}}),
        RC('span',{style:{color:'rgba(255,255,255,0.62)',flex:1,whiteSpace:'nowrap'}},s.label+':'),
        RC('span',{style:{color:'#fff',fontWeight:600,marginLeft:18}},s.count))));
  }
  let empSelected=null;   // category locked open via Insights detail → dim the other
  function EmphasisBar(){
    const [hov,setHov]=React.useState(null);
    const dimKey=empSelected||hov;
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:empData,layout:'vertical',margin:{top:22,right:10,bottom:22,left:10},onMouseLeave:()=>setHov(null)},
        RC(XAxis,{type:'number',domain:[0,100],hide:true}),
        RC(YAxis,{type:'category',dataKey:'name',hide:true}),
        RC(Tooltip,{content:EmpTooltip,cursor:false}),
        ...empSeries.map((s,i)=>RC(Bar,{key:s.key,dataKey:s.key,stackId:'a',fill:s.color,maxBarSize:50,
          isAnimationActive:false,cursor:'pointer',
          fillOpacity:(dimKey&&dimKey!==s.key)?0.3:1,
          onMouseEnter:()=>setHov(s.key),
          onClick:()=>window.openEmphasisCategory(s.key),
          radius:i===0?[5,0,0,5]:i===empSeries.length-1?[0,5,5,0]:0},
          RC(LabelList,{dataKey:s.key,position:'center',formatter:v=>v>=10?`${s.label.toUpperCase()}: ${v}%`:'',style:{fontSize:11,fontWeight:600,fill:s.labelColor}})
        ))
      ));
  }
  function renderEmphasis(){dbMount('db-emphasis',RC(EmphasisBar));}
  renderEmphasis();
  // Topic Emphasis Insights content
  const EMP_TOTAL=empSeries.reduce((a,s)=>a+s.count,0);
  const empCatLabel=k=>{const s=empSeries.find(x=>x.key===k);return s?s.label:k;};
  function empCatArticles(key){
    const s=empSeries.find(x=>x.key===key),want=Math.min(8,s?s.count:3);
    let seed=0;for(let i=0;i<key.length;i++)seed=(seed*31+key.charCodeAt(i))>>>0;
    const list=[];
    for(let k=0;list.length<want&&k<mentionData.length*3;k++){const c=mentionData[(seed+k*7)%mentionData.length];if(!list.includes(c))list.push(c);}
    return list;
  }
  function empAnalysis(){
    const rows=empSeries.map(s=>({key:s.key,label:s.label,color:s.color,pct:empData[0][s.key],count:s.count})).sort((a,b)=>b.pct-a.pct);
    const main=rows.find(r=>r.key==='main'),mention=rows.find(r=>r.key==='mention');
    const ratio=main&&main.pct?mention.pct/main.pct:0;
    return {rows,total:EMP_TOTAL,main,mention,ratio};
  }
  function empOverviewHTML(){
    const a=empAnalysis(),max=a.rows[0].pct;
    return `
      <div class="ti-narrative">Just <b>${a.main.pct}%</b> of coverage features the brand as the <b>main subject</b> — the other <b>${a.mention.pct}%</b> are passing mentions.</div>
      <div class="ti-stats">
        <div class="ti-stat"><div class="ti-stat-lbl">Main subject</div><div class="ti-stat-val">${a.main.pct}%</div><div class="ti-stat-sub">${a.main.count} article${a.main.count===1?'':'s'}</div></div>
        <div class="ti-stat"><div class="ti-stat-lbl">Mention</div><div class="ti-stat-val">${a.mention.pct}%</div><div class="ti-stat-sub">${a.mention.count} ${_wPosts()}</div></div>
        <div class="ti-stat"><div class="ti-stat-lbl">Total ${_wPosts()}</div><div class="ti-stat-val">${a.total}</div><div class="ti-stat-sub">in scope</div></div>
        <div class="ti-stat"><div class="ti-stat-lbl">Mention : Main</div><div class="ti-stat-val">${a.ratio?a.ratio.toFixed(0)+':1':'—'}</div><div class="ti-stat-sub">prominence ratio</div></div>
      </div>
      <div>
        <div class="ti-sec-title"><i data-lucide="lightbulb"></i> Key insights</div>
        <div class="ti-insight"><i data-lucide="${a.main.pct<25?'alert-triangle':'check'}"></i><div>The brand is <b>${a.main.pct<25?'rarely the focus':'often the focus'}</b> — only <b>${a.main.pct}%</b> of stories are primarily about it.</div></div>
        <div class="ti-insight"><i data-lucide="message-square"></i><div><b>${a.mention.pct}%</b> of coverage references the brand <b>in passing</b> alongside other topics.</div></div>
        <div class="ti-insight"><i data-lucide="target"></i><div>Opportunity: convert high-volume mentions into <b>brand-led narratives</b> to lift main-subject share.</div></div>
      </div>
      <div>
        <div class="ti-sec-title"><i data-lucide="bar-chart-3"></i> Emphasis breakdown</div>
        ${a.rows.map((r,i)=>`<div class="ti-rank" onclick="openEmphasisCategory('${r.key}')">
          <span class="ti-rank-no">${i+1}</span><span class="ti-rank-name">${r.label}</span>
          <span class="ti-rank-bar"><span class="ti-rank-bar-fill" style="width:${Math.round(r.pct/max*100)}%;background:${r.color}"></span></span>
          <span class="ti-rank-val">${r.pct}%</span></div>`).join('')}
      </div>
      <div class="ti-foot"><i data-lucide="sparkles"></i><span>AI-generated summary of subject prominence. Click a segment in the bar for that category's ${_wPosts()}.</span></div>`;
  }
  function empDetailHTML(){
    const a=empAnalysis(),rows=a.rows,idx=rows.findIndex(r=>r.key===tiKey);
    if(idx<0)return empOverviewHTML();
    const r=rows[idx],other=rows[1-idx],diff=+(r.pct-other.pct).toFixed(1);
    const arts=empCatArticles(tiKey);
    return renderInsTable(arts);
  }
  SRC.emphasis={card:'db-emphasis-card',sub:()=>'Topic Emphasis · subject prominence',detailTitle:()=>empCatLabel(tiKey),overview:()=>empOverviewHTML(),detail:()=>empDetailHTML(),clear:()=>{empSelected=null;renderEmphasis();}};
  window.openEmphasisInsights=()=>tiOpenSource('emphasis');
  window.openEmphasisCategory=function(key){tiSource='emphasis';tiMode='detail';tiKey=key;empSelected=key;renderEmphasis();tiRender();tiShow();};

  // ── Tonality Distribution (sentiment donut + stacked time-bar) ──
  const tonColors={Positive:'#16a34a',Neutral:'#9ca3af',Negative:'#dc2626'};
  const tonDates=[
    {date:'June 16, 2026',Positive:1,Neutral:1,Negative:0},
    {date:'June 19, 2026',Positive:1,Neutral:0,Negative:1},
    {date:'June 21, 2026',Positive:2,Neutral:1,Negative:1},
    {date:'June 22, 2026',Positive:4,Neutral:1,Negative:0}
  ];
  const tonPie=[{name:'Positive',value:8},{name:'Neutral',value:3},{name:'Negative',value:2}];
  const tonGrand=tonPie.reduce((s,d)=>s+d.value,0);
  const tonLeg=document.getElementById('db-ton-legend');
  if(tonLeg) tonLeg.innerHTML=tonPie.map(s=>`<span class="db-ton-leg-item"><span class="dot" style="background:${tonColors[s.name]}"></span>${s.name} <span class="muted">${(s.value/tonGrand*100).toFixed(2)}% (${s.value})</span></span>`).join('');
  const tipBox=(...kids)=>RC('div',{style:{background:'#181d26',border:'none',borderRadius:8,padding:'10px 13px',boxShadow:'0 6px 20px rgba(0,0,0,0.28)',minWidth:150}},...kids);
  // Generic dark tooltip (used by charts that would otherwise fall back to the light Recharts default)
  function DarkTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    const rows=o.payload.filter(p=>p&&p.value!=null);
    return tipBox(
      (o.label!=null&&o.label!=='')?RC('div',{key:'l',style:{fontWeight:600,color:'#fff',marginBottom:7,fontSize:12.5}},o.label):null,
      ...rows.map((p,i)=>RC('div',{key:i,style:{display:'flex',alignItems:'center',gap:8,fontSize:12,margin:'3px 0'}},
        RC('span',{style:{width:7,height:7,borderRadius:'50%',background:p.color||(p.payload&&p.payload.color)||p.fill||'#888',flexShrink:0}}),
        RC('span',{style:{color:'rgba(255,255,255,0.62)',flex:1,whiteSpace:'nowrap'}},(p.name!=null?p.name:'')+':'),
        RC('span',{style:{color:'#fff',fontWeight:600,marginLeft:18}},p.value)))
    );
  }
  function TonDonutTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    const p=o.payload[0];
    return tipBox(tlRow(tonColors[p.name],p.name,p.value));
  }
  function TonBarTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    return tipBox(
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:7,fontSize:12.5}},o.label),
      ...['Positive','Neutral','Negative'].map(k=>tlRow(tonColors[k],k,(o.payload.find(p=>p.dataKey===k)||{}).value||0)));
  }
  // Focus-and-dim hover: active slice stays full + grows ~5px, others fade
  const TonActiveShape=(p)=>RC(Sector,{cx:p.cx,cy:p.cy,innerRadius:p.innerRadius,outerRadius:p.outerRadius+5,startAngle:p.startAngle,endAngle:p.endAngle,fill:p.fill,stroke:'none'});
  function TonDonut(){
    const [hov,setHov]=React.useState(null);
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(PieChart,{},
        RC(Pie,{data:tonPie,cx:'50%',cy:'50%',innerRadius:'55%',outerRadius:'82%',dataKey:'value',paddingAngle:1,stroke:'none',cursor:'pointer',
          activeIndex:hov==null?-1:hov,activeShape:TonActiveShape,onMouseEnter:(d,i)=>setHov(i),onMouseLeave:()=>setHov(null),
          onClick:(d)=>{const n=d&&(d.name||(d.payload&&d.payload.name));if(n)openInsCard(_insByTone(n),n+' tonality','Tonality Distribution','db-tonality-card');}},
          ...tonPie.map((d,i)=>RC(Cell,{key:d.name,fill:tonColors[d.name],fillOpacity:(hov==null||hov===i)?1:0.35}))),
        RC(Tooltip,{content:TonDonutTip})
      ));
  }
  dbMount('db-tonality-donut',RC(TonDonut));
  // round the top corners of whichever segment is the topmost non-zero one in each stack
  const tonOrder=['Positive','Neutral','Negative'];
  function TonBar(){
    const [hov,setHov]=React.useState(null);
    const shape=key=>props=>{
      if(!props||props.height<=0)return null;
      const above=tonOrder.slice(tonOrder.indexOf(key)+1);
      const isTop=above.every(k=>!props.payload[k]);
      return RC(Rectangle,{...props,radius:isTop?[3,3,0,0]:0,fillOpacity:(hov!=null&&hov!==props.index)?0.3:1});
    };
    const bar=(key,fill)=>RC(Bar,{dataKey:key,stackId:'s',fill,maxBarSize:48,shape:shape(key),cursor:'pointer',isAnimationActive:false,onClick:()=>openInsCard(_insByTone(key),key+' tonality','Tonality Distribution','db-tonality-card')});
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:tonDates,margin:{top:16,right:12,bottom:8,left:0},onMouseMove:(s)=>setHov(s&&s.activeTooltipIndex!=null?s.activeTooltipIndex:null),onMouseLeave:()=>setHov(null)},
        RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
        RC(XAxis,{dataKey:'date',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,allowDecimals:false,width:28}),
        RC(Tooltip,{content:TonBarTip,cursor:{fill:'rgba(24,29,38,0.07)'}}),
        bar('Positive','#16a34a'),bar('Neutral','#9ca3af'),bar('Negative','#dc2626')
      ));
  }
  dbMount('db-tonality-bar',RC(TonBar));

  // ── Frequency Distribution (story-value histogram + brush, focus-&-dim hover) ──
  const freqCounts={0:3,1:2,4:3};
  const freqDistData=[0,1,2,3,4,5,6,7,8,9,10].map(v=>({value:v.toFixed(2),count:freqCounts[v]||0}));
  function FreqTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    return tipBox(tlRow('#b9a4f7',_wPost(true)+' Count',o.payload[0].value));
  }
  function FrequencyChart(){
    const [hov,setHov]=React.useState(null);
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:freqDistData,margin:{top:24,right:14,bottom:18,left:6},onMouseLeave:()=>setHov(null)},
        RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
        RC(XAxis,{dataKey:'value',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Story Value',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,allowDecimals:false,width:36,label:{value:_wPost(true)+' Count',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
        RC(Tooltip,{content:FreqTip,cursor:false}),
        RC(Bar,{dataKey:'count',maxBarSize:24,radius:[3,3,0,0],isAnimationActive:false,cursor:'pointer',onMouseEnter:(d,i)=>setHov(i),onClick:(d)=>openInsCard(_insSample('freq-'+d.value,Math.max(4,d.count||0)),'Story Value '+d.value,'Frequency Distribution','db-frequency-card')},
          ...freqDistData.map((d,i)=>RC(Cell,{key:i,fill:(hov===null||hov===i)?'#b9a4f7':'#e8e1fb'})),
          RC(LabelList,{dataKey:'count',position:'top',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
        ),
        RC(Brush,{dataKey:'value',height:28,stroke:'#b9a4f7',travellerWidth:8,tickFormatter:()=>''},
          RC(Area,{dataKey:'count',type:'monotone',stroke:'#b9a4f7',fill:'#ece6fb',fillOpacity:0.6}))
      ));
  }
  dbMount('db-frequency',RC(FrequencyChart));

  // ── Publisher Score Distribution (bubble scatter: Article Count × Story Value, size=score) ──
  const pubScoreData=[  // sorted ascending by Article Count so the brush maps to the x-axis
    {name:'News5 Online',abbr:'N5',articles:1,sv:0.60,score:3.20,color:'#ec4899'},
    {name:'Trend Hotspot',abbr:'TH',articles:2,sv:1.20,score:4.00,color:'#a855f7'},
    {name:'Police Files! Tonite',abbr:'PFT',articles:3,sv:1.70,score:4.60,color:'#10b981'},
    {name:'Astig Ph Online',abbr:'APO',articles:4,sv:2.00,score:5.10,color:'#f59e0b'},
    {name:'Context.PH',abbr:'CTX',articles:5,sv:2.60,score:5.90,color:'#22d3ee'},
    {name:'VicVic Bautista',abbr:'VVB',articles:6,sv:3.10,score:6.20,color:'#374151'},
    {name:'Metro Pulse',abbr:'MP',articles:7,sv:3.30,score:6.90,color:'#ef4444'},
    {name:'Daily Tribune',abbr:'DT',articles:8,sv:3.40,score:6.80,color:'#0ea5e9'},
    {name:'Business Mirror Online',abbr:'BMO',articles:9,sv:3.90,score:7.10,color:'#8b5cf6'},
    {name:'Sun Star Daily',abbr:'SSD',articles:10,sv:3.80,score:7.40,color:'#84cc16'},
    {name:'Dot Daily Dose',abbr:'DDD',articles:11,sv:4.55,score:8.10,color:'#f97316'},
    {name:'Rappler PH',abbr:'RAP',articles:12,sv:4.40,score:8.60,color:'#16a34a'},
    {name:'Inquirer Net',abbr:'INQ',articles:13,sv:4.10,score:8.20,color:'#db2777'},
    {name:'Manila Times Online',abbr:'MTO',articles:14,sv:4.29,score:7.92,color:'#3b82f6'}
  ];
  const PubDot=(p)=>{
    if(p.cx==null||p.cy==null)return null;
    const d=p.payload,r=6+d.score*1.5;
    return RC('g',{},
      RC('circle',{cx:p.cx,cy:p.cy,r,fill:d.color,opacity:0.82}),
      RC('text',{x:p.cx,y:p.cy,textAnchor:'middle',dominantBaseline:'middle',fontSize:9,fill:'#fff',fontWeight:'600'},d.abbr));
  };
  function PubTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    const d=o.payload[0].payload;
    const row=(l,v)=>RC('div',{key:l,style:{display:'flex',justifyContent:'space-between',gap:20,fontSize:12,margin:'2px 0'}},
      RC('span',{style:{color:'rgba(255,255,255,0.62)'}},l),RC('span',{style:{color:'#fff',fontWeight:600}},v));
    return tipBox(
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:6,fontSize:12.5}},d.name),
      row('Article Count',d.articles),row('Total Story Value',d.sv),row('Publisher Score',d.score));
  }
  // scatter → legend → brush; the brush (its own slim chart) filters the scatter via shared state
  function PubScoreCard(){
    const n=pubScoreData.length;
    const [rng,setRng]=React.useState([0,n-1]);
    const shown=pubScoreData.slice(rng[0],rng[1]+1);
    return RC('div',{style:{display:'flex',flexDirection:'column',height:'100%'}},
      RC('div',{style:{flex:1,minHeight:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ScatterChart,{margin:{top:16,right:20,bottom:24,left:8}},
            RC(CartesianGrid,{stroke:'#f0f1f3'}),
            RC(XAxis,{type:'number',dataKey:'articles',name:'Article Count',domain:[0,15],tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Article Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
            RC(YAxis,{type:'number',dataKey:'sv',name:'Story Value',domain:[0,5],tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:40,label:{value:'Story Value',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
            RC(Tooltip,{content:PubTip,cursor:{strokeDasharray:'3 3',stroke:'rgba(0,0,0,0.12)'}}),
            RC(Scatter,{data:shown,shape:PubDot,cursor:'pointer',onClick:(d)=>{const n=d&&(d.name||(d.payload&&d.payload.name));if(n)openInsCard(getEntityArticles('pub',n),n,'Publisher Score','db-pubscore-card');}})
          ))),
      RC('div',{className:'db-pub-legend'},pubScoreData.map(p=>RC('span',{key:p.name,className:'db-pub-leg-item'},
        RC('span',{className:'dot',style:{background:p.color}}),p.name))),
      RC('div',{style:{height:30,flexShrink:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ComposedChart,{data:pubScoreData,margin:{top:2,right:20,bottom:2,left:8}},
            RC(XAxis,{dataKey:'articles',hide:true}),
            RC(YAxis,{hide:true}),
            RC(Area,{dataKey:'sv',stroke:'transparent',fill:'transparent',isAnimationActive:false}),
            RC(Brush,{dataKey:'articles',height:24,stroke:'#b9a4f7',fill:'#f3eefc',travellerWidth:8,tickFormatter:()=>'',startIndex:rng[0],endIndex:rng[1],onChange:e=>{if(e&&e.startIndex!=null)setRng([e.startIndex,e.endIndex]);}})
          )))
    );
  }
  dbMount('db-pubscore',RC(PubScoreCard));
  // Bar Chart tab (mirrors the Author card): Article Count per publisher, descending
  const pubScoreDesc=[...pubScoreData].sort((a,b)=>b.articles-a.articles);
  function PubBarTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    return tipBox(
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:5,fontSize:12.5}},o.label),
      tlRow('#b9a4f7','Article Count',o.payload[0].value));
  }
  dbMount('db-pubscore-bar',RC(ResponsiveContainer,{width:'99%',height:'100%'},
    RC(BarChart,{data:pubScoreDesc,layout:'vertical',margin:{top:16,right:24,bottom:24,left:8}},
      RC(CartesianGrid,{horizontal:false,stroke:'#f0f1f3'}),
      RC(XAxis,{type:'number',dataKey:'articles',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,label:{value:'Article Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
      RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:140}),
      RC(Tooltip,{content:PubBarTip,cursor:{fill:'rgba(24,29,38,0.04)'}}),
      RC(Bar,{dataKey:'articles',maxBarSize:26,radius:[0,4,4,0]},
        ...pubScoreDesc.map((a,i)=>RC(Cell,{key:i,fill:a.color})),
        RC(LabelList,{dataKey:'articles',position:'right',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
      )
    )));
  window.setPubScoreTab=function(t){
    const bub=document.getElementById('db-pubscore'),bar=document.getElementById('db-pubscore-bar');
    if(bub)bub.style.display=t==='bubble'?'':'none';
    if(bar)bar.style.display=t==='bar'?'':'none';
    document.querySelectorAll('#db-pubscore-tabs .db-tab2').forEach(el=>el.classList.toggle('on',el.dataset.t===t));
  };

  // ── Top Publishers (timeline swimlane: published date per publisher) ──
  const tpMk=(day)=>new Date(2026,5,day).getTime();   // June 2026
  const TP_DOWS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const TP_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const topPubData=[  // design-system colors (media-type palette + coral/positive/muted)
    {name:'Manila Times Online',color:'#2563eb',x:tpMk(22),count:1,title:'DITO 5G expansion accelerates across the Visayas region',author:'Maria Santos',section:'Business',pub:'Jun 22, 2026'},
    {name:'Police Files! Tonite',color:'#d97706',x:tpMk(19),count:1,title:'Telco rivalry heats up as Jimenez fires back at PLDT',author:'Staff Reporter',section:'News',pub:'Jun 19, 2026'},
    {name:'Vicvic Bautista',color:'#16a34a',x:tpMk(22),count:1,title:'DITO crowned fastest mobile network by Opensignal',author:'Vicvic Bautista',section:'Technology',pub:'Jun 22, 2026'},
    {name:'Astig Ph Online',color:'#e94f37',x:tpMk(23),count:1,title:'Visayan Electric eyes smarter energy services with DITO',author:'Editorial Team',section:'News',pub:'Jun 23, 2026'},
    {name:'Business Mirror Online',color:'#7c3aed',x:tpMk(21),count:1,title:'Gawad Manileño 2026 honors people and institutions helping build a better Manila',author:'BusinessMirror Editorial',section:'Metro',pub:'Jun 21, 2026'},
    {name:'Context.ph',color:'#0891b2',x:tpMk(17),count:1,title:'Analysts weigh in on the shifting Philippine telco landscape',author:'Context Desk',section:'Analysis',pub:'Jun 17, 2026'},
    {name:'Trend Hotspot',color:'#db2777',x:tpMk(23),count:1,title:'#DITO trends as 5G rollout reaches new cities',author:'Social Desk',section:'Trending',pub:'Jun 23, 2026'},
    {name:'Dot Daily Dose',color:'#6b7280',x:tpMk(22),count:1,title:'DITO StreamZone199 promo draws 2M new users',author:'Newsroom',section:'News',pub:'Jun 22, 2026'}
  ];
  const tpDomain=[tpMk(16),tpMk(24)];
  const tpTicks=[];for(let dd=17;dd<=24;dd++)tpTicks.push(tpMk(dd));
  const TpYTick=(t)=>{
    const d=topPubData.find(p=>p.name===t.payload.value)||{};
    return RC('text',{x:t.x,y:t.y,dy:4,textAnchor:'end',fontSize:12,fontWeight:500},
      RC('tspan',{fill:d.color||'#6b7280'},t.payload.value+' '),
      RC('tspan',{fill:'#9ca3af'},'('+(d.count||1)+')'));
  };
  const TpDot=(p)=>p.cx==null?null:RC('circle',{cx:p.cx,cy:p.cy,r:6,fill:p.payload.color});
  function TpTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    const d=o.payload[0].payload;
    const row=(l,v)=>RC('div',{key:l,style:{fontSize:11.5,margin:'2px 0'}},
      RC('span',{style:{color:'rgba(255,255,255,0.62)'}},l+' '),RC('span',{style:{color:'#fff',fontWeight:600}},v));
    return RC('div',{style:{background:'#181d26',border:'none',borderRadius:8,padding:'11px 13px',boxShadow:'0 6px 20px rgba(0,0,0,0.28)',maxWidth:300}},
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:7,fontSize:12.5,lineHeight:1.4}},d.title),
      row('Author:',d.author),row('Section:',d.section),row('Published Date:',d.pub));
  }
  const tpFoot=document.getElementById('db-tp-foot');
  if(tpFoot){const f=ts=>{const d=new Date(ts);return d.getDate()+' '+TP_MONTHS[d.getMonth()]+' '+d.getFullYear();};
    tpFoot.innerHTML='<span>'+f(tpDomain[0])+'</span><span>'+f(tpDomain[1])+'</span>';}
  dbMount('db-toppub',RC(ResponsiveContainer,{width:'99%',height:'100%'},
    RC(ScatterChart,{margin:{top:8,right:24,bottom:8,left:8}},
      RC(CartesianGrid,{vertical:false,stroke:'#eef0f2'}),
      RC(XAxis,{type:'number',dataKey:'x',domain:tpDomain,ticks:tpTicks,orientation:'top',tickFormatter:ts=>{const d=new Date(ts);return TP_DOWS[d.getDay()]+' '+d.getDate();},tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false}),
      RC(YAxis,{type:'category',dataKey:'name',tick:TpYTick,axisLine:false,tickLine:false,width:170,reversed:true}),
      RC(Tooltip,{content:TpTip,cursor:{stroke:'#e4e6ea'}}),
      RC(Scatter,{data:topPubData,shape:TpDot,cursor:'pointer',onClick:(d)=>{const n=d&&(d.name||(d.payload&&d.payload.name));if(n)openInsCard(getEntityArticles('pub',n),n,'Top Publishers','db-toppub-card');}})
    )));

  // ── Media Source Distribution (Shared workspace): Post Count × Story Value per platform ──
  const mediaSourceData=[
    {name:'Facebook', color:'#1877f2', postCount:67, storyValue:0.42},
    {name:'Twitter',  color:'#16a34a', postCount:14, storyValue:0.11},
    {name:'Instagram',color:'#1e293b', postCount:12, storyValue:0.18},
    {name:'YouTube',  color:'#ef4444', postCount:9,  storyValue:0.36},
    {name:'Reddit',   color:'#f97316', postCount:6,  storyValue:0.09},
    {name:'TikTok',   color:'#8b5cf6', postCount:5,  storyValue:0.29}
  ];
  const msData=mediaSourceData.map(p=>({x:p.postCount,y:p.storyValue,name:p.name,color:p.color}));
  const MsdDot=(o)=>o.cx==null?null:RC('circle',{cx:o.cx,cy:o.cy,r:7,fill:o.payload.color,stroke:'#fff',strokeWidth:1.5});
  const MsdLegend=()=>RC('div',{style:{display:'flex',justifyContent:'center',gap:16,flexWrap:'wrap',paddingTop:8}},
    mediaSourceData.map(p=>RC('span',{key:p.name,style:{display:'inline-flex',alignItems:'center',gap:6,fontSize:11.5,color:'#6b7280'}},
      RC('span',{style:{width:9,height:9,borderRadius:'50%',background:p.color,display:'inline-block'}}),p.name)));
  function MsdTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    const d=o.payload[0].payload;
    const row=(l,v)=>RC('div',{key:l,style:{fontSize:11.5,margin:'2px 0',color:'rgba(255,255,255,0.62)'}},l+' ',RC('span',{style:{color:'#fff',fontWeight:600}},v));
    return RC('div',{style:{background:'#181d26',borderRadius:8,padding:'11px 13px',boxShadow:'0 6px 20px rgba(0,0,0,0.28)'}},
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:6,fontSize:12.5}},d.name),
      row('Post Count:',d.x),row('Story Value:',d.y));
  }
  function MediaSourceDist(){
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(ScatterChart,{data:msData,margin:{top:16,right:28,bottom:26,left:16}},
        RC(CartesianGrid,{stroke:'#eef0f2'}),
        RC(XAxis,{type:'number',dataKey:'x',name:'Post Count',domain:[0,'dataMax'],tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Post Count',position:'insideBottom',offset:-14,fontSize:11,fill:'#6b7280'}}),
        RC(YAxis,{type:'number',dataKey:'y',name:'Story Value',tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Story Value',angle:-90,position:'insideLeft',fontSize:11,fill:'#6b7280'}}),
        RC(Tooltip,{content:MsdTip,cursor:{strokeDasharray:'3 3',stroke:'#e4e6ea'}}),
        RC(Legend,{content:MsdLegend,verticalAlign:'bottom'}),
        RC(Scatter,{data:msData,shape:MsdDot,cursor:'pointer',onClick:(d)=>{const n=d&&(d.name||(d.payload&&d.payload.name));openInsCard(window.WS_DATA.socialMentions,n||'Media Source Distribution','Media Source Distribution','db-mediasource-card');}}),
        RC(Brush,{dataKey:'x',height:22,stroke:'#d4d4d8',travellerWidth:8})
      ));
  }
  dbMount('db-mediasource',RC(MediaSourceDist));

  // ── Top Media Sources (Shared workspace): social platforms swimlane, one dot per post over a week ──
  const TMS_SRC=[
    {name:'Facebook', color:'#1877f2', count:67},
    {name:'Twitter',  color:'#f97316', count:14},
    {name:'YouTube',  color:'#ef4444', count:14},
    {name:'Reddit',   color:'#ff4500', count:8},
    {name:'Instagram',color:'#16a34a', count:1}
  ];
  const TMS_DOWS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const TMS_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const TMS_INFL=['@DITOphofficial','@wazzupph','@techreviewph','@GadgetPilipinas','@juanationph','@Memory.ph'];
  const tmsStart=new Date(2026,6,1).getTime(),tmsEnd=new Date(2026,6,8).getTime();   // Jul 1–8, 2026
  const tmsData=[];
  TMS_SRC.forEach((pl,pi)=>{
    for(let i=0;i<pl.count;i++){
      const h=((pi+1)*2654435761+i*40503)>>>0,day=1+(h%7),hr=(h>>>5)%24,mi=(h>>>10)%60;
      tmsData.push({name:pl.name,color:pl.color,x:new Date(2026,6,day,hr,mi).getTime(),jit:((h>>>15)%13)-6,infl:TMS_INFL[(h>>>3)%TMS_INFL.length]});
    }
  });
  const tmsTicks=[];for(let dd=1;dd<=8;dd++)tmsTicks.push(new Date(2026,6,dd).getTime());
  const TmsYTick=(t)=>{
    const p=TMS_SRC.find(x=>x.name===t.payload.value)||{};
    return RC('text',{x:t.x,y:t.y,dy:4,textAnchor:'end',fontSize:12,fontWeight:500},
      RC('tspan',{fill:p.color||'#6b7280'},t.payload.value+' '),
      RC('tspan',{fill:'#9ca3af'},'('+(p.count||0)+')'));
  };
  const TmsDot=(o)=>o.cx==null?null:RC('circle',{cx:o.cx,cy:o.cy+(o.payload.jit||0),r:5,fill:o.payload.color,fillOpacity:0.7});
  function TmsTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    const d=o.payload[0].payload,dt=new Date(d.x);
    const row=(l,v)=>RC('div',{key:l,style:{fontSize:11.5,margin:'2px 0',color:'rgba(255,255,255,0.62)'}},l+' ',RC('span',{style:{color:'#fff',fontWeight:600}},v));
    return RC('div',{style:{background:'#181d26',borderRadius:8,padding:'11px 13px',boxShadow:'0 6px 20px rgba(0,0,0,0.28)'}},
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:6,fontSize:12.5}},d.name),
      row('Influencer:',d.infl),row('Posted:',TMS_MONTHS[dt.getMonth()].slice(0,3)+' '+dt.getDate()+', '+dt.getFullYear()));
  }
  const tmsFoot=document.getElementById('db-tms-foot');
  if(tmsFoot){const f=ts=>{const d=new Date(ts);return d.getDate()+' '+TMS_MONTHS[d.getMonth()]+' '+d.getFullYear();};
    tmsFoot.innerHTML='<span>'+f(tmsStart)+'</span><span>'+f(tmsEnd)+'</span>';}
  function TopMediaSources(){
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(ScatterChart,{margin:{top:8,right:24,bottom:8,left:0}},
        RC(CartesianGrid,{vertical:false,stroke:'#eef0f2'}),
        RC(XAxis,{type:'number',dataKey:'x',domain:[tmsStart,tmsEnd],ticks:tmsTicks,orientation:'top',tickFormatter:ts=>{const d=new Date(ts);return TMS_DOWS[d.getDay()]+' '+String(d.getDate()).padStart(2,'0');},tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false}),
        RC(YAxis,{type:'category',dataKey:'name',tick:TmsYTick,axisLine:false,tickLine:false,width:96,reversed:true,allowDuplicatedCategory:false}),
        RC(Tooltip,{content:TmsTip,cursor:false}),
        RC(Scatter,{data:tmsData,shape:TmsDot,cursor:'pointer',onClick:(d)=>{const n=d&&(d.name||(d.payload&&d.payload.name));openInsCard(window.WS_DATA.socialMentions,n||'Top Media Sources','Top Media Sources · post distribution','db-mediasources-card');}})
      ));
  }
  dbMount('db-mediasources',RC(TopMediaSources));

  // ── Timeline "Explore Data" → full-page "Total Articles Count" drill-down ──
  const EXPLORE_MEDIUM_COLOR={'Online News':'#dc4a8f','TV':'#16a34a','Broadsheet':'#2563eb'};
  const explorePubs=[
    {name:'Philstar Online',medium:'Online News',articles:23,score:'2.19',ave:'10.6M',svalue:'0.00',exposure:'0.00'},
    {name:'Inquirer Online',medium:'Online News',articles:21,score:'3.16',ave:'8.2M',svalue:'0.00',exposure:'0.00'},
    {name:'Manila Standard Online',medium:'Online News',articles:20,score:'1.23',ave:'4.2M',svalue:'0.00',exposure:'0.00'},
    {name:'News Stringer TV',medium:'Online News',articles:19,score:'0.25',ave:'6.0M',svalue:'0.00',exposure:'0.00'},
    {name:'Bllyonaryo News Channel',medium:'TV',articles:15,score:'0.10',ave:'46.8M',svalue:'0.00',exposure:'0.00'},
    {name:'Manila Times Online',medium:'Online News',articles:14,score:'1.57',ave:'5.9M',svalue:'0.00',exposure:'0.00'},
    {name:'The Philippine Star',medium:'Broadsheet',articles:14,score:'6.74',ave:'5.2M',svalue:'0.00',exposure:'0.00'},
    {name:'Head Topics Online',medium:'Online News',articles:13,score:'9.45',ave:'2.8M',svalue:'0.00',exposure:'0.00'},
    {name:'Philippine Daily Inquirer',medium:'Broadsheet',articles:12,score:'6.77',ave:'6.3M',svalue:'0.00',exposure:'0.00'},
    {name:'Business World Online',medium:'Online News',articles:12,score:'3.15',ave:'2.7M',svalue:'0.00',exposure:'0.00'},
    {name:'Manila Standard',medium:'Broadsheet',articles:12,score:'1.74',ave:'3.3M',svalue:'0.00',exposure:'0.00'},
    {name:'BusinessWorld',medium:'Broadsheet',articles:11,score:'1.74',ave:'4.8M',svalue:'0.00',exposure:'0.00'}
  ];
  function ExplorePubBar(){
    const data=explorePubs.map(p=>({name:p.name+' ('+p.medium+')',pub:p.name,articles:p.articles,fill:EXPLORE_MEDIUM_COLOR[p.medium]||'#9ca3af'}));
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,layout:'vertical',margin:{top:8,right:40,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#eef0f2'}),
        RC(XAxis,{type:'number',domain:[0,25],ticks:[0,5,10,15,20,25],tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'ARTICLES COUNT',position:'insideBottom',offset:-10,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#4b5563'},width:240,axisLine:false,tickLine:false}),
        RC(Tooltip,{content:DarkTip,cursor:{fill:'rgba(0,0,0,0.03)'}}),
        RC(Bar,{dataKey:'articles',radius:[0,4,4,0],maxBarSize:15,isAnimationActive:false,cursor:'pointer',onClick:(d)=>{if(d&&d.pub){const c=document.querySelector('.db-explore-wrap.on .db-explore-toppub-chart');window.openInsPubArticles(d.pub,c&&c.closest('.db-card'));}}},
          ...data.map((d,i)=>RC(Cell,{key:i,fill:d.fill})))
      ));
  }
  function renderEntityCards(gridId,data,scoreLabel,kind){
    const grid=document.getElementById(gridId);if(!grid)return;
    grid.innerHTML=data.map((p,i)=>`<div class="ex-pub-card" onclick="openInsEntityCard('${kind}','${p.name.replace(/'/g,"\\'")}', this)">
      <div class="ex-pub-hd">
        <div class="ex-pub-hd-l"><div class="ex-pub-name" title="${p.name}">${p.name}</div><div class="ex-pub-socialrow">${renderSocialIcons()}</div></div>
        <span class="ex-pub-avatar">${p.name.charAt(0)}</span>
      </div>
      <div class="ex-pub-metrics">
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Article Count</div><div class="ex-pub-stat-val">${p.articles}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">${scoreLabel}</div><div class="ex-pub-stat-val">${p.score}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Total AVE</div><div class="ex-pub-stat-val">${p.ave}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Total SValue</div><div class="ex-pub-stat-val">${p.svalue}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Media Exposure</div><div class="ex-pub-stat-val">${p.exposure}</div></div>
      </div>
    </div>`).join('');
  }
  window.openInsEntityCard=function(kind,name,el){window.openInsListPanel(getEntityArticles(kind,name),name,kind==='author'?'Top Author':'Top Publisher',el);};
  window.openMostArticlesPanel=function(el){window.openInsListPanel(_insSample('mostarticles',8),'May 23, 2026','Most articles in a day',el);};
  // Whiten a sticky crumb once its wrap is scrolled (bind once; reset to top on open)
  function _bindExploreScroll(wrap){
    if(!wrap)return;
    wrap.scrollTop=0;wrap.classList.remove('scrolled');
    if(!wrap._scrollBound){wrap.addEventListener('scroll',()=>wrap.classList.toggle('scrolled',wrap.scrollTop>0));wrap._scrollBound=true;}
  }
  function _showExplore(wrapId){
    const page=document.getElementById('page-dashboard');if(!page)return null;
    document.querySelectorAll('.db-explore-wrap.on').forEach(e=>e.classList.remove('on'));
    page.classList.add('explore-open');
    const wrap=document.getElementById(wrapId);if(wrap)wrap.classList.add('on');
    return wrap;
  }
  window.openTimelineExplore=function(){
    const wrap=_showExplore('db-explore');if(!wrap)return;
    renderEntityCards('db-pubcards-explore',explorePubs,'Pub Score','pub');
    dbMount('db-exp-explore',RC(ExposureBar));
    dbMount('db-toppub-explore',RC(ExplorePubBar));
    _bindExploreScroll(wrap);
    initIcons();
  };
  window.openTonalityExplore=function(){
    const wrap=_showExplore('db-tonality-explore');if(!wrap)return;
    if(_SOC()){renderTonalityExplore();_bindExploreScroll(wrap);initIcons();return;}   // SharedView → social layout
    dbMount('db-ton-timeline',RC(TonTimeline));
    window.renderMentionsTable('db-ton-table',0,'Tonality','All articles');
    _bindExploreScroll(wrap);
    initIcons();
  };
  // SharedView Tonality explore: per-sentiment platform donuts + timeline + per-sentiment influencer lists + posts table
  const TON_PLAT_COLORS={Facebook:'#3d7fd6',Twitter:'#29b6d8',Instagram:'#d6337f',Youtube:'#e0245e'};
  const TON_PLAT={
    Neutral:[['Facebook',69.14,56],['Twitter',23.46,19],['Instagram',7.41,6],['Youtube',0,0]],
    Positive:[['Facebook',100.00,23],['Twitter',0,0],['Instagram',0,0],['Youtube',0,0]],
    Negative:[['Facebook',75.00,3],['Twitter',25.00,1],['Instagram',0,0],['Youtube',0,0]]
  };
  const TON_INF={
    Neutral:[['(Facebook)',11],['DITOphofficial (Facebook)',7],['jmccautosupply (Facebook)',7],['OfficialWant (Facebook)',6],['ofc_iwant (Twitter)',6],['iwantofficial (Instagram)',5],['BilyonaryoPh (Facebook)',4],['bilyonaryo_ph (Twitter)',4],['ConvergeICT (Facebook)',3],['ABSCBNnetwork (Facebook)',3]],
    Positive:[['DITOphofficial (Facebook)',4],['(Facebook)',3],['M360PR (Facebook)',2],['pldt (Facebook)',1],['SMCityLucenaOfficial (Facebook)',1],['map.org.ph (Facebook)',1],['SHAYLIBAND5 (Facebook)',1],['RodrigoDennisUy (Facebook)',1],['ThVoiceNewsweekly (Facebook)',1],['TPCIvinRonaldCabugGatdula (Facebook)',1]],
    Negative:[['BilyonaryoPh (Facebook)',2],['bilyonaryo_ph (Twitter)',1],['(Facebook)',1]]
  };
  const TON_SENT_META=[['Neutral','#6b7280'],['Positive','#16a34a'],['Negative','#e11d48']];
  const _tonBarColor=n=>/\(Twitter\)/.test(n)?TON_PLAT_COLORS.Twitter:/\(Instagram\)/.test(n)?TON_PLAT_COLORS.Instagram:/\(Youtube\)/i.test(n)?TON_PLAT_COLORS.Youtube:TON_PLAT_COLORS.Facebook;
  function TonPlatDonut(props){
    const sent=(props&&props.sent)||'Neutral';
    const data=TON_PLAT[sent].filter(d=>d[2]>0).map(([nm,pct,cnt])=>({name:nm,value:cnt,pct,color:TON_PLAT_COLORS[nm]}));
    const [hov,setHov]=React.useState(null);
    if(!data.length)return RC('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#9ca3af',fontSize:13}},'No data');
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(PieChart,{},RC(Pie,{data,cx:'50%',cy:'50%',innerRadius:'55%',outerRadius:'82%',dataKey:'value',paddingAngle:1,stroke:'none',cursor:'pointer',
        activeIndex:hov==null?-1:hov,activeShape:TonActiveShape,onMouseEnter:(d,i)=>setHov(i),onMouseLeave:()=>setHov(null),
        onClick:(d,idx,e)=>{const nm=d&&(d.name||(d.payload&&d.payload.name));if(!nm)return;const t=e&&(e.target||e.currentTarget);const card=t&&t.closest?t.closest('.db-card'):null;window.openInsListPanel(_insSample('ton-'+sent+'-'+nm,6),nm,sent+' · platform share',card);}},
        ...data.map((d,i)=>RC(Cell,{key:i,fill:d.color,fillOpacity:(hov==null||hov===i)?1:0.35}))),RC(Tooltip,{content:DarkTip})));
  }
  function renderTonalityExplore(){
    const dg=document.getElementById('db-ton-donuts');
    if(dg){
      dg.style.gridTemplateColumns='repeat(3,1fr)';
      dg.innerHTML=TON_SENT_META.map(([sent])=>{
        const leg=TON_PLAT[sent].map(([nm,pct,cnt])=>`<div class="cmp-leg-item"><span class="cmp-leg-dot" style="background:${TON_PLAT_COLORS[nm]}"></span>${nm} ${pct.toFixed(2)}% (${cnt})</div>`).join('');
        return `<div class="db-card"><div class="db-card-hd db-tl-hd"><span class="db-card-title">${sent}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div><div class="cmp-donut-legend">${leg}</div><div class="db-chart-wrap" id="db-ton-donut-${sent}" style="height:240px"></div></div>`;
      }).join('');
      TON_SENT_META.forEach(([sent])=>dbMount('db-ton-donut-'+sent,RC(TonPlatDonut,{sent})));
    }
    dbMount('db-ton-timeline',RC(TonTimeline));
    const ig=document.getElementById('db-ton-inf');
    if(ig){
      ig.style.gridTemplateColumns='repeat(3,1fr)';
      ig.innerHTML=TON_SENT_META.map(([sent,col])=>{
        const rows=TON_INF[sent],max=Math.max(...rows.map(r=>r[1]),1);
        const list=rows.map(([n,c])=>`<div class="ps-media-pub" style="cursor:pointer" onclick="openTpInfluencer('${String(n).replace(/'/g,"\\'")}',this.closest('.db-card'))"><div class="ps-media-pub-name">${n}</div><div class="ps-media-bar"><div class="ps-media-bar-fill" style="width:${Math.round(c/max*100)}%;background:${_tonBarColor(n)}"></div><span class="ps-media-bar-lbl${c===max?' over-fill':''}">${c} Post/s</span></div></div>`).join('');
        return `<div class="db-card"><div class="db-card-hd db-tl-hd"><span class="db-card-title" style="color:${col}">${sent}</span></div><div class="ps-media-pubs">${list}</div></div>`;
      }).join('');
    }
    window.renderTiPosts('db-ton-social-table',0);
  }
  window.closeTimelineExplore=function(){
    const page=document.getElementById('page-dashboard');if(page)page.classList.remove('explore-open');
    document.querySelectorAll('.db-explore-wrap.on').forEach(e=>e.classList.remove('on'));
  };
  // ── Tonality "Explore Data" view: Tonality Timeline (lines) + mentions-style article table ──
  const tonTimeline=[
    {date:'Jun 30, 2026',Negative:6,Neutral:2,Positive:2},
    {date:'Jul 01, 2026',Negative:5,Neutral:3,Positive:5},
    {date:'Jul 02, 2026',Negative:4,Neutral:4,Positive:4},
    {date:'Jul 03, 2026',Negative:3,Neutral:3,Positive:4},
    {date:'Jul 04, 2026',Negative:2,Neutral:1,Positive:5},
    {date:'Jul 05, 2026',Negative:1,Neutral:1,Positive:1},
    {date:'Jul 06, 2026',Negative:2,Neutral:3,Positive:8}
  ];
  const TON_LINE={Negative:'#dc2626',Neutral:'#9ca3af',Positive:'#16a34a'};
  function TonTimeline(){
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(ComposedChart,{data:tonTimeline,margin:{top:16,right:28,bottom:8,left:0}},
        RC(CartesianGrid,{vertical:false,stroke:'#eef0f2'}),
        RC(XAxis,{dataKey:'date',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,allowDecimals:false,width:28,domain:[0,8]}),
        RC(Tooltip,{content:DarkTip}),
        RC(Legend,{iconType:'plainline',wrapperStyle:{fontSize:12,paddingTop:10}}),
        ...['Negative','Neutral','Positive'].map(k=>RC(Line,{key:k,type:'linear',dataKey:k,stroke:TON_LINE[k],strokeWidth:2,dot:{r:4,fill:TON_LINE[k],strokeWidth:0},activeDot:{r:5}}))
      ));
  }
  // Mentions-style article table, reused by any Explore view (target host id + heading for the row preview).
  let _mtblTitle='',_mtblSub='';
  function _mentionsPager(hostId,page,pages,total,per){
    const start=page*per,end=Math.min(total,start+per);
    let b=`<button class="ti-pgb" onclick="goMentionsTablePage('${hostId}',${page-1})"${page<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
    for(let p=0;p<pages;p++)b+=`<button class="ti-pgb${p===page?' on':''}" onclick="goMentionsTablePage('${hostId}',${p})">${p+1}</button>`;
    b+=`<button class="ti-pgb" onclick="goMentionsTablePage('${hostId}',${page+1})"${page>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
    return `<div class="tbl-footer"><div class="ti-arttbl-info">${start+1}–${end} of ${total} results</div><div class="ti-arttbl-btns">${b}</div></div>`;
  }
  window.renderMentionsTable=function(hostId,page,title,sub){
    const host=document.getElementById(hostId);if(!host)return;
    if(title!=null)_mtblTitle=title;if(sub!=null)_mtblSub=sub;
    const per=10,total=mentionData.length,pages=Math.max(1,Math.ceil(total/per));
    page=Math.max(0,Math.min(page||0,pages-1));
    const rows=mentionData.slice(page*per,page*per+per).map((d,i)=>renderTableRow(d,page*per+i)).join('');
    host.innerHTML=`<div class="tbl-scroll"><table class="tbl"><thead><tr>
        <th style="width:46px"><span class="tcb"></span></th>
        <th style="width:130px"><span class="th-inner">Story Value <i data-lucide="info" class="info-i"></i></span></th>
        <th style="width:130px">AVE</th>
        <th>Headline</th>
        <th style="width:220px"><span class="th-inner">Media Outlet <i data-lucide="filter" class="th-filter icon-sm"></i></span></th>
        <th style="width:130px">Sentiment</th>
        <th style="width:170px">Date Published</th>
        <th style="width:40px"></th>
      </tr></thead><tbody>${rows}</tbody></table></div>${_mentionsPager(hostId,page,pages,total,per)}`;
    host.querySelectorAll('tbody tr[data-idx]').forEach(tr=>{tr.style.cursor='pointer';tr.onclick=()=>window.openMentionsArticle(+tr.dataset.idx);});
    initIcons();
  };
  window.goMentionsTablePage=function(hostId,p){window.renderMentionsTable(hostId,p);};
  window.openMentionsArticle=function(idx){
    const d=mentionData[idx];if(!d)return;
    const page=document.getElementById('page-dashboard');if(!page||!document.getElementById('adp-col-mid'))return;
    insArts=mentionData;insPrevIdx=idx;insSrcTitle=_mtblTitle;insSrcSub=_mtblSub;
    const sb=document.querySelector('.sidebar');insSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');if(sb)sb.classList.add('collapsed');
    mdSpotCtx=null;mdActCtx=null;mdActive=-1;
    page.classList.add('ent-detail-open');
    renderInlineDetail(d);_renderInsPrevList();initIcons();
  };
  // ── Publisher Score "Explore Data": Top Publishers + media-type breakdown cards + article table ──
  const PS_BAR={'Online News':'#d6337f','Broadsheet':'#2563eb','Blogs':'#d6337f','Tabloid':'#2563eb','Provincial':'#2563eb','TV':'#16a34a','Radio':'#16a34a'};
  const pubScoreMedia=[
    {name:'Online News',icon:'newspaper',cls:'type-online',articles:16,words:'722.94',pubs:[['Business Mirror Online',3],['Head Topics Online',2],['Inquirer Online',1],['Manila Bulletin Online',1],['Manila Times Online',1]]},
    {name:'Broadsheet',icon:'file-text',cls:'type-broadsheet',articles:3,words:'464.33',pubs:[['Philippine Daily Inquirer',1],['Manila Times',1],['United Daily News',1]]},
    {name:'Blogs',icon:'rss',cls:'type-blog',articles:3,words:'800',pubs:[['Out of Town Blog',1],['Modern Journal Trends',1],['Tech Sabado',1]]},
    {name:'TV',icon:'tv',cls:'type-tv',articles:15,words:'3.1K',pubs:[['Bllyonaryo News Channel',6],['GMA 7',3],['DZMM Teleradyo',3],['IBC 13',1],['UN TV',1]]},
    {name:'Radio',icon:'radio',cls:'type-radio',articles:8,words:'4.7K',pubs:[['DZBB',3],['DZMM',3],['DZRB',1],['Radyo5',1]]}
  ];
  function renderMediaCards(gridId,data){
    const grid=document.getElementById(gridId);if(!grid)return;
    grid.innerHTML=data.map(m=>{
      const max=Math.max(...m.pubs.map(p=>p[1])),bc=PS_BAR[m.name]||'#9ca3af';
      const pubs=m.pubs.map(([n,c])=>`<div class="ps-media-pub">
          <div class="ps-media-pub-name">${n}</div>
          <div class="ps-media-bar"><div class="ps-media-bar-fill" style="width:${Math.round(c/max*100)}%;background:${bc}"></div><span class="ps-media-bar-lbl${c===max?' over-fill':''}">${c} Article/s</span></div>
        </div>`).join('');
      return `<div class="ps-media-card">
        <div class="ps-media-hd"><span class="hl-icon ${m.cls}"><i data-lucide="${m.icon}"></i></span><span class="ps-media-name">${m.name}</span></div>
        <div class="ps-media-stats">
          <div><div class="ps-media-stat-lbl">Total Articles</div><div class="ps-media-stat-val">${m.articles}</div></div>
          <div><div class="ps-media-stat-lbl">Avg. Word Count</div><div class="ps-media-stat-val">${m.words}</div></div>
        </div>
        <div class="ps-media-pubs">${pubs}</div>
      </div>`;
    }).join('');
  }
  window.openPubScoreExplore=function(){
    const wrap=_showExplore('db-pubscore-explore');if(!wrap)return;
    dbMount('db-pubscore-exp',RC(ExposureBar));
    dbMount('db-pubscore-toppub',RC(ExplorePubBar));
    renderMediaCards('db-pubscore-media',pubScoreMedia);
    window.renderMentionsTable('db-pubscore-table',0,'Publisher Score','All articles');
    _bindExploreScroll(wrap);
    initIcons();
  };
  // ── "Top Exposure by Medium" → Top Exposure explore: Pubscore Distribution + Top Publishers + Timeline + table ──
  const pubscoreDistData=[69,105,30,49,5,0,0,2,0,13,15].map((c,v)=>({score:v.toFixed(1),count:c}));
  function PubscoreDistChart(){
    const [hov,setHov]=React.useState(null);
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:pubscoreDistData,margin:{top:24,right:14,bottom:18,left:6},onMouseLeave:()=>setHov(null)},
        RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
        RC(XAxis,{dataKey:'score',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'PUBLICATION SCORE',position:'insideBottom',offset:-12,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,allowDecimals:false,width:38,label:{value:'ARTICLE COUNT',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
        RC(Tooltip,{content:DarkTip,cursor:false}),
        RC(Bar,{dataKey:'count',maxBarSize:34,radius:[3,3,0,0],isAnimationActive:false,cursor:'pointer',onMouseEnter:(d,i)=>setHov(i),onClick:(d)=>openInsCard(_insSample('pubscore-'+d.score,Math.max(4,Math.min(8,Math.round((d.count||0)/12)+3))),'Publication Score '+d.score,'Pubscore Distribution','db-expmed-pubscore-card')},
          ...pubscoreDistData.map((d,i)=>RC(Cell,{key:i,fill:(hov===null||hov===i)?'#6d5ae6':'#c9c0f2'})),
          RC(LabelList,{dataKey:'count',position:'top',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
        ),
        RC(Brush,{dataKey:'score',height:28,stroke:'#b9a4f7',travellerWidth:8,tickFormatter:()=>''},
          RC(Area,{dataKey:'count',type:'monotone',stroke:'#b9a4f7',fill:'#ece6fb',fillOpacity:0.6}))
      ));
  }
  // Per-category Pubscore Distribution for the compare "Top Media Exposure by Medium" view
  const CMP_PUBSCORE_DIST=[[14,24,0,10,0,0,0,0,0,4,1],[67,108,26,52,4,0,0,0,0,10,13]];
  function CmpPubscoreDist(props){
    const ci=(props&&props.ci)||0;
    const data=(CMP_PUBSCORE_DIST[ci]||CMP_PUBSCORE_DIST[0]).map((c,v)=>({score:v.toFixed(1),count:c}));
    const [hov,setHov]=React.useState(null);
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,margin:{top:24,right:14,bottom:18,left:6},onMouseLeave:()=>setHov(null)},
        RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
        RC(XAxis,{dataKey:'score',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'PUBLICATION SCORE',position:'insideBottom',offset:-12,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,allowDecimals:false,width:38,label:{value:'ARTICLE COUNT',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
        RC(Tooltip,{content:DarkTip,cursor:false}),
        RC(Bar,{dataKey:'count',maxBarSize:34,radius:[3,3,0,0],isAnimationActive:false,cursor:'pointer',onMouseEnter:(d,i)=>setHov(i),onClick:(d,i,e)=>{if(!d)return;const card=e&&e.target&&e.target.closest?e.target.closest('.db-card'):null;window.openInsListPanel(_insSample('pubscore-'+d.score,8),'Publication Score '+d.score,'Pubscore Distribution',card);}},
          ...data.map((d,i)=>RC(Cell,{key:i,fill:(hov===null||hov===i)?'#6d5ae6':'#c9c0f2'})),
          RC(LabelList,{dataKey:'count',position:'top',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
        ),
        RC(Brush,{dataKey:'score',height:28,stroke:'#b9a4f7',travellerWidth:8,tickFormatter:()=>''},
          RC(Area,{dataKey:'count',type:'monotone',stroke:'#b9a4f7',fill:'#ece6fb',fillOpacity:0.6}))
      ));
  }
  window.openExposureMediumExplore=function(){
    const wrap=_showExplore('db-expmed-explore');if(!wrap)return;
    dbMount('db-expmed-pubscore',RC(PubscoreDistChart));
    dbMount('db-expmed-toppub',RC(ExplorePubBar));
    buildTimeline(7,'db-expmed-timeline');
    document.querySelectorAll('#db-expmed-ranges .db-tl-range').forEach(b=>b.classList.toggle('on',+b.dataset.r===7));
    window.renderMentionsTable('db-expmed-table',0,'Top Exposure · Online News','All articles');
    _bindExploreScroll(wrap);
    initIcons();
  };
  window.setExpMedRange=function(n){
    buildTimeline(n,'db-expmed-timeline');
    document.querySelectorAll('#db-expmed-ranges .db-tl-range').forEach(b=>b.classList.toggle('on',+b.dataset.r===n));
  };
  // ── "Top Publisher" → Top Media Exposure by Publisher: Media Exposure + Top Publishers + 7 media cards + table ──
  const pubMediaFull=[
    {name:'Online News',icon:'newspaper',cls:'type-online',articles:293,words:'578.88',pubs:[['Philstar Online',23],['Inquirer Online',21],['Manila Standard Online',20],['News Stringer TV',19],['Manila Times Online',14]]},
    {name:'Blogs',icon:'rss',cls:'type-blog',articles:80,words:'572.28',pubs:[['Techno Baboy',5],['AppGadget',5],['Tekkie Pinas',5],['manilainsight',5],['Astig Ph Online',4]]},
    {name:'Broadsheet',icon:'file-text',cls:'type-broadsheet',articles:60,words:'480.62',pubs:[['The Philippine Star',14],['Philippine Daily Inquirer',12],['Manila Standard',12],['BusinessWorld',11],['Malaya Business Insight',11]]},
    {name:'Tabloid',icon:'scroll-text',cls:'type-tabloid',articles:11,words:'451.45',pubs:[['Peoples Journal',3],['Abante',3],['Bulgar',2],['Peoples Tonight',1],['Remate',1]]},
    {name:'Provincial',icon:'map-pin',cls:'type-provincial',articles:3,words:'403',pubs:[['Sun Star Cebu',1],['The Freeman',1],['Mindanao Daily News',1]]},
    {name:'TV',icon:'tv',cls:'type-tv',articles:63,words:'1.6K',pubs:[['Bllyonaryo News Channel',15],['ANC',11],['IBC 13',8],['PTV4',8],['GMA 7',5]]},
    {name:'Radio',icon:'radio',cls:'type-radio',articles:16,words:'2.5K',pubs:[['DZBB',5],['DZMM',4],['DZRB',4],['Radyo5',2],['DZRH AM',1]]}
  ];
  window.openTopPubMedExplore=function(){
    const wrap=_showExplore('db-toppubmed-explore');if(!wrap)return;
    dbMount('db-toppubmed-exp',RC(ExposureBar));
    dbMount('db-toppubmed-toppub',RC(ExplorePubBar));
    renderMediaCards('db-toppubmed-media',pubMediaFull);
    window.renderMentionsTable('db-toppubmed-table',0,'Top Publisher','All articles');
    _bindExploreScroll(wrap);
    initIcons();
  };
  // ── "Top Author" → Top Authors explore: Media Exposure + Top Authors bar + media cards + author cards + table ──
  const topAuthorsBar=[
    {name:'Vicky Morales',articles:8,color:'#3b82f6'},{name:'Emil Sumangil',articles:8,color:'#9ca3af'},
    {name:'Mel Tiangco',articles:8,color:'#34d399'},{name:'Iya Villana-Arellano',articles:8,color:'#a7f3d0'},
    {name:'William Thio',articles:7,color:'#64748b'},{name:'Monique Tuzon',articles:6,color:'#8b5cf6'},
    {name:'Bryan Rilloraza',articles:5,color:'#eab308'},{name:'Jervie David Montejar',articles:5,color:'#fde047'},
    {name:'Lourd de Veyra',articles:4,color:'#7c3aed'},{name:'Alvin Elchico',articles:4,color:'#3b82f6'},
    {name:'Noli De Castro',articles:4,color:'#22d3ee'},{name:'Ron Cruz',articles:4,color:'#67e8f9'}
  ];
  function TopAuthorsBar(){
    const data=topAuthorsBar.map(a=>({name:a.name,articles:a.articles,fill:a.color,pub:a.name}));
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,layout:'vertical',margin:{top:8,right:40,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#eef0f2'}),
        RC(XAxis,{type:'number',domain:[0,8],ticks:[0,2,4,6,8],tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'ARTICLES COUNT',position:'insideBottom',offset:-10,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#4b5563'},width:160,axisLine:false,tickLine:false}),
        RC(Tooltip,{content:DarkTip,cursor:{fill:'rgba(0,0,0,0.03)'}}),
        RC(Bar,{dataKey:'articles',radius:[0,4,4,0],maxBarSize:15,isAnimationActive:false,cursor:'pointer',onClick:(d)=>{if(d&&d.pub){const c=document.querySelector('.db-explore-wrap.on .db-explore-toppub-chart');window.openInsEntityCard('author',d.pub,c&&c.closest('.db-card'));}}},
          ...data.map((d,i)=>RC(Cell,{key:i,fill:d.fill})))
      ));
  }
  const authorCards=[
    {name:'Vicky Morales',articles:8,score:'0.94',ave:'41.8M',svalue:'0.00',exposure:'0.00'},
    {name:'Emil Sumangil',articles:8,score:'4.38',ave:'41.8M',svalue:'0.00',exposure:'0.00'},
    {name:'Mel Tiangco',articles:8,score:'0.99',ave:'41.8M',svalue:'0.00',exposure:'0.00'},
    {name:'Iya Villana-Arellano',articles:8,score:'1.03',ave:'41.8M',svalue:'0.00',exposure:'0.00'},
    {name:'William Thio',articles:7,score:'0.00',ave:'2.9M',svalue:'0.00',exposure:'0.00'},
    {name:'Monique Tuzon',articles:6,score:'0.00',ave:'5.5M',svalue:'0.00',exposure:'0.00'},
    {name:'Bryan Rilloraza',articles:5,score:'0.00',ave:'296.4K',svalue:'0.00',exposure:'0.00'},
    {name:'Jervie David Montejar',articles:5,score:'0.00',ave:'819.6K',svalue:'0.00',exposure:'0.00'},
    {name:'Lourd de Veyra',articles:4,score:'7.22',ave:'26.2M',svalue:'0.00',exposure:'0.00'},
    {name:'Alvin Elchico',articles:4,score:'5.42',ave:'19.1M',svalue:'0.00',exposure:'0.00'},
    {name:'Noli De Castro',articles:4,score:'4.53',ave:'10.8M',svalue:'0.00',exposure:'0.00'},
    {name:'Ron Cruz',articles:4,score:'1.43',ave:'54.0M',svalue:'0.00',exposure:'0.00'}
  ];
  window.openTopAuthorExplore=function(){
    const wrap=_showExplore('db-author-explore');if(!wrap)return;
    dbMount('db-author-exp',RC(ExposureBar));
    dbMount('db-author-toppub',RC(TopAuthorsBar));
    renderMediaCards('db-author-media',pubMediaFull);
    renderEntityCards('db-author-cards',authorCards,'Author Score','author');
    window.renderMentionsTable('db-author-table',0,'Top Author','All articles');
    _bindExploreScroll(wrap);
    initIcons();
  };
  // ── "Top Entities" → Top Entities explore: Top Entities bar + Keywords cloud + Entities Map ──
  const topEntitiesBar=[['GCash',102],['Philippines',72],['Filipinos',71],['Filipino',51],['Philippine',36],['Globe',35],['Alex Eala',34],['Eala',33],['BSP',25],['InstaPay',24],['Maya',24],['Globe Telecom',22]];
  function TopEntitiesBar(){
    const data=topEntitiesBar.map(([n,c])=>({name:n,count:c,pub:n}));
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,layout:'vertical',margin:{top:8,right:40,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#eef0f2'}),
        RC(XAxis,{type:'number',domain:[0,120],ticks:[0,30,60,90,120],tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'ARTICLES COUNT',position:'insideBottom',offset:-10,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#4b5563'},width:120,axisLine:false,tickLine:false}),
        RC(Tooltip,{content:DarkTip,cursor:{fill:'rgba(0,0,0,0.03)'}}),
        RC(Bar,{dataKey:'count',radius:[0,4,4,0],maxBarSize:16,isAnimationActive:false,fill:'#6d5ae6',cursor:'pointer',onClick:(d)=>{if(d&&d.pub)window.openInsEntity(d.pub);}})
      ));
  }
  const entKeywords=[['GCash',102],['Philippines',72],['Filipinos',71],['Filipino',51],['Philippine',36],['Globe',35],['Alex Eala',34],['Eala',33],['BSP',25],['InstaPay',24],['Maya',24],['Globe Telecom',22],['RCBC',21],['BPI',20],['Filipina',19],['Mynt',19],['PESONet',19],['SEC',18],['Globe Telecom Bank of the Philippine Islands',17],['Pilipinas',17],['MANILA',15],['the Middle East',15],['Metro Manila',14],['Pilipino',14],['Pinoy',14],['Alex',13],['BPI Globe Telecom',13],['PSE',13],['GCashs',12],['Maya Joint',12],['Pero',12],['Southeast Asia',12],['US',12],['Starlink',11],['Gcash',10],['Kasi',10],['ng',10],['Android',9],['Carl Cruz',9],['Cebu',9],['Eli Remolona Jr',9],['Facebook',9],['Globes',9],['Iga Swiatek',9],['LTFRB',9],['Rizal Commercial Banking Corp',9],['Shopee',9],['Starlinks',9],['Ayala',8],['Bangko Sentral ng Pilipinas',8]];
  function renderEntKeywords(){
    const host=document.getElementById('db-entities-kw');if(!host)return;
    host.innerHTML=entKeywords.map(([n,c])=>`<span class="ent-kw-pill" onclick="openInsEntity('${n.replace(/'/g,"\\'")}')"><span class="ent-kw-count">${c}</span>${n}</span>`).join('');
  }
  const entMapFull=[
    {name:'ORG',value:37.12,color:'#8d7ba8',desc:'Organization Entities: businesses, societies, associations.'},
    {name:'PERSON',value:33.64,color:'#6b7fb0',desc:'Person Entities: names of people, including fictional.'},
    {name:'GPE',value:13.03,color:'#6bb0bd',desc:'Geopolitical Entities: countries, cities, states.'},
    {name:'NORP',value:6.77,color:'#5fb088',desc:'Nationalities or religious / political groups.'},
    {name:'PRODUCT',value:3.07,color:'#b6d95a',desc:'Products: objects, vehicles, foods, etc.'},
    {name:'LOC',value:1.34,color:'#5cc98a',desc:'Non-GPE locations: mountains, bodies of water.'},
    {name:'LAW',value:5.03,color:'#e8c14a',desc:'Named legal documents / laws.'}
  ];
  function renderEntMap(hostId,data){
    const grid=document.getElementById(hostId);if(!grid)return;
    const left=data.slice(0,2),right=data.slice(2),sum=a=>a.reduce((s,e)=>s+e.value,0);
    const cell=e=>`<div class="db-entmap-cell" style="flex:${e.value};background:${e.color};cursor:pointer" onclick="entDrill(this.closest('.db-entmap'),'${e.name}','${e.color}')" data-btip="${_makeTip({label:e.name+' ('+e.value.toFixed(2)+'%)',detail:e.desc})}">${e.name} (${e.value.toFixed(2)}%)</div>`;
    grid.innerHTML=`<div class="db-entmap-col" style="flex:${sum(left)}">${left.map(cell).join('')}</div><div class="db-entmap-col" style="flex:${sum(right)}">${right.map(cell).join('')}</div>`;
    const leg=document.getElementById('db-entities-legend');
    if(leg)leg.innerHTML=data.map(e=>`<span class="db-ent-leg-item"><span class="sq" style="background:${e.color}"></span>${e.name}</span>`).join('');
  }
  // SharedView Top Entities explore: post-count bar + per-platform entity cards + Entities Map
  const SOC_TOP_ENTITIES=[['Chi Atienza',1],['NPDC',1]];
  const ENT_PLATFORMS={facebook:[['Chi Atienza',1],['NPDC',1]],twitter:[],instagram:[],youtube:[]};
  function SocTopEntitiesBar(){
    const data=SOC_TOP_ENTITIES.map(([n,c])=>({name:n,count:c,pub:n}));
    const max=Math.max(...data.map(d=>d.count),1);
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,layout:'vertical',margin:{top:8,right:40,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#eef0f2'}),
        RC(XAxis,{type:'number',domain:[0,max],allowDecimals:false,tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'POSTS COUNT',position:'insideBottom',offset:-10,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#4b5563'},width:120,axisLine:false,tickLine:false}),
        RC(Tooltip,{content:DarkTip,cursor:{fill:'rgba(0,0,0,0.03)'}}),
        RC(Bar,{dataKey:'count',radius:[0,4,4,0],maxBarSize:40,isAnimationActive:false,fill:'#3d7fd6',cursor:'pointer',onClick:(d)=>{if(d&&d.pub)window.openInsListPanel(_insSample('ent-'+d.pub,6),d.pub,'Top Entities',document.querySelector('.db-explore-wrap.on .db-card'));}})
      ));
  }
  function renderEntPlatforms(hostId){
    const grid=document.getElementById(hostId);if(!grid)return;
    grid.style.gridTemplateColumns='repeat(4,1fr)';
    const plats=[['facebook','Facebook','fa-facebook','#1877f2'],['twitter','Twitter','fa-twitter','#1da1f2'],['instagram','Instagram','fa-instagram','#e4405f'],['youtube','Youtube','fa-youtube','#ff0000']];
    grid.innerHTML=plats.map(([pk,label,icon,color])=>{
      const list=ENT_PLATFORMS[pk]||[];
      let body;
      if(list.length){const max=Math.max(...list.map(i=>i[1]),1);body='<div class="ps-media-pubs">'+list.map(([n,c])=>`<div class="ps-media-pub" style="cursor:pointer" onclick="openInsEntity('${String(n).replace(/'/g,"\\'")}')"><div class="ps-media-pub-name">${n}</div><div class="ps-media-bar"><div class="ps-media-bar-fill" style="width:${Math.round(c/max*100)}%;background:${color}"></div><span class="ps-media-bar-lbl${c===max?' over-fill':''}">${c} Post/s</span></div></div>`).join('')+'</div>';}
      else body=`<div class="tp-plat-nodata"><div class="tp-plat-nodata-t">No Data Found</div><i class="fa-brands ${icon}" style="color:${color}"></i></div>`;
      return `<div class="db-card tp-plat-card"><div class="db-card-hd db-tl-hd"><span class="db-card-title"><i class="fa-brands ${icon}" style="color:${color};margin-right:7px"></i>${label}</span></div>${body}</div>`;
    }).join('');
  }
  window.openTopEntitiesExplore=function(){
    const wrap=_showExplore('db-entities-explore');if(!wrap)return;
    if(_SOC()){   // SharedView → post-count bar + per-platform entity cards + Entities Map
      dbMount('db-entities-bar',RC(SocTopEntitiesBar));
      renderEntPlatforms('db-ent-platforms');
      renderEntMap('db-entities-map',entityData);
      _bindExploreScroll(wrap);initIcons();return;
    }
    dbMount('db-entities-bar',RC(TopEntitiesBar));
    renderEntKeywords();
    renderEntMap('db-entities-map',entMapFull);
    _bindExploreScroll(wrap);
    initIcons();
  };
  // ── SharedView: "Total Posts Count" explore — Platform Exposure + Top Influencers + per-platform + influencer cards ──
  const TP_INF=[
    {name:'jmccautosupply',platform:'facebook',posts:12,score:'0.83',eng:'252',exposure:'9.96'},
    {name:'iamsuperbianca',platform:'facebook',posts:10,score:'0.92',eng:'232',exposure:'9.17'},
    {name:'DITOphofficial',platform:'facebook',posts:7,score:'2.89',eng:'512',exposure:'20.24'},
    {name:'contextdotph',platform:'facebook',posts:5,score:'0.51',eng:'65',exposure:'2.57'},
    {name:'dylanburton02',platform:'facebook',posts:4,score:'0.76',eng:'77',exposure:'3.04'},
    {name:'pldt',platform:'facebook',posts:3,score:'3.62',eng:'275',exposure:'10.87'},
    {name:'OfficialiWant',platform:'facebook',posts:3,score:'0.28',eng:'21',exposure:'0.83'},
    {name:'ConvergeICT',platform:'facebook',posts:3,score:'1.30',eng:'99',exposure:'3.91'},
    {name:'SHAYLIBAND5',platform:'facebook',posts:3,score:'1.24',eng:'94',exposure:'3.72'},
    {name:'bilyonaryo_ph',platform:'twitter',posts:3,score:'6.00',eng:'9',exposure:'18.00'},
    {name:'ofc_iwant',platform:'twitter',posts:3,score:'1.33',eng:'2',exposure:'4.00'},
    {name:'BilyonaryoPh',platform:'facebook',posts:2,score:'1.32',eng:'67',exposure:'2.65'}
  ];
  const TP_PLATFORMS={
    facebook:[['jmccautosupply',12],['DITOphofficial',7],['dylanburton02',4],['pldt',3],['OfficialiWant',3],['ConvergeICT',3],['SHAYLIBAND5',3],['BilyonaryoPh',2],['M360PR',2],['negosyantenews',2],['RodrigoDennisUy',1],['ANCAlerts',1],['newsbytesph',1]],
    twitter:[['bilyonaryo_ph',3],['ofc_iwant',3],['contextdotph',2],['ABSCBNNews',1],['pnagovph',1],['technobaboy',1],['adobotech',1],['ABSCBN',1],['digitalspaceph',1],['chubbzzz717',1]],
    instagram:[['ditophofficial',1],['iwantofficial',1]],
    youtube:[['DITOTelecomPH',9],['TechReviewPH',5],['GadgetPilipinas',4],['UnboxPH',3],['PHTechChannel',2],['5GSpeedTest',1]],
    reddit:[['r/Philippines',4],['r/telecomPH',3],['u/ph_telcos',2],['u/dito_user',2],['r/gadgets',1]],
    tiktok:[['dito.ph',6],['itsmevince',4],['techtokph',3],['pinoygadget',2],['viraltelco',1]]
  };
  function TpInfluencerBar(){
    const data=TP_INF.map(x=>({name:x.name+' ('+(SOCIAL_PLATFORMS[x.platform]||{label:x.platform}).label.replace(' (Twitter)','')+')',posts:x.posts,fill:x.platform==='twitter'?'#4aa3ff':'#2563eb',key:x.name}));
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,layout:'vertical',margin:{top:8,right:40,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#eef0f2'}),
        RC(XAxis,{type:'number',domain:[0,12],ticks:[0,3,6,9,12],tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'POST COUNT',position:'insideBottom',offset:-10,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:10,fill:'#4b5563'},width:190,axisLine:false,tickLine:false}),
        RC(Tooltip,{content:DarkTip,cursor:{fill:'rgba(0,0,0,0.03)'}}),
        RC(Bar,{dataKey:'posts',name:'Post Count',radius:[0,4,4,0],maxBarSize:15,isAnimationActive:false,cursor:'pointer',onClick:(d)=>{if(d&&d.key)window.openInsListPanel(_insSample('tpinf-'+d.key,8),d.key,'Top Influencers',document.querySelector('.db-explore-wrap.on .db-card'));}},
          ...data.map((d,i)=>RC(Cell,{key:i,fill:d.fill})))
      ));
  }
  function renderTpPlatforms(hostId){
    const grid=document.getElementById(hostId||'db-tp-platforms');if(!grid)return;
    grid.innerHTML=['facebook','twitter','instagram','youtube','reddit','tiktok'].map(pk=>{
      const p=SOCIAL_PLATFORMS[pk]||{label:pk,color:'#888',icon:'fa-globe'},list=TP_PLATFORMS[pk]||[];
      let body;
      if(list.length){const max=Math.max(...list.map(i=>i[1]),1);body='<div class="ps-media-pubs">'+list.map(([n,c])=>`<div class="ps-media-pub" style="cursor:pointer" onclick="openTpInfluencer('${String(n).replace(/'/g,"\\'")}',this.closest('.tp-plat-card'))"><div class="ps-media-pub-name">${n}</div><div class="ps-media-bar"><div class="ps-media-bar-fill" style="width:${Math.round(c/max*100)}%;background:${p.color}"></div><span class="ps-media-bar-lbl${c===max?' over-fill':''}">${c}</span></div></div>`).join('')+'</div>';}
      else body='<div class="cmp-emp-nodata"><i data-lucide="inbox"></i><div>No Data Found</div></div>';
      return `<div class="db-card tp-plat-card"><div class="db-card-hd db-tl-hd"><span class="db-card-title"><i class="fa-brands ${p.icon}" style="color:${p.color};margin-right:7px"></i>${p.label}</span></div>${body}</div>`;
    }).join('');
  }
  window.openTpInfluencer=function(name,el){window.openInsListPanel(_insSample('tpinf-'+name,8),name,'Top Influencers',el);};
  function renderTpInfCards(hostId,infData){
    const grid=document.getElementById(hostId||'db-tp-cards');if(!grid)return;
    grid.innerHTML=(infData||TP_INF).map((x)=>{const [ic,col]=ONE_SOC_SET[({facebook:0,twitter:1,instagram:2,youtube:3,reddit:4,tiktok:5})[x.platform]||0];
      const soc=`<div class="md-socials"><span class="md-soc" style="background:${col}">${ic==='fa-x-twitter'?X_SVG:`<i class="fa-brands ${ic}"></i>`}</span></div>`;
      return `<div class="ex-pub-card" onclick="openTpInfluencer('${x.name.replace(/'/g,"\\'")}',this)">
      <div class="ex-pub-hd">
        <div class="ex-pub-hd-l"><div class="ex-pub-name" title="${x.name}">${x.name}</div><div class="ex-pub-socialrow">${soc}</div></div>
        <span class="ex-pub-avatar">${x.name.charAt(0).toUpperCase()}</span>
      </div>
      <div class="ex-pub-metrics tp-metrics">
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Post Count</div><div class="ex-pub-stat-val">${x.posts}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Influencer Score</div><div class="ex-pub-stat-val">${x.score}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Eng. Score</div><div class="ex-pub-stat-val">${x.eng}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Platform Exposure</div><div class="ex-pub-stat-val">${x.exposure}</div></div>
      </div>
    </div>`;}).join('');
  }
  window.openTotalPostsExplore=function(){
    const wrap=_showExplore('db-totalposts-explore');if(!wrap)return;
    dbMount('db-tp-exposure',RC(ExposureBar));
    dbMount('db-tp-topinf',RC(TpInfluencerBar));
    renderTpPlatforms();
    renderTpInfCards();
    _bindExploreScroll(wrap);
    initIcons();
  };
  // ── Top Influencers explore (from the "Top Influencer" KPI card) ──
  window.openTopInfExplore=function(){
    const wrap=_showExplore('db-topinf-explore');if(!wrap)return;
    dbMount('db-ti-topinf',RC(TpInfluencerBar));
    dbMount('db-ti-inf-bubble',RC(InfluencerBubble));
    dbMount('db-ti-inf-bar',RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:inflDesc,layout:'vertical',margin:{top:16,right:24,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#f0f1f3'}),
        RC(XAxis,{type:'number',dataKey:'posts',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,label:{value:'Post Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:140}),
        RC(Tooltip,{content:InflBarTip,cursor:{fill:'rgba(24,29,38,0.04)'}}),
        RC(Bar,{dataKey:'posts',maxBarSize:26,radius:[0,4,4,0]},
          ...inflDesc.map((a,i)=>RC(Cell,{key:i,fill:a.color})),
          RC(LabelList,{dataKey:'posts',position:'right',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
        )
      )));
    const _bar=document.getElementById('db-ti-inf-bar');if(_bar)_bar.style.display='none';
    renderTpPlatforms('db-ti-platforms');
    renderTpInfCards('db-ti-cards');
    window.renderTiPosts('db-ti-table',0);
    _bindExploreScroll(wrap);
    initIcons();
  };
  window.setTiInfTab=function(t){
    const bub=document.getElementById('db-ti-inf-bubble'),bar=document.getElementById('db-ti-inf-bar');
    if(bub)bub.style.display=t==='bubble'?'':'none';
    if(bar)bar.style.display=t==='bar'?'':'none';
    document.querySelectorAll('#db-ti-inf-tabs .db-tab2').forEach(el=>el.classList.toggle('on',el.dataset.t===t));
  };
  // ── Most Engaging Posts explore (from the "Most Engaging Posts" KPI card) ──
  const ME_INF=[
    {name:'BNSATOfficial',  platform:'facebook', posts:56, score:'7.20', eng:'7200', exposure:'28.80'},
    {name:'DITOphofficial', platform:'facebook', posts:12, score:'2.89', eng:'1240', exposure:'20.24'},
    {name:'pldt',           platform:'facebook', posts:10, score:'6.20', eng:'980',  exposure:'19.60'},
    {name:'bilyonaryo_ph',  platform:'twitter',  posts:9,  score:'6.00', eng:'820',  exposure:'18.00'},
    {name:'negosyantenews', platform:'facebook', posts:8,  score:'5.80', eng:'750',  exposure:'14.50'},
    {name:'SHAYLIBAND5',    platform:'facebook', posts:6,  score:'3.10', eng:'640',  exposure:'7.30'},
    {name:'dylanburton02',  platform:'facebook', posts:5,  score:'0.80', eng:'520',  exposure:'2.60'},
    {name:'ConvergeICT',    platform:'facebook', posts:4,  score:'1.30', eng:'460',  exposure:'3.91'},
    {name:'contextdotph',   platform:'twitter',  posts:3,  score:'0.51', eng:'310',  exposure:'2.57'},
    {name:'BilyonaryoPh',   platform:'facebook', posts:2,  score:'8.40', eng:'280',  exposure:'18.20'},
    {name:'OfficialiWant',  platform:'facebook', posts:2,  score:'0.28', eng:'210',  exposure:'0.83'},
    {name:'ANCalerts',      platform:'twitter',  posts:1,  score:'1.00', eng:'190',  exposure:'4.00'}
  ];
  const ME_PLATFORMS={
    facebook:[['BNSATOfficial',56],['DITOphofficial',12],['pldt',10],['negosyantenews',8],['SHAYLIBAND5',6],['dylanburton02',5],['ConvergeICT',4],['BilyonaryoPh',2],['OfficialiWant',2]],
    twitter:[['bilyonaryo_ph',9],['contextdotph',3],['ANCalerts',1]],
    instagram:[['ditophofficial',1],['iwantofficial',1]],
    youtube:[['DITOTelecomPH',9],['TechReviewPH',5],['GadgetPilipinas',4],['UnboxPH',3],['PHTechChannel',2],['5GSpeedTest',1]],
    reddit:[['r/Philippines',4],['r/telecomPH',3],['u/ph_telcos',2],['u/dito_user',2],['r/gadgets',1]],
    tiktok:[['dito.ph',6],['itsmevince',4],['techtokph',3],['pinoygadget',2],['viraltelco',1]]
  };
  const meEngData=[
    {name:'BNSATOfficial', posts:56, sv:28.8, score:7.20, color:'#2563eb'},
    {name:'DITOphofficial',posts:12, sv:20.2, score:2.89, color:'#7c3aed'},
    {name:'pldt',          posts:10, sv:19.6, score:6.20, color:'#e94f37'},
    {name:'bilyonaryo_ph', posts:9,  sv:18.0, score:6.00, color:'#16a34a'},
    {name:'negosyantenews',posts:8,  sv:14.5, score:5.80, color:'#6b7280'},
    {name:'SHAYLIBAND5',   posts:6,  sv:7.3,  score:3.10, color:'#db2777'},
    {name:'dylanburton02', posts:5,  sv:2.6,  score:0.80, color:'#0891b2'},
    {name:'ConvergeICT',   posts:4,  sv:3.9,  score:1.30, color:'#d97706'},
    {name:'contextdotph',  posts:3,  sv:2.6,  score:0.51, color:'#64748b'},
    {name:'BilyonaryoPh',  posts:2,  sv:18.2, score:8.40, color:'#f59e0b'},
    {name:'OfficialiWant', posts:2,  sv:0.8,  score:0.28, color:'#4f46e5'},
    {name:'ANCalerts',     posts:1,  sv:4.0,  score:1.00, color:'#059669'}
  ];
  const meEngDesc=[...meEngData].sort((a,b)=>b.posts-a.posts);
  const meEngAsc=[...meEngData].sort((a,b)=>a.posts-b.posts);
  const meEngMaxX=Math.max(...meEngData.map(a=>a.posts))+4;
  function MeEngBubble(){
    const n=meEngAsc.length;
    const [rng,setRng]=React.useState([0,n-1]);
    const shown=meEngAsc.slice(rng[0],rng[1]+1);
    return RC('div',{style:{display:'flex',flexDirection:'column',height:'100%'}},
      RC('div',{style:{flex:1,minHeight:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ScatterChart,{margin:{top:16,right:20,bottom:24,left:8}},
            RC(CartesianGrid,{stroke:'#f0f1f3'}),
            RC(XAxis,{type:'number',dataKey:'posts',name:'Post Count',domain:[0,meEngMaxX],tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Post Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
            RC(YAxis,{type:'number',dataKey:'sv',name:'Engagement Score',domain:[0,35],tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:40,label:{value:'Engagement Score',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
            RC(Tooltip,{content:InflTip,cursor:{strokeDasharray:'3 3',stroke:'rgba(0,0,0,0.12)'}}),
            RC(Scatter,{data:shown,shape:InflDot,cursor:'pointer',onClick:(d)=>{const n=d&&(d.name||(d.payload&&d.payload.name));openInsCard(window.WS_DATA.socialMentions,n||'Influencer','Most Engaging Posts','db-mostengaging-explore');}})
          ))),
      RC('div',{className:'db-pub-legend'},meEngData.map(a=>RC('span',{key:a.name,className:'db-pub-leg-item'},RC('span',{className:'dot',style:{background:a.color}}),a.name))),
      RC('div',{style:{height:30,flexShrink:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ComposedChart,{data:meEngAsc,margin:{top:2,right:20,bottom:2,left:8}},
            RC(XAxis,{dataKey:'posts',hide:true}),RC(YAxis,{hide:true}),
            RC(Area,{dataKey:'sv',stroke:'transparent',fill:'transparent',isAnimationActive:false}),
            RC(Brush,{dataKey:'name',height:24,stroke:'#b9a4f7',fill:'#f3eefc',travellerWidth:8,tickFormatter:()=>'',startIndex:rng[0],endIndex:rng[1],onChange:e=>{if(e&&e.startIndex!=null)setRng([e.startIndex,e.endIndex]);}})
          )))
    );
  }
  function MeEngBar(){
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:meEngDesc,layout:'vertical',margin:{top:16,right:24,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#f0f1f3'}),
        RC(XAxis,{type:'number',dataKey:'posts',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,label:{value:'Post Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:140}),
        RC(Tooltip,{content:InflBarTip,cursor:{fill:'rgba(24,29,38,0.04)'}}),
        RC(Bar,{dataKey:'posts',maxBarSize:26,radius:[0,4,4,0]},
          ...meEngDesc.map((a,i)=>RC(Cell,{key:i,fill:a.color})),
          RC(LabelList,{dataKey:'posts',position:'right',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
        )
      ));
  }
  function MeEngTopBar(){
    const data=ME_INF.map(x=>({name:x.name+' ('+(SOCIAL_PLATFORMS[x.platform]||{label:x.platform}).label.replace(' (Twitter)','')+')',posts:x.posts,fill:x.platform==='twitter'?'#4aa3ff':'#2563eb',key:x.name}));
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,layout:'vertical',margin:{top:8,right:40,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#eef0f2'}),
        RC(XAxis,{type:'number',domain:[0,60],tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'POST COUNT',position:'insideBottom',offset:-10,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:10,fill:'#4b5563'},width:190,axisLine:false,tickLine:false}),
        RC(Tooltip,{content:DarkTip,cursor:{fill:'rgba(0,0,0,0.03)'}}),
        RC(Bar,{dataKey:'posts',name:'Post Count',radius:[0,4,4,0],maxBarSize:15,isAnimationActive:false,cursor:'pointer',onClick:(d)=>{if(d&&d.key)window.openInsListPanel(_insSample('me-'+d.key,8),d.key,'Most Engaging Posts',document.querySelector('.db-explore-wrap.on .db-card'));}},
          ...data.map((d,i)=>RC(Cell,{key:i,fill:d.fill})))
      ));
  }
  function MeEngFreq(){
    const bins=[0,1,2,3,4,5,6,7,8,9,10];
    const counts=bins.map(b=>({value:b,count:ME_INF.filter(x=>Math.floor(parseFloat(x.score))===b).length}));
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:counts,margin:{top:16,right:24,bottom:36,left:8}},
        RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
        RC(XAxis,{dataKey:'value',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'ENGAGEMENT SCORE',position:'insideBottom',offset:-20,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,label:{value:'POST COUNT',angle:-90,position:'insideLeft',style:{fontSize:10,fill:'#9ca3af',textAnchor:'middle'}}}),
        RC(Tooltip,{content:DarkTip,cursor:{fill:'rgba(0,0,0,0.03)'}}),
        RC(Bar,{dataKey:'count',fill:'#2563eb',radius:[3,3,0,0],maxBarSize:36,isAnimationActive:false})
      ));
  }
  function renderMePlatforms(){
    const grid=document.getElementById('db-me-platforms');if(!grid)return;
    grid.innerHTML=['facebook','twitter','instagram','youtube','reddit','tiktok'].map(pk=>{
      const p=SOCIAL_PLATFORMS[pk]||{label:pk,color:'#888',icon:'fa-globe'},list=ME_PLATFORMS[pk]||[];
      let body;
      if(list.length){const max=Math.max(...list.map(i=>i[1]),1);body='<div class="ps-media-pubs">'+list.map(([n,c])=>`<div class="ps-media-pub" style="cursor:pointer" onclick="openTpInfluencer('${String(n).replace(/'/g,"\\'")}',this.closest('.tp-plat-card'))"><div class="ps-media-pub-name">${n}</div><div class="ps-media-bar"><div class="ps-media-bar-fill" style="width:${Math.round(c/max*100)}%;background:${p.color}"></div><span class="ps-media-bar-lbl${c===max?' over-fill':''}">${c}</span></div></div>`).join('')+'</div>';}
      else body='<div class="cmp-emp-nodata"><i data-lucide="inbox"></i><div>No Data Found</div></div>';
      return `<div class="db-card tp-plat-card"><div class="db-card-hd db-tl-hd"><span class="db-card-title"><i class="fa-brands ${p.icon}" style="color:${p.color};margin-right:7px"></i>${p.label}</span></div>${body}</div>`;
    }).join('');
  }
  function renderMeInfCards(){
    const grid=document.getElementById('db-me-cards');if(!grid)return;
    grid.innerHTML=ME_INF.map((x)=>{const [ic,col]=ONE_SOC_SET[({facebook:0,twitter:1,instagram:2,youtube:3,reddit:4,tiktok:5})[x.platform]||0];
      const soc=`<div class="md-socials"><span class="md-soc" style="background:${col}">${ic==='fa-x-twitter'?X_SVG:`<i class="fa-brands ${ic}"></i>`}</span></div>`;
      return `<div class="ex-pub-card" onclick="openTpInfluencer('${x.name.replace(/'/g,"\\'")}',this)">
      <div class="ex-pub-hd">
        <div class="ex-pub-hd-l"><div class="ex-pub-name" title="${x.name}">${x.name}</div><div class="ex-pub-socialrow">${soc}</div></div>
        <span class="ex-pub-avatar">${x.name.charAt(0).toUpperCase()}</span>
      </div>
      <div class="ex-pub-metrics tp-metrics">
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Post Count</div><div class="ex-pub-stat-val">${x.posts}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Influencer Score</div><div class="ex-pub-stat-val">${x.score}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Eng. Score</div><div class="ex-pub-stat-val">${x.eng}</div></div>
        <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Platform Exposure</div><div class="ex-pub-stat-val">${x.exposure}</div></div>
      </div>
    </div>`;}).join('');
  }
  window.openMostEngagingExplore=function(){
    const wrap=_showExplore('db-mostengaging-explore');if(!wrap)return;
    dbMount('db-me-topinf',RC(MeEngTopBar));
    dbMount('db-me-inf-bubble',RC(MeEngBubble));
    dbMount('db-me-inf-bar',RC(MeEngBar));
    const _bar=document.getElementById('db-me-inf-bar');if(_bar)_bar.style.display='none';
    dbMount('db-me-frequency',RC(MeEngFreq));
    renderMePlatforms();
    renderMeInfCards();
    window.renderTiPosts('db-me-table',0);
    _bindExploreScroll(wrap);
    initIcons();
  };
  window.setMeInfTab=function(t){
    const bub=document.getElementById('db-me-inf-bubble'),bar=document.getElementById('db-me-inf-bar');
    if(bub)bub.style.display=t==='bubble'?'':'none';
    if(bar)bar.style.display=t==='bar'?'':'none';
    document.querySelectorAll('#db-me-inf-tabs .db-tab2').forEach(el=>el.classList.toggle('on',el.dataset.t===t));
  };
  // ── Most Dominant platform explore (shared panel driven by openDomExplore(platform)) ──
  const DOM_DATA={
    facebook:{
      label:'Facebook', color:'#1877f2', icon:'fa-facebook',
      inf:[
        {name:'jmccautosupply',platform:'facebook',posts:12,score:'0.83',eng:'252',exposure:'9.96'},
        {name:'DITOphofficial',platform:'facebook',posts:7,score:'2.89',eng:'512',exposure:'20.24'},
        {name:'dylanburton02',platform:'facebook',posts:4,score:'0.76',eng:'77',exposure:'3.04'},
        {name:'pldt',platform:'facebook',posts:3,score:'3.62',eng:'275',exposure:'10.87'},
        {name:'OfficialiWant',platform:'facebook',posts:3,score:'0.28',eng:'21',exposure:'0.83'},
        {name:'ConvergeICT',platform:'facebook',posts:3,score:'1.30',eng:'99',exposure:'3.91'},
        {name:'SHAYLIBAND5',platform:'facebook',posts:3,score:'1.24',eng:'94',exposure:'3.72'},
        {name:'BilyonaryoPh',platform:'facebook',posts:2,score:'1.32',eng:'67',exposure:'2.65'},
        {name:'M360PR',platform:'facebook',posts:2,score:'0.02',eng:'1',exposure:'0.04'},
        {name:'negosyantenews',platform:'facebook',posts:2,score:'0.04',eng:'2',exposure:'0.08'},
        {name:'iamsuperbianca',platform:'facebook',posts:2,score:'0.92',eng:'232',exposure:'9.17'},
        {name:'contextdotph',platform:'facebook',posts:1,score:'0.51',eng:'65',exposure:'2.57'}
      ],
      bubble:[
        {name:'jmccautosupply',posts:12,sv:9.9, score:0.83,color:'#2563eb'},
        {name:'DITOphofficial',posts:7, sv:20.2,score:2.89,color:'#7c3aed'},
        {name:'dylanburton02', posts:4, sv:3.0, score:0.76,color:'#0891b2'},
        {name:'pldt',          posts:3, sv:10.9,score:3.62,color:'#e94f37'},
        {name:'OfficialiWant', posts:3, sv:0.8, score:0.28,color:'#4f46e5'},
        {name:'ConvergeICT',   posts:3, sv:3.9, score:1.30,color:'#d97706'},
        {name:'SHAYLIBAND5',   posts:3, sv:3.7, score:1.24,color:'#db2777'},
        {name:'BilyonaryoPh',  posts:2, sv:2.7, score:1.32,color:'#16a34a'},
        {name:'M360PR',        posts:2, sv:0.04,score:0.02,color:'#6b7280'},
        {name:'negosyantenews',posts:2, sv:0.08,score:0.04,color:'#64748b'},
        {name:'iamsuperbianca',posts:2, sv:9.2, score:0.92,color:'#f59e0b'},
        {name:'contextdotph',  posts:1, sv:2.6, score:0.51,color:'#059669'}
      ],
      freq:[[0,90],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0]]
    },
    instagram:{
      label:'Instagram', color:'#e4405f', icon:'fa-instagram',
      inf:[
        {name:'ditophofficial',  platform:'instagram',posts:5,score:'1.20',eng:'1840',exposure:'7.36'},
        {name:'techreviewph_ig', platform:'instagram',posts:3,score:'2.10',eng:'960', exposure:'9.60'},
        {name:'gadgetpinoy',     platform:'instagram',posts:2,score:'1.65',eng:'720', exposure:'6.60'},
        {name:'pinoytech_ig',    platform:'instagram',posts:2,score:'1.40',eng:'580', exposure:'5.60'},
        {name:'iwantofficial',   platform:'instagram',posts:1,score:'0.85',eng:'320', exposure:'3.40'},
        {name:'ditoofficial_ig', platform:'instagram',posts:1,score:'0.72',eng:'240', exposure:'2.88'}
      ],
      bubble:[
        {name:'ditophofficial',  posts:5,sv:7.4,score:1.20,color:'#e4405f'},
        {name:'techreviewph_ig', posts:3,sv:6.2,score:2.10,color:'#7c3aed'},
        {name:'gadgetpinoy',     posts:2,sv:4.1,score:1.65,color:'#2563eb'},
        {name:'pinoytech_ig',    posts:2,sv:3.5,score:1.40,color:'#16a34a'},
        {name:'iwantofficial',   posts:1,sv:3.4,score:0.85,color:'#d97706'},
        {name:'ditoofficial_ig', posts:1,sv:1.8,score:0.72,color:'#0891b2'}
      ],
      freq:[[0,0],[1,2],[2,2],[3,1],[4,0],[5,0],[6,0],[7,1],[8,0],[9,0],[10,0]]
    },
    twitter:{
      label:'X (Twitter)', color:'#000000', icon:'fa-x-twitter',
      inf:[
        {name:'bilyonaryo_ph',platform:'twitter',posts:3,score:'6.00',eng:'9',exposure:'18.00'},
        {name:'ofc_iwant',    platform:'twitter',posts:3,score:'1.33',eng:'2',exposure:'4.00'},
        {name:'contextdotph', platform:'twitter',posts:2,score:'0.51',eng:'65',exposure:'2.57'},
        {name:'ABSCBNNews',   platform:'twitter',posts:1,score:'0.80',eng:'120',exposure:'3.20'},
        {name:'pnagovph',     platform:'twitter',posts:1,score:'0.60',eng:'45',exposure:'1.80'},
        {name:'technobaboy',  platform:'twitter',posts:1,score:'0.40',eng:'30',exposure:'1.20'},
        {name:'adobotech',    platform:'twitter',posts:1,score:'0.35',eng:'22',exposure:'0.88'},
        {name:'ABSCBN',       platform:'twitter',posts:1,score:'0.55',eng:'60',exposure:'2.20'},
        {name:'digitalspaceph',platform:'twitter',posts:1,score:'0.30',eng:'18',exposure:'0.72'},
        {name:'chubbzzz717',  platform:'twitter',posts:1,score:'0.25',eng:'10',exposure:'0.40'}
      ],
      bubble:[
        {name:'bilyonaryo_ph', posts:3,sv:18.0,score:6.00,color:'#16a34a'},
        {name:'ofc_iwant',     posts:3,sv:4.0, score:1.33,color:'#2563eb'},
        {name:'contextdotph',  posts:2,sv:2.6, score:0.51,color:'#64748b'},
        {name:'ABSCBNNews',    posts:1,sv:3.2, score:0.80,color:'#e94f37'},
        {name:'pnagovph',      posts:1,sv:1.8, score:0.60,color:'#7c3aed'},
        {name:'technobaboy',   posts:1,sv:1.2, score:0.40,color:'#d97706'},
        {name:'adobotech',     posts:1,sv:0.9, score:0.35,color:'#db2777'},
        {name:'ABSCBN',        posts:1,sv:2.2, score:0.55,color:'#0891b2'},
        {name:'digitalspaceph',posts:1,sv:0.7, score:0.30,color:'#6b7280'},
        {name:'chubbzzz717',   posts:1,sv:0.4, score:0.25,color:'#f59e0b'}
      ],
      freq:[[0,0],[1,8],[2,1],[3,1],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0]]
    },
    youtube:{
      label:'YouTube', color:'#ff0000', icon:'fa-youtube',
      inf:[
        {name:'DITOTelecomPH',  platform:'youtube',posts:9,score:'3.20',eng:'1200',exposure:'12.80'},
        {name:'TechReviewPH',   platform:'youtube',posts:5,score:'2.10',eng:'780',exposure:'8.40'},
        {name:'GadgetPilipinas',platform:'youtube',posts:4,score:'1.80',eng:'640',exposure:'7.20'},
        {name:'UnboxPH',        platform:'youtube',posts:3,score:'1.40',eng:'480',exposure:'5.60'},
        {name:'PHTechChannel',  platform:'youtube',posts:2,score:'0.90',eng:'310',exposure:'3.60'},
        {name:'5GSpeedTest',    platform:'youtube',posts:1,score:'0.50',eng:'180',exposure:'2.00'}
      ],
      bubble:[
        {name:'DITOTelecomPH',  posts:9,sv:12.8,score:3.20,color:'#ff0000'},
        {name:'TechReviewPH',   posts:5,sv:8.4, score:2.10,color:'#2563eb'},
        {name:'GadgetPilipinas',posts:4,sv:7.2, score:1.80,color:'#7c3aed'},
        {name:'UnboxPH',        posts:3,sv:5.6, score:1.40,color:'#16a34a'},
        {name:'PHTechChannel',  posts:2,sv:3.6, score:0.90,color:'#d97706'},
        {name:'5GSpeedTest',    posts:1,sv:2.0, score:0.50,color:'#6b7280'}
      ],
      freq:[[0,0],[1,1],[2,1],[3,1],[4,1],[5,1],[6,0],[7,0],[8,0],[9,1],[10,0]]
    },
    reddit:{
      label:'Reddit', color:'#ff4500', icon:'fa-reddit',
      inf:[
        {name:'r/Philippines',platform:'reddit',posts:4,score:'1.60',eng:'280',exposure:'6.40'},
        {name:'r/telecomPH',  platform:'reddit',posts:3,score:'1.20',eng:'210',exposure:'4.80'},
        {name:'u/ph_telcos',  platform:'reddit',posts:2,score:'0.80',eng:'140',exposure:'3.20'},
        {name:'u/dito_user',  platform:'reddit',posts:2,score:'0.70',eng:'120',exposure:'2.80'},
        {name:'r/gadgets',    platform:'reddit',posts:1,score:'0.40',eng:'60',exposure:'1.60'}
      ],
      bubble:[
        {name:'r/Philippines',posts:4,sv:6.4,score:1.60,color:'#ff4500'},
        {name:'r/telecomPH',  posts:3,sv:4.8,score:1.20,color:'#2563eb'},
        {name:'u/ph_telcos',  posts:2,sv:3.2,score:0.80,color:'#7c3aed'},
        {name:'u/dito_user',  posts:2,sv:2.8,score:0.70,color:'#16a34a'},
        {name:'r/gadgets',    posts:1,sv:1.6,score:0.40,color:'#d97706'}
      ],
      freq:[[0,0],[1,1],[2,2],[3,1],[4,1],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0]]
    },
    tiktok:{
      label:'TikTok', color:'#111111', icon:'fa-tiktok',
      inf:[
        {name:'dito.ph',    platform:'tiktok',posts:6,score:'2.40',eng:'860',exposure:'9.60'},
        {name:'itsmevince', platform:'tiktok',posts:4,score:'1.80',eng:'640',exposure:'7.20'},
        {name:'techtokph',  platform:'tiktok',posts:3,score:'1.20',eng:'420',exposure:'4.80'},
        {name:'pinoygadget',platform:'tiktok',posts:2,score:'0.80',eng:'280',exposure:'3.20'},
        {name:'viraltelco', platform:'tiktok',posts:1,score:'0.40',eng:'140',exposure:'1.60'}
      ],
      bubble:[
        {name:'dito.ph',    posts:6,sv:9.6,score:2.40,color:'#111111'},
        {name:'itsmevince', posts:4,sv:7.2,score:1.80,color:'#7c3aed'},
        {name:'techtokph',  posts:3,sv:4.8,score:1.20,color:'#2563eb'},
        {name:'pinoygadget',posts:2,sv:3.2,score:0.80,color:'#16a34a'},
        {name:'viraltelco', posts:1,sv:1.6,score:0.40,color:'#d97706'}
      ],
      freq:[[0,0],[1,1],[2,1],[3,1],[4,0],[5,0],[6,1],[7,0],[8,0],[9,0],[10,0]]
    }
  };
  window.openDomExplore=function(platform){
    const wrap=_showExplore('db-dom-explore');if(!wrap)return;
    const d=DOM_DATA[platform]||DOM_DATA.facebook;
    const platLabel=d.label;
    // update dynamic titles and crumb
    const _t=function(id,txt){const el=document.getElementById(id);if(el)el.firstChild.textContent=txt+' ';};
    const _s=function(id,txt){const el=document.getElementById(id);if(el)el.textContent=txt;};
    _s('db-dom-crumb','Most Dominant - '+platLabel);
    _t('db-dom-topinf-title','Top Influencers');
    _t('db-dom-dist-title',platLabel+' Story Value Distribution');
    _t('db-dom-freq-title',platLabel+' Posts Distribution');
    _s('db-dom-cards-title','Top Influencers for Company News - '+platLabel);
    // reset tab to bubble
    const bub=document.getElementById('db-dom-inf-bubble'),bar=document.getElementById('db-dom-inf-bar');
    if(bub)bub.style.display='';if(bar)bar.style.display='none';
    document.querySelectorAll('#db-dom-inf-tabs .db-tab2').forEach(el=>el.classList.toggle('on',el.dataset.t==='bubble'));
    // Top influencers bar — integer-safe domain so small datasets don't get fractional ticks
    const infData=d.inf.map(x=>({name:x.name,posts:x.posts,fill:d.color,key:x.name}));
    const maxPosts=Math.max(...infData.map(x=>x.posts),1);
    const barDomainMax=maxPosts+Math.max(Math.ceil(maxPosts*0.25),1);
    const barTicks=Array.from({length:barDomainMax+1},(_,i)=>i);
    dbMount('db-dom-topinf',RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:infData,layout:'vertical',margin:{top:8,right:40,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#eef0f2'}),
        RC(XAxis,{type:'number',domain:[0,barDomainMax],ticks:barTicks,tick:{fontSize:11,fill:'#9ca3af'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'POST COUNT',position:'insideBottom',offset:-10,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:10,fill:'#4b5563'},width:190,axisLine:false,tickLine:false}),
        RC(Tooltip,{content:DarkTip,cursor:{fill:'rgba(0,0,0,0.03)'}}),
        RC(Bar,{dataKey:'posts',name:'Post Count',radius:[0,4,4,0],maxBarSize:15,isAnimationActive:false,cursor:'pointer',onClick:(x)=>{if(x&&x.key)window.openInsListPanel(_insSample('dom-'+x.key,8),x.key,platLabel,document.querySelector('.db-explore-wrap.on .db-card'));}},
          ...infData.map((x,i)=>RC(Cell,{key:i,fill:x.fill})))
      )));
    // Bubble plot — spread x-axis so same-post-count dots don't stack; cap Y at rounded max
    const bubData=[...d.bubble].sort((a,b)=>a.posts-b.posts);
    const bubMaxX=Math.max(...bubData.map(a=>a.posts),1)+Math.max(Math.ceil(Math.max(...bubData.map(a=>a.posts),1)*0.3),1);
    const bubMaxY=Math.ceil(Math.max(...bubData.map(a=>a.sv),4)/2)*2+2;
    const DomDot=(p)=>p.cx==null?null:RC('circle',{cx:p.cx,cy:p.cy,r:6+p.payload.score*1.4,fill:p.payload.color,opacity:0.72});
    dbMount('db-dom-inf-bubble',RC('div',{style:{display:'flex',flexDirection:'column',height:'100%'}},
      RC('div',{style:{flex:1,minHeight:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ScatterChart,{margin:{top:16,right:20,bottom:24,left:8}},
            RC(CartesianGrid,{stroke:'#f0f1f3'}),
            RC(XAxis,{type:'number',dataKey:'posts',name:'Post Count',domain:[0,bubMaxX],tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Post Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
            RC(YAxis,{type:'number',dataKey:'sv',name:'Story Value',domain:[0,bubMaxY],tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:40,label:{value:'Story Value',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
            RC(Tooltip,{content:InflTip,cursor:{strokeDasharray:'3 3',stroke:'rgba(0,0,0,0.12)'}}),
            RC(Scatter,{data:bubData,shape:DomDot,cursor:'pointer',onClick:(pt)=>{const n=pt&&(pt.name||(pt.payload&&pt.payload.name));if(n)window.openInsListPanel(_insSample('dom-bub-'+n,8),n,platLabel+' Story Value',document.querySelector('.db-explore-wrap.on .db-card'));}})
          ))),
      RC('div',{className:'db-pub-legend'},d.bubble.map(a=>RC('span',{key:a.name,className:'db-pub-leg-item'},RC('span',{className:'dot',style:{background:a.color}}),a.name)))
    ));
    // Bar chart
    const barDesc=[...d.bubble].sort((a,b)=>b.posts-a.posts);
    dbMount('db-dom-inf-bar',RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:barDesc,layout:'vertical',margin:{top:16,right:24,bottom:24,left:8}},
        RC(CartesianGrid,{horizontal:false,stroke:'#f0f1f3'}),
        RC(XAxis,{type:'number',dataKey:'posts',allowDecimals:false,tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,label:{value:'Post Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
        RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:140}),
        RC(Tooltip,{content:InflBarTip,cursor:{fill:'rgba(24,29,38,0.04)'}}),
        RC(Bar,{dataKey:'posts',maxBarSize:26,radius:[0,4,4,0],cursor:'pointer',onClick:(a,idx,e)=>{const n=a&&a.name;if(!n)return;const card=e&&e.target&&e.target.closest?e.target.closest('.db-card'):null;window.openInsListPanel(_insSample('dom-bar-'+n,8),n,platLabel,card);}},
          ...barDesc.map((a,i)=>RC(Cell,{key:i,fill:a.color})),
          RC(LabelList,{dataKey:'posts',position:'right',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
        )
      )));
    // Frequency histogram — integer Y ticks only
    const freqData=d.freq.map(([v,c])=>({value:v,count:c}));
    const freqMaxY=Math.max(...freqData.map(f=>f.count),1);
    const freqYTicks=Array.from({length:freqMaxY+1},(_,i)=>i);
    dbMount('db-dom-frequency',RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data:freqData,margin:{top:16,right:24,bottom:36,left:8}},
        RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
        RC(XAxis,{dataKey:'value',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'STORY VALUE',position:'insideBottom',offset:-20,fontSize:10,fill:'#9ca3af'}}),
        RC(YAxis,{ticks:freqYTicks,domain:[0,freqMaxY+1],tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,label:{value:'POST COUNT',angle:-90,position:'insideLeft',style:{fontSize:10,fill:'#9ca3af',textAnchor:'middle'}}}),
        RC(Tooltip,{content:DarkTip,cursor:{fill:'rgba(0,0,0,0.03)'}}),
        RC(Bar,{dataKey:'count',fill:d.color,radius:[3,3,0,0],maxBarSize:36,isAnimationActive:false,cursor:'pointer',onClick:(fd,idx,e)=>{if(!fd||fd.count===0)return;const card=e&&e.target&&e.target.closest?e.target.closest('.db-card'):null;window.openInsListPanel(_insSample('dom-freq-'+fd.value,8),platLabel+' Story Value '+fd.value,platLabel+' Posts Distribution',card);}})
      )));
    // Influencer cards
    const cardsGrid=document.getElementById('db-dom-cards');
    if(cardsGrid){
      const platIdx={facebook:0,twitter:1,instagram:2,youtube:3,reddit:4,tiktok:5};
      cardsGrid.innerHTML=d.inf.map((x)=>{
        const [ic,col]=ONE_SOC_SET[platIdx[x.platform]||0];
        const soc=`<div class="md-socials"><span class="md-soc" style="background:${col}">${ic==='fa-x-twitter'?X_SVG:`<i class="fa-brands ${ic}"></i>`}</span></div>`;
        return `<div class="ex-pub-card" onclick="openTpInfluencer('${x.name.replace(/'/g,"\\'")}',this)">
        <div class="ex-pub-hd">
          <div class="ex-pub-hd-l"><div class="ex-pub-name" title="${x.name}">${x.name}</div><div class="ex-pub-socialrow">${soc}</div></div>
          <span class="ex-pub-avatar">${x.name.charAt(0).toUpperCase()}</span>
        </div>
        <div class="ex-pub-metrics tp-metrics">
          <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Post Count</div><div class="ex-pub-stat-val">${x.posts}</div></div>
          <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Influencer Score</div><div class="ex-pub-stat-val">${x.score}</div></div>
          <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Eng. Score</div><div class="ex-pub-stat-val">${x.eng}</div></div>
          <div class="ex-pub-stat"><div class="ex-pub-stat-lbl">Platform Exposure</div><div class="ex-pub-stat-val">${x.exposure}</div></div>
        </div>
      </div>`;}).join('');
    }
    // Posts table
    window.renderTiPosts('db-dom-table',0);
    _bindExploreScroll(wrap);
    initIcons();
  };
  window.setDomInfTab=function(t){
    const bub=document.getElementById('db-dom-inf-bubble'),bar=document.getElementById('db-dom-inf-bar');
    if(bub)bub.style.display=t==='bubble'?'':'none';
    if(bar)bar.style.display=t==='bar'?'':'none';
    document.querySelectorAll('#db-dom-inf-tabs .db-tab2').forEach(el=>el.classList.toggle('on',el.dataset.t===t));
  };
  // Posts table for the Top Influencers explore — reuses the social row renderer + opens the post preview
  window.renderTiPosts=function(hostId,page,platform){
    const host=document.getElementById(hostId);if(!host)return;
    let data=(window.WS_DATA&&window.WS_DATA.socialMentions)||[];
    if(platform)data=data.filter(d=>(d.platform||'').toLowerCase()===platform.toLowerCase());
    const _pf=platform?String(platform).replace(/'/g,"\\'"):'';
    const per=10,total=data.length,pages=Math.max(1,Math.ceil(total/per));
    page=Math.max(0,Math.min(page||0,pages-1));
    const start=page*per,end=Math.min(start+per,total);
    const rows=data.slice(start,end).map((d,k)=>renderSocialRow(d,start+k)).join('')||`<tr><td colspan="9" style="text-align:center;padding:28px;color:var(--muted);font-size:13px">No posts for this platform</td></tr>`;
    let btns='';for(let p=0;p<pages;p++)btns+=`<button class="pgb${p===page?' on':''}" onclick="renderTiPosts('${hostId}',${p},'${_pf}')">${p+1}</button>`;
    host.innerHTML=`<div class="tbl-scroll"><table class="tbl"><thead><tr>
        <th style="width:46px"><span class="tcb"></span></th>
        <th style="width:120px">Estimated Reach</th>
        <th style="width:100px">Eng Score</th>
        <th>Post</th>
        <th style="width:72px">Source</th>
        <th style="width:120px">Sentiment</th>
        <th style="width:160px">Influencer</th>
        <th style="width:150px">As of</th>
        <th style="width:40px"></th>
      </tr></thead><tbody>${rows}</tbody></table></div>
      <div class="tbl-footer" style="display:flex;justify-content:space-between;align-items:center">
        <div class="tbl-pg-info">${total?`${start+1}–${end} of ${total} results`:'0 results'}</div>
        <div class="tbl-pg-btns">${pages>1?`<button class="pgb arrow" onclick="renderTiPosts('${hostId}',${page-1},'${_pf}')"${page<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>${btns}<button class="pgb arrow" onclick="renderTiPosts('${hostId}',${page+1},'${_pf}')"${page>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`:''}</div>
      </div>`;
    host.querySelectorAll('tbody tr[data-idx]').forEach(tr=>{tr.style.cursor='pointer';tr.onclick=()=>{insArts=data;openInsSocial(+tr.dataset.idx);};});
    initIcons();
  };
  // ── Compare view (Phase 1): chips + Overview table + Timeline + Media Exposure + Share of Voice ──
  const CMP_COLORS=['#7c3aed','#ea580c','#2563eb','#16a34a'];
  let _cmpCats=[];
  const CMP_OVERVIEW=[
    ['Total Results',['82','92%'],['573','100%'],['','']],
    ['Top Media Exposure by Publisher',['Manila Times Online','96%'],['Philstar Online','100%'],['5 articles published','23 articles published']],
    ['Top Author',['Logan Kat-D M. Zap…','100%'],['Vicky Morales','100%'],['4 articles published','8 articles published']],
    ['Top Media Exposure by Medium',['Online News','96%'],['Online News','79%'],['53 articles published','311 articles published']],
    ['Most Articles in a day',['27 Article/s',''],['102 Article/s','100%'],['July 3, 2026','July 6, 2026']],
    ['Tonality',['Positive','100%'],['Positive','100%'],['58 articles published','311 articles published']],
    ['Top Entity',['Eric Alberto','100%'],['GCash','100%'],['11 articles published','102 articles published']],
    ['Most Dominant Section',['News',''],['News','58%'],['34 articles published','311 articles published']]
  ];
  function renderCompareChips(){
    const host=document.getElementById('db-compare-chips');if(!host)return;
    host.innerHTML=_cmpCats.map(c=>`<span class="cmp-chip" style="border-color:${c.color};color:${c.color}"><span class="cmp-chip-dot" style="background:${c.color}"></span>${c.name}</span>`).join('')+`<button class="cmp-chip-clear" onclick="closeTimelineExplore()">Clear All</button>`;
  }
  // SharedView Overview: social metrics (post/s, never "article"); values map to compared topics by index (wraps for 3–4)
  const CMP_OVERVIEW_SOCIAL=[
    ['Total Results',['147','100%'],['955','100%'],['','']],
    ['Top Influencer',['iyavillania','0%'],['radyopilipinas1','0%'],['1 post/s','7 post/s']],
    ['Most Engaging Posts',['SunStarPhilippines','100%'],['lalatalinomendoza','48%'],['11.6K post/s','24.3K post/s']],
    ['Top Entity',['Bankers Village','0%'],['Baliuag City','0%'],['1 post/s','1 post/s']],
    ['Most Dominant - Facebook',['sunstardavaonews','100%'],['','100%'],['135 post/s','935 post/s']],
    ['Most Dominant - Twitter',['BBCWorld','0%'],['radyopilipinas1','0%'],['7 post/s','7 post/s']],
    ['Most Dominant - Instagram',['iyavillania','0%'],['doh.philippines','100%'],['1 post/s','12 post/s']],
    ['Most Dominant - Youtube',['PTV','0%'],['No Data',''],['3 post/s','']]
  ];
  function renderCompareOverview(){
    const host=document.getElementById('db-compare-overview');if(!host)return;
    const social=!!(window.WS_DATA&&window.WS_DATA.socialMentions);
    const src=social?CMP_OVERVIEW_SOCIAL:CMP_OVERVIEW;
    const rows=src.map(r=>{
      const cells=_cmpCats.map((c,ci)=>{
        const v=r[1+(ci%2)]||['',''],sub=(r[3]||[])[ci%2]||'';
        const nodata=v[0]==='No Data';
        return `<td class="cmp-ov-cell"><div class="cmp-ov-top"><span class="cmp-ov-val${nodata?' cmp-ov-nodata':''}">${v[0]}</span>${v[1]?`<span class="cmp-ov-pct">${v[1]}</span>`:''}</div>${sub?`<div class="cmp-ov-sub">${sub}</div>`:''}</td>`;
      }).join('');
      return `<tr class="cmp-ov-row" onclick="openCompareDetail('${r[0].replace(/'/g,"\\'")}',this)"><td class="cmp-ov-lbl${social?' cmp-ov-lbl-link':''}">${r[0]}</td>${cells}</tr>`;
    }).join('');
    const metricW=_cmpCats.length>=4?'22%':_cmpCats.length===3?'28%':'38%';   // narrow the Metric column as topics grow
    host.innerHTML=`<table class="cmp-ov-tbl"><thead><tr><th style="width:${metricW}">Metric</th>${_cmpCats.map(c=>`<th style="color:${c.color}">${c.name}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  }
  const cmpTimelineData=[{date:'Jun 30',c0:45,c1:52,c2:33,c3:60},{date:'Jul 01',c0:52,c1:70,c2:41,c3:48},{date:'Jul 02',c0:40,c1:55,c2:50,c3:38},{date:'Jul 03',c0:30,c1:48,c2:22,c3:65},{date:'Jul 04',c0:8,c1:35,c2:44,c3:20},{date:'Jul 05',c0:35,c1:88,c2:60,c3:52},{date:'Jul 06',c0:52,c1:60,c2:30,c3:75},{date:'Jul 07',c0:20,c1:30,c2:48,c3:15}];
  function CompareTimeline(){
    // one line per compared category (2–4); c2/c3 mirror c0/c1 for the layout demo
    const data=cmpTimelineData.map(row=>{const o={date:row.date};_cmpCats.forEach((c,i)=>{o['c'+i]=row['c'+i]!=null?row['c'+i]:row['c'+(i%2)];});return o;});
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(ComposedChart,{data,margin:{top:16,right:24,bottom:8,left:0},onClick:(s,e)=>{if(!s||!s.activeLabel)return;const card=e&&e.target&&e.target.closest?e.target.closest('.db-card'):null;window.openInsListPanel(_insSample('cmpdate-'+s.activeLabel,8),s.activeLabel,'Timeline',card);}},
        RC(CartesianGrid,{vertical:false,stroke:'#eef0f2'}),
        RC(XAxis,{dataKey:'date',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:36}),
        RC(Tooltip,{content:DarkTip}),RC(Legend,{iconType:'plainline',wrapperStyle:{fontSize:11,paddingTop:10}}),
        ..._cmpCats.map((c,i)=>RC(Line,{key:i,type:'linear',dataKey:'c'+i,name:c.name,stroke:c.color,strokeWidth:2,dot:{r:3,fill:c.color},activeDot:{r:5}}))
      ));
  }
  const CMP_MEDIA_COLORS={'Online News':'#d67db3','Blogs':'#a8548f','Broadsheet':'#2f6fb0','Tabloid':'#29b6d8','Provincial':'#4a90d9','TV':'#1b7d3f','Radio':'#43a047'};
  const CMP_MEDIA_DIST=[
    [['Online News',65.43,53],['Blogs',16.05,13],['Broadsheet',9.88,8],['Tabloid',2.47,2],['Provincial',1.23,1],['TV',1.23,3],['Radio',1.23,1]],
    [['Online News',56.30,295],['Blogs',15.46,81],['Broadsheet',10.11,53],['Tabloid',2.10,11],['Provincial',0.57,3],['TV',3.05,64],['Radio',0.57,17]]
  ].map(cat=>cat.map(([name,value,count])=>({name,value,count,color:CMP_MEDIA_COLORS[name]})));
  // SharedView: platform exposure per topic (Facebook/Twitter/Instagram/Reddit)
  const CMP_PLATFORM_COLORS={Facebook:'#3d7fd6',Twitter:'#29b6d8',Instagram:'#d6337f',Reddit:'#f0a6c4',Youtube:'#e0245e'};
  const CMP_PLATFORM_DIST=[
    [['Facebook',75.00,81],['Twitter',18.52,20],['Instagram',5.56,6],['Reddit',0.93,1]],
    [['Facebook',62.69,42],['Twitter',29.85,20],['Instagram',7.46,5]]
  ].map(cat=>cat.map(([name,value,count])=>({name,value,count,color:CMP_PLATFORM_COLORS[name]})));
  const _cmpMediaDist=()=>(window.WS_DATA&&window.WS_DATA.socialMentions)?CMP_PLATFORM_DIST:CMP_MEDIA_DIST;
  function CmpMediaDonut(props){
    const ci=(props&&props.ci)||0;
    const _dist=_cmpMediaDist();
    const data=_dist[ci%_dist.length];
    const [hov,setHov]=React.useState(null);
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(PieChart,{},RC(Pie,{data,cx:'50%',cy:'50%',innerRadius:'55%',outerRadius:'82%',dataKey:'value',paddingAngle:1,stroke:'none',cursor:'pointer',
        activeIndex:hov==null?-1:hov,activeShape:TonActiveShape,onMouseEnter:(d,i)=>setHov(i),onMouseLeave:()=>setHov(null),
        onClick:(d,idx,e)=>{const nm=d&&(d.name||(d.payload&&d.payload.name));if(!nm)return;const t=e&&(e.target||e.currentTarget);const card=t&&t.closest?t.closest('.db-card'):null;window.openInsListPanel(_insSample('med-'+nm,8),nm,(window.WS_DATA&&window.WS_DATA.socialMentions)?'Platform Exposure':'Media Exposure',card);}},
        ...data.map((d,i)=>RC(Cell,{key:i,fill:d.color,fillOpacity:(hov==null||hov===i)?1:0.35}))),RC(Tooltip,{content:DarkTip})));
  }
  function renderCompareMedia(){
    const wrap=document.getElementById('db-compare-media-wrap');if(!wrap)return;
    wrap.style.gridTemplateColumns='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';   // 2→2, 3→3, 4→2×2
    const _dist=_cmpMediaDist();
    wrap.innerHTML=_cmpCats.map((cat,ci)=>{
      const data=_dist[ci%_dist.length];
      const leg=data.map(d=>`<div class="cmp-leg-item"><span class="cmp-leg-dot" style="background:${d.color}"></span>${d.name}: ${d.value.toFixed(2)}% (${d.count})</div>`).join('');
      return `<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div><div class="cmp-donut-body"><div class="cmp-donut-legend">${leg}</div><div class="db-chart-wrap" id="db-compare-media-${ci}" style="height:280px"></div></div></div>`;
    }).join('');
    _cmpCats.forEach((cat,ci)=>dbMount('db-compare-media-'+ci,RC(CmpMediaDonut,{ci})));
    initIcons();
  }
  // Per-media-type comparison cards below Media Exposure — reuses the DS .cmp-ov-tbl table
  const CMP_MT_STATS=[
    {name:'Online News',c0:{ps:'1.57',ave:'9.7M',sv:'116',wc:'413',art:'56'},c1:{ps:'2.19',ave:'68.3M',sv:'0',wc:'544',art:'303'}},
    {name:'Blogs',c0:{ps:'5.99',ave:'1.3M',sv:'43',wc:'363',art:'11'},c1:{ps:'1.76',ave:'14.8M',sv:'0',wc:'624',art:'74'}},
    {name:'Broadsheet',c0:{ps:'1.74',ave:'2.2M',sv:'22',wc:'281',art:'7'},c1:{ps:'1.74',ave:'20.3M',sv:'0',wc:'487',art:'55'}},
    {name:'Tabloid',c0:{ps:'5.14',ave:'229.1K',sv:'3',wc:'307',art:'1'},c1:{ps:'5.14',ave:'3.7M',sv:'0',wc:'477',art:'13'}},
    {name:'Provincial',c0:{ps:'0.19',ave:'85.0K',sv:'1',wc:'271',art:'1'},c1:{ps:'0.37',ave:'593.4K',sv:'0',wc:'364',art:'6'}},
    {name:'TV',c0:{ps:'0.98',ave:'1.1M',sv:'4',wc:'916',art:'3'},c1:{ps:'7.8',ave:'173.4M',sv:'0',wc:'1.4K',art:'56'}},
    {name:'Radio',c0:{ps:'0.05',ave:'854.7K',sv:'2',wc:'1.7K',art:'1'},c1:{ps:'0',ave:'15.1M',sv:'0',wc:'4.9K',art:'14'}}
  ];
  // SharedView: per-platform breakdown as a matrix (platform rows × metric groups × topic cols); missing metric → N/A. Values map to the compared topics by index (wraps for 2–3 topics).
  const CMP_MT_SOCIAL_METRICS=['Avg. Inf. Score','Total SValue','Total Posts','Total Videos','Total Tweets','Total Comments','Total Likes'];
  const CMP_MT_SOCIAL=[
    {name:'Facebook',vals:{'Avg. Inf. Score':['2.14','3.68','1.92','2.75'],'Total SValue':['48','176','62','90'],'Total Posts':['125','53','88','140'],'Total Videos':['41','18','30','52']}},
    {name:'Instagram',vals:{'Avg. Inf. Score':['1.86','2.42','1.55','2.10'],'Total SValue':['22','64','30','45'],'Total Posts':['34','5','69','65'],'Total Comments':['112','340','204','176'],'Total Likes':['1.2K','3.4K','2.6K','1.9K']}},
    {name:'Twitter',vals:{'Avg. Inf. Score':['1.32','2.08','1.10','1.65'],'Total SValue':['18','52','24','33'],'Total Tweets':['14','4','23','19'],'Total Likes':['320','1.5K','680','540']}},
    {name:'Youtube',vals:{'Avg. Inf. Score':['2.56','3.95','2.20','3.10'],'Total SValue':['30','88','40','58'],'Total Videos':['3','12','7','5'],'Total Comments':['46','210','88','120'],'Total Likes':['380','1.8K','720','540']}},
    {name:'Reddit',vals:{'Avg. Inf. Score':['0.92','1.44','0.80','1.15'],'Total SValue':['12','28','16','22'],'Total Posts':['9','21','14','18'],'Total Comments':['64','180','96','130'],'Total Likes':['210','540','300','420']}}
  ];
  function renderCompareMediaTypeStats(){
    const host=document.getElementById('db-compare-mediatype');if(!host)return;
    const cats=_cmpCats,n=cats.length;
    const short=c=>(c.name.split(' - ').pop()||c.name).split(' ')[0]||c.name;
    if(window.WS_DATA&&window.WS_DATA.socialMentions){   // SharedView → single matrix, platform rows, N/A where a metric doesn't apply
      const metricsS=CMP_MT_SOCIAL_METRICS;
      const shead1=metricsS.map(m=>`<th colspan="${n}" class="cmp-mt-grp">${m}</th>`).join('');
      const shead2=metricsS.map(()=>cats.map((c,ci)=>`<th class="${ci===0?'cmp-mt-gstart':''}" style="color:${c.color}">${short(c)}</th>`).join('')).join('');
      const sbody=CMP_MT_SOCIAL.map(p=>`<tr><td class="cmp-mt-type">${p.name}</td>${metricsS.map(m=>{const vals=p.vals[m];return cats.map((c,ci)=>`<td class="cmp-mt-num ${ci===0?'cmp-mt-gstart':''}" style="color:${vals?c.color:'var(--muted)'}">${vals?vals[ci%vals.length]:'N/A'}</td>`).join('');}).join('')}</tr>`).join('');
      host.innerHTML=`<div class="db-card">
        <div class="db-card-hd db-tl-hd"><span class="db-card-title">Media Type Breakdown <i data-lucide="info" class="icon-sm" style="color:var(--muted)"></i></span></div>
        <div class="cmp-mt-legend">${cats.map(c=>`<span class="cmp-leg-item"><span class="cmp-leg-dot" style="background:${c.color}"></span>${c.name}</span>`).join('')}</div>
        <div class="tbl-scroll"><table class="tbl cmp-mt-matrix cmp-mt-matrix-social">
          <thead>
            <tr><th rowspan="2" class="cmp-mt-th-type">Platform</th>${shead1}</tr>
            <tr>${shead2}</tr>
          </thead>
          <tbody>${sbody}</tbody>
        </table></div>
      </div>`;
      initIcons();
      return;
    }
    const metrics=[['PUB SCORE','ps'],['TOTAL AVE','ave'],['TOTAL STORY VALUE','sv'],['AVG. WORD COUNT','wc'],['TOTAL ARTICLES','art']];
    // Labeled matrix: each category gets its own labeled, color-coded column under each metric group (scrolls horizontally at 3–4 categories)
    const head1=metrics.map(m=>`<th colspan="${n}" class="cmp-mt-grp">${m[0]}</th>`).join('');
    const head2=metrics.map(()=>cats.map((c,ci)=>`<th class="${ci===0?'cmp-mt-gstart':''}" style="color:${c.color}">${short(c)}</th>`).join('')).join('');
    const body=CMP_MT_STATS.map(m=>{const cd=[m.c0,m.c1];return `<tr><td class="cmp-mt-type">${m.name}</td>${metrics.map(([_,k])=>cats.map((c,ci)=>`<td class="cmp-mt-num ${ci===0?'cmp-mt-gstart':''}" style="color:${c.color}">${cd[ci%2][k]}</td>`).join('')).join('')}</tr>`;}).join('');
    host.innerHTML=`<div class="db-card">
      <div class="db-card-hd db-tl-hd"><span class="db-card-title">Media Type Breakdown <i data-lucide="info" class="icon-sm" style="color:var(--muted)"></i></span></div>
      <div class="cmp-mt-legend">${cats.map(c=>`<span class="cmp-leg-item"><span class="cmp-leg-dot" style="background:${c.color}"></span>${c.name}</span>`).join('')}</div>
      <div class="tbl-scroll"><table class="tbl cmp-mt-matrix">
        <thead>
          <tr><th rowspan="2" class="cmp-mt-th-type">Media Type</th>${head1}</tr>
          <tr>${head2}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table></div>
    </div>`;
  }
  // Topic Emphasis (Main vs Mention) per category — reuses the dashboard EmphasisBar pattern; null = No Data
  const CMP_EMPHASIS=[{main:60.71,mention:39.29},{main:44.80,mention:55.20},{main:52.40,mention:47.60},{main:66.30,mention:33.70}];
  const cmpEmpSeries=[{key:'main',label:'Main',color:'#5b8def',labelColor:'#fff'},{key:'mention',label:'Mention',color:'#4bd0a0',labelColor:'#0f5137'}];
  function CmpEmphasisBar(props){
    const ci=(props&&props.ci)||0,d=CMP_EMPHASIS[ci]||{main:0,mention:0};
    const data=[{name:'',main:d.main,mention:d.mention}];
    const [hov,setHov]=React.useState(null);
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,layout:'vertical',margin:{top:22,right:10,bottom:22,left:10}},
        RC(XAxis,{type:'number',domain:[0,100],hide:true}),
        RC(YAxis,{type:'category',dataKey:'name',hide:true}),
        RC(Tooltip,{content:DarkTip,cursor:false}),
        ...cmpEmpSeries.map((s,i)=>RC(Bar,{key:s.key,dataKey:s.key,stackId:'a',fill:s.color,maxBarSize:50,isAnimationActive:false,cursor:'pointer',
          fillOpacity:(hov&&hov!==s.key)?0.3:1,onMouseEnter:()=>setHov(s.key),onMouseLeave:()=>setHov(null),
          onClick:(dd,idx,e)=>{const card=e&&e.target&&e.target.closest?e.target.closest('.db-card'):null;const cat=_cmpCats[ci]||{name:''};window.openInsListPanel(_insSample('emp-'+ci+'-'+s.key,8),cat.name,s.label+' emphasis',card);},
          radius:i===0?[5,0,0,5]:[0,5,5,0]},
          RC(LabelList,{dataKey:s.key,position:'center',formatter:v=>v>=10?`${s.label.toUpperCase()}: ${v}%`:'',style:{fontSize:11,fontWeight:600,fill:s.labelColor}})
        ))
      ));
  }
  function renderCompareEmphasis(){
    const host=document.getElementById('db-compare-emphasis');if(!host)return;
    host.innerHTML=_cmpCats.map((cat,ci)=>{
      const d=CMP_EMPHASIS[ci];
      const inner=d?`<div class="db-chart-wrap" id="db-compare-emphasis-${ci}" style="height:96px"></div>`
        :`<div class="cmp-emp-nodata"><i data-lucide="inbox"></i><div>No Data Available</div></div>`;
      return `<div class="cmp-emp-row"><div class="cmp-emp-name" style="color:${cat.color}">${cat.name}</div>${inner}</div>`;
    }).join('');
    _cmpCats.forEach((cat,ci)=>{if(CMP_EMPHASIS[ci])dbMount('db-compare-emphasis-'+ci,RC(CmpEmphasisBar,{ci}));});
    initIcons();
  }
  const CMP_SOV=[
    {label:'Articles',vals:[82,533,82,300],fmt:v=>v},
    {label:'Story Value',vals:[195.67,0,120,60],fmt:v=>v},
    {label:'AVE',vals:[16.4,287.4,50,120],fmt:v=>'PHP '+v+'M'}
  ];
  function CmpSoVDonut(props){
    const mi=(props&&props.mi)||0,m=CMP_SOV[mi];
    const data=_cmpCats.map((c,i)=>({name:c.name,value:m.vals[i]||0,color:c.color}));
    const [hov,setHov]=React.useState(null);
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(PieChart,{},RC(Pie,{data,cx:'50%',cy:'50%',innerRadius:'55%',outerRadius:'82%',dataKey:'value',paddingAngle:1,stroke:'none',cursor:'pointer',
        activeIndex:hov==null?-1:hov,activeShape:TonActiveShape,onMouseEnter:(d,i)=>setHov(i),onMouseLeave:()=>setHov(null),
        onClick:(d,idx,e)=>{const nm=d&&(d.name||(d.payload&&d.payload.name));if(!nm)return;const card=e&&e.target&&e.target.closest?e.target.closest('.db-card'):null;window.openInsListPanel(_insSample('sov-'+mi+'-'+nm,8),nm,m.label+' share',card);}},
        ...data.map((d,i)=>RC(Cell,{key:i,fill:d.color,fillOpacity:(hov==null||hov===i)?1:0.35}))),RC(Tooltip,{content:DarkTip})));
  }
  function renderCompareSoV(){
    const host=document.getElementById('db-compare-sov');if(!host)return;
    host.innerHTML=CMP_SOV.map((m,mi)=>{
      const total=_cmpCats.reduce((s,c,i)=>s+(m.vals[i]||0),0)||1;
      const legend=_cmpCats.map((c,i)=>{const v=m.vals[i]||0;return `<div class="cmp-leg-item"><span class="cmp-leg-dot" style="background:${c.color}"></span>${c.name}: ${(v/total*100).toFixed(2)}% (${m.fmt(v)})</div>`;}).join('');
      return `<div class="cmp-sov-block"><div class="cmp-sov-lbl">${m.label}</div><div class="db-chart-wrap" id="db-compare-sov-${mi}" style="height:220px"></div><div class="cmp-donut-legend cmp-sov-legend">${legend}</div></div>`;
    }).join('');
    [0,1,2].forEach(mi=>dbMount('db-compare-sov-'+mi,RC(CmpSoVDonut,{mi})));
    initIcons();
  }
  // Per-category sentiment donut + tonality timeline for the compare "Tonality" view
  const CMP_SENT=[
    [{name:'Positive',value:59},{name:'Neutral',value:21},{name:'Negative',value:2}],
    [{name:'Positive',value:333},{name:'Neutral',value:170},{name:'Negative',value:31}]
  ];
  const CMP_TON_TIMELINE=[
    [{date:'Jul 01',Positive:1,Neutral:0,Negative:0},{date:'Jul 02',Positive:8,Neutral:5,Negative:0},{date:'Jul 03',Positive:23,Neutral:5,Negative:2},{date:'Jul 04',Positive:7,Neutral:3,Negative:0},{date:'Jul 05',Positive:8,Neutral:3,Negative:0},{date:'Jul 06',Positive:5,Neutral:7,Negative:0},{date:'Jul 07',Positive:5,Neutral:1,Negative:0},{date:'Jul 08',Positive:2,Neutral:1,Negative:1}],
    [{date:'Jul 01',Positive:12,Neutral:4,Negative:1},{date:'Jul 02',Positive:51,Neutral:19,Negative:2},{date:'Jul 03',Positive:32,Neutral:20,Negative:2},{date:'Jul 04',Positive:36,Neutral:9,Negative:2},{date:'Jul 05',Positive:41,Neutral:31,Negative:4},{date:'Jul 06',Positive:59,Neutral:32,Negative:9},{date:'Jul 07',Positive:56,Neutral:26,Negative:9},{date:'Jul 08',Positive:40,Neutral:25,Negative:1},{date:'Jul 09',Positive:6,Neutral:6,Negative:3}],
    [{date:'Jul 01',Positive:6,Neutral:2,Negative:0},{date:'Jul 02',Positive:28,Neutral:5,Negative:1},{date:'Jul 03',Positive:12,Neutral:4,Negative:1},{date:'Jul 04',Positive:38,Neutral:7,Negative:1},{date:'Jul 05',Positive:20,Neutral:6,Negative:1},{date:'Jul 06',Positive:27,Neutral:6,Negative:1},{date:'Jul 07',Positive:29,Neutral:7,Negative:1},{date:'Jul 08',Positive:14,Neutral:8,Negative:1}],
    [{date:'Jul 01',Positive:10,Neutral:3,Negative:1},{date:'Jul 02',Positive:18,Neutral:8,Negative:2},{date:'Jul 03',Positive:40,Neutral:12,Negative:3},{date:'Jul 04',Positive:15,Neutral:5,Negative:1},{date:'Jul 05',Positive:33,Neutral:10,Negative:2},{date:'Jul 06',Positive:22,Neutral:9,Negative:2},{date:'Jul 07',Positive:28,Neutral:11,Negative:2},{date:'Jul 08',Positive:12,Neutral:6,Negative:1}]
  ];
  function CmpTonBar(props){
    const ci=(props&&props.ci)||0,data=CMP_TON_TIMELINE[ci]||CMP_TON_TIMELINE[0];
    const [hov,setHov]=React.useState(null);
    const shape=key=>p=>{
      if(!p||p.height<=0)return null;
      const above=tonOrder.slice(tonOrder.indexOf(key)+1),isTop=above.every(k=>!p.payload[k]);
      return RC(Rectangle,{...p,radius:isTop?[3,3,0,0]:0,fillOpacity:(hov!=null&&hov!==p.index)?0.3:1});
    };
    const bar=(key,fill)=>RC(Bar,{key,dataKey:key,stackId:'s',fill,maxBarSize:34,shape:shape(key),isAnimationActive:false});
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,margin:{top:16,right:12,bottom:8,left:0},onMouseMove:(s)=>setHov(s&&s.activeTooltipIndex!=null?s.activeTooltipIndex:null),onMouseLeave:()=>setHov(null)},
        RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
        RC(XAxis,{dataKey:'date',tick:{fontSize:10,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,allowDecimals:false,width:28}),
        RC(Tooltip,{content:TonBarTip,cursor:{fill:'rgba(24,29,38,0.07)'}}),
        bar('Positive','#16a34a'),bar('Neutral','#9ca3af'),bar('Negative','#dc2626')
      ));
  }
  function renderCompareTonality(){
    const wrap=document.getElementById('db-compare-tonality');if(!wrap)return;
    wrap.style.gridTemplateColumns='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';
    wrap.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div><div class="db-chart-wrap" id="db-compare-tonality-${ci}" style="height:240px"></div></div>`).join('');
    _cmpCats.forEach((cat,ci)=>dbMount('db-compare-tonality-'+ci,RC(CmpTonBar,{ci})));
    initIcons();
  }
  // Frequency Distribution (story-value histogram) per category — reuses the dashboard FrequencyChart pattern
  const CMP_FREQ=[{0:11,1:38,2:17,3:5,4:6,5:6,6:2},{0:45,1:110,2:60,3:30,4:20,5:15,6:8,7:3},{0:8,1:34,2:17,3:12,4:9,5:7,6:3},{0:20,1:52,2:30,3:15,4:11,5:8,6:4}];
  function CmpFreqChart(props){
    const ci=(props&&props.ci)||0,counts=(props&&props.counts)||CMP_FREQ[ci]||CMP_FREQ[0];
    const data=[0,1,2,3,4,5,6,7,8,9,10].map(v=>({value:v.toFixed(2),count:counts[v]||0}));
    const [hov,setHov]=React.useState(null);
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(BarChart,{data,margin:{top:24,right:14,bottom:18,left:6},onMouseLeave:()=>setHov(null)},
        RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
        RC(XAxis,{dataKey:'value',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Story Value',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,allowDecimals:false,width:36,label:{value:_wPost(true)+' Count',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
        RC(Tooltip,{content:FreqTip,cursor:false}),
        RC(Bar,{dataKey:'count',maxBarSize:24,radius:[3,3,0,0],isAnimationActive:false,cursor:'pointer',onMouseEnter:(d,i)=>setHov(i),onClick:(d,idx,e)=>{const card=e&&e.target&&e.target.closest?e.target.closest('.db-card'):null;const cat=_cmpCats[ci]||{name:''};window.openInsListPanel(_insSample('cmpfreq-'+ci+'-'+d.value,8),cat.name,'Story Value '+d.value,card);}},
          ...data.map((d,i)=>RC(Cell,{key:i,fill:(hov===null||hov===i)?'#b9a4f7':'#e8e1fb'})),
          RC(LabelList,{dataKey:'count',position:'top',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
        ),
        RC(Brush,{dataKey:'value',height:28,stroke:'#b9a4f7',travellerWidth:8,tickFormatter:()=>''},
          RC(Area,{dataKey:'count',type:'monotone',stroke:'#b9a4f7',fill:'#ece6fb',fillOpacity:0.6}))
      ));
  }
  function renderCompareFrequency(){
    const wrap=document.getElementById('db-compare-frequency');if(!wrap)return;
    wrap.style.gridTemplateColumns='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';
    wrap.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div><div class="db-chart-wrap" id="db-compare-frequency-${ci}" style="height:300px"></div></div>`).join('');
    _cmpCats.forEach((cat,ci)=>dbMount('db-compare-frequency-'+ci,RC(CmpFreqChart,{ci})));
    initIcons();
  }
  function CmpSentDonut(ci){
    const data=CMP_SENT[ci]||CMP_SENT[0];
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(PieChart,{},
        RC(Pie,{data,cx:'50%',cy:'50%',innerRadius:'55%',outerRadius:'82%',dataKey:'value',paddingAngle:1,stroke:'none',cursor:'pointer',onClick:(d,i,e)=>{const n=d&&(d.name||(d.payload&&d.payload.name));if(!n)return;const card=e&&e.target&&e.target.closest?e.target.closest('.db-card'):null;window.openInsListPanel(_insByTone(n),n+' tonality','Tonality',card);}},
          ...data.map(d=>RC(Cell,{key:d.name,fill:tonColors[d.name]}))),
        RC(Tooltip,{content:TonDonutTip})
      ));
  }
  function CmpTonTimeline(ci){
    const data=CMP_TON_TIMELINE[ci]||CMP_TON_TIMELINE[0];
    return RC(ResponsiveContainer,{width:'99%',height:'100%'},
      RC(ComposedChart,{data,margin:{top:16,right:28,bottom:8,left:0}},
        RC(CartesianGrid,{vertical:false,stroke:'#eef0f2'}),
        RC(XAxis,{dataKey:'date',tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false}),
        RC(YAxis,{tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,allowDecimals:false,width:28}),
        RC(Tooltip,{content:DarkTip}),
        RC(Legend,{iconType:'plainline',wrapperStyle:{fontSize:12,paddingTop:10}}),
        ...['Positive','Neutral','Negative'].map(k=>RC(Line,{key:k,type:'linear',dataKey:k,stroke:tonColors[k],strokeWidth:2,dot:{r:4,fill:tonColors[k],strokeWidth:0},activeDot:{r:5}}))
      ));
  }
  // SharedView Compare: Influencer Story Value Distribution — one bubble per compared topic (reuses InflDot/InflTip)
  const CMP_INFLUENCER=[
    [
      {name:'OfficialiWant',        posts:5, sv:2.0,   score:0.40, color:'#93c5fd'},
      {name:'DITOphofficial',       posts:6, sv:17.0,  score:6.50, color:'#9ca3af'},
      {name:'ofc_iwant',            posts:6, sv:3.0,   score:0.80, color:'#0f172a'},
      {name:'BilyonaryoPh',         posts:5, sv:11.0,  score:2.20, color:'#bfdbfe'},
      {name:'iwantofficial',        posts:5, sv:40.83, score:8.17, color:'#374151'}
    ],
    [
      {name:'jmccautosupply',       posts:8,  sv:17.0, score:3.20, color:'#6b7280'},
      {name:'DITOphofficial',       posts:6,  sv:38.0, score:8.00, color:'#0f766e'},
      {name:'dylanburton02',        posts:2,  sv:8.0,  score:2.40, color:'#93c5fd'},
      {name:'SMCityLucenaOfficial', posts:11, sv:11.0, score:2.00, color:'#0f172a'}
    ]
  ];
  function CmpInfluencerBubble(props){
    const ci=(props&&props.ci)||0;
    const data=(props&&props.data)||CMP_INFLUENCER[ci%CMP_INFLUENCER.length];
    const asc=[...data].sort((a,b)=>a.posts-b.posts);
    const maxX=Math.max(...data.map(a=>a.posts))+1;
    const maxY=Math.max(20,Math.ceil(Math.max(...data.map(a=>a.sv))/10)*10);
    const n=asc.length;
    const [rng,setRng]=React.useState([0,n-1]);
    const shown=asc.slice(rng[0],rng[1]+1);
    return RC('div',{style:{display:'flex',flexDirection:'column',height:'100%'}},
      RC('div',{style:{flex:1,minHeight:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ScatterChart,{margin:{top:16,right:20,bottom:24,left:8}},
            RC(CartesianGrid,{stroke:'#f0f1f3'}),
            RC(XAxis,{type:'number',dataKey:'posts',name:'Post Count',domain:[0,maxX],tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Post Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
            RC(YAxis,{type:'number',dataKey:'sv',name:'Story Value',domain:[0,maxY],tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:40,label:{value:'Story Value',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
            RC(Tooltip,{content:InflTip,cursor:{strokeDasharray:'3 3',stroke:'rgba(0,0,0,0.12)'}}),
            RC(Scatter,{data:shown,shape:InflDot,cursor:'pointer',onClick:(d)=>{const nm=d&&(d.name||(d.payload&&d.payload.name));openInsCard(window.WS_DATA.socialMentions,nm||'Influencer Story Value','Influencer Story Value Distribution','db-compare-influencer-card');}})
          ))),
      RC('div',{className:'db-pub-legend'},data.map(a=>RC('span',{key:a.name,className:'db-pub-leg-item'},RC('span',{className:'dot',style:{background:a.color}}),a.name))),
      RC('div',{style:{height:30,flexShrink:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ComposedChart,{data:asc,margin:{top:2,right:20,bottom:2,left:8}},
            RC(XAxis,{dataKey:'posts',hide:true}),RC(YAxis,{hide:true}),
            RC(Area,{dataKey:'sv',stroke:'transparent',fill:'transparent',isAnimationActive:false}),
            RC(Brush,{dataKey:'name',height:24,stroke:'#b9a4f7',fill:'#f3eefc',travellerWidth:8,tickFormatter:()=>'',startIndex:rng[0],endIndex:rng[1],onChange:e=>{if(e&&e.startIndex!=null)setRng([e.startIndex,e.endIndex]);}})
          )))
    );
  }
  function renderCompareInfluencer(){
    const wrap=document.getElementById('db-compare-influencer');if(!wrap)return;
    wrap.style.gridTemplateColumns='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';   // 2→2, 3→3, 4→2×2
    wrap.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div><div class="db-chart-wrap" id="db-compare-influencer-${ci}" style="height:420px"></div></div>`).join('');
    _cmpCats.forEach((cat,ci)=>dbMount('db-compare-influencer-'+ci,RC(CmpInfluencerBubble,{ci})));
    initIcons();
  }
  window.openCompareView=function(cats){
    if(!cats||cats.length<2)cats=['Company News - DITO Telecommunity','Competitor News - Globe Telecom'];
    _cmpCats=cats.slice(0,4).map((n,i)=>({name:n,color:CMP_COLORS[i%CMP_COLORS.length]}));
    const wrap=_showExplore('db-compare-explore');if(!wrap)return;
    renderCompareChips();
    renderCompareOverview();
    dbMount('db-compare-timeline',CompareTimeline());
    renderCompareMedia();
    renderCompareMediaTypeStats();
    renderCompareEmphasis();
    renderCompareTonality();
    renderCompareFrequency();
    renderCompareInfluencer();
    renderCompareSoV();
    renderCompareEntities();
    _bindExploreScroll(wrap);
    initIcons();
  };
  // ── Compare detail drill-down (opened from an Overview metric row): reuses explore-data layout, per category ──
  const CMP_PUBLISHERS=[
    [['Manila Times Online',6],['Business Mirror Online',5],['Inquirer Online',4],['Head Topics Online',4],['Manila Standard Online',3],['INQUIRER PLUS',3],['Philippine Daily Inquirer',2],['Manila Bulletin Online',2],['Manila Standard',2],['BILYONARYO Online',2]],
    [['Bllyonaryo News Channel',20],['Inquirer Online',19],['Philstar Online',18],['Manila Standard Online',16],['Business World Online',15],['News Stringer TV',14],['Malaya Business Insight Online',13],['Trade Like Gorillas',12],['Business Mirror Online',12],['BusinessWorld',11]]
  ];
  const CMP_AUTHORS=[
    [['Logan Kal-El M. Zapanta',5],['Joel Lacsamana',2],['Fr. Shay Cullen, Ssc',1],['Barbie Salvador-muhlach',1],['Bryan Rilloraza',1],['Inquirer.net',1],['Bedalyn Aguas',1],['Donald Lim',1],['Miguel R. Camus',1],['Darwin G. Amojelar',1]],
    [['Vicky Morales',8],['Emil Sumangil',8],['Mel Tiangco',8],['Iya Villana-Arellano',8],['Monique Tuzon',8],['Korina Sanchez-Roxas',6],['Willard Cheng',6],['Pinky Webb',6],['Apa Ongpin',6],['Maan Macapagal',5]]
  ];
  const CMP_AUTHORCARDS=[
    {name:'Logan Kal-El M. Zapanta',articles:5,score:'0.00',ave:'748.9K',svalue:'9.64',exposure:'9.64'},
    {name:'Joel Lacsamana',articles:2,score:'0.45',ave:'1.9M',svalue:'4.08',exposure:'4.08'},
    {name:'Fr. Shay Cullen, Ssc',articles:1,score:'0.00',ave:'594.7K',svalue:'1.13',exposure:'1.13'},
    {name:'Barbie Salvador-muhlach',articles:1,score:'0.92',ave:'35.0K',svalue:'1.21',exposure:'1.21'},
    {name:'Bryan Rilloraza',articles:1,score:'0.00',ave:'66.9K',svalue:'3.29',exposure:'3.29'},
    {name:'Inquirer.net',articles:1,score:'0.29',ave:'287.6K',svalue:'2.73',exposure:'2.73'},
    {name:'Bedalyn Aguas',articles:1,score:'0.00',ave:'92.1K',svalue:'1.79',exposure:'1.79'},
    {name:'Donald Lim',articles:1,score:'0.01',ave:'744.0K',svalue:'1.93',exposure:'1.93'},
    {name:'Miguel R. Camus',articles:1,score:'0.00',ave:'142.8K',svalue:'1.80',exposure:'1.80'},
    {name:'Darwin G. Amojelar',articles:1,score:'0.01',ave:'138.4K',svalue:'1.72',exposure:'1.72'},
    {name:'Darwin G. Amor',articles:1,score:'0.00',ave:'253.6K',svalue:'1.75',exposure:'1.75'},
    {name:'Arthur Fuentes',articles:1,score:'0.00',ave:'69.9K',svalue:'1.95',exposure:'1.95'}
  ];
  const CMP_SECTIONS=[[['news',34]],[['business',311]]];
  const CMP_PROGRAMS=[
    [['Karambola',1],['Balitang A2Z',1],['Business 360',1],['News Night',1]],
    [['24 Oras',4],['Money Talks',4],['The Score Card',3],['13 News',3],['Mata ng Agila',2],['Ulat Bayan Weekend',2],['Tutok 13',2],['PTV News Tonight',2],['Agenda',1],['Business 360',1]]
  ];
  const CMP_PUBCARDS=[
    {name:'Manila Times Online',articles:6,score:'1.57',ave:'1.8M',svalue:'9.79',exposure:'9.79'},
    {name:'Business Mirror Online',articles:5,score:'3.62',ave:'887.2K',svalue:'14.79',exposure:'14.79'},
    {name:'Inquirer Online',articles:4,score:'3.16',ave:'1.5M',svalue:'11.82',exposure:'11.82'},
    {name:'Head Topics Online',articles:4,score:'9.45',ave:'921.0K',svalue:'21.52',exposure:'21.52'},
    {name:'Manila Standard Online',articles:3,score:'1.23',ave:'327.2K',svalue:'5.25',exposure:'5.25'},
    {name:'INQUIRER PLUS',articles:3,score:'1.95',ave:'622.8K',svalue:'4.47',exposure:'4.47'},
    {name:'Philippine Daily Inquirer',articles:2,score:'6.77',ave:'1.0M',svalue:'8.00',exposure:'8.00'},
    {name:'Manila Bulletin Online',articles:2,score:'1.58',ave:'414.8K',svalue:'3.78',exposure:'3.78'},
    {name:'Manila Standard',articles:2,score:'1.74',ave:'581.6K',svalue:'3.82',exposure:'3.82'},
    {name:'BILYONARYO Online',articles:2,score:'1.80',ave:'338.0K',svalue:'3.38',exposure:'3.38'},
    {name:'ABS-CBN News Online',articles:2,score:'1.81',ave:'167.7K',svalue:'3.09',exposure:'3.09'},
    {name:'Context.PH',articles:2,score:'1.12',ave:'182.1K',svalue:'3.28',exposure:'3.28'}
  ];
  function renderCmpBarList(hostId,items,color,sub,unit){
    const host=document.getElementById(hostId);if(!host)return;
    const _u=unit||(_SOC()?'Post/s':'Article/s');
    const max=Math.max(...items.map(i=>i[1]),1);
    host.innerHTML=items.map(([n,c])=>`<div class="ps-media-pub" style="cursor:pointer" onclick="cmpOpenList('${String(n).replace(/'/g,"\\'")}','${sub||''}',this)">
        <div class="ps-media-pub-name">${n}</div>
        <div class="ps-media-bar"><div class="ps-media-bar-fill" style="width:${Math.round(c/max*100)}%;background:${color}"></div><span class="ps-media-bar-lbl${c===max?' over-fill':''}">${c} ${_u}</span></div>
      </div>`).join('');
  }
  // Top Entity view data + helpers
  const CMP_TOP_ENTITIES=[
    [['Eric Alberto',15],['PLDT',15],['DITO Telecommunity',14],['Manuel V Pangilinan',14],['DITO',13]],
    [['GCash',88],['Philippines',53],['Filipinos',50],['Filipino',47],['Philippine',39]]
  ];
  const _ENT_COL={ORG:'#8d7ba8',PERSON:'#6b7fb0',GPE:'#6bb0bd',NORP:'#5fb088',PRODUCT:'#b6d95a',LOC:'#5cc98a',LAW:'#e8c14a'};
  const _ENT_DSC={ORG:'Organization Entities: businesses, societies, associations.',PERSON:'Person Entities: names of people, including fictional.',GPE:'Geopolitical Entities: countries, cities, states.',NORP:'Nationalities or religious / political groups.',PRODUCT:'Products: objects, vehicles, foods, etc.',LOC:'Non-GPE locations: mountains, bodies of water.',LAW:'Named legal documents / laws.'};
  const _cmpEnt=pairs=>pairs.map(([n,v])=>({name:n,value:v,color:_ENT_COL[n],desc:_ENT_DSC[n]}));
  const CMP_ENTMAP=[
    _cmpEnt([['ORG',37.31],['PERSON',34.26],['GPE',16.75],['NORP',8.63],['PRODUCT',2.03],['LOC',0.76],['LAW',0.25]]),
    _cmpEnt([['ORG',37.08],['PERSON',34.89],['GPE',11.43],['NORP',6.19],['PRODUCT',4.92],['LOC',1.03],['LAW',0.79]]),
    _cmpEnt([['ORG',38.50],['PERSON',33.00],['GPE',14.00],['NORP',7.50],['PRODUCT',4.00],['LOC',1.50],['LAW',1.50]]),
    _cmpEnt([['ORG',36.00],['PERSON',35.50],['GPE',12.50],['NORP',8.00],['PRODUCT',5.00],['LOC',1.50],['LAW',1.50]])
  ];
  function renderCompareEntities(){
    const host=document.getElementById('db-compare-entities');if(!host)return;
    host.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-ent-block"><div class="cmp-col-hd" style="color:${cat.color}">${cat.name}</div><div class="db-entmap" id="db-compare-entmap-${ci}"></div><div class="db-ent-legend" id="db-compare-entleg-${ci}"></div></div>`).join('');
    _cmpCats.forEach((cat,ci)=>{
      const data=CMP_ENTMAP[ci]||CMP_ENTMAP[0];
      renderEntMap('db-compare-entmap-'+ci,data);
      const leg=document.getElementById('db-compare-entleg-'+ci);
      if(leg)leg.innerHTML=data.map(e=>`<span class="db-ent-leg-item"><span class="sq" style="background:${e.color}"></span>${e.name}</span>`).join('');
    });
    initIcons();
  }
  function renderCmpKeywords(hostId,items){
    const host=document.getElementById(hostId);if(!host)return;
    host.innerHTML=items.map(([n,c])=>`<span class="ent-kw-pill" onclick="openInsEntity('${String(n).replace(/'/g,"\\'")}')"><span class="ent-kw-count">${c}</span>${n}</span>`).join('');
  }
  // Open the Insights article-list panel for a clicked compare graph item (publisher / section / program / medium).
  // Pass the clicked element as focusEl so its .db-card is spotlighted (focus mode) instead of dimming everything.
  window.cmpOpenList=function(name,sub,el){
    const arts=getEntityArticles('pub',name);
    window.openInsListPanel(arts&&arts.length?arts:_insSample((sub||'')+'-'+name,6),name,sub||'Compare',el||null);
  };
  // SharedView Compare → "Total Results" → per-topic Total Post Count page (Platform Exposure + Top Influencers + Timeline + influencer cards)
  const CMP_TOP_INFLUENCERS=[
    [['BilyonaryoPh',7],['OfficialiWant',6],['DITOphofficial',6],['ofc_iwant',6],['iwantofficial',5],['bilyonaryo_ph',5],['negosyantenews',4],['ABSCBNnetwork',3],['ABSCBN',3],['M360PR',2],['RodrigoDennisUy',2],['pldt',1],['iconicmnl',1],['ShopeePayPH',1],['map.org.ph',1],['LAdventurerPH',1],['ThVoiceNewsweekly',1],['DRPSPHCAOfficial',1],['TPCIvinRonaldCabugGatdula',1],['bncdotph',1],['ABSCBNNews',1],['contextdotph',1],['technobaboy',1]],
    [['ConvergeICT',3],['DITOphofficial',2],['GlobePH',2],['bilyonaryo_ph',1],['pldt',1]]
  ];
  function renderCmpTotalPosts(){
    const chips=document.getElementById('db-cmptp-chips');
    if(chips)chips.innerHTML=_cmpCats.map(c=>`<span class="cmp-chip" style="border-color:${c.color};color:${c.color}"><span class="cmp-chip-dot" style="background:${c.color}"></span>${c.name}</span>`).join('');
    // Platform Exposure donuts (per topic)
    const dg=document.getElementById('db-cmptp-media');
    if(dg){
      dg.style.gridTemplateColumns='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';
      const dist=_cmpMediaDist();
      dg.innerHTML=_cmpCats.map((cat,ci)=>{
        const data=dist[ci%dist.length];
        const leg=data.map(d=>`<div class="cmp-leg-item"><span class="cmp-leg-dot" style="background:${d.color}"></span>${d.name}: ${d.value.toFixed(2)}% (${d.count})</div>`).join('');
        return `<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div><div class="cmp-donut-body"><div class="cmp-donut-legend">${leg}</div><div class="db-chart-wrap" id="db-cmptp-donut-${ci}" style="height:280px"></div></div></div>`;
      }).join('');
      _cmpCats.forEach((cat,ci)=>dbMount('db-cmptp-donut-'+ci,RC(CmpMediaDonut,{ci})));
    }
    // Top Influencers bar-lists (per topic)
    const ig=document.getElementById('db-cmptp-inf');
    if(ig){
      ig.style.gridTemplateColumns='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';
      ig.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-list-block"><div class="cmp-col-hd" style="color:${cat.color}">${cat.name}</div><div class="ps-media-pubs" id="db-cmptp-inf-${ci}"></div></div>`).join('');
      _cmpCats.forEach((cat,ci)=>renderCmpBarList('db-cmptp-inf-'+ci,CMP_TOP_INFLUENCERS[ci]||CMP_TOP_INFLUENCERS[0],cat.color,'Top Influencer'));
    }
    // Timeline
    dbMount('db-cmptp-timeline',CompareTimeline());
    // Influencer cards (first topic)
    const ch=document.getElementById('db-cmptp-cards-hd');if(ch&&_cmpCats[0])ch.textContent='Top Influencers for '+_cmpCats[0].name;
    renderTpInfCards('db-cmptp-cards');
  }
  window.openCmpTotalPosts=function(){
    if(!_cmpCats||_cmpCats.length<2)_cmpCats=['Company News - DITO Telecommunity','Competitor News - Globe Telecom'].map((n,i)=>({name:n,color:CMP_COLORS[i%CMP_COLORS.length]}));
    const wrap=_showExplore('db-cmpd-totalposts');if(!wrap)return;
    renderCmpTotalPosts();
    _bindExploreScroll(wrap);
    initIcons();
  };
  // SharedView Compare → "Top Influencer" → per-topic Top Influencers page (bar-lists + Influencer Story Value + cards + posts)
  function renderCmpTopInf(){
    const chips=document.getElementById('db-cmpti-chips');
    if(chips)chips.innerHTML=_cmpCats.map(c=>`<span class="cmp-chip" style="border-color:${c.color};color:${c.color}"><span class="cmp-chip-dot" style="background:${c.color}"></span>${c.name}</span>`).join('');
    // Top Influencers bar-lists (per topic)
    const ig=document.getElementById('db-cmpti-inf');
    if(ig){
      ig.style.gridTemplateColumns='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';
      ig.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-list-block"><div class="cmp-col-hd" style="color:${cat.color}">${cat.name}</div><div class="ps-media-pubs" id="db-cmpti-inf-${ci}"></div></div>`).join('');
      _cmpCats.forEach((cat,ci)=>renderCmpBarList('db-cmpti-inf-'+ci,CMP_TOP_INFLUENCERS[ci]||CMP_TOP_INFLUENCERS[0],cat.color,'Top Influencer'));
    }
    // Influencer Story Value Distribution (per-topic bubbles)
    const bg=document.getElementById('db-cmpti-bubbles');
    if(bg){
      bg.style.gridTemplateColumns='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';
      bg.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div><div class="db-chart-wrap" id="db-cmpti-bubble-${ci}" style="height:420px"></div></div>`).join('');
      _cmpCats.forEach((cat,ci)=>dbMount('db-cmpti-bubble-'+ci,RC(CmpInfluencerBubble,{ci})));
    }
    // Influencer cards (first topic)
    const ch=document.getElementById('db-cmpti-cards-hd');if(ch&&_cmpCats[0])ch.textContent='Top Influencers for '+_cmpCats[0].name;
    renderTpInfCards('db-cmpti-cards');
    // Posts table
    window.renderTiPosts('db-cmpti-table',0);
  }
  window.openCmpTopInf=function(){
    if(!_cmpCats||_cmpCats.length<2)_cmpCats=['Company News - DITO Telecommunity','Competitor News - Globe Telecom'].map((n,i)=>({name:n,color:CMP_COLORS[i%CMP_COLORS.length]}));
    const wrap=_showExplore('db-cmpd-topinf');if(!wrap)return;
    renderCmpTopInf();
    _bindExploreScroll(wrap);
    initIcons();
  };
  // SharedView Compare → "Most Engaging Posts" → per-topic page (Influencer Story Value + Frequency + Top Profiles by Eng. Score + cards + posts)
  const CMP_ENGAGEMENT=[
    [['BilyonaryoPh',843],['DITOphofficial',404],['RodrigoDennisUy',154],['ABSCBNnetwork',78],['OfficialiWant',62],['pldt',48],['elisa.garrote.artasuba',31],['aida.sansan.3',22],['negosyantenews',17],['TPCIvinRonaldCabugGatdula',15],['shopeepayph',8],['ShopeePayPH',4],['bncdotph',2],['M360PR',1],['map.org.ph',1],['LAdventurerPH',1],['DRPSPHCAOfficial',1],['iconicmnl',1],['ThVoiceNewsweekly',1]],
    [['ConvergeICT',74],['DITOphofficial',18],['GlobePH',9],['pldt',4],['bilyonaryo_ph',1]]
  ];
  function renderCmpMostEngaging(){
    const chips=document.getElementById('db-cmpme-chips');
    if(chips)chips.innerHTML=_cmpCats.map(c=>`<span class="cmp-chip" style="border-color:${c.color};color:${c.color}"><span class="cmp-chip-dot" style="background:${c.color}"></span>${c.name}</span>`).join('');
    const cols='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';
    // Influencer Story Value bubbles (per topic)
    const bg=document.getElementById('db-cmpme-bubbles');
    if(bg){
      bg.style.gridTemplateColumns=cols;
      bg.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div><div class="db-chart-wrap" id="db-cmpme-bubble-${ci}" style="height:420px"></div></div>`).join('');
      _cmpCats.forEach((cat,ci)=>dbMount('db-cmpme-bubble-'+ci,RC(CmpInfluencerBubble,{ci})));
    }
    // Frequency Distribution histograms (per topic)
    const fg=document.getElementById('db-cmpme-freq');
    if(fg){
      fg.style.gridTemplateColumns=cols;
      fg.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div><div class="db-chart-wrap" id="db-cmpme-freq-${ci}" style="height:340px"></div></div>`).join('');
      _cmpCats.forEach((cat,ci)=>dbMount('db-cmpme-freq-'+ci,RC(CmpFreqChart,{ci})));
    }
    // Top Profiles by Engagement Score (per topic)
    const eg=document.getElementById('db-cmpme-eng');
    if(eg){
      eg.style.gridTemplateColumns=cols;
      eg.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-list-block"><div class="cmp-col-hd" style="color:${cat.color}">${cat.name}</div><div class="ps-media-pubs" id="db-cmpme-eng-${ci}"></div></div>`).join('');
      _cmpCats.forEach((cat,ci)=>renderCmpBarList('db-cmpme-eng-'+ci,CMP_ENGAGEMENT[ci]||CMP_ENGAGEMENT[0],cat.color,'Top Profile','Eng. Score'));
    }
    // Influencer cards (first topic)
    const ch=document.getElementById('db-cmpme-cards-hd');if(ch&&_cmpCats[0])ch.textContent='Top Influencers for '+_cmpCats[0].name;
    renderTpInfCards('db-cmpme-cards');
    // Posts table
    window.renderTiPosts('db-cmpme-table',0);
  }
  window.openCmpMostEngaging=function(){
    if(!_cmpCats||_cmpCats.length<2)_cmpCats=['Company News - DITO Telecommunity','Competitor News - Globe Telecom'].map((n,i)=>({name:n,color:CMP_COLORS[i%CMP_COLORS.length]}));
    const wrap=_showExplore('db-cmpd-mep');if(!wrap)return;
    renderCmpMostEngaging();
    _bindExploreScroll(wrap);
    initIcons();
  };
  // SharedView Compare → "Most Dominant - <Platform>" → per-topic page (Frequency + Influencer Story Value + cards + posts)
  function renderCmpMostDominant(platform){
    const pk=(platform||'facebook').toLowerCase();
    const d=DOM_DATA[pk]||DOM_DATA.facebook;
    const crumb=document.getElementById('db-cmpdom-crumb');if(crumb)crumb.textContent='Most Dominant - '+d.label;
    const chips=document.getElementById('db-cmpdom-chips');
    if(chips)chips.innerHTML=_cmpCats.map(c=>`<span class="cmp-chip" style="border-color:${c.color};color:${c.color}"><span class="cmp-chip-dot" style="background:${c.color}"></span>${c.name}</span>`).join('');
    const cols='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';
    // Per-topic, platform-scoped data: topic 0 = full platform set; topic 1+ = a smaller slice (YouTube's 2nd topic is No Data, per the Overview)
    const topicData=_cmpCats.map((cat,ci)=>{
      if(ci===0)return {bubble:d.bubble,counts:Object.fromEntries(d.freq)};
      if(pk==='youtube')return null;
      const half=Math.max(2,Math.ceil(d.bubble.length/2));
      return {bubble:d.bubble.slice(0,half),counts:Object.fromEntries(d.freq.map(([v,c])=>[v,Math.round(c*0.4)]))};
    });
    const _noData='<div class="cmp-emp-nodata"><i data-lucide="inbox"></i><div>No Data</div></div>';
    const fg=document.getElementById('db-cmpdom-freq');
    if(fg){
      fg.style.gridTemplateColumns=cols;
      fg.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div>${topicData[ci]?`<div class="db-chart-wrap" id="db-cmpdom-freq-${ci}" style="height:340px"></div>`:_noData}</div>`).join('');
      _cmpCats.forEach((cat,ci)=>{if(topicData[ci])dbMount('db-cmpdom-freq-'+ci,RC(CmpFreqChart,{counts:topicData[ci].counts}));});
    }
    const bg=document.getElementById('db-cmpdom-bubbles');
    if(bg){
      bg.style.gridTemplateColumns=cols;
      bg.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-donut-block"><div class="cmp-donut-hd"><span class="cmp-donut-name" style="color:${cat.color}">${cat.name}</span><button class="db-tl-more" title="More"><i data-lucide="more-horizontal"></i></button></div>${topicData[ci]?`<div class="db-chart-wrap" id="db-cmpdom-bubble-${ci}" style="height:420px"></div>`:_noData}</div>`).join('');
      _cmpCats.forEach((cat,ci)=>{if(topicData[ci])dbMount('db-cmpdom-bubble-'+ci,RC(CmpInfluencerBubble,{data:topicData[ci].bubble}));});
    }
    const ch=document.getElementById('db-cmpdom-cards-hd');if(ch)ch.textContent='Top Influencers for '+d.label;
    renderTpInfCards('db-cmpdom-cards',d.inf);
    window.renderTiPosts('db-cmpdom-table',0,pk);
  }
  window.openCmpMostDominant=function(platform){
    if(!_cmpCats||_cmpCats.length<2)_cmpCats=['Company News - DITO Telecommunity','Competitor News - Globe Telecom'].map((n,i)=>({name:n,color:CMP_COLORS[i%CMP_COLORS.length]}));
    const wrap=_showExplore('db-cmpd-dom');if(!wrap)return;
    renderCmpMostDominant(platform);
    _bindExploreScroll(wrap);
    initIcons();
  };
  // SharedView Compare → "Top Entity" → per-topic Top Entities page (entity bar-lists + entity treemaps)
  function renderCmpTopEntity(){
    const chips=document.getElementById('db-cmpent-chips');
    if(chips)chips.innerHTML=_cmpCats.map(c=>`<span class="cmp-chip" style="border-color:${c.color};color:${c.color}"><span class="cmp-chip-dot" style="background:${c.color}"></span>${c.name}</span>`).join('');
    const cols='repeat('+(_cmpCats.length<=3?_cmpCats.length:2)+',1fr)';
    const tg=document.getElementById('db-cmpent-top');
    if(tg){
      tg.style.gridTemplateColumns=cols;
      tg.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-list-block"><div class="cmp-col-hd" style="color:${cat.color}">${cat.name}</div><div class="ps-media-pubs" id="db-cmpent-top-${ci}"></div></div>`).join('');
      _cmpCats.forEach((cat,ci)=>renderCmpBarList('db-cmpent-top-'+ci,CMP_TOP_ENTITIES[ci]||CMP_TOP_ENTITIES[0],cat.color,'Top Entity'));
    }
    const mg=document.getElementById('db-cmpent-maps');
    if(mg){
      mg.style.gridTemplateColumns='1fr';   // treemaps stack full-width, one topic per row
      mg.innerHTML=_cmpCats.map((cat,ci)=>`<div class="cmp-ent-block"><div class="cmp-col-hd" style="color:${cat.color}">${cat.name}</div><div class="db-entmap" id="db-cmpent-map-${ci}"></div><div class="db-ent-legend" id="db-cmpent-leg-${ci}"></div></div>`).join('');
      _cmpCats.forEach((cat,ci)=>{
        const data=CMP_ENTMAP[ci]||CMP_ENTMAP[0];
        renderEntMap('db-cmpent-map-'+ci,data);
        const leg=document.getElementById('db-cmpent-leg-'+ci);
        if(leg)leg.innerHTML=data.map(e=>`<span class="db-ent-leg-item"><span class="sq" style="background:${e.color}"></span>${e.name}</span>`).join('');
      });
    }
  }
  window.openCmpTopEntity=function(){
    if(!_cmpCats||_cmpCats.length<2)_cmpCats=['Company News - DITO Telecommunity','Competitor News - Globe Telecom'].map((n,i)=>({name:n,color:CMP_COLORS[i%CMP_COLORS.length]}));
    const wrap=_showExplore('db-cmpd-ent');if(!wrap)return;
    renderCmpTopEntity();
    _bindExploreScroll(wrap);
    initIcons();
  };
  window.openCompareDetail=function(metric,el){
    if(!_cmpCats||_cmpCats.length<2)_cmpCats=['Company News - DITO Telecommunity','Competitor News - Globe Telecom'].map((n,i)=>({name:n,color:CMP_COLORS[i%CMP_COLORS.length]}));
    // SharedView: "Total Results" opens the per-topic Total Post Count page; other metrics open the social posts side-panel
    if(window.WS_DATA&&window.WS_DATA.socialMentions){
      if(/total results/i.test(metric||'')){window.openCmpTotalPosts();return;}
      if(/most engaging posts/i.test(metric||'')){window.openCmpMostEngaging();return;}
      const _dom=/most dominant\s*-\s*(\w+)/i.exec(metric||'');
      if(_dom){window.openCmpMostDominant(_dom[1]);return;}
      if(/top entity/i.test(metric||'')){window.openCmpTopEntity();return;}
      if(/top influencer/i.test(metric||'')){window.openCmpTopInf();return;}
      window.openInsListPanel(_insSample('cmp-'+(metric||''),8),metric||'Compare Topics','Compare Topics',el||null);
      return;
    }
    // "Most Articles in a day" is a single peak-day figure — show the article list in the side panel, don't navigate to a page
    if(/most articles in a day/i.test(metric||'')){
      window.openInsListPanel(_insSample('mostarticles',8),'Most Articles in a day','Peak coverage day',el||null);
      return;
    }
    const wrap=_showExplore('db-compare-detail');if(!wrap)return;
    const crumb=document.getElementById('db-cmpd-crumb');if(crumb)crumb.textContent=metric||'Top Results';
    const chips=document.getElementById('db-cmpd-chips');
    if(chips)chips.innerHTML=_cmpCats.map(c=>`<span class="cmp-chip" style="border-color:${c.color};color:${c.color}"><span class="cmp-chip-dot" style="background:${c.color}"></span>${c.name}</span>`).join('');
    _cmpCats.forEach((cat,ci)=>{
      const nameEl=document.getElementById('db-cmpd-media-name-'+ci);if(nameEl){nameEl.textContent=cat.name;nameEl.style.color=cat.color;}
      const leg=document.getElementById('db-cmpd-media-leg-'+ci),data=CMP_MEDIA_DIST[ci]||CMP_MEDIA_DIST[0];
      if(leg)leg.innerHTML=data.map(d=>`<div class="cmp-leg-item"><span class="cmp-leg-dot" style="background:${d.color}"></span>${d.name}: ${d.value.toFixed(2)}% (${d.count})</div>`).join('');
      dbMount('db-cmpd-media-'+ci,RC(CmpMediaDonut,{ci}));
      const ph=document.getElementById('db-cmpd-pub-hd-'+ci);if(ph){ph.textContent=cat.name;ph.style.color=cat.color;}
      renderCmpBarList('db-cmpd-pub-'+ci,CMP_PUBLISHERS[ci]||[],cat.color,'Top Publisher');
    });
    // Per-metric view routing
    const isAuthor=/top author/i.test(metric||'');
    const isToppub=/media exposure by publisher/i.test(metric||'');
    const isMedium=/media exposure by medium/i.test(metric||'');
    const isTonality=/tonality/i.test(metric||'');
    const isEntity=/top entity/i.test(metric||'');
    const common=document.getElementById('db-cmpd-common');
    const vTotal=document.getElementById('db-cmpd-view-total'),vTop=document.getElementById('db-cmpd-view-toppub'),vAuthor=document.getElementById('db-cmpd-view-author'),vMedium=document.getElementById('db-cmpd-view-medium'),vTon=document.getElementById('db-cmpd-view-tonality'),vEnt=document.getElementById('db-cmpd-view-entity');
    if(common)common.classList.toggle('on',!isAuthor&&!isMedium&&!isTonality&&!isEntity);   // Media Exposure + Top Publishers: hidden for entity-focused views
    if(vTotal)vTotal.classList.toggle('on',!isAuthor&&!isToppub&&!isMedium&&!isTonality&&!isEntity);
    if(vTop)vTop.classList.toggle('on',isToppub);
    if(vAuthor)vAuthor.classList.toggle('on',isAuthor);
    if(vMedium)vMedium.classList.toggle('on',isMedium);
    if(vTon)vTon.classList.toggle('on',isTonality);
    if(vEnt)vEnt.classList.toggle('on',isEntity);
    if(isEntity){
      _cmpCats.forEach((cat,ci)=>{
        ['en-hd','en-kwhd','en-mapname'].forEach(k=>{const h=document.getElementById('db-cmpd-'+k+'-'+ci);if(h){h.textContent=cat.name;h.style.color=cat.color;}});
        renderCmpBarList('db-cmpd-en-'+ci,CMP_TOP_ENTITIES[ci]||[],cat.color,'Top Entity');
        renderCmpKeywords('db-cmpd-en-kw-'+ci,CMP_TOP_ENTITIES[ci]||[]);
        renderEntMap('db-cmpd-en-map-'+ci,CMP_ENTMAP[ci]||CMP_ENTMAP[0]);
        const leg=document.getElementById('db-cmpd-en-leg-'+ci);
        if(leg)leg.innerHTML=(CMP_ENTMAP[ci]||CMP_ENTMAP[0]).map(e=>`<span class="db-ent-leg-item"><span class="sq" style="background:${e.color}"></span>${e.name}</span>`).join('');
      });
    } else if(isTonality){
      _cmpCats.forEach((cat,ci)=>{
        const nm=document.getElementById('db-cmpd-tn-name-'+ci);if(nm){nm.textContent=cat.name;nm.style.color=cat.color;}
        const tnm=document.getElementById('db-cmpd-tn-tlname-'+ci);if(tnm){tnm.textContent=cat.name;tnm.style.color=cat.color;}
        const arr=CMP_SENT[ci]||CMP_SENT[0],grand=arr.reduce((s,d)=>s+d.value,0)||1;
        const leg=document.getElementById('db-cmpd-tn-leg-'+ci);
        if(leg)leg.innerHTML=arr.map(s=>`<div class="cmp-leg-item"><span class="cmp-leg-dot" style="background:${tonColors[s.name]}"></span>${s.name} ${(s.value/grand*100).toFixed(2)}% (${s.value})</div>`).join('');
        dbMount('db-cmpd-tn-donut-'+ci,CmpSentDonut(ci));
        dbMount('db-cmpd-tn-tl-'+ci,CmpTonTimeline(ci));
      });
      const tncat=document.getElementById('db-cmpd-tn-tbl-cat');if(tncat)tncat.innerHTML=_cmpCats.map(c=>`<option>${c.name}</option>`).join('');
      window.renderMentionsTable('db-cmpd-tn-table',0,metric,'All articles');
    } else if(isMedium){
      _cmpCats.forEach((cat,ci)=>{
        const psn=document.getElementById('db-cmpd-md-ps-name-'+ci);if(psn){psn.textContent=cat.name;psn.style.color=cat.color;}
        dbMount('db-cmpd-md-ps-'+ci,RC(CmpPubscoreDist,{ci}));
        const ph=document.getElementById('db-cmpd-md-pub-hd-'+ci);if(ph){ph.textContent=cat.name;ph.style.color=cat.color;}
        renderCmpBarList('db-cmpd-md-pub-'+ci,CMP_PUBLISHERS[ci]||[],cat.color,'Top Publisher');
      });
      dbMount('db-cmpd-md-timeline',CompareTimeline());
      const mtcat=document.getElementById('db-cmpd-md-tbl-cat');if(mtcat)mtcat.innerHTML=_cmpCats.map(c=>`<option>${c.name}</option>`).join('');
      window.renderMentionsTable('db-cmpd-md-table',0,metric,'All articles');
    } else if(isAuthor){
      _cmpCats.forEach((cat,ci)=>{
        const h=document.getElementById('db-cmpd-au-hd-'+ci);if(h){h.textContent=cat.name;h.style.color=cat.color;}
        renderCmpBarList('db-cmpd-au-'+ci,CMP_AUTHORS[ci]||[],cat.color,'Top Author');
      });
      renderCmpAuthorMT();
      const auHd=document.getElementById('db-cmpd-au-cards-hd');if(auHd)auHd.textContent='Top Authors for '+_cmpCats[0].name;
      renderEntityCards('db-cmpd-au-cards',CMP_AUTHORCARDS,'Author Score','author');
      const atcat=document.getElementById('db-cmpd-au-tbl-cat');if(atcat)atcat.innerHTML=_cmpCats.map(c=>`<option>${c.name}</option>`).join('');
      window.renderMentionsTable('db-cmpd-au-table',0,metric,'All articles');
    } else if(isToppub){
      renderCmpMediaType();
      const tcat=document.getElementById('db-cmpd-tbl-cat');if(tcat)tcat.innerHTML=_cmpCats.map(c=>`<option>${c.name}</option>`).join('');
      window.renderMentionsTable('db-cmpd-table',0,metric,'All articles');
    } else {
      _cmpCats.forEach((cat,ci)=>{
        ['sec','prog'].forEach(k=>{const h=document.getElementById('db-cmpd-'+k+'-hd-'+ci);if(h){h.textContent=cat.name;h.style.color=cat.color;}});
        renderCmpBarList('db-cmpd-sec-'+ci,CMP_SECTIONS[ci]||[],cat.color,'Top Section');
        renderCmpBarList('db-cmpd-prog-'+ci,CMP_PROGRAMS[ci]||[],cat.color,'Top Program');
      });
      const cardHd=document.getElementById('db-cmpd-cards-hd');if(cardHd)cardHd.textContent='Top Publishers for '+_cmpCats[0].name;
      renderEntityCards('db-cmpd-cards',CMP_PUBCARDS,'Pub Score','pub');
    }
    _bindExploreScroll(wrap);
    initIcons();
  };
  // Top Publishers per Media Type: per-category columns (empty-state placeholder, matches the compare page)
  function renderCmpMediaType(){
    (_cmpCats||[]).forEach((cat,ci)=>{
      const hd=document.getElementById('db-cmpd-mt-hd-'+ci);if(hd){hd.textContent=cat.name;hd.style.color=cat.color;}
      const host=document.getElementById('db-cmpd-mt-'+ci);if(host)host.innerHTML='<div class="cmp-nodata">No Data Available</div>';
    });
  }
  window.renderCmpMediaType=renderCmpMediaType;
  // Top Author view: Top Publishers per Media Type (with data, per category)
  function renderCmpAuthorMT(){
    (_cmpCats||[]).forEach((cat,ci)=>{
      const hd=document.getElementById('db-cmpd-au-mt-hd-'+ci);if(hd){hd.textContent=cat.name;hd.style.color=cat.color;}
      renderCmpBarList('db-cmpd-au-mt-'+ci,CMP_PUBLISHERS[ci]||[],cat.color,'Top Publisher');
    });
  }
  window.renderCmpAuthorMT=renderCmpAuthorMT;

  // ── Author Story Value Distribution (tabbed: bubble plot + horizontal bar) ──
  const authorData=[
    {name:'Lariza Garcia',articles:1,sv:4.46,score:0.02,color:'#2563eb'},
    {name:'Daxim L. Lucas',articles:5,sv:7.20,score:3.40,color:'#e94f37'},
    {name:'Lawrence Agcaoili',articles:4,sv:6.10,score:2.80,color:'#7c3aed'},
    {name:'Elijah Tubayan',articles:3,sv:5.30,score:2.10,color:'#16a34a'},
    {name:'Bernie Cahiles-Magkilat',articles:6,sv:8.40,score:4.10,color:'#d97706'},
    {name:'Ashley Erika Jose',articles:2,sv:3.80,score:1.50,color:'#0891b2'},
    {name:'Maria Santos',articles:7,sv:9.10,score:5.20,color:'#db2777'},
    {name:'John Rey Saavedra',articles:8,sv:8.80,score:5.60,color:'#6b7280'}
  ];
  const authorAsc=[...authorData].sort((a,b)=>a.articles-b.articles);
  const authorDesc=[...authorData].sort((a,b)=>b.articles-a.articles);
  const authorMaxX=Math.max(...authorData.map(a=>a.articles))+1;
  const AuthorDot=(p)=>p.cx==null?null:RC('circle',{cx:p.cx,cy:p.cy,r:5+p.payload.sv*1.3,fill:p.payload.color,opacity:0.82});
  function AuthorTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    const d=o.payload[0].payload;
    const row=(l,v)=>RC('div',{key:l,style:{display:'flex',justifyContent:'space-between',gap:20,fontSize:12,margin:'2px 0'}},
      RC('span',{style:{color:'rgba(255,255,255,0.62)'}},l),RC('span',{style:{color:'#fff',fontWeight:600}},v));
    return tipBox(
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:6,fontSize:12.5}},d.name),
      row('Article Count',d.articles),row('Total Story Value',d.sv),row('Author Score',d.score));
  }
  function AuthorBubble(){
    const n=authorAsc.length;
    const [rng,setRng]=React.useState([0,n-1]);
    const shown=authorAsc.slice(rng[0],rng[1]+1);
    return RC('div',{style:{display:'flex',flexDirection:'column',height:'100%'}},
      RC('div',{style:{flex:1,minHeight:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ScatterChart,{margin:{top:16,right:20,bottom:24,left:8}},
            RC(CartesianGrid,{stroke:'#f0f1f3'}),
            RC(XAxis,{type:'number',dataKey:'articles',name:'Article Count',domain:[0,authorMaxX],tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Article Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
            RC(YAxis,{type:'number',dataKey:'sv',name:'Story Value',domain:[0,10],tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:40,label:{value:'Story Value',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
            RC(Tooltip,{content:AuthorTip,cursor:{strokeDasharray:'3 3',stroke:'rgba(0,0,0,0.12)'}}),
            RC(Scatter,{data:shown,shape:AuthorDot,cursor:'pointer',onClick:(d)=>{const n=d&&(d.name||(d.payload&&d.payload.name));if(n)openInsCard(getEntityArticles('author',n),n,'Author Story Value','db-author-card');}})
          ))),
      RC('div',{className:'db-pub-legend'},authorData.map(a=>RC('span',{key:a.name,className:'db-pub-leg-item'},RC('span',{className:'dot',style:{background:a.color}}),a.name))),
      RC('div',{style:{height:30,flexShrink:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ComposedChart,{data:authorAsc,margin:{top:2,right:20,bottom:2,left:8}},
            RC(XAxis,{dataKey:'articles',hide:true}),RC(YAxis,{hide:true}),
            RC(Area,{dataKey:'sv',stroke:'transparent',fill:'transparent',isAnimationActive:false}),
            RC(Brush,{dataKey:'name',height:24,stroke:'#b9a4f7',fill:'#f3eefc',travellerWidth:8,tickFormatter:()=>'',startIndex:rng[0],endIndex:rng[1],onChange:e=>{if(e&&e.startIndex!=null)setRng([e.startIndex,e.endIndex]);}})
          )))
    );
  }
  function AuthorBarTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    return tipBox(
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:5,fontSize:12.5}},o.label),
      tlRow('#b9a4f7','Article Count',o.payload[0].value));
  }
  dbMount('db-author-bubble',RC(AuthorBubble));
  dbMount('db-author-bar',RC(ResponsiveContainer,{width:'99%',height:'100%'},
    RC(BarChart,{data:authorDesc,layout:'vertical',margin:{top:16,right:24,bottom:24,left:8}},
      RC(CartesianGrid,{horizontal:false,stroke:'#f0f1f3'}),
      RC(XAxis,{type:'number',dataKey:'articles',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,label:{value:'Article Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
      RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:140}),
      RC(Tooltip,{content:AuthorBarTip,cursor:{fill:'rgba(24,29,38,0.04)'}}),
      RC(Bar,{dataKey:'articles',maxBarSize:26,radius:[0,4,4,0]},
        ...authorDesc.map((a,i)=>RC(Cell,{key:i,fill:a.color})),
        RC(LabelList,{dataKey:'articles',position:'right',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
      )
    )));
  window.setAuthorTab=function(t){
    const bub=document.getElementById('db-author-bubble'),bar=document.getElementById('db-author-bar');
    if(bub)bub.style.display=t==='bubble'?'':'none';
    if(bar)bar.style.display=t==='bar'?'':'none';
    document.querySelectorAll('#db-author-tabs .db-tab2').forEach(el=>el.classList.toggle('on',el.dataset.t===t));
  };

  // ── Influencer Story Value Distribution (Shared workspace): tabbed bubble + bar, per social influencer ──
  const influencerData=[
    {name:'jmccautosupply', posts:9, sv:3.2,  score:0.02, color:'#2563eb'},
    {name:'DITOphofficial', posts:1, sv:10.0, score:10.0, color:'#0f172a'},
    {name:'dylanburton02',  posts:3, sv:2.6,  score:0.80, color:'#7c3aed'},
    {name:'pldt',           posts:5, sv:14.6, score:6.20, color:'#e94f37'},
    {name:'bilyonaryo_ph',  posts:4, sv:3.0,  score:1.20, color:'#16a34a'},
    {name:'BilyonaryoPh',   posts:3, sv:18.2, score:8.40, color:'#0891b2'},
    {name:'ConvergeICT',    posts:2, sv:2.4,  score:0.60, color:'#d97706'},
    {name:'negosyantenews', posts:8, sv:14.5, score:5.80, color:'#6b7280'},
    {name:'SHAYLIBAND5',    posts:6, sv:7.3,  score:3.10, color:'#db2777'},
    {name:'contextdotph',   posts:2, sv:0.5,  score:0.10, color:'#64748b'},
    {name:'ANCalerts',      posts:1, sv:4.0,  score:1.00, color:'#f59e0b'}
  ];
  const inflAsc=[...influencerData].sort((a,b)=>a.posts-b.posts);
  const inflDesc=[...influencerData].sort((a,b)=>b.posts-a.posts);
  const inflMaxX=Math.max(...influencerData.map(a=>a.posts))+1;
  const InflDot=(p)=>p.cx==null?null:RC('circle',{cx:p.cx,cy:p.cy,r:6+p.payload.score*1.4,fill:p.payload.color,opacity:0.72});
  function InflTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    const d=o.payload[0].payload;
    const row=(l,v)=>RC('div',{key:l,style:{display:'flex',justifyContent:'space-between',gap:20,fontSize:12,margin:'2px 0'}},
      RC('span',{style:{color:'rgba(255,255,255,0.62)'}},l),RC('span',{style:{color:'#fff',fontWeight:600}},v));
    return tipBox(
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:6,fontSize:12.5}},d.name),
      row('Post Count',d.posts),row('Total Story Value',d.sv.toFixed(2)),row('Influencer Score',d.score.toFixed(2)));
  }
  function InfluencerBubble(){
    const n=inflAsc.length;
    const [rng,setRng]=React.useState([0,n-1]);
    const shown=inflAsc.slice(rng[0],rng[1]+1);
    return RC('div',{style:{display:'flex',flexDirection:'column',height:'100%'}},
      RC('div',{style:{flex:1,minHeight:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ScatterChart,{margin:{top:16,right:20,bottom:24,left:8}},
            RC(CartesianGrid,{stroke:'#f0f1f3'}),
            RC(XAxis,{type:'number',dataKey:'posts',name:'Post Count',domain:[0,inflMaxX],tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false,label:{value:'Post Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
            RC(YAxis,{type:'number',dataKey:'sv',name:'Story Value',domain:[0,20],tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:40,label:{value:'Story Value',angle:-90,position:'insideLeft',style:{fontSize:10.5,fill:'#9ca3af',textAnchor:'middle'}}}),
            RC(Tooltip,{content:InflTip,cursor:{strokeDasharray:'3 3',stroke:'rgba(0,0,0,0.12)'}}),
            RC(Scatter,{data:shown,shape:InflDot,cursor:'pointer',onClick:(d)=>{const n=d&&(d.name||(d.payload&&d.payload.name));openInsCard(window.WS_DATA.socialMentions,n||'Influencer Story Value','Influencer Story Value Distribution','db-influencer-card');}})
          ))),
      RC('div',{className:'db-pub-legend'},influencerData.map(a=>RC('span',{key:a.name,className:'db-pub-leg-item'},RC('span',{className:'dot',style:{background:a.color}}),a.name))),
      RC('div',{style:{height:30,flexShrink:0}},
        RC(ResponsiveContainer,{width:'99%',height:'100%'},
          RC(ComposedChart,{data:inflAsc,margin:{top:2,right:20,bottom:2,left:8}},
            RC(XAxis,{dataKey:'posts',hide:true}),RC(YAxis,{hide:true}),
            RC(Area,{dataKey:'sv',stroke:'transparent',fill:'transparent',isAnimationActive:false}),
            RC(Brush,{dataKey:'name',height:24,stroke:'#b9a4f7',fill:'#f3eefc',travellerWidth:8,tickFormatter:()=>'',startIndex:rng[0],endIndex:rng[1],onChange:e=>{if(e&&e.startIndex!=null)setRng([e.startIndex,e.endIndex]);}})
          )))
    );
  }
  function InflBarTip(o){
    if(!o||!o.active||!o.payload||!o.payload.length)return null;
    return tipBox(
      RC('div',{style:{fontWeight:600,color:'#fff',marginBottom:5,fontSize:12.5}},o.label),
      tlRow('#b9a4f7','Post Count',o.payload[0].value));
  }
  dbMount('db-influencer-bubble',RC(InfluencerBubble));
  dbMount('db-influencer-bar',RC(ResponsiveContainer,{width:'99%',height:'100%'},
    RC(BarChart,{data:inflDesc,layout:'vertical',margin:{top:16,right:24,bottom:24,left:8}},
      RC(CartesianGrid,{horizontal:false,stroke:'#f0f1f3'}),
      RC(XAxis,{type:'number',dataKey:'posts',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,label:{value:'Post Count',position:'insideBottom',offset:-12,fontSize:11,fill:'#6b7280'}}),
      RC(YAxis,{type:'category',dataKey:'name',tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:140}),
      RC(Tooltip,{content:InflBarTip,cursor:{fill:'rgba(24,29,38,0.04)'}}),
      RC(Bar,{dataKey:'posts',maxBarSize:26,radius:[0,4,4,0]},
        ...inflDesc.map((a,i)=>RC(Cell,{key:i,fill:a.color})),
        RC(LabelList,{dataKey:'posts',position:'right',style:{fontSize:11,fontWeight:600,fill:'#6b7280'}})
      )
    )));
  window.setInfluencerTab=function(t){
    const bub=document.getElementById('db-influencer-bubble'),bar=document.getElementById('db-influencer-bar');
    if(bub)bub.style.display=t==='bubble'?'':'none';
    if(bar)bar.style.display=t==='bar'?'':'none';
    document.querySelectorAll('#db-influencer-tabs .db-tab2').forEach(el=>el.classList.toggle('on',el.dataset.t===t));
  };

  // ── Entities Map (flexbox treemap, 2 columns; dark data-btip tooltips) ──
  const entityData=[
    {name:'ORG',value:48.18,color:'#8d7ba8',desc:'Organization Entities: An organized body of people with a particular purpose, especially a business, society, association, etc.'},
    {name:'PERSON',value:40.00,color:'#6b7fb0',desc:'Person Entities: Names of people, including fictional characters.'},
    {name:'GPE',value:9.09,color:'#6bb0bd',desc:'Geopolitical Entities: Countries, cities, or states.'},
    {name:'NORP',value:2.73,color:'#5fb088',desc:'Nationalities or religious / political groups.'}
  ];
  const entEl=document.getElementById('db-entities');
  if(entEl){
    const cell=e=>'<div class="db-entmap-cell" style="flex:'+e.value+';background:'+e.color+';cursor:pointer" onclick="entDrill(this.closest(\'.db-entmap\'),\''+e.name+'\',\''+e.color+'\')" data-btip="'+_makeTip({label:e.name+' ('+e.value.toFixed(2)+'%)',detail:e.desc})+'">'+e.name+' ('+e.value.toFixed(2)+'%)</div>';
    const leftSum=entityData[0].value+entityData[1].value,rightSum=entityData[2].value+entityData[3].value;
    entEl.innerHTML='<div class="db-entmap-col" style="flex:'+leftSum+'">'+cell(entityData[0])+cell(entityData[1])+'</div>'+
                    '<div class="db-entmap-col" style="flex:'+rightSum+'">'+cell(entityData[2])+cell(entityData[3])+'</div>';
  }
  const entLeg=document.getElementById('db-ent-legend');
  if(entLeg) entLeg.innerHTML=entityData.map(e=>'<span class="db-ent-leg-item"><span class="sq" style="background:'+e.color+'"></span>'+e.name+'</span>').join('');

  // ── Insights sources for the remaining dashboard charts — Timeline-level analysis (computed from each chart's data) ──
  const _iStat=(lbl,val,sub,cls)=>`<div class="ti-stat"><div class="ti-stat-lbl">${lbl}</div><div class="ti-stat-val ${cls||''}">${val}</div><div class="ti-stat-sub">${sub}</div></div>`;
  const _iStats=(...s)=>`<div class="ti-stats">${s.join('')}</div>`;
  const _iNarr=(html)=>`<div class="ti-narrative">${html}</div>`;
  const _iSec=(icon,t)=>`<div class="ti-sec-title"><i data-lucide="${icon}"></i> ${t}</div>`;
  const _iIns=(icon,html)=>`<div class="ti-insight"><i data-lucide="${icon}"></i><div>${html}</div></div>`;
  const _iCall=(icon,color,bg,lbl,sub,val,valCls)=>`<div class="ti-callout" style="cursor:default"><span class="ti-callout-ic" style="background:${bg};color:${color}"><i data-lucide="${icon}"></i></span><div class="ti-callout-main"><div class="ti-callout-lbl">${lbl}</div><div class="ti-callout-sub">${sub}</div></div><span class="ti-callout-val ${valCls||''}">${val}</span></div>`;
  const _iRank=(rows,barColor)=>`<div>${rows.map((r,i)=>`<div class="ti-rank" style="cursor:default"><span class="ti-rank-no">${i+1}</span><span class="ti-rank-name">${r.name}</span><span class="ti-rank-bar"><span class="ti-rank-bar-fill" style="width:${r.pct}%${r.color?';background:'+r.color:(barColor?';background:'+barColor:'')}"></span></span><span class="ti-rank-val">${r.val}</span></div>`).join('')}</div>`;
  const _iRow=(a,b)=>`<div class="ti-irow"><span class="ti-irow-a">${a}</span><span class="ti-irow-b">${b}</span></div>`;
  const _iList=(rows)=>`<div class="ti-ilist">${rows.map(([a,b])=>_iRow(a,b)).join('')}</div>`;
  const _iFoot=(txt)=>`<div class="ti-foot"><i data-lucide="sparkles"></i><span>${txt}</span></div>`;

  SRC.tonality={card:'db-tonality-card',sub:()=>'Sentiment breakdown',detailTitle:()=>'Tonality',clear:()=>{},detail:()=>SRC.tonality.overview(),overview:()=>{
    const tot=tonPie.reduce((s,d)=>s+d.value,0);
    const pos=(tonPie.find(d=>d.name==='Positive')||{}).value||0,neu=(tonPie.find(d=>d.name==='Neutral')||{}).value||0,neg=(tonPie.find(d=>d.name==='Negative')||{}).value||0;
    const dom=[...tonPie].sort((a,b)=>b.value-a.value)[0],net=Math.round((pos-neg)/tot*100),posPct=pos/tot*100,negPct=neg/tot*100;
    const ratio=neg?(pos/neg).toFixed(1):pos;
    const byPos=[...tonDates].sort((a,b)=>b.Positive-a.Positive),peak=byPos[0];
    const negDay=[...tonDates].filter(d=>d.Negative>0).sort((a,b)=>b.Negative-a.Negative)[0];
    const first=tonDates[0],lastD=tonDates[tonDates.length-1],improving=(lastD.Positive-lastD.Negative)>=(first.Positive-first.Negative);
    const netNegDays=tonDates.filter(d=>d.Negative>=d.Positive&&d.Negative>0).length;
    return _iNarr(`Sentiment skews <b>${dom.name.toLowerCase()}</b> — <b>${pos}</b> of ${tot} mentions (<b>${posPct.toFixed(0)}%</b>) are positive vs ${neg} negative, a net <b class="${net>=0?'ti-up':'ti-down'}">${net>=0?'+':''}${net}%</b>. Tone ${improving?'improved':'softened'} over the range, peaking on <b>${peak.date}</b>.`)
      +_iStats(
        _iStat('Total mentions',tot,'in range'),
        _iStat('Dominant',dom.name,posPct.toFixed(0)+'% of mentions'),
        _iStat('Net sentiment',(net>=0?'+':'')+net+'%',pos+' pos · '+neg+' neg',net>=0?'ti-up':'ti-down'),
        _iStat('Peak positive',peak.Positive,peak.date)
      )
      +_iSec('trending-up','Key trends')
      +_iIns('smile',`Positive leads at <b>${posPct.toFixed(0)}%</b> — about <b>${ratio}×</b> the negative share (${negPct.toFixed(0)}%).`)
      +_iIns('activity',`Tone is <b>${improving?'improving':'softening'}</b> — ${lastD.date} ran ${lastD.Positive}:${lastD.Negative} pos:neg vs ${first.Positive}:${first.Negative} early on.`)
      +_iIns('shield-check',`${netNegDays===0?'No day was net-negative':netNegDays+' day(s) ran net-negative'} across the range — narrative risk is ${netNegDays===0?'low':'worth watching'}.`)
      +_iSec('zap','Notable days')
      +_iCall('trending-up','#16a34a','rgba(22,163,74,0.12)','Most positive · '+peak.date,'Highest positive volume','+'+peak.Positive,'ti-up')
      +(negDay?_iCall('trending-down','#e94f37','rgba(233,79,55,0.12)','Negative driver · '+negDay.date,'Most negative mentions','−'+negDay.Negative,'ti-down'):'')
      +_iSec('award','Top days by positive volume')
      +_iRank(byPos.slice(0,4).map(d=>({name:d.date,val:d.Positive,pct:Math.round(d.Positive/(byPos[0].Positive||1)*100)})),'#16a34a')
      +_iSec('lightbulb','Takeaways')
      +_iIns('megaphone',`Amplify the <b>${peak.date}</b> positive coverage through owned channels while momentum holds.`)
      +(negDay?_iIns('search',`Investigate the <b>${negDay.date}</b> negative driver before it shapes the wider narrative.`):'')
      +_iFoot('AI-generated summary derived from the sentiment distribution and daily tonality.');
  }};
  SRC.frequency={card:'db-frequency-card',sub:()=>'Story-value distribution',detailTitle:()=>'Frequency',clear:()=>{},detail:()=>SRC.frequency.overview(),overview:()=>{
    const entries=Object.entries(freqCounts).map(([v,c])=>[+v,c]).sort((a,b)=>a[0]-b[0]),tot=entries.reduce((s,e)=>s+e[1],0);
    const mean=entries.reduce((s,e)=>s+e[0]*e[1],0)/tot,byCount=[...entries].sort((a,b)=>b[1]-a[1]),vals=entries.map(e=>e[0]);
    const loB=Math.min(...vals),hiB=Math.max(...vals),midEmpty=[];for(let v=loB+1;v<hiB;v++)if(!freqCounts[v])midEmpty.push(v);
    const bimodal=byCount.length>=2&&Math.abs(byCount[0][0]-byCount[1][0])>=3,maxC=byCount[0][1];
    const lo=entries.filter(e=>e[0]<=1).reduce((s,e)=>s+e[1],0),hi=entries.filter(e=>e[0]>=4).reduce((s,e)=>s+e[1],0);
    return _iNarr(`${tot} ${_wPosts()} span story values <b>${loB}–${hiB}</b>, ${bimodal?'clustering at <b>both ends</b>':'concentrated'} with a weighted mean of <b>${mean.toFixed(2)}</b>. ${lo} low-value (≤1) vs ${hi} high-value (≥4) ${_wPosts()}.`)
      +_iStats(
        _iStat('Total '+_wPosts(true),tot,'in distribution'),
        _iStat('Most common','SV '+byCount[0][0],byCount[0][1]+' '+_wPosts()),
        _iStat('Mean story value',mean.toFixed(2),'weighted'),
        _iStat('Spread','SV '+loB+'–'+hiB,entries.length+' active buckets')
      )
      +_iSec('trending-up','Key trends')
      +_iIns('bar-chart-2',`Distribution is <b>${bimodal?'bimodal':'concentrated'}</b> — peaks at SV ${byCount[0][0]} (${byCount[0][1]})${byCount[1]?' and SV '+byCount[1][0]+' ('+byCount[1][1]+')':''}.`)
      +_iIns('minus-circle',`Mid-range is empty${midEmpty.length?' — no '+_wPosts()+' at SV '+midEmpty.join(', '):''}, so there's little "moderate" coverage.`)
      +_iIns('gauge',`Mean SV of <b>${mean.toFixed(2)}</b> ${mean<2?'sits low':'is moderate'} — overall value is pulled up by the high-SV cluster.`)
      +_iSec('award','Story-value buckets')
      +_iRank(entries.map(e=>({name:'Story value '+e[0].toFixed(2),val:e[1],pct:Math.round(e[1]/maxC*100)})),'#b9a4f7')
      +_iSec('lightbulb','Takeaways')
      +_iIns('search',`Dig into the <b>SV ${hiB}</b> cluster — the high-value stories driving the most reach.`)
      +_iIns('layers',`The split suggests two content types; segment reporting to track low- vs high-value output separately.`)
      +_iFoot('AI-generated summary derived from the story-value histogram.');
  }};
  SRC.pubscore={card:'db-pubscore-card',sub:()=>pubScoreData.length+' publishers',detailTitle:()=>'Publisher score',clear:()=>{},detail:()=>SRC.pubscore.overview(),overview:()=>{
    const n=pubScoreData.length,byScore=[...pubScoreData].sort((a,b)=>b.score-a.score),byArts=[...pubScoreData].sort((a,b)=>b.articles-a.articles);
    const avg=pubScoreData.reduce((s,p)=>s+p.score,0)/n,arts=pubScoreData.reduce((s,p)=>s+p.articles,0),top=byScore[0],bottom=byScore[n-1];
    const half=Math.ceil(n/2),hiVol=byArts.slice(0,half),loVol=byArts.slice(half);
    const hiVolAvg=hiVol.reduce((s,p)=>s+p.score,0)/hiVol.length,loVolAvg=loVol.reduce((s,p)=>s+p.score,0)/loVol.length,corr=hiVolAvg>loVolAvg;
    const gap=(top.score-bottom.score).toFixed(2),emerging=[...pubScoreData].filter(p=>p.articles<=Math.ceil(n/3)).sort((a,b)=>b.score-a.score)[0];
    return _iNarr(`<b>${top.name}</b> leads with a score of <b>${top.score.toFixed(2)}</b> across ${top.articles} articles. Higher-volume publishers ${corr?'tend to score higher':'do not necessarily score higher'}, and scores span <b>${gap}</b> points top-to-bottom.`)
      +_iStats(
        _iStat('Publishers',n,'tracked'),
        _iStat('Top score',top.score.toFixed(2),top.name),
        _iStat('Avg score',avg.toFixed(2),'across publishers'),
        _iStat('Total '+_wPosts(true),arts,'combined')
      )
      +_iSec('trending-up','Key trends')
      +_iIns(corr?'arrow-up-right':'shuffle',`Volume ${corr?'correlates with':'is decoupled from'} score — top-half-by-volume average <b>${hiVolAvg.toFixed(2)}</b> vs ${loVolAvg.toFixed(2)} for the rest.`)
      +_iIns('bar-chart-2',`Scores range <b>${bottom.score.toFixed(2)}–${top.score.toFixed(2)}</b> — a ${gap}-point spread across ${n} publishers.`)
      +(emerging?_iIns('sparkles',`<b>${emerging.name}</b> punches above its volume — score ${emerging.score.toFixed(2)} on just ${emerging.articles} article${emerging.articles!==1?'s':''}.`):'')
      +_iSec('award','Top publishers by score')
      +_iRank(byScore.slice(0,5).map(p=>({name:p.name,val:p.score.toFixed(2),pct:Math.round(p.score/top.score*100),color:p.color})),'#7c3aed')
      +_iSec('lightbulb','Takeaways')
      +_iIns('target',`Prioritize <b>${top.name}</b> and other high-score, high-volume outlets for placement and outreach.`)
      +(emerging?_iIns('trending-up',`Nurture <b>${emerging.name}</b> — high quality, low volume, with room to grow reach.`):'')
      +_iFoot('AI-generated summary derived from publisher article counts and scores.');
  }};
  SRC.author={card:'db-author-card',sub:()=>authorData.length+' authors',detailTitle:()=>'Author story value',clear:()=>{},detail:()=>SRC.author.overview(),overview:()=>{
    const n=authorData.length,bySv=[...authorData].sort((a,b)=>b.sv-a.sv),byArts=[...authorData].sort((a,b)=>b.articles-a.articles);
    const avg=authorData.reduce((s,a)=>s+a.sv,0)/n,arts=authorData.reduce((s,a)=>s+a.articles,0),top=bySv[0],bottom=bySv[n-1],prolific=byArts[0];
    const efficient=[...authorData].sort((a,b)=>(b.sv/b.articles)-(a.sv/a.articles))[0],gap=(top.sv-bottom.sv).toFixed(2);
    return _iNarr(`<b>${top.name}</b> tops story value at <b>${top.sv.toFixed(2)}</b> (${top.articles} articles). Most prolific is <b>${prolific.name}</b> (${prolific.articles} articles); story value spans <b>${gap}</b> points across ${n} authors.`)
      +_iStats(
        _iStat('Authors',n,'tracked'),
        _iStat('Top story value',top.sv.toFixed(2),top.name),
        _iStat('Avg story value',avg.toFixed(2),'across authors'),
        _iStat('Total '+_wPosts(true),arts,'combined')
      )
      +_iSec('trending-up','Key trends')
      +_iIns('user-check',`<b>${top.name}</b>${bySv[1]?' and <b>'+bySv[1].name+'</b>':''} drive the highest-value coverage (SV ${top.sv.toFixed(2)}${bySv[1]?', '+bySv[1].sv.toFixed(2):''}).`)
      +_iIns('zap',`Most efficient is <b>${efficient.name}</b> — <b>${(efficient.sv/efficient.articles).toFixed(2)}</b> story value per article.`)
      +_iIns('bar-chart-2',`Story value ranges <b>${bottom.sv.toFixed(2)}–${top.sv.toFixed(2)}</b> across the author set.`)
      +_iSec('award','Top authors by story value')
      +_iRank(bySv.slice(0,5).map(a=>({name:a.name,val:a.sv.toFixed(2),pct:Math.round(a.sv/top.sv*100),color:a.color})),'#e94f37')
      +_iSec('lightbulb','Takeaways')
      +_iIns('handshake',`Build relationships with <b>${top.name}</b> and <b>${prolific.name}</b> — highest value and highest volume respectively.`)
      +_iIns('eye',`Track <b>${efficient.name}</b> — a high value-per-article rate signals influential, quotable coverage.`)
      +_iFoot('AI-generated summary derived from author article counts and story values.');
  }};
  SRC.toppub={card:'db-toppub-card',sub:()=>topPubData.length+' publishers',detailTitle:()=>'Top publishers',clear:()=>{},detail:()=>SRC.toppub.overview(),overview:()=>{
    const n=topPubData.length,byDate=[...topPubData].sort((a,b)=>b.x-a.x),arts=topPubData.reduce((s,p)=>s+(p.count||1),0);
    const latest=byDate[0],earliest=byDate[byDate.length-1],spanDays=Math.max(1,Math.round((latest.x-earliest.x)/86400000));
    const secMap={};topPubData.forEach(p=>{if(p.section)secMap[p.section]=(secMap[p.section]||0)+1;});
    const topSec=Object.entries(secMap).sort((a,b)=>b[1]-a[1])[0];
    const dayMap={};topPubData.forEach(p=>{dayMap[p.pub]=(dayMap[p.pub]||0)+1;});
    const busiest=Object.entries(dayMap).sort((a,b)=>b[1]-a[1])[0];
    return _iNarr(`<b>${n}</b> publishers ran ${arts} pieces over ${spanDays} days. Coverage ${busiest[1]>1?'clusters on <b>'+busiest[0]+'</b>':'is spread across the window'}${topSec?', led by the <b>'+topSec[0]+'</b> section':''}.`)
      +_iStats(
        _iStat('Publishers',n,'in range'),
        _iStat('Articles',arts,'published'),
        _iStat('Latest',latest.pub,latest.name),
        _iStat('Span',spanDays+'d',earliest.pub+' → '+latest.pub)
      )
      +_iSec('trending-up','Key trends')
      +_iIns('calendar',`Most coverage landed on <b>${busiest[0]}</b> (${busiest[1]} publisher${busiest[1]!==1?'s':''}) — a clear publishing cluster.`)
      +(topSec?_iIns('layout-grid',`<b>${topSec[0]}</b> is the leading section (${topSec[1]} of ${n}).`):'')
      +_iIns('clock',`Freshest coverage: <b>${latest.name}</b> on ${latest.pub}.`)
      +_iSec('award','Coverage by date (newest first)')
      +_iList(byDate.map(p=>[p.name,p.pub]))
      +_iSec('lightbulb','Takeaways')
      +_iIns('radio',`Watch <b>${busiest[0]}</b> for coverage surges — the busiest publishing day in the window.`)
      +_iIns('mail',`Engage <b>${latest.name}</b> while their coverage is still fresh.`)
      +_iFoot('AI-generated summary derived from publisher publish dates and sections.');
  }};
  SRC.entities={card:'db-entities-card',sub:()=>entityData.length+' entity types',detailTitle:()=>'Entities',clear:()=>{},detail:()=>SRC.entities.overview(),overview:()=>{
    const sorted=[...entityData].sort((a,b)=>b.value-a.value),dom=sorted[0];
    const org=(entityData.find(e=>e.name==='ORG')||{}).value||0,per=(entityData.find(e=>e.name==='PERSON')||{}).value||0;
    const gpe=(entityData.find(e=>e.name==='GPE')||{}).value||0,norp=(entityData.find(e=>e.name==='NORP')||{}).value||0;
    const combined=org+per,geoGroup=gpe+norp;
    return _iNarr(`Coverage is <b>${dom.name}-centric</b> — ${dom.name} leads at <b>${dom.value.toFixed(1)}%</b>, and organizations + people together make up <b>${combined.toFixed(0)}%</b> of all entities. Geographic and group entities are minimal (<b>${geoGroup.toFixed(1)}%</b>).`)
      +_iStats(
        _iStat('Entity types',entityData.length,'detected'),
        _iStat('Dominant',dom.name,dom.value.toFixed(1)+'%'),
        _iStat('Org + Person',combined.toFixed(0)+'%','combined share'),
        _iStat('Geo + Group',geoGroup.toFixed(1)+'%','GPE + NORP')
      )
      +_iSec('trending-up','Key observations')
      +_iIns('building-2',`Organizations dominate at <b>${org.toFixed(1)}%</b> — coverage centers on companies and institutions.`)
      +_iIns('user',`People account for <b>${per.toFixed(1)}%</b> — a strong person-driven angle alongside orgs.`)
      +_iIns('map-pin',`Geographic (GPE ${gpe.toFixed(1)}%) and group (NORP ${norp.toFixed(1)}%) entities are thin — little regional or demographic framing.`)
      +_iSec('award','Type breakdown')
      +_iRank(sorted.map(e=>({name:e.name,val:e.value.toFixed(2)+'%',pct:Math.round(e.value/dom.value*100),color:e.color})),null)
      +_iSec('lightbulb','Takeaways')
      +_iIns('target',`The org/person focus fits corporate-reputation tracking — keep monitoring ${dom.name} entities closely.`)
      +_iIns('globe',`Expand <b>geographic (GPE)</b> tracking if regional spread matters — it's currently just ${gpe.toFixed(1)}%.`)
      +_iFoot('AI-generated summary derived from the entity-type distribution.');
  }};
  // SharedView charts — social-framed insight sources (Top Media Sources, Influencer, Media Source Distribution)
  SRC.mediasources={card:'db-mediasources-card',sub:()=>TMS_SRC.length+' platforms',detailTitle:()=>'Top media sources',clear:()=>{},detail:()=>SRC.mediasources.overview(),overview:()=>{
    const n=TMS_SRC.length,total=TMS_SRC.reduce((s,p)=>s+p.count,0);
    const byCount=[...TMS_SRC].sort((a,b)=>b.count-a.count),top=byCount[0],second=byCount[1];
    const topPct=Math.round(top.count/total*100),top2Pct=Math.round(((top.count+(second?second.count:0))/total)*100);
    const mult=second&&second.count?(top.count/second.count).toFixed(1):null;
    const dayMap={};tmsData.forEach(p=>{const d=new Date(p.x);dayMap[(d.getMonth()+1)+'/'+d.getDate()]=(dayMap[(d.getMonth()+1)+'/'+d.getDate()]||0)+1;});
    const busiest=Object.entries(dayMap).sort((a,b)=>b[1]-a[1])[0];
    const infMap={};tmsData.forEach(p=>{if(p.infl)infMap[p.infl]=(infMap[p.infl]||0)+1;});
    const topInf=Object.entries(infMap).sort((a,b)=>b[1]-a[1]).slice(0,4);
    return _iNarr(`<b>${top.name}</b> dominates the platform mix — <b>${top.count}</b> of ${total} posts (<b>${topPct}%</b>). The top two platforms carry <b>${top2Pct}%</b> of all volume, so distribution is ${top2Pct>=80?'highly concentrated':'moderately spread'}.`)
      +_iStats(
        _iStat('Total posts',total,'across '+n+' platforms'),
        _iStat('Top platform',top.name,topPct+'% share'),
        _iStat('Top-2 share',top2Pct+'%',top.name+' + '+(second?second.name:'—')),
        _iStat('Busiest day',busiest?busiest[0]:'—',busiest?busiest[1]+' posts':'')
      )
      +_iSec('trending-up','Key trends')
      +_iIns('crown',`<b>${top.name}</b> leads with <b>${top.count}</b> posts${mult&&second?` — about <b>${mult}×</b> the next platform (${second.name}, ${second.count})`:''}.`)
      +_iIns('layers',`Platform concentration is <b>${top2Pct>=80?'high':'moderate'}</b> — the top two account for ${top2Pct}% while ${n-2} other${n-2!==1?'s':''} split the rest.`)
      +(busiest?_iIns('calendar',`Posting peaks on <b>${busiest[0]}</b> (${busiest[1]} posts) — the busiest day in the window.`):'')
      +_iSec('award','Platforms by post count')
      +_iRank(byCount.map(p=>({name:p.name,val:p.count,pct:Math.round(p.count/top.count*100),color:p.color})),null)
      +(topInf.length?_iSec('users','Top influencers by volume')+_iRank(topInf.map(([nm,c])=>({name:nm,val:c,pct:Math.round(c/topInf[0][1]*100)})),'#7c3aed'):'')
      +_iSec('lightbulb','Takeaways')
      +_iIns('target',`Focus monitoring and engagement on <b>${top.name}</b> — it carries the bulk of conversation volume.`)
      +_iIns('eye',`Watch the smaller platforms (${byCount.slice(-2).map(p=>p.name).join(', ')}) for emerging shifts before they scale.`)
      +_iFoot('AI-generated summary derived from platform post counts and posting activity.');
  }};
  SRC.influencer={card:'db-influencer-card',sub:()=>influencerData.length+' influencers',detailTitle:()=>'Influencer story value',clear:()=>{},detail:()=>SRC.influencer.overview(),overview:()=>{
    const n=influencerData.length,bySv=[...influencerData].sort((a,b)=>b.sv-a.sv),byPosts=[...influencerData].sort((a,b)=>b.posts-a.posts),byScore=[...influencerData].sort((a,b)=>b.score-a.score);
    const totPosts=influencerData.reduce((s,a)=>s+a.posts,0),avgSv=influencerData.reduce((s,a)=>s+a.sv,0)/n;
    const top=bySv[0],prolific=byPosts[0],topScore=byScore[0];
    const efficient=[...influencerData].sort((a,b)=>(b.sv/b.posts)-(a.sv/a.posts))[0];
    return _iNarr(`<b>${top.name}</b> drives the highest story value at <b>${top.sv.toFixed(2)}</b> from just ${top.posts} post${top.posts!==1?'s':''}. Most prolific is <b>${prolific.name}</b> (${prolific.posts} posts); influence spans <b>${n}</b> accounts.`)
      +_iStats(
        _iStat('Influencers',n,'tracked'),
        _iStat('Top story value',top.sv.toFixed(2),top.name),
        _iStat('Most posts',prolific.posts,prolific.name),
        _iStat('Top influencer score',topScore.score.toFixed(2),topScore.name)
      )
      +_iSec('trending-up','Key trends')
      +_iIns('star',`<b>${top.name}</b>${bySv[1]?' and <b>'+bySv[1].name+'</b>':''} generate the most story value (${top.sv.toFixed(2)}${bySv[1]?', '+bySv[1].sv.toFixed(2):''}).`)
      +_iIns('zap',`Most efficient is <b>${efficient.name}</b> — <b>${(efficient.sv/efficient.posts).toFixed(2)}</b> story value per post.`)
      +_iIns('bar-chart-2',`${totPosts} posts across ${n} influencers, averaging <b>${avgSv.toFixed(2)}</b> story value each.`)
      +_iSec('award','Top influencers by story value')
      +_iRank(bySv.slice(0,5).map(a=>({name:a.name,val:a.sv.toFixed(2),pct:Math.round(a.sv/top.sv*100),color:a.color})),'#7c3aed')
      +_iSec('lightbulb','Takeaways')
      +_iIns('handshake',`Prioritize <b>${top.name}</b> and <b>${prolific.name}</b> — highest value and highest volume respectively.`)
      +_iIns('eye',`Track <b>${efficient.name}</b> — a high value-per-post rate signals concentrated influence worth amplifying.`)
      +_iFoot('AI-generated summary derived from influencer post counts, story value, and influence scores.');
  }};
  SRC.mediasource={card:'db-mediasource-card',sub:()=>mediaSourceData.length+' platforms',detailTitle:()=>'Media source distribution',clear:()=>{},detail:()=>SRC.mediasource.overview(),overview:()=>{
    const n=mediaSourceData.length,total=mediaSourceData.reduce((s,p)=>s+p.postCount,0);
    const byPost=[...mediaSourceData].sort((a,b)=>b.postCount-a.postCount),bySv=[...mediaSourceData].sort((a,b)=>b.storyValue-a.storyValue);
    const domV=byPost[0],domVpct=Math.round(domV.postCount/total*100),topSv=bySv[0];
    const decoupled=domV.name!==topSv.name,avgSv=mediaSourceData.reduce((s,p)=>s+p.storyValue,0)/n;
    return _iNarr(`<b>${domV.name}</b> carries the most volume — <b>${domV.postCount}</b> of ${total} posts (<b>${domVpct}%</b>) — but <b>${topSv.name}</b> posts the highest story value (<b>${topSv.storyValue.toFixed(2)}</b>). Volume and value ${decoupled?'are <b>decoupled</b>':'align'}.`)
      +_iStats(
        _iStat('Total posts',total,'across '+n+' platforms'),
        _iStat('Top volume',domV.name,domVpct+'% of posts'),
        _iStat('Top story value',topSv.storyValue.toFixed(2),topSv.name),
        _iStat('Avg story value',avgSv.toFixed(2),'per platform')
      )
      +_iSec('trending-up','Key trends')
      +_iIns('bar-chart-2',`<b>${domV.name}</b> dominates volume at ${domVpct}% — the primary channel for reach.`)
      +_iIns(decoupled?'shuffle':'arrow-up-right',`Volume ${decoupled?'is decoupled from':'aligns with'} value — <b>${topSv.name}</b> (${topSv.storyValue.toFixed(2)} SV) ${decoupled?'punches above its post count':'leads on both'}.`)
      +_iIns('gauge',`Story value averages <b>${avgSv.toFixed(2)}</b> per platform — ${topSv.storyValue>avgSv*1.5?'skewed by '+topSv.name:'fairly even'}.`)
      +_iSec('award','Platforms by post count')
      +_iRank(byPost.map(p=>({name:p.name,val:p.postCount,pct:Math.round(p.postCount/domV.postCount*100),color:p.color})),null)
      +_iSec('lightbulb','Takeaways')
      +_iIns('target',`Use <b>${domV.name}</b> for reach and <b>${topSv.name}</b> for high-value, quotable posts.`)
      +_iIns('search',`Investigate why <b>${topSv.name}</b> over-indexes on story value despite lower volume.`)
      +_iFoot('AI-generated summary derived from per-platform post counts and story values.');
  }};
  window.openTonalityInsights=()=>tiOpenSource('tonality');
  window.openFrequencyInsights=()=>tiOpenSource('frequency');
  window.openPubScoreInsights=()=>tiOpenSource('pubscore');
  window.openAuthorInsights=()=>tiOpenSource('author');
  window.openTopPubInsights=()=>tiOpenSource('toppub');
  window.openEntitiesInsights=()=>tiOpenSource('entities');
  window.openMediaSourcesInsights=()=>tiOpenSource('mediasources');
  window.openInfluencerInsights=()=>tiOpenSource('influencer');
  window.openMediaSourceInsights=()=>tiOpenSource('mediasource');
}
(function(){function c(){document.querySelectorAll(".brief-stats .ss").forEach(function(card){var tr=card.querySelector(".ss-trend:not(.neu)");if(!tr)return;var neg=/[↓−-]/.test(tr.textContent);tr.classList.remove("pos","neg");tr.classList.add(neg?"neg":"pos");var v=card.querySelector(".ss-val");if(v){v.classList.remove("tcol-pos","tcol-neg");v.classList.add(neg?"tcol-neg":"tcol-pos");}});}if(document.readyState!=="loading")c();else document.addEventListener("DOMContentLoaded",c);})();

// ── PUBLISHERS PAGE ──
let pubSort='score',pubPage=0,pubSearch='';
const PUB_PER_PAGE=16;
function setPubSearch(v){pubSearch=v;pubPage=0;renderPublishers();}
const PUB_COLORS=[{bg:'#dbeafe',fg:'#2563eb'},{bg:'#ede9fe',fg:'#7c3aed'},{bg:'#cffafe',fg:'#0e7490'},{bg:'#fef3c7',fg:'#b45309'},{bg:'#fce7f3',fg:'#be185d'},{bg:'#ccfbf1',fg:'#0f766e'},{bg:'#e0e7ff',fg:'#4338ca'},{bg:'#ffe4e6',fg:'#be123c'}];
function pubColor(name){let h=0;for(let i=0;i<name.length;i++)h=(h*31+name.charCodeAt(i))>>>0;return PUB_COLORS[h%PUB_COLORS.length];}
function buildPublishers(){
  const map={};
  mentionData.forEach(d=>{
    const name=d.sub;if(!name)return;
    if(!map[name])map[name]={name,count:0,sv:0,ave:0};
    map[name].count++;map[name].sv+=(d.sv||0);map[name].ave+=parseAve(d.ave);
  });
  const list=Object.values(map).map(p=>({
    name:p.name,
    count:p.count,
    totalSV:+p.sv.toFixed(2),
    totalAve:p.ave,
    score:+((p.sv/p.count)*2).toFixed(2)   // synthesized Pub Score = avg Story Value ×2
  }));
  if(pubSort==='count')list.sort((a,b)=>b.count-a.count);
  else if(pubSort==='sv')list.sort((a,b)=>b.totalSV-a.totalSV);
  else if(pubSort==='az')list.sort((a,b)=>a.name.localeCompare(b.name));
  else list.sort((a,b)=>b.score-a.score);
  return list;
}
function setPubSort(v){pubSort=v;pubPage=0;renderPublishers();}
function gotoPubPage(n){
  const pages=Math.max(1,Math.ceil(buildPublishers().length/PUB_PER_PAGE));
  pubPage=Math.max(0,Math.min(n,pages-1));renderPublishers();
  const sc=document.querySelector('.app-body');if(sc)sc.scrollTop=0;
}
let pubSel=null;
const ENT_PER_PAGE=10;
let pubDetPage={},authorDetPage={};
// JSON-stringify a value for safe embedding inside a double-quoted HTML attribute (escapes inner `"` to `&quot;`)
function attrJson(v){return JSON.stringify(v).replace(/"/g,'&quot;');}
// Known publisher homepages — fall back to a Google search if unknown so the link always resolves.
const PUB_URLS={
  'ANC 24/7':'https://news.abs-cbn.com/anc','ABS-CBN News':'https://news.abs-cbn.com','CNN Philippines':'https://www.cnnphilippines.com',
  'Philippine Daily Inquirer':'https://www.inquirer.net','Inquirer Online':'https://www.inquirer.net','INQUIRER PLUS':'https://plus.inquirer.net',
  'Philstar Online':'https://www.philstar.com','BusinessWorld':'https://www.bworldonline.com','Manila Bulletin':'https://mb.com.ph',
  'BusinessMirror':'https://businessmirror.com.ph','Business Mirror':'https://businessmirror.com.ph','Business World Online':'https://www.bworldonline.com',
  'Daily Tribune':'https://tribune.net.ph','Manila Standard':'https://manilastandard.net','Rappler':'https://www.rappler.com',
  'SunStar Cebu':'https://www.sunstar.com.ph','GMA News Online':'https://www.gmanetwork.com/news','GMA News':'https://www.gmanetwork.com/news',
  'DZRH News':'https://dzrh.com.ph','Yahoo Philippines':'https://ph.news.yahoo.com','Tech in Asia':'https://www.techinasia.com',
  'Esquire Philippines':'https://www.esquiremag.ph','Manila Shaker Philippines':'https://www.manilashaker.com','Insider Ph':'https://insider.ph',
  'Bulgar':'https://bulgar.com.ph','The Manila Times':'https://www.manilatimes.net','Manila Times Online':'https://www.manilatimes.net',
};
function pubUrl(name){return PUB_URLS[name]||('https://www.google.com/search?q='+encodeURIComponent(name+' philippines'));}
let pubTab={},authorTab={};                   // 'articles' | 'perf' | 'ent', keyed by name
let entPerfRange={};                          // 3 | 7 | 15 | 30, keyed by `${kind}:${name}`
function selPub(name){if(pubSel!==name){pubDetPage[name]=0;pubTab[name]=pubTab[name]||'articles';}pubSel=name;selectEntityRow('pub',name);}
// Lightweight selection: move the highlight on existing rows + re-render only the detail panel (no list rebuild → no re-fade)
function selectEntityRow(kind,name){
  const scroll=document.getElementById(kind==='pub'?'pub-list-scroll':'author-list-scroll');
  if(scroll)scroll.querySelectorAll('.ent-row').forEach(r=>r.classList.toggle('selected',r.dataset.name===name));
  renderEntityDetail(kind,name,true);
}
function selEntityTab(kind,name,tab){
  const map=kind==='pub'?pubTab:authorTab;
  map[name]=tab;
  renderEntityDetail(kind,name);
}
function setEntPerfRange(kind,name,days){
  entPerfRange[kind+':'+name]=days;
  mountEntityChart(kind,name);
  // Update active pill state without full re-render
  document.querySelectorAll('.ent-perf-range .mm-tab').forEach(el=>{
    el.classList.toggle('act',+el.dataset.days===days);
  });
}
function goEntityPage(kind,name,n){
  const map=kind==='pub'?pubDetPage:authorDetPage;
  const total=getEntityArticles(kind,name).length;
  const pages=Math.max(1,Math.ceil(total/ENT_PER_PAGE));
  map[name]=Math.max(0,Math.min(n,pages-1));
  renderEntityDetail(kind,name);
}
// Generic-but-plausible synthetic articles, padded to a minimum of 24 per entity for demo richness
const ENT_TITLE_POOL=[
  'Telco roundup: Q3 trends across the Visayas',
  'Op-ed: what the 5G rollout really means for SMEs',
  'Analyst note: ARPU pressure mounts in the second half',
  'Subscriber growth slows as competition intensifies',
  'Regulator weighs new spectrum auction framework',
  'Fiber expansion reaches three more provincial capitals',
  'Carriers eye AI-driven network optimization',
  'Consumer groups call for clearer data-plan disclosures',
  'Industry brief: handset financing programs gain ground',
  'Cloud partnerships reshape enterprise telco offerings',
  'Cybersecurity spending climbs across major operators',
  'Quarterly earnings preview: what to watch from the top three',
  'Field report: rural connectivity initiatives show mixed results',
  'Sustainability push reframes tower-sharing economics',
  'M&A chatter resurfaces among regional ISPs',
  'Roaming reforms take effect across ASEAN corridors',
  'Wholesale rates ease as backhaul capacity expands',
  'Customer-experience scores tighten across the sector',
  'Smart-home bundles open new revenue lane',
  'Spectrum efficiency becomes the next competitive front',
  'Mobile money interoperability inches forward',
  'Postpaid churn data hints at loyalty fatigue',
  'IPO watch: tower-co spin-offs draw investor interest',
  'Pricing watch: data caps tighten across budget plans',
];
function _entHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
const ENT_AUTHOR_POOL=['Patricia Reyes','John Rey Saavedra','Ashley Erika O. Jose','Lawrence Agcaoili','Maria Santos','Ramon Castillo','Elijah Tubayan','Mon Jocson','Daxim L. Lucas','Rico Hizon'];
const ENT_OUTLET_POOL=[
  {sub:'BusinessWorld',section:'Business'},
  {sub:'Manila Bulletin',section:'News'},
  {sub:'Philstar Online',section:'News'},
  {sub:'Rappler',section:'Business'},
  {sub:'CNN Philippines',section:'News'},
  {sub:'ABS-CBN News',section:'News'},
  {sub:'Inquirer Online',section:'News'},
  {sub:'BusinessMirror',section:'Economy'},
  {sub:'Daily Tribune',section:'Business'},
  {sub:'Tech in Asia',section:'Tech'},
];
const ENT_TYPE_POOL=['online','online','online','tv','broadsheet','radio'];
const ENT_BRAND_POOL=['positive','positive','neutral','neutral','negative'];
function _synthArticles(seedName,realCount,need){
  const out=[];const h0=_entHash(seedName);
  const months=['Jun 12, 2026','Jun 09, 2026','Jun 05, 2026','May 30, 2026','May 27, 2026','May 24, 2026','May 21, 2026','May 18, 2026','May 15, 2026','May 12, 2026','May 08, 2026','May 04, 2026','Apr 30, 2026','Apr 26, 2026','Apr 22, 2026','Apr 18, 2026','Apr 14, 2026','Apr 10, 2026','Apr 06, 2026','Apr 02, 2026','Mar 29, 2026','Mar 25, 2026','Mar 20, 2026','Mar 15, 2026'];
  const agos=['4d ago','7d ago','11d ago','17d ago','3w ago','3w ago','4w ago','5w ago','5w ago','6w ago','7w ago','7w ago','8w ago','8w ago','9w ago','9w ago','10w ago','10w ago','11w ago','11w ago','12w ago','12w ago','13w ago','14w ago'];
  for(let i=0;i<need;i++){
    const h=(h0+i*2654435761)>>>0;
    const title=ENT_TITLE_POOL[h%ENT_TITLE_POOL.length];
    const sv=+(0.8+((h>>>3)%520)/100).toFixed(2);                 // 0.80–5.99
    const aveK=(40+((h>>>5)%760)/10).toFixed(1);                  // always 1 decimal — "40.0K" etc.
    const idx=Math.min(months.length-1,realCount+i);
    const outlet=ENT_OUTLET_POOL[(h>>>7)%ENT_OUTLET_POOL.length];
    const brand=ENT_BRAND_POOL[(h>>>13)%ENT_BRAND_POOL.length];
    // Fields the 3-column preview (renderInlineDetail) needs — real mentionData has these; synth must too.
    const chart=Array.from({length:9},(_,k)=>2+((h>>>(k+2))%16));
    out.push({
      sv,ave:'PHP '+aveK+'K',title,date:months[idx],ago:agos[idx],
      type:ENT_TYPE_POOL[(h>>>11)%ENT_TYPE_POOL.length],
      brand,
      tone:{positive:'positive',neutral:'mixed',negative:'negative'}[brand]||'mixed',
      author:ENT_AUTHOR_POOL[(h>>>17)%ENT_AUTHOR_POOL.length],
      authorScore:(sv*0.7).toFixed(2),avgSv:sv.toFixed(2),
      chart,
      keywords:[['dito',(h%3)+1],['telco',((h>>>2)%2)+1]],
      entities:((h>>>9)%2)?['DITO Telecommunity','Globe Telecom']:['DITO Telecommunity'],
      outlet:outlet.sub,sub:outlet.sub,section:outlet.section,
      _synth:true
    });
  }
  return out;
}
function getEntityArticles(kind,name){
  if(!name)return[];
  const real=mentionData.filter(d=>kind==='pub'?d.sub===name:d.author===name).map(d=>({...d}));
  const min=24;
  const list=real.length>=min?real:real.concat(_synthArticles((kind==='pub'?'p:':'a:')+name,real.length,min-real.length));
  // Enforce the entity's identity so synth-filled articles show the right publication/author (naturally-varied fields stay varied)
  list.forEach(d=>{if(kind==='pub'){d.sub=name;d.outlet=name;}else{d.author=name;}});
  return _sortEntArticles(list);
}
function _sortEntArticles(list){
  return list.slice().sort((a,b)=>{
    const da=new Date(a.date||'').getTime()||0,db=new Date(b.date||'').getTime()||0;
    return db-da;
  });
}
function renderPublishers(){
  const scroll=document.getElementById('pub-list-scroll');if(!scroll)return;
  const q=pubSearch.trim().toLowerCase();
  const all=buildPublishers().filter(p=>!q||p.name.toLowerCase().includes(q));
  const total=all.length,pages=Math.max(1,Math.ceil(total/PUB_PER_PAGE));
  pubPage=Math.max(0,Math.min(pubPage,pages-1));
  const start=pubPage*PUB_PER_PAGE,end=Math.min(start+PUB_PER_PAGE,total);
  const page=all.slice(start,end);
  if(pubSel===null||!all.find(p=>p.name===pubSel))pubSel=all[0]?all[0].name:null;
  scroll.innerHTML=page.map((p,i)=>{
    const c=pubColor(p.name),sel=p.name===pubSel?' selected':'';
    return`<div class="ent-row${sel}" data-name="${p.name.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" onclick="selPub(${attrJson(p.name)})">
      <span class="ent-row-avatar" style="background:${c.bg};color:${c.fg}">${p.name.charAt(0)}</span>
      <div class="ent-row-body">
        <div class="ent-row-name" title="${p.name}">${p.name}</div>
        <div class="ent-row-meta">${p.count} article${p.count!==1?'s':''}</div>
      </div>
      <span class="ent-row-val">${p.score.toFixed(2)}</span>
      <span class="ent-row-val ent-row-ave">${fmtAve(p.totalAve)}</span>
    </div>`;
  }).join('');
  const countEl=document.getElementById('pub-list-count');if(countEl)countEl.textContent=total;
  const info=total?`${start+1}–${end} of ${total}`:'0 of 0';
  const top=document.getElementById('pub-pg-info-top'),bot=document.getElementById('pub-pg-info');
  if(top)top.textContent=info;if(bot)bot.textContent=info;
  const btns=document.getElementById('pub-pg-btns');
  if(btns){
    if(total<=PUB_PER_PAGE){btns.innerHTML='';}
    else{
      let h=`<button class="pgb arrow" onclick="gotoPubPage(pubPage-1)"${pubPage<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
      for(let p=0;p<pages;p++)h+=`<button class="pgb${p===pubPage?' on':''}" onclick="gotoPubPage(${p})">${p+1}</button>`;
      h+=`<button class="pgb arrow" onclick="gotoPubPage(pubPage+1)"${pubPage>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
      btns.innerHTML=h;
    }
  }
  renderEntityDetail('pub',pubSel,true);
  initIcons();
}
// Detail renderer — used by both publishers and authors
function renderEntityDetail(kind,name,animate){
  const panelId=kind==='pub'?'pub-detail-panel':'author-detail-panel';
  const panel=document.getElementById(panelId);if(!panel)return;
  if(!name){panel.innerHTML=`<div class="ent-empty"><i data-lucide="${kind==='pub'?'building-2':'user'}" style="width:24px;height:24px;color:#ddd"></i><div>Select ${kind==='pub'?'a publisher':'an author'} to view its ${_wPosts()}</div></div>`;initIcons();return;}
  const articles=getEntityArticles(kind,name);
  const totalAve=articles.reduce((s,d)=>{const m=String(d.ave||'').match(/[\d.]+/);return s+(m?parseFloat(m[0]):0);},0);
  const avgSv=articles.length?(articles.reduce((s,d)=>s+(d.sv||0),0)/articles.length):0;
  const totalSV=articles.reduce((s,d)=>s+(d.sv||0),0);
  const score=(avgSv*2).toFixed(2);
  const colorFn=kind==='pub'?pubColor:authColor;
  const c=colorFn(name);
  const scoreLabel=kind==='pub'?'Pub score':'Author score';
  const aveNum=totalAve>=1000?(totalAve/1000).toFixed(1)+'K':totalAve.toFixed(0);
  const aveDisp=aveNum;
  const tabMap=kind==='pub'?pubTab:authorTab;
  const activeTab=tabMap[name]||'articles';
  const tabItems=[['articles','Articles'],['perf','Performance Charts'],['ent','Entities']].map(([id,lbl])=>
      `<div class="mm-tab${activeTab===id?' act':''}" onclick="selEntityTab('${kind}',${attrJson(name)},'${id}')">${lbl}</div>`
    ).join('');
  let paneHtml='';
  if(activeTab==='articles')      paneHtml=_paneArticles(kind,name,articles);
  else if(activeTab==='perf')     paneHtml=_panePerf(kind,name);
  else if(activeTab==='ent')      paneHtml=_paneEntities(kind,name);
  const titleHtml=kind==='pub'
    ? `<a class="ent-detail-title ent-detail-title-link" href="${pubUrl(name)}" target="_blank" rel="noopener noreferrer" title="Visit publisher website">${name}<i data-lucide="external-link" class="ent-title-ext"></i></a>`
    : `<div class="ent-detail-title">${name}</div>`;
  const _socOne=!!(window.WS_DATA&&window.WS_DATA.socialMentions&&kind==='author');
  const iStats=(_socOne&&window.WS_DATA.influencerStats&&window.WS_DATA.influencerStats[name])||{};
  const subsDisp=fmtCount(iStats.subscribers||0),engDisp=iStats.engagement!=null?iStats.engagement:0,svDisp=totalSV.toFixed(2);
  const statsHtml=_socOne
    ? `<div class="ent-stat" data-btip="${_makeTip({label:'Influencer Score: '+score})}"><div class="ent-stat-val">${score}</div><div class="ent-stat-lbl">Influencer Score</div></div>
        <div class="ent-stat" data-btip="${_makeTip({label:'Subscribers: '+subsDisp})}"><div class="ent-stat-val">${subsDisp}</div><div class="ent-stat-lbl">Subscribers</div></div>
        <div class="ent-stat" data-btip="${_makeTip({label:'Total Post: '+articles.length})}"><div class="ent-stat-val">${articles.length}</div><div class="ent-stat-lbl">Total Post</div></div>
        <div class="ent-stat" data-btip="${_makeTip({label:'Engagement Score: '+engDisp})}"><div class="ent-stat-val">${engDisp}</div><div class="ent-stat-lbl">Engagement Score</div></div>
        <div class="ent-stat" data-btip="${_makeTip({label:'Total Story Value: '+svDisp})}"><div class="ent-stat-val">${svDisp}</div><div class="ent-stat-lbl">Total Story Value</div></div>`
    : `<div class="ent-stat" data-btip="${_makeTip({label:scoreLabel+': '+score})}"><div class="ent-stat-val">${score}</div><div class="ent-stat-lbl">${scoreLabel}</div></div>
        <div class="ent-stat" data-btip="${_makeTip({label:'Articles: '+articles.length})}"><div class="ent-stat-val">${articles.length}</div><div class="ent-stat-lbl">Articles</div></div>
        <div class="ent-stat" data-btip="${_makeTip({label:'Total AVE: '+aveNum})}"><div class="ent-stat-val">${aveDisp}</div><div class="ent-stat-lbl">Total AVE</div></div>`;
  const headInner=`<span class="ent-detail-avatar" style="background:${c.bg};color:${c.fg}">${name.charAt(0)}</span>
      <div class="ent-detail-body-info">
        ${titleHtml}
        ${_socOne?renderOneSocialIcon(name):renderSocialIcons()}
      </div>
      <div class="ent-detail-stats${_socOne?' ent-detail-stats--5':''}">
        ${statsHtml}
      </div>`;
  const scrollInner=`<div class="ent-scroll-sentinel"></div><div class="ent-pane-anim${animate?' pane-in':''}">${paneHtml}</div>`;
  const head=panel.querySelector('.ent-detail-head');
  if(head){
    // Shell already built → update header/tabs in place and swap ONLY the data pane (animated), so the column doesn't reload
    head.classList.remove('scrolled');
    head.innerHTML=headInner;
    const tabsEl=panel.querySelector('.ent-tabs');if(tabsEl)tabsEl.innerHTML=tabItems;
    const scroller=panel.querySelector('.ent-detail-scroll');
    if(scroller){scroller.innerHTML=scrollInner;scroller.scrollTop=0;}
  }else{
    panel.innerHTML=`<div class="ent-detail-head">${headInner}</div>
    <div class="mm-tabs ent-tabs">${tabItems}</div>
    <div class="ent-detail-scroll">${scrollInner}</div>`;
  }
  initIcons();
  _wireEntityShrinkObserver(panel);
  if(activeTab==='perf') mountEntityChart(kind,name);
}
// Track per-panel observer so we can disconnect on re-render
const _entShrinkObs=new WeakMap();
function _wireEntityShrinkObserver(panel){
  const head=panel.querySelector('.ent-detail-head');
  const sentinel=panel.querySelector('.ent-scroll-sentinel');
  const scroller=panel.querySelector('.ent-detail-scroll');
  if(!head||!sentinel||!scroller||!('IntersectionObserver'in window))return;
  const prev=_entShrinkObs.get(panel);if(prev)prev.disconnect();
  const obs=new IntersectionObserver(entries=>{
    head.classList.toggle('scrolled',!entries[0].isIntersecting);
  },{root:scroller,threshold:0});
  obs.observe(sentinel);
  _entShrinkObs.set(panel,obs);
}

// Shared View influencers: re-skin a news article into the social table columns.
const _INFL_PLAT_LABEL={'fa-facebook-f':'Facebook','fa-x-twitter':'X (Twitter)','fa-instagram':'Instagram','fa-youtube':'YouTube','fa-reddit-alien':'Reddit','fa-tiktok':'TikTok'};
function _inflHash(s){let h=0;s=String(s||'');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h>>>0;}
function _inflPostReach(name,d){const seed=_inflHash(name+'|'+(d.title||''));return fmtCount(300+seed%280000);}   // stable per post
function _inflPostEng(name,d){const seed=_inflHash((d.title||'')+'|'+name);return 1+(seed>>4)%98;}
function _inflSrcCell(name){const [c,col]=_oneSocFor(name);const label=_INFL_PLAT_LABEL[c]||'Social';const ico=c==='fa-x-twitter'?X_SVG:`<i class="fa-brands ${c}" style="color:${col}"></i>`;return `<span class="soc-src" title="${label}">${ico}</span>`;}
// ── Pane: Articles (default) ──
function _paneArticles(kind,name,articles){
  const pageMap=kind==='pub'?pubDetPage:authorDetPage;
  const _social=!!(window.WS_DATA&&window.WS_DATA.socialMentions&&kind==='author');
  const rows=_social?window.WS_DATA.socialMentions:articles;   // Shared influencers → the real social posts feed
  const total=rows.length;
  const pages=Math.max(1,Math.ceil(total/ENT_PER_PAGE));
  let page=Math.max(0,Math.min(pageMap[name]||0,pages-1));
  pageMap[name]=page;
  const start=page*ENT_PER_PAGE,end=Math.min(start+ENT_PER_PAGE,total);
  const pageRows=rows.slice(start,end);
  const _cols=_social?9:8;
  const theadHtml=_social
    ? `<th style="width:46px"><span class="tcb"></span></th>
            <th style="width:140px"><span class="th-inner">Estimated Reach <i data-lucide="info" class="info-i"></i></span></th>
            <th style="width:110px">Eng Score</th>
            <th>Post</th>
            <th style="width:90px">Source</th>
            <th style="width:130px">Sentiment</th>
            <th style="width:180px">Influencer</th>
            <th style="width:170px">As of</th>
            <th style="width:40px"></th>`
    : `<th style="width:46px"><span class="tcb"></span></th>
            <th style="width:130px"><span class="th-inner">Story Value <i data-lucide="info" class="info-i"></i></span></th>
            <th style="width:130px">AVE</th>
            <th>Headline</th>
            <th style="width:220px"><span class="th-inner">Media Outlet <i data-lucide="filter" class="th-filter icon-sm"></i></span></th>
            <th style="width:130px">Sentiment</th>
            <th style="width:170px">Date Published</th>
            <th style="width:40px"></th>`;
  const rowsHtml=pageRows.length===0
    ? `<tr><td colspan="${_cols}" style="text-align:center;padding:24px;color:var(--muted);font-size:12.5px">No ${_social?'posts':'articles'} found</td></tr>`
    : pageRows.map((d,i)=>_social
      ? `<tr class="ent-art-row" onclick="openInflSocial(${start+i})">
              <td><span class="tcb"></span></td>
              <td><span class="sv-val">${d.reach}</span></td>
              <td><span class="eng-score">${d.engScore}</span></td>
              <td><div class="hl-cell"><span class="hl-text soc-post ent-hl-clamp" data-btip="${_makeTip({detail:d.post||''})}">${d.post||''}</span></div></td>
              <td><span class="soc-src" title="${(SOCIAL_PLATFORMS[d.platform]||{}).label||d.platform||'—'}">${socIcon(SOCIAL_PLATFORMS[d.platform]||{icon:'fa-globe',color:'#6b7280',label:d.platform||'—'})}</span></td>
              <td class="tbl-sent-cell">${sentimentCellHtml(d.sentiment)}</td>
              <td><span class="soc-influencer">${d.influencer||''}</span></td>
              <td><div class="date-main">${d.date||'—'}</div><div class="date-ago">${d.ago||''}</div></td>
              <td><span class="row-dots">⋯</span></td>
            </tr>`
      : `<tr class="ent-art-row" onclick="openEntArticle('${kind}',${attrJson(name)},${start+i})">
              <td><span class="tcb"></span></td>
              <td><span class="sv-val">${(d.sv||0).toFixed(2)}</span></td>
              <td><span class="ave-val">${d.ave||'—'}</span></td>
              <td><div class="hl-cell"><span class="hl-icon type-${articleType(d)}" data-btip="${_makeTip({label:typeLabel(d)})}"><i data-lucide="${typeIcon(d)}"></i></span><span class="hl-text ent-hl-clamp">${d.title}</span></div></td>
              <td><div class="pub-name">${kind==='pub'?name:(d.sub||'—')}</div><div class="pub-cat">${d.section||''}</div></td>
              <td class="tbl-sent-cell">${sentimentCellHtml(d.brand)}</td>
              <td><div class="date-main">${d.date||'—'}</div><div class="date-ago">${d.ago||''}</div></td>
              <td><span class="row-dots">⋯</span></td>
            </tr>`
    ).join('');
  let pagerHtml='';
  if(total>ENT_PER_PAGE){
    let btns=`<button class="pgb arrow" onclick="goEntityPage('${kind}',${attrJson(name)},${page-1})"${page<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
    for(let p=0;p<pages;p++)btns+=`<button class="pgb${p===page?' on':''}" onclick="goEntityPage('${kind}',${attrJson(name)},${p})">${p+1}</button>`;
    btns+=`<button class="pgb arrow" onclick="goEntityPage('${kind}',${attrJson(name)},${page+1})"${page>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
    pagerHtml=`<div class="tbl-footer ent-pager"><div class="pg-info">${start+1}–${end} of ${total} results</div><div class="pg-btns">${btns}</div></div>`;
  }
  return `<div class="tbl-header ent-tbl-header">
      <div class="tbl-header-left">
        <div class="tbl-select"><select>
          <option>Newest Articles</option>
          <option>Oldest Articles</option>
          <option>Highest Value</option>
          <option>Lowest Value</option>
        </select></div>
        <div class="tbl-select"><select>
          <option>Saved Articles</option>
          <option>All Articles</option>
          <option>Unsaved Articles</option>
        </select></div>
      </div>
      <div class="tbl-header-right">
        <button class="icon-action" title="View"><i data-lucide="eye"></i></button>
        <button class="icon-action" title="Save"><i data-lucide="bookmark"></i></button>
        <button class="icon-action" title="Analytics"><i data-lucide="pie-chart"></i></button>
        <button class="icon-action" title="Settings"><i data-lucide="settings"></i></button>
        <button class="btn-export">Export</button>
      </div>
    </div>
    <div class="tbl-card">
      <div class="tbl-scroll">
        <table class="tbl ent-tbl${_social?' ent-tbl-social':''}">
          <thead><tr>${theadHtml}</tr></thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
    ${pagerHtml}`;
}

// ── Article preview (tracker-style 3-column: article list · analytics · article body) ──
let entPrev=null,entSidebarWasCollapsed=false,entPrevPage=0;   // {kind,name,idx} + prior sidebar state + list page
const ENT_PREV_PER_PAGE=15;   // articles per page in the preview's left-column list
function openEntArticle(kind,name,idx){
  const arts=getEntityArticles(kind,name),d=arts[idx];
  const page=document.getElementById(kind==='pub'?'page-publishers':'page-authors');
  if(!d||!page||!document.getElementById('adp-col-mid'))return;
  entPrev={kind,name,idx};
  entPrevPage=Math.floor(idx/ENT_PREV_PER_PAGE);   // open the list on the page holding the clicked row
  mdSpotCtx=null;mdActCtx=null;mdActive=-1;   // no spotlight/activity context; toggles display-only
  const sb=document.querySelector('.sidebar');   // auto-collapse the nav for more preview room
  entSidebarWasCollapsed=sb&&sb.classList.contains('collapsed');
  if(sb)sb.classList.add('collapsed');
  page.classList.add('ent-detail-open');
  renderInlineDetail(d);
  _renderEntPrevList();
  initIcons();
}
function selectEntArticle(i){
  if(!entPrev)return;
  const d=getEntityArticles(entPrev.kind,entPrev.name)[i];if(!d)return;
  entPrev.idx=i;
  renderInlineDetail(d);
  _renderEntPrevList();
  initIcons();
}
function goEntPrevPage(p){entPrevPage=p;_renderEntPrevList();initIcons();}
// Left column: this entity's articles as a compact table (Headline · Sentiment · ⋯) with pagination — mirrors the tracker's coverage panel.
function _renderEntPrevList(){
  const left=document.getElementById('adp-col-left');if(!left||!entPrev)return;
  const {kind,name,idx}=entPrev,arts=getEntityArticles(kind,name);
  // Mini detail-header stats (same formulas as renderEntityDetail) — social icons + Score · Articles · Total AVE
  const totalAve=arts.reduce((s,d)=>{const m=String(d.ave||'').match(/[\d.]+/);return s+(m?parseFloat(m[0]):0);},0);
  const avgSv=arts.length?(arts.reduce((s,d)=>s+(d.sv||0),0)/arts.length):0;
  const score=(avgSv*2).toFixed(2),scoreLabel=kind==='pub'?'Pub score':'Author score';
  const aveNum=totalAve>=1000?(totalAve/1000).toFixed(1)+'K':totalAve.toFixed(0);
  const statsHtml=`<div class="ent-detail-stats">
      <div class="ent-stat"><div class="ent-stat-val">${score}</div><div class="ent-stat-lbl">${scoreLabel}</div></div>
      <div class="ent-stat"><div class="ent-stat-val">${arts.length}</div><div class="ent-stat-lbl">Articles</div></div>
      <div class="ent-stat"><div class="ent-stat-val">${aveNum}</div><div class="ent-stat-lbl">Total AVE</div></div>
    </div>`;
  // Reuse the shared ti-arttbl (select mode) for the article list; keep the rich entity header above it.
  const list=arts.map((d,i)=>Object.assign({},d,{_ei:i}));
  insSelArt=list[idx]||list[0]||null;
  left.innerHTML=`<div class="ent-prev-head">
      <div class="ent-prev-head-l"><div class="spot-panel-title" data-btip="${_makeTip({label:name})}">${name}</div>${renderSocialIcons()}</div>
      ${statsHtml}
    </div>
    ${renderArtTable(list,{mode:'select',onSelect:'openEntArticleRail'})}`;
}
// Light select from the entity preview rail: update middle/right + move the highlight (no rebuild)
window.openEntArticleRail=function(pos){
  const d=insArts[pos];if(!d||!entPrev)return;
  entPrev.idx=d._ei;insPrevIdx=pos;insSelArt=d;
  renderInlineDetail(getEntityArticles(entPrev.kind,entPrev.name)[d._ei]);
  const wrap=document.querySelector('#adp-col-left .ti-arttbl-wrap');
  if(wrap)wrap.querySelectorAll('.ti-arttbl-row').forEach(r=>r.classList.toggle('selected',+r.dataset.i===pos));
  initIcons();
};
function closeEntArticle(){
  document.querySelectorAll('.ent-detail-open').forEach(p=>p.classList.remove('ent-detail-open'));
  const sb=document.querySelector('.sidebar');   // restore the nav unless it was already collapsed
  if(sb&&!entSidebarWasCollapsed)sb.classList.remove('collapsed');
  entPrev=null;
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&entPrev)closeEntArticle();});
// ── Pane: Performance Charts ──
function _panePerf(kind,name){
  const days=entPerfRange[kind+':'+name]||7;
  const ranges=[[3,'3D'],[7,'7D'],[15,'15D'],[30,'1M']];
  return `<div class="ent-perf-wrap">
    <div class="ent-perf-range mm-tabs">
      ${ranges.map(([d,lbl])=>`<div class="mm-tab${d===days?' act':''}" data-days="${d}" onclick="setEntPerfRange('${kind}',${attrJson(name)},${d})">${lbl}</div>`).join('')}
    </div>
    <div class="ent-perf-chart" id="ent-perf-chart-${kind}"></div>
  </div>`;
}
function mountEntityChart(kind,name){
  if(!window.Recharts||!window.Recharts.ResponsiveContainer)return;
  const{ResponsiveContainer,ComposedChart,Area,Line,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,Cell}=window.Recharts;
  const days=entPerfRange[kind+':'+name]||7;
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  // Hash-seeded series so each entity has stable shape
  const h0=_entHash((kind==='pub'?'p:':'a:')+name);
  const end=new Date(2026,5,25);
  const data=[];
  for(let i=days-1;i>=0;i--){
    const d=new Date(end);d.setDate(end.getDate()-i);
    const h=(h0+i*2654435761)>>>0;
    const sv=+(((h%900)/100-3)).toFixed(2);              // -3 to 6
    const results=(h>>>5)%4;                              // 0–3 articles
    const band=[sv-2,sv+2];
    data.push({date:`${d.getDate()}. ${MONTHS[d.getMonth()]}`,storyValue:sv,projAvg:0,band,results});
  }
  const maxR=Math.max(...data.map(d=>d.results),3);
  dbMount('ent-perf-chart-'+kind,RC(ResponsiveContainer,{width:'100%',height:'100%'},
    RC(ComposedChart,{data,margin:{top:14,right:18,bottom:8,left:36}},
      RC(CartesianGrid,{vertical:false,stroke:'#f0f1f3'}),
      RC(XAxis,{dataKey:'date',scale:'point',padding:{left:30,right:30},tick:{fontSize:11,fill:'#6b7280'},axisLine:{stroke:'#e4e6ea'},tickLine:false}),
      RC(YAxis,{yAxisId:'v',orientation:'left',domain:[-6,8],tick:{fontSize:11,fill:'#6b7280'},axisLine:false,tickLine:false,width:30}),
      RC(YAxis,{yAxisId:'r',orientation:'right',domain:[0,Math.ceil(maxR*1.5)],hide:true}),
      RC(Tooltip,{contentStyle:{background:'#181d26',border:'none',borderRadius:6,padding:'8px 12px'},itemStyle:{color:'#fff',fontSize:12},labelStyle:{color:'#fff',fontSize:12}}),
      RC(Legend,{verticalAlign:'bottom',height:34,iconSize:10,wrapperStyle:{fontSize:11,color:'#6b7280',paddingTop:10}}),
      RC(Area,{yAxisId:'v',type:'monotone',dataKey:'band',name:'Bollinger Bands',stroke:'none',fill:'#b9a4f7',fillOpacity:0.22,legendType:'circle',dot:false,activeDot:false}),
      RC(Bar,{yAxisId:'r',dataKey:'results',name:'Total Results Bar',fill:'#16a34a',maxBarSize:36,radius:[3,3,0,0],legendType:'circle'},
        data.map((d,i)=>RC(Cell,{key:'c'+i,fill:'#16a34a'}))),
      RC(Line,{yAxisId:'v',type:'linear',dataKey:'projAvg',name:'Projected Average',stroke:'#9ca3af',strokeWidth:1.5,strokeDasharray:'4 3',dot:false,activeDot:false,legendType:'plainline'}),
      RC(Line,{yAxisId:'v',type:'linear',dataKey:'storyValue',name:'Total Story Value',stroke:'#b9a4f7',strokeWidth:1.75,dot:{r:3,fill:'#b9a4f7',stroke:'#fff',strokeWidth:1},activeDot:{r:5,fill:'#b9a4f7'},legendType:'plainline'})
    )));
}

// ── Pane: Entities (flexbox treemap, hash-seeded distribution) ──
// ── Chart card "•••" menu: Print / Download JPEG / Download PNG (delegated → works on every graph card, both dashboards) ──
(function(){
  let menuEl=null,menuBtn=null;
  function closeMenu(){if(menuEl){menuEl.remove();menuEl=null;menuBtn=null;}}
  function chartSvg(card){return card?card.querySelector('.db-chart-wrap svg')||card.querySelector('svg'):null;}
  function exportImage(card,type){
    const svg=chartSvg(card);if(!svg)return;
    const rect=svg.getBoundingClientRect(),clone=svg.cloneNode(true);
    clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',rect.width);clone.setAttribute('height',rect.height);
    const xml=new XMLSerializer().serializeToString(clone),img=new Image();
    img.onload=function(){
      const scale=2,canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(rect.width*scale));canvas.height=Math.max(1,Math.round(rect.height*scale));
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.setTransform(scale,0,0,scale,0,0);ctx.drawImage(img,0,0);
      const a=document.createElement('a');a.download='chart.'+(type==='jpeg'?'jpg':'png');a.href=canvas.toDataURL(type==='jpeg'?'image/jpeg':'image/png',0.95);
      document.body.appendChild(a);a.click();document.body.removeChild(a);
    };
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);
  }
  function printChart(card){
    const svg=chartSvg(card),w=window.open('','_blank','width=900,height=640');if(!w)return;
    let body='';
    if(svg){const rect=svg.getBoundingClientRect(),clone=svg.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',rect.width);clone.setAttribute('height',rect.height);body=new XMLSerializer().serializeToString(clone);}
    w.document.write('<!doctype html><title>Chart</title><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh">'+body+'</body>');
    w.document.close();w.focus();setTimeout(function(){w.print();},300);
  }
  function run(a,card){if(a==='print')printChart(card);else exportImage(card,a);}
  function openMenu(btn){
    if(menuBtn===btn){closeMenu();return;}
    closeMenu();
    const card=btn.closest('.cmp-donut-block,.cmp-sov-block,.cmp-ent-block,.db-card');
    const m=document.createElement('div');m.className='chart-menu';
    m.innerHTML='<div class="chart-menu-item" data-a="print">Print chart</div><div class="chart-menu-item" data-a="jpeg">Download JPEG image</div><div class="chart-menu-item" data-a="png">Download PNG image</div>';
    document.body.appendChild(m);
    const r=btn.getBoundingClientRect();
    m.style.top=(r.bottom+4)+'px';
    m.style.left=Math.max(8,Math.min(r.right-m.offsetWidth,window.innerWidth-m.offsetWidth-8))+'px';
    m.querySelectorAll('.chart-menu-item').forEach(function(it){it.addEventListener('click',function(ev){ev.stopPropagation();run(it.dataset.a,card);closeMenu();});});
    menuEl=m;menuBtn=btn;
  }
  document.addEventListener('click',function(e){
    const btn=e.target.closest&&e.target.closest('.db-tl-more');
    if(btn){openMenu(btn);return;}
    if(!(e.target.closest&&e.target.closest('.chart-menu')))closeMenu();
  });
  window.addEventListener('scroll',closeMenu,true);
  window.addEventListener('resize',closeMenu);
})();
// ── Entity Map drill-down: click a category cell → its member entities (shared by all entity maps) ──
const ENT_MEMBERS={
  ORG:[['GCash',102],['Globe',35],['BSP',29],['InstaPay',24],['Maya',24],['Globe Telecom',22],['RCBC',21],['BPI',20],['Mynt',19],['PESONet',19],['SEC',18],['BPI Globe Telecom',13],['PSE',13],['Starlink',11]],
  PERSON:[['Alex Eala',34],['Eala',33],['Eli Remolona Jr',9],['Carl Cruz',9],['Iga Swiatek',9],['Jasmine Paulino',6],['Samantha Vinluan',5]],
  GPE:[['Philippines',72],['Philippine',36],['Pilipinas',17],['the Middle East',15],['MANILA',15],['Metro Manila',14],['Southeast Asia',12],['US',12],['Cebu',9],['Japan',7],['Singapore',7]],
  NORP:[['Filipinos',71],['Filipino',51],['Filipina',19],['Pinoy',14],['Pilipino',14],['Polish',8]],
  PRODUCT:[['Android',9],['Starlink',11],['GCash App',12],['Maya App',8],['e-wallet',6]],
  LOC:[['Southeast Asia',12],['Metro Manila',9],['Visayas',6],['Mindanao',5]],
  LAW:[['BSP Circular No 1238',9],['Data Privacy Act',6],['SIM Registration Act',5],['R.A. 11934',3]]
};
function _entShade(hex,i,n){
  hex=String(hex||'#8d7ba8');const t=n>1?(i/(n-1))*0.4:0;
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  const mx=c=>Math.round(c+(255-c)*t);return 'rgb('+mx(r)+','+mx(g)+','+mx(b)+')';
}
function _entMemberCols(members,cellFn){
  const L=[],R=[];let ls=0,rs=0;
  members.forEach(m=>{if(ls<=rs){L.push(m);ls+=m.value;}else{R.push(m);rs+=m.value;}});
  return '<div class="db-entmap-col" style="flex:'+(ls||1)+'">'+L.map(cellFn).join('')+'</div>'+
         '<div class="db-entmap-col" style="flex:'+(rs||1)+'">'+R.map(cellFn).join('')+'</div>';
}
window.entDrill=function(hostEl,cat,color){
  if(!hostEl)return;
  const raw=ENT_MEMBERS[cat];
  if(!raw||!raw.length){if(window.openInsEntity)openInsEntity(cat);return;}   // no breakdown data → keep prior behavior
  if(hostEl.__entTop==null)hostEl.__entTop=hostEl.innerHTML;                  // stash category-level markup for "back"
  const total=raw.reduce((s,m)=>s+m[1],0)||1;
  const members=raw.map((m,i)=>({name:m[0],count:m[1],value:m[1],pct:(m[1]/total*100).toFixed(1),color:_entShade(color,i,raw.length)}));
  const cell=e=>'<div class="db-entmap-cell" style="flex:'+e.value+';background:'+e.color+';cursor:pointer" onclick="event.stopPropagation();openInsEntity(\''+e.name.replace(/'/g,"\\'")+'\')" data-btip="'+_makeTip({label:e.name,detail:'Article Count: '+e.count})+'">'+e.name+' ('+e.pct+'%)</div>';
  hostEl.classList.add('ent-drilled');
  hostEl.innerHTML='<div class="ent-drill-crumb"><span class="ent-drill-back" onclick="entHome(this.closest(\'.db-entmap\'))">Entities</span><span class="ent-drill-sep">/</span><span class="ent-drill-cur">'+cat+'</span></div>'+
    '<div class="db-entmap-inner">'+_entMemberCols(members,cell)+'</div>';
  if(window.initIcons)initIcons();
};
window.entHome=function(hostEl){
  if(!hostEl||hostEl.__entTop==null)return;
  hostEl.classList.remove('ent-drilled');
  hostEl.innerHTML=hostEl.__entTop;
  if(window.initIcons)initIcons();
};
function _paneEntities(kind,name){
  const h0=_entHash((kind==='pub'?'p:':'a:')+name);
  // Six fixed entity types, percentages hash-seeded but normalized to 100
  const TYPES=[
    {name:'ORG',color:'#8d7ba8',desc:'Organization Entities: An organized body of people with a particular purpose.'},
    {name:'GPE',color:'#6bb0bd',desc:'Geopolitical Entities: Countries, cities, or states.'},
    {name:'NORP',color:'#5fb088',desc:'Nationalities or religious / political groups.'},
    {name:'PERSON',color:'#6b7fb0',desc:'Names of people, including fictional characters.'},
    {name:'LAW',color:'#d9b864',desc:'Named documents made into laws.'},
    {name:'LOC',color:'#7cc28a',desc:'Non-GPE locations, mountain ranges, bodies of water.'},
  ];
  // Weighted: ORG dominates, PERSON second, others smaller — varied by seed
  const weights=[50+((h0>>>3)%30), 6+((h0>>>7)%10), 4+((h0>>>11)%8), 8+((h0>>>13)%14), 1+((h0>>>17)%4), 1+((h0>>>19)%4)];
  const sum=weights.reduce((a,b)=>a+b,0);
  const data=TYPES.map((t,i)=>({...t,value:+(weights[i]/sum*100).toFixed(2)}));
  data.sort((a,b)=>b.value-a.value);
  // Two-column layout: largest in left column, rest in right column
  const left=[data[0]];
  const right=data.slice(1);
  const cell=e=>`<div class="db-entmap-cell" style="flex:${e.value};background:${e.color};cursor:pointer" onclick="entDrill(this.closest('.db-entmap'),'${e.name}','${e.color}')" data-btip="${_makeTip({label:e.name+' ('+e.value.toFixed(2)+'%)',detail:e.desc})}">${e.name} (${e.value.toFixed(2)}%)</div>`;
  const leftSum=left.reduce((s,e)=>s+e.value,0);
  const rightSum=right.reduce((s,e)=>s+e.value,0);
  return `<div class="ent-entities-wrap">
    <div class="db-entmap">
      <div class="db-entmap-col" style="flex:${leftSum}">${left.map(cell).join('')}</div>
      <div class="db-entmap-col" style="flex:${rightSum}">${right.map(cell).join('')}</div>
    </div>
    <div class="db-ent-legend">${data.map(e=>`<span class="db-ent-leg-item"><span class="sq" style="background:${e.color}"></span>${e.name}</span>`).join('')}</div>
  </div>`;
}
// ── AUTHORS PAGE ──
let authSort='score',authPage=0,authSearch='';
const AUTH_PER_PAGE=16;
function setAuthorSearch(v){authSearch=v;authPage=0;renderAuthors();}
const AUTH_COLORS=[{bg:'#dbeafe',fg:'#2563eb'},{bg:'#ede9fe',fg:'#7c3aed'},{bg:'#cffafe',fg:'#0e7490'},{bg:'#fef3c7',fg:'#b45309'},{bg:'#fce7f3',fg:'#be185d'},{bg:'#ccfbf1',fg:'#0f766e'},{bg:'#e0e7ff',fg:'#4338ca'},{bg:'#ffe4e6',fg:'#be123c'}];
function authColor(name){let h=0;for(let i=0;i<name.length;i++)h=(h*31+name.charCodeAt(i))>>>0;return AUTH_COLORS[h%AUTH_COLORS.length];}
function buildAuthors(){
  const map={};
  mentionData.forEach(d=>{
    const name=d.author;if(!name)return;
    if(!map[name])map[name]={name,count:0,sv:0,ave:0};
    map[name].count++;map[name].sv+=(d.sv||0);map[name].ave+=parseAve(d.ave);
  });
  const list=Object.values(map).map(p=>({
    name:p.name,
    count:p.count,
    totalSV:+p.sv.toFixed(2),
    totalAve:p.ave,
    score:+((p.sv/p.count)*2).toFixed(2)   // synthesized Author Score = avg Story Value ×2
  }));
  if(authSort==='count')list.sort((a,b)=>b.count-a.count);
  else if(authSort==='sv')list.sort((a,b)=>b.totalSV-a.totalSV);
  else if(authSort==='az')list.sort((a,b)=>a.name.localeCompare(b.name));
  else list.sort((a,b)=>b.score-a.score);
  return list;
}
function setAuthorSort(v){authSort=v;authPage=0;renderAuthors();}
function gotoAuthorPage(n){
  const pages=Math.max(1,Math.ceil(buildAuthors().length/AUTH_PER_PAGE));
  authPage=Math.max(0,Math.min(n,pages-1));renderAuthors();
  const sc=document.querySelector('.app-body');if(sc)sc.scrollTop=0;
}
let authorSel=null;
function selAuthor(name){if(authorSel!==name){authorDetPage[name]=0;authorTab[name]=authorTab[name]||'articles';}authorSel=name;selectEntityRow('author',name);}
function renderAuthors(){
  const scroll=document.getElementById('author-list-scroll');if(!scroll)return;
  const q=authSearch.trim().toLowerCase();
  const all=buildAuthors().filter(p=>!q||p.name.toLowerCase().includes(q));
  const total=all.length,pages=Math.max(1,Math.ceil(total/AUTH_PER_PAGE));
  authPage=Math.max(0,Math.min(authPage,pages-1));
  const start=authPage*AUTH_PER_PAGE,end=Math.min(start+AUTH_PER_PAGE,total);
  const page=all.slice(start,end);
  if(authorSel===null||!all.find(p=>p.name===authorSel))authorSel=all[0]?all[0].name:null;
  const _shared=!!(window.WS_DATA&&window.WS_DATA.socialMentions);
  scroll.innerHTML=page.map((p,i)=>{
    const c=authColor(p.name),sel=p.name===authorSel?' selected':'';
    return`<div class="ent-row${sel}" data-name="${p.name.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" onclick="selAuthor(${attrJson(p.name)})">
      <span class="ent-row-avatar" style="background:${c.bg};color:${c.fg}">${p.name.charAt(0)}${_shared?oneSocialBadge(p.name):''}</span>
      <div class="ent-row-body">
        <div class="ent-row-name" title="${p.name}">${p.name}</div>
        <div class="ent-row-meta">${p.count} article${p.count!==1?'s':''}</div>
      </div>
      <span class="ent-row-val">${p.score.toFixed(2)}</span>
      <span class="ent-row-val ent-row-ave">${fmtAve(p.totalAve)}</span>
    </div>`;
  }).join('');
  const countEl=document.getElementById('author-list-count');if(countEl)countEl.textContent=total;
  const info=total?`${start+1}–${end} of ${total}`:'0 of 0';
  const bot=document.getElementById('author-pg-info');
  if(bot)bot.textContent=info;
  const btns=document.getElementById('author-pg-btns');
  if(btns){
    if(total<=AUTH_PER_PAGE){btns.innerHTML='';}
    else{
      let h=`<button class="pgb arrow" onclick="gotoAuthorPage(authPage-1)"${authPage<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
      for(let p=0;p<pages;p++)h+=`<button class="pgb${p===authPage?' on':''}" onclick="gotoAuthorPage(${p})">${p+1}</button>`;
      h+=`<button class="pgb arrow" onclick="gotoAuthorPage(authPage+1)"${authPage>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
      btns.innerHTML=h;
    }
  }
  renderEntityDetail('author',authorSel,true);
  initIcons();
}
// ── CATEGORIES PAGE ──
let catData=[
  {id:'cat-company',name:'Company',created:'May 07, 2026',buckets:[
    {id:'b-dito',name:'DITO Brand',created:'May 07, 2026',keywords:[
      {label:'DITO Telecommunity',expression:'"DITO Telecommunity"',type:'main'},
      {label:'DITO core network',expression:'("DITO" OR "DITO Telecommunity") AND ("5G" OR "network")',type:'main'},
      {label:'Subscribers',expression:'"DITO subscribers" OR "DITO users"',type:'additional'},
      {label:'5G services',expression:'"DITO 5G" OR "5G rollout"',type:'additional'},
      {label:'StreamZone',expression:'"DITO StreamZone" OR "StreamZone199"',type:'additional'},
      {label:'Telco context',expression:'"telco" OR "telecommunications" OR "mobile network"',type:'related'},
      {label:'Exclude name collisions',expression:'NOT ("Dito Carrillo" OR "DITO Network Korea")',type:'excluded'},
    ]},
    {id:'b-execs',name:'Executives',created:'May 07, 2026',keywords:[
      {label:'Eric Alberto',expression:'"Eric Alberto"',type:'main'},
      {label:'Jimenez',expression:'"Jimenez" AND ("DITO" OR "telco")',type:'main'},
      {label:'Executive titles',expression:'"CEO" OR "COO" OR "chief executive"',type:'additional'},
      {label:'Leadership signals',expression:'"leadership" OR "statement" OR "interview"',type:'related'},
      {label:'Exclude namesake',expression:'NOT "Alberto Romulo"',type:'excluded'},
    ]},
  ]},
  {id:'cat-competitor',name:'Competitor',created:'May 07, 2026',buckets:[
    {id:'b-pldt',name:'PLDT',created:'May 07, 2026',keywords:[
      {label:'PLDT brand',expression:'"PLDT" OR "Smart Communications"',type:'main'},
      {label:'PLDT leadership',expression:'"Manny Pangilinan" OR "MVP"',type:'additional'},
      {label:'PLDT products',expression:'"PLDT Home" OR "PLDT Hyppe"',type:'additional'},
      {label:'Telco competition',expression:'"fiber" OR "postpaid" OR "telco rival"',type:'related'},
      {label:'Exclude foundation',expression:'NOT "PLDT Foundation"',type:'excluded'},
    ]},
    {id:'b-globe',name:'Globe Telecom',created:'May 07, 2026',keywords:[
      {label:'Globe brand',expression:'"Globe Telecom" OR "Globe"',type:'main'},
      {label:'Globe sub-brands',expression:'"GlobeOne" OR "TM" OR "Globe at Home"',type:'additional'},
      {label:'Ownership context',expression:'"Ayala telco"',type:'related'},
      {label:'Service tiers',expression:'"prepaid" OR "postpaid"',type:'related'},
      {label:'Exclude name collisions',expression:'NOT ("Globe Asiatique" OR "globe trotter")',type:'excluded'},
    ]},
    {id:'b-converge',name:'Converge ICT',created:'May 07, 2026',keywords:[
      {label:'Converge brand',expression:'"Converge ICT" OR "Converge"',type:'main'},
      {label:'Leadership',expression:'"Dennis Uy"',type:'additional'},
      {label:'Products',expression:'"FiberX"',type:'additional'},
      {label:'Industry context',expression:'"fiber broadband" OR "ISP"',type:'related'},
      {label:'Exclude unrelated',expression:'NOT "converge magazine"',type:'excluded'},
    ]},
  ]},
  {id:'cat-industry',name:'Industry',created:'May 07, 2026',buckets:[
    {id:'b-5g',name:'5G & Networks',created:'May 07, 2026',keywords:[
      {label:'5G coverage',expression:'"5G" OR "5G rollout"',type:'main'},
      {label:'Network benchmarks',expression:'"Opensignal" OR "network speed"',type:'additional'},
      {label:'Spectrum',expression:'"NTC spectrum"',type:'additional'},
      {label:'Related infrastructure',expression:'"LTE" OR "fiber" OR "tower-sharing"',type:'related'},
      {label:'Exclude unrelated G5',expression:'NOT "G5 summit"',type:'excluded'},
    ]},
    {id:'b-regulator',name:'Regulators & Policy',created:'May 07, 2026',keywords:[
      {label:'NTC',expression:'"NTC" OR "National Telecommunications Commission"',type:'main'},
      {label:'DICT',expression:'"DICT"',type:'main'},
      {label:'Spectrum & franchise',expression:'"spectrum auction" OR "franchise"',type:'additional'},
      {label:'Regulatory context',expression:'"compliance" OR "regulation"',type:'related'},
    ]},
  ]},
];
catData=wsData('catData',catData);
let catSearch='',catPage=0,catPerPage=10;
let catView={mode:'list',catId:null,bktId:null};
let catBktSearch='',catBktSort='order';                   // 'order' | 'az' | 'za' | 'kw'
// Smooth list ⇄ buckets swap via the View Transitions API (crossfade + slide), with fallback
function catNav(){
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(document.startViewTransition&&!reduce)document.startViewTransition(renderCategories);
  else renderCategories();
}
function showCatDetail(catId){
  const c=catData.find(x=>x.id===catId);
  catView={mode:'category',catId,bktId:c&&c.buckets[0]?c.buckets[0].id:null};
  catBktSearch='';catBktSort='order';
  catNav();
}
function selectCatBucket(bktId){catView={...catView,bktId};renderCategories();}
function backToCategories(){catView={mode:'list',catId:null,bktId:null};catNav();}
function setCatBktSearch(v){catBktSearch=v;renderCategories();}
function setCatBktSort(v){catBktSort=v;renderCategories();}
function setCatSearch(v){catSearch=v;catPage=0;renderCategories();}
function setCatPerPage(v){catPerPage=+v;catPage=0;renderCategories();}
function gotoCatPage(n){
  const q=catSearch.trim().toLowerCase();
  const total=catData.filter(c=>!q||c.name.toLowerCase().includes(q)).length;
  const pages=Math.max(1,Math.ceil(total/catPerPage));
  catPage=Math.max(0,Math.min(n,pages-1));renderCategories();
  const sc=document.querySelector('.app-body');if(sc)sc.scrollTop=0;
}
function renderCategories(){
  const host=document.getElementById('cat-page-inner');if(!host)return;
  const page=document.getElementById('page-categories');
  // Toggle filter bar visibility (hide in detail views — category view renders its own topbar)
  const headerBar=document.querySelector('#page-categories .header-card');
  if(headerBar)headerBar.style.display=catView.mode==='list'?'':'none';
  // Category view uses a full-bleed split-pane layout — borrow .ent-page padding overrides
  if(page)page.classList.toggle('ent-page',catView.mode==='category');
  // .page-inner has a width cap; for split-pane we need full width
  host.style.maxWidth=catView.mode==='category'?'none':'';
  host.style.padding=catView.mode==='category'?'0':'';
  host.style.gap=catView.mode==='category'?'0':'';
  if(catView.mode==='list')host.innerHTML=_catListView();
  else if(catView.mode==='category')host.innerHTML=_catCategoryView();
  initIcons();
}
function _catListView(){
  const q=catSearch.trim().toLowerCase();
  const all=catData.filter(c=>!q||c.name.toLowerCase().includes(q));
  const total=all.length,pages=Math.max(1,Math.ceil(total/catPerPage));
  catPage=Math.max(0,Math.min(catPage,pages-1));
  const start=catPage*catPerPage,end=Math.min(start+catPerPage,total);
  const rows=all.slice(start,end).map(c=>`
    <tr class="cat-row" style="cursor:pointer" onclick="showCatDetail('${c.id}')">
      <td style="cursor:grab" onclick="event.stopPropagation()" title="Drag to reorder"><i data-lucide="grip-vertical" class="cat-grip"></i></td>
      <td class="cat-name">${c.name}</td>
      <td>${c.buckets.length}</td>
      <td>${c.created}</td>
    </tr>`).join('') || `<tr><td colspan="4" style="text-align:center;color:var(--muted);cursor:default">No categories found</td></tr>`;
  const info=total?`${start+1}-${end} of ${total} results`:'0 results';
  let pgBtns=`<button class="pgb arrow" onclick="gotoCatPage(catPage-1)"${catPage<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
  for(let p=0;p<pages;p++)pgBtns+=`<button class="pgb${p===catPage?' on':''}" onclick="gotoCatPage(${p})">${p+1}</button>`;
  pgBtns+=`<button class="pgb arrow" onclick="gotoCatPage(catPage+1)"${catPage>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
  return `<div class="tbl-card">
    <div class="tbl-header">
      <div class="tbl-header-left"><span class="cat-tbl-title">Categories</span><span class="cat-tbl-count">${total}</span></div>
    </div>
    <div class="tbl-scroll">
      <table class="tbl">
        <thead><tr>
          <th style="width:70px">Sort</th>
          <th>Categories Name</th>
          <th style="width:160px">No of Buckets</th>
          <th style="width:190px">Date Created</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="tbl-footer">
      <div class="pg-info">${info}</div>
      <div class="tbl-pg-controls">
        <div class="pg-btns">${pgBtns}</div>
        <div class="tbl-select"><select onchange="setCatPerPage(this.value)" aria-label="Rows per page">
          <option value="10">10 / page</option>
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
        </select></div>
      </div>
    </div>
  </div>`;
}
function _catCrumbs(parts){
  // parts = [{label, onclick}, {label, onclick}, ...] — last one is non-clickable current
  return `<nav class="cat-breadcrumb">${parts.map((p,i)=>{
    const last=i===parts.length-1;
    const sep=i>0?'<span class="cat-breadcrumb-sep">/</span>':'';
    return sep+(last
      ? `<span class="cat-breadcrumb-current">${p.label}</span>`
      : `<a class="cat-breadcrumb-link" onclick="${p.onclick}">${p.label}</a>`);
  }).join('')}</nav>`;
}
function _catBucketKwCount(b){return (b.keywords||[]).length;}
// Highlight boolean operators inside a keyword expression
function _catFmtExpression(expr){
  return String(expr).replace(/\b(AND|OR|NOT)\b/g,'<span class="cat-kw-op">$1</span>');
}
// Per-bucket page state for the keywords table (keyed by bucket id)
let catKwPage={};
const CAT_KW_PER_PAGE=10;
function goCatKwPage(n){
  if(!catView.bktId)return;
  catKwPage[catView.bktId]=n;
  renderCategories();
}
// Copy an expression to clipboard; visual confirmation via the existing toast
function copyKwExpr(idx){
  if(!catView.bktId)return;
  const cat=catData.find(c=>c.id===catView.catId);if(!cat)return;
  const bkt=cat.buckets.find(b=>b.id===catView.bktId);if(!bkt)return;
  const kw=(bkt.keywords||[])[idx];if(!kw)return;
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(kw.expression).then(()=>{
      if(typeof showTrackerToast==='function')showTrackerToast('Expression copied');
    });
  }
}
function _catCategoryView(){
  const cat=catData.find(c=>c.id===catView.catId);
  if(!cat)return _catListView();
  // Filter + sort buckets per state
  const q=(catBktSearch||'').trim().toLowerCase();
  let buckets=cat.buckets.filter(b=>!q||b.name.toLowerCase().includes(q));
  if(catBktSort==='az')buckets=[...buckets].sort((a,b)=>a.name.localeCompare(b.name));
  else if(catBktSort==='za')buckets=[...buckets].sort((a,b)=>b.name.localeCompare(a.name));
  else if(catBktSort==='kw')buckets=[...buckets].sort((a,b)=>_catBucketKwCount(b)-_catBucketKwCount(a));
  // Clamp selected bucket to whatever's visible
  if(!buckets.find(b=>b.id===catView.bktId))catView.bktId=buckets[0]?buckets[0].id:null;
  const rows=buckets.length?buckets.map(b=>{
    const sel=b.id===catView.bktId?' selected':'';
    return `<div class="ent-row${sel}" onclick="selectCatBucket('${b.id}')">
      <span class="ent-row-avatar" style="background:#ede9fe;color:#7c3aed"><i data-lucide="folder" style="width:14px;height:14px"></i></span>
      <div class="ent-row-body">
        <div class="ent-row-name">${b.name}</div>
        <div class="ent-row-meta">${_catBucketKwCount(b)} keyword${_catBucketKwCount(b)!==1?'s':''} · ${b.created||''}</div>
      </div>
    </div>`;
  }).join(''):`<div style="padding:24px;color:var(--muted);font-size:12.5px;text-align:center">No buckets match your search.</div>`;
  // Right pane: definition-list of keywords (label on top, expression below, copy on hover)
  const bkt=buckets.find(b=>b.id===catView.bktId);
  let rightHtml;
  if(!bkt){
    rightHtml=`<div class="ent-empty"><i data-lucide="folder-open" style="width:24px;height:24px;color:#ddd"></i><div>${cat.buckets.length===0?'No buckets in this category':'Select a bucket to view its keywords'}</div></div>`;
  }else{
    const all=bkt.keywords||[];
    const total=all.length;
    const pages=Math.max(1,Math.ceil(total/CAT_KW_PER_PAGE));
    let page=Math.max(0,Math.min(catKwPage[bkt.id]||0,pages-1));
    catKwPage[bkt.id]=page;
    const start=page*CAT_KW_PER_PAGE,end=Math.min(start+CAT_KW_PER_PAGE,total);
    const pageKws=all.slice(start,end);
    const TYPE_LBL={main:'Main',additional:'Additional',related:'Related',excluded:'Excluded'};
    const entries=total===0
      ? `<div class="cat-kw-empty"><i data-lucide="inbox" style="width:22px;height:22px;color:#ddd"></i><div>No keywords in this bucket yet</div></div>`
      : pageKws.map((kw,i)=>{
          const absIdx=start+i;
          const t=kw.type||'main';
          return `<div class="cat-kw-entry">
            <div class="cat-kw-entry-hd">
              <span class="cat-kw-label">${kw.label}</span>
              <button class="cat-kw-copy" onclick="copyKwExpr(${absIdx})" title="Copy expression"><i data-lucide="copy"></i></button>
            </div>
            <div class="cat-kw-expr">${_catFmtExpression(kw.expression||'')}</div>
          </div>`;
        }).join('');
    let pagerHtml='';
    if(total>CAT_KW_PER_PAGE){
      let btns=`<button class="pgb arrow" onclick="goCatKwPage(${page-1})"${page<=0?' disabled':''}><i data-lucide="chevron-left"></i></button>`;
      for(let p=0;p<pages;p++)btns+=`<button class="pgb${p===page?' on':''}" onclick="goCatKwPage(${p})">${p+1}</button>`;
      btns+=`<button class="pgb arrow" onclick="goCatKwPage(${page+1})"${page>=pages-1?' disabled':''}><i data-lucide="chevron-right"></i></button>`;
      pagerHtml=`<div class="tbl-footer ent-pager cat-kw-pager"><div class="pg-info">${start+1}–${end} of ${total} keywords</div><div class="pg-btns">${btns}</div></div>`;
    }
    rightHtml=`<div class="ent-detail-head cat-bkt-head">
      <div class="ent-detail-body-info">
        <div class="ent-detail-title">${bkt.name}</div>
      </div>
      <div class="ent-detail-stats">
        <div class="ent-stat cat-bkt-stat"><div class="ent-stat-val">${total}</div><div class="ent-stat-lbl">Keywords</div></div>
      </div>
    </div>
    <div class="ent-detail-scroll cat-bkt-scroll">
      <div class="cat-kw-list">${entries}</div>
      ${pagerHtml}
    </div>`;
  }
  // Custom topbar (replaces the hidden filter bar): breadcrumb only on the left + sort/search on the right
  return `<div class="header-card cat-cat-topbar">
    ${_catCrumbs([{label:'Categories',onclick:'backToCategories()'},{label:cat.name}])}
    <div class="cat-topbar-right">
      <div class="tbl-select"><select onchange="setCatBktSort(this.value)" aria-label="Sort buckets">
        <option value="order"${catBktSort==='order'?' selected':''}>Default order</option>
        <option value="az"${catBktSort==='az'?' selected':''}>Name (A–Z)</option>
        <option value="za"${catBktSort==='za'?' selected':''}>Name (Z–A)</option>
        <option value="kw"${catBktSort==='kw'?' selected':''}>Most keywords</option>
      </select></div>
      <div class="fc-search">
        <i data-lucide="search" class="fc-search-icon"></i>
        <input type="text" placeholder="Search buckets…" oninput="setCatBktSearch(this.value)" value="${catBktSearch||''}">
      </div>
    </div>
  </div>
  <div class="ent-body">
    <div class="ent-list-panel">
      <div class="ent-list-header">
        <span class="ent-list-header-label">Buckets <span class="at-list-count" style="margin-left:4px">${buckets.length}</span></span>
      </div>
      <div class="ent-list-scroll">${rows}</div>
    </div>
    <div class="ent-detail-panel">${rightHtml}</div>
  </div>`;
}
// ── ALL FILTERS MODAL ──
const AF={
  categories:[
    {id:'c1',name:'Competitor News'},
    {id:'c2',name:'DLSU'},
    {id:'c3',name:'Gena Testing For Additional Category'},
    {id:'c4',name:'Risk Management'},
    {id:'c5',name:'Test 1'},
    {id:'c6',name:'Test 2'},
    {id:'c7',name:'Yamaha'},
  ],
  buckets:{
    c1:[
      {id:'b1',name:'Isuzu',     keywords:{main:['Isuzu','Isuzu Philippines'],           additional:['Isuzu D-Max','Isuzu mu-X'],           related:['pickup truck','commercial vehicle'],        excluded:['Isuzu Foods','Isuzu Japan stock']}},
      {id:'b2',name:'Kawasaki',  keywords:{main:['Kawasaki','Kawasaki Motors'],           additional:['Kawasaki Ninja','Kawasaki Philippines'],related:['motorcycle','motorbike'],                  excluded:['Kawasaki disease','Kawasaki City']}},
      {id:'b3',name:'Taguig City',keywords:{main:['Taguig City','Taguig'],               additional:['BGC','Bonifacio Global City'],            related:['Metro Manila','NCR'],                      excluded:['Taguig barangay','Taguig court']}},
      {id:'b4',name:'Test only', keywords:{main:['Test'],                                additional:[],related:[],excluded:[]}},
    ],
    c2:[{id:'b5',name:'DLSU Bucket',   keywords:{main:['DLSU','De La Salle University'], additional:['DLSU Manila','Green Archers'],            related:['Lasallian','university'],                  excluded:['DLSU Dasmariñas','DLSU stock']}}],
    c3:[{id:'b6',name:'Gena Bucket',   keywords:{main:['Gena'],additional:[],related:[],excluded:[]}}],
    c4:[{id:'b7',name:'Risk Bucket',   keywords:{main:['Risk Management','enterprise risk'],additional:['risk assessment','risk mitigation'],  related:['compliance','governance'],                  excluded:['risk game','at-risk youth']}}],
    c5:[{id:'b8',name:'Test 1 Bucket', keywords:{main:['Test 1'],additional:[],related:[],excluded:[]}}],
    c6:[{id:'b9',name:'Test 2 Bucket', keywords:{main:['Test 2'],additional:[],related:[],excluded:[]}}],
    c7:[{id:'b10',name:'Yamaha Bucket',keywords:{main:['Yamaha','Yamaha Philippines'],    additional:['Yamaha Mio','Yamaha NMAX'],               related:['scooter','motorcycle brand'],              excluded:['Yamaha music','Yamaha piano']}}],
  },
  selCat:null,   // selected category id
  selBkt:null,   // selected bucket id
  pendCat:null,  // pending (not yet applied) category
  pendBkt:null,  // pending bucket
  catSort:'az',
  bktSort:'az',
  catPage:0,
  catPageSize:8,
};

function openAllFilters(){
  AF.pendCat=AF.selCat;
  AF.pendBkt=AF.selBkt;
  const ov=document.getElementById('af-overlay');
  ov.style.display='flex';
  requestAnimationFrame(()=>ov.classList.add('open'));
  afRenderCats();
  afRenderBkts(!!AF.pendCat);
  afRenderKw(!!AF.pendBkt);
  afRenderChips();
  initIcons();
}

function closeAllFilters(){
  const ov=document.getElementById('af-overlay');
  ov.style.display='flex';
  ov.classList.remove('open');
  ov.classList.add('closing');
  setTimeout(()=>{ ov.classList.remove('closing'); ov.style.display='none'; },260);
}

function afSorted(arr,sort){
  return [...arr].sort((a,b)=>sort==='az'?a.name.localeCompare(b.name):b.name.localeCompare(a.name));
}

function afRenderCats(){
  const sorted=afSorted(AF.categories,AF.catSort);
  const total=sorted.length;
  const pages=Math.max(1,Math.ceil(total/AF.catPageSize));
  AF.catPage=Math.min(AF.catPage,pages-1);
  const slice=sorted.slice(AF.catPage*AF.catPageSize,(AF.catPage+1)*AF.catPageSize);
  const list=document.getElementById('af-cat-list');
  list.innerHTML=slice.map(c=>`
    <div class="af-item${AF.pendCat===c.id?' selected':''}" onclick="afSelectCat('${c.id}')">
      <i data-lucide="folder" class="af-item-icon"></i>
      <span class="af-item-name">${c.name}</span>
    </div>`).join('');
  const info=document.getElementById('af-cat-page');
  if(info) info.textContent=`${AF.catPage+1} / ${pages}`;
  document.getElementById('af-cat-sort-lbl').textContent=AF.catSort==='az'?'Name (A–Z)':'Name (Z–A)';
  initIcons();
}

function afRenderBkts(animate){
  const catId=AF.pendCat;
  const list=document.getElementById('af-bkt-list');
  if(!catId){ list.innerHTML='<div style="padding:16px 14px;font-size:12px;color:var(--muted)">Select a category first</div>'; return; }
  const bkts=AF.buckets[catId]||[];
  const sorted=afSorted(bkts,AF.bktSort);
  list.classList.remove('af-list--entering');
  list.innerHTML=sorted.map(b=>`
    <div class="af-item${AF.pendBkt===b.id?' selected':''}" data-bkt-id="${b.id}" onclick="afSelectBkt('${b.id}')">
      <i data-lucide="file-text" class="af-item-icon"></i>
      <span class="af-item-name">${b.name}</span>
    </div>`).join('') || '<div style="padding:16px 14px;font-size:12px;color:var(--muted)">No buckets in this category</div>';
  if(animate){ void list.offsetWidth; list.classList.add('af-list--entering'); }
  document.getElementById('af-bkt-sort-lbl').textContent=AF.bktSort==='az'?'Name (A–Z)':'Name (Z–A)';
  initIcons();
}

function afRenderKw(animate){
  const kw=document.getElementById('af-kw-body');
  kw.classList.remove('kw-animate');
  if(!AF.pendBkt){ kw.innerHTML='<div class="af-kw-empty">Select a bucket to view keywords</div>'; return; }
  if(animate){ void kw.offsetWidth; kw.classList.add('kw-animate'); }
  const allBkts=Object.values(AF.buckets).flat();
  const bkt=allBkts.find(b=>b.id===AF.pendBkt);
  if(!bkt){ kw.innerHTML='<div class="af-kw-empty">No keywords found</div>'; return; }
  const kwData=bkt.keywords;
  const groups=[
    {label:'Main Keywords',      key:'main',       pill:'af-kw-pill--main'},
    {label:'Additional Keywords',key:'additional', pill:'af-kw-pill--additional'},
    {label:'Related Keywords',   key:'related',    pill:'af-kw-pill--related'},
    {label:'Excluded Keywords',  key:'excluded',   pill:'af-kw-pill--excluded'},
  ];
  kw.innerHTML=`
    <div class="af-kw-bucket-hd" onclick="afToggleKw()">
      <div class="af-kw-bucket-name"><i data-lucide="file-text" class="af-item-icon"></i>${bkt.name}</div>
      <i data-lucide="chevron-down" class="af-kw-chev" id="af-kw-chev"></i>
    </div>
    <div id="af-kw-groups">
      ${groups.map(g=>`
        <div class="af-kw-group">
          <div class="af-kw-group-label">${g.label}</div>
          <div class="af-kw-pills">
            ${kwData[g.key]&&kwData[g.key].length
              ? kwData[g.key].map(k=>`<span class="af-kw-pill ${g.pill}">${k}</span>`).join('')
              : `<span class="af-kw-none">No ${g.label.toLowerCase()} added</span>`}
          </div>
        </div>`).join('')}
    </div>`;
  initIcons();
}

function afRenderChips(){
  const area=document.getElementById('af-active-chips');
  const clearBtn=document.getElementById('af-clear-btn');
  const chips=[];
  if(AF.pendCat){
    const cat=AF.categories.find(c=>c.id===AF.pendCat);
    if(cat) chips.push({label:cat.name,type:'cat'});
  }
  if(AF.pendBkt){
    const allBkts=Object.values(AF.buckets).flat();
    const bkt=allBkts.find(b=>b.id===AF.pendBkt);
    if(bkt) chips.push({label:bkt.name,type:'bkt'});
  }
  area.innerHTML=chips.map(ch=>`
    <span class="af-active-chip">
      ${ch.label}
      <span class="af-chip-x" onclick="afRemoveChip('${ch.type}')">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </span>
    </span>`).join('');
  if(clearBtn) clearBtn.classList.toggle('visible', chips.length>0);
}

function afSelectCat(id){
  AF.pendCat=id;
  AF.pendBkt=null;
  afRenderCats();
  afRenderBkts(true);
  afRenderKw(false);
  afRenderChips();
}

function afSelectBkt(id){
  AF.pendBkt=id;
  // update selected state in-place — no full re-render, no repeated animation
  document.querySelectorAll('#af-bkt-list .af-item').forEach(el=>{
    el.classList.toggle('selected', el.dataset.bktId===id);
  });
  afRenderKw(true);
  afRenderChips();
}

function afRemoveChip(type){
  if(type==='cat'){ AF.pendCat=null; AF.pendBkt=null; }
  if(type==='bkt'){ AF.pendBkt=null; }
  afRenderCats();
  afRenderBkts(false);
  afRenderKw(false);
  afRenderChips();
}

function afClearAll(){
  AF.pendCat=null;
  AF.pendBkt=null;
  afRenderCats();
  afRenderBkts(false);
  afRenderKw(false);
  afRenderChips();
}

function afApply(){
  AF.selCat=AF.pendCat;
  AF.selBkt=AF.pendBkt;
  // Update filter bar display
  const badge=document.getElementById('fc-filters-badge');
  const btn=document.getElementById('fc-filters-btn');
  let count=0;
  if(AF.selCat) count++;
  if(AF.selBkt) count++;
  if(badge){
    badge.textContent=count;
    badge.style.display=count>0?'inline-flex':'none';
  }
  if(btn) btn.classList.toggle('active',count>0);
  // Update category pill in filter bar
  const fcLabel=document.getElementById('fc-cat-label');
  if(fcLabel){
    const cat=AF.categories.find(c=>c.id===AF.selCat);
    fcLabel.textContent=cat?cat.name:'Company News - DITO Telecommunity';
  }
  closeAllFilters();
}

function afToggleSort(col){
  const menuId=col==='cat'?'af-cat-sort-menu':'af-bkt-sort-menu';
  const menu=document.getElementById(menuId);
  if(!menu) return;
  const isOpen=menu.classList.contains('open');
  // close all sort menus first
  document.querySelectorAll('.af-sort-menu').forEach(m=>m.classList.remove('open'));
  if(!isOpen) menu.classList.add('open');
  event.stopPropagation();
}

function afSetSort(col,val,el){
  if(col==='cat') AF.catSort=val;
  else AF.bktSort=val;
  document.querySelectorAll('.af-sort-menu').forEach(m=>m.classList.remove('open'));
  if(col==='cat') afRenderCats();
  else afRenderBkts(true);
  event.stopPropagation();
}

function afPage(col,dir){
  if(col==='cat'){
    const pages=Math.ceil(AF.categories.length/AF.catPageSize);
    AF.catPage=Math.max(0,Math.min(AF.catPage+dir,pages-1));
    afRenderCats();
  }
}

function afToggleKw(){
  const groups=document.getElementById('af-kw-groups');
  const chev=document.getElementById('af-kw-chev');
  if(!groups||!chev) return;
  const isVisible=groups.classList.contains('entering');
  if(isVisible){
    groups.classList.remove('entering');
    groups.classList.add('leaving');
    chev.classList.remove('open');
    groups.addEventListener('animationend',()=>{ groups.classList.remove('leaving'); groups.style.display='none'; },{once:true});
  } else {
    groups.style.display='';
    groups.classList.remove('leaving');
    groups.classList.add('entering');
    chev.classList.add('open');
  }
}

function afRefreshBuckets(){
  const btn=event.currentTarget;
  btn.style.transform='rotate(360deg)';
  btn.style.transition='transform 0.4s ease';
  setTimeout(()=>{ btn.style.transform=''; btn.style.transition=''; },400);
  afRenderBkts(true);
}

// Close sort menus on outside click
document.addEventListener('click',function(e){
  if(!e.target.closest('.af-sort-dd')) document.querySelectorAll('.af-sort-menu').forEach(m=>m.classList.remove('open'));
});

// ── Date Range Picker ──
const DR={
  start: new Date(2026,4,18),
  end:   new Date(2026,4,25),
  picking: null,
  leftYear:2026, leftMonth:4,
  activePreset: null,
  myOverlay: null, // {calId, year} when month/year overlay is open
};
const DR_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DR_MONTHS_SHORT=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DR_DOWS=['Su','Mo','Tu','We','Th','Fr','Sa'];

function drToggle(){
  const picker=document.getElementById('dr-picker');
  if(!picker) return;
  const btn=document.getElementById('fc-date-btn');
  if(picker.style.display==='none'||picker.style.display===''){
    DR.leftYear=DR.start.getFullYear();
    DR.leftMonth=DR.start.getMonth();
    DR.myOverlay=null;
    // position fixed relative to button
    const rect=btn.getBoundingClientRect();
    picker.style.display='block';
    picker.classList.remove('closing');
    void picker.offsetWidth;
    // position after display so dimensions are available
    const pw=picker.offsetWidth||556;
    let left=rect.left;
    if(left+pw>window.innerWidth-12) left=window.innerWidth-pw-12;
    if(left<8) left=8;
    let top=rect.bottom+6;
    if(top+420>window.innerHeight) top=rect.top-420-6;
    picker.style.left=left+'px';
    picker.style.top=top+'px';
    btn.classList.add('active');
    drRender();
  } else {
    drClose();
  }
}

function drClose(){
  const picker=document.getElementById('dr-picker');
  const btn=document.getElementById('fc-date-btn');
  if(!picker||picker.style.display==='none') return;
  picker.classList.add('closing');
  btn.classList.remove('active');
  picker.addEventListener('animationend',()=>{ picker.style.display='none'; picker.classList.remove('closing'); },{once:true});
}

function drRender(slideDir){
  const rightYear=DR.leftMonth===11?DR.leftYear+1:DR.leftYear;
  const rightMonth=DR.leftMonth===11?0:DR.leftMonth+1;
  drRenderCal('dr-cal-left', DR.leftYear, DR.leftMonth, slideDir);
  drRenderCal('dr-cal-right', rightYear, rightMonth, slideDir);
  // hint
  const hint=document.getElementById('dr-hint');
  if(hint) hint.textContent=DR.picking==='end'?'Select end date':'';
  // presets
  document.querySelectorAll('.dr-preset').forEach(b=>b.classList.toggle('active', b.textContent===DR.activePreset));
  // restore month/year overlay if open
  if(DR.myOverlay) drShowMyOverlay(DR.myOverlay.calId, DR.myOverlay.year);
}

function drRenderCal(elId, year, month, slideDir){
  const el=document.getElementById(elId);
  if(!el) return;
  const today=new Date(); today.setHours(0,0,0,0);
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const isLeft=elId==='dr-cal-left';

  const prevBtn=isLeft
    ?`<button class="dr-cal-nav" onclick="drNav(-1,event)"><svg viewBox="0 0 13 13" fill="none"><path d="M8 2.5L4.5 6.5L8 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`
    :`<span style="width:26px"></span>`;
  const nextBtn=!isLeft
    ?`<button class="dr-cal-nav" onclick="drNav(1,event)"><svg viewBox="0 0 13 13" fill="none"><path d="M5 2.5L8.5 6.5L5 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`
    :`<span style="width:26px"></span>`;

  // build day cells — track column position for row-edge detection
  let cells='';
  let col=firstDay;
  for(let i=0;i<firstDay;i++) cells+=`<div class="dr-day dr-day--empty"><div class="dr-day-inner"></div></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const date=new Date(year,month,d);
    const ts=date.getTime();
    const startTs=DR.start?DR.start.getTime():null;
    const endTs=DR.end?DR.end.getTime():null;
    const isStart=startTs&&ts===startTs;
    const isEnd=endTs&&ts===endTs;
    const inRange=startTs&&endTs&&ts>startTs&&ts<endTs;
    const isToday=ts===today.getTime();
    const isOnlyDay=isStart&&isEnd;
    let cls='dr-day';
    if(isStart&&!isOnlyDay) cls+=' dr-day--start';
    if(isEnd&&!isOnlyDay) cls+=' dr-day--end';
    if(isOnlyDay) cls+=' dr-day--start dr-day--end dr-day--only';
    if(inRange){
      cls+=' dr-day--in-range';
      if(col%7===0) cls+=' dr-day--range-row-start';
      if(col%7===6||d===daysInMonth) cls+=' dr-day--range-row-end';
    }
    if(isToday) cls+=' dr-day--today';
    cells+=`<div class="${cls}" onclick="drSelect(${year},${month},${d},event)"><div class="dr-day-inner">${d}</div></div>`;
    col++;
  }

  const gridSlide=slideDir?` slide-${slideDir}`:'';
  el.innerHTML=`
    <div class="dr-cal-hd">
      ${prevBtn}
      <span class="dr-cal-title" onclick="drToggleMyOverlay('${elId}',${year},event)">
        ${DR_MONTHS[month]} ${year}
        <svg viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      ${nextBtn}
    </div>
    <div class="dr-grid${gridSlide}">
      ${DR_DOWS.map(d=>`<div class="dr-dow">${d}</div>`).join('')}
      ${cells}
    </div>`;
}

function drNav(dir, e){
  if(e) e.stopPropagation();
  DR.myOverlay=null;
  DR.leftMonth+=dir;
  if(DR.leftMonth>11){ DR.leftMonth=0; DR.leftYear++; }
  if(DR.leftMonth<0){  DR.leftMonth=11; DR.leftYear--; }
  drRender(dir>0?'left':'right');
}

function drSelect(year,month,day,e){
  if(e) e.stopPropagation();
  const date=new Date(year,month,day);
  if(!DR.picking){
    DR.start=date; DR.end=null; DR.picking='end'; DR.activePreset=null;
  } else {
    if(date.getTime()===DR.start.getTime()){ DR.picking=null; }
    else if(date<DR.start){ DR.end=DR.start; DR.start=date; DR.picking=null; }
    else { DR.end=date; DR.picking=null; }
  }
  drRender();
}

function drPreset(days){
  const end=new Date(2026,5,18);
  const start=new Date(end); start.setDate(end.getDate()-days+1);
  DR.start=start; DR.end=end; DR.picking=null;
  DR.leftYear=start.getFullYear(); DR.leftMonth=start.getMonth();
  DR.myOverlay=null;
  const labels={7:'7D',30:'1M',90:'3M',180:'6M',365:'1Y'};
  DR.activePreset=labels[days]||null;
  drRender();
}

function drApply(){
  const fmt=d=>`${DR_MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  if(DR.start) document.getElementById('dr-label-start').textContent=fmt(DR.start);
  if(DR.end)   document.getElementById('dr-label-end').textContent=fmt(DR.end);
  drClose();
}

// Month/year overlay
function drToggleMyOverlay(calId, year, e){
  if(e) e.stopPropagation();
  if(DR.myOverlay&&DR.myOverlay.calId===calId){ DR.myOverlay=null; drRender(); return; }
  DR.myOverlay={calId, year};
  drShowMyOverlay(calId, year);
}

function drShowMyOverlay(calId, year, slideDir){
  const cal=document.getElementById(calId);
  if(!cal) return;
  const existing=cal.querySelector('.dr-my-overlay');
  const isLeft=calId==='dr-cal-left';
  const curMonth=isLeft?DR.leftMonth:(DR.leftMonth===11?0:DR.leftMonth+1);
  const months=DR_MONTHS_SHORT.map((m,i)=>`
    <button class="dr-month-btn${i===curMonth?' active':''}" onclick="drSelectMonth('${calId}',${year},${i},event)">${m}</button>`).join('');

  if(existing&&slideDir){
    // animate only year value + month grid in-place — overlay stays
    const yearEl=existing.querySelector('.dr-my-year-val');
    const gridEl=existing.querySelector('.dr-month-grid');
    const animClass=slideDir===1?'slide-up':'slide-down';
    if(yearEl){
      yearEl.classList.remove('slide-up','slide-down');
      void yearEl.offsetWidth;
      yearEl.textContent=year;
      yearEl.classList.add(animClass);
    }
    if(gridEl){
      gridEl.classList.remove('slide-up','slide-down');
      void gridEl.offsetWidth;
      gridEl.innerHTML=months;
      gridEl.classList.add(animClass);
    }
  } else {
    existing?.remove();
    const ov=document.createElement('div');
    ov.className='dr-my-overlay';
    ov.innerHTML=`
      <div class="dr-my-year-row">
        <button class="dr-my-nav" onclick="drMyNavYear('${calId}',-1,event)"><svg viewBox="0 0 11 11" fill="none"><path d="M7 2L4 5.5L7 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button>
        <span class="dr-my-year-val">${year}</span>
        <button class="dr-my-nav" onclick="drMyNavYear('${calId}',1,event)"><svg viewBox="0 0 11 11" fill="none"><path d="M4 2L7 5.5L4 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button>
      </div>
      <div class="dr-month-grid">${months}</div>`;
    cal.appendChild(ov);
  }
  DR.myOverlay={calId, year};
}

function drMyNavYear(calId, dir, e){
  if(e) e.stopPropagation();
  DR.myOverlay.year+=dir;
  drShowMyOverlay(calId, DR.myOverlay.year, dir);
}

function drSelectMonth(calId, year, month, e){
  if(e) e.stopPropagation();
  const isLeft=calId==='dr-cal-left';
  if(isLeft){ DR.leftYear=year; DR.leftMonth=month; }
  else {
    // right cal is always leftMonth+1; adjust left accordingly
    DR.leftMonth=month-1;
    if(DR.leftMonth<0){ DR.leftMonth=11; DR.leftYear=year-1; }
    else { DR.leftYear=year; }
  }
  DR.myOverlay=null;
  drRender();
}

// Close date picker on outside click
document.addEventListener('click',function(e){
  if(!e.target.closest('#fc-date-btn')&&!e.target.closest('#dr-picker')) drClose();
});

// ── Per-page init (each page is a separate HTML file sharing this script) ──
if(document.getElementById('page-tracker')){if(acts.length&&trackerSel===null){trackerSel=acts[0].id;trackerTabs[acts[0].id]='matches';}renderTracker();}
if(document.getElementById('page-dashboard')) initDashboard();
if(document.getElementById('page-publishers')) renderPublishers();
if(document.getElementById('page-authors')) renderAuthors();
if(document.getElementById('page-categories')) renderCategories();
