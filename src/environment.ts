import * as THREE from 'three'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GUI } from 'dat.gui'

import Bullet from './Bullet'
import Tile from './Tile'

export default class BlasterScene extends THREE.Scene
{

	private readonly mtlLoader = new MTLLoader()
	private readonly objLoader = new OBJLoader()
	private readonly gltfLoader = new GLTFLoader();

	private readonly dracoLoader = new DRACOLoader();

	private readonly camera: THREE.PerspectiveCamera

	private readonly keyDown = new Set<string>()

	private blaster?: THREE.Group
	private bulletMtl?: MTLLoader.MaterialCreator

	private directionVector = new THREE.Vector3()

	private bullets: Bullet[] = []
	private targets: THREE.Group[] = []
	private scene: THREE.Scene;

	private floors: Array<Tile> = [
		new Tile(0, 0),
		new Tile(0, 20)
	]

	private walls: Array<Tile> = [
		new Tile(0, 0),
		new Tile(0, 20)
	]

	constructor(camera: THREE.PerspectiveCamera)
	{
		super()

		this.dracoLoader.setDecoderPath('/examples/js/libs/draco/');
		this.gltfLoader.setDRACOLoader(this.dracoLoader);

		this.scene = this;
		this.camera = camera

	}

	async initialize()
	{

		// sprite
		const map = new THREE.TextureLoader().load( 'sprite.png' );
		const material2 = new THREE.SpriteMaterial( { map: map } );

		const sprite = new THREE.Sprite( material2 );
		this.camera.position.z = 2;
		this.camera.add(sprite);

		// wall
		this.map()
		
		// let btn = document.createElement("button");
		// btn.innerHTML = "Click Me";
		// btn.style.cssText = 'position:absolute;top:2%;left:2%;width:200px;height:200px;';
		//document.body.appendChild(btn);

		// background
		let materialArray = []

		let texture_ft = new THREE.TextureLoader().load('assets/background/corona_ft.png');
		let texture_bk = new THREE.TextureLoader().load('assets/background/corona_bk.png');
		let texture_up = new THREE.TextureLoader().load('assets/background/corona_up.png');
		let texture_dn = new THREE.TextureLoader().load('assets/background/corona_dn.png');
		let texture_rt = new THREE.TextureLoader().load('assets/background/corona_rt.png');
		let texture_lf = new THREE.TextureLoader().load('assets/background/corona_lf.png');

		materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft, side: THREE.BackSide, fog: false }))
		materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk, side: THREE.BackSide, fog: false }))
		materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up, side: THREE.BackSide, fog: false }))
		materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn, side: THREE.BackSide, fog: false }))
		materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt, side: THREE.BackSide, fog: false }))
		materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf, side: THREE.BackSide, fog: false }))

		for(let i = 0; i < 6; i++) {
			materialArray[i].side = THREE.BackSide;
			materialArray[i].fog = false;
		}

		let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000)
		let skybox = new THREE.Mesh(skyboxGeo, materialArray)
		this.add(skybox)

		// Load a glTF resource
		let gltf = await this.gltfLoader.loadAsync(
			// resource URL
			'assets/maps/design.gltf'
		);

		gltf.scene.scale.set(1,1,1) // scale here
		//this.add( gltf.scene );

		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object


		// load a shared MTL (Material Template Library) for the targets
		const targetMtl = await this.mtlLoader.loadAsync('assets/targetA.mtl')
		targetMtl.preload()

		this.bulletMtl = await this.mtlLoader.loadAsync('assets/foamBulletB.mtl')
		this.bulletMtl.preload()

		// create raycaster for path finding
		const search = [] // directions

		for (let i = 0; i < 360; i+=1) {
			search[i] = new THREE.Vector3(Math.cos(i) , 0 , Math.sin(i))
		}

		this.directions = search;

		// create the 4 targets
		const t1 = await this.createTarget(targetMtl)
		t1.position.x = -1
		t1.position.z = -3

		const t2 = await this.createTarget(targetMtl)
		t2.position.x = 1
		t2.position.z = -3

		const t3 = await this.createTarget(targetMtl)
		t3.position.x = 2
		t3.position.z = -3

		const t4 = await this.createTarget(targetMtl)
		t4.position.x = -2
		t4.position.z = -3

		//modification
		const enemyCube = this.createCube()
		enemyCube.position.set(0,0,-3)
		//end of modification
		//this.loadAlien();

		this.add(t1, t2, t3, t4, enemyCube)
		this.targets.push(t1, t2, t3, t4)
		this.enemies.push(enemyCube)

		this.blaster = await this.createBlaster()
		this.add(this.blaster)

		this.blaster.position.z = 3
		this.blaster.add(this.camera)

		this.camera.position.z = 1
		this.camera.position.y = 0.5

		const light = new THREE.DirectionalLight(0xFFFFFF, 1)
		light.position.set(0, 4, 2)

		this.add(light)

		document.addEventListener('keydown', this.handleKeyDown)
		document.addEventListener('keyup', this.handleKeyUp)

	}

	async map() {

		var floor_texture = new THREE.TextureLoader().load("assets/tiles/floor.jpg");
		var wall_texture = new THREE.TextureLoader().load("assets/tiles/wall.jpg");

		floor_texture.wrapS = THREE.RepeatWrapping;
		floor_texture.wrapT = THREE.RepeatWrapping;
		floor_texture.repeat.set( 4, 4 );

		wall_texture.wrapS = THREE.RepeatWrapping;
		wall_texture.wrapT = THREE.RepeatWrapping;
		wall_texture.repeat.set( 4, 4 );

		var material_floor = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: floor_texture,
		    side: THREE.DoubleSide
		});

		var material_wall = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: wall_texture,
		    side: THREE.DoubleSide
		});

		for(let i = 0; i < this.floors.length; i++) {

			const floor = this.floors[i]

			const geometry_in = new THREE.BoxGeometry(20, 0.1, 20);
			const cube = new THREE.Mesh(geometry_in, material_floor);

			cube.position.x = floor.getX;
			cube.position.z = floor.getY;
			cube.position.y = -2;

			this.scene.add(cube);
			console.log('lel')

		}

		for(let i = 0; i < this.walls.length; i++) {

			const wall = this.walls[i]

			const geometry_in = new THREE.BoxGeometry(0.1, 10, 20);
			const cube = new THREE.Mesh(geometry_in, material_wall);

			cube.position.x = wall.getX;
			cube.position.z = wall.getY;
			cube.position.y = 3;

			this.scene.add(cube);
			console.log('lel')

		}

	}

	private handleKeyDown = (event: KeyboardEvent) => {
		this.keyDown.add(event.key.toLowerCase())
	}

	private handleKeyUp = (event: KeyboardEvent) => {
		this.keyDown.delete(event.key.toLowerCase())

		if (event.key === ' ')
		{
			this.createBullet()
		}
	}

	private animate(){
		//if(this == undefined) // ?? por que mrdas es undefined
		//	return;
		this.checkForTarget();
		requestAnimationFrame(() => this.animate);
	}

	private updateEnemy(){
		this.animate()
	}

	private updateInput()
	{
		if (!this.blaster)
		{
			return
		}

		const shiftKey = this.keyDown.has('shift')

		if (!shiftKey)
		{
			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				this.blaster.rotateY(0.02)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				this.blaster.rotateY(-0.02)
			}
		}

		const dir = this.directionVector

		this.camera.getWorldDirection(dir)

		const speed = 0.1

		if (this.keyDown.has('w') || this.keyDown.has('arrowup'))
		{
			this.blaster.position.add(dir.clone().multiplyScalar(speed))
		}
		else if (this.keyDown.has('s') || this.keyDown.has('arrowdown'))
		{
			this.blaster.position.add(dir.clone().multiplyScalar(-speed))
		}

		if (shiftKey)
		{
			const strafeDir = dir.clone()
			const upVector = new THREE.Vector3(0, 1, 0)

			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				this.blaster.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
						.multiplyScalar(speed)
				)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				this.blaster.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * -0.5)
						.multiplyScalar(speed)
				)
			}
		}
	}

	private async createTarget(mtl: MTLLoader.MaterialCreator)
	{
		this.objLoader.setMaterials(mtl)

		const modelRoot = await this.objLoader.loadAsync('assets/targetA.obj')

		modelRoot.rotateY(Math.PI * 0.5)

		return modelRoot
	}

	//modification
	private createCube()
	{
		return new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshPhongMaterial({ color: 0x333333 }))
	}

	public checkForTarget(){

		this.directions.forEach((direction) => {

			//raycaster.set(ene)
			this.raycaster.set(this.enemies[0].position, direction);
			this.raycaster.near = 0
			this.raycaster.far = 10000
			
			if (this.blaster){
				const intersects = this.raycaster.intersectObjects(this.blaster.children, false);
				
				if(intersects.length == 0)
					return;
			
				if(intersects[0].object.name) {

					this.enemies[0].position.x += (direction.x * this.lag);
					this.enemies[0].position.z += (direction.z * this.lag);

				}
			}

		});
		
	}
	//end of modification

	private async createBlaster()
	{
		const mtl = await this.mtlLoader.loadAsync('assets/blasterG.mtl')
		mtl.preload()

		this.objLoader.setMaterials(mtl)

		const modelRoot = await this.objLoader.loadAsync('assets/blasterG.obj')

		return modelRoot
	}

	private async createBullet()
	{
		if (!this.blaster)
		{
			return
		}

		if (this.bulletMtl)
		{
			this.objLoader.setMaterials(this.bulletMtl)
		}

		const bulletModel = await this.objLoader.loadAsync('assets/foamBulletB.obj')

		this.camera.getWorldDirection(this.directionVector)

		const aabb = new THREE.Box3().setFromObject(this.blaster)
		const size = aabb.getSize(new THREE.Vector3())

		const vec = this.blaster.position.clone()
		vec.y += 0.06

		bulletModel.position.add(
			vec.add(
				this.directionVector.clone().multiplyScalar(size.z * 0.5)
			)
		)

		// rotate children to match gun for simplicity
		bulletModel.children.forEach(child => child.rotateX(Math.PI * -0.5))

		// use the same rotation as as the gun
		bulletModel.rotation.copy(this.blaster.rotation)

		this.add(bulletModel)

		const b = new Bullet(bulletModel)
		b.setVelocity(
			this.directionVector.x * 0.2,
			this.directionVector.y * 0.2,
			this.directionVector.z * 0.2
		)

		this.bullets.push(b)
	}

	private updateBullets()
	{
		for (let i = 0; i < this.bullets.length; ++i)
		{
			const b = this.bullets[i]
			b.update()

			if (b.shouldRemove)
			{
				this.remove(b.group)
				this.bullets.splice(i, 1)
				i--
			}
			else
			{
				for (let j = 0; j < this.targets.length; ++j)
				{
					const target = this.targets[j]
					if (target.position.distanceToSquared(b.group.position) < 0.05)
					{
						this.remove(b.group)
						this.bullets.splice(i, 1)
						i--

						target.visible = false
						setTimeout(() => {
							target.visible = true
						}, 1000)
					}
				}
				for (let k = 0; k < this.enemies.length; ++k)
				{
					const target = this.enemies[k]
					if (target.position.distanceToSquared(b.group.position) < 0.05)
					{
						this.remove(b.group)
						this.bullets.splice(i, 1)
						i--

						target.visible = false
						target.position.set(0,0,-3)
						setTimeout(() => {
							target.visible = true
						}, 3000)
					}
				}
			}
		}
	}

	update()
	{

		if(!this.initialized)
			return;

		// update
		this.updateInput()
		this.updateBullets()
		this.updateEnemy()

	}
}