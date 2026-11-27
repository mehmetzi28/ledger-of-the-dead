// ===== R16 PR A: TITLES AND COLLECTION 2.0 =====
// Families: every title belongs to one of ten families (FAM_OF, from its id; a new title falls back on its group). Inscribed
// titles (S.insc): up to three earned titles written beside the worn one, slots at 40, 80 and 120 titles. Each gives its
// family's small perk, not its rarity bonus, and one title a family (perks of a family never stack). Milestones (S.coll):
// six collections with three steps each; the middle steps change a rule a little, the others give cosmetics (R16 PR B).
// Hidden titles show a masked hint once you hold 100 titles (50 with the Pages milestone). All kept through New Game+.
const INSC_AT=[40,80,120];
const FAMS={
  gate:   {name:'Gates',           perk:'+1% damage in that title\'s gate (in every gate for a title of no one gate)'},
  army:   {name:'Army',            perk:'+1% army max HP'},
  raise:  {name:'Raising',         perk:'+0.5% raise chance'},
  hero:   {name:'Hero',            perk:'+1% Strike and Soul Siphon damage'},
  endless:{name:'Tower and Rift',  perk:'+1% damage in the Hell Tower and the Rift'},
  town:   {name:'Town',            perk:'Building costs and upkeep 2% lower'},
  faith:  {name:'Faith',           perk:'+5% devotion gained'},
  rival:  {name:'Rival and sieges',perk:'+2% damage against the rival and in sieges'},
  story:  {name:'Story',           perk:'+2% XP from bosses'},
  secrets:{name:'Secrets',         perk:'+1% chance of gear drops'}
};
const FAM_IDS=Object.keys(FAMS);
const INSC_K={gate:.01,army:.01,raise:.5,hero:.01,endless:.01,town:.02,faith:.05,rival:.02,story:.02,secrets:.01};
const FAM_LIST={
  endless:'d_tower1 d_tower50 d_tower110 d_tower150 d_tuq r_5 r_15 r_30 r_six r_sigil3 r_weekly r_attuned x_rift25 x_rift50 x_riftfast b_ten i_climb',
  army:'d_army d_armed1 d_armed3 d_evolve d_elder d_altar a_traits a_elders a_ancient a_eternal ar_charmed ar_hundred ar_witch ar_roles ar_order x_fuse10 x_ftr x_mlv50 s_venom s_poison a_raid1 a_raid25 x_long x_hunt x_clean x_rally',
  raise:'d_raise1 d_raise50 d_raise200 a_raise500 a_boss e_strag ar_tennames',
  hero:'d_lv10 d_lv25 d_lv50 e_lv75 d_death d_death10 p_25 p_100 s_cure k_spear k_blast k_chill k_reap k_master3 k_all f_crit f_crit1000 f_last f_flawless b_haul b_five b_runes b_sgn d_cancel d_cancel10 d_kill100 d_kill1000 d_kill5000 f_boss25 f_elite100',
  town:'d_master d_trophy500 d_gold d_bag g_gold g_items g_reforge g_sold g_roll3 x_relics x_hoard s_works d_quest7',
  faith:'f_hon f_vesh f_ulm f_choir f_dis f_godless f_turncoat f_weather x_omen1 x_omen25 x_omenall x_eclipse e_shrine',
  rival:'r_stakes r_reclaim r_end r_spare r_clean s_unburnt s_road s_tiers s_pyre',
  story:'d_ngp d_ngp3 as_3 as_6 as_10 as_all as_rw a_keeper a_hand a_both a_echo r_half e_day100 e_runs100 e_rooms1000 x_titles50 x_titles100 pk1 pk3 i_book e_pedlar e_coffer e_trap c_paid',
  secrets:'d_uq d_study d_all x_mastered25 x_ledger10 nm_1 nm_5 nm_15 nm_old k_reader k_weak k_defuse k_gcbane'
};
const FAM_OF={}; for(const f in FAM_LIST) for(const id of FAM_LIST[f].split(' ')) FAM_OF[id]=f;
const famOf=t=>FAM_OF[t.id]||(t.grp==='Hell Tower'?'endless':t.grp==='Gates'||t.grp==='Curses and events'&&/^c_/.test(t.id)?'gate':t.grp==='Curses and events'?'story':'hero');
const titleGate=t=>{ const m=/^(?:g|m|nm|sb|b_ub|hd|dm)(\d)$/.exec(t.id); return m&&+m[1]<GATE_N?+m[1]:null; };
let INSC_ON=true;   // the balance bot's off-switch ("off":["insc"])
const inscSlots=n=>INSC_AT.filter(a=>(n==null?titlesGot():n)>=a).length;
const inscList=()=>INSC_ON&&S&&Array.isArray(S.insc)?S.insc.filter(id=>TITLE[id]&&S.ti&&S.ti.got&&S.ti.got[id]).slice(0,inscSlots()):[];
const inscFam=f=>inscList().find(id=>famOf(TITLE[id])===f)||null;
const inscOn=f=>!!inscFam(f);
function titleInscribe(id){   // write an earned title beside the worn one (again: erase it); one a family, in town
  const t=TITLE[id]; if(!t||!S.ti||!S.ti.got||!S.ti.got[id]||S.mode==='battle') return false; S.insc=Array.isArray(S.insc)?S.insc.filter(x=>TITLE[x]):[];
  if(S.insc.includes(id)){ vitals(()=>{ S.insc=S.insc.filter(x=>x!==id); }); if(!S.insc.length) delete S.insc; syncArmy(); return true; }
  if(S.insc.length>=inscSlots()||S.insc.some(x=>famOf(TITLE[x])===famOf(t))) return false;
  vitals(()=>{ S.insc.push(id); }); syncArmy(); tally('inscribed'); return true;
}
const inscWhy=id=>{ const t=TITLE[id], L=Array.isArray(S.insc)?S.insc:[]; if(!t||!(S.ti&&S.ti.got&&S.ti.got[id])) return 'not earned'; if(L.includes(id)) return ''; if(L.length>=inscSlots()) return inscSlots()<INSC_AT.length?'next slot at '+INSC_AT[inscSlots()]+' titles':'every slot is used'; const o=L.find(x=>TITLE[x]&&famOf(TITLE[x])===famOf(t)); return o?'one '+FAMS[famOf(t)].name+' title is inscribed: '+TITLE[o].name:''; };
// the perks, read where each rule lives
function inscDmgK(){   // hurtFoe: your side's damage
  const r=S.run; if(!r||!INSC_ON) return 1; let k=1;
  const g=inscFam('gate'); if(g&&!r.tw&&!r.rift&&!r.siege&&r.di!=null){ const gi=titleGate(TITLE[g]); if(gi==null||gi===r.di) k+=INSC_K.gate; }
  if((r.tw||r.rift)&&inscOn('endless')) k+=INSC_K.endless;
  if((r.siege||r.rg||r.rk||(r.enemies||[]).some(e=>e.rival))&&inscOn('rival')) k+=INSC_K.rival;
  return k;
}
const inscArmy=()=>inscOn('army')?INSC_K.army:0;   // extraMul (army max HP)
const inscRaise=()=>inscOn('raise')?INSC_K.raise:0;   // raiseChance
const inscHero=()=>inscOn('hero')?1+INSC_K.hero:1;   // Strike and Soul Siphon
const inscTown=()=>inscOn('town')?1-INSC_K.town:1;   // buildCost, upkeepOf
const inscFaith=()=>inscOn('faith')?1+INSC_K.faith:1;   // deed
const inscBossXp=e=>e&&e.boss&&inscOn('story')?1+INSC_K.story:1;   // a boss's XP
const inscDrop=()=>inscOn('secrets')?1+INSC_K.secrets:1;   // rollDrops
function inscFix(g){   // normalizeSave
  if(!('insc' in g)) return; const got=(g.ti&&g.ti.got)||{}, out=[], fams={};
  if(Array.isArray(g.insc)) for(const id of g.insc){ const t=TITLE[id]; if(!t||!got[id]||out.includes(id)||fams[famOf(t)]||out.length>=INSC_AT.length) continue; fams[famOf(t)]=1; out.push(id); }
  if(out.length) g.insc=out; else delete g.insc;
}
// ----- milestones
const MS_IDS=['ledger','uq','sets','tro','pages','mem'];
const trophyKinds=()=>Object.keys(TROPHY).filter(k=>!k.startsWith('b:'));
const setDone=i=>{ const own=new Set(S.inv.concat(Object.values(S.equip),...S.army.concat(benched()).map(m=>m.eq?Object.values(m.eq):[])).filter(Boolean).map(it=>it.id));
  return Object.values(ITEM).filter(d=>d.set===i&&!d.tower&&!d.rival&&!d.uq).every(d=>own.has(d.id)); };
