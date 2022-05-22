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

	constructor(x: number, y: number)
	{

		this.x = x
		this.y = y

		setTimeout(() => {
			this.isDead = true
		}, 1000)

	}

	get getX() {
		return this.x;
	}

	get getY() {
		return this.y;
	}

}
