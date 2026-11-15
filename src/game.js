'use strict';
//==LOGIC==
const SAVE_KEY = 'ledger-of-the-dead-v1';
const RANKS = ['E','D','C','B','A','S'];
// hp/atk: stat multiplier by rank. pen: raise-chance penalty. clear: bonus xp. unlock: player level needed. lv: enemy base level.
const RK = [
  {hp:1,   atk:1,   xp:1,   pen:0,  clear:40,   unlock:1,  lv:1},
  {hp:1.7, atk:1.6, xp:1.4, pen:4,  clear:90,   unlock:4,  lv:4},
  {hp:2.6, atk:2.4, xp:1.9, pen:8,  clear:190,  unlock:8,  lv:8},
  {hp:3.8, atk:3.3, xp:2.6, pen:12, clear:380,  unlock:12, lv:12},
  {hp:5.2, atk:4.4, xp:3.5, pen:16, clear:720,  unlock:17, lv:17},
  {hp:7.5, atk:6,   xp:5,   pen:20, clear:1400, unlock:23, lv:23}
];
const ROLES = {
  vanguard:{label:'Vanguard', text:'Draws enemy blows.'},
  striker:{label:'Striker', text:'25% chance to crit for 1.8x.'},
  mender:{label:'Mender', text:'Mends the most hurt ally instead of striking.'},
  reaper:{label:'Reaper', text:'Cleaves a second foe for half damage.'}
};
const ELITE = ['Gravetouched','Ashen','Hollowed','Bone-sworn','Pale'];
const NICKS = ['Vesk','Moth','Cairn','Ossa','Pike','Wren','Tallow','Brine','Hollis','Dusk','Marrow','Sable','Rook','Thimble','Ash','Gaunt','Lorn','Nettle','Bram','Cinder','Fenn','Grist','Harrow','Ivo','Juniper','Kest','Lull','Mire','Nox','Orrin','Pall','Quill','Rue','Sorrel','Thane','Umber','Vale','Wick','Yarrow','Zed'];
const QUEST = {kills:8, rooms:4, clears:1}, QUEST_LOSS=.15, QUEST_DEBUFF=.1, QUEST_PTS=1, QUEST_XP=.15;   // the dawn penalty for an unfinished quest
const WATCHES = 3;
// mobs: [name, role, hp factor, atk factor]
const DUNGEONS = [
  {name:'Rat Warren', blurb:'Flooded tunnels under the old tannery. Something gnaws in the dark.',
    mobs:[['Tunnel Rat','striker',.85,1.1],['Grave Beetle','vanguard',1.4,.8],['Marrow Mite','mender',.8,.7]], boss:['The Rat King','reaper']},
  {name:'Sunken Crypt', blurb:'A drowned family vault. The dead here still keep their posts.',
    mobs:[['Skeleton Guard','vanguard',1.3,.9],['Crypt Ghoul','striker',.95,1.25],['Drowned Priest','mender',.8,.8]], boss:['The Crypt Warden','reaper']},
  {name:'Ashen Barrow', blurb:'A burial mound that never stopped smoldering.',
    mobs:[['Ash Husk','vanguard',1.35,.85],['Barrow Wight','striker',.9,1.3],['Pyre Witch','mender',.8,.8]], boss:['The Ember Knight','reaper']},
  {name:'Hollow Cathedral', blurb:'The congregation left. The choir did not.',
    mobs:[['Stone Gargoyle','vanguard',1.4,.9],['Nave Stalker','striker',.9,1.3],['Hollow Chorister','mender',.8,.8]], boss:['The Bishop of Teeth','reaper']},
  {name:'Iron Orchard', blurb:'Rusted trees bear fruit that screams when it falls.',
    mobs:[['Thorn Troll','vanguard',1.45,.9],['Rust Knight','striker',.95,1.3],['Sap Weaver','mender',.8,.8]], boss:['The Orchard Mother','reaper']},
  {name:'Throne of Ash', blurb:'A king died here and refused to stay dead. His court agreed.',
    mobs:[['Throne Guard','vanguard',1.4,.9],['Ash Revenant','striker',.95,1.3],['Whisper Choir','mender',.8,.8]], boss:['The Pale Sovereign','reaper']}
];


// ===== ROSTER EXTENSION =====
// Three new enemies per gate. Each copies the hp/atk factors of the existing enemy with the same role in that gate,
// so the role mix (2 vanguard, 2 striker, 2 mender) and the average stat budget stay exactly as before.
const EXTRA=[
 [['Tannery Brute','vanguard',1.4,.8],['Shiv Cutpurse','striker',.85,1.1],['Tallow Chandler','mender',.8,.7]],
 [['Drowned Sentinel','vanguard',1.3,.9],['Coffin Crawler','striker',.95,1.25],['Tide Acolyte','mender',.8,.8]],
 [['Barrow Thrall','vanguard',1.35,.85],['Ember Stalker','striker',.9,1.3],['Cinder Weaver','mender',.8,.8]],
 [['Glass Sentinel','vanguard',1.4,.9],['Tooth Collector','striker',.9,1.3],['Vestment Wraith','mender',.8,.8]],
 [['Iron Scarecrow','vanguard',1.45,.9],['Fruit Reaver','striker',.95,1.3],['Grove Shepherd','mender',.8,.8]],
 [['Ember Herald','vanguard',1.4,.9],['Crownless Duelist','striker',.95,1.3],['Pallbearer','mender',.8,.8]]
];
EXTRA.forEach((l,i)=>DUNGEONS[i].mobs.push(...l));

// ===== ARMED DEAD =====
// One gear-bearing enemy per gate (and two in the Hell Tower). They fight with the stats of an ordinary enemy of the same role,
// but once raised they keep three equipment slots (weapon, armor, relic) that you fill from your bag.
const ARMED_G=[['Warren Bandit','striker',.85,1.1],['Crypt Legionnaire','vanguard',1.3,.9],['Barrow Champion','striker',.9,1.3],
  ['Cathedral Templar','vanguard',1.4,.9],['Orchard Marshal','vanguard',1.45,.9],['Ash Praetorian','vanguard',1.4,.9]];
ARMED_G.forEach((m,i)=>DUNGEONS[i].mobs.push(m));
const ARMED_T=[['Hell Legionary','vanguard',1.4,.9],['Infernal Duelist','striker',.95,1.3]];
const ARMED=new Set(ARMED_G.concat(ARMED_T).map(m=>m[0]));
const isArmed=n=>ARMED.has(n);
// ===== SECRET BOSSES =====
// Every gate hides an older master. Once a gate has been cleared, its boss room very rarely holds the secret boss instead:
// four times the HP, far harder hits, and its second phase from the first turn. It pays like nothing else in the gate.
const SECRET=[
  {name:'The Plague Matriarch',  hint:'Something older than the Rat King gnaws beneath the Warren.', lines:['My children ate your Rat King\'s court, little scribe. Now they are hungry again.','The swarm... will remember... your name...']},
  {name:'The Drowned Abbot',     hint:'Below the Crypt\'s lowest step, the water is still praying.', lines:['The Warden kept the door. I kept what lay beneath it. Kneel in the water.','The tide... takes me home at last.']},
  {name:'The Cinder Wyrm',       hint:'The Barrow\'s embers breathe, slow and even, as if something sleeps in them.', lines:['The Knight was right. Something slept beneath the fire. It is awake.','Embers... only embers now...']},
  {name:'The Choir Eternal',     hint:'When the Cathedral falls quiet, a choir keeps singing somewhere under it.', lines:['We sang before the Bishop was born. We will sing when your book is dust.','The last note... is yours...']},
  {name:'The Rootking',          hint:'The Orchard\'s roots run deeper than any tree that stands on them.', lines:['The Mother planted the orchard. I am what grew beneath it.','Cut me down... and I grow back... somewhere...']},
  {name:'The Nameless Sovereign',hint:'An empty page in the Ledger, older than the Throne, waits for a name.', lines:['Before the Pale Sovereign, before the Ledger, there was me. I had a name once. You will write it.','So... that was my name...']}
];
const SECRET_CHANCE=.01, SECRET_HEAT=.01, SECRET_PITY=.0005,   /* about 41 boss rooms of one gate between masters on Normal (bots met one every ~19 at 2%/0.25%) */ SB_LV=1, SB_HP=3.5, SB_ATK=1.7, SB_GROW=.12, SB_REWARD=4;   // SB_GROW: extra HP (not attack: bigger hits only one-shot you) per level you stand above your hardest gate's Recommended level
// The roll for a cleared gate's boss room. Each boss room without the secret master makes the next a little likelier (S.sbPity), so it stays rare but never out of reach.
const secretChance=di=>SECRET_CHANCE+SECRET_HEAT*runHeat()+SECRET_PITY*((S.sbPity&&S.sbPity[di])||0);
function secretRoll(di){
  if(!(S.ti&&S.ti.clr&&S.ti.clr[di])) return false;
  S.sbPity=S.sbPity||{}; const hit=Math.random()<secretChance(di);
  if(hit) delete S.sbPity[di]; else S.sbPity[di]=(S.sbPity[di]||0)+1;
  return hit;
}
const secretOf=n=>SECRET.findIndex(x=>x.name===n);
const SECRET_HINT=10;   // after this many clears of a gate, the Ledger hints that something older waits there (never its name)
const secretHinted=i=>T_('clrN'+i)>=SECRET_HINT&&!((S.kills||{})[SECRET[i].name]>0);
const GEAR_SLOTS=['weapon','armor','relic'];


// ===== ITEMS =====
const TIERS=['Common','Uncommon','Rare','Epic','Legendary','Unique'];
const SLOTS={weapon:'Weapon',armor:'Armor',relic:'Relic'};
const TM=[1,1.8,3,4.8,7.5,9.4];      // stat multiplier per item set (one set per gate)
const SET_TIER=[0,1,2,3,4,4];        // tier of each gate's item set
const KINDS=['wa','wb','aa','ab','ta','tb','tc'];
const KSLOT={wa:'weapon',wb:'weapon',aa:'armor',ab:'armor',ta:'relic',tb:'relic',tc:'relic'};
const NAMES=[
 ['Gnawed Shiv','Femur Staff','Beetle-Shell Vest','Rat-Hide Wrap','Rat-Tooth Charm','Tallow Pendant','Mite-Husk Token'],
 ["Guard's Rusted Blade",'Reliquary Rod','Crypt Mail Vest','Burial Shroud','Brine Amulet','Grave-Wax Seal','Coffin-Nail Ring'],
 ['Wight-Bone Blade','Pyre-Witch Staff','Ashplate Cuirass','Cinder-Weave Robe','Ember Locket','Cinder Rosary','Barrow Torque'],
 ['Gargoyle-Fang Sword',"Chorister's Bell Staff",'Gargoyle Plate','Vestments of the Choir','Stained-Glass Relic','Nave Reliquary',"Bishop's Tooth Pendant"],
 ['Thornblade','Heartwood Scepter','Ironbark Hauberk','Raiment of Rust',"Mother's Seed Pendant",'Sapblood Rosary','Iron Fruit Talisman'],
 ["Sovereign's Cinderblade",'Choir-Song Scepter','Throne-Guard Plate','Revenant Pall','Ashen Crown Shard','Whisper Locket','Court Signet']
];
function kindStats(k,m){ const r=Math.round,f=Math.floor; switch(k){
  case 'wa':return {atk:r(3*m),crit:r(.8*m)};
  case 'wb':return {atk:r(1.5*m),siph:r(2.2*m),intelligence:f(m/2.2)};
  case 'aa':return {hp:r(10*m),constitution:f(m/2)};
  case 'ab':return {hp:r(5*m),ward:r(2.4*m),mana:r(3*m)};
  case 'ta':return {mana:r(8*m),intelligence:f(m/1.6)};
  case 'tb':return {raise:r(1.6*m),will:f(m/1.8)};
  default:return {mpow:r(2*m),regen:m>=3?1:0}; } }
const ITEM={};
NAMES.forEach((names,set)=>KINDS.forEach((k,i)=>{ const id=set+'-'+k; ITEM[id]={id,name:names[i],set,tier:SET_TIER[set],slot:KSLOT[k],kind:k,stats:kindStats(k,TM[set])}; }));
// Uniques: one per boss, very powerful, each with a special effect.
const UNIQ=[
 {name:'Crown of Gnawed Bones',slot:'relic',glyph:'i_u0',stats:{slot:2,mpow:20,will:4,mana:40},flag:'bonebank'},
 {name:"Warden's Key-Blade",slot:'weapon',glyph:'i_wa',stats:{atk:26,crit:12,strength:5},flag:'echo'},
 {name:"Ember Knight's Cinderplate",slot:'armor',glyph:'i_aa',stats:{hp:130,constitution:6,ward:14,strength:3},flag:'undying'},
 {name:"Bishop's Tithe-Staff",slot:'weapon',glyph:'i_wb',stats:{atk:14,siph:42,intelligence:7,mana:50},flag:'lifedrain'},
 {name:"Mother's Seedheart",slot:'relic',glyph:'i_u4',stats:{mana:90,regen:2,raise:14,will:5},flag:'soulharvest'},
 {name:'Funeral Shroud of the Pale Sovereign',slot:'armor',glyph:'i_ab',stats:{hp:100,mpow:28,will:8,intelligence:6,raise:10},flag:'cheapraise'}
];
UNIQ.forEach((u,i)=>{ ITEM['u'+i]=Object.assign({id:'u'+i,set:i,tier:5,uq:true,kind:'u'},u); });
const FLAGS={
 bonebank:'Bone Bank: your downed minions never shatter.',
 echo:'Echo: Strike has a 25% chance to hit a second time.',
 undying:'Undying: once per dungeon, a killing blow leaves you at 30% HP.',
 lifedrain:'Lifedrain: Soul Siphon heals you for 80% of the damage it deals.',
 soulharvest:'Soul Harvest: every kill restores 6 mana.',
 cheapraise:'Cheap Dead: raising the dead costs half the mana.',
 execute:'Headsman: Strike deals 50% more damage to foes below 35% HP.',
 thorns:'Thorns: foes that hit you take 20% of the damage back.',
 censer:'Censer: every kill restores 10 mana and heals you for 5% of your max HP.',
 swarmguard:'Swarmguard: your minions take 25% less damage.',
 chorus:'Chorus: Soul Siphon also drains every other foe for 50%.',
 bindsouls:'Bind Souls: raised minions return at full health and two levels higher.',
 cleave:'Wide Arc: Strike also hits another foe for 60% of the damage.',
 infernal:'Infernal: every fight begins with a ward worth 25% of your max HP.',
 halo:'Halo: at the end of each turn you and your minions heal 4% of max HP.',
 ruin:'Ruin: all damage dealt by you and your minions is increased by 25%.',
 hellfire:'Hellfire: Strike also scorches every other foe for 40% of the damage.',
 deathless:'Deathless: twice per run, a killing blow leaves you at 50% HP.'
};
const STATL={atk:['Strike',''],crit:['Crit chance','%'],siph:['Siphon',''],hp:['Max HP',''],mana:['Max mana',''],ward:['Ward',''],strength:['Strength',''],constitution:['Constitution',''],intelligence:['Intelligence',''],will:['Will',''],raise:['Raise chance','%'],mpow:['Minion power','%'],regen:['Mana per turn',''],slot:['Army slots','']};

// ===== DROP TABLES =====
// Share of each tier in a gate's drops [common, uncommon, rare, epic, legendary]. Each gate leans on its own tier and sometimes the next.
const TIER_W=[[78,19,3,0,0],[8,68,22,2,0],[0,10,68,20,2],[0,0,10,68,22],[0,0,0,12,88],[0,0,0,0,100]];
// Share of a boss's drops that is its unique (per drop). Ordinary enemies of the gate drop it at 1/20 of this.
const UQ=[2,1.75,1.5,1.25,1,.75];   // halved: a gate's unique should be a chase, not a day-3 find
// Signature item of each ordinary enemy (4x as likely as its siblings).
const SIG={'Tunnel Rat':'0-ta','Grave Beetle':'0-aa','Marrow Mite':'0-tc','Skeleton Guard':'1-wa','Crypt Ghoul':'1-ab','Drowned Priest':'1-wb','Ash Husk':'2-aa','Barrow Wight':'2-wa','Pyre Witch':'2-wb','Stone Gargoyle':'3-aa','Nave Stalker':'3-wa','Hollow Chorister':'3-wb','Thorn Troll':'4-aa','Rust Knight':'4-wa','Sap Weaver':'4-tb','Throne Guard':'5-aa','Ash Revenant':'5-wa','Whisper Choir':'5-tb'};
Object.assign(SIG,{'Warren Bandit':'0-wa','Crypt Legionnaire':'1-aa','Barrow Champion':'2-wa','Cathedral Templar':'3-aa','Orchard Marshal':'4-aa','Ash Praetorian':'5-aa',
 'Tannery Brute':'0-ab','Shiv Cutpurse':'0-wa','Tallow Chandler':'0-tb',
 'Drowned Sentinel':'1-aa','Coffin Crawler':'1-tc','Tide Acolyte':'1-ta',
 'Barrow Thrall':'2-tc','Ember Stalker':'2-ta','Cinder Weaver':'2-ab',
 'Glass Sentinel':'3-ta','Tooth Collector':'3-tc','Vestment Wraith':'3-ab',
 'Iron Scarecrow':'4-ab','Fruit Reaver':'4-tc','Grove Shepherd':'4-wb',
 'Ember Herald':'5-tc','Crownless Duelist':'5-ta','Pallbearer':'5-ab'});
const ROLE_BIAS={vanguard:{armor:1.8},striker:{weapon:1.8},mender:{relic:1.8},reaper:{weapon:1.3,armor:1.3}};
const tcache={}, UQ_MOB=.02;   // ordinary foes carry a gate's unique at 2% of a boss's odds (elites twice that)
function tableFor(di,role,boss,elite,sig){
  const key=[di,role,boss?1:0,elite?1:0,sig||''].join('|'); if(tcache[key]) return tcache[key];
  const nx=Math.min(5,di+1);
  const tw=TIER_W[di].map((w,t)=>(boss||elite)?(w*2+TIER_W[nx][t])/3:w);   // bosses and elites lean one tier higher
  const bias=ROLE_BIAS[role]||{};
  const uqp=UQ[di]*(boss?1:UQ_MOB)*(elite?2:1), scale=(100-uqp)/100, rows=[];
  for(let t=0;t<5;t++){
    if(!tw[t]) continue;
    const el=Object.values(ITEM).filter(d=>!d.uq&&d.tier===t);
    const raw=el.map(d=>(bias[d.slot]||1)*(d.set===di?3:1)*(d.id===sig?4:1)), sum=raw.reduce((a,b)=>a+b,0);
    el.forEach((d,i)=>rows.push({id:d.id,p:tw[t]*scale*raw[i]/sum/100}));
  }
  rows.push({id:'u'+di,p:uqp/100});
  return tcache[key]=rows;
}
const dropChances=(boss,elite)=>boss?[1,.6]:[elite?.65:.28];
function pickRow(rows){ let x=Math.random(),acc=0; for(const r of rows){ acc+=r.p; if(x<acc) return r.id; } return rows[rows.length-1].id; }
function pickNorm(rows){ const tot=rows.reduce((a,r)=>a+r.p,0); let x=Math.random()*tot,acc=0; for(const r of rows){ acc+=r.p; if(x<acc) return r.id; } return rows[rows.length-1].id; }
const ownsItem=id=>!!S&&(S.inv.some(it=>it.id===id)||GEAR_SLOTS.some(sl=>S.equip[sl]&&S.equip[sl].id===id)||S.army.concat(...(S.raids||[]).map(x=>x.units)).some(m=>m.eq&&GEAR_SLOTS.some(sl=>m.eq[sl]&&m.eq[sl].id===id)));
function rollDrops(e){
  const out=[], rows=e.tw?towerTable(e.tw,e.role,e.boss,e.elite):tableFor(e.rankI,e.role,e.boss,e.elite,SIG[e.base]);
  const more=((!e.tw&&runMod())?MOD_DROP:1)*(roomKind()==='elite'?ELITE_DROP:1)*heatK('drop')*(S.run&&S.run.rift?Math.min(RIFT_DROP_MAX,1+RIFT_DROP*S.run.rift):1);
  for(const c of dropChances(e.boss,e.elite)) if(Math.random()<c*more){ let id=pickRow(rows);
    if(ITEM[id].uq&&(ownsItem(id)||out.includes(id))) id=pickNorm(rows.filter(r=>!ITEM[r.id].uq));   // a unique you already carry becomes ordinary gear instead
    out.push(id); }
  if(e.secret) for(let i=0;i<2;i++) out.push(pick(Object.values(ITEM).filter(d=>!d.uq&&d.tier===4)).id);   // a secret master always leaves two legendaries
  return out;
}
const BAG_MAX=30, BAG_STEP=5, BAG_COST=[250,600,1500,3500];   // bag upgrades: +5 slots each, bought at the market
const bagMax=()=>BAG_MAX+BAG_STEP*((S&&S.bagLv)||0);
const KNOW_AT=25;   // kills of one enemy type needed to study its drop table in the bestiary
// ----- random bonus lines ("rolls") on gear. Each piece you find, buy or forge can carry extra stat lines; rarer tiers carry more.
// Stored on the item as ro:[[stat,value],...]. Uniques never roll; they are fixed.
const ROLL_KEYS={atk:1.2,crit:.5,siph:1.2,hp:5,mana:4,ward:1.2,strength:.5,constitution:.5,intelligence:.5,will:.5,raise:.8,mpow:1.2};   // value per point of set multiplier
const ROLL_LINES=[[1,.35],[1,.6],[2,.55],[2,.7],[3,.65]];   // per tier: [max lines, chance of each line]
const REFORGE_COST=.4;   // share of the merchant price
function rollItem(id,atLeast){
  const d=ITEM[id]; if(!d||d.uq) return null;
  const [max,ch]=ROLL_LINES[d.tier]||[0,0], m=TM[d.set], out=[];
  for(let tries=0;tries<20&&!out.length;tries++){
    for(let i=0;i<max;i++) if(Math.random()<ch){ const left=Object.keys(ROLL_KEYS).filter(k=>!out.some(r=>r[0]===k)); const k=pick(left); out.push([k,Math.max(1,Math.round(ROLL_KEYS[k]*m*rnd(.5,1)))]); }
    if(!atLeast) break;
  }
  return out.length?out:null;
}
const itStat=(it,k)=>{ const d=ITEM[it.id]; let n=(d&&d.stats[k])||0; if(it.ro) for(const r of it.ro) if(r[0]===k) n+=r[1]; return n; };
const itStats=it=>{ const o=Object.assign({},ITEM[it.id].stats); if(it.ro) for(const r of it.ro) o[r[0]]=(o[r[0]]||0)+r[1]; return o; };
const G=k=>{ let n=0; if(S&&S.equip) for(const sl in S.equip){ const it=S.equip[sl]; if(it&&ITEM[it.id]) n+=itStat(it,k); } return n+xb(k); };   // gear plus the worn title
const A=k=>S.player.stats[k]+G(k);
const sk=id=>(S&&S.player&&S.player.skills&&S.player.skills[id])||0;   // learned rank of a skill (0 = not learned)
const hasFlag=f=>!!(S&&S.equip)&&Object.values(S.equip).some(it=>it&&ITEM[it.id]&&ITEM[it.id].flag===f);

// ===== HELL TOWER =====
// A separate 100-floor climb. Each floor is one fight; every tenth floor is a warden. Enemies grow every single floor.
const TW={unlock:10,hp0:4.7,hpG:.025,atk0:3.9,atkG:.021,repeat:.06,armor:.85,foeAtk:1.4};   // armor/foeAtk: enemy-only, see DIFF.armor
const TW_MOBS=[['Imp','striker',.95,1.3],['Hellhound','striker',.95,1.3],['Chain Devil','vanguard',1.4,.9],['Pit Warden','vanguard',1.4,.9],['Soul Tender','mender',.8,.8],['Brimstone Chanter','mender',.8,.8]];
TW_MOBS.push(['Hell Legionary','vanguard',1.4,.9],['Infernal Duelist','striker',.95,1.3]);
const TW_BOSS=['The Gate Hound','Cinder Matron','The Iron Inquisitor','Lord of Flies','The Bone Cantor','Duke of Chains','The Pale Executioner','Archdevil Vael','The Hollow Seraph','Abaddon, King of Hell'];
// 12 uniques: one per warden, and the final warden drops three. They get stronger every ten floors and the last three are the strongest items in the game.
const TW_UNIQ=[
 {f:10,name:'Hound-Fang Dagger',slot:'weapon',glyph:'i_wa',stats:{atk:34,crit:15,strength:6},flag:'execute'},
 {f:20,name:"Matron's Ember Mantle",slot:'armor',glyph:'i_ab',stats:{hp:190,constitution:8,ward:22,mpow:5},flag:'thorns'},
 {f:30,name:"Inquisitor's Censer",slot:'relic',glyph:'i_censer',stats:{mana:130,intelligence:9,regen:2,will:5},flag:'censer'},
 {f:40,name:'Chitin of the Fly-Lord',slot:'armor',glyph:'i_aa',stats:{hp:260,constitution:10,mpow:18,will:7},flag:'swarmguard'},
 {f:50,name:"Cantor's Rib-Staff",slot:'weapon',glyph:'i_wb',stats:{atk:40,siph:70,intelligence:12,mana:90},flag:'chorus'},
 {f:60,name:"Chain-Duke's Collar",slot:'relic',glyph:'i_tb',stats:{mana:170,will:12,raise:18,slot:1,mpow:20},flag:'bindsouls'},
 {f:70,name:"Executioner's Axe",slot:'weapon',glyph:'i_axe',stats:{atk:78,crit:22,strength:12},flag:'cleave'},
 {f:80,name:"Vael's Hellplate",slot:'armor',glyph:'i_aa',stats:{hp:400,constitution:14,ward:40,strength:8},flag:'infernal'},
 {f:90,name:"Seraph's Broken Halo",slot:'relic',glyph:'i_halo',stats:{mana:220,intelligence:14,will:12,regen:3,raise:20},flag:'halo'},
 {f:100,name:'Crown of Ruin',slot:'relic',glyph:'i_u0',stats:{mana:300,intelligence:20,will:20,mpow:40,regen:5,slot:2,raise:25},flag:'ruin'},
 {f:100,name:'Hellmaw, the Last Blade',slot:'weapon',glyph:'i_greatsword',stats:{atk:120,crit:30,strength:20,siph:60},flag:'hellfire'},
 {f:100,name:'Mantle of the Last Sovereign',slot:'armor',glyph:'i_ab',stats:{hp:650,constitution:24,ward:70,strength:10,mpow:20},flag:'deathless'}
];
const TW_IDS={};
TW_UNIQ.forEach((u,i)=>{ const id='w'+(i+1); ITEM[id]=Object.assign({id,set:6,tier:5,uq:true,kind:'u',tower:true,floor:u.f},u); (TW_IDS[u.f]=TW_IDS[u.f]||[]).push(id); });
const twLvl=f=>6+Math.round(f*.5);                       // enemy level on floor f
const twRank=f=>Math.min(5,2+Math.floor(f/25));          // rank letter shown for tower enemies (C..S)
// Above floor 60 the climb steepens more slowly (attack at half the rate, HP at 70%): the old curve one-shot level-70 players
// on floor 90, so floor 100 was out of reach. The recommended level now also climbs faster up there, so it tells the truth.
const twHpF=f=>f<=60?f:60+(f-60)*.7, twAtkF=f=>f<=60?f:60+(f-60)*.5;
const recLv=f=>f<=60?10+Math.round(f*.5):40+Math.round((f-60)*1.2);   // level a decent player wants for floor f
function towerStats(f,lvl,hf,af,boss,elite){
  let hp=14*TW.hp0*Math.pow(1+TW.hpG,twHpF(f)-1)*hf*DIFF.hp*(1+.16*(lvl-1));
  let atk=3.2*TW.atk0*Math.pow(1+TW.atkG,twAtkF(f)-1)*af*DIFF.atk*(1+.12*(lvl-1));
  if(boss){ hp*=2.2+5.8*(f/100); atk*=1.2+.8*(f/100); if(f===100){ hp*=1.6; atk*=1.35; } }   // the last warden is on a different scale
  if(elite){ hp*=1.5; atk*=1.3; }
  return {hp:Math.round(hp),atk:Math.max(1,Math.round(atk))};
}
function makeTowerEnemy(f,boss,adj){
  const lvl=twLvl(f)+(boss?2:0)+(adj||0);
  let name,role,hf=1,af=1;
  let shown=null;
  if(boss){ name=TW_BOSS[(f/10-1)%TW_BOSS.length]; role='reaper'; if(f>100) shown='Abyssal '+name.replace(/^The /,''); } else { const t=pick(TW_MOBS); name=t[0]; role=t[1]; hf=t[2]; af=t[3]; }
  const elite=!boss&&Math.random()<eliteChance(), s=towerStats(f,lvl,hf,af,boss,elite);
  const e={id:'e'+(++S.uid),name:shown||((elite?pick(ELITE)+' ':'')+name),base:name,role,rankI:twRank(f),tw:f,lvl,hf,af,boss,elite,maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false};
  if(boss) giveAbility(e,GATE_ABIL[(f/10-1)%GATE_ABIL.length],f>=50?1:0);   // wardens borrow the gate bosses' moves; from floor 50 they use them a turn sooner
  return e;
}
function spawnTowerOne(list,f,adj){   // same rule as the gates: one mender per room at most
  let e; for(let i=0;i<40;i++){ e=makeTowerEnemy(f,false,adj); if(!(e.role==='mender'&&list.some(x=>x.role==='mender'))) break; }
  if(e.role==='mender'&&list.some(x=>x.role==='mender')){ const t=pick(TW_MOBS.filter(m=>m[1]!=='mender')); const lvl=e.lvl, s=towerStats(f,lvl,t[2],t[3],false,false); e.name=e.base=t[0]; e.role=t[1]; e.hf=t[2]; e.af=t[3]; e.maxHp=e.hp=s.hp; e.atk=s.atk; e.elite=false; }
  list.push(e);
}
const infernalWard=()=>{ S.player.shield=Math.max(S.player.shield,Math.round(pMax()*.25)); };
function spawnFloor(){
  const r=S.run, f=r.tw, boss=f%10===0, list=[];
  if(boss){ list.push(makeTowerEnemy(f,true)); const adds=f===100?4:f>=50?3:2; for(let i=0;i<adds;i++) spawnTowerOne(list,f,-1); }
  else { const n=f<30?3:f<70?3+(Math.random()<.5?1:0):4; for(let i=0;i<n;i++) spawnTowerOne(list,f,0); }
  foeScale(list,TW.foeAtk); affixAll(list);
  r.enemies=list; r.corpses=[]; r.events=[]; r.turn=1; r.fx={}; r.target=list[0].id; r.loot=[]; r.spoils=[]; r.lostLoot=[]; r.cmd={}; r.taunt=0;
  log(boss?'Floor '+f+'. The warden of this tier is waiting.':'Floor '+f+'.'); if(boss) bossSpeaks(list[0],'hi');
  if(hasFlag('infernal')) infernalWard();
}
const towerStarts=()=>{ const a=[1]; for(let k=1;k*10<=S.tower.best;k++) a.push(k*10+1); return a; };   // a checkpoint after every tenth floor, endlessly past 100
function towerBossLoot(f,r){
  if(f>100){   // the endless climb: every abyssal warden pays gold and a legendary
    const g=40*f, pool=Object.values(ITEM).filter(d=>!d.uq&&d.tier===4); r.gold=(r.gold||0)+g; r.loot.push(pick(pool).id);
    r.events.push({m:'The abyssal warden of floor '+f+' leaves '+g+' gold and a legendary behind.',c:'ok'}); return;
  }
  for(const id of TW_IDS[f]||[]){
    const first=!S.tower.got[id];
    if(first||Math.random()<TW.repeat){
      S.tower.got[id]=true;
      if(!first&&ownsItem(id)){ const g=30*f; r.gold=(r.gold||0)+g; r.events.push({m:'The warden drops another '+ITEM[id].name+', but you already carry one. You melt it down for '+g+' gold.',c:'ok'}); continue; }
      const it=addItem(id); if(it) r.spoils.push(it.u);
      r.events.push({m:(first?'First conquest of floor '+f+': ':'The warden drops another: ')+ITEM[id].name+'.',c:'ok'});
    }
  }
}
// tower loot: tier mix slides from rare-heavy (floor 1) to legendary (floor 100). Bosses and elites lean one step higher.
function towerTable(f,role,boss,elite){
  const key='T|'+[f,role,boss?1:0,elite?1:0].join('|'); if(tcache[key]) return tcache[key];
  const g=Math.min(5,2+f*.03), lo=Math.floor(g), hi=Math.min(5,lo+1), a=g-lo;
  const base=TIER_W[lo].map((w,t)=>w*(1-a)+TIER_W[hi][t]*a);
  const nx=TIER_W[hi];
  const tw=base.map((w,t)=>(boss||elite)?(w*2+nx[t])/3:w);
  const bias=ROLE_BIAS[role]||{}, rows=[];
  for(let t=0;t<5;t++){
    if(!tw[t]) continue;
    const el=Object.values(ITEM).filter(d=>!d.uq&&d.tier===t);
    const raw=el.map(d=>(bias[d.slot]||1)*(d.set===lo?3:1)), sum=raw.reduce((x,y)=>x+y,0);
    el.forEach((d,i)=>rows.push({id:d.id,p:tw[t]*raw[i]/sum/100}));
  }
  return tcache[key]=rows;
}
const pierceMul=p=>(hasFlag('ruin')?1.25:1)*(1+xb('dmgp')/100)*(S&&S.run&&S.run.bless?1.15:1)*(1-foeArmor()*(1-p));   // p = share of foe armor ignored (some skills pierce); bless = the blood shrine event, +15%
const dmgMul=()=>pierceMul(0);   // every hit you and your minions land goes through this
const enrage=e=>(e.tw&&e.boss)?1+Math.max(0,S.run.turn-8)*(e.tw===100?.12:.07):1;   // tower wardens hit harder every turn after turn 8

