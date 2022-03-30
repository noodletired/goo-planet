/**
 * Helper to resolve asset URLs
 * @note assets are resolved relative to this module, so we backtrack up to src
 */
export const asset = (filename) => new URL(`../../assets/${filename}`, import.meta.url).href;
