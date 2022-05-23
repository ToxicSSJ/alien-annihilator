import {
    Mesh, 
    BoxGeometry, 
    MeshPhongMaterial,
    TextureLoader,
    Vector3,
} from 'three'

export default class Enemy extends Mesh
{

    private health : number = 30
    private respawnX: number = 0
    private respawnZ: number = 0
    private lag = 0.009

    //private appearance: Material

    constructor(iniX:number, iniZ: number) {
        const textureLoader = new TextureLoader()
        super(new BoxGeometry(0.5, 0.5, 0.5), new MeshPhongMaterial({map: textureLoader.load("assets/enemy/brick.jpg")}))
        this.position.set(iniX, 0, iniZ)
        this.respawnX = iniX;
        this.respawnZ = iniZ;
    }

    public receiveShot(){
        const textureLoader = new TextureLoader()
        this.health -= 10
        if (this.health <= 0){
            this.visible = false
            setTimeout(() => {
                this.visible = true
                this.respawn()
            }, 3000)
            
        }
        this.material = new MeshPhongMaterial({color: 0xFF0000})
        setTimeout(() => {
            this.material = new MeshPhongMaterial({map: textureLoader.load("assets/enemy/brick.jpg")})
        }, 100)
    }

    public move(direction: Vector3){
        this.position.x += (direction.x * this.lag);
		this.position.z += (direction.z * this.lag);
    }

    public respawn(){
        this.health = 30
        this.position.set(this.respawnX,0,this.respawnZ)
    }

    public inspect(){
        let direction = new Vector3()
        const delay = 0.00001
        direction = new Vector3(Math.cos(1), 0, Math.sin(0))
        this.position.x += (direction.x * delay);
    }
}
/*
// Three JS Template
var renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
var camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 500 );
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x000000, 0.08 );
camera.position.set(0, 0, 10);
//--------------------------------------------------------------
var group3d = new THREE.Object3D();
var geometry = new THREE.IcosahedronGeometry(1, 1);
var gparticular = new THREE.CircleGeometry(1,3);
var bparticular = new THREE.CircleGeometry(1,3);

var material = new THREE.MeshPhysicalMaterial({color:0xFFFFFFF, shading:THREE.FlatShading, side:THREE.DoubleSide});
var wmaterial = new THREE.MeshNormalMaterial({color:0xFFFFFF, wireframe:true});
var gmaterial = new THREE.MeshPhongMaterial({color:0xFFFFFF, side:THREE.DoubleSide});

function mathRandom(num = 3) {
  var mathnum = -Math.random() * num + Math.random()*num;
  return mathnum;
}

for (var i = 1; i < 300; i++) {
  var pscale = 0.001+Math.abs(mathRandom(0.03));
  var particular = new THREE.Mesh(gparticular, gmaterial);
  particular.position.set(mathRandom(),mathRandom(),mathRandom());
  particular.rotation.set(mathRandom(),mathRandom(),mathRandom());
  particular.scale.set(pscale,pscale,pscale);
   
  group3d.add(particular);
}

var cube = new THREE.Mesh(geometry, material);
var wcube = new THREE.Mesh(geometry, wmaterial);
var bcube = new THREE.Mesh(bparticular, wmaterial);

bcube.scale.set(1.5,1.5,1.5);

bcube.position.z = - 1;

var scaleSet = 0.7;
cube.scale.set(scaleSet,scaleSet,scaleSet);


TweenMax.to(cube.scale, 1, {x:1, ease:Elastic.easeOut, yoyo:true, repeat:-1, delay:0});
TweenMax.to(cube.scale, 1, {y:1, ease:Elastic.easeOut, yoyo:true, repeat:-1, delay:0.05});
TweenMax.to(cube.scale, 1, {z:1, ease:Elastic.easeOut, yoyo:true, repeat:-1, delay:0.3});

function cameraSet(num) {
  TweenMax.to(camera.position, 2, {z:num, ease:Power3.easeInOut, yoyo:false, repeat:0});
}


var ambientLight = new THREE.AmbientLight(0x777777, 0.2);
var lightFront = new THREE.PointLight(0xFF00FF, 1);
var lightBack = new THREE.PointLight(0x8800FF, 0.5);

lightFront.castShadow = true;

lightFront.position.set(10,10,5);
lightBack.position.set(-5,-10,-15);

scene.add(lightBack);
scene.add(lightFront);
scene.add(ambientLight);

cube.add(wcube);
scene.add(bcube);
group3d.add(cube);
scene.add(group3d);

function onchangeCamera() {
  scene.rotation.y = 0;
  TweenMax.to(scene.rotation, 3, {
    y:360 * Math.PI / 180,
    ease:Power3.easeInOut
  });
}


var numRot = 0.001;

function animate() {
  requestAnimationFrame(animate);
  group3d.rotation.x += numRot;
  group3d.rotation.y += numRot;
  group3d.rotation.z += numRot;
  
  bcube.rotation.z += numRot;
  
  renderer.render( scene, camera );  
}
animate();*/