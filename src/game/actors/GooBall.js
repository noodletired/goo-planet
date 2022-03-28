import { Bodies, Composite } from 'matter-js';

import Actor from '../engine/Actor';
import { drawCircle } from '../utilities/Graphics';

export class GooBall extends Actor {
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
		super();

		this.#size = size;
		this.#density = density;
		this.#stickiness = stickiness;
		this.#bounciness = bounciness;

		this.#initPhysics(world, position, angle);
	}

	/**
	 * Add behaviours to the goo
	 * @param {Number} dt time since last frame, useful for scaling impulses
	 */
	update(dt) {
		// Apply torque to roll the goo around
		const lifetimeSeconds = this.lifetime / 1000;
		const rollStrength = 0.0001;
		const directionFrequency = 0.5;
		const directionPhase = this.uniqueOffset;
		this.#physicsBody.torque = Math.sin(lifetimeSeconds * directionFrequency + directionPhase) * rollStrength;
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
	 * Initialise physics body and attach to world
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
