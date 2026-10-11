import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { constructionMotion } from '../src/lib/components/shop/construction-motion';

const animateMock = vi.hoisted(() => vi.fn());
vi.mock('motion/mini', () => ({ animate: animateMock }));

function mediaPreference(initial: boolean) {
	const events = new EventTarget();
	return {
		matches: initial,
		addEventListener: vi.fn(events.addEventListener.bind(events)),
		removeEventListener: vi.fn(events.removeEventListener.bind(events)),
		change(matches: boolean) {
			this.matches = matches;
			events.dispatchEvent(new Event('change'));
		}
	};
}

function playback(loop: boolean) {
	let finish: () => void = () => {};
	const finished = new Promise<void>((resolve) => (finish = resolve));
	return {
		loop,
		state: 'running',
		play: vi.fn(function (this: { state: string }) {
			this.state = 'running';
		}),
		pause: vi.fn(function (this: { state: string }) {
			this.state = 'paused';
		}),
		cancel: vi.fn(function (this: { state: string }) {
			this.state = 'idle';
		}),
		then: finished.then.bind(finished),
		finish() {
			this.state = 'finished';
			finish();
		}
	};
}

type Playback = ReturnType<typeof playback>;
type Controller = ReturnType<typeof constructionMotion>;
let animations: Playback[];
let controllers: Controller[];
let reduced: ReturnType<typeof mediaPreference>;
let mobile: ReturnType<typeof mediaPreference>;
let documentEvents: EventTarget;
let documentState: {
	hidden: boolean;
	addEventListener: ReturnType<typeof vi.fn>;
	removeEventListener: ReturnType<typeof vi.fn>;
};
let intersection: (entries: { isIntersecting: boolean }[]) => void;
let disconnect: ReturnType<typeof vi.fn>;

function start() {
	const element = () =>
		({
			style: { removeProperty: vi.fn() },
			getBoundingClientRect: () => ({ top: 0, bottom: 800 })
		}) as unknown as HTMLElement;
	const onStateChange = vi.fn();
	const controller = constructionMotion(
		{
			section: element(),
			topBand: element(),
			bottomBand: element(),
			topTrack: element(),
			bottomTrack: element(),
			notice: element(),
			leftTab: element(),
			rightTab: element()
		},
		onStateChange
	);
	controllers.push(controller);
	return { controller, onStateChange };
}

async function finishAssembly() {
	for (const animation of animations.filter((animation) => !animation.loop)) animation.finish();
	// Drain the controls' finish handlers and Promise.all's continuation.
	for (let index = 0; index < 5; index++) await Promise.resolve();
}

const activeLoops = () =>
	animations.filter((animation) => animation.loop && animation.state !== 'idle');

beforeEach(() => {
	animations = [];
	controllers = [];
	reduced = mediaPreference(false);
	mobile = mediaPreference(false);
	documentEvents = new EventTarget();
	documentState = {
		hidden: false,
		addEventListener: vi.fn(documentEvents.addEventListener.bind(documentEvents)),
		removeEventListener: vi.fn(documentEvents.removeEventListener.bind(documentEvents))
	};
	disconnect = vi.fn();
	vi.stubGlobal('window', {
		innerHeight: 900,
		matchMedia: (query: string) => (query.includes('reduced-motion') ? reduced : mobile)
	});
	vi.stubGlobal('document', documentState);
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			observe = vi.fn();
			disconnect = disconnect;
			constructor(callback: typeof intersection) {
				intersection = callback;
			}
		}
	);
	animateMock.mockReset().mockImplementation((_element, _keyframes, options = {}) => {
		const animation = playback(options.repeat === Infinity);
		animations.push(animation);
		return animation;
	});
});

afterEach(() => {
	for (const controller of controllers) controller.destroy();
	vi.unstubAllGlobals();
});

