/*  vegano.js — Dieta Vegana con cálculo real
    Depende de nutricion.js (NUT_DB, buildDietPlan, nut, etc.)    */

const VEGAN_MEALS={
desayuno:[
{n:'Avena con bebida de soja y frutos rojos',ing:[nut('Avena',50),nut('Bebida de soja',200),nut('Frutos rojos',80),nut('Chía',10)],t:5},
{n:'Tofu revueldo con espárragos y tomate',ing:[nut('Tofu firme',150),nut('Espárragos',80),nut('Tomate cherry',60),nut('Aceite de oliva',10),nut('Cúrcuma',2)],t:12},
{n:'Tostadas de pan integral con hummus y aguacate',ing:[nut('Pan integral',80),nut('Hummus',40),nut('Aguacate',60),nut('Tomate cherry',40)],t:5},
{n:'Batido verde de espinaca y plátano',ing:[nut('Espinaca',60),nut('Plátano',120),nut('Bebida de soja',250),nut('Avena',30)],t:5},
{n:'Pudín de chía con leche de coco y mango',ing:[nut('Chía',40),nut('Leche de coco',200),nut('Mango',100),nut('Dátiles',20)],t:5},
{n:'Smoothie bowl de açaí con granola',ing:[nut('Açaí',100),nut('Plátano congelado',100),nut('Granola',30),nut('Frutos rojos',50)],t:5},
{n:'Pancakes de avena con sirope de arce',ing:[nut('Avena',60),nut('Bebida de soja',100),nut('Sirope de arce',15),nut('Frutos rojos',50)],t:15},
{n:'Tostadas con mantequilla de cacahuete y plátano',ing:[nut('Pan integral',80),nut('Mantequilla de cacahuete',25),nut('Plátano',80)],t:5},
{n:'Avena con leche de almendra y frutos rojos',ing:[nut('Avena',50),nut('Leche de almendra',200),nut('Frutos rojos',80)],t:5},
{n:'Batido verde de espinaca, plátano y leche de coco',ing:[nut('Espinaca',60),nut('Plátano',120),nut('Leche de coco',250)],t:5},
{n:'Tostadas integrales con aguacate y semillas',ing:[nut('Pan integral',80),nut('Aguacate',60),nut('Semillas de sésamo',10)],t:5},
{n:'Huevos de tofu con especias y aguacate',ing:[nut('Tofu firme',150),nut('Aguacate',80),nut('Cúrcuma',2)],t:12},
{n:'Smoothie bowl de açaí con granola vegana',ing:[nut('Açaí',100),nut('Plátano congelado',100),nut('Granola',30),nut('Frutos rojos',50)],t:5}
],
media_mañana:[
{n:'Fruta de temporada',ing:[nut('Manzana',150)],t:1},
{n:'Frutos secos mixtos',ing:[nut('Nueces mixtas',25),nut('Almendras',10)],t:1},
{n:'Hummus con palitos de zanahoria',ing:[nut('Hummus',60),nut('Zanahoria',80)],t:3},
{n:'Tostada con crema de cacahuete',ing:[nut('Pan integral',40),nut('Crema de cacahuete',20)],t:2},
{n:'Yogur vegetal con fruta',ing:[nut('Yogur vegetal',150),nut('Fresas',60)],t:2},
{n:'Barrita de frutos secos',ing:[nut('Nueces mixtas',25),nut('Pasas',15)],t:1},
{n:'Hummus y pan pita',ing:[nut('Hummus',60),nut('Pan pita',60)],t:3}
],
comida:[
{n:'Bowl de quinoa con garbanzos y verduras asadas',ing:[nut('Quinoa',70),nut('Garbanzos',100),nut('Calabaza',100),nut('Pimiento rojo',60),nut('Aceite de oliva',10)],t:25},
{n:'Curry de garbanzos con espinaca y arroz',ing:[nut('Garbanzos',100),nut('Espinaca',80),nut('Arroz jazmín',70),nut('Leche de coco',100),nut('Aceite de oliva',5)],t:25},
{n:'Tacos de frijoles negros con guacamole',ing:[nut('Alubias negras',100),nut('Tortillas de maíz',80),nut('Guacamole',60),nut('Tomate cherry',40),nut('Cilantro',5)],t:15},
{n:'Lentejas guisadas con verduras y arroz',ing:[nut('Lentejas',80),nut('Zanahoria',40),nut('Puerro',30),nut('Arroz jazmín',60),nut('Aceite de oliva',5)],t:25},
{n:'Ensalada de tempeh con aguacate y semillas',ing:[nut('Tempeh',120),nut('Aguacate',60),nut('Lechuga',60),nut('Tomate',60),nut('Pipas de girasol',15),nut('Aceite de oliva',10)],t:15},
{n:'Pasta integral con boloñesa de lentejas',ing:[nut('Pasta integral',70),nut('Lentejas rojas',80),nut('Salsa de tomate',80),nut('Cebolla',30),nut('Ajo',5),nut('Aceite de oliva',10)],t:25},
{n:'Bowl de arroz con tofu teriyaki y verduras',ing:[nut('Arroz jazmín',70),nut('Tofu firme',150),nut('Brócoli',80),nut('Zanahoria',40),nut('Salsa teriyaki',15)],t:20},
{n:'Berberecho de garbanzos con espinaca',ing:[nut('Garbanzos',100),nut('Espinaca',80),nut('Tomate natural',80),nut('Cebolla',30),nut('Aceite de oliva',10)],t:20},
{n:'Ensalada de lentejas con pimiento y cebolla',ing:[nut('Lentejas',100),nut('Pimiento verde',60),nut('Cebolla',30),nut('Aceite de oliva',10)],t:15},
{n:'Bowl de arroz con tofu revuelto y verduras',ing:[nut('Arroz jazmín',70),nut('Tofu firme',150),nut('Pimiento verde',60),nut('Calabacín',60),nut('Aceite de oliva',10)],t:20},
{n:'Paella de verduras y marisco vegetal',ing:[nut('Arroz jazmín',80),nut('Pimiento verde',40),nut('Calabacín',40),nut('Aceite de oliva',10)],t:25},
{n:'Pasta integral con salsa de tomate y alubias',ing:[nut('Pasta integral',80),nut('Salsa de tomate',80),nut('Alubias rojas',80),nut('Cebolla',30),nut('Aceite de oliva',10)],t:25},
{n:'Tempeh a la plancha con ensalada y aguacate',ing:[nut('Tempeh',120),nut('Aguacate',60),nut('Lechuga',60),nut('Tomate',60),nut('Aceite de oliva',10)],t:15}
],
merienda:[
{n:'Edamame con sal',ing:[nut('Edamame',100),nut('Sal',1)],t:3},
{n:'Hummus con pan pita',ing:[nut('Hummus',60),nut('Pan pita',60)],t:3},
{n:'Fruta con crema de cacahuete',ing:[nut('Manzana',120),nut('Crema de cacahuete',20)],t:2},
{n:'Batido de proteína vegetal',ing:[nut('Proteína vegetal en polvo',30),nut('Bebida de soja',250),nut('Plátano',100)],t:3},
{n:'Nueces y fruta seca',ing:[nut('Nueces mixtas',25),nut('Pasas',15)],t:1},
{n:'Tostada con tahini y plátano',ing:[nut('Pan integral',40),nut('Tahini',15),nut('Plátano',60)],t:3},
{n:'Fruta con crema de cacahuete',ing:[nut('Manzana',120),nut('Crema de cacahuete',20)],t:2},
{n:'Crema de cacahuete',ing:[nut('Plátano',120),nut('Crema de cacahuete',30),nut('Fresas',80)],t:1}
],
cena:[
{n:'Tofu salteado con verduras y salsa de soja',ing:[nut('Tofu firme',150),nut('Pimiento verde',60),nut('Calabacín',60),nut('Champiñones',40),nut('Salsa de soja',10),nut('Aceite de oliva',10)],t:18},
{n:'Estofado de verduras con tempeh',ing:[nut('Tempeh',100),nut('Zanahoria',60),nut('Calabaza',80),nut('Puerro',40),nut('Caldo de verduras',200),nut('Aceite de oliva',10)],t:25},
{n:'Crema de calabaza con semillas',ing:[nut('Calabaza',200),nut('Puerro',40),nut('Leche de coco',100),nut('Pipas de calabaza',15),nut('Aceite de oliva',5)],t:25},
{n:'Lasaña de berenjenas con bechamel de anacardos',ing:[nut('Berenjena',150),nut('Salsa de tomate',100),nut('Nueces de la India',30),nut('Leche de almendra',100),nut('Pasta integral',40)],t:35},
{n:'Fajitas de verduras con guacamole',ing:[nut('Pimiento verde',80),nut('Pimiento rojo',60),nut('Cebolla',40),nut('Guacamole',60),nut('Pan pita',60),nut('Aceite de oliva',10)],t:18},
{n:'Wok de tofu con arroz',ing:[nut('Tofu firme',150),nut('Arroz jazmín',70),nut('Brócoli',80),nut('Pimiento rojo',40),nut('Salsa de soja',10),nut('Aceite de oliva',10)],t:20},
{n:'Chili sin carne con alubias y boniato',ing:[nut('Alubias rojas',80),nut('Alubias negras',60),nut('Boniato',100),nut('Salsa de tomate',80),nut('Pimiento verde',40),nut('Aceite de oliva',5)],t:30}
],
post_entreno:[
{n:'Batido de plátano y avena',ing:[nut('Plátano',120),nut('Avena',40),nut('Bebida de soja',250)],t:3},
{n:'Tofu con fruta',ing:[nut('Tofu firme',100),nut('Plátano',100),nut('Nueces',15)],t:3},
{n:'Leche de soja con crema de cacahuete',ing:[nut('Bebida de soja',250),nut('Crema de cacahuete',20),nut('Plátano',80)],t:3}
]
};

