
import gsap from "gsap";
import { Elastic } from 'gsap';
import { TweenMax } from 'gsap';
import * as THREE from 'three'
import { IcosahedronGeometry, InstancedInterleavedBuffer, MeshPhysicalMaterial } from 'three';

export default class Enemy extends THREE.Mesh
{

    private health : number = 30
    private respawnX: number = 0
    private respawnZ: number = 0
    private scene = new THREE.Scene()

    private lag = 0.05
    private numRot = 0.02
    private dead = false
    private shoot: number = 0

    constructor(geometry:IcosahedronGeometry, material:MeshPhysicalMaterial,iniX:number, iniZ: number, scene: THREE.Scene) {
        //const textureLoader = new THREE.TextureLoader()
        super(geometry, material)
        
        this.scale.set(1, 1, 1)
        this.position.set(iniX, 0, iniZ)

        this.scene = scene

        this.respawnX = iniX;
        this.respawnZ = iniZ;

        this.initialize()

    }

    //private appearance: Material
    async initialize() {

        var bparticular = new THREE.CircleGeometry(1,3);
        var wmaterial = new THREE.MeshNormalMaterial({wireframe:true});
        var cube = new THREE.Mesh(this.geometry, this.material);
        var wcube = new THREE.Mesh(this.geometry, wmaterial);
        var bcube = new THREE.Mesh(bparticular, wmaterial);

        bcube.scale.set(1.5, 1.5, 1.5);
        bcube.position.z = -4;

        this.scale.set(0.7, 0.7, 0.7)

        // gsap.to(this.scale, 2, {x:1, ease:Elastic.easeOut, yoyo:true, repeat:-1, delay:0})
        TweenMax.to(this.scale, 1, {x:1, ease:Elastic.easeOut, yoyo:true, repeat:-1, delay:0});
        TweenMax.to(this.scale, 1, {y:1, ease:Elastic.easeOut, yoyo:true, repeat:-1, delay:0.05});
        TweenMax.to(this.scale, 1, {z:1, ease:Elastic.easeOut, yoyo:true, repeat:-1, delay:0.3});

        cube.add(wcube);
        cube.add(wcube);

        this.scene.add(bcube);
        this.scene.add(this);

        this.add(cube);

    } 

    public animate() {

        this.rotation.x += this.numRot;
        this.rotation.y += this.numRot;
        this.rotation.z += this.numRot;
         
        // bcube.rotation.z += numRot;

    }

    public receiveShot(){

        this.health -= 10
        if (this.health <= 0){
            this.dead = true
            this.visible = false
            setTimeout(() => {
                this.visible = true
                this.dead = false
                this.respawn()
            }, 3000)
            return true
        }

        this.material = new THREE.MeshPhongMaterial({color: 0xFF0000})
        setTimeout(() => {
            this.material = new THREE.MeshPhongMaterial({color: 0x0000000})
        }, 100)

        return false

    }

    public shot()
    {
        console.log("enemy fired")
    }

    public move(direction: THREE.Vector3){

        this.position.x += (direction.x * this.lag);
		this.position.z += (direction.z * this.lag);

    }

    public respawn(){

        this.health = 30
        this.position.set(this.respawnX,0,this.respawnZ)

    }

    public inspect(){

        let direction = new THREE.Vector3()
        const delay = 0.00001
        direction = new THREE.Vector3(Math.cos(1), 0, Math.sin(0))
        this.position.x += (direction.x * delay);

    }

    get isDead() {
        return this.dead
    }

    get getShoot() {
        return this.shoot
    }

    get getHealth() {
        return this.health
    }

    setShoot(shoot: number) {
        this.shoot = shoot
    }

}