// ===== DIFFICULTY (tune here) =====
// gate[1] 1.5->1.65 and gate[5] 2.3->2.45 after the skill system (tests/balance-test.js): skill users now match the old no-skill death rates.
// gate[0] .85->.68 and armor[1] .78->.74 in the early-game pass: a new player died in ~1 of 5 Rat Warren runs and a third of Sunken Crypt runs.
const DIFF={hp:2.2,atk:2.0,gate:[0.68,1.65,2.2,1.9,1.7,2.45],xpBase:64,xpExp:1.85,heal:.15,mana:.25,mheal:.2,deathXp:.15};
// Level at which a decent player wins most runs at each gate (measured with a test bot). Used for the Recommended and danger labels.
const SAFE=[1,6,10,15,19,25];   // A and S were 22/28, which the XP from B could not reach (players stalled near level 20); they were balanced at 19/25
// Foe armor: the share of damage living foes shrug off, per gate (TW.armor in the Tower). It makes fights last more turns without
// inflating any numbers, and the extra turns are what make a room dangerous. Minions use the same stat formula as enemies, so
// DIFF.hp/atk and DIFF.gate move both sides; armor and foeAtk affect living foes only. Tuned with tests/balance-test.js.
// Target: a bot that learns skills, entering each gate at its Recommended level, clears ~80% of runs (A and S were tuned entering 3 levels early,
// because the XP curve stalls the fair bot near level 20). The no-skill bot dies noticeably more often.
DIFF.armor=[0.30,0.74,0.88,0.85,0.89,0.85]; DIFF.foeAtk=[1,1.1,1.0,2.1,1.38,0.8];   // retuned after boss abilities, altar, salts, and minion traits/evolution (D, A, S raised); xpBase 70->64 keeps the leveling pace (S first cleared ~day 64)   A 1.5->1.38 after status effects (bleeding from its strikers)   D 1.2->1.1 and C 1.2->1.0: the bots cleared C 69% (market) and D 71% (full), now about 80% and 76%
// Farming far below you on Normal pays less: kill XP, kill gold and the clear bonus are full up to FARM_FROM levels past a gate's SAFE level,
// then ramp down to FARM_MIN at FARM_TO and beyond. Hard and up, cursed gates, a gate's first clear, drops, the Tower, the Rift, raids, bounties and quests pay in full.
DIFF.farmFrom=8; DIFF.farmTo=20; DIFF.farmMin=.5;
const farmK=(di,lvl)=>{ const t=clamp(((lvl-SAFE[di])-DIFF.farmFrom)/(DIFF.farmTo-DIFF.farmFrom),0,1); return 1-(1-DIFF.farmMin)*t; };
const NGP_FOE=.3, NGP_REWARD=.25, ngpFoe=()=>1+NGP_FOE*((S&&S.ngp)||0), ngpReward=()=>1+NGP_REWARD*((S&&S.ngp)||0);   // New Game+: tougher foes, richer rewards
function foeScale(list,a){ const n=ngpFoe(); for(const e of list){ if(n!==1){ e.maxHp=e.hp=Math.round(e.maxHp*n); } if(a*n!==1) e.atk=Math.max(1,Math.round(e.atk*a*n)); } }
const foeArmor=()=>S.run?(S.run.tw?TW.armor:DIFF.armor[S.run.di]):0;
let S = null;
const rnd = (a,b)=>a+Math.random()*(b-a);
const pick = a=>a[Math.floor(Math.random()*a.length)];
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const need = l=>Math.round(DIFF.xpBase*Math.pow(l,DIFF.xpExp));
const mneed = l=>Math.round(36*Math.pow(l,1.6));

// ----- player-derived stats
const pMax = ()=>Math.round((24+A('constitution')*6+S.player.lvl*4+G('hp'))*(S.player.debuff?1-QUEST_DEBUFF:1)*(1+.06*sk('bonearmor')+(hasMod('bonearmor','a')?.06:0))*(1+xb('hpp')/100));
const pMana = ()=>Math.round((20+A('intelligence')*5+A('will')*3+G('mana'))*(1+xb('manap')/100)*(1+.05*bl('altar')));
const pAtk = ()=>Math.round(3+A('strength')*1.5+S.player.lvl+G('atk'));
const pSiph = ()=>Math.round(6+A('intelligence')*2+S.player.lvl+G('siph'));
const pWard = ()=>Math.round((10+A('intelligence')*2+S.player.lvl*1.5+G('ward'))*(hasMod('bonearmor','b')?1.3:1));
const ARMY_CAP=12;
const slots = ()=>Math.min(ARMY_CAP+bl('crypt'),1+Math.floor(A('will')*2/5)+Math.floor(S.player.lvl/4)+G('slot')+bl('crypt'));   // one per 2.5 Will and one per 4 levels
const pRankI = ()=>{const l=S.player.lvl;return l<4?0:l<8?1:l<12?2:l<17?3:l<23?4:5};

function mobStats(rankI,lvl,hf,af,boss,elite){
  const R=RK[rankI];
  let hp=14*R.hp*hf*DIFF.hp*DIFF.gate[rankI]*(1+.16*(lvl-1));
  let atk=3.2*R.atk*af*DIFF.atk*DIFF.gate[rankI]*(1+.12*(lvl-1));
  if(boss){hp*=3.2;atk*=1.4}
  if(elite){hp*=1.5;atk*=1.3}
  return {hp:Math.round(hp), atk:Math.max(1,Math.round(atk))};
}
// What an item is worth to a minion: weapons and offence become attack, armour and vitality become health.
function gearBonus(m){
  const o={atk:0,hp:0,mpow:0}; if(!m.eq) return o;
  for(const sl of GEAR_SLOTS){ const it=m.eq[sl]; if(!it||!ITEM[it.id]) continue; const t=itStats(it);
    o.atk+=(t.atk||0)+2*(t.strength||0)+.5*(t.crit||0)+.4*(t.siph||0)+.5*(t.intelligence||0);
    o.hp+=(t.hp||0)+8*(t.constitution||0)+2.5*(t.ward||0)+.25*(t.mana||0)+4*(t.will||0);
    o.mpow+=(t.mpow||0); }
  o.atk=Math.round(o.atk); o.hp=Math.round(o.hp); return o;
}
function syncMinion(m){
  const s=m.tw?towerStats(m.tw,m.lvl,m.hf,m.af,m.boss,m.elite):mobStats(m.rankI,m.lvl,m.hf,m.af,m.boss,m.elite);
  const gg=gearBonus(m);
  const b=(1+.02*A('will'))*(1+(G('mpow')+gg.mpow+6*sk('gravepact')+(hasMod('gravepact','a')?6:0))/100);
  const nh=Math.round((s.hp*b*stageMul(m,'hp')+gg.hp)*(hasTrait(m,'thick')?1.25:1)), na=Math.round((s.atk*b*stageMul(m,'atk')+gg.atk)*(hasTrait(m,'vicious')?1.2:1));
  if(m.maxHp!=null && nh>m.maxHp) m.hp+=nh-m.maxHp;
  m.maxHp=nh; m.atk=na; m.hp=Math.min(m.hp,m.maxHp);
}
const syncArmy = ()=>S.army.forEach(syncMinion);

const MOMENTS=[];   // banners for big moments; render() shows them once, then clears them
function moment(t,c){ MOMENTS.push({t,c:c||'ok'}); if(MOMENTS.length>3) MOMENTS.shift(); }
function notify(m,c){ S.notices.unshift({m,c:c||'info'}); S.notices.length=Math.min(S.notices.length,6); }

// ----- game lifecycle
function freshState(){
  return {v:2,day:1,watches:WATCHES,uid:0,mode:'town',run:null,notices:[],runs:0,kills:{},tower:{best:0,got:{}},inv:[],equip:{weapon:null,armor:null,relic:null},
     player:{id:'p',name:'You',lvl:1,xp:0,pts:3,hp:0,mana:0,shield:0,debuff:false,stats:{strength:4,constitution:4,intelligence:4,will:4},sp:0,skills:{},skMod:{}},
     army:[],quest:{kills:0,rooms:0,clears:0,claimed:false},gold:0,trophies:{},belt:{hp:0,mp:0},shop:null,bagLv:0,salts:0,tips:{},ngp:0,
     mod:null,hist:[],story:{},life:Object.fromEntries(LIFE_KEYS.map(k=>[k,0])),build:{},dust:0,bounty:null,heat:{},heatMax:{},raids:[],raidLog:[],rift:{best:0}};
}
const OPEN_HELP={on:false};   // a brand-new game opens on How to play
function newGame(){
  S=freshState(); OPEN_HELP.on=true;
  S.player.hp=pMax(); S.player.mana=pMana();
  notify('The Ledger is open. Spend your 3 points, then enter the Rat Warren. Raise what you kill.'); unlockStory('intro');
}
// New Game+: after clearing the Throne of Ash, start over at level 1 keeping titles, bestiary, tips and one unique.
const canNGP=()=>!!(S.ti&&S.ti.clr&&S.ti.clr[5]);
const ownedUniques=()=>[...new Set(S.inv.concat(Object.values(S.equip)).filter(it=>it&&ITEM[it.id]&&ITEM[it.id].uq).map(it=>it.id))];
function startNGP(carry){
  if(S.mode!=='town'||!canNGP()) return false;
  const own=ownedUniques(), keep={ti:S.ti,kills:S.kills,tips:S.tips,life:S.life,story:S.story||{},rec:S.rec||{},pages:S.pages||0,rift:S.rift||{best:0},ngp:(S.ngp||0)+1};   // lifetime totals carry over too
  newGame(); Object.assign(S,keep); S.ti.clr={};   // titles stay earned; New Game+ again needs another Throne of Ash clear
  S.notices=[]; if(carry&&own.includes(carry)) addItem(carry,null); unlockStory('ngp');
  notify('New Game+ '+S.ngp+' begins. Foes have '+Math.round(NGP_FOE*S.ngp*100)+'% more HP and attack, and pay '+Math.round(NGP_REWARD*S.ngp*100)+'% more XP and gold.'+(carry&&own.includes(carry)?' '+ITEM[carry].name+' is in your bag.':''),'ok');
  return true;
}
// What goes to disk. Outside town it is the state you would have after walking out of the gate now, so closing the tab
// mid-run counts as leaving: the watch stays spent, cleared rooms' XP and loot are kept, and a defeat's penalty sticks.
function snapshot(){
  if(S.mode==='town') return S;
  const c=JSON.parse(JSON.stringify(S));
  if(S.run) recordRun(c,S.run,runResult(S.run));
  c.mode='town'; c.run=null; c.player.hp=pMax(); c.player.mana=pMana(); c.player.shield=0; delete c.player.dots; c.army.forEach(m=>{ m.hp=m.maxHp; delete m.dots; });
  return c;
}
// TAB guards against two open tabs overwriting each other: when another tab saves, this one stops saving until you reload.
const TAB={blocked:false,last:null,out:null,bakDay:null};
function save(){ if(TAB.blocked) return; try{ const t=S.savedAt; S.savedAt=0; const j=JSON.stringify(snapshot()); if(j===TAB.last&&localStorage.getItem(SAVE_KEY)===TAB.out){ S.savedAt=t; return; }   // nothing changed and the save is still there: no write
  S.savedAt=Date.now(); const out=JSON.stringify(snapshot()); localStorage.setItem(SAVE_KEY,out); TAB.last=j; TAB.out=out; dayBackup(out); }catch(e){} }
// Earlier autosaves: the first save of each new day also goes into a ring of three (newest first), restorable from Settings.
const BAK_N=3, bakKey=i=>SAVE_KEY+'-bak'+i;
function bakRead(i){ try{ const r=localStorage.getItem(bakKey(i)); if(!r) return null; const g=JSON.parse(r); return g&&validSave(g.data)?g:null; }catch(e){ return null; } }
function dayBackup(out){
  if(S.mode!=='town') return; if(TAB.bakDay==null){ const b=bakRead(1); TAB.bakDay=b?b.day:-1; } if(TAB.bakDay===S.day) return;
  try{ for(let i=BAK_N;i>1;i--){ const r=localStorage.getItem(bakKey(i-1)); if(r) localStorage.setItem(bakKey(i),r); }
    localStorage.setItem(bakKey(1),JSON.stringify({t:Date.now(),day:S.day,data:JSON.parse(out)})); TAB.bakDay=S.day; }catch(e){}
}
function bakLoad(i){ const g=bakRead(i); return g?adoptSave(g.data):false; }
// ----- save slots and save codes
const SLOTS_N=3, CODE_TAG='LOTD1:';
const slotKey=i=>SAVE_KEY+'-slot'+i;
// Repair a save into the current shape, or return null if it cannot be a save. Works on a copy; never touches S.
// Migrates v1 saves (Might/Vigor/Intellect) and fills in anything missing, so older or damaged saves still load.
function normalizeSave(src){
  if(!src||typeof src!=='object'||!src.player||typeof src.player!=='object') return null;
  let g; try{ g=JSON.parse(JSON.stringify(src)); }catch(e){ return null; }
  if(g.v===1){ const st=g.player.stats||{}, ren={might:'strength',vigor:'constitution',intellect:'intelligence'};
    for(const o in ren) if(o in st){ st[ren[o]]=st[o]; delete st[o]; } g.player.stats=st; g.v=2; }
  if(g.v!==2||typeof g.player.lvl!=='number'||!(g.player.lvl>=1)) return null;
  const d=freshState(), num=(v,def)=>typeof v==='number'&&isFinite(v)?v:def, obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const hadSp=typeof g.player.sp==='number';   // saves from before skills get one point per level already reached
  const P=g.player=Object.assign({},d.player,g.player);
  P.stats=Object.assign({},d.player.stats,obj(P.stats)?P.stats:{}); for(const k in d.player.stats) P.stats[k]=num(P.stats[k],d.player.stats[k]);
  P.lvl=Math.floor(P.lvl); P.xp=num(P.xp,0); P.pts=num(P.pts,0); P.hp=num(P.hp,0); P.mana=num(P.mana,0); P.shield=0;
  P.skills=obj(P.skills)?P.skills:{}; for(const k in P.skills) if(!SKILL[k]||typeof P.skills[k]!=='number') delete P.skills[k];
  P.sp=hadSp?num(P.sp,0):Math.max(0,P.lvl-1);
  if('ult' in P&&!ULTS[P.ult]) delete P.ult;
  const sm=obj(P.skMod)?P.skMod:{}; P.skMod={}; for(const k in sm) if(SKILL_MODS[k]&&(sm[k]==='a'||sm[k]==='b')&&P.skills[k]>=SK_MAX) P.skMod[k]=sm[k];
  g.day=Math.max(1,num(g.day,1)); g.watches=clamp(num(g.watches,WATCHES),0,WATCHES); g.runs=num(g.runs,0);
  for(const k of ['notices','inv','army']) if(!Array.isArray(g[k])) g[k]=[];
  for(const k of ['kills','tower','equip','quest']) if(!obj(g[k])) g[k]=d[k];
  g.quest=Object.assign({},d.quest,g.quest); if('raises' in g.quest){ delete g.quest.raises; }   // the old "raise the dead" goal became "clear rooms"
  g.tower={best:num(g.tower.best,0),got:obj(g.tower.got)?g.tower.got:{}};
  const okItem=it=>!!(it&&ITEM[it.id]&&typeof it.u==='number');
  g.inv=g.inv.filter(okItem);
  for(const sl of GEAR_SLOTS) if(!okItem(g.equip[sl])) g.equip[sl]=null;
  const RA=Array.isArray(g.raids)?g.raids.filter(x=>obj(x)&&RK[x.di]&&Array.isArray(x.units)):[];   // squads out raiding: repaired with the army, then split back out
  RA.forEach((x,i)=>x.units.forEach(m=>{ if(obj(m)){ m._raid=i; g.army.push(m); } }));
  g.army=g.army.filter(m=>m&&typeof m==='object'&&ROLES[m.role]&&typeof m.lvl==='number'&&(m.tw||RK[m.rankI]));
  for(const m of g.army){ m.hf=num(m.hf,1); m.af=num(m.af,1); m.xp=num(m.xp,0); m.hp=num(m.hp,1); m.nick=cleanNick(m.nick)||'Nameless'; if('fused' in m) m.fused=clamp(Math.floor(num(+m.fused,0)),0,FUSE_MAX); m.kind=m.kind||m.name;
    m.traits=Array.isArray(m.traits)?m.traits.filter(t=>TRAITS[t]&&(t!=='commander'||canLead(m))):[]; m.stage=clamp(Math.floor(num(m.stage,0)),0,STAGE_MAX); m.lvl0=num(m.lvl0,m.lvl);   // minions from before traits keep no trait
    if(m.armed){ m.eq=obj(m.eq)?m.eq:{}; for(const sl of GEAR_SLOTS) if(!okItem(m.eq[sl])) m.eq[sl]=null; } }
  let top=num(g.uid,0);   // next id must stay above every id in use, or two items/minions would share one
  g.inv.concat(Object.values(g.equip),...g.army.map(m=>m.eq?Object.values(m.eq):[])).forEach(it=>{ if(it) top=Math.max(top,it.u); });
  g.army.forEach(m=>{ top=Math.max(top,num(m.uid,0)); }); g.army.forEach(m=>{ if(typeof m.uid!=='number') m.uid=++top; });
  g.raids=RA.map((x,i)=>({di:x.di,day:Math.floor(num(x.day,g.day)),units:g.army.filter(m=>m._raid===i)})).filter(x=>x.units.length);
  g.army=g.army.filter(m=>m._raid==null); g.raids.forEach(x=>x.units.forEach(m=>{ delete m._raid; }));
  g.raidLog=Array.isArray(g.raidLog)?g.raidLog.filter(x=>obj(x)&&RK[x.di]&&typeof x.nick==='string').slice(0,RAID_LOG).map(x=>({day:Math.floor(num(x.day,1)),di:x.di,won:!!x.won,nick:cleanNick(x.nick)||'Nameless',lost:Math.max(0,Math.floor(num(x.lost,0)))})):[];
  g.rift=obj(g.rift)?{best:Math.max(0,Math.floor(num(g.rift.best,0)))}:{best:0};
  g.uid=top; g.mode='town'; g.run=null;
  g.gold=Math.max(0,Math.floor(num(g.gold,0)));
  const tr={}; if(obj(g.trophies)) for(const k in g.trophies){ const n=Math.floor(num(g.trophies[k],0)); if(TROPHY[k]&&n>0) tr[k]=n; } g.trophies=tr;
  const b=obj(g.belt)?g.belt:{}; g.belt={hp:clamp(Math.floor(num(b.hp,0)),0,BELT_MAX),mp:clamp(Math.floor(num(b.mp,0)),0,BELT_MAX)};
  g.tips=obj(g.tips)?g.tips:{}; g.ngp=Math.max(0,Math.floor(num(g.ngp,0)));
  g.bagLv=clamp(Math.floor(num(g.bagLv,0)),0,BAG_COST.length); g.salts=clamp(Math.floor(num(g.salts,0)),0,SALT_MAX);
  g.shop=(obj(g.shop)&&typeof g.shop.day==='number'&&Array.isArray(g.shop.stock)&&g.shop.stock.every(s=>s&&ITEM[s.id]))?g.shop:null;
  const fixRo=it=>{ if(!it) return; if(Array.isArray(it.ro)) it.ro=it.ro.filter(r=>Array.isArray(r)&&ROLL_KEYS[r[0]]&&typeof r[1]==='number'&&isFinite(r[1])&&r[1]>0).slice(0,3).map(r=>[r[0],Math.round(r[1])]);
    if(!Array.isArray(it.ro)||!it.ro.length||ITEM[it.id].uq) delete it.ro; if(it.lk!==true) delete it.lk; };
  g.inv.concat(Object.values(g.equip),...g.army.map(m=>m.eq?Object.values(m.eq):[]),g.shop?g.shop.stock:[]).forEach(fixRo);
  delete P.dots; g.army.forEach(m=>{ delete m.dots; });   // status effects only live inside a fight
  g.mod=(obj(g.mod)&&typeof g.mod.day==='number'&&typeof g.mod.gi==='number'&&(g.mod.gi<0||(MODS[g.mod.id]&&RK[g.mod.gi])))?{day:g.mod.day,gi:g.mod.gi,id:g.mod.gi<0?null:g.mod.id}:null;
  const so=obj(g.story)?g.story:{}; g.story={}; for(const k in so) if(STORY_BY[k]&&typeof so[k]==='number') g.story[k]=so[k];
  g.hist=Array.isArray(g.hist)?g.hist.filter(h=>obj(h)&&typeof h.d==='number'&&typeof h.res==='string').slice(-HIST_N):[];
  g.hist.forEach(h=>{ if('sec' in h&&secretOf(h.sec)<0) delete h.sec; if('heat' in h&&!HEAT[h.heat]) delete h.heat; });
  const L=obj(g.life)?g.life:{}; g.life={}; for(const k of LIFE_KEYS) g.life[k]=Math.max(0,num(L[k],0));
  if(!obj(g.build)) g.build={}; for(const k of Object.keys(g.build)){ const v=g.build[k]; if(!BUILD[k]||typeof v!=='number'||!(v>=1)) delete g.build[k]; else g.build[k]=Math.min(BUILD_MAX,Math.floor(v)); }
  g.dust=Math.max(0,Math.floor(num(g.dust,0)));
  if(g.faith!==undefined&&!(obj(g.faith)&&FAITH[g.faith.id]&&typeof g.faith.day==='number')) delete g.faith;
  if(g.rec!==undefined){ if(!obj(g.rec)) delete g.rec; else { const R0=g.rec, okv=o=>obj(o)&&typeof o.v==='number'&&o.v>0&&typeof o.day==='number';
    for(const k of ['hit','kills','gold','floor']) if(k in R0&&!okv(R0[k])) delete R0[k];
    if('fast' in R0){ if(!obj(R0.fast)) delete R0.fast; else for(const di of Object.keys(R0.fast)){ const o=R0.fast[di]; if(!RK[di]||!obj(o)||!(o.t>0)||typeof o.day!=='number') delete R0.fast[di]; } }
    if('sec' in R0){ if(!obj(R0.sec)) delete R0.sec; else for(const i of Object.keys(R0.sec)) if(!SECRET[i]||typeof R0.sec[i]!=='number') delete R0.sec[i]; }
    for(const k of Object.keys(R0)) if(!['hit','kills','gold','floor','fast','sec'].includes(k)) delete R0[k]; } }
  if(g.pages!==undefined) g.pages=Math.max(0,Math.min(LORE_PAGES.length,Math.floor(num(g.pages,0))));
  if(g.omen!==undefined&&!(obj(g.omen)&&typeof g.omen.day==='number'&&(g.omen.id===null||OMENS[g.omen.id]))) delete g.omen;
  if(g.sbPity!==undefined){ if(!obj(g.sbPity)) delete g.sbPity; else for(const di of Object.keys(g.sbPity)){ const v=g.sbPity[di]; if(!RK[di]||typeof v!=='number'||!(v>=0)) delete g.sbPity[di]; else g.sbPity[di]=Math.min(1000,Math.floor(v)); } }
  for(const k of ['heat','heatMax']){ if(!obj(g[k])) g[k]={}; for(const di of Object.keys(g[k])){ const v=g[k][di]; if(!RK[di]||typeof v!=='number'||!(v>=0)) delete g[k][di]; else g[k][di]=Math.min(HEAT.length-1,Math.floor(v)); } }
  const okB=b=>obj(b)&&BOUNTIES[b.id]&&typeof b.n==='number'&&typeof b.base==='number'&&obj(b.rw)&&typeof b.claimed==='boolean';
  g.bounty=(obj(g.bounty)&&typeof g.bounty.day==='number'&&Array.isArray(g.bounty.list)&&g.bounty.list.every(okB))?g.bounty:null;
  return g;
}
function validSave(g){ return !!normalizeSave(g); }
// Make a repaired save the live game. Throws if something is still wrong; callers restore the previous game.
function applyLoaded(g){
  S=g; syncArmy();
  const P=S.player; P.hp=P.hp>0?Math.min(P.hp,pMax()):pMax(); P.mana=clamp(P.mana,0,pMana());
  S.army.forEach(m=>{ m.hp=clamp(m.hp,1,m.maxHp); });
  if(!isFinite(pMax())||S.army.some(m=>!isFinite(m.maxHp)||!isFinite(m.atk))) throw new Error('bad numbers');
  if(S.watches<=0) endDay();   // closed the tab after spending the last watch: the day ends as it would on leaving
}
function slotRead(i){ try{ const r=localStorage.getItem(slotKey(i)); if(!r) return null; const g=JSON.parse(r); return validSave(g.data)?g:null; }catch(e){ return null; } }
function slotWrite(i){ if(S.mode!=='town') return false; try{ S.savedAt=Date.now(); localStorage.setItem(slotKey(i),JSON.stringify({t:Date.now(),data:S})); return true; }catch(e){ return false; } }
function slotDelete(i){ try{ localStorage.removeItem(slotKey(i)); }catch(e){} }
function adoptSave(g){   // load a slot or code; on any problem the current game is left exactly as it was
  const n=normalizeSave(g); if(!n) return false;
  const prev=S;
  try{ applyLoaded(n); }catch(e){ S=prev; return false; }
  save(); return true;
}
function slotLoad(i){ const g=slotRead(i); return g?adoptSave(g.data):false; }
function exportCode(){ try{ return CODE_TAG+btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }catch(e){ return ''; } }
function importCode(txt){
  try{ txt=(txt||'').replace(/\s+/g,''); if(txt.indexOf(CODE_TAG)!==0) return false;
    const g=JSON.parse(decodeURIComponent(escape(atob(txt.slice(CODE_TAG.length))))); return adoptSave(g);
  }catch(e){ return false; }
}
function storageOk(){ try{ localStorage.setItem('lotd-test','1'); localStorage.removeItem('lotd-test'); return true; }catch(e){ return false; } }
function loadGame(){
  let raw=null;
  try{ raw=localStorage.getItem(SAVE_KEY); }catch(e){}
  if(raw){
    try{ const g=normalizeSave(JSON.parse(raw)); if(g){ applyLoaded(g); return; } }catch(e){}
    try{ localStorage.setItem(SAVE_KEY+'-broken',raw); }catch(e){}   // never throw an unreadable save away
  }
  newGame();
  if(raw) notify('Your saved game could not be read, so a new one was started. The old data was kept in this browser under "'+SAVE_KEY+'-broken".','bad');
}

