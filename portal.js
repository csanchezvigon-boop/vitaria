(()=>{
'use strict';
console.log('[APP VERSION] portal.js UNIFIED-SAVE-AUDIT');
const $=s=>document.querySelector(s);
function debugPlan(label,menu){
  if(!menu||!menu.length)return;
  console.log(`[PLAN DEBUG] ${label}`);
  menu.forEach((d,i)=>{
    const slots=getMealSlots(d);
    const names=slots.map(s=>{const r=d[s];return typeof r==='object'?r.n:r;});
    console.log(`  ${d.dia||('Día '+(i+1))}: ${names.join(' | ')}`);
  });
}
const PLANS={starter:{name:'Starter',price:'6 €/mes',tagline:'Tu dieta, sin extras',features:['Dieta personalizada','Menú semanal completo con recetas y cantidades','Sustituciones y filtrado por alergias','Lista de la compra semanal']},pro:{name:'Pro',price:'20 €/mes',tagline:'Plan dinámico con ajuste mensual',features:['Plan dinámico con ajuste mensual','Chat limitado para resolver dudas','Lista de la compra semanal','Protocolos avanzados: ayuno, recuperación y suplementación']},premium:{name:'Premium',price:'40 €/mes',tagline:'Seguimiento continuo y personalizado',features:['Seguimiento continuo personalizado','Feedback sobre tus comidas','Atención prioritaria sin esperas','Protocolos avanzados: ayuno, recuperación y suplementación']}};
const DIAS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const ALERGIAS=['Lácteos','Frutos secos','Pescado','Otra…','Ninguna'];
const ALLERGEN_RX=[
  ['Lácteos',/yogur|queso|feta|mozzarella|kéfir|kefir|requesón|requeson|leche|mantequilla|cuajada|natas|crema de leche|suero|whey|ricotta|mascarpone|helado|bechamel|salsa blanca/i],
  ['Pescado',/salm[oó]n|merluza|caballa|at[uú]n|bonito|sardina|trucha|lubina|dorada|pescado|bacalao|ahumado|poke|calamares|rape|anchoa|boquerón|jurel|corvina/i],
  ['Frutos secos',/nueces|almendra|avellana|anacardo|pistacho|cacahuete|piñón|piñones|tahini|sésamo|sesamo|crema de almendra|crema de cacahuete|mantequilla de almendra/i],
  ['Marisco',/gambas?|langostino|camarón|camarones|mejillones?|almejas?|pulpo|cangrejo|centollo|vieira|ostras?|berberecho|navaja|marisco/i],
  ['Huevo',/huevo|tortilla|omelette|revuelto|claras? de huevo|yema/i],
  ['Soja',/soja|soya|tofu|tempeh|edamame|seit[aá]n|salsa de soja|teriyaki|leche de soja|bebida de soja|yogur de soja|miso|harina de soja|prote[ií]na de soja|texturizado/i],
  ['Gluten',/trigo|harina|pan integral|pan blanco|pan de centeno|pasta integral|pasta de espelta|espaguetis|cuscús|bulgur|cebada|centeada|espelta|galleta|bizcocho|tarta|pizza|granola|avena|copos de avena/i]
];
function dishHasAllergen(name,alergias){
  if(!alergias||alergias.length===0)return false;
  const filtered=alergias.filter(a=>a&&a!=='Ninguna'&&a!=='Otra…');
  if(filtered.length===0)return false;
  if(checkAllergen(name,filtered))return true;
  for(const [cat,rx] of ALLERGEN_RX){
    if(filtered.includes(cat)&&rx.test(name))return true;
  }
  const det=MEAL_DETAILS[name]||W_MEAL_DETAILS[name]||M_MEAL_DETAILS[name]||null;
  if(det&&det.items){
    for(const item of det.items){
      const itemName=typeof item==='string'?item:item[1]||item[0]||'';
      if(checkAllergen(itemName,filtered))return true;
      for(const [cat,rx] of ALLERGEN_RX){
        if(filtered.includes(cat)&&rx.test(itemName))return true;
      }
    }
  }
  return false;
}
function parseNoComer(noComer){
  if(!noComer)return[];
  return noComer.split(/[,;]+/).map(s=>s.trim().toLowerCase()).filter(s=>s.length>1);
}
function dishHasNoLike(name,noLike){
  if(!noLike||noLike.length===0)return false;
  const lower=name.toLowerCase();
  return noLike.some(kw=>lower.includes(kw));
}
const ACT_FACTORS={sedentario:1.2,ligero:1.375,moderado:1.55,intenso:1.725};

const MEALS={Equilibrada:{desayuno:['Avena con fruta y nueces','Tostada integral con aguacate y huevo','Yogur natural con fruta y semillas'],comida:['Lentejas con verduras y arroz integral','Pollo al horno, quinoa y brócoli','Garbanzos salteados con espinaca'],cena:['Pescado a la plancha con ensalada','Crema de calabacín y huevo cocido','Tortilla de espinacas y ensalada']},Vegetariana:{desayuno:['Porridge de avena y plátano','Tostada con queso fresco y tomate','Yogur con granola y frutos rojos'],comida:['Garbanzos salteados con espinaca','Bowl de quinoa, hummus y verduras','Pasta integral con verduras al pesto'],cena:['Crema de calabacín y huevo cocido','Revuelto de tofu con champiñones','Ensalada de lentejas y queso feta']},Vegana:{desayuno:['Batido de avena, plátano y cacao','Avena nocturna con bebida de almendra','Tostada con hummus y tomate'],comida:['Tofu salteado con verduras y quinoa','Curry de garbanzos y arroz integral','Pisto con alubias y pan integral'],cena:['Crema de boniato y garbanzos','Salteado de verduras con fideos de arroz','Ensalada de quinoa, aguacate y maíz']},"Sin gluten":{desayuno:['Pan de trigo sarraceno con aguacate','Yogur con fruta y semillas','Huevos revueltos con tomate'],comida:['Arroz integral con pollo y brócoli','Salmorejo con atún y huevo','Garbanzos con espinaca y comino'],cena:['Tortilla de espinacas y ensalada','Pescado al horno con verduras','Crema de calabaza con semillas']}};

const ALLERGENS={'Yogur natural con fruta y semillas':['Lácteos','Frutos secos'],'Yogur con granola y frutos rojos':['Lácteos'],'Tostada con queso fresco y tomate':['Lácteos'],'Bowl de quinoa, hummus y verduras':['Frutos secos'],'Ensalada de lentejas y queso feta':['Lácteos'],'Pescado a la plancha con ensalada':['Pescado'],'Salmorejo con atún y huevo':['Pescado'],'Pescado al horno con verduras':['Pescado'],'Pan de trigo sarraceno con aguacate':['Huevo'],'Tortilla de espinacas y ensalada':['Huevo'],'Crema de calabacín y huevo cocido':['Huevo']};

const NDATA={'Yogur griego proteico con cacao y frutos rojos':{k:520,p:45,c:30,g:25},'Tostadas de espelta con huevos, pavo y aguacate':{k:620,p:38,c:40,g:32},'Porridge overnight de avena con plátano':{k:550,p:35,c:65,g:18},'Ayuno metabólico / Bulletproof Coffee':{k:250,p:2,c:3,g:26},'Pollo con arroz vaporizado y espinacas':{k:650,p:55,c:70,g:18},'Quinoa con caballa, huevo y verduras salteadas':{k:640,p:42,c:55,g:26},'Ternera especiada con boniato y espárragos':{k:700,p:50,c:65,g:24},'Arroz vaporizado con caballa y huevo cocido':{k:600,p:38,c:60,g:20},'Pollo con arroz vaporizado y aguacate':{k:750,p:55,c:80,g:24},'Ensaladilla rusa casera con caballa':{k:650,p:35,c:55,g:30},'Ternera con aguacate, rúcula y yogur griego':{k:800,p:55,c:25,g:52},'Salmón con boniato asado y espárragos':{k:700,p:45,c:60,g:28},'Pescado blanco con patata cocida y verduras':{k:580,p:45,c:55,g:16},'Poke bowl de salmón, quinoa y feta':{k:720,p:42,c:55,g:34},'Fajitas integrales de pollo o pizza casera':{k:650,p:45,c:60,g:22},'Hamburguesa completa con boniato asado':{k:850,p:50,c:75,g:35},'Pescado con puré vegetal y salsa de yogur':{k:550,p:40,c:35,g:25},'Tostadas de espelta con huevos revueltos y aguacate':{k:560,p:32,c:40,g:28},'Avena con fruta y nueces':{k:340,p:11,c:48,g:13},'Tostada integral con aguacate y huevo':{k:370,p:16,c:28,g:21},'Yogur natural con fruta y semillas':{k:215,p:10,c:26,g:8},'Lentejas con verduras y arroz integral':{k:420,p:22,c:58,g:8},'Pollo al horno, quinoa y brócoli':{k:410,p:35,c:38,g:12},'Garbanzos salteados con espinaca':{k:350,p:18,c:42,g:10},'Pescado a la plancha con ensalada':{k:320,p:30,c:12,g:16},'Crema de calabacín y huevo cocido':{k:280,p:14,c:24,g:14},'Tortilla de espinacas y ensalada':{k:310,p:18,c:10,g:22},'Porridge de avena y plátano':{k:320,p:9,c:52,g:9},'Tostada con queso fresco y tomate':{k:290,p:14,c:26,g:14},'Yogur con granola y frutos rojos':{k:280,p:9,c:38,g:10},'Bowl de quinoa, hummus y verduras':{k:380,p:16,c:44,g:15},'Pasta integral con verduras al pesto':{k:420,p:15,c:56,g:14},'Revuelto de tofu con champiñones':{k:260,p:18,c:10,g:16},'Ensalada de lentejas y queso feta':{k:360,p:20,c:38,g:14},'Batido de avena, plátano y cacao':{k:290,p:10,c:48,g:7},'Avena nocturna con bebida de almendra':{k:280,p:9,c:40,g:9},'Tostada con hummus y tomate':{k:270,p:10,c:30,g:12},'Tofu salteado con verduras y quinoa':{k:360,p:20,c:36,g:14},'Curry de garbanzos y arroz integral':{k:430,p:16,c:60,g:14},'Pisto con alubias y pan integral':{k:380,p:16,c:48,g:12},'Crema de boniato y garbanzos':{k:340,p:14,c:52,g:8},'Salteado de verduras con fideos de arroz':{k:300,p:10,c:44,g:8},'Ensalada de quinoa, aguacate y maíz':{k:350,p:12,c:42,g:15},'Pan de trigo sarraceno con aguacate':{k:360,p:14,c:28,g:22},'Yogur con fruta y semillas':{k:215,p:10,c:26,g:8},'Huevos revueltos con tomate':{k:240,p:16,c:8,g:17},'Arroz integral con pollo y brócoli':{k:400,p:32,c:42,g:10},'Salmorejo con atún y huevo':{k:380,p:26,c:22,g:20},'Garbanzos con espinaca y comino':{k:330,p:16,c:44,g:8},'Pescado al horno con verduras':{k:290,p:28,c:10,g:15},'Crema de calabaza con semillas':{k:260,p:8,c:38,g:9}};
const DEFAULT_NDATA={k:350,p:15,c:40,g:12};
/* Detalle de comidas: items=[cantidad, alimento, grupo, opcional?, suplemento?] */
const SUP='SUP';
const M_MEAL_DETAILS={
'Avena con leche, plátano y crema de cacahuete':{items:[['80 g','Avena en copos','HB'],['300 ml','Leche entera','PL'],['1 uds','Plátano','FA'],['20 g','Crema de cacahuete','GR'],['2 uds','Huevos','PA']],note:'Tostada de pan integral con pavo como second breakfast.'},
'Tostada de pan integral con pavo':{items:[['100 g','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 pieza','Fruta de temporada','FB']],note:''},
'Arroz con pechuga de pollo y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Pechuga de pollo','PB'],['','Verduras variadas','VC'],['10 g','AOVE','GR'],['1 uds','Yogur natural','PL']],note:''},
'Tostadas con jamón cocido y plátano':{items:[['80 g','Pan integral','HB'],['100 g','Jamón cocido','PB'],['1 uds','Plátano','FA']],note:''},
'Pasta con carne picada magra y tomate':{items:[['120 g','Pasta','HA'],['150 g','Carne picada magra','PB'],['','Tomate triturado','VN'],['10 g','AOVE','GR'],['1 pieza','Fruta de temporada','FB']],note:''},
'Tostadas con huevos, plátano y leche':{items:[['100 g','Pan integral','HB'],['3 uds','Huevos','PA'],['1 uds','Plátano','FA'],['250 ml','Leche entera','PL']],note:''},
'Yogur griego con avena y frutos rojos':{items:[['250 g','Yogur griego','PL'],['50 g','Avena en copos','HB'],['','Frutos rojos','FR'],['15 g','Nueces','GR']],note:''},
'Patata con ternera y ensalada':{items:[['400 g','Patata','HA'],['180 g','Ternera','PB'],['','Ensalada mixta','VN'],['10 g','AOVE','GR'],['Pan integral','Pan','HB']],note:''},
'Avena con leche y plátano':{items:[['80 g','Avena en copos','HB'],['300 ml','Leche entera','PL'],['1 uds','Plátano','FA']],note:''},
'Arroz con salmón y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Salmón','PB'],['','Verduras variadas','VC'],['1 pieza','Fruta de temporada','FB']],note:''},
'Tostadas con crema de cacahuete y plátano':{items:[['2 tostadas','Pan integral','HB'],['30 g','Crema de cacahuete','GR'],['1 uds','Plátano','FA'],['250 ml','Leche entera','PL']],note:''},
'Patata con merluza y ensalada':{items:[['400 g','Patata','HA'],['200 g','Merluza','PB'],['','Ensalada mixta','VN'],['10 g','AOVE','GR'],['Pan integral','Pan','HB']],note:''},
'Tostadas con huevos, naranja y leche':{items:[['100 g','Pan integral','HB'],['3 uds','Huevos','PA'],['1 uds','Naranja','FB'],['250 ml','Leche entera','PL']],note:''},
'Yogur griego con avena y frutos secos':{items:[['250 g','Yogur griego','PL'],['50 g','Avena en copos','HB'],['15 g','Nueces','GR'],['1 pieza','Fruta de temporada','FB']],note:''},
'Pasta con pavo y verduras':{items:[['120 g','Pasta','HA'],['180 g','Pechuga de pavo','PB'],['','Verduras variadas','VC'],['10 g','AOVE','GR'],['1 uds','Queso fresco batido','PL']],note:''},
'Tostadas con queso fresco batido y manzana':{items:[['2 tostadas','Pan integral','HB'],['80 g','Queso fresco batido','PL'],['1 uds','Manzana','FB']],note:''},
'Arroz con ternera y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Ternera','PB'],['','Verduras variadas','VC'],['10 g','AOVE','GR']],note:''},
'Tostadas con huevos, aguacate y fruta':{items:[['100 g','Pan integral','HB'],['3 uds','Huevos','PA'],['½ uds','Aguacate','GR'],['1 pieza','Fruta de temporada','FB']],note:''},
'Patata con ternera y verduras':{items:[['400 g','Patata','HA'],['180 g','Ternera','PB'],['','Verduras variadas','VC']],note:''},
'Sándwich de pavo con plátano':{items:[['100 g','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 uds','Plátano','FA']],note:''},
'Arroz con salmón y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Salmón','PB'],['','Verduras variadas','VC'],['1 pieza','Fruta de temporada','FB']],note:''},
'Tortitas de avena con huevos y plátano':{items:[['80 g','Avena en copos','HB'],['2 uds','Huevos','PA'],['1 uds','Plátano','FA'],['300 ml','Leche entera','PL']],note:''},
'Yogur con fruta y frutos secos':{items:[['250 g','Yogur natural','PL'],['1 pieza','Fruta de temporada','FB'],['15 g','Nueces','GR']],note:''},
'Arroz con carne y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Carne magra','PB'],['','Verduras variadas','VC']],note:''},
'Bocadillo de pavo con fruta':{items:[['100 g','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 pieza','Fruta de temporada','FB']],note:''},
'Patata con pescado y ensalada':{items:[['400 g','Patata','HA'],['180 g','Pescado blanco','PB'],['','Ensalada mixta','VN']],note:''},
'Avena con leche, frutos rojos y huevos':{items:[['80 g','Avena en copos','HB'],['300 ml','Leche entera','PL'],['','Frutos rojos','FR'],['2 uds','Huevos','PA']],note:''},
'Pasta con salmón y verduras':{items:[['120 g','Pasta','HA'],['180 g','Salmón','PB'],['','Verduras variadas','VC'],['10 g','AOVE','GR']],note:''},
'Arroz con pollo y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Pechuga de pollo','PB'],['','Verduras variadas','VC']],note:''},
'Yogur con avena y frutos secos':{items:[['250 g','Yogur natural','PL'],['50 g','Avena en copos','HB'],['15 g','Frutos secos mixtos','GR'],['1 pieza','Fruta de temporada','FB']],note:''},
'Pasta con atún y tomate':{items:[['120 g','Pasta','HA'],['180 g','Atún','PB'],['','Tomate triturado','VN'],['10 g','AOVE','GR']],note:''},
'Tostada de pan integral con jamón':{items:[['100 g','Pan integral','HB'],['80 g','Jamón cocido','PB'],['1 pieza','Fruta de temporada','FB']],note:''},
'Patata con pollo y ensalada':{items:[['400 g','Patata','HA'],['180 g','Pechuga de pollo','PB'],['','Ensalada mixta','VN'],['10 g','AOVE','GR']],note:''},
'Tostadas con crema de cacahuete y fruta':{items:[['2 tostadas','Pan integral','HB'],['30 g','Crema de cacahuete','GR'],['1 pieza','Fruta de temporada','FB']],note:''},
'Avena con leche y frutos secos':{items:[['80 g','Avena en copos','HB'],['300 ml','Leche entera','PL'],['15 g','Frutos secos mixtos','GR']],note:''},
'Pasta con carne picada magra y verduras':{items:[['120 g','Pasta','HA'],['150 g','Carne picada magra','PB'],['','Verduras variadas','VC'],['10 g','AOVE','GR']],note:''},
'Yogur griego con fruta y nueces':{items:[['250 g','Yogur griego','PL'],['1 pieza','Fruta de temporada','FB'],['15 g','Nueces','GR']],note:''},
'Tostadas de pavo con plátano':{items:[['2 tostadas','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 uds','Plátano','FA']],note:''},
'Patata con salmón y verduras':{items:[['400 g','Patata','HA'],['180 g','Salmón','PB'],['','Verduras variadas','VC']],note:''},
'Tostadas de pavo con fruta':{items:[['2 tostadas','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 pieza','Fruta de temporada','FB']],note:''},
'Tostadas con queso fresco batido y naranja':{items:[['2 tostadas','Pan integral','HB'],['80 g','Queso fresco batido','PL'],['1 uds','Naranja','FB']],note:''},
'Bocadillo de pavo con plátano':{items:[['100 g','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 uds','Plátano','FA']],note:''},
'Patata con pescado y ensalada':{items:[['400 g','Patata','HA'],['180 g','Pescado blanco','PB'],['','Ensalada mixta','VN']],note:''},
'Tortitas de avena con huevos y fruta':{items:[['80 g','Avena en copos','HB'],['2 uds','Huevos','PA'],['1 pieza','Fruta de temporada','FB']],note:''},
'Arroz con merluza y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['200 g','Merluza','PB'],['','Verduras variadas','VC']],note:''},
'Patata con pollo y verduras':{items:[['400 g','Patata','HA'],['180 g','Pechuga de pollo','PB'],['','Verduras variadas','VC']],note:''},
'Tostadas de pavo con fruta':{items:[['2 tostadas','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 pieza','Fruta de temporada','FB']],note:''},
'Arroz con atún y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Atún','PB'],['','Verduras variadas','VC']],note:''},
'Pasta con ternera y verduras':{items:[['120 g','Pasta','HA'],['180 g','Ternera','PB'],['','Verduras variadas','VC'],['10 g','AOVE','GR']],note:''},
'Tostadas con jamón cocido y fruta':{items:[['2 tostadas','Pan integral','HB'],['100 g','Jamón cocido','PB'],['1 pieza','Fruta de temporada','FB']],note:''},
'Bocadillo de pavo con fruta':{items:[['100 g','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 pieza','Fruta de temporada','FB']],note:''},
'Tortitas de avena con huevos y plátano':{items:[['80 g','Avena en copos','HB'],['2 uds','Huevos','PA'],['1 uds','Plátano','FA']],note:''},
'Yogur griego con avena y nueces':{items:[['250 g','Yogur griego','PL'],['50 g','Avena en copos','HB'],['15 g','Nueces','GR']],note:''},
'Pasta con carne y verduras':{items:[['120 g','Pasta','HA'],['180 g','Carne magra','PB'],['','Verduras variadas','VC']],note:''},
'Tostadas de pavo con fruta':{items:[['2 tostadas','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 pieza','Fruta de temporada','FB']],note:''},
'Pasta con merluza y verduras':{items:[['120 g','Pasta','HA'],['200 g','Merluza','PB'],['','Verduras variadas','VC']],note:''},
'Arroz con pescado y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Pescado blanco','PB'],['','Verduras variadas','VC']],note:''},
'Patata con carne y verduras':{items:[['400 g','Patata','HA'],['180 g','Carne magra','PB'],['','Verduras variadas','VC']],note:''},
'Arroz con ternera y ensalada':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Ternera','PB'],['','Ensalada mixta','VN'],['10 g','AOVE','GR']],note:''},
'Pasta con pollo y verduras':{items:[['120 g','Pasta','HA'],['180 g','Pechuga de pollo','PB'],['','Verduras variadas','VC'],['10 g','AOVE','GR']],note:''},
'Yogur griego con avena y frutos rojos':{items:[['250 g','Yogur griego','PL'],['50 g','Avena en copos','HB'],['','Frutos rojos','FR']],note:''},
'Tostada de pan integral con pavo':{items:[['100 g','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 pieza','Fruta de temporada','FB']],note:''},
'Patata con salmón y ensalada':{items:[['400 g','Patata','HA'],['180 g','Salmón','PB'],['','Ensalada mixta','VN']],note:''},
'Arroz con pavo y verduras':{items:[['120 g','Arroz (peso en crudo)','HA'],['180 g','Pechuga de pavo','PB'],['','Verduras variadas','VC']],note:''},
'Yogur griego con avena y frutos secos':{items:[['250 g','Yogur griego','PL'],['50 g','Avena en copos','HB'],['15 g','Frutos secos mixtos','GR']],note:''},
'Patata con ternera y ensalada':{items:[['400 g','Patata','HA'],['180 g','Ternera','PB'],['','Ensalada mixta','VN'],['10 g','AOVE','GR']],note:''},
'Bocadillo de pavo con plátano':{items:[['100 g','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 uds','Plátano','FA']],note:''},
'Yogur griego con avena y frutos rojos':{items:[['250 g','Yogur griego','PL'],['50 g','Avena en copos','HB'],['','Frutos rojos','FR']],note:''},
'Tostadas de pavo con plátano':{items:[['2 tostadas','Pan integral','HB'],['80 g','Pavo en lonchas','PB'],['1 uds','Plátano','FA']],note:''},
'Pasta con salmón y verduras':{items:[['120 g','Pasta','HA'],['180 g','Salmón','PB'],['','Verduras variadas','VC']],note:''},
'Yogur griego con fruta y nueces':{items:[['250 g','Yogur griego','PL'],['1 pieza','Fruta de temporada','FB'],['15 g','Nueces','GR']],note:''},
'Patata con merluza y ensalada':{items:[['400 g','Patata','HA'],['200 g','Merluza','PB'],['','Ensalada mixta','VN']],note:''}
};
const M_NDATA={
'Avena con leche, plátano y crema de cacahuete':{k:840,p:38,c:95,g:35},
'Tostada de pan integral con pavo':{k:400,p:25,c:50,g:8},
'Arroz con pechuga de pollo y verduras':{k:700,p:45,c:80,g:15},
'Tostadas con jamón cocido y plátano':{k:450,p:22,c:55,g:10},
'Pasta con carne picada magra y tomate':{k:650,p:40,c:70,g:18},
'Tostadas con huevos, plátano y leche':{k:750,p:35,c:80,g:28},
'Yogur griego con avena y frutos rojos':{k:420,p:28,c:42,g:16},
'Patata con ternera y ensalada':{k:720,p:42,c:65,g:22},
'Avena con leche y plátano':{k:500,p:18,c:68,g:12},
'Arroz con salmón y verduras':{k:680,p:42,c:60,g:24},
'Tostadas con crema de cacahuete y plátano':{k:600,p:22,c:60,g:25},
'Patata con merluza y ensalada':{k:620,p:38,c:60,g:16},
'Tostadas con huevos, naranja y leche':{k:720,p:32,c:78,g:28},
'Yogur griego con avena y frutos secos':{k:450,p:25,c:42,g:20},
'Pasta con pavo y verduras':{k:680,p:42,c:72,g:16},
'Tostadas con queso fresco batido y manzana':{k:350,p:18,c:42,g:12},
'Arroz con ternera y verduras':{k:740,p:44,c:68,g:22},
'Tostadas con huevos, aguacate y fruta':{k:700,p:30,c:55,g:38},
'Patata con ternera y verduras':{k:680,p:40,c:62,g:20},
'Sándwich de pavo con plátano':{k:480,p:28,c:55,g:10},
'Arroz con salmón y verduras':{k:680,p:42,c:60,g:24},
'Tortitas de avena con huevos y plátano':{k:780,p:36,c:90,g:28},
'Yogur con fruta y frutos secos':{k:320,p:15,c:32,g:15},
'Arroz con carne y verduras':{k:720,p:42,c:68,g:20},
'Bocadillo de pavo con fruta':{k:420,p:26,c:52,g:8},
'Patata con pescado y ensalada':{k:600,p:36,c:60,g:14},
'Avena con leche, frutos rojos y huevos':{k:800,p:36,c:92,g:30},
'Pasta con salmón y verduras':{k:700,p:42,c:68,g:22},
'Arroz con pollo y verduras':{k:680,p:44,c:72,g:14},
'Yogur con avena y frutos secos':{k:380,p:18,c:38,g:16},
'Pasta con atún y tomate':{k:660,p:42,c:70,g:18},
'Tostada de pan integral con jamón':{k:380,p:22,c:48,g:8},
'Patata con pollo y ensalada':{k:680,p:42,c:62,g:16},
'Tostadas con crema de cacahuete y fruta':{k:520,p:18,c:52,g:24},
'Avena con leche y frutos secos':{k:480,p:18,c:52,g:20},
'Pasta con carne picada magra y verduras':{k:680,p:40,c:68,g:20},
'Yogur griego con fruta y nueces':{k:340,p:22,c:28,g:16},
'Tostadas de pavo con plátano':{k:450,p:26,c:52,g:10},
'Patata con salmón y verduras':{k:700,p:42,c:62,g:24},
'Tostadas de pavo con fruta':{k:400,p:24,c:48,g:8},
'Tostadas con queso fresco batido y naranja':{k:340,p:18,c:40,g:12},
'Bocadillo de pavo con plátano':{k:480,p:26,c:56,g:10},
'Patata con pescado y ensalada':{k:600,p:36,c:60,g:14},
'Tortitas de avena con huevos y fruta':{k:720,p:34,c:85,g:26},
'Arroz con merluza y verduras':{k:580,p:38,c:60,g:12},
'Patata con pollo y verduras':{k:680,p:42,c:62,g:16},
'Tostadas de pavo con fruta':{k:400,p:24,c:48,g:8},
'Arroz con atún y verduras':{k:660,p:40,c:64,g:18},
'Pasta con ternera y verduras':{k:720,p:42,c:68,g:22},
'Tostadas con jamón cocido y fruta':{k:420,p:20,c:50,g:10},
'Bocadillo de pavo con fruta':{k:420,p:26,c:52,g:8},
'Tortitas de avena con huevos y plátano':{k:780,p:36,c:90,g:28},
'Yogur griego con avena y nueces':{k:440,p:24,c:40,g:20},
'Pasta con carne y verduras':{k:700,p:40,c:68,g:22},
'Tostadas de pavo con fruta':{k:400,p:24,c:48,g:8},
'Pasta con merluza y verduras':{k:600,p:38,c:64,g:14},
'Arroz con pescado y verduras':{k:620,p:38,c:62,g:14},
'Patata con carne y verduras':{k:700,p:40,c:64,g:22},
'Arroz con ternera y ensalada':{k:720,p:42,c:66,g:22},
'Pasta con pollo y verduras':{k:680,p:44,c:72,g:14},
'Yogur griego con avena y frutos rojos':{k:380,p:26,c:38,g:14},
'Tostada de pan integral con pavo':{k:400,p:25,c:50,g:8},
'Patata con salmón y ensalada':{k:680,p:40,c:60,g:24},
'Arroz con pavo y verduras':{k:660,p:40,c:68,g:14},
'Yogur griego con avena y frutos secos':{k:450,p:25,c:42,g:20},
'Patata con ternera y ensalada':{k:720,p:42,c:65,g:22},
'Bocadillo de pavo con plátano':{k:480,p:26,c:56,g:10},
'Yogur griego con avena y frutos rojos':{k:380,p:26,c:38,g:14},
'Tostadas de pavo con plátano':{k:450,p:26,c:52,g:10},
'Pasta con salmón y verduras':{k:700,p:42,c:68,g:22},
'Yogur griego con fruta y nueces':{k:340,p:22,c:28,g:16},
'Patata con merluza y ensalada':{k:620,p:38,c:60,g:16}
};
const MEAL_DETAILS={
'Yogur griego proteico con cacao y frutos rojos':{prep:'Mezcla yogures con proteína y cacao, decora con frutos rojos, chocolate troceado y canela.',items:[['2 uds','Yogur griego natural','PL'],['15 g','Proteína en polvo',null],['1 chda','Cacao puro sin azúcar',null,1],['Al gusto','Frutos rojos','FR',1],['30 g','Crema de almendras / nueces de Brasil / anacardos','GR'],['1 chda','Semillas de lino o chía','GR'],['1 oz','Chocolate negro >85%',null,1],['Al gusto','Canela',null,1],['','Café solo o con bebida de almendras 0%',null,1],['1 vaso','Agua con pizca de sal'],['1 perla','Vitamina D3 + K2',SUP],['2 perlas','Omega 3',SUP]]},
'Tostadas de espelta con huevos, pavo y aguacate':{items:[['80 g','Pan integral de espelta o centeno (2 rebanadas)','HB'],['60 g','Pavo en lonchas / salmón ahumado / jamón ibérico','PB'],['3 uds','Huevos revueltos','PA'],['½ uds','Aguacate','GR'],['','Tomate rallado o en rodajas','VN'],['1 cda','AOVE','GR'],['','Café solo o con bebida de almendras 0%',null,1],['1 vaso','Agua con pizca de sal'],['1 perla','Vitamina D3 + K2',SUP],['2 perlas','Omega 3',SUP]]},
'Tostadas de espelta con huevos revueltos y aguacate':{items:[['80 g','Pan integral de espelta o centeno (2 rebanadas)','HB'],['3 uds','Huevos revueltos','PA'],['½ uds','Aguacate','GR'],['','Tomate rallado o en rodajas','VN'],['1 cda','AOVE','GR'],['','Café solo o con bebida de almendras 0%',null,1],['1 vaso','Agua con pizca de sal'],['1 perla','Vitamina D3 + K2',SUP],['2 perlas','Omega 3',SUP]]},
'Porridge overnight de avena con plátano':{prep:'Prepara la noche anterior (mínimo 6 h en nevera). No calentar: frío digiere mejor y sacia más.',items:[['50 g','Avena remojada','HB'],['150-200 ml','Bebida de almendras 0%'],['20 g','Proteína en polvo'],['1 uds','Plátano machacado','FA'],['1 chda','Miel natural'],['Al gusto','Frutos rojos','FR',1],['1 chdta','Semillas (sésamo, lino, chía)','GR'],['10 uds','Almendras','GR'],['1 chdta','Cacao puro + canela'],['','Café solo o con bebida de almendras 0%',null,1],['1 vaso','Agua con pizca de sal'],['1 perla','Vitamina D3 + K2',SUP],['2 perlas','Omega 3',SUP]],note:'Si entrenas pronto: ½ porción pre-entreno y el resto de postre.'},
'Ayuno metabólico / Bulletproof Coffee':{prep:'Ayuno completo o Bulletproof: café + bebida de almendras 0% + 1½ cda de aceite de coco. Bátelo para estilo latte.',items:[['','Café / descafeinado espresso'],['150 ml','Bebida de almendras 0%'],['1½ cda','Aceite de coco','GR'],['','Agua con pizca de sal (toda la mañana)']],note:'Mantén la hidratación durante toda la mañana.'},
'Pollo con arroz vaporizado y espinacas':{prep:'Saltea el pollo con cúrcuma y pimienta negra; añade espinacas al final. Brócoli cocido aparte.',items:[['','15 min antes: chupito de vinagre de sidra de manzana en agua'],['80 g','Arroz vaporizado en seco (~240 g cocido)','HA'],['200 g','Pechuga de pollo especiada (cúrcuma y pimienta)','PB'],['1 chda','Salsa pesto o soja',null,1],['','Espinacas salteadas','VH'],['','Brócoli cocido','VC'],['1 cda','AOVE + limón','GR'],['1 uds','Manzana','FB'],['15-20 uds','Almendras','GR']],note:'Merienda pre-entreno opcional (~60 min antes): 1 plátano o 3-4 dátiles con pizca de sal y miel cruda.'},
'Quinoa con caballa, huevo y verduras salteadas':{items:[['','15 min antes: chupito de vinagre de sidra de manzana en agua'],['90 g','Quinoa en seco (~240 g cocida)','HA'],['1 lata','Caballa / bonito','PA'],['2 uds','Huevos cocidos salteados con AOVE','PA'],['','Verduras salteadas: calabacín, pimiento, espárragos verdes, ajo','VN'],['1 cda','Chucrut',null,1],['','Chorrito final de AOVE','GR'],['1 pieza','Manzana / pera / mandarina / kiwi','FB']],note:'Merienda pre-entreno (90 min antes): 1 yogur griego, 1 plátano, 1 cda de miel y agua con pizca de sal.'},
'Ternera especiada con boniato y espárragos':{items:[['','15 min antes: chupito de vinagre de sidra de manzana en agua'],['300 g','Boniato airfryer / asado','HA'],['150 g','Calabaza al airfryer','VR'],['200 g','Carne picada de ternera especiada + tomate natural sin azúcar','PB'],['','Espárragos trigueros salteados','VF'],['125 ml','Kéfir de cabra/oveja + frutos rojos + canela','PL']],note:'Merienda pre-entreno opcional (~60 min antes): 1 plátano o 3-4 dátiles con pizca de sal y miel cruda.'},
'Arroz vaporizado con caballa y huevo cocido':{items:[['','15 min antes: chupito de vinagre de sidra de manzana en agua'],['100 g','Arroz vaporizado en seco','HA'],['1 lata','Caballa / sardinas','PA'],['2 uds','Huevos cocidos','PA'],['','Verduras salteadas: calabacín, pimiento, espárragos verdes, ajo','VN'],['1 cda','Chucrut',null,1],['1 cda','AOVE','GR'],['1 pieza','Manzana / pera / mandarina / kiwi','FB']],note:'Merienda pre-entreno (90 min antes): 1 yogur griego, 1 plátano, 1 cda de miel y agua con pizca de sal.'},
'Pollo con arroz vaporizado y aguacate':{items:[['','15 min antes: chupito de vinagre de sidra de manzana en agua'],['100 g','Arroz vaporizado en seco (~300 g cocido)','HA'],['200 g','Pechuga de pollo especiada (cúrcuma y pimienta)','PB'],['1 chda','Salsa pesto o soja',null,1],['½ uds','Aguacate','GR'],['','Espinacas salteadas','VH'],['1 cda','AOVE + limón','GR'],['1 uds','Manzana','FB'],['15-20 uds','Almendras','GR']],note:'Merienda pre-entreno (90 min antes): 1 yogur griego, 1 plátano, 1 cda de miel y agua con pizca de sal.'},
'Ensaladilla rusa casera con caballa':{prep:'Aliño: yogur griego con chorrito de AOVE y sal (nada de mayonesa). Postre: resto de yogur + fruta + miel + canela.',items:[['','15 min antes: chupito de vinagre de sidra de manzana en agua'],['350 g','Patata cocida','HA'],['1 lata','Caballa / atún / bonito','PA'],['3 uds','Huevos cocidos','PA'],['1 lata','Guisantes',null,1],['','Zanahoria rallada o cocida','VR'],['','Yogur griego para aliñar + AOVE + sal','PL'],['1 cda','AOVE','GR'],['1 pieza','Fruta (postre)','FB'],['1 cda','Miel (postre)',null,1]]},
'Ternera con aguacate, rúcula y yogur griego':{items:[['','15 min antes: chupito de vinagre de sidra de manzana en agua'],['250 g','Carne picada / entrecot / chuletas de ternera','PA'],['2 uds','Huevos cocidos o a la plancha','PA',1],['1 uds','Aguacate','GR'],['','Tomate cherry o natural','VN'],['','Rúcula o espinaca fresca','VH'],['1 cda','AOVE','GR'],['1 cda','Semillas de sésamo o lino','GR'],['','Sal, pimienta y pimentón'],['1 uds','Yogur griego + frutos rojos + canela','PL']]},
'Salmón con boniato asado y espárragos':{items:[['350 g','Patata / 250 g boniato asado o airfryer','HA'],['180-220 g','Salmón fresco con limón y especias','PA'],['1 chda','Pesto',null,1],['','Espárragos trigueros + champiñones salteados','VF'],['','Tomate fresco, sal y especias','VN',1],['1 cda','AOVE','GR'],['','Chorrito de salsa de soja para el salmón',null,1],['1 uds','Yogur de cabra + cacao puro + frutos rojos','PL'],['2 cápsulas','Bisglicinato de Magnesio (separar 20 min de la cena)',SUP]]},
'Pescado blanco con patata cocida y verduras':{items:[['350 g','Patata cocida / horno / airfryer','HA'],['200-250 g','Pescado blanco (merluza, lubina, dorada)','PB'],['','Espinacas y brócoli de acompañamiento','VH'],['1 cda','AOVE','GR'],['125 ml','Kéfir de cabra/oveja + frutos rojos + canela','PL'],['2 oz','Chocolate negro >85%'],['2 cápsulas','Bisglicinato de Magnesio (+20 min después de cenar)',SUP]]},
'Poke bowl de salmón, quinoa y feta':{items:[['90 g','Quinoa en seco, lavada previamente','HA'],['150-200 g','Salmón especiado (sal, pimienta, limón)','PA'],['30 g','Queso feta desmenuzado','PL'],['½ uds','Aguacate / 80 g guacamole','GR'],['','Pepino o calabacín + zanahoria rallada + espinacas','VN'],['1 cda','AOVE','GR'],['1 uds','Manzana','FB'],['2 oz','Chocolate negro >85%'],['2 cápsulas','Bisglicinato de Magnesio',SUP]]},
'Fajitas integrales de pollo o pizza casera':{prep:'FAJITAS: tortillas + pollo en tiras con pimientos, cebolla y calabacín, especias y lima. PIZZA: base de avena molida/sarraceno con huevo, hornear 10-12 min, añadir toppings y hornear 10 min más a 200 °C.',items:[['2 uds','Tortillas integrales / 100 g avena molida','HB'],['150-180 g','Pollo o pavo en tiras (o atún)','PB'],['','½ pimiento rojo + ½ verde, ½ cebolla, ½ calabacín','VN'],['1 cda','AOVE','GR'],['50 g','Mozzarella rallada / queso feta / guacamole','PL',1],['','Especias: cúrcuma, pimentón, comino, orégano'],['','Zumo de lima o limón al final'],['1 pieza','Fruta (postre)','FB'],['125 ml','Kéfir de cabra/oveja + frutos rojos + canela','PL'],['2 cápsulas','Bisglicinato de Magnesio (+20 min después de cenar)',SUP]]},
'Hamburguesa completa con boniato asado':{prep:'Cebolla pochada en la sartén queda mucho más rica.',items:[['80 g','Pan de masa madre / centeno / espelta','HB'],['¼ uds','Aguacate / 50 g guacamole','GR'],['150-180 g','Carne picada de ternera','PB'],['30 g','Queso feta','PL',1],['','Canónigos + tomate + cebolla pochada','VH'],['250-300 g','Boniato asado','HA'],['1 cdta','AOVE','GR'],['125 ml','Kéfir de cabra/oveja + frutos rojos + canela','PL',1],['2 oz','Chocolate negro >85%'],['1 uds','Manzana',null,1]]},
'Pescado con puré vegetal y salsa de yogur':{items:[['','Puré caliente de calabaza / calabacín / zanahoria','VR'],['1 cda','AOVE + sal + especias suaves (cúrcuma, jengibre)','GR'],['250 g','Pescado blanco o azul (merluza, salmón)'],['Al gusto','Aceitunas','GR',1],['','Espinacas o rúcula salteadas','VH'],['','Cebolla pochada','VN',1],['½ uds','Yogur griego para salsa + limón + sal + AOVE','PL'],['1 uds','Manzana','FB'],['','Puñado de frutos secos o crema de almendras','GR']]},
'Huevos revueltos (2 unidades) + Batido de sandía y açaí (2½ tazas)':{items:[['2 uds','Huevos','EG'],['1 chda','AOVE','GR'],['200 g','Sandía','FR'],['100 g','Açaí','FR'],['1 chda','Miel','OT',1]],note:'Batido: sandía + açaí + hielo batidos.'},
'Huevos revueltos (1 huevo) + Batido de açaí (3 tazas)':{items:[['1 ud','Huevo','EG'],['1 chda','AOVE','GR'],['150 g','Açaí','FR'],['1 ud','Plátano','FR'],['100 ml','Leche de coco','OT']],note:'Batido: açaí + plátano + leche de coco batidos.'},
'Huevos revueltos (3 uds) + Batido de sandía y açaí (3 tazas)':{items:[['3 uds','Huevos','EG'],['1 chda','AOVE','GR'],['300 g','Sandía','FR'],['150 g','Açaí','FR'],['1 chda','Miel','OT',1]],note:'Batido: sandía + açaí + hielo batidos.'},
'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (1 ración) + Plátano, frutos rojos y chocolate amargo':{items:[['4 uds','Claras de huevo','EG'],['50 g','Espinaca','VH'],['30 g','Cebolla','VH'],['50 g','Champiñones','VH'],['50 g','Pimiento','VH'],['1 ud','Plátano','FR'],['100 g','Frutos rojos','FR'],['20 g','Chocolate negro >85%','OT']]},
'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (2 raciones) + Batido de piña y frambuesa':{items:[['6 uds','Claras de huevo','EG'],['100 g','Espinaca','VH'],['50 g','Cebolla','VH'],['80 g','Champiñones','VH'],['80 g','Pimiento','VH'],['150 g','Piña','FR'],['100 g','Frutos rojos','FR'],['100 ml','Leche de almendra','OT']]},
'Ensalada de atún y aguacate (1 ración) + Zumo verde variado (½ ración)':{items:[['150 g','Atún','PA'],['½ ud','Aguacate','GR'],['100 g','Lechuga','VH'],['50 g','Tomate','VH'],['125 ml','Zumo verde (espinaca, pepino, limón)','VH'],['1 cda','AOVE','GR']]},
'Ensalada de atún y aguacate (1½ ración) + Zumo verde variado (½ ración)':{items:[['200 g','Atún','PA'],['½ ud','Aguacate','GR'],['150 g','Lechuga','VH'],['75 g','Tomate','VH'],['125 ml','Zumo verde (espinaca, pepino, limón)','VH'],['1 cda','AOVE','GR']]},
'Ensalada de atún y aguacate (1½ ración) + Batido de piña y frambuesa':{items:[['200 g','Atún','PA'],['½ ud','Aguacate','GR'],['150 g','Lechuga','VH'],['75 g','Tomate','VH'],['150 g','Piña','FR'],['100 g','Frutos rojos','FR'],['100 ml','Leche de almendra','OT']]},
'Ensalada de atún con sésamo (1 ración) + Batido de canela, plátano y nectarina':{items:[['150 g','Atún','PA'],['100 g','Lechuga','VH'],['50 g','Tomate','VH'],['10 g','Sésamo','SE'],['1 ud','Plátano','FR'],['1 ud','Nectarina','FR'],['1 cdta','Canela','OT'],['100 ml','Leche de almendra','OT']]},
'Ensalada de atún con sésamo (1½ ración) + Batido de canela, plátano y nectarina':{items:[['200 g','Atún','PA'],['150 g','Lechuga','VH'],['75 g','Tomate','VH'],['10 g','Sésamo','SE'],['1 ud','Plátano','FR'],['1 ud','Nectarina','FR'],['1 cdta','Canela','OT'],['100 ml','Leche de almendra','OT']]},
'Zumo de zanahoria y naranja (470 ml)':{items:[['300 g','Zanahoria','VH'],['2 ud','Naranja','FR']],note:'Exprimir o licuar zanahoria y naranja.'},
'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras':{items:[['300 g','Zanahoria','VH'],['2 ud','Naranja','FR'],['30 g','Almendras','SE']]},
'Sopa picante de pollo (1 ración) + Ensalada de kale y pepino':{items:[['150 g','Pechuga de pollo','PB'],['100 g','Kale','VH'],['100 g','Pepino','VH'],['50 g','Cebolla','VH'],['1 cdta','Especias picantes','OT'],['1 cda','AOVE','GR']]},
'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino':{items:[['200 g','Pechuga de pollo','PB'],['150 g','Kale','VH'],['150 g','Pepino','VH'],['75 g','Cebolla','VH'],['1 cdta','Especias picantes','OT'],['1 cda','AOVE','GR']]},
'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino con aguacate':{items:[['200 g','Pechuga de pollo','PB'],['150 g','Kale','VH'],['150 g','Pepino','VH'],['½ ud','Aguacate','GR'],['75 g','Cebolla','VH'],['1 cdta','Especias picantes','OT'],['1 cda','AOVE','GR']]},
'Ensalada batida de frambuesa (1½ ración) + Batido de plátano, coco y verduras verdes':{items:[['150 g','Frutos rojos','FR'],['100 g','Lechuga','VH'],['1 ud','Plátano','FR'],['100 ml','Leche de coco','OT'],['50 g','Espinaca','VH']]},
'Ensalada batida de frambuesa (2 raciones) + Batido de plátano, coco y verduras verdes':{items:[['200 g','Frutos rojos','FR'],['150 g','Lechuga','VH'],['1 ud','Plátano','FR'],['100 ml','Leche de coco','OT'],['75 g','Espinaca','VH']]},
'Manzana con mantequilla de almendra (1 manzana)':{items:[['1 ud','Manzana','FR'],['2 cda','Mantequilla de almendra','SE']]},
'Manzana con mantequilla de almendra (1 manzana + 2 cda)':{items:[['1 ud','Manzana','FR'],['2 cda','Mantequilla de almendra','SE']]},
'Pollo con gravy de chipotle (1 ración) + Ensalada de pimientos y tomate':{items:[['150 g','Pechuga de pollo','PB'],['50 g','Salsa chipotle','OT'],['100 g','Pimiento','VH'],['100 g','Tomate','VH'],['1 cda','AOVE','GR']]},
'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate':{items:[['200 g','Pechuga de pollo','PB'],['75 g','Salsa chipotle','OT'],['150 g','Pimiento','VH'],['150 g','Tomate','VH'],['1 cda','AOVE','GR']]},
'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate con aguacate':{items:[['200 g','Pechuga de pollo','PB'],['75 g','Salsa chipotle','OT'],['150 g','Pimiento','VH'],['150 g','Tomate','VH'],['½ ud','Aguacate','GR'],['1 cda','AOVE','GR']]},
'Ensalada de pollo con estragón y Dijon (1½ ración) + Batido de piña y frambuesa':{items:[['200 g','Pechuga de pollo','PB'],['100 g','Lechuga','VH'],['1 cdta','Estragón','OT'],['1 cdta','Mostaza Dijon','OT'],['150 g','Piña','FR'],['100 g','Frutos rojos','FR'],['100 ml','Leche de almendra','OT']]},
'Ensalada de pollo con estragón y Dijon (2 raciones) + Batido de piña y frambuesa':{items:[['250 g','Pechuga de pollo','PB'],['150 g','Lechuga','VH'],['1 cdta','Estragón','OT'],['1 cdta','Mostaza Dijon','OT'],['150 g','Piña','FR'],['100 g','Frutos rojos','FR'],['100 ml','Leche de almendra','OT']]},
'Ensalada picante de plátano macho (1 ración)':{items:[['1 ud','Plátano macho','FR'],['50 g','Lechuga','VH'],['1 cdta','Especias picantes','OT'],['1 cda','AOVE','GR']]},
'Ensalada picante de plátano macho (1½ ración)':{items:[['1½ ud','Plátano macho','FR'],['75 g','Lechuga','VH'],['1 cdta','Especias picantes','OT'],['1 cda','AOVE','GR']]},
'Bistec simple (½ ración) + Ensalada de frutas clásica':{items:[['100 g','Ternera','PB'],['100 g','Fruta mixta','FR'],['1 cda','AOVE','GR']]},
'Bistec simple (1 ración) + Ensalada de frutas clásica':{items:[['150 g','Ternera','PB'],['150 g','Fruta mixta','FR'],['1 cda','AOVE','GR']]},
'Bistec simple (1 ración) + Ensalada de frutas clásica con frutos secos':{items:[['150 g','Ternera','PB'],['150 g','Fruta mixta','FR'],['20 g','Nueces','SE'],['1 cda','AOVE','GR']]},
'Salteado de bacalao (1 ración) + Ensalada de piña y aguacate':{items:[['150 g','Bacalao','PA'],['150 g','Piña','FR'],['½ ud','Aguacate','GR'],['1 cda','AOVE','GR']]},
'Salteado de bacalao (1½ ración) + Ensalada de piña y aguacate':{items:[['200 g','Bacalao','PA'],['150 g','Piña','FR'],['½ ud','Aguacate','GR'],['1 cda','AOVE','GR']]},
'Zumo verde de jengibre (1 ración) + Batata al microondas (½ batata)':{items:[['100 g','Espinaca','VH'],['1 ud','Pepino','VH'],['1 ud','Limón','FR'],['5 g','Jengibre','VH'],['150 g','Batata','VH']]},
'Zumo verde de jengibre (1 ración) + Batata al microondas (1 batata)':{items:[['100 g','Espinaca','VH'],['1 ud','Pepino','VH'],['1 ud','Limón','FR'],['5 g','Jengibre','VH'],['250 g','Batata','VH']]},
'Revuelto de espinaca y champiñón (1 ración) + Plátano, frutos rojos y chocolate amargo':{items:[['2 uds','Huevos','EG'],['50 g','Espinaca','VH'],['50 g','Champiñones','VH'],['1 ud','Plátano','FR'],['100 g','Frutos rojos','FR'],['20 g','Chocolate negro >85%','OT'],['1 cda','AOVE','GR']]},
'Revuelto de espinaca y champiñón (1½ ración) + Plátano, frutos rojos y chocolate amargo':{items:[['3 uds','Huevos','EG'],['75 g','Espinaca','VH'],['75 g','Champiñones','VH'],['1 ud','Plátano','FR'],['100 g','Frutos rojos','FR'],['20 g','Chocolate negro >85%','OT'],['1 cda','AOVE','GR']]},
'Revuelto de espinaca y champiñón (2 raciones) + Plátano, frutos rojos y chocolate amargo':{items:[['4 uds','Huevos','EG'],['100 g','Espinaca','VH'],['100 g','Champiñones','VH'],['1 ud','Plátano','FR'],['100 g','Frutos rojos','FR'],['20 g','Chocolate negro >85%','OT'],['1 cda','AOVE','GR']]},
'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo':{items:[['4 uds','Claras de huevo','EG'],['50 g','Espinaca','VH'],['30 g','Cebolla','VH'],['50 g','Champiñones','VH'],['50 g','Pimiento','VH'],['1 ud','Plátano','FR'],['100 g','Frutos rojos','FR'],['20 g','Chocolate negro >85%','OT']]},
'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo':{items:[['4 uds','Claras de huevo','EG'],['50 g','Espinaca','VH'],['30 g','Cebolla','VH'],['50 g','Champiñones','VH'],['50 g','Pimiento','VH'],['1 ud','Plátano','FR'],['100 g','Frutos rojos','FR'],['20 g','Chocolate negro >85%','OT']]},
'Pechuga de pollo (200 g) con brócoli y aceite de oliva':{items:[['200 g','Pechuga de pollo','PB'],['150 g','Brócoli','VH'],['1 cda','AOVE','GR']]},
'Ternera (200 g) con ensalada verde y aguacate':{items:[['200 g','Ternera','PB'],['100 g','Lechuga','VH'],['50 g','Tomate','VH'],['½ ud','Aguacate','GR'],['1 cda','AOVE','GR']]},
'Merluza (200 g) con calabacín salteado':{items:[['200 g','Merluza','PA'],['150 g','Calabacín','VH'],['1 cda','AOVE','GR']]},
'Atún (200 g) a la plancha con espárragos':{items:[['200 g','Atún','PA'],['150 g','Espárragos','VH'],['1 cda','AOVE','GR']]},
'Nueces mixtas (30 g) + queso':{items:[['30 g','Nueces','SE'],['50 g','Queso','PL']]},
'Queso fresco (100 g) con aceitunas':{items:[['100 g','Queso fresco','PL'],['15 ud','Aceitunas','OT']]},
'Queso fresco (80 g) con aceitunas':{items:[['80 g','Queso fresco','PL'],['15 ud','Aceitunas','OT']]},
'Palitos de apio con mantequilla de almendra (3 cdas)':{items:[['100 g','Apio','VH'],['3 cda','Mantequilla de almendra','SE']]},
'Guacamole (½ aguacate) con palitos de pepino':{items:[['½ ud','Aguacate','GR'],['100 g','Pepino','VH'],['1 cdta','Limón','FR']]},
'Guacamole con palitos de pepino':{items:[['½ ud','Aguacate','GR'],['100 g','Pepino','VH'],['1 cdta','Limón','FR']]},
'Mantequilla de almendra (4 cdas)':{items:[['4 cda','Mantequilla de almendra','SE']]},
'Mantequilla de almendra (2 cdas)':{items:[['2 cda','Mantequilla de almendra','SE']]},
'Aceitunas (15 uds) y queso (80 g)':{items:[['15 ud','Aceitunas','OT'],['80 g','Queso','PL']]},
'Aceitunas (15 uds) y frutos secos (30 g)':{items:[['15 ud','Aceitunas','OT'],['30 g','Nueces','SE']]},
'Aceitunas y queso':{items:[['15 ud','Aceitunas','OT'],['50 g','Queso','PL']]},
'Hummus (100 g) con pan pita':{items:[['100 g','Hummus','OT'],['2 ud','Pan pita','HA']]},
'Nueces (40 g) y fruta':{items:[['40 g','Nueces','SE'],['1 ud','Fruta de temporada','FR']]},
'Queso fresco (100 g) con miel':{items:[['100 g','Queso fresco','PL'],['1 cda','Miel','OT']]},
'Queso fresco (80 g) con fruta':{items:[['80 g','Queso fresco','PL'],['1 ud','Fruta de temporada','FR']]},
'Yogur griego (200 g) con miel':{items:[['200 g','Yogur griego','PL'],['1 cda','Miel','OT']]},
'Yogur griego (200 g) con fruta':{items:[['200 g','Yogur griego','PL'],['1 ud','Fruta de temporada','FR']]},
'Yogur griego (200 g) con frutos rojos y granola (30 g)':{items:[['200 g','Yogur griego','PL'],['100 g','Frutos rojos','FR'],['30 g','Granola','HA']]},
'Fruta + almendras (30 g)':{items:[['1 ud','Fruta de temporada','FR'],['30 g','Almendras','SE']]},
'Fruta + frutos secos (30 g)':{items:[['1 ud','Fruta de temporada','FR'],['30 g','Frutos secos','SE']]},
'Fruta seca (40 g) y almendras (30 g)':{items:[['40 g','Frutos secos','SE'],['30 g','Almendras','SE']]},
'Barrita de frutos secos + fruta':{items:[['1 ud','Barrita de frutos secos','SE'],['1 ud','Fruta de temporada','FR']]},
'Fruta + frutos secos (40 g)':{items:[['1 ud','Fruta de temporada','FR'],['40 g','Frutos secos','SE']]},
'Smoothie de frutos rojos (300 ml)':{items:[['200 g','Frutos rojos','FR'],['100 ml','Leche de almendra','OT']]},
'Edamame con sal':{items:[['100 g','Edamame','LG'],['1 pizca','Sal','OT']]},
'Huevos Benedict (4 uds) con espinaca':{items:[['4 uds','Huevos','EG'],['100 g','Espinaca','VH'],['1 cda','AOVE','GR']]},
'Huevos Benedict (4 uds) con espinaca':{items:[['4 uds','Huevos','EG'],['100 g','Espinaca','VH'],['1 cda','AOVE','GR']]},
'Tostadas integrales (3 uds) con tomate y aceite de oliva':{items:[['3 ud','Pan integral','HA'],['100 g','Tomate','VH'],['1 cda','AOVE','GR']]},
'Tostadas integrales (3 uds) con tomate y mozzarella':{items:[['3 ud','Pan integral','HA'],['100 g','Tomate','VH'],['100 g','Mozzarella','PL']]},
'Tostadas de centeno (3 uds) con aguacate (½) y huevo':{items:[['3 ud','Pan de centeno','HA'],['½ ud','Aguacate','GR'],['1 ud','Huevo','EG']]},
'Tostadas de centeno (3 uds) con huevo y aguacate':{items:[['3 ud','Pan de centeno','HA'],['1 ud','Huevo','EG'],['½ ud','Aguacate','GR']]},
'Porridge de avena (80 g) con nueces (30 g) y miel':{items:[['80 g','Avena','HA'],['30 g','Nueces','SE'],['1 cda','Miel','OT'],['200 ml','Leche','PL']]},
'Porridge de avena (80 g) con nueces (30 g) y miel + fruta':{items:[['80 g','Avena','HA'],['30 g','Nueces','SE'],['1 cda','Miel','OT'],['200 ml','Leche','PL'],['1 ud','Fruta de temporada','FR']]},
'Avena (80 g) con plátano y canela + nueces (30 g)':{items:[['80 g','Avena','HA'],['1 ud','Plátano','FR'],['1 cdta','Canela','OT'],['30 g','Nueces','SE'],['200 ml','Leche','PL']]},
'Tortilla de espinacas (4 huevos)':{items:[['4 uds','Huevos','EG'],['100 g','Espinaca','VH'],['1 cda','AOVE','GR']]},
'Tortilla española (4 huevos) con ensalada':{items:[['4 uds','Huevos','EG'],['200 g','Patata','VH'],['100 g','Lechuga','VH'],['1 cda','AOVE','GR']]},
'Tortilla española (4 huevos)':{items:[['4 uds','Huevos','EG'],['200 g','Patata','VH'],['1 cda','AOVE','GR']]},
'Salmón (200 g) a la plancha con quinoa (80 g en seco) y verduras':{items:[['200 g','Salmón','PA'],['80 g','Quinoa','HA'],['150 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Salmón (200 g) a la plancha con boniato (200 g)':{items:[['200 g','Salmón','PA'],['200 g','Boniato','VH'],['1 cda','AOVE','GR']]},
'Merluza (200 g) al horno con patata (200 g) y cebolla':{items:[['200 g','Merluza','PA'],['200 g','Patata','VH'],['50 g','Cebolla','VH'],['1 cda','AOVE','GR']]},
'Merluza (200 g) con espinacas y ajo':{items:[['200 g','Merluza','PA'],['100 g','Espinaca','VH'],['1 diente','Ajo','VH'],['1 cda','AOVE','GR']]},
'Merluza (200 g) con calabacín y ajo':{items:[['200 g','Merluza','PA'],['150 g','Calabacín','VH'],['1 diente','Ajo','VH'],['1 cda','AOVE','GR']]},
'Merluza (200 g) con patata asada':{items:[['200 g','Merluza','PA'],['200 g','Patata','VH'],['1 cda','AOVE','GR']]},
'Paella de marisco y verduras (100 g arroz en seco)':{items:[['100 g','Arroz','HA'],['150 g','Marisco mixto','PA'],['100 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Paella de pollo (200 g) y verduras (100 g arroz en seco)':{items:[['200 g','Pollo','PB'],['100 g','Arroz','HA'],['100 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Arroz integral (80 g en seco) con verduras y pollo (200 g)':{items:[['80 g','Arroz integral','HA'],['200 g','Pollo','PB'],['100 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Arroz (80 g en seco) con verduras y marisco':{items:[['80 g','Arroz','HA'],['150 g','Marisco mixto','PA'],['100 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Arroz (80 g en seco) con marisco':{items:[['80 g','Arroz','HA'],['150 g','Marisco mixto','PA'],['1 cda','AOVE','GR']]},
'Arroz (80 g en seco) con verduras':{items:[['80 g','Arroz','HA'],['150 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Lentejas (100 g en seco) guisadas con verduras':{items:[['100 g','Lentejas','LG'],['150 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Lentejas (100 g en seco) con verduras y arroz (80 g)':{items:[['100 g','Lentejas','LG'],['100 g','Verduras variadas','VH'],['80 g','Arroz','HA'],['1 cda','AOVE','GR']]},
'Guiso de garbanzos (150 g) con espinaca y chorizo':{items:[['150 g','Garbanzos','LG'],['100 g','Espinaca','VH'],['50 g','Chorizo','PB'],['1 cda','AOVE','GR']]},
'Guiso de garbanzos (150 g) con espinaca':{items:[['150 g','Garbanzos','LG'],['100 g','Espinaca','VH'],['1 cda','AOVE','GR']]},
'Cordero (200 g) al horno con verduras mediterráneas':{items:[['200 g','Cordero','PB'],['150 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Cordero (200 g) al horno con patata (200 g)':{items:[['200 g','Cordero','PB'],['200 g','Patata','VH'],['1 cda','AOVE','GR']]},
'Cordero (200 g) con verduras':{items:[['200 g','Cordero','PB'],['150 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Bacalao (200 g) al pil-pil con patatas':{items:[['200 g','Bacalao','PA'],['200 g','Patata','VH'],['1 cda','AOVE','GR']]},
'Bacalao (200 g) con verduras al horno':{items:[['200 g','Bacalao','PA'],['150 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Pasta integral (80 g en seco) con salsa de tomate y albahaca':{items:[['80 g','Pasta integral','HA'],['150 g','Salsa de tomate','OT'],['Al gusto','Albahaca','OT'],['1 cda','AOVE','GR']]},
'Pasta integral (80 g en seco) con atún (150 g) y tomate':{items:[['80 g','Pasta integral','HA'],['150 g','Atún','PA'],['100 g','Tomate','VH'],['1 cda','AOVE','GR']]},
'Pasta integral (80 g en seco) con verduras':{items:[['80 g','Pasta integral','HA'],['150 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Pasta integral (80 g en seco) con atún':{items:[['80 g','Pasta integral','HA'],['150 g','Atún','PA'],['1 cda','AOVE','GR']]},
'Sardinas (200 g) a la plancha con pimientos':{items:[['200 g','Sardinas','PA'],['150 g','Pimiento','VH'],['1 cda','AOVE','GR']]},
'Sardinas (200 g) con pimientos asados':{items:[['200 g','Sardinas','PA'],['150 g','Pimiento','VH'],['1 cda','AOVE','GR']]},
'Sardinas (200 g) a la parrilla con ensalada y aceite de oliva':{items:[['200 g','Sardinas','PA'],['100 g','Lechuga','VH'],['1 cda','AOVE','GR']]},
'Sardinas (200 g) a la parrilla':{items:[['200 g','Sardinas','PA'],['1 cda','AOVE','GR']]},
'Sardinas (200 g) a la plancha con ensalada':{items:[['200 g','Sardinas','PA'],['100 g','Lechuga','VH'],['1 cda','AOVE','GR']]},
'Sardinas (200 g) con pimientos':{items:[['200 g','Sardinas','PA'],['150 g','Pimiento','VH'],['1 cda','AOVE','GR']]},
'Calamares (200 g) a la plancha con ensalada':{items:[['200 g','Calamares','PA'],['100 g','Lechuga','VH'],['1 cda','AOVE','GR']]},
'Pollo (200 g) al horno con boniato (200 g)':{items:[['200 g','Pollo','PB'],['200 g','Boniato','VH'],['1 cda','AOVE','GR']]},
'Pollo (200 g) al horno con aceitunas y limón':{items:[['200 g','Pollo','PB'],['15 ud','Aceitunas','OT'],['1 ud','Limón','FR'],['1 cda','AOVE','GR']]},
'Pollo (200 g) al horno con patata (200 g) y romero':{items:[['200 g','Pollo','PB'],['200 g','Patata','VH'],['1 cdta','Romero','OT'],['1 cda','AOVE','GR']]},
'Pollo (200 g) a la plancha con quinoa (80 g en seco)':{items:[['200 g','Pollo','PB'],['80 g','Quinoa','HA'],['1 cda','AOVE','GR']]},
'Pollo (200 g) con arroz (80 g) y verduras':{items:[['200 g','Pollo','PB'],['80 g','Arroz','HA'],['100 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Lubina (200 g) al horno con limón':{items:[['200 g','Lubina','PA'],['1 ud','Limón','FR'],['1 cda','AOVE','GR']]},
'Lubina (200 g) al horno con limón y hierbas':{items:[['200 g','Lubina','PA'],['1 ud','Limón','FR'],['Al gusto','Hierbas','OT'],['1 cda','AOVE','GR']]},
'Lubina (200 g) con espinacas':{items:[['200 g','Lubina','PA'],['100 g','Espinaca','VH'],['1 cda','AOVE','GR']]},
'Lubina (200 g) con calabacín y pimiento':{items:[['200 g','Lubina','PA'],['100 g','Calabacín','VH'],['50 g','Pimiento','VH'],['1 cda','AOVE','GR']]},
'Salmón (200 g) al horno con espárragos':{items:[['200 g','Salmón','PA'],['150 g','Espárragos','VH'],['1 cda','AOVE','GR']]},
'Salmón (200 g) con espárragos':{items:[['200 g','Salmón','PA'],['150 g','Espárragos','VH'],['1 cda','AOVE','GR']]},
'Salmón (200 g) con quinoa (80 g en seco) y verduras':{items:[['200 g','Salmón','PA'],['80 g','Quinoa','HA'],['100 g','Verduras variadas','VH'],['1 cda','AOVE','GR']]},
'Ternera (200 g) con espárragos y mantequilla':{items:[['200 g','Ternera','PB'],['150 g','Espárragos','VH'],['10 g','Mantequilla','PL']]},
'Ternera (200 g) con puré de coliflor':{items:[['200 g','Ternera','PB'],['200 g','Coliflor','VH'],['10 g','Mantequilla','PL']]},
'Ternera (200 g) con ensalada verde y aguacate':{items:[['200 g','Ternera','PB'],['100 g','Lechuga','VH'],['½ ud','Aguacate','GR'],['1 cda','AOVE','GR']]},
'Pavo (200 g) con verduras salteadas en aceite de coco':{items:[['200 g','Pavo','PB'],['150 g','Verduras variadas','VH'],['1 cda','Aceite de coco','GR']]},
'Cerdo (200 g) con brócoli y salsa de soja':{items:[['200 g','Cerdo','PB'],['150 g','Brócoli','VH'],['1 cda','Salsa de soja','OT']]},
'Pollo (200 g) con ensalada de aguacate':{items:[['200 g','Pollo','PB'],['100 g','Lechuga','VH'],['½ ud','Aguacate','GR'],['1 cda','AOVE','GR']]},
'Huevos revueltos (4 uds) con espinaca y aguacate':{items:[['4 uds','Huevos','EG'],['50 g','Espinaca','VH'],['½ ud','Aguacate','GR'],['1 cda','AOVE','GR']]},
'Huevos revueltos (3 uds) con espinaca y aguacate':{items:[['3 uds','Huevos','EG'],['50 g','Espinaca','VH'],['½ ud','Aguacate','GR'],['1 cda','AOVE','GR']]},
'Tortilla de 3 huevos con champiñones':{items:[['3 uds','Huevos','EG'],['50 g','Champiñones','VH'],['1 cda','AOVE','GR']]},
'Tortilla de 4 huevos con champiñones':{items:[['4 uds','Huevos','EG'],['50 g','Champiñones','VH'],['1 cda','AOVE','GR']]},
'Huevos pochados (3 uds) sobre aguacate':{items:[['3 uds','Huevos','EG'],['½ ud','Aguacate','GR']]},
'Huevos pochados sobre aguacate':{items:[['2 uds','Huevos','EG'],['½ ud','Aguacate','GR']]},
'Revuelto de huevos (4 uds) con tocino':{items:[['4 uds','Huevos','EG'],['50 g','Tocino','PB'],['1 cda','AOVE','GR']]},
'Revuelto de huevos con tocino':{items:[['2 uds','Huevos','EG'],['50 g','Tocino','PB'],['1 cda','AOVE','GR']]},
'Salmón con ensalada de kale y nueces':{items:[['180 g','Salmón','PA'],['100 g','Kale','VH'],['20 g','Nueces','SE'],['1 cda','AOVE','GR']]},
'Ternera con puré de coliflor':{items:[['180 g','Ternera','PB'],['200 g','Coliflor','VH'],['10 g','Mantequilla','PL']]},
'Huevos Benedict con espinaca':{items:[['2 uds','Huevos','EG'],['100 g','Espinaca','VH'],['1 cda','AOVE','GR']]},
'Pavo con verduras salteadas en aceite de coco':{items:[['180 g','Pavo','PB'],['150 g','Verduras variadas','VH'],['1 cda','Aceite de coco','GR']]},
'Lubina con calabacín y pimiento':{items:[['180 g','Lubina','PA'],['100 g','Calabacín','VH'],['50 g','Pimiento','VH'],['1 cda','AOVE','GR']]},
'Omelette de queso y champiñones':{items:[['2 uds','Huevos','EG'],['50 g','Queso','PL'],['50 g','Champiñones','VH'],['1 cda','AOVE','GR']]},
'Omelette de queso (4 huevos) y champiñones':{items:[['4 uds','Huevos','EG'],['50 g','Queso','PL'],['50 g','Champiñones','VH'],['1 cda','AOVE','GR']]},
'Cerdo con brócoli y salsa de soja':{items:[['180 g','Cerdo','PB'],['150 g','Brócoli','VH'],['1 cda','Salsa de soja','OT']]},
'Pollo con ensalada de aguacate':{items:[['180 g','Pollo','PB'],['100 g','Lechuga','VH'],['½ ud','Aguacate','GR'],['1 cda','AOVE','GR']]},
'Huevos revueltos con salmón ahumado':{items:[['2 uds','Huevos','EG'],['60 g','Salmón ahumado','PA'],['1 cda','AOVE','GR']]},
'Huevos revueltos (4 uds) con salmón ahumado':{items:[['4 uds','Huevos','EG'],['60 g','Salmón ahumado','PA'],['1 cda','AOVE','GR']]},
'Ternera con espárragos y mantequilla':{items:[['180 g','Ternera','PB'],['150 g','Espárragos','VH'],['10 g','Mantequilla','PL']]},
'Merluza con espinacas salteadas':{items:[['180 g','Merluza','PA'],['100 g','Espinaca','VH'],['1 cda','AOVE','GR']]}
};

Object.assign(MEAL_DETAILS,M_MEAL_DETAILS);Object.assign(NDATA,M_NDATA);/* Sistema de sustitución 1×1 — solo dentro del mismo grupo */
const SUBSTITUTION_GROUPS={
'PA':['Huevos enteros','Entrecot / chuletón / solomillo','Chuletas de cerdo','Salmón','Caballa / sardinas','Bonito / atún / boquerones','Pulpo','Trucha'],
'PB':['Pechuga de pollo','Pechuga de pavo','Carne picada de ternera','Lomo / solomillo de cerdo','Filete magro de cerdo','Pescado blanco (merluza, lubina, dorada)'],
'PL':['Yogur griego natural','Yogur de cabra / oveja','Yogur de coco natural','Requesón','Queso fresco de vaca / cabra','Queso feta / burrata / mozzarella','Queso curado (cabra / oveja / parmesano)'],
'HA':['Arroz vaporizado','Patata','Boniato','Quinoa','Calabaza','Pasta (sarraceno / maíz / lenteja roja)','Ñoquis'],
'HB':['Pan Wasa','Tostaditas de trigo sarraceno','Pan integral (trigo / espelta / centeno)','Tortitas de arroz','Avena'],
'GR':['AOVE','Aceite de coco','Coco troceado','Aguacate','Aceitunas','Frutos secos (nueces, almendras, avellanas)','Semillas (chía, lino, sésamo, calabaza)'],
'FB':['Piña','Papaya','Manzana','Pera','Naranja','Mandarina','Kiwi'],
'FA':['Mango','Plátano','Dátiles','Uvas'],
'FR':['Fresas','Arándanos','Frambuesas'],
'VH':['Lechuga','Canónigos','Espinaca','Rúcula','Mezcla de hojas verdes'],
'VN':['Tomate','Tomate cherry','Cebolla','Pimiento','Calabacín','Pepino','Champiñones','Setas','Berenjena'],
'VR':['Calabaza','Zanahoria','Remolacha'],
'VC':['Brócoli','Coliflor','Coles','Coles de Bruselas'],
'VF':['Judías verdes','Espárragos trigueros']};
const GROUP_NAMES={'PA':'Proteína grasa','PB':'Proteína magra','PL':'Proteína láctea','HA':'HC complejos','HB':'HC derivados','GR':'Grasas','FB':'Fruta base','FA':'Fruta azucarada','FR':'Frutos rojos','VH':'Verdura hoja','VN':'Verdura neutra','VR':'Verdura raíz','VC':'Crucífera','VF':'Verdura fibrosa'};
const MEAL_ICONS={desayuno:'🌅',comida:'☀️',cena:'🌙',media_mañana:'🍎',merienda:'🥤',snack:'🥜',post_entreno:'💪'};
const MEAL_LABELS={desayuno:'Desayuno',comida:'Comida',cena:'Cena',media_mañana:'Media mañana',merienda:'Merienda',snack:'Snack',post_entreno:'Post-entreno'};

/* Storage */
function getUsers(){try{return JSON.parse(localStorage.getItem('vitaria_users')||'[]')}catch(e){return[]}}
function setUsers(u){try{localStorage.setItem('vitaria_users',JSON.stringify(u))}catch(e){}}
function getSession(){return localStorage.getItem('vitaria_session')}
function setSession(e){e?localStorage.setItem('vitaria_session',e):localStorage.removeItem('vitaria_session')}
function hash(pw){let h=5381;for(let i=0;i<pw.length;i++)h=((h*33)^pw.charCodeAt(i))>>>0;return'h'+h.toString(36)}
function pick(arr,alergias){let pool=arr;const no=alergias.filter(a=>a!=='Ninguna');if(no.length){const f=pool.filter(m=>!(ALLERGENS[m]||[]).some(a=>no.includes(a)));if(f.length)pool=f;}return pool[Math.floor(Math.random()*pool.length)];}
/* Menú semanal fijo — dieta de referencia Vitaria (niveles de HC por día) */
const DAY_TAGS={};
const FIXED_WEEK={
 Lunes:{desayuno:'Yogur griego proteico con cacao y frutos rojos',comida:'Pollo con arroz vaporizado y espinacas',cena:'Salmón con boniato asado y espárragos'},
 Martes:{desayuno:'Tostadas de espelta con huevos, pavo y aguacate',comida:'Quinoa con caballa, huevo y verduras salteadas',cena:'Pescado blanco con patata cocida y verduras'},
 Miércoles:{desayuno:'Yogur griego proteico con cacao y frutos rojos',comida:'Ternera especiada con boniato y espárragos',cena:'Poke bowl de salmón, quinoa y feta'},
 Jueves:{desayuno:'Tostadas de espelta con huevos, pavo y aguacate',comida:'Arroz vaporizado con caballa y huevo cocido',cena:'Fajitas integrales de pollo o pizza casera'},
 Viernes:{desayuno:'Porridge overnight de avena con plátano',comida:'Pollo con arroz vaporizado y aguacate',cena:'Hamburguesa completa con boniato asado'},
 Sábado:{desayuno:'Tostadas de espelta con huevos revueltos y aguacate',comida:'Ensaladilla rusa casera con caballa',cena:'Hamburguesa completa con boniato asado'},
 Domingo:{desayuno:'Ayuno metabólico / Bulletproof Coffee',comida:'Ternera con aguacate, rúcula y yogur griego',cena:'Pescado con puré vegetal y salsa de yogur'}
};
/* ===== Menús por tipo de dieta ===== */
const DIET_KETO={
  regular:{
    Lunes:{desayuno:'Huevos revueltos con espinaca y aguacate',comida:'Pechuga de pollo a la plancha con brócoli y aceite de oliva',snack:'Nueces mixtas (30 g)',cena:'Salmón al horno con espárragos'},
    Martes:{desayuno:'Tortilla de 3 huevos con champiñones',comida:'Ternera con ensalada verde y aguacate',snack:'Queso fresco con aceitunas',cena:'Merluza con calabacín salteado'},
    Miércoles:{desayuno:'Huevos pochados sobre aguacate',comida:'Pollo al horno con coles de bruselas',snack:'Palitos de apio con mantequilla de almendra',cena:'Atún a la plancha con espárragos'},
    Jueves:{desayuno:'Revuelto de huevos con tocino',comida:'Salmón con ensalada de kale y nueces',snack:'Guacamole con palitos de pepino',cena:'Ternera con puré de coliflor'},
    Viernes:{desayuno:'Huevos Benedict con espinaca',comida:'Pavo con verduras salteadas en aceite de coco',snack:'Aceitunas y queso',cena:'Lubina con calabacín y pimiento'},
    Sábado:{desayuno:'Omelette de queso y champiñones',comida:'Cerdo con brócoli y salsa de soja',snack:'Mantequilla de almendra (2 cdas)',cena:'Pollo con ensalada de aguacate'},
    Domingo:{desayuno:'Huevos revueltos con salmón ahumado',comida:'Ternera con espárragos y mantequilla',snack:'Nueces de Brasil (10 uds)',cena:'Merluza con espinacas salteadas'}
  },
  ganar:{
    Lunes:{desayuno:'Huevos revueltos (4 uds) con espinaca y aguacate',comida:'Pechuga de pollo (200 g) con brócoli y aceite de oliva',snack:'Nueces mixtas (50 g) + queso',cena:'Salmón (200 g) al horno con espárragos'},
    Martes:{desayuno:'Tortilla de 4 huevos con champiñones',comida:'Ternera (200 g) con ensalada verde y aguacate',snack:'Queso fresco (100 g) con aceitunas',cena:'Merluza (200 g) con calabacín salteado'},
    Miércoles:{desayuno:'Huevos pochados (3 uds) sobre aguacate',comida:'Pollo (200 g) al horno con coles de bruselas',snack:'Palitos de apio con mantequilla de almendra (3 cdas)',cena:'Atún (200 g) a la plancha con espárragos'},
    Jueves:{desayuno:'Revuelto de huevos (4 uds) con tocino',comida:'Salmón (200 g) con ensalada de kale y nueces',snack:'Guacamole (½ aguacate) con palitos de pepino',cena:'Ternera (200 g) con puré de coliflor'},
    Viernes:{desayuno:'Huevos Benedict (4 uds) con espinaca',comida:'Pavo (200 g) con verduras salteadas en aceite de coco',snack:'Aceitunas (15 uds) y queso (80 g)',cena:'Lubina (200 g) con calabacín y pimiento'},
    Sábado:{desayuno:'Omelette de queso (4 huevos) y champiñones',comida:'Cerdo (200 g) con brócoli y salsa de soja',snack:'Mantequilla de almendra (4 cdas)',cena:'Pollo (200 g) con ensalada de aguacate'},
    Domingo:{desayuno:'Huevos revueltos (4 uds) con salmón ahumado',comida:'Ternera (200 g) con espárragos y mantequilla',snack:'Nueces de Brasil (15 uds)',cena:'Merluza (200 g) con espinacas salteadas'}
  }
};
const DIET_VEGANO={
  regular:{
    Lunes:{desayuno:'Avena con leche de almendra y frutos rojos',comida:'Bowl de quinoa con garbanzos y verduras asadas',snack:'Fruta de temporada',cena:'Tofu salteado con verduras y salsa de soja'},
    Martes:{desayuno:'Batido verde de espinaca, plátano y leche de coco',comida:'Lentejas guisadas con verduras y arroz',snack:'Hummus con palitos de zanahoria',cena:'Tempeh a la plancha con ensalada y aguacate'},
    Miércoles:{desayuno:'Tostadas integrales con aguacate y semillas',comida:'Curry de garbanzos con espinaca y arroz',snack:'Nueces y fruta seca',cena:'Bowl de arroz con tofu teriyaki y verduras'},
    Jueves:{desayuno:'Pudín de chía con leche de coco y mango',comida:'Ensalada de lentejas con pimiento y cebolla',snack:'Edamame con sal',cena:'Pasta integral con salsa de tomate y alubias'},
    Viernes:{desayuno:'Smoothie bowl de açaí con granola vegana',comida:'Tacos de frijoles negros con guacamole',snack:'Barrita de frutos secos',cena:'Estofado de verduras con tempeh'},
    Sábado:{desayuno:'Pancakes de avena con sirope de arce',comida:'Bowl de arroz con tofu revuelto y verduras',snack:'Fruta con crema de cacahuete',cena:'Berberecho de garbanzos con espinaca'},
    Domingo:{desayuno:'Huevos de tofu con especias y aguacate',comida:'Paella de verduras y marisco vegetal',snack:'Hummus y pan pita',cena:'Lasaña de berenjenas con bechamel de anacardos'}
  },
  ganar:{
    Lunes:{desayuno:'Avena (80 g) con leche de almendra y frutos rojos',comida:'Bowl de quinoa (100 g en seco) con garbanzos (150 g) y verduras asadas',snack:'Fruta + crema de cacahuete (2 cdas)',cena:'Tofu (200 g) salteado con verduras y salsa de soja'},
    Martes:{desayuno:'Batido verde de espinaca, plátano y leche de coco + avena',comida:'Lentejas (100 g en seco) guisadas con verduras y arroz',snack:'Hummus (100 g) con palitos de zanahoria',cena:'Tempeh (200 g) a la plancha con ensalada y aguacate'},
    Miércoles:{desayuno:'Tostadas integrales (3 uds) con aguacate y semillas',comida:'Curry de garbanzos (150 g) con espinaca y arroz (80 g en seco)',snack:'Nueces (40 g) y fruta seca',cena:'Bowl de arroz (80 g en seco) con tofu teriyaki (200 g) y verduras'},
    Jueves:{desayuno:'Pudín de chía (40 g) con leche de coco y mango',comida:'Ensalada de lentejas (100 g en seco) con pimiento y cebolla',snack:'Edamame (150 g) con sal',cena:'Pasta integral (80 g en seco) con salsa de tomate y alubias (150 g)'},
    Viernes:{desayuno:'Smoothie bowl de açaí con granola vegana (50 g)',comida:'Tacos de frijoles negros (150 g) con guacamole',snack:'Barrita de frutos secos + fruta',cena:'Estofado de verduras con tempeh (200 g)'},
    Sábado:{desayuno:'Pancakes de avena (80 g) con sirope de arce',comida:'Bowl de arroz (80 g en seco) con tofu revuelto (200 g) y verduras',snack:'Fruta con crema de cacahuete (2 cdas)',cena:'Berberecho de garbanzos (150 g) con espinaca'},
    Domingo:{desayuno:'Huevos de tofu (200 g) con especias y aguacate',comida:'Paella de verduras y marisco vegetal (80 g arroz en seco)',snack:'Hummus (100 g) y pan pita',cena:'Lasaña de berenjenas con bechamel de anacardos'}
  }
};
const DIET_MED_WEEKS=[
{Lunes:{desayuno:'Tostadas integrales con tomate y aceite de oliva',comida:'Salmón a la plancha con quinoa y verduras',cena:'Merluza al horno con patata y cebolla'},Martes:{desayuno:'Huevos revueltos con espinaca y queso feta',comida:'Ensalada griega con pollo a la plancha',cena:'Pasta integral con salsa de tomate y albahaca'},Miércoles:{desayuno:'Yogur griego con miel y nueces',comida:'Paella de marisco y verduras',cena:'Lubina al horno con limón y hierbas'},Jueves:{desayuno:'Tostadas con aguacate y huevo pochado',comida:'Guiso de garbanzos con espinaca y chorizo',cena:'Pollo al horno con aceitunas y limón'},Viernes:{desayuno:'Smoothie de frutos rojos y yogur',comida:'Ensalada de atún con huevo cocido y verduras',cena:'Calamares a la plancha con ensalada'},Sábado:{desayuno:'Tortilla española con ensalada',comida:'Arroz con verduras y marisco',cena:'Sardinas a la plancha con pimientos'},Domingo:{desayuno:'Huevos Benedict con espinaca',comida:'Cordero al horno con verduras mediterráneas',cena:'Bacalao al pil-pil con patatas'}},
{Lunes:{desayuno:'Porridge de avena con nueces y miel',comida:'Pollo al horno con patata y romero',cena:'Sardinas a la parrilla con ensalada'},Martes:{desayuno:'Tostadas de centeno con aguacate y huevo',comida:'Arroz integral con verduras y pollo',cena:'Merluza con espinacas y ajo'},Miércoles:{desayuno:'Yogur griego con frutos rojos',comida:'Lentejas guisadas con verduras',cena:'Salmón al horno con espárragos'},Jueves:{desayuno:'Huevos pochados con espinaca',comida:'Pasta integral con atún y tomate',cena:'Pollo a la plancha con quinoa'},Viernes:{desayuno:'Tostadas integrales con pavo y aguacate',comida:'Ensalada de garbanzos con verduras asadas',cena:'Lubina al horno con limón'},Sábado:{desayuno:'Tortilla de espinacas',comida:'Paella de pollo y verduras',cena:'Sardinas con pimientos asados'},Domingo:{desayuno:'Smoothie de frutos rojos',comida:'Cordero al horno con patata',cena:'Bacalao con verduras al horno'}},
{Lunes:{desayuno:'Avena con plátano y canela',comida:'Salmón a la plancha con boniato',cena:'Merluza con calabacín y ajo'},Martes:{desayuno:'Tostadas integrales con tomate',comida:'Pollo con arroz y verduras',cena:'Sardinas a la plancha con ensalada'},Miércoles:{desayuno:'Yogur con miel y nueces',comida:'Guiso de garbanzos con espinaca',cena:'Lubina al horno con limón y hierbas'},Jueves:{desayuno:'Huevos revueltos con espinaca',comida:'Pasta integral con verduras',cena:'Salmón con espárragos'},Viernes:{desayuno:'Tostadas de centeno con huevo',comida:'Ensalada de atún con verduras',cena:'Pollo al horno con aceitunas'},Sábado:{desayuno:'Porridge de avena',comida:'Arroz con marisco',cena:'Merluza con patata asada'},Domingo:{desayuno:'Tortilla española',comida:'Cordero con verduras',cena:'Bacalao al pil-pil'}},
{Lunes:{desayuno:'Huevos revueltos con espinaca',comida:'Salmón con quinoa y verduras',cena:'Sardinas a la parrilla'},Martes:{desayuno:'Tostadas integrales con aguacate',comida:'Pollo al horno con boniato',cena:'Merluza con espinacas'},Miércoles:{desayuno:'Yogur griego con frutos rojos',comida:'Lentejas con verduras y arroz',cena:'Lubina al horno con limón'},Jueves:{desayuno:'Porridge de avena con nueces',comida:'Pasta integral con atún',cena:'Pollo a la plancha con quinoa'},Viernes:{desayuno:'Tostadas de centeno con huevo',comida:'Ensalada de garbanzos',cena:'Salmón con espárragos'},Sábado:{desayuno:'Tortilla de espinacas',comida:'Arroz con verduras',cena:'Sardinas con pimientos'},Domingo:{desayuno:'Smoothie de frutos rojos',comida:'Cordero al horno',cena:'Bacalao con verduras'}}
];
const DIET_MASS_MED_WEEKS=[
{Lunes:{desayuno:'Tostadas integrales (3 uds) con tomate y aceite de oliva',comida:'Salmón (200 g) a la plancha con quinoa (80 g en seco) y verduras',snack:'Fruta + frutos secos (40 g)',cena:'Merluza (200 g) al horno con patata (200 g) y cebolla'},Martes:{desayuno:'Huevos revueltos (3 uds) con espinaca y queso feta',comida:'Ensalada griega con pollo (200 g) a la plancha',snack:'Aceitunas (15 uds) y frutos secos (30 g)',cena:'Pasta integral (80 g en seco) con salsa de tomate y albahaca'},Miércoles:{desayuno:'Yogur griego (200 g) con miel y nueces (30 g)',comida:'Paella de marisco y verduras (100 g arroz en seco)',snack:'Hummus (100 g) con pan pita',cena:'Lubina (200 g) al horno con limón y hierbas'},Jueves:{desayuno:'Tostadas (3 uds) con aguacate y huevo pochado',comida:'Guiso de garbanzos (150 g) con espinaca y chorizo',snack:'Tomates cherry (150 g) con mozzarella (100 g)',cena:'Pollo (200 g) al horno con aceitunas y limón'},Viernes:{desayuno:'Smoothie de frutos rojos y yogur + avena (40 g)',comida:'Ensalada de atún (150 g) con huevo cocido y verduras',snack:'Queso fresco (100 g) con miel',cena:'Calamares (200 g) a la plancha con ensalada'},Sábado:{desayuno:'Tortilla española (4 huevos) con ensalada',comida:'Arroz (80 g en seco) con verduras y marisco',snack:'Fruta seca (40 g) y almendras (30 g)',cena:'Sardinas (200 g) a la plancha con pimientos'},Domingo:{desayuno:'Huevos Benedict (4 uds) con espinaca',comida:'Cordero (200 g) al horno con verduras mediterráneas',snack:'Yogur griego (200 g) con fruta',cena:'Bacalao (200 g) al pil-pil con patatas'}},
{Lunes:{desayuno:'Porridge de avena (80 g) con nueces (30 g) y miel',comida:'Pollo al horno (200 g) con patata (200 g) y romero',snack:'Fruta + almendras (30 g)',cena:'Sardinas (200 g) a la parrilla con ensalada y aceite de oliva'},Martes:{desayuno:'Tostadas de centeno (3 uds) con aguacate (½) y huevo',comida:'Arroz integral (80 g en seco) con verduras y pollo (200 g)',snack:'Hummus (100 g) con pan pita',cena:'Merluza (200 g) con espinacas y ajo'},Miércoles:{desayuno:'Yogur griego (200 g) con frutos rojos y granola (30 g)',comida:'Lentejas (100 g en seco) guisadas con verduras',snack:'Nueces (40 g) y fruta',cena:'Salmón (200 g) al horno con espárragos'},Jueves:{desayuno:'Huevos pochados (3 uds) con espinaca y tostada',comida:'Pasta integral (80 g en seco) con atún (150 g) y tomate',snack:'Queso fresco (80 g) con fruta',cena:'Pollo (200 g) a la plancha con quinoa (80 g en seco)'},Viernes:{desayuno:'Tostadas integrales (3 uds) con pavo (80 g) y aguacate',comida:'Ensalada de garbanzos (150 g) con verduras asadas',snack:'Barrita de frutos secos + fruta',cena:'Lubina (200 g) al horno con limón y hierbas'},Sábado:{desayuno:'Tortilla de espinacas (4 huevos)',comida:'Paella de pollo (200 g) y verduras (100 g arroz en seco)',snack:'Fruta seca (40 g) y almendras (30 g)',cena:'Sardinas (200 g) con pimientos asados'},Domingo:{desayuno:'Smoothie de frutos rojos (300 ml) + avena (40 g)',comida:'Cordero (200 g) al horno con patata (200 g)',snack:'Yogur griego (200 g) con miel',cena:'Bacalao (200 g) con verduras al horno'}},
{Lunes:{desayuno:'Avena (80 g) con plátano y canela + nueces (30 g)',comida:'Salmón (200 g) a la plancha con boniato (200 g)',snack:'Hummus (100 g) con pan pita',cena:'Merluza (200 g) con calabacín y ajo'},Martes:{desayuno:'Tostadas integrales (3 uds) con tomate y mozzarella',comida:'Pollo (200 g) con arroz (80 g) y verduras',snack:'Fruta + almendras (30 g)',cena:'Sardinas (200 g) a la plancha con ensalada'},Miércoles:{desayuno:'Yogur (200 g) con miel y nueces (30 g)',comida:'Guiso de garbanzos (150 g) con espinaca',snack:'Queso fresco (80 g) con fruta',cena:'Lubina (200 g) al horno con limón y hierbas'},Jueves:{desayuno:'Huevos revueltos (3 uds) con espinaca',comida:'Pasta integral (80 g en seco) con verduras',snack:'Nueces (40 g) y fruta',cena:'Salmón (200 g) con espárragos'},Viernes:{desayuno:'Tostadas de centeno (3 uds) con huevo y aguacate',comida:'Ensalada de atún (150 g) con verduras',snack:'Barrita de frutos secos + fruta',cena:'Pollo (200 g) al horno con aceitunas'},Sábado:{desayuno:'Porridge de avena (80 g)',comida:'Arroz (80 g en seco) con marisco',snack:'Hummus (100 g) con pan pita',cena:'Merluza (200 g) con patata asada'},Domingo:{desayuno:'Tortilla española (4 huevos)',comida:'Cordero (200 g) con verduras',snack:'Yogur griego (200 g) con fruta',cena:'Bacalao (200 g) al pil-pil'}},
{Lunes:{desayuno:'Huevos revueltos (3 uds) con espinaca',comida:'Salmón (200 g) con quinoa (80 g en seco) y verduras',snack:'Fruta + almendras (30 g)',cena:'Sardinas (200 g) a la parrilla'},Martes:{desayuno:'Tostadas integrales (3 uds) con aguacate',comida:'Pollo (200 g) al horno con boniato (200 g)',snack:'Nueces (40 g) y fruta',cena:'Merluza (200 g) con espinacas'},Miércoles:{desayuno:'Yogur griego (200 g) con frutos rojos',comida:'Lentejas (100 g en seco) con verduras y arroz (80 g)',snack:'Hummus (100 g) con pan pita',cena:'Lubina (200 g) al horno con limón'},Jueves:{desayuno:'Porridge de avena (80 g) con nueces (30 g)',comida:'Pasta integral (80 g en seco) con atún (150 g)',snack:'Queso fresco (80 g) con fruta',cena:'Pollo (200 g) a la plancha con quinoa (80 g)'},Viernes:{desayuno:'Tostadas de centeno (3 uds) con huevo',comida:'Ensalada de garbanzos (150 g)',snack:'Barrita de frutos secos + fruta',cena:'Salmón (200 g) con espárragos'},Sábado:{desayuno:'Tortilla de espinacas (4 huevos)',comida:'Arroz (80 g en seco) con verduras',snack:'Fruta seca (40 g) y almendras (30 g)',cena:'Sardinas (200 g) con pimientos'},Domingo:{desayuno:'Smoothie de frutos rojos (300 ml)',comida:'Cordero (200 g) al horno',snack:'Yogur griego (200 g) con miel',cena:'Bacalao (200 g) con verduras'}}
];
const DIET_MEDITERRANEO={regular:DIET_MED_WEEKS,ganar:DIET_MASS_MED_WEEKS};
const DIET_PALEO={
  regular:{
    Lunes:{desayuno:'Huevos revueltos con espinaca y aguacate',comida:'Pechuga de pollo a la plancha con brócoli',cena:'Salmón al horno con espárragos'},
    Martes:{desayuno:'Tortilla de 3 huevos con champiñones',comida:'Ternera con ensalada verde y aguacate',cena:'Merluza con calabacín salteado'},
    Miércoles:{desayuno:'Huevos pochados sobre aguacate',comida:'Pollo al horno con coles de bruselas',cena:'Atún a la plancha con espárragos'},
    Jueves:{desayuno:'Revuelto de huevos con tocino',comida:'Salmón con ensalada de kale y nueces',cena:'Ternera con puré de coliflor'},
    Viernes:{desayuno:'Huevos Benedict con espinaca',comida:'Pavo con verduras salteadas en aceite de coco',cena:'Lubina con calabacín y pimiento'},
    Sábado:{desayuno:'Omelette de queso y champiñones',comida:'Cerdo con brócoli y salsa de soja',cena:'Pollo con ensalada de aguacate'},
    Domingo:{desayuno:'Huevos revueltos con salmón ahumado',comida:'Ternera con espárragos y mantequilla',cena:'Merluza con espinacas salteadas'}
  },
  ganar:{
    Lunes:{desayuno:'Huevos revueltos (4 uds) con espinaca y aguacate',comida:'Pechuga de pollo (200 g) con brócoli y aceite de oliva',snack:'Nueces mixtas (50 g) + queso',cena:'Salmón (200 g) al horno con espárragos'},
    Martes:{desayuno:'Tortilla de 4 huevos con champiñones',comida:'Ternera (200 g) con ensalada verde y aguacate',snack:'Queso fresco (100 g) con aceitunas',cena:'Merluza (200 g) con calabacín salteado'},
    Miércoles:{desayuno:'Huevos pochados (3 uds) sobre aguacate',comida:'Pollo (200 g) al horno con coles de bruselas',snack:'Palitos de apio con mantequilla de almendra (3 cdas)',cena:'Atún (200 g) a la plancha con espárragos'},
    Jueves:{desayuno:'Revuelto de huevos (4 uds) con tocino',comida:'Salmón (200 g) con ensalada de kale y nueces',snack:'Guacamole (½ aguacate) con palitos de pepino',cena:'Ternera (200 g) con puré de coliflor'},
    Viernes:{desayuno:'Huevos Benedict (4 uds) con espinaca',comida:'Pavo (200 g) con verduras salteadas en aceite de coco',snack:'Aceitunas (15 uds) y queso (80 g)',cena:'Lubina (200 g) con calabacín y pimiento'},
    Sábado:{desayuno:'Omelette de queso (4 huevos) y champiñones',comida:'Cerdo (200 g) con brócoli y salsa de soja',snack:'Mantequilla de almendra (4 cdas)',cena:'Pollo (200 g) con ensalada de aguacate'},
    Domingo:{desayuno:'Huevos revueltos (4 uds) con salmón ahumado',comida:'Ternera (200 g) con espárragos y mantequilla',snack:'Nueces de Brasil (15 uds)',cena:'Merluza (200 g) con espinacas salteadas'}
  }
};
const DIET_VEGETARIANO={
  regular:{
    Lunes:{desayuno:'Tostadas integrales con huevo revuelto y aguacate',comida:'Pasta integral con verduras y queso parmesano',snack:'Fruta de temporada',cena:'Tortilla de espinacas y champiñones con ensalada'},
    Martes:{desayuno:'Yogur griego con granola y frutos rojos',comida:'Ensalada de quinoa con verduras asadas y feta',snack:'Nueces y fruta seca',cena:'Risotto de champiñones y parmesano'},
    Miércoles:{desayuno:'Huevos pochados sobre tostada con tomate',comida:'Curry de verduras con arroz basmati',snack:'Hummus con pan pita',cena:'Lasaña de verduras con bechamel'},
    Jueves:{desayuno:'Smoothie de plátano, avena y leche de almendra',comida:'Ensalada de garbanzos con espinaca y queso de cabra',snack:'Queso fresco con miel',cena:'Pizza integral con verduras y mozzarella'},
    Viernes:{desayuno:'Pancakes de avena con miel y fruta',comida:'Bowl de arroz con tofu, aguacate y verduras',snack:'Edamame con sal',cena:'Crema de calabaza con semillas y pan integral'},
    Sábado:{desayuno:'Tortitas de huevo con espinacas y champiñones',comida:'Burrito de frijoles, arroz, queso y guacamole',snack:'Fruta con crema de cacahuete',cena:'Fajitas de verduras con tortillas integrales'},
    Domingo:{desayuno:'Huevos Benedict vegetarianos con espinaca',comida:'Risotto de espárragos y parmesano',snack:'Yogur griego con fruta',cena:'Tarta de verduras con masa filo'}
  },
  ganar:{
    Lunes:{desayuno:'Tostadas integrales (3 uds) con huevo revuelto (3 uds) y aguacate',comida:'Pasta integral (80 g en seco) con verduras y queso parmesano (40 g)',snack:'Fruta + frutos secos (40 g)',cena:'Tortilla de espinacas (4 huevos) y champiñones con ensalada'},
    Martes:{desayuno:'Yogur griego (200 g) con granola (50 g) y frutos rojos',comida:'Ensalada de quinoa (80 g en seco) con verduras asadas y feta (60 g)',snack:'Nueces (40 g) y fruta seca',cena:'Risotto de champiñones (80 g arroz) y parmesano (40 g)'},
    Miércoles:{desayuno:'Huevos pochados (3 uds) sobre tostada con tomate',comida:'Curry de verduras con arroz basmati (80 g en seco)',snack:'Hummus (100 g) con pan pita',cena:'Lasaña de verduras (4 láminas) con bechamel'},
    Jueves:{desayuno:'Smoothie de plátano, avena (60 g) y leche de almendra',comida:'Ensalada de garbanzos (150 g) con espinaca y queso de cabra (60 g)',snack:'Queso fresco (100 g) con miel',cena:'Pizza integral (2 porciones) con verduras y mozzarella'},
    Viernes:{desayuno:'Pancakes de avena (80 g) con miel y fruta',comida:'Bowl de arroz (80 g en seco) con tofu (150 g), aguacate y verduras',snack:'Edamame (150 g) con sal',cena:'Crema de calabaza (300 ml) con semillas y pan integral'},
    Sábado:{desayuno:'Tortitas de huevo (4 uds) con espinacas y champiñones',comida:'Burrito de frijoles (150 g), arroz (80 g), queso y guacamole',snack:'Fruta con crema de cacahuete (2 cdas)',cena:'Fajitas de verduras (4 tortillas) con tortillas integrales'},
    Domingo:{desayuno:'Huevos Benedict vegetarianos (4 uds) con espinaca',comida:'Risotto de espárragos (80 g arroz) y parmesano (40 g)',snack:'Yogur griego (200 g) con fruta',cena:'Tarta de verduras con masa filo (2 porciones)'}
  }
};
const DIET_PLANS={cetogenica:DIET_KETO,vegana:DIET_VEGANO,mediterranea:DIET_MEDITERRANEO,vegetariana:DIET_VEGETARIANO,paleo:DIET_PALEO};
function savePlanHistory(u){
  if(!u.menu||!u.menu.length)return;
  if(!u.planHistory)u.planHistory=[];
  const hasMeals=u.menu.some(d=>d&&(d.desayuno||d.comida||d.cena));
  if(!hasMeals)return;
  u.planHistory.push({fecha:new Date().toISOString().slice(0,10),menu:JSON.parse(JSON.stringify(u.menu))});
  if(u.planHistory.length>5)u.planHistory=u.planHistory.slice(-5);
}
function newMenu(tipo,alergias,wi,objetivo,dieta,user){
  dieta=dieta||'todos';
  const numComidas=user&&user.numComidas||4;
  let src;
  if(dieta!=='todos'&&DIET_PLANS[dieta]){
    const objKey=objetivo==='Regular el peso'?'regular':objetivo==='Ganar masa muscular'?'ganar':'regular';
    if(DIET_PLANS[dieta][objKey])src=DIET_PLANS[dieta][objKey];
  }
  if(!src)src=objetivo==='Regular el peso'?WEIGHT_WEEKS:objetivo==='Ganar masa muscular'?MASS_WEEKS:WEEKS;
  if(!Array.isArray(src))src=[src];
  const w=src[(wi||0)%src.length];
  alergias=(alergias||[]).filter(a=>a!=='Ninguna');
  const noLike=parseNoComer(user&&user.noComer);
  const slotCfg=makeSlots(numComidas);
  const mts=slotCfg.list;
  const pcts=slotCfg.pct;
  let targetCal=null;
  if(user&&user.physical){
    const ph=user.physical;
    const bmr=calcBMR(ph.sexo||'hombre',ph.peso||70,ph.altura||175,ph.edad||30);
    const mult=activityMultiplier(ph.actividad||'moderado',user.entreno?.dias||3,user.entreno?.duracion||60,user.entreno?.tipo||'gimnasio');
    const tdee=calcTDEE(bmr,mult);
    targetCal=adjustCalories(tdee,user.objetivo||objetivo);
  }
  const allPool=[];
  src.forEach(wk=>DIAS.forEach(d=>{mts.forEach(sl=>{const c=wk[d]&&wk[d][sl];if(c&&!allPool.includes(c))allPool.push(c);});}));
  const usageCount=new Map();
  function pickFromPool(pool,dayIdx,slot,dayUsed){
    const available=pool.filter(m=>!dishHasAllergen(m,alergias)&&!dishHasNoLike(m,noLike)&&(dayUsed?(!dayUsed.has(m)):true));
    if(!available.length)return null;
    const scored=available.map(m=>{
      let score=0;
      const cnt=usageCount.get(m)||0;
      score-=cnt*200;
      if(cnt===0)score+=30;
      score+=Math.random()*10;
      return{m,score};
    });
    scored.sort((a,b)=>b.score-a.score);
    return scored[0].m;
  }
  const _result=DIAS.map((dia,i)=>{
    const dayMeals={};
    const dayUsed=new Set();
    mts.forEach((k,si)=>{
      let n=w[dia]&&w[dia][k];
      if(!n){
        const fallbackSlots=['desayuno','comida','merienda','cena','media_mañana','snack','post_entreno'];
        for(const fb of fallbackSlots){
          if(w[dia]&&w[dia][fb]&&mts.includes(fb)){n=w[dia][fb];break;}
        }
      }
      if(dayUsed.has(n))n=null;
      if(!n){
        const replacement=pickFromPool(allPool,i,k,dayUsed);
        if(replacement)n=replacement;
      }
      if(!n)return;
      if(dishHasAllergen(n,alergias)||dishHasNoLike(n,noLike)){
        const replacement=pickFromPool(allPool,i,k,dayUsed);
        if(replacement)n=replacement;
      }
      if(!n||dayUsed.has(n))return;
      dayUsed.add(n);
      usageCount.set(n,(usageCount.get(n)||0)+1);
      if(targetCal){
        dayMeals[k]={n,cal:Math.round(targetCal*(pcts[k]||.20))};
      }else{
        dayMeals[k]=n;
      }
    });
    const dayTotal=targetCal?mts.reduce((s,k)=>s+(dayMeals[k]?.cal||0),0):0;
    const result={dia,tag:''};
    mts.forEach(k=>{result[k]=dayMeals[k]||'';});
    result.dayCal=dayTotal||null;
    return result;
  });
  debugPlan('GENERADO (newMenu)',_result);
  return _result;
}
/* 4 semanas en bucle — variantes creadas con sustituciones 1×1 del mismo grupo */
const DERIVED={
'Yogur de cabra proteico con fresas y nueces':['Yogur griego proteico con cacao y frutos rojos',{'Yogur griego natural':'Yogur de cabra / oveja','Frutos rojos':'Fresas','Crema de almendras / nueces de Brasil / anacardos':'Frutos secos (nueces, almendras, avellanas)','Chocolate negro >85%':null,'Cacao puro sin azúcar':null}],
'Pavo con quinoa y brócoli':['Pollo con arroz vaporizado y espinacas',{'Pechuga de pollo especiada (cúrcuma y pimienta)':'Pechuga de pavo','Arroz vaporizado en seco (~240 g cocido)':'Quinoa en seco (~240 g cocida)'}],
'Trucha con patata asada y judías verdes':['Salmón con boniato asado y espárragos',{'Salmón fresco con limón y especias':'Trucha','Patata / 250 g boniato asado o airfryer':'Patata asada','Espárragos trigueros + champiñones salteados':'Judías verdes','Yogur de cabra + cacao puro + frutos rojos':null}],
'Pan Wasa con salmón ahumado y aguacate':['Tostadas de espelta con huevos, pavo y aguacate',{'Pan integral de espelta o centeno (2 rebanadas)':'Pan Wasa','Pavo en lonchas / salmón ahumado / jamón ibérico':'Salmón ahumado'}],
'Boniato con atún y huevo cocido':['Arroz vaporizado con caballa y huevo cocido',{'Arroz vaporizado en seco':'Boniato asado','Caballa / sardinas':'Bonito / atún / boquerones'}],
'Lubina con calabaza asada y espinacas':['Pescado blanco con patata cocida y verduras',{'Pescado blanco (merluza, lubina, dorada)':'Lubina','Patata cocida / horno / airfryer':'Calabaza asada','Espinacas y brócoli de acompañamiento':'Espinacas salteadas'}],
'Solomillo de cerdo con boniato y espárragos':['Ternera especiada con boniato y espárragos',{'Carne picada de ternera especiada + tomate natural sin azúcar':'Solomillo de cerdo'}],
'Poke bowl de atún, quinoa y mozzarella':['Poke bowl de salmón, quinoa y feta',{'Salmón especiado (sal, pimienta, limón)':'Atún en dados','Queso feta desmenuzado':'Mozzarella'}],
'Patata con sardinas y verduras salteadas':['Arroz vaporizado con caballa y huevo cocido',{'Arroz vaporizado en seco':'Patata cocida'}],
'Pavo con arroz vaporizado y aguacate':['Pollo con arroz vaporizado y aguacate',{'Pechuga de pollo especiada (cúrcuma y pimienta)':'Pechuga de pavo'}],
'Hamburguesa de cerdo con boniato asado':['Hamburguesa completa con boniato asado',{'Carne picada de ternera':'Carne picada de cerdo'}],
'Requesón con miel, nueces y fresas':['Yogur griego proteico con cacao y frutos rojos',{'Yogur griego natural':'Requesón','Proteína en polvo':null,'Cacao puro sin azúcar':null,'Frutos rojos':'Fresas','Crema de almendras / nueces de Brasil / anacardos':'Frutos secos (nueces, almendras, avellanas)','Chocolate negro >85%':null}],
'Ternera con patata y espinacas':['Pollo con arroz vaporizado y espinacas',{'Pechuga de pollo especiada (cúrcuma y pimienta)':'Carne picada de ternera','Arroz vaporizado en seco (~240 g cocido)':'Patata cocida'}],
'Sardinas con boniato y ensalada verde':['Salmón con boniato asado y espárragos',{'Salmón fresco con limón y especias':'Sardinas','Patata / 250 g boniato asado o airfryer':'Boniato asado','Espárragos trigueros + champiñones salteados':'Mezcla de hojas verdes','Yogur de cabra + cacao puro + frutos rojos':null}],
'Tortitas de arroz con huevo y pavo':['Tostadas de espelta con huevos, pavo y aguacate',{'Pan integral de espelta o centeno (2 rebanadas)':'Tortitas de arroz','Huevos revueltos':'Huevos cocidos'}],
'Calabaza con caballa y huevo':['Arroz vaporizado con caballa y huevo cocido',{'Arroz vaporizado en seco':'Calabaza asada'}],
'Filete magro de cerdo con quinoa y verduras':['Quinoa con caballa, huevo y verduras salteadas',{'Caballa / bonito':'Filete magro de cerdo'}],
'Pollo con ñoquis y espinacas':['Pollo con arroz vaporizado y aguacate',{'Arroz vaporizado en seco (~300 g cocido)':'Ñoquis de patata (250 g)'}],
'Hamburguesa de pollo con boniato asado':['Hamburguesa completa con boniato asado',{'Carne picada de ternera':'Carne picada de pollo'}],
'Entrecot con ensalada y yogur griego':['Ternera con aguacate, rúcula y yogur griego',{'Carne picada / entrecot / chuletas de ternera':'Entrecot'}],
'Yogur de coco con mango y semillas':['Yogur griego proteico con cacao y frutos rojos',{'Yogur griego natural':'Yogur de coco natural','Frutos rojos':'Mango','Chocolate negro >85%':null,'Cacao puro sin azúcar':null}],
'Pollo con pasta de lenteja roja y brócoli':['Pollo con arroz vaporizado y espinacas',{'Arroz vaporizado en seco (~240 g cocido)':'Pasta de lenteja roja (80 g en seco)'}],
'Salmón con calabaza y espárragos':['Salmón con boniato asado y espárragos',{'Patata / 250 g boniato asado o airfryer':'Calabaza asada'}],
'Arroz con bonito y verduras':['Arroz vaporizado con caballa y huevo cocido',{'Caballa / sardinas':'Bonito / atún / boquerones'}],
'Bowl de trucha, patata y feta':['Poke bowl de salmón, quinoa y feta',{'Salmón especiado (sal, pimienta, limón)':'Trucha','Quinoa en seco, lavada previamente':'Patata cocida en dados'}],
'Tostadas de centeno con huevos y salmón ahumado':['Tostadas de espelta con huevos, pavo y aguacate',{'Pavo en lonchas / salmón ahumado / jamón ibérico':'Salmón ahumado','Pan integral de espelta o centeno (2 rebanadas)':'Pan integral de centeno (2 rebanadas)'}],
'Hamburguesa completa con patata asada':['Hamburguesa completa con boniato asado',{'Boniato asado':'Patata asada'}]
};
Object.keys(DERIVED).forEach(k=>{const[p,sw]=DERIVED[k];const pd=MEAL_DETAILS[p];if(!pd)return;MEAL_DETAILS[k]={items:pd.items.map(it=>{const nn=sw[it[1]];return nn?[it[0],nn,it[2],it[3],it[4]]:(nn===null?null:it);}).filter(Boolean),prep:pd.prep,note:pd.note};if(!NDATA[k])NDATA[k]=NDATA[p];});
const WEEKS=[
{Lunes:{desayuno:'Yogur griego proteico con cacao y frutos rojos',comida:'Pollo con arroz vaporizado y espinacas',cena:'Salmón con boniato asado y espárragos'},Martes:{desayuno:'Tostadas de espelta con huevos, pavo y aguacate',comida:'Quinoa con caballa, huevo y verduras salteadas',cena:'Pescado blanco con patata cocida y verduras'},Miércoles:{desayuno:'Yogur griego proteico con cacao y frutos rojos',comida:'Ternera especiada con boniato y espárragos',cena:'Poke bowl de salmón, quinoa y feta'},Jueves:{desayuno:'Tostadas de espelta con huevos, pavo y aguacate',comida:'Arroz vaporizado con caballa y huevo cocido',cena:'Fajitas integrales de pollo o pizza casera'},Viernes:{desayuno:'Porridge overnight de avena con plátano',comida:'Pollo con arroz vaporizado y aguacate',cena:'Hamburguesa completa con boniato asado'},Sábado:{desayuno:'Tostadas de espelta con huevos revueltos y aguacate',comida:'Ensaladilla rusa casera con caballa',cena:'Hamburguesa completa con boniato asado'},Domingo:{desayuno:'Ayuno metabólico / Bulletproof Coffee',comida:'Ternera con aguacate, rúcula y yogur griego',cena:'Pescado con puré vegetal y salsa de yogur'}},
{Lunes:{desayuno:'Yogur de cabra proteico con fresas y nueces',comida:'Pavo con quinoa y brócoli',cena:'Trucha con patata asada y judías verdes'},Martes:{desayuno:'Pan Wasa con salmón ahumado y aguacate',comida:'Boniato con atún y huevo cocido',cena:'Lubina con calabaza asada y espinacas'},Miércoles:{desayuno:'Yogur griego proteico con cacao y frutos rojos',comida:'Solomillo de cerdo con boniato y espárragos',cena:'Poke bowl de atún, quinoa y mozzarella'},Jueves:{desayuno:'Tostadas de espelta con huevos, pavo y aguacate',comida:'Patata con sardinas y verduras salteadas',cena:'Fajitas integrales de pollo o pizza casera'},Viernes:{desayuno:'Porridge overnight de avena con plátano',comida:'Pavo con arroz vaporizado y aguacate',cena:'Hamburguesa de cerdo con boniato asado'},Sábado:{desayuno:'Tostadas de espelta con huevos revueltos y aguacate',comida:'Ensaladilla rusa casera con caballa',cena:'Hamburguesa completa con boniato asado'},Domingo:{desayuno:'Ayuno metabólico / Bulletproof Coffee',comida:'Ternera con aguacate, rúcula y yogur griego',cena:'Pescado con puré vegetal y salsa de yogur'}},
{Lunes:{desayuno:'Requesón con miel, nueces y fresas',comida:'Ternera con patata y espinacas',cena:'Sardinas con boniato y ensalada verde'},Martes:{desayuno:'Tortitas de arroz con huevo y pavo',comida:'Calabaza con caballa y huevo',cena:'Pescado blanco con patata cocida y verduras'},Miércoles:{desayuno:'Yogur griego proteico con cacao y frutos rojos',comida:'Filete magro de cerdo con quinoa y verduras',cena:'Poke bowl de salmón, quinoa y feta'},Jueves:{desayuno:'Tostadas de espelta con huevos, pavo y aguacate',comida:'Quinoa con caballa, huevo y verduras salteadas',cena:'Fajitas integrales de pollo o pizza casera'},Viernes:{desayuno:'Porridge overnight de avena con plátano',comida:'Pollo con ñoquis y espinacas',cena:'Hamburguesa de pollo con boniato asado'},Sábado:{desayuno:'Tostadas de espelta con huevos revueltos y aguacate',comida:'Ensaladilla rusa casera con caballa',cena:'Hamburguesa completa con boniato asado'},Domingo:{desayuno:'Ayuno metabólico / Bulletproof Coffee',comida:'Entrecot con ensalada y yogur griego',cena:'Pescado con puré vegetal y salsa de yogur'}},
{Lunes:{desayuno:'Yogur de coco con mango y semillas',comida:'Pollo con pasta de lenteja roja y brócoli',cena:'Salmón con calabaza y espárragos'},Martes:{desayuno:'Tostadas de centeno con huevos y salmón ahumado',comida:'Arroz con bonito y verduras',cena:'Pescado blanco con patata cocida y verduras'},Miércoles:{desayuno:'Yogur griego proteico con cacao y frutos rojos',comida:'Ternera especiada con boniato y espárragos',cena:'Bowl de trucha, patata y feta'},Jueves:{desayuno:'Tostadas de centeno con huevos y salmón ahumado',comida:'Arroz vaporizado con caballa y huevo cocido',cena:'Fajitas integrales de pollo o pizza casera'},Viernes:{desayuno:'Porridge overnight de avena con plátano',comida:'Pollo con arroz vaporizado y aguacate',cena:'Hamburguesa completa con patata asada'},Sábado:{desayuno:'Tostadas de espelta con huevos revueltos y aguacate',comida:'Ensaladilla rusa casera con caballa',cena:'Hamburguesa completa con boniato asado'},Domingo:{desayuno:'Ayuno metabólico / Bulletproof Coffee',comida:'Ternera con aguacate, rúcula y yogur griego',cena:'Pescado con puré vegetal y salsa de yogur'}}
];
/* ===== Plan "Regular el peso" (~2100 kcal/día) — paleo EatThisMuch exacto ===== */
const WEIGHT_WEEKS=[
{Lunes:{desayuno:'Huevos revueltos (2 unidades) + Batido de sandía y açaí (2½ tazas)',comida:'Ensalada de atún y aguacate (1 ración) + Zumo verde variado (½ ración)',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Sopa picante de pollo (1 ración) + Ensalada de kale y pepino'},Martes:{desayuno:'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada batida de frambuesa (1½ ración) + Batido de plátano, coco y verduras verdes',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Pollo con gravy de chipotle (1 ración) + Ensalada de pimientos y tomate'},Miércoles:{desayuno:'Huevos revueltos (1 huevo) + Batido de açaí (3 tazas)',comida:'Ensalada de pollo con estragón y Dijon (1½ ración) + Batido de piña y frambuesa',snack:'Ensalada picante de plátano macho (1 ración)',cena:'Bistec simple (½ ración) + Ensalada de frutas clásica'},Jueves:{desayuno:'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún con sésamo (1 ración) + Batido de canela, plátano y nectarina',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Salteado de bacalao (1 ración) + Ensalada de piña y aguacate'},Viernes:{desayuno:'Zumo verde de jengibre (1 ración) + Batata al microondas (½ batata)',comida:'Ensalada de atún y aguacate (1 ración) + Batido de piña y frambuesa',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Pollo con gravy de chipotle (1 ración) + Ensalada de pimientos y tomate'},Sábado:{desayuno:'Revuelto de espinaca y champiñón (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún y aguacate (1 ración) + Zumo verde variado (½ ración)',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Sopa picante de pollo (1 ración) + Ensalada de kale y pepino'},Domingo:{desayuno:'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (2 raciones) + Batido de piña y frambuesa',comida:'Ensalada de pollo con estragón y Dijon (1½ ración) + Batido de piña y frambuesa',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Salteado de bacalao (1 ración) + Ensalada de pimientos y tomate'}},
{Lunes:{desayuno:'Huevos revueltos (2 unidades) + Batido de sandía y açaí (2½ tazas)',comida:'Ensalada de atún y aguacate (1 ración) + Zumo verde variado (½ ración)',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Pollo con gravy de chipotle (1 ración) + Ensalada de pimientos y tomate'},Martes:{desayuno:'Revuelto de espinaca y champiñón (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada batida de frambuesa (1½ ración) + Batido de plátano, coco y verduras verdes',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Sopa picante de pollo (1 ración) + Ensalada de kale y pepino'},Miércoles:{desayuno:'Huevos revueltos (1 huevo) + Batido de açaí (3 tazas)',comida:'Ensalada de atún con sésamo (1 ración) + Batido de canela, plátano y nectarina',snack:'Ensalada picante de plátano macho (1 ración)',cena:'Bistec simple (½ ración) + Ensalada de frutas clásica'},Jueves:{desayuno:'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (1½ ración) + Batido de piña y frambuesa',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Salteado de bacalao (1 ración) + Ensalada de piña y aguacate'},Viernes:{desayuno:'Zumo verde de jengibre (1 ración) + Batata al microondas (½ batata)',comida:'Ensalada de atún y aguacate (1 ración) + Batido de piña y frambuesa',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Pollo con gravy de chipotle (1 ración) + Ensalada de pimientos y tomate'},Sábado:{desayuno:'Huevos revueltos (2 unidades) + Batido de sandía y açaí (2½ tazas)',comida:'Ensalada de atún y aguacate (1 ración) + Zumo verde variado (½ ración)',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Sopa picante de pollo (1 ración) + Ensalada de kale y pepino'},Domingo:{desayuno:'Revuelto de espinaca y champiñón (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (1½ ración) + Batido de piña y frambuesa',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Salteado de bacalao (1 ración) + Ensalada de piña y aguacate'}},
{Lunes:{desayuno:'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (1½ ración) + Batido de piña y frambuesa',snack:'Ensalada picante de plátano macho (1 ración)',cena:'Bistec simple (½ ración) + Ensalada de frutas clásica'},Martes:{desayuno:'Huevos revueltos (1 huevo) + Batido de açaí (3 tazas)',comida:'Ensalada de atún con sésamo (1 ración) + Batido de canela, plátano y nectarina',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Pollo con gravy de chipotle (1 ración) + Ensalada de pimientos y tomate'},Miércoles:{desayuno:'Revuelto de espinaca y champiñón (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada batida de frambuesa (1½ ración) + Batido de plátano, coco y verduras verdes',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Sopa picante de pollo (1 ración) + Ensalada de kale y pepino'},Jueves:{desayuno:'Zumo verde de jengibre (1 ración) + Batata al microondas (½ batata)',comida:'Ensalada de atún y aguacate (1 ración) + Batido de piña y frambuesa',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Salteado de bacalao (1 ración) + Ensalada de piña y aguacate'},Viernes:{desayuno:'Huevos revueltos (2 unidades) + Batido de sandía y açaí (2½ tazas)',comida:'Ensalada de atún y aguacate (1 ración) + Zumo verde variado (½ ración)',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Pollo con gravy de chipotle (1 ración) + Ensalada de pimientos y tomate'},Sábado:{desayuno:'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (1½ ración) + Batido de piña y frambuesa',snack:'Ensalada picante de plátano macho (1 ración)',cena:'Bistec simple (½ ración) + Ensalada de frutas clásica'},Domingo:{desayuno:'Huevos revueltos (1 huevo) + Batido de açaí (3 tazas)',comida:'Ensalada de atún con sésamo (1 ración) + Batido de canela, plátano y nectarina',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Sopa picante de pollo (1 ración) + Ensalada de kale y pepino'}},
{Lunes:{desayuno:'Revuelto de espinaca y champiñón (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún y aguacate (1 ración) + Zumo verde variado (½ ración)',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Pollo con gravy de chipotle (1 ración) + Ensalada de pimientos y tomate'},Martes:{desayuno:'Zumo verde de jengibre (1 ración) + Batata al microondas (½ batata)',comida:'Ensalada de pollo con estragón y Dijon (1½ ración) + Batido de piña y frambuesa',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Salteado de bacalao (1 ración) + Ensalada de piña y aguacate'},Miércoles:{desayuno:'Huevos revueltos (2 unidades) + Batido de sandía y açaí (2½ tazas)',comida:'Ensalada batida de frambuesa (1½ ración) + Batido de plátano, coco y verduras verdes',snack:'Ensalada picante de plátano macho (1 ración)',cena:'Sopa picante de pollo (1 ración) + Ensalada de kale y pepino'},Jueves:{desayuno:'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún con sésamo (1 ración) + Batido de canela, plátano y nectarina',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Bistec simple (½ ración) + Ensalada de frutas clásica'},Viernes:{desayuno:'Huevos revueltos (1 huevo) + Batido de açaí (3 tazas)',comida:'Ensalada de atún y aguacate (1 ración) + Batido de piña y frambuesa',snack:'Zumo de zanahoria y naranja (470 ml)',cena:'Pollo con gravy de chipotle (1 ración) + Ensalada de pimientos y tomate'},Sábado:{desayuno:'Revuelto de espinaca y champiñón (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (1½ ración) + Batido de piña y frambuesa',snack:'Manzana con mantequilla de almendra (1 manzana)',cena:'Sopa picante de pollo (1 ración) + Ensalada de kale y pepino'},Domingo:{desayuno:'Tortilla de claras con espinaca, cebolla, champiñón y pimiento (1 ración) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún con sésamo (1 ración) + Batido de canela, plátano y nectarina',snack:'Ensalada picante de plátano macho (1 ración)',cena:'Salteado de bacalao (1 ración) + Ensalada de piña y aguacate'}}
];
/* ===== Plan "Ganar masa muscular" (~2500 kcal/día) — porciones +20% ===== */
const MASS_WEEKS=[
{Lunes:{desayuno:'Huevos revueltos (3 uds) + Batido de sandía y açaí (3 tazas)',comida:'Ensalada de atún y aguacate (1½ ración) + Zumo verde variado (1 ración)',cena:'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino con aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Martes:{desayuno:'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada batida de frambuesa (2 raciones) + Batido de plátano, coco y verduras verdes',cena:'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate con aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'},Miércoles:{desayuno:'Huevos revueltos (2 uds) + Batido de açaí (3 tazas)',comida:'Ensalada de pollo con estragón y Dijon (2 raciones) + Batido de piña y frambuesa',cena:'Bistec simple (1 ración) + Ensalada de frutas clásica con frutos secos',snack:'Ensalada picante de plátano macho (1½ ración)'},Jueves:{desayuno:'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún con sésamo (1½ ración) + Batido de canela, plátano y nectarina',cena:'Salteado de bacalao (1½ ración) + Ensalada de piña y aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Viernes:{desayuno:'Zumo verde de jengibre (1 ración) + Batata al microondas (1 batata)',comida:'Ensalada de atún y aguacate (1½ ración) + Batido de piña y frambuesa',cena:'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate con aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'},Sábado:{desayuno:'Revuelto de espinaca y champiñón (2 raciones) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún y aguacate (1½ ración) + Zumo verde variado (1 ración)',cena:'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino con aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Domingo:{desayuno:'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (2 raciones) + Batido de piña y frambuesa',cena:'Salteado de bacalao (1½ ración) + Ensalada de piña y aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'}},
{Lunes:{desayuno:'Huevos revueltos (3 uds) + Batido de sandía y açaí (3 tazas)',comida:'Ensalada de atún y aguacate (1½ ración) + Zumo verde variado (1 ración)',cena:'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate con aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'},Martes:{desayuno:'Revuelto de espinaca y champiñón (2 raciones) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada batida de frambuesa (2 raciones) + Batido de plátano, coco y verduras verdes',cena:'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino con aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Miércoles:{desayuno:'Huevos revueltos (2 uds) + Batido de açaí (3 tazas)',comida:'Ensalada de atún con sésamo (1½ ración) + Batido de canela, plátano y nectarina',cena:'Bistec simple (1 ración) + Ensalada de frutas clásica con frutos secos',snack:'Ensalada picante de plátano macho (1½ ración)'},Jueves:{desayuno:'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (2 raciones) + Batido de piña y frambuesa',cena:'Salteado de bacalao (1½ ración) + Ensalada de piña y aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Viernes:{desayuno:'Zumo verde de jengibre (1 ración) + Batata al microondas (1 batata)',comida:'Ensalada de atún y aguacate (1½ ración) + Batido de piña y frambuesa',cena:'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate con aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'},Sábado:{desayuno:'Huevos revueltos (3 uds) + Batido de sandía y açaí (3 tazas)',comida:'Ensalada de atún y aguacate (1½ ración) + Zumo verde variado (1 ración)',cena:'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino con aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Domingo:{desayuno:'Revuelto de espinaca y champiñón (2 raciones) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (2 raciones) + Batido de piña y frambuesa',cena:'Salteado de bacalao (1½ ración) + Ensalada de piña y aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'}},
{Lunes:{desayuno:'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (2 raciones) + Batido de piña y frambuesa',cena:'Bistec simple (1 ración) + Ensalada de frutas clásica con frutos secos',snack:'Ensalada picante de plátano macho (1½ ración)'},Martes:{desayuno:'Huevos revueltos (2 uds) + Batido de açaí (3 tazas)',comida:'Ensalada de atún con sésamo (1½ ración) + Batido de canela, plátano y nectarina',cena:'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate con aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'},Miércoles:{desayuno:'Revuelto de espinaca y champiñón (2 raciones) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada batida de frambuesa (2 raciones) + Batido de plátano, coco y verduras verdes',cena:'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino con aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Jueves:{desayuno:'Zumo verde de jengibre (1 ración) + Batata al microondas (1 batata)',comida:'Ensalada de atún y aguacate (1½ ración) + Batido de piña y frambuesa',cena:'Salteado de bacalao (1½ ración) + Ensalada de piña y aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Viernes:{desayuno:'Huevos revueltos (3 uds) + Batido de sandía y açaí (3 tazas)',comida:'Ensalada de atún y aguacate (1½ ración) + Zumo verde variado (1 ración)',cena:'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate con aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'},Sábado:{desayuno:'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (2 raciones) + Batido de piña y frambuesa',cena:'Bistec simple (1 ración) + Ensalada de frutas clásica con frutos secos',snack:'Ensalada picante de plátano macho (1½ ración)'},Domingo:{desayuno:'Huevos revueltos (2 uds) + Batido de açaí (3 tazas)',comida:'Ensalada de atún con sésamo (1½ ración) + Batido de canela, plátano y nectarina',cena:'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino con aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'}},
{Lunes:{desayuno:'Revuelto de espinaca y champiñón (2 raciones) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún y aguacate (1½ ración) + Zumo verde variado (1 ración)',cena:'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate con aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'},Martes:{desayuno:'Zumo verde de jengibre (1 ración) + Batata al microondas (1 batata)',comida:'Ensalada de pollo con estragón y Dijon (2 raciones) + Batido de piña y frambuesa',cena:'Salteado de bacalao (1½ ración) + Ensalada de piña y aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Miércoles:{desayuno:'Huevos revueltos (3 uds) + Batido de sandía y açaí (3 tazas)',comida:'Ensalada batida de frambuesa (2 raciones) + Batido de plátano, coco y verduras verdes',cena:'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino con aguacate',snack:'Ensalada picante de plátano macho (1½ ración)'},Jueves:{desayuno:'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún con sésamo (1½ ración) + Batido de canela, plátano y nectarina',cena:'Bistec simple (1 ración) + Ensalada de frutas clásica con frutos secos',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'},Viernes:{desayuno:'Huevos revueltos (2 uds) + Batido de açaí (3 tazas)',comida:'Ensalada de atún y aguacate (1½ ración) + Batido de piña y frambuesa',cena:'Pollo con gravy de chipotle (1½ ración) + Ensalada de pimientos y tomate con aguacate',snack:'Zumo de zanahoria y naranja (470 ml) + 30 g de almendras'},Sábado:{desayuno:'Revuelto de espinaca y champiñón (2 raciones) + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de pollo con estragón y Dijon (2 raciones) + Batido de piña y frambuesa',cena:'Sopa picante de pollo (1½ ración) + Ensalada de kale y pepino con aguacate',snack:'Manzana con mantequilla de almendra (1 manzana + 2 cda)'},Domingo:{desayuno:'Tortilla de claras (4 uds) con espinaca, cebolla, champiñón y pimiento + Plátano, frutos rojos y chocolate amargo',comida:'Ensalada de atún con sésamo (1½ ración) + Batido de canela, plátano y nectarina',cena:'Salteado de bacalao (1½ ración) + Ensalada de piña y aguacate',snack:'Ensalada picante de plátano macho (1½ ración)'}}
];
DIET_PLANS.paleo={regular:WEIGHT_WEEKS,ganar:MASS_WEEKS};
const W_MEAL_DETAILS={
'Yogur proteico con avena y plátano':{items:[['150 g','Yogur natural alto en proteína','PL'],['40 g','Avena en copos','HB'],['1 uds','Plátano','FA'],['','Canela',null,1]],note:'Media mañana: manzana + 15 g de almendras.'},
'Huevos revueltos con tostadas integrales y naranja':{items:[['2 uds','Huevos revueltos','PA'],['2 uds','Tostadas de pan integral','HB'],['1 uds','Naranja','FB']],note:'Media mañana: yogur alto en proteína.'},
'Yogur con avena, fresas y canela':{items:[['150 g','Yogur natural','PL'],['40 g','Avena en copos','HB'],['','Fresas','FR'],['','Canela',null,1]],note:'Media mañana: manzana + yogur.'},
'Tostadas integrales con pavo, tomate y kiwi':{items:[['2 uds','Tostadas de pan integral','HB'],['60 g','Pavo en lonchas','PB'],['','Tomate','VN'],['1 uds','Kiwi','FB']],note:'Media mañana: yogur + fruta.'},
'Huevos con tostadas integrales y fruta':{items:[['2 uds','Huevos','PA'],['2 uds','Tostadas de pan integral','HB'],['1 pieza','Fruta de temporada','FB']],note:'Media mañana: yogur.'},
'Yogur con avena y fruta':{items:[['150 g','Yogur natural','PL'],['40 g','Avena en copos','HB'],['1 pieza','Fruta de temporada','FB']],note:'Media mañana: fruta + nueces.'},
'Avena con yogur, plátano y canela':{items:[['40 g','Avena en copos','HB'],['150 g','Yogur natural','PL'],['1 uds','Plátano','FA'],['','Canela',null,1]],note:'Media mañana: manzana + almendras.'},
'Huevos revueltos con tostadas integrales y kiwi':{items:[['2 uds','Huevos revueltos','PA'],['2 uds','Tostadas de pan integral','HB'],['1 uds','Kiwi','FB']],note:'Media mañana: yogur.'},
'Yogur con avena y frutos rojos':{items:[['150 g','Yogur natural','PL'],['40 g','Avena en copos','HB'],['','Frutos rojos','FR']],note:'Media mañana: fruta.'},
'Tostadas integrales con pavo, tomate y fruta':{items:[['2 uds','Tostadas de pan integral','HB'],['60 g','Pavo en lonchas','PB'],['','Tomate','VN'],['1 pieza','Fruta de temporada','FB']],note:'Media mañana: yogur + fruta.'},
'Yogur con avena, kiwi y canela':{items:[['150 g','Yogur natural','PL'],['40 g','Avena en copos','HB'],['1 uds','Kiwi','FB'],['','Canela',null,1]],note:'Media mañana: fruta.'},
'Pechuga de pollo con arroz, brócoli y AOVE':{items:[['150 g','Pechuga de pollo','PB'],['70 g','Arroz en seco','HA'],['','Brócoli','VC'],['1 cda','AOVE','GR']],note:'Merienda: yogur + frutos rojos.'},
'Merluza al horno con patata y calabacín':{items:[['200 g','Merluza','PB'],['250 g','Patata','HA'],['','Calabacín','VN']],note:'Merienda: plátano + 15 g de nueces.'},
'Ternera magra con patata asada y verduras':{items:[['150 g','Ternera magra','PB'],['250 g','Patata asada','HA'],['','Verduras salteadas','VN']],note:'Merienda: tostada integral con pavo.'},
'Pollo con arroz, pimientos y calabacín':{items:[['150 g','Pechuga de pollo','PB'],['70 g','Arroz en seco','HA'],['','Pimientos y calabacín','VN']],note:'Merienda: plátano + frutos secos.'},
'Pasta integral con pollo, tomate y verduras':{items:[['80 g','Pasta integral en seco','HA'],['150 g','Pechuga de pollo','PB'],['','Tomate y verduras','VN']],note:'Merienda: yogur + frutos rojos.'},
'Ternera magra con arroz y verduras':{items:[['150 g','Ternera magra','PB'],['70 g','Arroz en seco','HA'],['','Verduras salteadas','VN']],note:'Merienda: fruta + frutos secos.'},
'Pollo al horno con patata y ensalada':{items:[['150 g','Pollo al horno','PB'],['250 g','Patata','HA'],['','Ensalada verde','VH']],note:'Merienda: yogur alto en proteína.'},
'Ternera magra con patata y ensalada':{items:[['150 g','Ternera magra','PB'],['250 g','Patata','HA'],['','Ensalada verde','VH']],note:'Merienda: plátano + nueces.'},
'Salmón con patata y brócoli':{items:[['150 g','Salmón','PA'],['250 g','Patata','HA'],['','Brócoli','VC']],note:'Merienda: tostada integral + pavo.'},
'Pasta integral con pollo y verduras':{items:[['80 g','Pasta integral en seco','HA'],['150 g','Pechuga de pollo','PB'],['','Verduras salteadas','VN']],note:'Merienda: fruta + frutos secos.'},
'Pavo con arroz y verduras':{items:[['150 g','Pechuga de pavo','PB'],['70 g','Arroz en seco','HA'],['','Verduras salteadas','VN']],note:'Merienda: fruta + almendras.'},
'Lentejas con verduras y pollo':{items:[['80 g','Lentejas en seco','HA'],['120 g','Pechuga de pollo','PB'],['','Verduras','VN']],note:'Merienda: yogur alto en proteína.'},
'Pollo con arroz y verduras':{items:[['150 g','Pechuga de pollo','PB'],['70 g','Arroz en seco','HA'],['','Verduras salteadas','VN']],note:'Merienda: yogur + frutos rojos.'},
'Ternera magra con patata y brócoli':{items:[['150 g','Ternera magra','PB'],['250 g','Patata','HA'],['','Brócoli','VC']],note:'Merienda: plátano + almendras.'},
'Salmón con arroz y verduras':{items:[['150 g','Salmón','PA'],['70 g','Arroz en seco','HA'],['','Verduras salteadas','VN']],note:'Merienda: tostada integral + pavo.'},
'Pollo con patata y ensalada':{items:[['150 g','Pechuga de pollo','PB'],['250 g','Patata','HA'],['','Ensalada verde','VH']],note:'Merienda: fruta + frutos secos.'},
'Pasta integral con ternera y verduras':{items:[['80 g','Pasta integral en seco','HA'],['150 g','Ternera magra','PB'],['','Verduras salteadas','VN']],note:'Merienda: fruta + almendras.'},
'Pollo al horno con patata y verduras':{items:[['150 g','Pollo al horno','PB'],['250 g','Patata','HA'],['','Verduras asadas','VN']],note:'Merienda: yogur alto en proteína.'},
'Salmón con patata y verduras':{items:[['150 g','Salmón','PA'],['250 g','Patata','HA'],['','Verduras salteadas','VN']],note:'Merienda: fruta + almendras.'},
'Tortilla de huevos con ensalada y patata cocida':{items:[['2-3 uds','Huevos para tortilla','PA'],['','Ensalada (tomate, lechuga, cebolla)','VH'],['200 g','Patata cocida','HA'],['1 cda','AOVE','GR']]},
'Pechuga de pavo con ensalada y arroz':{items:[['150 g','Pechuga de pavo','PB'],['','Ensalada verde','VH'],['60 g','Arroz en seco','HA']]},
'Salmón con brócoli y ensalada':{items:[['150 g','Salmón','PA'],['','Brócoli','VC'],['','Ensalada verde','VH']]},
'Tortilla de verduras con ensalada':{items:[['2-3 uds','Huevos para tortilla','PA'],['','Verduras para la tortilla','VN'],['','Ensalada verde','VH'],['1 cda','AOVE','GR']]},
'Merluza con patata y ensalada':{items:[['200 g','Merluza','PB'],['200 g','Patata','HA'],['','Ensalada verde','VH']]},
'Pollo a la plancha con ensalada y patata':{items:[['150 g','Pechuga de pollo','PB'],['','Ensalada verde','VH'],['200 g','Patata','HA']]},
'Pavo con ensalada y patata':{items:[['150 g','Pechuga de pavo','PB'],['','Ensalada verde','VH'],['200 g','Patata','HA']]},
'Salmón con verduras y patata':{items:[['150 g','Salmón','PA'],['','Verduras salteadas','VN'],['200 g','Patata','HA']]},
'Pollo con verduras y arroz':{items:[['150 g','Pechuga de pollo','PB'],['','Verduras salteadas','VN'],['60 g','Arroz en seco','HA']]},
'Merluza con verduras y patata':{items:[['200 g','Merluza','PB'],['','Verduras salteadas','VN'],['200 g','Patata','HA']]},
'Pollo con ensalada y arroz':{items:[['150 g','Pechuga de pollo','PB'],['','Ensalada verde','VH'],['60 g','Arroz en seco','HA']]},
'Salmón con ensalada y patata':{items:[['150 g','Salmón','PA'],['','Ensalada verde','VH'],['200 g','Patata','HA']]}
};
Object.assign(NDATA,{
'Yogur proteico con avena y plátano':{kcal:420,p:25,c:55,g:10},'Huevos revueltos con tostadas integrales y naranja':{kcal:450,p:22,c:45,g:18},'Yogur con avena, fresas y canela':{kcal:380,p:20,c:52,g:8},'Tostadas integrales con pavo, tomate y kiwi':{kcal:380,p:18,c:42,g:12},'Huevos con tostadas integrales y fruta':{kcal:400,p:20,c:40,g:15},'Yogur con avena y fruta':{kcal:350,p:18,c:48,g:8},'Avena con yogur, plátano y canela':{kcal:430,p:22,c:58,g:10},'Huevos revueltos con tostadas integrales y kiwi':{kcal:420,p:21,c:44,g:14},'Yogur con avena y frutos rojos':{kcal:360,p:19,c:50,g:8},'Tostadas integrales con pavo, tomate y fruta':{kcal:370,p:17,c:43,g:11},'Yogur con avena, kiwi y canela':{kcal:370,p:19,c:50,g:8},
'Pechuga de pollo con arroz, brócoli y AOVE':{kcal:550,p:42,c:55,g:15},'Merluza al horno con patata y calabacín':{kcal:480,p:38,c:45,g:14},'Ternera magra con patata asada y verduras':{kcal:520,p:40,c:40,g:18},'Pollo con arroz, pimientos y calabacín':{kcal:540,p:40,c:52,g:16},'Pasta integral con pollo, tomate y verduras':{kcal:560,p:38,c:60,g:16},'Ternera magra con arroz y verduras':{kcal:520,p:38,c:48,g:16},'Pollo al horno con patata y ensalada':{kcal:500,p:38,c:42,g:15},'Ternera magra con patata y ensalada':{kcal:500,p:36,c:38,g:18},'Salmón con patata y brócoli':{kcal:520,p:36,c:42,g:18},'Pasta integral con pollo y verduras':{kcal:540,p:36,c:56,g:15},'Pavo con arroz y verduras':{kcal:520,p:35,c:50,g:14},'Lentejas con verduras y pollo':{kcal:480,p:28,c:60,g:10},'Pollo con arroz y verduras':{kcal:510,p:38,c:50,g:14},'Ternera magra con patata y brócoli':{kcal:510,p:38,c:40,g:17},'Salmón con arroz y verduras':{kcal:520,p:36,c:48,g:16},'Pollo con patata y ensalada':{kcal:490,p:37,c:40,g:16},'Pasta integral con ternera y verduras':{kcal:550,p:36,c:56,g:16},'Pollo al horno con patata y verduras':{kcal:500,p:38,c:42,g:15},'Salmón con patata y verduras':{kcal:500,p:38,c:42,g:14},
'Tortilla de huevos con ensalada y patata cocida':{kcal:420,p:24,c:30,g:20},'Pechuga de pavo con ensalada y arroz':{kcal:470,p:35,c:38,g:16},'Salmón con brócoli y ensalada':{kcal:450,p:32,c:15,g:22},'Tortilla de verduras con ensalada':{kcal:380,p:22,c:22,g:18},'Merluza con patata y ensalada':{kcal:430,p:34,c:35,g:14},'Pollo a la plancha con ensalada y patata':{kcal:460,p:36,c:32,g:17},'Pavo con ensalada y patata':{kcal:440,p:34,c:30,g:16},'Salmón con verduras y patata':{kcal:460,p:33,c:30,g:18},'Pollo con verduras y arroz':{kcal:470,p:36,c:35,g:15},'Merluza con verduras y patata':{kcal:420,p:33,c:30,g:13},'Pollo con ensalada y arroz':{kcal:450,p:35,c:33,g:15},'Salmón con ensalada y patata':{kcal:450,p:33,c:28,g:17}
});
function currentUser(){const s=getSession();return s?(getUsers().find(u=>u.email===s)||null):null;}
function saveUser(u){setUsers(getUsers().map(x=>x.email===u.email?u:x));}
function getND(name){return NDATA[name]||DEFAULT_NDATA;}
function todayIndex(){const d=new Date().getDay();return d===0?6:d-1;}
function getDayIndex(dt){const d=dt.getDay();return d===0?6:d-1;}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0');}

/* Health calc */
function calcStats(peso,altura,edad,sexo,actividad,objetivo){
  const bmr=sexo==='mujer'?(10*peso+6.25*altura-5*edad-161):(10*peso+6.25*altura-5*edad+5);
  const tdee=bmr*(ACT_FACTORS[actividad]||1.2);
  const agua=+(peso*0.033).toFixed(1);
  const esBajar=objetivo==='Regular el peso';
  const esGanar=objetivo==='Ganar masa muscular';
  const calorias=esBajar?Math.round(tdee-500):esGanar?Math.round(tdee+350):Math.round(tdee);
  const minCal=sexo==='mujer'?1200:1500;
  return{bmr:Math.round(bmr),tdee:Math.round(tdee),agua,calorias:Math.max(calorias,minCal),esBajar,esGanar};
}
function calcWaterTarget(u){
  const ph=u.physical;if(!ph||!ph.peso)return 2500;
  let ml=Math.round(ph.peso*35);
  const act=ph.actividad||'moderado';
  if(act==='intenso')ml+=500;
  else if(act==='moderado')ml+=300;
  if(u.entreno){
    const dur=u.entreno.duracion||0;
    if(dur>=90)ml+=300;
    else if(dur>=60)ml+=200;
  }
  return Math.min(ml,5000);
}
function getWaterLog(u){
  if(!u.water)u.water={};
  const key=todayKey();
  if(!u.water[key])u.water[key]={entries:[],total:0};
  return u.water[key];
}

/* Auth */
$('#toRegister').addEventListener('click',()=>{showAuth('register');setMsg('#regMsg','','');});
$('#toLogin').addEventListener('click',()=>{showAuth('login');setMsg('#loginMsg','','');});
function showAuth(f){$('#loginForm').classList.toggle('hidden',f!=='login');$('#registerForm').classList.toggle('hidden',f!=='register');}
function setMsg(s,t,c){const e=$(s);e.textContent=t;e.className='auth-msg '+(c||'');}

$('#loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  const email=$('#loginEmail').value.trim().toLowerCase(),pw=$('#loginPw').value;
  const user=getUsers().find(u=>u.email===email&&u.pw===hash(pw));
  if(!user){setMsg('#loginMsg','Correo o contraseña incorrectos.','err');return;}
  setSession(user.email);
  if(!user.physical){showOnboarding();}else{enterPortal();}
});

$('#registerForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('#regName').value.trim(),email=$('#regEmail').value.trim().toLowerCase(),pw=$('#regPw').value,pw2=$('#regPw2').value;
  const tipo=$('#regTipo').value,objetivo=$('#regObjetivo').value,alergias=selectedChips('regChips').filter(a=>a&&a!=='Ninguna');
  const pc=$('#regPlans .chip.active');const plan=pc?pc.dataset.plan:'pro';
  if(!name||!email||!pw){setMsg('#regMsg','Completa todos los campos.','err');return;}
  if(!/^\S+@\S+\.\S+$/.test(email)){setMsg('#regMsg','Correo no válido.','err');return;}
  if(pw.length<6){setMsg('#regMsg','Mínimo 6 caracteres.','err');return;}
  if(pw!==pw2){setMsg('#regMsg','Las contraseñas no coinciden.','err');return;}
  if(getUsers().some(u=>u.email===email)){setMsg('#regMsg','Ya existe una cuenta con ese correo.','err');return;}
  const user={id:'u-'+Date.now(),name,email,pw:hash(pw),plan,tipo,objetivo,alergias,dietaType:'todos',createdAt:new Date().toISOString(),mv:2,menu:[],menuObj:objetivo,consumed:{},glassed:{},sleep:{},customFoods:{},extraFoods:{},subs:{}};
  try{user.menu=newMenu(tipo,alergias,0,objetivo,'todos',user);}catch(e){console.error('newMenu reg error:',e);user.menu=[];}
  setUsers([...getUsers(),user]);setSession(email);showOnboarding();
});

$('#regPlans').addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c)return;$('#regPlans').querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');});

function enterPortal(){
  let u=currentUser();if(!u){showView('view-auth');showAuth('login');return;}
  if(u.objetivo!=='Regular el peso'&&u.objetivo!=='Equilibrado'&&u.objetivo!=='Ganar masa muscular')u.objetivo='Equilibrado';
  /* Migración: si existe u.dieta (antiguo) pero no u.dietaType, migrar */
  if(!u.dietaType){u.dietaType=u.dieta||'todos';delete u.dieta;saveUser(u);}
  if(u.mv!==2){try{u.menu=newMenu(u.tipo,u.alergias||[],u.weekIdx||0,u.objetivo,u.dietaType,u);}catch(e){console.error('newMenu mv error:',e);u.menu=u.menu||[];}u.mv=2;u.subs={};u.consumed={};u.glassed={};u.sleep={};u.customFoods={};u.extraFoods={};saveUser(u);}
  if(!u.menuObj||u.menuObj!==u.objetivo){u.weekIdx=0;try{u.menu=newMenu(u.tipo,u.alergias||[],0,u.objetivo,u.dietaType,u);}catch(e){console.error('newMenu objetivo error:',e);u.menu=u.menu||[];}u.menuObj=u.objetivo;u.subs={};u.consumed={};u.glassed={};u.sleep={};u.customFoods={};u.extraFoods={};saveUser(u);}
  if(u.weekIdx==null){u.weekIdx=0;saveUser(u);}
  showView('view-dashboard');$('#navUser').classList.remove('hidden');
  $('#userChip').textContent=u.name+' · '+PLANS[u.plan].name;
  activateTab('inicio');
  applyPlanGating(u);
}
function applyPlanGating(u){
  const full=u.plan!=='starter';
  document.querySelectorAll('.dash-tab.plan-gated').forEach(t=>t.classList.toggle('hidden',!full));
  const active=document.querySelector('.dash-tab.active');
  if(!full&&active&&active.classList.contains('plan-gated'))activateTab('hoy');
}

$('#perfilNavBtn').addEventListener('click',()=>{activateTab('perfil');});
$('#logoutBtn').addEventListener('click',()=>{setSession(null);$('#navUser').classList.add('hidden');showView('view-auth');showAuth('login');});

/* Chips */
function renderChips(id,opts,sel){
  const c=$('#'+id),inp=$('#'+id+'Otra');
  const other=(sel||[]).find(s=>s&&s!=='Ninguna'&&!opts.includes(s))||'';
  if(inp){inp.value=other;inp.classList.toggle('hidden',!((sel||[]).includes('Otra…')||other));}
  c.innerHTML='';
  opts.forEach(o=>{
    const active=other?(o==='Otra…'):(sel||[]).includes(o);
    const b=document.createElement('button');b.type='button';b.className='chip'+(active?' active':'');b.textContent=o;
    b.addEventListener('click',()=>{
      if(o==='Ninguna'){
        if(b.classList.contains('active')){b.classList.remove('active');}
        else{c.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(inp){inp.value='';inp.classList.add('hidden');}}
      }else if(o==='Otra…'){
        b.classList.toggle('active');
        if(inp){
          inp.classList.toggle('hidden',!b.classList.contains('active'));
          if(!inp.classList.contains('hidden'))inp.focus();
          else{inp.dataset.cleared='';inp.value='';}
        }
        if(b.classList.contains('active')){const n=Array.from(c.querySelectorAll('.chip')).find(x=>x.textContent==='Ninguna');if(n)n.classList.remove('active');}
      }else{
        b.classList.toggle('active');
        const n=Array.from(c.querySelectorAll('.chip')).find(x=>x.textContent==='Ninguna');
        if(n&&c.querySelectorAll('.chip.active').length>0)n.classList.remove('active');
      }
    });
    c.appendChild(b);
  });
}
function selectedChips(id){
  const inp=$('#'+id+'Otra');
  return Array.from($('#'+id).querySelectorAll('.chip.active')).map(b=>{
    if(b.textContent!=='Otra…')return b.textContent;
    return inp?inp.value.trim():'';
  }).filter(v=>v);
}

/* Views & Tabs */
function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('hidden',v.id!==id));}
document.querySelectorAll('.dash-tab').forEach(t=>t.addEventListener('click',()=>activateTab(t.dataset.tab)));
function activateTab(n){document.querySelectorAll('.dash-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===n));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('hidden',t.id!=='tab-'+n));const u=currentUser();if(!u)return;if(n==='inicio')renderInicio(u);if(n==='semana')renderSemana(u);if(n==='evaluacion')renderEvaluacion(u);if(n==='compra')renderLista(u);if(n==='perfil')renderPerfil(u);if(n==='bienestar')applyBienGating(u);if(n==='dieta')autoGenDieta(u);window.scrollTo({top:0,behavior:'smooth'});}
function applyBienGating(u){var locked=u.plan==='pro';document.querySelectorAll('.bien-btn').forEach(function(b){var k=b.dataset.bien;var needLock=locked&&(k==='ayuno'||k==='recuperacion');b.classList.toggle('locked',needLock);if(needLock){b.onclick=function(){setMsg('#perfilMsg','\uD83D\uDD12 Upgrade a Premium para acceder a Ayuno y Recuperaci\u00f3n. Plan Premium 40\u20ac/mes.','err');};}else{b.onclick=null;}});}
document.querySelectorAll('.bien-btn').forEach(function(b){b.addEventListener('click',function(){if(b.classList.contains('locked'))return;document.querySelectorAll('.bien-btn').forEach(function(x){x.classList.toggle('active',x===b);});document.querySelectorAll('.bien-content').forEach(function(c){c.classList.toggle('hidden',c.id!=='bien-'+b.dataset.bien);});});});

/* Onboarding */
let onbData={};
function showOnboarding(){
  const u=currentUser();if(!u)return;
  onbData={sexo:'hombre',actividad:null};
  $('#onboarding').classList.remove('hidden');
  renderOnbDots(0);showOnbStep(0);
}
function hideOnboarding(){$('#onboarding').classList.add('hidden');}
function renderOnbDots(cur){$('#onbDots').innerHTML=[0,1,2,3,4].map(i=>`<div class="onb-dot${i===cur?' active':''}"></div>`).join('');}
function showOnbStep(n){renderOnbDots(n);document.querySelectorAll('.onb-step').forEach(s=>s.classList.toggle('hidden',+s.dataset.step!==n));}
$('#onbStart').addEventListener('click',()=>showOnbStep(1));
$('#onbNext1').addEventListener('click',()=>{onbData.altura=+$('#onbAltura').value;onbData.peso=+$('#onbPeso').value;if(!onbData.altura||!onbData.peso){alert('Introduce altura y peso.');return;}showOnbStep(2);});
$('#onbNext2').addEventListener('click',()=>{onbData.edad=+$('#onbEdad').value;if(!onbData.edad){alert('Introduce tu edad.');return;}showOnbStep(3);});
$('#onbSexo').addEventListener('click',e=>{const b=e.target.closest('.sex-btn');if(!b)return;$('#onbSexo').querySelectorAll('.sex-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');onbData.sexo=b.dataset.val;});
$('#onbActividad').addEventListener('click',e=>{const b=e.target.closest('.activity-card');if(!b)return;$('#onbActividad').querySelectorAll('.activity-card').forEach(x=>x.classList.remove('active'));b.classList.add('active');onbData.actividad=b.dataset.val;});
$('#onbNext3').addEventListener('click',()=>{
  if(!onbData.actividad){alert('Selecciona tu nivel de actividad.');return;}
  let u=currentUser();
  if(!u){
    const s=getSession();const all=getUsers();
    u=s?all.find(x=>x.email===s):all[all.length-1];
  }
  if(!u){console.error('onbNext3: no user found');return;}
  const stats=calcStats(onbData.peso,onbData.altura,onbData.edad,onbData.sexo,onbData.actividad,u.objetivo);
  u.physical={altura:onbData.altura,peso:onbData.peso,edad:onbData.edad,sexo:onbData.sexo,actividad:onbData.actividad};
  u.stats=stats;saveUser(u);
  showOnbStep(4);
  const res=$('#onbResults');
  let html=`<div class="onb-result"><div style="font-size:2.4rem;margin-bottom:8px;">💧</div><div class="result-big counter" data-target="${stats.agua}" data-decimals="1">0</div><div class="result-label">litros de agua al día</div></div>`;
  if(stats.esBajar){html+=`<div class="onb-result"><div style="font-size:2.4rem;margin-bottom:8px;">🔥</div><div class="result-big counter" data-target="${stats.calorias}" data-decimals="0">0</div><div class="result-label">kcal diarias para alcanzar tu objetivo</div><p style="font-size:.82rem;color:var(--ink-soft);margin:6px 0 0;">TDEE: ${stats.tdee} kcal − 500 = ${stats.calorias} kcal</p></div>`;}
  else if(stats.esGanar){html+=`<div class="onb-result"><div style="font-size:2.4rem;margin-bottom:8px;">💪</div><div class="result-big counter" data-target="${stats.calorias}" data-decimals="0">0</div><div class="result-label">kcal diarias para ganar masa muscular</div><p style="font-size:.82rem;color:var(--ink-soft);margin:6px 0 0;">TDEE: ${stats.tdee} kcal + 350 = ${stats.calorias} kcal</p></div>`;}
  html+=`<div class="onb-result" style="font-size:.88rem;color:var(--ink-soft);"><p>Metabolismo basal: ${stats.bmr} kcal · Gasto total: ${stats.tdee} kcal</p></div>`;
  res.innerHTML=html;
  setTimeout(()=>animateCounters(res),400);
  setTimeout(()=>launchConfetti(),800);
});
$('#onbFinish').addEventListener('click',()=>{hideOnboarding();enterPortal();});

/* ===== INICIO / DASHBOARD ===== */
function renderInicio(u){
  const idx=todayIndex();const key=todayKey();
  const day=u.menu[idx];
  const d=new Date();
  const name=(u.name||'').split(' ')[0];
  const hour=d.getHours();
  const greet=hour<12?'Buenos días':hour<20?'Buenas tardes':'Buenas noches';
  $('#inicioGreeting').textContent=greet+', '+name+' 👋';
  $('#inicioSubtitle').textContent=d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
  const stats=u.stats||{};
  const calTarget=stats.calorias||0;
  const protTarget=Math.round(calTarget*0.3/4);
  const carbTarget=Math.round(calTarget*0.4/4);
  const fatTarget=Math.round(calTarget*0.3/9);
  const eaten=u.consumed[key]||{};
  let totalCal=0,totalProt=0,totalCarb=0,totalFat=0;
  const mts=day?getMealSlots(day):[];
  mts.forEach(mt=>{
    const name=day[mt];const nd=getND(name);
    if(eaten[mt]&&nd){totalCal+=nd.k;totalProt+=nd.p;totalCarb+=nd.c;totalFat+=nd.g;}
    const extras=u.extraFoods&&u.extraFoods[key]&&u.extraFoods[key][mt];
    if(extras)extras.forEach(e=>{totalCal+=(e.k||0);totalProt+=(e.p||0);totalCarb+=(e.c||0);totalFat+=(e.g||0);});
    const custom=u.customFoods&&u.customFoods[key]&&u.customFoods[key][mt];
    if(custom){totalCal+=(custom.k||0);totalProt+=(custom.p||0);totalCarb+=(custom.c||0);totalFat+=(custom.g||0);}
  });
  const calPct=calTarget?Math.min(100,Math.round(totalCal/calTarget*100)):0;
  const protPct=protTarget?Math.min(100,Math.round(totalProt/protTarget*100)):0;
  const calRemain=Math.max(0,calTarget-totalCal);
  $('#inicioCalories').innerHTML=`<div class="inicio-big-num">${totalCal.toLocaleString('es-ES')}<span class="inicio-big-unit"> / ${calTarget.toLocaleString('es-ES')} kcal</span></div><div class="hoy-bar-track" style="margin-top:8px;"><div class="hoy-bar-fill" style="width:${calPct}%"></div></div><div class="inicio-remain">${calRemain.toLocaleString('es-ES')} kcal restantes</div>`;
  $('#inicioProtein').innerHTML=`<div class="inicio-big-num">${totalProt}<span class="inicio-big-unit"> / ${protTarget} g</span></div><div class="hoy-bar-track" style="margin-top:8px;"><div class="hoy-bar-fill" style="width:${protPct}%;background:linear-gradient(90deg,var(--tomato),#e74c3c)"></div></div><div class="inicio-macro-detail">🌾 ${totalCarb}/${carbTarget}g · 🥑 ${totalFat}/${fatTarget}g</div>`;
  renderWaterSection(u,$('#inicioWaterCard'));
  renderInicioSleep(u,key);
  if(day){
    const d2=new Date();
    $('#hoyDate').textContent=day.dia+', '+d2.getDate()+'/'+(d2.getMonth()+1)+'/'+d2.getFullYear();
    let mealsHtml='';
    mts.forEach(mt=>{
      const m=day[mt];if(!m)return;
      const mealName=typeof m==='object'?m.n:m;
      const calVal=typeof m==='object'?m.cal:(getND(mealName)?getND(mealName).k:0);
      const icon=MEAL_ICONS[mt]||'🍽️';
      const label=MEAL_LABELS[mt]||mt;
      const isEaten=!!eaten[mt];
      mealsHtml+=`<div class="meal-card${isEaten?' eaten':''}" data-type="${mt}" data-key="${key}"><span class="meal-check">✅</span><div class="meal-header"><span class="meal-icon">${icon}</span><span class="meal-type">${label}</span></div><p class="meal-name">${mealName}</p><p class="meal-cal">${calVal?calVal+' kcal':''}</p><button class="meal-btn${isEaten?' done':''}" ${isEaten?'disabled':''}>${isEaten?'✓ Comido':'Marcar como comido'}</button><div class="extra-section"><button class="extra-toggle" data-type="${mt}">+ ¿Comiste algo más?</button><div class="extra-list" id="extraList-${mt}"></div><div class="extra-total" id="extraTotal-${mt}"></div></div></div>`;
    });
    $('#todayMeals').innerHTML=mealsHtml||'<p style="color:var(--ink-soft);font-size:.88rem;">Sin comidas planificadas</p>';
    $('#todayMeals').querySelectorAll('.meal-btn:not(.done)').forEach(btn=>{
      btn.addEventListener('click',function(){const card=this.closest('.meal-card');openFoodModal(card.dataset.type,card.dataset.key,u);});
    });
    mts.forEach(mt=>{renderExtraList(mt,key,u);});
    $('#todayMeals').querySelectorAll('.extra-toggle').forEach(btn=>{
      btn.addEventListener('click',function(){openExtraFoodModal(this.dataset.type,key,u);});
    });
    renderHoyCalories(u,day,key);
  }else{
    $('#todayMeals').innerHTML='<p style="color:var(--ink-soft);font-size:.88rem;">Sin plan para hoy</p>';
    $('#hoyCalorieBar').innerHTML='';
    $('#hoyDate').textContent='';
  }
  renderInicioTraining(u);
  renderInicioProgress(u);
  renderInicioPersonalization(u);
  renderSmartTips(u);
}
function renderInicioSleep(u,key){
  const el=$('#inicioSleepCard');if(!el)return;
  const sleepH=(u.sleep&&u.sleep[key])||null;
  const rating=getSleepRating(sleepH);
  let html='';
  if(sleepH!==null&&sleepH!==undefined&&sleepH!==''){
    const hours=parseFloat(sleepH);
    html=`<div class="sleep-display"><span class="sleep-hours">${hours%1===0?hours:hours.toFixed(1)}</span><span class="sleep-hours-unit">h</span></div>`;
    html+=`<div class="sleep-rating ${rating.cls}">${rating.emoji} ${rating.label}</div>`;
    html+=`<p class="sleep-desc">${rating.desc}</p>`;
    html+=`<p class="sleep-target">Objetivo: 7–9 h</p>`;
    html+=`<button class="btn btn-small pf-btn pf-btn--ghost" onclick="editSleep()">Editar</button>`;
  }else{
    html=`<div class="sleep-display sleep-empty"><span class="sleep-hours">—</span><span class="sleep-hours-unit">h</span></div>`;
    html+=`<p class="sleep-desc" style="color:var(--ink-soft);">Registra tus horas de sueño</p>`;
    html+=`<p class="sleep-target">Objetivo: 7–9 h</p>`;
    html+=`<button class="btn btn-small pf-btn pf-btn--ghost" onclick="editSleep()">Registrar sueño</button>`;
  }
  html+=renderSleepWeek(u);
  el.innerHTML=html;
}
function getSleepRating(h){
  if(h===null||h===undefined||h==='')return{cls:'',label:'',emoji:'',desc:''};
  const v=parseFloat(h);
  if(isNaN(v))return{cls:'',label:'',emoji:'',desc:''};
  if(v<5)return{cls:'sleep-very-low',label:'Muy poco',emoji:'🔴',desc:'Has dormido bastante menos de lo recomendado.'};
  if(v<6)return{cls:'sleep-low',label:'Insuficiente',emoji:'🟠',desc:'Intenta priorizar un descanso más prolongado.'};
  if(v<7)return{cls:'sleep-medium',label:'Mejorable',emoji:'🟡',desc:'Estás cerca del rango adecuado. Un poco más haría la diferencia.'};
  if(v<=9)return{cls:'sleep-good',label:'Bien',emoji:'🟢',desc:'Tu descanso está dentro de un rango adecuado.'};
  return{cls:'sleep-good',label:'Adecuado',emoji:'🟢',desc:'Descanso prolongado. Si te sientes bien, perfecto.'};
}
function renderSleepWeek(u){
  const el2=$('#inicioSleepWeek');
  const days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const now=new Date();
  const monday=new Date(now);
  const dow=now.getDay();
  monday.setDate(now.getDate()-((dow+6)%7));
  let totalH=0,countH=0;
  const entries=[];
  for(let i=0;i<7;i++){
    const dt=new Date(monday);
    dt.setDate(monday.getDate()+i);
    const k=dt.getFullYear()+'-'+(dt.getMonth()+1).toString().padStart(2,'0')+'-'+dt.getDate().toString().padStart(2,'0');
    const h=u.sleep&&u.sleep[k]?parseFloat(u.sleep[k]):null;
    const isToday=k===todayKey();
    if(h!==null&&!isNaN(h)){totalH+=h;countH++;}
    entries.push({day:days[i],hours:h,isToday});
  }
  const avg=countH?(totalH/countH).toFixed(1):'—';
  let html='<div class="sleep-week"><div class="sleep-week-header"><span class="sleep-week-title">Sueño esta semana</span><span class="sleep-week-avg">Media: '+avg+' h</span></div><div class="sleep-week-row">';
  entries.forEach(e=>{
    const cls=e.isToday?'today':e.hours!==null?'logged':'';
    const val=e.hours!==null?(e.hours%1===0?e.hours:e.hours.toFixed(1)):'—';
    html+=`<div class="sleep-week-day ${cls}"><span class="sleep-week-label">${e.day}</span><span class="sleep-week-val">${val}</span></div>`;
  });
  html+='</div></div>';
  return html;
}
function editSleep(){
  const u=currentUser();if(!u)return;
  const key=todayKey();
  const current=(u.sleep&&u.sleep[key])||'';
  const val=prompt('Horas de sueño (ej: 7.5):',current);
  if(val===null)return;
  const v=parseFloat(val);
  if(isNaN(v)||v<0||v>24){alert('Introduce un valor válido (0-24).');return;}
  if(!u.sleep)u.sleep={};
  if(v||v===0){u.sleep[key]=v;}else{delete u.sleep[key];}
  saveUser(u);renderInicio(u);
}
function renderInicioTraining(u){
  const el=$('#inicioTraining');if(!u.entreno||!u.entreno.tipo){el.innerHTML='';return;}
  const t=u.entreno;
  const tipo=t.tipo||'—';
  const dias=t.dias||0;
  const dur=t.duracion||0;
  el.innerHTML=`<div class="dash-card pf-card pf-card--fade" data-delay="5"><div class="pf-card-head"><span class="pf-icon">🏋️</span><h3>Entrenamiento</h3></div><div class="inicio-training"><div class="inicio-train-row"><span class="inicio-train-label">Tipo</span><span class="inicio-train-val">${tipo}</span></div><div class="inicio-train-row"><span class="inicio-train-label">Días/sem</span><span class="inicio-train-val">${dias}</span></div><div class="inicio-train-row"><span class="inicio-train-label">Duración</span><span class="inicio-train-val">${dur} min</span></div></div></div>`;
}
function renderHoyCalories(u,day,key){
  const stats=u.stats||{};
  const eaten=u.consumed[key]||{};
  const mts=getMealSlots(day);
  const calTarget=stats.calorias||0;
  const protTarget=Math.round(calTarget*0.3/4);
  const carbTarget=Math.round(calTarget*0.4/4);
  const fatTarget=Math.round(calTarget*0.3/9);
  let totalCal=0,totalProt=0,totalCarb=0,totalFat=0;
  mts.forEach(mt=>{
    const name=day[mt];const nd=getND(name);
    if(eaten[mt]&&nd){totalCal+=nd.k;totalProt+=nd.p;totalCarb+=nd.c;totalFat+=nd.g;}
    const extras=u.extraFoods&&u.extraFoods[key]&&u.extraFoods[key][mt];
    if(extras)extras.forEach(e=>{totalCal+=(e.k||0);totalProt+=(e.p||0);totalCarb+=(e.c||0);totalFat+=(e.g||0);});
    const custom=u.customFoods&&u.customFoods[key]&&u.customFoods[key][mt];
    if(custom){totalCal+=(custom.k||0);totalProt+=(custom.p||0);totalCarb+=(custom.c||0);totalFat+=(custom.g||0);}
  });
  const remaining=Math.max(0,calTarget-totalCal);
  const pct=calTarget?Math.min(100,Math.round(totalCal/calTarget*100)):0;
  let html=`<div class="hoy-bar-wrap"><div class="hoy-bar-track"><div class="hoy-bar-fill" style="width:${pct}%"></div></div>`;
  html+=`<div class="hoy-bar-nums"><span class="hoy-consumed">${totalCal.toLocaleString('es-ES')} / ${calTarget.toLocaleString('es-ES')} kcal</span>`;
  html+=`<span class="hoy-remaining">${remaining.toLocaleString('es-ES')} kcal restantes</span></div></div>`;
  html+=`<div class="hoy-macro-row"><span class="hoy-macro">💪 ${totalProt}/${protTarget}g proteína</span><span class="hoy-macro">🌾 ${totalCarb}/${carbTarget}g carbohidratos</span><span class="hoy-macro">🥑 ${totalFat}/${fatTarget}g grasas</span></div>`;
  const el=$('#hoyCalorieBar');if(el)el.innerHTML=html;
}
function renderSmartTips(u){
  const el=$('#inicioTips');if(!el)return;
  const tips=[];
  const key=todayKey();
  const idx=todayIndex();
  const day=u.menu[idx];
  const eaten=u.consumed[key]||{};
  if(day){
    const mts=getMealSlots(day);
    const completed=mts.filter(mt=>eaten[mt]).length;
    const total=mts.length;
    if(completed===total&&total>0)tips.push({icon:'🎉',text:'¡Hoy has completado todas tus comidas!'});
    else if(completed>0&&completed<total)tips.push({icon:'💪',text:'Llevas '+completed+' de '+total+' comidas. ¡Sigue así!'});
  }
  const ph=u.physical||{};
  if(u.objetivo==='Ganar masa muscular'&&ph.peso){
    tips.push({icon:'💡',text:'Recuerda distribuir la proteína a lo largo del día para mejor absorción.'});
  }
  if(u.objetivo==='Regular el peso'){
    const wl=u.weightHistory||[];
    if(wl.length>=2){
      const last=wl[wl.length-1].peso;
      const prev=wl[wl.length-2].peso;
      if(last<prev)tips.push({icon:'📉',text:'¡Buen progreso! Has bajado '+(prev-last).toFixed(1)+' kg desde tu último registro.'});
    }
  }
  if(u.entreno&&u.entreno.tipo){
    const tipo=u.entreno.tipo;
    const dur=u.entreno.duracion||60;
    if(dur>=60)tips.push({icon:'🏋️',text:'Día de '+tipo+' ('+dur+' min). Asegúrate de hidratarte bien alrededor del entrenamiento.'});
  }
  const waterLog=u.water&&u.water[key];
  if(waterLog&&waterLog.total){
    const target=calcWaterTarget(u);
    const pct=Math.round(waterLog.total/target*100);
    if(pct<50)tips.push({icon:'💧',text:'Solo has bebido el '+pct+'% de tu objetivo de agua. Intenta beber más durante la tarde.'});
  }
  if(!tips.length)return;
  el.innerHTML='<div class="dash-card pf-card pf-card--compact" style="border-left:3px solid var(--yolk);margin-top:12px;">'+
    '<div class="pf-card-head"><span class="pf-icon">💡</span><h3>Recomendaciones</h3></div>'+
    '<div class="tips-list">'+tips.map(t=>'<div class="tip-item"><span class="tip-icon">'+t.icon+'</span><span class="tip-text">'+t.text+'</span></div>').join('')+'</div></div>';
}
function getMealSlots(day){
  const all=['desayuno','media_mañana','comida','merienda','cena','snack','post_entreno'];
  return all.filter(k=>day[k]);
}
function renderInicioProgress(u){
  const el=$('#inicioProgress');if(!el)return;
  const pes=u.physical?u.physical.peso:null;
  const w=u.weightHistory||[];
  let html='';
  if(pes){
    const initial=w.length?w[0].peso:pes;
    const current=w.length?w[w.length-1].peso:pes;
    const change=(current-initial).toFixed(1);
    const sign=change>0?'+':'';
    html+=`<div class="inicio-progress-stats"><div class="inicio-prog-stat"><span class="inicio-prog-val">${pes} kg</span><span class="inicio-prog-label">Peso actual</span></div>`+
      `<div class="inicio-prog-stat"><span class="inicio-prog-val">${initial} kg</span><span class="inicio-prog-label">Peso inicial</span></div>`+
      `<div class="inicio-prog-stat"><span class="inicio-prog-val">${sign}${change} kg</span><span class="inicio-prog-label">Cambio</span></div></div>`;
  }
  if(w.length>1){
    const maxP=Math.max(...w.map(x=>x.peso));
    const minP=Math.min(...w.map(x=>x.peso));
    const range=maxP-minP||1;
    html+='<div class="inicio-chart">';
    w.slice(-10).forEach(p=>{
      const h=5+((p.peso-minP)/range)*40;
      html+=`<div class="inicio-chart-bar" style="height:${h}px" title="${p.fecha}: ${p.peso} kg"></div>`;
    });
    html+='</div>';
  }
  html+=`<div class="pf-actions" style="border:none;padding:0;margin-top:12px;"><button class="btn pf-btn pf-btn--ghost" onclick="openWeightModal()" style="font-size:.82rem;">Registrar peso</button></div>`;
  el.innerHTML=html;
}
function openWeightModal(){
  const u=currentUser();if(!u)return;
  const current=u.physical?u.physical.peso:'';
  $('#weightInput').value=current||'';
  $('#weightMsg').textContent='';
  $('#weightMsg').className='auth-msg';
  $('#weightOverlay').classList.remove('hidden');
  setTimeout(()=>$('#weightInput').focus(),100);
}
$('#weightConfirm').addEventListener('click',()=>{
  const val=$('#weightInput').value;
  const peso=parseFloat(val);
  if(isNaN(peso)||peso<20||peso>400){$('#weightMsg').textContent='Introduce un peso válido (20-400 kg).';$('#weightMsg').className='auth-msg err';return;}
  const u=currentUser();if(!u)return;
  if(!u.weightHistory)u.weightHistory=[];
  const fecha=new Date().toISOString().slice(0,10);
  const existing=u.weightHistory.findIndex(w=>w.fecha===fecha);
  if(existing>=0)u.weightHistory[existing].peso=peso;
  else u.weightHistory.push({fecha,peso});
  u.weightHistory.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  if(u.weightHistory.length>30)u.weightHistory=u.weightHistory.slice(-30);
  saveUser(u);
  $('#weightOverlay').classList.add('hidden');
  renderInicio(u);
});
$('#weightCancel').addEventListener('click',()=>{$('#weightOverlay').classList.add('hidden');});
$('#weightOverlay').addEventListener('click',e=>{if(e.target.id==='weightOverlay')$('#weightOverlay').classList.add('hidden');});
$('#weightInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#weightConfirm').click();});
function renderInicioPersonalization(u){
  const el=$('#inicioPersonalization');if(!el)return;
  const checks=[];
  if(u.physical&&u.physical.peso)checks.push('Datos físicos');
  if(u.objetivo)checks.push('Objetivo');
  if(u.entreno&&u.entreno.tipo)checks.push('Entrenamiento');
  if(u.dietaType&&u.dietaType!=='todos')checks.push('Tipo de alimentación');
  if(u.alergias&&u.alergias.length)checks.push('Alergias');
  if(u.noComer)checks.push('Preferencias');
  if(u.numComidas&&u.numComidas!==4)checks.push('Número de comidas');
  const total=7;
  const pct=Math.round((checks.length/total)*100);
  let html=`<div class="inicio-pct"><span class="inicio-pct-num">${pct}%</span><span class="inicio-pct-label">personalizado</span></div><div class="inicio-checks">`;
  checks.forEach(c=>{html+=`<div class="inicio-check">✓ ${c}</div>`;});
  if(checks.length<total)html+=`<p style="font-size:.82rem;color:var(--ink-soft);margin-top:10px;">Completa tu perfil para mejorar tu plan</p>`;
  html+='</div>';
  el.innerHTML=html;
}

/* Water system */
function renderWaterSection(u,targetEl){
  const el=targetEl||$('#hoyWaterSection');if(!el)return;
  const target=calcWaterTarget(u);
  const log=getWaterLog(u);
  const consumed=log.total||0;
  const pct=Math.min(100,Math.round(consumed/target*100));
  const targetL=(target/1000).toFixed(1).replace('.',',');
  const consumedL=(consumed/1000).toFixed(2).replace('.',',');
  const done=pct>=100;
  const barColor=done?'var(--herb)':pct>=60?'var(--yolk)':'var(--tomato)';
  let html=`<div class="water-target-row"><span class="water-target-label">Objetivo</span><span class="water-target-val">${targetL} L</span></div>`;
  html+=`<div class="water-bar-wrap"><div class="water-bar-track"><div class="water-bar-fill" style="width:${pct}%;background:${barColor}"></div></div></div>`;
  html+=`<div class="water-consumed-row"><span class="water-consumed-val">${consumedL} / ${targetL} L</span><span class="water-consumed-pct">${pct}%</span></div>`;
  if(done){
    html+=`<div class="water-done-msg">💧 ¡Objetivo de hidratación conseguido!</div>`;
  }
  html+=`<div class="water-btns">`;
  [250,500,750].forEach(ml=>{
    html+=`<button class="water-btn" data-ml="${ml}">+${ml} ml</button>`;
  });
  html+=`</div>`;
  const entries=log.entries||[];
  if(entries.length){
    html+=`<div class="water-log">`;
    entries.slice().reverse().forEach((e,i)=>{
      const realIdx=entries.length-1-i;
      const mlStr=e.ml>=1000?(e.ml/1000).toFixed(1).replace('.',',')+' L':e.ml+' ml';
      html+=`<span class="water-log-entry">+${mlStr}<button class="water-log-del" data-idx="${realIdx}">×</button></span>`;
    });
    html+=`</div>`;
  }
  const hint=done?'💡 ¡Bien hidratado! Sigue así.':'💡 Intenta repartir el consumo de agua durante todo el día.';
  html+=`<p class="water-hint">${hint}</p>`;
  el.innerHTML=html;
  el.querySelectorAll('.water-btn').forEach(btn=>{
    btn.addEventListener('click',function(){
      addWater(+this.dataset.ml,u);
    });
  });
  el.querySelectorAll('.water-log-del').forEach(btn=>{
    btn.addEventListener('click',function(){
      removeWaterEntry(+this.dataset.idx,u);
    });
  });
}
function addWater(ml,u){
  const log=getWaterLog(u);
  const target=calcWaterTarget(u);
  if(log.total+ml>target*3){
    if(!confirm('Has registrado una cantidad muy elevada.\n¿Seguro que quieres continuar?'))return;
  }
  log.entries.push({ml,ts:Date.now()});
  log.total+=ml;
  saveUser(u);
  renderWaterSection(u);
}
function removeWaterEntry(idx,u){
  const log=getWaterLog(u);
  const entries=log.entries||[];
  if(idx<0||idx>=entries.length)return;
  log.total-=entries[idx].ml;
  if(log.total<0)log.total=0;
  entries.splice(idx,1);
  saveUser(u);
  renderWaterSection(u);
}

/* Extra foods (fuera del plan) */
function renderExtraList(mt,key,u){
  const list=$('#extraList-'+mt);if(!list)return;
  const extras=u.extraFoods&&u.extraFoods[key]&&u.extraFoods[key][mt]||[];
  list.innerHTML='';let totalK=0;
  extras.forEach((x,i)=>{
    totalK+=x.k;
    const d=document.createElement('div');d.className='extra-item';
    d.innerHTML='<span class="extra-text">'+x.text+'</span><span class="extra-kcal">'+x.k+' kcal</span><button class="extra-del" title="Eliminar">×</button>';
    d.querySelector('.extra-del').addEventListener('click',function(){
      u.extraFoods[key][mt].splice(i,1);saveUser(u);renderExtraList(mt,key,u);
    });
    list.appendChild(d);
  });
  const tot=$('#extraTotal-'+mt);
  if(tot)tot.textContent=totalK>0?'+'+totalK+' kcal fuera del plan':'';
}

function openExtraFoodModal(mt,key,u){
  foodModalState={mt,key,user,u,extra:true};
  $('#foodTitle').textContent='¿Qué más has comido?';
  $('#foodSubtitle').textContent='Algo fuera del plan que quieras registrar';
  $('#foodInput').value='';
  $('#foodQty').value=150;
  $('#foodEstimate').classList.add('hidden');
  $('#foodOverlay').classList.remove('hidden');
  setTimeout(()=>$('#foodInput').focus(),100);
}

/* Override food confirm to handle extra mode */
(function(){
const origConfirm=$('#foodConfirm').onclick;
$('#foodConfirm').onclick=function(){
  const s=foodModalState;
  const text=$('#foodInput').value.trim();
  const qty=+$('#foodQty').value||200;
  if(s.extra){
    /* Extra food mode */
    const est=text?estimateFood(text,qty):null;
    const u=s.user;const ky=s.key;const mt=s.mt;
    if(!u.extraFoods)u.extraFoods={};if(!u.extraFoods[ky])u.extraFoods[ky]={};if(!u.extraFoods[ky][mt])u.extraFoods[ky][mt]=[];
    if(est){
      u.extraFoods[ky][mt].push({text,k:est.k,p:est.p,c:est.c,g:est.g});
    }else{
      const nd=getND(u.menu[todayIndex()]?.[mt]||'');
      u.extraFoods[ky][mt].push({text:text||'Comida extra',k:nd.k,p:nd.p,c:nd.c,g:nd.g});
    }
    saveUser(u);$('#foodOverlay').classList.add('hidden');
    renderExtraList(mt,ky,u);
  }else{
    /* Original plan food mode */
    const u=s.user;const mt=s.mt;const ky=s.key;
    if(!u.consumed[ky])u.consumed[ky]={};u.consumed[ky][mt]=true;
    if(text){
      const est=estimateFood(text,qty);
      if(est){
        if(!u.customFoods)u.customFoods={};if(!u.customFoods[ky])u.customFoods[ky]={};
        u.customFoods[ky][mt]={text,k:est.k,p:est.p,c:est.c,g:est.g};
      }
    }
    saveUser(u);$('#foodOverlay').classList.add('hidden');
    const card=document.querySelector('.meal-card[data-type="'+mt+'"]');
    if(card){card.classList.add('eaten');const btn=card.querySelector('.meal-btn');if(btn){btn.classList.add('done');btn.textContent='✓ Comido';btn.disabled=true;}
    }
    renderExtraList(mt,ky,u);
    const day=u.menu[todayIndex()];
    if(day&&getMealSlots(day).every(slot=>u.consumed[ky]&&u.consumed[ky][slot]))launchConfetti();
    if(typeof renderInicio==='function')renderInicio(u);
  }
};
})();

/* SEMANA */
function extractMeriendaPre(note){if(!note)return'';const m=note.match(/Merienda pre-entreno[^:]*:\s*([^.]+\.?)/i);return m?m[1].trim():'';}
function cleanNote(note){if(!note)return'';return note.replace(/Merienda pre-entreno[^:]*:[^.]+\.?\s*/i,'').trim();}
function renderPlanHistory(u){
  const el=$('#planHistorySection');if(!el)return;
  const hist=u.planHistory||[];
  if(!hist.length){el.innerHTML='';return;}
  let html='<div class="plan-history"><div class="plan-history-header"><span class="pf-icon">📋</span><h3>Planes anteriores</h3></div><div class="plan-history-list">';
  hist.slice().reverse().forEach((p,i)=>{
    const days=p.menu?p.menu.length:0;
    const meals=p.menu?p.menu.reduce((s,d)=>{
      const slots=getMealSlots(d);
      return s+slots.length;
    },0):0;
    html+=`<div class="plan-history-item"><span class="plan-history-date">${p.fecha}</span><span class="plan-history-info">${days} días · ${meals} comidas</span></div>`;
  });
  html+='</div></div>';
  el.innerHTML=html;
}
function renderSemana(u){
  debugPlan('RENDERIZADO (renderSemana)',u.menu);
  $('#menuTipo').textContent=u.objetivo;
  const ti=todayIndex();
  const nav=$('#semanaNav');
  const wrap=$('#semanaCards');
  if(!nav||!wrap)return;
  renderPlanHistory(u);
  const dayIcons=['🌙','🛒','🍽️','🔥','💪','🎉','☀️'];
  nav.innerHTML=u.menu.map((m,i)=>{
    const short=m.dia?m.dia.slice(0,3):'';
    return `<button class="semana-day-btn${i===ti?' active':''}" data-idx="${i}"><span class="semana-day-icon">${dayIcons[i]||'🍽️'}</span><span class="semana-day-name">${short}</span>${i===ti?'<span class="semana-day-dot"></span>':''}</button>`;
  }).join('');
  nav.querySelectorAll('.semana-day-btn').forEach(btn=>{
    btn.addEventListener('click',function(){
      nav.querySelectorAll('.semana-day-btn').forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      renderSemanaDay(+this.dataset.idx,u);
    });
  });
  renderSemanaDay(ti,u);
}
function renderSemanaDay(idx,u){
  const wrap=$('#semanaCards');
  const m=u.menu[idx];
  if(!m){wrap.innerHTML='<p style="color:var(--ink-soft);">Sin datos para este día.</p>';return;}
  const ti=todayIndex();
  const isToday=idx===ti;
  if(idx===0)debugPlan('RENDERIZADO (renderSemana)',u.menu);
  const eaten=u.consumed[idx]||{};
  const mts=getMealSlots(m);
  let totalCal=0;
  const mealCards=mts.map(mt=>{
    const raw=m[mt];
    if(!raw)return'';
    const name=typeof raw==='object'?raw.n:raw;
    const cal=typeof raw==='object'?raw.cal:(getND(name)?getND(name).k:0);
    totalCal+=(cal||0);
    const icon=MEAL_ICONS[mt]||'🍽️';
    const label=MEAL_LABELS[mt]||mt;
    const det=getAllDetails(name);
    const isEaten=!!eaten[mt];
    const calStr=cal?`<span class="semana-meal-kcal">${cal} kcal</span>`:'';
    const recetaBtn=det?`<span class="semana-meal-receta">Ver receta →</span>`:'';
    return `<div class="semana-meal-card${isEaten?' eaten':''}" data-day="${idx}" data-mt="${mt}">
      <div class="semana-meal-top"><span class="semana-meal-icon">${icon}</span><span class="semana-meal-type">${label}</span>${isEaten?'<span class="semana-meal-check">✓</span>':''}</div>
      <p class="semana-meal-name">${name}</p>
      <div class="semana-meal-bottom">${calStr}${recetaBtn}</div>
    </div>`;
  }).join('');
  const tagStr=m.tag?`<span class="semana-tag">${m.tag}</span>`:'';
  wrap.innerHTML=`<div class="semana-day-card${isToday?' today':''}">
    <div class="semana-day-header">
      <div class="semana-day-title"><h3>${m.dia||'Día '+(idx+1)}</h3>${isToday?'<span class="semana-today-badge">Hoy</span>':''}${tagStr}</div>
      <div class="semana-day-total"><span class="semana-day-total-num">${m.dayCal||totalCal}</span><span class="semana-day-total-unit">kcal</span></div>
    </div>
    <div class="semana-meals-grid">${mealCards}</div>
  </div>`;
  wrap.querySelectorAll('.semana-meal-card').forEach(c=>{
    c.addEventListener('click',()=>openMealDetail(+c.dataset.day,c.dataset.mt,u));
  });
}
function getAllDetails(name){return MEAL_DETAILS[name]||W_MEAL_DETAILS[name]||M_MEAL_DETAILS[name]||null;}

/* Detalle de comida + sustituciones 1×1 */
let mealCtx=null;
function getSubs(u){if(!u.subs)u.subs={};return u.subs;}
function openMealDetail(dayIdx,mt,u){
  mealCtx={dayIdx,mt};
  const m=u.menu[dayIdx];const raw=m[mt];const mealName=typeof raw==='object'?raw.n:raw;const det=getAllDetails(mealName);
  const isEquilibrado=u.objetivo==='Equilibrado';
  $('#mealDetailTitle').textContent=mealName;
  $('#mealDetailTag').textContent=(m.dia+' · '+MEAL_LABELS[mt]).replace(/^ · /,'');
  if(!isEquilibrado){
    const nd=getND(mealName);
    const calInfo=typeof raw==='object'&&raw.cal?`🔥 ${raw.cal} kcal`:`🔥 ${nd.k} kcal`;
    $('#mealDetailMacros').innerHTML=`<span class="macro-chip">${calInfo}</span><span class="macro-chip">P ${nd.p}g</span><span class="macro-chip">C ${nd.c}g</span><span class="macro-chip">G ${nd.g}g</span>`;
    $('#mealDetailMacros').style.display='flex';
  }else{$('#mealDetailMacros').style.display='none';}
  renderMealItems(u);
  const clean=det&&det.note?cleanNote(det.note):'';
  $('#mealDetailPrep').textContent=det&&det.prep?'👨‍🍳 '+det.prep:'';
  $('#mealDetailNote').textContent=clean?'💡 '+clean:'';
  $('#mealDetailPrep').style.display=det&&det.prep?'block':'none';
  $('#mealDetailNote').style.display=clean?'block':'none';
  $('#mealOverlay').classList.remove('hidden');
}
function renderMealItems(u){
  const {dayIdx,mt}=mealCtx;const m=u.menu[dayIdx];const raw=m[mt];const mealName=typeof raw==='object'?raw.n:raw;const det=getAllDetails(mealName);
  const isEquilibrado=u.objetivo==='Equilibrado';
  const wrap=$('#mealDetailItems');wrap.innerHTML='';
  if(!det){wrap.innerHTML='<p style="font-size:.85rem;color:var(--ink-soft);">Sin detalle disponible para esta comida.</p>';return;}
  const subs=getSubs(u);const daySubs=subs[dayIdx]&&subs[dayIdx][mt]||{};
  det.items.forEach((it,idx)=>{
    const [qty,name,grp,opt,sup]=it;
    const subName=daySubs[idx];
    const row=document.createElement('div');row.className='mdi-row';
    let nameHtml=subName?`<span class="mdi-name sub">${subName}</span><span style="font-size:.7rem;color:var(--ink-soft);">(antes: ${name})</span>`:`<span class="mdi-name">${name}</span>`;
    row.innerHTML=`<span class="mdi-qty">${qty||'·'}</span>${nameHtml}${opt?'<span class="mdi-opt">opcional</span>':''}${!isEquilibrado&&grp&&grp!==SUP?`<span class="mdi-badge">${GROUP_NAMES[grp]||grp}</span>`:''}`;
    if(!isEquilibrado&&grp&&grp!==SUP){
      const sel=document.createElement('select');sel.className='mdi-sel';
      sel.innerHTML='<option value="">⇄ sustituir…</option>'+SUBSTITUTION_GROUPS[grp].filter(x=>x!==name).map(x=>`<option value="${x}">${x}</option>`).join('');
      sel.addEventListener('change',()=>{
        if(!subs[dayIdx])subs[dayIdx]={};if(!subs[dayIdx][mt])subs[dayIdx][mt]={};
        if(sel.value){subs[dayIdx][mt][idx]=sel.value;}else{delete subs[dayIdx][mt][idx];}
        saveUser(u);renderMealItems(u);renderLista(u);
      });
      row.appendChild(sel);
    }
    wrap.appendChild(row);
  });
}
$('#mealDetailClose').addEventListener('click',()=>{$('#mealOverlay').classList.add('hidden');});
$('#mealOverlay').addEventListener('click',e=>{if(e.target.id==='mealOverlay')$('#mealOverlay').classList.add('hidden');});

/* LISTA — unidades reales de compra */
const SHOP_DISPLAY={'15 min antes: chupito de vinagre de sidra de manzana en agua':'Vinagre de sidra de manzana','Arroz vaporizado en seco (~240 g cocido)':'Arroz vaporizado','Arroz vaporizado en seco (~300 g cocido)':'Arroz vaporizado','Arroz vaporizado en seco':'Arroz vaporizado','Aguacate / 50 g guacamole':'Aguacate','Aguacate / 80 g guacamole':'Aguacate','Quinoa en seco (~240 g cocida)':'Quinoa','Quinoa en seco, lavada previamente':'Quinoa','Patata cocida':'Patata','Patata cocida / horno / airfryer':'Patata','Patata asada':'Patata','Patata cocida en dados':'Patata','Patata / 250 g boniato asado o airfryer':'Patata o boniato','Boniato airfryer / asado':'Boniato','Calabaza al airfryer':'Calabaza','Calabaza asada':'Calabaza','Ñoquis de patata (250 g)':'Ñoquis','Pasta de lenteja roja (80 g en seco)':'Pasta de lenteja roja','Caballa / sardinas':'Lata de pescado (caballa, sardinas)','Caballa / bonito':'Lata de pescado (caballa, sardinas)','Caballa / atún / bonito':'Lata de pescado (caballa, sardinas)','Bonito / atún / boquerones':'Lata de pescado (caballa, sardinas)','Sardinas':'Lata de pescado (caballa, sardinas)','Huevos revueltos':'Huevos','Huevos cocidos':'Huevos','Huevos cocidos salteados con AOVE':'Huevos','Yogur griego natural':'Yogur griego','Yogur de cabra / oveja':'Yogur de cabra','Yogur de cabra + cacao puro + frutos rojos':'Yogur de cabra','Yogur de coco natural':'Yogur de coco','Kéfir de cabra/oveja + frutos rojos + canela':'Kéfir de cabra/oveja','Salmón especiado (sal, pimienta, limón)':'Salmón','Salmón fresco con limón y especias':'Salmón','Atún en dados':'Atún','Pescado blanco (merluza, lubina, dorada)':'Pescado blanco','Lubina':'Pescado blanco','Merluza':'Pescado blanco','Pescado (merluza o salmón)':'Pescado blanco','Carne picada de ternera especiada + tomate natural sin azúcar':'Carne picada de ternera','Carne picada / entrecot / chuletas de ternera':'Ternera','Pechuga de pollo especiada (cúrcuma y pimienta)':'Pechuga de pollo','Pollo o pavo en tiras (o atún)':'Pollo o pavo','Pan integral de espelta o centeno (2 rebanadas)':'Pan integral','Pan integral de centeno (2 rebanadas)':'Pan integral','Tortillas integrales / 100 g avena molida':'Tortillas integrales o avena molida','Frutos secos (nueces, almendras, avellanas)':'Frutos secos','Plátano machacado':'Plátano','Miel natural':'Miel','Café / descafeinado espresso':'Café','Café solo o con bebida de almendras 0%':'Café','Bebida de almendras 0%':'Bebida de almendras','Queso feta desmenuzado':'Queso feta','Tomate fresco, sal y especias':'Tomate','Tomate rallado o en rodajas':'Tomate','Zanahoria rallada o cocida':'Zanahoria','Brócoli cocido':'Brócoli','Espinacas salteadas':'Espinacas','Espárragos trigueros + champiñones salteados':'Espárragos y champiñones','Sal, pimienta y pimentón':'Sal y especias','Especias: cúrcuma, pimentón, comino, orégano':'Especias','Verduras salteadas: calabacín, pimiento, espárragos verdes, ajo':'Verduras para saltear','Zumo de lima o limón al final':'Limones','Yogur griego para aliñar + AOVE + sal':'Yogur griego','Yogur griego para salsa + limón + sal + AOVE':'Yogur griego','Puré caliente de calabaza / calabacín / zanahoria':'Calabaza, calabacín y zanahoria','½ pimiento rojo + ½ verde, ½ cebolla, ½ calabacín':'Pimientos, cebolla y calabacín','Canónigos + tomate + cebolla pochada':'Canónigos, tomate y cebolla','Espinacas y brócoli de acompañamiento':'Espinacas y brócoli','Pepino o calabacín + zanahoria rallada + espinacas':'Pepino, calabacín, zanahoria y espinacas','Rúcula o espinaca fresca':'Rúcula o espinacas','Tomate cherry o natural':'Tomate','Manzana / pera / mandarina / kiwi':'Fruta variada','Fruta (postre)':'Fruta variada','Pavo en lonchas / salmón ahumado / jamón ibérico':'Fiambre (pavo, salmón o jamón)','Crema de almendras / nueces de Brasil / anacardos':'Crema de frutos secos','Semillas de lino o chía':'Semillas','Semillas (sésamo, lino, chía)':'Semillas','Semillas de sésamo o lino':'Semillas','Puñado de frutos secos o crema de almendras':'Frutos secos','Salsa pesto o soja':'Pesto o salsa de soja','Chorrito de salsa de soja para el salmón':'Salsa de soja','Chorrito final de AOVE':'AOVE','AOVE + limón':'AOVE','AOVE + sal + especias suaves (cúrcuma, jengibre)':'AOVE','Cacao puro + canela':'Cacao puro sin azúcar','Boniato asado':'Boniato','Huevos cocidos o a la plancha':'Huevos','Miel (postre)':'Miel','Yogur griego + frutos rojos + canela':'Yogur griego','Pescado blanco o azul (merluza, salmón)':'Pescado blanco','Mozzarella rallada / queso feta / guacamole':'Queso feta','Pesto':'Pesto o salsa de soja','Espinacas o rúcula salteadas':'Rúcula o espinacas','Espárragos trigueros salteados':'Espárragos trigueros','Cebolla pochada':'Cebolla','Avena remojada':'Avena'};
const SHOP_SKIP=['agua con pizca','vitamina','magnesio','omega','proteina en polvo'];
function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function shopUnit(name,count,grams){
  const n=norm(name);
  if(SHOP_SKIP.some(k=>n.includes(k)))return null;
  if(n.includes('vinagre'))return'×1 botella';
  if(/\baove\b/.test(n))return'×1 botella';
  if(n.includes('aceite de coco'))return'×1 bote';
  if(n.includes('miel'))return'×1 tarro';
  if(n.includes('cacao'))return'×1 bote';
  if(n.includes('proteina en polvo'))return'×1 bote';
  if(n.includes('crema de frutos')||n.includes('crema de almendras'))return'×1 tarro';
  if(n.includes('kefir'))return'×1 botella';
  if(n.includes('bebida de almendras'))return'×1 brick';
  if(n.includes('chucrut')||n.includes('pesto')||n.includes('soja'))return'×1 tarro';
  if(n.includes('cafe'))return'×1 paquete';
  if(/canela|pimienta|curcuma|comino|pimenton|oregano|jengibre|especias|sal marina|\bsal\b|alino/.test(n))return'×1 tarro';
  if(n.includes('chocolate'))return'×'+count+' tableta'+(count>1?'s':'');
  if(n.includes('huevo')){const d=Math.ceil(count/12);return'×'+d+' docena'+(d>1?'s':'');}
  if(n.includes('yogur'))return'×'+count+' uds';
  if(/caballa|sardina|atun|bonito|boqueron|guisantes/.test(n))return'×'+count+' lata'+(count>1?'s':'');
  if(/pollo|pavo|ternera|cerdo|salmon|trucha|lubina|merluza|entrecot|solomillo|lomo|carne|pescado|pulpo/.test(n))return'×'+count+' bandeja'+(count>1?'s':'');
  if(/pan |tortilla|wasa|tortita|harina/.test(n))return'×1 paquete';
  if(/arroz|quinoa|avena|noquis|pasta|fideo/.test(n))return'×1 paquete';
  if(/frutos secos|almendra|nuez|semilla|avellana|anacardo/.test(n))return'×1 bolsa';
  if(/feta|mozzarella|requeson|queso/.test(n))return'×'+count+' tarrina'+(count>1?'s':'');
  if(/patata|boniato|calabaza/.test(n)){if(grams>0){let kg=Math.ceil(grams/500)/2;return'×'+kg+' kg';}return'×'+count+' uds';}
  if(/canela|pimienta|curcuma|comino|pimenton|oregano|jengibre|especias|sal marina|\bsal\b|alino/.test(n))return'×1 tarro';
  if(/manzana|pera|mandarina|kiwi|platano|mango|pina|papaya|naranja|fresa|arandano|frambruesa|frutos rojos|datiles|uvas|limon|lima|tomate|cebolla|pimiento|calabacin|pepino|champinon|setas|berenjena|lechuga|canonigos|espinaca|rucula|zanahoria|brocoli|coliflor|coles|judias verdes|esparragos|aguacate|aceitunas|remolacha|verduras|\bfruta\b|hojas verdes/.test(n))return'×'+count+' uds';
  return'×'+count;
}
const SHOP_RESET_CATS=[
{t:'Proteínas animales',items:['Pechuga de pollo','Carne picada de ternera','Salmón fresco','Pescado blanco (merluza, lubina, dorada)','Caballa en lata','Bonito / atún al natural <small>(opcional, si no usas la caballa o sardinas)</small>','Sardinas en lata','Jamón serrano / ibérico · Pavo en lonchas · Salmón ahumado <small>(puedes rotarlos)</small>','Huevos']},
{t:'Lácteos y fermentados',items:['Yogur griego natural','Yogur de cabra','Kéfir de cabra / oveja','Queso feta','Mozzarella rallada']},
{t:'Hidratos de carbono',items:['Avena en copos','Pan integral de espelta / centeno / masa madre','Arroz vaporizado','Quinoa','Patata','Boniato','Tortillas integrales <small>(fajitas)</small>','Harina de trigo sarraceno / avena molida']},
{t:'Grasas saludables',items:['Aceite de oliva virgen extra','Aguacate','Guacamole','Almendras / nueces / avellanas','Semillas de lino / sésamo']},
{t:'Verduras y hortalizas',items:['Espinacas','Brócoli','Calabacín / Pepino','Zanahoria','Pimiento','Espárragos trigueros','Tomate / cherry','Cebolla','Ajo','Calabaza']},
{t:'Otros / Extras',items:['Cacao puro en polvo sin azúcar','Chocolate negro &gt;85%','Miel','Salsa de soja <small>(opcional)</small>','Salsa pesto <small>(opcional)</small>','Salsa de tomate natural sin azúcar','Vinagre de sidra de manzana','Chucrut','Bebida de almendras 0%','Especias <small>(cúrcuma, pimienta negra, pimentón, comino, orégano, canela)</small>','Sal marina / sal fina']},
{t:'Frutas rotativas',items:['Plátano','Manzana','Pera','Mandarina','Kiwi','Piña','Melón','Papaya','Mango','Uvas','Frutos rojos <small>(fresas, arándanos, frambuesas)</small>']}
];
const SHOP_PESO_CATS=[
{t:'Proteínas',items:['Pechuga de pollo','Pavo (pechuga o lonchas)','Ternera magra','Merluza u otro pescado blanco','Salmón fresco','Huevos','Yogures naturales altos en proteína']},
{t:'Carbohidratos',items:['Arroz','Patatas','Pasta integral','Avena en copos','Pan integral','Lentejas o garbanzos']},
{t:'Frutas',items:['Plátanos','Manzanas','Kiwis','Naranjas','Fresas o frutos rojos','Peras']},
{t:'Verduras y hortalizas',items:['Brócoli','Calabacín','Pimientos','Tomate','Lechuga','Espinacas','Zanahoria','Cebolla']},
{t:'Grasas y complementos',items:['Aceite de oliva virgen extra','Almendras','Nueces','Canela','Especias <small>(pimienta, pimentón, orégano…)</small>']}
];
const PESO_PAUTAS=['Media mañana y merienda: fruta, yogur alto en proteína o un puñado de frutos secos.','Proteína en comida y cena (150 g aprox. de carne o pescado).','Verduras en al menos dos comidas al día.','Hidratos en desayuno, comida y cena (arroz, patata, pasta o pan integrales).','Cena ligera: tortilla, pescado blanco o pavo con ensalada.','Unos 2 L de agua al día; AOVE con moderación (1 cucharada).'];
/* ========== SHOPPING LIST — restructured from scratch ========== */
function getMealsDbForDieta(dietaType){
  switch(dietaType){
    case 'cetogenica':return typeof CETO_MEALS!=='undefined'?CETO_MEALS:null;
    case 'mediterranea':return typeof MED_MEALS!=='undefined'?MED_MEALS:null;
    case 'vegana':return typeof VEGAN_MEALS!=='undefined'?VEGAN_MEALS:null;
    case 'vegetariana':return typeof VEGET_MEALS!=='undefined'?VEGET_MEALS:null;
    case 'paleo':return typeof PALEO_MEALS!=='undefined'?PALEO_MEALS:null;
    default:return null;
  }
}
function getAllMealsDbs(){
  var dbs=[];
  if(typeof MED_MEALS!=='undefined')dbs.push(MED_MEALS);
  if(typeof CETO_MEALS!=='undefined')dbs.push(CETO_MEALS);
  if(typeof VEGAN_MEALS!=='undefined')dbs.push(VEGAN_MEALS);
  if(typeof VEGET_MEALS!=='undefined')dbs.push(VEGET_MEALS);
  if(typeof PALEO_MEALS!=='undefined')dbs.push(PALEO_MEALS);
  return dbs;
}
function normalizeMealName(s){
  var n=s.toLowerCase().trim().replace(/\s+/g,' ');
  n=n.replace(/½/g,'una');
  n=n.replace(/¼/g,'cuarto');
  n=n.replace(/\(\d+(?:\.\d+)?\s*(?:g|ml|l|uds?|unidades?|piezas?|raciones?|cdas?|cdtas?|tazas?|%)(?:\s+(?:en seco|arroz|avena))?[^)]*\)/gi,'');
  n=n.replace(/\(\d+(?:\.\d+)?\s*(?:uds?|unidades?|piezas?|huevos?|tortillas?|láminas?|porciones?)\)/gi,'');
  n=n.replace(/\(una\s+[^)]*\)/gi,'');
  n=n.replace(/\(media\s+[^)]*\)/gi,'');
  n=n.replace(/\(cuarto\s+[^)]*\)/gi,'');
  n=n.replace(/\([^)]*ración[^)]*\)/gi,'');
  n=n.replace(/\s*\+\s*(?:avena|fruta|queso)\b/gi,'');
  n=n.replace(/(?:avena|fruta|queso)\s*\+\s*/gi,'');
  n=n.replace(/\b\d+\s+huevos?\b/g,'huevos');
  n=n.replace(/\s+/g,' ').trim();
  n=n.replace(/\s+,/g,',');
  n=n.replace(/aceite de oliva virgen extra/g,'AOVE');
  n=n.replace(/aceite de oliva/g,'AOVE');
  n=n.replace(/aceite oliva/g,'AOVE');
  n=n.replace(/pan integral de espelta[ \/]*(?:centeno|masa madre)?/g,'pan integral');
  n=n.replace(/pan de centeno/g,'pan integral');
  n=n.replace(/pan de espelta/g,'pan integral');
  n=n.replace(/arroz vaporizado en seco/g,'arroz');
  n=n.replace(/arroz integral en seco/g,'arroz');
  n=n.replace(/arroz integral/g,'arroz');
  n=n.replace(/arroz jazmín/g,'arroz');
  n=n.replace(/arroz basmati/g,'arroz');
  n=n.replace(/arroz en seco/g,'arroz');
  n=n.replace(/pasta integral en seco/g,'pasta integral');
  n=n.replace(/yogur griego natural/g,'yogur griego');
  n=n.replace(/yogur natural/g,'yogur griego');
  n=n.replace(/bebida de almendras 0%/g,'bebida vegetal');
  n=n.replace(/leche de almendras/g,'bebida vegetal');
  n=n.replace(/bebida de almendra/g,'bebida vegetal');
  n=n.replace(/pechuga de pollo/g,'pollo');
  n=n.replace(/pollo a la plancha/g,'pollo');
  n=n.replace(/pollo al horno/g,'pollo');
  n=n.replace(/carne picada de ternera/g,'ternera');
  n=n.replace(/salmón fresco/g,'salmón');
  n=n.replace(/merluza al horno/g,'merluza');
  n=n.replace(/merluza/g,'pescado blanco');
  n=n.replace(/lubina/g,'pescado blanco');
  n=n.replace(/dorada/g,'pescado blanco');
  n=n.replace(/avena en copos/g,'avena');
  n=n.replace(/avena molida/g,'avena');
  n=n.replace(/copos de avena/g,'avena');
  n=n.replace(/espinacas salteadas/g,'espinaca');
  n=n.replace(/espinacas/g,'espinaca');
  n=n.replace(/champiñones/g,'champiñones');
  n=n.replace(/champiñón/g,'champiñones');
  n=n.replace(/patatas/g,'patata');
  n=n.replace(/boniatos/g,'boniato');
  n=n.replace(/tomates cherry/g,'tomate cherry');
  n=n.replace(/nueces mixtas/g,'nueces');
  n=n.replace(/nuez/g,'nueces');
  n=n.replace(/almendra/g,'almendras');
  n=n.replace(/fresas/g,'frutos rojos');
  n=n.replace(/arándanos/g,'frutos rojos');
  n=n.replace(/frutos rojos/g,'frutos rojos');
  n=n.replace(/lenteja roja/g,'lentejas');
  n=n.replace(/lentejas guisadas/g,'lentejas');
  n=n.replace(/garbanzo/g,'garbanzos');
  n=n.replace(/pimiento verde/g,'pimiento');
  n=n.replace(/pimiento rojo/g,'pimiento');
  n=n.replace(/tomate natural/g,'tomate');
  n=n.replace(/yogur griego con/g,'yogur griego proteico con');
  n=n.replace(/tostadas de centeno con/g,'tostadas de espelta con');
  n=n.replace(/tostadas integrales con/g,'tostadas de espelta con');
  n=n.replace(/salmón a la plancha con/g,'salmón con');
  n=n.replace(/salmón al horno con/g,'salmón con');
  n=n.replace(/merluza al horno con/g,'merluza con');
  n=n.replace(/merluza con espinacas/g,'merluza con espinaca');
  n=n.replace(/sardinas a la parrilla con/g,'sardinas con');
  n=n.replace(/sardinas a la plancha con/g,'sardinas con');
  n=n.replace(/cordero al horno con/g,'cordero con');
  n=n.replace(/bacalao al pil-pil con/g,'bacalao con');
  n=n.replace(/bacalao con verduras al horno/g,'bacalao al pil-pil con patatas');
  n=n.replace(/pollo a la plancha con/g,'pollo con');
  n=n.replace(/arroz con verduras y marisco/g,'arroz con verduras y marisco');
  n=n.replace(/arroz integral con verduras y pollo/g,'pollo con arroz y verduras');
  n=n.replace(/pasta integral con atún y tomate/g,'pasta integral con atún');
  n=n.replace(/pasta integral con verduras y pesto/g,'pasta integral con verduras');
  n=n.replace(/lentejas guisadas con verduras/g,'lentejas con verduras');
  n=n.replace(/lubina al horno con limón y hierbas/g,'lubina al horno con limón');
  n=n.replace(/tortilla española con ensalada/g,'tortilla española');
  n=n.replace(/porridge de avena con/g,'avena con');
  n=n.replace(/porridge de avena/g,'avena');
  n=n.replace(/smoothie de frutos rojos y yogur/g,'yogur con frutos rojos');
  n=n.replace(/smoothie de frutos rojos/g,'frutos rojos');
  n=n.replace(/paella de pollo y verduras/g,'paella de marisco y verduras');
  n=n.replace(/cordero con verduras/g,'cordero al horno con verduras mediterráneas');
  n=n.replace(/ensalada de garbanzos con verduras asadas/g,'ensalada de garbanzos');
  n=n.replace(/ensalada de atún con verduras/g,'ensalada de atún con huevo cocido y verduras');
  n=n.replace(/merluza con calabacín y ajo/g,'merluza con espinaca y ajo');
  n=n.replace(/salmón con espárragos/g,'salmón al horno con espárragos');
  n=n.replace(/sardinas con pimientos asados/g,'sardinas a la plancha con pimientos');
  n=n.replace(/sardinas con pimientos/g,'sardinas a la plancha con pimientos');
  n=n.replace(/arroz con marisco/g,'arroz con verduras y marisco');
  n=n.replace(/merluza con patata asada/g,'merluza al horno con patata y cebolla');
  n=n.replace(/pollo con arroz y verduras/g,'pollo con arroz y verduras');
  n=n.replace(/salmón a la plancha con boniato/g,'salmón con boniato asado y espárragos');
  n=n.replace(/avena con plátano y canela/g,'avena con leche y plátano');
  n=n.replace(/aguacate \/ 50 g guacamole/g,'aguacate');
  n=n.replace(/canónigos \+ tomate \+ cebolla pochada/g,'ensalada verde');
  n=n.replace(/250-300 g boniato asado/g,'250 g boniato asado');
  n=n.replace(/180-220 g salmón fresco con limón y especias/g,'180 g salmón');
  n=n.replace(/\d+(?:\.\d+)?\s*-\s*\d+\s*g/g,function(m){return m.replace(/-\s*\d+/,'');});
  n=n.replace(/\(\d+\s*(?:uds?|unidades?|piezas?|raciones?|tazas?|cdas?|cdtas?)\)/gi,'');
  n=n.replace(/½/g,'una');
  n=n.replace(/\s+/g,' ').trim();
  return n.toLowerCase();
}
function findMealInDb(name,mealsDb){
  if(!mealsDb)return null;
  const normalized=normalizeMealName(name);
  const slots=Object.values(mealsDb);
  for(let i=0;i<slots.length;i++){
    const slot=slots[i];
    if(!Array.isArray(slot))continue;
    for(let j=0;j<slot.length;j++){
      if(normalizeMealName(slot[j].n)===normalized)return slot[j];
    }
  }
  return null;
}
function _extractIngFromDetail(det){
  var result=[];
  for(var i=0;i<det.items.length;i++){
    var item=det.items[i];
    if(item[3]==='SUP')continue;
    var qtyStr=item[0]||'';var food=item[1]||'';var grp=item[2]||'';
    if(!food)continue;
    var parsed=parseQty(qtyStr);
    result.push({a:food,q:parsed.type==='g'?parsed.val:0,grp:grp});
  }
  return result;
}
function _extractIngFromDbMatch(found){
  var result=[];
  for(var i=0;i<found.ing.length;i++){
    var ing=found.ing[i];
    result.push({a:ing.a||'',q:ing.q||0,grp:''});
  }
  return result;
}
function getIngredientsFromMeal(name,dietaType){
  if(!name)return null;
  var det=getAllDetails(name);
  if(det&&det.items)return _extractIngFromDetail(det);
  var mealsDb=getMealsDbForDieta(dietaType);
  var found=findMealInDb(name,mealsDb);
  if(found&&found.ing)return _extractIngFromDbMatch(found);
  var allDbs=getAllMealsDbs();
  for(var d=0;d<allDbs.length;d++){
    found=findMealInDb(name,allDbs[d]);
    if(found&&found.ing)return _extractIngFromDbMatch(found);
  }
  if(name.includes(' + ')||name.includes(' +')||name.includes('+ ')){
    var parts=name.split(/\s*\+\s*/);
    var allIng=[];
    for(var p=0;p<parts.length;p++){
      var partIng=getIngredientsFromMeal(parts[p].trim(),dietaType);
      if(partIng)allIng=allIng.concat(partIng);
    }
    if(allIng.length>0)return allIng;
  }
  console.log('[SHOPPING ERROR] No se pudieron obtener ingredientes de: "'+name+'"');
  return null;
}
function generateShoppingList(user){
  var menu=user.menu;
  if(!menu||!menu.length){console.log('[SHOP ERROR] No menu found');return{items:{},meals:0,ingredients:0,html:'<p style="color:var(--ink-soft);">No hay un plan semanal generado todav\u00eda.<br>Genera tu dieta para crear autom\u00e1ticamente tu lista de la compra.</p>'};}
  var dietaType=user.dietaType||'todos';
  var alergias=(user.alergias||[]).filter(function(a){return a!=='Ninguna';});
  var noLike=parseNoComer(user.noComer);
  var accumulated={};
  var mealCount=0;
  var ingredientCount=0;
  menu.forEach(function(day){
    var mts=getMealSlots(day);
    mts.forEach(function(mt){
      var m=day[mt];if(!m)return;
      var name=typeof m==='object'?m.n:m;
      if(dishHasAllergen(name,alergias))return;
      if(dishHasNoLike(name,noLike))return;
      mealCount++;
      var ingredients=getIngredientsFromMeal(name,dietaType);
      if(!ingredients)return;
      for(var i=0;i<ingredients.length;i++){
        var ing=ingredients[i];
        var food=ing.a;var q=ing.q;
        if(!food)continue;
        ingredientCount++;
        var nk=normalizeFoodName(food);
        if(!nk)continue;
        var displayName=nk===nk.toUpperCase()&&nk.length<=6?nk:nk.charAt(0).toUpperCase()+nk.slice(1);
        if(!accumulated[nk])accumulated[nk]={rawName:displayName,cat:ing.grp||inferCategory(nk),grams:0,units:0,hasGrams:false,hasUnits:false};
        if(q>0){accumulated[nk].grams+=q;accumulated[nk].hasGrams=true;}
        else{accumulated[nk].units+=1;accumulated[nk].hasUnits=true;}
      }
    });
  });
  var catMap={'PB':'\uD83E\uDD69 Carnes','PA':'\uD83D\uDC1F Pescados y Mariscos','EG':'\uD83E\uDD5A Huevos','PL':'\uD83E\uDD5A L\u00e1cteos','VH':'\uD83E\uDD6C Verduras y Hortalizas','FR':'\uD83C\uDF4E Frutas','HA':'\uD833\uFE0F Cereales y Derivados','SE':'\uD83E\uDD5C Frutos Secos y Semillas','GR':'\uD83E\uDD51 Grasas y Aceites','LG':'\uD83E\uDED8 Legumbres','OT':'\uD83D\uDED2 Otros'};
  var cats={};
  var keys=Object.keys(accumulated);
  for(var k=0;k<keys.length;k++){
    var nk=keys[k];var info=accumulated[nk];
    if(info.grams===0&&info.units===0)continue;
    var catName=catMap[info.cat]||'\uD83D\uDED2 Otros';
    if(!cats[catName])cats[catName]=[];
    var displayQty=formatShopQty(nk,info);
    cats[catName].push({food:info.rawName,qty:displayQty,norm:nk});
  }
  var catOrder=['\uD83E\uDD69 Carnes','\uD83D\uDC1F Pescados y Mariscos','\uD83E\uDD5A Huevos','\uD83E\uDD5A L\u00e1cteos','\uD83E\uDD6C Verduras y Hortalizas','\uD83C\uDF4E Frutas','\uD833\uFE0F Cereales y Derivados','\uD83E\uDD5C Frutos Secos y Semillas','\uD83E\uDED8 Legumbres','\uD83E\uDD51 Grasas y Aceites','\uD83D\uDED2 Otros'];
  var sortedCats=catOrder.filter(function(c){return cats[c];});
  var html='';
  for(var ci=0;ci<sortedCats.length;ci++){
    var catName2=sortedCats[ci];
    var items=cats[catName2];
    html+='<div class="shop-cat"><h3>'+catName2+'</h3><ul>';
    items.sort(function(a,b){return a.food.localeCompare(b.food,'es');});
    for(var ii=0;ii<items.length;ii++){
      var _ref=items[ii];var food2=_ref.food;var qty=_ref.qty;var norm=_ref.norm;
      var id='shop_'+norm.replace(/\s+/g,'_');
      html+='<li class="shop-item"><label><input type="checkbox" data-shop-id="'+id+'"> <span class="shop-item-text">'+food2+'</span> <span class="shop-item-qty">'+qty+'</span></label></li>';
    }
    html+='</ul></div>';
  }
  return{items:accumulated,meals:mealCount,ingredients:ingredientCount,html:html};
}
function renderLista(u){
  var el=$('#shopList');
  if(!el)return;
  var key='shopChecked_'+(u.email||'');
  var checked=JSON.parse(localStorage.getItem(key)||'{}');
  var result=generateShoppingList(u);
  el.innerHTML=result.html;
  el.querySelectorAll('input[type="checkbox"]').forEach(function(cb){
    var id=cb.dataset.shopId;
    if(checked[id]){cb.checked=true;cb.closest('.shop-item').classList.add('checked');}
    cb.addEventListener('change',function(){
      if(this.checked)checked[id]=true;else delete checked[id];
      localStorage.setItem(key,JSON.stringify(checked));
      this.closest('.shop-item').classList.toggle('checked',this.checked);
    });
  });
  var checkAllBtn=$('#compraCheckAll');
  var uncheckAllBtn=$('#compraUncheckAll');
  if(checkAllBtn)checkAllBtn.onclick=function(){
    el.querySelectorAll('input[type="checkbox"]').forEach(function(cb){cb.checked=true;cb.dispatchEvent(new Event('change'));});
  };
  if(uncheckAllBtn)uncheckAllBtn.onclick=function(){
    el.querySelectorAll('input[type="checkbox"]').forEach(function(cb){cb.checked=false;cb.dispatchEvent(new Event('change'));});
  };
}
/* ═══════════════════════════════════════════════════════════════
   FOOD CATALOG — central registry: food → category + display unit
   Categories: PB=Carnes PA=Pescados EG=Huevos PL=Lácteos
               VH=Verduras FR=Frutas HA=Cereales SE=FrutosSecos
               GR=Grasas LG=Legumbres OT=Otros
   Units: g, ml, ud
   ═══════════════════════════════════════════════════════════════ */
const FOOD_CAT={
'pollo':['PB','g'],'pechuga de pollo':['PB','g'],'pollo a la plancha':['PB','g'],'pollo al horno':['PB','g'],'muslo de pollo':['PB','g'],
'ternera':['PB','g'],'filete de ternera':['PB','g'],'carne picada':['PB','g'],'carne magra':['PB','g'],'entrecot':['PB','g'],'bistec':['PB','g'],
'cerdo':['PB','g'],'solomillo de cerdo':['PB','g'],'lomo de cerdo':['PB','g'],'chuleta':['PB','g'],'lomo':['PB','g'],
'pavo':['PB','g'],'pechuga de pavo':['PB','g'],'pavo en lonchas':['PB','g'],'fiambre':['PB','g'],
'jamón serrano':['PB','g'],'jamón cocido':['PB','g'],'jamón ibérico':['PB','g'],'tocino':['PB','g'],'chorizo':['PB','g'],'salchicha':['PB','g'],'carne de soja texturizada':['PB','g'],
'salmón':['PA','g'],'salmón a la plancha':['PA','g'],'salmón ahumado':['PA','ud'],'salmón ahumado (en lonchas)':['PA','ud'],
'merluza':['PA','g'],'merluza al horno':['PA','g'],'lubina':['PA','g'],'bacalao':['PA','g'],'bacalao al pil-pil':['PA','g'],
'atún':['PA','g'],'atún a la plancha':['PA','g'],'atún en dados':['PA','ud'],
'trucha':['PA','g'],'corvina':['PA','g'],'caballa':['PA','g'],'sardinas':['PA','g'],'sardina':['PA','g'],
'gambas':['PA','g'],'calamares':['PA','g'],'langostinos':['PA','g'],'pulpo':['PA','g'],
'huevos':['EG','ud'],'huevo':['EG','ud'],'claras de huevo':['EG','ud'],'yemas':['EG','ud'],
'leche':['PL','ml'],'leche de cabra':['PL','ml'],'leche entera':['PL','ml'],'leche desnatada':['PL','ml'],'leche semidesnatada':['PL','ml'],
'yogur griego':['PL','ud'],'yogur natural':['PL','ud'],'yogur vegetal':['PL','ud'],'yogur de soja':['PL','ud'],'yogur':['PL','ud'],
'queso feta':['PL','ud'],'queso fresco':['PL','ud'],'queso parmesano':['PL','g'],'mozzarella':['PL','ud'],'queso':['PL','ud'],'queso curado':['PL','g'],'requesón':['PL','ud'],
'natas':['PL','ml'],'crema de leche':['PL','ml'],'kefir':['PL','ml'],'mantequilla':['PL','g'],
'espinaca':['VH','g'],'espinacas':['VH','g'],'brócoli':['VH','g'],'brócoli al vapor':['VH','g'],
'calabacín':['VH','g'],'calabacín salteado':['VH','g'],'pimiento verde':['VH','ud'],'pimiento rojo':['VH','ud'],'pimiento amarillo':['VH','ud'],'pimiento del piquillo':['VH','ud'],
'tomate':['VH','g'],'tomate cherry':['VH','ud'],'tomate natural':['VH','g'],
'cebolla':['VH','g'],'cebolla morada':['VH','g'],
'champiñones':['VH','g'],'champiñones salteados':['VH','g'],
'zanahoria':['VH','g'],'lechuga':['VH','ud'],'pepino':['VH','g'],'pepinos encurtidos':['VH','ud'],
'espárragos':['VH','g'],'espárragos a la plancha':['VH','g'],
'kale':['VH','g'],'rúcula':['VH','g'],'coliflor':['VH','g'],'berenjena':['VH','g'],
'puerro':['VH','g'],'calabaza':['VH','g'],'calabaza asada':['VH','g'],
'palitos de apio':['VH','ud'],'palitos de pepino':['VH','ud'],'apio':['VH','g'],
'coles de bruselas':['VH','g'],'boniato':['VH','g'],'boniato asado':['VH','g'],'boniato hervido':['VH','g'],
'patata':['VH','g'],'patata asada':['VH','g'],'remolacha':['VH','g'],
'verduras al vapor':['VH','g'],'verduras asadas':['VH','g'],'verduras marinadas':['VH','g'],'verduras salteadas':['VH','g'],
'guisantes':['VH','g'],'soja':['VH','g'],
'plátano':['FR','ud'],'plátano congelado':['FR','g'],'manzana':['FR','ud'],'pera':['FR','ud'],
'naranja':['FR','ud'],'kiwi':['FR','ud'],'kiwis':['FR','ud'],'limón':['FR','ud'],'mandarina':['FR','ud'],
'fresas':['FR','g'],'frutos rojos':['FR','g'],'mango':['FR','g'],'piña':['FR','g'],
'dátiles':['FR','g'],'uvas':['FR','g'],'fruta de temporada':['FR','ud'],'açaí':['FR','g'],'cerezas':['FR','g'],
'arroz':['HA','g'],'arroz integral':['HA','g'],'arroz basmati':['HA','g'],'arroz jazmín':['HA','g'],'arroz blanco':['HA','g'],'arroz salvaje':['HA','g'],
'avena':['HA','g'],'copos de avena':['HA','g'],'avena paleo (almendra)':['HA','g'],
'pan integral':['HA','ud'],'pan de centeno':['HA','ud'],'pan de pita':['HA','ud'],'pan pita':['HA','ud'],'pan de masa madre':['HA','ud'],
'pan de almendra':['SE','ud'],'pan de espelta':['HA','ud'],
'tortillas integrales':['HA','ud'],'tortillas de maíz':['HA','ud'],'tortitas de arroz':['HA','ud'],
'pasta':['HA','g'],'pasta integral':['HA','g'],'pasta de espelta':['HA','g'],'fideos de arroz':['HA','g'],
'quinoa':['HA','g'],'cuscús':['HA','g'],'granola':['HA','g'],'harina de avena':['HA','g'],'harina de trigo':['HA','g'],'harina de coco':['HA','g'],
'tostadas integrales':['HA','ud'],'pancakes de avena':['HA','ud'],'ñoquis':['HA','g'],'falafel':['HA','ud'],
'almendras':['SE','g'],'almendra':['SE','g'],'nueces':['SE','g'],'nuez':['SE','g'],'anacardos':['SE','g'],'avellanas':['SE','g'],'piñones':['SE','g'],
'nueces de Brasil':['SE','g'],'nueces de la India':['SE','g'],'nueces mixtas':['SE','g'],'nueces de macadamia':['SE','g'],'nueces pecanas':['SE','g'],
'crema de cacahuete':['SE','g'],'tahini':['SE','g'],'mantequilla de almendra':['SE','g'],'mantequilla de cacahuete':['SE','g'],
'semillas de chía':['SE','g'],'semillas de lino':['SE','g'],'semillas de sésamo':['SE','g'],'semillas de calabaza':['SE','g'],'semillas de cáñamo':['SE','g'],
'pipas de calabaza':['SE','g'],'pipas de girasol':['SE','g'],'frutos secos':['SE','g'],'chía':['SE','g'],'linaza':['SE','g'],'sésamo':['SE','g'],
'AOVE':['GR','ml'],'aceite de oliva':['GR','ml'],'aceite de oliva virgen extra':['GR','ml'],'aceite oliva':['GR','ml'],
'aceite de coco':['GR','ml'],'aceite de aguacate':['GR','ml'],'aceite':['GR','ml'],
'vinagre de manzana':['GR','ml'],'vinagre de sidra de manzana':['GR','ml'],'vinagre':['GR','ml'],
'lentejas':['LG','g'],'lentejas rojas':['LG','g'],'garbanzos':['LG','g'],
'alubias negras':['LG','g'],'alubias rojas':['LG','g'],'alubias blancas':['LG','g'],'alubias':['LG','g'],
'tofu':['LG','g'],'tofu firme':['LG','g'],'tofu de agua':['LG','g'],'tofu seda':['LG','g'],
'tempeh':['LG','g'],'seitán':['LG','g'],'proteína vegetal en polvo':['LG','g'],'proteina de guisante':['LG','g'],
'salsa de soja':['OT','ml'],'salsa de tomate':['OT','ml'],'salsa teriyaki':['OT','ml'],
'hummus':['OT','ud'],'guacamole':['OT','ud'],'pesto':['OT','ml'],
'miel':['OT','ml'],'sirope de arce':['OT','ml'],'edulcorante':['OT','ml'],'stevia':['OT','ud'],
'sal':['OT','ud'],'pimienta negra':['OT','ud'],'canela':['OT','ud'],'cúrcuma':['OT','ud'],'curcuma':['OT','ud'],
'orégano':['OT','ud'],'pimentón':['OT','ud'],'especias':['OT','ud'],'comino':['OT','ud'],'jengibre':['OT','ud'],
'cacao en polvo':['OT','g'],'chocolate 70%':['OT','g'],'chocolate negro':['OT','g'],
'caldo de verduras':['OT','ml'],'caldo de huesos':['OT','ml'],
'leche de coco':['OT','ml'],'leche de almendra':['OT','ml'],'leche de avena':['OT','ml'],'leche de soja':['OT','ml'],
'bebida de soja':['OT','ml'],'bebida vegetal':['OT','ml'],'bebida de almendra':['OT','ml'],
'proteina en polvo':['OT','ud'],
'aceitunas':['OT','ud'],'aceitunas verdes':['OT','ud'],'oliva negras':['OT','ud'],
'edamame':['LG','ud'],'peanut butter':['SE','g']
};
function inferCategory(nk){
  if(FOOD_CAT[nk])return FOOD_CAT[nk][0];
  if(/pollo|ternera|cerdo|pavo|carne|solomillo|lomo|chuleta|bistec|entrecot|jam[oó]n|muslo|fiambre|salchicha|chorizo|tocino/.test(nk))return'PB';
  if(/salm[oó]n|merluza|lubina|at[uú]n|caballa|sardina|bacalao|trucha|gamba|calamar|pescado|corvina|pulpo|langostino/.test(nk))return'PA';
  if(/huevo/.test(nk))return'EG';
  if(/yogur|queso|leche|kefir|reques[oó]n|mozzarella|feta|parmesano|mantequilla|natas/.test(nk))return'PL';
  if(/arroz|avena|pan |tortilla|pasta|quinoa|cusc[uú]s|boniato|patata|harina|noquis|granola|fideo|tostada|pancake|ñoquis|falafel|espinaca|br[oó]coli|calabac[ií]n|pimiento|tomate|cebolla|champi[nñ]ones|zanahoria|lechuga|pepino|esp[aá]rrago|kale|r[uú]cula|coliflor|berenjena|puerro|calabaza|palito|apio|verdura|guisante/.test(nk))return'VH';
  if(/manzana|pera|pl[aá]tano|naranja|kiwi|fresa|mango|pi[nñ]a|fruta|frutos rojos|ar[aá]ndano|lim[oó]n|pasas|d[aá]til|uva|cereza|a[çc]a[ií]/.test(nk))return'FR';
  if(/almendra|nuez|anacard|avellana|pi[nñ]on|semilla|frutos secos|cacahuete|tahini|ch[ií]a|linaza|pipa/.test(nk))return'SE';
  if(/aceite|aoove|vinagre|mantequilla de coco/.test(nk))return'GR';
  if(/lenteja|garbanzo|alubia|tofu|tempeh|seit[aá]n|soja texturizada|prote[ií]na/.test(nk))return'LG';
  return'OT';
}
function normalizeFoodName(name){
  let n=name.toLowerCase().trim().replace(/\s+/g,' ');
  n=n.replace(/\(.*?\)/g,'').trim();
  /* Strip preparation methods */
  const prepRE=/\s+(?:a la plancha|al horno|al vapor|saltead[oa]s?|asad[oa]s?|marinad[oa]s?|frit[oa]s?|cocid[oa]s?|pochad[oa]s?|en dados|en lonchas|en cubos|en rodajas|al pil-pil)\b/g;
  n=n.replace(prepRE,'').trim();
  const synonyms={
    'tomate fresco':'tomate','tomates':'tomate',
    'pechuga de pollo':'pollo','pechuga pollo':'pollo','muslo de pollo':'pollo',
    'pollo a la plancha':'pollo','pollo al horno':'pollo',
    'carne picada de ternera':'ternera','carne de ternera':'ternera','filete de ternera':'ternera',
    'salmón fresco':'salmón','salmon fresco':'salmón','salmón a la plancha':'salmón',
    'merluza':'merluza','lubina':'lubina','dorada':'pescado',
    'aguacate':'aguacate','palta':'aguacate',
    'aceite de oliva virgen extra':'AOVE','aove':'AOVE','aceite de oliva':'AOVE','aceite oliva':'AOVE','aceite virgen extra':'AOVE',
    'arroz vaporizado':'arroz','arroz integral':'arroz',
    'huevo cocido':'huevos','huevos cocidos':'huevos',
    'almendra':'almendras','almendras crudas':'almendras',
    'nuez':'nueces','nueces mixtas':'nueces',
    'plátanos':'plátano','plátano congelado':'plátano',
    'yogur griego':'yogur griego','yogur natural':'yogur griego','yogures griegos':'yogur griego',
    'bebida de almendra':'bebida vegetal','bebida de almendras':'bebida vegetal','leche de almendras':'bebida vegetal','bebida de almendras 0%':'bebida vegetal',
    'avena en copos':'avena','avena molida':'avena',
    'pan integral de espelta':'pan integral','pan de espelta':'pan integral','pan de centeno':'pan integral',
    'espinaca':'espinacas','espinacas salteadas':'espinacas',
    'brócoli':'brócoli','brocoli':'brócoli',
    'champiñones':'champiñones','champiñón':'champiñones','champiñones salteados':'champiñones',
    'patatas':'patata','patata asada':'patata',
    'boniatos':'boniato',
    'lenteja':'lentejas','garbanzo':'garbanzos',
    'pasta integral':'pasta integral',
    'queso feta':'queso feta','feta':'queso feta',
    'limon':'limón',
    'sal marina':'sal',
    'cúrcuma':'cúrcuma','curcuma':'cúrcuma',
    'orégano':'orégano','oregano':'orégano',
    'pimentón':'pimentón','pimenton':'pimentón',
    'leche de coco':'leche de coco','salsa de soja':'salsa de soja',
    'vinagre de sidra de manzana':'vinagre de manzana',
    'frutos rojos':'frutos rojos',
    'semillas de lino':'semillas de lino','semillas de sésamo':'semillas de sésamo','semillas de sesamo':'semillas de sésamo',
    'chía':'semillas de chía','chia':'semillas de chía','semillas de chía':'semillas de chía',
    'tomate natural':'tomate','tomates cherry':'tomate cherry',
    'pepino encurtido':'pepino encurtidos',
    'verduras':'verduras salteadas','verduras mixtas':'verduras salteadas',
    'merluza al horno':'merluza','salmón ahumado':'salmón ahumado',
    'pan de trigo sarraceno':'pan integral','harina de trigo sarraceno':'harina de trigo'
  };
  if(synonyms[n])return synonyms[n];
  return n;
}
function parseQty(str){
  if(!str)return{type:'u',val:1};
  const s=str.toLowerCase().replace(/\s+/g,' ').trim();
  const gMatch=s.match(/(\d+(?:[.,]\d+)?)\s*g(?:\s|$)/);
  if(gMatch)return{type:'g',val:parseFloat(gMatch[1].replace(',','.'))};
  const mlMatch=s.match(/(\d+(?:[.,]\d+)?)\s*ml/);
  if(mlMatch)return{type:'g',val:parseFloat(mlMatch[1].replace(',','.'))};
  const lMatch=s.match(/(\d+(?:[.,]\d+)?)\s*l(?:\s|$)/);
  if(lMatch)return{type:'g',val:parseFloat(lMatch[1].replace(',','.'))*1000};
  const unitMatch=s.match(/(\d+(?:[.,]\d+)?)\s*(uds?|unidades?|piezas?)/);
  if(unitMatch)return{type:'u',val:parseFloat(unitMatch[1].replace(',','.'))};
  const nMatch=s.match(/^(\d+(?:[.,]\d+)?)\s/);
  if(nMatch)return{type:'u',val:parseFloat(nMatch[1].replace(',','.'))};
  if(s.includes('cucharada')||s.includes('cda'))return{type:'g',val:15};
  if(s.includes('cucharadita')||s.includes('cdta'))return{type:'g',val:5};
  if(s.includes('puñado')||s.includes('puñ'))return{type:'g',val:30};
  if(s.includes('rebanada')||s.includes('tostada'))return{type:'u',val:1};
  return{type:'u',val:1};
}
function formatShopQty(nk,info){
  const catEntry=FOOD_CAT[nk];
  const unit=catEntry?catEntry[1]:'g';
  if(unit==='ud'){
    const u=info.hasUnits?Math.ceil(info.units):Math.ceil(info.grams/150);
    return u+' ud.';
  }
  if(unit==='ml'){
    const totalMl=info.hasGrams?Math.round(info.grams):Math.ceil(info.units)*15;
    if(totalMl>=1000){const l=totalMl/1000;return(l>=2?Math.round(l):l.toFixed(1)).replace('.',',')+' L';}
    return totalMl+' ml';
  }
  const totalG=info.hasGrams?info.grams:Math.ceil(info.units)*150;
  if(totalG>=1000){const kg=totalG/1000;return(kg>=2?Math.round(kg):kg.toFixed(1)).replace('.',',')+' kg';}
  return Math.round(totalG)+' g';
}
const INGREDIENTS={'Avena con fruta y nueces':['Avena','Fruta','Nueces'],'Tostada integral con aguacate y huevo':['Pan integral','Aguacate','Huevos'],'Yogur natural con fruta y semillas':['Yogur natural','Fruta','Semillas de chía'],'Lentejas con verduras y arroz integral':['Lentejas','Verduras','Arroz integral'],'Pollo al horno, quinoa y brócoli':['Pollo','Quinoa','Brócoli'],'Garbanzos salteados con espinaca':['Garbanzos','Espinacas','Ajo'],'Pescado a la plancha con ensalada':['Pescado','Lechuga','Tomate','Cebolla'],'Crema de calabacín y huevo cocido':['Calabacín','Huevos','Patata'],'Tortilla de espinacas y ensalada':['Huevos','Espinacas','Lechuga','Tomate'],'Porridge de avena y plátano':['Avena','Plátano','Bebida vegetal'],'Tostada con queso fresco y tomate':['Pan integral','Queso fresco','Tomate'],'Yogur con granola y frutos rojos':['Yogur','Granola','Frutos rojos'],'Bowl de quinoa, hummus y verduras':['Quinoa','Hummus','Zanahoria','Pepino','Aguacate'],'Pasta integral con verduras al pesto':['Pasta integral','Calabacín','Pimiento','Pesto'],'Revuelto de tofu con champiñones':['Tofu','Champiñones','Cebolla'],'Ensalada de lentejas y queso feta':['Lentejas','Queso feta','Tomate','Aceitunas'],'Batido de avena, plátano y cacao':['Avena','Plátano','Cacao','Bebida vegetal'],'Avena nocturna con bebida de almendra':['Avena','Bebida de almendra','Fruta'],'Tostada con hummus y tomate':['Pan integral','Hummus','Tomate'],'Tofu salteado con verduras y quinoa':['Tofu','Verduras','Quinoa','Salsa de soja'],'Curry de garbanzos y arroz integral':['Garbanzos','Leche de coco','Curry','Arroz integral'],'Pisto con alubias y pan integral':['Calabacín','Pimiento','Tomate','Alubias'],'Crema de boniato y garbanzos':['Boniato','Garbanzos','Puerro'],'Salteado de verduras con fideos de arroz':['Verduras','Fideos de arroz','Salsa de soja'],'Ensalada de quinoa, aguacate y maíz':['Quinoa','Aguacate','Maíz','Tomate'],'Pan de trigo sarraceno con aguacate':['Pan sarraceno','Aguacate','Huevos'],'Yogur con fruta y semillas':['Yogur','Fruta','Semillas'],'Huevos revueltos con tomate':['Huevos','Tomate','Aceite de oliva'],'Arroz integral con pollo y brócoli':['Arroz integral','Pollo','Brócoli'],'Salmorejo con atún y huevo':['Tomate','Atún','Huevos'],'Garbanzos con espinaca y comino':['Garbanzos','Espinacas','Comino'],'Pescado al horno con verduras':['Pescado','Verduras'],'Crema de calabaza con semillas':['Calabaza','Cebolla','Semillas']};

/* PERFIL */
function renderPerfil(u){
  $('#perfName').value=u.name;$('#perfEmail').value=u.email;$('#perfObjetivo').value=u.objetivo;$('#perfDieta').value=u.dietaType||'todos';
  renderChips('perfChips',ALERGIAS,u.alergias.length?u.alergias:['Ninguna']);
  if(u.physical){$('#perfAltura').value=u.physical.altura;$('#perfPeso').value=u.physical.peso;$('#perfEdad').value=u.physical.edad;$('#perfSexo').value=u.physical.sexo;$('#perfActividad').value=u.physical.actividad;}
  renderTrainPrefs(u);
  $('#perfilPlan').innerHTML=`<span style="font-family:'Fraunces',serif;font-weight:900;font-size:1.3rem;">${PLANS[u.plan].name}</span><br><span style="color:var(--ink-soft);font-size:.9rem;">${PLANS[u.plan].price}</span>`;
  const ups=$('#perfilUpgrades');ups.innerHTML='';const rank={starter:0,pro:1,premium:2};
  Object.keys(PLANS).forEach(k=>{if(k===u.plan)return;const dir=rank[k]>rank[u.plan]?'Subir a ':'Bajar a ';const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=dir+PLANS[k].name;b.addEventListener('click',()=>{u.plan=k;saveUser(u);applyPlanGating(u);renderPerfil(u);$('#userChip').textContent=u.name+' · '+PLANS[u.plan].name;});ups.appendChild(b);});
  setMsg('#perfilMsg','','');
  if(typeof syncProfileVisuals==='function')syncProfileVisuals();
}
$('#perfSave').addEventListener('click',()=>saveAllProfile());
$('#perfPhysSave').addEventListener('click',()=>saveAllProfile());
$('#perfTrainSave').addEventListener('click',()=>saveAllProfile());
function saveAllProfile(){
  try{
    const u=currentUser();if(!u)return;
    const name=$('#perfName').value.trim();
    if(!name){setMsg('#perfilMsg','El nombre no puede estar vacío.','err');return;}
    const oldObj=u.objetivo;
    const oldDieta=u.dietaType||'todos';
    const oldNumComidas=u.numComidas||4;
    const oldAlergias=JSON.stringify(u.alergias||[]);
    const a=+$('#perfAltura').value,p=+$('#perfPeso').value,e=+$('#perfEdad').value,s=$('#perfSexo').value,ac=$('#perfActividad').value;
    if(!a||!p||!e){setMsg('#perfilMsg','Completa todos los campos físicos (altura, peso, edad).','err');return;}
    const newNumComidas=+$('#perfNumComidas').value||4;
    u.name=name;
    u.objetivo=$('#perfObjetivo').value;
    u.dietaType=$('#perfDieta').value||'todos';
    u.alergias=selectedChips('perfChips').filter(a=>a!=='Ninguna');
    u.numComidas=newNumComidas;
    u.noComer=$('#perfNoComer').value;
    u.entreno={tipo:$('#perfEntreno').value,dias:+$('#perfDiasEntreno').value,duracion:+$('#perfDuracionEntreno').value};
    u.physical={altura:a,peso:p,edad:e,sexo:s,actividad:ac};
    u.stats=calcStats(p,a,e,s,ac,u.objetivo);
    const newAlergiasStr=JSON.stringify(u.alergias);
    if(oldObj!==u.objetivo)u.weekIdx=0;
    if(oldDieta!==u.dietaType)u.dietaData=null;
    if(oldNumComidas!==newNumComidas)u.dietaData=null;
    if(oldAlergias!==newAlergiasStr)u.dietaData=null;
    u.menuObj=u.objetivo;
    u.weekIdx=u.weekIdx||0;
    u.consumed={};u.glassed={};u.sleep={};u.customFoods={};u.extraFoods={};u.subs={};
    savePlanHistory(u);
    saveUser(u);
    try{u.menu=newMenu(u.tipo,u.alergias,u.weekIdx||0,u.objetivo,u.dietaType,u);}catch(menuErr){console.error('newMenu error:',menuErr);u.menu=u.menu||[];}
    saveUser(u);
    renderLista(u);renderSemana(u);
    $('#userChip').textContent=u.name+' · '+PLANS[u.plan].name;
    setMsg('#perfilMsg','Todos los datos guardados. Menú regenerado.','ok');
  }catch(e){console.error('saveAllProfile error:',e);setMsg('#perfilMsg','Error al guardar. Intenta de nuevo.','err');}
}
$('#pwSave').addEventListener('click',()=>{const u=currentUser();if(!u)return;const cur=$('#pwActual').value,n1=$('#pwNueva').value,n2=$('#pwNueva2').value;if(u.pw!==hash(cur)){setMsg('#perfilMsg','Contraseña actual incorrecta.','err');return;}if(n1.length<6){setMsg('#perfilMsg','Mínimo 6 caracteres.','err');return;}if(n1!==n2){setMsg('#perfilMsg','Las contraseñas no coinciden.','err');return;}u.pw=hash(n1);saveUser(u);['pwActual','pwNueva','pwNueva2'].forEach(i=>$('#'+i).value='');setMsg('#perfilMsg','Contraseña actualizada.','ok');});
$('#delBtn').addEventListener('click',()=>{const u=currentUser();if(!u)return;if(!confirm('¿Eliminar tu cuenta? No se puede deshacer.'))return;setUsers(getUsers().filter(x=>x.email!==u.email));setSession(null);$('#navUser').classList.add('hidden');showView('view-auth');showAuth('login');});

/* Food recognition database — kcal per 100g */
const FOOD_DB={
/* Proteínas */
'pollo':{k:165,p:31,c:0,g:3.6},'pechuga de pollo':{k:165,p:31,c:0,g:3.6},'muslo de pollo':{k:209,p:26,c:0,g:10.9},'pollo al horno':{k:190,p:27,c:0,g:8},'pollo a la plancha':{k:165,p:31,c:0,g:3.6},'pollo frito':{k:230,p:24,c:2,g:13},
'ternera':{k:250,p:26,c:0,g:15},'bistec':{k:271,p:26,c:0,g:18},'filete de ternera':{k:250,p:26,c:0,g:15},'carne picada':{k:254,p:17,c:0,g:20},'chuleta':{k:260,p:25,c:0,g:17},
'cerdo':{k:242,p:27,c:0,g:14},'lomo de cerdo':{k:143,p:26,c:0,g:3.5},'solomillo':{k:143,p:26,c:0,g:3.5},'chashu':{k:220,p:20,c:2,g:15},
'salchicha':{k:277,p:12,c:2,g:25},'salchichas':{k:277,p:12,c:2,g:25},'salchichas de Frankfurt':{k:277,p:12,c:2,g:25},'salchichas de vacuno':{k:260,p:14,c:1,g:22},'chorizo':{k:455,p:24,c:2,g:38},'longaniza':{k:400,p:22,c:2,g:34},'morcilla':{k:379,p:14,c:12,g:32},'fiambre':{k:150,p:16,c:3,g:8},'jamón':{k:145,p:21,c:1,g:6},'jamón serrano':{k:145,p:21,c:1,g:6},'jamón cocido':{k:145,p:20,c:1,g:6},'lomo embuchado':{k:250,p:28,c:1,g:14},
'tofu':{k:76,p:8,c:1.9,g:4.8},'tofu firme':{k:130,p:15,c:2,g:8},'tofu seda':{k:55,p:5,c:2,g:3},
'atún':{k:132,p:28,c:0,g:1.3},'atún a la plancha':{k:132,p:28,c:0,g:1.3},'atún en aceite':{k:198,p:24,c:0,g:11},'bonito':{k:132,p:28,c:0,g:1.3},
'salmón':{k:208,p:20,c:0,g:13},'salmón a la plancha':{k:208,p:20,c:0,g:13},'salmón ahumado':{k:177,p:21,c:0,g:10},'sardinas':{k:208,p:25,c:0,g:11},'jurel':{k:155,p:24,c:0,g:6},'merluza':{k:86,p:18,c:0,g:1.5},'bacalao':{k:82,p:18,c:0,g:0.7},'calamares':{k:175,p:21,c:8,g:7},'gambas':{k:99,p:24,c:0,g:0.3},'langostinos':{k:99,p:24,c:0,g:0.3},'pescado':{k:130,p:22,c:0,g:5},'pescado a la plancha':{k:130,p:22,c:0,g:5},'pescado al horno':{k:130,p:22,c:0,g:5},'pescado frito':{k:230,p:18,c:12,g:13},
'huevo':{k:155,p:13,c:1.1,g:11},'huevos':{k:155,p:13,c:1.1,g:11},'huevo cocido':{k:155,p:13,c:1.1,g:11},'huevo frito':{k:196,p:14,c:1,g:15},'revuelto':{k:148,p:10,c:2,g:11},'tortilla':{k:155,p:13,c:1,g:11},'omelette':{k:154,p:11,c:2,g:11},
'queso':{k:402,p:25,c:1.3,g:33},'queso fresco':{k:174,p:18,c:3,g:10},'queso manchego':{k:402,p:25,c:1.3,g:33},'queso batata':{k:360,p:21,c:3,g:29},'mozzarella':{k:280,p:28,c:3,g:17},'yogur':{k:59,p:10,c:3.5,g:0.7},'yogur natural':{k:59,p:10,c:3.5,g:0.7},'yogur griego':{k:97,p:9,c:3.6,g:5},'queso de untar':{k:235,p:6,c:4,g:22},'ricotta':{k:174,p:11,c:3,g:13},
/* Legumbres */
'lentejas':{k:116,p:9,c:20,g:0.4},'lentejas guisadas':{k:130,p:9,c:18,g:2},'garbanzos':{k:164,p:8.9,c:27,g:2.6},'garbanzos salteados':{k:164,p:8.9,c:27,g:2.6},'alubias':{k:127,p:8.7,c:22.8,g:0.5},'alubias blancas':{k:139,p:9,c:24,g:0.4},'alubias negras':{k:132,p:8.9,c:23.7,g:0.5},'soja':{k:173,p:17,c:10,g:9},
/* Cereales y tubérculos */
'arroz':{k:130,p:2.7,c:28,g:0.3},'arroz blanco':{k:130,p:2.7,c:28,g:0.3},'arroz integral':{k:111,p:2.6,c:23,g:0.9},'arroz basmati':{k:130,p:2.7,c:28,g:0.3},'pasta':{k:131,p:5,c:25,g:1.1},'pasta integral':{k:124,p:5.3,c:26,g:0.5},'espaguetis':{k:131,p:5,c:25,g:1.1},'macarrones':{k:131,p:5,c:25,g:1.1},'fideos':{k:131,p:5,c:25,g:1.1},'noodles':{k:138,p:4.5,c:25,g:2},'fideos de arroz':{k:109,p:0.9,c:25,g:0.2},'quinoa':{k:120,p:4.4,c:21.3,g:1.9},'avena':{k:389,p:16.9,c:66,g:6.9},'copos de avena':{k:389,p:16.9,c:66,g:6.9},'porridge':{k:150,p:5,c:25,g:3},'avena con leche':{k:150,p:5,c:25,g:3},'pan':{k:265,p:9,c:49,g:3.2},'pan integral':{k:247,p:13,c:41,g:3.4},'pan de molde':{k:265,p:9,c:49,g:3.2},'tostada':{k:265,p:9,c:49,g:3.2},'tostada integral':{k:247,p:13,c:41,g:3.4},'tostada con aguacate':{k:230,p:4,c:20,g:16},'tostada con tomate':{k:160,p:5,c:26,g:4},'boniato':{k:86,p:1.6,c:20,g:0.1},'batata':{k:86,p:1.6,c:20,g:0.1},'patata':{k:77,p:2,c:17,g:0.1},'patatas fritas':{k:312,p:3.4,c:41,g:15},'puré de patata':{k:74,p:1.8,c:17,g:0.1},'maíz':{k:86,p:3.2,c:19,g:1.2},
/* Verduras */
'brócoli':{k:34,p:2.8,c:7,g:0.4},'espinaca':{k:23,p:2.9,c:3.6,g:0.4},'espinacas':{k:23,p:2.9,c:3.6,g:0.4},'calabacín':{k:17,p:1.2,c:3.1,g:0.3},'calabaza':{k:26,p:1,c:6.5,g:0.1},'cebolla':{k:40,p:1.1,c:9.3,g:0.1},'cebolla morada':{k:40,p:1.1,c:9.3,g:0.1},'ajo':{k:149,p:6.4,c:33,g:0.5},'pimiento':{k:31,p:1,c:6,g:0.3},'pimiento rojo':{k:31,p:1,c:6,g:0.3},'tomate':{k:18,p:0.9,c:3.9,g:0.2},'jitomate':{k:18,p:0.9,c:3.9,g:0.2},'lechuga':{k:15,p:1.4,c:2.9,g:0.2},'zanahoria':{k:41,p:0.9,c:10,g:0.2},'pepino':{k:15,p:0.7,c:3.6,g:0.1},'champiñones':{k:22,p:3.1,c:3.3,g:0.3},'setas':{k:22,p:3.1,c:3.3,g:0.3},'berenjena':{k:25,p:1,c:6,g:0.2},'coliflor':{k:25,p:1.9,c:5,g:0.3},'apio':{k:16,p:0.7,c:3,g:0.2},'puerro':{k:61,p:1.5,c:14,g:0.3},'judías verdes':{k:31,p:1.8,c:7,g:0.1},'guisantes':{k:81,p:5.4,c:14,g:0.4},'maíz dulce':{k:86,p:3.2,c:19,g:1.2},'alcachofa':{k:47,p:3.3,c:11,g:0.2},'remolacha':{k:43,p:1.6,c:10,g:0.2},'col':{k:25,p:1.3,c:5.8,g:0.1},
/* Frutas */
'plátano':{k:89,p:1.1,c:23,g:0.3},'manzana':{k:52,p:0.3,c:14,g:0.2},'naranja':{k:47,p:0.9,c:12,g:0.1},'fresa':{k:32,p:0.7,c:7.7,g:0.3},'frutos rojos':{k:50,p:0.7,c:12,g:0.3},'uvas':{k:69,p:0.7,c:18,g:0.2},'pera':{k:57,p:0.4,c:15,g:0.1},'melocotón':{k:39,p:0.9,c:10,g:0.3},'sandía':{k:30,p:0.6,c:7.6,g:0.2},'limón':{k:29,p:1.1,c:9.3,g:0.3},'kiwi':{k:61,p:1.1,c:15,g:0.5},'mango':{k:60,p:0.8,c:15,g:0.4},'piña':{k:50,p:0.5,c:13,g:0.1},'cerezas':{k:50,p:1,c:12,g:0.3},'ciruelas':{k:46,p:0.7,c:11,g:0.3},'melón':{k:34,p:0.8,c:8,g:0.1},
/* Frutos secos y semillas */
'nueces':{k:654,p:15,c:14,g:65},'almendras':{k:579,p:21,c:22,g:49},'cacahuetes':{k:567,p:26,c:16,g:49},'avellanas':{k:628,p:15,c:17,g:61},'pipas':{k:575,p:23,c:20,g:49},'semillas de chía':{k:486,p:16,c:42,g:31},'semillas de girasol':{k:584,p:21,c:20,g:51},'piñones':{k:673,p:14,c:13,g:68},'marañón':{k:553,p:18,c:30,g:44},
/* Lácteos */
'leche':{k:61,p:3.2,c:4.8,g:3.3},'leche entera':{k:61,p:3.2,c:4.8,g:3.3},'leche semidesnatada':{k:50,p:3.4,c:5,g:2},'leche desnatada':{k:34,p:3.4,c:5,g:0.1},'leche de almendra':{k:15,p:0.6,c:0.3,g:1.2},'leche de soja':{k:33,p:2.8,c:1.6,g:1.8},'leche de avena':{k:40,p:1,c:6.5,g:1.5},'leche de coco':{k:230,p:2.3,c:6,g:24},
/* Bebidas */
'café':{k:2,p:0.3,c:0,g:0},'café con leche':{k:30,p:1.5,c:2.5,g:1.5},'café con leche entera':{k:40,p:1.5,c:3,g:2.5},'té':{k:1,p:0,g:0.3,g:0},'zumo de naranja':{k:45,p:0.7,c:10,g:0.2},'zumo':{k:45,p:0.5,c:11,g:0.1},'batido':{k:100,p:4,c:15,g:2},'coca-cola':{k:42,p:0,g:11,g:0},'cerveza':{k:43,p:0.5,c:3.6,g:0},'vino tinto':{k:85,p:0.1,c:2.6,g:0},
/* Salsas y condimentos */'aceite de oliva':{k:884,p:0,c:0,g:100},'aceite':{k:884,p:0,c:0,g:100},'mantequilla':{k:717,p:0.9,c:0.1,g:81},'mayonesa':{k:680,p:1,c:1,g:75},'ketchup':{k:112,p:1.7,c:26,g:0.1},'mayonesa light':{k:390,p:1,c:3,g:42},'salsa de soja':{k:53,p:8,c:5,g:0},'salsa teriyaki':{k:89,p:5,c:16,g:0},'pesto':{k:378,p:4,c:4,g:39},'hummus':{k:166,p:8,c:14,g:10},'guacamole':{k:150,p:2,c:9,g:13},'mostaza':{k:66,p:4,c:6,g:3},
/* Preparados y platos */
'ensalada':{k:20,p:1.5,c:3.5,g:0.3},'ensalada mixta':{k:65,p:3,c:4,g:4},'ensalada con pollo':{k:120,p:15,c:5,g:4},'ensalada cesar':{k:180,p:16,c:6,g:10},'sándwich':{k:250,p:12,c:28,g:10},'bocadillo':{k:250,p:12,c:28,g:10},'hummus con pan':{k:180,p:6,c:18,g:9},'wrap':{k:230,p:10,c:30,g:8},'pizza':{k:266,p:11,c:33,g:10},'hamburguesa':{k:295,p:17,c:24,g:13},'bocadillo de pollo':{k:250,p:18,c:22,g:9},'pasta con tomate':{k:130,p:4,c:25,g:1.5},'pasta con pesto':{k:200,p:5,c:22,g:10},'pasta con boloñesa':{k:160,p:9,c:20,g:5},'arroz con pollo':{k:180,p:14,c:22,g:4},'arroz con verduras':{k:120,p:3,c:22,g:2},'lentejas con arroz':{k:130,p:8,c:20,g:2},'guiso':{k:120,p:8,c:12,g:3},'pisto':{k:60,p:2,c:7,g:3},'crema de verduras':{k:45,p:2,c:6,g:1.5},'sopa':{k:30,p:1.5,c:5,g:0.3},'salmorejo':{k:120,p:3,c:10,g:8},'gazpacho':{k:40,p:1.5,c:6,g:1},'croquetas':{k:280,p:10,c:22,g:17},'empanada':{k:320,p:10,c:35,g:16},'churros':{k:370,p:5,c:44,g:20},'dátiles':{k:277,p:1.8,c:75,g:0.2},'fruta':{k:50,p:0.5,c:12,g:0.3}
};

/* Estimate food from text */
function estimateFood(text,qtyGrams){
  const txt=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-záéíóúñü\s]/g,'');
  const words=txt.split(/\s+/).filter(w=>w.length>1);
  if(!words.length)return null;
  let bestMatch=null,bestScore=0,bestData=null;
  for(const[key,data]of Object.entries(FOOD_DB)){
    const keyNorm=key.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const keyWords=keyNorm.split(/\s+/);
    let score=0;
    for(const w of words){if(keyWords.some(kw=>kw===w||kw.includes(w)||w.includes(kw)))score++;}
    if(score>bestScore){bestScore=score;bestMatch=key;bestData=data;}
  }
  if(bestScore===0)return null;
  const factor=qtyGrams/100;
  const k=Math.round(bestData.k*factor);
  const p=Math.round(bestData.p*factor*10)/10;
  const c=Math.round(bestData.c*factor*10)/10;
  const g=Math.round(bestData.g*factor*10)/10;
  return{match:bestMatch,k,p,c,g,score:bestScore,totalWords:words.length};
}

/* Food modal logic */
let foodModalState={};
function openFoodModal(mealType,mealKey,user){
  foodModalState={mt:mealType,key:mealKey,user};
  const day=user.menu[todayIndex()];
  const planMeal=day?day[mealType]:'';
  $('#foodTitle').textContent=MEAL_LABELS[mealType]+': '+planMeal;
  $('#foodSubtitle').textContent='Describe lo que realmente vas a comer para estimar calorías';
  $('#foodInput').value='';
  $('#foodQty').value=200;
  $('#foodEstimate').classList.add('hidden');
  $('#foodOverlay').classList.remove('hidden');
  setTimeout(()=>$('#foodInput').focus(),100);
}
$('#foodInput').addEventListener('input',function(){
  const text=this.value.trim();
  const qty=+$('#foodQty').value||200;
  if(text.length<2){$('#foodEstimate').classList.add('hidden');return;}
  const est=estimateFood(text,qty);
  if(est){
    $('#foodMatch').textContent='Detectado: '+est.match;
    $('#foodKcal').textContent=est.k;
    $('#foodMacros').textContent='P: '+est.p+'g · C: '+est.c+'g · G: '+est.g+'g';
    $('#foodEstimate').classList.remove('hidden');
  }else{
    $('#foodMatch').textContent='No reconocido — se usará la estimación del plan';
    $('#foodKcal').textContent=getND(foodModalState.mt?foodModalState.user.menu[todayIndex()]?.[foodModalState.mt]:'').k;
    const nd=getND(foodModalState.user.menu[todayIndex()]?.[foodModalState.mt]||'');
    $('#foodMacros').textContent='P: '+nd.p+'g · C: '+nd.c+'g · G: '+nd.g+'g';
    $('#foodEstimate').classList.remove('hidden');
  }
});
$('#foodQty').addEventListener('input',function(){$('#foodInput').dispatchEvent(new Event('input'));});
$('#foodCancel').addEventListener('click',()=>{$('#foodOverlay').classList.add('hidden');});
$('#foodSkip').addEventListener('click',function(){
  const s=foodModalState;
  if(s.extra){$('#foodOverlay').classList.add('hidden');return;}
  const u=s.user;const mt=s.mt;const ky=s.key;
  if(!u.consumed[ky])u.consumed[ky]={};u.consumed[ky][mt]=true;saveUser(u);
  $('#foodOverlay').classList.add('hidden');
  const card=document.querySelector('.meal-card[data-type="'+mt+'"]');
  if(card){card.classList.add('eaten');const btn=card.querySelector('.meal-btn');if(btn){btn.classList.add('done');btn.textContent='✓ Comido';btn.disabled=true;}}
  renderExtraList(mt,ky,u);
  const day2=u.menu[todayIndex()];
  if(day2&&getMealSlots(day2).every(slot=>u.consumed[ky]&&u.consumed[ky][slot]))launchConfetti();
  if(typeof renderInicio==='function')renderInicio(u);
});

/* EVALUACIÓN SEMANAL */
const EVAL_Q=[
 {k:'energia',label:'Energía general',type:'scale5',opts:['Mala','Regular','Normal','Buena','Óptima']},
 {k:'adherencia',label:'Adherencia al plan',type:'scale5',opts:['Me cuesta mucho','Regular','Normal','Buena','Sin problema']},
 {k:'digestion',label:'Digestión',type:'scale5',opts:['Mala','Regular','Normal','Buena','Muy buena']},
 {k:'hambre',label:'Hambre / Saciedad',type:'scale5',opts:['Siempre con hambre','Hambre frecuente','Bien','Saciedad alta','Sin hambre y saciado']},
 {k:'sueno',label:'Sueño promedio',type:'hours'},
 {k:'estres',label:'Estrés semanal',type:'range10',invert:true},
 {k:'hidratacion',label:'Nivel de hidratación',type:'range10',invert:false},
 {k:'peso',label:'Peso',type:'kg'},
 {k:'rendimiento',label:'Rendimiento',type:'scale5',opts:['Malo','Regular','Normal','Bueno','Muy bueno']}
];
const EVAL_SHORT={'energia':'Energía','adherencia':'Adherencia','digestion':'Digestión','hambre':'Hambre/Sac.','sueno':'Sueño (h)','estres':'Estrés','hidratacion':'Hidratación','peso':'Peso (kg)','rendimiento':'Rendimiento'};
let evalAnswers={};
function evalNorm(q,v){
  if(v===undefined||v===null||isNaN(v))return null;
  if(q.type==='scale5')return(v-1)/4;
  if(q.type==='range10')return q.invert?(10-v)/9:(v-1)/9;
  if(q.type==='hours'){if(v<6)return .1;if(v<6.5)return .3;if(v<7)return .5;if(v<7.5)return .72;if(v<8.5)return .88;return 1;}
  return null;
}
function normColor(n){return 'hsl('+Math.round(n*120)+',58%,38%)';}
function paintEvalOption(b){
  const q=EVAL_Q.find(x=>x.k===b.dataset.k);
  const n=evalNorm(q,+b.dataset.v);
  b.style.background=normColor(n);b.classList.add('sel');
}
function renderEvaluacion(u){
  const d=new Date();
  const fechaTxt=d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('#evalFecha').textContent=fechaTxt.charAt(0).toUpperCase()+fechaTxt.slice(1);
  const hoy=todayKey();
  const prev=(u.evals||[]).find(e=>e.fecha===hoy)||null;
  evalAnswers=prev?Object.assign({},prev):{};
  const wrap=$('#evalQuestions');
  wrap.innerHTML=EVAL_Q.map(q=>{
    let inner='';
    if(q.type==='scale5'){
      inner='<div class="eval-opts">'+q.opts.map((o,i)=>'<button type="button" class="eval-opt" data-k="'+q.k+'" data-v="'+(i+1)+'">'+(i+1)+' · '+o+'</button>').join('')+'</div>';
    }else if(q.type==='range10'){
      let btns='';for(let i=1;i<=10;i++)btns+='<button type="button" class="eval-opt" data-k="'+q.k+'" data-v="'+i+'">'+i+'</button>';
      inner='<div class="eval-opts">'+btns+'</div>';
    }else{
      const ph=q.type==='hours'?'Ej: 7,5':'Ej: 78';
      const hint=q.type==='hours'?'Horas de sueño de media esta semana':'Solo registro, sin valoración';
      inner='<p class="eval-hint">'+hint+'</p><input type="number" step="any" min="0" class="eval-num" data-k="'+q.k+'" placeholder="'+ph+'">';
    }
    return '<div class="eval-q"><h3>'+q.label+'</h3>'+inner+'</div>';
  }).join('');
  wrap.querySelectorAll('.eval-opt').forEach(b=>{
    if(prev&&evalAnswers[b.dataset.k]!==undefined&&+b.dataset.v===+evalAnswers[b.dataset.k])paintEvalOption(b);
    b.addEventListener('click',()=>{
      evalAnswers[b.dataset.k]=+b.dataset.v;
      b.parentElement.querySelectorAll('.eval-opt').forEach(x=>{x.classList.remove('sel');x.style.background='';});
      paintEvalOption(b);
    });
  });
  wrap.querySelectorAll('.eval-num').forEach(inp=>{
    if(prev&&evalAnswers[inp.dataset.k]!==undefined&&qIsNum(inp.dataset.k))inp.value=evalAnswers[inp.dataset.k];
    inp.addEventListener('input',()=>{evalAnswers[inp.dataset.k]=parseFloat(inp.value);});
  });
  $('#evalFeedback').classList.add('hidden');
  renderEvalHistory(u);
}
function qIsNum(k){const q=EVAL_Q.find(x=>x.k===k);return q&&(q.type==='hours'||q.type==='kg');}
function evalFeedbackMsg(){
  const vals=EVAL_Q.filter(q=>q.type!=='kg').map(q=>({n:evalNorm(q,evalAnswers[q.k])})).filter(x=>x.n!==null);
  const total=vals.length;
  if(total<EVAL_Q.length-1)return null;
  const sr=vals.filter(x=>x.n<0.2).length;
  const lr=vals.filter(x=>x.n>=0.2&&x.n<0.45).length;
  const sg=vals.filter(x=>x.n>0.85).length;
  if(sr===0&&lr===0&&sg>=Math.ceil(total*0.6))return{cls:'good',txt:'Estás haciéndolo genial, ¡sigue así!'};
  if(sr===0&&lr<=1)return{cls:'mid',txt:'Hay algún pequeño desajuste: intenta llevarlo un poco mejor la semana que viene y, si no sabes cómo estructurarlo bien, escríbeme, estoy aquí para ayudarte'};
  return{cls:'bad',txt:'Hay bastantes desajustes en tus respuestas; vamos a intentar mejorarlos la semana que viene. Si tienes cualquier duda para estructurarlo, no dudes en escribirme'};
}
$('#evalForm').addEventListener('submit',e=>{
  e.preventDefault();
  const u=currentUser();if(!u)return;
  const fbel=$('#evalFeedback');
  fbel.classList.remove('hidden','eval-fb-good','eval-fb-mid','eval-fb-bad');
  const missing=EVAL_Q.some(q=>{
    const v=evalAnswers[q.k];
    return v===undefined||v===null||isNaN(v)||(q.type!=='kg'&&v<1)||(q.type==='kg'&&v<=0)||(q.type==='range10'&&v>10);
  });
  if(missing){fbel.classList.add('eval-fb-mid');fbel.textContent='Responde todas las preguntas antes de guardar.';return;}
  if(!u.evals)u.evals=[];
  const fecha=todayKey();
  const entry={fecha};EVAL_Q.forEach(q=>entry[q.k]=evalAnswers[q.k]);
  const i=u.evals.findIndex(x=>x.fecha===fecha);
  if(i>=0)u.evals[i]=entry;else u.evals.push(entry);
  saveUser(u);
  const fb=evalFeedbackMsg();
  if(fb){fbel.classList.add('eval-fb-'+fb.cls);fbel.textContent=fb.txt;}
  renderEvalHistory(u);
  launchConfetti();
});
function renderEvalHistory(u){
  const el=$('#evalHistory');if(!el)return;
  const list=(u.evals||[]).slice().sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:0);
  if(!list.length){el.innerHTML='';return;}
  el.innerHTML='<h3>Tu progreso</h3><div class="eval-table-wrap"><table class="eval-table"><thead><tr><th>Fecha</th>'+EVAL_Q.map(q=>'<th>'+EVAL_SHORT[q.k]+'</th>').join('')+'</tr></thead><tbody>'+
    list.map(e=>'<tr><td class="date-cell">'+e.fecha+'</td>'+EVAL_Q.map(q=>{
      const v=e[q.k];
      if(v===undefined||v===null||isNaN(v))return '<td style="color:var(--ink-soft)">—</td>';
      if(q.type==='kg')return '<td>'+v+'</td>';
      const n=evalNorm(q,v);
      let txt=q.type==='hours'?v+' h':String(v);
      if(q.type==='range10')txt=v;
      return '<td style="color:'+normColor(n)+'">'+txt+'</td>';
    }).join('')+'</tr>').join('')+'</tbody></table></div>';
}

/* Animations */
function animateCounters(root){root.querySelectorAll('.counter').forEach(el=>{const t=parseFloat(el.dataset.target);const dec=+(el.dataset.decimals||0);animateEl(el,t,dec);});}
function animateEl(el,target,decimals=0,duration=1500){
  const start=performance.now();
  const update=now=>{const p=Math.min((now-start)/duration,1);const ease=1-Math.pow(1-p,3);el.textContent=(ease*target).toFixed(decimals);if(p<1)requestAnimationFrame(update);};
  requestAnimationFrame(update);
}

/* Sleep rating */
/* Sleep rating (kept for backwards compat) */
function renderSleepRating(h){
  const el=$('#sleepRating');if(!el)return;
  const r=getSleepRating(h);
  if(!r.label){el.innerHTML='';return;}
  el.innerHTML='<span class="sleep-rating '+r.cls+'">'+r.emoji+' '+r.label+'</span>';
}

function launchConfetti(){
  const c=$('#confetti');c.innerHTML='';const colors=['#D6552C','#E8A93B','#4F6F3F','#8B3A4A','#FBF9F2','#4A90D9'];
  for(let i=0;i<45;i++){const p=document.createElement('div');p.className='confetti-piece';p.style.left=Math.random()*100+'%';p.style.background=colors[Math.floor(Math.random()*colors.length)];p.style.animationDelay=Math.random()*1.5+'s';p.style.animationDuration=(2+Math.random()*2)+'s';c.appendChild(p);}
  setTimeout(()=>c.innerHTML='',5500);
}

/* DIETA MEDITERRÁNEA PERSONALIZADA */
function renderTrainPrefs(u){
  if(!u.entreno)u.entreno={tipo:'gimnasio',dias:3,duracion:60};
  $('#perfEntreno').value=u.entreno.tipo;
  $('#perfDiasEntreno').value=u.entreno.dias;
  $('#perfDuracionEntreno').value=u.entreno.duracion;
  $('#perfNumComidas').value=u.numComidas||4;
  $('#perfNoComer').value=u.noComer||'';
}
function autoGenDieta(u){
  if(!u.physical||!u.physical.altura){$('#dietaContent').innerHTML='<div class="section-head"><p class="eyebrow">Dieta</p><h2>Configura tu perfil</h2><p>Introduce tus datos físicos y de entrenamiento en la pestaña Perfil para generar tu dieta personalizada.</p></div>';return;}
  const objetivoMap={'Equilibrado':'mantenimiento','Regular el peso':'perdida','Ganar masa muscular':'ganancia'};
  const datos={
    edad:u.physical.edad,
    sexo:u.physical.sexo,
    peso:u.physical.peso,
    altura:u.physical.altura,
    objetivo:objetivoMap[u.objetivo]||'mantenimiento',
    tipoEntreno:u.entreno?u.entreno.tipo:'gimnasio',
    diasEntreno:u.entreno?u.entreno.dias:3,
    duracionEntreno:u.entreno?u.entreno.duracion:60,
    numComidas:u.numComidas||4,
    alergias:u.alergias||[],
    noComer:u.noComer||'',
    actividad:u.physical.actividad||'moderado'
  };
  const dietaType=u.dietaType||'mediterranea';
  /* Fingerprint: solo regenerar si cambiaron los datos relevantes */
  const fp=[datos.peso,datos.altura,datos.edad,datos.sexo,datos.objetivo,datos.actividad,datos.tipoEntreno,datos.diasEntreno,datos.duracionEntreno,datos.numComidas,dietaType].join('|');
  if(u.dietaData&&u.dietaData._fp===fp&&u.dietaData.plan){
    console.log('[PLAN DEBUG] RECUPERADO (cache autoGenDieta)');
    u.dietaData.plan.forEach(d=>console.log(`  ${d.dia}: ${d.comidas.map(c=>c.n).join(' | ')}`));
    mostrarDieta(u.dietaData);
    return;
  }
  let dieta;
  if(dietaType==='paleo'){
    dieta=genDietaPaleo(datos);
  }else if(dietaType==='vegana'){
    dieta=genDietaVegana(datos);
  }else if(dietaType==='vegetariana'){
    dieta=genDietaVegetariana(datos);
  }else if(dietaType==='cetogenica'){
    dieta=genDietaCeto(datos);
  }else{
    dieta=genDietaMediterranea(datos);
  }
  dieta.dietaType=dietaType;
  dieta._fp=fp;
  console.log('[PLAN DEBUG] GENERADO (autoGenDieta)');
  dieta.plan.forEach(d=>console.log(`  ${d.dia}: ${d.comidas.map(c=>c.n).join(' | ')}`));
  u.dietaData=dieta;
  saveUser(u);
  console.log('[PLAN DEBUG] GUARDADO (autoGenDieta)');
  mostrarDieta(dieta);
}
function mostrarDieta(d){
  activateTab('dieta');
  const objLabel={perdida:'Pérdida de grasa',mantenimiento:'Mantenimiento',ganancia:'Ganancia de masa muscular'}[d.objetivo]||d.objetivo;
  const dietaType=d.dietaType||'mediterranea';
  const dietLabels={mediterranea:'Mediterránea',paleo:'Paleo',vegana:'Vegana',cetogenica:'Cetogénica',vegetariana:'Vegetariana'};
  const dietLabel=dietLabels[dietaType]||'Mediterránea';
  const entrenos=new Set(d.plan.filter(p=>p.entrenando).map((_,i)=>i));
  let html=`<div class="section-head"><p class="eyebrow">Dieta ${dietLabel}</p><h2>Tu dieta ${dietLabel.toLowerCase()} personalizada</h2></div>
  <div class="dash-card" style="max-width:700px;">
    <div class="phys-grid" style="grid-template-columns:1fr 1fr 1fr;">
      <div><span style="font-size:.75rem;color:var(--ink-soft);">Calorías medias</span><br><b>${d.calAvg} kcal/día</b></div>
      <div><span style="font-size:.75rem;color:var(--ink-soft);">Rango diario</span><br><b>${d.range.min}–${d.range.max} kcal</b></div>
      <div><span style="font-size:.75rem;color:var(--ink-soft);">Proteína</span><br><b>${d.promedio.p} g/día</b></div>
      <div><span style="font-size:.75rem;color:var(--ink-soft);">Carbohidratos</span><br><b>${d.promedio.c} g/día</b></div>
      <div><span style="font-size:.75rem;color:var(--ink-soft);">Grasas</span><br><b>${d.promedio.g} g/día</b></div>
      <div><span style="font-size:.75rem;color:var(--ink-soft);">Objetivo</span><br><b>${objLabel}</b></div>
      <div><span style="font-size:.75rem;color:var(--ink-soft);">Entrenamiento</span><br><b>${d.tipoEntreno} · ${d.usuario.diasEntreno} días/sem</b></div>
      <div><span style="font-size:.75rem;color:var(--ink-soft);">Comidas/día</span><br><b>${d.numComidas}</b></div>
    </div>
    <p style="font-size:.82rem;color:var(--ink-soft);margin-top:14px;">Tu dieta está adaptada a tus características, objetivo y nivel de actividad. Las calorías y los carbohidratos varían ligeramente entre días para adaptarse a tu entrenamiento y descanso.</p>
  </div>`;
  d.plan.forEach((dia,di)=>{
    const marker=dia.entrenando?'<span style="color:var(--herb);font-size:.75rem;">💪 Entreno</span>':'<span style="font-size:.75rem;color:var(--ink-soft);">Descanso</span>';
    html+=`<div class="dash-card" style="max-width:700px;margin-top:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <b>${dia.dia}</b> ${marker}
        <span style="font-size:.8rem;"><b>${dia.calReal} kcal</b> · P ${dia.pReal}g · C ${dia.cReal}g · G ${dia.gReal}g</span>
      </div>`;
    dia.comidas.forEach(c=>{
      html+=`<div style="margin-bottom:8px;">
        <div style="font-size:.8rem;font-weight:600;color:var(--herb);">${c.tipo} <button class="btn-link" style="font-size:.75rem;" onclick="verReceta('${dia.dia}','${c.tipo}')">🍽️ Ver receta</button></div>
        <div style="font-size:.85rem;">${c.n}</div>
        <div style="font-size:.75rem;color:var(--ink-soft);">${c.ing.map(x=>x.a+': '+x.q+' g').join(' · ')}</div>
      </div>`;
    });
    html+=`</div>`;
  });
  html+=`<div class="dash-card" style="max-width:700px;margin-top:16px;"><button class="btn btn-solid" onclick="verListaCompra()">🛒 Ver lista de la compra</button></div>`;
  $('#dietaContent').innerHTML=html;
  $('#dietaData').value=JSON.stringify(d);
}
function verReceta(dia,tipo){
  const d=JSON.parse($('#dietaData')?.value||'{}');
  const diaObj=d.plan?.find(p=>p.dia===dia);
  if(!diaObj)return;
  const comida=diaObj.comidas.find(c=>c.tipo===tipo);
  if(!comida)return;
  $('#recipeTitle').textContent=comida.n;
  $('#recipeTime').textContent='~'+(comida.t||10)+' min de preparación';
  let ingHtml='<b>Ingredientes:</b><ul style="margin:6px 0;">';
  comida.ing.forEach(i=>{ingHtml+=`<li style="font-size:.85rem;">${i.a}: ${i.q} g <span style="color:var(--ink-soft);">(${i.cal} kcal · P ${i.p}g · C ${i.c}g · G ${i.g}g)</span></li>`;});
  ingHtml+='</ul>';
  $('#recipeIngredients').innerHTML=ingHtml;
  $('#recipeSteps').innerHTML='<b>Preparación:</b><p style="font-size:.85rem;color:var(--ink-soft);margin-top:6px;">Prepara todos los ingredientes. Cocina según las indicaciones de cada alimento. Sirve y disfruta.</p>';
  $('#recipeOverlay').classList.remove('hidden');
}
function verListaCompra(){
  const d=JSON.parse($('#dietaData')?.value||'{}');
  if(!d.plan)return;
  const dietaType=d.dietaType||'mediterranea';
  let lista;
  if(dietaType==='paleo')lista=genListaCompraPaleo(d.plan);
  else if(dietaType==='vegana')lista=genListaCompraVegana(d.plan);
  else if(dietaType==='vegetariana')lista=genListaCompraVegetariana(d.plan);
  else if(dietaType==='cetogenica')lista=genListaCompraCeto(d.plan);
  else lista=genListaCompra(d.plan);
  const dietLabels={mediterranea:'Mediterránea',paleo:'Paleo',vegana:'Vegana',cetogenica:'Cetogénica',vegetariana:'Vegetariana'};
  const dietLabel=dietLabels[dietaType]||'Mediterránea';
  let html=`<div class="section-head"><p class="eyebrow">Lista de la compra · Dieta ${dietLabel}</p><h2>Tu lista semanal</h2><p style="font-size:.82rem;color:var(--ink-soft);margin-top:4px;">Las cantidades de arroz, pasta y legumbres se indican en peso en crudo.</p></div>`;
  Object.keys(lista).forEach(cat=>{
    html+=`<div class="dash-card" style="max-width:700px;margin-top:12px;"><b>${cat}</b><ul style="margin:6px 0;">`;
    Object.keys(lista[cat]).forEach(al=>{
      const item=lista[cat][al];
      html+=`<li style="font-size:.85rem;">${al}: <b>${Math.round(item.total)} g</b></li>`;
    });
    html+=`</ul></div>`;
  });
  $('#dietaContent').innerHTML=html;
}
/* Init */
(function init(){
  if(!getUsers().length){
    const demo={id:'u-demo',name:'Demo Vitaria',email:'test@vitaria.com',pw:hash('vitaria123'),plan:'pro',tipo:'Equilibrada',objetivo:'Equilibrado',dietaType:'todos',alergias:[],createdAt:new Date().toISOString(),mv:2,menu:[],menuObj:'Equilibrado',consumed:{},glassed:{},sleep:{},customFoods:{},extraFoods:{},subs:{}};
    try{demo.menu=newMenu('Equilibrada',[],0,'Equilibrado','todos',demo);}catch(e){console.error('newMenu demo error:',e);demo.menu=[];}
    setUsers([demo]);
  }
  renderChips('regChips',ALERGIAS,[]);
  const u=currentUser();
  if(u){if(!u.physical){showOnboarding();}else{enterPortal();}}else{showView('view-auth');showAuth('login');}
})();

/* ===== PERFIL: Interacciones visuales ===== */
(function(){
  /* Diet grid ↔ hidden select */
  const dietaGrid=$('#perfDietaGrid');
  const dietaSelect=$('#perfDieta');
  if(dietaGrid&&dietaSelect){
    dietaGrid.querySelectorAll('.pf-diet-opt').forEach(btn=>{
      btn.addEventListener('click',()=>{
        dietaGrid.querySelectorAll('.pf-diet-opt').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        dietaSelect.value=btn.dataset.val;
        markUnsaved();
      });
    });
  }

  /* Meals grid ↔ hidden select */
  const mealsGrid=$('#perfNumComidasGrid');
  const mealsSelect=$('#perfNumComidas');
  if(mealsGrid&&mealsSelect){
    mealsGrid.querySelectorAll('.pf-meal-opt').forEach(btn=>{
      btn.addEventListener('click',()=>{
        mealsGrid.querySelectorAll('.pf-meal-opt').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        mealsSelect.value=btn.dataset.val;
        markUnsaved();
      });
    });
  }

  /* Sync visual grids from hidden selects on render */
  window.syncProfileVisuals=function(){
    if(dietaSelect&&dietaGrid){
      dietaGrid.querySelectorAll('.pf-diet-opt').forEach(b=>{
        b.classList.toggle('active',b.dataset.val===dietaSelect.value);
      });
    }
    if(mealsSelect&&mealsGrid){
      mealsGrid.querySelectorAll('.pf-meal-opt').forEach(b=>{
        b.classList.toggle('active',b.dataset.val===mealsSelect.value);
      });
    }
  };

  /* Unsaved changes */
  const unsavedEl=$('#pfUnsaved');
  function markUnsaved(){if(unsavedEl)unsavedEl.classList.remove('hidden');}
  function clearUnsaved(){if(unsavedEl)unsavedEl.classList.add('hidden');}

  document.querySelectorAll('#perfName,#perfObjetivo,#perfDieta,#perfAltura,#perfPeso,#perfEdad,#perfSexo,#perfActividad,#perfEntreno,#perfDiasEntreno,#perfDuracionEntreno,#perfNumComidas,#perfNoComer').forEach(el=>{
    el.addEventListener('input',markUnsaved);
    el.addEventListener('change',markUnsaved);
  });

  /* Save button states */
  function animateSave(btn){
    btn.classList.add('is-loading');
    btn.disabled=true;
    setTimeout(()=>{
      btn.classList.remove('is-loading');
      btn.classList.add('is-done');
      btn.disabled=false;
      clearUnsaved();
      setTimeout(()=>btn.classList.remove('is-done'),2200);
    },400);
  }

  const perfSaveBtn=$('#perfSave');
  if(perfSaveBtn){
    perfSaveBtn.addEventListener('click',function(){animateSave(this);},{capture:true});
  }
  const perfPhysBtn=$('#perfPhysSave');
  if(perfPhysBtn){
    perfPhysBtn.addEventListener('click',function(){animateSave(this);},{capture:true});
  }
  const perfTrainBtn=$('#perfTrainSave');
  if(perfTrainBtn){
    perfTrainBtn.addEventListener('click',function(){animateSave(this);},{capture:true});
  }
  const pwSaveBtn=$('#pwSave');
  if(pwSaveBtn){
    pwSaveBtn.addEventListener('click',function(){animateSave(this);},{capture:true});
  }

  /* Stagger card animations on perfil tab */
  const origActivateTab=window.activateTab;
  if(typeof origActivateTab==='function'){
    window.activateTab=function(){
      origActivateTab.apply(this,arguments);
      if(arguments[0]==='perfil'){
        document.querySelectorAll('#tab-perfil .pf-card--fade,#tab-perfil .pf-row--fade').forEach(el=>{
          el.style.animation='none';
          el.offsetHeight;
          el.style.animation='';
        });
        syncProfileVisuals();
      }
    };
  }
})();
})();