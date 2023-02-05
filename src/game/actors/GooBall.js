import { Bodies, Common, Composite, Vector } from 'matter-js';

import Actor from '../engine/Actor';
import { CollisionCategories } from '../utilities/Collisions';
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
		const rollStrength = 5 * 1e-5;
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

		// Set visuals from physics
		const { position, velocity } = this.#physicsBody;
		this.#graphics.x = position.x;
		this.#graphics.y = position.y;
		this.#graphics.rotation = Math.atan2(velocity.y, velocity.x) + Math.PI / 2; // rotate to face goo direction

		// If going fast, squeeze along X and stretch along Y
		const stretchVelocity = 0.7; // threshold for stretchiness
		const stretchOrder = 0.5; // adds bias toward lower (<1) or higher (>1) velocities
		const stretch = Common.clamp(Vector.magnitude(velocity) ** stretchOrder / stretchVelocity, 0.95, 1.5);
		const squeeze = 1.0 / stretch;
		this.#graphics.scale = { x: squeeze, y: stretch };
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
			frictionAir: 0.005,
			restitution: this.#bounciness,
			collisionFilter: {
				group: 0,
				category: CollisionCategories.DYNAMIC,
				mask: CollisionCategories.PHYSICS | CollisionCategories.MOUSE, // collide with all physics and allow mouse control
			},
		});

		this.#physicsBody = body;
		Composite.add(world, body);
	}
}
