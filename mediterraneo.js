/* ===== Motor de Dieta Mediterránea Personalizada ===== */
function calcBMR(sexo,peso,altura,edad){
  if(sexo==='mujer')return 10*peso+6.25*altura-5*edad-161;
  return 10*peso+6.25*altura-5*edad+5;
}
function activityMultiplier(nivel,diasEntreno,duracionEntreno,tipoEntreno){
  var base={sedentario:1.2,ligero:1.375,moderado:1.55,intenso:1.725}[nivel]||1.55;
  var horasSemana=(diasEntreno*duracionEntreno)/60;
  var extra=0;
  if(tipoEntreno==='gimnasio')extra=horasSemana*0.06;
  else if(tipoEntreno==='futbol')extra=horasSemana*0.08;
  else if(tipoEntreno==='running')extra=horasSemana*0.07;
  else if(tipoEntreno==='ciclismo')extra=horasSemana*0.065;
  else extra=horasSemana*0.06;
  return base+extra;
}
function calcTDEE(bmr,mult){return Math.round(bmr*mult);}
function adjustCalories(tdee,objetivo){
  if(objetivo==='perdida')return Math.round(tdee*0.82);
  if(objetivo==='ganancia')return Math.round(tdee*1.15);
  return tdee;
}
function calorieRange(avg){var d=Math.round(avg*0.05);return{min:avg-d,max:avg+d};}
function calcMacros(peso,objetivo,tipoEntreno){
  var pGr=peso*2;
  if(objetivo==='ganancia')pGr=peso*2.2;
  if(objetivo==='perdida')pGr=peso*2.4;
  if(tipoEntreno==='gimnasio'&&objetivo==='ganancia')pGr=peso*2.3;
  return Math.round(pGr);
}
function distributeMacros(calObj,pGr,objetivo){
  var pCal=pGr*4;
  var grasaPct=0.30;
  if(objetivo==='perdida')grasaPct=0.28;
  if(objetivo==='ganancia')grasaPct=0.25;
  var grCal=calObj*grasaPct;
  var gr=Math.round(grCal/9);
  var calResta=calObj-pCal-grCal;
  var c=Math.round(Math.max(calResta/4,100)/5)*5;
  return{p:Math.round(pGr),c:c,g:gr};
}

