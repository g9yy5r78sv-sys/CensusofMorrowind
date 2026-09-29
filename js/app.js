(() => {
/* --------------------------------------------------------------------------
   CANONICAL ORDER
   One source for display order. Data validation below checks that source keys
   still match these lists instead of accidentally inheriting object insertion order.
   -------------------------------------------------------------------------- */
const ORDER = Object.freeze({
  races: ["Argonian", "Breton", "Dark Elf", "High Elf", "Imperial", "Khajiit", "Nord", "Orc", "Redguard", "Wood Elf"],
  birthsigns: ["The Apprentice", "The Atronach", "The Lady", "The Lord", "The Lover", "The Mage", "The Ritual", "The Serpent", "The Shadow", "The Steed", "The Thief", "The Tower", "The Warrior"],
  backstoryStyles: ["Lore-friendly", "Grounded", "Adventurous", "Dark", "Comedic"],
});

const allSkills = DATA.skills;
function sortSkillsByCanon(skills){
  return [...skills].sort((a,b)=>allSkills.indexOf(a)-allSkills.indexOf(b));
}
const ATTRIBUTE_NAMES = ["Strength","Intelligence","Willpower","Agility","Speed","Endurance","Personality","Luck"];
const GENDERS = ["male","female"];
const RACES = ORDER.races;
const TR_RACES=Object.keys(DATA.trRaces);
const ALL_RACES_WITH_TR=[...RACES,...TR_RACES];
const BIRTHSIGNS = ORDER.birthsigns;
const BACKSTORY_STYLES = ORDER.backstoryStyles;
const SPEC_SKILLS={
   Combat:["Armorer","Axe","Block","Blunt Weapon","Heavy Armor","Long Blade","Medium Armor","Spear","Athletics"],
   Magic:["Alchemy","Alteration","Conjuration","Destruction","Enchant","Illusion","Mysticism","Restoration","Unarmored"],
   Stealth:["Acrobatics","Hand-to-hand","Light Armor","Marksman","Mercantile","Security","Short Blade","Sneak","Speechcraft"]};
const BUILD_FOCUS_SPECS = {Combat: "Combat",Magic: "Magic",Stealth: "Stealth"};
const MAGICKA_RACE_BONUS={Breton:.5,"High Elf":1.5},MAGICKA_BIRTH_BONUS={"The Apprentice":1.5,"The Mage":.5,"The Atronach":2};

/* --------------------------------------------------------------------------
   GENERATION RULES
   Keep tunable probabilities and selection limits together so the generator
   and the Reference page can be audited against the same named rules.
   -------------------------------------------------------------------------- */
const RULES = Object.freeze({
  startingSkills: Object.freeze({base:5,specialization:5,major:25,minor:10}),
  classSelection: Object.freeze({playerLimit:4,npcLimit:12}),
  homeland: Object.freeze({specificChance:.70}),
  family: Object.freeze({specificChance:.65}),
  naming: Object.freeze({
    unrestrictedAnyGenderChance:.15,
    familyChance:.38,
    titleChance:.20,
    highElfSurnameChance:.35,
    nordFamilyChance:.70,
    redguardFamilyChance:.08,
    woodElfFamilyChance:.02,
    orcExceptionalChance:.06,
    orcUnprefixedChance:.01
  }),
  backstory: Object.freeze({
    minAge:18,
    ageSpan:28,
    wildcardChance:Object.freeze({Comedic:.38,Adventurous:.24,Default:.12})
  }),
  rngesus: Object.freeze({presetClassChance:.33,npcClassChance:.33})
});
const ALL_CLASSES={...DATA.classes,...DATA.npcClasses};
const ALL_TR_CLASSES={...DATA.classes,...DATA.trClasses};
const ALL_CLASSES_WITH_TR={...DATA.classes,...DATA.npcClasses,...DATA.trClasses};
const HIGH_ELF_TITLES=DATA.highElfTitles;
const ORC_EXCEPTIONAL_SURNAMES=DATA.orcExceptionalSurnames;
const ORC_UNPREFIXED_SURNAMES=DATA.orcUnprefixedSurnames;
/* --------------------------------------------------------------------------
   RANDOMIZATION HELPERS
   -------------------------------------------------------------------------- */
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function sample(a,n){const out=a.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out.slice(0,n)}
function scoreClass(c,skill,style){if(style==="Unusual")return c.min.includes(skill)?5:c.maj.includes(skill)?2:0;return (c.maj.includes(skill)?5:0)+(c.min.includes(skill)?2:0)}
function classPool(allowNpc=false,allowTR=false){
 if(allowTR)return allowNpc?ALL_CLASSES_WITH_TR:ALL_TR_CLASSES;
 return allowNpc?ALL_CLASSES:DATA.classes;
}
function rankedClasses(skill,style,allowNpc=false,allowTR=false){
 const pool=classPool(allowNpc,allowTR);
 const groups=new Map();
 for(const name of Object.keys(pool)){const score=scoreClass(pool[name],skill,style);if(!groups.has(score))groups.set(score,[]);groups.get(score).push(name)}
 return [...groups.keys()].sort((a,b)=>b-a).flatMap(score=>sample(groups.get(score),groups.get(score).length));
}
function compatibleClasses(skill, style, allowNpc = false, allowTR = false, buildFocus = "Any") {
  let names = rankedClasses(skill, style, allowNpc, allowTR);

  const requiredSpec = BUILD_FOCUS_SPECS[buildFocus];
  if (requiredSpec) {
    const pool = classPool(allowNpc, allowTR);
    names = names.filter(name => pool[name]?.spec === requiredSpec);
  }

  if (style === "Chaos") return names;

  const limit = allowNpc
    ? RULES.classSelection.npcLimit
    : RULES.classSelection.playerLimit;

  return names.slice(0, Math.min(limit, names.length));
}
   
const GREAT_HOUSES=["House Hlaalu","House Redoran","House Telvanni"];

function bestFactions(skills){
  const set=new Set(skills);
  return Object.entries(DATA.factions)
    .map(([name,pool])=>({name,score:pool.filter(sk=>set.has(sk)).length,tie:Math.random()}))
    .sort((a,b)=>b.score-a.score||b.tie-a.tie)
    .slice(0,4)
    .map(x=>x.name);
}

function selectFactions(skills,style="Coherent"){
  if(style==="Chaos"||style==="RNGesus"){
    const count=3+Math.floor(Math.random()*3);
    const pool=[...Object.keys(DATA.factions)];
    const chosen=[];
    let houseChosen=false;

    while(chosen.length<count&&pool.length){
      const eligible=pool.filter(name=>!GREAT_HOUSES.includes(name)||!houseChosen);
      const faction=pick(eligible);
      chosen.push(faction);
      pool.splice(pool.indexOf(faction),1);
      if(GREAT_HOUSES.includes(faction))houseChosen=true;
    }

    return chosen;
  }

  const ranked=bestFactions(skills);
  const allowed=[];
  let houseChosen=false;

  for(const faction of ranked){
    if(GREAT_HOUSES.includes(faction)){
      if(houseChosen)continue;
      houseChosen=true;
    }
    allowed.push(faction);
  }

  return style==="Coherent"&&Math.random()<0.35
    ? allowed.slice(0,4)
    : allowed.slice(0,3);
}
function baseStartingAttributes(b){
 const raceData=DATA.races[b.race]||DATA.trRaces[b.race];
 const base=raceData[b.sex],stats={};
 ATTRIBUTE_NAMES.forEach((n,i)=>stats[n]=base[i]+(b.c.fav.includes(n)?10:0));
 return stats;
}
function prepareBuild(b){b.starting=buildStartingStats(b);b.spells=starterSpells(b,b.starting);return b}


/* --------------------------------------------------------------------------
   NAME GENERATION
   -------------------------------------------------------------------------- */
function generateName(race,sex){
 const pool=DATA.names[race]?.[sex]||DATA.names[race]?.male||[];
 return pick(pool);
}
const ALL_GIVEN_NAMES={male:[],female:[],any:[]};
for(const race of RACES){
  for(const sex of GENDERS) for(const name of (DATA.names[race]?.[sex]||[])) if(!ALL_GIVEN_NAMES[sex].includes(name)) ALL_GIVEN_NAMES[sex].push(name);
}
ALL_GIVEN_NAMES.any=[...ALL_GIVEN_NAMES.male,...ALL_GIVEN_NAMES.female];
const ALL_FAMILY_NAMES=[];
for(const race of RACES) for(const name of (DATA.nameFamilies[race]||[])) if(!ALL_FAMILY_NAMES.includes(name)) ALL_FAMILY_NAMES.push(name);
function unrestrictedName(sex){
  const useAnyGender=Math.random()<RULES.naming.unrestrictedAnyGenderChance;
  const givenPool=useAnyGender?ALL_GIVEN_NAMES.any:ALL_GIVEN_NAMES[sex];
  const first=pick(givenPool);
  const roll=Math.random();
  if(roll<RULES.naming.familyChance && ALL_FAMILY_NAMES.length) return `${first} ${pick(ALL_FAMILY_NAMES)}`;
  if(roll<RULES.naming.familyChance+RULES.naming.titleChance && HIGH_ELF_TITLES.length) return `${first} ${pick(HIGH_ELF_TITLES)}`;
  return first;
}
function fullNameFor(race,sex){
 const first=generateName(race,sex);
 if(race==="Dark Elf"||race==="Imperial"||race==="Breton") return `${first} ${pick(DATA.nameFamilies[race])}`;
 if(race==="High Elf") {
  if(Math.random()>=RULES.naming.highElfSurnameChance)return first;
  return Math.random()<0.5?`${first} ${pick(DATA.nameFamilies[race])}`:`${first} ${pick(HIGH_ELF_TITLES)}`;
}
 if(race==="Nord") return Math.random()<RULES.naming.nordFamilyChance?`${first} ${pick(DATA.nameFamilies[race])}`:first;
 if(race==="Redguard") return Math.random()<RULES.naming.redguardFamilyChance?`${first} ${pick(DATA.nameFamilies[race])}`:first;
 if(race==="Wood Elf") return Math.random()<RULES.naming.woodElfFamilyChance?`${first} ${pick(DATA.nameFamilies[race])}`:first;
 if(race==="Orc") {
   if(Math.random()<RULES.naming.orcExceptionalChance) return `${first} ${pick(ORC_EXCEPTIONAL_SURNAMES)}`;
   if(Math.random()<RULES.naming.orcUnprefixedChance) return `${first} ${pick(ORC_UNPREFIXED_SURNAMES)}`;
   return `${first} ${sex==="female"?"gra-":"gro-"}${pick(DATA.nameFamilies[race])}`;
 }
 if(race==="Argonian"||race==="Khajiit") return first;
 return first;
}

/* --------------------------------------------------------------------------
   BUILD GENERATION
   -------------------------------------------------------------------------- */
function buildStartingStats(b){
 const race=DATA.races[b.race]||DATA.trRaces[b.race],stats=baseStartingAttributes(b);
 if(b.birth==="The Lady"){stats.Personality+=25;stats.Endurance+=25}else if(b.birth==="The Lover")stats.Agility+=25;else if(b.birth==="The Steed")stats.Speed+=25;
 const skills={};DATA.skills.forEach(sk=>{let v=RULES.startingSkills.base;if(SPEC_SKILLS[b.c.spec].includes(sk))v+=RULES.startingSkills.specialization;if(b.c.maj.includes(sk))v+=RULES.startingSkills.major;else if(b.c.min.includes(sk))v+=RULES.startingSkills.minor;if(race.bonuses[sk])v+=race.bonuses[sk];skills[sk]=v});
 const mag=Math.floor(stats.Intelligence*(1+(MAGICKA_RACE_BONUS[b.race]||0)+(MAGICKA_BIRTH_BONUS[b.birth]||0)));
 const health=Math.floor((stats.Strength+stats.Endurance)/2),fatigue=stats.Strength+stats.Willpower+stats.Agility+stats.Endurance;
 return {stats,skills,mag,health,fatigue};
}
function starterSpells(b,st=buildStartingStats(b)){
 const baseAttrs=baseStartingAttributes(b),out=[];
 for(const sp of DATA.starterSpells){
  if(sp.unobtainable)continue;
  const isMajorOrMinor=b.c.maj.includes(sp.skill)||b.c.min.includes(sp.skill);
  if(!isMajorOrMinor)continue;
  const skillValue=st.skills[sp.skill],score=skillValue*2+baseAttrs.Willpower/5+baseAttrs.Luck/10;
  if(score<sp.threshold)continue;
  out.push({...sp,score:Math.floor(score),skillValue});
 }
 return out;
}

function makeBuild(style="Coherent",dir="Any",allowNpc=false,racePreference="Any",genderPreference="Any",birthPreference="Any",allowTRClasses=false,allowTRRaces=false,classPreference="Any"){
 const classData=classPool(allowNpc,allowTRClasses);
 const selectedClass=classPreference && classPreference!=="Any" && classData[classPreference]
  ? classPreference
  : null;

   let primary = null;
   if (!selectedClass) {
     primary = pick(allSkills);
   }

 let race;
 const racePool=allowTRRaces?ALL_RACES_WITH_TR:RACES;
 if(racePreference && racePreference!=="Any") race=racePreference;
 else if(primary && (style==="Coherent"||style==="Unusual")){
  const eligible=racePool.filter(r=>(DATA.races[r]||DATA.trRaces[r])?.bonuses?.[primary]);
  race=pick(eligible.length?eligible:racePool);
 } else {
  race=pick(racePool);
 }

 let cls;
 if(selectedClass){
  cls=selectedClass;
 } else {
  const classes = compatibleClasses(
  primary,
  style,
  allowNpc,
  allowTRClasses,
  dir
   );
  cls=pick(classes);
 }

 const c=classData[cls];
 const birth=(birthPreference && birthPreference!=="Any")?birthPreference:pick(BIRTHSIGNS);
 const majors=sortSkillsByCanon(sample(c.maj,5));
 const minors=sortSkillsByCanon(sample(c.min,5));
 const sex=genderPreference && genderPreference!=="Any" ? genderPreference : pick(GENDERS);
 const name=fullNameFor(race,sex);

 return prepareBuild({
  primary,
  race,
  cls,
  birth,
  c,
  majors,
  minors,
  factions:selectFactions([...majors,...minors],style),
  sex,
  name
 });
}
/* --------------------------------------------------------------------------
   RENDERING HELPERS
   -------------------------------------------------------------------------- */
function genderLabel(sex){ return sex ? sex.charAt(0).toUpperCase()+sex.slice(1) : ""; }
function renderTraits(t){
  if(!t) return '<p class="muted">None recorded.</p>';

  const sections=[];

  function renderTraitSection(title,items){
    if(!items?.length) return "";

    return `
      <div class="traitHeading">${esc(title)}</div>
      <div class="traitList">
        ${items.map(x=>`<div class="traitItem">${esc(x)}</div>`).join("")}
      </div>
    `;
  }

  sections.push(renderTraitSection("Abilities",t.abilities));
  sections.push(renderTraitSection("Powers",t.powers));
  sections.push(renderTraitSection("Starting Spells",t.spells));

  const output=sections.join("");

  return output || '<p class="muted">None recorded.</p>';
}
function renderBirthsign(birth){
 const data=DATA.birthsigns[birth];
 return `<div class="birthsignName">${esc(birth)}</div>${renderTraits(data.traits)}`;
}
function buildCard(b,title="Census Record",showIdentity=true){
  const miscSkills = allSkills.filter(sk =>
    !b.majors.includes(sk) &&
    !b.minors.includes(sk)
  );
  const identityRow = showIdentity ? `
    <div class="big census-row">
      <div>${esc(b.name)}</div>
      <div>${esc(genderLabel(b.sex))}</div>
      <div>${esc(b.race)}</div>
      <div>${esc(b.cls)}</div>
    </div>
  ` : "";
  return `<div class="card">
 <h2>${esc(title)}</h2>
  ${identityRow}

<div class="characterStatsGrid">

  <div class="characterSummary">

    <div class="buildTop">

      <div class="favoredAttributes">
        <h3>Favored Attributes</h3>
        <div class="attributeList">
          ${b.c.fav.map(x=>`
            <div class="attributeItem">${esc(x)}</div>
          `).join("")}
        </div>
      </div>

      <div class="buildFocus">
        <h3>Build Focus</h3>
        <div class="attributeItem">
          ${esc(b.c.spec)}
        </div>
      </div>

    </div>

    <div class="startingResources">
      <h3>Starting Resources</h3>

      <div class="row">
        <b><span class="resourceHealth">Health</span></b>
        <span class="resourceHealth">${b.starting.health}</span>
      </div>

      <div class="row">
        <b><span class="resourceMagicka">Magicka</span></b>
        <span class="resourceMagicka">${b.starting.mag}</span>
      </div>

      <div class="row">
        <b><span class="resourceFatigue">Fatigue</span></b>
        <span class="resourceFatigue">${b.starting.fatigue}</span>
      </div>

    </div>

  </div>

  <div class="startingAttributes">
    <h3>Starting Attributes</h3>
    <div class="statList">
      ${Object.entries(b.starting.stats).map(([k,v])=>`
        <div class="statItem">
          <span>${esc(k)}</span>
          <span>${v}</span>
        </div>
      `).join("")}
    </div>
  </div>



</div>

<div class="traitsColumns">

  <div class="traitsColumn">
    <h3>Major Skills</h3>
    ${b.majors.map(x=>`
      <div class="statItem">
        <span>${esc(x)}</span>
        <span>${b.starting.skills[x]}</span>
      </div>
    `).join("")}
  </div>

  <div class="traitsColumn">
    <h3>Minor Skills</h3>
    ${b.minors.map(x=>`
      <div class="statItem">
        <span>${esc(x)}</span>
        <span>${b.starting.skills[x]}</span>
      </div>
    `).join("")}
  </div>

</div>

<div class="miscSkillsSection">

  <h3>Miscellaneous Skills</h3>

  <div class="miscSkillsColumns">

    <div class="traitsColumn">
      ${miscSkills.slice(0, Math.ceil(miscSkills.length / 2)).map(x=>`
        <div class="statItem">
          <span>${esc(x)}</span>
          <span>${b.starting.skills[x]}</span>
        </div>
      `).join("")}
    </div>

    <div class="traitsColumn">
      ${miscSkills.slice(Math.ceil(miscSkills.length / 2)).map(x=>`
        <div class="statItem">
          <span>${esc(x)}</span>
          <span>${b.starting.skills[x]}</span>
        </div>
      `).join("")}
    </div>

  </div>

</div>

<div class="traitsColumns">

  <div class="traitsColumn">
    <h3>Racial Traits</h3>
    ${renderTraits((DATA.races[b.race]||DATA.trRaces[b.race]).traits)}
  </div>

  <div class="traitsColumn">
    <h3>Birthsign</h3>
    ${renderBirthsign(b.birth)}
  </div>

</div>

 <h3>Starting Spells</h3>${b.spells.length?b.spells.map(sp=>`<div class="row"><b>${sp.name}</b><span>${sp.desc} • ${sp.cost} magicka</span></div>`).join(""):"<p class=\"muted\">None granted</p>"}

 <p><button type="button" data-action="copy" data-copy="${esc(formatBuild(b))}">Copy Build</button></p></div>`;
}
function formatBuild(b){return `The Census of Morrowind\\nRace: ${b.race}\\nClass: ${b.cls}\\nSpecialization: ${b.c.spec}\\nBirthsign: ${b.birth}\\nFavored Attributes: ${b.c.fav.join(", ")}\\nMajor Skills: ${b.majors.join(", ")}\\nMinor Skills: ${b.minors.join(", ")}\\nFaction Matches: ${b.factions.join(", ")}`}
function customSelect(id,options){const el=document.getElementById(id);el.innerHTML=options.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("");}
function previewSkillSelects(overrideMajors=null,overrideMinors=null){
 const majors=overrideMajors||[...document.querySelectorAll("#previewMajors select")].map(x=>x.value).filter(Boolean);
 const minors=overrideMinors||[...document.querySelectorAll("#previewMinors select")].map(x=>x.value).filter(Boolean);
 function renderGroup(id,vals,other){
   const wrap=document.getElementById(id);wrap.innerHTML="";
   const slots=vals.length?vals:Array.from({length:5},(_,i)=>allSkills[i]);
   slots.forEach((val,i)=>{const lab=document.createElement("label");lab.textContent=`${i+1}. `;const sel=document.createElement("select");
     const blocked=new Set([...other,...slots.filter((x,j)=>j!==i)]);if(val)blocked.delete(val);
     sel.innerHTML=allSkills.filter(sk=>!blocked.has(sk)).map(sk=>`<option value="${esc(sk)}">${esc(sk)}</option>`).join("");
     sel.value=val;sel.onchange=()=>{previewSkillSelects();renderClassPreview();};lab.appendChild(sel);wrap.appendChild(lab);
   });
 }
 renderGroup("previewMajors",majors,minors);renderGroup("previewMinors",minors,majors);
}
function populatePreviewClasses(){
  const select = document.getElementById("previewClass");
  const current = select.value;

  const classes = previewSource === "npc"
    ? Object.keys(DATA.npcClasses)
    : previewSource === "tr"
      ? Object.keys(DATA.trClasses)
      : Object.keys(DATA.classes);

  customSelect("previewClass", classes);

  const available = [...select.options].map(o => o.value);
  select.value = available.includes(current)
    ? current
    : available[0] || "";
}
let previewSource="preset";
function setPreviewMode(mode){
 previewSource=["preset","npc","tr","custom"].includes(mode)?mode:"preset";
 const isCustom=previewSource==="custom";
 document.querySelectorAll("[data-preview-mode]").forEach(btn=>{
   const active=btn.dataset.previewMode===previewSource;
   btn.classList.toggle("active",active);
   btn.setAttribute("aria-pressed",String(active));
 });
 if(previewSource!=="custom")populatePreviewClasses();
 document.getElementById("previewCustomFields").classList.toggle("hidden",!isCustom);
 if(isCustom){
   document.getElementById("previewClass").disabled=true;
   const hasSkills=document.querySelectorAll("#previewMajors select, #previewMinors select").length===10;
   if(!hasSkills)previewSkillSelects(allSkills.slice(0,5),allSkills.slice(5,10));
 }else{
   document.getElementById("previewClass").disabled=false;
   previewSkillSelects();
 }
 renderClassPreview();
}

function updatePreviewRaceOptions(){
  const select = document.getElementById("previewRace");
  const current = select.value;
  const source = document.querySelector("[data-preview-race-source].active")
    ?.dataset.previewRaceSource || "default";

  const races = source === "tr"
    ? ALL_RACES_WITH_TR.filter(race => !RACES.includes(race))
    : RACES;

  customSelect("previewRace", races);
  select.value = races.includes(current) ? current : races[0];
}
   
function initClassPreview(){
 document.querySelectorAll("[data-preview-mode]").forEach(btn=>btn.addEventListener("click",()=>setPreviewMode(btn.dataset.previewMode)));
 updatePreviewRaceOptions();

document.querySelectorAll("[data-preview-race-source]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-preview-race-source]").forEach(other=>{
      const active = other === btn;
      other.classList.toggle("active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    updatePreviewRaceOptions();
    renderClassPreview();
  });
});
 customSelect("previewBirth",BIRTHSIGNS);
 customSelect("previewFav1",ATTRIBUTE_NAMES);customSelect("previewFav2",ATTRIBUTE_NAMES);
 document.getElementById("previewFav1").value="Strength";document.getElementById("previewFav2").value="Endurance";
 document.getElementById("previewRace").value="Breton";document.getElementById("previewSex").value="male";document.getElementById("previewBirth").value="The Apprentice";
 document.getElementById("previewClass").addEventListener("change",()=>{
   if(previewSource!=="custom"){
     const c=ALL_CLASSES_WITH_TR[document.getElementById("previewClass").value];
     if(c){
       document.getElementById("previewSpec").value=c.spec;
       document.getElementById("previewFav1").value=c.fav[0];
       document.getElementById("previewFav2").value=c.fav[1];
       previewSkillSelects(c.maj.slice(0,5),c.min.slice(0,5));
     }
   }
   renderClassPreview();
 });
 document.getElementById("previewRace").onchange=renderClassPreview;
 document.getElementById("previewSex").onchange=renderClassPreview;
 document.getElementById("previewBirth").onchange=renderClassPreview;
 document.getElementById("previewSpec").onchange=renderClassPreview;
 document.getElementById("previewClassName").oninput=renderClassPreview;
 document.getElementById("previewFav1").onchange=()=>{keepFavsDistinct("previewFav1","previewFav2");renderClassPreview();};
 document.getElementById("previewFav2").onchange=()=>{keepFavsDistinct("previewFav2","previewFav1");renderClassPreview();};
 populatePreviewClasses();
 document.getElementById("previewClass").value="Mage";
 previewSkillSelects(allSkills.slice(0,5),allSkills.slice(5,10));
 renderClassPreview();
}
function keepFavsDistinct(changed,other){const a=document.getElementById(changed),b=document.getElementById(other);if(a.value===b.value)b.value=ATTRIBUTE_NAMES.find(x=>x!==a.value)||"Endurance";}
function previewCustomObject(){
 const majors=[...document.querySelectorAll("#previewMajors select")].map(x=>x.value);
 const minors=[...document.querySelectorAll("#previewMinors select")].map(x=>x.value);
 return {race:document.getElementById("previewRace").value,sex:document.getElementById("previewSex").value,birth:document.getElementById("previewBirth").value,cls:"Custom Class",className:document.getElementById("previewClassName").value||"Custom Class",c:{spec:document.getElementById("previewSpec").value,maj:majors,min:minors,fav:[document.getElementById("previewFav1").value,document.getElementById("previewFav2").value]},majors,minors,primary:majors[0],factions:bestFactions([...majors,...minors]),name:fullNameFor(document.getElementById("previewRace").value,document.getElementById("previewSex").value)};
}
function classPreviewObject(){
 const race=document.getElementById("previewRace").value,sex=document.getElementById("previewSex").value,birth=document.getElementById("previewBirth").value,cls=document.getElementById("previewClass").value;
 if(previewSource==="custom")return previewCustomObject();
 const c=ALL_CLASSES_WITH_TR[cls];
 return {race,sex,birth,cls,c,majors:c.maj.slice(0,5),minors:c.min.slice(0,5),primary:c.maj[0],factions:bestFactions([...c.maj.slice(0,5),...c.min.slice(0,5)]),name:fullNameFor(race,sex)};
}
function renderClassPreview(){
 const b=classPreviewObject();
 if(!b.c||!b.c.fav||new Set(b.c.fav).size!==2||new Set([...b.majors,...b.minors]).size!==10){
   document.getElementById("customResult").innerHTML='<div class="card"><p class="muted">Choose two different favored attributes and ten different major/minor skills.</p></div>';
   return;
 }
 prepareBuild(b);
 const className=b.cls==="Custom Class"?(b.className||"Custom Class"):b.cls;
 document.getElementById("customResult").innerHTML=buildCard({...b,cls:className},"Character Record",false);
}
function randomizeClassPreview(){
 const custom=previewSource==="custom";
 const raceSource = document.querySelector("[data-preview-race-source].active")
  ?.dataset.previewRaceSource || "default";

const racePool = raceSource === "tr"
  ? ALL_RACES_WITH_TR.filter(race => !RACES.includes(race))
  : RACES;

 document.getElementById("previewRace").value=pick(racePool);
 document.getElementById("previewSex").value=pick(GENDERS);
 document.getElementById("previewBirth").value=pick(BIRTHSIGNS);  
 if(custom){
   document.getElementById("previewSpec").value=pick(["Combat","Magic","Stealth"]);
   const fav=sample(ATTRIBUTE_NAMES,2);
   document.getElementById("previewFav1").value=fav[0];
   document.getElementById("previewFav2").value=fav[1];
   const chosen=sample(allSkills,10);
   previewSkillSelects(chosen.slice(0,5),chosen.slice(5));
   renderClassPreview();
   return;
 }

 const classPool=previewSource==="npc"
   ? DATA.npcClasses
   : previewSource==="tr"
     ? DATA.trClasses
     : DATA.classes;
 document.getElementById("previewClass").value=pick(Object.keys(classPool));

 const c=ALL_CLASSES_WITH_TR[document.getElementById("previewClass").value];
 if(c){
   document.getElementById("previewSpec").value=c.spec;
   document.getElementById("previewFav1").value=c.fav[0];
   document.getElementById("previewFav2").value=c.fav[1];
   previewSkillSelects(c.maj.slice(0,5),c.min.slice(0,5));
 }
 renderClassPreview();
}
function rngClassName(){return pick(DATA.rngClassNames)}
function makeRNGesus(){
 const race=pick(ALL_RACES_WITH_TR),sex=pick(GENDERS),birth=pick(BIRTHSIGNS);
 const presetKeys=Object.keys(DATA.classes),npcKeys=Object.keys(DATA.npcClasses),classRoll=Math.random();
 let cls,c,majors,minors;
 if(classRoll<RULES.rngesus.presetClassChance){
  cls=pick(presetKeys);c=DATA.classes[cls];
 }else if(classRoll<RULES.rngesus.presetClassChance+RULES.rngesus.npcClassChance&&npcKeys.length){
  cls=pick(npcKeys);c=DATA.npcClasses[cls];
 }else{
  const spec=pick(["Combat","Magic","Stealth"]),fav=sample(ATTRIBUTE_NAMES,2),chosen=sample(allSkills,10);
  majors=chosen.slice(0,5);minors=chosen.slice(5);c={spec,maj:majors,min:minors,fav};cls=rngClassName();
 }
 if(!majors)majors=c.maj.slice(0,5),minors=c.min.slice(0,5);
 return prepareBuild({primary:pick([...c.maj,...c.min]),race,cls,birth,c,majors,minors,factions:selectFactions([...c.maj,...c.min],"RNGesus"),sex,name:fullNameFor(race,sex)});
}
function generateRNGesus(){
  const b=makeRNGesus();
  b.name=unrestrictedName(b.sex);

   const style=pick(BACKSTORY_STYLES);
   const s=storyFor(b,style);
  const meta=storyMeta(s);
  const text=storyText(s,b);

  document.getElementById("bothResult").innerHTML=
    buildCard(b,"Character Record")+`
    <div class="card">
      <h2>Backstory</h2>

      <div class="big">${esc(s.name)}</div>

      <p class="muted">${esc(meta)}</p>

      <p>${text.replace(/\n\n/g,"</p><p>")}</p>

      <div class="storyFactionMatches">
        <h3>Faction Matches</h3>

        <div class="factionMatchList">
          ${s.factions.map(f=>`<div class="factionMatch">${esc(f)}</div>`).join("")}
        </div>

        <p>
          <button
            type="button"
            data-action="copy"
            data-copy="${esc(formatBuild(b)+"\n"+meta+"\n\n"+text+"\n\nFaction Matches: "+s.factions.join(", "))}">
            Copy Record
          </button>
        </p>
      </div>
    </div>`;
}
function weightedBackstoryChoice(items, preferredTags=[]){
 const tagged=items.filter(x=>Array.isArray(x.tags)&&x.tags.some(t=>preferredTags.includes(t)));
 return pick(tagged.length?tagged:items);
}
function chooseHomeland(race){
 const specific=DATA.backstory.homelands.filter(x=>x.race===race);
 const universal=DATA.backstory.homelands.filter(x=>x.race==="Any");
 if(specific.length&&universal.length)return Math.random()<RULES.homeland.specificChance?pick(specific):pick(universal);
 return pick(specific.length?specific:universal.length?universal:DATA.backstory.homelands);
}
function chooseFamily(race){
 const specific=DATA.backstory.familyByRace?.[race]||[];
 if(specific.length&&DATA.backstory.family.length)return Math.random()<RULES.family.specificChance?pick(specific):pick(DATA.backstory.family);
 return pick(specific.length?specific:DATA.backstory.family);
}
function chooseOccupation(b){
 let pool=DATA.backstory.occupations;
 const matching=pool.filter(o=>o.skills.some(sk=>
   b.majors?.includes(sk) ||
   b.minors?.includes(sk) ||
   sk===b.primary
 ));
 if(matching.length) pool=matching;
 return pick(pool);
}
function ordinal(n){return n+(n%100>=11&&n%100<=13?"th":n%10===1?"st":n%10===2?"nd":n%10===3?"rd":"th")}
function birthDetails(sign){
 const month=(sign==="The Serpent")?pick(Object.keys(DATA.calendar.monthDays)):(DATA.birthsigns[sign]?.month||"Sun's Height");
 const maxDay=DATA.calendar.monthDays[month]||30;
 const day=Math.floor(Math.random()*maxDay)+1;
 return {month,day,label:`${ordinal(day)} of ${month}`};
}
/* --------------------------------------------------------------------------
   BACKSTORY GENERATION
   -------------------------------------------------------------------------- */
function storyFor(b,style){
 const race=b.race;
 const sex=b.sex;
 const name=b.name;
 const homeland=chooseHomeland(race);
 const occupation=chooseOccupation(b);
 const family=chooseFamily(race);
 const mentor=pick(DATA.backstory.mentors);
 const event=pick(DATA.backstory.definingEvents);
 const crime=weightedBackstoryChoice(DATA.backstory.crimes,occupation.crimeTags||[]);
 const detail=pick(crime.details);
 const arrest=pick(DATA.backstory.arrestMethods);
 const attitude=pick(DATA.backstory.arrestAttitudes);
 const prison=pick(DATA.backstory.prisonExperiences);
 const change=pick(DATA.backstory.prisonChanges);
 const relationship=pick(DATA.backstory.relationships);
 const future=pick(DATA.backstory.futureIntentions);
 const skill=b.primary;
 const factions=b.factions;
 const faction=pick(factions);
 const birth=b.birth;
 const age=RULES.backstory.minAge+Math.floor(Math.random()*RULES.backstory.ageSpan);
 const birthday=birthDetails(birth);
 const wildcardChance=RULES.backstory.wildcardChance[style]??RULES.backstory.wildcardChance.Default;
 const wildCard=Math.random()<wildcardChance?pick(DATA.backstory.wildCards):"";
  return {race,sex,name,homeland,occupation,family,mentor,event,crime,detail,arrest,attitude,prison,change,relationship,future,skill,faction,factions,birth,birthday,age,wildCard,style};
}

function resolveBackstoryStyle(style) {
  return style === "Any" ? pick(BACKSTORY_STYLES) : style;
}
   
function storyMeta(s){
  return `Name: ${s.name} • Race: ${s.race} • Gender: ${genderLabel(s.sex)} • Age: ${s.age} • Birthday: ${s.birthday.label} • Birthsign: ${s.birth}`;
}
   
function storyText(s,b){
 const skillLine=b?.primary
   ? `You developed a particular knack for ${b.primary}, while your work gave you practical reasons to keep improving.`
   : `You developed a practical knack for ${s.skill} through the work you did.`;

 const article=/^[aeiou]/i.test(s.occupation.name) ? "an " : "a ";

 const futureLine=s.future.mode==="simple"
   ? `Your main concern became simple: ${s.future.text}.`
   : `You hoped to eventually ${s.future.text}.`;

 const workParagraph =
   `In time, you worked as ${article}${s.occupation.name}, learning much of what you know from ${s.mentor}. ` +
   `${s.event} ${skillLine}`;

 const troubleParagraph =
   `The trouble began when ${s.detail.charAt(0).toLowerCase()+s.detail.slice(1)} ` +
   `This led to you being charged with ${s.crime.charge||s.crime.name.toLowerCase()}. ` +
   `${s.arrest} ${s.attitude}`;

 const prisonParagraph =
   `Your sentence became an unwanted chapter of your life. ` +
   `${s.prison} ${s.change} ${s.relationship} ${futureLine}`;

 const transportLine =
   `Eventually, you were taken from prison and placed aboard an Imperial transport bound for Vvardenfell.`;

 const opening = `${s.homeland.text} ${s.family}`;
 const style = s.style || "Lore-friendly";

 switch(style){
   case "Grounded":
     return [
       opening,
       `For a time, life was mostly a matter of getting by. ${workParagraph}`,
       `Then a series of ordinary choices brought you into trouble. ${troubleParagraph}`,
       `Prison disrupted the routine you had built. ${s.prison} ${s.change}`,
       `${s.relationship} ${futureLine}`,
       transportLine
     ].filter(p=>p && p.trim()).join("\n\n");

   case "Adventurous":
     return [
       `${s.homeland.text} Your life was rarely still. ${s.family}`,
       `You found work as ${article}${s.occupation.name}, and learned from ${s.mentor}. ${s.event} ${skillLine}`,
       `One turn of events led to another, until ${s.detail.charAt(0).toLowerCase()+s.detail.slice(1)} ` +
         `You were charged with ${s.crime.charge||s.crime.name.toLowerCase()}. ${s.arrest} ${s.attitude}`,
       `Even imprisonment could not entirely quiet your plans. ${s.prison} ${s.change} ${s.relationship} ${futureLine}`,
       transportLine
     ].filter(p=>p && p.trim()).join("\n\n");

   case "Dark":
     return [
       opening,
       `The life you built offered little protection from hardship. ${workParagraph}`,
       `Things took a darker turn when ${s.detail.charAt(0).toLowerCase()+s.detail.slice(1)} ` +
         `You were charged with ${s.crime.charge||s.crime.name.toLowerCase()}. ${s.arrest} ${s.attitude}`,
       `Prison left its mark. ${s.prison} ${s.change} ${s.relationship}`,
       `You held on to one thought: ${s.future.text}.`,
       transportLine
     ].filter(p=>p && p.trim()).join("\n\n");

   case "Comedic":
     return [
       opening,
       `Things were going reasonably well—or at least well enough—when you found yourself working as ${article}${s.occupation.name}. ` +
         `You learned from ${s.mentor}. ${s.event} ${skillLine}`,
       `Naturally, trouble followed. ${s.detail.charAt(0).toLowerCase()+s.detail.slice(1)} ` +
         `Before long, you were charged with ${s.crime.charge||s.crime.name.toLowerCase()}. ${s.arrest} ${s.attitude}`,
       `Prison was not quite the change of scenery you wanted. ${s.prison} ${s.change} ${s.relationship}`,
       `Still, you had plans. ${futureLine}`,
       transportLine
     ].filter(p=>p && p.trim()).join("\n\n");

   case "Lore-friendly":
   default:
     return [
       opening,
       workParagraph,
       troubleParagraph,
       prisonParagraph,
       transportLine
     ].filter(p=>p && p.trim()).join("\n\n");
 }
}
   
function generateBoth(){

 const style = resolveBackstoryStyle("Any");
 const allowNpc=document.getElementById("bothAllowNpcClasses")?.checked||false;
 const allowTRClasses=document.getElementById("bothAllowTRClasses")?.checked||false;
 const allowTRRaces=document.getElementById("bothAllowTRRaces")?.checked||false;  
 const racePref=document.getElementById("bothRace").value;
 const genderPref=document.getElementById("bothGender").value;
 const birthPref=document.getElementById("bothBirth").value;
 const classPref=document.getElementById("bothClassPreference").value;
 const b=makeBuild("Coherent","Any",allowNpc,racePref,genderPref,birthPref,allowTRClasses,allowTRRaces,classPref);
 const s=storyFor(b,style);
 const meta=storyMeta(s);
 const text=storyText(s,b);

 document.getElementById("bothResult").innerHTML=
   buildCard(b,"Character Record")+`
   <div class="card">
     <h2>Backstory</h2>

     <div class="big">${esc(s.name)}</div>

     <p class="muted">${esc(meta)}</p>

     <p>${text.replace(/\n\n/g,"</p><p>")}</p>

     <div class="storyFactionMatches">
       <h3>Faction Matches</h3>
       <div class="factionMatchList">
         ${s.factions.map(f=>`<div class="factionMatch">${esc(f)}</div>`).join("")}
       </div>
     </div>

     <button
       type="button"
       data-action="copy"
       data-copy="${esc(formatBuild(b)+"\n"+meta+"\n\n"+text+"\n\nFaction Matches: "+s.factions.join(", "))}">
       Copy Record
     </button>
   </div>`;
}

function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}

