import { BLEND_MODES, Sprite } from 'pixi.js';

import Actor from '../engine/Actor';

export class Decoration extends Actor {
	#isAttached;
	#graphics;

	/**
	 * Create a new decorative object
	 * @param {Object} configuration
	 */
	constructor({
		texture,
		anchor = { x: 0, y: 0 },
		position = { x: 0, y: 0 },
		size,
		scale,
		angle, // degree
		rotation, // radian
		opacity = 1.0,
		blendMode = BLEND_MODES.NORMAL,
	}) {
		super();

		this.#isAttached = false;

		const sprite = new Sprite(texture);
		sprite.anchor = anchor;
		sprite.position = position;

		if (size && ((size.width && !size.height) || (size.height && !size.width))) {
			// only one size given
			const width = size.width || (sprite.width / sprite.height) * size.height;
			const height = size.height || (sprite.height / sprite.width) * size.width;
			sprite.width = width;
			sprite.height = height;
		} else {
			sprite.width = (size && (typeof size === 'number' ? size : size.width)) || sprite.width;
			sprite.height = (size && (typeof size === 'number' ? size : size.height)) || sprite.height;
		}
		sprite.scale = (scale && (typeof scale === 'number' ? { x: scale, y: scale } : scale)) || sprite.scale;
		sprite.angle = angle || sprite.angle;
		sprite.rotation = rotation || sprite.rotation;
		sprite.alpha = opacity;
		sprite.blendMode = blendMode;

		this.#graphics = sprite;
	}

	/**
	 * Draw the decoration
	 * @param {PIXI.Container} container to draw into, specified by the scene
	 */
	render(container) {
		if (!this.#isAttached) {
			this.#isAttached = true;
			container.addChild(this.#graphics);
		}
	}
}