// ===== TITLES =====
// Earned once, kept forever, worn under your name. Purely cosmetic.
const GATE_TITLES=['Ratcatcher','Tidekeeper','Ashwalker','Choirbreaker','Orchard Reaper','Heir of the Ash Throne'];
const TW_TITLES=['Houndbreaker','Ember-Quencher','Heretic Unburnt','Swarmbane','Silencer of Hymns','The Unchained','Axe-Unbowed','Archdevil-Slayer','Halo-Breaker','King of Hell'];
const TITLES=[];
DUNGEONS.forEach((D,i)=>TITLES.push({id:'g'+i,grp:'Gates',name:GATE_TITLES[i],req:'Clear the '+D.name+' ('+RANKS[i]+'-rank gate).',ok:()=>!!S.ti.clr[i]}));
TW_TITLES.forEach((n,i)=>{ const f=(i+1)*10; TITLES.push({id:'t'+f,grp:'Hell Tower',name:n,req:'Defeat '+TW_BOSS[i]+' on floor '+f+'.',ok:()=>S.tower.best>=f}); });
[
 ['d_raise1','First Whisper','Raise your first minion.',()=>S.ti.raised>=1],
 ['d_raise50','Gravecaller','Raise 50 minions.',()=>S.ti.raised>=50],
 ['d_raise200','Voice of the Legion','Raise 200 minions.',()=>S.ti.raised>=200],
 ['d_army','Warlord of the Dead','Fill every slot in your army.',()=>S.army.length>0&&armyUsed()>=slots()],
 ['d_kill100','Reaper\'s Apprentice','Defeat 100 enemies.',()=>totalKills()>=100],
 ['d_kill1000','Harvester','Defeat 1,000 enemies.',()=>totalKills()>=1000],
 ['d_kill5000','Plague of Graves','Defeat 5,000 enemies.',()=>totalKills()>=5000],
 ['d_lv10','Initiate of the Ledger','Reach level 10.',()=>S.player.lvl>=10],
 ['d_lv25','Gravewalker Adept','Reach level 25.',()=>S.player.lvl>=25],
 ['d_lv50','Lord of Graves','Reach level 50.',()=>S.player.lvl>=50],
 ['d_uq','Touched by Legend','Hold a unique item.',()=>S.ti.hasUq],
 ['d_tuq','Relic-Lord of Hell','Claim all 12 Hell Tower uniques.',()=>TW_UNIQ.every((u,i)=>S.tower.got['w'+(i+1)])],
 ['d_study','Student of the Dead','Study an enemy (25 kills) and learn its drops.',()=>Object.keys(S.kills).some(k=>S.kills[k]>=KNOW_AT)],
 ['d_all','Keeper of the Ledger','Study every enemy in the gates and the Tower (the wardens excepted).',()=>allNames().filter(n=>!TW_BOSS.includes(n)).every(n=>(S.kills[n]||0)>=KNOW_AT)],
 ['d_death','Rises Again','Be dragged out of a dungeon after falling.',()=>S.ti.deaths>=1],
 ['d_death10','Stubborn Corpse','Fall 10 times.',()=>S.ti.deaths>=10],
 ['d_quest7','Dutiful Scribe','Claim the daily quest reward 7 times.',()=>S.ti.claims>=7],
 ['d_armed1','Quartermaster','Raise a gear-bearing enemy.',()=>S.ti.armed>=1],
 ['d_armed3','Arms Master','Fully equip a gear-bearer with weapon, armor and relic.',()=>S.ti.fullGear],
 ['d_tower1','Tower-Touched','Enter the Hell Tower and clear a floor.',()=>S.tower.best>=1],
 ['d_tower50','Halfway Damned','Reach floor 50 of the Hell Tower.',()=>S.tower.best>=50],
 ['d_cancel','Frost-Tongue','Cancel a boss\'s telegraphed move by freezing it.',()=>S.ti.cancels>=1],
 ['d_cancel10','Breaker of Oaths','Cancel 10 boss moves.',()=>S.ti.cancels>=10],
 ['d_master','Masterwright','Forge a masterwork at the trophy forge.',()=>S.ti.master>=1],
 ['d_trophy500','Bone Merchant','Sell 500 trophies.',()=>S.ti.soldTro>=500],
 ['d_gold','Hoarder of Graves','Hold 5,000 gold at once.',()=>S.gold>=5000],
 ['d_bag','Bottomless Satchel','Upgrade your bag to its largest size.',()=>(S.bagLv||0)>=BAG_COST.length],
 ['d_altar','Altar-Blessed','Empower minions at the Bone Altar 25 times.',()=>S.ti.emp>=25],
 ['d_evolve','Shaper of Flesh','Evolve a minion.',()=>S.ti.evolved>=1],
 ['d_elder','Keeper of Elders','Evolve a minion into its Elder form.',()=>S.ti.elder>=1],
 ['d_tower110','Beyond the Throne','Reach floor 110 of the Hell Tower.',()=>S.tower.best>=110],
 ['d_tower150','Abyss-Walker','Reach floor 150 of the Hell Tower.',()=>S.tower.best>=150],
 ['d_ngp','Twice-Risen','Begin a New Game+.',()=>(S.ngp||0)>=1],
 ['d_ngp3','The Undying Ledger','Begin New Game+ 3.',()=>(S.ngp||0)>=3],
].forEach(a=>TITLES.push({id:a[0],grp:'Deeds',name:a[1],req:a[2],ok:a[3]}));
// 50 more titles: mastery of each gate, curses and events, skills, combat, trade, the army and endurance.
const T_=k=>(S.ti&&S.ti[k])||0, L_=k=>(S.life&&S.life[k])||0;
const roll3=()=>S.inv.concat(Object.values(S.equip)).some(it=>it&&ITEM[it.id]&&!ITEM[it.id].uq&&ITEM[it.id].tier===4&&it.ro&&it.ro.length>=3);
[
 ['m0','Gates','Warren-Born','Clear the Rat Warren 10 times.',()=>T_('clrN0')>=10,{constitution:1}],
 ['m1','Gates','Crypt-Keeper','Clear the Sunken Crypt 10 times.',()=>T_('clrN1')>=10,{intelligence:2}],
 ['m2','Gates','Ember-Tongued','Clear the Ashen Barrow 12 times.',()=>T_('clrN2')>=12,{strength:2}],
 ['m3','Gates','Cantor of Bones','Clear the Hollow Cathedral 12 times.',()=>T_('clrN3')>=12,{will:2}],
 ['m4','Gates','Orchard-Walker','Clear the Iron Orchard 15 times.',()=>T_('clrN4')>=15,{hpp:4}],
 ['m5','Gates','Throne-Breaker','Clear the Throne of Ash 25 times.',()=>T_('clrN5')>=25,{dmgp:4}],
 ['hd1','Gates','Hard-Won','Clear any gate on Hard.',()=>T_('heat1')>0,{xpp:2}],
 ['hd2','Gates','Unbowed','Clear any gate on Brutal.',()=>T_('heat2')>0,{drp:2}],
 ['nm0','Gates','Nightmare of the Warren','Clear the Rat Warren on Nightmare.',()=>T_('nm0')>0,{goldp:3}],
 ['nm1','Gates','Nightmare of the Crypt','Clear the Sunken Crypt on Nightmare.',()=>T_('nm1')>0,{manap:3}],
 ['nm2','Gates','Nightmare of the Barrow','Clear the Ashen Barrow on Nightmare.',()=>T_('nm2')>0,{hpp:2}],
 ['nm3','Gates','Nightmare of the Cathedral','Clear the Hollow Cathedral on Nightmare.',()=>T_('nm3')>0,{mpow:3}],
 ['nm4','Gates','Nightmare of the Orchard','Clear the Iron Orchard on Nightmare.',()=>T_('nm4')>0,{dmgp:2}],
 ['nm5','Gates','Nightmare Sovereign','Clear the Throne of Ash on Nightmare.',()=>T_('nm5')>0,{dmgp:2,hpp:2}],
 ['dm3','Gates','The Damned','Clear a cursed gate on Nightmare.',()=>T_('damned3')>0,{xpp:3,goldp:3}],
 ['sb0','Gates','Plague-Ender','Slay the Plague Matriarch, the Rat Warren\'s secret master.',()=>T_('secret_0')>0,{xpp:3}],
 ['sb1','Gates','Tide-Breaker','Slay the Drowned Abbot, the Sunken Crypt\'s secret master.',()=>T_('secret_1')>0,{manap:3}],
 ['sb2','Gates','Wyrmsbane','Slay the Cinder Wyrm, the Ashen Barrow\'s secret master.',()=>T_('secret_2')>0,{dmgp:2}],
 ['sb3','Gates','Last Note','Slay the Choir Eternal, the Hollow Cathedral\'s secret master.',()=>T_('secret_3')>0,{mpow:3}],
 ['sb4','Gates','Root-Burner','Slay the Rootking, the Iron Orchard\'s secret master.',()=>T_('secret_4')>0,{hpp:2}],
 ['sb5','Gates','The Named','Slay the Nameless Sovereign, the Throne of Ash\'s secret master.',()=>T_('secret_5')>0,{dmgp:3,drp:2}],
 ['tw75','Hell Tower','Ash-Climber','Reach floor 75 of the Hell Tower.',()=>S.tower.best>=75,{hpp:4}],
 ['tw200','Hell Tower','Lord of the Abyss','Reach floor 200 of the Hell Tower.',()=>S.tower.best>=200,{dmgp:8}],
 ['twruns','Hell Tower','Tower Regular','Climb the Hell Tower 50 times.',()=>T_('twRuns')>=50,{ward:5}],
 ['c_volatile','Curses and events','Ember-Proof','Clear a gate cursed with Volatile dead.',()=>T_('cur_volatile')>=1,{drp:2}],
 ['c_drought','Curses and events','Dry-Souled','Clear a gate cursed with Drought.',()=>T_('cur_drought')>=1,{regen:1}],
 ['c_fury','Curses and events','Fury-Tamer','Clear a gate cursed with Fury.',()=>T_('cur_fury')>=1,{drp:2}],
 ['c_bulwark','Curses and events','Wallbreaker','Clear a gate cursed with Bulwark.',()=>T_('cur_bulwark')>=1,{dmgp:3}],
 ['c_horde','Curses and events','Horde-Reaper','Clear a gate cursed with Horde.',()=>T_('cur_horde')>=1,{mpow:4}],
 ['c_25','Curses and events','Curse-Eater','Clear 25 cursed gates.',()=>T_('cursed')>=25,{goldp:8}],
 ['e_shrine','Curses and events','Blood-Sworn','Feed 10 blood shrines.',()=>T_('shrine')>=10,{dmgp:3}],
 ['e_pedlar','Curses and events','Haggler','Buy from 10 wandering pedlars.',()=>T_('pedlar')>=10,{goldp:4}],
 ['e_coffer','Curses and events','Lockbreaker','Force open 15 sealed coffers.',()=>T_('coffer')>=15,{goldp:5}],
 ['e_trap','Curses and events','Needle-Scarred','Spring 5 coffer traps.',()=>T_('trap')>=5,{hp:20}],
 ['e_strag','Curses and events','Shepherd of Stragglers','Raise 10 wounded stragglers.',()=>T_('straggler')>=10,{raise:3}],
 ['s_poison','Deeds','Plaguebringer','Poison foes 200 times with Venomous minions.',()=>T_('poisoned')>=200,{mpow:3}],
 ['s_cure','Deeds','Bloodless','Cure bleeding, burns or poison 25 times.',()=>T_('cures')>=25,{hpp:3}],
 ['s_venom','Deeds','Venom-Keeper','Command a Venomous minion.',()=>S.army.some(m=>hasTrait(m,'venom')),{mpow:2}],
 ['p_25','Deeds','Tippler','Drink 25 potions.',()=>T_('drank')>=25,{hp:15}],
 ['p_100','Deeds','Alchemist\'s Friend','Drink 100 potions.',()=>T_('drank')>=100,{manap:5}],
 ['k_spear','Deeds','Spearwright','Hurl 100 Bone Spears.',()=>T_('sk_spear')>=100,{atk:3}],
 ['k_blast','Deeds','Corpse-Burster','Set off 50 Corpse Explosions.',()=>T_('sk_blast')>=50,{siph:4}],
 ['k_chill','Deeds','Frostbinder','Freeze 50 foes with Grave Chill.',()=>T_('frozen')>=50,{siph:3}],
 ['k_reap','Deeds','Reaper of Souls','Reap 100 times.',()=>T_('sk_reap')>=100,{dmgp:3}],
 ['k_master3','Deeds','Adept of Bones','Master three skills.',()=>Object.values(S.player.skills).filter(r=>r>=SK_MAX).length>=3,{intelligence:2}],
 ['k_all','Deeds','Fully Versed','Learn every skill.',()=>SKILLS.every(s=>sk(s.id)>0),{manap:4}],
 ['f_crit','Deeds','Keen Eye','Land 100 critical hits (you or your army).',()=>T_('crits')>=100,{crit:2}],
 ['f_crit1000','Deeds','Butcher\'s Eye','Land 1,000 critical hits.',()=>T_('crits')>=1000,{crit:4}],
 ['f_flawless','Deeds','Untouched','Clear a gate without losing any HP.',()=>T_('flawless')>=1,{ward:4}],
 ['f_last','Deeds','Last Breath','Win a room with 10% of your HP or less.',()=>T_('lastBreath')>=1,{drp:3}],
 ['f_boss25','Deeds','Giant-Slayer','Defeat 25 bosses or wardens.',()=>T_('bosses')>=25,{dmgp:3}],
 ['f_elite100','Deeds','Elite Hunter','Defeat 100 elites.',()=>T_('elites')>=100,{crit:2,goldp:2}],
 ['g_gold','Deeds','Merchant Prince','Find 50,000 gold in your runs.',()=>L_('gold')>=50000,{goldp:6}],
 ['g_items','Deeds','Collector','Find 200 pieces of gear.',()=>L_('items')>=200,{goldp:3}],
 ['g_reforge','Deeds','Reforger','Reforge gear 25 times.',()=>T_('reforged')>=25,{mana:15}],
 ['g_sold','Deeds','Junk Dealer','Sell 100 pieces of gear.',()=>T_('soldItems')>=100,{goldp:4}],
 ['g_roll3','Deeds','Fortune\'s Favourite','Own a Legendary with three bonus lines.',roll3,{xpp:3}],
 ['a_boss','Deeds','Kingmaker','Raise a boss.',()=>T_('raisedBoss')>=1,{mpow:3}],
 ['a_raise500','Deeds','Boneyard Lord','Raise 500 minions.',()=>T_('raised')>=500,{mpow:6}],
 ['a_traits','Deeds','Menagerie','Command minions with every common trait at once.',()=>TRAIT_IDS.every(t=>S.army.some(m=>hasTrait(m,t))),{mpow:4}],
 ['a_elders','Deeds','Elder Council','Command three Elder minions at once.',()=>S.army.filter(m=>m.stage>=2).length>=3,{mpow:5}],
 ['a_raid1','Deeds','Absent Warlord','Win a raid led by a Commander.',()=>T_('raidWins')>=1,{goldp:4}],
 ['a_raid25','Deeds','General of the Dead','Win 25 raids.',()=>T_('raidWins')>=25,{mpow:5,goldp:4}],
 ['r_5','Deeds','Rift-Walker','Clear depth 5 of the Rift.',()=>riftBest()>=5,{dmgp:4}],
 ['r_15','Deeds','Riftborn','Clear depth 15 of the Rift.',()=>riftBest()>=15,{dmgp:5,hpp:4}],
 ['r_30','Deeds','Lord of the Torn Sky','Clear depth 30 of the Rift.',()=>riftBest()>=30,{dmgp:6,mpow:6}],
 ['a_ancient','Deeds','Bones of Ages','Evolve a minion into an Ancient.',()=>T_('ancient')>=1,{mpow:4}],
 ['a_eternal','Deeds','The Undying Court','Evolve a minion into an Eternal.',()=>T_('eternal')>=1,{mpow:6,hpp:3}],
 ['e_day100','Deeds','Centurion of Days','Reach day 100.',()=>S.day>=100,{xpp:4}],
 ['e_runs100','Deeds','Veteran','Go on 100 runs.',()=>L_('runs')>=100,{hp:25}],
 ['e_rooms1000','Deeds','Thousand Rooms','Win 1,000 rooms.',()=>L_('rooms')>=1000,{hpp:4}],
 ['e_lv75','Deeds','Deathless Sage','Reach level 75.',()=>S.player.lvl>=75,{hpp:5,manap:5}],
].forEach(a=>TITLES.push({id:a[0],grp:a[1],name:a[2],req:a[3],ok:a[4],b:a[5]}));
// ----- title bonuses. Small, and only the title you wear counts. Stat keys add like gear; the rest are percentages.
const TITLE_BUFF={
 g0:{hp:10},g1:{mana:10},g2:{hpp:3},g3:{dmgp:3},g4:{mpow:5},g5:{dmgp:5,hpp:3},
 t10:{crit:2},t20:{drp:2},t30:{regen:1},t40:{mpow:4},t50:{manap:5},t60:{raise:4},t70:{dmgp:4},t80:{hpp:5},t90:{drp:4},t100:{dmgp:6,drp:3},
 d_raise1:{raise:2},d_raise50:{raise:3},d_raise200:{mpow:5},d_army:{mpow:3},d_kill100:{atk:2},d_kill1000:{dmgp:2},d_kill5000:{dmgp:4},
 d_lv10:{intelligence:1},d_lv25:{intelligence:2,will:1},d_lv50:{hpp:4,manap:4},d_uq:{goldp:5},d_tuq:{dmgp:5,hpp:5},d_study:{xpp:3},d_all:{xpp:8},
 d_death:{hp:15},d_death10:{drp:3},d_quest7:{xpp:4},d_armed1:{goldp:4},d_armed3:{mpow:4},d_tower1:{ward:3},d_tower50:{drp:3},
 d_cancel:{siph:3},d_cancel10:{siph:6},d_master:{goldp:6},d_trophy500:{goldp:8},d_gold:{goldp:5},d_bag:{mana:20},d_altar:{mpow:4},
 d_evolve:{mpow:3},d_elder:{mpow:6},d_tower110:{dmgp:5},d_tower150:{drp:5},d_ngp:{xpp:5},d_ngp3:{xpp:10}
};
TITLES.forEach(t=>{ if(!t.b) t.b=TITLE_BUFF[t.id]||{}; });
const TBUFF_L={healp:['Healing received','%'],hpp:['Max HP','%'],manap:['Max mana','%'],dmgp:['Damage dealt','%'],drp:['Damage taken','%',-1],goldp:['Gold from kills','%'],xpp:['XP from kills','%']};
const buffTxt=b=>Object.keys(b||{}).map(k=>{ const L=TBUFF_L[k]||STATL[k], neg=(b[k]<0)!==((L[2]||1)<0); return (neg?'&minus;':'+')+Math.abs(b[k])+L[1]+' '+L[0]; }).join(', ');   // a negative value (a debuff) reads with a minus
const titleB=k=>{ const id=S&&S.ti&&S.ti.sel, t=id&&S.ti.got&&S.ti.got[id]&&TITLE[id]; return (t&&t.b[k])||0; };
function wearTitle(id){   // wear or take off a title; HP and mana follow the change like gear
  const T=S.ti; if(S.mode==='battle'||!T||!T.got||!T.got[id]) return false;
  const P=S.player; vitals(()=>{ T.sel=T.sel===id?null:id; }); P.hp=Math.min(P.hp,pMax()); P.mana=Math.min(P.mana,pMana()); return true;
}
function tally(k,n){ S.ti=S.ti||{}; S.ti[k]=(S.ti[k]||0)+(n==null?1:n); }   // deed counters for titles
// Title rarity uses the item tier names and colours (Common to Unique). Rarer titles give bigger bonuses, and Epic and
// rarer ones stay hidden ("???") until earned. Rarity follows how hard a title is: bot runs measured the reachable ones,
// and deeds the bots skip (events, forging) were judged by hand.
const TITLE_RARITY={hd1:1,hd2:2,nm0:3,nm1:3,nm2:3,nm3:4,nm4:4,nm5:5,dm3:5,sb0:5,sb1:5,sb2:5,sb3:5,sb4:5,sb5:5,g0:0,g1:0,d_raise1:0,d_kill100:0,d_death:0,d_armed1:0,d_lv10:0,d_study:0,s_venom:0,f_crit:0,d_tower1:0,d_quest7:0,d_army:0,g2:1,t10:1,t20:1,d_raise50:1,d_cancel:1,d_evolve:1,d_uq:1,d_gold:1,m0:1,m1:1,c_drought:1,c_fury:1,c_bulwark:1,c_horde:1,c_volatile:1,p_25:1,k_spear:1,k_blast:1,k_chill:1,g_items:1,g_sold:1,f_flawless:1,f_last:1,a_boss:1,e_strag:1,e_pedlar:1,e_trap:1,d_death10:1,g3:2,g4:2,t30:2,t40:2,t50:2,d_kill1000:2,d_lv25:2,d_raise200:2,d_tower50:2,d_cancel10:2,d_trophy500:2,d_altar:2,d_elder:2,m2:2,m3:2,d_armed3:2,d_master:2,d_bag:2,c_25:2,e_shrine:2,e_coffer:2,s_poison:2,s_cure:2,k_reap:2,k_master3:2,k_all:2,f_boss25:2,f_elite100:2,g_gold:2,g_roll3:2,a_traits:2,a_elders:2,e_day100:2,e_runs100:2,g_reforge:2,g5:3,t60:3,t70:3,m4:3,m5:3,tw75:3,d_lv50:3,p_100:3,f_crit1000:3,e_rooms1000:3,twruns:3,d_ngp:3,d_tower110:3,t80:4,t90:4,t100:4,d_kill5000:4,d_all:4,d_tower150:4,a_raise500:4,e_lv75:4,tw200:5,d_ngp3:5,d_tuq:5,a_ancient:3,a_eternal:4,a_raid1:1,a_raid25:3,r_5:3,r_15:4,r_30:5};
const RARITY_MUL=[1,1,1.25,1.5,2,3], HIDDEN_FROM=3;
TITLES.forEach(t=>{ t.r=TITLE_RARITY[t.id]!=null?TITLE_RARITY[t.id]:1; const m=RARITY_MUL[t.r]; for(const k in t.b) t.b[k]=Math.max(t.b[k],Math.round(t.b[k]*m)); });
const titleHidden=t=>t.r>=HIDDEN_FROM&&!(S&&S.ti&&S.ti.got&&S.ti.got[t.id]);
// Progress for count titles ("Clear the Throne of Ash 25 times" shows 12/25). Read from the title's own check, so a new
// count title gets its progress for free: any check of the form ()=>something>=N with N above 1.
TITLES.forEach(t=>{ const m=/^\(\)\s*=>\s*(.+?)\s*>=\s*(\d+)$/.exec(String(t.ok).trim()); if(/^t\d+$/.test(t.id)){ t.prog={get:()=>S.tower.best,n:+t.id.slice(1)}; return; } if(!m||+m[2]<=1) return;
  try{ t.prog={get:new Function('return ('+m[1]+')||0'),n:+m[2]}; }catch(e){} });
const titleProg=t=>{ if(!t.prog) return null; let v=0; try{ v=Math.max(0,Math.floor(+t.prog.get())||0); }catch(e){ return null; } return {v:Math.min(v,t.prog.n),n:t.prog.n}; };
const TITLE=Object.fromEntries(TITLES.map(t=>[t.id,t]));
const totalKills=()=>Object.values(S.kills).reduce((a,b)=>a+b,0);
const allNames=()=>{ const a=[]; DUNGEONS.forEach(D=>{ D.mobs.forEach(m=>a.push(m[0])); a.push(D.boss[0]); }); TW_MOBS.forEach(m=>a.push(m[0])); TW_BOSS.forEach(n=>a.push(n)); return a; };
function checkTitles(){
  if(!S) return;
  const T=S.ti=S.ti||{}; T.got=T.got||{}; T.clr=T.clr||{}; T.raised=T.raised||0; T.deaths=T.deaths||0; T.claims=T.claims||0;
  if(S.army.some(m=>m.armed&&m.eq&&GEAR_SLOTS.every(sl=>m.eq[sl]))) T.fullGear=true;
  if(!T.hasUq&&(S.inv.concat(Object.values(S.equip)).some(it=>it&&ITEM[it.id]&&ITEM[it.id].uq))) T.hasUq=true;
  const sel0=T.sel, valid=T.sel&&T.got[T.sel]&&TITLE[T.sel];
  let next=valid?T.sel:null; const won=[];
  for(const t of TITLES){
    if(T.got[t.id]) continue;
    let ok=false; try{ ok=t.ok(); }catch(e){}
    if(ok){ T.got[t.id]=S.day; if(!next) next=t.id; won.push(t); }   // only auto-worn if you wear none
  }
  if(won.length===1){ const t=won[0]; notify('Title earned: '+t.name+'. '+t.req+(buffTxt(t.b)?' Worn, it gives '+buffTxt(t.b)+'.':''),'ok'); }
  else if(won.length>1) notify(won.length+' titles earned: '+won.map(t=>t.name).join(', ')+'. See the Titles tab for what each one gives.','ok');   // one line, not a pile
  if(won.length&&typeof moment==='function') moment(won.length>1?won.length+' titles earned':'Title earned: '+won[0].name,'gold');
  // a title put on or taken off here changes stats like wearing it by hand: HP, mana and the army follow
  if(next!==sel0){ const P=S.player; T.sel=sel0; vitals(()=>{ T.sel=next; }); P.hp=Math.min(P.hp,pMax()); P.mana=Math.min(P.mana,pMana()); }
}
const titleName=()=>{ const t=S.ti&&S.ti.sel&&TITLE[S.ti.sel]; return t?t.name:''; };

function addXp(n){
  const P=S.player; P.xp+=n; let ups=0;
  while(P.xp>=need(P.lvl)){ P.xp-=need(P.lvl); P.lvl++; P.pts+=3; P.sp=(P.sp||0)+1; ups++; }
  if(ups){ sfx('level'); moment('Level '+P.lvl,'gold'); P.hp=pMax(); P.mana=pMana(); syncArmy(); const nu=SKILLS.filter(s=>s.lv>P.lvl-ups&&s.lv<=P.lvl).map(s=>s.name); notify('Level '+P.lvl+'. +'+(3*ups)+' stat points and +'+ups+' skill point'+(ups>1?'s':'')+' to spend.'+(nu.length?' New skill: '+nu.join(', ')+'.':''),'ok'); }
  return ups;
}
function minionXp(m,n){
  m.xp+=n; let up=0;
  while(m.lvl<S.player.lvl+2 && m.xp>=mneed(m.lvl)){ m.xp-=mneed(m.lvl); m.lvl++; up++; }
  if(m.lvl>=S.player.lvl+2) m.xp=Math.min(m.xp,mneed(m.lvl)-1);
  if(up){ checkEvolve(m); syncMinion(m); }
  return up;
}
function alloc(k){
  const P=S.player; if(P.pts<=0||S.mode==='battle') return;
  if(!(k in P.stats)) return;
  vitals(()=>{ P.stats[k]++; P.pts--; });   // HP and mana rise by exactly what their max rose by (titles, sets, Bone Armor and the wounded dawn scale it)
}
const questDone = ()=>S.quest.kills>=QUEST.kills&&S.quest.rooms>=QUEST.rooms&&S.quest.clears>=QUEST.clears;
function claimQuest(){
  if(S.quest.claimed||!questDone()) return;
  const xp=Math.round(need(S.player.lvl)*QUEST_XP);
  S.quest.claimed=true; S.player.pts+=QUEST_PTS; addXp(xp); S.ti=S.ti||{}; S.ti.claims=(S.ti.claims||0)+1;
  notify('Daily quest complete: +'+QUEST_PTS+' stat point'+(QUEST_PTS>1?'s':'')+' and +'+xp+' XP.','ok');
}
function endDay(){
  const P=S.player; P.debuff=false;
  if(!S.quest.claimed){
    if(questDone()) claimQuest();
    else{
      const loss=Math.round(need(P.lvl)*QUEST_LOSS);
      P.xp=Math.max(0,P.xp-loss); P.debuff=true;
      notify('Day '+S.day+' closed with the daily quest unfinished. Penalty: -'+loss+' XP, and max HP is cut by '+Math.round(QUEST_DEBUFF*100)+'% today.','bad');
    }
  }
  S.day++; S.watches=WATCHES; S.quest={kills:0,rooms:0,clears:0,claimed:false};
  const rr=resolveRaids();
  P.hp=pMax(); P.mana=pMana(); P.shield=0;
  S.army.forEach(m=>m.hp=m.maxHp);
  notify('Day '+S.day+' begins. You have '+WATCHES+' watches.'+raidDayLine(rr));
}
function restDay(){ if(S.mode!=='town') return; S.watches=0; endDay(); }

