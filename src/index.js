import * as THREE from 'https://cdn.skypack.dev/three@0.124.0';
import { RGBELoader  } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/RenderPass.js';
import { AfterimagePass } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/AfterimagePass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/ShaderPass.js';
import { PixelShader } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/shaders/PixelShader.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/FBXLoader.js';

var renderer = new THREE.WebGLRenderer({ canvas : document.getElementById('canvas'), antialias:true});

// default bg canvas color //
renderer.setClearColor(0x11151c);

//  use device aspect ratio //
renderer.setPixelRatio(window.devicePixelRatio);

// set size of canvas within window //
renderer.setSize(window.innerWidth, window.innerHeight);

var scene = new THREE.Scene();

const hdrEquirect = new RGBELoader()
	.setPath( 'https://miroleon.github.io/daily-assets/' )
	.load( 'gradient_13.hdr', function () {

  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
} );

scene.environment = hdrEquirect;
scene.fog = new THREE.Fog( 0x11151c, 1, 100 );
scene.fog = new THREE.FogExp2(0x11151c, 0.14);

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
camera.position.y = 0.2;

const pointlight = new THREE.PointLight (0x85ccb8, 2, 20);
pointlight.position.set (0,3,2);
scene.add (pointlight);

const pointlight2 = new THREE.PointLight (0x85ccb8, 2, 20);
pointlight2.position.set (0,3,2);
scene.add (pointlight2);

// PointLightHelper
// const sphereSize = 1;
// const pointLightHelper = new THREE.PointLightHelper( pointlight, sphereSize );
// scene.add( pointLightHelper );
// const pointLightHelper2 = new THREE.PointLightHelper( pointlight2, sphereSize );
// scene.add( pointLightHelper2 );

const textureLoader = new THREE.TextureLoader();

var surf_imp = textureLoader.load( 'https://miroleon.github.io/daily-assets/surf_imp_02.jpg' );
surf_imp.wrapT = THREE.RepeatWrapping;
surf_imp.wrapS = THREE.RepeatWrapping;

var mask_mat = new THREE.MeshPhysicalMaterial({
color: 0xffffff,
roughness: 1,
metalness: 1,
roughnessMap: surf_imp});

let mask;

const loaderFBX1 = new FBXLoader().setPath( 'https://miroleon.github.io/daily-assets/' );
loaderFBX1.load( 'MASK_02.fbx', function ( object ) {

mask = object.children[ 0 ];
mask.position.set( 0, -0.2, 0 );
mask.scale.setScalar( 2 );
mask.material = mask_mat;
scene.add( mask );
} );

// POST PROCESSING
let composer;
const renderScene = new RenderPass( scene, camera );

const afterimagePass = new AfterimagePass();
afterimagePass.uniforms[ 'damp' ].value = 0.95;

const bloomparams = {
	exposure: 1,
	bloomStrength: 1,
	bloomThreshold: 0.1,
	bloomRadius: 1
};

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = bloomparams.bloomThreshold;
bloomPass.strength = bloomparams.bloomStrength;
bloomPass.radius = bloomparams.bloomRadius;

const pixelPass = new ShaderPass( PixelShader );
pixelPass.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
pixelPass.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );
pixelPass.uniforms[ 'pixelSize' ].value = 10;

composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( afterimagePass );
composer.addPass( bloomPass );
composer.addPass( pixelPass );

// RESIZE
window.addEventListener( 'resize', onWindowResize );

var theta1 = 0;

var update = function() {
  theta1 += 0.007;

  camera.position.x = Math.sin( theta1 ) * 2;
  camera.position.y = 2.5*Math.cos( theta1 ) + 1;

  pointlight.position.x = Math.sin( theta1+1 ) * 11;
  pointlight.position.z = Math.cos( theta1+1 ) * 11;
  pointlight.position.y = 2*Math.cos( theta1-3 ) +3;
  
  pointlight2.position.x = -Math.sin( theta1+1 ) * 11;
  pointlight2.position.z = -Math.cos( theta1+1 ) * 11;
  pointlight2.position.y = 2*-Math.cos( theta1-3 ) -6;

	camera.lookAt( 0, 0, 0 );
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {
  update();
  composer.render();
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);