export default class Winner
{

	private x: number
	private y: number

	private distance: number

	constructor(x: number, y: number, distance: number)
	{

		this.x = x
		this.y = y

		this.distance = distance

	}

	get getX() {
		return this.x
	}

	get getY() {
		return this.y
	}

	get getDistance() {
		return this.distance
	}

}
