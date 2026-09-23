(() => {
const APP_VERSION = "102";
/* --------------------------------------------------------------------------
   CANONICAL ORDER
   One source for display order. Data validation below checks that source keys
   still match these lists instead of accidentally inheriting object insertion order.
   -------------------------------------------------------------------------- */
const ORDER = Object.freeze({
  races: ["Argonian", "Breton", "Dark Elf", "High Elf", "Imperial", "Khajiit", "Nord", "Orc", "Redguard", "Wood Elf"],
  birthsigns: ["The Apprentice", "The Atronach", "The Lady", "The Lord", "The Lover", "The Mage", "The Ritual", "The Serpent", "The Shadow", "The Steed", "The Thief", "The Tower", "The Warrior"],
  tones: ["Lore-friendly", "Grounded", "Adventurous", "Dark", "Comedic"],
  fates: ["Open-ended", "Destined", "Prophetic", "Accidental", "Ordinary", "Dangerous"],
  buildStyles: ["Coherent", "Random", "Unusual", "Chaos"],
  buildDirections: ["Any", "Martial", "Magical", "Stealth", "Social", "Crafting"]
});

const ATTR=DATA.attributes;
const allSkills = DATA.skills;
const ATTRIBUTE_NAMES = ["Strength","Intelligence","Willpower","Agility","Speed","Endurance","Personality"];
const GENDERS = ["male","female"];
const RACES = ORDER.races;
const BIRTHSIGNS = ORDER.birthsigns;
const TONES = ORDER.tones;
const FATES = ORDER.fates;
const BUILD_STYLES = ORDER.buildStyles;
function orderedRaceEntries(obj){return RACES.filter(r=>Object.prototype.hasOwnProperty.call(obj,r)).map(r=>[r,obj[r]])}
const SPEC_SKILLS={Combat:["Armorer","Axe","Block","Blunt Weapon","Heavy Armor","Long Blade","Medium Armor","Spear","Athletics"],Magic:["Alchemy","Alteration","Conjuration","Destruction","Enchant","Illusion","Mysticism","Restoration","Unarmored"],Stealth:["Acrobatics","Hand-to-hand","Light Armor","Marksman","Mercantile","Security","Short Blade","Sneak","Speechcraft"]};
const BUILD_DIRECTIONS={Martial:[...SPEC_SKILLS.Combat],Magical:[...SPEC_SKILLS.Magic],Stealth:[...SPEC_SKILLS.Stealth],Social:["Mercantile","Speechcraft","Illusion"],Crafting:["Alchemy","Enchant","Armorer"]};
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
const HIGH_ELF_TITLES=DATA.highElfTitles;
const ORC_EXCEPTIONAL_SURNAMES=DATA.orcExceptionalSurnames;
const ORC_UNPREFIXED_SURNAMES=DATA.orcUnprefixedSurnames;

DATA.nameFamilies={"Argonian":["Lancaster","Androcles","Androdes","Androdorus","Androgulus","Androlus","Andromean","Andromus","Andrones","Androsar","Androseus","Androsion","Androssius","Androtus","Auguscles","Augusdes","Augusdorus","Augusgulus","Auguslus","Augusmean","Augusmus","Augusnes","Augussar","Augusseus","Augussion","Augusssius","Augustus","Cacles","Cades","Cadorus","Cagulus","Calus","Camean","Camus","Canes","Casar","Caseus","Casion","Cassius","Catus","Caecles","Caedes","Caedorus","Caegulus","Caelus","Caemean","Caemus","Caenes","Caesar","Caeseus","Caesion","Caessius","Caetus","Calicles","Calides","Calidorus","Caligulus","Calilus","Calimean","Calimus","Calines","Calisar","Caliseus","Calision","Calissius","Calitus","Galcles","Galdes","Galdorus","Galgulus","Gallus","Galmean","Galmus","Galnes","Galsar","Galseus","Galsion","Galssius","Galtus","Magcles","Magdes","Magdorus","Maggulus","Maglus","Magmean","Magmus","Magnes","Magsar","Magseus","Magsion","Magssius","Magtus","Mecles","Medes","Medorus","Megulus","Melus","Memean","Memus","Menes","Mesar","Meseus","Mesion","Messius","Metus","Nicles","Nides","Nidorus","Nigulus","Nilus","Nimean","Nimus","Nines","Nisar","Niseus","Nision","Nissius","Nitus","Percles","Perdes","Perdorus","Pergulus","Perlus","Permean","Permus","Pernes","Persar","Perseus","Persion","Perssius","Pertus","Theocles","Theodes","Theodorus","Theogulus","Theolus","Theomean","Theomus","Theones","Theosar","Theoseus","Theosion","Theossius","Theotus","Tibercles","Tiberdes","Tiberdorus","Tibergulus","Tiberlus","Tibermean","Tibermus","Tibernes","Tibersar","Tiberseus","Tibersion","Tiberssius","Tibertus","Xercles","Xerdes","Xerdorus","Xergulus","Xerlus","Xermean","Xermus","Xernes","Xersar","Xerseus","Xersion","Xerssius","Xertus","Dezno","Hidja"],"Breton":["Ashcroft","Ashfield","Ashford","Ashham","Ashhart","Ashhouse","Ashing","Ashsley","Ashsly","Ashsmith","Ashston","Ashton","Ashwing","Buckingcroft","Buckingfield","Buckingford","Buckingham","Buckinghart","Buckinghouse","Buckinging","Buckingsley","Buckingsly","Buckingsmith","Buckingston","Buckington","Buckingwing","Coppercroft","Copperfield","Copperford","Copperham","Copperhart","Copperhouse","Coppering","Coppersley","Coppersly","Coppersmith","Copperston","Copperton","Copperwing","Gaercroft","Gaerfield","Gaerford","Gaerham","Gaerhart","Gaerhouse","Gaering","Gaersley","Gaersly","Gaersmith","Gaerston","Gaerton","Gaerwing","Greencroft","Greenfield","Greenford","Greenham","Greenhart","Greenhouse","Greening","Greensley","Greensly","Greensmith","Greenston","Greenton","Greenwing","Hawkcroft","Hawkfield","Hawkford","Hawkham","Hawkhart","Hawkhouse","Hawking","Hawksley","Hawksly","Hawksmith","Hawkston","Hawkton","Hawkwing","Hearthcroft","Hearthfield","Hearthford","Hearthham","Hearthhart","Hearthhouse","Hearthing","Hearthsley","Hearthsly","Hearthsmith","Hearthston","Hearthton","Hearthwing","Kingcroft","Kingfield","Kingford","Kingham","Kinghart","Kinghouse","Kinging","Kingsley","Kingsly","Kingsmith","Kingston","Kington","Kingwing","Mastercroft","Masterfield","Masterford","Masterham","Masterhart","Masterhouse","Mastering","Mastersley","Mastersly","Mastersmith","Masterston","Masterton","Masterwing","Moorcroft","Moorfield","Moorford","Moorham","Moorhart","Moorhouse","Mooring","Moorsley","Moorsly","Moorsmith","Moorston","Moorton","Moorwing","Wickcroft","Wickfield","Wickford","Wickham","Wickhart","Wickhouse","Wicking","Wicksley","Wicksly","Wicksmith","Wickston","Wickton","Wickwing","Woodcroft","Woodfield","Woodford","Woodham","Woodhart","Woodhouse","Wooding","Woodsley","Woodsly","Woodsmith","Woodston","Woodton","Woodwing","Yeomcroft","Yeomfield","Yeomford","Yeomham","Yeomhart","Yeomhouse","Yeoming","Yeomsley","Yeomsly","Yeomsmith","Yeomston","Yeomton","Yeomwing","Bentrild","Bradstreet","Cliffe","fitzLysandus","Halebrook","Wolfstad","Bridwell","Castellian","Coulder","Direnni","Darkworth","Farrington","Flyte","Greyman","Kilbar","Northbridge","Perwright","Plessington","Quistley","Spode","Topfield","Woodborne","Graegyn","Geles","Stoine","Acques","Adrard","Adrognese","Amedee","Ancois","Andre","Arthe","Auline","Aurelie","Aurilie","Aurmine","Beauchamp","Beluelle","Bielle","Bienne","Bierles","Birian","Bracques","Broles","Brutya","Caria","Caristiana","Charascel","Charien","Chriditte","Cienne","Dalomax","Desele","Dolbanitte","Elbert","Ence","Endre","Ephine","Erelie","Ergalla","Farr","Fralinie","Frenck","Frernis","Gemain","Genis","Geontene","Gernis","Geves","Gilelle","Hastien","Jastal","Jeannie","Jeline","Jes","Jodoin","Jolvanne","Julalanie","Kirbatha","Laelippe","Leoriane","Limax","Liric","Macile","Madach","Mannick","Marquardt","Masolaude","Masoriane","Maston","Matreinace","Maul","Maulinie","Maurard","Mene","Merian","Meric","Milielle","Mon","Moniel","Mornardl","Nermarc","Nestal","Nin","Oges","Panoit","Phiencel","Philulanie","Phirrienele","Rane","Retene","Rielle","Rirne","Riscel","Rolston","Rostorard","Sele","Sette","Sintieve","Stieve","Sylbenitte","Tailas","Thierry","Vanne","Vette","Viralaine","Virmaulese","Ysciele","Yvienne","Violet","Amelion","Bantien","Jemane","Lirrian","Loche","Pierrane","Retiene","Surilie","Aethelred","Afranius","Alouette","Aric","Arne","Aumilie","Beanique","Belette","Bellamont","Berene","Bincal","Blakeley","Branck","Brigette","Brolus","Canne","Channitte","Corgine","Denile","Diel","Don","Draconis","Eardwulf","Ernarde","Fanis","Fanriene","Festinius","Franc","Frasoric","Galena","Galien","Gene","Geonette","Georick","Gernand","Gulitte","Herrick","Imbel","Jeanard","Jend","Jenseric","Jurard","Labouche","LaRouche","Laul","Leland","Lelles","Lemonds","Lencolia","Litte","Luseph","Maborel","Magius","Malene","Manis","Marane","Maric","Marie","Mastien","Melie","Merowald","Metrick","Milvan","Mona","Monet","Montrose","Motierre","Nathans","Northwode","Ottus","Palielle","Peneles","Perrick","Petit","Renault","Renoit","Selone","Stedrine","Stegine","Tilwald","Traven","Tussaud","Valtieri","Vautrine","Velain","Viernis","Wirich","Lylvieve","Mallory","Admand","Beaufort","Dufont","Endell","Ervine","Frey","Gane","Gemane","Gestor","Guevenne","Jondrelle","Letrush","Lort","Lothaire","Manette","Marence","Merchad","Morrard","Nytte","Onis","Peryval","Rarnis","Rodayne","Rolaine","San","Sidrey","Stentor","Stroud","Tyne","Virane","Geric","Barthel","Derre","Favraud","Justal","Armene","Benele","Charnis","Elve","Marck","Sorick","Themond","Astier","Beriel","Boulat","Brousseau","Celd","Chatillon","Cine","Ginise","Giroux","Larocque","Luric","Malarelie","Mondorie","Notte","Troivois","Arnese","Ascent","Berard","Berri","Broc","Canis","Celiane","Conele","Courcelles","Dantien","Dathieu","Davaux","Dencent","Derone","Emard","Eniel","Errard","Esmery","Falbert","Gidric","Gousse","Guillon","Helomaine","Hinault","Jerick","Lemaitre","Menant","Menoit","Ondre","Spenard","Thielde","Viliane","Agnan","Ales","Alielle","Alinie","Ancelet","Bachand","Barbe","Bertault","Bordier","Brassac","Bruhl","Carlier","Charmax","Chauvry","Coravel","Daigre","Dalielle","Dantaine","Dechery","Dercirent","Donze","Dubosc","Dubroc","Dugot","Dutil","Emax","Epinard","Ergend","Eriel","Etanne","Farielle","Frinck","Geline","Gelves","Genin","Georence","Gimbert","Jegnole","Landreau","Lateur","Lemal","Len","Leraud","Luillier","Mantel","Marolles","Molose","Montclair","Montieu","Moret","Pamarc","Plouff","Ragon","Redain","Sansone","Stelanie","Sterone","Tanier","Velmont","Zammes","Ancent","Antieve","Arbogasque","Artan","Aubertin","Augier","Badouin","Baelborne","Bargeron","Belaine","Belland","Benichou","Bienena","Boissart","Bossard","Bouchard","Cadiou","Cantillon","Cariveau","Carme","Cassel","Cedmain","Cergend","Cerone","Chriane","Cottret","Coulon","Dailland","Dalot","Douare","Dupertuis","Dutheil","Edette","Edier","Edilitte","Edrald","Etienne","Fontbonne","Foucher","Gamache","Garick","Garnier","Gautier","Gette","Gevette","Hemmet","Hermant","Hurier","Jascien","Jeanne","Jerenise","Laffoon","Lan","LeBlanc","Leonciele","Letarte","Lia","Lielleve","Luluelle","Macien","Malyne","Marcott","Mavine","Maviniele","Merick","Metivier","Miller","Mornard","Morrad","Mouriou","Murric","Noellaume","Nurin","Orinth","Oscent","Pajaud","Panitte","Pellingare","Phien","Plourde","Pujol","Quintin","Rangouze","Relippe","Renaudin","Reynaud","Rirniel","Ronise","Rouillac","Ruqueville","Sephinie","Serene","Serre","Stemuseph","Stenric","Stogrin","Surges","Tremouille","Veloise","Winvale","Zurric","Anquetil","Ascenge","Babin","Bacqure","Begnaud","Belloq","Bezons","Brussiner","Capron","Cartier","Castille","Chamrond","Chrinitte","Chrirnis","Claverie","Cornillac","Croix","Danise","Dauzat","DeBuke","Detelle","Delatte","Delitian","Delrusc","Dorell","Dortene","Dubois","Douar","Dufort","Dupare","Dusant","Emain","Emarie","Ergene","Ernele","Etelette","Eugenie","Euginie","Faleille","Falon","Falvo","Farnele","Feldrin","Fevre","Franis","Gedanis","Geornis","Germarc","Gilbeau","Ginis","Girien","Gomberville","Guegan","Guidroz","Guylitte","Hedier","Helena","Henoit","Hositte","Jonnicent","Jourvel","Jutras","Knodel","Langey","Lanier","Lavedan","Lavergne","Levys","Lirlane","Longtemps","Lozieres","Lurgette","Madier","Mallon","Malveaux","Marceau","Marguenaut","Marigny","Marose","Marville","Mathis","Mazure","Menillet","Metayer","Montarbault","Montgrun","Morfin","Munier","Nirine","Nisirrien","Oncent","Penot","Pouzou","Prevette","Relin","Rernis","Remly","Rohde","Santerre","Sarazen","Sauvage","Sellan","Serielle","Silvey","Sourt","Stende","Stental","Tamrith","Thelin","Thenephan","Tustin","Urquine","Varin","Vervins","Vien","Vienne","Virien","Voirol","Vrouarde","Vyau","Vygant","Vyger","Yunlin","Zulin","Zylippe","Aalart","Airde","Alemont","Aloette","Alois","Alonais","Althen","Altien","Amadour","Ambloc","Ameli","Andras","Andrese","Antienne","Aranthe","Arsenault","Ascor","Ashtic","Auberdine","Aumel","Auzin","Avagour","Avau","Babiloine","Balbus","Bandas","Barclay","Barthele","Barthis","Bavette","Bedel","Belaire","Belaram","Belimont","Bellec","Bencal","Benel","Benoit","Berouche","Blakeny","Bochur","Boutard","Bran","Brank","Brettick","Bridgette","Broch","Broussard","Bruc","Brusic","Calhagen","Callyn","Carsitien","Catillon","Catreau","Chachere","Charchere","Charis","Charlerel","Chaudry","Cheval","Ceirans","Cirges","Clavarie","Conrele","Coriel","Countenain","Countenan","Coutenan","Croque","Crowe","Dailllon","Daillon","Dancent","Daniel","Darkblood","DeFulley","Deleyn","Demalle","Demarie","Dembure","Denter","Derren","Desant","Devry","DeYonge","Dimeney","Doisne","Donolon","Doran","Douer","Doure","Dubeau","DuBois","Dulroi","Durant","Duront","Elles","Ellioni","Emarthe","Erelle","Eugne","Evrard","Facian","Fairfax","Falkwind","Farro","Fassel","Fauconniere","Favret","Fenandre","Fenvale","Finley","Finstock","Flaubert","Flaury","Folmort","Fransoric","Fren","Frernele","Frernile","Gaerard","Gagnon","Galvendier","Garcique","Gardet","Garoutte","Garscroft","Gavendien","Gavendier","Gavonne","Gerieux","Gevont","Ginsen","Girarde","Gourone","Granger","Gregorie","Grenier","Grondin","Guerat","Guissant","Gurles","Gustave","Haalm","Hall","Harbert","Havel","Hawrond","Heartwound","Helane","Henyra","Hequetot","Hertulus","Hiriel","Hoger","Holette","Hu","Hurrent","Ildene","Inkskin","Izard","Jarnot","Jeanyn","Jenole","Jerine","Jerrick","Jeuneau","Jodain","Jullalian","Junciennes","Jurelette","Kel","Kerbol","Kinlin","Korine","Lacroix","Lafont","Laggard","Lamont","Lancarl","Lanctot","Lanie","Larconne","Larouche","Laule","Laumont","Laurdon","Laurent","Laussac","Lauzon","Le Fleury","Lemarc","Lerineaux","Lescher","LeTarte","Leveque","Liancourt","Lielle","Litlin","Locke","Lonacque","Long","Longis","Loumont","Louvain","Lozon","Lydelle","Lynielle","Mactien","Madrine","Magaudin","Magitte","Maguadin","Malanie","Malfairre","Malhaven","Malloni","Malon","Mandin","Manteau","Marcauld","Marcien","Marcrina","Marquad","Maryon","Matine","Maucroix","Meriel","Mezon","Mielde","Mirolli","Missonnier","Monbault","Monstrose","Montagne","Montgren","Montlogue","Montue","Morascel","Mortieu","Muric","Murien","Nalskin","Narcien","Nashrith","Natien","Nelk","Nemarc","Nemarcet","Nevim","Niert","Noie","Normar","Northwind","Nunier","Ocella","Odette","Oltz","Ondare","Onfroi","Oresme","Oris","Osina","Ouren","Pathierry","Paumier","Pavelle","Pellegrin","Peloquin","Pendlesmith","Penoit","Peppair","Peronard","Peyron","Philippe","Pierel","Pirouet","Praul","Quirin","Racicot","Rafelen","Raiment","Rambouze","Rambure","Rangifer","Rayuand","Rechiche","Reille","Remarque","Ren","Reniot","Restane","Reyneaux","Richaut","Rissiel","Robins","Rocque","Roreles","Rorielle","Ruman","Rusone","Rye","Saklin","Scraeg","Sebell","Serien","Serouge","Serpe","Seychelle","Shaldon","Silane","Silvelle","Simiseph","Siniel","Souar","Spennard","Spletis","Stalo","Stenck","Steonie","Sterrien","Stoneshaper","Stower","Surille","Sylberfain","Tailies","Talemelier","Talnarith","Taloet","Tardif","Tauzin","Teague","Thal","Thenitte","Theroque","Throm","Thybault","Tibbin","Toillier","Tramnil","Trebane","Trebarne","Treveur","Ulanie","Urbyn","Ursus","Valeine","Vallet","Valtier","Varien","Varrid","Vautri","Vedaine","Vernins","Vierniss","Vilaine","Vinetier","Vinielle","Viranes","Virelande","Volcy","Voriol","Vostard","Vynier","Vyrix","Weller","Wennell","Yonis","Zola","Gorlash","Guylves","Bagún","Chales","Monena","Valic","Franck","Imbert","Landrie","Leblanc","Lelong","Legros","Mallorie","Maurant","Montrouge","Nerval","Norman","Ozric","Ranis","Robin","Rumain","Tussault","Venne","Hoïnart","Graddock","Raze","Bontecou","Evane","Gignac","Horley","Lariat","Montaine","Moresby","Shelly","Vardengroet"],"Dark Elf":["Adlain","Adlam","Adlan","Adlaron","Adlathil","Adlbruk","Adlen","Adlenar","Adlis","Adlon","Adlone","Adlul","Avalain","Avalam","Avalan","Avalaron","Avalathil","Avalbruk","Avalen","Avalenar","Avalis","Avalon","Avalone","Avalul","Enakain","Enakam","Enakan","Enakaron","Enakathil","Enakbruk","Enaken","Enakenar","Enakis","Enakon","Enakone","Enakul","Grulain","Grulam","Grulan","Grularon","Grulathil","Grulbruk","Grulen","Grulenar","Grulis","Grulon","Grulone","Grulul","Helbain","Helbam","Helban","Helbaron","Helbathil","Helbbruk","Helben","Helbenar","Helbis","Helbon","Helbone","Helbul","Moabain","Moabam","Moaban","Moabaron","Moabathil","Moabbruk","Moaben","Moabenar","Moabis","Moabon","Moabone","Moabul","R'ain","R'am","R'an","R'aron","R'athil","R'bruk","R'en","R'enar","R'is","R'on","R'one","R'ul","Rallain","Rallam","Rallan","Rallaron","Rallathil","Rallbruk","Rallen","Rallenar","Rallis","Rallon","Rallone","Rallul","R'zamain","R'zamam","R'zaman","R'zamaron","R'zamathil","R'zambruk","R'zamen","R'zamenar","R'zamis","R'zamon","R'zamone","R'zamul","Sailain","Sailam","Sailan","Sailaron","Sailathil","Sailbruk","Sailen","Sailenar","Sailis","Sailon","Sailone","Sailul","S'thain","S'tham","S'than","S'tharon","S'thathil","S'thbruk","S'then","S'thenar","S'this","S'thon","S'thone","S'thul","T'rizain","T'rizam","T'rizan","T'rizaron","T'rizathil","T'rizbruk","T'rizen","T'rizenar","T'rizis","T'rizon","T'rizone","T'rizul","Ankhir","Ghur","J'yrmir","Ris","Z'morag","Dagoth","tomb","Andrano","Andrethi","Ienith","Hlaalu","Arvel","Dralor","Llervu","Sadri","Saren","Andas","Dren","Faryon","Girith","Hleran","Indaram","Aryon","Indaren","Indrano","Sarano","Seran","Andarys","Andus","Arenim","Athren","Farano","Fyr","Gilnith","Hlaren","Llethri","Maryon","Omayn","Relas","Salas","Saryon","Uvayn","Vendu","Andaram","Aralas","Arelas","Arobar","Helas","Hlervu","Llaren","Lleran","Maren","Nerethi","Omoran","Oran","Othravel","Othril","Rathryon","Rethan","Retheran","Salvani","Saram","Sarethi","Seloth","Senim","Teran","Tharen","Ules","Velas","Venim","Veran","Verethi","Virith","Adas","Adren","Alen","Andalas","Andalen","Andoril","Andules","Arano","Aravel","Aren","Arethan","Arethi","Beleth","Berano","Dral","Dralas","Drelas","Drenim","Drethan","Drothan","Helvi","Henim","Ieneth","Indalas","Irano","Llaram","Llarys","Llenim","Llethan","Lloran","Mandas","Nethan","Omalen","Omavel","Oren","Orethi","Oril","Othan","Othran","Othren","Radas","Ralen","Rendas","Sadus","Sarendas","Sarys","Seleth","Serethi","Tedas","Tenim","Thelas","Thirandus","Thirano","Uvaren","Uvenim","Uveran","Varen","Varis","Alver","Andaren","Andavel","Andoren","Andrelo","Aralen","Areleth","Arinith","Arothan","Athram","Athrys","Balen","Belas","Berendas","Berethi","Dalen","Darethi","Daryon","Darys","Dran","Drom","Falas","Falen","Faram","Faren","Farethi","Farys","Favelnim","Gilvayn","Heleran","Heran","Hlaalo","Hlan","Hlas","Hlen","Hler","Hloran","Indalen","Indarys","Llendu","Marvel","Marys","Moren","Morvayn","Mothryon","Nelas","Nerano","Nirith","Norvayn","Norvayne","Omalas","Omalor","Omoril","Omothan","Othralen","Othrelas","Othreleth","Othreloth","Othrenim","Ralas","Raledran","Ravel","Releth","Romoren","Romori","Rothandus","Samori","Sarandas","Sarothril","Savel","Savil","Sedas","Selaren","Selas","Selvilo","Sendas","Sethan","Telas","Thendas","Tures","Ulven","Uvelas","Uvirith","Varam","Vari","Varyon","Varys","Vedas","Vedran","Veleth","Verano","Vules","Adram","Adryn","Adus","Alam","Alan","Alari","Alvor","Amori","Andalor","Andothan","Andral","Andrani","Andrilo","Androm","Andromo","Androthi","Apo","Aradil","Aram","Areloth","Ares","Areth","Arns","Arval","Athelvis","Athin","Athones","Avani","Avel","Avilo","Balur","Balvel","Bandas","Baram","Barelo","Baren","Baro","Barus","Baryon","Barys","Bavani","Bedas","Belaal","Belan","Belaram","Belden","Beloren","Bels","Belvani","Belvayn","Belvilo","Bemis","Benelas","Beneran","Benethran","Beni","Bereloth","Beren","Berendus","Berer","Bero","Bethrano","Bethrimo","Bradyn","Braryn","Braven","Brenos","Brenur","Brilyn","Carvaren","Dalas","Dalis","Dalobar","Dalomo","Dals","Dalvani","Damori","Danoran","Daram","Darano","Daren","Darethran","Darothril","Darvel","Dathren","Davor","Davus","Daynes","Delms","Deltis","Delvi","Demnevanni","Deras","Dilmyn","Dobar","Doran","Doren","Dorvayn","Doves","Dradas","Dralayn","Dralen","Dralno","Drals","Drath","Drathen","Dredayn","Dredil","Dreleth","Dreloth","Dres","Dreth","Driler","Drilvi","Drin","Drinith","Drivam","Drobar","Drolan","Drolnor","Drora","Droryn","Droth","Drurel","Dulfass","Dulni","Duro","Elarven","Elval","Elvul","Ertis","Evos","Falandas","Falavel","Falos","Fals","Falvani","Famori","Faralen","Farandas","Faravel","Fareloth","Farethan","Farothran","Fatheran","Fathyron","Favani","Faveran","Fedos","Felas","Felder","Fels","Fendyn","Fererus","Fevur","Folvyn","Gadar","Galen","Gals","Garer","Garil","Garvon","Gavos","Gavyn","Gidran","Gilaram","Gilvani","Gilvilo","Gimalvel","Gimayn","Gindu","Ginith","Giral","Giralvel","Girando","Girano","Girendas","Girethi","Girothran","Girvayne","Githendas","Githrano","Givyn","Gobor","Golathyn","Gols","Goran","Gorvas","Guls","Guvron","Hardil","Heladren","Helni","Helothan","Helothran","Helothren","Herandus","Herendas","Herothran","Hlaano","Hlando","Hlarar","Hlarys","Hledas","Hledri","Ildram","Ilnith","Imayn","Indavel","Indobar","Indoran","Indules","Inlador","Irathi","Irethi","Ledd","Lladri","Llandu","Llendo","Llerayn","Llervi","Lleryn","Lloryn","Llothas","Llothri","Madalas","Madalvel","Madryon","Malas","Maloren","Malvayn","Manas","Manel","Mano","Marvayn","Marvos","Mathendis","Mavandes","Mels","Menas","Mencele","Merys","Milar","Milo","Mirel","Molor","Moran","Nadram","Nadus","Nalyn","Naros","Navur","Nedalor","Neladren","Nelaram","Neleth","Nelvani","Nelvayn","Nelvilo","Nerandas","Nerothan","Nerothren","Nerus","Nervion","Nethalen","Nilem","Nilvon","Nithryon","Nolar","Nothro","Nothryon","Nulen","Ofemalen","Omani","Omaren","Ondyn","Onmar","Orelu","Ores","Oreyn","Othralas","Othrobar","Quintella","Radarys","Radobar","Ralaal","Raloran","Ralvani","Ralvayn","Ramarys","Ramoran","Ramori","Ramothran","Randas","Raram","Rathri","Redas","Redothril","Reladren","Relarys","Relavel","Relenim","Relnim","Reloro","Reloth","Relvani","Rendo","Reni","Renim","Reram","Rervam","Rethelas","Rethul","Reyas","Rilvayn","Rindo","Rindu","Rinith","Rivul","Rols","Romandas","Romari","Romavel","Romayn","Romoran","Romothran","Rothalen","Rothalnim","Rothalor","Rothan","Rothari","Rotheloth","Rotheran","Rothrano","Rothren","Rurvyn","Ryon","Sadalas","Sadalvel","Sadas","Sadoro","Sadralo","Sadrano","Sadryon","Sadrys","Sala","Salam","Salandas","Salaren","Salaron","Salavel","Salen","Salenim","Salmyn","Salobar","Salor","Salvi","Samandas","Sandus","Sarandus","Sarathram","Sareloth","Sarethan","Sari","Sarinith","Sarobar","Sarothran","Sarothren","Saryoni","Sathendas","Sathis","Sathren","Sathryon","Savani","Sedrethi","Sedri","Selandas","Selaro","Selarys","Seles","Selothan","Selvayn","Sendu","Senoril","Seralas","Serano","Seri","Serothan","Serven","Sethandas","Sethandus","Sethri","Surishpi","Talds","Tedalen","Tedran","Telandas","Telmon","Telnim","Telvani","Teneran","Terandas","Terano","Teri","Teria","Terilu","Tervayn","Thalas","Thalor","Thando","Tharam","Tharyon","Tharys","Theman","Thenim","Therayn","Therethi","Thilandas","Thilarvel","Thimalvel","Thindo","Thiralas","Thireloth","Thirith","Thirothan","Thirvayn","Tilvur","Tistar","Tobor","Trandel","Tunel","Tyravel","Uleni","Ulessen","Ulom","Ulvel","Ulver","Urns","Urvon","Urvyn","Uvalas","Uvalen","Uvalor","Uvani","Uvaram","Uveleth","Uvulas","Vadryon","Valaai","Valas","Valen","Valno","Valor","Vando","Vandram","Varo","Vavas","Vavyn","Vedaren","Vedralu","Vedrano","Velendas","Velni","Veloren","Veloth","Velothren","Velothril","Veralor","Verelas","Verendas","Veri","Verilnith","Verothan","Viake","Vian","Vibato","Vidron","Vilas","Vinden","Volos","Dalvilu","Drad","Lythandas","Norvalo","Alor","Devani","Dolovas","Douar","Drarara","Fandas","Gatharian","Hlavel","Kren","Lerano","Llethro","Lonavo","Malvulis","Nedaren","Nyrandil","Omellian","Ralvas","Ralvel","Romalen","Selvani","Seringi","Thelis","Theran","Vamori","Verenim","Sathil","Atheron","Ienth","Llanith","Ulen","Balu","Drel","Duleri","Eldri","Elenil","Fathryon","Giryon","Idren","Imyan","Mavandas","Marethi","Mavani","Mothren","Neloren","Nethri","Relvel","Relvi","Rendar","Sarvani","Sedarys","Sero","Telendas","Velothi","Veren","Redoran","Telvanni","Indoril","Drim","Girvu","Adrys","Hlor","Othrys","Arthalen","Denelu","Elendis","Mothril","Rethandus","Teryon","Vanos","Arys","Betharvel","Dalothran","Davel","Dothan","Dravel","Drimas","Fanim","Gilenim","Githalvel","Herano","Heryon","Hloril","Indalor","Indoren","Randoro","Selobar","Uvaril","Aralor","Arovyn","Bandu","Belavel","Berothran","Beryon","Bethendas","Darenim","Darothren","Daveleth","Drelo","Drothro","Fadas","Falvel","Farelas","Flan","Giravel","Helan","Hereloth","Herethi","Keleth","Lenith","Lledas","Manothrel","Mareloth","Merobar","Moryon","Mothran","Nelenim","Noramil","Omobar","Radus","Redoril","Rii","Romothren","Serethran","Severin","Svadstar","Svel","Telleno","Thervayn","Verobar","Virian","Vox","Aalvul","Adrano","Alar","Alas","Alasien","Althranis","Amurith","Andril","Andros","Anthones","Aran","Arendis","Aron","Arona","Arvu","Avayn","Bail","Baldan","Beldros","Beleram","Beleran","Beran","Berathi","Bethalas","Dalo","Dalvel","Daral","Dareel","Darithran","Dawari","Delenu","Derith","Diina","Dobyr","Doronil","Drados","Drathan","Drelen","Drenduf","Drothas","Dulo","Esen","Evosa","Fadras","Falaal","Farr","Favel","Ferloth","Fenrila","Firuth","Furari","Gathram","Gethanol","Gilveni","Gilvio","Gimothran","Githirith","Gothren","Grando","Guvrun","Hedoren","Hedran","Heredon","Hlandu","Hlaran","Illoro","Imyam","Indothan","Inladori","Jaxilsu","Laelippe","Lathdar","Lathoril","Lem","Lindres","Lirvu","Lladris","Llandresil","Llarvys","Lliran","Llothan","Malena","Maleran","Malrom","Maralvel","Marano","Mevel","Mobaner","Moorsmith","Morelo","Naram","Nerathren","Nerendas","Nirvayn","Nolvon","Nox","Oldrethi","Oloth","Omarys","Omoren","Onthim","Orain","Orenim","Orn","Orthil","Otheri","Othral","Othralor","Radathren","Ralethran","Ralren","Randaro","Ras","Raviro","Rayveth","Redothan","Reledran","Reloren","Relthren","Renimus","Resvalyn","Rithari","Rondas","Ronen","Sadreno","Sadris","Salothan","Salvilo","Sandras","Sanil","Sarvayn","Sasamsi","Saveoro","Selos","Sendrul","Serelnim","Seruli","Seryiil","Shandasi","Sildreth","Skaliz","Sonoril","Suth","Tedala","Teddalennu","Telem","Telvayn","Thadus","Thanlen","Tharvi","Vahru","Theloth","Thendur","Tirethi","Treviri","Urano","Uvandrys","Valos","Valyn","Vandril","Vandus","Varyoni","Vashi","Velador","Velar","Vels","Ven","Vendil","Veralas","Vildan","Viri","Vlaren","Volek","Voren","Voung","Yahaz","Rend","Sethran","Carinie","Dreelo","Gores","Narsen","Omeds","Ondell","Rathis","Salith","Salmel","Dalor","Fani","Farenim","Gilaren","Lloren","Malor","Maloran","Redoren","Rothri","Rothril","Salandus","Saloren","Sandas","Sarenim","Selothren","Seryon","Tedryon","Teloren","Telvi","Terelas","Tervani","Thereni","Thiryon","Vadalo","Velenim","Veloran","Vulothi","Aduro","Akin","Jeles","Llerlu","Llevarso","Muendil","Nisath","Olen","Omathan","R'aathim","Relethyl","Rolovo","Sorra","Torom","Vess","Vren"],"High Elf":["Adaire","Adal","Adbinder","Adian","Adire","Adius","Adlock","Ador","Adorin","Adthar","Adus","Adwatch","Caemaire","Caemal","Caembinder","Caemian","Caemire","Caemius","Caemlock","Caemor","Caemorin","Caemthar","Caemus","Caemwatch","Elsinaire","Elsinal","Elsinbinder","Elsinian","Elsinire","Elsinius","Elsinlock","Elsinor","Elsinorin","Elsinthar","Elsinus","Elsinwatch","Gaeaire","Gaeal","Gaebinder","Gaeian","Gaeire","Gaeius","Gaelock","Gaeor","Gaeorin","Gaethar","Gaeus","Gaewatch","Grayaire","Grayal","Graybinder","Grayian","Grayire","Grayius","Graylock","Grayor","Grayorin","Graythar","Grayus","Graywatch","Highaire","Highal","Highbinder","Highian","Highire","Highius","Highlock","Highor","Highorin","Highthar","Highus","Highwatch","Joraire","Joral","Jorbinder","Jorian","Jorire","Jorius","Jorlock","Joror","Jororin","Jorthar","Jorus","Jorwatch","Larethaire","Larethal","Larethbinder","Larethian","Larethire","Larethius","Larethlock","Larethor","Larethorin","Lareththar","Larethus","Larethwatch","Silinaire","Silinal","Silinbinder","Silinian","Silinire","Silinius","Silinlock","Silinor","Silinorin","Silinthar","Silinus","Silinwatch","Spellaire","Spellal","Spellbinder","Spellian","Spellire","Spellius","Spelllock","Spellor","Spellorin","Spellthar","Spellus","Spellwatch","Stormaire","Stormal","Stormbinder","Stormian","Stormire","Stormius","Stormlock","Stormor","Stormorin","Stormthar","Stormus","Stormwatch","Thromaire","Thromal","Thrombinder","Thromian","Thromire","Thromius","Thromlock","Thromor","Thromorin","Thromthar","Thromus","Thromwatch","Direnni","Aundae","Camoran","Arenim","Mothril","Frey","Rilis","Wethrin","Galerion","Larethiath","Aldmeri","Auralus","Corela","Corelanya","Culanarin","Egun","Enruneldinion","Errinorne","Firlamil","Hilnore","Inecil","Itelnoril","Nivulirel","Numralion","Piryaden","Salolinwe","Ternerben"],"Imperial":["Septim","Richton","Atrius","Faustus","Flaccus","Herennia","Olcinius","Pullia","Tullius","Abitius","Acicius","Acilius","Aerius","Afronia","Agrudilius","Albarnian","Albuttian","Alfena","Alleius","Amatius","Amiulusus","Amnis","Amphia","Angius","Antabolis","Apinia","Artoria","Artorius","Aurrus","Autrus","Baenius","Berne","Blonia","Burtilius","Caerellius","Callonus","Carbo","Caro","Carius","Catanius","Catius","Catraso","Cedus","Celata","Ceno","Cerunia","Cines","Claevius","Clanler","Closcius","Cnisia","Colollius","Conciatius","Conician","Cosades","Crunus","Cullian","Curio","Delitian","Denian","Dergius","Douar","Duronia","Egnatius","Entius","Esdrecus","Essagan","Facian","Famalius","Fauseius","Felannus","Flaeus","Flarugrius","Flavonius","Fulbenus","Fulcinius","Furotis","Gabenagus","Gabinia","Galenus","Gloriosus","Gratius","Gratus","Gravius","Hanotepelus","Harmevus","Harsinia","Hateria","Herennius","Hers","Hertarian","Horatius","Iulus","Jannus","Jucanis","Jullalian","Laecinnius","Laenius","Lalelius","Leontiulonus","Liore","Lusius","Macrina","Macro","Magia","Magius","Mantedius","Maraennius","Maria","Marius","Maro","Matius","Maximus","Menanius","Mercius","Mero","Mevureius","Mico","Mido","Muco","Munia","Musilchiotus","Muspidius","Mussillius","Nigilius","Nuccius","Nuccusius","Nuncius","Oranius","Ostorius","Otiustiris","Palenix","Pelelius","Petilia","Pevengius","Plalocius","Platorius","Plebo","Ponius","Pontanian","Popillius","Posuceius","Pundus","Puruseius","Quarra","Quaspus","Rato","Roscius","Rulician","Saccus","Scerius","Scinia","Secunia","Sialius","Sibassius","Siruliulus","Sosia","Spurius","Statlilius","Talanian","Tiragrius","Truptor","Tunifus","Urgelian","Urgusiso","Urtius","Uulentanus","Valerius","Valius","Valodius","Vandacia","Vant","Vantinius","Varian","Varo","Varro","Velvus","Viciulus","Vinipter","Vitellia","Vitellius","Vunnis","Sintav","Draconis","Atius","Kvinchal","Odiil","Verus","Afranius","Allectus","Aurunceia","Benirus","Bruiant","Donton","Doran","Hassildor","Invel","Inventius","Marillin","Moslin","Ottus","Plotius","Sextius","Terentius","Umbranox","Abor","Accius","Ancharia","Ancrus","Andronicus","Andus","Annius","Antonius","Arcadia","Arius","Armina","Artellian","Auria","Avidius","Axius","Bincal","Blackwell","Blandia","Bradus","Broad","Broder","Brolus","Brussiner","Calidia","Calidius","Callidus","Calus","Cartia","Carvain","Cassiana","Catiotus","Cecia","Chenius","Cheynoslin","Cinna","Civello","Colus","Cosma","Clutumnus","Dannus","Darelliun","Decanius","Dralgoner","Duronius","Faleria","Falvius","Favonius","Flavus","Flonius","Floria","Florius","Fralmoton","Gallenus","Garrana","Gavinius","Gawey","Geonette","Goldwine","Goneld","Green","Gregori","Hanus","Hayn","Hiriel","Hodge","Hoff","Hosidius","Hosidus","Idolus","Inian","Jarol","Jeranus","Jirich","Lachance","Laftrius","Lannus","Lerus","Lex","Logellus","Lollia","Longus","Loran","Lovidicus","Maborel","Maenius","Mallius","Melissaeia","Monrius","Nanus","Nirol","Nonius","Oholin","Opsius","Orania","Orius","Patneim","Petilius","Phillida","Pinder","Polus","Prelius","Prentus","Previa","Quintilius","Raman","Rian","Rienus","Rilian","Rosentia","Rufus","Runellius","Rusonius","Scribonia","Senarel","Senyan","Sestius","Silver","Statlilia","Trebatius","Truiand","Turrianus","Valga","Valus","Vanin","Varrid","Vassinus","Vedius","Vesnia","Viducia","Vinicius","Viria","Vlindrel","Vlinorman","Vonius","Wavrick","Whitestrake","Wisnewski","Wotrus","Salvius","Avenicci","Uriel","Valentia","Vici","Vinius","Aeresius","Aretino","Arria","Ateia","Attius","Beaufort","Caelia","Caerellia","Caesennius","Cipius","Corrium","Decimius","Desidenius","Duilis","Endario","Evicus","Giordano","Junius","Leotelli","Loreius","Maccius","Mede","Navale","Papius","Pelagia","Petreia","Plinius","Sallustius","Salvarus","Tituleius","Tremellia","Vendicci","Vesuius","Vinicia","Vulpin","Cominius","Calvina","Caprenius","Clovia","Didius","Galena","Lampronius","Lusia","Silius","Tetius","Aelius","Agius","Albinus","Albus","Ammianus","Ancharius","Antias","Antius","Appuleius","Arminus","Arrius","Asinius","Atilus","Atticus","Auctor","Aulus","Axilla","Baebius","Barbatus","Belenus","Bruccius","Bruttia","Caesius","Calatus","Calo","Calvus","Campano","Candidus","Capius","Carlinus","Cassianus","Catullus","Cecius","Celatus","Cipia","Clanius","Clodianus","Cordius","Cornelius","Corvinus","Corvus","Crispus","Curatius","Curius","Curtius","Decianus","Derius","Dillius","Dinas","Dobellis","Dossenius","Dragus","Drusus","Equitius","Fabricius","Falco","Filius","Floridius","Fontius","Fortunatus","Gallus","Geminus","Gracchus","Gregorius","Hadrianus","Helenus","Helvius","Herius","Herminia","Itinia","Jano","Justus","Juventius","Lentinus","Lepidus","Licinius","Longinus","Lucilius","Lupus","Marcellus","Marcius","Martiannius","Medilus","Messenia","Municus","Munius","Nasica","Nemetorius","Nepius","Nerva","Netinian","Novatian","Numerius","Octavius","Opius","Oppius","Pamphelius","Pelius","Pelletus","Petellia","Petronius","Philida","Pictor","Piscius","Popidius","Portius","Proximus","Pullo","Pupius","Pupus","Quenti","Quintius","Quirinius","Ranius","Rufinus","Rufius","Sabinus","Salonius","Secundus","Sepunius","Sertorius","Sextilius","Sibylla","Sidonia","Sidonius","Sittius","Sulla","Sylla","Titius","Trasius","Tucca","Ulpius","Urthinius","Vania","Varius","Vatia","Velarius","Venator","Vergilus","Virgilus","Virius","Vitruvius","Volusianus","Volusius","Cuontus","Larsus","Memmius","Oprenus","Primus","Tripitus","Vineben","Krately","Anzione","Aurelia","Bellienus","Bolar","Bucco","Falto","Gemullus","Isauricus","Jurus","Malier","Mallicius","Martius","Nerevelus","Olo","Philidus","Raythorne","Sardecus","Scotti","Tasus","Voria"],"Khajiit":["Ap'Kolthis","Abiri","Abus","Adavi","Ahan","Ahir","Akar","Amanni","Amnin","Anai","Aoni","Arabi","Aspoor","Astae","Atani","Avandi","Barabiri","Barabus","Baradavi","Barahan","Barahir","Barakar","Baramanni","Baramnin","Baranai","Baraoni","Bararabi","Baraspoor","Barastae","Baratani","Baravandi","Hammubiri","Hammubus","Hammudavi","Hammuhan","Hammuhir","Hammukar","Hammumanni","Hammumnin","Hammunai","Hammuoni","Hammurabi","Hammuspoor","Hammustae","Hammutani","Hammuvandi","Jabiri","Jabus","Jadavi","Jahan","Jahir","Jakar","Jamanni","Jamnin","Janai","Jaoni","Jarabi","Jaspoor","Jastae","Jatani","Javandi","Khabiri","Khabus","Khadavi","Khahan","Khahir","Khakar","Khamanni","Khamnin","Khanai","Khaoni","Kharabi","Khaspoor","Khastae","Khatani","Khavandi","Kibiri","Kibus","Kidavi","Kihan","Kihir","Kikar","Kimanni","Kimnin","Kinai","Kioni","Kirabi","Kispoor","Kistae","Kitani","Kivandi","Mahbiri","Mahbus","Mahdavi","Mahhan","Mahhir","Mahkar","Mahmanni","Mahmnin","Mahnai","Mahoni","Mahrabi","Mahspoor","Mahstae","Mahtani","Mahvandi","Raibiri","Raibus","Raidavi","Raihan","Raihir","Raikar","Raimanni","Raimnin","Rainai","Raioni","Rairabi","Raispoor","Raistae","Raitani","Raivandi","Robiri","Robus","Rodavi","Rohan","Rohir","Rokar","Romanni","Romnin","Ronai","Rooni","Rorabi","Rospoor","Rostae","Rotani","Rovandi","Sabiri","Sabus","Sadavi","Sahan","Sahir","Sakar","Samanni","Samnin","Sanai","Saoni","Sarabi","Saspoor","Sastae","Satani","Savandi","Sibiri","Sibus","Sidavi","Sihan","Sihir","Sikar","Simanni","Simnin","Sinai","Sioni","Sirabi","Sispoor","Sistae","Sitani","Sivandi","Solbiri","Solbus","Soldavi","Solhan","Solhir","Solkar","Solmanni","Solmnin","Solnai","Soloni","Solrabi","Solspoor","Solstae","Soltani","Solvandi","Tavakbiri","Tavakbus","Tavakdavi","Tavakhan","Tavakhir","Tavakkar","Tavakmanni","Tavakmnin","Tavaknai","Tavakoni","Tavakrabi","Tavakspoor","Tavakstae","Tavaktani","Tavakvandi","Zabiri","Zabus","Zadavi","Zahan","Zahir","Zakar","Zamanni","Zamnin","Zanai","Zaoni","Zarabi","Zaspoor","Zastae","Zatani","Zavandi","Tabav"],"Nord":["Alaldsen","Alansen","Alarsen","Alariksen","Alarkesen","Alarnesen","Aleldsen","Alensen","Alenssen","Alersen","Aliksen","Alissen","Alornsen","Asgaldsen","Asgansen","Asgarsen","Asgariksen","Asgarkesen","Asgarnesen","Asgeldsen","Asgensen","Asgenssen","Asgersen","Asgiksen","Asgissen","Asgornsen","Bjaldsen","Bjansen","Bjarsen","Bjariksen","Bjarkesen","Bjarnesen","Bjeldsen","Bjensen","Bjenssen","Bjersen","Bjiksen","Bjissen","Bjornsen","Eraldsen","Eransen","Erarsen","Erariksen","Erarkesen","Erarnesen","Ereldsen","Erensen","Erenssen","Erersen","Eriksen","Erissen","Erornsen","Fenraldsen","Fenransen","Fenrarsen","Fenrariksen","Fenrarkesen","Fenrarnesen","Fenreldsen","Fenrensen","Fenrenssen","Fenrersen","Fenriksen","Fenrissen","Fenrornsen","Haraldsen","Haransen","Hararsen","Harariksen","Hararkesen","Hararnesen","Hareldsen","Harensen","Harenssen","Harersen","Hariksen","Harissen","Harornsen","Ingmaldsen","Ingmansen","Ingmarsen","Ingmariksen","Ingmarkesen","Ingmarnesen","Ingmeldsen","Ingmensen","Ingmenssen","Ingmersen","Ingmiksen","Ingmissen","Ingmornsen","Jurgaldsen","Jurgansen","Jurgarsen","Jurgariksen","Jurgarkesen","Jurgarnesen","Jurgeldsen","Jurgensen","Jurgenssen","Jurgersen","Jurgiksen","Jurgissen","Jurgornsen","Kjaldsen","Kjansen","Kjarsen","Kjariksen","Kjarkesen","Kjarnesen","Kjeldsen","Kjensen","Kjenssen","Kjersen","Kjiksen","Kjissen","Kjornsen","Mojaldsen","Mojansen","Mojarsen","Mojariksen","Mojarkesen","Mojarnesen","Mojeldsen","Mojensen","Mojenssen","Mojersen","Mojiksen","Mojissen","Mojornsen","Soraldsen","Soransen","Sorarsen","Sorariksen","Sorarkesen","Sorarnesen","Soreldsen","Sorensen","Sorenssen","Sorersen","Soriksen","Sorissen","Sorornsen","Torbaldsen","Torbansen","Torbarsen","Torbariksen","Torbarkesen","Torbarnesen","Torbeldsen","Torbensen","Torbenssen","Torbersen","Torbiksen","Torbissen","Torbornsen","Ulraldsen","Ulransen","Ulrarsen","Ulrariksen","Ulrarkesen","Ulrarnesen","Ulreldsen","Ulrensen","Ulrenssen","Ulrersen","Ulriksen","Ulrissen","Ulrornsen","Nordssen","Engelsdottir","Jensen","Karessen","Farseer","Highlander","Half-Troll","Hard-Heart","Blue-Tooth","Deep-Raed","Elf-Hewer","Fine-Hair","Fire-Eye","Flat-Foot","Fork-Beard","Hairy-Breeks","Hard-Mouth","Hearth-Healer","Home-Wrecker","Horse-Mouth","Long-Leg","Red-tooth","Swift-Sailer","Wave-Breaker","Wine-Sot","Halfhand","Tallowhand","Whitebeard","Ice-Mane","Axe-Wife","Bold-Lute","Gray-Wave","Heart-Fang","Long-Tooth","Red-Spear","Snow-Song","Wind-Eye","Wolf-Runner","Hollowleg","Maulhand","Black-Nail","Dark-Heart","Elf-Daughter","Fog-Eye","God-Hater","Hairy-Legs","Hoar-Blood","Oaken-Hull","Red-Tooth","Wind-Shifter","Bear-Arm","Bog-Trotter","Doom-Sayer","Ice-Veins","Bearclaw","Blackthorn","Bloodmouth","Ebonhand","Firebeard","Ironhand","Ironkettle","Ravencrone","Rockbreaker","Stonearm","Stormcloak","Thrallmaster","Trollsbane","Wayfinder","Whitemane","Windcaller","Windrime","Woodcutter","Battle-Born","Gray-Mane","Black-Briar","Snow-Shod","Cruel-Sea","Shatter-Shield","Silver-Blood","One-Eye","Stone-Fist","Wind-Strider","Ice-Blade","Banner-Torn","Black-Skeever","Blood-Fire","Brandy-Mug","Cairn-Breaker","Crag-Jumper","Crag-Strider","Death-Brand","Early-Dawn","Ember-Master","Fair-Shield","Far-Shield","Fire-Tamer","Free-Winter","Frost-Foot","Frost-Sword","Frozen-Heart","Golden-Hilt","Head-Smasher","Honey-Hand","Horse-Crusher","Ice-Fist","Ice-Shaper","Iron-Fur","Iron-Hand","Iron-Shaper","Knot-Beard","Law-Giver","Lonely-Gale","Maiden-Loom","Oath-Giver","Once-Honored","Pure-Spring","Red-Arm","Red-Shoal","Rock-Chucker","Sable-Hilt","Salt-Plank","Salt-Sage","Scar-Face","Secret-Fire","Shield-Hearth","Star-Sung","Stone-Eye","Strong-Arm","Strong-Heart","Strong-Voice","Sun-Killer","Thrice-Pierced","Trout-Purse","Twice-Killed","War-Anvil","War-Bear","Wet-Pommel","Whetted-Blade","Wide-Arm","Wild-Blood","Wolf-Claw","Cold-Eye","Gray-Sky","Cold-Moon","Earth-Turner","Snow-Bourne","Snow-Hair","Frost-Tree","Ice-Heart","Snow-Mane","War-Wolf","Wood-Hewer","Antler-Fur","Axe-Bearer","Bear-Master","Blue-Sky","Deep-Shade","Elf-Speaker","Giant-Slayer","Ice-Storm","Lake-Heart","Soft-Loam","Steel-Fist","Steel-Wind","All-Friend","Axe-Beak","Axe-Head","Bare-Footed","Battle-Weary","Bear-Walker","Bird-Singer","Black-Bear","Black-Kettle","Black-Owl","Blade-Bard","Blood-Drift","Broken-Sword","Broom-Lover","Cat-Slayer","Chill-Owl","Chow-Master","Clod-Kicker","Cold-Raven","Corpse-Caller","Crag-Carver","Crow-Song","Crows-Watch","Cruel-Wind","Dagger-Lost","Dark-Dawn","Dark-Sword","Draugr-Eater","Dull-Axe","Dull-Blade","Fair-Hair","Far-walker","Fire-Belly","Fire-Hearth","Fish-Catcher","Five-Blades","Fleet-Foot","Forge-Fire","Four-Thumbed","Frost-Heart","Frost-Skin","Frozen-Fist","Gap-Tooth","Giants-Bane","Gray-Fists","Gray-Tongs","Green-Hilt","Half-Face","Hatchet-Hand","Honey-Hands","Ice-Born","Ice-Breath","Ice-Eyes","Ice-Gale","Ice-Turner","Ice-Walker","Ice-Wind","Ice-Wolf","Icy-Mane","Ire-Heart","Iron-Kettle","Iron-Shield","Jagged-Peak","Last-Child","Lost-Hammer","Mad-Eye","Mead-Drinker","Mist-Born","Net-Mender","Nine-Toes","No-Shirt","Oath-Breaker","Owl-Watcher","Pine-Frost","Quick-Feet","Rat-Bite","Raven-Eye","Raven-Hair","Raven-Quill","Ravens-Beak","Red-Beard","Red-Boot","Red-Scar","Rock-Breaker","Scar-Hand","Secret-Oath","Silver-Axe","Small-Hammer","Snow-born","Snow-Walker","Snow-Wing","Steady-Hand","Sticky-Fingers","Stone-Stalker","Storm-Blade","Storm-Hammer","Strong-Metal","Strong-Shield","Sun-Hair","Swift-Lift","Tent-Builder","Thick-Wrist","Three-Boots","Thunder-Fury","Too-Bold","Troll-Spit","Twelve-Orcs","Two-Fists","Two-Maces","Two-Shovels","Two-Sleeves","Wealth-Hoarder","White-Eye","Wind-Hill","Winter-Mane","Winter-Run","Winter-Weary","Wolf-Kin","Wolf-Sister","Seven-Swords","Thick-Skull","War-Wind","Titanborn","Wraithbane","Cold-Fist","Three-Fingers","Blackblade‎","Direfrost","Frostfinger","Greycloak","Merkiller","Serpentkin","Stonebeard","Stormcrag","Stormfist","Anvil-Hand","Bear-Skinner","Bone-Skin","Bronze-Helm","Cloud-Seeker","Crossed-Daggers","Early-Beard","Flame-Hair","Grass-Grazer","Ghost-Bear","Green-Hand","Grey-Heart","Hammer-Back","Hand-Free","Hold-None","Horse-Breaker","Ice-Breaker","Ice-Light","Iron-Head","Lute-Voice","Much-Bloodied","Nail-Face","No-Toes","Oaken-Heart","Oaken-Wand","Rock-Fingers","Round-Gut","Sacred-Oath","Shadow-Cloak","Snow-Strider","Stone-Singer","Storm-Breast","Storm-Killer","Thrice-Versed","Two-Hammers","White-Beard","White-Wave","Winter-Fist","Wolf-Child","Wolf-Heart","Worm-Heart","Kaarn","Alber","Eves","Lync","Mochtuis","Selarar","Tee","Veranius","Imperial","Clothgen","Stout","Trothgar","Thundren","Benanius","Faythung","Ulfgar","Axius","Aretino","Felgeif","Piquine","Volunnar","Breton","Dunmer","Alvitr","Begalin","Bjorik","Dryngheid","Einfing","Gisl","Grehrothr","Havilstein","Helmbolg","Kolsgreg","Kyrrund","Mantiarco","Ongar","Sig","Starkad","Ulfgard","Valkor"],"Orc":["Nagorm","Bagdub","Bulfim","Ulfish","Agadbu","Aglakh","Agum","Atumph","Azorku","Badbu","Bagrat","Bagul","Bamog","Bar","Bargamph","Bashnag","Bat","Batul","Boga","Bogamakh","Bogharz","Bogla","Boglar","Bogrol","Boguk","Bol","Bolak","Borbog","Borbul","Bug","Bugarn","Bulag","Bularz","Bulfish","Burbug","Burish","Burol","Buzga","Dugul","Dul","Dula","Dulob","Dumul","Dumulg","Durga","Durog","Durug","Gar","Gashel","Gat","Ghash","Ghasharzol","Gholfim","Gholob","Ghorak","Gilgar","Glorzuf","Gluk","Glurkub","Gorzog","Grambak","Gulfim","Gurakh","Gurub","Kashug","Khagdum","Kharbush","Kharz","Khash","Khashnar","Khatub","Khazor","Lag","Lagdub","Largum","Lazgarn","Loghash","Logob","Logrob","Lorga","Lumbuk","Lumob","Lurkul","Lurn","Luzgan","Magar","Magrish","Mar","Marob","Mashnar","Mogduk","Moghakh","Mughol","Muk","Mulakh","Murgol","Murug","Murz","Muzgob","Muzgub","Muzgur","Ogar","Ogdub","Ogdum","Olor","Olurba","Orbuma","Rimph","Rugob","Rush","Rushub","Shadbuk","Shagdub","Shagdulg","Shagrak","Shagramph","Shak","Sham","Shamub","Sharbag","Sharga","Sharob","Sharolg","Shat","Shatub","Shazog","Shug","Shugarz","Shugham","Shula","Shulor","Shumba","Shuzgub","Skandar","Snagarz","Snagdu","Ufthamph","Uftharz","Ugruma","Ular","Ulfimph","Urgak","Ushar","Ushug","Ushul","Uzgurn","Uzuk","Yagarz","Yak","Yargul","Yarzol","Bled","Trailslag","Baroth","Coblug","Marad","Mogakh","Orum","Shurgak","Agamph","Barak","Barash","Bargol","Bharg","Bolmog","Bonk","Brok","Buglump","Bumph","Bura","Burbog","Cromgog","Dragol","Galash","Gamorn","Gash","Gharz","Ghoth","Glurzog","Golpok","Gonk","Grulam","Hubrag","Khar","Magul","Molob","Morgrump","Murgak","Muzgol","Naybek","Orkul","Orkulg","Othmuk","Rugdush","Shadborgob","Shagk","Shatur","Shura","Ugdub","Urgash","Ushag","Uzgash","Uzug","Yarug","Bagol","Largash","Shugurz","Burzag","Dushnikh","Gatuk","Gortwog","Nolob","Ragdam","Shargakh","Shub","Shurkul","Grush","Murtag","Agluk","Gulash","Ogdula","Urish","Barkbite","Duluk","Dumba","Dunk","Goldog","Graaum","Grumush","Izburg","Khazun","Korlag","Kreeg","Larishak","Lumuf","Mak","Mal","Morkul","Othmurga","Rug","Shara","Shatul","Shugdurbam","Ulat","Yashna","Agdur","Arzug","Badbul","Bagat","Barbol","Bashnarz","Bazgar","Bazul","Bekh","Birgo","Bor","Borgakh","Borgub","Born","Bugurz","Bulfimorn","Bumolg","Burbulg","Burgal","Burku","Burz","Buzbee","Dasik","Drol","Drom","Drublog","Dugronk","Durbug","Durgamph","Durgoth","Fakal","Garbug","Ghammak","Ghol","Ghorn","Ghralog","Goldfolly","Gorzoth","Gular","Gum","Gurba","Guthra","Khamagash","Khambol","Khamug","Khargub","Khazgur","Kogg","Korith","Korma","Kruts","Kush","Ladba","Logdum","Lort","Lumborn","Luruk","Madba","Magrog","Makla","Malak","Malorz","Marguz","Mashul","Mora","Morad","Murgob","Murkha","Namor","Nar","Narzul","Nogremor","Oglurn","Olub","Oluk","Orgak","Orguk","Othmog","Ram","Rimat","Ruguk","Ruumsh","Shagob","Shagronk","Shakar","Shar","Shazgul","Shelakh","Shegub","Sheluk","Sgrugdul","Shugduk","Shugharz","Shuhgharz","Stugbaz","Stugh","Thormok","Thumog","Ugrush","Urku","Urkub","Urula","Usharku","Uzguk","Volkar","Vortag","Wroggin","Yggrub","Dubois","Guillon","Idolus","Phoom"],"Redguard":["Northbridge","K'Elmar","Hawker","Mirel","Ruuz","Stacey","Aldwyr","Blackheart","Blakeley","Christophe","Litte","Rackham","Al-Skaven","Lylvieve","Sendu","Al-Thir","Al-Rihad","at-Hamisham","Huerc","Hunding","Ababneh","af-Ander","aj-Murr","al-Abec","al-Ash'abah","al-Saran","at-Addin","at-Inzil","at-Traeh","Groevinger","Lainlyn","Leki","Melarg","Shinji"],"Wood Elf":["Bluebrook","Bluedale","Bluehollow","Bluelake","Bluepool","Bluerun","Blueshade","Bluesky","Bluethorn","Bluevale","Bluewind","Bluewood","Fernbrook","Ferndale","Fernhollow","Fernlake","Fernpool","Fernrun","Fernshade","Fernsky","Fernthorn","Fernvale","Fernwind","Fernwood","Forestbrook","Forestdale","Foresthollow","Forestlake","Forestpool","Forestrun","Forestshade","Forestsky","Forestthorn","Forestvale","Forestwind","Forestwood","Ivybrook","Ivydale","Ivyhollow","Ivylake","Ivypool","Ivyrun","Ivyshade","Ivysky","Ivythorn","Ivyvale","Ivywind","Ivywood","Mossbrook","Mossdale","Mosshollow","Mosslake","Mosspool","Mossrun","Mossshade","Mosssky","Mossthorn","Mossvale","Mosswind","Mosswood","Nightbrook","Nightdale","Nighthollow","Nightlake","Nightpool","Nightrun","Nightshade","Nightsky","Nightthorn","Nightvale","Nightwind","Nightwood","Oakbrook","Oakdale","Oakhollow","Oaklake","Oakpool","Oakrun","Oakshade","Oaksky","Oakthorn","Oakvale","Oakwind","Oakwood","Pinebrook","Pinedale","Pinehollow","Pinelake","Pinepool","Pinerun","Pineshade","Pinesky","Pinethorn","Pinevale","Pinewind","Pinewood","Riverbrook","Riverdale","Riverhollow","Riverlake","Riverpool","Riverrun","Rivershade","Riversky","Riverthorn","Rivervale","Riverwind","Riverwood","Shadybrook","Shadydale","Shadyhollow","Shadylake","Shadypool","Shadyrun","Shadyshade","Shadysky","Shadythorn","Shadyvale","Shadywind","Shadywood","Springbrook","Springdale","Springhollow","Springlake","Springpool","Springrun","Springshade","Springsky","Springthorn","Springvale","Springwind","Springwood","Willowbrook","Willowdale","Willowhollow","Willowlake","Willowpool","Willowrun","Willowshade","Willowsky","Willowthorn","Willowvale","Willowwind","Willowwood","Greenwood","Dorn'ke","Undriel","Blackthorn","Caerllin","Camoran","Balfix","Benoch","Elmlock","Oreyn"]};
/* --------------------------------------------------------------------------
   RANDOMIZATION HELPERS
   -------------------------------------------------------------------------- */
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function sample(a,n){const out=a.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out.slice(0,n)}
function scoreClass(c,skill,style){if(style==="Unusual")return c.min.includes(skill)?5:c.maj.includes(skill)?2:0;return (c.maj.includes(skill)?5:0)+(c.min.includes(skill)?2:0)}
function classPool(allowNpc=false){return allowNpc?ALL_CLASSES:DATA.classes}
function rankedClasses(skill,style,allowNpc=false){
 const pool=classPool(allowNpc);
 const groups=new Map();
 for(const name of Object.keys(pool)){const score=scoreClass(pool[name],skill,style);if(!groups.has(score))groups.set(score,[]);groups.get(score).push(name)}
 return [...groups.keys()].sort((a,b)=>b-a).flatMap(score=>sample(groups.get(score),groups.get(score).length));
}
function compatibleClasses(skill,style,allowNpc=false){
 const names=rankedClasses(skill,style,allowNpc);
 if(style==="Chaos")return names;
 const limit=allowNpc?RULES.classSelection.npcLimit:RULES.classSelection.playerLimit;
 return names.slice(0,Math.min(limit,names.length));
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
function baseStartingAttributes(b){const base=DATA.races[b.race][b.sex],stats={};ATTRIBUTE_NAMES.forEach((n,i)=>stats[n]=base[i]+(b.c.fav.includes(n)?10:0));stats.Luck=40+(b.c.fav.includes("Luck")?10:0);return stats}
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

function renderGeneratedName(){
 const race=document.getElementById("nameRace").value,sex=document.getElementById("nameSex").value;
 const name=fullNameFor(race,sex);
 document.getElementById("nameResult").innerHTML=`<div class="card"><h2>🪶 Census Record</h2><div class="big">${esc(name)}</div><p class="muted">${esc(race)} • ${esc(sex==="female"?"Female":"Male")}</p></div>`;
}
function initNameGenerator(){
 customSelect("nameRace",RACES);
 document.getElementById("nameRace").value="Breton";
 document.getElementById("nameSex").value="male";
}
function randomizeName(){
 document.getElementById("nameRace").value=pick(RACES);
 document.getElementById("nameSex").value=pick(GENDERS);
 renderGeneratedName();
}

/* --------------------------------------------------------------------------
   BUILD GENERATION
   -------------------------------------------------------------------------- */
function buildStartingStats(b){
 const race=DATA.races[b.race],stats=baseStartingAttributes(b);
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

function makeBuild(style="Coherent",dir="Any",allowNpc=false,racePreference="Any",genderPreference="Any",birthPreference="Any"){
 const pool=dir==="Any"?allSkills:(BUILD_DIRECTIONS[dir]||allSkills);
 const primary=pick(pool);
 let race;
 if(racePreference && racePreference!=="Any") race=racePreference;
 else if(style==="Coherent"||style==="Unusual") {
   const eligible=RACES.filter(r=>DATA.races[r].bonuses[primary]);
   race=pick(eligible.length?eligible:RACES);
 } else race=pick(RACES);
 const classes=compatibleClasses(primary,style,allowNpc),classData=classPool(allowNpc);
 const cls=pick(classes);
 const c=classData[cls];
 const birth=(birthPreference && birthPreference!=="Any")?birthPreference:pick(BIRTHSIGNS);
 const majors=sample(c.maj,5), minors=sample(c.min,5);
 const sex=genderPreference && genderPreference!=="Any" ? genderPreference : pick(GENDERS),name=fullNameFor(race,sex);return prepareBuild({primary,race,cls,birth,c,majors,minors,factions:selectFactions([...majors,...minors],style),sex,name});
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
function buildCard(b,title="Census Record"){
 return `<div class="card"><h2>${esc(title)}</h2><div class="big">${esc(b.name)} · ${esc(genderLabel(b.sex))} · ${esc(b.race)} · ${esc(b.cls)}</div><p><span class="pill">${esc(b.c.spec)}</span><span class="pill">${esc(b.birth)}</span></p>

 <div class="characterStatsGrid">

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

  <div class="characterSummary">

    <h3>Favored Attributes</h3>
    <div class="attributeList">
      ${b.c.fav.map(x=>`
        <div class="attributeItem">${esc(x)}</div>
      `).join("")}
    </div>

    <h3>Specialization</h3>
    <div class="row">
      <b>Build Focus</b>
      <span>${esc(b.c.spec)}</span>
    </div>

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

 <div class="skillColumns">
  <div class="skillColumn">
    <h4>Major Skills</h4>
    ${b.majors.map(x=>`
      <div class="skillItem">
        <span>${esc(x)}</span>
        <span>${b.starting.skills[x]}</span>
      </div>
    `).join("")}
  </div>

  <div class="skillColumn">
    <h4>Minor Skills</h4>
    ${b.minors.map(x=>`
      <div class="skillItem">
        <span>${esc(x)}</span>
        <span>${b.starting.skills[x]}</span>
      </div>
    `).join("")}
  </div>
 </div>

 <div class="row"><b>Faction Matches</b><span>${b.factions.map(esc).join(", ")}</span></div>

 <h3>Starting Spells</h3>${b.spells.length?b.spells.map(sp=>`<div class="row"><b>${sp.name}</b><span>${sp.desc} • ${sp.cost} magicka</span></div>`).join(""):"<p class=\"muted\">None granted</p>"}

 <h3>Racial Traits</h3>${renderTraits(DATA.races[b.race].traits)}

 <h3>Birthsign</h3>${renderBirthsign(b.birth)}

 <p><button type="button" data-action="copy" data-copy="${esc(formatBuild(b))}">Copy Build</button></p></div>`;
}
function formatBuild(b){return `The Census of Morrowind\\nRace: ${b.race}\\nClass: ${b.cls}\\nSpecialization: ${b.c.spec}\\nBirthsign: ${b.birth}\\nFavored Attributes: ${b.c.fav.join(", ")}\\nMajor Skills: ${b.majors.join(", ")}\\nMinor Skills: ${b.minors.join(", ")}\\nPrimary Skill: ${b.primary}\\nFaction Matches: ${b.factions.join(", ")}`}


const CUSTOM_ATTRS=["Strength","Intelligence","Willpower","Agility","Speed","Endurance","Personality","Luck"];
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
 const select=document.getElementById("previewClass"),current=select.value;
 const classes=Object.keys(DATA.classes).concat(previewSource==="npc"?Object.keys(DATA.npcClasses):[]);
 customSelect("previewClass",[...new Set(classes)]);
 const available=[...select.options].map(o=>o.value);
 select.value=available.includes(current)?current:(available.includes("Mage")?"Mage":available[0]);
}
let previewSource="preset";
function setPreviewMode(mode){
 previewSource=["preset","npc","custom"].includes(mode)?mode:"preset";
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
function initClassPreview(){
 document.querySelectorAll("[data-preview-mode]").forEach(btn=>btn.addEventListener("click",()=>setPreviewMode(btn.dataset.previewMode)));
 customSelect("previewRace",RACES);
 customSelect("previewBirth",BIRTHSIGNS);
 customSelect("previewFav1",CUSTOM_ATTRS);customSelect("previewFav2",CUSTOM_ATTRS);
 document.getElementById("previewFav1").value="Strength";document.getElementById("previewFav2").value="Endurance";
 document.getElementById("previewRace").value="Breton";document.getElementById("previewSex").value="male";document.getElementById("previewBirth").value="The Apprentice";
 document.getElementById("previewClass").addEventListener("change",()=>{
   if(previewSource!=="custom"){
     const c=ALL_CLASSES[document.getElementById("previewClass").value]||DATA.classes[document.getElementById("previewClass").value];
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
function keepFavsDistinct(changed,other){const a=document.getElementById(changed),b=document.getElementById(other);if(a.value===b.value)b.value=CUSTOM_ATTRS.find(x=>x!==a.value)||"Endurance";}
function previewCustomObject(){
 const majors=[...document.querySelectorAll("#previewMajors select")].map(x=>x.value);
 const minors=[...document.querySelectorAll("#previewMinors select")].map(x=>x.value);
 return {race:document.getElementById("previewRace").value,sex:document.getElementById("previewSex").value,birth:document.getElementById("previewBirth").value,cls:"Custom Class",className:document.getElementById("previewClassName").value||"Custom Class",c:{spec:document.getElementById("previewSpec").value,maj:majors,min:minors,fav:[document.getElementById("previewFav1").value,document.getElementById("previewFav2").value]},majors,minors,primary:majors[0],factions:bestFactions([...majors,...minors]),name:fullNameFor(document.getElementById("previewRace").value,document.getElementById("previewSex").value)};
}
function classPreviewObject(){
 const race=document.getElementById("previewRace").value,sex=document.getElementById("previewSex").value,birth=document.getElementById("previewBirth").value,cls=document.getElementById("previewClass").value;
 if(previewSource==="custom")return previewCustomObject();
 const c=ALL_CLASSES[cls]||DATA.classes[cls];
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
 document.getElementById("customResult").innerHTML=buildCard({...b,cls:className},"Character Record");
}
function randomizeClassPreview(){
 const custom=previewSource==="custom";
 if(custom){
   document.getElementById("previewSpec").value=pick(["Combat","Magic","Stealth"]);
   const fav=sample(CUSTOM_ATTRS,2);
   document.getElementById("previewFav1").value=fav[0];
   document.getElementById("previewFav2").value=fav[1];
   const chosen=sample(allSkills,10);
   previewSkillSelects(chosen.slice(0,5),chosen.slice(5));
   renderClassPreview();
   return;
 }
 document.getElementById("previewRace").value=pick(RACES);
 document.getElementById("previewSex").value=pick(GENDERS);
 document.getElementById("previewClass").value=pick(Object.keys(previewSource==="npc"?DATA.npcClasses:DATA.classes));
 document.getElementById("previewBirth").value=pick(BIRTHSIGNS);
 const c=ALL_CLASSES[document.getElementById("previewClass").value]||DATA.classes[document.getElementById("previewClass").value];
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
 const race=pick(RACES),sex=pick(GENDERS),birth=pick(BIRTHSIGNS);
 const presetKeys=Object.keys(DATA.classes),npcKeys=Object.keys(DATA.npcClasses),classRoll=Math.random();
 let cls,c,majors,minors;
 if(classRoll<RULES.rngesus.presetClassChance){
  cls=pick(presetKeys);c=DATA.classes[cls];
 }else if(classRoll<RULES.rngesus.presetClassChance+RULES.rngesus.npcClassChance&&npcKeys.length){
  cls=pick(npcKeys);c=DATA.npcClasses[cls];
 }else{
  const spec=pick(["Combat","Magic","Stealth"]),fav=sample(CUSTOM_ATTRS,2),chosen=sample(allSkills,10);
  majors=chosen.slice(0,5);minors=chosen.slice(5);c={spec,maj:majors,min:minors,fav};cls=rngClassName();
 }
 if(!majors)majors=c.maj.slice(0,5),minors=c.min.slice(0,5);
 return prepareBuild({primary:pick([...c.maj,...c.min]),race,cls,birth,c,majors,minors,factions:selectFactions([...c.maj,...c.min],"RNGesus"),sex,name:fullNameFor(race,sex)});
}
function generateRNGesus(){
 const b=makeRNGesus();
 b.name=unrestrictedName(b.sex);
 const fate=pick(FATES);
 const s=storyFor(b,pick(TONES),fate);
 const meta=storyMeta(s);
 document.getElementById("rngResult").innerHTML=`<div class="card rngBannerCard"><div class="rngBanner">🎲 RNGesus has spoken.</div></div>`+buildCard(b,"Character Record")+`<div class="card"><h2>📜 Backstory</h2><div class="big">${s.name}</div><p class="muted">${meta}</p><p>${storyText(s,b).replace(/\n\n/g,"</p><p>")}</p><button type="button" data-action="copy" data-copy="${esc(formatBuild(b)+"\n"+meta+"\n\n"+storyText(s,b))}">Copy Full Record</button></div>`;
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
 if(b){
   const matching=pool.filter(o=>o.skills.some(sk=>b.majors?.includes(sk)||b.minors?.includes(sk)||sk===b.primary));
   if(matching.length) pool=matching;
 }
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
function storyFor(b,tone,fate,genderPreference="Any",birthPreference="Any"){
 const race=b?b.race:pick(RACES);
 const sex=b?b.sex:(genderPreference && genderPreference!=="Any" ? genderPreference : pick(GENDERS));
 const name=b?.name||fullNameFor(race,sex);
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
 const skill=b&&b.primary?b.primary:pick(occupation.skills.length?occupation.skills:allSkills);
 const faction=b?pick(b.factions):pick(Object.keys(DATA.factions));
 const birth=b?b.birth:(birthPreference && birthPreference!=="Any" ? birthPreference : pick(BIRTHSIGNS));
 const age=RULES.backstory.minAge+Math.floor(Math.random()*RULES.backstory.ageSpan);
 const birthday=birthDetails(birth);
 const fateText=pick(DATA.backstory.fate[fate||"Open-ended"]||[]);
 const toneHook=pick(DATA.backstory.toneHooks[tone]||[]);
 const wildcardChance=RULES.backstory.wildcardChance[tone]??RULES.backstory.wildcardChance.Default;
 const wildCard=Math.random()<wildcardChance?pick(DATA.backstory.wildCards):"";
 return {race,sex,name,homeland,occupation,family,mentor,event,crime,detail,arrest,attitude,prison,change,relationship,future,skill,faction,birth,birthday,age,fateText,toneHook,wildCard,tone};
}
function storyMeta(s){return `Name: ${s.name} • Race: ${s.race} • Gender: ${genderLabel(s.sex)} • Age: ${s.age} • Birthday: ${s.birthday.label} • Birthsign: ${s.birth}`}
function storyText(s,b){
 const skillLine=b?.primary?`You developed a particular knack for ${b.primary}, while your work gave you practical reasons to keep improving.`:`You developed a practical knack for ${s.skill} through the work you did.`;
 const styleLine=s.toneHook?`${s.toneHook}`:"";
 const futureLine=s.future.mode==="simple"?`Your main concern became simple: ${s.future.text}.`:`You hoped to eventually ${s.future.text}.`;
 const fateLine=s.fateText?` ${s.fateText}`:"";
 return `${s.homeland.text} ${s.family}

${styleLine} You worked as ${(/^[aeiou]/i.test(s.occupation.name)?"an ":"a ")+s.occupation.name}, learning much of what you know from ${s.mentor}. ${s.event} ${skillLine}

Trouble came when you were charged with ${s.crime.charge||s.crime.name.toLowerCase()}. ${s.detail} ${s.arrest} ${s.attitude}

Your sentence became an unwanted chapter of your life. ${s.prison} ${s.change} ${s.relationship} ${futureLine}

${s.wildCard?`${s.wildCard}`:""}${fateLine}

Eventually, you were taken from prison and placed aboard an Imperial transport bound for Vvardenfell.`;
}
function generateStory(){
 const racePref=document.getElementById("storyRace").value;
 const fate=document.getElementById("storyFate").value;
 const genderPref=document.getElementById("storyGender").value;
 const birthPref=document.getElementById("storyBirth").value;
 let fake=null;
 if(racePref!=="Any"||genderPref!=="Any"||birthPref!=="Any") fake={race:racePref!=="Any"?racePref:pick(RACES),primary:null,majors:[],minors:[],cls:pick(Object.keys(DATA.classes)),birth:birthPref!=="Any"?birthPref:pick(BIRTHSIGNS),factions:[pick(Object.keys(DATA.factions))],sex:genderPref!=="Any"?genderPref:pick(GENDERS)};
 const s=storyFor(fake,document.getElementById("storyStyle").value,fate,genderPref,birthPref);
 const text=storyText(s,fake);
 const meta=`Name: ${s.name} • Race: ${s.race} • Gender: ${genderLabel(s.sex)} • Age: ${s.age} • Birthday: ${s.birthday.label} • Birthsign: ${s.birth} • Tone: ${document.getElementById("storyStyle").value} • Fate: ${fate}`;
 document.getElementById("storyResult").innerHTML=`<div class="card"><h2>📜 Census Record</h2><div class="big">${s.name}</div><p class="muted"><b>Race:</b> ${esc(s.race)} • <b>Gender:</b> ${esc(genderLabel(s.sex))} • <b>Birthsign:</b> ${esc(s.birth)}</p><p class="muted"><b>Age:</b> ${s.age} • <b>Birthday:</b> ${esc(s.birthday.label)}</p><p class="muted"><b>Tone:</b> ${esc(s.tone)} • <b>Fate:</b> ${esc(fate)}</p><p>${text.replace(/\n\n/g,"</p><p>")}</p><button type="button" data-action="copy" data-copy="${esc(meta+"\n\n"+text)}">Copy Story</button></div>`;
}

function generateBoth(){
 const buildStyle=document.getElementById("bothBuildStyle").value;
 const dir=document.getElementById("bothBuildDir").value;
 const tone=document.getElementById("bothTone").value;
 const fate=document.getElementById("bothFate").value;
 const allowNpc=document.getElementById("bothAllowNpcClasses")?.checked||false;
 const racePref=document.getElementById("bothRace").value;
 const genderPref=document.getElementById("bothGender").value;
 const birthPref=document.getElementById("bothBirth").value;
 const b=makeBuild(buildStyle,dir,allowNpc,racePref,genderPref,birthPref);
 const s=storyFor(b,tone,fate);
 const meta=storyMeta(s);
 const text=storyText(s,b);
 document.getElementById("bothResult").innerHTML=buildCard(b,"Character Record")+`<div class="card"><h2>📜 Backstory</h2><div class="big">${esc(s.name)}</div><p class="muted">${esc(meta)}</p><p>${text.replace(/\n\n/g,"</p><p>")}</p><button type="button" data-action="copy" data-copy="${esc(formatBuild(b)+"\n"+meta+"\n\n"+text)}">Copy Full Record</button></div>`;
}

function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function refSection(title,body,open=false,level=1,id=""){
 const cls=level===1?'refGroup':'refSubGroup';
 return `<details class="${cls}"${id?` id="${esc(id)}"`:''} ${open?'open':''}><summary>${title}</summary><div class="refBody">${body}</div></details>`;
}
function refList(items){return `<ul class="refList">${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;}
function refRows(rows){return rows.map(([label,value])=>`<div class="row"><b>${esc(label)}</b><span>${value}</span></div>`).join("");}
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
    checkOrder("Tones",DATA.backstory.toneHooks,ORDER.tones),
    checkOrder("Fates",DATA.backstory.fate,ORDER.fates),
    checkList("Build directions",["Any",...Object.keys(BUILD_DIRECTIONS)],ORDER.buildDirections),
    checkList("Build styles",BUILD_STYLES,ORDER.buildStyles)
  ];
  const passed=checks.filter(Boolean).length;
  const total=checks.length;
  if(passed===total) console.info(`Census consistency: all ${total} canonical-order checks passed.`);
  else console.warn(`Census consistency: ${passed}/${total} canonical-order checks passed.`);
}
function renderReference(){
 const bs=DATA.backstory;
 const givenNameCount=Object.values(DATA.names).reduce((n,x)=>n+(x.male?.length||0)+(x.female?.length||0),0);
 const backstoryCount=Object.entries(bs).reduce((n,[k,x])=>n+(Array.isArray(x)?x.length:Object.values(x).reduce((a,v)=>a+(Array.isArray(v)?v.length:1),0)),0);

 let h=`<div class="notice refNotice">This page is the Census's reference desk: one place to inspect the data, mappings, rules, and source components used by the generators. Mechanical values are intended to reproduce vanilla The Elder Scrolls III: Morrowind. Open the section you need. Nested sections stay collapsed so large pools do not turn the page into a wall of text.</div>`;

 h+=refSection(`🧮 Game Mechanics`,
    refSection(`Attributes & Skills (${DATA.skills.length})`,`<div class="refItem"><p class="muted">Each of Morrowind's ${DATA.skills.length} skills is governed by one primary attribute. Luck is the exception and governs no skills.</p></div>`+Object.entries({...ATTR,Luck:[]}).map(([a,skills])=>`<div class="row"><b>${esc(a)}</b><span>${skills.length?skills.map(esc).join(" · "):"None"}</span></div>`).join(""),false,2)+
    refSection("Starting attributes",`<div class="refItem"><p>Start with the race's sex-specific base attributes. Add 10 to each favored attribute, including Luck when Luck is favored. Then apply birthsign attribute bonuses.</p></div>`,false,2)+
    refSection("Starting skills",`<div class="refItem"><p>Skills start at ${RULES.startingSkills.base}. Add ${RULES.startingSkills.specialization} for specialization, ${RULES.startingSkills.major} for a major skill or ${RULES.startingSkills.minor} for a minor skill, then add the race's racial skill bonus.</p></div>`,false,2)+
    refSection("Derived stats",`<div class="refItem">${refRows([["Health","Floor((Strength + Endurance) / 2)"],["Fatigue","Strength + Willpower + Agility + Endurance"],["Maximum Magicka","Floor(Intelligence × (1 + racial modifier + birthsign modifier))"]])}</div>`,false,2)+
    refSection("Maximum Magicka modifiers",`<div class="refItem"><p>These values are additions to the base Magicka multiplier of 1.0. Maximum Magicka is calculated as Intelligence × (1 + racial modifier + birthsign modifier).</p>${refRows([["Races","Breton +0.5; High Elf +1.5"],["Birthsigns","Apprentice +1.5; Mage +0.5; Atronach +2.0"]])}</div>`,false,2),false,1,"ref-core");

h+=refSection(`🧬 Races (${Object.keys(DATA.races).length})`,
   orderedRaceEntries(DATA.races).map(([name,d])=>{
     const trait=d.traits;
     return refSection(esc(name),
       `<div class="refItem"><h4>Base attributes</h4>${refRows(ATTRIBUTE_NAMES.map((attr,i)=>[attr,`Male ${d.male[i]} · Female ${d.female[i]}`]).concat([["Luck","Male 40 · Female 40"]]))}</div>`+
       `<div class="refItem"><h4>Racial traits</h4>${renderTraits(trait)}</div>`,false,2);
   }).join(""),false,1,"ref-races");

 h+=refSection(`✨ Birthsigns (${Object.keys(DATA.birthsigns).length})`,
   Object.entries(DATA.birthsigns).map(([name,d])=>refSection(esc(name),
     `<div class="refItem">${d.description?`<p class="muted">${esc(d.description)}</p>`:""}${renderTraits(d.traits)}</div>`,false,2)).join("")+
   refSection("Birthday mapping",Object.entries(DATA.birthsigns).map(([name,d])=>{
     if(d.month)return `<div class="row"><b>${esc(name)}</b><span>${esc(d.month)} • ${DATA.calendar.monthDays[d.month]} days</span></div>`;
     return `<div class="row"><b>${esc(name)}</b><span>Wandering sign • no fixed birth month</span></div>`;
   }).join("")+`<p class="muted">The Census uses TES3 month lengths. Morning Star is the historical Ritual association, but Morrowind's in-game calendar omits Morning Star, so Ritual uses a 30-day fallback. The Serpent has no fixed month, so its birthday uses a random valid calendar month and day. Current age range: ${RULES.backstory.minAge}–${RULES.backstory.minAge+RULES.backstory.ageSpan-1}.</p>`,false,2),false,1,"ref-birthsigns");

 h+=refSection(`⚔️ Classes (${Object.keys(DATA.classes).length + Object.keys(DATA.npcClasses).length} total)`,
   refSection(`Player classes (${Object.keys(DATA.classes).length})`,Object.entries(DATA.classes).map(([name,d])=>refSection(esc(name),
     `<div class="refItem">${refRows([
       ["Specialization",esc(d.spec)],
       ["Major skills",d.maj.map(esc).join(", ")],
       ["Minor skills",d.min.map(esc).join(", ")],
       ["Favored attributes",d.fav.map(esc).join(", ")]
     ])}</div>`,false,2)).join(""),false,2)+
   refSection(`NPC classes (${Object.keys(DATA.npcClasses).length})`,Object.entries(DATA.npcClasses).map(([name,d])=>refSection(esc(name),
     `<div class="refItem">${refRows([
       ["Specialization",esc(d.spec)],
       ["Major skills",d.maj.map(esc).join(", ")],
       ["Minor skills",d.min.map(esc).join(", ")],
       ["Favored attributes",d.fav.map(esc).join(", ")]
     ])}</div>`,false,2)).join(""),false,2)+
   refSection(`RNGesus custom class names (${DATA.rngClassNames.length})`,`<div class="refItem"><p class="muted">Reserved for RNGesus custom-class rolls. The name is flavor only; specialization, favored attributes, and the ten skills are rolled separately.</p><div class="pillRow">${DATA.rngClassNames.map(x=>`<span class="pill">${esc(x)}</span>`).join("")}</div></div>`,false,2),false,1,"ref-classes");

 h+=refSection(`✨ Starting spells (${DATA.starterSpells.length})`,DATA.starterSpells.map(sp=>refSection(esc(sp.name),
   `<div class="refItem">${refRows([
     ["Skill",esc(sp.skill)],
     ["Cost",`${esc(sp.cost)} magicka`],
     ["Status",sp.unobtainable?"Unobtainable during normal character creation":"Eligible for normal character-creation auto-grant when requirements are met"],
     ["Effect",esc(sp.desc)]
   ])}</div>`,false,2)).join(""),false,1,"ref-spells");

 h+=refSection(`🏛️ Faction affinities (${Object.keys(DATA.factions).length})`,Object.entries(DATA.factions).map(([name,skills])=>refSection(esc(name),
   `<div class="refItem"><h4>Favored skills</h4><div class="pillRow">${skills.map(sk=>`<span class="pill">${esc(sk)}</span>`).join("")}</div></div>`,false,2)).join(""),false,1,"ref-factions");

 h+=refSection(`🪶 Names`,
   refSection(`Given names (${givenNameCount})`,orderedRaceEntries(DATA.names).map(([race,d])=>refSection(esc(race),
     `${d.male?`<div class="refItem"><h4>Male</h4><div class="nameCloud">${d.male.map(x=>`<span>${esc(x)}</span>`).join("")}</div></div>`:""}${d.female?`<div class="refItem"><h4>Female</h4><div class="nameCloud">${d.female.map(x=>`<span>${esc(x)}</span>`).join("")}</div></div>`:""}`,false,2)).join(""),false,2)+
   refSection("Family names / name endings",orderedRaceEntries(DATA.nameFamilies).filter(([r,p])=>p.length).map(([race,pool])=>refSection(esc(race),`<div class="nameCloud">${pool.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`,false,2)).join("")+`<p class="muted">The name corpus is built from the supplied UESP Lore name pages across their documented Elder Scrolls games and source sections. Family-name pools preserve documented historical forms, while titles and bynames remain distinct from ordinary surnames.</p>`,false,2)+
   refSection("High Elf titles / bynames",`<div class="nameCloud">${HIGH_ELF_TITLES.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`,false,2)+
   refSection("Naming conventions",`<div class="refItem"><p>Dark Elf, Imperial, and Breton use family names; High Elf, Nord, Redguard, and Wood Elf may use documented family names or bynames; Argonian and Khajiit have historical surname material but normally use single names in the later naming tradition; Orcs use gendered gra-/gro- clan construction, with documented exceptions.</p><p>RNGesus deliberately ignores ordinary race and gender naming conventions. It can choose a documented given name from any race or gender, then independently add a documented family name or title from any race.</p></div>`,false,2),false,1,"ref-names");

 h+=refSection(`📜 Backstory Components (${backstoryCount} stored entries)`,
   `<div class="notice refNotice">Backstories are assembled from independent chunks. This section exposes the stored pieces rather than the final prose generated from them.</div>`+
   refSection(`Homelands (${bs.homelands.length})`,`<div class="notice refNotice">Homelands are organized by race. Universal options remain available to keep the generator from becoming completely deterministic.</div>`+refSection(`Universal (${bs.homelands.filter(x=>x.race==="Any").length})`,refList(bs.homelands.filter(x=>x.race==="Any").map(x=>`${x.place}: ${x.text}`)),false,2)+Object.entries(RACES.reduce((o,r)=>{o[r]=bs.homelands.filter(x=>x.race===r);return o},{})).map(([race,items])=>refSection(`${esc(race)} (${items.length})`,refList(items.map(x=>`${x.place}: ${x.text}`)),false,2)).join(""),false,2)+
   refSection(`Family / upbringing (${bs.family.length + Object.values(bs.familyByRace||{}).flat().length} total)`,
      `<div class="notice refNotice">Most upbringing entries are universal, with additional race-specific options shown below.</div>`+
      refSection(`Universal (${bs.family.length})`,refList(bs.family),false,2)+
      RACES.filter(r=>bs.familyByRace?.[r]).map(r=>[r,bs.familyByRace[r]]).map(([race,items])=>refSection(`${esc(race)} (${items.length})`,refList(items),false,2)).join(""),false,2)+
   refSection(`Occupations (${bs.occupations.length})`,bs.occupations.map(x=>`<div class="refItem"><h4>${esc(x.name)}</h4>${refRows([["Skills",x.skills.map(esc).join(", ")],["Crime tags",x.crimeTags.map(esc).join(", ")]])}</div>`).join(""),false,2)+
   refSection(`Mentors (${bs.mentors.length})`,refList(bs.mentors),false,2)+
   refSection(`Defining events (${bs.definingEvents.length})`,refList(bs.definingEvents),false,2)+
   refSection(`Crimes (${bs.crimes.length})`,bs.crimes.map(x=>`<div class="refItem"><h4>${esc(x.name)}</h4>${refRows([["Charge wording",esc(x.charge)],["Details",x.details.map(esc).join(" • ")],["Tags",x.tags.map(esc).join(", ")]])}</div>`).join(""),false,2)+
   refSection(`Arrest methods (${bs.arrestMethods.length})`,refList(bs.arrestMethods),false,2)+
   refSection(`Arrest attitudes (${bs.arrestAttitudes.length})`,refList(bs.arrestAttitudes),false,2)+
   refSection(`Prison experiences (${bs.prisonExperiences.length})`,refList(bs.prisonExperiences),false,2)+
   refSection(`Prison changes (${bs.prisonChanges.length})`,refList(bs.prisonChanges),false,2)+
   refSection(`Relationships (${bs.relationships.length})`,refList(bs.relationships),false,2)+
   refSection(`Future intentions (${bs.futureIntentions.length})`,bs.futureIntentions.map(x=>`<div class="row"><b>${esc(x.mode)}</b><span>${esc(x.text)}</span></div>`).join(""),false,2)+
   refSection(`Wild cards (${bs.wildCards.length})`,refList(bs.wildCards),false,2)+
   refSection(`Tone hooks (${Object.keys(bs.toneHooks).length})`,Object.entries(bs.toneHooks).map(([name,items])=>refSection(`${esc(name)} (${items.length})`,refList(items),false,2)).join(""),false,2)+
   refSection(`Fate attitudes (${Object.keys(bs.fate).length})`,Object.entries(bs.fate).map(([name,items])=>refSection(`${esc(name)} (${items.length})`,items.length?refList(items):`<p class="muted">No extra prose.</p>`,false,2)).join(""),false,2),false,1,"ref-backstory");

 h+=refSection(`⚙️ Generation & Selection Rules`,
    refSection("Specialization skill groups",Object.entries(SPEC_SKILLS).map(([name,skills])=>`<div class="refItem"><h4>${esc(name)}</h4><div class="pillRow">${skills.map(sk=>`<span class="pill">${esc(sk)}</span>`).join("")}</div></div>`).join(""),false,2)+
    refSection("Starting spell auto-grant",`<div class="refItem"><p>During character creation, a stored PC-start spell is eligible when its governing skill is a major or minor skill and <b>2 × skill + Willpower / 5 + Luck / 10</b> meets or exceeds the spell's listed threshold. Three PC-start spells are flagged by UESP as impossible to receive during normal character creation: Exhausting Touch, Tap Energy, and Feet of Notorgo.</p></div>`,false,2)+
    refSection("Build styles",`<div class="refItem">${refRows([["Coherent","Primary skill influences race selection and compatible class selection; birthsign is independently randomized unless a preference is selected."],["Random","Race and birthsign are random; class is still drawn from the top compatible class pool for the primary skill."],["Unusual","Prefers classes that place the primary skill in a minor slot, then major slot, while still allowing unrelated classes at the bottom of the ranking."],["Chaos","Class selection ignores the normal top-four restriction and can draw from the full enabled class pool."]])}</div>`,false,2)+
    refSection("Build directions",`<div class="refItem">${refRows(Object.entries({Any:allSkills,...BUILD_DIRECTIONS}).map(([name,skills])=>[name,skills.join(", ")]))}</div>`,false,2)+
    refSection("Backstory rules",`<div class="refItem">${refRows([["Age","18–45 inclusive."],["Wildcard chance","Comedic ${RULES.backstory.wildcardChance.Comedic*100}%; Adventurous ${RULES.backstory.wildcardChance.Adventurous*100}%; all other tones ${RULES.backstory.wildcardChance.Default*100}%."],["Birthday","Fixed birthsigns use their associated TES3 month length. Morning Star uses a 30-day fallback; the Serpent has no fixed month and receives a random valid calendar month and day."]])}</div>`,false,2),false,1,"ref-rules");
document.getElementById("refContent").innerHTML=h;
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
let referenceRendered=false;
function show(id){
  document.querySelectorAll(".mode").forEach(x=>x.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.mode===id));
  if(id==="reference"&&!referenceRendered){
    renderReference();
    referenceRendered=true;
  }
  window.scrollTo({top:0,behavior:"smooth"});
}
for(const r of RACES){document.getElementById("storyRace").insertAdjacentHTML("beforeend",`<option value="${esc(r)}">${esc(r)}</option>`)}
for(const sign of BIRTHSIGNS){document.getElementById("storyBirth").insertAdjacentHTML("beforeend",`<option value="${esc(sign)}">${esc(sign)}</option>`)}
for(const r of RACES){document.getElementById("bothRace").insertAdjacentHTML("beforeend",`<option value="${esc(r)}">${esc(r)}</option>`)}
for(const sign of BIRTHSIGNS){document.getElementById("bothBirth").insertAdjacentHTML("beforeend",`<option value="${esc(sign)}">${esc(sign)}</option>`)}

/*document.getElementById("appVersion").textContent=APP_VERSION;*/
document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>show(tab.dataset.mode)));
document.addEventListener("click",event=>{
  const button=event.target.closest("[data-action]");
  if(!button)return;
  const action=button.dataset.action;
  if(action==="show")show(button.dataset.target);
  else if(action==="randomize-preview")randomizeClassPreview();
  else if(action==="generate-rng")generateRNGesus();
  else if(action==="generate-story")generateStory();
  else if(action==="generate-both")generateBoth();
  else if(action==="randomize-name")randomizeName();
  else if(action==="generate-name")renderGeneratedName();
  else if(action==="copy")copyText(button.dataset.copy||"");
});

initClassPreview();
initNameGenerator();
customSelect("storyStyle",TONES);
customSelect("storyFate",FATES);
customSelect("bothBuildStyle",BUILD_STYLES);
customSelect("bothBuildDir",ORDER.buildDirections);
customSelect("bothTone",TONES);
customSelect("bothFate",FATES);
 runConsistencyChecks();

})();