/* --------------------------------------------------------------------------
   VALIDATION / REFERENCE
   -------------------------------------------------------------------------- */
function runConsistencyChecks(){
  const checkOrder=(label,obj,expected)=>{
    const actual=Object.keys(obj||{});
    const missing=expected.filter(k=>!actual.includes(k));
    const extra=actual.filter(k=>!expected.includes(k));
    const orderOk=actual.length===expected.length&&actual.every((k,i)=>k===expected[i]);
    if(missing.length||extra.length||!orderOk){
      console.warn(`Census consistency: ${label} mismatch`,{missing,extra,actual,expected});
      return false;
    }
    return true;
  };
  const checkList=(label,actual,expected)=>{
    const missing=expected.filter(k=>!actual.includes(k));
    const extra=actual.filter(k=>!expected.includes(k));
    const orderOk=actual.length===expected.length&&actual.every((k,i)=>k===expected[i]);
    if(missing.length||extra.length||!orderOk){
      console.warn(`Census consistency: ${label} mismatch`,{missing,extra,actual,expected});
      return false;
    }
    return true;
  };
  const checks=[
    checkOrder("Races",DATA.races,ORDER.races),
    checkOrder("Names",DATA.names,ORDER.races),
    checkOrder("Family names",DATA.nameFamilies,ORDER.races),
    checkOrder("Race-specific family pools",DATA.backstory.familyByRace,ORDER.races),
    checkOrder("Birthsigns",DATA.birthsigns,ORDER.birthsigns),
    checkList("Backstory styles",BACKSTORY_STYLES,ORDER.backstoryStyles),
  ];
  const passed=checks.filter(Boolean).length;
  const total=checks.length;
  if(passed===total) console.info(`Census consistency: all ${total} canonical-order checks passed.`);
  else console.warn(`Census consistency: ${passed}/${total} canonical-order checks passed.`);
}


