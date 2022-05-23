import {
	Group,
	Vector3
} from 'three'

export default class WallOffset
{

	private readonly velocity = new Vector3()
	private isDead = false

	private x: number
	private y: number
	private r: number

	constructor(x: number, y: number, r: number)
	{

		this.x = x
		this.y = y
		this.r = r

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
	
	get getR() {
		return this.r;
	}

}
