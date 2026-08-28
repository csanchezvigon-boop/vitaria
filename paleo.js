/* ===== Motor de Dieta Paleo Personalizada ===== */
/* Reutiliza funciones base de mediterraneo.js (calcBMR, activityMultiplier, etc.) */

/* Base de datos de comidas Paleo — cal=calorías por porción base, p=proteína, c=carbos, g=grasas */
var PALEO_MEALS={
desayuno:[
{n:'Huevos revueltos con boniato asado y espinaca',ing:[{a:'Huevos',q:120,cal:172,p:14,c:1,g:12},{a:'Boniato',q:150,cal:130,p:2,c:30,g:0},{a:'Espinaca',q:50,cal:12,p:2,c:2,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:12},
{n:'Tortilla de champiñones, pimiento y cebolla',ing:[{a:'Huevos',q:150,cal:215,p:18,c:1,g:15},{a:'Champiñones',q:60,cal:13,p:2,c:2,g:0},{a:'Pimiento rojo',q:60,cal:19,p:1,c:4,g:0},{a:'Cebolla',q:30,cal:12,p:0,c:3,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:10},
{n:'Boniato relleno de huevo pochado y aguacate',ing:[{a:'Boniato',q:200,cal:172,p:3,c:40,g:0},{a:'Huevo',q:50,cal:72,p:6,c:0,g:5},{a:'Aguacate',q:70,cal:114,p:1,c:6,g:11},{a:'Tomate',q:50,cal:9,p:0,c:2,g:0}],t:15},
{n:'Smoothie de fresas, plátano y leche de coco',ing:[{a:'Fresas',q:100,cal:32,p:1,c:8,g:0},{a:'Plátano',q:100,cal:89,p:1,c:23,g:0},{a:'Leche de coco',q:100,cal:197,p:2,c:3,g:21},{a:'Semillas de chía',q:10,cal:49,p:2,c:4,g:3}],t:5},
{n:'Huevos duros con aguacate y tomate',ing:[{a:'Huevos',q:100,cal:143,p:12,c:1,g:10},{a:'Aguacate',q:80,cal:130,p:2,c:7,g:12},{a:'Tomate',q:80,cal:14,p:1,c:3,g:0},{a:'AOVE',q:5,cal:45,p:0,c:0,g:5}],t:8},
{n:'Revuelto de huevo con salmón y espárragos',ing:[{a:'Huevos',q:100,cal:143,p:12,c:1,g:10},{a:'Salmón ahumado',q:40,cal:100,p:12,c:0,g:5},{a:'Espárragos',q:80,cal:16,p:2,c:3,g:0},{a:'AOVE',q:5,cal:45,p:0,c:0,g:5}],t:10},
{n:'Frittata de calabacín y chorizo',ing:[{a:'Huevos',q:120,cal:172,p:14,c:1,g:12},{a:'Calabacín',q:100,cal:17,p:1,c:3,g:0},{a:'Chorizo',q:30,cal:130,p:5,c:1,g:12},{a:'AOVE',q:5,cal:45,p:0,c:0,g:5}],t:12},
{n:'Avena paleo con frutos rojos y nueces',ing:[{a:'Avena paleo (almendra)',q:40,cal:160,p:6,c:8,g:13},{a:'Fresas',q:80,cal:26,p:1,c:6,g:0},{a:'Nueces',q:15,cal:98,p:2,c:2,g:10}],t:5}
],
media_manana:[
{n:'Frutos secos mixtos',ing:[{a:'Almendras',q:20,cal:116,p:4,c:2,g:10},{a:'Nueces',q:15,cal:98,p:2,c:2,g:10},{a:'Avellanas',q:10,cal:60,p:1,c:1,g:6}],t:2},
{n:'Manzana con mantequilla de almendra',ing:[{a:'Manzana',q:150,cal:78,p:0,c:21,g:0},{a:'Mantequilla de almendra',q:20,cal:128,p:4,c:4,g:11}],t:3},
{n:'Palitos de zanahoria con guacamole',ing:[{a:'Zanahoria',q:100,cal:41,p:1,c:10,g:0},{a:'Aguacate',q:60,cal:97,p:1,c:5,g:9}],t:5},
{n:'Huevos duros',ing:[{a:'Huevos',q:100,cal:143,p:12,c:1,g:10}],t:3},
{n:'Plátano con crema de cacahuete',ing:[{a:'Plátano',q:100,cal:89,p:1,c:23,g:0},{a:'Crema de cacahuete',q:15,cal:88,p:4,c:3,g:8}],t:3},
{n:'Uvas y almendras',ing:[{a:'Uvas',q:100,cal:69,p:1,c:18,g:0},{a:'Almendras',q:15,cal:87,p:3,c:2,g:8}],t:2},
{n:' sticks de apio con tahini',ing:[{a:'Apio',q:100,cal:14,p:1,c:3,g:0},{a:'Tahini',q:15,cal:89,p:3,c:3,g:8}],t:3}
],
comida:[
{n:'Pechuga de pollo a la plancha con boniato y brócoli',ing:[{a:'Pechuga de pollo',q:180,cal:198,p:37,c:0,g:4},{a:'Boniato',q:200,cal:172,p:3,c:40,g:0},{a:'Brócoli',q:100,cal:35,p:3,c:4,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:20},
{n:'Salmón al horno con patata y espárragos',ing:[{a:'Salmón',q:150,cal:280,p:30,c:0,g:18},{a:'Patata',q:150,cal:115,p:3,c:27,g:0},{a:'Espárragos',q:100,cal:20,p:2,c:4,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:25},
{n:'Ensalada de atún, huevo y aguacate',ing:[{a:'Atún al natural',q:120,cal:139,p:31,c:0,g:1},{a:'Huevo cocido',q:50,cal:72,p:6,c:0,g:5},{a:'Aguacate',q:60,cal:97,p:1,c:5,g:9},{a:'Lechuga',q:60,cal:10,p:1,c:2,g:0},{a:'Tomate',q:80,cal:14,p:1,c:3,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:12},
{n:'Muslo de pollo al horno con calabaza asada',ing:[{a:'Muslo de pollo sin piel',q:180,cal:216,p:34,c:0,g:10},{a:'Calabaza',q:200,cal:45,p:1,c:11,g:0},{a:'Cebolla',q:60,cal:24,p:1,c:6,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:35},
{n:'Merluza al horno con boniato y limón',ing:[{a:'Merluza',q:200,cal:148,p:32,c:0,g:2},{a:'Boniato',q:180,cal:155,p:3,c:36,g:0},{a:'Limón',q:30,cal:8,p:0,c:3,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:25},
{n:'Carne picada con boniato al horno',ing:[{a:'Carne picada de ternera',q:150,cal:250,p:26,c:0,g:16},{a:'Boniato',q:180,cal:155,p:3,c:36,g:0},{a:'Espinaca',q:60,cal:14,p:2,c:2,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:30},
{n:'Ternera a la plancha con pimientos asados',ing:[{a:'Lomo de ternera',q:150,cal:250,p:26,c:0,g:16},{a:'Pimiento rojo',q:100,cal:31,p:1,c:6,g:0},{a:'Pimiento verde',q:80,cal:20,p:1,c:4,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:20},
{n:'Bowl de pollo, boniato y col morada',ing:[{a:'Pechuga de pollo',q:150,cal:165,p:31,c:0,g:4},{a:'Boniato',q:150,cal:130,p:2,c:30,g:0},{a:'Col morada',q:80,cal:22,p:1,c:5,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:20}
],
merienda:[
{n:'Batido de proteína paleo con plátano',ing:[{a:'Proteína paleo',q:30,cal:120,p:24,c:3,g:1},{a:'Plátano',q:100,cal:89,p:1,c:23,g:0},{a:'Leche de coco',q:150,cal:75,p:1,c:2,g:8}],t:5},
{n:'Hummus de boniato con palitos de zanahoria',ing:[{a:'Boniato',q:80,cal:69,p:1,c:16,g:0},{a:'Tahini',q:15,cal:89,p:3,c:3,g:8},{a:'Zanahoria',q:80,cal:33,p:1,c:8,g:0}],t:8},
{n:'Fruta con crema de cacahuete',ing:[{a:'Manzana',q:120,cal:62,p:0,c:17,g:0},{a:'Crema de cacahuete',q:20,cal:118,p:5,c:4,g:10}],t:3},
{n:'Guacamole con palitos de apio',ing:[{a:'Aguacate',q:80,cal:130,p:2,c:7,g:12},{a:'Tomate',q:40,cal:7,p:0,c:2,g:0},{a:'Apio',q:80,cal:11,p:1,c:2,g:0}],t:5},
{n:'Huevos revueltos con espinaca',ing:[{a:'Huevos',q:100,cal:143,p:12,c:1,g:10},{a:'Espinaca',q:40,cal:10,p:1,c:1,g:0},{a:'AOVE',q:5,cal:45,p:0,c:0,g:5}],t:8},
{n:'Mixed berries con almendras',ing:[{a:'Frutos rojos',q:100,cal:40,p:1,c:9,g:0},{a:'Almendras',q:15,cal:87,p:3,c:2,g:8}],t:3}
],
cena:[
{n:'Sopa de verduras con huevo pochado',ing:[{a:'Caldo de huesos',q:300,cal:30,p:6,c:0,g:1},{a:'Zanahoria',q:60,cal:25,p:1,c:6,g:0},{a:'Calabacín',q:60,cal:10,p:1,c:2,g:0},{a:'Huevo',q:50,cal:72,p:6,c:0,g:5}],t:15},
{n:'Ensalada de garbanzos paleo con verduras',ing:[{a:'Boniato',q:100,cal:86,p:1,c:20,g:0},{a:'Pimiento rojo',q:80,cal:25,p:1,c:5,g:0},{a:'Pepino',q:80,cal:13,p:1,c:3,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:10},
{n:'Tortilla francesa con ensalada',ing:[{a:'Huevos',q:120,cal:172,p:14,c:1,g:12},{a:'Lechuga',q:60,cal:10,p:1,c:2,g:0},{a:'Tomate',q:80,cal:14,p:1,c:3,g:0},{a:'AOVE',q:5,cal:45,p:0,c:0,g:5}],t:10},
{n:'Pescado blanco al horno con verduras',ing:[{a:'Merluza',q:180,cal:133,p:29,c:0,g:2},{a:'Brócoli',q:100,cal:35,p:3,c:4,g:0},{a:'Cebolla',q:40,cal:16,p:0,c:4,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:20},
{n:'Revuelto de setas con espárragos',ing:[{a:'Huevos',q:100,cal:143,p:12,c:1,g:10},{a:'Champiñones',q:100,cal:22,p:3,c:3,g:0},{a:'Espárragos',q:80,cal:16,p:2,c:3,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:12},
{n:'Crema de calabaza con semillas',ing:[{a:'Calabaza',q:200,cal:45,p:1,c:11,g:0},{a:'Cebolla',q:30,cal:12,p:0,c:3,g:0},{a:'Semillas de calabaza',q:10,cal:56,p:3,c:1,g:5}],t:15},
{n:'Bowl de ternera picada y verduras salteadas',ing:[{a:'Carne picada de ternera',q:120,cal:200,p:21,c:0,g:13},{a:'Brócoli',q:80,cal:28,p:2,c:3,g:0},{a:'Pimiento',q:80,cal:25,p:1,c:5,g:0},{a:'AOVE',q:10,cal:90,p:0,c:0,g:10}],t:15}
],
post_entreno:[
{n:'Batido de recuperación: plátano, proteína y coco',ing:[{a:'Plátano',q:120,cal:107,p:1,c:27,g:0},{a:'Proteína paleo',q:30,cal:120,p:24,c:3,g:1},{a:'Leche de coco',q:150,cal:75,p:1,c:2,g:8}],t:5},
{n:'Boniato asado con canela y nueces',ing:[{a:'Boniato',q:150,cal:130,p:2,c:30,g:0},{a:'Nueces',q:15,cal:98,p:2,c:2,g:10},{a:'Canela',q:2,cal:5,p:0,c:1,g:0}],t:5},
{n:'Fruta fresca con almendras',ing:[{a:'Plátano',q:80,cal:71,p:1,c:18,g:0},{a:'Almendras',q:15,cal:87,p:3,c:2,g:8}],t:3}
]
};

/* Generador de plan semanal Paleo */
function genDietaPaleo(userData){
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
      var meal=pick(PALEO_MEALS[slot]);
      var targetCal=Math.round(calDia*sp.pct[slot]);
      var scaled=scaleMeal(meal,targetCal);
      scaled.tipo=labels[slot];
      comidas.push(scaled);
    });
    if(entrenando){
      var postMeal=pick(PALEO_MEALS.post_entreno);
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

/* Lista de la compra Paleo */
function genListaCompraPaleo(plan){
  var cats={'Carnes y aves':{},'Pescados y mariscos':{},'Huevos':{},'Frutas':{},'Verduras y hortalizas':{},'Tubérculos':{},'Frutos secos y semillas':{},'Otros':{}};
  var catMap={
'Pechuga de pollo':'Carnes y aves','Muslo de pollo sin piel':'Carnes y aves','Lomo de ternera':'Carnes y aves','Carne picada de ternera':'Carnes y aves','Chorizo':'Carnes y aves','Pavo en lonchas':'Carnes y aves','Jamón serrano':'Carnes y aves','Salmón ahumado':'Carnes y aves',
'Salmón':'Pescados y mariscos','Merluza':'Pescados y mariscos','Atún al natural':'Pescados y mariscos',
'Huevos':'Huevos','Huevo cocido':'Huevos','Huevo frito':'Huevos','Huevo':'Huevos',
'Plátano':'Frutas','Manzana':'Frutas','Fresas':'Frutas','Frutos rojos':'Frutas','Mango':'Frutas','Uvas':'Frutas','Limón':'Frutas',
'Espinaca':'Verduras y hortalizas','Brócoli':'Verduras y hortalizas','Calabacín':'Verduras y hortalizas','Pimiento':'Verduras y hortalizas','Pimiento rojo':'Verduras y hortalizas','Pimiento verde':'Verduras y hortalizas','Cebolla':'Verduras y hortalizas','Champiñones':'Verduras y hortalizas','Zanahoria':'Verduras y hortalizas','Lechuga':'Verduras y hortalizas','Tomate':'Verduras y hortalizas','Tomate natural':'Verduras y hortalizas','Calabaza':'Verduras y hortalizas','Espárragos':'Verduras y hortalizas','Pepino':'Verduras y hortalizas','Col morada':'Verduras y hortalizas','Apio':'Verduras y hortalizas',
'Boniato':'Tubérculos','Patata':'Tubérculos',
'Nueces':'Frutos secos y semillas','Almendras':'Frutos secos y semillas','Avellanas':'Frutos secos y semillas','Semillas de chía':'Frutos secos y semillas','Semillas de calabaza':'Frutos secos y semillas','Mantequilla de almendra':'Frutos secos y semillas','Crema de cacahuete':'Frutos secos y semillas',
'AOVE':'Otros','Aguacate':'Otros','Aceitunas':'Otros','Leche de coco':'Otros','Proteína paleo':'Otros','Tahini':'Otros','Caldo de huesos':'Otros','Canela':'Otros','Tomate triturado':'Otros','Hummus de boniato':'Otros','Avena paleo (almendra)':'Otros'
  };
  plan.forEach(function(d){d.comidas.forEach(function(c){c.ing.forEach(function(ing){
    var cat=catMap[ing.a]||'Otros';
    if(!cats[cat][ing.a])cats[cat][ing.a]={total:0};
    cats[cat][ing.a].total+=ing.q;
  });});});
  Object.keys(cats).forEach(function(cat){if(!Object.keys(cats[cat]).length)delete cats[cat];});
  return cats;
}
