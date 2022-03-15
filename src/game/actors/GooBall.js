import { Bodies, Composite } from 'matter-js';

import { drawCircle } from '../utilities/Graphics';

export class GooBall {
	#size; // determines radius of goo
	#density; // determines how powerful the goo is
	#stickiness; // 0-1 friction
	#bounciness; // 0-1 restitution

	#physicsBody;
	#graphics;

	/**
	 * Create a new goo!
	 * @param {Object} configuration
	 */
	constructor({
		world,
		size = 1,
		density = 1,
		position = { x: 0, y: 0 },
		angle = Math.random() * Math.PI,
		stickiness = 0.1,
		bounciness = 0.5,
	}) {
		this.#size = size;
		this.#density = density;
		this.#stickiness = stickiness;
		this.#bounciness = bounciness;

		this.#initPhysics(world, position, angle);
	}

	/**
	 * Draw the goo
	 * @param {PIXI.Container} container to draw the goo on
	 */
	render(container) {
		if (!this.#graphics) {
			this.#graphics = drawCircle(this.#size);
			container.addChild(this.#graphics);
		}

		// Set position from physics
		const { position } = this.#physicsBody;
		this.#graphics.x = position.x;
		this.#graphics.y = position.y;
	}

	/**
	 * Initialise planck physics body and attach to world
	 * @param {Composite} world a Composite world/scene object to attach to
	 * @param {Object} position 2D vector
	 * @param {Number} angle in radians
	 * @private
	 */
	#initPhysics(world, { x, y }, angle) {
		// Create the body
		const body = Bodies.circle(x, y, this.#size, {
			angle,
			density: this.#density,
			frictionStatic: this.#stickiness,
			restitution: this.#bounciness,
		});

		this.#physicsBody = body;
		Composite.add(world, body);
	}
}
