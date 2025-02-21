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
camera.position.z = -10;
camera.position.y = 0.2;

const pointlight = new THREE.PointLight (0x85ccb8, 1, 20);
pointlight.position.set (0,3,2);
scene.add (pointlight);

const pointlight2 = new THREE.PointLight (0x85ccb8, 1, 20);
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
roughness: 1.15,
metalness: 1,
roughnessMap: surf_imp,
side: THREE.DoubleSide
});

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
pixelPass.uniforms[ 'pixelSize' ].value = 7;

composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( afterimagePass );
composer.addPass( bloomPass );
//composer.addPass( pixelPass );

// RESIZE
window.addEventListener( 'resize', onWindowResize );

// Add these variables at the global scope
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Add mouse move event listener
document.addEventListener('mousemove', onDocumentMouseMove);

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

var update = function() {
    // Smooth interpolation towards target
    targetX = mouseX * .001;
    targetY = mouseY * .001;
    
    // Update camera position
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.position.z = 10;
    
    // Rotate the mask model if it exists
    if (mask) {
        mask.rotation.y = targetX * 2; // Horizontal rotation
        mask.rotation.x = targetY * 1; // Vertical rotation
    }
    
    // Update lights to follow cursor but with larger movement
    pointlight.position.x = mouseX * 0.02;
    pointlight.position.y = -mouseY * 0.02;
    pointlight.position.z = 2;
    
    pointlight2.position.x = -mouseX * 0.02;
    pointlight2.position.y = mouseY * 0.02;
    pointlight2.position.z = 2;

    // Title glow animation based on cursor position
    const title = document.querySelector('.title');
    const glowIntensity = Math.abs(targetX + targetY) * 10;
    title.style.textShadow = `0 0 ${glowIntensity}px rgba(133, 204, 184, 0.8)`;

    camera.lookAt(0, 0, 0);
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