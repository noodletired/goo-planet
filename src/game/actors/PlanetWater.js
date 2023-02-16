import { Bodies, Collision, Composite, Vector, Vertices, Events, Engine } from 'matter-js';

import Actor from '../engine/Actor';
import { CollisionCategories } from '../utilities/Collisions';
import { drawPolygon } from '../utilities/Graphics';

export class PlanetWater extends Actor {
	#startAngle; // degrees
	#endAngle; // degrees
	#center;
	#radialOffset;
	#height;
	#waveHeight;
	#damping;

	#physicsBody;
	#graphics;
	#innerVertices;
	#waveHeights;
	#waveVelocities;

	#backgroundWaveVelocity;
	#backgroundWaveOffsets;
	#backgroundWaveAmplitudes;
	#backgroundWaveStretches;
	#backgroundWaveOffsetStretches;

	/**
	 * Create a new planetary water
	 * @param {Object} configuration
	 */
	constructor({
		engine,
		world,
		startAngle = 0,
		endAngle = 360,
		center = { x: 0, y: 0 },
		radialOffset = 0,
		height = 10,
		waveHeight = height * 0.5,
		damping = 0.95,
	}) {
		super();

		this.#startAngle = startAngle;
		this.#endAngle = endAngle;
		this.#center = center;
		this.#radialOffset = radialOffset;
		this.#height = height;
		this.#waveHeight = waveHeight;
		this.#damping = damping;

		const waveBase = new Array(5).fill(0);
		const backgroundCompression = 0.9; // affects frequencies
		this.#backgroundWaveVelocity = 30; // affects apparent scroll velocity (phase shift)
		this.#backgroundWaveOffsets = waveBase.map(() => (Math.random() - 0.5) * waveHeight * 0.5);
		this.#backgroundWaveAmplitudes = waveBase.map(() => (Math.random() * 0.4 + 0.1) * waveHeight * 0.5);
		this.#backgroundWaveOffsetStretches = waveBase.map(() => Math.random() * backgroundCompression);
		this.#backgroundWaveStretches = waveBase.map(() => Math.random() * backgroundCompression);

		this.#initPhysics(engine, world);
	}

	/**
	 * Helper to overlay background waves
	 * @param {Number} offset positional offset for wave
	 */
	#computeBackgroundWaveHeight(offset) {
		let result = 0;
		const phase = (this.lifetime / 1000) * this.#backgroundWaveVelocity;
		for (let i = 0; i < this.#backgroundWaveAmplitudes.length; i++) {
			result +=
				this.#backgroundWaveOffsets[i] +
				this.#backgroundWaveAmplitudes[i] *
					Math.sin(offset * this.#backgroundWaveStretches[i] + phase * this.#backgroundWaveOffsetStretches[i]);
		}
		return result;
	}

