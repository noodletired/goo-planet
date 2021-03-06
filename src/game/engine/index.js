import { settings } from 'pixi.js';

import { Delay } from '../utilities/Delay';

import Clock from './Clock';
import Loader from './Loader';
import Simulator from './Simulator';
import Renderer from './Renderer';

// Global PIXI settings
settings.TARGET_FPMS = 30 / 1000;
settings.STRICT_TEXTURE_CACHE = true; // force preloading

/**
 * Game engine composed from various components
 */
export default class GameEngine {
	clock = new Clock();
	loader = new Loader();
	simulator = null;
	renderer = null;

	#isStopped = true;

	/**
	 * Create a new GameEngine with static options
	 * @param options Options for subcomponents
	 */
	constructor({ simulatorOptions, rendererOptions } = {}) {
		this.simulator = new Simulator(simulatorOptions);
		this.renderer = new Renderer(rendererOptions);
	}

	/**
	 * Starts the game loop, auto-updating components with clock
	 * @param {Object} scene optional scene to render
	 */
	async run(scene) {
		this.#isStopped = false;

		// Load resources
		if (!this.loader.hasLoadFired) {
			console.debug('Preloading resources');
			await this.#preloadResources();
			console.debug('Resources loaded');
		}

		// Game loop
		console.debug('Starting game loop');
		for await (const dt of this.clock.getUpdates()) {
			if (this.#isStopped) {
				console.debug('Stopped game loop');
				break;
			}

			scene?.update(dt, this);
			this.simulator.update(dt); // Maybe needs a fixed FPS
			scene?.render(this);
			this.renderer.render();
		}
	}

	/**
	 * Stop running
	 */
	stop() {
		this.#isStopped = true;
	}

	/**
	 * Clean up all components
	 */
	destroy() {
		this.stop();
		this.clock.destroy();
		this.loader.destroy();
		this.simulator.destroy();
		this.renderer.destroy();
	}

	/**
	 * Preload resources via loader
	 */
	async #preloadResources() {
		this.loader.load();
		for (const progress of this.loader.getProgress()) {
			console.debug(`Loading progress: `, progress);
			await Delay(100);
		}
	}
}
