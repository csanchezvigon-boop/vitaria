/* =====================================================
   TEST: Shopping List — Todas las combinaciones
   Ejecutar en consola del navegador tras cargar portal
   ===================================================== */
(function(){
  var PASS=0,FAIL=0,ERRORS=[];
  function ok(label){PASS++;console.log('  ✓ '+label);}
  function fail(label,reason){FAIL++;ERRORS.push(label+': '+reason);console.log('  ✗ '+label+' — '+reason);}
  function section(t){console.log('\n=== '+t+' ===');}

  // Helper: crear usuario simulado
  function makeUser(dietaType,obj,numComidas,peso){
    return {
      email:'test@test.com',
      dietaType:dietaType,
      objetivo:obj,
      numComidas:numComidas||4,
      alergias:[],
      noComer:'',
      physical:{sexo:'hombre',peso:peso||70,altura:175,edad:30,actividad:'moderado'},
      entreno:{dias:3,duracion:60,tipo:'gimnasio'}
    };
  }

  // 1. Test: generateShoppingList returns data for all diets
  section('DIETAS — generateShoppingList');
  var dietas=['todos','mediterranea','paleo','vegana','vegetariana','cetogenica'];
  dietas.forEach(function(d){
    var u=makeUser(d,'Equilibrado',4);
    try{
      newMenu(null,u.alergias,0,u.objetivo,d,u);
      saveUser(u);
      var result=generateShoppingList(u);
      if(result.meals>0)ok(d+' ('+result.meals+' comidas, '+result.ingredients+' ingredientes)');
      else fail(d,'meals=0');
    }catch(e){fail(d,e.message);}
  });

  // 2. Test: All objectives
  section('OBJETIVOS — generateShoppingList');
  var objs=['Equilibrado','Regular el peso','Ganar masa muscular'];
  objs.forEach(function(o){
    var u=makeUser('todos',o,4);
    try{
      newMenu(null,u.alergias,0,u.objetivo,'todos',u);
      saveUser(u);
      var result=generateShoppingList(u);
      if(result.meals>0)ok(o+' ('+result.meals+' comidas, '+result.ingredients+' ingredientes)');
      else fail(o,'meals=0');
    }catch(e){fail(o,e.message);}
  });

  // 3. Test: All numComidas
  section('NÚMERO DE COMIDAS — generateShoppingList');
  [3,4,5,6].forEach(function(n){
    var u=makeUser('todos','Equilibrado',n);
    try{
      newMenu(null,u.alergias,0,u.objetivo,'todos',u);
      saveUser(u);
      var result=generateShoppingList(u);
      if(result.meals>0)ok(n+' comidas ('+result.meals+' meals, '+result.ingredients+' ingredients)');
      else fail(n+' comidas','meals=0');
    }catch(e){fail(n+' comidas',e.message);}
  });

  // 4. Test: Diet+Objective combinations
  section('COMBINACIONES DIETA+OBJETIVO');
  var combos=[
    ['mediterranea','Regular el peso',4],
    ['mediterranea','Ganar masa muscular',4],
    ['mediterranea','Equilibrado',4],
    ['paleo','Regular el peso',4],
    ['paleo','Ganar masa muscular',4],
    ['vegana','Regular el peso',4],
    ['vegana','Equilibrado',4],
    ['vegetariana','Regular el peso',4],
    ['vegetariana','Equilibrado',4],
    ['cetogenica','Regular el peso',4],
    ['cetogenica','Equilibrado',4],
    ['todos','Regular el peso',3],
    ['todos','Regular el peso',5],
    ['todos','Regular el peso',6],
    ['todos','Ganar masa muscular',3],
    ['todos','Ganar masa muscular',5],
    ['todos','Ganar masa muscular',6]
  ];
  combos.forEach(function(c){
    var label=c[0]+'+'+c[1]+'+'+c[2]+'cdas';
    var u=makeUser(c[0],c[1],c[2]);
    try{
      newMenu(null,u.alergias,0,u.objetivo,c[0],u);
      saveUser(u);
      var result=generateShoppingList(u);
      if(result.meals>0&&result.ingredients>0)ok(label+' ('+result.meals+'/'+result.ingredients+')');
      else if(result.meals===0)fail(label,'meals=0 — lista vacía');
      else fail(label,'ingredients=0');
    }catch(e){fail(label,e.message);}
  });

  // 5. Test: HTML generation
  section('HTML GENERATION');
  var u=makeUser('mediterranea','Equilibrado',4);
  newMenu(null,u.alergias,0,u.objetivo,'mediterranea',u);
  saveUser(u);
  var result=generateShoppingList(u);
  if(result.html&&result.html.length>100)ok('HTML generado ('+result.html.length+' chars)');
  else fail('HTML','too short or empty: '+(result.html||'null').length);

  // Check DOM
  var shopEl=document.getElementById('shopList');
  if(shopEl){
    renderLista(u);
    var items=shopEl.querySelectorAll('.shop-item');
    if(items.length>0)ok('DOM: '+items.length+' items visibles');
    else fail('DOM','no .shop-item elements after renderLista');
  }else{
    fail('DOM','#shopList element not found');
  }

  // 6. Test: Quantity aggregation
  section('CANTIDADES — aggregation');
  u=makeUser('todos','Equilibrado',4);
  newMenu(null,u.alergias,0,u.objetivo,'todos',u);
  saveUser(u);
  result=generateShoppingList(u);
  var totalItems=0;
  Object.keys(result.items).forEach(function(k){totalItems++;});
  if(totalItems>5)ok('Total alimentos normalizados: '+totalItems);
  else fail('Agregación','only '+totalItems+' unique foods');

  // 7. Test: Categories
  section('CATEGORÍAS');
  var cats=new Set();
  Object.keys(result.items).forEach(function(k){
    cats.add(result.items[k].cat);
  });
  if(cats.size>=3)ok('Categorías encontradas: '+cats.size);
  else fail('Categorías','only '+cats.size+' categories');

  // Summary
  console.log('\n========================================');
  console.log('RESULTADO: '+PASS+' PASS, '+FAIL+' FAIL');
  if(ERRORS.length>0){
    console.log('\nERRORES:');
    ERRORS.forEach(function(e){console.log('  ✗ '+e);});
  }
  console.log('========================================');
  return{pass:PASS,fail:FAIL,errors:ERRORS};
})();
