import * as THREE from 'three'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GUI } from 'dat.gui'

import Bullet from './Bullet'
import Tile from './Tile'
import WallOffset from './WallOffset'
import { Audio, Material } from 'three'
import Door from './Door'
import DoorEntity from './DoorEntity'
import Winner from './Winner'

export default class BlasterScene extends THREE.Scene
{

	private readonly mtlLoader = new MTLLoader()
	private readonly objLoader = new OBJLoader()
	private readonly gltfLoader = new GLTFLoader();

	private readonly dracoLoader = new DRACOLoader();
	private readonly soundListener = new THREE.AudioListener();
	private readonly camera: THREE.PerspectiveCamera
	private readonly keyDown = new Set<string>()

	private blaster?: THREE.Group
	private bulletMtl?: MTLLoader.MaterialCreator

	private directionVector = new THREE.Vector3()

	private bullets: Bullet[] = []
	private targets: THREE.Group[] = []
	private scene: THREE.Scene;
	private speed: number = 0.5

	private sound: Audio;
	private music: Audio;

	private textures: Map<string, Material> = new Map<string, Material>(); 

	private floors: Array<Tile> = [

		// Start Lobby
		new Tile(0, 0, 2, [0, 0, 0, -1], 1),
		new Tile(0, 20, 2, [-1, -1, -1, 0], 1),

		new Tile(20, 20, 2, [0, 0, -1, -1], 1),
		new Tile(-20, 20, 2, [0, -1, 0, -1], 1),
		
		new Tile(20, 40, 2, [-1, 0, 0, -1], 1),
		new Tile(20, 60, 2, [-1, 0, -1, 0], 1),

		new Tile(0, 60, 2, [0, -1, -1, -1], 1),
		new Tile(-20, 40, 2, [-1, 0, 0, -1], 1),
		new Tile(0, 80, 2, [-1, 0, 0, -1], 1),
		new Tile(-20, 60, 2, [-1, -1, 0, 0], 1),

		// Start Second Section
		// Middle
		new Tile(0, 100, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 120, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 140, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 160, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 180, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 200, 1, [-1, -1, -1, 1], 1),
		new Tile(0, 240, 1, [1, -1, -1, -1], 1),
		new Tile(0, 260, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 280, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 300, 1, [-1, 4, 4, -1], 1),

		// Left
		new Tile(20, 100, 1, [4, 4, -1, -1], 1),
		new Tile(20, 120, 1, [-1, 4, -1, -1], 1),
		new Tile(20, 140, 1, [-1, 4, -1, -1], 1),
		new Tile(20, 160, 1, [-1, 4, -1, -1], 1),
		new Tile(20, 180, 1, [-1, 4, -1, -1], 1),
		new Tile(20, 200, 1, [-1, 4, -1, -1], 1),
		new Tile(20, 220, 1, [-1, 4, 1, -1], 1),
		new Tile(20, 240, 1, [-1, 4, -1, -1], 1),
		new Tile(20, 260, 1, [-1, 4, -1, -1], 1),
		new Tile(20, 280, 1, [-1, 4, -1, 4], 1),

		// Right
		new Tile(-20, 100, 1, [4, -1, 4, -1], 1),
		new Tile(-20, 120, 1, [-1, -1, 4, -1], 1),
		new Tile(-20, 140, 1, [-1, -1, 4, -1], 1),
		new Tile(-20, 160, 1, [-1, -1, 4, -1], 1),
		new Tile(-20, 180, 1, [-1, -1, 4, -1], 1),
		new Tile(-20, 200, 1, [-1, -1, 4, -1], 1),
		new Tile(-20, 220, 1, [-1, 1, 4, -1], 1),
		new Tile(-20, 240, 1, [-1, -1, 4, -1], 1),
		new Tile(-20, 260, 1, [-1, -1, 4, -1], 1),
		new Tile(-20, 280, 1, [-1, -1, 4, 4], 1),
		// End Second Section

		// Start Third Section
		// Middle
		new Tile(0, 100 + 200, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 120 + 200, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 140 + 200, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 160 + 200, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 180 + 200, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 200 + 200, 1, [-1, -1, -1, 0], 1),
		new Tile(0, 240 + 200, 1, [0, -1, -1, -1], 1),
		new Tile(0, 260 + 200, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 280 + 200, 1, [-1, -1, -1, -1], 1),
		new Tile(0, 300 + 200, 1, [-1, 3, 3, -1], 1),
		new Tile(0, 320 + 200, 3, [-1, 3, 3, 3], 1),

		// Left
		new Tile(20, 100 + 200, 1, [3, 3, 3, 3], 1),
		new Tile(20, 120 + 200, 1, [-1, 3, -1, -1], 1),
		new Tile(20, 140 + 200, 1, [-1, 3, -1, -1], 1),
		new Tile(20, 160 + 200, 1, [-1, 3, -1, -1], 1),
		new Tile(20, 180 + 200, 1, [-1, 3, -1, -1], 1),
		new Tile(20, 200 + 200, 1, [-1, 3, -1, -1], 1),
		new Tile(20, 220 + 200, 1, [-1, 3, 0, -1], 1),
		new Tile(20, 240 + 200, 1, [-1, 3, -1, -1], 1),
		new Tile(20, 260 + 200, 1, [-1, 3, -1, -1], 1),
		new Tile(20, 280 + 200, 1, [-1, 3, -1, 3], 1),

		// Right
		new Tile(-20, 100 + 200, 1, [3, 3, 3, 3], 1),
		new Tile(-20, 120 + 200, 1, [-1, -1, 3, -1], 1),
		new Tile(-20, 140 + 200, 1, [-1, -1, 3, -1], 1),
		new Tile(-20, 160 + 200, 1, [-1, -1, 3, -1], 1),
		new Tile(-20, 180 + 200, 1, [-1, -1, 3, -1], 1),
		new Tile(-20, 200 + 200, 1, [-1, -1, 3, -1], 1),
		new Tile(-20, 220 + 200, 1, [-1, 0, 3, -1], 1),
		new Tile(-20, 240 + 200, 1, [-1, -1, 3, -1], 1),
		new Tile(-20, 260 + 200, 1, [-1, -1, 3, -1], 1),
		new Tile(-20, 280 + 200, 1, [-1, -1, 3, 3], 1),
		// End Second Section
		
	]

