/*  nutricion.js — Motor compartido de dietas
    Base de datos nutricional + cálculos + generador de planes.
    Carga ANTES de mediterraneo.js, paleo.js, vegano.js.            */

/* ================================================================
   1. BASE DE DATOS NUTRICIONAL  (kcal, proteína, carbohidratos,
      grasa por 100 g).   Todos los valores en CRUDO salvo
      indicación contraria.                                         */
const NUT_DB={
/* ---------- CEREALES / CARBOHIDRATOS ---------- */
'arroz blanco':{k:130,p:2.7,c:28,g:0.3,raw:true},
'arroz integral':{k:112,p:2.6,c:24,g:0.9,raw:true},
'arroz jazmín':{k:130,p:2.7,c:28,g:0.3,raw:true},
'arroz basmati':{k:130,p:2.7,c:28,g:0.3,raw:true},
'arroz salvaje':{k:109,p:3.7,c:22,g:0.4,raw:true},
'pasta integral':{k:124,p:5,c:25,g:1.1,raw:true},
'pasta':{k:131,p:5,c:25,g:1.1,raw:true},
'pasta de espelta':{k:124,p:5.2,c:24.5,g:1.1,raw:true},
'avena':{k:379,p:13.5,c:67,g:7,raw:true},
'copos de avena':{k:379,p:13.5,c:67,g:7,raw:true},
'quinoa':{k:120,p:4.4,c:21,g:1.9,raw:true},
'cuscús':{k:112,p:3.8,c:23,g:0.2,raw:true},
'pan integral':{k:247,p:10,c:43,g:3.5},
'pan de centeno':{k:259,p:8.5,c:48,g:3.3},
'pan de pita':{k:275,p:9,c:53,g:1.5},
'pan de almendra':{k:260,p:8,c:20,g:17},
'tostadas integrales':{k:250,p:10,c:43,g:3.5},
'harina de avena':{k:389,p:14,c:66,g:7.4,raw:true},
'harina de trigo':{k:340,p:10,c:72,g:1.5,raw:true},
'harina de almendra':{k:388,p:21,c:22,g:30},
'pancakes de avena':{k:250,p:10,c:35,g:7},
'granola':{k:471,p:12,c:64,g:20},
'avena paleo (almendra)':{k:340,p:12,c:28,g:20},

/* ---------- PROTEÍNAS ANIMALES ---------- */
'pechuga de pollo':{k:165,p:31,c:0,g:3.6},
'pollo':{k:165,p:31,c:0,g:3.6},
'pollo al horno':{k:190,p:27,c:0,g:8},
'pollo a la plancha':{k:165,p:31,c:0,g:3.6},
'muslo de pollo':{k:209,p:26,c:0,g:10.9},
'ternera':{k:250,p:26,c:0,g:15},
'bistec':{k:271,p:26,c:0,g:18},
'filete de ternera':{k:250,p:26,c:0,g:15},
'carne picada':{k:254,p:17,c:0,g:20},
'chuleta':{k:260,p:25,c:0,g:17},
'solomillo de cerdo':{k:143,p:26,c:0,g:3.5},
'lomo de cerdo':{k:143,p:26,c:0,g:3.5},
'cerdo':{k:242,p:27,c:0,g:14},
'pavo':{k:135,p:30,c:0,g:1},
'jamón serrano':{k:145,p:21,c:1,g:6},
'chorizo':{k:455,p:24,c:2,g:38},
'salchicha':{k:277,p:12,c:2,g:25},
'fiambre':{k:150,p:16,c:3,g:8},
'tofu':{k:76,p:8,c:1.9,g:4.8},
'tofu firme':{k:144,p:17,c:3,g:8},
'tempeh':{k:192,p:20,c:7.6,g:11},
'seitán':{k:370,p:75,c:14,g:2},
'edamame':{k:121,p:12,c:9,g:5},
'huevos':{k:155,p:13,c:1.1,g:11},
'claras de huevo':{k:52,p:11,c:0.7,g:0.2},

/* ---------- PESCADOS / MARISCOS ---------- */
'salmón':{k:208,p:20,c:0,g:13},
'salmón a la plancha':{k:180,p:25,c:0,g:8},
'merluza':{k:82,p:18,c:0,g:0.7},
'merluza al horno':{k:90,p:17,c:0,g:1.5},
'lubina':{k:97,p:18,c:0,g:1.5},
'atún':{k:144,p:23,c:0,g:5},
'atún a la plancha':{k:130,p:28,c:0,g:1},
'caballa':{k:205,p:19,c:0,g:14},
'sardinas':{k:208,p:25,c:0,g:12},
'calamares':{k:92,p:18,c:3,g:1.5},
'gambas':{k:99,p:24,c:0.2,g:0.3},
'bacalao':{k:82,p:18,c:0,g:0.7},
'bacalao al pil-pil':{k:150,p:18,c:0,g:8},
'corvina':{k:90,p:19,c:0,g:1},
'verduras marinadas':{k:80,p:4,c:10,g:2},

/* ---------- LACTEOS ---------- */
'yogur griego':{k:97,p:9,c:3.6,g:5},
'yogur natural':{k:61,p:3.5,c:4.7,g:3.3},
'queso feta':{k:264,p:16,c:4,g:21},
'queso fresco':{k:264,p:12,c:3,g:22},
'queso parmesano':{k:431,p:38,c:4,g:29},
'leche':{k:42,p:3.4,c:5,g:1},
'leche de coco':{k:197,p:2.1,c:2.8,g:21},
'leche de almendra':{k:13,p:0.4,c:0.3,g:1.1},
'leche de avena':{k:40,p:1,c:6.6,g:1.4},
'crema de leche':{k:340,p:2,c:3,g:37},
'mantequilla':{k:717,p:0.9,c:0.1,g:81},
'mantequilla de almendra':{k:614,p:21,c:19,g:56},
'mantequilla de cacahuete':{k:588,p:25,c:20,g:50},
'crema de cacahuete':{k:588,p:25,c:20,g:50},
'natas':{k:340,p:2,c:3,g:37},

/* ---------- LEGUMBRES ---------- */
'garbanzos':{k:164,p:8.9,c:27,g:2.6,raw:true},
'lentejas':{k:116,p:9,c:20,g:0.4,raw:true},
'lentejas rojas':{k:112,p:9,c:20,g:0.4,raw:true},
'alubias blancas':{k:114,p:7.6,c:21,g:0.5,raw:true},
'alubias negras':{k:132,p:8.9,c:24,g:0.5,raw:true},
'hummus':{k:166,p:7.9,c:14,g:9.6},
'falafel':{k:333,p:13,c:32,g:18},
'tahini':{k:570,p:17,c:21,g:54},
'proteina de guisante':{k:340,p:80,c:2,g:2},

/* ---------- FRUTAS ---------- */
'plátano':{k:89,p:1.1,c:23,g:0.3},
'manzana':{k:52,p:0.3,c:14,g:0.2},
'naranja':{k:47,p:0.9,c:12,g:0.1},
'fresas':{k:32,p:0.7,c:7.7,g:0.3},
'arándanos':{k:57,p:0.7,c:14,g:0.3},
'frutos rojos':{k:50,p:0.7,c:12,g:0.3},
'mango':{k:60,p:0.8,c:15,g:0.4},
'piña':{k:50,p:0.5,c:13,g:0.1},
'pera':{k:57,p:0.4,c:15,g:0.1},
'uvas':{k:69,p:0.7,c:18,g:0.2},
'cerezas':{k:50,p:1,c:12,g:0.3},
'kiwi':{k:61,p:1.1,c:15,g:0.5},
'limón':{k:29,p:1.1,c:9,g:0.3},
'aguacate':{k:160,p:2,c:8.5,g:15},
'dátiles':{k:277,p:1.8,c:75,g:0.2},
'pasas':{k:299,p:3.1,c:78,g:0.5},
'plátano congelado':{k:89,p:1.1,c:23,g:0.3},
'açaí':{k:70,p:1,c:6,g:5},

/* ---------- VERDURAS / HORTALIZAS ---------- */
'brócoli':{k:34,p:2.8,c:7,g:0.4},
'brócoli al vapor':{k:35,p:2.4,c:5,g:0.6},
'espinaca':{k:23,p:2.9,c:3.6,g:0.4},
'espinaca baby':{k:23,p:2.9,c:3.6,g:0.4},
'calabacín':{k:17,p:1.2,c:3.1,g:0.3},
'calabacín salteado':{k:20,p:1.5,c:2.5,g:0.5},
'pimiento verde':{k:20,p:0.9,c:4.4,g:0.2},
'pimiento rojo':{k:31,p:1,c:6,g:0.3},
'pimiento amarillo':{k:27,p:1,c:5.6,g:0.2},
'tomate':{k:18,p:0.9,c:3.9,g:0.2},
'tomate natural':{k:18,p:0.9,c:3.9,g:0.2},
'tomate cherry':{k:18,p:0.9,c:3.9,g:0.2},
'cebolla':{k:40,p:1.1,c:9.3,g:0.1},
'cebolla morada':{k:40,p:1.1,c:9.3,g:0.1},
'ajo':{k:149,p:6.4,c:33,g:0.5},
'champiñones':{k:22,p:3.1,c:3.3,g:0.3},
'champiñones salteados':{k:25,p:3,c:3.5,g:0.8},
'patata':{k:77,p:2,c:17,g:0.1},
'patata asada':{k:93,p:2.5,c:21,g:0.1},
'boniato':{k:86,p:1.6,c:20,g:0.1},
'boniato asado':{k:90,p:2,c:21,g:0.1},
'boniato hervido':{k:76,p:1.6,c:18,g:0.1},
'calabaza':{k:26,p:1,c:6.5,g:0.1},
'calabaza asada':{k:30,p:1,c:7,g:0.1},
'coliflor':{k:25,p:1.9,c:5,g:0.3},
'coles de bruselas':{k:43,p:3.4,c:9,g:0.3},
'espárragos':{k:20,p:2.2,c:3.9,g:0.1},
'espárragos a la plancha':{k:22,p:2.5,c:3,g:0.2},
'puerro':{k:31,p:1.5,c:7,g:0.3},
'apio':{k:16,p:0.7,c:3,g:0.2},
'zanahoria':{k:41,p:0.9,c:10,g:0.2},
'berenjena':{k:25,p:1,c:6,g:0.2},
'remolacha':{k:43,p:1.6,c:10,g:0.2},
'kale':{k:49,p:4.3,c:9,g:0.9},
'rúcula':{k:25,p:2.6,c:3.7,g:0.7},
'lechuga':{k:15,p:1.4,c:2.9,g:0.2},
'pepino':{k:15,p:0.7,c:3.6,g:0.1},
'tofu de agua':{k:14,p:1.5,c:0.8,g:0.8},
'verduras salteadas':{k:35,p:2,c:5,g:0.8},
'verduras asadas':{k:45,p:2,c:6,g:1.5},
'verduras al vapor':{k:25,p:1.5,c:4,g:0.2},
'en mixta':{k:20,p:1.5,c:3,g:0.3},
'ensalada verde':{k:17,p:1.5,c:3,g:0.2},
'ensalada griega':{k:65,p:3,c:5,g:4},

/* ---------- FRUTOS SECOS / SEMILLAS ---------- */
'nueces':{k:654,p:15,c:14,g:65},
'nueces mixtas':{k:600,p:18,c:18,g:52},
'nueces de Brasil':{k:659,p:14,c:12,g:67},
'nueces de la India':{k:553,p:18,c:30,g:44},
'almendras':{k:579,p:21,c:22,g:49},
'avellanas':{k:628,p:15,c:17,g:61},
'piñones':{k:673,p:14,c:13,g:68},
'pipas de girasol':{k:584,p:21,c:20,g:51},
'pipas de calabaza':{k:559,p:30,c:11,g:49},
'chía':{k:486,p:17,c:42,g:31},
'linaza':{k:534,p:18,c:29,g:42},
'sésamo':{k:573,p:18,c:23,g:50},
'frutos secos y semillas':{k:580,p:20,c:18,g:50},

/* ---------- ACEITES / GRASAS ---------- */
'aceite de oliva virgen extra':{k:884,p:0,c:0,g:100},
'aceite de oliva':{k:884,p:0,c:0,g:100},
'aceite de coco':{k:862,p:0,c:0,g:100},
'aceite de aguacate':{k:884,p:0,c:0,g:100},
'AOVE':{k:884,p:0,c:0,g:100},
'aguacate':{k:160,p:2,c:8.5,g:15},

/* ---------- PRODUCTOS VEGETALES ESPECIALES ---------- */
'bebida de soja':{k:33,p:2.8,c:1.7,g:1.6},
'leche de soja':{k:33,p:2.8,c:1.7,g:1.6},
'yogur de soja':{k:61,p:3,c:5,g:3},
'yogur vegetal':{k:61,p:3,c:5,g:3},
'carne de soja texturizada':{k:336,p:52,c:34,g:1},
'pepinos encurtidos':{k:11,p:0.7,c:2.3,g:0.2},
'pimiento del piquillo':{k:30,p:1,c:5,g:0.5},
'olivas negras':{k:250,p:1.5,c:14,g:23},
'aceitunas':{k:115,p:0.8,c:6,g:11},
'aceitunas verdes':{k:115,p:0.8,c:6,g:11},
'salsa de soja':{k:53,p:8,c:5,g:0},
'salsa teriyaki':{k:89,p:6,c:17,g:0},
'salsa de tomate':{k:82,p:2,c:18,g:0.5},
'pesto':{k:400,p:4,c:3,g:40},
'guacamole':{k:150,p:2,c:8,g:13},
'caldo de huesos':{k:15,p:3,c:0,g:0.3},
'caldo de verduras':{k:13,p:0.5,c:2.5,g:0.1},
'miso':{k:199,p:12,c:26,g:6},

/* ---------- CACAO / DULCES ---------- */
'cacao en polvo':{k:228,p:20,c:58,g:14},
'chocolate 70%':{k:598,p:7.8,c:46,g:43},
'chocolate negro':{k:546,p:5,c:60,g:31},
'miel':{k:304,p:0.3,c:82,g:0},
'sirope de arce':{k:260,p:0,c:67,g:0.1},
'stevia':{k:0,p:0,c:0,g:0},
'edulcorante':{k:0,p:0,c:0,g:0},

/* ---------- OTROS ---------- */
'semillas de cáñamo':{k:553,p:32,c:9,g:49},
'protein powder':{k:360,p:80,c:10,g:3},
'proteina en polvo':{k:360,p:80,c:10,g:3},
'especias':{k:10,p:0.5,c:2,g:0.1},
'canela':{k:247,p:4,c:81,g:1.2},
'pimienta negra':{k:251,p:10,c:64,g:3.3},
'sal':{k:0,p:0,c:0,g:0},
'veneziana':{k:250,p:12,c:20,g:13},
'palitos de apio':{k:16,p:0.7,c:3,g:0.2},
'palitos de pepino':{k:15,p:0.7,c:3.6,g:0.1},
'pan pita':{k:275,p:9,c:53,g:1.5},
'harina de coco':{k:443,p:18,c:60,g:11},
'avena':{k:379,p:13.5,c:67,g:7,raw:true},
};