/* Base de datos — cal=calorías por porción base */
var MED_MEALS={
desayuno:[
{n:'Tostadas de pan integral con tomate y AOVE',ing:[{a:'Pan integral',q:80,cal:210,p:8,c:36,g:3},{a:'Tomate natural',q:100,cal:18,p:1,c:4,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:5},
{n:'Huevos revueltos con espinaca y champiñones',ing:[{a:'Huevos',q:120,cal:172,p:14,c:1,g:12},{a:'Espinaca',q:50,cal:12,p:2,c:2,g:0},{a:'Champiñones',q:50,cal:11,p:1,c:2,g:0},{a:'AOVE',q:5,cal:45,p:0,c:0,g:5}],t:8},
{n:'Avena con yogur griego y frutos rojos',ing:[{a:'Avena en copos',q:40,cal:152,p:5,c:27,g:3},{a:'Yogur griego',q:150,cal:90,p:15,c:5,g:2},{a:'Frutos rojos',q:80,cal:32,p:1,c:7,g:0}],t:5},
{n:'Tortilla de espinacas y cebolla',ing:[{a:'Huevos',q:150,cal:215,p:18,c:1,g:15},{a:'Espinaca',q:60,cal:14,p:2,c:2,g:0},{a:'Cebolla',q:30,cal:12,p:0,c:3,g:0},{a:'AOVE',q:5,cal:45,p:0,c:0,g:5}],t:10},
{n:'Smoothie de plátano, avena y leche de almendra',ing:[{a:'Plátano',q:120,cal:107,p:1,c:27,g:0},{a:'Avena',q:30,cal:114,p:4,c:20,g:2},{a:'Leche de almendra',q:200,cal:30,p:1,c:1,g:2}],t:5},
{n:'Yogur griego con miel y nueces',ing:[{a:'Yogur griego',q:200,cal:120,p:20,c:6,g:3},{a:'Miel',q:15,cal:46,p:0,c:12,g:0},{a:'Nueces',q:20,cal:131,p:3,c:3,g:13}],t:3},
{n:'Pan de centeno con aguacate y huevo',ing:[{a:'Pan de centeno',q:60,cal:160,p:5,c:32,g:2},{a:'Aguacate',q:70,cal:114,p:1,c:6,g:11},{a:'Huevo cocido',q:50,cal:72,p:6,c:0,g:5}],t:8},
{n:'Pudín de chía con leche de coco y mango',ing:[{a:'Semillas de chía',q:25,cal:121,p:4,c:10,g:8},{a:'Leche de coco',q:150,cal:45,p:1,c:2,g:4},{a:'Mango',q:80,cal:48,p:1,c:12,g:0}],t:5}
],
media_manana:[
{n:'Manzana con mantequilla de almendra',ing:[{a:'Manzana',q:150,cal:78,p:0,c:21,g:0},{a:'Mantequilla de almendra',q:20,cal:128,p:4,c:4,g:11}],t:3},
{n:'Frutos secos mixtos',ing:[{a:'Almendras',q:15,cal:87,p:3,c:2,g:8},{a:'Nueces',q:15,cal:98,p:2,c:2,g:10},{a:'Avellanas',q:15,cal:90,p:2,c:2,g:9}],t:2},
{n:'Yogur griego con fruta',ing:[{a:'Yogur griego',q:125,cal:75,p:13,c:4,g:2},{a:'Fresas',q:80,cal:26,p:1,c:6,g:0}],t:3},
{n:'Hummus con palitos de zanahoria',ing:[{a:'Hummus',q:60,cal:106,p:5,c:8,g:6},{a:'Zanahoria',q:80,cal:33,p:1,c:8,g:0}],t:5},
{n:'Queso fresco con tomate',ing:[{a:'Queso fresco',q:80,cal:98,p:12,c:1,g:5},{a:'Tomate',q:80,cal:14,p:1,c:3,g:0}],t:5}
],
comida:[
{n:'Pechuga de pollo a la plancha con quinoa y verduras',ing:[{a:'Pechuga de pollo',q:150,cal:165,p:31,c:0,g:4},{a:'Quinoa cocida',q:130,cal:155,p:6,c:27,g:2},{a:'Pimiento',q:80,cal:25,p:1,c:5,g:0},{a:'Calabacín',q:80,cal:14,p:1,c:3,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:15},
{n:'Salmón al horno con patata y espárragos',ing:[{a:'Salmón',q:150,cal:280,p:30,c:0,g:18},{a:'Patata',q:150,cal:115,p:3,c:27,g:0},{a:'Espárragos',q:100,cal:20,p:2,c:4,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:25},
{n:'Ensalada mediterránea con atún y huevo',ing:[{a:'Atún al natural',q:100,cal:116,p:26,c:0,g:1},{a:'Huevo cocido',q:50,cal:72,p:6,c:0,g:5},{a:'Lechuga',q:60,cal:10,p:1,c:2,g:0},{a:'Tomate',q:100,cal:18,p:1,c:4,g:0},{a:'Aceitunas',q:20,cal:26,p:0,c:1,g:2},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:10},
{n:'Lentejas guisadas con verduras',ing:[{a:'Lentejas cocidas',q:200,cal:232,p:18,c:32,g:1},{a:'Zanahoria',q:60,cal:25,p:1,c:6,g:0},{a:'Cebolla',q:40,cal:16,p:0,c:4,g:0},{a:'Tomate triturado',q:100,cal:32,p:2,c:6,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:30},
{n:'Merluza al horno con calabacín y limón',ing:[{a:'Merluza',q:200,cal:148,p:32,c:0,g:2},{a:'Calabacín',q:120,cal:20,p:2,c:4,g:0},{a:'Limón',q:30,cal:8,p:0,c:3,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:20},
{n:'Pasta integral con verduras y parmesano',ing:[{a:'Pasta integral cocida',q:130,cal:174,p:7,c:34,g:2},{a:'Calabacín',q:80,cal:14,p:1,c:3,g:0},{a:'Tomate cherry',q:80,cal:14,p:1,c:3,g:0},{a:'Parmesano',q:15,cal:59,p:5,c:0,g:4},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:15},
{n:'Arroz integral con verduras y huevo',ing:[{a:'Arroz integral cocido',q:130,cal:150,p:3,c:32,g:1},{a:'Brócoli',q:80,cal:28,p:2,c:3,g:0},{a:'Huevo frito',q:50,cal:90,p:6,c:0,g:7},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:20},
{n:'Pollo al horno con cebolla y hierbas',ing:[{a:'Muslo de pollo sin piel',q:150,cal:180,p:28,c:0,g:8},{a:'Cebolla',q:80,cal:32,p:1,c:8,g:0},{a:'Patata',q:120,cal:92,p:2,c:21,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:35}
],
merienda:[
{n:'Tostada integral con pavo y tomate',ing:[{a:'Pan integral',q:40,cal:105,p:4,c:18,g:2},{a:'Pavo en lonchas',q:40,cal:44,p:8,c:1,g:1},{a:'Tomate',q:50,cal:9,p:0,c:2,g:0}],t:5},
{n:'Batido de proteína con plátano',ing:[{a:'Proteína en polvo',q:30,cal:120,p:24,c:3,g:1},{a:'Plátano',q:100,cal:89,p:1,c:23,g:0},{a:'Leche de almendra',q:200,cal:30,p:1,c:1,g:2}],t:5},
{n:'Guisantes con jamón',ing:[{a:'Guisantes',q:100,cal:81,p:5,c:14,g:0},{a:'Jamón serrano',q:30,cal:78,p:10,c:1,g:4}],t:5},
{n:'Edamame con sal',ing:[{a:'Edamame',q:120,cal:142,p:12,c:10,g:6}],t:3},
{n:'Queso fresco con fruta',ing:[{a:'Queso fresco',q:100,cal:98,p:12,c:1,g:5},{a:'Plátano',q:80,cal:71,p:1,c:18,g:0}],t:3}
],
cena:[
{n:'Sopa de verduras con huevo',ing:[{a:'Caldo de verduras',q:300,cal:24,p:2,c:4,g:0},{a:'Zanahoria',q:60,cal:25,p:1,c:6,g:0},{a:'Calabacín',q:60,cal:10,p:1,c:2,g:0},{a:'Huevo cocido',q:50,cal:72,p:6,c:0,g:5}],t:15},
{n:'Ensalada de garbanzos con verduras',ing:[{a:'Garbanzos cocidos',q:150,cal:246,p:13,c:34,g:4},{a:'Pimiento rojo',q:80,cal:25,p:1,c:5,g:0},{a:'Pepino',q:80,cal:13,p:1,c:3,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:10},
{n:'Tortilla francesa con ensalada',ing:[{a:'Huevos',q:120,cal:172,p:14,c:1,g:12},{a:'Lechuga',q:60,cal:10,p:1,c:2,g:0},{a:'Tomate',q:80,cal:14,p:1,c:3,g:0},{a:'AOVE',q:5,cal:45,p:0,c:0,g:5}],t:10},
{n:'Pescado blanco al horno con verduras',ing:[{a:'Merluza',q:150,cal:111,p:24,c:0,g:2},{a:'Brócoli',q:100,cal:35,p:3,c:4,g:0},{a:'Cebolla',q:40,cal:16,p:0,c:4,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:20},
{n:'Revuelto de huevos con setas',ing:[{a:'Huevos',q:120,cal:172,p:14,c:1,g:12},{a:'Champiñones',q:100,cal:22,p:3,c:3,g:0},{a:'AOVE',q:5,cal:45,p:0,c:0,g:5}],t:10},
{n:'Ensalada templada de atún',ing:[{a:'Atún al natural',q:100,cal:116,p:26,c:0,g:1},{a:'Judías verdes',q:80,cal:25,p:2,c:5,g:0},{a:'Huevo cocido',q:50,cal:72,p:6,c:0,g:5},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:10},
{n:'Crema de calabaza con semillas',ing:[{a:'Calabaza',q:200,cal:45,p:1,c:11,g:0},{a:'Cebolla',q:30,cal:12,p:0,c:3,g:0},{a:'Semillas de calabaza',q:10,cal:56,p:3,c:1,g:5}],t:15}
],
post_entreno:[
{n:'Batido de recuperación: plátano, proteína y leche',ing:[{a:'Plátano',q:120,cal:107,p:1,c:27,g:0},{a:'Proteína en polvo',q:30,cal:120,p:24,c:3,g:1},{a:'Leche',q:250,cal:130,p:8,c:12,g:5}],t:5},
{n:'Yogur griego con miel y fruta',ing:[{a:'Yogur griego',q:200,cal:120,p:20,c:6,g:3},{a:'Miel',q:15,cal:46,p:0,c:12,g:0},{a:'Plátano',q:80,cal:71,p:1,c:18,g:0}],t:3}
]
};

/* Generador de plan semanal */
function genDietaMediterranea(userData){
  var edad=userData.edad||25,sexo=userData.sexo||'hombre',peso=userData.peso||70,altura=userData.altura||175;
  var objetivo=userData.objetivo||'mantenimiento',tipoEntreno=userData.tipoEntreno||'gimnasio';
  var diasEntreno=userData.diasEntreno||3,duracionEntreno=userData.duracionEntreno||60;
  var numComidas=userData.numComidas||4,actividad=userData.actividad||'moderado';
  var bmr=calcBMR(sexo,peso,altura,edad);
  var mult=activityMultiplier(actividad,diasEntreno,duracionEntreno,tipoEntreno);
  var tdee=calcTDEE(bmr,mult);
  var calAvg=adjustCalories(tdee,objetivo);
  var range=calorieRange(calAvg);
  var pTarget=calcMacros(peso,objetivo,tipoEntreno);
  var dias=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  function getSlotsAndPct(n,entrenando){
    if(n<=4){
      if(entrenando)return{slots:['comida','cena'],pct:{comida:0.48,cena:0.44}};
      return{slots:['comida','cena'],pct:{comida:0.52,cena:0.48}};
    }
    if(n===5){
      if(entrenando)return{slots:['desayuno','comida','merienda','cena'],pct:{desayuno:0.22,comida:0.35,merienda:0.10,cena:0.25}};
      return{slots:['desayuno','comida','merienda','cena'],pct:{desayuno:0.27,comida:0.38,merienda:0.12,cena:0.23}};
    }
    if(entrenando)return{slots:['desayuno','media_manana','comida','merienda','cena'],pct:{desayuno:0.18,media_manana:0.09,comida:0.28,merienda:0.08,cena:0.29}};
    return{slots:['desayuno','media_manana','comida','merienda','cena'],pct:{desayuno:0.22,media_manana:0.11,comida:0.30,merienda:0.09,cena:0.28}};
  }

  function scaleMeal(meal,targetCal){
    var baseCal=meal.ing.reduce(function(s,x){return s+x.cal;},0);
    if(baseCal===0)return JSON.parse(JSON.stringify(meal));
    var factor=targetCal/baseCal;
    var scaled=JSON.parse(JSON.stringify(meal));
    scaled.ing=scaled.ing.map(function(x){
      return{a:x.a,q:Math.round(x.q*factor),cal:Math.round(x.cal*factor),p:Math.round(x.p*factor),c:Math.round(x.c*factor),g:Math.round(x.g*factor)};
    });
    return scaled;
  }

  var plan=[];
  var totalCal=0,totalP=0,totalC=0,totalG=0;
  var labels={desayuno:'Desayuno',media_manana:'Media mañana',comida:'Comida',merienda:'Merienda',cena:'Cena'};

  for(var i=0;i<7;i++){
    var entrenando=i<diasEntreno;
    var calDia=entrenando?Math.round(calAvg*1.04):Math.round(calAvg*0.97);
    var macrosDia=distributeMacros(calDia,pTarget,objetivo);
    var sp=getSlotsAndPct(numComidas,entrenando);
    var comidas=[];
    var usados={};
    function pick(pool){
      var avail=pool.filter(function(m){return !usados[m.n];});
      var src=avail.length?avail:pool;
      var idx=Math.floor(Math.random()*src.length);
      usados[src[idx].n]=true;
      return src[idx];
    }
    sp.slots.forEach(function(slot){
      var meal=pick(MED_MEALS[slot]);
      var targetCal=Math.round(calDia*sp.pct[slot]);
      var scaled=scaleMeal(meal,targetCal);
      scaled.tipo=labels[slot];
      comidas.push(scaled);
    });
    if(entrenando){
      var postMeal=pick(MED_MEALS.post_entreno);
      var postTarget=Math.round(calDia*0.08);
      var scaledPost=scaleMeal(postMeal,postTarget);
      scaledPost.tipo='Post-entreno';
      comidas.push(scaledPost);
    }
    var calReal=comidas.reduce(function(s,c){return s+c.ing.reduce(function(si,x){return si+x.cal;},0);},0);
    var pReal=Math.round(comidas.reduce(function(s,c){return s+c.ing.reduce(function(si,x){return si+x.p;},0);},0));
    var cReal=Math.round(comidas.reduce(function(s,c){return s+c.ing.reduce(function(si,x){return si+x.c;},0);},0));
    var gReal=Math.round(comidas.reduce(function(s,c){return s+c.ing.reduce(function(si,x){return si+x.g;},0);},0));
    totalCal+=calReal;totalP+=pReal;totalC+=cReal;totalG+=gReal;
    plan.push({dia:dias[i],entrenando:entrenando,calObj:calDia,macros:macrosDia,comidas:comidas,calReal:calReal,pReal:pReal,cReal:cReal,gReal:gReal});
  }
  return{
    usuario:userData,
    bmr:Math.round(bmr),
    tdee:tdee,
    calAvg:calAvg,
    range:range,
    objetivo:objetivo,
    tipoEntreno:tipoEntreno,
    numComidas:numComidas,
    plan:plan,
    promedio:{cal:Math.round(totalCal/7),p:Math.round(totalP/7),c:Math.round(totalC/7),g:Math.round(totalG/7)}
  };
}

/* Lista de la compra */
function genListaCompra(plan){
  var cats={'Frutas y verduras':{},'Carnes y aves':{},'Pescados y mariscos':{},'Huevos y lácteos':{},'Cereales y carbohidratos':{},'Frutos secos y semillas':{},'Aceites y grasas':{},'Otros':{}};
  var catMap={'Tomate':'Frutas y verduras','Tomate natural':'Frutas y verduras','Tomate cherry':'Frutas y verduras','Lechuga':'Frutas y verduras','Espinaca':'Frutas y verduras','Calabacín':'Frutas y verduras','Brócoli':'Frutas y verduras','Pimiento':'Frutas y verduras','Pimiento rojo':'Frutas y verduras','Cebolla':'Frutas y verduras','Zanahoria':'Frutas y verduras','Champiñones':'Frutas y verduras','Patata':'Frutas y verduras','Calabaza':'Frutas y verduras','Pepino':'Frutas y verduras','Espárragos':'Frutas y verduras','Judías verdes':'Frutas y verduras','Guisantes':'Frutas y verduras','Plátano':'Frutas y verduras','Manzana':'Frutas y verduras','Fresas':'Frutas y verduras','Mango':'Frutas y verduras','Frutos rojos':'Frutas y verduras','Limón':'Frutas y verduras',
'Pechuga de pollo':'Carnes y aves','Muslo de pollo sin piel':'Carnes y aves','Pavo en lonchas':'Carnes y aves','Jamón serrano':'Carnes y aves',
'Salmón':'Pescados y mariscos','Merluza':'Pescados y mariscos','Atún al natural':'Pescados y mariscos',
'Huevos':'Huevos y lácteos','Huevo cocido':'Huevos y lácteos','Huevo frito':'Huevos y lácteos','Yogur griego':'Huevos y lácteos','Queso fresco':'Huevos y lácteos','Parmesano':'Huevos y lácteos','Leche':'Huevos y lácteos','Leche de almendra':'Huevos y lácteos','Leche de coco':'Huevos y lácteos',
'Pan integral':'Cereales y carbohidratos','Pan de centeno':'Cereales y carbohidratos','Avena en copos':'Cereales y carbohidratos','Avena':'Cereales y carbohidratos','Pasta integral cocida':'Cereales y carbohidratos','Arroz integral cocido':'Cereales y carbohidratos','Quinoa cocida':'Cereales y carbohidratos','Lentejas cocidas':'Cereales y carbohidratos','Garbanzos cocidos':'Cereales y carbohidratos',
'Nueces':'Frutos secos y semillas','Almendras':'Frutos secos y semillas','Avellanas':'Frutos secos y semillas','Semillas de chía':'Frutos secos y semillas','Semillas de calabaza':'Frutos secos y semillas','Mantequilla de almendra':'Frutos secos y semillas',
'AOVE':'Aceites y grasas','Aceitunas':'Aceites y grasas',
'Hummus':'Otros','Proteína en polvo':'Otros','Miel':'Otros','Tomate triturado':'Otros','Caldo de verduras':'Otros','Edamame':'Otros'};
  plan.forEach(function(d){d.comidas.forEach(function(c){c.ing.forEach(function(ing){
    var cat=catMap[ing.a]||'Otros';
    if(!cats[cat][ing.a])cats[cat][ing.a]={total:0};
    cats[cat][ing.a].total+=ing.q;
  });});});
  Object.keys(cats).forEach(function(cat){if(!Object.keys(cats[cat]).length)delete cats[cat];});
  return cats;
}
