import { BLEND_MODES, Sprite } from 'pixi.js';

import Actor from '../engine/Actor';

export class Wheel extends Actor {
	#size; // radius
	#speed; // revs/second
	#position;
	#texture;
	#opacity;
	#blendMode;

	#graphics;

	/**
	 * Create a new rotating object
	 * @param {Object} configuration
	 */
	constructor({
		texture,
		size = 20,
		speed = 1.0,
		position = { x: 0, y: 0 },
		opacity = 1.0,
		blendMode = BLEND_MODES.NORMAL,
	}) {
		super();

		this.#size = size;
		this.#speed = speed;
		this.#position = position;
		this.#texture = texture;
		this.#opacity = opacity;
		this.#blendMode = blendMode;
	}

	/**
	 * Draw the wheel
	 * @param {PIXI.Container} container to draw into, specified by the scene
	 */
	render(container) {
		if (!this.#graphics) {
			this.#graphics = new Sprite(this.#texture);
			this.#graphics.anchor.set(0.5);
			this.#graphics.width = this.#size;
			this.#graphics.height = this.#size;
			this.#graphics.position = this.#position;
			this.#graphics.alpha = this.#opacity;
			this.#graphics.blendMode = this.#blendMode;
			container.addChild(this.#graphics);
		}

		const time = this.lifetime / 1000;
		this.#graphics.rotation = 2 * Math.PI * this.#speed * time + this.uniqueOffset;
	}
}
