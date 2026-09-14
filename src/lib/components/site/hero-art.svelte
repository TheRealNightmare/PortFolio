<script lang="ts">
	/**
	 * Hero decoration: a layered "arcade badge" composition.
	 *
	 * Built from stacked rings rather than loose shapes, so the whole thing reads
	 * as one object instead of scattered confetti. Layers, outside in:
	 *   halftone dot grid → dashed outer ring + rotating word ring → orbiting
	 *   satellite → burst/star → center sticker → blinking pixel accents.
	 *
	 * Everything is SVG + CSS, decorative (aria-hidden), and each layer turns at
	 * a different rate so the motion never reads as one rigid spin. Colors come
	 * from the bright-* ramp and the hard shadow uses --color-border, matching
	 * the sticker cards elsewhere on the page.
	 */

	/** `sm` is the compact variant that sits beside the name on small screens. */
	let { size = 'default' }: { size?: 'sm' | 'default' } = $props();

	// Repeated twice so the ring text meets itself seamlessly at the wrap point.
	const ringText = 'BUILD · SHIP · BREAK · REPEAT · ';
</script>

<div class="hero-art" class:sm={size === 'sm'} aria-hidden="true">
	<svg viewBox="0 0 400 400" class="stage">
		<defs>
			<!-- Halftone backdrop: a dot grid that fades out toward the edges so the
			     composition sits on something rather than floating on flat color. -->
			<pattern id="ha-dots" width="16" height="16" patternUnits="userSpaceOnUse">
				<circle cx="3" cy="3" r="2" fill="var(--color-border)" />
			</pattern>
			<radialGradient id="ha-fade">
				<stop offset="45%" stop-color="#fff" stop-opacity="0.9" />
				<stop offset="100%" stop-color="#fff" stop-opacity="0" />
			</radialGradient>
			<mask id="ha-mask">
				<rect width="400" height="400" fill="url(#ha-fade)" />
			</mask>

			<path id="ha-textpath" d="M200,200 m-168,0 a168,168 0 1,1 336,0 a168,168 0 1,1 -336,0" />
		</defs>

		<rect width="400" height="400" fill="url(#ha-dots)" mask="url(#ha-mask)" opacity="0.35" />

		<!-- Word ring: slow, counter to the dashed ring above it. -->
		<g class="spin-slow-rev">
			<text class="ring-text">
				<textPath href="#ha-textpath" startOffset="0">{ringText}{ringText}</textPath>
			</text>
		</g>

		<!-- Dashed outer ring + the satellite riding it. -->
		<g class="spin-slow">
			<circle cx="200" cy="200" r="140" class="ring-dashed" />
			<g class="sat">
				<rect x="186" y="46" width="28" height="28" class="hard sat-box" />
			</g>
			<circle cx="200" cy="340" r="9" class="hard dot-green" />
			<circle cx="60" cy="200" r="6" class="hard dot-magenta" />
		</g>

		<!-- Solid mid ring, turning the other way at a different rate. -->
		<g class="spin-mid">
			<circle cx="200" cy="200" r="108" class="ring-solid" />
			<rect
				x="192"
				y="84"
				width="16"
				height="16"
				class="hard dot-yellow"
				transform="rotate(45 200 92)"
			/>
			<rect
				x="192"
				y="300"
				width="16"
				height="16"
				class="hard dot-cyan"
				transform="rotate(45 200 308)"
			/>
		</g>

		<!-- Burst: twelve spokes behind the center sticker, breathing in and out. -->
		<g class="burst">
			{#each Array.from({ length: 12 }, (_, i) => i * 30) as angle (angle)}
				<rect
					x="196"
					y="118"
					width="8"
					height="26"
					class="spoke"
					transform="rotate({angle} 200 200)"
				/>
			{/each}
		</g>

		<!-- Center sticker: the only element that stays upright, so the eye has
		     something fixed to land on while everything else turns. -->
		<g class="core">
			<rect x="152" y="152" width="96" height="96" rx="4" class="hard core-box" />
			<text x="200" y="212" class="core-glyph">&lt;/&gt;</text>
		</g>
	</svg>

	<!-- Blinking pixel accents, parked outside the badge to break the circle. -->
	<span class="pix pix-a"></span>
	<span class="pix pix-b"></span>
	<span class="pix pix-c"></span>
</div>

<style>
	.hero-art {
		position: relative;
		width: 21rem;
		height: 21rem;
		margin-inline: auto;
	}

	@media (min-width: 1280px) {
		.hero-art {
			width: 24rem;
			height: 24rem;
		}
	}

	/* Compact variant: rides alongside the name on small screens, so it is sized
	   off the viewport to keep the name's line lengths intact. */
	.hero-art.sm {
		width: min(9.5rem, 34vw);
		height: min(9.5rem, 34vw);
	}

	.stage {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	/* Shared hard-edged sticker treatment. */
	.hard {
		stroke: var(--color-border);
		stroke-width: 4;
		filter: drop-shadow(4px 4px 0 var(--color-border));
	}

	.ring-dashed {
		fill: none;
		stroke: var(--color-border);
		stroke-width: 4;
		stroke-dasharray: 2 18;
		stroke-linecap: round;
		opacity: 0.8;
	}

	.ring-solid {
		fill: none;
		stroke: var(--color-border);
		stroke-width: 3;
		opacity: 0.5;
	}

	.ring-text {
		fill: var(--color-border);
		font-family: var(--font-mono, monospace);
		font-size: 19px;
		font-weight: 700;
		letter-spacing: 0.18em;
		opacity: 0.6;
	}

	.sat-box {
		fill: var(--bright-magenta);
	}
	.dot-green {
		fill: var(--bright-green);
	}
	.dot-magenta {
		fill: var(--bright-red);
	}
	.dot-yellow {
		fill: var(--bright-yellow);
	}
	.dot-cyan {
		fill: var(--bright-cyan);
	}

	.spoke {
		fill: var(--color-border);
		opacity: 0.55;
	}

	.core-box {
		fill: var(--bright-yellow);
	}

	.core-glyph {
		fill: var(--color-border);
		font-family: var(--font-mono, monospace);
		font-size: 34px;
		font-weight: 800;
		text-anchor: middle;
	}

	/* --- motion ---------------------------------------------------------- */

	.spin-slow,
	.spin-slow-rev,
	.spin-mid,
	.burst,
	.core,
	.sat {
		transform-origin: 200px 200px;
	}

	.spin-slow {
		animation: spin 44s linear infinite;
	}
	.spin-slow-rev {
		animation: spin 60s linear infinite reverse;
	}
	.spin-mid {
		animation: spin 26s linear infinite reverse;
	}

	/* The satellite counter-rotates at the ring's own rate, so the box stays
	   upright while it travels around the circle. */
	.sat {
		animation: spin 44s linear infinite reverse;
	}

	.burst {
		animation: breathe 6s ease-in-out infinite;
	}

	.core {
		animation: bob 5s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes breathe {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.55;
		}
		50% {
			transform: scale(1.12);
			opacity: 1;
		}
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0) rotate(-2deg);
		}
		50% {
			transform: translateY(-7px) rotate(2deg);
		}
	}

	.pix {
		position: absolute;
		width: 14px;
		height: 14px;
		border: 3px solid var(--color-border);
		animation: blink 3.2s steps(1, end) infinite;
	}

	.hero-art.sm .pix {
		width: 8px;
		height: 8px;
		border-width: 2px;
	}

	.pix-a {
		top: 4%;
		left: 2%;
		background: var(--bright-cyan);
	}
	.pix-b {
		right: 0%;
		bottom: 18%;
		background: var(--bright-green);
		animation-delay: -1.1s;
	}
	.pix-c {
		bottom: 2%;
		left: 14%;
		background: var(--bright-red);
		animation-delay: -2.2s;
	}

	@keyframes blink {
		0%,
		60% {
			opacity: 1;
		}
		61%,
		100% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spin-slow,
		.spin-slow-rev,
		.spin-mid,
		.sat,
		.burst,
		.core,
		.pix {
			animation: none;
		}
	}
</style>