// ----- dungeon runs
function log(m,c){ const r=S.run; r.log.unshift({m,c:c||''}); r.log.length=Math.min(r.log.length,10); }
function makeEnemy(di,lvl,boss){
  const D=DUNGEONS[di]; let name,role,hf=1,af=1;
  if(boss){ name=D.boss[0]; role=D.boss[1]; }
  else{ const t=pick(D.mobs); name=t[0]; role=t[1]; hf=t[2]; af=t[3]; }
  const elite=!boss&&Math.random()<eliteChance();
  const s=mobStats(di,lvl,hf,af,boss,elite);
  const e={id:'e'+(++S.uid),name:(elite?pick(ELITE)+' ':'')+name,base:name,role,rankI:di,lvl,hf,af,boss,elite,maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false};
  if(boss) giveAbility(e,GATE_ABIL[di]);
  return e;
}
// Rule: a room never holds more than one mender. Re-roll until the new enemy fits.
function makeSecret(di,lvl){
  const e=makeEnemy(di,Math.max(lvl+2,S.player.lvl+SB_LV),true), B=SECRET[di]; e.name=e.base=B.name; e.secret=true;   // never weaker than you: an outgrown gate still hides a real threat
  const sg=Math.max(di,topGate()); if(sg>di){ const st=mobStats(sg,e.lvl,1,1,true,false); e.maxHp=e.hp=st.hp; e.atk=st.atk; }   // fights with the strength of the hardest gate open to you
  const grow=1+SB_GROW*Math.max(0,S.player.lvl-SAFE[sg]);   // a necromancer far past the gates has an army to match: so does the master
  e.maxHp=e.hp=Math.round(e.maxHp*SB_HP*grow); e.atk=Math.max(1,Math.round(e.atk*SB_ATK)); e.phase2=true; e.alt=true; e.fast=(e.fast||0)+1; e.abilT=2;
  tally('secretMet'); return e;
}
function slaySecret(e,r){   // a secret master falls: its tally (for its title), the run history, the Records page and a moment
  tally('secret_'+e.rankI); r.secret=e.name;
  S.rec=S.rec||{}; const first=S.rec.sec=S.rec.sec||{}; if(!first[e.rankI]) first[e.rankI]=S.day;
  moment(e.name+' is slain','gold'); log('You have slain a secret master of the gate. The Ledger writes its name in red.','story');
}
function spawnOne(list,di,lvl){
  let e; for(let i=0;i<40;i++){ e=makeEnemy(di,lvl,false); if(!(e.role==='mender'&&list.some(x=>x.role==='mender'))) break; }
  if(e.role==='mender'&&list.some(x=>x.role==='mender')){ const t=DUNGEONS[di].mobs.filter(m=>m[1]!=='mender'); const pk=pick(t); e=makeEnemy(di,lvl,false); e.name=e.base=pk[0]; e.role=pk[1]; e.hf=pk[2]; e.af=pk[3]; const st=mobStats(di,lvl,pk[2],pk[3],false,false); e.maxHp=e.hp=st.hp; e.atk=st.atk; e.elite=false; }
  list.push(e);
}
function spawnRoom(){
  if(S.run.tw) return spawnFloor();
  const r=S.run, di=r.di, room=r.room, boss=room===r.rooms-1;
  const lvl=(r.rift?riftLvl(r.rift):RK[di].lv)+Math.floor(room/2)+(boss?2:0)+curseRise(di);
  const list=[];
  const extra=runMod()==='horde'?1:0;
  if(boss){ list.push(secretRoll(di)?makeSecret(di,lvl):makeEnemy(di,lvl,true)); const adds=(di===0?2:3)+extra; for(let i=0;i<adds;i++) spawnOne(list,di,lvl-1); }
  else{ const n=(room===0?2:room===1?3:3+Math.round(Math.random()))+extra; for(let i=0;i<n;i++) spawnOne(list,di,lvl); }
  foeScale(list,foeAtkMul(di)); bulwark(list); riftScale(list);
  { const f=foeHeat(); if(f!==1) for(const e of list){ e.maxHp=e.hp=Math.round(e.maxHp*f); e.atk=Math.max(1,Math.round(e.atk*f)); } }
  if(!boss&&r.roomKind==='elite') for(const e of list){ e.maxHp=e.hp=Math.round(e.maxHp*ELITE_ROOM); e.atk=Math.max(1,Math.round(e.atk*ELITE_ROOM)); }
  affixAll(list);
  r.enemies=list; r.corpses=[]; r.events=[]; r.turn=1; r.fx={}; r.target=list[0].id; r.loot=[]; r.spoils=[]; r.lostLoot=[]; r.cmd={}; r.taunt=0; r.quiet=null;
  log(boss?(list[0].secret?'The air turns wrong. This is not the master you came for.':'The air thickens. Something large waits ahead.'):'Room '+(room+1)+' of '+r.rooms+(r.roomKind==='elite'?', behind the bloodied arch. These foes are stronger.':'.'));
  if(boss) bossSpeaks(list[0],'hi');
  if(hasFlag('infernal')) infernalWard();
}
function startTower(f){
  f=+f; if(S.mode!=='town'||S.watches<=0||S.player.lvl<TW.unlock||!towerStarts().includes(f)) return;
  S.watches--; S.runs++; tally('twRuns'); S.notices=[];   // notes are about what happened since your last run
  S.run={tw:f,tw0:f,di:5,room:0,rooms:1,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[]};
  S.mode='battle'; titheSouls();
  log('You step into the Hell Tower.');
  spawnFloor();
}
function startRun(di){
  if(S.mode!=='town'||S.watches<=0||S.player.lvl<RK[di].unlock) return;
  S.watches--; S.runs++; S.notices=[];
  S.run={di,room:0,rooms:4,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:gateMod(di),heat:heatOf(di)};
  S.mode='battle'; titheSouls();
  log('You step through the '+DUNGEONS[di].name+' gate.'+(S.run.mod?' It is cursed today: '+MODS[S.run.mod].name+'.':''));
  spawnRoom();
}
const nameOf = u=>u.id==='p'?'You':(u.nick||u.name);
const allies = ()=>[S.player].concat(S.army);
const liveFoes = ()=>S.run.enemies.filter(e=>e.hp>0);
function mark(id,d,h){ const f=S.run.fx[id]||(S.run.fx[id]={d:0,h:0}); f.d+=d; f.h+=h; }
function hit(b){ return Math.max(1,Math.round(b*rnd(.85,1.15))); }
function hurtFoe(e,d){ if(e.curse) d=Math.round(d*e.curse.mul); if(e.stun>0&&hasMod('chill','b')) d=Math.round(d*1.25);
  if(e.shield>0){ const s=Math.min(e.shield,d); e.shield-=s; d-=s; if(d<=0){ mark(e.id,0,0); return; } }   // Bone Wall shield soaks damage first
  recBest('hit',d); d=Math.min(d,e.hp); e.hp-=d; mark(e.id,d,0); }
function hurtAlly(a,d){
  if(a.id!=='p'&&hasFlag('swarmguard')) d=Math.max(1,Math.round(d*.75));
  if(a.id!=='p'&&hasTrait(a,'stalwart')) d=Math.max(1,Math.round(d*.8));
  if(a.id==='p'&&xb('drp')) d=Math.max(1,Math.round(d*(1-xb('drp')/100)));
  if(a.id!=='p'&&hasMod('gravepact','b')) d=Math.max(1,Math.round(d*.9));
  if(a.id==='p'){ const s=Math.min(S.player.shield,d); S.player.shield-=s; d-=s; }
  d=Math.min(d,a.hp); a.hp-=d; if(d>0) mark(a.id,d,0); if(a.id==='p'&&d>0&&S.run) S.run.hurt=true;
}
function healAlly(a,h){
  if(a.id==='p'&&xb('healp')) h=Math.max(0,Math.round(h*(1+xb('healp')/100)));   // faith changes the healing you receive
  const max=a.id==='p'?pMax():a.maxHp; h=Math.min(h,max-a.hp); if(h<=0) return 0;
  a.hp+=h; mark(a.id,0,h); return h;
}
function killXp(e){ return Math.round((4+e.lvl*2.5)*RK[e.rankI].xp*(e.boss?2.5*(omen()==='ashfall'?OMEN_BOSS_XP:1):1)*(e.elite?1.5:1)*(e.tw?1+e.tw/12:1)*(e.secret?SB_REWARD:1)*ngpReward()*(runMod()?MOD_XP:1)*heatK('xp')*(1+xb('xpp')/100)); }
function studyFoe(name){   // count a kill toward studying this kind of foe (its drop table opens in the bestiary)
  const n=S.kills[name]=(S.kills[name]||0)+1;
  if(n===KNOW_AT) notify('Bestiary: you have studied '+name+'. Its drop table is now known.','ok');
}
function killPowers(){   // unique powers that pay out on every kill
  const P=S.player;
  if(hasFlag('soulharvest')) P.mana=Math.min(pMana(),P.mana+6);
  if(hasFlag('censer')){ P.mana=Math.min(pMana(),P.mana+10); healAlly(P,Math.round(pMax()*.05)); }
}
function checkDeaths(){
  const r=S.run;
  for(const e of r.enemies){
    if(!(e.hp<=0)||e.dead) continue;
    e.dead=true; r.kills++; S.quest.kills++;
    if(e.boss||e.elite) gainSoul();
    if(e.boss) tally('bosses');
    if(e.elite) tally('elites');
    studyFoe(e.base);
    r.pending+=killXp(e); r.loot.push(...rollDrops(e)); killLoot(e,r);
    killPowers();
    r.corpses.push(corpseOf(e));
    if(e.boss) bossSpeaks(e,'bye');
    log(e.name+' falls.'); sfx('kill');
    const page=e.secret?'secret':e.boss?(e.tw?'warden':'boss'):e.elite?'elite':null;   // who may carry a torn page
    if(page) findPage(page,r);
    if(e.secret) slaySecret(e,r);
    if(runMod()==='volatile') volatileBurst(e);
    if(hasAff(e,'splitting')) splitFoe(e);
  }
}
function currentTarget(){
  const r=S.run; let t=r.enemies.find(e=>e.id===r.target&&e.hp>0);
  if(!t){ t=liveFoes()[0]; r.target=t?t.id:null; }
  return t||null;
}
function setTarget(id){ const e=S.run&&S.run.enemies.find(x=>x.id===id); if(e&&e.hp>0) S.run.target=id; }

function act(kind){
  if(S.mode!=='battle') return;
  const r=S.run, P=S.player; r.fx={};
  const t=currentTarget(); if(!t) return;
  if(kind==='strike'){
    let d=hit(pAtk()*dmgMul()*(1+.1*sk('edge'))), crit=Math.random()<.1+G('crit')/100+(hasMod('edge','a')?.1:0); if(crit){ d=Math.round(d*1.8); tally('crits'); } if(hasFlag('execute')&&t.hp<t.maxHp*.35) d=Math.round(d*1.5);
    hurtFoe(t,d); P.mana=Math.min(pMana(),P.mana+3); if(hasMod('edge','b')) healAlly(P,Math.round(d*.1));
    log('You strike '+t.name+' for '+d+(crit?' (crit)':'')+'. +3 mana.');
    if(hasFlag('echo')&&t.hp>0&&Math.random()<.25){ const d2=hit(pAtk()*dmgMul()); hurtFoe(t,d2); log('Echo: the blade strikes again for '+d2+'.','ok'); }
    if(hasFlag('hellfire')){ for(const o of liveFoes()) if(o!==t) hurtFoe(o,Math.round(d*.4)); }
    else if(hasFlag('cleave')){ const o=liveFoes().filter(x=>x!==t); if(o.length) hurtFoe(pick(o),Math.round(d*.6)); }
  }else if(kind==='siphon'){
    if(P.mana<siphonCost()) return;
    P.mana-=siphonCost(); const low=t.hp<t.maxHp*SIPHON_LOW; let d=hit(pSiph()*pierceMul(SIPHON_PIERCE)); if(low) d*=2; hurtFoe(t,d);   // pierces a quarter of armor; devours the weak
    if(hasFlag('chorus')) for(const o of liveFoes()) if(o!==t) hurtFoe(o,Math.round(d*.5));
    const h=healAlly(P,Math.round(d*(hasFlag('lifedrain')?SIPHON_HEAL_LD:SIPHON_HEAL))); const got=gainSoul();
    log('Soul Siphon '+(low?'devours ':'drains ')+t.name+' for '+d+(h?', you recover '+h:'')+(got?' and harvest a Soul ('+S.run.souls+'/'+SOUL_MAX+')':'')+'.');
  }else if(kind==='ward'){
    if(P.mana<6) return;
    P.mana-=6; const w=pWard(); P.shield=Math.min(Math.round(pMax()*.6),P.shield+w);
    mark('p',0,0); log('Bone Ward raised. You hold '+P.shield+' ward.');
  }else if(kind.startsWith('sk:')){ if(!useSkill(kind.slice(3),t)) return; }
  else if(kind==='ult'){ if(!useUlt(t)) return; }
  else if(kind.startsWith('pot:')){ if(!drink(kind.slice(4))) return; }
  else return;
  sfx(kind==='strike'?'strike':kind.startsWith('pot:')?'heal':'skill');
  checkDeaths();
  if(!liveFoes().length){ roomWon(); return; }
  // minions act
  for(const m of S.army){
    if(m.hp<=0) continue;
    if(!liveFoes().length) break;
    if(m.role==='mender'){
      const hurt=allies().filter(a=>a.hp>0&&a.hp<(a.id==='p'?pMax():a.maxHp)*.85).sort((a,b)=>a.hp/(a.id==='p'?pMax():a.maxHp)-b.hp/(b.id==='p'?pMax():b.maxHp))[0];
      if(hurt){ const h=healAlly(hurt,Math.round(m.atk*.9*rnd(.9,1.1))); log(m.nick+' mends '+(hurt.id==='p'?'you':hurt===m?'itself':nameOf(hurt))+' for '+h+'.','ok'); continue; }
    }
    let tg=currentTarget(); if(!tg) break;
    let d=hit(m.atk*dmgMul()*(r.frenzy>0?r.frenzyMul:1)*(m.role==='reaper'&&r.execute&&tg.hp<tg.maxHp*.4?2:1)*(hasTrait(m,'wrathful')&&m.hp<m.maxHp/2?1.4:1)); const crit=m.role==='striker'&&(r.focus||Math.random()<.25); if(crit){ d=Math.round(d*1.8); tally('crits'); }
    hurtFoe(tg,d); let extra='';
    if(crit&&r.focus&&tg.charging&&tg.hp>0) breakCharge(tg,m.nick+'\'s focused strike breaks '+theName(tg.name)+'\'s focus.');
    if(hasTrait(m,'venom')&&tg.hp>0){ addDot(tg,'poison',m.atk*.15*pierceMul(.5),3); tally('poisoned'); extra+=' and poisons it'; }
    if(m.role==='reaper'){ const o=liveFoes().filter(x=>x!==tg); if(o.length){ const o2=pick(o); const d2=Math.round(d*.5); hurtFoe(o2,d2); extra=' and cleaves '+o2.name+' for '+d2; } }
    if(hasTrait(m,'frenzied')&&tg.hp>0&&Math.random()<.2){ const d3=hit(m.atk*dmgMul()*(r.frenzy>0?r.frenzyMul:1)); hurtFoe(tg,d3); d+=d3; extra+=', then strikes again for '+d3; }
    if(hasTrait(m,'leech')){ const h=healAlly(m,Math.round(d*.25)); if(h) extra+=' and drinks '+h+' HP'; }
    log(m.nick+' hits '+tg.name+' for '+d+(crit?' (crit)':'')+extra+'.');
    checkDeaths();
  }
  r.focus=false; r.execute=false;   // these orders last one minion phase
  if(!liveFoes().length){ roomWon(); return; }
  // foes act
  checkPhase();
  const hpBefore=P.hp;
  for(const e of liveFoes()){
    if(e.hp<=0) continue; let alive=allies().filter(a=>a.hp>0); if(!alive.length) break;
    if(r.taunt>0){ const v=alive.filter(a=>a.role==='vanguard'&&a.id!=='p'); if(v.length) alive=v; }   // Taunt
    if(e.stun>0){ e.stun--; if(e.charging) breakCharge(e,e.name+' is frozen. The frost breaks its focus and'); else log(e.name+' is frozen and cannot act.','ok'); continue; }
    if(e.abil&&bossTurn(e)){ if(P.hp<=0&&playerFalls()) return; checkDeaths(); continue; }
    if(e.role==='mender'){
      const hurt=liveFoes().filter(x=>x.hp<x.maxHp*.7).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
      if(hurt){ const h=Math.min(Math.round(e.atk*.9*(1-foeArmor())),hurt.maxHp-hurt.hp); /* scaled by armor like your damage, so menders can't stall a fight */ hurt.hp+=h; log(e.name+' mends '+hurt.name+'.'); continue; }
    }
    const weights=alive.map(a=>a.role==='vanguard'?5:2); let roll=Math.random()*weights.reduce((x,y)=>x+y,0), tg=alive[0];
    for(let i=0;i<alive.length;i++){ roll-=weights[i]; if(roll<=0){ tg=alive[i]; break; } }
    let d=hit(e.atk*enrage(e)*(hasAff(e,'enraged')&&e.hp<e.maxHp/2?1.6:1)); const crit=e.role==='striker'&&Math.random()<.25; if(crit) d=Math.round(d*1.8);
    hurtAlly(tg,d); if(crit) addDot(tg,'bleed',e.atk*.3,2);   // a striker's crit opens a wound
    if(hasAff(e,'vampiric')){ const h=Math.min(e.maxHp-e.hp,Math.round(d*.4)); if(h>0){ e.hp+=h; mark(e.id,0,h); } }
    log(e.name+' hits '+(tg.id==='p'?'you':nameOf(tg))+' for '+d+(crit?' (crit'+(tg.hp>0&&tg.dots&&tg.dots.bleed?', bleeding':'')+')':'')+'.','bad');
    if(tg.id==='p'&&hasFlag('thorns')&&e.hp>0) hurtFoe(e,Math.max(1,Math.round(d*.2*(1-foeArmor()))));
    if(tg.hp<=0&&tg.id!=='p') log(tg.nick+' is down.','bad');
    if(P.hp<=0&&playerFalls()) return;
  }
  tickDots(); if(P.hp<=0&&playerFalls()) return;
  if(P.hp<hpBefore){ sfx('hurt'); if(hpBefore-P.hp>=pMax()*.2) ui.shake=true; }   // a heavy turn shakes the screen
  checkDeaths(); if(!liveFoes().length){ roomWon(); return; }
  r.turn++; if(runMod()!=='drought') P.mana=Math.min(pMana(),P.mana+1+G('regen')+sk('soulwell')+(hasMod('soulwell','a')?1:0)); skillTick();
  if(hasFlag('halo')) allies().forEach(a=>{ if(a.hp>0) healAlly(a,Math.round((a.id==='p'?pMax():a.maxHp)*.04)); });
  if(r.turn===9&&liveFoes().some(e=>e.tw&&e.boss)) log('Wrath: the warden is enraged and hits harder every turn.','bad');
}
function gateCleared(r){   // the boss room of a gate is won: story, clear tallies (titles, difficulty, curses) and the secret-master hint; returns the clear bonus XP
  const di=r.di, fk=runFarm(); unlockStory('g'+di,r); r.cleared=true; S.quest.clears++;   /* fk before the clear is marked: a first clear pays in full */
  S.ti=S.ti||{}; S.ti.clr=S.ti.clr||{}; S.ti.clr[di]=1; tally('clrN'+di);
  if(T_('clrN'+di)===SECRET_HINT&&secretHinted(di)) notify('A torn page in the Ledger: '+SECRET[di].hint,'');
  if(r.heat){
    S.heatMax=S.heatMax||{}; S.heatMax[di]=Math.max(S.heatMax[di]||0,r.heat); tally('heat'+r.heat); if(r.mod) tally('damned');
    if(r.heat===3){ tally('nm'+di); if(r.mod) tally('damned3'); }
  }
  if(r.mod){ tally('cur_'+r.mod); tally('cursed'); }
  if(!r.hurt) tally('flawless');
  return Math.round(RK[di].clear*fk);
}
function roomWon(){
  const r=S.run, P=S.player; r.events=[];
  let xp=r.pending; r.pending=0;
  const last=r.room===r.rooms-1;
  const share=Math.round(xp*.5), shatter=hasFlag('bonebank')?0:Math.max(5,25-A('will')*1.5);
  for(const m of S.army.slice()){
    if(m.hp>0){ if(minionXp(m,share)) r.events.push({m:m.nick+' reaches level '+m.lvl+'.',c:'ok'}); }
    else if(!hasTrait(m,'gravebound')&&Math.random()*100<shatter){ returnGear(m); S.army=S.army.filter(x=>x!==m); r.events.push({m:m.nick+', '+theName(mName(m))+', shattered and is gone.',c:'bad'}); }
    else{ m.hp=Math.ceil(m.maxHp*.4); r.events.push({m:m.nick+' was downed but binds back together.',c:''}); }
  }
  if(r.tw){
    const f=r.tw; S.tower.best=Math.max(S.tower.best,f); recBest('floor',f); for(const k of [10,25,40,50,60,75,90,100]) if(S.tower.best>=k) unlockStory('t'+k,r);
    if(f%10===0){ xp+=120*f; S.quest.clears++; towerBossLoot(f,r); }
    if(f===100) r.cleared=true;   // floor 100 ends the first climb; floor 101 onward is the endless abyss
  } else if(last){ xp+=r.rift?riftCleared(r):gateCleared(r); }
  for(const id of r.loot){ const it=addItem(id); if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } else r.lostLoot.push(ITEM[id].name); } r.loot=[];
  bankLoot(r); r.won=(r.won||0)+1; S.quest.rooms=(S.quest.rooms||0)+1; tally('rooms'); if(r.tw) tally('floors'); if(P.hp>0&&P.hp<=pMax()*.1) tally('lastBreath');
  r.event=(!r.tw&&!last&&Math.random()<EVENT_CHANCE)?rollEvent():null;   // something waits between rooms
  r.doors=(!r.tw&&!last)?rollDoors(r):null;   // which way next
  r.gained+=xp; r.lastXp=xp;
  r.ups+=addXp(xp);
  S.mode='raise';
}
function defeat(){
  sfx('death');
  const r=S.run; S.ti=S.ti||{}; S.ti.deaths=(S.ti.deaths||0)+1; r.pending=0; r.gold=0; r.troph={}; S.mode='defeat'; S.player.xp=Math.max(0,S.player.xp-Math.round(need(S.player.lvl)*DIFF.deathXp));
  S.army.forEach(m=>{ if(m.hp<=0) m.hp=Math.ceil(m.maxHp*.4); });
  notify('You were dragged out of '+(r.tw?'the Hell Tower on floor '+r.tw:'the '+DUNGEONS[r.di].name)+'. That room\'s spoils are lost, and you lose '+Math.round(DIFF.deathXp*100)+'% of a level in XP.','bad');
}
function descend(kind){   // go on: through one of the doors in the gates (the first door by default), or up a floor in the Tower
  if(S.mode!=='raise'||S.run.cleared) return false;
  const r=S.run, P=S.player;
  if(r.doors){ if(kind==null) kind=r.doors[0]; if(!r.doors.includes(kind)) return false; } else kind='fight';
  P.hp=Math.min(pMax(),P.hp+Math.round(pMax()*DIFF.heal)); P.mana=Math.min(pMana(),P.mana+Math.round(pMana()*DIFF.mana)); P.shield=0;
  S.army.forEach(m=>m.hp=Math.min(m.maxHp,m.hp+Math.round(m.maxHp*DIFF.mheal)));
  r.cd={}; r.frenzy=0; r.silence=0; r.event=null; allies().forEach(clearDots); if(r.tw) r.tw++; r.room++; r.roomKind=kind; r.doors=null; if(kind==='elite') tally('archs');
  if(kind==='rest'||kind==='treasure'){ quietRoom(kind); return true; }
  S.mode='battle'; spawnRoom(); return true;
}
function returnTown(){
  const P=S.player;
  if(S.run){ recordRun(S,S.run,runResult(S.run)); recRun(S.run); }
  P.hp=pMax(); P.mana=pMana(); P.shield=0; allies().forEach(clearDots); S.army.forEach(m=>m.hp=m.maxHp);
  S.run=null; S.mode='town';
  if(S.watches<=0) endDay();
  save();
}
function flee(){ if(S.mode!=='battle') return; S.run.fled=true; notify('You fled the gate and left the room\'s spoils behind.','bad'); returnTown(); }


// ----- items: bag and equipment
function addItem(id,ro){ if(S.inv.length>=bagMax()&&!ITEM[id].uq) return null; const it={u:++S.uid,id}; const r=ro===undefined?rollItem(id):ro; if(r&&r.length) it.ro=r; S.inv.push(it); return it; }
const findItem=u=>{ const i=S.inv.find(x=>x.u===u); if(i) return i; for(const sl of GEAR_SLOTS) if(S.equip[sl]&&S.equip[sl].u===u) return S.equip[sl]; return null; };
const reforgeCost=it=>Math.round(buyPrice(ITEM[it.id])*REFORGE_COST*(1-.15*bl('forge')));
function reforge(u){   // re-roll a piece's bonus lines for gold; always leaves at least one line
  const it=findItem(u); if(!it||S.mode!=='town') return false; const d=ITEM[it.id]; if(d.uq) return false;
  const c=reforgeCost(it); if(S.gold<c) return false;
  S.gold-=c; vitals(()=>{ it.ro=rollItem(it.id,true)||undefined; if(!it.ro) delete it.ro; }); tally('reforged'); sfx('level'); return true;
}
function vitals(fn){ const a=pMax(), b=pMana(); fn(); const P=S.player, a2=pMax(), b2=pMana(); P.hp=Math.min(a2,P.hp+Math.max(0,a2-a)); P.mana=Math.min(b2,P.mana+Math.max(0,b2-b)); syncArmy(); }
function equip(u){
  if(S.mode==='battle') return;
  const i=S.inv.findIndex(x=>x.u===u); if(i<0) return;
  vitals(()=>{ const it=S.inv[i], sl=ITEM[it.id].slot, old=S.equip[sl]; S.inv.splice(i,1); if(old) S.inv.push(old); S.equip[sl]=it; });
}
function unequip(sl){ if(S.mode==='battle'||!S.equip[sl]) return; vitals(()=>{ S.inv.push(S.equip[sl]); S.equip[sl]=null; }); }
function discard(u){ S.inv=S.inv.filter(x=>x.u!==u||x.lk); }

// ----- raising
function raiseChance(c){
  let ch=RAISE_BASE+A('will')*RAISE_WILL+G('raise')+(skMod('thrift')==='b'?3:0)+4*sk('mastery')+(hasMod('mastery','a')?6:0)+3*bl('ossuary')+(omen()==='paletide'?OMEN_RAISE:0)+(S.player.lvl-c.lvl)*3-RK[c.rankI].pen;
  if(c.elite) ch-=10; if(c.boss) ch-=15; if(c.free) ch+=STRAGGLER_BONUS;
  return clamp(Math.round(ch),RAISE_MIN,RAISE_MAX);
}
const raiseCost = c=>c.free?0:Math.ceil((8+c.rankI*3+(c.boss?4:0))*(hasFlag('cheapraise')?.5:1)*(hasMod('mastery','b')?.75:1)*(1-.06*sk('thrift')-(skMod('thrift')==='a'?.1:0)));
function freeNick(){ const used=S.army.map(m=>m.nick); const f=NICKS.filter(n=>!used.includes(n)); return f.length?pick(f):pick(NICKS)+' II'; }
const SALT_BONUS=20, SALT_MAX=3, saltPrice=()=>10+S.player.lvl*3;   // Grave Salts: bought at the market, +20% on one raise
const RAISE_BASE=25, RAISE_WILL=1.8, RAISE_MIN=1, RAISE_MAX=85, SALT_CAP=95;   // salts may still reach 95%
const saltChance=c=>clamp(raiseChance(c)+SALT_BONUS,RAISE_MIN,SALT_CAP);
function tryRaise(id,salt){
  if(S.mode!=='raise') return;
  const r=S.run, P=S.player, c=r.corpses.find(x=>x.id===id); if(!c||c.tried) return;
  r.events=[];
  if(armyUsed()>=slots()){ r.events.push({m:'Your army is full. Release someone first.',c:'bad'}); return; }
  const cost=raiseCost(c);
  if(P.mana<cost){ r.events.push({m:'Not enough mana. You need '+cost+'.',c:'bad'}); return; }
  const salted=!!(salt&&S.salts>0);
  P.mana-=cost; c.tried=true; if(salted) S.salts--;
  if(Math.random()*100<(salted?saltChance(c):raiseChance(c))){
    const m={uid:++S.uid,armed:!!c.armed,eq:c.armed?{weapon:null,armor:null,relic:null}:null,nick:freeNick(),name:c.name,kind:c.base,role:c.role,rankI:c.rankI,lvl:c.lvl,xp:0,boss:c.boss,elite:c.elite,hf:c.hf,af:c.af,tw:c.tw,hp:1,maxHp:null,atk:0};
    if(hasFlag('bindsouls')) m.lvl=Math.min(S.player.lvl+2,m.lvl+2);
    m.lvl0=m.lvl; m.stage=0; m.traits=[rollTrait([])]; if(c.boss) m.traits.push(rollTrait(m.traits));   // bosses rise with two traits
    if(c.aff&&c.aff.length){ const t=AFFIX[pick(c.aff)].trait; if(!m.traits.includes(t)) m.traits.push(t); }   // an elite keeps one of its affixes
    if(rollCommand(m)) tally('commanders');
    syncMinion(m); m.hp=m.maxHp; S.army.push(m); r.raised++; S.ti=S.ti||{}; S.ti.raised=(S.ti.raised||0)+1; if(m.armed) S.ti.armed=(S.ti.armed||0)+1;
    if(c.free) tally('straggler'); if(c.boss) tally('raisedBoss'); c.result='raised'; if(c.boss||c.elite) moment(m.nick+' rises: '+(c.boss?'a boss':'an elite')+' serves you','ok'); c.minion=m.nick+' ('+m.traits.map(t=>TRAITS[t].name).join(', ')+')'; sfx('raise');
  }else{ c.result='failed'; sfx('fail'); }
}
// Quicker raising: try every untouched body, most valuable first (salts on bosses and elites), until mana or slots run out.
const bodyValue=c=>(c.boss?1000:0)+(c.elite?300:0)+c.rankI*50+c.lvl+(c.free?500:0);
function raiseBest(){
  if(S.mode!=='raise') return 0; const r=S.run, P=S.player; let n=0;
  for(const c of r.corpses.filter(c=>!c.tried).sort((a,b)=>bodyValue(b)-bodyValue(a))){
    if(armyUsed()>=slots()) break; if(P.mana<raiseCost(c)) continue;
    tryRaise(c.id,(c.boss||c.elite)&&S.salts>0); n++; }
  return n;
}
const weakest=()=>S.army.slice().sort((a,b)=>mPower(a)-mPower(b))[0]||null;
function returnGear(m){ if(!m.eq) return; for(const sl of GEAR_SLOTS){ if(m.eq[sl]){ S.inv.push(m.eq[sl]); m.eq[sl]=null; } } }
function release(uid){ const m=S.army.find(x=>x.uid===uid); if(m) returnGear(m); S.army=S.army.filter(m=>m.uid!==uid); }
function giveGear(uid,u){
  if(S.mode==='battle') return;
  const m=S.army.find(x=>x.uid===uid), i=S.inv.findIndex(x=>x.u===u); if(!m||!m.armed||i<0) return;
  const it=S.inv[i], sl=ITEM[it.id].slot; m.eq=m.eq||{weapon:null,armor:null,relic:null};
  S.inv.splice(i,1); if(m.eq[sl]) S.inv.push(m.eq[sl]); m.eq[sl]=it; syncMinion(m); m.hp=Math.min(m.hp,m.maxHp);
}
function takeGear(uid,sl){
  if(S.mode==='battle') return;
  const m=S.army.find(x=>x.uid===uid); if(!m||!m.eq||!m.eq[sl]) return;
  const it=m.eq[sl]; if(S.inv.length>=bagMax()&&!ITEM[it.id].uq){ notify('Your bag is full. Make room first.','bad'); return; }
  S.inv.push(it); m.eq[sl]=null; syncMinion(m); m.hp=Math.min(m.hp,m.maxHp);
}

