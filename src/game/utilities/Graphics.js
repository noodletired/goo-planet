import { Graphics } from 'pixi.js';

/**
 * Utility to draw a circle
 * @param size in pixels to draw the circle
 * @param options x, y, colour to draw the circle
 */
export const drawCircle = (size, { x = 0, y = 0, colour = 0 } = {}) => {
	const graphics = new Graphics();
	graphics.beginFill(colour);
	graphics.drawCircle(x, y, size);
	graphics.endFill();
	return graphics;
};
