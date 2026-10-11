<script lang="ts">
	import ShoppingBag from 'phosphor-svelte/lib/ShoppingBag';
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass';
	import Heart from 'phosphor-svelte/lib/Heart';
	import UserCircle from 'phosphor-svelte/lib/UserCircle';
	import ArrowRight from 'phosphor-svelte/lib/ArrowRight';
	import X from 'phosphor-svelte/lib/X';
	import List from 'phosphor-svelte/lib/List';
	import Check from 'phosphor-svelte/lib/Check';
	import GlobeHemisphereWest from 'phosphor-svelte/lib/GlobeHemisphereWest';
	import FrameCorners from 'phosphor-svelte/lib/FrameCorners';
	import Leaf from 'phosphor-svelte/lib/Leaf';
	import Plus from 'phosphor-svelte/lib/Plus';
	import Minus from 'phosphor-svelte/lib/Minus';
	import MagnifyingGlassPlus from 'phosphor-svelte/lib/MagnifyingGlassPlus';
	import TShirt from 'phosphor-svelte/lib/TShirt';
	import Tag from 'phosphor-svelte/lib/Tag';
	import Truck from 'phosphor-svelte/lib/Truck';
	import LockSimple from 'phosphor-svelte/lib/LockSimple';
	import Ruler from 'phosphor-svelte/lib/Ruler';
	import CaretDown from 'phosphor-svelte/lib/CaretDown';
	import Trash from 'phosphor-svelte/lib/Trash';
	import CircleNotch from 'phosphor-svelte/lib/CircleNotch';
	import Envelope from 'phosphor-svelte/lib/Envelope';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';
	let { name, size = 22 }: { name: string; size?: number } = $props();
	const icons = {
		bag: ShoppingBag,
		search: MagnifyingGlass,
		heart: Heart,
		user: UserCircle,
		arrow: ArrowRight,
		close: X,
		menu: List,
		check: Check,
		globe: GlobeHemisphereWest,
		frame: FrameCorners,
		leaf: Leaf,
		plus: Plus,
		minus: Minus,
		zoom: MagnifyingGlassPlus,
		shirt: TShirt,
		tag: Tag,
		truck: Truck,
		lock: LockSimple,
		ruler: Ruler,
		down: CaretDown,
		trash: Trash,
		spinner: CircleNotch,
		mail: Envelope,
		external: ArrowUpRight
	};
	let Glyph = $derived(icons[name as keyof typeof icons] ?? ArrowRight);
</script>

<Glyph {size} weight="regular" aria-hidden="true" />
