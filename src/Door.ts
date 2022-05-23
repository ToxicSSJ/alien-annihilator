import {
	Group,
	Vector3
} from 'three'

export default class Door
{

	private x: number
	private y: number

	private distance: number
	private texture: number

	constructor(x: number, y: number, distance: number, texture: number)
	{

		this.x = x
		this.y = y

		this.distance = distance
		this.texture = texture

	}

	get getX() {
		return this.x;
	}

	get getY() {
		return this.y;
	}

	get getDistance() {
		return this.distance;
	}

	get getTexture() {
		return this.texture
	}

}
