import { Vector } from 'matter-js';
import { BLEND_MODES } from 'pixi.js';

import { Decoration } from '~/game/actors/Decoration';
import { GooBall } from '~/game/actors/GooBall';
import { Planet } from '~/game/actors/Planet';
import { PlanetWater } from '~/game/actors/PlanetWater';
import { UserMouse } from '~/game/actors/UserMouse';
import { Wheel } from '~/game/actors/Wheel';
import { asset } from '~/game/utilities/Assets';

/**
 * A fixed demo scene until I feel like writing a JSON scene description parser and scene editor
 */
export default class FixedDemoScene {
	userMouse = null;
	planet = null;
	planetWater = null;
	gooBalls = [];
	backgroundDecorations = [];
	foregroundDecorations = [];

	#planetRadius = 20;
	#gooCount = 100;

	/**
	 * Initialises the scene
	 * @note a reference to the engine's Simulator world is kept locally for cleanup
	 * @param {GameEngine} engine
	 */
	constructor(engine) {
		const { world } = engine.simulator;

		this.#createUserMouse(engine);
		this.#createPlanet(world);
		this.#createGoo(world);
		this.#createDecorations(engine.loader);
	}

	/**
	 * Update the objects within the scene
	 * @param {Number} dt time in seconds since last update
	 * @param {GameEngine} engine
	 */
	update(dt, engine) {
		this.gooBalls.forEach((actor) => actor.update(dt, engine));
		this.planetWater.update(dt);
		this.userMouse.update(dt);
	}

	/**
	 * Render the scene, choosing render layers for actors
	 * @param {GameEngine} engine
	 */
	render({ renderer }) {
		this.gooBalls.forEach((actor) => actor.render(renderer.getLayer('interactable')));
		this.planet.render(renderer.getLayer('interactable'));
		this.planetWater.render(renderer.getLayer('interactable'));
		this.backgroundDecorations.forEach((actor) => actor.render(renderer.getLayer('background')));
		this.foregroundDecorations.forEach((actor) => actor.render(renderer.getLayer('decoration')));
		this.userMouse.render(renderer.getLayer('decoration'));
	}