/* ================================================================
   ALLERGEN DATABASE — Mapea categorías de alérgenos a ingredientes  */
const ALLERGEN_DB={
'lacteos':[
  'leche','leche entera','leche desnatada','leche semidesnatada','leche de vaca',
  'yogur','yogur griego','yogur natural','yogur de cabra','yogur batido',
  'queso','queso fresco','queso feta','queso parmesano','queso de cabra','mozzarella','cheddar','gruyere','emmental',
  'mantequilla','mantequilla de cabra',
  'natas','crema de leche','crema de nata',
  'suero de leche','whey','proteina de suero','proteína de whey',
  'ricotta','mascarpone','requesón','cuajada',
  'helado','sorbete de leche',
  'bechamel','salsa blanca'
],
'frutos secos':[
  'almendra','almendras','almendra marcada','crema de almendra','harina de almendra','avena paleo (almendra)',
  'nuez','nueces','nueces mixtas','nueces de Brasil','nueces de la India','nueces pecanas','nueces de macadamia','nuez moscada',
  'avellana','avellanas',
  'anacardo','anacardos',
  'pistacho','pistachos',
  'cacahuete','cacahuetes','crema de cacahuete',
  'piñón','piñones',
  'frutos secos','frutos secos y semillas',
  'mantequilla de almendra','mantequilla de cacahuete',
  'tahini','semillas de sésamo','sésamo'
],
'pescado':[
  'salmón','salmón a la plancha','salmón al horno','salmón ahumado','salmón marinado',
  'merluza','merluza al horno','merluza a la plancha',
  'atún','atún a la plancha','atún en lata','bonito',
  'lubina','lubina al horno',
  'caballa','sardinas','sardina',
  'bacalao','bacalao al pil-pil',
  'dorada','corvina','trucha',
  'pescado','pescado blanco','pescado azul','pescado a la plancha','pescado al horno',
  'calamares','calamar',
  'rape','halibut','stockfish',
  'anchoa','anchoas','boquerón','jurel',
  'pescado ahumado','ahumado'
],
'marisco':[
  'gamba','gambas','langostino','langostinos','camarón','camarones',
  'mejillón','mejillones',
  'almeja','almejas',
  'pulpo',
  'calamar','calamares',
  'cangrejo','centollo',
  'vieira','ostra','ostras',
  'berberecho','navaja',
  'marisco','mariscos','marisco vegetal'
],
'huevo':[
  'huevo','huevos','claras de huevo','yema','yemas',
  'tortilla','omelette','revuelto',
  'huevo pochado','huevo cocido','huevo frito'
],
'soja':[
  'soja','soya','tofu','tofu firme','tofu seda','tofu de agua',
  'tempeh','edamame','seitán',
  'salsa de soja','salsa teriyaki','salsa de soja oscura',
  'leche de soja','bebida de soja','yogur de soja',
  'harina de soja','proteína de soja','carne de soja texturizada','texturizado de soja',
  'miso','natto','quinua fermentada'
],
'gluten':[
  'trigo','harina de trigo','pan de trigo','pan integral','pan blanco','pan de centeno','pan de pita',
  'pasta','pasta integral','pasta de espelta','espaguetis','macarrones','fideos',
  'cuscús','bulgur','cereales','avena','copos de avena','harina de avena','pancakes de avena',
  'cebada','centeada','escanda','kamut','espelta',
  'seitán','bizcocho','galleta','tarta','pizza',
  'pan pita','tostadas integrales','granola'
],
'frutos_latiños':[
  'café','teína','te negro','te verde','cacao','chocolate','chocolate 70%','chocolate negro',
  'aguacate','limón','naranja','plátano','fresa','arándano','mango','piña','cereza','uva','kiwi',
  'mostaza','altramuz','apio','hinojo'
]
};

