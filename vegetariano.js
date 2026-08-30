/*  vegetariano.js — Dieta Vegetariana con cálculo real
    Depende de nutricion.js (NUT_DB, buildDietPlan, nut, etc.)
    Vegetariano: huevos, lácteos, legumbres, tofu, tempeh.
    NO: carne, pollo, pavo, cerdo, ternera, pescado, marisco.    */

const VEGET_MEALS={
desayuno:[
{n:'Tostadas integrales con huevo revuelto y aguacate',ing:[nut('Pan integral',80),nut('Huevos',120),nut('Aguacate',80),nut('Aceite de oliva',5)],t:8},
{n:'Yogur griego con avena, granola y frutos rojos',ing:[nut('Yogur griego',200),nut('Avena',40),nut('Frutos rojos',80)],t:3},
{n:'Huevos pochados sobre tostada con tomate y queso feta',ing:[nut('Pan integral',80),nut('Huevos',120),nut('Tomate',80),nut('Queso feta',30),nut('Aceite de oliva',5)],t:10},
{n:'Tortilla de espinacas y champiñones con ensalada',ing:[nut('Huevos',180),nut('Espinaca',60),nut('Champiñones',60),nut('Aceite de oliva',5),nut('Lechuga',40)],t:12},
{n:'Smoothie de plátano, avena, yogur y frutos rojos',ing:[nut('Plátano',100),nut('Avena',30),nut('Yogur griego',150),nut('Frutos rojos',80)],t:5},
{n:'Porridge de avena con leche, plátano y canela',ing:[nut('Avena',50),nut('Leche',200),nut('Plátano',100),nut('Canela',2)],t:5},
{n:'Tostadas con queso fresco, tomate y albahaca',ing:[nut('Pan integral',80),nut('Queso fresco',60),nut('Tomate',80),nut('Aceite de oliva',5)],t:5},
{n:'Huevos revueltos con espinaca y queso de cabra',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Queso fresco',40),nut('Aceite de oliva',5)],t:8},
{n:'Tostadas integrales con huevo revuelto y aguacate',ing:[nut('Pan integral',80),nut('Huevos',120),nut('Aguacate',60)],t:8},
{n:'Smoothie de plátano, avena y leche de almendra',ing:[nut('Plátano',120),nut('Avena',60),nut('Leche de almendra',200)],t:5},
{n:'Tortitas de huevo con espinacas y champiñones',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Champiñones',60),nut('Aceite de oliva',5)],t:10},
{n:'Huevos Benedict vegetarianos con espinaca',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Pan integral',60)],t:12},
{n:'Huevos pochados sobre tostada con tomate',ing:[nut('Huevos',120),nut('Pan integral',60),nut('Tomate',80)],t:8},
{n:'Pancakes de avena con miel y fruta',ing:[nut('Avena',80),nut('Huevos',60),nut('Miel',10),nut('Manzana',100)],t:15}
],
media_mañana:[
{n:'Fruta de temporada',ing:[nut('Manzana',150)],t:1},
{n:'Yogur griego con nueces',ing:[nut('Yogur griego',150),nut('Nueces',20)],t:2},
{n:'Frutos secos mixtos',ing:[nut('Nueces mixtas',30)],t:1},
{n:'Hummus con palitos de zanahoria',ing:[nut('Hummus',60),nut('Zanahoria',80)],t:3},
{n:'Tostada con queso fresco y miel',ing:[nut('Pan integral',40),nut('Queso fresco',40),nut('Miel',5)],t:3},
{n:'Fruta + frutos secos',ing:[nut('Manzana',150),nut('Nueces',40)],t:1},
{n:'Hummus con pan pita',ing:[nut('Hummus',100),nut('Pan pita',60)],t:3},
{n:'Edamame con sal',ing:[nut('Edamame',150)],t:3},
{n:'Yogur griego con fruta',ing:[nut('Yogur griego',200),nut('Manzana',150)],t:2},
{n:'Yogur griego con granola y frutos rojos',ing:[nut('Yogur griego',200),nut('Granola',50),nut('Frutos rojos',80)],t:2}
],
comida:[
{n:'Pasta integral con verduras y queso parmesano',ing:[nut('Pasta integral',70),nut('Calabacín',60),nut('Pimiento rojo',40),nut('Champiñones',40),nut('Queso parmesano',20),nut('Aceite de oliva',10)],t:18},
{n:'Ensalada de quinoa con verduras asadas y feta',ing:[nut('Quinoa',60),nut('Pimiento verde',40),nut('Calabacín',40),nut('Queso feta',40),nut('Aceite de oliva',10)],t:15},
{n:'Curry de verduras con arroz basmati',ing:[nut('Arroz basmati',70),nut('Brócoli',80),nut('Zanahoria',40),nut('Garbanzos',80),nut('Leche de coco',100),nut('Aceite de oliva',5)],t:25},
{n:'Lasaña de verduras con bechamel',ing:[nut('Pasta integral',80),nut('Espinaca',80),nut('Calabacín',60),nut('Salsa de tomate',80),nut('Queso parmesano',20)],t:35},
{n:'Bowl de arroz con tofu, aguacate y verduras',ing:[nut('Arroz jazmín',70),nut('Tofu firme',150),nut('Aguacate',60),nut('Brócoli',80),nut('Salsa de soja',10)],t:20},
{n:'Ensalada de garbanzos con espinaca y queso de cabra',ing:[nut('Garbanzos',120),nut('Espinaca',80),nut('Queso fresco',40),nut('Tomate',60),nut('Aceite de oliva',10)],t:10},
{n:'Risotto de champiñones y parmesano',ing:[nut('Arroz jazmín',70),nut('Champiñones',100),nut('Queso parmesano',30),nut('Cebolla',30),nut('Aceite de oliva',10)],t:25},
{n:'Pizza integral con verduras y mozzarella',ing:[nut('Pan integral',80),nut('Salsa de tomate',60),nut('Mozzarella',60),nut('Pimiento verde',30),nut('Champiñones',30),nut('Aceitunas',10)],t:20},
{n:'Bowl de arroz con tofu, aguacate y verduras',ing:[nut('Arroz jazmín',80),nut('Tofu firme',150),nut('Aguacate',60),nut('Pimiento verde',40),nut('Calabacín',40),nut('Aceite de oliva',10)],t:20},
{n:'Burrito de frijoles, arroz, queso y guacamole',ing:[nut('Alubias negras',100),nut('Arroz jazmín',80),nut('Queso fresco',40),nut('Guacamole',60),nut('Tortillas de maíz',80)],t:15},
{n:'Burrito de frijoles, arroz, queso y guacamole',ing:[nut('Alubias negras',150),nut('Arroz jazmín',80),nut('Queso fresco',40),nut('Guacamole',60),nut('Tortillas de maíz',80)],t:15},
{n:'Fajitas de verduras con tortillas integrales',ing:[nut('Pimiento verde',80),nut('Pimiento rojo',60),nut('Cebolla',40),nut('Tortillas integrales',80),nut('Aceite de oliva',10)],t:15},
{n:'Lasaña de verduras con bechamel',ing:[nut('Pasta integral',80),nut('Calabacín',80),nut('Pimiento verde',60),nut('Salsa de tomate',80),nut('Queso fresco',40)],t:35},
{n:'Pizza integral con verduras y mozzarella',ing:[nut('Pan integral',100),nut('Salsa de tomate',60),nut('Mozzarella',60),nut('Pimiento verde',40),nut('Champiñones',40)],t:25},
{n:'Risotto de champiñones y parmesano',ing:[nut('Arroz jazmín',80),nut('Champiñones',100),nut('Queso parmesano',40),nut('Cebolla',30),nut('Aceite de oliva',10)],t:25},
{n:'Risotto de espárragos y parmesano',ing:[nut('Arroz jazmín',80),nut('Espárragos',100),nut('Queso parmesano',40),nut('Cebolla',30),nut('Aceite de oliva',10)],t:25},
{n:'Curry de verduras con arroz',ing:[nut('Garbanzos',100),nut('Espinaca',80),nut('Arroz jazmín',70),nut('Leche de coco',100),nut('Aceite de oliva',5)],t:25},
{n:'Tortilla de espinacas y champiñones con ensalada',ing:[nut('Huevos',120),nut('Espinaca',80),nut('Champiñones',60),nut('Aceite de oliva',5),nut('Lechuga',40)],t:12},
{n:'Queso fresco con miel',ing:[nut('Queso fresco',80),nut('Miel',10)],t:2},
{n:'Tarta de verduras con masa filo',ing:[nut('Pasta integral',80),nut('Calabacín',80),nut('Champiñones',60),nut('Cebolla',30),nut('Aceite de oliva',10)],t:35}
],
merienda:[
{n:'Queso fresco con miel',ing:[nut('Queso fresco',80),nut('Miel',10)],t:2},
{n:'Fruta con crema de cacahuete',ing:[nut('Manzana',120),nut('Crema de cacahuete',20)],t:2},
{n:'Smoothie verde con yogur',ing:[nut('Espinaca',40),nut('Plátano',100),nut('Yogur griego',100),nut('Leche de almendra',100)],t:5},
{n:'Nueces y fruta seca',ing:[nut('Nueces mixtas',25),nut('Pasas',15)],t:1},
{n:'Yogur griego con fruta',ing:[nut('Yogur griego',150),nut('Fresas',60)],t:2}
],
cena:[
{n:'Tortilla de espinacas y champiñones con ensalada',ing:[nut('Huevos',120),nut('Espinaca',80),nut('Champiñones',60),nut('Aceite de oliva',5),nut('Lechuga',40)],t:12},
{n:'Crema de calabaza con semillas y pan integral',ing:[nut('Calabaza',200),nut('Puerro',40),nut('Queso fresco',30),nut('Pipas de calabaza',15),nut('Aceite de oliva',5),nut('Pan integral',40)],t:25},
{n:'Pasta integral con pesto y verduras',ing:[nut('Pasta integral',70),nut('Calabacín',60),nut('Pimiento rojo',40),nut('Pesto',15)],t:18},
{n:'Revuelto de tofu con champiñones y espinacas',ing:[nut('Tofu firme',150),nut('Champiñones',80),nut('Espinaca',60),nut('Aceite de oliva',10)],t:15},
{n:'Ensalada de lentejas y queso feta',ing:[nut('Lentejas',100),nut('Queso feta',40),nut('Tomate',60),nut('Pepino',40),nut('Aceite de oliva',10)],t:10},
{n:'Risotto de espárragos y parmesano',ing:[nut('Arroz jazmín',70),nut('Espárragos',100),nut('Queso parmesano',30),nut('Cebolla',30),nut('Aceite de oliva',10)],t:25},
{n:'Lasaña de verduras con bechamel',ing:[nut('Pasta integral',60),nut('Espinaca',60),nut('Calabacín',50),nut('Salsa de tomate',60),nut('Queso parmesano',15)],t:30},
{n:'Crema de calabaza con semillas y pan integral',ing:[nut('Calabaza',200),nut('Cebolla',30),nut('Leche de coco',100),nut('Semillas de calabaza',15),nut('Pan integral',40)],t:25}
],
post_entreno:[
{n:'Yogur griego con avena y plátano',ing:[nut('Yogur griego',150),nut('Avena',30),nut('Plátano',100)],t:3},
{n:'Batido de proteína con leche y fruta',ing:[nut('Proteina en polvo',30),nut('Leche',250),nut('Plátano',100)],t:3}
]
};

const VEGET_CAT_MAP={
'pan integral':'Cereales','pan de almendra':'Cereales','arroz jazmín':'Cereales',
'arroz basmati':'Cereales','arroz integral':'Cereales','pasta integral':'Cereales',
'avena en copos':'Cereales','copos de avena':'Cereales','avena':'Cereales',
'quinoa':'Cereales',
'Huevos':'Huevos y lácteos','claras de huevo':'Huevos y lácteos',
'yogur griego':'Huevos y lácteos','yogur natural':'Huevos y lácteos',
'queso feta':'Huevos y lácteos','queso fresco':'Huevos y lácteos',
'queso parmesano':'Huevos y lácteos','mozzarella':'Huevos y lácteos',
'leche':'Huevos y lácteos','leche de coco':'Huevos y lácteos',
'leche de almendra':'Huevos y lácteos','natas':'Huevos y lácteos',
'mantequilla':'Huevos y lácteos',
'tofu':'Proteínas vegetales','tofu firme':'Proteínas vegetales',
'tempeh':'Proteínas vegetales','edamame':'Proteínas vegetales',
'garbanzos':'Legumbres','lentejas':'Legumbres','lentejas rojas':'Legumbres',
'alubias blancas':'Legumbres','alubias negras':'Legumbres',
'aceite de oliva':'Grasas','aguacate':'Grasas','aceitunas':'Grasas',
'nueces':'Frutos secos','almendras':'Frutos secos','nueces mixtas':'Frutos secos',
'crema de cacahuete':'Frutos secos',
'tomate':'Frutas y verduras','tomate natural':'Frutas y verduras',
'tomate cherry':'Frutas y verduras','cebolla':'Frutas y verduras',
'champiñones':'Frutas y verduras','patata asada':'Frutas y verduras',
'boniato':'Frutas y verduras','calabaza':'Frutas y verduras','coliflor':'Frutas y verduras',
'espárragos':'Frutas y verduras','puerro':'Frutas y verduras','apio':'Frutas y verduras',
'zanahoria':'Frutas y verduras','berenjena':'Frutas y verduras','kale':'Frutas y verduras',
'rúcula':'Frutas y verduras','lechuga':'Frutas y verduras','pepino':'Frutas y verduras',
'verduras salteadas':'Frutas y verduras','ensalada verde':'Frutas y verduras',
'espinaca':'Frutas y verduras','brócoli':'Frutas y verduras','pimiento verde':'Frutas y verduras',
'pimiento rojo':'Frutas y verduras',
'plátano':'Frutas y verduras','manzana':'Frutas y verduras','naranja':'Frutas y verduras',
'fresas':'Frutas y verduras','arándanos':'Frutas y verduras','frutos rojos':'Frutas y verduras',
'mango':'Frutas y verduras','piña':'Frutas y verduras','limón':'Frutas y verduras',
'miel':'Otros','salsa de tomate':'Otros','pesto':'Otros','guacamole':'Otros',
'olivas negras':'Otros','aceitunas verdes':'Otros',
'especias':'Otros','canela':'Otros','pimienta negra':'Otros','sal':'Otros',
'salsa de soja':'Otros','hummus':'Otros','proteina en polvo':'Otros',
'proteína en polvo':'Otros',
'pasas':'Frutos secos','leche de coco':'Huevos y lácteos'
};

function genDietaVegetariana(userData){
  return buildDietPlan(userData,VEGET_MEALS,makeSlots,['Ninguna'],'');
}

function genListaCompraVegetariana(plan){
  return genListaCompraUniversal(plan,VEGET_CAT_MAP);
}
