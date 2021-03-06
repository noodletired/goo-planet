import { Container, Renderer } from 'pixi.js';

/**
 * Handles game rendering.
 */
export default class GameRenderer {
	#scene = new Container();
	#context = null; // PIXI.Renderer
	#layers = [
		{ name: 'background', container: null },
		{ name: 'interactable', container: null },
		{ name: 'decoration', container: null },
	];

	get canvas() {
		return this.#context.view;
	}

	get context() {
		return this.#context;
	}

	get scene() {
		return this.#scene;
	}

	/**
	 * Construct a new game renderer
	 * @param {PIXI.IRenderOptions} rendererOptions Options passed to Pixi Renderer
	 * @param pixelScale Scale used for rendering (meters to pixels)
	 */
	constructor(rendererOptions = {}, pixelScale = 5) {
		const defaultOptions = {
			width: 800,
			height: 600,
			antialias: true,
			backgroundAlpha: 0,
		};
		const combinedOptions = { ...defaultOptions, ...rendererOptions };

		// Create the render context
		this.#context = new Renderer(combinedOptions);

		// Shift scene to center of view
		this.#scene.setTransform(combinedOptions.width / 2, combinedOptions.height / 2, pixelScale, pixelScale);
	}

	/**
	 * Attach a container to a named layer
	 * @param {String} layerName Name of the layer
	 * @param {Container} container Container to render
	 */
	setLayer(layerName, container) {
		const layer = this.#layers.find(({ name }) => layerName === name);
		if (!layer) {
			throw new ReferenceError(`Could not set unknown layer container: ${layerName}`);
		}

		// Remove previous layer from scene
		if (layer.container) {
			const sceneIndex = this.#scene.children.indexOf(layer.container);
			this.#scene.removeChildAt(sceneIndex);
			layer.container.destroy();
		}

		layer.container = container;

		const sceneIndex = this.#layers.filter(({ container }) => !!container).indexOf(layer);
		this.#scene.addChildAt(container, sceneIndex);
	}

	/**
	 * Retrieve a container for a named layer
	 * @note An empty container is created if one hasn't yet been attached
	 * @param {String} layerName Name of the layer
	 * @returns {Container|null} The named container, or null if the requested layer does not exist
	 */
	getLayer(layerName) {
		const layer = this.#layers.find(({ name }) => layerName === name);
		if (!layer) {
			return null;
		}

		if (!layer.container) {
			this.setLayer(layerName, new Container());
		}

		return layer.container;
	}

	/**
	 * Render the complete scene
	 */
	render() {
		this.#context.render(this.#scene);
	}

	/**
	 * Destroy the renderer safely
	 */
	destroy() {
		try {
			this.#scene.destroy();
			this.#context.destroy();
		} catch (error) {
			console.error('Failed to completely destroy GameRenderer:', error);
		}
	}
}