	private doors: Array<Door> = [
		new Door(0, 90, 0, 15, 0),
		new Door(0, 310, 0, 15, 0)
	]
	
	private winners: Array<Winner> = [
		new Winner(0, 520, 5)
	]

	private walls: Array<WallOffset> = [
		new WallOffset(0, 0, 90),
		new WallOffset(10, 10, 0),
		new WallOffset(-10, 10, 0),
		new WallOffset(0, 20, 90)
	]

	private door_textures: string[] = [
		"door_a"
	]

	private roof_textures: string[] = [
		"roof_a", "roof_b"
	]

	private floor_textures: string[] = [
		"floor_a", "floor_b", "floor_c", "winner"
	]

	private wall_textures: string[] = [
		"wall_a", "wall_b", "wall_c", "wall_d", "wall_e"
	]

	private game_doors: Array<DoorEntity> = []
	private game_win: boolean = false

	private game_skip: number = 0
	private game_treeshold: number = 0.0005

	constructor(camera: THREE.PerspectiveCamera)
	{
		super()

		this.dracoLoader.setDecoderPath('/examples/js/libs/draco/');
		this.gltfLoader.setDRACOLoader(this.dracoLoader);

		this.scene = this;
		this.camera = camera

		this.camera.add(this.soundListener)

		this.sound = new THREE.Audio(this.soundListener)
		this.music = new THREE.Audio(this.soundListener)

	}

	async initialize()
	{

		// music
		this.playMusic("assets/sound/music.mp3", this.music)

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

		let skyboxGeo = new THREE.BoxGeometry(3000, 3000, 3000)
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

		this.add(t1, t2, t3, t4)
		this.targets.push(t1, t2, t3, t4)

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

		this.loadMapTextures();

		for(let i = 0; i < this.floors.length; i++) {

			const floor = this.floors[i]

			const geometry_in = new THREE.BoxGeometry(20, 0.1, 20);
			const floor_cube = new THREE.Mesh(geometry_in, this.textures.get(this.floor_textures[floor.getTexture]));

			floor_cube.position.x = floor.getX;
			floor_cube.position.z = floor.getY;
			floor_cube.position.y = -2;

			this.scene.add(floor_cube);

			for(let j = 0; j < floor.getWalls.length; j++) {

				let value = floor.getWalls[j]

				if(value < 0)
					continue

				let offset = this.walls[j]

				const geometry_in = new THREE.BoxGeometry(0.1, 10, 20);
				const wall_cube = new THREE.Mesh(geometry_in, this.textures.get(this.wall_textures[value]));
	
				wall_cube.position.x = floor_cube.position.x + offset.getX + 0;
				wall_cube.position.z = floor_cube.position.z + offset.getY + -10;
				wall_cube.position.y = 3;
	
				wall_cube.rotateY(this.radian(offset.getR));
				this.scene.add(wall_cube);

			}

			let roof_value = floor.getRoof

			if(roof_value >= 0) {

				const geometry_in = new THREE.BoxGeometry(20, 0.1, 20);
				const material = this.textures.get(this.roof_textures[roof_value])

				if(material == undefined) continue

				let new_material = material?.clone()
				new_material.opacity = 0.1
				new_material.transparent =  true

				const roof_cube = new THREE.Mesh(geometry_in, new_material);
	
				roof_cube.position.x = floor_cube.position.x;
				roof_cube.position.z = floor_cube.position.z;
				roof_cube.position.y = 8;

				this.scene.add(roof_cube);

			}
				

		}

		for(let i = 0; i < this.doors.length; i++) {

			const door = this.doors[i]
			let offset = this.walls[door.getRotate]

			const geometry_in = new THREE.BoxGeometry(0.1, 10, 20);
			const door_cube = new THREE.Mesh(geometry_in, this.textures.get(this.door_textures[door.getTexture]));

			door_cube.position.x = door.getX + offset.getX + 0;
			door_cube.position.z = door.getY + offset.getY + -10;
			door_cube.position.y = 3;

			door_cube.rotateY(this.radian(offset.getR));

			this.scene.add(door_cube);
			this.game_doors.push(new DoorEntity(door, door_cube, 0, false, false))

		}

	}

