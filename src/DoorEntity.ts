import { Mesh } from 'three/src/objects/Mesh'
import Door from './Door'

export default class DoorEntity
{

	private door: Door
	private mesh: Mesh

	private current: number
	private activated: boolean
	private completed: boolean

	constructor(door: Door, mesh: Mesh, current: number, activated: boolean, completed: boolean)
	{

		this.door = door
		this.mesh = mesh

		this.current = current
		this.activated = activated
		this.completed = completed

	}

	get getDoor() {
		return this.door
	}

	get getMesh() {
		return this.mesh
	}

	get getCurrent() {
		return this.current
	}

	get getActivated() {
		return this.activated
	}

	get getCompleted() {
		return this.completed
	}

	setActivated(activated: boolean) {
		this.activated = activated
	}

	setCompleted(completed: boolean) {
		this.completed = completed
	}

	setCurrent(current: number) {
		this.current = current
	}

}
