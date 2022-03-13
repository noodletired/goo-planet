import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';

/**
 * https://vitejs.dev/config/
 * @type { import('vite').UserConfig }
 */
export default defineConfig({
	plugins: [vue()],

	esbuild: {
		format: 'esm',
		// Other ESBuild options
	},

	resolve: {
		alias: [
			{
				find: '~',
				replacement: path.resolve(__dirname, 'src'),
			},
		],
	},

	css: {
		preprocessorOptions: {
			scss: {
				// SCSS configuration
				additionalData: `@use '~/styles/_globals.scss' as *;`,
			},
		},
	},
});
