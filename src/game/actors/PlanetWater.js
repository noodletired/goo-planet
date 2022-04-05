import { Bodies, Composite, Detector, Vector } from 'matter-js';
import { Container } from 'pixi.js';
import { toHandlers } from 'vue';

import Actor from '../engine/Actor';
import { CollisionCategories } from '../utilities/Collisions';
import { drawPolygon } from '../utilities/Graphics';

export class PlanetWater extends Actor {
	#startAngle; // degrees
	#endAngle; // degrees
	#center;
	#radialOffset;
	#height;
	#damping;

	#physicsBody;
	#graphics;
	#innerVertices;
	#waveHeights;

	/**
	 * Create a new planetary water
	 * @param {Object} configuration
	 */
	constructor({
		world,
		startAngle = 0,
		endAngle = 360,
		center = { x: 0, y: 0 },
		radialOffset = 0,
		height = 10,
		damping = 0.1,
	}) {
		super();

		this.#startAngle = startAngle;
		this.#endAngle = endAngle;
		this.#center = center;
		this.#radialOffset = radialOffset;
		this.#height = height;
		this.#damping = damping;

		this.#initPhysics(world);
	}

	/**
	 * Control behaviours on the water
	 * @param {Number} dt time since last frame, useful for scaling impulses
	 */
	update(dt) {
		// Apply damping to heights
		// const heights = this.#waveHeights;
		// for (let i = 0; i < heights.length; i++) {
		// 	const h = i === 0 ? heights.length - 1 : i - 1;
		// 	const j = i === heights.length - 1 ? 0 : i + 1;
		// 	const weightedAverage = (heights[h] + heights[i] * 2 + heights[j]) / 4;
		// 	const difference = this.#height - weightedAverage;
		// 	heights[i] += (difference * this.#damping * dt) / 1000;
		// }
		// TODO: apply idle sines
		// TODO: splashes
	}

	/**
	 * Draw the planet
	 * @param {PIXI.Container} container to draw into, specified by the scene
	 */
	render(container) {
		// TODO: update graphics

		if (!this.#graphics) {
			const outerVertices = [...this.#innerVertices]
				.reverse() // reverse to get convex/clockwise order
				.map((vertex, i) => Vector.mult(Vector.normalise(vertex), this.#radialOffset + this.#waveHeights[i]));
			const graphics = drawPolygon([...outerVertices, ...this.#innerVertices], {
				graphics: this.#graphics,
				colour: 0xffffff,
				alpha: 0.5,
			});

			this.#graphics = graphics;
			container.addChild(this.#graphics);
		}
	}

	/**
	 * Initialise physics body and attach to world
	 * @param {Composite} world a Composite world/scene object to attach to
	 * @private
	 */
	#initPhysics(world) {
		// Generate a sliced torus
		const innerVertices = [];
		const outerVertices = [];
		const degToRad = Math.PI / 180;
		const angleBetween = this.#endAngle - this.#startAngle;
		const arcLength = (this.#radialOffset + this.#height) * angleBetween * degToRad; // angle * radius
		const minStepLength = 2; // metres
		const steps = Math.floor(arcLength / minStepLength);
		for (let i = 0; i <= steps; i++) {
			const angle = (i / steps) * angleBetween + this.#startAngle;

			// clockwise arrangement starting with outer closest to 0
			// 0 degrees starts at 12-o'clock
			const vector = { x: Math.sin(angle * degToRad), y: Math.cos(angle * degToRad) };
			innerVertices.unshift(Vector.mult(vector, this.#radialOffset));
			outerVertices.push(Vector.mult(vector, this.#radialOffset + this.#height));
			console.log(angle);
		}
		const vertices = [...outerVertices, ...innerVertices];

		this.#innerVertices = innerVertices;
		this.#waveHeights = innerVertices.map((x, i) => (1 + Math.sin(this.uniqueOffset + i) * 0.05) * this.#height); // 10% height ripple

		// Create the body
		const { x, y } = this.#center;
		const body = Bodies.fromVertices(x, y, vertices, {
			isStatic: true,
			isSensor: true,
			plugin: {
				attractors: [
					(bodyA, bodyB) => {
						// Only apply forces to collidable bodies
						if (!Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter)) {
							return null;
						}

						// Apply buoyancy in the form of Fb = W using similar acceleration formula as Planet
						// With some additional parameters to tweak how dense the fluid feels
						const displacement = {
							x: bodyB.position.x - this.#center.x,
							y: bodyB.position.y - this.#center.y,
						};
						const portionInFluid =
							1.0 - Math.max(Math.min((Vector.magnitude(displacement) - this.#radialOffset) / this.#height, 1), 0);
						const repulsionOrder = 0.5; // < 1 makes deeper water apply more force
						const repulsionFactor = 2; // flat multiplier to repel harder
						return Vector.mult(displacement, bodyB.mass * repulsionFactor * 1e-6 * portionInFluid ** repulsionOrder);
					},
				],
			},
			collisionFilter: {
				group: 0,
				category: CollisionCategories.RIGID,
				mask: CollisionCategories.DYNAMIC, // only collide with goo
			},
		});

		this.#physicsBody = body;
		Composite.add(world, body);
	}
}
