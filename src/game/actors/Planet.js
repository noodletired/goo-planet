import { Bodies, Composite } from 'matter-js';

import Actor from '../engine/Actor';
import { CollisionCategories } from '../utilities/Collisions';
import { drawCircle } from '../utilities/Graphics';

export class Planet extends Actor {
	#size; // determines radius

	#physicsBody;
	#graphics;

	/**
	 * Create a new planet!
	 * @param {Object} configuration
	 */
	constructor({ world, size = 50, position = { x: 0, y: 0 } }) {
		super();

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
	 * Initialise physics body and attach to world
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
