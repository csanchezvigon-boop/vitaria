/*  mediterraneo.js — Dieta Mediterránea con cálculo real
    Depende de nutricion.js (NUT_DB, buildDietPlan, nut, etc.)    */

const MED_MEALS={
desayuno:[
{n:'Tostadas integrales con tomate y AOVE',ing:[nut('Pan integral',80),nut('Tomate natural',100),nut('Aceite de oliva',10)],t:5},
{n:'Huevos revueltos con espinaca y queso feta',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Queso feta',30),nut('Aceite de oliva',5)],t:8},
{n:'Yogur griego con avena y frutos rojos',ing:[nut('Yogur griego',200),nut('Avena',40),nut('Frutos rojos',80)],t:3},
{n:'Tostadas con aguacate y huevo pochado',ing:[nut('Pan integral',80),nut('Aguacate',80),nut('Huevos',60),nut('Aceite de oliva',5)],t:8},
{n:'Smoothie de frutos rojos y yogur',ing:[nut('Frutos rojos',120),nut('Yogur griego',150),nut('Avena',20)],t:5},
{n:'Tortilla española con ensalada',ing:[nut('Huevos',180),nut('Patata',150),nut('Cebolla',30),nut('Aceite de oliva',10),nut('Lechuga',40)],t:15},
{n:'Avena con leche y plátano',ing:[nut('Avena',50),nut('Leche',200),nut('Plátano',120),nut('Canela',2)],t:5},
{n:'Huevos Benedict con espinaca',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Pan integral',60),nut('Aceite de oliva',5)],t:12}
],
media_mañana:[
{n:'Fruta de temporada',ing:[nut('Manzana',150)],t:1},
{n:'Yogur griego con nueces',ing:[nut('Yogur griego',150),nut('Nueces',20)],t:2},
{n:'Frutos secos mixtos',ing:[nut('Nueces mixtas',30)],t:1},
{n:'Hummus con palitos de zanahoria',ing:[nut('Hummus',60),nut('Zanahoria',80)],t:3},
{n:'Tostada con queso fresco',ing:[nut('Pan integral',40),nut('Queso fresco',40)],t:3}
],
comida:[
{n:'Salmón a la plancha con quinoa y verduras',ing:[nut('Salmón a la plancha',180),nut('Quinoa',60),nut('Brócoli',120),nut('Aceite de oliva',10)],t:20},
{n:'Ensalada griega con pollo',ing:[nut('Pollo a la plancha',150),nut('Tomate',80),nut('Pepino',60),nut('Queso feta',30),nut('Aceitunas',20),nut('Aceite de oliva',10)],t:12},
{n:'Paella de marisco y verduras',ing:[nut('Arroz jazmín',70),nut('Gambas',100),nut('Calamares',60),nut('Pimiento verde',40),nut('Ajo',5),nut('Aceite de oliva',10)],t:25},
{n:'Guiso de garbanzos con espinaca y chorizo',ing:[nut('Garbanzos',80),nut('Espinaca',80),nut('Chorizo',30),nut('Tomate natural',60),nut('Aceite de oliva',10)],t:20},
{n:'Pollo al horno con aceitunas y limón',ing:[nut('Pollo al horno',200),nut('Aceitunas',30),nut('Limón',20),nut('Patata',100),nut('Aceite de oliva',10)],t:35},
{n:'Merluza al horno con patata y cebolla',ing:[nut('Merluza al horno',180),nut('Patata',120),nut('Cebolla',40),nut('Aceite de oliva',10)],t:30},
{n:'Lubina al horno con limón y hierbas',ing:[nut('Lubina',180),nut('Limón',20),nut('Espinaca',60),nut('Aceite de oliva',10)],t:30},
{n:'Arroz con verduras y marisco',ing:[nut('Arroz jazmín',70),nut('Gambas',80),nut('Pimiento verde',40),nut('Calabacín',40),nut('Aceite de oliva',10)],t:20}
],
merienda:[
{n:'Queso fresco con miel',ing:[nut('Queso fresco',80),nut('Miel',10)],t:2},
{n:'Fruta con crema de cacahuete',ing:[nut('Manzana',120),nut('Crema de cacahuete',20)],t:2},
{n:'Smoothie verde',ing:[nut('Espinaca',40),nut('Plátano',100),nut('Leche de almendra',200)],t:5},
{n:'Nueces y fruta seca',ing:[nut('Nueces mixtas',25),nut('Pasas',15)],t:1},
{n:'Yogur vegetal con fruta',ing:[nut('Yogur vegetal',150),nut('Fresas',60)],t:2}
],
cena:[
{n:'Merluza con calabacín salteado',ing:[nut('Merluza',180),nut('Calabacín salteado',150),nut('Aceite de oliva',10)],t:18},
{n:'Salmón al horno con espárragos',ing:[nut('Salmón',180),nut('Espárragos',120),nut('Aceite de oliva',10)],t:25},
{n:'Ternera con puré de coliflor',ing:[nut('Ternera',180),nut('Coliflor',150),nut('Mantequilla',10)],t:25},
{n:'Pasta integral con verduras y pesto',ing:[nut('Pasta integral',70),nut('Calabacín',60),nut('Pimiento rojo',40),nut('Champiñones',40),nut('Pesto',15)],t:18},
{n:'Tortilla de espinacas y champiñones',ing:[nut('Huevos',120),nut('Espinaca',80),nut('Champiñones',60),nut('Aceite de oliva',5)],t:12},
{n:'Calamares a la plancha con ensalada',ing:[nut('Calamares',150),nut('Lechuga',60),nut('Tomate cherry',60),nut('Aceite de oliva',10)],t:15},
{n:'Lubina con calabacín y pimiento',ing:[nut('Lubina',180),nut('Calabacín',80),nut('Pimiento verde',60),nut('Aceite de oliva',10)],t:20}
],
post_entreno:[
{n:'Yogur griego con avena y plátano',ing:[nut('Yogur griego',150),nut('Avena',30),nut('Plátano',100)],t:3},
{n:'Batido de proteína con leche y fruta',ing:[nut('Proteina en polvo',30),nut('Leche',250),nut('Plátano',100)],t:3}
]
};

const MED_CAT_MAP={
'pan integral':'Cereales y carbohidratos','tostadas integrales':'Cereales y carbohidratos',
'arroz jazmín':'Cereales y carbohidratos','arroz basmati':'Cereales y carbohidratos',
'arroz integral':'Cereales y carbohidratos','quinoa':'Cereales y carbohidratos',
'pasta integral':'Cereales y carbohidratos','avena':'Cereales y carbohidratos',
'cuscús':'Cereales y carbohidratos','pan pita':'Cereales y carbohidratos',
'patata':'Cereales y carbohidratos',
'pechuga de pollo':'Carnes y aves','pollo':'Carnes y aves','pollo al horno':'Carnes y aves',
'pollo a la plancha':'Carnes y aves','muslo de pollo':'Carnes y aves',
'ternera':'Carnes y aves','bistec':'Carnes y aves','filete de ternera':'Carnes y aves',
'carne picada':'Carnes y aves','chuleta':'Carnes y aves',
'solomillo de cerdo':'Carnes y aves','lomo de cerdo':'Carnes y aves','cerdo':'Carnes y aves',
'pavo':'Carnes y aves','jamón serrano':'Carnes y aves','chorizo':'Carnes y aves',
'salchicha':'Carnes y aves','fiambre':'Carnes y aves',
'salmón':'Pescados y mariscos','salmón a la plancha':'Pescados y mariscos',
'merluza':'Pescados y mariscos','merluza al horno':'Pescados y mariscos',
'lubina':'Pescados y mariscos','atún':'Pescados y mariscos','caballa':'Pescados y mariscos',
'sardinas':'Pescados y mariscos','calamares':'Pescados y mariscos',
'gambas':'Pescados y mariscos','bacalao':'Pescados y mariscos',
'huevos':'Huevos y lácteos','claras de huevo':'Huevos y lácteos',
'yogur griego':'Huevos y lácteos','yogur natural':'Huevos y lácteos',
'queso feta':'Huevos y lácteos','queso fresco':'Huevos y lácteos',
'queso parmesano':'Huevos y lácteos','leche':'Huevos y lácteos',
'leche de coco':'Huevos y lácteos','leche de almendra':'Huevos y lácteos',
'natas':'Huevos y lácteos','mantequilla':'Huevos y lácteos',
'nueces':'Frutos secos y semillas','nueces mixtas':'Frutos secos y semillas',
'nueces de Brasil':'Frutos secos y semillas','almendras':'Frutos secos y semillas',
'avellanas':'Frutos secos y semillas','pipas de girasol':'Frutos secos y semillas',
'pipas de calabaza':'Frutos secos y semillas','chía':'Frutos secos y semillas',
'linaza':'Frutos secos y semillas','sésamo':'Frutos secos y semillas',
'aceite de oliva':'Aceites y grasas','aceite de oliva virgen extra':'Aceites y grasas',
'AOVE':'Aceites y grasas','aceite de coco':'Aceites y grasas',
'aceite de aguacate':'Aceites y grasas','crema de cacahuete':'Aceites y grasas',
'tahini':'Aceites y grasas',
'brócoli':'Frutas y verduras','espinaca':'Frutas y verduras','calabacín':'Frutas y verduras',
'pimiento verde':'Frutas y verduras','pimiento rojo':'Frutas y verduras',
'tomate':'Frutas y verduras','tomate natural':'Frutas y verduras',
'tomate cherry':'Frutas y verduras','cebolla':'Frutas y verduras',
'champiñones':'Frutas y verduras','patata asada':'Frutas y verduras',
'boniato':'Frutas y verduras','calabaza':'Frutas y verduras','coliflor':'Frutas y verduras',
'coles de bruselas':'Frutas y verduras','espárragos':'Frutas y verduras',
'puerro':'Frutas y verduras','apio':'Frutas y verduras','zanahoria':'Frutas y verduras',
'berenjena':'Frutas y verduras','kale':'Frutas y verduras','rúcula':'Frutas y verduras',
'lechuga':'Frutas y verduras','pepino':'Frutas y verduras','aguacate':'Frutas y verduras',
'verduras salteadas':'Frutas y verduras','ensalada verde':'Frutas y verduras',
'ensalada griega':'Frutas y verduras',
'plátano':'Frutas y verduras','manzana':'Frutas y verduras','naranja':'Frutas y verduras',
'fresas':'Frutas y verduras','arándanos':'Frutas y verduras','frutos rojos':'Frutas y verduras',
'mango':'Frutas y verduras','piña':'Frutas y verduras','limón':'Frutas y verduras',
'miel':'Otros','salsa de tomate':'Otros','pesto':'Otros','guacamole':'Otros',
'olivas negras':'Otros','aceitunas':'Otros','aceitunas verdes':'Otros',
'especias':'Otros','canela':'Otros','pimienta negra':'Otros','sal':'Otros',
'salsa de soja':'Otros','hummus':'Otros','proteina en polvo':'Otros',
'proteína en polvo':'Otros',
'garbanzos':'Legumbres','lentejas':'Legumbres','lentejas rojas':'Legumbres',
'alubias blancas':'Legumbres','alubias negras':'Legumbres'
};

function genDietaMediterranea(userData){
  return buildDietPlan(userData,MED_MEALS,makeSlots,['Ninguna'],'');
}

function genListaCompra(plan){
  return genListaCompraUniversal(plan,MED_CAT_MAP);
}
