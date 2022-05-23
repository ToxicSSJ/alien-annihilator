import * as THREE from 'three'
import BlasterScene from './BlasterScene'

const width = window.innerWidth
const height = window.innerHeight

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('app') as HTMLCanvasElement
})
renderer.setSize(width, height)

const mainCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000)
const scene = new BlasterScene(mainCamera)

scene.initialize()

var times: number[] = [];
var fps;

function tick()
{

	const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }

    times.push(now);
    fps = times.length;

	if(typeof scene.fps !== "undefined")
		scene.fps(fps)


	scene.update()
	renderer.render(scene, mainCamera)
	requestAnimationFrame(tick)

}



tick()
