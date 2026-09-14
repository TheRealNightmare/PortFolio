<script lang="ts">
	import RadioTowerIcon from '@lucide/svelte/icons/radio-tower';
	import { onDestroy } from 'svelte';

	import { Button } from '$lib/components/ui/button';

	/**
	 * Header easter egg: beeps a message out in Morse code.
	 *
	 * Audio is synthesised with a single WebAudio oscillator whose gain is
	 * scheduled ahead of time, so the rhythm stays exact even if the main thread
	 * is busy. The visual blink is driven separately by timers — if those drift a
	 * frame or two it does not matter, but the tone must not.
	 */

	const MESSAGE = 'ALWAYS CONTRIBUTE TO COMMUNITY';

	const MORSE: Record<string, string> = {
		A: '.-',
		B: '-...',
		C: '-.-.',
		D: '-..',
		E: '.',
		F: '..-.',
		G: '--.',
		H: '....',
		I: '..',
		J: '.---',
		K: '-.-',
		L: '.-..',
		M: '--',
		N: '-.',
		O: '---',
		P: '.--.',
		Q: '--.-',
		R: '.-.',
		S: '...',
		T: '-',
		U: '..-',
		V: '...-',
		W: '.--',
		X: '-..-',
		Y: '-.--',
		Z: '--..'
	};

	// Standard Morse timing, in dit units: a dah is 3, the gap between symbols is
	// 1, between letters 3, between words 7.
	const WPM = 17;
	const DIT = 1.2 / WPM;

	type Unit = { on: boolean; units: number };

	/** Flatten the message into an on/off envelope measured in dit units. */
	function envelope(text: string): Unit[] {
		const out: Unit[] = [];
		const words = text.toUpperCase().split(' ');

		words.forEach((word, w) => {
			if (w > 0) out.push({ on: false, units: 7 });
			[...word].forEach((char, c) => {
				const code = MORSE[char];
				if (!code) return;
				if (c > 0) out.push({ on: false, units: 3 });
				[...code].forEach((symbol, s) => {
					if (s > 0) out.push({ on: false, units: 1 });
					out.push({ on: true, units: symbol === '-' ? 3 : 1 });
				});
			});
		});

		return out;
	}

	const units = envelope(MESSAGE);

	let playing = $state(false);
	let lit = $state(false);

	let ctx: AudioContext | null = null;
	let osc: OscillatorNode | null = null;
	let gain: GainNode | null = null;
	let timers: ReturnType<typeof setTimeout>[] = [];

	function stop() {
		timers.forEach(clearTimeout);
		timers = [];
		try {
			osc?.stop();
		} catch {
			// Already stopped — nothing to clean up.
		}
		osc?.disconnect();
		gain?.disconnect();
		osc = null;
		gain = null;
		playing = false;
		lit = false;
	}

	function play() {
		// The AudioContext is created inside the click handler: browsers only
		// allow audio to start from a user gesture.
		ctx ??= new (window.AudioContext ?? (window as any).webkitAudioContext)();
		void ctx.resume();

		gain = ctx.createGain();
		gain.gain.value = 0;
		gain.connect(ctx.destination);

		osc = ctx.createOscillator();
		osc.type = 'sine';
		osc.frequency.value = 620;
		osc.connect(gain);

		const start = ctx.currentTime + 0.08;
		let t = start;

		for (const unit of units) {
			const length = unit.units * DIT;
			if (unit.on) {
				// Short ramps instead of hard steps, which would click audibly.
				gain.gain.setValueAtTime(0, t);
				gain.gain.linearRampToValueAtTime(0.18, t + 0.006);
				gain.gain.setValueAtTime(0.18, t + length - 0.006);
				gain.gain.linearRampToValueAtTime(0, t + length);

				const onAt = (t - start) * 1000;
				timers.push(setTimeout(() => (lit = true), onAt));
				timers.push(setTimeout(() => (lit = false), onAt + length * 1000));
			}
			t += length;
		}

		osc.start(start);
		osc.stop(t + 0.1);
		playing = true;
		timers.push(setTimeout(stop, (t - start + 0.2) * 1000));
	}

	function toggle() {
		if (playing) stop();
		else play();
	}

	onDestroy(stop);
</script>

<Button
	size="icon-sm"
	color={playing ? 'yellow' : 'white'}
	onclick={toggle}
	class="morse-btn {lit ? 'lit' : ''}"
	aria-label={playing ? 'Stop the Morse code message' : 'Play a message in Morse code'}
	title="What's it saying?"
>
	<RadioTowerIcon />
</Button>

<!-- Anyone who cannot hear the tone still gets the message. -->
<p class="sr-only" aria-live="polite">
	{playing ? `Transmitting in Morse code: ${MESSAGE}` : ''}
</p>

<style>
	/* The icon pulses in time with the keying, so the message is visible as
	   well as audible. */
	:global(.morse-btn) {
		transition: filter 60ms linear;
	}

	:global(.morse-btn.lit) {
		filter: brightness(1.35);
	}

	:global(.morse-btn.lit svg) {
		scale: 1.18;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.morse-btn.lit svg) {
			scale: 1;
		}
	}
</style>
