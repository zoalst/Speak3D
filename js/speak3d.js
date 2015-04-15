/*
	Speak3D
	Author: Zachary Stenger
	Date: Feb. - Apr. 2015
  uses annyang for speech recognition
	built off of the Text3D example in
	Three.js "tutorials by example" by Lee Stemkoski
*/

// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
//vars for undoing
var meshs = [];
var numberOfMeshs = 0;
var undoing = false;
//default parameters
var globalParams = {};
//divisor var, texture repeats for size/textureRepeatAmount
var textureRepeatAmount = 100;
var textures = getTextures();
var texturesLength = textures.length;
var bubbleMaterial;
var bubbles = false;
var mirrorMaterial;
var mirrorCamera;
var mirrors = false;

var spinningMeshs = [];
var spinningParams = [];
var spinSpeeds = {
  'slow': 0.005,
  'medium': 0.01,
  'fast': 0.05
};

var orbittingMeshs = [];
var orbittingParams = [];
var defaultOrbitRadius = 120;
var orbitSpeeds = {
  'slow': 1,
  'medium': 2.5,
  'fast': 5
};

var movingMeshs = [];
var movingParams = [];
var moveSpeeds = {
  'slow': 1,
  'medium': 2,
  'fast': 5
};

var user;
var gravAmount = -4;
var gravity = new THREE.Vector3(0,gravAmount,0);//TODO user change gravity
var jumpVelocity = 5;
var solids = [];
var gravAndColl = false;
//var useOtherControls = true;
var consoleOpen = false;
var paused = false;
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var gui, guiDefaultParams, guiApperance, guiPosition;
 
var saveLog = '';

var t = 0;

init();
animate();