// ===== SKILLS =====
// One skill point per level. Each skill has three ranks; rank n needs level lv+(n-1)*SK_STEP.
// Actives cost mana and have a cooldown in turns (cooldowns reset each room). Passives always apply.
const SK_MAX=3, SK_STEP=5;
const SKILLS=[
 {id:'spear',name:'Bone Spear',type:'active',lv:2,cost:10,cd:2,desc:r=>'Hurl a lance of bone at your target for '+(70+15*r)+'% of your Strike plus Siphon. Pierces half of foe armor.'},
 {id:'bonearmor',name:'Bone Armor',type:'passive',lv:3,desc:r=>'+'+(6*r)+'% max HP.'},
 {id:'mend',name:'Dark Mending',type:'active',lv:4,cost:12,cd:3,desc:r=>'Knit your minions back together. Each one heals '+(15+8*r)+'% of its max HP, and you and your army are cured of bleeding, burns and poison.'},
 {id:'blast',name:'Corpse Explosion',type:'active',lv:5,cost:10,cd:3,desc:r=>'Detonate a body that fell this room. Every foe takes '+(60+20*r)+'% of your Siphon, ignoring armor. That body can no longer be raised.'},
 {id:'soulwell',name:'Soul Well',type:'passive',lv:6,desc:r=>'+'+r+' mana every turn in battle.'},
 {id:'curse',name:'Curse of Frailty',type:'active',lv:7,cost:8,cd:4,desc:r=>'Your target takes '+(15+10*r)+'% more damage from every source for 3 turns.'},
 {id:'robber',name:'Grave Robber',type:'passive',lv:8,desc:r=>'+'+(5*r)+'% gold from kills.'},
 {id:'gravepact',name:'Grave Pact',type:'passive',lv:9,desc:r=>'+'+(6*r)+'% minion power.'},
 {id:'chill',name:'Grave Chill',type:'active',lv:10,cost:14,cd:5,desc:r=>'Deal 50% of your Siphon and freeze your target for '+(r>=3?'2 turns':'1 turn')+'. Bosses resist '+(60-10*r)+'% of the time.'},
 {id:'scholar',name:'Forbidden Lore',type:'passive',lv:11,desc:r=>'+'+(4*r)+'% XP from kills.'},
 {id:'edge',name:'Necrotic Edge',type:'passive',lv:12,desc:r=>'Strike deals '+(10*r)+'% more damage.'},
 {id:'frenzy',name:'Unholy Frenzy',type:'active',lv:13,cost:15,cd:6,desc:r=>'Your minions deal '+(20+15*r)+'% more damage for 3 turns.'},
 {id:'mastery',name:'Master of Bones',type:'passive',lv:15,desc:r=>'+'+(4*r)+'% chance to raise the dead.'},
 {id:'calcify',name:'Calcified Hide',type:'passive',lv:16,desc:r=>'You take '+(2*r)+'% less damage.'},
 {id:'sanguine',name:'Sanguine Rites',type:'passive',lv:17,desc:r=>'+'+(8*r)+'% healing received.'},
 {id:'reap',name:'Reap',type:'active',lv:18,cost:18,cd:4,desc:r=>'Deal '+(120+30*r)+'% of your Siphon to your target, ignoring armor, doubled if it is below 35% HP.'},
 {id:'thrift',name:'Corpse Thrift',type:'passive',lv:20,desc:r=>'Raising costs '+(6*r)+'% less mana.'},
 {id:'deathless',name:'Deathless Will',type:'passive',lv:22,desc:r=>'+'+(5*r)+'% max mana.'}
];
const SKILL={}; SKILLS.forEach(s=>SKILL[s.id]=s);
const skReq=(s,rank)=>s.lv+(rank-1)*SK_STEP;
const activeSkills=()=>SKILLS.filter(s=>s.type==='active'&&sk(s.id)>0);
const freeCorpse=()=>S.run&&S.run.corpses.find(c=>!c.tried);
function skCd(id){ return (S.run&&S.run.cd&&S.run.cd[id])||0; }
function canUse(id){
  const s=SKILL[id]; if(S.mode!=='battle'||!s||s.type!=='active'||!sk(id)) return false;
  if(S.run.silence>0) return false;   // Hymn of Silence
  if(skCd(id)>0||S.player.mana<s.cost) return false;
  if(id==='blast'&&!freeCorpse()) return false;
  if(id==='mend'&&!S.army.some(m=>m.hp>0&&m.hp<m.maxHp)&&!allies().some(a=>a.dots)) return false;
  return true;
}
function useSkill(id,t){
  if(!canUse(id)) return false;
  const s=SKILL[id], rk=sk(id), r=S.run, P=S.player;
  P.mana-=s.cost; r.cd=r.cd||{}; r.cd[id]=s.cd+1; tally('sk_'+id);   // +1: the end-of-turn tick runs this same turn
  if(id==='spear'){ const d=hit((pAtk()+pSiph())*(.7+.15*rk)*pierceMul(hasMod('spear','a')?1:.5)); hurtFoe(t,d); log('Bone Spear impales '+t.name+' for '+d+'.');
    if(hasMod('spear','b')){ const o=liveFoes().filter(x=>x!==t); if(o.length){ const o2=pick(o), d2=Math.round(d*.5); hurtFoe(o2,d2); log('A splinter tears into '+o2.name+' for '+d2+'.'); } } }
  else if(id==='blast'){ const c=freeCorpse(); c.tried=true; c.result='exploded'; const base=pSiph()*(.6+.2*rk)*pierceMul(1)*(hasMod('blast','a')?1.3:1); let tot=0; for(const o of liveFoes()){ const d=hit(base); hurtFoe(o,d); tot+=d; if(hasMod('blast','b')) addDot(o,'poison',pSiph()*.15,3); } log('The body of '+c.name+' bursts apart, dealing '+tot+' damage across the room.'); }
  else if(id==='mend'){ let tot=0; const cured=allies().some(a=>a.dots); for(const m of S.army) if(m.hp>0) tot+=healAlly(m,Math.round(m.maxHp*(.15+.08*rk+(hasMod('mend','a')?.15:0)))); if(hasMod('mend','b')) tot+=healAlly(P,Math.round(pMax()*.15)); if(cured) tally('cures'); allies().forEach(clearDots); log('Dark Mending knits your army back together for '+tot+' HP'+(cured?' and cures every wound and burn':'')+'.','ok'); }
  else if(id==='curse'){ const turns=hasMod('curse','a')?5:3, bonus=.15+.1*rk;
    if(hasMod('curse','b')){ for(const o of liveFoes()){ o.curse={mul:1+bonus*.8,t:turns}; mark(o.id,0,0); } log('Every foe is cursed and takes '+Math.round(bonus*80)+'% more damage.'); }
    else { t.curse={mul:1+bonus,t:turns}; mark(t.id,0,0); log(t.name+' is cursed and takes '+Math.round(bonus*100)+'% more damage.'); } }
  else if(id==='chill'){ const d=hit(pSiph()*.5*dmgMul()); hurtFoe(t,d); const held=!t.boss||Math.random()*100<40+10*rk+(hasMod('chill','a')?20:0);
    if(held&&t.hp>0){ t.stun=rk>=3?2:1; tally('frozen'); log('Grave Chill hits '+t.name+' for '+d+' and freezes it solid.'); } else log('Grave Chill hits '+t.name+' for '+d+', but it shakes off the frost.'); }
  else if(id==='frenzy'){ r.frenzy=hasMod('frenzy','a')?5:3; r.frenzyMul=1+(.2+.15*rk); if(hasMod('frenzy','b')) for(const m of S.army) if(m.hp>0) healAlly(m,Math.round(m.maxHp*.15)); log('Unholy Frenzy: your army surges with '+Math.round((r.frenzyMul-1)*100)+'% more damage.','ok'); }
  else if(id==='reap'){ const low=t.hp<t.maxHp*(hasMod('reap','a')?.5:.35); let d=hit(pSiph()*(1.2+.3*rk)*pierceMul(1)); if(low) d*=2; hurtFoe(t,d); if(t.hp<=0&&hasMod('reap','b')) P.mana=Math.min(pMana(),P.mana+10); log('You reap '+t.name+' for '+d+(low?' (harvest)':'')+'.'); }
  return true;
}
function skillTick(){
  const r=S.run;
  if(r.cd) for(const k in r.cd) if(r.cd[k]>0) r.cd[k]--;
  if(r.frenzy>0) r.frenzy--;
  r.tt=(r.tt||0)+1;   // turns this run, for the fastest-clear record
  if(r.silence>0) r.silence--;
  if(r.taunt>0) r.taunt--;
  for(const e of r.enemies) if(e.curse&&--e.curse.t<=0) delete e.curse;
}
function learnSkill(id){
  const s=SKILL[id], P=S.player; if(!s||S.mode!=='town'||P.sp<=0) return;
  const rk=sk(id); if(rk>=SK_MAX||P.lvl<skReq(s,rk+1)) return;
  vitals(()=>{ P.skills[id]=rk+1; P.sp--; });
}
function resetSkills(){
  const P=S.player; if(S.mode!=='town') return;
  const spent=Object.values(P.skills).reduce((a,b)=>a+b,0); if(!spent) return;
  vitals(()=>{ P.skills={}; P.skMod={}; P.sp+=spent; }); P.hp=Math.min(P.hp,pMax()); P.mana=Math.min(P.mana,pMana());
  notify('Your skills are forgotten. '+spent+' skill point'+(spent>1?'s':'')+' returned.');
}

// ===== GOLD, TROPHIES AND THE MARKET =====
// Every kill drops a little gold and often a trophy of that enemy type. Trophies stack in a pouch (no bag space) and sell at the market.
// Like XP and items, a room's gold and trophies are only banked when the room is won.
const TROPHY_PART={vanguard:['Hide','Shell','Bone Plate','Scale'],striker:['Fang','Claw','Talon','Tooth'],mender:['Relic','Prayer Bead','Vial','Bone Charm'],reaper:['Fang','Claw']};
const TROPHY_VAL=[3,7,14,26,45,75];          // sell value of an ordinary trophy, per gate
const TROPHY={};                             // key -> {name, value, ico, rankI}
(function(){
  const h=s=>{ let x=0; for(const c of s) x=(x*31+c.charCodeAt(0))|0; return Math.abs(x); };
  const add=(key,name,value,ico,rankI,gate)=>{ if(!TROPHY[key]) TROPHY[key]={name,value,ico,rankI,gate}; };
  const part=(n,role)=>{ const p=TROPHY_PART[role]||TROPHY_PART.vanguard; return n+' '+p[h(n)%p.length]; };
  DUNGEONS.forEach((D,i)=>{ D.mobs.forEach(m=>add(m[0],part(m[0],m[1]),TROPHY_VAL[i],m[0],i,i)); add('b:'+D.boss[0],'Heart of '+D.boss[0],TROPHY_VAL[i]*10,D.boss[0],i,i); });
  TW_MOBS.forEach(m=>add('t:'+m[0],part(m[0],m[1]),40,m[0],4));
  TW_BOSS.forEach((n,i)=>add('b:'+n,'Heart of '+n,120*(i+1),n,5));
  SECRET.forEach((B,i)=>add('b:'+B.name,'Heart of '+B.name.replace(/^The /,''),TROPHY_VAL[i]*40,B.name,i,i));
})();
const trophyKey=e=>e.boss?'b:'+e.base:(e.tw?'t:':'')+e.base;
function killLoot(e,r){   // called once per kill, from checkDeaths
  const cursed=runMod()?MOD_GOLD:1;
  const coin=Math.max(1,Math.round((1+e.lvl*.5)*(1+e.rankI*.5)*(e.boss?5:1)*(e.secret?SB_REWARD:1)*(e.elite?2:1)*rnd(.7,1.3)*ngpReward()*cursed*heatK('gold')*(roomKind()==='elite'?ELITE_GOLD:1)*(1+xb('goldp')/100)));
  r.gold=(r.gold||0)+coin;
  const key=trophyKey(e); if(!TROPHY[key]) return;
  const n=(e.boss?1:e.elite?2:(Math.random()<.6?1:0))*cursed;
  if(n){ r.troph=r.troph||{}; r.troph[key]=(r.troph[key]||0)+n; }
}
function bankLoot(r){     // called when a room is won
  r.lastGold=r.gold||0; if(r.lastGold) sfx('coin'); r.lastTroph=r.troph||{};
  S.gold+=r.lastGold; r.goldTot=(r.goldTot||0)+r.lastGold; for(const k in r.lastTroph) S.trophies[k]=(S.trophies[k]||0)+r.lastTroph[k];
  r.gold=0; r.troph={};
}
// Potions: carried on the belt, drunk in battle as your action.
const BELT_MAX=3;
const POTIONS={
  hp:{name:'Healing Draught',key:'Q',desc:'Restores 35% of your max HP and cures bleeding, burns and poison. Drinking it uses your turn.',price:()=>15+S.player.lvl*5},
  mp:{name:'Mana Tonic',key:'W',desc:'Restores 40% of your max mana. Drinking it uses your turn.',price:()=>12+S.player.lvl*4}
};
function drink(k){
  const P=S.player; if(!S.belt[k]) return false;
  if(k==='hp'){ if(P.hp>=pMax()&&!P.dots) return false; S.belt.hp--; const h=healAlly(P,Math.round(pMax()*.35)), cured=!!P.dots; clearDots(P); tally('drank'); if(cured) tally('cures'); log('You drink a Healing Draught and recover '+h+' HP'+(cured?'. Your wounds close':'')+'.','ok'); }
  else { if(P.mana>=pMana()) return false; S.belt.mp--; tally('drank'); const m=Math.min(pMana()-P.mana,Math.round(pMana()*.4)); P.mana+=m; mark('p',0,0); log('You drink a Mana Tonic and recover '+m+' mana.','ok'); }
  return true;
}
// Market prices. Gear sells for a quarter of what the merchant asks. Uniques cannot be sold.
const SET_PRICE=[30,80,200,480,1100,2400];
const buyPrice=d=>SET_PRICE[Math.min(d.set,5)];
const sellPrice=d=>d.uq?0:Math.max(1,Math.round(buyPrice(d)*.25));
const sellValue=it=>{ const d=ITEM[it.id]; return d.uq?0:Math.round(sellPrice(d)*(1+.25*((it.ro&&it.ro.length)||0))); };   // each bonus line adds a quarter
const STOCK_N=4;
function shopStock(){   // four pieces of gear from your highest unlocked gate (and the one below); new every day and whenever a gate unlocks
  let g=0; for(let i=0;i<RK.length;i++) if(S.player.lvl>=RK[i].unlock) g=i;
  if(!S.shop||S.shop.day!==S.day||S.shop.g!==g){
    const pool=Object.values(ITEM).filter(d=>!d.uq&&d.set<=g&&d.set>=g-1), ids=[];
    while(ids.length<Math.min(STOCK_N,pool.length)){ const d=pick(pool); if(!ids.includes(d.id)) ids.push(d.id); }
    S.shop={day:S.day,g,stock:ids.map(id=>{ const s={id,sold:false}, ro=rollItem(id); if(ro) s.ro=ro; return s; })};   // rolls are shown before you buy
  }
  return S.shop.stock;
}
function buyPotion(k){ const p=POTIONS[k], cost=p&&p.price(); if(!p||S.mode!=='town'||S.belt[k]>=BELT_MAX||S.gold<cost) return false; S.gold-=cost; S.belt[k]++; sfx('coin'); return true; }
function buyStock(i){
  const s=shopStock()[i]; if(!s||s.sold||S.mode!=='town') return false; const d=ITEM[s.id], cost=buyPrice(d);
  if(S.gold<cost||S.inv.length>=bagMax()) return false;
  S.gold-=cost; s.sold=true; addItem(s.id,s.ro||null); sfx('coin'); return true;
}
function sellTrophy(k,all){ const n=S.trophies[k]||0; if(!n||!TROPHY[k]||S.mode!=='town') return 0; const q=all?n:1; S.trophies[k]-=q; if(!S.trophies[k]) delete S.trophies[k]; const g=q*TROPHY[k].value; S.gold+=g; tally('soldTro',q); sfx('coin'); return g; }
function sellAllTrophies(){ let g=0; for(const k of Object.keys(S.trophies)) g+=sellTrophy(k,true); return g; }
// Gold sinks: the Bone Altar levels a minion up (never past the usual cap of your level + 2), bag upgrades add space, salts help raising.
const empowerCost=m=>Math.round(mneed(m.lvl)*.6*(1-.1*bl('altar')));
function empower(uid){
  const m=S.army.find(x=>x.uid===uid); if(!m||S.mode!=='town'||m.lvl>=S.player.lvl+2) return false;
  const c=empowerCost(m); if(S.gold<c) return false;
  S.gold-=c; m.lvl++; m.xp=0; tally('emp'); checkEvolve(m); syncMinion(m); m.hp=m.maxHp; sfx('raise'); return true;
}
function buyBag(){ const lv=S.bagLv||0, c=BAG_COST[lv]; if(S.mode!=='town'||c==null||S.gold<c) return false; S.gold-=c; S.bagLv=lv+1; sfx('coin'); return true; }
function buySalt(){ const c=saltPrice(); if(S.mode!=='town'||S.salts>=SALT_MAX||S.gold<c) return false; S.gold-=c; S.salts++; sfx('coin'); return true; }

// Trophy forge: 6 trophies from one gate (a boss heart counts as 5) plus some gold forge a piece of that gate's gear in the slot
// you choose, with a 20% chance of a masterwork from the next gate's set. Any 4 trophies brew a potion.
const FORGE_N=6, FORGE_GOLD=.3, MASTERWORK=.2, BREW_N=4;
const trophyGate=k=>{ const t=TROPHY[k]; return (t&&t.gate!=null)?t.gate:-1; };
const trophyPts=k=>k.startsWith('b:')?5:1;
function forgePoints(gi){ let n=0; for(const k in S.trophies) if(trophyGate(k)===gi) n+=S.trophies[k]*trophyPts(k); return n; }
const forgeGold=gi=>Math.round(SET_PRICE[gi]*FORGE_GOLD);
function spendTrophies(keys,need,pts){   // cheapest first, boss hearts last
  keys.sort((a,b)=>trophyPts(a)-trophyPts(b)||TROPHY[a].value-TROPHY[b].value);
  for(const k of keys){ while(need>0&&S.trophies[k]>0){ S.trophies[k]--; need-=pts(k); } if(!S.trophies[k]) delete S.trophies[k]; if(need<=0) break; }
}
function forgeGear(gi,slot){
  if(S.mode!=='town'||forgePoints(gi)<FORGE_N||S.gold<forgeGold(gi)||S.inv.length>=bagMax()||!SLOTS[slot]) return null;
  const set=(gi<5&&Math.random()<MASTERWORK)?gi+1:gi, pool=Object.values(ITEM).filter(d=>!d.uq&&d.set===set&&d.slot===slot); if(!pool.length) return null;
  S.gold-=forgeGold(gi); spendTrophies(Object.keys(S.trophies).filter(k=>trophyGate(k)===gi),FORGE_N,trophyPts);
  const it=addItem(pick(pool).id); sfx('level'); if(set>gi) tally('master'); return {it,master:set>gi};
}
function brew(k){
  const n=Object.values(S.trophies).reduce((a,b)=>a+b,0);
  if(S.mode!=='town'||!POTIONS[k]||S.belt[k]>=BELT_MAX||n<BREW_N) return false;
  spendTrophies(Object.keys(S.trophies),BREW_N,()=>1); S.belt[k]++; sfx('heal'); return true;
}

// ===== MINION TRAITS AND EVOLUTION =====
// Every raised minion rolls a trait (bosses two). At 5, 10, 18 and 28 levels above the level it was raised at, it evolves:
// Greater, Elder, Ancient, then Eternal. Each stage has its own buff (STAGE_FX) and brings one more trait.
const TRAITS={
  thick:     {name:'Thick-boned', desc:'+25% max HP.'},
  vicious:   {name:'Vicious',     desc:'+20% attack.'},
  frenzied:  {name:'Frenzied',    desc:'20% chance to strike twice.'},
  leech:     {name:'Leeching',    desc:'Heals itself for 25% of the damage it deals.'},
  stalwart:  {name:'Stalwart',    desc:'Takes 20% less damage.'},
  gravebound:{name:'Grave-bound', desc:'Never shatters when downed.'},
  venom:     {name:'Venomous',    desc:'Its hits poison the target for 3 turns.'},
  wrathful:  {name:'Wrathful',    desc:'+40% attack while below half HP.'},
  warded:    {name:'Warded',      desc:'Immune to bleeding, burns and poison.'}
};
const TRAIT_IDS=Object.keys(TRAITS), STAGES=['','Greater ','Elder ','Ancient ','Eternal '], STAGE_MAX=STAGES.length-1, EVOLVE_STEP=5;
const EVOLVE_AT=[0,5,10,18,28];   // levels above the level it was raised at
const STAGE_FX=[{hp:0,atk:0},{hp:.2,atk:.1},{hp:.1,atk:.2},{hp:.15,atk:.15},{hp:.2,atk:.2}];   // what each stage adds (Greater is sturdier, Elder hits harder)
const stageMul=(m,k)=>{ let t=1; for(let i=1;i<=(m.stage||0)&&i<=STAGE_MAX;i++) t+=STAGE_FX[i][k]; return t; };
const evoNext=m=>{ const st=m.stage||0; return st<STAGE_MAX&&m.lvl0!=null?m.lvl0+EVOLVE_AT[st+1]:null; };
const fxText=f=>'+'+Math.round(f.hp*100)+'% HP, +'+Math.round(f.atk*100)+'% ATK';
const hasTrait=(m,t)=>!!(m.traits&&m.traits.includes(t));
const mName=m=>{ const s=STAGES[m.stage||0]; return m.name.startsWith('The ')?'The '+s+m.name.slice(4):s+m.name; };   // "The Elder Rat King", "Greater Crypt Ghoul"
const withArticle=n=>n.startsWith('The ')?n:(/^[AEIOU]/i.test(n)?'an ':'a ')+n;
const theName=n=>n.startsWith('The ')?n:'the '+n;
// Commander: never rolled like the others. Only a raised elite or boss can have it (at the raise, or when it evolves).
TRAITS.commander={name:'Commander',desc:'Can lead a raid on a cleared gate from the War table while you stay behind.'};
const CMD_ELITE=.2, CMD_BOSS=.4;   // chance an elite or a boss rises as a Commander (and again at each evolution)
const canLead=m=>!!(m&&(m.elite||m.boss));
function rollTrait(have){ const left=TRAIT_IDS.filter(t=>!have.includes(t)); return left.length?pick(left):null; }
function rollCommand(m){ if(canLead(m)&&!hasTrait(m,'commander')&&Math.random()<(m.boss?CMD_BOSS:CMD_ELITE)){ m.traits.push('commander'); return true; } return false; }
function checkEvolve(m){
  m.traits=m.traits||[]; if(m.lvl0==null) m.lvl0=m.lvl;
  while((m.stage||0)<STAGE_MAX&&m.lvl>=m.lvl0+EVOLVE_AT[(m.stage||0)+1]){
    m.stage=(m.stage||0)+1; const t=rollTrait(m.traits); if(t) m.traits.push(t); const led=rollCommand(m); tally('evolved'); if(m.stage===2) tally('elder'); if(m.stage===3) tally('ancient'); if(m.stage===4) tally('eternal');
    const msg=m.nick+' evolves into '+withArticle(mName(m))+(t?' and becomes '+TRAITS[t].name:'')+(led?'. It can now lead raids as a Commander':'')+'.'; moment(m.nick+' evolves: '+mName(m),'ok');
    if(S.run&&S.mode!=='battle') S.run.events.push({m:msg,c:'ok'}); else notify(msg,'ok');
    sfx('level');
  }
}

// ===== COMMANDER RAIDS =====
// A Commander (a raised elite or boss with that trait) leads a squad against a gate you have cleared, on Normal, while you
// hunt elsewhere. The squad is away until dawn: it still fills its slots. Win: gold, up to three pieces of gear (never a
// unique) and XP for every member. Loss: each follower may fall (Grave-bound never do); the Commander always comes home.
const RAID_SQUAD=2, RAID_K=.6, RAID_MIN=.05, RAID_MAX=.95, RAID_GOLD=3, RAID_XP=.5, RAID_LOSS=.3, RAID_LOG=6;
const isCommander=m=>hasTrait(m,'commander')&&canLead(m);
const raidN=()=>((S&&S.raids)||[]).reduce((a,x)=>a+x.units.length,0);
const armyUsed=()=>S.army.length+raidN();
const squadMax=m=>1+RAID_SQUAD+(m.stage||0)+(m.boss?1:0);   // the Commander and its followers
const raidGates=()=>DUNGEONS.map((D,i)=>i).filter(i=>S.ti&&S.ti.clr&&S.ti.clr[i]);
function gateThreat(di){ const lv=RK[di].lv+2, f=mobStats(di,lv,1,1,false,false), b=mobStats(di,lv+2,1,1,true,false); return {hp:f.hp*13+b.hp,atk:f.atk*3+b.atk*.5}; }
function bestSquad(){ const c=S.army.filter(isCommander).sort((a,b)=>b.atk*b.maxHp-a.atk*a.maxHp)[0]; if(!c) return null;
  return [c].concat(S.army.filter(m=>m!==c).sort((a,b)=>b.atk*b.maxHp-a.atk*a.maxHp).slice(0,squadMax(c)-1)); }   // what a gate card's raid odds assume
function raidOdds(units,di){
  if(!units.length||!RK[di]) return 0; const T=gateThreat(di); let atk=0,hp=0; for(const m of units){ atk+=m.atk; hp+=m.maxHp; }
  const c=units.find(isCommander), lead=c?1+.1*(c.stage||0)+(c.boss?.15:0):1, x=Math.sqrt(atk*hp/(T.hp*T.atk))*lead/RAID_K;   // the squad's strength against the gate's, like for like
  return clamp(x/(1+x),RAID_MIN,RAID_MAX);
}
function sendRaid(cu,di,uids){
  if(S.mode!=='town') return false; const c=S.army.find(m=>m.uid===cu); if(!isCommander(c)||!raidGates().includes(di)) return false;
  const fol=[...new Set(uids||[])].map(u=>S.army.find(m=>m.uid===u&&m!==c)); if(fol.some(m=>!m)||!fol.length||fol.length>squadMax(c)-1) return false;   // a Commander never marches alone
  const units=[c].concat(fol); S.army=S.army.filter(m=>!units.includes(m)); S.raids=S.raids||[]; S.raids.push({di,day:S.day,units}); tally('raidsSent'); sfx('raise'); return true;
}
function recallRaid(i){ if(S.mode!=='town'||!S.raids||!S.raids[i]) return false; const x=S.raids.splice(i,1)[0]; x.units.forEach(syncMinion); S.army.push(...x.units); return true; }   // stats catch up with gear and Will changed while they were away
function resolveRaid(x){
  const D=DUNGEONS[x.di], lead=x.units[0], won=Math.random()<raidOdds(x.units,x.di); let msg, lost=[];
  if(won){
    const g=Math.round((15+S.player.lvl*4)*(1+x.di)*RAID_GOLD*ngpReward()); S.gold+=g; let items=0, full=0;
    for(let i=0;i<3;i++){ if(i===2&&Math.random()<.5) break; const id=pickNorm(tableFor(x.di,'vanguard',i===0,false).filter(r=>!ITEM[r.id].uq)); if(addItem(id)) items++; else full++; }
    x.units.forEach(m=>minionXp(m,Math.round(mneed(m.lvl)*RAID_XP))); tally('raidWins');
    msg=lead.nick+' is back from the '+D.name+' in triumph: +'+g+' gold'+(items?', '+items+' piece'+(items>1?'s':'')+' of gear':'')+(full?' ('+full+' left behind: your bag is full)':'')+'.';
  } else {
    x.units.forEach((m,i)=>{ if(i>0&&!hasTrait(m,'gravebound')&&Math.random()<RAID_LOSS){ lost.push(m); returnGear(m); } });
    x.units=x.units.filter(m=>!lost.includes(m)); x.units.forEach(m=>minionXp(m,Math.round(mneed(m.lvl)*RAID_XP*.25)));
    msg=lead.nick+'\'s raid on the '+D.name+' was thrown back'+(lost.length?'. Fallen: '+lost.map(m=>m.nick).join(', '):'. Everyone made it home')+'.';
  }
  x.units.forEach(syncMinion); S.army.push(...x.units); notify(msg,won?'ok':'bad');
  S.raidLog=[{day:S.day,di:x.di,won,nick:lead.nick,lost:lost.length}].concat(S.raidLog||[]).slice(0,RAID_LOG);
  return {won,lost:lost.length};
}
function resolveRaids(){ const out=S.raids||[]; S.raids=[]; return out.map(resolveRaid); }
function raidDayLine(rr){ if(!rr||!rr.length) return ''; const w=rr.filter(x=>x.won).length, b=rr.length-w, f=rr.reduce((a,x)=>a+x.lost,0);   // one line for the new-day message
  return ' Raids: '+[w?w+' won':'',b?b+' thrown back':'',f?f+' fallen':''].filter(Boolean).join(', ')+'.'; }

