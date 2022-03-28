import { Vec2, World } from 'planck';

/**
 * A game physics simulator which provides access to a physics objects
 */
export default class GameSimulator {
	#world = null;

	get world() {
		return this.#world;
	}

	/**
	 * Construct a new world
	 * @param {planck.WorldDef} worldOptions options for
	 */
	constructor(worldOptions = {}) {
		const defaultOptions = {
			gravity: new Vec2(0, -10),
			allowSleep: true,
		};

		this.#world = new World({ ...defaultOptions, ...worldOptions });
	}

	/**
	 * Step world physics
	 * @param {Number} dt Delta time
	 */
	update(dt) {
		// Limit dt
		if (dt > 1 / 30) {
			dt = 1 / 30;
		}

		this.#world.step(dt);
		this.#world.clearForces();
	}
}