	async loadMapTextures() {

		this.loadTextures(this.floor_textures)
		this.loadTextures(this.wall_textures)
		this.loadTextures(this.roof_textures)
		this.loadTextures(this.door_textures)

	}

	async loadTextures(textures: string[]) {

		for(let i = 0; i < textures.length; i++) {

			var texture_name = textures[i]
			var texture = new THREE.TextureLoader().load("assets/tiles/" + texture_name + ".jpg");

			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(1, 1);

			var material = new THREE.MeshBasicMaterial({
				color: 0xffffff,
				map: texture,
				side: THREE.DoubleSide
			});

			this.textures.set(texture_name, material)

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

		if (this.keyDown.has('w') || this.keyDown.has('arrowup'))
		{
			this.blaster.position.add(dir.clone().multiplyScalar(this.speed))
		}
		else if (this.keyDown.has('s') || this.keyDown.has('arrowdown'))
		{
			this.blaster.position.add(dir.clone().multiplyScalar(-this.speed))
		}

		if (shiftKey)
		{
			const strafeDir = dir.clone()
			const upVector = new THREE.Vector3(0, 1, 0)

			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				this.blaster.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
						.multiplyScalar(this.speed)
				)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				this.blaster.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * -0.5)
						.multiplyScalar(this.speed)
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
		this.playSound("assets/sound/shoot.mp3", 0.05)

	}

	private radian(deg: number) {
		return (deg * Math.PI) / 180.0;
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
			}
		}
	}

	private updateDoors() {

		if(!this.blaster) return

		for (let i = 0; i < this.game_doors.length; ++i) {

			const entity = this.game_doors[i]
			if(entity.getCompleted) continue

			let mesh = entity.getMesh

			if(entity.getActivated) {

				if(mesh.position.y > -15) {

					mesh.position.y = mesh.position.y -= 0.075
					continue

				}

				entity.setCompleted(true)
				continue

			}

			const door_pos = entity.getMesh.position.clone()
			const player_pos = this.blaster.position.clone()

			let distance = door_pos.distanceTo(player_pos)

			if(distance <= entity.getDoor.getDistance) {

				entity.setActivated(true)
				this.playSound("assets/sound/door.mp3", 0.5)
				continue

			}

		}

	}

	private updateWinners() {

		if(!this.blaster || this.game_win) return

		for (let i = 0; i < this.winners.length; ++i) {

			const winner = this.winners[i]

			const winner_pos = new THREE.Vector3(winner.getX, 0, winner.getY);
			const player_pos = this.blaster.position.clone()

			let distance = winner_pos.distanceTo(player_pos)
			console.log(distance)

			if(distance <= winner.getDistance) {

				this.playSound("assets/sound/win.mp3", 0.5)
				this.game_win = true
				return

			}

		}

	}

	private playSound(soundName: string, volume: number) {
		let sound = new THREE.Audio(this.soundListener)
		const audioLoader = new THREE.AudioLoader();
		audioLoader.load(soundName, function( buffer ) {
			sound.setBuffer(buffer);
			sound.setLoop(false);
			sound.setVolume(volume);
			sound.play();
		});
	}

	private playMusic(soundName: string, player: Audio) {
		const audioLoader = new THREE.AudioLoader();
		let sound = player
		audioLoader.load(soundName, function( buffer ) {
			sound.setBuffer(buffer);
			sound.setLoop(true);
			sound.setVolume(0.2);
			sound.play();
		});
	}

	update()
	{

		if(this.game_win) {

			if(this.game_skip++ >= this.game_treeshold) {

				this.game_skip = 0
				this.game_treeshold += this.game_treeshold

				this.updateInput()
				this.updateBullets()
				this.updateDoors()
				this.updateWinners()

			}

			return

		}

		// update
		this.updateInput()
		this.updateBullets()
		this.updateDoors()
		this.updateWinners()

	}
}