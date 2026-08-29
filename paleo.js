/*  paleo.js — Dieta Paleo con cálculo real
    Depende de nutricion.js (NUT_DB, buildDietPlan, nut, etc.)    */

const PALEO_MEALS={
desayuno:[
{n:'Huevos revueltos con espinaca y aguacate',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Aguacate',80),nut('Aceite de oliva',5)],t:8},
{n:'Tortilla de 3 huevos con champiñones',ing:[nut('Huevos',180),nut('Champiñones',80),nut('Aceite de oliva',5)],t:10},
{n:'Huevos pochados sobre aguacate',ing:[nut('Huevos',120),nut('Aguacate',80),nut('Espinaca',40)],t:8},
{n:'Revuelto de huevos con tocino',ing:[nut('Huevos',120),nut('Jamón serrano',30),nut('Espinaca',40),nut('Aceite de oliva',5)],t:8},
{n:'Huevos Benedict con espinaca',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Pan de almendra',60)],t:12},
{n:'Omelette de queso y champiñones',ing:[nut('Huevos',120),nut('Queso fresco',40),nut('Champiñones',60),nut('Aceite de oliva',5)],t:10},
{n:'Huevos revueltos con salmón ahumado',ing:[nut('Huevos',120),nut('Salmón',60),nut('Espinaca',40)],t:8}
],
media_mañana:[
{n:'Nueces mixtas y fruta',ing:[nut('Nueces mixtas',30),nut('Manzana',100)],t:1},
{n:'Yogur griego con nueces',ing:[nut('Yogur griego',150),nut('Nueces',20)],t:2},
{n:'Palitos de apio con mantequilla de almendra',ing:[nut('Palitos de apio',80),nut('Mantequilla de almendra',20)],t:2},
{n:'Guacamole con palitos de pepino',ing:[nut('Guacamole',60),nut('Palitos de pepino',80)],t:3},
{n:'Aceitunas y queso',ing:[nut('Aceitunas',30),nut('Queso fresco',40)],t:1},
{n:'Hummus con palitos de zanahoria',ing:[nut('Hummus',60),nut('Zanahoria',80)],t:3},
{n:'Nueces de Brasil',ing:[nut('Nueces de Brasil',25)],t:1}
],
comida:[
{n:'Pechuga de pollo a la plancha con brócoli',ing:[nut('Pechuga de pollo',180),nut('Brócoli',120),nut('Aceite de oliva',10)],t:18},
{n:'Ternera con ensalada verde y aguacate',ing:[nut('Ternera',180),nut('Lechuga',60),nut('Aguacate',60),nut('Aceite de oliva',10)],t:20},
{n:'Pollo al horno con coles de bruselas',ing:[nut('Pollo al horno',180),nut('Coles de bruselas',120),nut('Aceite de oliva',10)],t:35},
{n:'Salmón con ensalada de kale y nueces',ing:[nut('Salmón a la plancha',180),nut('Kale',80),nut('Nueces',15),nut('Aceite de oliva',10)],t:20},
{n:'Pavo con verduras salteadas en aceite de coco',ing:[nut('Pavo',180),nut('Pimiento verde',60),nut('Calabacín',60),nut('Aceite de coco',10)],t:18},
{n:'Cerdo con brócoli y salsa de soja',ing:[nut('Solomillo de cerdo',180),nut('Brócoli',120),nut('Salsa de soja',10)],t:18},
{n:'Ternera con espárragos y mantequilla',ing:[nut('Ternera',180),nut('Espárragos',120),nut('Mantequilla',10)],t:20},
{n:'Cordero al horno con verduras',ing:[nut('Ternera',180),nut('Calabaza',100),nut('Cebolla',40),nut('Aceite de oliva',10)],t:35}
],
merienda:[
{n:'Fruta con crema de cacahuete',ing:[nut('Manzana',120),nut('Crema de cacahuete',20)],t:2},
{n:'Nueces y fruta seca',ing:[nut('Nueces mixtas',25),nut('Pasas',15)],t:1},
{n:'Yogur griego con fruta',ing:[nut('Yogur griego',150),nut('Fresas',60)],t:2},
{n:'Hummus con palitos de zanahoria',ing:[nut('Hummus',60),nut('Zanahoria',80)],t:3},
{n:'Smoothie verde paleo',ing:[nut('Espinaca',40),nut('Plátano',100),nut('Leche de coco',200),nut('Mantequilla de almendra',15)],t:5},
{n:'Aceitunas y queso fresco',ing:[nut('Aceitunas',30),nut('Queso fresco',40)],t:1}
],
cena:[
{n:'Salmón al horno con espárragos',ing:[nut('Salmón',180),nut('Espárragos',120),nut('Aceite de oliva',10)],t:25},
{n:'Merluza con calabacín salteado',ing:[nut('Merluza',180),nut('Calabacín salteado',150),nut('Aceite de oliva',10)],t:18},
{n:'Ternera con puré de coliflor',ing:[nut('Ternera',180),nut('Coliflor',150),nut('Mantequilla',10)],t:25},
{n:'Atún a la plancha con espárragos',ing:[nut('Atún a la plancha',180),nut('Espárragos',120),nut('Aceite de oliva',10)],t:15},
{n:'Lubina con calabacín y pimiento',ing:[nut('Lubina',180),nut('Calabacín',80),nut('Pimiento verde',60),nut('Aceite de oliva',10)],t:20},
{n:'Pollo con ensalada de aguacate',ing:[nut('Pollo a la plancha',180),nut('Aguacate',80),nut('Lechuga',60),nut('Tomate',40)],t:15},
{n:'Merluza con espinacas salteadas',ing:[nut('Merluza',180),nut('Espinaca',100),nut('Ajo',5),nut('Aceite de oliva',10)],t:18}
],
post_entreno:[
{n:'Huevos revueltos con plátano',ing:[nut('Huevos',120),nut('Plátano',100)],t:8},
{n:'Yogur griego con frutos rojos',ing:[nut('Yogur griego',200),nut('Frutos rojos',80)],t:3},
{n:'Batido de coco con proteína',ing:[nut('Leche de coco',250),nut('Proteina en polvo',30),nut('Plátano',80)],t:3}
]
};

const PALEO_CAT_MAP={
'pan de almendra':'Cereales','avena paleo (almendra)':'Cereales',
'pechuga de pollo':'Carnes y aves','pollo':'Carnes y aves','pollo al horno':'Carnes y aves',
'pollo a la plancha':'Carnes y aves','muslo de pollo':'Carnes y aves',
'ternera':'Carnes y aves','bistec':'Carnes y aves','filete de ternera':'Carnes y aves',
'carne picada':'Carnes y aves','chuleta':'Carnes y aves',
'solomillo de cerdo':'Carnes y aves','lomo de cerdo':'Carnes y aves','cerdo':'Carnes y aves',
'pavo':'Carnes y aves','jamón serrano':'Carnes y aves','chorizo':'Carnes y aves',
'salmón':'Pescados','salmón a la plancha':'Pescados','merluza':'Pescados',
'merluza al horno':'Pescados','lubina':'Pescados','atún':'Pescados',
'atún a la plancha':'Pescados','calamares':'Pescados','gambas':'Pescados',
'huevos':'Huevos','claras de huevo':'Huevos',
'yogur griego':'Lácteos','queso fresco':'Lácteos','mantequilla':'Lácteos',
'nueces':'Frutos secos y semillas','nueces mixtas':'Frutos secos y semillas',
'nueces de Brasil':'Frutos secos y semillas','almendras':'Frutos secos y semillas',
'crema de cacahuete':'Frutos secos y semillas','mantequilla de almendra':'Frutos secos y semillas',
'aceite de oliva':'Aceites','aceite de oliva virgen extra':'Aceites','aceite de coco':'Aceites',
'AOVE':'Aceites',
'brócoli':'Verduras','espinaca':'Verduras','calabacín':'Verduras','calabacín salteado':'Verduras',
'pimiento verde':'Verduras','pimiento rojo':'Verduras','cebolla':'Verduras','champiñones':'Verduras',
'espárragos':'Verduras','coles de bruselas':'Verduras','coliflor':'Verduras','kale':'Verduras',
'lechuga':'Verduras','puerro':'Verduras','apio':'Verduras','zanahoria':'Verduras',
'aguacate':'Verduras','tomate':'Verduras','tomate natural':'Verduras','tomate cherry':'Verduras',
'palitos de apio':'Verduras','palitos de pepino':'Verduras',
'patata':'Tubérculos','boniato':'Tubérculos','calabaza':'Tubérculos',
'plátano':'Frutas','manzana':'Frutas','naranja':'Frutas','fresas':'Frutas',
'arándanos':'Frutas','frutos rojos':'Frutas','limón':'Frutas',
'hummus':'Otros','guacamole':'Otros','olivas negras':'Otros','aceitunas':'Otros',
'salsa de soja':'Otros','especias':'Otros','sal':'Otros',
'proteina en polvo':'Otros','proteína en polvo':'Otros',
'pasas':'Frutas','leche de coco':'Otros'
};

function genDietaPaleo(userData){
  return buildDietPlan(userData,PALEO_MEALS,makeSlots,['Ninguna'],'');
}

function genListaCompraPaleo(plan){
  return genListaCompraUniversal(plan,PALEO_CAT_MAP);
}
