import { Ticker } from 'pixi.js';

const SYSTEM_TICKER_ID = 'system';
const MAX_UPDATE_FREQUENCY = 30; // ticks per second

/**
 * Provides a shared interface to register for timed game updates
 */
export default class GameClock {
	#defaultMaxFPS = 0;
	#tickers = new Map();

	/**
	 * Construct a clock with a throttled system ticker
	 */
	constructor(defaultMaxFPS = 30) {
		this.addTicker(SYSTEM_TICKER_ID);

		this.#defaultMaxFPS = defaultMaxFPS;
	}

	/**
	 * Add a new ticker to the clock
	 * @param {String} tickerID Unique identifier of the ticker
	 * @param {Object} options Additonal configuration options
	 * @note Will fail if tickerID is taken
	 */
	addTicker(tickerID, { autoStart = true, maxFrequency = this.#defaultMaxFPS } = {}) {
		if (this.#tickers.has(tickerID)) {
			console.warn('Cannot overwrite existing ticker!');
			return;
		}

		const ticker = new Ticker();
		ticker.autoStart = autoStart;
		ticker.maxFPS = maxFrequency;
		this.#tickers.set(tickerID, ticker);
	}

	/**
	 * Destroy a named ticker
	 * @note Will fail if trying to destroy system ticker
	 */
	destroyTicker(tickerID) {
		if (tickerID === SYSTEM_TICKER_ID) {
			console.warn('Cannot destroy system ticker!');
			return;
		}

		const ticker = this.#tickers.get(tickerID);
		ticker?.destroy();
		this.#tickers.delete(tickerID);
	}

	/**
	 * Get a promise generator for ticker updates
	 * @yields {Promise|null}
	 */
	*getUpdates(tickerID = SYSTEM_TICKER_ID) {
		const ticker = this.#tickers.get(tickerID);
		if (!ticker) {
			return null;
		}

		while (true) {
			yield new Promise((resolve) => ticker.addOnce((dt) => resolve(dt)));
		}
	}

	/**
	 * Destroy all tickers on the clock
	 * @note The clock should not be used again after calling this
	 */
	destroy() {
		this.#tickers.forEach((ticker) => ticker.destroy());
		this.#tickers.clear();
	}
}
