import { animate } from 'motion/mini';

type Playback = ReturnType<typeof animate>;

interface ConstructionElements {
	section: HTMLElement;
	topBand: HTMLElement;
	bottomBand: HTMLElement;
	topTrack: HTMLElement;
	bottomTrack: HTMLElement;
	notice: HTMLElement;
	leftTab: HTMLElement;
	rightTab: HTMLElement;
}

interface MotionState {
	paused: boolean;
	reduced: boolean;
}

/** A measured assembly sequence followed by native, transform-only tape loops. */
export function constructionMotion(
	elements: ConstructionElements,
	onStateChange: (state: MotionState) => void
) {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const smallScreen = window.matchMedia('(max-width: 760px)');
	const activeEntrances = new Set<Playback>();
	const marquees = new Set<Playback>();
	const animatedElements = Object.values(elements).filter(
		(element) => element !== elements.section
	);
	let paused = false;
	let disposed = false;
	let assembled = reducedMotion.matches;
	let generation = 0;
	const bounds = elements.section.getBoundingClientRect();
	let inView = bounds.bottom > 0 && bounds.top < window.innerHeight;

	function updatePlayback() {
		const shouldPlay = !paused && !document.hidden && inView && !reducedMotion.matches;
		for (const animation of [...activeEntrances, ...marquees]) {
			if (shouldPlay) animation.play();
			else animation.pause();
		}
	}

	function publishState() {
		onStateChange({ paused, reduced: reducedMotion.matches });
	}

	function clearMarquees() {
		for (const animation of marquees) animation.cancel();
		marquees.clear();
		elements.topTrack.style.removeProperty('transform');
		elements.bottomTrack.style.removeProperty('transform');
	}

	function startMarquees() {
		clearMarquees();
		if (disposed || reducedMotion.matches || !assembled) return;

		// Each track has two equal groups. Half its width is exactly one repeat,
		// including the label spacing, at every viewport width.
		marquees.add(
			animate(
				elements.topTrack,
				{ transform: ['translateX(0%)', 'translateX(-50%)'] },
				{ duration: smallScreen.matches ? 128 : 96, ease: 'linear', repeat: Infinity }
			)
		);
		// Only one continuous moving layer on phones.
		if (!smallScreen.matches) {
			marquees.add(
				animate(
					elements.bottomTrack,
					{ transform: ['translateX(-50%)', 'translateX(0%)'] },
					{ duration: 112, ease: 'linear', repeat: Infinity }
				)
			);
		}
		updatePlayback();
	}

	function playAssembly() {
		const currentGeneration = ++generation;
		// Ease in as gently as we ease out; nothing springs or overshoots its place.
		const ease = [0.42, 0, 0.58, 1] as const;
		const stages = [
			animate(
				elements.topBand,
				{ transform: ['translateX(-102%)', 'translateX(0%)'] },
				{ duration: 1.35, ease }
			),
			animate(
				elements.bottomBand,
				{ transform: ['translateX(102%)', 'translateX(0%)'] },
				{ delay: 0.65, duration: 1.45, ease }
			),
			animate(
				elements.notice,
				{ transform: ['rotate(-0.55deg)', 'rotate(0deg)'] },
				{ delay: 1.7, duration: 1.1, ease }
			),
			animate(
				elements.leftTab,
				{ transform: ['scaleX(0)', 'scaleX(1)'] },
				{ delay: 2.35, duration: 0.65, ease }
			),
			animate(
				elements.rightTab,
				{ transform: ['scaleX(0)', 'scaleX(1)'] },
				{ delay: 2.5, duration: 0.65, ease }
			)
		];

		for (const animation of stages) {
			activeEntrances.add(animation);
			void animation.then(() => activeEntrances.delete(animation));
		}
		updatePlayback();

		void Promise.all(stages).then(() => {
			if (disposed || currentGeneration !== generation) return;
			assembled = true;
			// Release temporary transforms after assembly; the paper and bands
			// no longer need compositor layers once they have been set in place.
			for (const element of animatedElements) element.style.removeProperty('transform');
			startMarquees();
		});
	}

	function updateMotionPreference() {
		if (reducedMotion.matches) {
			++generation;
			for (const animation of activeEntrances) animation.cancel();
			activeEntrances.clear();
			clearMarquees();
			for (const element of animatedElements) element.style.removeProperty('transform');
			assembled = true;
		} else {
			// A preference change resumes the lettering without replaying assembly.
			startMarquees();
		}
		publishState();
	}

	const observer = new IntersectionObserver(([entry]) => {
		inView = entry.isIntersecting;
		updatePlayback();
	});
	observer.observe(elements.section);
	document.addEventListener('visibilitychange', updatePlayback);
	reducedMotion.addEventListener('change', updateMotionPreference);
	smallScreen.addEventListener('change', startMarquees);

	if (!reducedMotion.matches) playAssembly();
	publishState();

	return {
		togglePause() {
			paused = !paused;
			updatePlayback();
			publishState();
		},
		destroy() {
			disposed = true;
			++generation;
			observer.disconnect();
			document.removeEventListener('visibilitychange', updatePlayback);
			reducedMotion.removeEventListener('change', updateMotionPreference);
			smallScreen.removeEventListener('change', startMarquees);
			for (const animation of activeEntrances) animation.cancel();
			activeEntrances.clear();
			clearMarquees();
			for (const element of animatedElements) element.style.removeProperty('transform');
		}
	};
}