// FUNCTIONS 		
function init() {
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,200,500);
	camera.lookAt(scene.position);	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : '/'.charCodeAt(0) });
	// CONTROLS
	//controls = new THREE.OrbitControls( camera, renderer.domElement );//TODO
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '25px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	var ambientLight = new THREE.AmbientLight(0x999999);
	scene.add(ambientLight);

	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
  var skyBoxTexture = new THREE.ImageUtils.loadTexture( 'images/' + textures['cloud'] );    

	var skyBoxMaterial = new THREE.MeshBasicMaterial( { texture: skyBoxTexture, side: THREE.DoubleSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	 scene.add(skyBox);
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

  // USER, renamed person from http://stemkoski.github.io/7DFPS/3JSFPS.html
  user = new THREE.Object3D();
  user.add(camera);
  camera.position.set(0,115,10); // first-person view
  user.position.set(0,100,500);
  //user.rotation.y = -Math.PI / 2.0;

  boundingG = new THREE.BoxGeometry(40,40,40);
  // radiusAtTop, radiusAtBottom, height, segmentsAroundRadius, segmentsAlongHeight,
  // boundingG = new THREE.CylinderGeometry(20,20,80,8,2);
  // better collision but FPS drops too much
  
  boundingG.computeBoundingSphere();
  boundingM = new THREE.MeshBasicMaterial( {color:0xff66f3, transparent:true, wireframe:false} );
  bounding  = new THREE.Mesh( boundingG, boundingM );
  bounding.visible = false;
  user.add(bounding);

  user.velocity = new THREE.Vector3(0,0,0);
  
  scene.add(user);

  var coordinator = function(z,x,y)
  {
    return new THREE.Vector3(50*x, 50*y, 50*z);
  }

	////////////
	// CUSTOM //
	////////////
  initConsole();
  initSaveLoadButtons();
	initGlobalParams();
  initBubble();
  initMirror();
  //use jQuery to load instructions html
  $('#instructions').load('instructions.html');
  //hidePauseScreen();
  showPauseScreen();

//testEverything();//TODO remove

  //gui 
  gui = new dat.GUI();
  /*gui = new dat.GUI({ autoPlace: false });
  var customContainer = document.getElementById('guiLoc');
  customContainer.appendChild(gui.domElement);*/
  //for default params
  //var guiDefault = gui.addFolder('Default Params');
  guiApperance = gui.addFolder('Appearance');//folder names need to match code in updateGUI method
  guiPosition = gui.addFolder('Position');//folder names need to match code in updateGUI method
  //get list of texture names
  var textureNames = [];
  textureNames.push('none');
  for(var key in textures) {
    if (textures.hasOwnProperty(key)) {
      textureNames.push(key);
    }
  }
  //TODO log these changes so save/uplload works
  guiDefaultParams = 
  {
    color: "#ffb6c1", 
    ambient: "#ffb6c1",
    texture: 'none', 
    material: 'none', 
    transparent: false, 
    size: 50,
    endsize: 50,
    width: 50,
    height: 50,
    depth: 50,
    amount: 3,
    x: 0,
    y: 50,
    z: 0,
    endx: 0,//TODO make sure these always equal xyz unless explicitly changed (or default already set to someething else)
    endy: 50,
    endz: 0,
    movexspeed: 'none',
    moveyspeed: 'none',
    movezspeed: 'none',
    spinx: 'none',
    spiny: 'none',
    spinz: 'none',
    orbitx: 'none',
    orbitxradius: defaultOrbitRadius,
    orbity: 'none',
    orbityradius: defaultOrbitRadius,
    orbitz: 'none',
    orbitzradius: defaultOrbitRadius,
    solid: false,
    reset: function() {resetGlobalParams();}
  };
  //reset button
  gui.add( guiDefaultParams, 'reset').name('reset all');

  //apperance gui
  var guiDefaultColor = guiApperance.addColor( guiDefaultParams, 'color' );
  guiDefaultColor.onChange(function(value)
  {   
    globalParams['color'] = value;
  });
  var guiDefaultAmbient = guiApperance.addColor( guiDefaultParams, 'ambient' );
  guiDefaultAmbient.onChange(function(value)
  {   
    globalParams['ambient'] = value;
  });
  var guiDefaultTexture = guiApperance.add( guiDefaultParams, 'texture', textureNames );
  guiDefaultTexture.onChange(function(value)
  {   
    globalParams['texture'] = (value !== 'none') ? value : undefined;
  });
  var guiDefaultMaterial = guiApperance.add( guiDefaultParams, 'material', [ 'none', 'bubble', 'mirror' ] );
  guiDefaultMaterial.onChange(function(value)
  {   
    globalParams['material'] = (value !== 'none') ? value : undefined;
  });
  var guiDefaultTransparent = guiApperance.add( guiDefaultParams, 'transparent' );
  guiDefaultTransparent.onChange(function(value)
  {   
    //TODO string rn?, decide to store as boolean or string(bool needs changes in parseParams)
    globalParams['transparent'] = value+'';
  });
  var guiDefaultSize = guiApperance.add( guiDefaultParams, 'size' ).min(0);
  guiDefaultSize.onChange(function(value)
  {   
    globalParams['size'] = value;
  });
  var guiDefaultSize = guiApperance.add( guiDefaultParams, 'endsize' ).min(0).name('end size');
  guiDefaultSize.onChange(function(value)
  {   
    globalParams['endsize'] = value;
  });
  var guiDefaultWidth = guiApperance.add( guiDefaultParams, 'width' ).min(0);
  guiDefaultWidth.onChange(function(value)
  {   
    globalParams['width'] = value;
  });
  var guiDefaultHeight = guiApperance.add( guiDefaultParams, 'height' ).min(0);
  guiDefaultHeight.onChange(function(value)
  {   
    globalParams['height'] = value;
  });
  var guiDefaultDepth = guiApperance.add( guiDefaultParams, 'depth' ).min(0);
  guiDefaultDepth.onChange(function(value)
  {   
    globalParams['depth'] = value;
  });
  var guiDefaultAmount = guiApperance.add( guiDefaultParams, 'amount' ).min(0).step(1.0);
  guiDefaultAmount.onChange(function(value)
  {   
    globalParams['amount'] = value;
  });
  //position gui
  var guiDefaultX = guiPosition.add( guiDefaultParams, 'x' );
  guiDefaultX.onChange(function(value)
  {   
    globalParams['x'] = value;
  });
  var guiDefaultY = guiPosition.add( guiDefaultParams, 'y' );
  guiDefaultY.onChange(function(value)
  {   
    globalParams['y'] = value;
  });
  var guiDefaultZ = guiPosition.add( guiDefaultParams, 'z' );
  guiDefaultZ.onChange(function(value) 
  {   
    globalParams['z'] = value;
  }); 
  var guiDefaultEndX = guiPosition.add( guiDefaultParams, 'endx' );
  guiDefaultEndX.onChange(function(value)
  {   
    globalParams['endx'] = value;
  });
  var guiDefaultEndY = guiPosition.add( guiDefaultParams, 'endy' );
  guiDefaultEndY.onChange(function(value)
  {   
    globalParams['endy'] = value;
  });
  var guiDefaultEndZ = guiPosition.add( guiDefaultParams, 'endz' );
  guiDefaultEndZ.onChange(function(value) 
  {   
    globalParams['endz'] = value;
  }); 
  var guiDefaultMoveX = guiPosition.add( guiDefaultParams, 'movexspeed', [ 'none', 'slow', 'medium', 'fast' ] ).name('move x');
  guiDefaultMoveX.onChange(function(value)
  {   
    globalParams['movexspeed'] = (value !== 'none') ? getMoveSpeedAsNumber(value) : undefined;   
  });
  var guiDefaultMoveY = guiPosition.add( guiDefaultParams, 'moveyspeed', [ 'none', 'slow', 'medium', 'fast' ] ).name('move y');
  guiDefaultMoveY.onChange(function(value)
  {   
    globalParams['moveyspeed'] = (value !== 'none') ? getMoveSpeedAsNumber(value) : undefined;   
  });
  var guiDefaultMoveZ = guiPosition.add( guiDefaultParams, 'movezspeed', [ 'none', 'slow', 'medium', 'fast' ] ).name('move z');
  guiDefaultMoveZ.onChange(function(value)
  {   
    globalParams['movezspeed'] = (value !== 'none') ? getMoveSpeedAsNumber(value) : undefined;   
  });
  var guiDefaultSpinX = guiPosition.add( guiDefaultParams, 'spinx', [ 'none', 'slow', 'medium', 'fast' ] ).name('spin x');
  guiDefaultSpinX.onChange(function(value)
  {   
    globalParams['spinx'] = (value !== 'none') ? getSpinSpeedAsNumber(value) : undefined;   
  });
  var guiDefaultSpinY = guiPosition.add( guiDefaultParams, 'spiny', [ 'none', 'slow', 'medium', 'fast' ] ).name('spin y');
  guiDefaultSpinY.onChange(function(value)
  {   
    globalParams['spiny'] = (value !== 'none') ? getSpinSpeedAsNumber(value) : undefined;   
  });
  var guiDefaultSpinZ = guiPosition.add( guiDefaultParams, 'spinz', [ 'none', 'slow', 'medium', 'fast' ] ).name('spin z');
  guiDefaultSpinZ.onChange(function(value)
  {   
    globalParams['spinz'] = (value !== 'none') ? getSpinSpeedAsNumber(value) : undefined;   
  });
  var guiDefaultOrbitX = guiPosition.add( guiDefaultParams, 'orbitx', [ 'none', 'slow', 'medium', 'fast' ] ).name('orbit x');
  guiDefaultOrbitX.onChange(function(value)
  {   
    globalParams['orbitx'] = (value !== 'none') ? getOrbitSpeedAsNumber(value) : undefined;   
  });
  var guiDefaultOrbitXRadius = guiPosition.add( guiDefaultParams, 'orbitxradius' ).name('orbit x radius');
  guiDefaultOrbitXRadius.onChange(function(value)
  {   
      globalParams['orbitxradius'] = value; 
  });
  var guiDefaultOrbitY = guiPosition.add( guiDefaultParams, 'orbity', [ 'none', 'slow', 'medium', 'fast' ] ).name('orbit y');
  guiDefaultOrbitY.onChange(function(value)
  {   
    globalParams['orbity'] = (value !== 'none') ? getOrbitSpeedAsNumber(value) : undefined;   
  });
  var guiDefaultOrbitYRadius = guiPosition.add( guiDefaultParams, 'orbityradius' ).name('orbit y radius');
  guiDefaultOrbitYRadius.onChange(function(value)
  {   
      globalParams['orbityradius'] = value;      
  });
  var guiDefaultOrbitZ = guiPosition.add( guiDefaultParams, 'orbitz', [ 'none', 'slow', 'medium', 'fast' ] ).name('orbit z');
  guiDefaultOrbitZ.onChange(function(value)
  {   
    globalParams['orbitz'] = (value !== 'none') ? getOrbitSpeedAsNumber(value) : undefined;   
  });
  var guiDefaultOrbitZRadius = guiPosition.add( guiDefaultParams, 'orbitzradius' ).name('orbit z radius');
  guiDefaultOrbitZRadius.onChange(function(value)
  {   
      globalParams['orbitzradius'] = value;      
  });
  //TODO use diff name, solid sounds like it's related to transparent, but its actually collidable
  var guiDefaultSolid = guiApperance.add( guiDefaultParams, 'solid' );
  guiDefaultSolid.onChange(function(value)
  {   
    //TODO decide to store as boolean or string(bool needs changes in parseParams)
    globalParams['solid'] = value+'';
  });
  gui.close();//?

	//Speech Recognition
	if (annyang) {
  	// Let's define our first command. First the text we expect, and then the function it should call
  	var commands = {
  	  'hello': function() { 
  	  	scene.add(create3DText('Hello!'));
  	  },
  	  'create sphere': function() {
        notify('create sphere');
  	  	scene.add(createSphere(globalParams));
  	  },
  	  'create sphere *params': function(params) {
        notify('create sphere '+params);
  	  	var parsedParams = parseParams(params);
  	  	scene.add(createSphere(parsedParams));
  	  },	  
      'create many spheres': function() {
        notify('create many spheres');
        var spheres = createManySpheres(globalParams);
        for(var i = 0; i < spheres.length; i++) {
          scene.add(spheres[i]);          
        }
      },
  	  'create many spheres *params': function(params) {
        notify('create many spheres '+params);
  	  	var parsedParams = parseParams(params);
  	  	var spheres = createManySpheres(parsedParams);
  	  	for(var i = 0; i < spheres.length; i++) {
  	  		scene.add(spheres[i]);  	  		
  	  	}
  	  },
   	  'create cube': function() {
        notify('create cube');
  	  	scene.add(createCube(''));
  	  },
  	  'create cube *params': function(params) {
        notify('create cube '+params);
  	  	var parsedParams = parseParams(params);
  	  	scene.add(createCube(parsedParams));
  	  },	
      'create many cubes': function() {
        notify('create many cubes');
        var cubes = createManyCubes(globalParams);
        for(var i = 0; i < cubes.length; i++) {
          scene.add(cubes[i]);          
        }
      },
  	  'create many cubes *params': function(params) {
        notify('create many cubes '+params);
  	  	var parsedParams = parseParams(params);
  	  	var cubes = createManyCubes(parsedParams);
  	  	for(var i = 0; i < cubes.length; i++) {
  	  		scene.add(cubes[i]);  	  		
  	  	}
  	  },
  	  'create ring': function() {
        notify('create ring');
  	  	scene.add(createRing(globalParams));
  	  },
  	  'create ring *params': function(params) {
        notify('create ring '+params);
  	  	var parsedParams = parseParams(params);
  	  	scene.add(createRing(parsedParams));
  	  },
      'create many rings': function() {
        notify('create many rings');
        var rings = createManyRings(globalParams);
        for(var i = 0; i < rings.length; i++) {
          scene.add(rings[i]);          
        }
      },
  	  'create many rings *params': function(params) {
        notify('create many rings '+params);
  	  	var parsedParams = parseParams(params);
  	  	var rings = createManyRings(parsedParams);
  	  	for(var i = 0; i < rings.length; i++) {
  	  		scene.add(rings[i]);  	  		
  	  	}
  	  },
   	  //TorusKnot, annyang usually picks up 'not' instead of 'knot'
  	  'create not': function() {
        notify('create knot');
  	  	scene.add(createTorusKnot(globalParams));
  	  },
  	  'create not *params': function(params) {
        notify('create knot '+params);
  	  	var parsedParams = parseParams(params);
  	  	scene.add(createTorusKnot(parsedParams));
  	  },	
      'create many knots': function() {
        notify('create many knots');
        var knots = createManyTorusKnots(globalParams);
        for(var i = 0; i < knots.length; i++) {
          scene.add(knots[i]);          
        }
      },
  	  'create many knots *params': function(params) {
        notify('create many knots '+params);
  	  	var parsedParams = parseParams(params);
  	  	var knots = createManyTorusKnots(parsedParams);
  	  	for(var i = 0; i < knots.length; i++) {
  	  		scene.add(knots[i]);  	  		
  	  	}
  	  },
   	  'create cylinder': function() {
        notify('create cylinder');
  	  	scene.add(createCylinder(globalParams));
  	  },
  	  'create cylinder *params': function(params) {
        notify('create cylinder '+params);
  	  	var parsedParams = parseParams(params);
  	  	scene.add(createCylinder(parsedParams));
  	  },
      'create many cylinders': function() {
        notify('create many cylinders');
        var cylinders = createManyCylinders(globalParams);
        for(var i = 0; i < cylinders.length; i++) {
          scene.add(cylinders[i]);          
        }
      },
  	  'create many cylinders *params': function(params) {
        notify('create many cylinders '+params);
  	  	var parsedParams = parseParams(params);
  	  	var cylinders = createManyCylinders(parsedParams);
  	  	for(var i = 0; i < cylinders.length; i++) {
  	  		scene.add(cylinders[i]);  	  		
  	  	}
  	  },
      'create cone': function() {
        notify('create cone');
        scene.add(createCone(globalParams));
      },
      'create cone *params': function(params) {
        notify('create cone '+params);
        var parsedParams = parseParams(params);
        scene.add(createCone(parsedParams));
      },
      'create many cones': function() {
        notify('create many cones');
        var cones = createManyCones(globalParams);
        for(var i = 0; i < cones.length; i++) {
          scene.add(cones[i]);          
        }
      },
      'create many cones *params': function(params) {
        notify('create many cones '+params);
        var parsedParams = parseParams(params);
        var cones = createManyCones(parsedParams);
        for(var i = 0; i < cones.length; i++) {
          scene.add(cones[i]);          
        }
      },
  	  /*'create octa': function() {
        notify('create octahedron');
  	  	scene.add(createOctahedron(0,50,0,50,0xffb6c1));
  	  },
  	  'create octa *params': function(params) {
        notify('create octahedron '+params);
  	  	var pp = parseParams(params);
  	  	scene.add(createOctahedron(pp['x'],pp['y'],pp['z'],
  	  		pp['size'],pp['color'],pp['transparent']));
  	  }, 
  	  'create octahedron': function() {
        notify('create octahedron');
  	  	scene.add(createOctahedron(0,50,0,50,0xffb6c1));
  	  },
  	  'create octahedron *params': function(params) {
        notify('create octahedron '+params);
  	  	var pp = parseParams(params);
  	  	scene.add(createOctahedron(pp['x'],pp['y'],pp['z'],
  	  		pp['size'],pp['color'],pp['transparent']));
  	  }, 
   	  'create tetra': function() {
        notify('create tetrahedron');
  	  	scene.add(createTetrahedron(0,50,0,50,0xffb6c1));
  	  },
  	  'create tetra *params': function(params) {
        notify('create tetrahedron '+params);
  	  	var pp = parseParams(params);
  	  	scene.add(createTetrahedron(pp['x'],pp['y'],pp['z'],
  	  		pp['size'],pp['color'],pp['transparent']));
  	  },    	  
  	  'create tetrahedron': function() {
        notify('create tetrahedron');
  	  	scene.add(createTetrahedron(0,50,0,50,0xffb6c1));
  	  },
  	  'create tetrahedron *params': function(params) {
        notify('create tetrahedron '+params);
  	  	var pp = parseParams(params);
  	  	scene.add(createTetrahedron(pp['x'],pp['y'],pp['z'],
  	  		pp['size'],pp['color'],pp['transparent']));
  	  },
   	  'create dodeca': function() {
        notify('create dodecahedron');
  	  	scene.add(createDodecahedron(0,50,0,50,0xffb6c1));
  	  },
  	  'create dodeca *params': function(params) {
        notify('create dodecahedron '+params);
  	  	var pp = parseParams(params);
  	  	scene.add(createDodecahedron(pp['x'],pp['y'],pp['z'],
  	  		pp['size'],pp['color'],pp['transparent']));
  	  },    	  
  	  'create dodecahedron': function() {
        notify('create dodecahedron');
  	  	scene.add(createDodecahedron(0,50,0,50,0xffb6c1));
  	  },
  	  'create dodecahedron *params': function(params) {
        notify('create dodecahedron '+params);
  	  	var pp = parseParams(params);
  	  	scene.add(createDodecahedron(pp['x'],pp['y'],pp['z'],
  	  		pp['size'],pp['color'],pp['transparent']));
  	  },
   	  'create icosa': function() {
        notify('create icosahedron');
  	  	scene.add(createIcosahedron(0,50,0,50,0xffb6c1));
  	  },
  	  'create icosa *params': function(params) {
        notify('create icosahedron '+params);
  	  	var pp = parseParams(params);
  	  	scene.add(createIcosahedron(pp['x'],pp['y'],pp['z'],
  	  		pp['size'],pp['color'],pp['transparent']));
  	  },    	  
  	  'create icosahedron': function() {
        notify('create icosahedron');
  	  	scene.add(createIcosahedron(0,50,0,50,0xffb6c1));
  	  },
  	  'create icosahedron *params': function(params) {
        notify('create icosahedron '+params);
  	  	var pp = parseParams(params);
  	  	scene.add(createIcosahedron(pp['x'],pp['y'],pp['z'],
  	  		pp['size'],pp['color'],pp['transparent']));
  	  },*/
      'create bubble': function() {
        notify('create bubble');
        scene.add(createBubble(globalParams));
      },
      'create bubble *params': function(params) {
        notify('create bubble '+params);
        var parsedParams = parseParams(params);
        scene.add(createBubble(parsedParams));
      },
      'create many bubbles': function() {
        notify('create many bubbles');
        var geoms = createManyBubbles(globalParams);   
        for(var i = 0; i < geoms.length; i++) {
          scene.add(geoms[i]);          
        }       
      },
      'create many bubbles *params': function(params) {
        notify('create many bubbles '+params);
        var parsedParams = parseParams(params);
        var geoms = createManyBubbles(parsedParams);   
        for(var i = 0; i < geoms.length; i++) {
          scene.add(geoms[i]);          
        }
      },
      'create mirror': function() {
        notify('create mirror');
        scene.add(createMirror(globalParams));
      },
      'create mirror *params': function(params) {
        notify('create mirror '+params);
        var parsedParams = parseParams(params);
        scene.add(createMirror(parsedParams));
      },
      'create many mirrors': function() {
        notify('create many mirrors');
        var geoms = createManyMirrors(globalParams);   
        for(var i = 0; i < geoms.length; i++) {
          scene.add(geoms[i]);          
        }
      },
      'create many mirrors *params': function(params) {
        notify('create many mirrors '+params);
        var parsedParams = parseParams(params);
        var geoms = createManyMirrors(parsedParams);   
        for(var i = 0; i < geoms.length; i++) {
          scene.add(geoms[i]);          
        }
      },
 			'create floor': function() {
        notify('create floor');
  	  	scene.add(createFloor({y:0,size:1000}));
  	  },
   	  'create floor *params': function(params) {
        notify('create floor '+params);
  	  	var parsedParams = parseParams(params);
  	  	scene.add(createFloor(parsedParams));
  	  },	
      'create many floors': function() {
        notify('create many floors');
        var floors = createManyFloors(globalParams);
        for(var i = 0; i < floors.length; i++) {
          scene.add(floors[i]);          
        }
      },      
      'create many floors *params': function(params) {
        notify('create many floors '+params);
        var parsedParams = parseParams(params);
        var floors = createManyFloors(parsedParams);
        for(var i = 0; i < floors.length; i++) {
          scene.add(floors[i]);          
        }
      },
 			'create wall': function() {
        notify('create wall');
  	  	scene.add(createWall({x:-150,y:500,size:1000}));
  	  },
   	  'create wall *params': function(params) {
        notify('create wall '+params);
  	  	var parsedParams = parseParams(params);
  	  	scene.add(createWall(parsedParams));
  	  },
      'create many walls': function() {
        notify('create many walls');
        var testrings = createManyWalls(parseParams('')); 
        for(var i = 0; i < testrings.length; i++) {
          scene.add(testrings[i]);          
        }
      },
      'create many walls *params': function(params) {
        notify('create many walls '+params);
        var parsedParams = parseParams(params);
        var walls = createManyWalls(parsedParams);
        for(var i = 0; i < walls.length; i++) {
          scene.add(walls[i]);          
        }
      },
      'create back wall': function() {
        notify('create back wall');
        scene.add(createBackWall({x:0,y:0,z:-500,size:1000}));
      },
      'create back wall *params': function(params) {
        notify('create back wall '+params);
        var parsedParams = parseParams(params);
        scene.add(createBackWall(parsedParams));
      },
   	  'create text *text': function(text) {
        notify('create text '+text);
  	  	scene.add(create3DText(text));
  	  },
      'set *params': function(params) {
        notify('set '+params);
        //pass globalParams as second arg to set the globalParams
        parseParams(params, globalParams);
        updateGUI(globalParams);
      },
  	  'set default *params': function(params) {
        notify('set default '+params);
        //pass globalParams as second arg to set the globalParams
        parseParams(params, globalParams);
        updateGUI(globalParams);
  	  },
      'reset default': function() {
        notify('reset default');
        //reset all default params
        resetGlobalParams();
      },
      'reset default *params': function(params) {
        notify('reset default '+params);
        resetGlobalParams(params);
      },
  	  'undo': function() {
        notify('undo');
  	  	undo();
  	  },
      'save': function() {
        notify('save');
        document.getElementById('link').click();
      },
      'upload': function() {
        notify('upload');
        document.getElementById('uploadFile').style.visibility = 'visible';
      },
      'upload *': function() {
        notify('upload *');
        document.getElementById('uploadFile').style.visibility = 'visible';
      },
      'pause': function() {
        notify('pause');
        showPauseScreen();
      },
      'unpause': function() {
        notify('unpause');
        hidePauseScreen();
      },
      'open console': function() {
        notify('open console');
        openConsole();
      },
      'close console': function() {
        notify('close console');
        closeConsole();
      },
      'test everything': function() {
        notify('test everything');
        testEverything();
      },
      'test': function() {
        notify('test');
        testEverything();
      },
      'gravity on': function() {
        notify('gravity on');
        gravAndColl = true;
      },
      'gravity off': function() {
        notify('gravity off');
        gravAndColl = false;
      }
  	};

  	// Add our commands to annyang
  	annyang.addCommands(commands);

  	// Start listening. You can call this here, or attach this call to an event, button, etc.
  	annyang.start();
	}

  //controls from http://stemkoski.github.io/7DFPS/3JSFPS.html
  // Mouse Look (Free Look) controls 
  this.mouseLook = { x:0, y:0 };
  //document.addEventListener( 'click', function ( event ) 
  //want pointer lock only on the ThreeJS div, not the overlaying UI
  container.addEventListener( 'click', function ( event ) 
  {
    if(!consoleOpen){
      var havePointerLock = 'pointerLockElement' in document ||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;
      if ( !havePointerLock ) return;

      var element = document.body;
    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock ||
    element.mozRequestPointerLock ||
    element.webkitRequestPointerLock;
    // Ask the browser to lock the pointer
    element.requestPointerLock();
    
    // Hook pointer lock state change events
    document.addEventListener(      'pointerlockchange', pointerLockChange, false);
    document.addEventListener(   'mozpointerlockchange', pointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
    
    // Hook mouse move events
    // document.addEventListener("mousemove", this.moveCallback, false);
    }
  }, false );

  blocker.addEventListener( 'click', function ( event ) 
  {
      if(paused) {
        hidePauseScreen();
      } 
  }, false );
}

function moveCallback(e)
{
  var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
  var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
  // store movement amounts; will be processed by update function.
  mouseLook.x += movementX;
  mouseLook.y += movementY;
}

function pointerLockChange(event)
{
  var element = document.body;
  if (document.pointerLockElement       === element ||
      document.mozPointerLockElement    === element ||
        document.webkitPointerLockElement === element) 
  {
    // Pointer was just locked, enable the mousemove listener
    document.addEventListener("mousemove", moveCallback, false);
  } 
  else 
  {
    // Pointer was just unlocked, disable the mousemove listener
    document.removeEventListener("mousemove", moveCallback, false);
  }
}

function projectXZ(v)
{ return new THREE.Vector3(v.x, 0, v.z); }

function animate() {
  requestAnimationFrame( animate );
	render();		
	update();
}

function update() {
	//TODO, it's really bugged due to hold down
	if ( keyboard.pressed("ctrl+z") && !undoing) { 
		undoing = true;
		undo();
		setInterval(function() {undoing=false;}, 1000);
	}

  //original controls from http://stemkoski.github.io/7DFPS/3JSFPS.html
  var delta = clock.getDelta(); // seconds since last update
  var rotateAngle = Math.PI / 4 * delta;   // pi/4 radians (45 degrees) per second
  var move = { xDist: 0, yAngle: 0, zDist: 0 };

  // process data from mouse look
  //  (if inactive, there will be no change)
  move.yAngle -= rotateAngle * mouseLook.x * 0.1;
  mouseLook.x = 0;    
  user.rotateY( move.yAngle );
  // process data from mouse look
  //  (if inactive, there will be no change)
  camera.rotateX( -rotateAngle * mouseLook.y * 0.05 );
  mouseLook.y = 0;
  // limit camera to +/- 45 degrees (0.7071 radians) or +/- 60 degrees (1.04 radians)
  // or +/- 74 degrees (1.31 radians)
  camera.rotation.x = THREE.Math.clamp( camera.rotation.x, -1.31, 1.31 );

  //don't want keyboard controls to work when user is typing in a command
  if(!consoleOpen) {
	 //controls.update();//TODO, have both????
    if (keyboard.pressed("O")) {
      openConsole();
    }

    var moveDistance = 200 * delta; // 200 pixels per second  // should be velocity?
    var cursorSpeed = 200 * delta;
  
    // forwards/backwards
    if (keyboard.pressed("W"))
      move.zDist -= moveDistance;
    if (keyboard.pressed("S"))
      move.zDist += moveDistance;
    // turn left/right
    if (keyboard.pressed("Q"))
      move.yAngle += rotateAngle;
    if (keyboard.pressed("E"))
      move.yAngle -= rotateAngle;
    // left/right (strafe)
    if ( keyboard.pressed("A") )
      move.xDist -= moveDistance;
    if ( keyboard.pressed("D") )
      move.xDist += moveDistance;
    
    // up/down (debugging fly)
    if ( keyboard.pressed("R") )
    {
      user.velocity = new THREE.Vector3(0,0,0);
      user.translateY( moveDistance );
    }
    if ( keyboard.pressed("F") )
    {
      user.velocity = new THREE.Vector3(0,0,0);
      user.translateY( -moveDistance );
    }

    user.translateZ( move.zDist );
    user.rotateY( move.yAngle );
    user.translateX( move.xDist );
    user.updateMatrix();

    // look up/down
    if ( keyboard.pressed("3") ) {// third-person view
      camera.position.set(0,50,250);
      bounding.visible = true;
    }
    if ( keyboard.pressed("1") ) {// first-person view
      camera.position.set(0,35,10);
      bounding.visible = false;
    }
    if ( keyboard.pressed("T") )
      camera.rotateX(  rotateAngle );
    if ( keyboard.pressed("G") )
      camera.rotateX( -rotateAngle );
    
  // limit camera to +/- 45 degrees (0.7071 radians) or +/- 60 degrees (1.04 radians)
  /*camera.rotation.x = THREE.Math.clamp( camera.rotation.x, -1.04, 1.04 );*/

    // pressing both buttons moves look angle to horizon
    if ( keyboard.pressed("R") && keyboard.pressed("F") )
      camera.rotateX( -6 * camera.rotation.x * rotateAngle );
  
    user.translateY( user.velocity.y );

    if(gravAndColl) {
      // collision detection!
      if ( collision( solids ) )
      {
        user.translateX( -move.xDist );
        user.rotateY( -move.yAngle );
        user.translateY( 3 );
        user.translateZ( -move.zDist );
        user.updateMatrix();
        if ( collision( solids ) ) {
            //TODO
            //console.log( "Something's wrong with collision..." );
        }
      }
      if ( keyboard.pressed("space") && (user.velocity.y <= 0 )) {
        user.velocity = new THREE.Vector3(0,jumpVelocity,0);
      }
      //dont speed up forever when falling
      if(user.velocity.y < 14){
        user.velocity.add( gravity.clone().multiplyScalar( delta ) );
      }
      user.translateY( user.velocity.y );
      user.updateMatrix();
      if ( collision(solids) ) {
        user.translateY( -user.velocity.y );
        user.updateMatrix();
        user.velocity = new THREE.Vector3(0,0,0);
      }
    }
    //if not paused
    if(!paused) {
      if ( keyboard.pressed("P") ) {
        //pause
        showPauseScreen();
      }
    }
    //if paused
    else if ( keyboard.pressed("U") ) {
        //unpause
        hidePauseScreen();
    }
  }
  else {
    if (keyboard.pressed("ctrl+0")) {
      closeConsole();
    }
  }
	stats.update();
}
// returns true on intersection
function collision( wallArray )
{
  // send rays from center of person to each vertex in bounding geometry
  for (var vertexIndex = 0; vertexIndex < user.children[1].geometry.vertices.length; vertexIndex++)
  {   
    var localVertex = user.children[1].geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4( user.matrix );
    var directionVector = globalVertex.sub( user.position );
    
    var ray = new THREE.Raycaster( user.position, directionVector.clone().normalize() );
    var collisionResults = ray.intersectObjects( wallArray );
    if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
      return true;
  }
  return false;
}
function render() {
  //bubble
  if(bubbles) {
    bubbleMesh.visible = false;
    refractSphereCamera.updateCubeMap( renderer, scene );
    bubbleMesh.visible = true;
  }

  //mirror
  if(mirrors) {
    mirrorMesh.visible = false;
    mirrorCamera.updateCubeMap( renderer, scene );
    mirrorMesh.visible = true;
  }

  //spin
  var spinParams;
  for (var i = 0; i < spinningMeshs.length; i++) {
    spinParams = spinningParams[i];
    spinningMeshs[i].rotation.x +=spinParams['x'];
    spinningMeshs[i].rotation.y +=spinParams['y'];
    spinningMeshs[i].rotation.z +=spinParams['z'];
  }

  //movement/oscillations
  if(movingMeshs.length > 0) {
    var moveParams;
    var currentx, startx, endx;
    var currenty, starty, endy;
    var currentz, startz, endz;
    var xdir, ydir, zdir; // positive number = positive direction on axis
    for (var i = 0; i < movingMeshs.length; i++) {
      moveParams = movingParams[i];
      //move along x-axis
      if(moveParams['xdir'] != undefined) {
        currentx = +movingMeshs[i].position.x;
        startx = +moveParams['movex'];
        endx = +moveParams['endmovex'];
        xdir = +moveParams['xdir'];
        if(currentx <= endx && currentx >= startx) {
          movingMeshs[i].position.x = +xdir+currentx;
        }
        else {
          if(xdir > 0) {
            movingMeshs[i].position.x = +endx-1;
          }
          else {
            movingMeshs[i].position.x = +startx+1;
          }
          moveParams['xdir'] = -1*xdir;
        }
      }
      //move along y axis
      if(moveParams['ydir'] != undefined) {
        currenty = +movingMeshs[i].position.y;
        starty = +moveParams['movey'];
        endy = +moveParams['endmovey'];
        ydir = +moveParams['ydir'];
        if(currenty <=endy && currenty >= starty) {
          movingMeshs[i].position.y = +ydir+currenty;
        }
        else {
          if(ydir > 0) {
            movingMeshs[i].position.y = +endy-1;
          }
          else {
            movingMeshs[i].position.y = +starty+1;
          }
          moveParams['ydir'] = -1*ydir;
        }
      }
      //move along z axis
      if(moveParams['zdir'] != undefined) {
        currentz = +movingMeshs[i].position.z;
        startz = +moveParams['movez'];
        endz = +moveParams['endmovez'];
        zdir = +moveParams['zdir'];
        if(currentz <=endz && currentz >= startz) {
          movingMeshs[i].position.z = +zdir+currentz;
        }
        else {
          if(zdir > 0) {
            movingMeshs[i].position.z = +endz-1;
          }
          else {
            movingMeshs[i].position.z = +startz+1;
          }
          moveParams['zdir'] = -1*zdir;
        }
      }
    }
  }
  //orbit
  if(orbittingMeshs.length > 0) {
    t += 0.01;
    var orbitParams;
    var radius;
    var xpos, ypos, zpos;
    for (var i = 0; i < orbittingMeshs.length; i++) {
      orbitParams = orbittingParams[i];
      xpos = +orbitParams['xpos'];
      ypos = +orbitParams['ypos'];
      zpos = +orbitParams['zpos'];
      if(orbitParams['x'] != 0) {
        radius = orbitParams['xradius'];
        orbittingMeshs[i].position.y = ypos+Math.cos(t*orbitParams['x'])*radius;
        orbittingMeshs[i].position.z = zpos+Math.sin(t*orbitParams['x'])*radius;
      }
      if(orbitParams['y'] != 0) {
        radius = orbitParams['yradius'];
        orbittingMeshs[i].position.x = xpos+Math.cos(t*orbitParams['y'])*radius;
        orbittingMeshs[i].position.z = zpos+Math.sin(t*orbitParams['y'])*radius;
      }
      if(orbitParams['z'] != 0) {
        radius = orbitParams['zradius'];
        orbittingMeshs[i].position.x = xpos+Math.cos(t*orbitParams['z'])*radius;
        orbittingMeshs[i].position.y = ypos+Math.sin(t*orbitParams['z'])*radius;
      }
    }
  }
	renderer.render( scene, camera );
}

function showPauseScreen() {
  blocker.style.display = '-webkit-box';
  blocker.style.display = '-moz-box';
  blocker.style.display = 'box';
  instructions.style.display = '';
  saveButton.style.visibility = 'visible';
  uploadFile.style.visibility = 'visible';
  paused = true;
}
function hidePauseScreen() {
  blocker.style.display = 'none';    
  saveButton.style.visibility = 'hidden';
  uploadFile.style.visibility = 'hidden';
  paused = false;
}
  ///////////////////////////////////
 //METHODS FOR CREATING GEOMETRIES//
///////////////////////////////////

function create3DText(text) {
  return createGeometry(text,'TextGeometry');
}
function createSphere(params) {
	return createGeometry(params,'SphereGeometry');
}
function createCube(params) {
	return createGeometry(params,'BoxGeometry');
}
function createRing(params) {
	return createGeometry(params,'RingGeometry');
}
function createTorusKnot(params) {
	return createGeometry(params,'TorusKnotGeometry');
}
function createCylinder(params) {
	return createGeometry(params,'CylinderGeometry');
}
function createCone(params) {
  return createGeometry(params,'ConeGeometry');
}
function createBubble(params) {
  return createGeometry(params,'Bubble');
}
function createManyBubbles(params) {
  return createGeometry(params,'Bubble',true);
}
function createMirror(params) {
  return createGeometry(params,'Mirror');
}
function createManyMirrors(params) {
  return createGeometry(params,'Mirror',true);
}
/*function createOctahedron(x,y,z,size,color,transparent) {

}
function createTetrahedron(x,y,z,size,color,transparent) {

}
function createDodecahedron(x,y,z,size,color,transparent) {

}
function createIcosahedron(x,y,z,size,color,transparent) {

}*/

//functions for creating mulitple geometries of the same type with a single command
function createManySpheres(params) {
	return createGeometry(params, 'SphereGeometry',true);
}
function createManyCubes(params) {
	return createGeometry(params, 'BoxGeometry',true);
}
function createManyRings(params) {
	return createGeometry(params, 'RingGeometry',true);
}
function createManyTorusKnots(params) {
	return createGeometry(params, 'TorusKnotGeometry',true);
}
function createManyCylinders(params) {
	return createGeometry(params, 'CylinderGeometry',true);
}
function createManyCones(params) {
  return createGeometry(params, 'ConeGeometry',true);
}
function createGeometry(params, geometry, many) {
  var color = params['color'];
  var ambient = params['ambient'];
  var texture = params['texture'];
  //color/ambient not yet resolved
  var resolvedParams = resolveParams(params);
  var x = resolvedParams['x'];
  var y = resolvedParams['y'];
  var z = resolvedParams['z'];
  var size = resolvedParams['size'];
  //var texture = resolvedParams['texture'];
  var btrans = resolvedParams['btrans'];
  var amount = resolvedParams['amount'];
  var endx = resolvedParams['endx'];
  var endy = resolvedParams['endy'];
  var endz = resolvedParams['endz'];
  var endsize = resolvedParams['endsize'];
  var width = resolvedParams['width'];
  var height = resolvedParams['height'];
  var depth = resolvedParams['depth'];
  var spin = resolvedParams['spin'];
  var spinx = resolvedParams['spinx'];
  var spiny = resolvedParams['spiny'];
  var spinz = resolvedParams['spinz'];
  var move = resolvedParams['move'];
  var movexspeed = resolvedParams['movexspeed'];
  var moveyspeed = resolvedParams['moveyspeed'];
  var movezspeed = resolvedParams['movezspeed'];
  var material = resolvedParams['material'];
  var solid = resolvedParams['solid'];
  var orbit = resolvedParams['orbit'];
  var orbitx = resolvedParams['orbitx'];
  var orbity = resolvedParams['orbity'];
  var orbitz = resolvedParams['orbitz'];
  var orbitxradius = resolvedParams['orbitxradius'];
  var orbityradius = resolvedParams['orbityradius'];
  var orbitzradius = resolvedParams['orbitzradius'];

  var defaultTexture = globalParams['texture'];
  //for deciding when to use default material vs explicit color or texture
  var useColorOrTextureInstead = false;
  if(((texture != undefined && texture != 'none') 
      || (defaultTexture != undefined && defaultTexture != 'none') 
      || (color != undefined && color != "16758465"))
      && (material == undefined || material == 'none')) {
    useColorOrTextureInstead = true;
  }
  //TODO ambient
  //color given in command, no texture given
  if((texture == undefined || texture == 'none') && color != undefined) {
    if(ambient == undefined) {
      //TODO might cause some kinda light pink bug
      if(globalParams['ambient'] == undefined || ambient == '#ffb6c1') {
        ambient = color;
      }
      else {
        ambient = globalParams['ambient'];
      }
    }
    var geometryMaterial = new THREE.MeshPhongMaterial( { 
      color: color, 
      ambient: ambient,  
      transparent: btrans, 
      blending: THREE.AdditiveBlending 
    } );
  }
  //no color or texture given, no default texture so use default color
  else if((texture == undefined || texture == 'none') 
      && (defaultTexture == undefined || defaultTexture == 'none') 
      && color == undefined) {
    color = globalParams['color'];
    if(ambient == undefined) {
      ambient = (globalParams['ambient'] == undefined) ? color : globalParams['ambient'];
    }
    var geometryMaterial = new THREE.MeshPhongMaterial( { 
      color: color, 
      ambient: ambient,  
      transparent: btrans, 
      blending: THREE.AdditiveBlending 
    } );
  }
  //has either texture or default texture
  else {
    if(texture == undefined || texture == 'none')  {
      texture = defaultTexture;
    }
    var wallTexture;
    if(texture != 'random') {
      wallTexture = new THREE.ImageUtils.loadTexture( 'images/' + textures[texture] );
    }
    else {
      var rand = getRandomInt(0,texturesLength-1);
      var i = 0;
      for(var t in textures) {
        if(rand == i) {
          wallTexture = new THREE.ImageUtils.loadTexture( 'images/' + textures[t] );
        }
        i++;
      }
    }
    if(wallTexture == undefined) {
          wallTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );      
    }
    if(texture != 'hearts') {
      wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping; 
      if(size > 1000) {
        wallTexture.repeat.set( 10, 10 );
      }
      else {
        wallTexture.repeat.set( size/textureRepeatAmount, size/textureRepeatAmount );
      }
    }
    else {//texture image size not a power of 2
      wallTexture.minFilter = THREE.NearestFilter;
    }
    var geometryMaterial = new THREE.MeshBasicMaterial( { map: wallTexture, side: THREE.DoubleSide, transparent: btrans } );
  }

  if(many == undefined) {
    many = false;
  }

  var meshs = [];
  var divisor = amount - 1;
  var xIncrement = +(endx-x)/divisor;
  var yIncrement = +(endy-y)/divisor;
  var zIncrement = +(endz-z)/divisor;
  //if we only create one geometry or many of the same size
  if(endsize == undefined || !many) {
    if(geometry == 'BoxGeometry'){
      if(width == undefined) {
        width = size;
      }
      var geom = new THREE.BoxGeometry(width,height,depth);
    }
    else if(geometry == 'SphereGeometry' || geometry == 'Bubble'){
      var geom = new THREE.SphereGeometry(size);
    }
    else if(geometry == 'CylinderGeometry'){
      if(width == undefined) {
        var geom = new THREE.CylinderGeometry(size*2/5,size*2/5,height);
      }
      else {
        var geom = new THREE.CylinderGeometry(width,width,height);          
      }
    }
    else if(geometry == 'RingGeometry'){
      if(width == undefined) {
        var geom = new THREE.RingGeometry(size/5,size);
      }
      else {
        var geom = new THREE.RingGeometry((size-width),size);          
      }
    }
    else if(geometry == 'TorusKnotGeometry'){
      if(width == undefined) {
        var geom = new THREE.TorusKnotGeometry(size);
      }
      else {
        var geom = new THREE.TorusKnotGeometry(size, width);          
      }
    }
    else if(geometry == 'ConeGeometry') {
      if(width == undefined) {
        var geom = new THREE.CylinderGeometry(0,size*2/5,height);
      }
      else {
        var geom = new THREE.CylinderGeometry(0,width,height);          
      }
    }
    else if(geometry == 'TextGeometry') {
      //TODO, this will cause issues if text has Speak3D keywords/params in it(not here tho)
      text = params;
      var geom = new THREE.TextGeometry( text, 
      {
        size: 30, height: 4, curveSegments: 3,
        font: "helvetiker", weight: "bold", style: "normal",
        bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
        material: 0, extrudeMaterial: 1
      });
    }
    else if(geometry == 'Mirror') {
      if(width == undefined) {
        width = size;
      }
      var geom = new THREE.BoxGeometry(width,height,depth);
    }
    if(!many) {
      if((material != undefined && material != 'none' && !useColorOrTextureInstead)
        || geometry == 'Bubble' || geometry == 'Mirror') {
        //TODO bubble/refactcamera/position
        if(material == 'bubble' || geometry == 'Bubble') {
          bubbles = true;
          bubbleMesh = new THREE.Mesh(geom, bubbleMaterial ); 
          bubbleMesh.position.set( x, y, z );
          if(spin == true) {
            initSpinMesh(bubbleMesh,spinx,spiny,spinz);
          }
          if(move == true) {           
            initMovingMesh(bubbleMesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
          }
          if(orbit == true) {
            initOrbitMesh(bubbleMesh,orbitx,orbity,orbitz,orbitxradius,orbityradius,orbitzradius);
          }
          addToMeshs(bubbleMesh,solid);//increases numberOfMeshs by 1
          return bubbleMesh;
        }
        else if(material == 'mirror' || geometry == 'Mirror') {
          mirrors = true;
          mapMirrorCamera( x, y, z );
          mirrorMesh = new THREE.Mesh(geom, mirrorMaterial ); 
          mirrorMesh.position.set( x, y, z );
          if(spin == true) {
            initSpinMesh(mirrorMesh,spinx,spiny,spinz);
          }
          if(move == true) {
            initMovingMesh(mirrorMesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
          }
          if(orbit == true) {
            initOrbitMesh(mirrorMesh,orbitx,orbity,orbitz,orbitxradius,orbityradius,orbitzradius);
          }
          addToMeshs(mirrorMesh,solid);//increases numberOfMeshs by 1
          return mirrorMesh;
        }
      } 
      else {
        var mesh = new THREE.Mesh(geom, geometryMaterial ); 
        mesh.position.set( x, y, z );
        if(spin == true) {
          initSpinMesh(mesh,spinx,spiny,spinz);
        }
        if(move == true) {
          initMovingMesh(mesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
        }
        if(orbit == true) {
          initOrbitMesh(mesh,orbitx,orbity,orbitz,orbitxradius,orbityradius,orbitzradius);
        }
        addToMeshs(mesh,solid);//increases numberOfMeshs by 1
        return mesh;
      }
    }
    else {
      if((material != undefined && material != 'none' && !useColorOrTextureInstead) 
        || geometry == 'Bubble' || geometry == 'Mirror') {
        if(material == 'bubble' || geometry == 'Bubble') {
          bubbles = true;
          for(var i = 0; i < amount; i++) {
            bubbleMesh = new THREE.Mesh(geom, bubbleMaterial ); 
            bubbleMesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
            meshs[i] = bubbleMesh;
            if(spin == true) {
              initSpinMesh(bubbleMesh,spinx,spiny,spinz);
            }
            if(move == true) {
              initMovingMesh(bubbleMesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
            }
            if(orbit == true) {
              initOrbitMesh(bubbleMesh,orbitx,orbity,orbitz,orbitxradius,orbityradius,orbitzradius);
            }
            addToMeshs(bubbleMesh,solid);
          }          
          return meshs;
        }
        if(material == 'mirror' || geometry == 'Mirror') {
          mirrors = true;
         // mapMirrorCameraToMirrorMaterial( +x, +y, +z  );
          mapMirrorCamera( x, y, z  );
          for(var i = 0; i < amount; i++) {
            mirrorMesh = new THREE.Mesh(geom, mirrorMaterial ); 
            mirrorMesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
            meshs[i] = mirrorMesh;
            if(spin == true) {
              initSpinMesh(mirrorMesh,spinx,spiny,spinz);
            }
            if(move == true) {
              initMovingMesh(mirrorMesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
            }
            if(orbit == true) {
              initOrbitMesh(mirrorMesh,orbitx,orbity,orbitz,orbitxradius,orbityradius,orbitzradius);
            }
            addToMeshs(mirrorMesh,solid);
          }          
          return meshs;
        }
      }
      else{
        for(var i = 0; i < amount; i++) {
          var mesh = new THREE.Mesh(geom, geometryMaterial ); 
          mesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
          meshs[i] = mesh;
          if(spin == true) {
            initSpinMesh(mesh,spinx,spiny,spinz);
          }
          if(move == true) {
            initMovingMesh(mesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
          }
          if(orbit == true) {
            initOrbitMesh(mesh,orbitx,orbity,orbitz,orbitxradius,orbityradius,orbitzradius);
          }
          addToMeshs(mesh,solid);
        }
        return meshs;
      }
    }
  }
  //else we are creating many geometries of different sizes
  else {
    var sizeIncrement = (endsize-size)/divisor;
    var newSize;
    if(geometry == 'BoxGeometry'){
      for(var i = 0; i < amount; i++) {
        newSize = +size+i*sizeIncrement;
        var geom = new THREE.BoxGeometry(newSize,newSize,newSize);
        var mesh = new THREE.Mesh(geom, geometryMaterial ); 
        mesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
        meshs[i] = mesh;
        if(spin == true) {
          initSpinMesh(mesh,spinx,spiny,spinz);
        }
        if(move == true) {
          initMovingMesh(mesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
        }
        addToMeshs(mesh,solid);
      }
    }
    else if(geometry == 'SphereGeometry'){
      for(var i = 0; i < amount; i++) {
        newSize = +size+i*sizeIncrement;
        var geom = new THREE.SphereGeometry(newSize);
        var mesh = new THREE.Mesh(geom, geometryMaterial ); 
        mesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
        meshs[i] = mesh;
        if(spin == true) {
          initSpinMesh(mesh,spinx,spiny,spinz);
        }
        if(move == true) {
          initMovingMesh(mesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
        }
        addToMeshs(mesh,solid);
      }
    }
    else if(geometry == 'CylinderGeometry'){
      for(var i = 0; i < amount; i++) {
        newSize = +size+i*sizeIncrement;
        if(width == undefined) {
          var geom = new THREE.CylinderGeometry(newSize*2/5,newSize*2/5,newSize);
        }
        else {
          var geom = new THREE.CylinderGeometry(width,width,newSize);          
        }
        var mesh = new THREE.Mesh(geom, geometryMaterial ); 
        mesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
        meshs[i] = mesh;
        if(spin == true) {
          initSpinMesh(mesh,spinx,spiny,spinz);
        }
        if(move == true) {
          initMovingMesh(mesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
        }
        addToMeshs(mesh,solid);
      }
    }
    else if(geometry == 'RingGeometry'){
      for(var i = 0; i < amount; i++) {
        newSize = +size+i*sizeIncrement;
        if(width == undefined) {
          var geom = new THREE.RingGeometry(newSize/5,newSize);
        }
        else {
          var geom = new THREE.RingGeometry((newSize-width),newSize);          
        }
        var mesh = new THREE.Mesh(geom, geometryMaterial ); 
        mesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
        meshs[i] = mesh;
        if(spin == true) {
          initSpinMesh(mesh,spinx,spiny,spinz);
        }
        if(move == true) {
          initMovingMesh(mesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
        }
        addToMeshs(mesh,solid);
      }
    }
    else if(geometry == 'TorusKnotGeometry'){
      for(var i = 0; i < amount; i++) {
        newSize = +size+i*sizeIncrement;
        if(width == undefined) {
          var geom = new THREE.TorusKnotGeometry(newSize);
        }
        else {
          var geom = new THREE.TorusKnotGeometry(newSize, width);      
        }
        var mesh = new THREE.Mesh(geom, geometryMaterial ); 
        mesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
        meshs[i] = mesh;
        if(spin == true) {
          initSpinMesh(mesh,spinx,spiny,spinz);
        }
        if(move == true) {
          initMovingMesh(mesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
        }
        addToMeshs(mesh,solid);
      }
    }
    else if(geometry == 'ConeGeometry') {
      for(var i = 0; i < amount; i++) {
        newSize = +size+i*sizeIncrement;
        if(width == undefined) {
          var geom = new THREE.CylinderGeometry(0,newSize*2/5,newSize);
        }
        else {
          var geom = new THREE.CylinderGeometry(0,width,newSize);      
        }
        var mesh = new THREE.Mesh(geom, geometryMaterial ); 
        mesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
        meshs[i] = mesh;
        if(spin == true) {
          initSpinMesh(mesh,spinx,spiny,spinz);
        }
        if(move == true) {
          initMovingMesh(mesh,x,y,z,endx,endy,endz,movexspeed,moveyspeed,movezspeed);
        }
        addToMeshs(mesh,solid);
      }
    }
    return meshs; 
  }
}
function createFloor(params) {
  return createFloorOrWall(params, 'Floor');
}
function createWall(params) {
  return createFloorOrWall(params, 'Wall');
}
function createBackWall(params) {
  return createFloorOrWall(params, 'BackWall');
}
function createManyFloors(params) {
  return createFloorOrWall(params,'Floor',true);
}
function createManyWalls(params) {
  return createFloorOrWall(params,'Wall',true);
}
function createManyBackWalls(params) {
  return createFloorOrWall(params,'BackWall',true);
}
function createFloorOrWall(params,floorOrWall,many) {
  //don't use resolve method because default are different
  //TODO actually maybe use resolve but check xyz size first and set them before
  var texture = params['texture'];
  var x = params['x'];
  var y = params['y'];
  var z = params['z'];
  var size = params['size'];
  var transparent = params['transparent'];
  var amount = params['amount'];
  var endx = params['endx'];
  var endy = params['endy'];
  var endz = params['endz'];
  var endsize = params['endsize'];
  var width = params['width'];
  if(x == undefined){
    x = 0;
  }
  if(y == undefined){
    y = (floorOrWall == 'Floor') ? 0 : 500;
    /*if(floorOrWall == 'Floor') {
      y = 0;
    }
    else {
      y = 500;
    }*/
  }
  if(z == undefined){
    z = (floorOrWall == 'BackWall') ? -500 : 0;
/*    if(floorOrWall == 'BackWall') {
      z = -500;
    }
    else {
      z = 0;
    }*/
  }
  if(size == undefined){
    //TODO default floor/wall size
    size = 1000;
  }
  var btrans;
  if(transparent == undefined) {
    btrans = convertWordToBoolean(globalParams['transparent']);
  }
  else {
    btrans = convertWordToBoolean(transparent);
  }
  if(amount == undefined) {
    amount = globalParams['amount'];
  }
  if(endx == undefined) {
    if(globalParams['endx'] == undefined) {
      endx = x;
    }
    else {
      endx = globalParams['endx'];
    }
  }
  if(endy == undefined) {
    if(globalParams['endy'] == undefined) {
      endy = y;
    }
    else {
      endy = globalParams['endy'];
    }
  }
  if(endz == undefined) {
    if(globalParams['endz'] == undefined) {
      endz = z;
    }
    else {
      endz = globalParams['endz'];
    }
  }
  if(endsize == undefined) {
    if(globalParams['endsize'] != undefined) {
      endsize = globalParams['endsize'];
    }
  }
  if(texture == undefined) {
    texture = globalParams['texture'];
  }
  if(texture == undefined) {
    var planeTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
  }
  else if(texture == 'random') {
      var rand = getRandomInt(0,texturesLength-1);
      var i = 0;
      for(var t in textures) {
        if(rand == i) {
          var planeTexture = new THREE.ImageUtils.loadTexture( 'images/' + textures[t] );
        }
        i++;
      }    
  }
  else {
    var planeTexture = new THREE.ImageUtils.loadTexture( 'images/' + textures[texture] );    
  }
  //problem with repeat hearts, because file res is not powers of 2
  if(texture != 'hearts') {
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping; 
    if(size > 1000) {
      planeTexture.repeat.set( 10, 10 );
    }
    else {
      planeTexture.repeat.set( size/textureRepeatAmount, size/textureRepeatAmount );
    }
  }
  else {//texture image size not a power of 2
    planeTexture.minFilter = THREE.NearestFilter;
  }
  var material = new THREE.MeshBasicMaterial( { map: planeTexture, side: THREE.DoubleSide, transparent: btrans } );
  if(many == undefined) {
    many = false;
  }
  if(!many) {
    var geometry = new THREE.PlaneBufferGeometry(size, size, 10, 10);    
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    if(floorOrWall == 'Floor') {
      mesh.rotation.x = Math.PI / 2;
    }
    else if(floorOrWall == 'Wall') {
      mesh.rotation.y = Math.PI / 2;
    }
    else if(floorOrWall == 'BackWall') {
    }
    addToMeshs(mesh,true);
    return mesh;
  }
  else{
    var meshs = [];
    var divisor = amount - 1;
    var xIncrement = +(endx-x)/divisor;
    var yIncrement = +(endy-y)/divisor;
    var zIncrement = +(endz-z)/divisor;
    if(endsize == undefined) {
      var geom = new THREE.PlaneBufferGeometry(size, size, 10, 10);
      for(var i = 0; i < amount; i++) {
        var mesh = new THREE.Mesh(geom, material ); 
        mesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
        if(floorOrWall == 'Wall') {
          mesh.rotation.y = Math.PI / 2;
        }
        else if (floorOrWall == 'Floor') {
          mesh.rotation.x = Math.PI / 2;
        }
        meshs[i] = mesh;
        addToMeshs(mesh,true);
      }
    }
    else {
      var sizeIncrement = (endsize-size)/divisor;
      var newSize;
      for(var i = 0; i < amount; i++) {
        newSize = +size+i*sizeIncrement;
        var geom = new THREE.PlaneBufferGeometry(newSize,newSize,10,10);
        var mesh = new THREE.Mesh(geom, material ); 
        mesh.position.set( +x+i*xIncrement, +y+i*yIncrement, +z+i*zIncrement );
        if(floorOrWall == 'Wall') {
          mesh.rotation.y = Math.PI / 2;
        }
        else if (floorOrWall == 'Floor') {
          mesh.rotation.x = Math.PI / 2;
        }
        meshs[i] = mesh;
        addToMeshs(mesh,true);
      }
    }
    return meshs;
  }
}

function initBubble() {
  this.refractSphereCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
  scene.add( refractSphereCamera );

  var fShader = THREE.FresnelShader;
  
  var fresnelUniforms = 
  {
    "mRefractionRatio": { type: "f", value: 1.02 },
    "mFresnelBias":   { type: "f", value: 0.1 },
    "mFresnelPower":  { type: "f", value: 2.0 },
    "mFresnelScale":  { type: "f", value: 1.0 },
    "tCube":      { type: "t", value: refractSphereCamera.renderTarget } //  textureCube }
  };
  
  // create custom material for the shader
  bubbleMaterial = new THREE.ShaderMaterial( 
  {
    uniforms:     fresnelUniforms,
    vertexShader:   fShader.vertexShader,
    fragmentShader: fShader.fragmentShader,
    side: THREE.DoubleSide
  }   );
}

function initMirror() {
  this.mirrorCamera = new THREE.CubeCamera( 0.5, 10000, 512 );
  scene.add( mirrorCamera );
  mirrorMaterial = new THREE.MeshBasicMaterial( { envMap: mirrorCamera.renderTarget } );
}

function mapMirrorCamera(x,y,z) {
  mirrorCamera = new THREE.CubeCamera( 0.5, 10000, 512 );
  mirrorCamera.position.x = x;
  mirrorCamera.position.y = y;
  mirrorCamera.position.z = z;
  scene.add( mirrorCamera );
  mirrorMaterial = new THREE.MeshBasicMaterial( { envMap: mirrorCamera.renderTarget } );
}
function initSpinMesh(mesh,spinx,spiny,spinz) {
    spinningMeshs.push(mesh);
    spinningParams.push({'x':spinx, 'y':spiny, 'z':spinz});
}
function initOrbitMesh(mesh,orbitx,orbity,orbitz,xradius,yradius,zradius) {
    orbittingMeshs.push(mesh);
    orbittingParams.push({'x':orbitx, 'y':orbity, 'z':orbitz,
        'xradius':xradius, 'yradius':yradius, 'zradius':zradius,
        'xpos':mesh.position.x, 'ypos':mesh.position.y, 'zpos':mesh.position.z, });
}
//sets up motion along axes that have a defined movespeed var
function initMovingMesh(mesh,movex,movey,movez,endmovex,endmovey,endmovez,movexspeed,moveyspeed,movezspeed) {
        movingMeshs.push(mesh);
        var xdir, ydir, zdir, temp;
        if(movexspeed != undefined && movex != endmovex) {
          if(+movex < +endmovex) {
            xdir = +movexspeed;
          }
          else {
            xdir = +movexspeed*-1;
            temp = movex;
            movex = endmovex;
            endmovex = temp;
          }
        }
        if(moveyspeed != undefined && movey != endmovey) {
          if(+movey < +endmovey) {
            ydir = +moveyspeed;
          }
          else {
            ydir = +moveyspeed*-1;
            temp = movey;
            movey = endmovey;
            endmovey = temp;
          }
        }
        if(movezspeed != undefined && movez != endmovez) {
          if(+movez < +endmovez) {
            zdir = movezspeed;
          }
          else {
            zdir = +movezspeed*-1;
            temp = movez;
            movez = endmovez;
            endmovez = temp;
          }
        }
        movingParams.push({
          'movex':movex, 'endmovex':endmovex, 
          'movey':movey, 'endmovey':endmovey, 
          'movez':movez, 'endmovez':endmovez,
          'xdir':xdir, 'ydir':ydir, 'zdir':zdir
        });
}
  //////////////////////////////////////////
 //END OF METHODS FOR CREATING GEOMETRIES//
//////////////////////////////////////////

//TODO:::::
//howto do removal/manipulation of geometries
//--user has to name geometry (otherwise default name, cube1,cube2?), 
//--user can describe geometry (green transparent cube)
//--user can right click on geometry

function addToMeshs(mesh,solid) {
	meshs[numberOfMeshs] = mesh;
	numberOfMeshs++;
  if(solid) {
    solids.push(mesh);
  }
}
//remove last geometry that was created
//TODO, undo other things like set default params
function undo() {
  //if spinning remove associated data from those arrays as well
  if(spinningMeshs.lastIndexOf(meshs[numberOfMeshs]) >= 0) {
    spinningMeshs.pop();
    spinningParams.pop();
  }
	numberOfMeshs--;
  scene.remove(meshs[numberOfMeshs]);
  meshs.pop();
}

  ///////////////////////////////////////
 //METHODS FOR DEALING WITH PARAMETERS//
///////////////////////////////////////

//NEW PARSEPARAMS METHOD!!! use state-diagram
//--parsedParams, assoc array to store param->value (use globalParams to setDefaultParams)
function parseParams(params, parsedParams) {
  //TODO, if user speaks too fast comes in with no space (ex: z75)
  var paramsArray = params.split(" ");
  if(parsedParams == undefined) {
    parsedParams = {};
  }
  //state variable
  /*states: s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
    s0: idling state -> s1,s4,s5,s6,s7,s10
    s1: xyz,size,height,width,depth -> s2
    s2: check range for s1 stuff -> s3
    s3: complete range -> s0
    s4: transparent,solid (booleans) -> s0
    s5: color/ambient/texture/material -> s0
    s6: spin/orbit xyz -> s0
    s7: move xyz -> s8
    s8: check if move cooridates given -> s9
    s9: check move range for s8 stuff -> s3
    s10: amount
  */
  var currState = 's0';
  var lastState = '';
  var tempState = '';
  var currParam = '';
  var word = '';
  for(var i = 0; i < paramsArray.length; i++) {
    currParam = paramsArray[i].toLowerCase();
    /*console.log('currState: '+currState);
    console.log('lastState: '+lastState);
    console.log('currParam: '+currParam);
    console.log('word: '+word);
    console.log(' -------------- ');*/
    //first deal ith special cases
    //check for why/by/y
    if(currParam === 'why' || currParam === 'by') {
      currParam = 'y';
    }
    //check for minus sign w/ a space
    else if(currParam === '-') {
      if(paramsArray[i+1] != undefined && isNumber(paramsArray[i+1])){
        currParam = currParam + paramsArray[i+1];
        i++;
      }
    }
    //check for zero coming in as word
    else if(currParam === 'zero') {
      currParam = 0;
    }
    else if(['and','end','&'].indexOf(currParam) != -1 ) {
      currParam = 'until';
    }
    else if(currParam === 'with') {
      currParam = 'width';
    }
    else if(currParam === 'death') {
      currParam = 'depth';
    }
    else if(currParam === 'sized') {
      currParam = 'size';
    }
    tempState = currState;
    //state0, idling
    if(currState === 's0') {
      if(['x','y','z','size','width','height','depth'].indexOf(currParam) != -1 ) {
        currState = 's1';
        word = currParam;
      }
      else if(['transparent','solid'].indexOf(currParam) != -1) {
        currState = 's4';
        word = currParam;
      }
      else if(['color','texture','material','ambient'].indexOf(currParam) != -1) {
        currState = 's5';
        word = currParam;
      }
      else if(currParam === 'spin' || currParam === 'orbit') {
        currState = 's6';
        word = currParam;
      }
      else if(currParam === 'move' || currParam === 'mood') {
        currState = 's7';
        word = 'move';
      }
      else if(currParam === 'amount' || currParam === 'announced') {
        currState = 's10';
        word = 'amount';
      }
    }
    else if(currState === 's1') {
      if(isNumber(currParam)) {
        currState = 's2';
        parsedParams[word] = currParam;
      }
      else {
        currState = 's0';//err, todo
      }
    }
    else if(currState === 's2') {
      if(currParam == 'until') {
        currState = 's3';
      }
      else {
        currState = 's0';
        i--;//go back because we looked ahead
      }
    }   
    else if(currState === 's3') {
      if(isNumber(currParam)) {
        currState = 's0';
        parsedParams['end'+word] = currParam;
        //came from move state, check for speed
        if( lastState === 's9' && i < paramsArray.length-1 ) {
          var moveSpeed = checkForMoveSpeed(paramsArray[i+1].toLowerCase());
          if(moveSpeed != undefined) {
            parsedParams['move'+word+'speed'] = moveSpeed;
            i++;
          }
        }
      }
      else {
        currState = 's0';//err, todo
      }
    }
    //transparent/solid
    else if(currState === 's4') {
      if(currParam == 'true' || currParam == 'false') {
        currState = 's0';
        parsedParams[word] = currParam;
      }
      else {
        currState = 's0';//err, todo
      }
    }
    //color/ambient/texture/material
    //TODO error checking, names
    else if(currState == 's5') {
      if(['color','ambient'].indexOf(word) != -1) {
        if(['dark','medium','light','pale'].indexOf(currParam) != -1) {
          if(i < paramsArray.length-1) {
            var colorName = currParam+paramsArray[i+1].toLowerCase();
            parsedParams[word] = colourNameToHex(colorName);
            i++;
          }
        }
        parsedParams[word] = currParam;        
      }
      else {
        parsedParams[word] = currParam;
      }
      currState = 's0';
    }
    //spin/orbit
    else if(currState == 's6') {
      if(['x','y','z'].indexOf(currParam) != -1) {
        if(i === paramsArray.length-1) {
          //no more input so assign speed
          var speed = (word.startsWith('spin') ? spinSpeeds['medium'] : orbitSpeeds['slow']);
          parsedParams[word+currParam] = speed;
          currState = 's0';
        }
        else {
          //more input, check if it's speed or radius
          currState = 's11';
        }
        parsedParams[word] = true;
        word = word+currParam;
      }
      else {
        currState = 's0';//err, todo
      }
    }
    //move
    else if(currState == 's7') {
      var moveSpeed = moveSpeeds['slow'];
      if(i < paramsArray.length-1) {
        moveSpeed = checkForMoveSpeed(paramsArray[i+1].toLowerCase());
        if(moveSpeed === undefined) {
          moveSpeed = moveSpeeds['slow'];
        }
        else {
          i++;
        }
      }
      if(['x','y','z'].indexOf(currParam) != -1) {
        currState = 's8';
        parsedParams['move'+currParam+'speed'] = moveSpeed;
        parsedParams['move'] = true;
        //need to pass along currParam as word incase range is given. (until)
        word = currParam;
      }
      else {
        currState = 's0';//err, todo
      }
    }
    else if(currState == 's8') {
      if(isNumber(currParam)) {
        currState = 's9';
        parsedParams[word] = currParam;
      }
      else {
        currState = 's0';
        i--;//go back because we looked ahead
      }
    }
    else if(currState === 's9') {
      if(currParam == 'until') {
        currState = 's3';
      }
      else {
        currState = 's0';
        i--;//go back because we looked ahead
      }
    } 
    else if(currState === 's10') {
      if(isNumber(currParam)) {
        currState = 's0';
        parsedParams[word] = currParam;
      }
      else {
        currState = 's0';//err, todo
      }
    }
    //word can be spinx,spiny,spinx,orbitx,orbity,orbitz
    else if(currState === 's11') {
      if(['slow','medium','fast'].indexOf(currParam) != -1) {
        currState = 's11';
        parsedParams[word] = getSpeed(word.substring(0,word.length-1),currParam);
      }
      else if(currParam === 'radius' && word.substring(0,5) === 'orbit') {
        currState = 's12';
      }
      else {
        if(parsedParams[word] === undefined) {
          parsedParams[word] = (word.startsWith('spin') ? spinSpeeds['medium'] : orbitSpeeds['slow']);
        }
        currState = 's0';
        i--;
      }
    }
    //orbit radius
    else if(currState === 's12') {
      if(isNumber(currParam)) {
        currState = 's11';
        parsedParams[word+'radius'] = currParam;
      }
      else {
        currState = 's0';//err, todo
      }
      if(i === paramsArray.length-1 && parsedParams[word] === undefined) {
          //no more input & no speed, so assign speed
          var speed = (word.startsWith('spin') ? spinSpeeds['medium'] : orbitSpeeds['slow']);
          parsedParams[word] = speed;
          currState = 's0';
        }
    }
    lastState = tempState;      
  }
  return parsedParams;
}
function checkForMoveSpeed(speed) {
  return (speed === undefined) ? undefined : moveSpeeds[speed];
}
function getSpeed(type, speed) {
    if(type === 'spin') {
      return spinSpeeds[speed];
    }
    else if(type === 'orbit') {
      return orbitSpeeds[speed];
    }
}

function initGlobalParams() {
  globalParams = {};
	globalParams['x'] = 0;
	globalParams['y'] = 50;
	globalParams['z'] = 0;
	globalParams['size'] = 50;
	globalParams['color'] = 0xffb6c1;
  globalParams['transparent'] = false;
  globalParams['amount'] = 3;
}
//resets default params and updates GUI
function resetGlobalParams(params) {
  if(params == undefined) {
    //reset all params
    initGlobalParams();
    //update gui, pass in nothing to reset
    updateGUI();
  }
  else {
    //reset given params
    var paramsArray = params.split(' ');
    var currParam;
    for(var i = 0; i < paramsArray.length; i++) {
      currParam = paramsArray[i];
      if(currParam == 'x' || currParam == 'y' || currParam == 'z') {
        globalParams[currParam] = 0;
      }
      else if(currParam == 'color') {
        globalParams['color'] = 0xffb6c1;
      }
      else if(currParam == 'size') {
        globalParams['size'] = 50;
      }
      else if(currParam == 'amount') {
        globalParams['amount'] = 3;
      }
      else if(currParam == 'transparent') {
        globalParams['transparent'] = false;
      }
      else {
        globalParams[currParam] = undefined;
      }
    }
    //update gui
    updateGUI(globalParams);
  }
}

//resolves params except color/ambient
//height and depth are set to size by default
function resolveParams(params) {
  var resolvedParams = {};
  var x = params['x'];
  var y = params['y'];
  var z = params['z'];
  var size = params['size'];
  /*var color = params['color'];
  var ambient = params['ambient'];*/
  var texture = params['texture'];
  var transparent = params['transparent'];
  var amount = params['amount'];
  var endx = params['endx'];
  var endy = params['endy'];
  var endz = params['endz'];
  var endsize = params['endsize'];
  var spin = params['spin'];
  var spinx = params['spinx'];
  var spiny = params['spiny'];
  var spinz = params['spinz'];
  var width = params['width'];
  var height = params['height'];
  var depth = params['depth'];
  var move = params['move'];
  var movexspeed = params['movexspeed'];
  var moveyspeed = params['moveyspeed'];
  var movezspeed = params['movezspeed'];
  var material = params['material'];//bubble, mirror, etc
  var solid = params['solid'];
  var orbit = params['orbit'];
  var orbitx = params['orbitx'];
  var orbity = params['orbity'];
  var orbitz = params['orbitz'];
  var orbitxradius = params['orbitxradius'];
  var orbityradius = params['orbityradius'];
  var orbitzradius = params['orbitzradius'];

  if(x == undefined) {
    x = globalParams['x'];
  }
  if(y == undefined) {
    y = globalParams['y'];
  }
  if(z == undefined) {
    z = globalParams['z'];
  }
  if(size == undefined) {
    size = globalParams['size'];
    if(size == undefined) {
      size = 50;
    }
  }
  if(texture == undefined) {
    texture = globalParams['texture'];
  }
  var btrans;
  if(transparent == undefined) {
    btrans = convertWordToBoolean(globalParams['transparent']);
  }
  else {
    btrans = convertWordToBoolean(transparent);
  }
  if(amount == undefined) {
    amount = globalParams['amount'];
  }
  if(endx == undefined) {
    endx = globalParams['endx'];
    if(endx == undefined) {
      endx = x;
    }
  }
  if(endy == undefined) {
    endy = globalParams['endy'];
    if(endy == undefined) {
      endy = y;
    }
  }
  if(endz == undefined) {
    endz = globalParams['endz'];
    if(endz == undefined) {
      endz = z;
    }
  }
  if(endsize == undefined) {
    if(globalParams['endsize'] != undefined) {
      endsize = globalParams['endsize'];
    }
  }
  if(spin == undefined) {
    spin = globalParams['spin'];
    if(spin == undefined) {
      spin = false;
    }
  }
  if(spinx == undefined) {
    spinx = globalParams['spinx'];
    if(spinx == undefined) {
      spinx = 0;
    }
  }
  if(spiny == undefined) {
    spiny = globalParams['spiny'];
    if(spiny == undefined) {
      spiny = 0;
    }
  }
  if(spinz == undefined) {
    spinz = globalParams['spinz'];
    if(spinz == undefined) {
      spinz = 0;
    }
  }
  if(move == undefined) {
    move = globalParams['move'];
    if(move == undefined) {
      move = false;
    }
  }
  if(movexspeed == undefined) {
    movexspeed = globalParams['movexspeed'];
  }
  if(moveyspeed == undefined) {
    moveyspeed = globalParams['moveyspeed'];
  }
  if(movezspeed == undefined) {
    movezspeed = globalParams['movezspeed'];
  }
  if(width == undefined) {
    width = globalParams['width'];
    /*if(width == undefined) {
      width = size;
    }*/
  }
  if(height == undefined) {
    height = globalParams['height'];
    if(height == undefined) {
      height = size
    }
  }
  //dimension in z direction
  if(depth == undefined) {
    depth = globalParams['depth'];
    if(depth == undefined) {
      depth = size
    }
  }
  if(material == undefined) {
    material = globalParams['material'];
  }
  var bsolid;
  if(solid == undefined) {
    bsolid = convertWordToBoolean(globalParams['solid']);
    if(globalParams['solid'] == undefined) {
      bsolid = false;
    }
  }
  else {
    bsolid = convertWordToBoolean(solid);
  }
  if(orbit == undefined) {
    orbit = globalParams['orbit'];
    if(orbit == undefined) {
      orbit = false;
    }
  }
  if(orbitx == undefined) {
    orbitx = globalParams['orbitx'];
    if(orbitx == undefined) {
      orbitx = 0;
    }
  }
  if(orbity == undefined) {
    orbity = globalParams['orbity'];
    if(orbity == undefined) {
      orbity = 0;
    }
  }
  if(orbitz == undefined) {
    orbitz = globalParams['orbitz'];
    if(orbitz == undefined) {
      orbitz = 0;
    }
  }
  if(orbitxradius === undefined) {
    orbitxradius = globalParams['orbitxradius'];
    if(orbitxradius === undefined) {
      orbitxradius = defaultOrbitRadius;
    }
  }
  if(orbityradius === undefined) {
    orbitYradius = globalParams['orbityradius'];
    if(orbityradius === undefined) {
      orbityradius = defaultOrbitRadius;
    }
  }
  if(orbitzradius === undefined) {
    orbitzradius = globalParams['orbitzradius'];
    if(orbitzradius === undefined) {
      orbitzradius = defaultOrbitRadius;
    }
  }
  resolvedParams["x"] = x;
  resolvedParams["y"] = y;
  resolvedParams["z"] = z;
  resolvedParams["btrans"] = btrans;
  resolvedParams["amount"] = amount;
  resolvedParams["size"] = size;
  resolvedParams["texture"] = texture;
  resolvedParams["endx"] = endx;
  resolvedParams["endy"] = endy;
  resolvedParams["endz"] = endz;
  resolvedParams["endsize"] = endsize;
  resolvedParams["width"] = width;
  resolvedParams["height"] = height;
  resolvedParams["depth"] = depth;
  resolvedParams["spin"] = spin;
  resolvedParams["spinx"] = spinx;
  resolvedParams["spiny"] = spiny;
  resolvedParams["spinz"] = spinz;
  resolvedParams["move"] = move;
  resolvedParams["movexspeed"] = movexspeed;
  resolvedParams["moveyspeed"] = moveyspeed;
  resolvedParams["movezspeed"] = movezspeed;
  resolvedParams["material"] = material;
  resolvedParams["solid"] = bsolid;
  resolvedParams["orbit"] = orbit;
  resolvedParams["orbitx"] = orbitx;
  resolvedParams["orbity"] = orbity;
  resolvedParams["orbitz"] = orbitz;
  resolvedParams["orbitxradius"] = orbitxradius;
  resolvedParams["orbityradius"] = orbityradius;
  resolvedParams["orbitzradius"] = orbitzradius;

  return resolvedParams;
}

function isNumber(potentialNumber) {
  return !isNaN(potentialNumber);
}

function convertWordToBoolean(word) {
  return (word == 'true') ? true : false;
}

function getOrbitSpeedAsNumber(speed) {
  //TODO 1st line
  globalParams['orbit'] = true;
  return orbitSpeeds[speed];
}

function getOrbitSpeedAsWord(speed) {
  var orbitSpeedWord;
  if(speed == orbitSpeeds['slow']) {
    orbitSpeedWord = 'slow';
  }
  else if(speed == orbitSpeeds['fast']) {
    orbitSpeedWord = 'fast';
  } 
  else if(speed == orbitSpeeds['medium']) {
    orbitSpeedWord = 'medium';
  } 
  return orbitSpeedWord;
}

function getSpinSpeedAsNumber(speed) {
  //TODO 1st line
  globalParams['spin'] = true;
  return spinSpeeds[speed];
}

function getSpinSpeedAsWord(speed) {
  var spinSpeedWord;
  if(speed == spinSpeeds['slow']) {
    spinSpeedWord = 'slow';
  }
  else if(speed == spinSpeeds['fast']) {
    spinSpeedWord = 'fast';
  } 
  else if(speed == spinSpeeds['medium']) {
    spinSpeedWord = 'medium';
  } 
  return spinSpeedWord;
}

function getMoveSpeedAsNumber(speed) {
  //TODO 1st line
  globalParams['move'] = true;
  return moveSpeeds[speed];
}

function getMoveSpeedAsWord(speed) {
  var moveSpeedWord;
  if(speed == moveSpeeds['slow']) {
    moveSpeedWord = 'slow';
  }
  else if(speed == moveSpeeds['fast']) {
    moveSpeedWord = 'fast';
  } 
  else if(speed == moveSpeeds['medium']) {
    moveSpeedWord = 'medium';
  } 
  return moveSpeedWord;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

  //////////////////////////////////////////////
 //END OF METHODS FOR DEALING WITH PARAMETERS//
//////////////////////////////////////////////

//TODO get checkboxes working
//TODO error handling
function updateGUI(params) {
  //if resetting gui & params
  if(params == undefined) {
    params = {};
    //should already have base default params, so just add others for GUI
    params["texture"] = 'none';
    params["endx"] = 0;
    params["endy"] = 50;
    params["endz"] = 0;
    params["endsize"] = 50;
    params["width"] = 50;//TODO set these to nothing actually
    params["height"] = 50;//
    params["depth"] = 50;//
    params["spinx"] = 'none';
    params["spiny"] = 'none';
    params["spinz"] = 'none';
    params["movexspeed"] = 'none';
    params["moveyspeed"] = 'none';
    params["movezspeed"] = 'none';
    params["material"] = 'none';
    params["solid"] = 'false';
    params["orbitx"] = 'none';
    params["orbitxradius"] = defaultOrbitRadius;
    params["orbity"] = 'none';
    params["orbityradius"] = defaultOrbitRadius;
    params["orbitz"] = 'none';
    params["orbitzradius"] = defaultOrbitRadius;

  }
  for(var param in params) {
    //checkboxes
    if(param == 'transparent' || param == 'solid') {
      guiDefaultParams[param] = convertWordToBoolean(params[param]);      
    }
    //move/spin dropdowns
    if((param == 'movexspeed' || param == 'moveyspeed' || param == 'movezspeed') && params[param] != 'none') {
      guiDefaultParams[param] = getMoveSpeedAsWord(params[param]);      
    }
    else if((param == 'spinx' || param == 'spiny' || param == 'spinz') && params[param] != 'none') {
      guiDefaultParams[param] = getSpinSpeedAsWord(params[param]);      
    }
    else if((param == 'orbitx' || param == 'orbity' || param == 'orbitz') && params[param] != 'none') {
      guiDefaultParams[param] = getOrbitSpeedAsWord(params[param]);      
    }    //TODO orbit
    else {
      guiDefaultParams[param] = params[param];
    }
  }
    // Iterate over all controllers
    for (var i in gui.__controllers) {
      gui.__controllers[i].updateDisplay();
    }
    for (var i = 0; i < this.gui.__folders.Appearance.__controllers.length; i++) {
      gui.__folders.Appearance.__controllers[i].updateDisplay();
    }
    for (var i = 0; i < this.gui.__folders.Position.__controllers.length; i++) {
      gui.__folders.Position.__controllers[i].updateDisplay();
    }
  //}
}

function initSaveLoadButtons() {
  document.getElementById('link').onclick = function() {
        this.href = 'data:text/plain;charset=utf-8,'
          + encodeURIComponent(saveLog);
      };
  var save = document.getElementById("saveButton");
  save.addEventListener("click", function(){
    document.getElementById('link').click();
  });

  var uploadFile = document.getElementById('uploadFile');
  uploadFile.addEventListener("change", function(){
    var reader = new FileReader();
    reader.onload = function(){
      var data = reader.result;
      submitCommandsFromFile(data);
    };
    reader.readAsText(uploadFile.files[0], 'utf-8');
    //
    //uploadFile.style.visibility = 'hidden';
  });
}

function initConsole() {
  var cli = document.getElementById("consoleBox");
  cli.addEventListener("keydown", function (e) {
    //TODO, something else because this makes autocomplete wierd
    if (e.keyCode === 13) {  
        //console.log(cli.value);
        submitCommand(cli.value);
        cli.value='';
        closeConsole();
    }
  });
  document.getElementById('submitButton').addEventListener("click", function(){
    var cli = document.getElementById("consoleBox");
    submitCommand(cli.value);
    cli.value='';
 });
}
function openConsole() {
  document.getElementById('submitButton').style.visibility = 'visible';
  document.getElementById('consoleBox').style.visibility = 'visible';
  document.getElementById('consoleBox').focus();
  consoleOpen = true;
}
function closeConsole() {
  document.getElementById('consoleBox').value = '';
  document.getElementById('submitButton').style.visibility = 'hidden';
  document.getElementById('consoleBox').style.visibility = 'hidden';
  consoleOpen = false;
}

function submitCommandsFromFile(commands) {
  var lines = commands.split('\n');
  for(var line = 0; line < lines.length; line++){
    submitCommand(lines[line]);
  }
}
function cleanupSpaces(command) {
  var split = command.split(/\s+/);
  var result = '';
  for(var s in split) {
    result += split[s] + ' ';
  }
  return result.substring(0,result.length-1);
}
function submitCommand(command) {
  //notify user 
  notify(command);
  command = cleanupSpaces(command);
  if(command.indexOf('create sphere') === 0) {
    var len = 'create sphere'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createSphere(parsedParams));    
    }
    else {
      scene.add(createSphere(globalParams));
    }
  }
  else if(command.indexOf('create many spheres') === 0) {
    var len = 'create many spheres'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var spheres = createManySpheres(parsedParams);
      for(var i = 0; i < spheres.length; i++) {
        scene.add(spheres[i]);          
      }
    }
    else {
      var spheres = createManySpheres(globalParams);
      for(var i = 0; i < spheres.length; i++) {
        scene.add(spheres[i]);          
      }    
    }
  }
  else if(command.indexOf('create cube') === 0) {
    var len = 'create cube'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createCube(parsedParams));    
    }
    else {
      scene.add(createCube(globalParams));
    }
  }
  else if(command.indexOf('create many cubes') === 0) {
    var len = 'create many cubes'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geoms = createManyCubes(parsedParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }
    }
    else {
      var geoms = createManyCubes(globalParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }    
    }
  }
  else if(command.indexOf('create ring') === 0) {
    var len = 'create ring'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createRing(parsedParams));    
    }
    else {
      scene.add(createRing(globalParams));
    }
  }
  else if(command.indexOf('create many rings') === 0) {
    var len = 'create many rings'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geoms = createManyRings(parsedParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }
    }
    else {
      var geoms = createManyRings(globalParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }    
    }
  }
  else if(command.indexOf('create knot') === 0) {
    var len = 'create knot'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createTorusKnot(parsedParams));    
    }
    else {
      scene.add(createTorusKnot(globalParams));
    }
  }
  else if(command.indexOf('create many knots') === 0) {
    var len = 'create many knots'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geoms = createManyTorusKnots(parsedParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }
    }
    else {
      var geoms = createManyTorusKnots(globalParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }    
    }
  }
  else if(command.indexOf('create cylinder') === 0) {
    var len = 'create cylinder'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createCylinder(parsedParams));    
    }
    else {
      scene.add(createCylinder(globalParams));
    }
  }
  else if(command.indexOf('create many cylinders') === 0) {
    var len = 'create many cylinders'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geoms = createManyCylinders(parsedParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }
    }
    else {
      var geoms = createManyCylinders(globalParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }    
    }
  }
  else if(command.indexOf('create cone') === 0) {
    var len = 'create cone'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createCone(parsedParams));    
    }
    else {
      scene.add(createCone(globalParams));
    }
  }
  else if(command.indexOf('create many cones') === 0) {
    var len = 'create many cones'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geoms = createManyCones(parsedParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }
    }
    else {
      var geoms = createManyCones(globalParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }    
    }
  }
  else if(command.indexOf('create bubble') === 0) {
    var len = 'create bubble'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createBubble(parsedParams));    
    }
    else {
      scene.add(createBubble(globalParams));
    }
  } 
  else if(command.indexOf('create many bubbles') === 0) {
    var len = 'create many bubbles'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geoms = createManyBubbles(parsedParams);   
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }  
    }
    else {
      var geoms = createManyBubbles(globalParams);   
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      } 
    }
  } 
  else if(command.indexOf('create mirror') === 0) {
    var len = 'create mirror'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createMirror(parsedParams));    
    }
    else {
      scene.add(createMirror(globalParams));
    }
  }
  else if(command.indexOf('create many mirrors') === 0) {
    var len = 'create many mirrors'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geoms = createManyMirrors(parsedParams);   
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }
    }
    else {
      var geoms = createManyMirrors(globalParams);   
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }
    }
  } 
  else if(command.indexOf('create floor') === 0) {
    var len = 'create floor'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createFloor(parsedParams));    
    }
    else {
      scene.add(createFloor({y:0,size:1000}));
    }
  }
  else if(command.indexOf('create many floors') === 0) {
    var len = 'create many floors'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geoms = createManyFloors(parsedParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }
    }
    else {
      var geoms = createManyFloors(globalParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }    
    }
  }
  else if(command.indexOf('create wall') === 0) {
    var len = 'create wall'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createWall(parsedParams));    
    }
    else {
      scene.add(createWall({x:0,y:500,size:1000}));
    }
  }
  else if(command.indexOf('create many walls') === 0) {
    var len = 'create many walls'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geoms = createManyWalls(parsedParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }
    }
    else {
      var geoms = createManyWalls(globalParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }    
    }
  }
  else if(command.indexOf('create back wall') === 0) {
    var len = 'create back wall'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      scene.add(createBackWall(parsedParams));    
    }
    else {
      scene.add(createBackWall({x:0,y:500,size:1000}));
    }
  }
  else if(command.indexOf('create many back walls') === 0) {
    var len = 'create many back walls'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      var parsedParams = parseParams(params);
      var geom = createManyBackWalls(parsedParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      }    
    }
    else {
      var geoms = createManyBackWalls(globalParams);
      for(var i = 0; i < geoms.length; i++) {
        scene.add(geoms[i]);          
      } 
    }
  }
  else if(command.indexOf('create text') === 0) {
    var len = 'create text'.length;
    if(command.length > len) {
      var text = command.substring(len+1);
      scene.add(create3DText(text));    
    }
  }
  else if(command.indexOf('set default') === 0) {
    var len = 'set default'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      //pass globalParams as second arg to set the globalParams
      parseParams(params, globalParams);
      updateGUI(globalParams);
    }
  }
  else if(command.indexOf('set') === 0) {
    var len = 'set'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      //pass globalParams as second arg to set the globalParams
      parseParams(params, globalParams);
      updateGUI(globalParams);
    }
  }
  else if(command.indexOf('reset default') === 0) {
    var len = 'reset default'.length;
    if(command.length > len) {
      var params = command.substring(len+1);
      resetGlobalParams(params);      
    }
    else {
      resetGlobalParams();
    }
  }
  else if(command.indexOf('undo') === 0) {
    undo();
  }
  else if(command.indexOf('upload') === 0) {
    document.getElementById('uploadFile').style.visibility = 'visible';
  }
  else if(command.indexOf('test') === 0 ) {
    testEverything();
  }
  else if(command.indexOf('gravity on') === 0 ) {
    gravAndColl = true;
  }
  else if(command.indexOf('gravity off') === 0 ) {
    gravAndColl = false;
  }
}

//motify user command was received & log in console.log
function notify(notification) {
  console.log(notification);
  document.getElementById("notify").innerHTML=notification;
  setTimeout(function(){
    document.getElementById("notify").innerHTML="";
  },2500);
  //also add relevant commands to save log
  if(notification != 'save' && notification != 'load' 
    && notification != 'pause' && notification != 'unpause'
    && notification != 'open console' && notification != 'close console') {
    saveLog += notification + "\n";
  }
}
//test method
function testEverything() {
  //var testcommands = 'create back wall texture water\ncreate floor\ncreate cube texture chrome move x -500 and 500 move y 50 and 300 move z slow -250 and 250 spin z\ncreate cube texture chrome move x fast -500 and 500 move y 50 and 300 move z -250 and 0 spin x fast spin y';
  var testcommands = 'create floor\ncreate cone height 200 color green\ncreate many cubes color green x 500 until -500 orbit y slow radius 500\ncreate many cubes y 100 until 300 orbit y medium radius 500';
  submitCommandsFromFile(testcommands);
}
