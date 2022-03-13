/**
 * Get a promise for a given time delay (ms)
 * @returns {Promise<void>} an awaitable promise
 */
export const Delay = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