/* --------------------------------------------------------------------------
   UI / EVENT WIRING
   -------------------------------------------------------------------------- */
async function copyText(t){
 try{
  if(!navigator.clipboard?.writeText)throw new Error("Clipboard unavailable");
  await navigator.clipboard.writeText(t);
  alert("Copied to clipboard.");
 }catch(e){
  alert("Could not copy automatically. Select and copy the text manually.");
 }
}

function show(id){
  document.querySelectorAll(".mode").forEach(x=>x.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.mode===id));
  window.scrollTo({top:0,behavior:"smooth"});
}

function updateBothRaceOptions(){
  const select = document.getElementById("bothRace");
  const current = select.value;
  const allowTR = document.getElementById("bothAllowTRRaces").checked;
  const races = allowTR ? ALL_RACES_WITH_TR : RACES;

  select.innerHTML = `<option value="Any">Any</option>` +
    races.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join("");

  select.value = races.includes(current) || current === "Any"
    ? current
    : "Any";
}

updateBothRaceOptions();
document.getElementById("bothAllowTRRaces")
  .addEventListener("change", updateBothRaceOptions);

function updateBothClassOptions(){
  const select = document.getElementById("bothClassPreference");
  const current = select.value;
  const allowNpc = document.getElementById("bothAllowNpcClasses").checked;
  const allowTR = document.getElementById("bothAllowTRClasses").checked;
  const classes = Object.keys(classPool(allowNpc, allowTR));

  select.innerHTML = `<option value="Any">Any</option>` +
    classes.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");

  select.value = classes.includes(current) || current === "Any"
    ? current
    : "Any";
}
   
updateBothClassOptions();
document.getElementById("bothAllowNpcClasses")
  .addEventListener("change", updateBothClassOptions);
document.getElementById("bothAllowTRClasses")
  .addEventListener("change", updateBothClassOptions);
   
for(const sign of BIRTHSIGNS){document.getElementById("bothBirth").insertAdjacentHTML("beforeend",`<option value="${esc(sign)}">${esc(sign)}</option>`)}

document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>show(tab.dataset.mode)));
document.addEventListener("click",event=>{
  const button=event.target.closest("[data-action]");
  if(!button)return;
  const action=button.dataset.action;
  if(action==="show")show(button.dataset.target);
  else if(action==="randomize-preview")randomizeClassPreview();
  else if(action==="generate-rng")generateRNGesus();
  else if(action==="generate-both")generateBoth();
  else if(action==="copy")copyText(button.dataset.copy||"");
});

initClassPreview();
 runConsistencyChecks();

})();