// ===== THE RIFT =====
// Endless endgame: from level 40, once the Throne of Ash has fallen. Each depth is a five-room run through a random gate's
// dead, risen to your level and hardened by depth; rewards rise with it. Clearing your deepest depth opens the next and
// leaves an extra legendary.
const RIFT_LV=40, RIFT_ROOMS=5, RIFT_STEP=.1, RIFT_DROP=.05, RIFT_DROP_MAX=2.5;
const riftOpen=()=>!!(S.ti&&S.ti.clr&&S.ti.clr[5])&&S.player.lvl>=RIFT_LV;
const riftBest=()=>(S.rift&&S.rift.best)||0;
const riftMul=n=>1+RIFT_STEP*(n-1);
const riftLvl=n=>S.player.lvl+Math.floor(n/3);
function startRift(n){
  n=Math.floor(+n); if(S.mode!=='town'||S.watches<=0||!riftOpen()||!(n>=1&&n<=riftBest()+1)) return false;
  const di=Math.floor(Math.random()*DUNGEONS.length);
  S.watches--; S.runs++; S.notices=[];
  S.run={di,rift:n,room:0,rooms:RIFT_ROOMS,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:null,heat:0};
  S.mode='battle'; titheSouls(); tally('riftRuns');
  log('You tear the Rift open at depth '+n+'. The dead of the '+DUNGEONS[di].name+' wait beyond it.');
  spawnRoom(); return true;
}
function riftScale(list){   // rift foes stand at the deepest gate's strength, at your level, hardened by depth
  const r=S.run, n=r.rift; if(!n) return;
  for(const e of list){ const a=mobStats(5,e.lvl,1,1,false,false), b=mobStats(e.rankI,e.lvl,1,1,false,false), k=riftMul(n);
    e.maxHp=e.hp=Math.round(e.maxHp*a.hp/b.hp*k); e.atk=Math.max(1,Math.round(e.atk*a.atk/b.atk*k)); e.rankI=5; e.rift=true; }
}
function riftCleared(r){
  r.cleared=true; S.quest.clears++; tally('rifts'); S.rift=S.rift||{best:0};
  if(r.rift>S.rift.best){ S.rift.best=r.rift; r.riftRec=true; recBest('rift',r.rift); const pool=Object.values(ITEM).filter(d=>!d.uq&&!d.tower&&d.tier===4); r.loot.push(pick(pool).id);
    moment('Rift depth '+r.rift+' conquered','gold'); }
  if(!r.hurt) tally('flawless');
  return Math.round(RK[5].clear*(1+.15*r.rift));
}

// ===== FIRST-TIME TIPS =====
// Each tip shows once, the first time its moment comes up. Seen tips are stored in S.tips; Settings can bring them back.
const TIPS=[
  {id:'stats',  t:'Spend your points', m:'Strength powers Strike, Constitution your HP, Intelligence your mana, Siphon and Ward, and Will your army size and raise odds. Press + next to a stat.', when:()=>S.mode==='town'&&S.player.pts>0&&S.player.lvl===1},
  {id:'battle', t:'How a fight works', m:'Pick a target and your army attacks it with you. Strike (1) refills mana, Soul Siphon (2) drains, heals and harvests a Soul, Bone Ward (3) shields you. Then every foe hits back.', when:()=>S.mode==='battle'},
  {id:'raise',  t:'Raise the dead', m:'Every foe you kill leaves a body. Raising costs mana and can fail; the better your Will and level, the better your odds. Raised minions fight for you and grow with every room.', when:()=>S.mode==='raise'&&S.run&&S.run.corpses.length>0},
  {id:'skill',  t:'You have a skill point', m:'Open the Skills tab and learn Bone Spear. Active skills appear in battle on keys 4 and up. You get one point every level.', when:()=>S.mode==='town'&&S.player.sp>0},
  {id:'armor',  t:'These foes wear armor', m:'Armor blunts every hit you and your army land, so fights take longer. Bone Spear pierces half of it, and Corpse Explosion and Reap ignore it completely.', when:()=>S.mode==='battle'&&foeArmor()>=.5},
  {id:'boss',   t:'A boss is winding up', m:'Moves marked Charging land next turn. Raise Bone Ward to soak the hit, or freeze the boss with Grave Chill to break its focus and cancel the move.', when:()=>S.mode==='battle'&&S.run&&liveFoes().some(e=>e.charging)},
  {id:'trophy', t:'Trophies', m:'Fallen foes drop trophies. Sell them at the Market, forge six from one gate into gear, or brew four into a potion.', when:()=>S.mode==='town'&&Object.keys(S.trophies).length>0},
  {id:'market', t:'The Bone Market', m:'Buy potions (drunk in battle with Q and W) and Grave Salts, buy or forge gear, empower minions at the Bone Altar, and sell what you do not need.', when:()=>S.mode==='town'&&ui.tab==='market'},
  {id:'trait',  t:'Minion traits', m:'Every raised minion carries a trait, like Vicious or Grave-bound. Minions evolve at 5 and 10 levels above the level they were raised at, growing stronger and gaining another trait.', when:()=>S.army.some(m=>m.traits&&m.traits.length)},
  {id:'defeat', t:'You fell', m:'Falling costs that room\'s spoils and some XP, but you keep everything from rooms you already cleared. Come back stronger, or try an easier gate.', when:()=>S.mode==='defeat'},
  {id:'event',  t:'Something between rooms', m:'Sometimes a room leaves something behind: a blood shrine, a pedlar, a sealed coffer or a wounded straggler. Each offers a choice. Walking past is always safe.', when:()=>S.mode==='raise'&&S.run&&S.run.event&&!S.run.event.done},
  {id:'dots',   t:'Bleeding and burns', m:'Enemy strikers\' crits make you bleed, and Cinder Waves burn. These tick at the end of each turn and ignore your ward. A Healing Draught cures you; Dark Mending cures your whole side.', when:()=>S.mode==='battle'&&allies().some(a=>a.dots)},
  {id:'rolls',  t:'Bonus lines', m:'Gear can roll extra stat lines, shown in green under its base stats. Each line raises the sell price. Reforge (Gear tab) re-rolls them for gold.', when:()=>S.mode==='town'&&S.inv.some(it=>it.ro)},
  {id:'curse',  t:'A cursed gate', m:'Each day one gate you have cleared is cursed with a twist that makes it harder. In return it pays double gold and trophies, more XP and more gear.', when:()=>S.mode==='town'&&(ui.tab||'gates')==='gates'&&dayMod().gi>=0},
  {id:'doors',  t:'Choose your way', m:'Pick the next room: an ordinary fight, a bloodied arch with stronger foes and better loot, a quiet ossuary to rest, or a sealed vault.', when:()=>S.mode==='raise'&&S.run&&S.run.doors&&S.run.doors.length>1},
  {id:'cmd',    t:'Give orders', m:'Each kind of minion can take one order per room, for free: Taunt, Focus, Bone Shield or Execute. The buttons sit above your skills.', when:()=>S.mode==='battle'&&S.army.some(m=>m.hp>0)},
  {id:'skmod',  t:'Choose an upgrade', m:'One of your skills reached its last rank. Open the Skills tab and choose one of its two upgrades.', when:()=>S.mode==='town'&&SKILLS.some(x=>sk(x.id)>=SK_MAX&&!skMod(x.id))},
  {id:'affix',  t:'Elite affixes', m:'Elites carry affixes, shown on their card: Shielded, Splitting, Vampiric, Enraged or Warded. Hover one to read it. Raise a fallen elite and the minion keeps one as a trait.', when:()=>S.mode==='battle'&&S.run&&liveFoes().some(e=>e.aff)},
  {id:'phase',  t:'A second phase', m:'At half HP a boss turns dangerous: it moves sooner and adds Sundering Blow. Every move is announced a turn ahead. Taunt sends the blow at a vanguard, and a Focus crit or Grave Chill breaks a charging move.', when:()=>S.mode==='battle'&&S.run&&liveFoes().some(e=>e.phase2)},
  {id:'bounty', t:'A bounty is done', m:'You finished a contract on the bounty board in the side panel. Claim it in town before dawn.', when:()=>S.mode==='town'&&S.bounty&&S.bounty.day===S.day&&S.bounty.list.some(b=>!b.claimed&&bountyDone(b))},
  {id:'salvage',t:'Salvage and enchant', m:'Gear you will not wear can be salvaged into bone dust on the Gear tab. Dust enchants gear (add or re-roll a bonus line) and builds the higher levels of town buildings.', when:()=>S.mode==='town'&&ui.tab==='gear'&&S.inv.length>=6&&workOpen()},
  {id:'townopen',t:'The town opens', m:'A Town tab has appeared: build up the necropolis and fuse minions in the Flesh Pit. A bounty board in the side panel now posts three contracts every dawn.', when:()=>S.mode==='town'&&townOpen()},
  {id:'faith',  t:'The Old Shrine', m:'At level 8 the Old Shrine on the Town tab takes an oath: Honored One or Dishonored One. Each path gives a bonus and takes something in return.', when:()=>S.mode==='town'&&townOpen()&&S.player.lvl>=FAITH_LV&&!faithOf()},
  {id:'ult',    t:'Your ultimate awaits', m:'At level 20 you can choose an ultimate on the Skills tab. Soul Siphon, elites and bosses give Souls; with five, press R in battle to unleash it.', when:()=>S.mode==='town'&&S.player.lvl>=ULT_LV&&!S.player.ult},
  {id:'raid',   t:'A Commander', m:'One of your minions can lead. Open the War table under the Gates tab to send it and a squad against a gate you have cleared. They come back at dawn.', when:()=>S.mode==='town'&&S.army.some(isCommander)},
  {id:'rift',   t:'The Rift', m:'The Rift is open, under the Gates tab. Every depth is harder than the last, and there is no bottom.', when:()=>S.mode==='town'&&riftOpen()},
  {id:'heat',   t:'Harder gates', m:'You have cleared a gate, so its card now offers Hard difficulty: stronger foes for more XP, gold and gear. Clear each level to open the next. On a cursed day the two stack.', when:()=>S.mode==='town'&&!T_('heat1')&&DUNGEONS.some((D,i)=>heatMax(i)>0)},
  {id:'bless',  t:'Full devotion', m:'You have kept your oath long enough: its blessing is now active. The Old Shrine on the Town tab shows what it does.', when:()=>S.mode==='town'&&!!faithOf()&&blessed(faithOf())},
  {id:'records',t:'Records', m:'The Ledger tab keeps your best: deepest floor, biggest hit, most kills, and the fastest clear of each gate. Beat one and you will hear about it.', when:()=>S.mode==='town'&&S.runs>=10},
  {id:'nightmare',t:'Nightmare', m:'A gate now offers Nightmare: foes three times as strong, rewards to match, and a title of its own for the clear.', when:()=>S.mode==='town'&&DUNGEONS.some((D,i)=>heatMax(i)>=3)},
  {id:'omen',   t:'An omen', m:'Some days carry an omen that touches every gate and the Tower. Today\'s is shown above the gates.', when:()=>S.mode==='town'&&!!omen()},
  {id:'tower',  t:'The Hell Tower is open', m:'A separate 100-floor climb, one fight per floor, with a unique relic on every tenth floor. Floors you clear become checkpoints.', when:()=>S.mode==='town'&&S.player.lvl>=TW.unlock},
];
const currentTip=()=>{ if(!S||(S.tips&&S.tips.off)) return null; try{ return TIPS.find(t=>!(S.tips&&S.tips[t.id])&&t.when())||null; }catch(e){ return null; } };
function dismissTip(id){ S.tips=S.tips||{}; S.tips[id]=1; }

// ===== BOSS ABILITIES =====
// Every gate boss has a signature move it uses every few turns instead of attacking. Moves marked warn are telegraphed a turn
// ahead: raise Bone Ward, or freeze the boss with Grave Chill to break its focus and cancel the move. Tower wardens borrow these.
const BOSS_ABIL={
  swarm:   {name:'Call the Swarm', every:3,warn:false,desc:'Calls two more of its kind into the fight.'},
  bonewall:{name:'Bone Wall',      every:4,warn:false,desc:'Shields every foe for 20% of its max HP (a shield holds at most 40%).'},
  cinder:  {name:'Cinder Wave',    every:3,warn:true, desc:'Hits you and every minion for 70% of its attack and burns each of you for 2 turns.'},
  hymn:    {name:'Hymn of Silence',every:4,warn:true, desc:'Silences your skills for 2 turns and mends every foe for 10% of its max HP.'},
  seedfall:{name:'Seedfall',       every:4,warn:false,desc:'Mends every foe for 15% of its max HP and sprouts a new one.'},
  decree:  {name:'Royal Decree',   every:4,warn:true, desc:'One blow worth 45% of your max HP. Ward soaks it.'},
  sunder:  {name:'Sundering Blow', every:3,warn:true, desc:'One blow worth 35% of your max HP. Taunt turns it onto a vanguard; a Focus crit or Grave Chill breaks it.'}
};
const GATE_ABIL=['swarm','bonewall','cinder','hymn','seedfall','decree'];
const SUMMON_CAP=4;   // adds a boss may call per fight, so a fight cannot be farmed forever
function giveAbility(e,id,faster){ e.abil=id; e.abilT=BOSS_ABIL[id].every-(faster||0); e.summoned=0; e.fast=faster||0; }
function bossTurn(e){   // true if the boss spent its turn on its ability (or on gathering for it)
  if(!BOSS_ABIL[e.abil]) return false;
  const gap=mv=>Math.max(2,BOSS_ABIL[mv].every-(e.fast||0)-(omen()==='ashfall'?1:0));
  if(e.charging){ const mv=e.move||e.abil; e.charging=false; e.move=null; e.abilT=gap(mv); fireAbility(e,mv); return true; }
  if(--e.abilT>0) return false;
  const mv=e.phase2&&e.alt?'sunder':e.abil, A=BOSS_ABIL[mv]; if(e.phase2) e.alt=!e.alt;   // the second phase alternates with Sundering Blow
  if(A.warn||e.phase2){ e.charging=true; e.move=mv; log(e.name+' gathers itself for '+A.name+'! '+A.desc,'bad'); sfx('warn'); return true; }
  e.abilT=gap(mv); fireAbility(e,mv); return true;
}
function summonAdd(e){
  if(e.summoned>=SUMMON_CAP||liveFoes().length>=5) return null;
  const mk=()=>e.tw?makeTowerEnemy(e.tw,false,-1):makeEnemy(e.rankI,Math.max(1,e.lvl-2),false), hasMender=liveFoes().some(x=>x.role==='mender');
  let a=mk(); for(let i=0;i<30&&hasMender&&a.role==='mender';i++) a=mk(); if(hasMender&&a.role==='mender') return null;   // never a second mender (bug found in play-testing)
  if(e.tw) foeScale([a],TW.foeAtk); else { foeScale([a],foeAtkMul(S.run.di)); bulwark([a]); }
  affixAll([a]); e.summoned++; S.run.enemies.push(a); return a;
}
function fireAbility(e,mv){
  mv=mv||e.abil; const r=S.run, P=S.player, A=BOSS_ABIL[mv], foes=liveFoes();
  if(mv==='swarm'){ const got=[summonAdd(e),summonAdd(e)].filter(Boolean); log(got.length?e.name+' uses '+A.name+': '+got.map(x=>x.name).join(' and ')+' join the fight.':e.name+' calls, but nothing more answers.','bad'); }
  else if(mv==='bonewall'){ foes.forEach(f=>{ f.shield=Math.min(Math.round(f.maxHp*.4),(f.shield||0)+Math.round(f.maxHp*.2)); }); log(e.name+' raises a Bone Wall. Every foe is shielded.','bad'); }
  else if(mv==='cinder'){ let tot=0; allies().filter(a=>a.hp>0).forEach(a=>{ const d=hit(e.atk*(e.secret?.45:.7)*enrage(e));   /* a secret master's wave is spread thinner: at full strength it wiped every army */ hurtAlly(a,d); addDot(a,'burn',e.atk*.15,2); tot+=d; if(a.hp<=0&&a.id!=='p') log(a.nick+' is down.','bad'); }); log(e.name+' unleashes a Cinder Wave for '+tot+' damage across your side.','bad'); }
  else if(mv==='hymn'){ r.silence=3; foes.forEach(f=>{ f.hp=Math.min(f.maxHp,f.hp+Math.round(f.maxHp*.1)); }); log(e.name+' sings the Hymn of Silence. Your skills are silenced for 2 turns and every foe mends.','bad'); }
  else if(mv==='seedfall'){ foes.forEach(f=>{ f.hp=Math.min(f.maxHp,f.hp+Math.round(f.maxHp*.15)); }); const a=summonAdd(e); log(e.name+' scatters Seedfall. Every foe mends'+(a?' and '+a.name+' sprouts from the ground':'')+'.','bad'); }
  else if(mv==='decree'){ const d=Math.round(pMax()*.45*enrage(e)); hurtAlly(P,d); log(e.name+' speaks a Royal Decree. It strikes you for '+d+'.','bad'); }
  else if(mv==='sunder'){ const v=r.taunt>0?S.army.filter(m=>m.role==='vanguard'&&m.hp>0):[];
    if(v.length){ const t=pick(v), d=hit(e.atk*2.2*enrage(e)); hurtAlly(t,d); log(e.name+' brings down a Sundering Blow, but '+t.nick+' takes it for you: '+d+' damage.'+(t.hp<=0?' '+t.nick+' is down.':''),'bad'); }
    else { const d=Math.round(pMax()*.35*enrage(e)); hurtAlly(P,d); log(e.name+' brings down a Sundering Blow on you for '+d+'.','bad'); } }
  sfx('boss');
}
function playerFalls(){   // the player hit 0 HP: revive from gear if possible, otherwise the run is lost. True if defeated.
  const r=S.run, P=S.player, lim=hasFlag('deathless')?2:hasFlag('undying')?1:0;
  if((r.revives||0)<lim){ r.revives=(r.revives||0)+1; P.hp=Math.round(pMax()*(hasFlag('deathless')?.5:.3)); log('Your armor refuses to break. You rise at '+P.hp+' HP.','ok'); return false; }
  if(blessed('hon')&&!r.tw&&!r.grace){ r.grace=true; P.hp=Math.max(1,Math.round(pMax()*GRACE_HP)); tally('graced'); log('The Old Gods will not let you fall. You rise at '+P.hp+' HP.','story'); moment('Grace','gold'); return false; }
  defeat(); return true;
}
function sellItem(u){ if(S.mode!=='town') return 0; const i=S.inv.findIndex(x=>x.u===u); if(i<0) return 0; const it=S.inv[i], d=ITEM[it.id]; if(d.uq||it.lk) return 0; S.inv.splice(i,1); const g=sellValue(it); S.gold+=g; tally('soldItems'); sfx('coin'); return g; }
const isJunk=it=>{ const d=ITEM[it.id]; return !!d&&!d.uq&&!it.lk&&d.tier<=1; };   // Common and Uncommon pieces in the bag, never locked ones (and never what you wear)
const BULK_TIERS=[2,3,4];   // Rare, Epic, Legendary: each has its own sell and salvage button
const tierLot=t=>S.inv.filter(it=>{ const d=ITEM[it.id]; return !!d&&!d.uq&&!it.lk&&d.tier===t; });
function sellTier(t){ if(S.mode!=='town'||!BULK_TIERS.includes(t)) return null; const list=tierLot(t); let g=0; for(const it of list) g+=sellItem(it.u); return {n:list.length,g}; }
function sellJunk(){ if(S.mode!=='town') return null; const list=S.inv.filter(isJunk); let g=0; for(const it of list) g+=sellItem(it.u); return {n:list.length,g}; }

// ===== STATUS EFFECTS =====
// Damage over time: bleed (crits from enemy strikers), burn (Cinder Wave), poison (Venomous minions). One of each kind per unit;
// a new dose refreshes it. They tick at the end of each turn, ignore ward and armor, and wear off when you leave a room.
const DOTS={poison:{name:'Poisoned'},bleed:{name:'Bleeding'},burn:{name:'Burning'}};
function addDot(u,k,d,t){ d=Math.round(d); if(d<1||!(u.hp>0)||hasAff(u,'warded')||hasTrait(u,'warded')) return; u.dots=u.dots||{}; const o=u.dots[k]; u.dots[k]=o?{d:Math.max(o.d,d),t:Math.max(o.t,t)}:{d,t}; }
const clearDots=u=>{ if(u) delete u.dots; };
function tickDots(){
  let foeD=0, ourD=0;
  const tick=(u,hurt)=>{ if(!u.dots) return; for(const k of Object.keys(u.dots)){ const o=u.dots[k]; if(u.hp>0) hurt(u,o.d); if(--o.t<=0) delete u.dots[k]; } if(!Object.keys(u.dots).length) delete u.dots; };
  for(const e of S.run.enemies) tick(e,(u,d)=>{ const h=u.hp; hurtFoe(u,d); foeD+=h-u.hp; });
  for(const a of allies()) tick(a,(u,d)=>{ const n=Math.min(d,u.hp); u.hp-=n; if(n>0){ mark(u.id,n,0); if(u.id==='p') S.run.hurt=true; } ourD+=n; if(u.hp<=0&&u.id!=='p') log(u.nick+' succumbs.','bad'); });
  if(foeD) log('Poison eats '+foeD+' HP from your foes.','ok');
  if(ourD) log('Bleeding and burns cost your side '+ourD+' HP.','bad');
}

// ===== EVENTS BETWEEN ROOMS =====
// After some rooms in the gates (not the last, not the Tower) you find something. Walking past is always safe.
const EVENT_CHANCE=.3;
const EVENTS={
  shrine:   {name:'A blood shrine',     text:'Old blood crusts a stone basin. Feed it, and it sharpens every blow for the rest of this gate.', opts:[['bleed','Feed it 20% of your max HP'],['pass','Walk past']]},
  pedlar:   {name:'A wandering pedlar', text:'A hooded dead man rattles a tray of bottles and asks half the market price.', opts:[['buy','Buy'],['pass','Wave him off']]},
  coffer:   {name:'A sealed coffer',    text:'An iron box, chained shut. It might hold gold and gear, or a trap.', opts:[['open','Force it open'],['pass','Leave it']]},
  oldgods:  {name:'A shrine of the Old Gods',faith:'hon',text:'A clean stone in a dirty place, still warm. The Old Gods know an Honored One.', opts:[['pray','Pray (heal 30% HP, refill mana)'],['pass','Walk past']]},
  defiled:  {name:'A defiled altar',   faith:'dis',text:'Someone gutted the old altar and left the offerings. A Dishonored One takes what is owed.', opts:[['take','Take the offerings (lose 10% HP, gain gold and a Soul)'],['pass','Walk past']]},
  straggler:{name:'A wounded straggler',text:'One of the gate\'s dead drags itself away from the fight, broken.', opts:[['raise','Take it as it is (free raise, +25%)'],['finish','Finish it (bonus XP)']]}
};
const STRAGGLER_BONUS=25;
const FAITH_EVENT=.25;   // a sworn necromancer meets a shrine true to the oath in a quarter of events
function rollEvent(){ const fe=Object.keys(EVENTS).find(k=>EVENTS[k].faith&&EVENTS[k].faith===faithOf()), id=fe&&Math.random()<FAITH_EVENT?fe:pick(Object.keys(EVENTS).filter(k=>!EVENTS[k].faith)), ev={id}; if(id==='pedlar'){ ev.pot=pick(Object.keys(POTIONS)); ev.price=Math.ceil(POTIONS[ev.pot].price()/2); } return ev; }
function corpseOf(e){ const c={id:'c'+e.id,armed:isArmed(e.base),name:e.name,base:e.base,role:e.role,rankI:e.rankI,lvl:e.lvl,hf:e.hf,af:e.af,tw:e.tw,boss:e.boss,elite:e.elite,tried:false,result:null,minion:null}; if(e.aff&&e.aff.length) c.aff=e.aff.slice(); return c; }
function resolveEvent(ch){
  const r=S.run; if(S.mode!=='raise'||!r||!r.event||r.event.done) return false;
  const ev=r.event, P=S.player, lvl=RK[r.di].lv+Math.floor(r.room/2); let m='', c='';
  if(ch==='pass') m='You leave it be.';
  else if(ev.id==='shrine'&&ch==='bleed'){ if(P.hp<=1) return false; const d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*.2))); P.hp-=d; r.bless=true; tally('shrine'); m='The shrine drinks '+d+' HP. You and your army hit 15% harder for the rest of this gate.'; c='ok'; }
  else if(ev.id==='pedlar'&&ch==='buy'){ if(S.gold<ev.price||S.belt[ev.pot]>=BELT_MAX) return false; S.gold-=ev.price; S.belt[ev.pot]++; tally('pedlar'); m='You buy a '+POTIONS[ev.pot].name+' for '+ev.price+' gold.'; c='ok'; sfx('coin'); }
  else if(ev.id==='coffer'&&ch==='open'){ tally('coffer');
    if(Math.random()<.6){ const g=Math.round((10+P.lvl*4)*(1+r.di)*ngpReward()); S.gold+=g; r.goldTot=(r.goldTot||0)+g; const it=addItem(pickRow(tableFor(r.di,'vanguard',false,true)));
      if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } findPage('coffer',r); m='Inside: '+g+' gold'+(it?' and '+withArticle(ITEM[it.id].name)+'.':'. There was gear too, but your bag is full.'); c='ok'; sfx('coin'); }
    else { const d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*.25))); P.hp-=d; tally('trap'); m='A needle trap. You lose '+d+' HP and find nothing.'; c='bad'; sfx('hurt'); }
  }
  else if(ev.id==='oldgods'&&ch==='pray'){ const h=healAlly(P,Math.round(pMax()*.3)); P.mana=pMana(); tally('prayed'); m='The Old Gods hear you. You recover '+h+' HP and your mana is full.'; c='ok'; sfx('coin'); }
  else if(ev.id==='defiled'&&ch==='take'){ const d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*.1))), g=Math.round((10+P.lvl*3)*(1+r.di)*ngpReward()); P.hp-=d; S.gold+=g; r.goldTot=(r.goldTot||0)+g; const got=gainSoul(); tally('defiled');
    m='You take the offerings: '+g+' gold'+(got?' and a Soul ('+r.souls+'/'+SOUL_MAX+')':'')+'. The altar takes '+d+' HP in return.'; c='ok'; sfx('coin'); }
  else if(ev.id==='straggler'&&ch==='raise'){ const e=makeEnemy(r.di,lvl,false), cp=corpseOf(e); cp.free=true; r.corpses.push(cp); m=e.name+' waits with the other bodies. Raising it costs no mana.'; c='ok'; }
  else if(ev.id==='straggler'&&ch==='finish'){ const e=makeEnemy(r.di,lvl,false), xp=Math.round(killXp(e)*1.5); r.gained+=xp; r.ups+=addXp(xp); m='You finish '+theName(e.name)+'. +'+xp+' XP.'; c='ok'; }
  else return false;
  ev.done=m; r.events.push({m,c}); return true;
}

// ===== CURSED GATES =====
// Each day one gate you have already cleared is cursed with a twist. It is harder, and it pays more.
const MODS={
  volatile:{name:'Volatile dead',desc:'Foes burst when they die and hurt you for half their attack (never below 1 HP; ward soaks it).'},
  drought: {name:'Drought',      desc:'No mana comes back at the end of a turn. Strike still gives 3.'},
  fury:    {name:'Fury',         desc:'Foes deal 25% more damage.'},
  bulwark: {name:'Bulwark',      desc:'Foes have 30% more HP.'},
  horde:   {name:'Horde',        desc:'Every room holds one more foe.'}
};
const MOD_XP=1.25, MOD_GOLD=2, MOD_DROP=1.5, MOD_REWARD='Foes +15% HP and attack. Double gold and trophies, +25% XP, +50% gear.';
function dayMod(){
  if(!S.mod||S.mod.day!==S.day){
    const cl=DUNGEONS.map((D,i)=>i).filter(i=>S.ti&&S.ti.clr&&S.ti.clr[i]&&S.player.lvl>=RK[i].unlock);
    S.mod=cl.length?{day:S.day,gi:pick(cl),id:pick(Object.keys(MODS))}:{day:S.day,gi:-1,id:null};
  }
  return S.mod;
}
// ===== OMEN DAYS =====
// Once a gate has been cleared, some dawns bring an omen that touches every gate and the Tower for that day.
const OMENS={
  bloodmoon:{name:'Blood Moon',desc:'Elites are twice as common.'},
  paletide: {name:'Pale Tide', desc:'+10% chance to raise the dead.'},
  ashfall:  {name:'Ashfall',   desc:'Bosses and wardens use their moves a turn sooner, and pay 25% more XP.'}
};
const OMEN_CHANCE=.25, OMEN_RAISE=10, OMEN_BOSS_XP=1.25;
function dayOmen(){ if(!S.omen||S.omen.day!==S.day) S.omen={day:S.day,id:anyClear()&&Math.random()<OMEN_CHANCE?pick(Object.keys(OMENS)):null}; return S.omen; }
const omen=()=>(S&&S.player)?dayOmen().id:null;
const eliteChance=()=>.1*(omen()==='bloodmoon'?2:1);
const gateMod=di=>{ const m=dayMod(); return m.gi===di?m.id:null; };
const runMod=()=>(S.run&&!S.run.tw&&S.run.mod)||null;
// Once the Throne of Ash has fallen, a cursed gate's foes rise to just below your level: cursed days stay a real fight, and
// pay for it (XP and gold already follow foe level).
const CURSE_GAP=5;
const curseRise=di=>(runMod()&&S.ti&&S.ti.clr&&S.ti.clr[5])?Math.max(0,S.player.lvl-CURSE_GAP-RK[di].lv):0;
const foeAtkMul=di=>DIFF.foeAtk[di]*(runMod()==='fury'?1.25:1);
const bulwark=list=>{ if(runMod()==='bulwark') for(const e of list){ e.maxHp=e.hp=Math.round(e.maxHp*1.3); } };
function volatileBurst(e){   // Volatile dead: a dying foe bursts on you
  const P=S.player; let d=Math.round(e.atk*.5); const s=Math.min(P.shield,d); P.shield-=s; d=Math.max(0,Math.min(d-s,P.hp-1)); P.hp-=d; if(d){ mark('p',d,0); S.run.hurt=true; }
  log(e.name+' bursts'+(d?' and burns you for '+d:', but your ward takes it')+'.','bad');
}

