import { Circle, Vec2 } from 'planck';

export class GooBall {
	#size; // determines radius of goo
	#density; // determines how powerful the goo is
	#stickiness; // 0-1 friction
	#bounciness; // 0-1 restitution

	#world;
	#physicsBody;

	/**
	 * Create a new goo!
	 * @param {Object} configuration
	 */
	constructor({
		world,
		size = 1,
		density = 1,
		position = Vec2.zero,
		angle = Math.random * Math.PI,
		stickiness = 0.1,
		bounciness = 0.5,
	}) {
		this.#world = world;
		this.#size = size;
		this.#density = density;
		this.#stickiness = stickiness;
		this.#bounciness = bounciness;

		this.#initPhysics(position, angle);
	}

	/**
	 * Clean up the goo and its physics body
	 */
	destroy() {
		this.#world.destroyBody(this.#physicsBody);
	}

	/**
	 * Draw the goo
	 */
	render() {
		// TODO! Attach Pixi sprite
	}

	/**
	 * Initialise planck physics body and attach to world
	 * @private
	 */
	#initPhysics(position, angle) {
		// Create the body
		const body = world.createBody({
			type: 'dynamic',
			position,
			angle,
			linearDamping: 0,
			angularDamping: 0.01,
			allowSleep: false, // no sleep! busy goo
			awake: true, // caffeine baby
			active: true,
			userData: this, // it's like looking in a mirror
		});

		// Make it a circle
		body.createFixture({
			shape: Circle(this.#size),
			density: this.#density,
			friction: this.#stickiness,
			restitution: this.#bounciness,
		});

		this.#physicsBody = body;
	}
}