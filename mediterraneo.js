/* ===== Motor de Dieta Mediterránea Personalizada ===== */

/* 1. Cálculo de necesidades energéticas */
function calcBMR(sexo,peso,altura,edad){
  if(sexo==='mujer')return 10*peso+6.25*altura-5*edad-161;
  return 10*peso+6.25*altura-5*edad+5;
}
function activityMultiplier(nivel,diasEntreno,duracionEntreno,tipoEntreno){
  let base={sedentario:1.2,ligero:1.375,moderado:1.55,intenso:1.725}[nivel]||1.55;
  const horasSemana=(diasEntreno*duracionEntreno)/60;
  let extra=0;
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
function calorieRange(avg){
  const d=Math.round(avg*0.05);
  return{min:avg-d,max:avg+d};
}
function calcMacros(peso,objetivo,tipoEntreno,diasEntreno){
  let pGr=peso*2;
  if(objetivo==='ganancia')pGr=peso*2.2;
  if(objetivo==='perdida')pGr=peso*2.4;
  if(tipoEntreno==='gimnasio'&&objetivo==='ganancia')pGr=peso*2.3;
  return{p:pGr};
}
function distributeMacros(calObj,pGr,objetivo,esEntreno){
  const pCal=pGr*4;
  let grasaPct=0.30;
  if(objetivo==='perdida')grasaPct=0.28;
  if(objetivo==='ganancia')grasaPct=0.25;
  const grCal=calObj*grasaPct;
  const gr=Math.round(grCal/9);
  const calResta=calObj-pCal-grCal;
  const c=Math.round(Math.max(calResta/4,100)/5)*5;
  return{p:Math.round(pGr),c:c,g:gr};
}

/* 2. Base de datos de comidas mediterráneas */
const MED_MEALS={
desayuno:[
{n:'Tostadas de pan integral con tomate y AOVE',ing:[{a:'Pan integral',q:80,c:210,p:8,c:36,g:3},{a:'Tomate natural',q:100,c:18,p:1,c:4,g:0},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:5},
{n:'Huevos revueltos con espinaca y champiñones',ing:[{a:'Huevos',q:120,c:172,p:14,c:1,g:12},{a:'Espinaca',q:50,c:12,p:2,c:2,g:0},{a:'Champiñones',q:50,c:11,p:1,c:2,g:0},{a:'AOVE',q:5,c:45,p:0,c:0,g:5}],t:8},
{n:'Avena con yogur griego y frutos rojos',ing:[{a:'Avena en copos',q:40,c:152,p:5,c:27,g:3},{a:'Yogur griego',q:150,c:90,p:15,c:5,g:2},{a:'Frutos rojos',q:80,c:32,p:1,c:7,g:0}],t:5},
{n:'Tortilla de espinacas y cebolla',ing:[{a:'Huevos',q:150,c:215,p:18,c:1,g:15},{a:'Espinaca',q:60,c:14,p:2,c:2,g:0},{a:'Cebolla',q:30,c:12,p:0,c:3,g:0},{a:'AOVE',q:5,c:45,p:0,c:0,g:5}],t:10},
{n:'Smoothie de plátano, avena y leche de almendra',ing:[{a:'Plátano',q:120,c:107,p:1,c:27,g:0},{a:'Avena',q:30,c:114,p:4,c:20,g:2},{a:'Leche de almendra',q:200,c:30,p:1,c:1,g:2}],t:5},
{n:'Yogur griego con miel y nueces',ing:[{a:'Yogur griego',q:200,c:120,p:20,c:6,g:3},{a:'Miel',q:15,c:46,p:0,c:12,g:0},{a:'Nueces',q:20,c:131,p:3,c:3,g:13}],t:3},
{n:'Pan de centeno con aguacate y huevo',ing:[{a:'Pan de centeno',q:60,c:160,p:5,c:32,g:2},{a:'Aguacate',q:70,c:114,p:1,c:6,g:11},{a:'Huevo cocido',q:50,c:72,p:6,c:0,g:5}],t:8},
{n:'Pudín de chía con leche de coco y mango',ing:[{a:'Semillas de chía',q:25,c:121,p:4,c:10,g:8},{a:'Leche de coco',q:150,c:45,p:1,c:2,g:4},{a:'Mango',q:80,c:48,p:1,c:12,g:0}],t:5}
],
media_manana:[
{n:'Manzana con mantequilla de almendra',ing:[{a:'Manzana',q:150,c:78,p:0,c:21,g:0},{a:'Mantequilla de almendra',q:20,c:128,p:4,c:4,g:11}],t:3},
{n:'Frutos secos mixtos',ing:[{a:'Almendras',q:15,c:87,p:3,c:2,g:8},{a:'Nueces',q:15,c:98,p:2,c:2,g:10},{a:'Avellanas',q:15,c:90,p:2,c:2,g:9}],t:2},
{n:'Yogur griego con fruta',ing:[{a:'Yogur griego',q:125,c:75,p:13,c:4,g:2},{a:'Fresas',q:80,c:26,p:1,c:6,g:0}],t:3},
{n:'Hummus con palitos de zanahoria',ing:[{a:'Hummus',q:60,c:106,p:5,c:8,g:6},{a:'Zanahoria',q:80,c:33,p:1,c:8,g:0}],t:5},
{n:'Queso fresco con tomate',ing:[{a:'Queso fresco',q:80,c:98,p:12,c:1,g:5},{a:'Tomate',q:80,c:14,p:1,c:3,g:0}],t:5}
],
comida:[
{n:'Pechuga de pollo a la plancha con quinoa y verduras',ing:[{a:'Pechuga de pollo',q:150,c:165,p:31,c:0,g:4},{a:'Quinoa cocida',q:130,c:155,p:6,c:27,g:2},{a:'Pimiento',q:80,c:25,p:1,c:5,g:0},{a:'Calabacín',q:80,c:14,p:1,c:3,g:0},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:15},
{n:'Salmón al horno con patata y espárragos',ing:[{a:'Salmón',q:150,c:280,p:30,c:0,g:18},{a:'Patata',q:150,c:115,p:3,c:27,g:0},{a:'Espárragos',q:100,c:20,p:2,c:4,g:0},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:25},
{n:'Ensalada mediterránea con atún y huevo',ing:[{a:'Atún al natural',q:100,c:116,p:26,c:0,g:1},{a:'Huevo cocido',q:50,c:72,p:6,c:0,g:5},{a:'Lechuga',q:60,c:10,p:1,c:2,g:0},{a:'Tomate',q:100,c:18,p:1,c:4,g:0},{a:'Aceitunas',q:20,c:26,p:0,c:1,g:2},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:10},
{n:'Lentejas guisadas con verduras',ing:[{a:'Lentejas cocidas',q:200,c:232,p:18,c:32,g:1},{a:'Zanahoria',q:60,c:25,p:1,c:6,g:0},{a:'Cebolla',q:40,c:16,p:0,c:4,g:0},{a:'Tomate triturado',q:100,c:32,p:2,c:6,g:0},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:30},
{n:'Merluza al horno con calabacín y limón',ing:[{a:'Merluza',q:200,c:148,p:32,c:0,g:2},{a:'Calabacín',q:120,c:20,p:2,c:4,g:0},{a:'Limón',q:30,c:8,p:0,c:3,g:0},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:20},
{n:'Pasta integral con verduras y parmesano',ing:[{a:'Pasta integral cocida',q:130,c:174,p:7,c:34,g:2},{a:'Calabacín',q:80,c:14,p:1,c:3,g:0},{a:'Tomate cherry',q:80,c:14,p:1,c:3,g:0},{a:'Parmesano',q:15,c:59,p:5,c:0,g:4},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:15},
{n:'Arroz integral con verduras y huevo',ing:[{a:'Arroz integral cocido',q:130,c:150,p:3,c:32,g:1},{a:'Brócoli',q:80,c:28,p:2,c:3,g:0},{a:'Huevo frito',q:50,c:90,p:6,c:0,g:7},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:20},
{n:'Pollo al horno con cebolla y hierbas',ing:[{a:'Muslo de pollo sin piel',q:150,c:180,p:28,c:0,g:8},{a:'Cebolla',q:80,c:32,p:1,c:8,g:0},{a:'Patata',q:120,c:92,p:2,c:21,g:0},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:35}
],
merienda:[
{n:'Tostada integral con pavo y tomate',ing:[{a:'Pan integral',q:40,c:105,p:4,c:18,g:2},{a:'Pavo en lonchas',q:40,c:44,p:8,c:1,g:1},{a:'Tomate',q:50,c:9,p:0,c:2,g:0}],t:5},
{n:'Batido de proteína con plátano',ing:[{a:'Proteína en polvo',q:30,c:120,p:24,c:3,g:1},{a:'Plátano',q:100,c:89,p:1,c:23,g:0},{a:'Leche de almendra',q:200,c:30,p:1,c:1,g:2}],t:5},
{n:'Guisantes con jamón',ing:[{a:'Guisantes',q:100,c:81,p:5,c:14,g:0},{a:'Jamón serrano',q:30,c:78,p:10,c:1,g:4}],t:5},
{n:'Edamame con sal',ing:[{a:'Edamame',q:120,c:142,p:12,c:10,g:6}],t:3},
{n:'Queso fresco con fruta',ing:[{a:'Queso fresco',q:100,c:98,p:12,c:1,g:5},{a:'Plátano',q:80,c:71,p:1,c:18,g:0}],t:3}
],
cena:[
{n:'Sopa de verduras con huevo',ing:[{a:'Caldo de verduras',q:300,c:24,p:2,c:4,g:0},{a:'Zanahoria',q:60,c:25,p:1,c:6,g:0},{a:'Calabacín',q:60,c:10,p:1,c:2,g:0},{a:'Huevo cocido',q:50,c:72,p:6,c:0,g:5}],t:15},
{n:'Ensalada de garbanzos con verduras',ing:[{a:'Garbanzos cocidos',q:150,c:246,p:13,c:34,g:4},{a:'Pimiento rojo',q:80,c:25,p:1,c:5,g:0},{a:'Pepino',q:80,c:13,p:1,c:3,g:0},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:10},
{n:'Tortilla francesa con ensalada',ing:[{a:'Huevos',q:120,c:172,p:14,c:1,g:12},{a:'Lechuga',q:60,c:10,p:1,c:2,g:0},{a:'Tomate',q:80,c:14,p:1,c:3,g:0},{a:'AOVE',q:5,c:45,p:0,c:0,g:5}],t:10},
{n:'Pescado blanco al horno con verduras',ing:[{a:'Merluza',q:150,c:111,p:24,c:0,g:2},{a:'Brócoli',q:100,c:35,p:3,c:4,g:0},{a:'Cebolla',q:40,c:16,p:0,c:4,g:0},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:20},
{n:'Revuelto de huevos con setas',ing:[{a:'Huevos',q:120,c:172,p:14,c:1,g:12},{a:'Champiñones',q:100,c:22,p:3,c:3,g:0},{a:'AOVE',q:5,c:45,p:0,c:0,g:5}],t:10},
{n:'Ensalada templada de atún',ing:[{a:'Atún al natural',q:100,c:116,p:26,c:0,g:1},{a:'Judías verdes',q:80,c:25,p:2,c:5,g:0},{a:'Huevo cocido',q:50,c:72,p:6,c:0,g:5},{a:'AOVE',q:10,c:90,p:0,c:0,g:10}],t:10},
{n:'Crema de calabaza con semillas',ing:[{a:'Calabaza',q:200,c:45,p:1,c:11,g:0},{a:'Cebolla',q:30,c:12,p:0,c:3,g:0},{a:'Semillas de calabaza',q:10,c:56,p:3,c:1,g:5}],t:15}
],
post_entreno:[
{n:'Batido de recuperación: plátano, proteína y leche',ing:[{a:'Plátano',q:120,c:107,p:1,c:27,g:0},{a:'Proteína en polvo',q:30,c:120,p:24,c:3,g:1},{a:'Leche',q:250,c:130,p:8,c:12,g:5}],t:5},
{n:'Yogur griego con miel y fruta',ing:[{a:'Yogur griego',q:200,c:120,p:20,c:6,g:3},{a:'Miel',q:15,c:46,p:0,c:12,g:0},{a:'Plátano',q:80,c:71,p:1,c:18,g:0}],t:3}
]
};

/* 3. Generador de plan semanal */
function genDietaMediterranea(userData){
  const{edad,sexo,peso,altura,objetivo,tipoEntreno,diasEntreno,duracionEntreno,numComidas,alergias,noComer,actividad}=userData;
  const bmr=calcBMR(sexo,peso,altura,edad);
  const mult=activityMultiplier(actividad,diasEntreno,duracionEntreno,tipoEntreno);
  const tdee=calcTDEE(bmr,mult);
  const calAvg=adjustCalories(tdee,objetivo);
  const range=calorieRange(calAvg);
  const macros=calcMacros(peso,objetivo,tipoEntreno,diasEntreno);
  const dias=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const esEntreno=i=>i<diasEntreno;
  const plan=[];
  let totalCal=0,totalP=0,totalC=0,totalG=0;
  for(let i=0;i<7;i++){
    const entrenando=esEntreno(i);
    const calDia=entrenando?Math.round(calAvg*(1+0.04)):Math.round(calAvg*(1-0.03));
    const macrosDia=distributeMacros(calDia,macros.p,objetivo,entrenando);
    const comidas=[];
    const usados=new Set();
    function pick(pool){
      const disp=pool.filter(m=>!usados.has(m.n));
      const src=disp.length?disp:pool;
      const m=Math.floor(Math.random()*src.length);
      usados.add(src[m].n);
      return JSON.parse(JSON.stringify(src[m]));
    }
    if(numComidas>=5)comidas.push({tipo:'Desayuno',...pick(MED_MEALS.desayuno)});
    if(numComidas===6)comidas.push({tipo:'Media mañana',...pick(MED_MEALS.media_manana)});
    if(numComidas===4||numComidas===5||numComidas===6)comidas.push({tipo:'Comida',...pick(MED_MEALS.comida)});
    if(numComidas===5)comidas.push({tipo:'Merienda',...pick(MED_MEALS.merienda)});
    comidas.push({tipo:'Cena',...pick(MED_MEALS.cena)});
    if(entrenando&&numComidas<6)comidas.push({tipo:'Post-entreno',...pick(MED_MEALS.post_entreno)});
    const calReal=comidas.reduce((s,c)=>s+c.ing.reduce((si,x)=>si+x.c,0),0);
    const pReal=Math.round(comidas.reduce((s,c)=>s+c.ing.reduce((si,x)=>si+x.p,0),0));
    const cReal=Math.round(comidas.reduce((s,c)=>s+c.ing.reduce((si,x)=>si+x.c,0),0));
    const gReal=Math.round(comidas.reduce((s,c)=>s+c.ing.reduce((si,x)=>si+x.g,0),0));
    totalCal+=calReal;totalP+=pReal;totalC+=cReal;totalG+=gReal;
    plan.push({dia:dias[i],entrenando,calObj:calDia,macros:macrosDia,comidas,calReal,pReal,cReal,gReal});
  }
  return{
    usuario:userData,
    bmr:Math.round(bmr),
    tdee,
    calAvg,
    range,
    macros:{p:macros.p,c:Math.round(totalC/7),g:Math.round(totalG/7)},
    objetivo,
    tipoEntreno,
    numComidas,
    plan,
    promedio:{cal:Math.round(totalCal/7),p:Math.round(totalP/7),c:Math.round(totalC/7),g:Math.round(totalG/7)}
  };
}

/* 4. Lista de la compra */
function genListaCompra(plan){
  const cats={'Frutas y verduras':{},'Carnes y aves':{},'Pescados y mariscos':{},'Huevos y lácteos':{},'Cereales y carbohidratos':{},'Frutos secos y semillas':{},'Aceites y grasas':{},'Otros':{}};
  const catMap={
    'Tomate':'Frutas y verduras','Lechuga':'Frutas y verduras','Espinaca':'Frutas y verduras','Calabacín':'Frutas y verduras','Brócoli':'Frutas y verduras','Pimiento':'Frutas y verduras','Cebolla':'Frutas y verduras','Zanahoria':'Frutas y verduras','Champiñones':'Frutas y verduras','Patata':'Frutas y verduras','Calabaza':'Frutas y verduras','Pepino':'Frutas y verduras','Espárragos':'Frutas y verduras','Judías verdes':'Frutas y verduras','Guisantes':'Frutas y verduras','Plátano':'Frutas y verduras','Manzana':'Frutas y verduras','Fresas':'Frutas y verduras','Mango':'Frutas y verduras','Frutos rojos':'Frutas y verduras','Limón':'Frutas y verduras','Tomate cherry':'Frutas y verduras',
    'Pechuga de pollo':'Carnes y aves','Muslo de pollo sin piel':'Carnes y aves','Pavo en lonchas':'Carnes y aves','Jamón serrano':'Carnes y aves',
    'Salmón':'Pescados y mariscos','Merluza':'Pescados y mariscos','Atún al natural':'Pescados y mariscos','Lubina':'Pescados y mariscos',
    'Huevos':'Huevos y lácteos','Huevo cocido':'Huevos y lácteos','Huevo frito':'Huevos y lácteos','Yogur griego':'Huevos y lácteos','Queso fresco':'Huevos y lácteos','Parmesano':'Huevos y lácteos','Leche':'Huevos y lácteos','Leche de almendra':'Huevos y lácteos','Leche de coco':'Huevos y lácteos',
    'Pan integral':'Cereales y carbohidratos','Pan de centeno':'Cereales y carbohidratos','Avena en copos':'Cereales y carbohidratos','Pasta integral cocida':'Cereales y carbohidratos','Arroz integral cocido':'Cereales y carbohidratos','Quinoa cocida':'Cereales y carbohidratos','Lentejas cocidas':'Cereales y carbohidratos','Garbanzos cocidos':'Cereales y carbohidratos',
    'Nueces':'Frutos secos y semillas','Almendras':'Frutos secos y semillas','Avellanas':'Frutos secos y semillas','Semillas de chía':'Frutos secos y semillas','Semillas de calabaza':'Frutos secos y semillas','Mantequilla de almendra':'Frutos secos y semillas',
    'AOVE':'Aceites y grasas','Aceitunas':'Aceites y grasas',
    'Hummus':'Otros','Proteína en polvo':'Otros','Miel':'Otros','Tomate triturado':'Otros','Caldo de verduras':'Otros','Edamame':'Otros'
  };
  plan.forEach(d=>d.comidas.forEach(c=>c.ing.forEach(ingrediente=>{
    const cat=catMap[ingrediente.a]||'Otros';
    if(!cats[cat][ingrediente.a])cats[cat][ingrediente.a]={total:0,unidades:[]};
    cats[cat][ingrediente.a].total+=ingrediente.q;
    cats[cat][ingrediente.a].unidades.push({dia:d.dia,q:ingrediente.q});
  })));
  Object.keys(cats).forEach(cat=>{if(Object.keys(cats[cat]).length===0)delete cats[cat];});
  return cats;
}