function checkAllergen(foodName,allergens){
  if(!allergens||allergens.length===0)return false;
  const fn=foodName.toLowerCase().trim();
  for(const alerg of allergens){
    const key=alerg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const foods=ALLERGEN_DB[key];
    if(foods){
      for(const f of foods){
        const ff=f.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        if(fn===ff||fn.includes(ff)||ff.includes(fn))return true;
      }
    }else{
      const alergNorm=alerg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if(fn.includes(alergNorm)||alergNorm.includes(fn))return true;
    }
  }
  return false;
}

function mealHasAllergen(meal,allergens){
  if(!allergens||allergens.length===0)return false;
  if(checkAllergen(meal.n||'',allergens))return true;
  if(meal.ing){
    for(const ingredient of meal.ing){
      const name=typeof ingredient==='string'?ingredient:ingredient.a||ingredient.name||'';
      if(checkAllergen(name,allergens))return true;
    }
  }
  return false;
}

/* ================================================================
   2. FUNCIONES DE CÁLCULO NUTRICIONAL                          */

function calcBMR(sexo,peso,altura,edad){
  return sexo==='mujer'
    ?10*peso+6.25*altura-5*edad-161
    :10*peso+6.25*altura-5*edad+5;
}

function activityMultiplier(nivel,diasEntreno,duracionEntreno,tipoEntreno){
  const base={sedentario:1.2,ligero:1.375,moderado:1.55,intenso:1.725}[nivel]||1.55;
  const horas=(diasEntreno||3)*(duracionEntreno||60)/60;
  const f={gimnasio:0.06,futbol:0.08,running:0.07,ciclismo:0.065}[tipoEntreno]||0.06;
  return base+horas*f;
}

