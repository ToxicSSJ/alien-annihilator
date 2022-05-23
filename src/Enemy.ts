import * as THREE from 'three'
import { IcosahedronGeometry, MeshPhysicalMaterial } from 'three';

export default class Enemy extends THREE.Mesh
{
    private health : number = 30
    private respawnX: number = 0
    private respawnZ: number = 0
    private lag = 0.009
    private group3d = new THREE.Object3D()
    private scene = new THREE.Scene()

    //private appearance: Material
    async initialize(){
        var bparticular = new THREE.CircleGeometry(1,3);
        var wmaterial = new THREE.MeshNormalMaterial({wireframe:true});
        var cube = new THREE.Mesh(this.geometry, this.material);
        var wcube = new THREE.Mesh(this.geometry, wmaterial);
        var bcube = new THREE.Mesh(bparticular, wmaterial);

        bcube.scale.set(0.5,0.5,0.5);

        bcube.position.z = -4;

        cube.add(wcube);

        cube.add(wcube);
        this.scene.add(bcube);
        this.add(cube);
        this.scene.add(this);
    }


    constructor(geometry:IcosahedronGeometry, material:MeshPhysicalMaterial,iniX:number, iniZ: number, scene: THREE.Scene) {
        //const textureLoader = new THREE.TextureLoader()
        super(geometry, material)
        this.scale.set(0.3, 0.3, 0.3)
        this.position.set(iniX, 0, iniZ)

        this.scene = scene

        this.respawnX = iniX;
        this.respawnZ = iniZ;
        this.initialize()
    }

    public receiveShot(){

        this.health -= 10
        if (this.health <= 0){
            this.visible = false
            setTimeout(() => {
                this.visible = true
                this.respawn()
            }, 3000)
            
        }
        this.material = new THREE.MeshPhongMaterial({color: 0xFF0000})
        setTimeout(() => {
            this.material = new THREE.MeshPhongMaterial({color: 0x0000000})
        }, 100)
    }

    public shot()
    {
        
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
}