const VEGAN_CAT_MAP={
'pan integral':'Cereales','pan pita':'Cereales','tostadas integrales':'Cereales',
'arroz jazmín':'Cereales','arroz basmati':'Cereales','arroz integral':'Cereales',
'quinoa':'Cereales','pasta integral':'Cereales','cuscús':'Cereales',
'avena':'Cereales','copos de avena':'Cereales','granola':'Cereales',
'tofu':'Proteínas vegetales','tofu firme':'Proteínas vegetales',
'tempeh':'Proteínas vegetales','seitán':'Proteínas vegetales','edamame':'Proteínas vegetales',
'carne de soja texturizada':'Proteínas vegetales',
'bebida de soja':'Lácteos vegetales','leche de soja':'Lácteos vegetales',
'leche de coco':'Lácteos vegetales','leche de almendra':'Lácteos vegetales',
'leche de avena':'Lácteos vegetales','yogur vegetal':'Lácteos vegetales',
'crema de cacahuete':'Frutos secos','mantequilla de cacahuete':'Frutos secos',
'tahini':'Frutos secos','nueces':'Frutos secos','nueces mixtas':'Frutos secos',
'nueces de la India':'Frutos secos','almendras':'Frutos secos','avellanas':'Frutos secos',
'pipas de girasol':'Frutos secos','pipas de calabaza':'Frutos secos',
'chía':'Frutos secos','linaza':'Frutos secos','sésamo':'Frutos secos',
'semillas de cáñamo':'Frutos secos',
'aceite de oliva':'Aceites','aceite de oliva virgen extra':'Aceites',
'aceite de coco':'Aceites','AOVE':'Aceites',
'garbanzos':'Legumbres','lentejas':'Legumbres','lentejas rojas':'Legumbres',
'alubias blancas':'Legumbres','alubias negras':'Legumbres','alubias rojas':'Legumbres',
'hummus':'Legumbres','falafel':'Legumbres',
'brócoli':'Verduras','espinaca':'Verduras','calabacín':'Verduras',
'pimiento verde':'Verduras','pimiento rojo':'Verduras','cebolla':'Verduras',
'champiñones':'Verduras','patata':'Verduras','boniato':'Verduras',
'calabaza':'Verduras','coliflor':'Verduras','coles de bruselas':'Verduras',
'espárragos':'Verduras','puerro':'Verduras','apio':'Verduras','zanahoria':'Verduras',
'berenjena':'Verduras','kale':'Verduras','rúcula':'Verduras','lechuga':'Verduras',
'pepino':'Verduras','aguacate':'Verduras',
'plátano':'Frutas','manzana':'Frutas','naranja':'Frutas','fresas':'Frutas',
'arándanos':'Frutas','frutos rojos':'Frutas','mango':'Frutas','piña':'Frutas',
'limón':'Frutas','açaí':'Frutas','plátano congelado':'Frutas',
'tomate':'Frutas','tomate natural':'Frutas','tomate cherry':'Frutas',
'pasas':'Frutas','dátiles':'Frutas',
'salsa de soja':'Condimentos','salsa teriyaki':'Condimentos','salsa de tomate':'Condimentos',
'guacamole':'Condimentos','pesto':'Condimentos',
'olivas negras':'Condimentos','aceitunas':'Condimentos',
'especias':'Condimentos','canela':'Condimentos','sal':'Condimentos',
'proteína vegetal en polvo':'Suplementos','proteina en polvo':'Suplementos',
'pan de almendra':'Cereales',
'bebida vegetal':'Lácteos vegetales'
};

function genDietaVegana(userData){
  return buildDietPlan(userData,VEGAN_MEALS,makeSlots,['Ninguna'],'');
}

function genListaCompraVegana(plan){
  return genListaCompraUniversal(plan,VEGAN_CAT_MAP);
}