function calcTDEE(bmr,mult){return Math.round(bmr*mult);}

function adjustCalories(tdee,objetivo){
  if(objetivo==='perdida'||objetivo==='Regular el peso')return Math.round(tdee*0.82);
  if(objetivo==='ganancia'||objetivo==='Ganar masa muscular')return Math.round(tdee*1.15);
  if(objetivo==='mantenimiento'||objetivo==='Equilibrado')return Math.round(tdee*1.0);
  return Math.round(tdee*1.0);
}

function calorieRange(avg){return{min:Math.round(avg*0.95),max:Math.round(avg*1.05)};}

function calcProtein(peso,objetivo,tipoEntreno){
  if(objetivo==='ganancia'&&tipoEntreno==='gimnasio')return peso*2.3;
  if(objetivo==='ganancia')return peso*2.2;
  if(objetivo==='perdida')return peso*2.4;
  return peso*2;
}

function distributeMacros(calObj,pGr,objetivo){
  const pCal=pGr*4;
  const gPct={perdida:0.28,ganancia:0.25}[objetivo]||0.30;
  const gCal=calObj*gPct;
  const g=Math.round(gCal/9);
  const restante=calObj-pCal-gCal;
  const c=Math.round(Math.max(restante/4,100)/5)*5;
  return{p:Math.round(pGr),c,g};
}

