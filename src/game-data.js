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
const QUEST = {kills:8, rooms:4, clears:1}, QUEST_PTS=1, QUEST_XP=.15;   // an unfinished quest costs nothing at dawn
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
 {name:"Warden's Key-Blade",slot:'weapon',glyph:'i_keyblade',stats:{atk:26,crit:12,strength:5},flag:'echo'},
 {name:"Ember Knight's Cinderplate",slot:'armor',glyph:'i_cinderplate',stats:{hp:130,constitution:6,ward:14,strength:3},flag:'undying'},
 {name:"Bishop's Tithe-Staff",slot:'weapon',glyph:'i_tithestaff',stats:{atk:14,siph:42,intelligence:7,mana:50},flag:'lifedrain'},
 {name:"Mother's Seedheart",slot:'relic',glyph:'i_u4',stats:{mana:90,regen:2,raise:14,will:5},flag:'soulharvest'},
 {name:'Funeral Shroud of the Pale Sovereign',slot:'armor',glyph:'i_paleshroud',stats:{hp:100,mpow:28,will:8,intelligence:6,raise:10},flag:'cheapraise'}
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
const STATL={atk:['Strike',''],crit:['Crit chance','%'],siph:['Siphon',''],hp:['Max HP',''],mana:['Max mana',''],ward:['Ward',''],strength:['Strength',''],constitution:['Constitution',''],intelligence:['Intelligence',''],will:['Will',''],raise:['Raise chance','%'],mpow:['Minion power','%'],fres:['Fire resistance','%'],frres:['Frost resistance','%'],rres:['Rot resistance','%'],sres:['Shadow resistance','%'],fdmg:['Fire damage','%'],frdmg:['Frost damage','%'],rdmg:['Rot damage','%'],sdmg:['Shadow damage','%'],regen:['Mana per turn',''],slot:['Army slots','']};

