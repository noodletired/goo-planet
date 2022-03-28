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
	 * Update the objects within the scene
	 * @param {Number} dt time in seconds since last update
	 * @param {GameEngine} engine
	 */
	update(dt, engine) {
		this.gooBalls.forEach((actor) => actor.update(dt, engine));
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
			return {
				x: Math.cos(angle) * distance,
				y: Math.sin(angle) * distance,
			};
		};

		this.gooBalls = new Array(this.#gooCount).fill().map(
			(x, i) =>
				new GooBall({
					world,
					position: getPosition(i / this.#gooCount),
					size: Math.random() * 0.4 + 0.8,
				})
		);
	}
}
