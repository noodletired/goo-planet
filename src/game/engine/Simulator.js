import Matter, { Engine } from 'matter-js';
import MatterAttractors from 'matter-attractors';

// Matter plugins
Matter.use(MatterAttractors);

/**
 * A game physics simulator which provides access to a physics objects
 */
export default class GameSimulator {
	#engine = null;

	get engine() {
		return this.#engine;
	}

	get world() {
		return this.#engine.world;
	}

	/**
	 * Construct a new simulation engine
	 * @param {Matter.IEngineDefinition} engineOptions
	 */
	constructor(engineOptions = {}) {
		const defaultOptions = {
			gravity: { x: 0, y: -0.001 },
			enableSleeping: true,
		};

		this.#engine = Engine.create({ ...defaultOptions, ...engineOptions });
	}

	/**
	 * Cleans up the engine
	 */
	destroy() {
		Engine.clear(this.#engine);
	}

	/**
	 * Step world physics
	 * @param {Number} dt Delta time in seconds
	 */
	update(dt) {
		// Limit dt
		if (dt > 1 / 30) {
			dt = 1 / 30;
		}

		const dtMs = dt * 1000;
		const correction = (this.lastDtMs && dtMs / this.lastDtMs) || 1;
		Engine.update(this.#engine, dtMs, correction);
		this.lastDtMs = dtMs;
	}
}
