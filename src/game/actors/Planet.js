import { Attractors } from 'matter-attractors';
import { Body, Bodies, Composite, Vector } from 'matter-js';

import { drawCircle } from '../utilities/Graphics';

export class Planet {
	#size; // determines radius

	#physicsBody;
	#graphics;

	/**
	 * Create a new pkanet!
	 * @param {Object} configuration
	 */
	constructor({ world, size = 50, position = { x: 0, y: 0 } }) {
		this.#size = size;

		this.#initPhysics(world, position);
	}

	/**
	 * Draw the planet
	 * @param {PIXI.Container} container to draw into, specified by the scene
	 */
	render(container) {
		if (!this.#graphics) {
			this.#graphics = drawCircle(this.#size);
			container.addChild(this.#graphics);
		}
	}

	/**
	 * Initialise planck physics body and attach to world
	 * @param {Composite} world a Composite world/scene object to attach to
	 * @param {Object} position 2D vector
	 * @private
	 */
	#initPhysics(world, { x, y }) {
		// Create the body
		const body = Bodies.circle(x, y, this.#size, {
			isStatic: true,
			frictionStatic: 100,
			plugin: {
				attractors: [
					(bodyA, bodyB) => ({
						x: (bodyA.position.x - bodyB.position.x) * 1e-6,
						y: (bodyA.position.y - bodyB.position.y) * 1e-6,
					}),
				],
			},
		});

		this.#physicsBody = body;
		Composite.add(world, body);
	}
}
