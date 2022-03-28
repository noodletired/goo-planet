import { Vec2 } from 'planck';

import { GooBall } from '~/game/actors/GooBall';
import { Planet } from '~/game/actors/Planet';
import GameEngine from '~/game/engine';

/**
 * A fixed demo scene until I feel like writing a JSON scene description parser and scene editor
 */
export default class FixedDemoScene {
	planet = null;
	gooBalls = [];

	#planetRadius = 20;
	#gooCount = 100;

	/**
	 * Initialises the scene
	 * @note a reference to the engine's Simulator world is kept locally for cleanup
	 * @param {GameEngine} engine
	 */
	constructor(engine) {
		const { world } = engine.simulator;

		this.#createPlanet(world);
		this.#createGoo(world);
	}

	/**
	 * Render the scene, choosing render layers for actors
	 * @param {GameEngine} engine
	 */
	render({ renderer }) {
		this.gooBalls.forEach((actor) => actor.render(renderer.getLayer('interactable')));
		this.planet.render(renderer.getLayer('background'));
	}

	/**
	 * Cleans up all objects
	 */
	destroy() {
		this.gooBalls.forEach((actor) => actor.destroy());
		this.planet.destroy();
	}

	/**
	 * Creates the demo scene planet at the origin
	 */
	#createPlanet(world) {
		this.planet = new Planet({ world, size: this.#planetRadius });
	}

	/**
	 * Creates the demo scene goo at random locations
	 */
	#createGoo(world) {
		const getPosition = (offset) => {
			const angle = offset * Math.PI * 2;
			const distance = (Math.random() + 1.5) * this.#planetRadius;
			return new Vec2(Math.cos(angle), Math.sin(angle)).mul(distance);
		};

		this.gooBalls = new Array(this.#gooCount).fill().map(
			(x, i) =>
				new GooBall({
					world,
					position: getPosition(i / this.#gooCount),
				})
		);
	}
}