const MILESTONES={
  ledger:{name:'Bestiary Ledgered',unit:'kinds of foe Ledgered',steps:[10,25,50],get:()=>masteredN(['ledgered']),rew:['a cosmetic','+1 door sight in every gate','a cosmetic']},
  uq:    {name:'Uniques found',unit:'unique items ever held',steps:[6,12,18],get:()=>((S.coll&&S.coll.u)||[]).length,rew:['a cosmetic','Awakening costs 10% less gold','a cosmetic']},
  sets:  {name:'Sets completed',unit:'sets with all 7 pieces held at once',steps:[2,4,6],get:()=>SET_NAMES.filter((n,i)=>setDone(i)).length,rew:['a cosmetic','+1 bag row (+'+BAG_STEP+' slots)','a cosmetic']},
  tro:   {name:'Trophy kinds held',unit:'kinds of trophy held at once',steps:[30,60,0],get:()=>trophyKinds().filter(k=>(S.trophies[k]|0)>0).length,rew:['a cosmetic','one free brew a week','a cosmetic']},
  pages: {name:'Pages',unit:'torn pages found',steps:[10,20,0],get:()=>S.pages|0,rew:['a cosmetic','hidden title hints from 50 titles','a cosmetic']},
  mem:   {name:'Memorial',unit:'names in the Memorial',steps:[50,100,200],get:()=>(S.memorial||[]).length,rew:['a cosmetic','headstones cost 10% less','a cosmetic']}
};
const msSteps=k=>{ const M=MILESTONES[k]; return M.steps.map(n=>n||(k==='tro'?trophyKinds().length:k==='pages'?LORE_PAGES.length:n)); };
const msAt=k=>(S&&S.coll&&S.coll[k])|0;   // steps reached, kept for good
const msOn=(k,step)=>msAt(k)>=step;
function collCheck(){   // checkTitles: unique items ever held, then each milestone's steps (paid once, never lost)
  const C=S.coll=S.coll&&typeof S.coll==='object'?S.coll:{}; let ch=false;
  const uq=ownedUniques(); if(uq.length){ const u=C.u||[]; for(const id of uq) if(!u.includes(id)){ u.push(id); ch=true; } if(u.length) C.u=u; }
  for(const k of MS_IDS){ const st=msSteps(k), v=MILESTONES[k].get(); let n=C[k]|0;
    while(n<3&&v>=st[n]){ n++; ch=true; notify('Collection milestone: '+MILESTONES[k].name+' '+st[n-1]+'. '+MILESTONES[k].rew[n-1].charAt(0).toUpperCase()+MILESTONES[k].rew[n-1].slice(1)+'.','ok'); }
    if(n) C[k]=n; }
  if(!Object.keys(C).length) delete S.coll;
  return ch;
}
const collSight=v=>msOn('ledger',2)?Math.min(2,v+1):v;   // doorSight
const collAwaken=g=>msOn('uq',2)?Math.round(g*.9/100)*100:g;   // awakenCost
const collBag=()=>msOn('sets',2)?BAG_STEP:0;   // bagMax
const collHead=g=>msOn('mem',2)?Math.round(g*.9):g;   // headCost
const collBrew=()=>msOn('tro',2)&&!(S.coll&&S.coll.bw===weekOf(S.day));   // freeBrew: once a week
const collBrewUse=()=>{ if(S.coll) S.coll.bw=weekOf(S.day); };
const HINT_AT=100, HINT_AT_PAGES=50;
const hintsOn=()=>titlesGot()>=(msOn('pages',2)?HINT_AT_PAGES:HINT_AT);
function titleHint(t){   // a hidden title's requirement, most words masked to their first letter
  const s=VIEW&&VIEW.lang==='tr'&&typeof trText==='function'?trText(t.req):t.req; let i=0;
  return s.replace(/[A-Za-zÀ-ÿĞğİıŞş']{4,}/g,w=>(i++%3===0?w:w[0]+'…'));
}
function collFix(g){   // normalizeSave
  if(!('coll' in g)) return; const c=g.coll&&typeof g.coll==='object'?g.coll:{}, o={};
  for(const k in c){ if(MS_IDS.includes(k)){ const n=Math.floor(num(c[k],0)); if(n>=1) o[k]=Math.min(3,n); } else if(k==='u'&&Array.isArray(c.u)){ const u=[...new Set(c.u.filter(id=>ITEM[id]&&ITEM[id].uq))]; if(u.length) o.u=u; } else if(k==='bw'&&isFinite(c.bw)&&c.bw>=0) o.bw=Math.floor(c.bw); }
  if(Object.keys(o).length) g.coll=o; else delete g.coll;
}
