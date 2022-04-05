<template>
	<div id="content" ref="content">
		<div id="fader" :class="{ hide: !isLoading }">
			<div id="loader" :style="{ '--percent': `${loadingProgress * 100}%` }" :class="{ squish: !isLoading }" />
		</div>
	</div>
</template>

<script>
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';

import FixedDemoScene from '~/assets/FixedDemoScene';
import GameEngine from '~/game/engine';
import { Delay } from '~/game/utilities/Delay';

export default defineComponent({
	name: 'Application',

	setup() {
		console.log('Starting application');
		const content = ref(null); // template content
		const loadingProgress = ref(0);
		const isLoading = ref(true);

		const engine = new GameEngine({
			simulatorOptions: {
				gravity: { x: 0, y: 0 }, // no gravity!
			},
			rendererOptions: {},
		});

		// TODO: Load scene from JSON
		const scene = new FixedDemoScene(engine);

		onMounted(async () => {
			engine.run(scene);
			for (const progress of engine.loader.getProgress()) {
				loadingProgress.value = progress;
				await Delay(100);
			}

			await Delay(2000); // let the goo settle
			isLoading.value = false;
			content.value?.appendChild(engine.renderer.context.view);
		});

		onBeforeUnmount(() => {
			engine.destroy();
		});

		return { content, isLoading, loadingProgress };
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

	#fader {
		position: absolute;
		z-index: 1;
		width: 100%;
		height: 100%;
		background: linear-gradient($color-1, $color-2);
		opacity: 1;
		transition: opacity 1s ease;

		&.hide {
			opacity: 0;
			pointer-events: none;
		}
	}

	#loader {
		$progress: var(--percent);
		$height: 2rem;
		$border-radius: $height * 0.2;
		$background-size: $height * 2;

		position: absolute;
		z-index: 2;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 50%;
		max-width: 15rem;
		height: $height;
		border: solid 2px white;
		border-radius: $border-radius;
		overflow: hidden;

		&.squish {
			height: 0%;
			width: 0%;
			transition: height 0.25s ease, width 0.25s ease 0.1s;
		}

		&::before {
			@keyframes shift-background {
				0% {
					background-position: 0 0;
				}
				100% {
					background-position: $background-size 0;
				}
			}

			content: '';
			display: block;
			width: $progress;
			height: 100%;
			background: rgb(210, 210, 255);
			background-image: repeating-linear-gradient(
				-45deg,
				rgba(255, 255, 255, 0.2) 25%,
				transparent 25%,
				transparent 50%,
				rgba(255, 255, 255, 0.2) 50%,
				rgba(255, 255, 255, 0.2) 75%,
				transparent 75%,
				transparent
			);
			background-size: $background-size $background-size;
			animation: shift-background 2s linear infinite;
			transition: width 1s ease;
		}
	}
}
</style>