/* ================================================================
   3. MOTOR DE GENERACIÓN COMPARTIDO                            */

function buildDietPlan(datos,mealDB,mealSlots,allergens,noComer){
  const{edad,sexo,peso,altura,objetivo,tipoEntreno,diasEntreno,duracionEntreno,numComidas,actividad}=datos;

  /* --- 1. Calcular necesidades --- */
  const bmr=Math.round(calcBMR(sexo,peso,altura,edad));
  const mult=activityMultiplier(actividad||'moderado',diasEntreno||3,duracionEntreno||60,tipoEntreno||'gimnasio');
  const tdee=calcTDEE(bmr,mult);
  const calAvg=adjustCalories(tdee,objetivo);
  const range=calorieRange(calAvg);

  /* --- 2. Slots y porcentajes --- */
  const n=numComidas||4;
  const slots=mealSlots(n);
  const totalPct=Object.values(slots.pct).reduce((a,b)=>a+b,0);

  /* --- 3. Normalizar alérgenos --- */
  const allergSet=(allergens||[]).filter(a=>a&&a!=='Ninguna'&&a!=='Otra…');
  const noComerSet=new Set((noComer||'').toLowerCase().split(/[,;]+/).map(s=>s.trim()).filter(Boolean));

  function isAllowed(meal){
    if(mealHasAllergen(meal,allergSet))return false;
    const mn=(meal.n||'').toLowerCase();
    for(const nc of noComerSet){
      if(mn.includes(nc))return false;
      if(meal.ing){
        for(const ing of meal.ing){
          const name=(typeof ing==='string'?ing:ing.a||'').toLowerCase();
          if(name.includes(nc))return false;
        }
      }
    }
    return true;
  }

  /* --- 4. Filtrar comidas por alérgenos --- */
  const filtered={};
  for(const slot of Object.keys(mealDB)){
    filtered[slot]=mealDB[slot].filter(m=>isAllowed(m));
    if(filtered[slot].length===0)filtered[slot]=mealDB[slot].filter(m=>!mealHasAllergen(m,allergSet));
    if(filtered[slot].length===0)filtered[slot]=mealDB[slot];
  }

  /* --- 5. Generar 7 días con variedad máxima --- */
  const DIAS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const usageCount=new Map();
  const plan=[];

  function pickBest(pool,dayIdx,prevMealName,dayUsed){
    if(!pool||pool.length===0)return null;
    const scored=pool.map(m=>{
      let score=0;
      const count=usageCount.get(m.n)||0;
      score-=count*200;
      if(m.n===prevMealName)score-=50;
      if(count===0)score+=30;
      score+=Math.random()*10;
      return{m,score};
    });
    scored.sort((a,b)=>b.score-a.score);
    for(const s of scored){
      if(dayUsed&&dayUsed.has(s.m.n))continue;
      return s.m;
    }
    return scored[0].m;
  }

  for(let i=0;i<7;i++){
    const entrenando=i<diasEntreno;
    const dayCalAvg=entrenando?Math.round(calAvg*1.04):Math.round(calAvg*0.97);
    const macros=distributeMacros(dayCalAvg,calcProtein(peso,objetivo,tipoEntreno),objetivo);

    const comidas=[];
    let dayTotalCal=0,dayTotalP=0,dayTotalC=0,dayTotalG=0;
    let prevMealName='';
    const dayUsed=new Set();

    for(const slot of slots.list){
      const pct=slots.pct[slot]||0;
      const targetCal=Math.round(dayCalAvg*pct/totalPct);
      const pool=filtered[slot]||[];

      const chosen=pickBest(pool,i,prevMealName,dayUsed);
      if(chosen){
        usageCount.set(chosen.n,(usageCount.get(chosen.n)||0)+1);
        dayUsed.add(chosen.n);
        prevMealName=chosen.n;
        const scaled=scaleMeal(chosen,targetCal);
        comidas.push(scaled);
        dayTotalCal+=scaled.cal;
        dayTotalP+=scaled.p;
        dayTotalC+=scaled.c;
        dayTotalG+=scaled.g;
      }
    }

    plan.push({
      dia:DIAS[i],entrenando,calObj:dayCalAvg,macros,
      comidas,calReal:dayTotalCal,pReal:dayTotalP,cReal:dayTotalC,gReal:dayTotalG
    });
  }

  /* --- 6. Validación post-generación: sustituir comidas con alérgenos --- */
  if(allergSet.length>0){
    for(let di=0;di<plan.length;di++){
      const day=plan[di];
      for(let ci=0;ci<day.comidas.length;ci++){
        const meal=day.comidas[ci];
        if(mealHasAllergen(meal,allergSet)){
          const slot=slots.list[ci%slots.list.length];
          const pool=filtered[slot]||[];
          let replacement=null;
          for(const m of pool){
            if(!mealHasAllergen(m,allergSet)){
              const usedNames=new Set(plan.flatMap(d=>d.comidas.map(c=>c.n)));
              if(!usedNames.has(m.n)){replacement=m;break;}
            }
          }
          if(!replacement)replacement=pool.find(m=>!mealHasAllergen(m,allergSet))||pool[0];
          if(replacement){
            const scaled=scaleMeal(replacement,day.calObj*(slots.pct[slot]||0.25)/totalPct);
            day.comidas[ci]=scaled;
            day.calReal=day.comidas.reduce((s,c)=>s+c.cal,0);
            day.pReal=day.comidas.reduce((s,c)=>s+c.p,0);
            day.cReal=day.comidas.reduce((s,c)=>s+c.c,0);
            day.gReal=day.comidas.reduce((s,c)=>s+c.g,0);
          }
        }
      }
    }
  }

  /* --- 7. Promedio semanal --- */
  const sum=(arr,k)=>arr.reduce((s,d)=>s+d[k],0);
  const n7=plan.length;
  const promedio={
    cal:Math.round(sum(plan,'calReal')/n7),
    p:Math.round(sum(plan,'pReal')/n7),
    c:Math.round(sum(plan,'cReal')/n7),
    g:Math.round(sum(plan,'gReal')/n7)
  };

  return{usuario:datos,bmr,tdee,calAvg,range,objetivo,tipoEntreno,numComidas:n,plan,promedio};
}

