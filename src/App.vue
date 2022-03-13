<template>
	<div id="content" ref="content" />
</template>

<script>
import { Vec2 } from 'planck';
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';

import GameEngine from '~/game/engine';
import { Delay } from '~/game/utilities/Delay';

export default defineComponent({
	name: 'Application',

	setup() {
		console.log('Starting application');
		const content = ref(null); // template content
		const loadingProgress = ref(0);

		// TODO: Load from JSON
		const engine = new GameEngine({
			simulatorOptions: {
				gravity: Vec2.zero, // no gravity!
			},
			rendererOptions: {},
		});

		onMounted(async () => {
			engine.run();
			for (const progress of engine.loader.getProgress()) {
				this.loadingProgress = progress;
				await Delay(100);
			}

			content.value?.appendChild(engine.renderer.context.view);
		});

		onBeforeUnmount(() => {
			engine.destroy();
		});

		return { content, loadingProgress };
	},
});

// HMR force reload
if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		import.meta.hot?.invalidate();
	});
}
</script>

<style scoped lang="scss">
#content {
	$color-1: rgb(120, 106, 194);
	$color-2: rgb(113, 97, 195);
	height: 100%;
	width: 100%;
	background: linear-gradient($color-1, $color-2);

	::v-deep(canvas) {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		border: solid 1px hsl(0, 0%, 90%);
	}
}
</style>
