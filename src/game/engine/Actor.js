import { nanoid } from 'nanoid';

const ACTOR_UUID_LENGTH = 20;

/**
 * Base class for all actors
 * Ensures the existence of critical methods
 */
export default class Actor {
	#identifier = nanoid(ACTOR_UUID_LENGTH);
	get identifier() {
		return this.#identifier;
	}
	get uniqueOffset() {
		// Generate a polynomial rolling hash
		const p = 11;
		const m = 1e8 + 32;
		const input = [...this.#identifier];
		const hash = input.reduce((acc, ch, i) => acc + (ch.charCodeAt() + 1) * (p ** i % m), 0); // sum charcodes

		delete this.uniqueOffset;
		Object.defineProperty(this, 'uniqueOffset', { value: hash, writable: false }); // memoize
		return hash;
	}

	#createdAt = Date.now();
	get createdAt() {
		return this.#createdAt;
	}
	get lifetime() {
		return Date.now() - this.createdAt; // milliseconds
	}

	constructor() {
		// Do nothing
	}

	update() {
		// Do nothing
	}

	render() {
		// Do nothing
	}
}