function scaleMeal(meal,targetCal){
  if(!meal||!meal.ing||meal.ing.length===0)return{...meal,cal:0,p:0,c:0,g:0};
  const baseCal=meal.ing.reduce((s,i)=>s+i.cal,0);
  if(baseCal===0)return{...meal,cal:0,p:0,c:0,g:0};
  const factor=targetCal/baseCal;
  const ing=meal.ing.map(i=>({
    ...i,
    q:Math.round(i.q*factor),
    cal:Math.round(i.cal*factor),
    p:Math.round(i.p*factor*10)/10,
    c:Math.round(i.c*factor*10)/10,
    g:Math.round(i.g*factor*10)/10
  }));
  const cal=ing.reduce((s,i)=>s+i.cal,0);
  const p=ing.reduce((s,i)=>s+i.p,0);
  const c=ing.reduce((s,i)=>s+i.c,0);
  const g=ing.reduce((s,i)=>s+i.g,0);
  return{...meal,ing,cal,p,c,g};
}

function pick(pool,used){
  if(!pool||pool.length===0)return null;
  for(const m of pool)if(!used.has(m.n))return m;
  return pool[0];
}

function makeSlots(n){
  if(n<=2)return{list:['comida','cena'],pct:{comida:0.52,cena:0.48}};
  if(n===3)return{list:['desayuno','comida','cena'],pct:{desayuno:0.28,comida:0.40,cena:0.32}};
  if(n===4)return{list:['desayuno','comida','merienda','cena'],pct:{desayuno:0.25,comida:0.35,merienda:0.12,cena:0.28}};
  if(n===5)return{list:['desayuno','media_mañana','comida','merienda','cena'],pct:{desayuno:0.20,media_mañana:0.10,comida:0.30,merienda:0.12,cena:0.28}};
  return{list:['desayuno','media_mañana','comida','merienda','cena','post_entreno'],pct:{desayuno:0.18,media_mañana:0.08,comida:0.28,merienda:0.10,cena:0.26,post_entreno:0.10}};
}

