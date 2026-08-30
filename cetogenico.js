/*  cetogenico.js — Dieta Cetogénica con cálculo real
    Depende de nutricion.js (NUT_DB, buildDietPlan, nut, etc.)
    Cetogénica: grasas altas, proteína moderada, carbohidratos muy bajos (<50 g/día).
    Prioriza: carne, pescado, huevos, queso, aguacate, AOVE, frutos secos, verduras bajas en carb.
    Excluye: pan, pasta, arroz, cereales, azúcar, patata, boniato, legumbres en exceso.    */

const CETO_MEALS={
desayuno:[
{n:'Huevos revueltos con espinaca y aguacate',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Aguacate',80),nut('Aceite de oliva',5)],t:8},
{n:'Tortilla de 3 huevos con champiñones y queso',ing:[nut('Huevos',180),nut('Champiñones',60),nut('Queso fresco',30),nut('Aceite de oliva',5)],t:10},
{n:'Huevos pochados sobre aguacate con espinacas',ing:[nut('Huevos',120),nut('Aguacate',80),nut('Espinaca',40)],t:8},
{n:'Revuelto de huevos con tocino y tomates cherry',ing:[nut('Huevos',120),nut('Tocino',30),nut('Tomate cherry',60),nut('Aceite de oliva',5)],t:8},
{n:'Omelette de queso y champiñones',ing:[nut('Huevos',120),nut('Queso fresco',40),nut('Champiñones',60),nut('Aceite de oliva',5)],t:10},
{n:'Huevos Benedict con espinaca y aguacate',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Aguacate',60),nut('Aceite de oliva',5)],t:12},
{n:'Tortilla española sin patata (con calabacín)',ing:[nut('Huevos',180),nut('Calabacín',100),nut('Cebolla',30),nut('Aceite de oliva',10)],t:12},
{n:'Huevos revueltos con salmón ahumado',ing:[nut('Huevos',120),nut('Salmón ahumado',40),nut('Espinaca',40)],t:8},
{n:'Huevos Benedict con espinaca',ing:[nut('Huevos',120),nut('Espinaca',60),nut('Pan de almendra',60)],t:12},
{n:'Huevos pochados sobre aguacate',ing:[nut('Huevos',120),nut('Aguacate',80),nut('Espinaca',40)],t:8},
{n:'Revuelto de huevos con tocino',ing:[nut('Huevos',120),nut('Jamón serrano',30),nut('Espinaca',40),nut('Aceite de oliva',5)],t:8},
{n:'Tortilla de huevos con champiñones',ing:[nut('Huevos',180),nut('Champiñones',80),nut('Aceite de oliva',5)],t:10}
],
media_mañana:[
{n:'Nueces mixtas (30 g)',ing:[nut('Nueces mixtas',30)],t:1},
{n:'Queso fresco con aceitunas',ing:[nut('Queso fresco',40),nut('Aceitunas',20)],t:1},
{n:'Mantequilla de almendra (2 cdas)',ing:[nut('Mantequilla de almendra',30)],t:1},
{n:'Palitos de apio con guacamole',ing:[nut('Apio',80),nut('Aguacate',40)],t:2},
{n:'Nueces de Brasil (10 uds)',ing:[nut('Nueces',30)],t:1},
{n:'Nueces mixtas con queso',ing:[nut('Nueces mixtas',30),nut('Queso fresco',40)],t:1},
{n:'Palitos de apio con mantequilla de almendra',ing:[nut('Palitos de apio',80),nut('Mantequilla de almendra',20)],t:2},
{n:'Guacamole con palitos de pepino',ing:[nut('Guacamole',60),nut('Palitos de pepino',80)],t:3}
],
comida:[
{n:'Pechuga de pollo a la plancha con brócoli y aceite de oliva',ing:[nut('Pollo a la plancha',200),nut('Brócoli',120),nut('Aceite de oliva',10)],t:20},
{n:'Ternera con ensalada verde y aguacate',ing:[nut('Ternera',200),nut('Lechuga',60),nut('Aguacate',80),nut('Aceite de oliva',10)],t:20},
{n:'Salmón al horno con espárragos',ing:[nut('Salmón',200),nut('Espárragos',120),nut('Aceite de oliva',10)],t:25},
{n:'Pollo al horno con coles de bruselas',ing:[nut('Pollo al horno',200),nut('Brócoli',120),nut('Aceite de oliva',10)],t:35},
{n:'Pollo al horno con coles de bruselas',ing:[nut('Pollo al horno',200),nut('Coles de bruselas',120),nut('Aceite de oliva',10)],t:35},
{n:'Merluza con calabacín salteado',ing:[nut('Merluza',200),nut('Calabacín',120),nut('Aceite de oliva',10)],t:18},
{n:'Atún a la plancha con espárragos',ing:[nut('Atún',200),nut('Espárragos',120),nut('Aceite de oliva',10)],t:18},
{n:'Ternera con puré de coliflor',ing:[nut('Ternera',200),nut('Coliflor',150),nut('Mantequilla',10)],t:25},
{n:'Cerdo con brócoli y salsa de soja',ing:[nut('Cerdo',200),nut('Brócoli',120),nut('Salsa de soja',10),nut('Aceite de oliva',10)],t:20}
],
merienda:[
{n:'Guacamole con palitos de pepino',ing:[nut('Aguacate',60),nut('Pepino',80)],t:3},
{n:'Aceitunas y queso',ing:[nut('Aceitunas',30),nut('Queso fresco',40)],t:1},
{n:'Yogur griego con nueces',ing:[nut('Yogur griego',150),nut('Nueces',15)],t:2},
{n:'Batido de proteína con leche de almendra',ing:[nut('Proteina en polvo',30),nut('Leche de almendra',200)],t:3}
],
cena:[
{n:'Salmón con boniato asado y espárragos',ing:[nut('Salmón',180),nut('Espárragos',120),nut('Aceite de oliva',10)],t:25},
{n:'Lubina con calabacín y pimiento',ing:[nut('Lubina',180),nut('Calabacín',80),nut('Pimiento verde',60),nut('Aceite de oliva',10)],t:20},
{n:'Merluza con espinacas salteadas',ing:[nut('Merluza',180),nut('Espinaca',80),nut('Aceite de oliva',10)],t:18},
{n:'Pollo con ensalada de aguacate',ing:[nut('Pollo a la plancha',180),nut('Aguacate',80),nut('Lechuga',40),nut('Aceite de oliva',10)],t:18},
{n:'Pavo con verduras salteadas en aceite de coco',ing:[nut('Pavo',180),nut('Brócoli',80),nut('Pimiento verde',40),nut('Aceite de oliva',10)],t:18},
{n:'Ternera con espárragos y mantequilla',ing:[nut('Ternera',180),nut('Espárragos',120),nut('Mantequilla',10)],t:25},
{n:'Salmón con ensalada de kale y nueces',ing:[nut('Salmón',180),nut('Kale',80),nut('Nueces',15),nut('Aceite de oliva',10)],t:20}
],
post_entreno:[
{n:'Batido de proteína con leche de almendra y crema de cacahuete',ing:[nut('Proteina en polvo',30),nut('Leche de almendra',200),nut('Crema de cacahuete',15)],t:3},
{n:'Huevos revueltos con aguacate',ing:[nut('Huevos',120),nut('Aguacate',60)],t:8}
]
};

const CETO_CAT_MAP={
'Huevos':'Huevos y lácteos','claras de huevo':'Huevos y lácteos',
'yogur griego':'Huevos y lácteos','queso fresco':'Huevos y lácteos',
'queso parmesano':'Huevos y lácteos','leche':'Huevos y lácteos',
'leche de almendra':'Huevos y lácteos','mantequilla':'Huevos y lácteos',
'crema de leche':'Huevos y lácteos',
'tocino':'Carnes','jamón serrano':'Carnes','salchicha':'Carnes','chorizo':'Carnes',
'pechuga de pollo':'Carnes','pollo a la plancha':'Carnes','pollo al horno':'Carnes',
'ternera':'Carnes','solomillo':'Carnes','lomo de cerdo':'Carnes','cerdo':'Carnes',
'pavo':'Carnes',
'salmón':'Pescados','merluza':'Pescados','lubina':'Pescados','atún':'Pescados',
'sardinas':'Pescados','caballa':'Pescados','dorada':'Pescados','bacalao':'Pescados',
'salmón ahumado':'Pescados',
'nueces':'Frutos secos','almendras':'Frutos secos','nueces mixtas':'Frutos secos',
'nueces de Brasil':'Frutos secos','mantequilla de almendra':'Frutos secos',
'aguacate':'Grasas','aceite de oliva':'Grasas','aceitunas':'Grasas',
'aceite de coco':'Grasas','crema de cacahuete':'Grasas',
'brócoli':'Verduras bajas en carb','espinaca':'Verduras bajas en carb',
'calabacín':'Verduras bajas en carb','coliflor':'Verduras bajas en carb',
'espárragos':'Verduras bajas en carb','pepino':'Verduras bajas en carb',
'lechuga':'Verduras bajas en carb','champiñones':'Verduras bajas en carb',
'apio':'Verduras bajas en carb','coles de bruselas':'Verduras bajas en carb',
'pimiento verde':'Verduras bajas en carb','tomate cherry':'Verduras bajas en carb',
cebolla:'Verduras bajas en carb','kale':'Verduras bajas en carb',
'proteina en polvo':'Otros','proteína en polvo':'Otros',
'salsa de soja':'Otros','especias':'Otros','sal':'Otros','pimienta negra':'Otros'
};

function genDietaCeto(userData){
  const plan=buildDietPlan(userData,CETO_MEALS,makeSlots,['Ninguna'],'');
  const CARB_LIMIT=50;
  if(plan&&plan.plan){
    for(const day of plan.plan){
      if(day.cReal>CARB_LIMIT){
        const over=day.cReal-CARB_LIMIT;
        for(const meal of day.comidas){
          if(over<=0)break;
          const reduc=Math.min(over,Math.round(meal.c*0.3));
          if(reduc>0){
            const factor=(meal.c-reduc)/meal.c;
            meal.c=Math.round(meal.c*factor);
            meal.cal=Math.round(meal.cal*factor-(reduc*4));
            day.cReal=Math.round(day.cReal-reduc);
            day.calReal=Math.round(day.calReal-reduc*4);
          }
        }
      }
    }
    if(plan.promedio){
      plan.promedio.c=Math.round(plan.plan.reduce((s,d)=>s+d.cReal,0)/plan.plan.length);
      plan.promedio.cal=Math.round(plan.plan.reduce((s,d)=>s+d.calReal,0)/plan.plan.length);
    }
  }
  return plan;
}

function genListaCompraCeto(plan){
  return genListaCompraUniversal(plan,CETO_CAT_MAP);
}