	/**
	 * Control behaviours on the water
	 * @param {Number} dt time since last frame, useful for scaling impulses
	 *
	 * @see https://gamedev.stackexchange.com/questions/44547/how-do-i-create-2d-water-with-dynamic-waves
	 * @see http://goofans.com/forum/and-then/2d-boy-framework/4116
	 */
	update(dt) {
		// TODO: splashes

		const velocities = this.#waveVelocities;
		const heights = this.#waveHeights;

		// Compute heights
		const springConstant = 0.005;
		for (let i = 1; i < heights.length - 1; i++) {
			const height = heights[i];
			const forceLeft = (heights[i - 1] - height) * springConstant;
			const forceRight = (heights[i + 1] - height) * springConstant;
			let forceBaseline = (this.#height - height) * springConstant;

			// Increase force if outside desired height range
			const baselineDelta = Math.abs(this.#height - height);
			if (baselineDelta > this.#waveHeight) {
				forceBaseline *= (1 + baselineDelta / this.#waveHeight) ** 0.5;
			}

			const acceleration = forceLeft + forceRight + forceBaseline; // mass is constant
			velocities[i] *= this.#damping;
			velocities[i] += acceleration;
			heights[i] += velocities[i];
		}
	}

	/**
	 * Draw the planet
	 * @param {PIXI.Container} container to draw into, specified by the scene
	 */
	render(container) {
		// Compute vertices from wave heights
		const outerVertices = [...this.#innerVertices]
			.reverse() // reverse to get convex/clockwise order
			.map((vertex, i) =>
				Vector.mult(
					Vector.normalise(vertex),
					this.#radialOffset + this.#waveHeights[i] + this.#computeBackgroundWaveHeight(i)
				)
			);
		const vertices = [...outerVertices, ...this.#innerVertices];

		if (!this.#graphics) {
			// Create and attach graphics first time
			const graphics = drawPolygon(vertices, {
				colour: 0x000000,
				alpha: 0.65,
			});

			this.#graphics = graphics;
			container.addChild(this.#graphics);
		} else {
			// Update the graphics
			const [data] = this.#graphics.geometry.graphicsData;
			data.points = vertices.flatMap(({ x, y }) => [x, y]);
			data.shape.points = data.points;
			this.#graphics.geometry.invalidate();
		}
	}

	/**
	 * Initialise physics body and attach to world
	 * @param {Engine} engine game engine for attaching collision events to
	 * @param {Composite} world a Composite world/scene object to attach to
	 * @private
	 */
	#initPhysics(engine, world) {
		// Generate a sliced torus
		const innerVertices = [];
		const outerVertices = [];
		const degToRad = Math.PI / 180;
		const angleBetween = this.#endAngle - this.#startAngle;
		const arcLength = (this.#radialOffset + this.#height) * angleBetween * degToRad; // angle * radius
		const minStepLength = 1; // metres
		const steps = Math.floor(arcLength / minStepLength);
		for (let i = 0; i <= steps; i++) {
			const angle = (i / steps) * angleBetween + this.#startAngle;

			// clockwise arrangement starting with outer closest to 0
			// 0 degrees starts at 12-o'clock
			const vector = { x: Math.sin(angle * degToRad), y: -Math.cos(angle * degToRad) };
			innerVertices.unshift(Vector.mult(vector, this.#radialOffset));
			outerVertices.push(Vector.mult(vector, this.#radialOffset + this.#height));
		}

		this.#innerVertices = innerVertices;
		this.#waveHeights = innerVertices.map((x, i) => this.#height);
		this.#waveVelocities = innerVertices.map((x) => 0);

		// Create the body
		const { x, y } = this.#center;
		const vertices = [this.#center, ...outerVertices];
		const centroid = Vertices.centre(vertices);
		const body = Bodies.fromVertices(
			x + centroid.x,
			y + centroid.y,
			vertices,
			{
				isStatic: true,
				isSensor: true,
				plugin: {
					attractors: [
						(bodyA, bodyB) => {
							// Only apply forces to collidable bodies
							if (!Collision.collides(bodyA, bodyB)) {
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
			},
			true
		);

		const CollisionHandler = ({ pairs }) => {
			pairs.forEach(({ bodyA, bodyB }) => {
				const collider = bodyA === body ? bodyB : bodyB === body ? bodyA : null;
				if (collider) {
					const displacement = {
						x: collider.position.x - this.#center.x,
						y: collider.position.y - this.#center.y,
					};

					// determine wave index of impact
					const angle = 90 + Math.atan2(displacement.y, displacement.x) / degToRad;
					const step = Math.max(0, Math.min(1, (angle - this.#startAngle) / angleBetween));
					const index = Math.round(step * steps);

					// determine impact power
					const power = Vector.dot(Vector.normalise(displacement), collider.velocity) * collider.mass;

					// apply impact to wave
					this.#waveVelocities[index] = power * this.#waveHeight;
				}
			});
		};

		Events.on(engine, 'collisionStart', CollisionHandler.bind(this));
		Events.on(engine, 'collisionEnd', CollisionHandler.bind(this));

		this.#physicsBody = body;
		Composite.add(world, body);
	}
}