/* ================================================================
   4. LISTA DE LA COMPRA                                         */

function genListaCompraUniversal(plan,catMap){
  const cats={};
  for(const dia of plan){
    for(const c of dia.comidas){
      for(const i of c.ing){
        const cat=catMap[i.a]||'Otros';
        if(!cats[cat])cats[cat]={};
        if(!cats[cat][i.a])cats[cat][i.a]={total:0};
        cats[cat][i.a].total+=i.q;
      }
    }
  }
  for(const cat of Object.keys(cats)){
    if(Object.keys(cats[cat]).length===0)delete cats[cat];
    else{
      for(const k of Object.keys(cats[cat]))cats[cat][k].total=Math.round(cats[cat][k].total);
    }
  }
  return cats;
}

/* ================================================================
   5. INGREDIENT FROM DB                                          */

function nut(ingredientName,quantityGrams){
  const db=NUT_DB[ingredientName.toLowerCase()];
  if(!db)return{a:ingredientName,q:quantityGrams,cal:0,p:0,c:0,g:0};
  const f=quantityGrams/100;
  return{
    a:ingredientName,
    q:quantityGrams,
    cal:Math.round(db.k*f),
    p:Math.round(db.p*f*10)/10,
    c:Math.round(db.c*f*10)/10,
    g:Math.round(db.g*f*10)/10
  };
}