// ===== GATE DIFFICULTY =====
// A cleared gate can be entered on a higher difficulty: Hard after a clear, Brutal after a Hard clear, Nightmare after Brutal.
// Foes grow stronger and every reward grows with them. On a cursed day the curse feeds on it: foes x1.5 more, rewards x1.3.
const HEAT=[{name:'Normal',foe:1,xp:1,gold:1,drop:1},{name:'Hard',foe:1.4,xp:1.3,gold:1.5,drop:1.3},{name:'Brutal',foe:2,xp:1.7,gold:2.2,drop:1.7},{name:'Nightmare',foe:3.6,xp:2.3,gold:3,drop:2.2}];
const DAMNED=1.3, DAMNED_FOE=1.5, CURSE_FOE=1.15;   // cursed and harder: rewards x1.3, foes x1.5; cursed on Normal: foes x1.15 (rewards come from the curse itself)
const foeHeat=()=>{ const h=runHeat(), m=runMod(); return (h?HEAT[h].foe:1)*(m?(h?DAMNED_FOE:CURSE_FOE):1); };
const heatMax=di=>Math.min(HEAT.length-1,S.ti&&S.ti.clr&&S.ti.clr[di]?((S.heatMax&&S.heatMax[di]!=null?S.heatMax[di]:0)+1):0);   // highest level you may pick
const heatOf=di=>Math.min((S.heat&&S.heat[di])||0,heatMax(di));
function setHeat(di,lv){ if(S.mode!=='town'||!RK[di]||!(lv>=0&&lv<=heatMax(di))) return false; S.heat=S.heat||{}; if(lv) S.heat[di]=lv; else delete S.heat[di]; return true; }
const runHeat=()=>(S.run&&!S.run.tw&&S.run.heat)||0;
const gateFarm=di=>(heatOf(di)||gateMod(di)||!(S.ti&&S.ti.clr&&S.ti.clr[di]))?1:farmK(di,S.player.lvl);   // what a Normal run of this gate would pay now (the gate card)
const runFarm=()=>{ const r=S.run; if(!r||r.tw||r.rift||r.heat||runMod()||!(S.ti&&S.ti.clr&&S.ti.clr[r.di])) return 1; return farmK(r.di,S.player.lvl); };
const heatK=k=>{ const h=runHeat(); if(!h) return (k==='xp'||k==='gold')?runFarm():1; return (k==='foe'?foeHeat():HEAT[h][k]*(runMod()?DAMNED:1)); };   // the cursed and the hard together

// ===== RUN HISTORY =====
const HIST_N=20, LIFE_KEYS=['runs','clears','deaths','fled','rooms','kills','xp','gold','items','raised'];
const runResult=r=>r.cleared?'cleared':S.mode==='defeat'?'fell':r.fled?'fled':'left';
function recordRun(target,r,res){
  const h={d:S.day,g:r.tw?-1:r.di,f0:r.tw0||0,f1:r.tw||0,rooms:r.won||0,kills:r.kills||0,xp:r.gained||0,gold:r.goldTot||0,items:r.items||0,raised:r.raised||0,mod:r.mod||null,res}; if(r.heat) h.heat=r.heat; if(r.secret) h.sec=r.secret; if(r.rift) h.rift=r.rift; if(r.riftRec) h.rr=1;
  target.hist=(target.hist||[]).concat([h]).slice(-HIST_N);
  const L=target.life=target.life||{}; LIFE_KEYS.forEach(k=>{ L[k]=L[k]||0; });
  L.runs++; if(res==='cleared') L.clears++; if(res==='fell') L.deaths++; if(res==='fled') L.fled++;
  L.rooms+=h.rooms; L.kills+=h.kills; L.xp+=h.xp; L.gold+=h.gold; L.items+=h.items; L.raised+=h.raised;
}
// ===== RECORDS =====
// Personal bests for the Ledger's Records page. They are kept through New Game+.
// S.rec = {hit:{v,day}, fast:{di:{t,day,heat}}, kills:{v,day}, gold:{v,day}, floor:{v,day}, sec:{i:day}}
const REC_NAME={rift:'Deepest Rift',hit:'biggest hit',kills:'most kills in one run',gold:'most gold from one run',floor:'deepest Tower floor'};
function recFlash(k,txt){ const r=S.run; if(r){ r.recF=r.recF||{}; if(r.recF[k]) return; r.recF[k]=1; } moment('New record: '+txt,'gold'); }   // once per run and kind, never for a first record
function recBest(k,v){ if(!S||!(v>0)) return; S.rec=S.rec||{}; const o=S.rec[k]; if(!o||v>o.v){ S.rec[k]={v:Math.round(v),day:S.day}; if(o) recFlash(k,REC_NAME[k]+', '+Math.round(v).toLocaleString()); } }
function recRun(r){   // at the end of every run
  if(!r) return; recBest('kills',r.kills||0); recBest('gold',r.goldTot||0);
  if(!r.tw&&!r.rift&&r.cleared&&r.tt>0){ S.rec=S.rec||{}; const f=S.rec.fast=S.rec.fast||{}, o=f[r.di]; if(!o||r.tt<o.t){ f[r.di]={t:r.tt,day:S.day,heat:r.heat||0}; if(o) moment('New record: '+DUNGEONS[r.di].name+' in '+r.tt+' turns','gold'); } }
}
// ===== DOORS =====
// After each gate room (not before the boss, not in the Tower) you pick the next room from two or three doors.
// The first door is always an ordinary fight, so "descend" with no choice behaves as before.
const ELITE_ROOM=1.25, ELITE_DROP=2, ELITE_GOLD=1.5, REST_HEAL=.4;
const DOORS={
  fight:   {name:'A dark passage',  desc:'Another room of the gate.'},
  elite:   {name:'A bloodied arch', desc:'Stronger foes (+25% HP and attack). Twice the gear drops and 50% more gold.'},
  rest:    {name:'A quiet ossuary', desc:'No fight. Rest to recover 40% of your HP and mana, and your army 40%.'},
  treasure:{name:'A sealed vault',  desc:'No fight. Gold and a piece of gear.'},
  boss:    {name:'The boss chamber',desc:'The master of this gate.'}
};
function rollDoors(r){
  if(r.room+1>=r.rooms-1) return ['boss'];
  let pool=['elite','elite','elite','rest','rest','treasure']; const out=['fight'], n=Math.random()<.4?2:1;   // weighted: elite 3, rest 2, treasure 1
  while(out.length<1+n&&pool.length){ const k=pick(pool); out.push(k); pool=pool.filter(x=>x!==k); }
  return out;
}
const roomKind=()=>(S.run&&!S.run.tw&&S.run.roomKind)||null;
function quietRoom(kind){   // a rest or treasure room: no fight, then the doors again
  const r=S.run, P=S.player; let m;
  r.corpses=[]; r.spoils=[]; r.lostLoot=[]; r.events=[]; r.lastXp=0; r.lastGold=0; r.lastTroph={}; r.enemies=[];
  if(kind==='rest'){ P.hp=Math.min(pMax(),P.hp+Math.round(pMax()*REST_HEAL)); P.mana=Math.min(pMana(),P.mana+Math.round(pMana()*REST_HEAL)); S.army.forEach(x=>{ x.hp=Math.min(x.maxHp,x.hp+Math.round(x.maxHp*REST_HEAL)); });
    m='You rest among the bones. You and your army recover.'; sfx('heal'); }
  else { const g=Math.round((15+P.lvl*5)*(1+r.di)*ngpReward()*(1+xb('goldp')/100)); S.gold+=g; r.goldTot=(r.goldTot||0)+g; r.lastGold=g; const it=addItem(pickRow(tableFor(r.di,'vanguard',true,false)));
    if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } m='The vault gives up '+g+' gold'+(it?' and '+withArticle(ITEM[it.id].name):'')+'.'; sfx('coin'); }
  r.events.push({m,c:'ok'}); r.quiet=kind; r.doors=rollDoors(r); S.mode='raise';
}

// ===== GEAR SETS =====
// Two or three pieces from the same gate's set (its uniques count too) give a bonus. Tower gear belongs to no set.
const SET_NAMES=['Scavenger\'s Kit','Drowned Vigil','Ember Rite','Choir of Bones','Ironbark','Pale Court'];
const SET_BONUS=[{2:{hp:15},3:{goldp:10}},{2:{mana:20},3:{manap:8}},{2:{strength:3},3:{dmgp:5}},{2:{will:3},3:{mpow:10}},{2:{constitution:4},3:{drp:5}},{2:{mpow:8},3:{dmgp:6,drp:3}}];
const setCount=si=>(S&&S.equip)?GEAR_SLOTS.filter(sl=>{ const it=S.equip[sl], d=it&&ITEM[it.id]; return d&&!d.tower&&d.set===si; }).length:0;
const setB=k=>{ let n=0; for(let i=0;i<SET_BONUS.length;i++){ const c=setCount(i); if(c>=2) n+=SET_BONUS[i][2][k]||0; if(c>=3) n+=SET_BONUS[i][3][k]||0; } return n; };
// ===== UNIQUE SETS =====
// The uniques form six sets of three (a weapon, an armor and a relic each): two from the gate bosses, four from the Tower
// wardens. Their bonuses are bigger than a gate set's and stack with them (a gate unique still counts toward its gate set).
const USET=[
  {name:'Tithes of the Ledger', from:'Rat Warren, Sunken Crypt and Ashen Barrow bosses', ids:['u0','u1','u2'], b:{2:{mpow:10,raise:5},3:{dmgp:8,xpp:10}}},
  {name:'Last Rites',           from:'Hollow Cathedral, Iron Orchard and Throne of Ash bosses', ids:['u3','u4','u5'], b:{2:{manap:10,raise:8},3:{mpow:15,drp:6}}},
  {name:"Wardens' Tribute",     from:'Tower floors 10, 20 and 30', ids:['w1','w2','w3'], b:{2:{crit:8,hpp:6},3:{dmgp:10,regen:2}}},
  {name:"The Fly-Duke's Court", from:'Tower floors 40, 50 and 60', ids:['w4','w5','w6'], b:{2:{mpow:15},3:{slot:1,manap:12}}},
  {name:"Hell's Executioners",  from:'Tower floors 70, 80 and 90', ids:['w7','w8','w9'], b:{2:{strength:10,drp:5},3:{dmgp:12,hpp:10}}},
  {name:'Regalia of Ruin',      from:'Tower floor 100', ids:['w10','w11','w12'], b:{2:{hpp:10,manap:10},3:{dmgp:15,drp:10,xpp:15}}}
];
USET.forEach((u,i)=>u.ids.forEach(id=>{ ITEM[id].uset=i; }));
const usetCount=i=>(S&&S.equip)?USET[i].ids.filter(id=>GEAR_SLOTS.some(sl=>S.equip[sl]&&S.equip[sl].id===id)).length:0;
const usetB=k=>{ let n=0; for(let i=0;i<USET.length;i++){ const c=usetCount(i); if(c>=2) n+=USET[i].b[2][k]||0; if(c>=3) n+=USET[i].b[3][k]||0; } return n; };
// ===== FAITH =====
// From level 8 the Old Shrine (Town tab) takes your oath: Honored One or Dishonored One. Each path has a buff and a debuff.
// Devotion grows with the days you keep the oath (buff x1.5 after 10 days, x2 after 25); the debuff stays as it is.
// Renouncing costs gold and devotion starts over.
const FAITH={
  hon:{name:'Honored One',   vow:'Swear to the Old Gods of the valley. They keep your body whole, and ask for restraint.', buff:{hpp:10,healp:25},debuff:{dmgp:-8,goldp:-15}},
  dis:{name:'Dishonored One',vow:'Spit on the Old Gods and take what the grave owes you. Power and plunder, paid for in flesh.',buff:{dmgp:12,goldp:20},debuff:{hpp:-10,healp:-25}}
};
const FAITH_LV=8, DEVOTION=[0,10,25], DEVOTION_MUL=[1,1.5,2];
// At full devotion (3/3) each path also grants a blessing, once per run.
const GRACE_HP=.25, TITHE_SOULS=3;   /* measured: Grace in the Tower too was worth ~11 floors to an Honored bot, so it guards gate runs only */
FAITH.hon.bless={name:'Grace of the Old Gods',desc:'Once per gate run, a killing blow leaves you at '+GRACE_HP*100+'% HP instead (not in the Tower).'};
FAITH.dis.bless={name:'Tithe of Souls',desc:'Every run begins with '+TITHE_SOULS+' Souls already harvested.'};
const blessed=id=>faithOf()===id&&devotion()>=DEVOTION.length-1;
function titheSouls(){ if(blessed('dis')&&S.run){ S.run.souls=Math.max(S.run.souls||0,Math.min(SOUL_MAX,TITHE_SOULS)); } }
const faithOf=()=>(S&&S.faith&&FAITH[S.faith.id])?S.faith.id:null;
const devotion=()=>{ if(!faithOf()) return 0; const d=S.day-S.faith.day; return d>=DEVOTION[2]?2:d>=DEVOTION[1]?1:0; };
const faithBuff=id=>{ const F=FAITH[id], m=faithOf()===id?DEVOTION_MUL[devotion()]:1, o={}; for(const k in F.buff) o[k]=Math.round(F.buff[k]*m); return o; };
const faithB=k=>{ const id=faithOf(); if(!id) return 0; return (faithBuff(id)[k]||0)+(FAITH[id].debuff[k]||0); };
const renounceCost=()=>100*S.player.lvl;
function swear(id){ if(S.mode!=='town'||!FAITH[id]||faithOf()||S.player.lvl<FAITH_LV) return false; vitals(()=>{ S.faith={id,day:S.day}; }); tally('sworn'); return true; }
function renounce(){ if(S.mode!=='town'||!faithOf()) return false; const c=renounceCost(); if(S.gold<c) return false; S.gold-=c; vitals(()=>{ delete S.faith; }); S.player.hp=Math.min(S.player.hp,pMax()); return true; }
const xb=k=>titleB(k)+setB(k)+usetB(k)+faithB(k)+skB(k);   // the worn title, gate sets, unique sets, faith and the small passive skills

// ===== SKILL UPGRADES =====
// At rank 3 each skill offers a choice of two upgrades. Forgetting your skills lets you choose again.
const SKILL_MODS={
  spear:    {a:['Impaler','Pierces all foe armor.'],                      b:['Splinter','Also hits another foe for 50%.']},
  bonearmor:{a:['Ossified','+6% more max HP.'],                            b:['Marrow Ward','Bone Ward grants 30% more ward.']},
  mend:     {a:['Deep Mending','Heals 15% more of each minion\'s HP.'],   b:['Shared Flesh','Also heals you for 15% of your max HP.']},
  blast:    {a:['Bigger Bang','Deals 30% more damage.'],                   b:['Grave Gas','Also poisons every foe it hits.']},
  soulwell: {a:['Overflow','+1 more mana every turn.'],                    b:['Thrift','Soul Siphon costs 6 mana instead of 8.']},
  curse:    {a:['Lingering','Lasts 5 turns.'],                             b:['Spreading','Curses every foe, at 80% strength.']},
  gravepact:{a:['Blood Oath','+6% more minion power.'],                    b:['Bone Shell','Your minions take 10% less damage.']},
  chill:    {a:['Deep Freeze','Bosses resist 20% less often.'],            b:['Shatter','Frozen foes take 25% more damage.']},
  edge:     {a:['Rending','Strike has +10% crit chance.'],                 b:['Bloodletting','Strike heals you for 10% of its damage.']},
  frenzy:   {a:['Bloodlust','Lasts 2 turns longer.'],                      b:['Unholy Vigor','Also heals each minion for 15% of its HP.']},
  mastery:  {a:['Gravecaller','+6% more chance to raise.'],                b:['Thrifty Rites','Raising costs 25% less mana.']},
  reap:     {a:['Harvest Moon','Doubles below 50% HP instead of 35%.'],    b:['Soul Reap','A kill with Reap refunds 10 mana.']},
  robber:   {a:['Deep Pockets','+5% more gold.'],                          b:['Keen Eye','+3% XP from kills.']},
  scholar:  {a:['Insight','+4% more XP.'],                                 b:['Coin Lore','+3% gold from kills.']},
  calcify:  {a:['Petrified','You take 2% less damage again.'],             b:['Thick Hide','+5% max HP.']},
  sanguine: {a:['Blood Feast','+10% more healing.'],                       b:['Clear Mind','+5% max mana.']},
  thrift:   {a:['Frugal Rites','Raising costs 10% less mana again.'],      b:['Grave Sense','+3% chance to raise.']},
  deathless:{a:['Deep Well','+5% more max mana.'],                         b:['Iron Will','+3% max HP.']}
};
// The small passives above feed the same bonus pool as titles, sets and faith.
const skB=k=>{ if(!S||!S.player) return 0; const m=id=>skMod(id);
  switch(k){
    case 'goldp': return 5*sk('robber')+(m('robber')==='a'?5:0)+(m('scholar')==='b'?3:0);
    case 'xpp':   return 4*sk('scholar')+(m('scholar')==='a'?4:0)+(m('robber')==='b'?3:0);
    case 'drp':   return 2*sk('calcify')+(m('calcify')==='a'?2:0);
    case 'healp': return 8*sk('sanguine')+(m('sanguine')==='a'?10:0);
    case 'manap': return 5*sk('deathless')+(m('deathless')==='a'?5:0)+(m('sanguine')==='b'?5:0);
    case 'hpp':   return (m('calcify')==='b'?5:0)+(m('deathless')==='b'?3:0);
  } return 0; };
const skMod=id=>(sk(id)>=SK_MAX&&S.player.skMod&&S.player.skMod[id])||null;
const hasMod=(id,c)=>skMod(id)===c;
function chooseMod(id,c){ const P=S.player; if(S.mode!=='town'||!SKILL_MODS[id]||!SKILL_MODS[id][c]||sk(id)<SK_MAX||skMod(id)) return false; vitals(()=>{ P.skMod=P.skMod||{}; P.skMod[id]=c; }); return true; }
const siphonCost=()=>hasMod('soulwell','b')?6:8;   // Soul Siphon: see the SOULS block for its armor piercing and Souls

// ===== MINION COMMANDS =====
// Once per room, each kind of minion in your army can be given an order. Orders are free: they do not use your turn.
const CMDS={
  vanguard:{name:'Taunt',      desc:'For 2 turns, foes aim their attacks at your vanguards, and a vanguard takes any Sundering Blow (other boss moves still land where they land).'},
  striker: {name:'Focus',      desc:'This turn your strikers always crit, and a focused crit breaks a boss\'s charging move.'},
  mender:  {name:'Bone Shield',desc:'Each mender wards you for 150% of its attack.'},
  reaper:  {name:'Execute',    desc:'This turn your reapers deal double damage to foes below 40% HP.'}
};
const canCommand=role=>S.mode==='battle'&&!!CMDS[role]&&!(S.run.cmd&&S.run.cmd[role])&&S.army.some(m=>m.role===role&&m.hp>0);
function command(role){
  if(!canCommand(role)) return false;
  const r=S.run, P=S.player, mine=S.army.filter(m=>m.role===role&&m.hp>0); r.cmd=r.cmd||{}; r.cmd[role]=true; tally('commands');
  if(role==='vanguard'){ r.taunt=2; log('Taunt: your vanguards bellow, and every foe turns on them.','ok'); }
  else if(role==='striker'){ r.focus=true; log('Focus: your strikers pick their spots.','ok'); }
  else if(role==='mender'){ const w=mine.reduce((a,m)=>a+Math.round(m.atk*1.5),0); P.shield=Math.min(Math.round(pMax()*.6),P.shield+w); mark('p',0,0); log('Bone Shield: your menders ward you. You hold '+P.shield+' ward.','ok'); }
  else { r.execute=true; log('Execute: your reapers look for the weak.','ok'); }
  sfx('skill'); return true;
}

// ===== STORY AND BOSS VOICES =====
// The Ledger tells its story as you go: a passage for the first clear of each gate and for Tower milestones. Bosses speak.
const STORY=[
  {act:1,id:'intro',t:'The Ledger opens',m:'You found the book in a drowned chapel, its pages blank but warm. When you wrote your name inside, every grave in the valley turned over in its sleep. The Ledger wants names. It will give you the dead who answer to them.'},
  {act:1,id:'g0',t:'The Rat King',m:'The Rat King was a tanner once, buried under his own vats. He held his court of vermin for forty years, waiting for someone to tell him he could stop. The Ledger wrote his name in a careful hand, and somewhere beneath the city a second page filled itself in.'},
  {act:1,id:'g1',t:'The Crypt Warden',m:'The Warden kept his post long after the family he guarded had rotted. He did not fight you for treasure. He fought because no one had ever relieved him of his watch. In the Ledger his entry ends with a single word: dismissed.'},
  {act:2,id:'g2',t:'The Ember Knight',m:'The barrow burned because the Knight would not let it go out. He believed the fire kept something worse asleep beneath the mound. The Ledger does not say whether he was right. The ground is still warm.'},
  {act:2,id:'g3',t:'The Bishop of Teeth',m:'The Bishop preached that the dead should keep their voices. His choir sang for a century without breath. When he fell, the Ledger turned to a page already written, in your handwriting, that you do not remember writing.'},
  {act:2,id:'g4',t:'The Orchard Mother',m:'The Mother planted iron in the ground and grew a forest of it, to fence in her children. You learn too late that her children were the graves of the valley, and that the Ledger had been eating them one name at a time.'},
  {act:2,id:'g5',t:'The Pale Sovereign',m:'The Sovereign was the last to hold the Ledger before you. He wrote until there were no names left but his own, and then he wrote that one too. His court kneels to you now. The book has a new final page, and it is blank, and it is waiting.'},
  {act:3,id:'t25',t:'The burning stair',m:'Twenty-five floors into the Tower, the walls begin to whisper names from the Ledger. Some of them are yours. The dead you raised did not come from nowhere; the Tower has been sending them up for a very long time.'},
  {act:3,id:'t50',t:'Halfway to the throne',m:'At the fiftieth floor you find a lectern of black iron, and on it a ledger like yours, open to a page of crossed-out names. Every name but one has a line through it. The last is the name of the Tower itself.'},
  {act:3,id:'t75',t:'The hollow choir',m:'The seraphs here were never holy. They were the Ledger\'s first keepers, burned for the names they would not give up. They sing your name as you climb, not in warning, but in welcome.'},
  {act:3,id:'t100',t:'The King of Hell',m:'Abaddon kept the other half of the book. When he falls, his pages fly to yours and stitch themselves in. The Ledger is whole for the first time in a thousand years, and every soul in it, above and below, now answers to you.'},
  {act:4,id:'ngp',t:'The book begins again',m:'You closed the Ledger and opened it again, and the first page was blank. Your titles remain, written in a margin no one else can read. The dead remember you. They will be harder to convince this time.'},
  // ---- Act I: the name
  {act:1,id:'raise1',t:'The first to answer',when:()=>T_('raised')>=1,m:'The first one stood up slowly, as if embarrassed to be seen. It did not ask who you were. It looked at the Ledger in your hand and waited, the way a dog waits for a word. Somewhere in the book, a line of ink you had not written dried.'},
  {act:1,id:'fall1',t:'The ground says no',when:()=>T_('deaths')>=1,m:'You fell, and for a moment the earth reached for you the way it reaches for everyone. Then it let go. You woke at the gate with the Ledger warm against your chest. It is not finished with you. You are not sure that is a kindness.'},
  {act:1,id:'lv5',t:'Ink under the nails',when:()=>S.player.lvl>=5,m:'Your fingers are stained black now, and the stain does not wash out. When you sleep, you hear pages turning. The townsfolk have started crossing the street when you pass, and the dogs have stopped barking at you altogether.'},
  {act:1,id:'evolve1',t:'They remember being people',when:()=>T_('evolved')>=1,m:'One of your dead grew into something more, and in the moment it changed it spoke a name. Not yours. Its own, from before. The Ledger wrote it down at once, as if afraid it would be forgotten again.'},
  // ---- Act II: the valley
  {act:2,id:'town',t:'A town that looks away',when:()=>townOpen()&&anyClear(),m:'The town lets you build at its edge, because it needs what you bring back and fears what follows you. The mayor will not shake your hand. He takes your gold with gloves on, and burns the gloves after, and thanks you every time.'},
  {act:2,id:'curse1',t:'The gate that hates you',when:()=>T_('cursed')>=1,m:'A cursed gate is not cursed at random. The Ledger has enemies among the dead it has not yet named, and they gather where you hunt, and they twist the stone against you. You won anyway. They will remember that too.'},
  {act:2,id:'oath_hon',t:'The Old Gods answer',when:()=>faithOf()==='hon',m:'You knelt at the cracked altar and the Old Gods, who had not been asked for anything in a long time, answered. They do not approve of the Ledger. But they would rather it were held by someone who still kneels.'},
  {act:2,id:'oath_dis',t:'A debt called in',when:()=>faithOf()==='dis',m:'You spat on the altar and nothing struck you down. That was the answer. The Old Gods are old, and tired, and they have watched the Ledger outlive every one of them. You take what is owed. They let you.'},
  {act:2,id:'army5',t:'A household of the dead',when:()=>S.army.length>=5,m:'Five of them now, following you through the market at dawn. They carry your bags. They stand in the rain without complaint. One of them hums a song from a village that burned a century ago, and the others, slowly, have learned the words.'},
  {act:2,id:'tower0',t:'The Tower notices',when:()=>S.player.lvl>=TW.unlock,m:'Far to the east a tower of red stone has stood for as long as the valley has had a name. Tonight a light came on in its lowest window. The Ledger turned, unbidden, to a page headed with a single word: Climb.'},
  {act:2,id:'hard1',t:'Asking for more',when:()=>T_('heat1')>0,m:'You went back into a gate you had already emptied and asked it for something harder. The dead there were insulted, and rose stronger to prove it. The Ledger likes this about you. It writes faster when you are greedy.'},
  {act:2,id:'elder1',t:'An elder among the dead',when:()=>T_('elder')>=1,m:'One of yours has grown old in death, wiser than the living who buried it. It watches you write in the Ledger with an expression you cannot read. Once, when you hesitated over a name, it reached over and pointed.'},
  // ---- Act III: the climb
  {act:3,id:'t10',t:'The first warden',m:'The Gate Hound was not guarding the Tower from you. It was guarding the valley from the Tower. When it fell, it looked almost relieved, and the stair above it lit itself, step by step, all the way up into the dark.'},
  {act:3,id:'t40',t:'Flies and chains',m:'By the fortieth floor the Tower stops pretending to be a building. The walls breathe. The dukes of this place keep courts of their own, and each of them once held a page torn from the Ledger, and none of them gave it up willingly.'},
  {act:3,id:'t60',t:'The executioner\'s block',m:'The Pale Executioner kept a tally of everyone he had ended. You found it carved into the block: a long column of marks, and at the very bottom, freshly cut, a mark for you. You chiselled it out before you climbed on.'},
  {act:3,id:'t90',t:'The broken halo',m:'The Seraph fell without a sound, and its halo cracked in two. One half held the light of something holy. The other held a name written in the Ledger\'s hand. You could not tell which half was heavier.'},
  {act:3,id:'ult1',t:'Five souls in the hand',when:()=>S.player.lvl>=ULT_LV,m:'You learned to hold souls the way a miser holds coins, and to spend them all at once. The first time you did, the sky over the gate went dark for a heartbeat, and every bird in the valley fell silent until dawn.'},
  {act:3,id:'bless_hon',t:'Grace',when:()=>blessed('hon'),m:'Twenty-five dawns kept faithfully, and the Old Gods have put a hand on your shoulder. They will not let you fall in the gates. They say nothing about the Tower. Even gods have places they will not go.'},
  {act:3,id:'bless_dis',t:'The tithe',when:()=>blessed('dis'),m:'Twenty-five dawns of taking, and now the dead pay you before you ask. You enter every gate with souls already in your hand, warm and pleading. The Old Gods have stopped watching you. You find you prefer it.'},
  {act:3,id:'secret1',t:'Something older',when:()=>SECRET.some((B,i)=>T_('secret_'+i)>0),m:'There are names the Ledger never wanted you to find: masters older than the gates they hide beneath. You found one anyway, and wrote it down in red. The book was quiet for a full day afterwards, as if offended.'},
  {act:3,id:'nm1',t:'Nightmare',when:()=>DUNGEONS.some((D,i)=>T_('nm'+i)>0),m:'You walked through a gate on its worst night and walked back out. The dead who saw it have started telling the story to each other, in the dark between rooms. In their version, you are much taller.'},
  {act:3,id:'lv50',t:'Half a book of names',when:()=>S.player.lvl>=50,m:'You have written more names than the valley has living people. Some nights you take the Ledger out just to read them, the way other people read letters from home. You have started to forget which of them you knew in life.'},
  {act:3,id:'secret6',t:'All the old masters',when:()=>SECRET.every((B,i)=>T_('secret_'+i)>0),m:'Six masters older than the gates, and every one of them in red ink now. The Ledger has stopped arguing. On the page after the last of them, someone long ago wrote a single line: The one who finds us all is ready for the end of the book.'},
  // ---- Act IV: the abyss and the end of the book
  {act:4,id:'t110',t:'Below the bottom',when:()=>S.tower.best>=110,m:'Abaddon was not the bottom. Past his throne the Tower keeps going, down and up at once, into a place with no floors and no names. The Ledger\'s pages are blank here. It is waiting to see what you will write.'},
  {act:4,id:'t150',t:'The Abyss looks back',when:()=>S.tower.best>=150,m:'One hundred and fifty floors. The wardens here have no stories, no faces, no names at all; they are what is left when the Ledger has taken everything else. You wonder, briefly, whether that is what you are climbing toward.'},
  {act:4,id:'t200',t:'Where the ink runs out',when:()=>S.tower.best>=200,m:'At the two hundredth floor the ink in the Ledger thins to grey. The book is not running out of pages. It is running out of reasons. For the first time since the drowned chapel, it asks you a question: Why do you keep climbing?'},
  {act:4,id:'ngp2',t:'Twice told',when:()=>(S.ngp||0)>=2,m:'The second time through, the dead knew your face before you raised them. The Rat King called you by name. The Warden saluted. The book is beginning again, but it is not beginning from nothing anymore, and neither are you.'},
  {act:4,id:'ngp3',t:'The keeper who stays',when:()=>(S.ngp||0)>=3,m:'Three times you have closed the Ledger, and three times opened it. The Pale Sovereign wrote his own name to escape it. You have not. Perhaps that is the difference between a prisoner and a keeper. Perhaps there is none.'},
  {act:4,id:'pages',t:'The last page',when:()=>(S.pages||0)>=LORE_PAGES.length,m:'Every torn page has found its way home, and the Ledger is whole in a way it never was. On the final page is the scribe\'s last instruction: whoever holds the book may close it forever by writing their own name. Your pen hovers over the page. Not yet.'},
  {act:5,id:'cmd1',t:'One who leads',when:()=>T_('commanders')>=1||(S.army||[]).some(m=>hasTrait(m,'commander')),m:'This one rose differently. It looked over your other dead the way a sergeant looks over a muddy field, and they straightened under its gaze. You did not teach it that. Something it was in life remembered how to give orders, and the grave did not take it away.'},
  {act:5,id:'raid1',t:'An empty house',when:()=>T_('raidsSent')>=1,m:'You sent them out without you, and for the first time in a long while the house was quiet. No scraping at the door, no humming from the cellar. You sat with the Ledger open and realised you were listening for their footsteps, the way the living listen for children coming home late.'},
  {act:5,id:'raid10',t:'The war you do not see',when:()=>T_('raidWins')>=10,m:'Your squads come back with gold you did not earn and stories they cannot tell. The gates you cleared are being cleared again in your name, while you sleep. Somewhere a village has started telling tales of a dead captain who marches past at midnight and harms no one who keeps their door shut.'},
  {act:5,id:'rift1',t:'The torn sky',when:()=>riftBest()>=1,m:'Beneath the Throne of Ash the stone did not end. It tore. Through the tear you saw every gate at once, folded over itself, and the dead in it were not the dead you knew. They wore the shapes of the valley, but something older looked out through them. The Ledger grew warm in your hands and would not cool.'},
  {act:5,id:'rift10',t:'No bottom',when:()=>riftBest()>=10,m:'Ten times down, and the Rift only deepens. The pages you write there come back changed: names you did not set down, in a hand that is almost yours. The Pale Sovereign wrote himself out of this book. You begin to wonder if the Rift is where the ink went when he did.'},
  {act:5,id:'eternal1',t:'What does not end',when:()=>T_('eternal')>=1,m:'One of yours has grown past death and past age into something the Ledger has no word for. It does not tire. It does not forget. It stands at the edge of the Rift some nights and looks down, and when you ask it what it sees, it only turns the page of the book for you, gently, as if you were the one who needed keeping.'}
];
const STORY_BY=Object.fromEntries(STORY.map(s=>[s.id,s]));
const ACTS=['','Act I · The name','Act II · The valley','Act III · The climb','Act IV · The end of the book','Act V · The torn sky'];
// Milestone passages (those with a when) are checked after every action; inside a run they go to the room's events.
function loreCheck(){
  if(!S||!S.player) return; S.story=S.story||{};
  const due=STORY.filter(st=>{ if(!st.when||S.story[st.id]) return false; try{ return !!st.when(); }catch(e){ return false; } });
  if(due.length>2){ due.forEach(st=>{ S.story[st.id]=S.day; }); notify('The Ledger remembers '+due.length+' passages of your story. Read them on the Lore page (Ledger tab).','story'); return; }   /* catch-up, e.g. an old save */
  for(const st of due) unlockStory(st.id,S.mode==='raise'&&S.run?S.run:null);
}
// ===== TORN PAGES =====
// Twenty pages torn from the Ledger tell its history, always in order. Bosses, wardens, elites and coffers may hold the next
// one, but each page waits until you reach its level, so the story keeps pace with you. Kept through New Game+.
const LORE_PAGES=[
  {t:'The scribe of Vane Abbey',m:'Before the valley had a name, an abbey stood in the drowned chapel\'s place, and in it a scribe named Oswin Vane kept the record of the dead: who died, and when, and how. He believed no soul should be forgotten. It was a kind thought. It was the first mistake.'},
  {t:'The plague year',m:'In the plague year the dead came faster than Oswin could write. He worked by candle until his eyes failed, and still the names piled up unrecorded, and in the night he heard them weeping to be written. He prayed for a book that could keep up.'},
  {t:'The binding',m:'Something answered his prayer. Not the Old Gods; they were already old, and did not care for scribes. Oswin bound the new book in skin he did not ask the source of, and the ink in it was warm, and the pages filled themselves.'},
  {t:'A book that wants',m:'At first the Ledger only recorded. Then it began to want. A name written in it did not rest; it waited to be called. Oswin learned this the night his dead brother knocked on the abbey door, polite and grey, asking what he should do next.'},
  {t:'The first army',m:'The abbot ordered the book burned. It would not burn. Oswin, frightened, called the names in it to protect him, and the dead of the plague year rose and stood around the abbey in a silent ring, and the abbot\'s order was never given again.'},
  {t:'The drowning',m:'The abbey drowned when the river changed its course. Some say the river was pushed. Oswin went down with the chapel, the Ledger chained to his wrist, and for two hundred years the book lay in the dark water, writing the names of the fish.'},
  {t:'The tanner',m:'A tanner fished the book from the river and read one line aloud. By morning his vats were full of the dead and he was their king. He held his court beneath the city for forty years. The Ledger called him its second keeper, and forgot him the moment he fell.'},
  {t:'Keepers and wardens',m:'After the tanner the book passed from hand to hand, and every keeper left something behind: a warden at a door, a knight at a fire, a bishop and his choir. The gates of the valley are not dungeons. They are the graves of the Ledger\'s keepers.'},
  {t:'The orchard',m:'One keeper tried to stop it. She planted iron trees around the valley\'s graves to fence them from the book, and tended them until she was part of the orchard herself. It did not work. Iron does not stop ink. But the trees still stand.'},
  {t:'The Sovereign',m:'The greatest keeper called himself the Sovereign. He named every soul in the valley and ruled them all from a throne of ash. When there was no one left to name, he grew afraid the book would turn on him, and he did the only thing it could not undo.'},
  {t:'His own name',m:'The Sovereign wrote his own name in the Ledger, and the book closed on him like a door. He became its prisoner and its servant, a page among pages. That is why the last page waits blank: the book is always looking for its next keeper\'s name.'},
  {t:'The other half',m:'The Ledger was never whole. Long before Oswin\'s time, someone below had torn it in two and carried half away, down into a tower that grows a floor for every name it steals. The half you hold has been looking for the other half for a very long time.'},
  {t:'The Tower\'s bargain',m:'The King of Hell kept his half of the book in the Tower\'s heart and fed it the souls that climbed to him. Every warden on every tenth floor is a keeper who climbed for the other half and failed. Their relics are what the Tower let them keep.'},
  {t:'Why the dead obey',m:'The dead do not obey the Ledger because it is strong. They obey because it remembers them, and nothing else does. A name in the book is a name that cannot be lost. Most of them would rather serve than be forgotten. You find you understand.'},
  {t:'The price of keeping',m:'Each keeper paid in the same coin: a little more of themselves for every name. The tanner forgot his trade. The Warden forgot his family. The Sovereign forgot everything but the book. You check your own memories at night, and count them, and they are fewer.'},
  {t:'The masters below',m:'Under the keepers\' graves lie older things, masters who held the book before it was a book, when it was only a hunger in the dark. Oswin did not create the Ledger. He gave a shape to something that was already there, waiting to be written down.'},
  {t:'Oswin\'s regret',m:'In the margin of an early page, in a shaking hand, Oswin wrote: I wanted no one forgotten. I did not understand that some things are meant to be forgotten, and that remembering them forever is its own kind of grave.'},
  {t:'The whole book',m:'When the two halves meet, the Ledger will hold every name above and below. Whoever keeps it then will not rule the dead. They will be the dead\'s memory, the only thing between every soul and nothing. It is not a crown. It is a weight.'},
  {t:'How it ends',m:'There are only two endings, the scribe wrote. The keeper writes their own name and the book closes, as the Sovereign did, and the dead sleep at last. Or the keeper keeps writing, forever, and the dead never have to be alone.'},
  {t:'The blank page',m:'The last torn page holds no words at all, only the faint shape of a pen pressed hard and lifted again. Someone stood where you stand and could not decide. The page is yours now. The Ledger does not hurry you. It has all the time in the world.'}
];
const PAGE_LV=i=>2+i*3;   // page i waits until this level, so the story keeps pace (the last page at level 59)
const PAGE_CHANCE={boss:.35,warden:.5,elite:.04,coffer:.2,secret:1};
const nextPage=()=>{ const n=S.pages||0; return n<LORE_PAGES.length&&S.player.lvl>=PAGE_LV(n)?n:-1; };
function findPage(src,r){
  const n=nextPage(); if(n<0||!(Math.random()<(PAGE_CHANCE[src]||0))) return false;
  S.pages=n+1; tally('pages'); const P0=LORE_PAGES[n], m='You find a torn page of the Ledger ('+(n+1)+'/'+LORE_PAGES.length+'): "'+P0.t+'". Read it on the Lore page (Ledger tab).';
  if(r&&r.events) r.events.push({m,c:'story'}); else notify(m,'story'); moment('Torn page '+(n+1)+'/'+LORE_PAGES.length,'gold'); return true;
}
function unlockStory(id,r){
  const st=STORY_BY[id]; if(!st) return false; S.story=S.story||{}; if(S.story[id]) return false;
  S.story[id]=S.day; const m='From the Ledger, "'+st.t+'": '+st.m;
  if(r) r.events.push({m,c:'story'}); else notify(m,'story'); return true;
}
const BOSS_LINES={
  'The Rat King':        ['Another tenant for my court? Kneel, and the rats will not eat you first.','Tell them... the vats can go cold now.'],
  'The Crypt Warden':    ['No one passes. No one has passed in two hundred years.','Relieved... at last. Guard them well.'],
  'The Ember Knight':    ['Keep back from the fire! You do not know what sleeps beneath it.','The flame goes out... may you never hear what wakes.'],
  'The Bishop of Teeth': ['Sing with us, little scribe. Your voice will keep forever.','The hymn... ends on a note I never learned.'],
  'The Orchard Mother':  ['My children grow so quietly. You will make a fine tree.','Water them... someone must water them...'],
  'The Pale Sovereign':  ['So the book chose you. It chose me too, once. It lies.','Write your own name last, scribe. Leave room for it.'],
  'The Gate Hound':      ['(The Hound lowers three heads and breathes sulphur.)','(It whimpers, and the gate behind it falls open.)'],
  'Cinder Matron':       ['Little moth. Come closer to the light.','Burn bright... it is over so quickly...'],
  'The Iron Inquisitor': ['Confess your names. All of them.','Absolved. We are all absolved.'],
  'Lord of Flies':       ['Everything that dies comes to me in the end. Why hurry?','Buzzing... so quiet now...'],
  'The Bone Cantor':     ['One more voice for the choir. One more.','The silence... is louder than I feared.'],
  'Duke of Chains':      ['Every soul here wears my iron. You will too.','The links break... I had forgotten the weight.'],
  'The Pale Executioner':['Kneel. It is easier for both of us.','Finally... a clean stroke.'],
  'Archdevil Vael':      ['You climb well, for a thief. That book belongs to Hell.','Take it, then... and all that comes with it.'],
  'The Hollow Seraph':   ['We burned for that book. Will you?','Keep it... better than we did...'],
  'Abaddon, King of Hell':['At last. Bring me the other half, little scribe.','The book... is whole... and it is yours. Pity you.']
};
SECRET.forEach(B=>{ BOSS_LINES[B.name]=B.lines; });
function bossSpeaks(e,when){ const L=BOSS_LINES[e.base]; if(!L) return; log(e.name+': "'+L[when==='hi'?0:1]+'"','boss'); }

