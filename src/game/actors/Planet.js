import { Circle, Vec2 } from 'planck';

import { drawCircle } from '../utilities/Graphics';

export class Planet {
	#size; // determines radius

	#world;
	#physicsBody;
	#graphics;

	/**
	 * Create a new pkanet!
	 * @param {Object} configuration
	 */
	constructor({ world, size = 50, position = Vec2.zero() }) {
		this.#world = world;
		this.#size = size;

		this.#initPhysics(position);
	}

	/**
	 * Clean up the planet and its physics body
	 */
	destroy() {
		this.#world.destroyBody(this.#physicsBody);
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
	 * @private
	 */
	#initPhysics(position) {
		// Create the body
		const body = this.#world.createBody({
			type: 'static',
			position,
			allowSleep: false,
			awake: true,
			active: true,
			userData: this, // we're geocentric here
		});

		// Make it a circle
		body.createFixture({
			shape: Circle(this.#size),
			density: 0,
			friction: 0.5, // TODO: tune this
			restitution: 0,
		});

		this.#physicsBody = body;
	}
}