// ===== DROP TABLES =====
// Share of each tier in a gate's drops [common, uncommon, rare, epic, legendary]. Each gate leans on its own tier and sometimes the next.
const TIER_W=[[78,19,3,0,0],[8,68,22,2,0],[0,10,68,20,2],[0,0,10,68,22],[0,0,0,12,88],[0,0,0,0,100]];
// Share of a boss's drops that is its unique (per drop). Ordinary enemies of the gate drop it at UQ_MOB (1/100) of this.
const UQ=[1,.85,.75,.6,.5,.35];   // halved twice: a gate's unique should be a long chase, not a day-3 find
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
const tcache={}, UQ_MOB=.01;   // ordinary foes carry a gate's unique at 1% of a boss's odds (elites twice that)
function tableFor(di,role,boss,elite,sig,mob){   // mob: an elite of the difficulty rules, with an ordinary foe's unique odds
  const key=[di,role,boss?1:0,elite?1:0,sig||'',mob?1:0].join('|'); if(tcache[key]) return tcache[key];
  const nx=Math.min(5,di+1);
  const tw=TIER_W[di].map((w,t)=>(boss||elite)?(w*2+TIER_W[nx][t])/3:w);   // bosses and elites lean one tier higher
  const bias=ROLE_BIAS[role]||{};
  const uqp=UQ[di]*(boss?1:UQ_MOB)*(elite&&!mob?2:1), scale=(100-uqp)/100, rows=[];
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
const ownsItem=id=>!!S&&(S.inv.some(it=>it.id===id)||GEAR_SLOTS.some(sl=>S.equip[sl]&&S.equip[sl].id===id)||S.army.concat(S.reserve||[],S.waiting||[],...(S.raids||[]).map(x=>x.units)).some(m=>m.eq&&GEAR_SLOTS.some(sl=>m.eq[sl]&&m.eq[sl].id===id)));
function rollDrops(e){
  const out=[], rows=e.tw?towerTable(e.tw,e.role,e.boss,e.elite):tableFor(e.rankI,e.role,e.boss,e.elite,SIG[e.base],e.hx);
  const more=(S.run&&S.run.siege?SIEGE_DROP:1)*((!e.tw&&runMod())?MOD_DROP:1)*(roomKind()==='elite'?ELITE_DROP:1)*heatK('drop')*(S.run&&S.run.rift?Math.min(RIFT_DROP_MAX,1+RIFT_DROP*S.run.rift):1)*(omen()==='ironrain'?IRON_DROP:1)*(hasMod('robber','b')?KEEN_DROP:1)*pactDrop();   // Iron Rain, Keen Eye and New Game+ pacts
  for(const c of dropChances(e.boss,e.elite)) if(Math.random()<c*more){ let id=pickRow(rows);
    if(ITEM[id].uq&&(ownsItem(id)||out.includes(id))) id=pickNorm(rows.filter(r=>!ITEM[r.id].uq));   // a unique you already carry becomes ordinary gear instead
    out.push(id); }
  if(e.secret) for(let i=0;i<2;i++) out.push(pick(Object.values(ITEM).filter(d=>!d.uq&&d.tier===4)).id);   // a secret master always leaves two legendaries
  return out;
}
const BAG_MAX=30, BAG_STEP=5, BAG_COST=[250,600,1500,3500];   // bag upgrades: +5 slots each, bought at the market
const bagMax=()=>BAG_MAX+BAG_STEP*((S&&S.bagLv)||0);
const KNOW_AT=25;   // kills of one enemy type needed to study its drop table in the bestiary
// Bestiary mastery: a ladder on S.kills only (no save fields; New Game+ keeps the bestiary, so mastery carries over).
// at = kills for an ordinary foe, bossAt = for gate bosses, Tower wardens and secret masters (null: not a rung for them).
// raise = raise chance on its bodies, dmg = % more damage from you and your minions, lv = levels higher on rising. Values are the tier's total.
const MASTERY=[
  {id:'studied', name:'Studied', at:KNOW_AT, bossAt:null, raise:0, dmg:0, lv:0},
  {id:'known',   name:'Known',   at:75,      bossAt:6,    raise:2, dmg:0, lv:0},
  {id:'mastered',name:'Mastered',at:180,     bossAt:15,   raise:4, dmg:3, lv:0},
  {id:'ledgered',name:'Ledgered',at:450,     bossAt:35,   raise:5, dmg:4, lv:1}];
let BOSS_KINDS=null;
function bossKind(name){ if(!BOSS_KINDS){ BOSS_KINDS=new Set(); DUNGEONS.forEach(D=>BOSS_KINDS.add(D.boss[0])); SECRET.forEach(B=>BOSS_KINDS.add(B.name)); TW_BOSS.forEach(n=>BOSS_KINDS.add(n)); BOSS_KINDS.add(SIEGE_BOSS); BOSS_KINDS.add('Rival Necromancer'); } return BOSS_KINDS.has(name); }
const masteryRungs=name=>MASTERY.map(t=>({t,at:bossKind(name)?t.bossAt:t.at})).filter(x=>x.at!=null);
function masteryOf(name){ const k=(S&&S.kills&&S.kills[name])||0; let got=null; for(const x of masteryRungs(name)) if(k>=x.at) got=x.t; return got; }   // highest tier reached, or null
function masteryNext(name){ const k=(S&&S.kills&&S.kills[name])||0; return masteryRungs(name).find(x=>k<x.at)||null; }   // {t,at} of the next tier, or null when complete
const masteryRaise=name=>{ const t=masteryOf(name); return t?t.raise:0; };
const masteryDmg=name=>{ const t=masteryOf(name); return t?t.dmg:0; };
const masteryLv=name=>{ const t=masteryOf(name); return t?t.lv:0; };
function masteryGives(t){   // what a tier gives, in plain words
  if(!t) return 'Nothing yet';
  if(t.id==='studied') return 'Its drop table is known';
  return '+'+t.raise+'% raise chance on its bodies'+(t.dmg?', you and your minions deal +'+t.dmg+'% damage to it':'')+(t.lv?', and its bodies rise '+t.lv+' level higher':'');
}
// ----- random bonus lines ("rolls") on gear. Each piece you find, buy or forge can carry extra stat lines; rarer tiers carry more.
// Stored on the item as ro:[[stat,value],...]. Uniques never roll; they are fixed.
const ROLL_KEYS={atk:1.2,crit:.5,siph:1.2,hp:5,mana:4,ward:1.2,strength:.5,constitution:.5,intelligence:.5,will:.5,raise:.8,mpow:1.2,fres:2.1,frres:2.1,rres:2.1,sres:2.1,fdmg:2.1,frdmg:2.1,rdmg:2.1,sdmg:2.1};
const ROLL_SLOT={fres:['armor'],frres:['armor'],rres:['armor'],sres:['armor'],fdmg:['weapon','relic'],frdmg:['weapon','relic'],rdmg:['weapon','relic'],sdmg:['weapon','relic']};   // typed lines roll only on these slots
const rollKeys=slot=>Object.keys(ROLL_KEYS).filter(k=>!ROLL_SLOT[k]||!slot||ROLL_SLOT[k].includes(slot));   // value per point of set multiplier
const ROLL_LINES=[[1,.35],[1,.6],[2,.55],[2,.7],[3,.65]];   // per tier: [max lines, chance of each line]
const REFORGE_COST=.4;   // share of the merchant price
function rollItem(id,atLeast){
  const d=ITEM[id]; if(!d||d.uq) return null;
  const up=(S&&S.run&&omen()==='ironrain')?1:0;   // Iron Rain: gear found in a run rolls its lines as if one tier higher
  const [max,ch]=ROLL_LINES[Math.min(ROLL_LINES.length-1,d.tier+up)]||[0,0], m=TM[d.set], out=[];
  for(let tries=0;tries<20&&!out.length;tries++){
    for(let i=0;i<max;i++) if(Math.random()<ch){ const left=rollKeys(d.slot).filter(k=>!out.some(r=>r[0]===k)); const k=pick(left); out.push([k,Math.max(1,Math.round(ROLL_KEYS[k]*m*rnd(.5,1)))]); }
    if(!atLeast) break;
  }
  return out.length?out:null;
}
const baseStat=(it,d,k)=>{ const v=(d&&d.stats[k])||0; return v&&it&&it.aw&&d.uq&&!AWAKEN_FLAT[k]?Math.round(v*(1+AWAKEN_K*it.aw)):v; };   // an awakened unique's own stats (game-phases-town.js AWAKENING)
const itStat=(it,k)=>{ const d=ITEM[it.id]; let n=baseStat(it,d,k); if(it.ro) for(const r of it.ro) if(r[0]===k) n+=r[1]; return n; };
const itStats=it=>{ const d=ITEM[it.id], o={}; for(const k in d.stats) o[k]=baseStat(it,d,k); if(it.ro) for(const r of it.ro) o[r[0]]=(o[r[0]]||0)+r[1]; return o; };
const G=k=>{ let n=0; if(S&&S.equip) for(const sl in S.equip){ const it=S.equip[sl]; if(it&&ITEM[it.id]) n+=itStat(it,k); } return n+xb(k); };   // gear plus the worn title
const A=k=>S.player.stats[k]+G(k);
const sk=id=>(S&&S.player&&S.player.skills&&S.player.skills[id])||0;   // learned rank of a skill (0 = not learned)
const hasFlag=f=>(!!(S&&S.equip)&&Object.values(S.equip).some(it=>it&&ITEM[it.id]&&ITEM[it.id].flag===f))||(f==='thorns'&&capOn('bone2'));   // Barbed Ossuary grants Thorns (src/game-progression.js)

// ===== HELL TOWER =====
// A separate 100-floor climb. Each floor is one fight; every tenth floor is a warden. Enemies grow every single floor.
// 2026-11-19 after the stat rebalance the bots reached floor ~90 (market) / ~99 (full); hpG .025->.037 and atkG .021->.024 (health grows faster
// than attack: that spread market and full the way they were) bring them back to ~72 / ~83, near the 71 / 82 before the stat rework.
// The same day the new systems lifted them to ~73 / ~91; hpG .037->.042 brings them to ~71 / ~83 (seeds 7700/9100).
// 2026-11-26, after the Soul Tether: nothing one-shots the hero, so a day-100 army walked all 100 floors (once the bot's step limit was lifted).
// hpG .042->.06, atkG .024->.04 and a steeper climb past 60 keep the market bot's curve (floor ~43 on day 35, ~68 on day 60, ~78 on day 100;
// it was 43/66/79) and bring the full bot from ~94 to ~88.
const TW={unlock:10,hp0:4.7,hpG:.07,atk0:3.9,atkG:.048,repeat:.06,armor:.85,foeAtk:1.4};   // armor/foeAtk: enemy-only, see DIFF.armor
const TW_MOBS=[['Imp','striker',.95,1.3],['Hellhound','striker',.95,1.3],['Chain Devil','vanguard',1.4,.9],['Pit Warden','vanguard',1.4,.9],['Soul Tender','mender',.8,.8],['Brimstone Chanter','mender',.8,.8]];
TW_MOBS.push(['Hell Legionary','vanguard',1.4,.9],['Infernal Duelist','striker',.95,1.3]);
const TW_BOSS=['The Gate Hound','Cinder Matron','The Iron Inquisitor','Lord of Flies','The Bone Cantor','Duke of Chains','The Pale Executioner','Archdevil Vael','The Hollow Seraph','Abaddon, King of Hell'];
// 12 uniques: one per warden, and the final warden drops three. They get stronger every ten floors and the last three are the strongest items in the game.
const TW_UNIQ=[
 {f:10,name:'Hound-Fang Dagger',slot:'weapon',glyph:'i_houndfang',stats:{atk:34,crit:15,strength:6},flag:'execute'},
 {f:20,name:"Matron's Ember Mantle",slot:'armor',glyph:'i_embermantle',stats:{hp:190,constitution:8,ward:22,mpow:5},flag:'thorns'},
 {f:30,name:"Inquisitor's Censer",slot:'relic',glyph:'i_censer',stats:{mana:130,intelligence:9,regen:2,will:5},flag:'censer'},
 {f:40,name:'Chitin of the Fly-Lord',slot:'armor',glyph:'i_flychitin',stats:{hp:260,constitution:10,mpow:18,will:7},flag:'swarmguard'},
 {f:50,name:"Cantor's Rib-Staff",slot:'weapon',glyph:'i_ribstaff',stats:{atk:40,siph:70,intelligence:12,mana:90},flag:'chorus'},
 {f:60,name:"Chain-Duke's Collar",slot:'relic',glyph:'i_collar',stats:{mana:170,will:12,raise:18,slot:1,mpow:20},flag:'bindsouls'},
 {f:70,name:"Executioner's Axe",slot:'weapon',glyph:'i_axe',stats:{atk:78,crit:22,strength:12},flag:'cleave'},
 {f:80,name:"Vael's Hellplate",slot:'armor',glyph:'i_hellplate',stats:{hp:400,constitution:14,ward:40,strength:8},flag:'infernal'},
 {f:90,name:"Seraph's Broken Halo",slot:'relic',glyph:'i_halo',stats:{mana:220,intelligence:14,will:12,regen:3,raise:20},flag:'halo'},
 {f:100,name:'Crown of Ruin',slot:'relic',glyph:'i_ruincrown',stats:{mana:300,intelligence:20,will:20,mpow:40,regen:5,slot:2,raise:25},flag:'ruin'},
 {f:100,name:'Hellmaw, the Last Blade',slot:'weapon',glyph:'i_greatsword',stats:{atk:120,crit:30,strength:20,siph:60},flag:'hellfire'},
 {f:100,name:'Mantle of the Last Sovereign',slot:'armor',glyph:'i_lastmantle',stats:{hp:650,constitution:24,ward:70,strength:10,mpow:20},flag:'deathless'}
];
const TW_IDS={};
TW_UNIQ.forEach((u,i)=>{ const id='w'+(i+1); ITEM[id]=Object.assign({id,set:6,tier:5,uq:true,kind:'u',tower:true,floor:u.f},u); (TW_IDS[u.f]=TW_IDS[u.f]||[]).push(id); });
const twLvl=f=>6+Math.round(f*.5);                       // enemy level on floor f
const twRank=f=>Math.min(5,2+Math.floor(f/25));          // rank letter shown for tower enemies (C..S)
// Above floor 60 the climb steepens faster (HP and attack at 1.5x the rate). It used to slow down there (attack at half the rate, HP at 70%)
// because the old curve one-shot level-70 players on floor 90; the Soul Tether ended one-shots, and the flatter top let a level-52 army
// walk to floor 100. The recommended level climbs faster up there too, so it tells the truth.
const twHpF=f=>f<=60?f:60+(f-60)*1.5, twAtkF=f=>f<=60?f:60+(f-60)*1.5;
const recLv=f=>f<=60?10+Math.round(f*.5):40+Math.round((f-60)*1.2);   // level a decent player wants for floor f
function towerStats(f,lvl,hf,af,boss,elite){
  let hp=14*TW.hp0*Math.pow(1+TW.hpG,twHpF(f)-1)*hf*DIFF.hp*(1+.16*(lvl-1));
  let atk=3.2*TW.atk0*Math.pow(1+TW.atkG,twAtkF(f)-1)*af*DIFF.atk*(1+.12*(lvl-1));
  if(boss){ hp*=2.2+5.8*(f/100); atk*=1.2+.8*(f/100); if(f===100){ hp*=1.6; atk*=1.35; } }   // the last warden is on a different scale
  if(elite){ hp*=1.5; atk*=1.3; }
  return {hp:Math.round(hp),atk:Math.max(1,Math.round(atk))};
}
// A minion raised in the Hell Tower stands like a Throne of Ash minion of its level, plus TW_MINION per floor it fell on (a floor-100 warden
// +100%). It used the foes' floor curve until 2026-11-26: that curve outgrows you on purpose, so a raised floor-90 warden had ~290x the HP and
// ~35x the attack of an S minion of its level, a runaway that carried the hero through the Rift once Command shared the army's power.
const TW_MINION=.01;
function twMinion(f,lvl,hf,af,boss,elite){ const s=mobStats(5,lvl,hf,af,boss,elite), k=1+TW_MINION*f; return {hp:Math.round(s.hp*k),atk:Math.max(1,Math.round(s.atk*k))}; }
const minionBase=m=>m.tw?twMinion(m.tw,m.lvl,m.hf,m.af,m.boss,m.elite):mobStats(m.rankI,m.lvl,m.hf,m.af,m.boss,m.elite);   // syncMinion and the minion card
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
  r.enemies=list; r.corpses=[]; r.events=[]; r.turn=1; r.fx={}; r.target=list[0].id; r.loot=[]; r.spoils=[]; r.lostLoot=[]; r.cmd={}; r.taunt=0; roomStart(list);
  log(boss?'Floor '+f+'. The warden of this tier is waiting.':'Floor '+f+'.'); if(boss){ bossSpeaks(list[0],'hi'); fxe('boss',list[0]); }
  if(hasFlag('infernal')) infernalWard();
  snapRoom();
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
// 2026-11-19, after the lower raise chance, smaller mastery and stronger stat scaling (market bot cleared D 62%, B/A/S 91-95%): gate[1] 1.65->1.5,
// foeAtk D 1.3->.85, B 2.1->2.8, A 1.38->2.2, S .8->1.55. Later the same day, after the stat rebalance (market B 73-78%, A 74-81%): foeAtk B 2.8->2.6, A 2.2->2.1.
const DIFF={hp:2.2,atk:2.0,gate:[0.68,1.5,2.2,1.9,1.7,2.45],xpBase:64,xpExp:1.85,heal:.15,mana:.25,mheal:.2,deathXp:.15};
// 2026-11-26, the Soul Tether (a lone blow takes at most half your HP while your front holds): B/A/S deaths were ~97% one blow at full HP, so their
// foe attack barely mattered; with the tether it does. foeAtk B 2.6->5.2, A 2.1->4.2, S 1.55->4.5 and S armor .85->.94 (S rooms took 1.5 turns once
// nothing one-shot the hero) put the market bot's clear-by-level curve back where it was (B 88% at Lv16, A 80% at 19, S 74/80% at 26/27).
// 2026-11-21: foeAtk E 1->1.2, D .85->.95 (market E 93->89-91%, D 86-91->82-86%). The S gate stays ~91% when farmed 15 levels over: foes only 4 levels below the hero did not move it.
// SAFE: the hero level the balance bot (tests/balance-test.js) starts entering each gate at, and the reference level of the farming falloff (farmK)
// and of secret-master growth (SB_GROW). Rules and bot only: what the player is told is gateRec (below), which is measured and follows the tuning.
const SAFE=[1,6,10,15,19,25];   // A and S were 22/28, which the XP from B could not reach (players stalled near level 20); they were balanced at 19/25
// Foe armor: the share of damage living foes shrug off, per gate (TW.armor in the Tower). It makes fights last more turns without
// inflating any numbers, and the extra turns are what make a room dangerous. Minions use the same stat formula as enemies, so
// DIFF.hp/atk and DIFF.gate move both sides; armor and foeAtk affect living foes only. Tuned with tests/balance-test.js.
// Target: a bot that learns skills, entering each gate at its Recommended level, clears ~80% of runs (A and S were tuned entering 3 levels early,
// because the XP curve stalls the fair bot near level 20). The no-skill bot dies noticeably more often.
DIFF.armor=[0.30,0.66,0.88,0.85,0.89,0.94]; DIFF.foeAtk=[1.0,0.9,1.0,7.0,5.7,6.1];   // retuned after boss abilities, altar, salts, and minion traits/evolution (D, A, S raised); xpBase 70->64 keeps the leveling pace (S first cleared ~day 64)   A 1.5->1.38 after status effects (bleeding from its strikers)   D 1.2->1.1 and C 1.2->1.0: the bots cleared C 69% (market) and D 71% (full), now about 80% and 76%   D armor .74->.66 with foeAtk 1.1->1.3: same danger, shorter rooms (bots: 7.5->5.8 turns per room market, 9.6->7.1 full)
// Farming far below you on Normal pays less: kill XP, kill gold and the clear bonus are full up to FARM_FROM levels past a gate's SAFE level,
// then ramp down to FARM_MIN at FARM_TO and beyond. Hard and up, cursed gates, a gate's first clear, drops, the Tower, the Rift, raids, bounties and quests pay in full.
DIFF.farmFrom=8; DIFF.farmTo=20; DIFF.farmMin=.5;
const farmK=(di,lvl)=>{ const t=clamp(((lvl-SAFE[di])-DIFF.farmFrom)/(DIFF.farmTo-DIFF.farmFrom),0,1); return 1-(1-DIFF.farmMin)*t; };
// Recommended hero level per gate: the gate card's "Recommended Lv N+", its Easy/Fair/Hard/Deadly label and the Codex.
// REC_BASE is measured: the lowest hero level at which the market bot clears the gate about 75% or more on Normal
// (node tests/run-balance.js '{"byLvl":true}', once as is and once with "push":true for the levels below SAFE), at the tuning in REC_AT.
// gateRec moves it with that gate's tuning: a room's danger goes with foe HP / (1 - armor) x foe attack, so a change in armor, foeAtk,
// DIFF.gate or foe level RK.lv shifts the advice by the number of foe levels (LV_HP/LV_ATK growth) that changes that product as much.
// A test fails once the shift passes REC_DRIFT levels: then re-measure and update REC_BASE and REC_AT together.
const LV_HP=.16, LV_ATK=.12;   // foe and minion growth per level (mobStats)
const REC_BASE=[1,5,9,16,19,27], REC_AT=[[.30,1.0,.68,1],[.66,.9,1.5,4],[.88,1,2.2,8],[.85,7.0,1.9,12],[.89,5.7,1.7,17],[.94,6.1,2.45,23]], REC_DRIFT=2;   // REC_AT per gate: [armor, foeAtk, gate, RK.lv]. Re-measured 2026-11-26 after foe kits and the E/D foeAtk 1.2/.95 -> 1.0/.9 (market, byLvl and push, seeds 7700 and 9100): D 87% at Lv5, C 78% at 9, B 79-89% at 14-15, A 77-85% at 19, S 86-89% at 26, so REC_BASE stands. Re-measured 2026-11-26 after Command and the B/A/S foeAtk 5.2/4.2/4.5 -> 7/5.7/6.1 (market, seed 7700, byLvl): B 87% at Lv16, A 83% at 19, S 79/91% at 26/27, so REC_BASE stands. Re-measured 2026-11-26 after the Soul Tether and the B/A/S retune (market, seed 7700, byLvl): B 68/88% at Lv 15/16, A 80% at 19, S 74/80% at 26/27, so REC_BASE stands. Re-measured 2026-11-19 after the retune (market bot, seed 7700, byLvl and push): the bot first reached ~75% at 1/5/9/15/19/27 (1/7/11/16/20/25 on 2026-11-15); again after the stat rebalance the same day: 1/5/9/16/19/27
function recShift(di,f){   // f: a difficulty's foe multiplier (HEAT[h].foe); spawnRoom scales foe HP and attack by it alike, so danger goes by f squared
  const a=REC_AT[di], k=(g,ar,fa)=>g*g*fa/(1-ar), grow=t=>(1+LV_HP*t)*(1+LV_ATK*t);   // t = foe level - 1
  const R=k(DIFF.gate[di],DIFF.armor[di],DIFF.foeAtk[di])/k(a[2],a[0],a[1])*grow(RK[di].lv+1)*(f||1)*(f||1), A=LV_HP*LV_ATK, B=LV_HP+LV_ATK;   // mid-run foes stand 2 levels above RK.lv
  return (-B+Math.sqrt(Math.max(0,B*B-4*A*(1-R))))/(2*A)-(a[3]+1);   // the foe level whose old-tuning strength matches the new tuning, minus the old one
}
const gateRec=di=>Math.max(1,Math.round(REC_BASE[di]+recShift(di)));
// Per difficulty (HEAT): the same model with the tier's foe multiplier on foe HP and attack, times REC_TIER, the share of that modeled
// shift the market bot really needs (gear, army and skills outgrow the multiplier; the raw model asked 4/12/35 levels too many).
// Measured 2026-11-15 (node tests/run-balance.js '{"tiers":{"gates":[0,1,2,3,4,5],"every":3}}', seed 7700): the bot first clears ~75%
// on Hard/Brutal/Nightmare at D 8/9/11, C 12/14/25, B 20/26/38, A 25/31/46, S 34/42/~57; a least-squares fit gave .53/.44/.38.
// Re-checked 2026-11-19 after the retune (same probe): D 7/8/10, C 12/14/21, B 18/26/39, A 24/33/49, S 37/46/>52; the same shares still fit within a few levels.
// Hard 1.4 -> 1.8 and Brutal 2 -> 2.5 later that day (the full bot farmed Hard ~91%; Brutal stays a clear step up). Re-measured (same probe,
// heats [1] and [2]): Hard D 8, C 14, B 24, A 28, S 36; Brutal D 10, C 16, B 26, A 34, S 40; shares .55/.45 -> .4/.32.
// Re-measured 2026-11-26 after the Soul Tether (same probe, market, heats [1,2,3], near 20): the old shares asked 4-12 levels too many (S Brutal
// advised 42, the bot cleared it ~75% at 30). First ~75%: Hard D 8, C 13, B 18, A 24, S 28; Brutal D 9, C 14, B 22, A 26, S 30; Nightmare D 10, C 16,
// B 24, A 28, S 34; shares .2/.18/.13 fit D-A within ~1 level and run ~4 high on S (least squares over all five gave .16/.14/.11, 2 low on C-A: advice that
// errs high is the safer one).
// REC_TIER_F holds HEAT's foe values at that measurement: a test fails once a HEAT change moves the advice past REC_DRIFT levels.
const REC_TIER=[1,.2,.18,.13], REC_TIER_F=[1,1.8,2.5,3.6];
const tierRaw=(di,h,f)=>REC_BASE[di]+recShift(di)+(REC_TIER[h]||1)*(recShift(di,f)-recShift(di));
const tierRec=(di,h)=>{ let r=gateRec(di); for(let t=1;t<=(h||0)&&t<HEAT.length;t++) r=Math.max(r+1,Math.round(tierRaw(di,t,HEAT[t].foe))); return r; };   // each tier at least a level above the one below
const NGP_FOE=.3, NGP_REWARD=.25, ngpFoe=()=>1+NGP_FOE*((S&&S.ngp)||0), ngpReward=()=>(1+NGP_REWARD*((S&&S.ngp)||0))*pactReward();   // New Game+: tougher foes, richer rewards
function foeScale(list,a){ const n=ngpFoe(); for(const e of list){ if(n!==1){ e.maxHp=e.hp=Math.round(e.maxHp*n); } if(a*n!==1) e.atk=Math.max(1,Math.round(e.atk*a*n)); } }
const foeArmor=()=>{ if(!S.run) return 0; const a=S.run.tw?TW.armor:DIFF.armor[S.run.trial?TRIAL_GATE:S.run.di]*(S.run.siege?siegeArmorK():1); return omen()==='ironrain'?1-(1-a)/IRON_ARMOR:a; };   // Iron Rain: foes 25% tougher to hurt
// ===== DAMAGE TYPES =====
// Every hit has one of five types (hurtFoe / hurtAlly take it; physical when none is given). A foe's resistance to a type comes from where it
// stands (GATE_RES, the Tower, the Rift's depth, a siege) and scales the damage once, after armor and before shields: 0.25 = takes 25% less,
// -0.25 = takes 25% more (weak). Your gear can resist the four magic types (armor only) and add damage of one type (weapon and relic):
// those bonus lines are the *res and *dmg roll keys. Strikers hit with their place's type (GATE_HITS); vanguards and menders hit physical.
const DTYPE={phys:{name:'Physical',res:null,dmg:null},shad:{name:'Shadow',res:'sres',dmg:'sdmg'},frost:{name:'Frost',res:'frres',dmg:'frdmg'},fire:{name:'Fire',res:'fres',dmg:'fdmg'},rot:{name:'Rot',res:'rres',dmg:'rdmg'}};
const DT_IDS=Object.keys(DTYPE);
const GATE_RES=[{fire:-.25,rot:.25},{frost:-.25,fire:.25},{frost:-.25,fire:.5},{phys:-.25,shad:.25},{rot:-.25,phys:.25},{frost:-.25,fire:.25,shad:.25}];
const GATE_HITS=['rot','frost','fire','shad','phys','shad'];
const TOWER_RES={frost:-.25,fire:.5}, TOWER_HITS='fire', SIEGE_RES={shad:-.25}, SIEGE_HITS='phys';
const RES_CAP=.5, FOE_RES_MAX=.9, IRON_PHYS=.15, STORM_SHAD=1.1;   // RES_CAP: your own resistance to one type; Iron Rain: foes resist physical; Soul Storm: your shadow damage
const riftRes=n=>{ const w=DT_IDS[(n*7+2)%5], r=DT_IDS[(n*3+(n>>2)+4)%5]; const o={}; o[w]=-.25; if(r!==w) o[r]=.25; else o[DT_IDS[(DT_IDS.indexOf(w)+2)%5]]=.25; return o; };   // one weakness and one resistance per depth, the same every time
function placeRes(r){ r=r||S.run; if(!r) return {}; return r.siege?SIEGE_RES:r.tw?TOWER_RES:r.rift?riftRes(r.rift):GATE_RES[r.di]||{}; }
function foeRes(e,ty){ if(e&&e.imm===ty) return 1; let v=(placeRes()[ty]||0)+(e&&e.res&&e.res[ty]||0)+(e&&KIND_RES[e.base]&&KIND_RES[e.base][ty]||0); if(ty==='phys'&&omen()==='ironrain') v+=IRON_PHYS; return Math.min(FOE_RES_MAX,v); }
const typeDmg=ty=>{ const k=DTYPE[ty]&&DTYPE[ty].dmg; return (k?1+G(k)/100:1)*(ty==='shad'&&omen()==='soulstorm'?STORM_SHAD:1); };   // your damage of one type: gear lines (you and your army), Soul Storm
const TRAIT_RES={rimeborn:['frost',.25],cinderborn:['fire',.25],necrotic:['rot',.25],venom:['rot',.25]};   // a minion risen with a typed trait shrugs off its own element
function allyRes(a,ty){ if(!ty||ty==='phys') return 0; if(a.id==='p'){ const k=DTYPE[ty].res; return k?Math.min(RES_CAP,G(k)/100):0; } let v=0; for(const t in TRAIT_RES) if(TRAIT_RES[t][0]===ty&&hasTrait(a,t)) v=Math.max(v,TRAIT_RES[t][1]); return v; }
const DOT_TYPE={poison:'rot',blight:'rot',burn:'fire',bleed:'phys'};
const foeHitType=e=>hasAff(e,'frosty')?'frost':hasAff(e,'burning')?'fire':e.role!=='striker'?'phys':S.run&&S.run.siege?SIEGE_HITS:S.run&&S.run.tw?TOWER_HITS:GATE_HITS[S.run?S.run.di:0]||'phys';
function minionType(m){ if(hasTrait(m,'shatterwrought')) return m.swt?'fire':'frost'; if(hasTrait(m,'rimeborn')) return 'frost'; if(hasTrait(m,'cinderborn')) return 'fire'; if(hasTrait(m,'venom')||hasTrait(m,'necrotic')) return 'rot'; if(hasTrait(m,'bloodfiend')) return 'shad'; return 'phys'; }   // compounds count as both halves (hasTrait)
const resWord=v=>v<=-.5?'very weak':v<0?'weak':v>=.5?'resists strongly':'resists';
let S = null;
const rnd = (a,b)=>a+Math.random()*(b-a);
const pick = a=>a[Math.floor(Math.random()*a.length)];
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const need = l=>Math.round(DIFF.xpBase*Math.pow(l,DIFF.xpExp));
const mneed = l=>Math.round(36*Math.pow(l,1.6));