// ===== BOSS PHASES =====
// At half HP a boss (gate or Tower) enters its second phase: its moves come a turn sooner, every move is announced a turn
// ahead, and it adds Sundering Blow. Taunt turns that blow onto a vanguard; a Focus crit or Grave Chill breaks any charging move.
const PHASE_AT=.5;
const PHASE_LINES={
  'The Rat King':'My court! To me, all of you, to me!',
  'The Crypt Warden':'Two hundred years. I will not be the one who fails.',
  'The Ember Knight':'Then let it all burn, and you with it!',
  'The Bishop of Teeth':'The choir will have your voice, scribe, one way or another.',
  'The Orchard Mother':'You would cut down my children? Then be pruned.',
  'The Pale Sovereign':'Enough. Let me show you what the book truly gave me.'
};
function checkPhase(){
  if(!S.run) return;
  for(const e of liveFoes()) if(e.boss&&e.abil&&!e.phase2&&(e.tw||e.rankI>=1)&&e.hp<=e.maxHp*PHASE_AT){   // the Rat King, a new player's first boss, keeps one phase
    e.phase2=true; e.fast=(e.fast||0)+1; e.alt=true; e.abilT=Math.min(e.abilT,2);   // Sundering Blow comes first
    const l=PHASE_LINES[e.base]; log(e.name+(l?': "'+l+'"':' rises in fury.'),'boss');
    log(e.name+' enters its second phase. It moves faster, warns before every move, and adds Sundering Blow.','bad'); sfx('warn'); tally('phases'); moment(e.name+' enters its second phase','bad');
  }
}
function breakCharge(e,why){ const mv=e.move||e.abil; e.charging=false; e.move=null; e.abilT=BOSS_ABIL[mv].every; log(why+' '+BOSS_ABIL[mv].name+' is lost.','ok'); tally('cancels'); moment(BOSS_ABIL[mv].name+' broken','ok'); }

// ===== ELITE AFFIXES =====
// Every elite carries one named affix (two in the deeper gates and from Tower floor 50). Raise one and the minion keeps one
// of them as a trait.
const AFFIX={
  shielded: {name:'Shielded', desc:'Starts the fight behind a bone shield worth 30% of its HP.', trait:'stalwart'},
  splitting:{name:'Splitting',desc:'Splits into two lesser copies when it dies.',               trait:'gravebound'},
  vampiric: {name:'Vampiric', desc:'Heals for 40% of the damage it deals.',                     trait:'leech'},
  enraged:  {name:'Enraged',  desc:'Hits 60% harder below half HP.',                            trait:'wrathful'},
  warded:   {name:'Warded',   desc:'Immune to bleeding, burns and poison.',                     trait:'warded'}
};
const AFFIX_IDS=Object.keys(AFFIX), SPLIT_MAX=6;
const hasAff=(e,a)=>!!(e&&e.aff&&e.aff.includes(a));
const affixN=()=>S.run&&(S.run.tw?S.run.tw>=50:S.run.di>=3)?2:1;
function giveAffixes(e,n){
  e.aff=[]; for(let i=0;i<n;i++){ const left=AFFIX_IDS.filter(a=>!e.aff.includes(a)); if(left.length) e.aff.push(pick(left)); }
  if(e.aff.includes('shielded')) e.shield=Math.round(e.maxHp*.3);
}
function affixAll(list){ for(const e of list) if(e.elite&&!e.aff) giveAffixes(e,affixN()); }   // after scaling, so the shield matches the final HP
function splitFoe(e){
  const out=[];
  for(let i=0;i<2;i++){ if(liveFoes().length>=SPLIT_MAX) break;
    const c={id:'e'+(++S.uid),name:'Lesser '+e.base,base:e.base,role:e.role,rankI:e.rankI,tw:e.tw,lvl:e.lvl,hf:e.hf,af:e.af,boss:false,elite:false,split:true,maxHp:Math.max(1,Math.round(e.maxHp*.35)),hp:0,atk:Math.max(1,Math.round(e.atk*.5)),dead:false};
    c.hp=c.maxHp; S.run.enemies.push(c); out.push(c); }
  if(out.length) log(e.name+' splits into '+out.length+' lesser cop'+(out.length>1?'ies':'y')+'.','bad');
}

// ===== TOWN BUILDINGS =====
// Built with gold, and bone dust from salvage for the higher levels. Each level lasts for the rest of the game (not through New Game+).
const BUILD={
  crypt:  {name:'Crypt',   desc:'+1 army slot per level. Also lifts the cap of 10 slots by one per level.'},
  forge:  {name:'Forge',   desc:'Reforging costs 15% less gold, and enchanting 15% less bone dust, per level.'},
  ossuary:{name:'Ossuary', desc:'+3% raise chance per level.'},
  altar:  {name:'Altar',   desc:'+5% max mana per level, and the Bone Altar costs 10% less per level.'}
};
const BUILD_MAX=3, BUILD_COST=[[1500,0],[5000,30],[14000,90]];   // [gold, bone dust] for levels 1, 2 and 3
const bl=k=>(S&&S.build&&S.build[k])||0;
const buildCost=k=>BUILD_COST[bl(k)]||null;
function build(k){
  if(!S||S.mode!=='town'||!BUILD[k]) return false; const c=buildCost(k); if(!c||S.gold<c[0]||(S.dust||0)<c[1]) return false;
  S.gold-=c[0]; S.dust=(S.dust||0)-c[1]; vitals(()=>{ S.build=S.build||{}; S.build[k]=bl(k)+1; }); tally('built'); sfx('level'); return true;
}

// ===== WHAT IS OPEN YET =====
// New players meet the town economy gradually: the Town tab and bounty board open after the first gate clear (or level 4),
// salvage and enchanting at level 6 (or once you hold bone dust). The functions work regardless; this only hides the buttons.
const anyClear=()=>!!(S&&S.ti&&S.ti.clr&&Object.keys(S.ti.clr).length);
const townOpen=()=>!!S&&(S.player.lvl>=4||anyClear()||Object.keys(S.build||{}).length>0);
const workOpen=()=>!!S&&(S.player.lvl>=6||(S.dust||0)>0);

// ===== BOUNTY BOARD =====
// Three contracts a day. Progress counts from the moment the board goes up; finished contracts are claimed in town.
// Unclaimed contracts simply lapse at dawn (no penalty).
const BOUNTY_N=3;
const BOUNTIES={
  kills:   {t:n=>'Defeat '+n+' foes in one day',       n:50,w:1, key:null},
  elites:  {t:n=>'Defeat '+n+' elites',                n:4, w:2, key:'elites'},
  raise:   {t:n=>'Raise '+n+' of the dead in one day', n:6, w:1, key:'raised'},
  rooms:   {t:n=>'Win '+n+' rooms or floors',          n:12, w:2, key:'rooms'},
  bosses:  {t:n=>'Defeat '+n+' bosses or wardens',     n:3, w:2, key:'bosses'},
  cursed:  {t:()=>'Clear today\'s cursed gate',        n:1, w:2, key:'cursed',  ok:()=>dayMod().gi>=0},
  flawless:{t:()=>'Clear a gate without losing HP',    n:1, w:1, key:'flawless',ok:()=>!!(S.ti&&S.ti.clr&&Object.keys(S.ti.clr).length)},
  arch:    {t:n=>'Go through '+n+' bloodied arches',   n:3, w:2, key:'archs'},
  orders:  {t:n=>'Give your army '+n+' orders',        n:8, w:1, key:'commands',ok:()=>S.army.length>0},
  floors:  {t:n=>'Climb '+n+' floors of the Hell Tower',n:6,w:2, key:'floors',  ok:()=>S.player.lvl>=TW.unlock},
  poison:  {t:n=>'Poison foes '+n+' times',            n:30,w:1, key:'poisoned',ok:()=>S.army.some(m=>hasTrait(m,'venom'))}
};
const BOUNTY_RW=['gold','gold','gold','salt','dust','dust','gear'];
const bountyVal=id=>id==='kills'?totalKills():T_(BOUNTIES[id].key);
function bountyReward(kind){
  const lv=S.player.lvl, g=n=>Math.round(n*ngpReward());
  if(kind==='salt') return {g:g(20+lv*10),salt:1};
  if(kind==='dust') return {g:g(20+lv*10),dust:4+Math.floor(lv/4)};
  if(kind==='gear') return {gear:1};
  return {g:g(60+lv*30)};
}
function makeBounties(){
  let pool=Object.keys(BOUNTIES).filter(k=>!BOUNTIES[k].ok||BOUNTIES[k].ok()); const list=[];
  while(list.length<BOUNTY_N&&pool.length){
    let x=Math.random()*pool.reduce((s,k)=>s+BOUNTIES[k].w,0), id=pool[0];
    for(const k of pool){ x-=BOUNTIES[k].w; if(x<=0){ id=k; break; } }
    pool=pool.filter(k=>k!==id); list.push({id,n:BOUNTIES[id].n,base:bountyVal(id),rw:bountyReward(pick(BOUNTY_RW)),claimed:false});
  }
  S.bounty={day:S.day,list};
}
function bounties(){ if(!S.bounty||S.bounty.day!==S.day) makeBounties(); return S.bounty.list; }
const bountyGot=b=>Math.max(0,bountyVal(b.id)-b.base);
const bountyDone=b=>bountyGot(b)>=b.n;
const topGate=()=>{ let g=0; for(let i=0;i<RK.length;i++) if(S.player.lvl>=RK[i].unlock) g=i; return g; };
function claimBounty(i){
  const b=bounties()[i]; if(!b||b.claimed||!bountyDone(b)||S.mode!=='town') return null;
  if(b.rw.gear&&S.inv.length>=bagMax()) return null;
  b.claimed=true; const out=[];
  if(b.rw.g){ S.gold+=b.rw.g; out.push(b.rw.g+' gold'); }
  if(b.rw.salt){ if(S.salts<SALT_MAX){ S.salts++; out.push('Grave Salts'); } else { const g=saltPrice(); S.gold+=g; out.push(g+' gold in place of salts (your pouch is full)'); } }
  if(b.rw.dust){ S.dust=(S.dust||0)+b.rw.dust; out.push(b.rw.dust+' bone dust'); }
  if(b.rw.gear){ const pool=Object.values(ITEM).filter(d=>!d.uq&&!d.tower&&d.set===topGate()), d=pick(pool), it=addItem(d.id,rollItem(d.id,true)); if(it) out.push(withArticle(d.name)); }
  tally('bounties'); sfx('coin'); return out.join(', ');
}

// ===== SOULS AND ULTIMATE SKILLS =====
// Soul Siphon harvests a Soul, and so does every elite or boss that falls. Souls last for the whole run (up to five).
// From level 20 you choose one ultimate on the Skills tab; with five Souls you can unleash it in battle (key R).
const TOLL_MUL=4, TOLL_EXEC=.2;   // Death's Toll: x your Siphon to every foe, and the execute line
const SOUL_MAX=5, ULT_LV=20, SIPHON_PIERCE=.25, SIPHON_LOW=.3, SIPHON_HEAL=.35, SIPHON_HEAL_LD=.8;
const ULTS={
  toll:  {name:"Death's Toll",         desc:'Every foe takes '+TOLL_MUL*100+'% of your Siphon, ignoring armor. Foes other than bosses left below '+TOLL_EXEC*100+'% HP die outright.'},
  rise:  {name:'Unholy Resurrection',  desc:'Every downed minion rises at full HP and the rest heal fully; you heal 40% of your max HP, and your army deals 50% more damage for 3 turns.'},
  prison:{name:'Soul Prison',          desc:'Every foe is frozen for 2 turns (bosses 1), breaking any charging move, and takes 30% more damage for 3 turns.'}
};
function gainSoul(){ const r=S.run; if(!r) return false; r.souls=r.souls||0; if(r.souls>=SOUL_MAX) return false; r.souls++; return true; }
const canUlt=()=>S.mode==='battle'&&!!S.run&&S.player.lvl>=ULT_LV&&!!ULTS[S.player.ult]&&(S.run.souls||0)>=SOUL_MAX;
function chooseUlt(id){ if(S.mode!=='town'||!ULTS[id]||S.player.lvl<ULT_LV) return false; S.player.ult=id; return true; }
function useUlt(t){
  if(!canUlt()) return false; const r=S.run, P=S.player, id=P.ult; r.souls=0; tally('ults');
  if(id==='toll'){ let tot=0, slain=0; for(const o of liveFoes()){ const d=hit(pSiph()*TOLL_MUL*pierceMul(1)); hurtFoe(o,d); tot+=d; if(o.hp>0&&!o.boss&&o.hp<o.maxHp*TOLL_EXEC){ mark(o.id,o.hp,0); o.hp=0; slain++; } }
    log("Death's Toll: every foe takes the Ledger's due, "+tot+' damage in all'+(slain?', and '+slain+' fall where they stand':'')+'.','ok'); }
  else if(id==='rise'){ let n=0; for(const m of S.army){ if(m.hp<=0){ m.hp=m.maxHp; n++; } else healAlly(m,m.maxHp); } healAlly(P,Math.round(pMax()*.4)); r.frenzy=Math.max(r.frenzy||0,3); r.frenzyMul=Math.max(r.frenzyMul||1,1.5);
    log('Unholy Resurrection: '+(n?n+' of your fallen rise again, ':'')+'your army is whole and burns with fury.','ok'); }
  else { for(const o of liveFoes()){ o.stun=Math.max(o.stun||0,o.boss?1:2); o.curse={mul:1.3,t:3}; mark(o.id,0,0); } log('Soul Prison: every foe is locked in the Ledger\'s pages, frozen and laid bare.','ok'); }
  moment(ULTS[id].name,'gold'); sfx('boss'); return true;
}

// ===== MINION FUSION =====
// Two minions of the same role become one: the stronger survives, gains a level (never past your level + 2), keeps the
// higher evolution stage and takes the other's traits (up to three). A minion can take at most two fusions in all. The other's gear goes back to your bag.
const FUSE_LV=1, FUSE_TRAITS=3, FUSE_MAX=2;
const fuseCost=(a,b)=>Math.round((a.lvl+b.lvl)*60);
const canFuse=(a,b)=>!!a&&!!b&&a!==b&&a.role===b.role&&(a.fused||0)+(b.fused||0)<FUSE_MAX;   // a minion takes at most two fusions in all
function fuse(ua,ub){
  if(S.mode!=='town') return null;
  const a=S.army.find(m=>m.uid===ua), b=S.army.find(m=>m.uid===ub); if(!canFuse(a,b)) return null;
  const c=fuseCost(a,b); if(S.gold<c) return null;
  const bFirst=b.lvl>a.lvl||(b.lvl===a.lvl&&(b.stage||0)>(a.stage||0)), k=bFirst?b:a, x=bFirst?a:b;
  S.gold-=c; returnGear(x);
  const tr=(k.traits||[]).slice(); for(const t of x.traits||[]) if(!tr.includes(t)&&tr.length<FUSE_TRAITS&&(t!=='commander'||canLead(k))) tr.push(t);   // only an elite or boss keeps Commander
  k.traits=tr; k.stage=Math.max(k.stage||0,x.stage||0); k.lvl=Math.min(S.player.lvl+2,Math.max(k.lvl,x.lvl)+FUSE_LV); k.xp=0; k.fused=(k.fused||0)+(x.fused||0)+1;
  S.army=S.army.filter(m=>m!==x); checkEvolve(k); syncMinion(k); k.hp=k.maxHp; tally('fused'); sfx('raise'); return k;
}

// ===== ITEM LOCKS AND ARMY CARE =====
// A locked item is never sold, salvaged or discarded (one by one or in bulk). Minions can be renamed and the army re-ordered.
function lockItem(u){ const it=findItem(u); if(!it) return false; if(it.lk) delete it.lk; else it.lk=true; return true; }
const NICK_MAX=16;
const cleanNick=t=>String(t==null?'':t).replace(/[^\p{L}\p{N} '\-]/gu,'').replace(/\s+/g,' ').trim().slice(0,NICK_MAX);   // letters, digits, spaces, ' and - only: names go straight into the page
function renameMinion(uid,name){ const m=S.army.find(x=>x.uid===uid), n=cleanNick(name); if(!m||!n||S.mode==='battle') return false; m.nick=n; return true; }
const ARMY_SORTS={power:'Strongest',role:'By role',level:'By level'};
const mPower=m=>m.atk*2+m.maxHp/4;
function sortArmy(k){ if(!ARMY_SORTS[k]||S.mode==='battle') return false; const ord={vanguard:0,striker:1,mender:2,reaper:3};
  S.army.sort(k==='role'?(a,b)=>ord[a.role]-ord[b.role]||b.lvl-a.lvl:k==='level'?(a,b)=>b.lvl-a.lvl||mPower(b)-mPower(a):(a,b)=>mPower(b)-mPower(a)); return true; }

// ===== SALVAGE AND ENCHANTING =====
// Salvage breaks gear into bone dust (better tiers and more bonus lines give more). Dust adds a bonus line to a piece with room
// for one, or re-rolls one line you pick. Uniques can be neither salvaged nor enchanted.
const DUST_TIER=[1,1,2,4,7];
const dustValue=it=>{ const d=ITEM[it.id]; return !d||d.uq?0:DUST_TIER[d.tier]+Math.floor(((it.ro&&it.ro.length)||0)/2); };   // +1 per two bonus lines
function salvage(u){
  if(S.mode!=='town') return 0; const i=S.inv.findIndex(x=>x.u===u); if(i<0) return 0;
  const it=S.inv[i]; if(ITEM[it.id].uq||it.lk) return 0;
  S.inv.splice(i,1); const n=dustValue(it); S.dust=(S.dust||0)+n; tally('salvaged'); return n;
}
function salvageTier(t){ if(S.mode!=='town'||!BULK_TIERS.includes(t)||!workOpen()) return null; const list=tierLot(t); let n=0; for(const it of list) n+=salvage(it.u); if(list.length) sfx('fail'); return {n:list.length,d:n}; }
function salvageJunk(){ if(S.mode!=='town') return null; const list=S.inv.filter(isJunk); let n=0; for(const it of list) n+=salvage(it.u); if(list.length) sfx('fail'); return {n:list.length,d:n}; }
const lineMax=it=>(ROLL_LINES[ITEM[it.id].tier]||[0])[0];
const enchCost=it=>Math.max(1,Math.round((3+ITEM[it.id].tier*4)*(1-.15*bl('forge'))));
function rollLine(it,skip){ const d=ITEM[it.id], k=pick(Object.keys(ROLL_KEYS).filter(x=>!skip.includes(x))); return [k,Math.max(1,Math.round(ROLL_KEYS[k]*TM[d.set]*rnd(.5,1)))]; }
function enchant(u,line){   // line < 0 adds a line; otherwise re-rolls that line
  const it=findItem(u); if(!it||S.mode!=='town'||ITEM[it.id].uq) return false;
  const c=enchCost(it), ro=it.ro||[]; if((S.dust||0)<c) return false;
  if(line<0){ if(ro.length>=lineMax(it)) return false; } else if(!ro[line]) return false;
  S.dust-=c;
  vitals(()=>{ const r=ro.slice(); if(line<0) r.push(rollLine(it,r.map(x=>x[0]))); else r[line]=rollLine(it,r.filter((x,i)=>i!==line).map(x=>x[0])); it.ro=r; });
  tally('enchanted'); sfx('level'); return true;
}
