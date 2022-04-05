import { Composite, Events, Mouse, MouseConstraint } from 'matter-js';
import { Container, Sprite } from 'pixi.js';

import Actor from '../engine/Actor';
import { CollisionCategories } from '../utilities/Collisions';
import { drawCircle } from '../utilities/Graphics';

export class UserMouse extends Actor {
	#baseCursor;
	#selectionCursor;

	#mouse;
	#physicsConstraint;
	#isPressed = false;
	#hasSelection = false;

	#graphics = new Container();
	#isAttached = false;

	/**
	 * Construct a mouse handler with options for regular/selection mouse textures
	 * @param {Object} configuration
	 */
	constructor({
		engine,
		baseCursor /*{ texture, size, trailTexture, trailLength }*/ = {},
		selectionCursor /*{ texture, size, rotationSpeed }*/ = {},
	}) {
		super();

		this.#baseCursor = baseCursor;
		this.#selectionCursor = selectionCursor;

		this.#initPhysics(engine);
		this.#initGraphics();
	}

	/**
	 * Check for collisions
	 * @param {Number} dt time since last frame, useful for scaling impulses
	 */
	update(dt) {
		// Check if colliding
		const { body: selection, constraint } = this.#physicsConstraint;
		if (selection) {
			// Neutralize torque and center constraint on pickup
			if (!this.#hasSelection) {
				selection.torque = 0;
				constraint.pointB = { x: 0, y: 0 };
			}

			this.#hasSelection = true;
		} else {
			this.#hasSelection = false;
		}
	}

	/**
	 * Draw the mouse
	 * @param {PIXI.Container} scene to adjust position transform
	 * @param {PIXI.Container} container to draw into, specified by the scene
	 */
	render(container) {
		if (!this.#isAttached) {
			container.addChild(this.#graphics);
			this.#isAttached = true;
		}

		// Move sprite to location
		const { position } = this.#mouse;
		this.#graphics.position = position;
	}

	/**
	 * Initialise mouse sprites with automated visibility control
	 * @private
	 */
	#initGraphics() {
		// Set up base sprite
		const baseSprite = drawCircle(10, { colour: 0xffffff }); // new Sprite(baseCursor.texture);
		baseSprite.width = this.#baseCursor.size || 3;
		baseSprite.height = this.#baseCursor.size || 3;
		this.#baseCursor.sprite = baseSprite;
		Object.defineProperty(baseSprite, 'visible', {
			get: () => !this.#hasSelection,
		});

		// Set up selection sprite
		const selectionSprite = drawCircle(10, { colour: 0x00ccff }); // new Sprite(selectionCursor.texture);
		selectionSprite.width = this.#selectionCursor.size || 3;
		selectionSprite.height = this.#selectionCursor.size || 3;
		this.#selectionCursor.sprite = selectionSprite;
		Object.defineProperty(selectionSprite, 'visible', {
			get: () => this.#hasSelection,
		});

		this.#graphics.addChild(baseSprite, selectionSprite);
	}

	/**
	 * Initialise physics body and attach to world
	 * @param {GameEngine} engine to attach the mouse controller to
	 * @private
	 */
	#initPhysics({ renderer, simulator }) {
		// Create the Mouse and offset to match renderer
		const { position, scale } = renderer.scene.transform;
		const mouse = Mouse.create(renderer.canvas);
		Mouse.setOffset(mouse, { x: -position.x / scale.x, y: -position.y / scale.y });
		Mouse.setScale(mouse, { x: 1 / scale.x, y: 1 / scale.y });
		this.#mouse = mouse;

		// Set up constraint with collision filtering and events
		const constraint = MouseConstraint.create(simulator.engine, {
			mouse: this.#mouse,
			constraint: {
				stiffness: 1,
			},
			collisionFilter: {
				group: 0,
				category: CollisionCategories.MOUSE,
				mask: CollisionCategories.ANY, // we'll collide with anyone who wants to collide with us! :D
			},
		});
		Events.on(constraint, 'mousedown', this.#onMouseDown.bind(this));
		Events.on(constraint, 'mouseup', this.#onMouseUp.bind(this));
		Composite.add(simulator.world, constraint);
		this.#physicsConstraint = constraint;
	}

	#onMouseDown() {
		this.#isPressed = true;
	}

	#onMouseUp() {
		this.#isPressed = false;
	}
}
