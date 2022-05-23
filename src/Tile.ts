import {
	Group,
	Vector3
} from 'three'

export default class Tile
{

	private readonly velocity = new Vector3()
	private isDead = false

	private x: number
	private y: number

	private texture: number
	private walls: Array<number>
	private roof: number

	constructor(x: number, y: number, texture: number, walls: Array<number>, roof: number)
	{

		this.x = x
		this.y = y

		this.texture = texture
		this.walls = walls
		this.roof = roof

		setTimeout(() => {
			this.isDead = true
		}, 1000)

	}

	get getX() {
		return this.x
	}

	get getY() {
		return this.y
	}

	get getTexture() {
		return this.texture
	}

	get getWalls() {
		return this.walls
	}

	get getRoof() {
		return this.roof
	}

}
