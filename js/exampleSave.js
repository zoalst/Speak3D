/*
	This file was auto-generated from 
	Speak3D
	Author: Zachary Stenger 
	https://github.com/zacharystenger/Speak3D
*/

var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var meshs = [];
var numberOfMeshs = 0;

init();
animate();

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
	controls = new THREE.OrbitControls( camera, renderer.domElement );//TODO
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
  var skyBoxTexture = new THREE.ImageUtils.loadTexture( 'images/cloud.png' );    

	var skyBoxMaterial = new THREE.MeshBasicMaterial( { texture: skyBoxTexture, side: THREE.DoubleSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

	//TODO USER CREATED CONTENT INSERTED RIGHT HERE
    var geometryMaterial = new THREE.MeshPhongMaterial( { 
      color: 0x9900ff, //
      ambient: 0xff0099, // 
      transparent: false, //
      blending: THREE.AdditiveBlending 
    } );
    var geom = new THREE.SphereGeometry(50);//size
    for(var i = 0; i < 10; i++) {//amount
    var mesh = new THREE.Mesh(geom, geometryMaterial ); 
    mesh.position.set( i*50 - 250, 0, 0 );//xyz
    scene.add(mesh);

    }


	//END USER CREATED CONTENT

}
function animate() {
  requestAnimationFrame( animate );
	render();		
	update();
}

function update() {
	stats.update();
}
function render() {
		//TODO USER CREATED CONTENT MIGHT BE INSERTED RIGHT HERE

  //bubble
  /*if(bubbles) {
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
    var currentx;
    var startx;
    var endx;
    var currenty;
    var starty;
    var endy;
    var currentz;
    var startz;
    var endz;
    var xdir; //1 = positive direction on axis, -1 = negative direction on axis
    var ydir;
    var zdir;
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
  }*/
	renderer.render( scene, camera );
}