module.exports = {
	env: {
		browser: true,
		amd: true,
		node: true,
		es2021: true,
	},

	extends: ['plugin:vue/vue3-recommended', 'prettier'],

	rules: {},

	ignorePatterns: ['*.vert.js', '*.frag.js'],
};
