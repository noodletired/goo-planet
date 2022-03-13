import { Container, Renderer } from 'pixi.js';

/**
 * Handles game rendering.
 */
export default class GameRenderer {
	#scene = new Container();
	#context = null;
	#layers = [
		{ name: 'background', container: null },
		{ name: 'interactable', container: null },
		{ name: 'decoration', container: null },
	];

	get context() {
		return this.#context;
	}

	get scene() {
		return this.#scene;
	}

	/**
	 * Construct a new game renderer
	 * @param {PIXI.IRenderOptions} rendererOptions
	 */
	constructor(rendererOptions = {}) {
		const defaultOptions = {
			width: 800,
			height: 600,
			antialias: true,
		};

		this.#context = new Renderer({ ...defaultOptions, ...rendererOptions });
	}

	/**
	 * Attach a container to a named layer
	 * @param {String} layerName Name of the layer
	 * @param {Container} container Container to render
	 */
	setLayerContent(layerName, container) {
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
	getLayerContent(layerName) {
		const layer = this.#layers.find(({ name }) => layerName === name);
		if (!layer) {
			return null;
		}

		if (!layer.container) {
			this.SetLayer(layerName, new Container());
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
