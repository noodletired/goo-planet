/**
 * Collision categories for Matter collisionFilter and
 */
export const CollisionCategories = {
	NONE: 0b0,
	ANY: 0xffffffff,

	MOUSE: 0b1, // special mouse category

	RIGID: 0b10, // immovable bodies
	DYNAMIC: 0b100, // full physics bodies
	PHYSICS: 0b110, // all physics
};