describe('construction motion lifecycle', () => {
	it('starts as a static notice for reduced motion and responds to preference changes', () => {
		reduced.matches = true;
		const { onStateChange } = start();
		expect(animateMock).not.toHaveBeenCalled();
		expect(onStateChange).toHaveBeenLastCalledWith({ paused: false, reduced: true });

		reduced.change(false);
		expect(activeLoops()).toHaveLength(2);
		expect(animations.every((animation) => animation.loop)).toBe(true);
		reduced.change(true);
		expect(activeLoops()).toHaveLength(0);
		expect(animations.every((animation) => animation.cancel.mock.calls.length > 0)).toBe(true);
		expect(onStateChange).toHaveBeenLastCalledWith({ paused: false, reduced: true });
	});

	it('lets the visitor pause both assembly and lettering without visibility events overriding it', async () => {
		const { controller, onStateChange } = start();
		controller.togglePause();
		expect(animations.every((animation) => animation.state === 'paused')).toBe(true);
		expect(onStateChange).toHaveBeenLastCalledWith({ paused: true, reduced: false });
		intersection([{ isIntersecting: false }]);
		intersection([{ isIntersecting: true }]);
		expect(animations.every((animation) => animation.state === 'paused')).toBe(true);

		controller.togglePause();
		expect(animations.every((animation) => animation.state === 'running')).toBe(true);
		await finishAssembly();
		expect(activeLoops()).toHaveLength(2);
		controller.togglePause();
		expect(activeLoops().every((animation) => animation.state === 'paused')).toBe(true);
		controller.togglePause();
		expect(activeLoops().every((animation) => animation.state === 'running')).toBe(true);
	});

	it('pauses work offscreen or in a hidden tab, resuming only when both are visible', async () => {
		start();
		intersection([{ isIntersecting: false }]);
		expect(animations.every((animation) => animation.state === 'paused')).toBe(true);
		documentState.hidden = true;
		documentEvents.dispatchEvent(new Event('visibilitychange'));
		intersection([{ isIntersecting: true }]);
		expect(animations.every((animation) => animation.state === 'paused')).toBe(true);
		documentState.hidden = false;
		documentEvents.dispatchEvent(new Event('visibilitychange'));
		expect(animations.every((animation) => animation.state === 'running')).toBe(true);

		await finishAssembly();
		intersection([{ isIntersecting: false }]);
		expect(activeLoops().every((animation) => animation.state === 'paused')).toBe(true);
		intersection([{ isIntersecting: true }]);
		expect(activeLoops().every((animation) => animation.state === 'running')).toBe(true);
	});

	it('uses one continuous tape on mobile and adjusts when the viewport changes', async () => {
		mobile.matches = true;
		start();
		await finishAssembly();
		expect(activeLoops()).toHaveLength(1);
		mobile.change(false);
		expect(activeLoops()).toHaveLength(2);
		mobile.change(true);
		expect(activeLoops()).toHaveLength(1);
	});

	it('cancels an interrupted assembly when reduced motion is enabled, without restarting it later', async () => {
		start();
		const entrances = [...animations];
		reduced.change(true);
		expect(entrances.every((animation) => animation.cancel.mock.calls.length === 1)).toBe(true);
		await finishAssembly();
		expect(activeLoops()).toHaveLength(0);
		reduced.change(false);
		expect(activeLoops()).toHaveLength(2);
		expect(animations.filter((animation) => !animation.loop)).toHaveLength(entrances.length);
	});

	it('cancels all work and removes subscriptions on unmount, even before assembly finishes', async () => {
		const { controller } = start();
		controller.destroy();
		expect(animations.every((animation) => animation.cancel.mock.calls.length > 0)).toBe(true);
		expect(disconnect).toHaveBeenCalledOnce();
		expect(documentState.removeEventListener).toHaveBeenCalledWith(
			'visibilitychange',
			expect.any(Function)
		);
		expect(reduced.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
		expect(mobile.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
		await finishAssembly();
		reduced.change(false);
		mobile.change(true);
		expect(activeLoops()).toHaveLength(0);
	});
});