	/**
	 * Creates the mouse controller
	 */
	#createUserMouse(engine) {
		this.userMouse = new UserMouse({ engine });
	}

	/**
	 * Creates the demo scene planet at the origin
	 */
	#createPlanet(world) {
		this.planet = new Planet({ world, size: this.#planetRadius });
		this.planetWater = new PlanetWater({ world, radialOffset: this.#planetRadius, height: this.#planetRadius * 0.3 });
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

	/**
	 * Create the demo scene decorations
	 * @note awaiting this before the Loader.load is fired can deadlock
	 */
	async #createDecorations(loader) {
		// Enqueue all resources first
		const burstTexture = loader.enqueue('burst', asset('burst.png'));
		const cloudsTexture = loader.enqueue('clouds', asset('clouds.png'));
		const mistTexture = loader.enqueue('mist', asset('mist.png'));
		const gearTexture = loader.enqueue('gear', asset('gear.png'));
		const wheelTexture = loader.enqueue('wheel', asset('wheel.png'));
		const windmillTexture = loader.enqueue('windmill', asset('windmill.png'));
		const islandTextures = [0, 1, 2, 3, 4].map((n) => loader.enqueue(`island${n}`, asset(`island${n}.png`)));

		// Swirls
		const burst = new Wheel({
			texture: await burstTexture,
			size: 200,
			speed: 0.05,
			blendMode: BLEND_MODES.ADD,
		});
		const mist = new Wheel({
			texture: await mistTexture,
			size: this.#planetRadius * 4,
			speed: 0.4,
			opacity: 0.5,
			blendMode: BLEND_MODES.ADD,
		});
		const cloudsSlow = new Wheel({
			texture: await cloudsTexture,
			size: this.#planetRadius * 3.2,
			speed: 0.22,
			opacity: 0.6,
			blendMode: BLEND_MODES.ADD,
		});
		const cloudsFast = new Wheel({
			texture: await cloudsTexture,
			size: this.#planetRadius * 3.8,
			speed: 0.35,
			opacity: 0.25,
			blendMode: BLEND_MODES.ADD,
		});

		// Helper to orient islands to their position
		const orientToPosition = ({ x, y }) => Math.atan2(y, x) + Math.PI / 2;

		// Tower island
		const towerIslandPosition = Vector.mult(Vector.normalise({ x: -0.2, y: -1 }), this.#planetRadius);
		const towerIsland = new Decoration({
			texture: await islandTextures[0],
			size: { height: this.#planetRadius * 1.5 },
			anchor: { x: 0.5, y: 0.85 },
			position: towerIslandPosition,
			rotation: orientToPosition(towerIslandPosition),
		});
		const towerGearLarge = new Wheel({
			texture: await gearTexture,
			size: 20,
			speed: 1,
			position: Vector.add(towerIslandPosition, { x: this.#planetRadius * -0.2, y: this.#planetRadius * 0.15 }),
		});
		const towerGearSmall = new Wheel({
			texture: await gearTexture,
			size: 10,
			speed: -1.8,
			position: Vector.add(towerIslandPosition, { x: this.#planetRadius * 0.16, y: this.#planetRadius * -0.35 }),
		});

		// Windmill island
		const windmillIslandPosition = Vector.mult(Vector.normalise({ x: -0.9, y: 0.5 }), this.#planetRadius);
		const windmillIsland = new Decoration({
			texture: await islandTextures[2],
			size: { height: this.#planetRadius * 1.5 },
			anchor: { x: 0.5, y: 0.75 },
			position: windmillIslandPosition,
			rotation: orientToPosition(windmillIslandPosition),
		});
		const windmillLarge = new Wheel({
			texture: await windmillTexture,
			size: 14,
			speed: 0.3,
			position: Vector.add(windmillIslandPosition, { x: this.#planetRadius * -0.57, y: this.#planetRadius * 0.46 }),
		});
		const windmillSmall = new Wheel({
			texture: await windmillTexture,
			size: 8,
			speed: 0.3,
			position: Vector.add(windmillIslandPosition, { x: this.#planetRadius * -0.45, y: this.#planetRadius * -0.06 }),
		});

		// Hill island
		const hillIslandPosition = Vector.mult(Vector.normalise({ x: 0.7, y: -0.5 }), this.#planetRadius);
		const hillIsland = new Decoration({
			texture: await islandTextures[1],
			size: { height: this.#planetRadius * 0.9 },
			anchor: { x: 0.5, y: 0.5 },
			position: hillIslandPosition,
			rotation: orientToPosition(hillIslandPosition),
		});
		const hillWheel = new Wheel({
			texture: await wheelTexture,
			size: 13,
			speed: -2.5,
			position: Vector.add(hillIslandPosition, { x: this.#planetRadius * 0.15, y: this.#planetRadius * 0.5 }),
		});
		const hillGear = new Wheel({
			texture: await gearTexture,
			size: 25,
			speed: 0.5,
			position: Vector.add(hillIslandPosition, { x: this.#planetRadius * 0.05, y: this.#planetRadius * 1.0 }),
		});

		// Rocky island
		const rockyIslandPosition = Vector.mult(Vector.normalise({ x: 1.2, y: 1.5 }), this.#planetRadius);
		const rockyIsland = new Decoration({
			texture: await islandTextures[3],
			size: { height: this.#planetRadius * 1.7 },
			anchor: { x: 0.5, y: 0.65 },
			position: rockyIslandPosition,
			rotation: orientToPosition(rockyIslandPosition),
		});
		const rockyWheel = new Wheel({
			texture: await wheelTexture,
			size: 20,
			speed: -0.9,
			position: Vector.add(rockyIslandPosition, { x: this.#planetRadius * -0.5, y: this.#planetRadius * 0.17 }),
		});

		// Tall island
		const tallIslandPosition = Vector.mult(Vector.normalise({ x: -1.2, y: -0.5 }), this.#planetRadius);
		const tallIsland = new Decoration({
			texture: await islandTextures[4],
			size: { height: this.#planetRadius * 1.8 },
			anchor: { x: 0.5, y: 0.68 },
			position: tallIslandPosition,
			rotation: orientToPosition(tallIslandPosition),
		});

		// Attach to scene
		this.backgroundDecorations = [burst, mist, cloudsSlow, cloudsFast];
		this.foregroundDecorations = [
			towerIsland,
			towerGearLarge,
			towerGearSmall,
			windmillIsland,
			windmillLarge,
			windmillSmall,
			hillIsland,
			hillWheel,
			hillGear,
			rockyIsland,
			rockyWheel,
			tallIsland,
		];
	}
}
