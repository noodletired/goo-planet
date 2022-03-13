import { Loader, Texture, utils } from 'pixi.js';

/**
 * Loads game resources and track progress
 */
export default class GameLoader {
	#totalResources = 0;
	#currentlyLoadedResources = 0;
	#hasLoadFired = false;
	#loader = new Loader();

	get hasLoadFired() {
		return this.#hasLoadFired;
	}

	/**
	 * Enqueue a texture resource to be loaded
	 * @returns {Promise<Texture>} a promise for the loaded resource
	 */
	enqueue(name, resource) {
		if (this.#hasLoadFired) {
			console.warn('Cannot enqueue resources after loading!');
			return Promise.resolve(utils.TextureCache[name] ?? Texture.WHITE);
		}

		this.#totalResources++;
		return new Promise((resolve) => this.#loader.add(name, resource, (data) => resolve(data.texture ?? Texture.WHITE)));
	}

	/**
	 * Loads all resources and updates progress
	 * @note Currently can only be called once!
	 * @returns {Promise<void>} a promise which resolves post-load
	 */
	load() {
		if (this.#hasLoadFired) {
			console.warn('Cannot load resources more than once!');
			return Promise.resolve();
		}

		this.#hasLoadFired = true;

		this.#loader.onProgress.add(this.#onResourceLoaded, this);
		return new Promise((resolve) => this.#loader.load(resolve));
	}

	/**
	 * Destroys the loader safely
	 */
	destroy() {
		this.#loader.destroy();
		this.#loader = null;
	}

	/**
	 * Get a generator which tracks current progress
	 * @yields progress ratio from 0 to 1
	 */
	*getProgress() {
		while (this.#currentlyLoadedResources !== this.#totalResources) {
			const progress = this.#currentlyLoadedResources / this.#totalResources;
			yield progress;
		}
		return 1;
	}

	/**
	 * Updates currently loaded resource count
	 * @private
	 */
	#onResourceLoaded(loader, resource) {
		console.debug('Loaded resource:', resource.name);
		this.#currentlyLoadedResources++;
	}
}
