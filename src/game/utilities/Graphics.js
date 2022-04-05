import { Graphics } from 'pixi.js';

/**
 * Utility to draw a circle
 * @param {Number} size in pixels to draw the circle
 * @param {Object} options x, y, colour to draw the circle
 */
export const drawCircle = (size, { graphics, x = 0, y = 0, colour = 0, alpha = 1 } = {}) => {
	graphics ??= new Graphics();
	graphics.beginFill(colour, alpha);
	graphics.drawCircle(x, y, size);
	graphics.endFill();
	return graphics;
};

/**
 * Utility to draw a polygon
 * @param {Array} points in vertex pairs, expected to be in convex hull order
 * @param {Object} options colour to draw in
 */
export const drawPolygon = (points, { graphics, colour = 0, alpha = 1 } = {}) => {
	graphics ??= new Graphics();
	graphics.beginFill(colour, alpha);
	graphics.drawPolygon(...points);
	graphics.endFill();
	return graphics;
};