import { BlendMode } from '../../../image';

const COMPOSITE_OPP: Record<string, string> = {
	[BlendMode.DIFFERENCE]:
	`vec4 top = vec4(abs(src.rgb - dst.rgb), 1.0) * max(src.a, dst.a);

	return top + normal * (1.0 - top.a);`,
	[BlendMode.SUBTRACT]:
	`vec4 top = vec4(dst.rgb - src.rgb, 1.0) * max(src.a, dst.a);

	return top + normal * (1.0 - top.a);`,
	[BlendMode.INVERT]:
	`dst.rgb = (dst.rgb * (1.0 - src.a) + (1. - dst.rgb) * src.a);
	dst.rgb *= dst.a;

	return dst;`,
	[BlendMode.DARKEN]:
	`vec4 top = vec4(min(src.rgb, dst.rgb), 1.0) * src.a * dst.a;

	return top + normal * (1.0 - top.a);`,
	[BlendMode.LIGHTEN]:
	`vec4 top = vec4(max(src.rgb, dst.rgb), 1.0) * src.a * dst.a;

	return top + normal * (1.0 - top.a);`,
	[BlendMode.HARDLIGHT]:
	`vec3 factor = step(vec3(0.5), dst.rgb);
	vec3 screen = (1. - 2. * (1. - src.rgb) * (1. - dst.rgb));
	vec3 multiple =  2. * src.rgb * dst.rgb;

	vec4 top = vec4(factor * multiple + (1. - factor) * screen, 1.);
	top *= dst.a * src.a;

	return top + normal * (1.0 - top.a);`,

	/**
	 * This is not real overlay
	 * for overlay need a remove `1.-`,
	 * but! if i do this, in GetInTop begin visible artefacts
	 * looks like composite equation not fully true
	 */
	[BlendMode.OVERLAY]:
	`vec3 factor = step(src.rgb, vec3(0.5));
	vec3 screen = (1. - 2. * (1. - src.rgb) * (1. - dst.rgb));
	vec3 multiple =  2. * src.rgb * dst.rgb;

	vec4 top = vec4(factor * screen + (1. - factor) * multiple, 1.);
	top *= dst.a * src.a;

	return top + normal * (1.0 - top.a);`,
	[BlendMode.SCREEN]:
	`vec3 screen = (1. - (1. - src.rgb) * (1. - dst.rgb));
	vec4 top = vec4(screen, 1.);
	top *= dst.a * src.a;

	return top + normal * (1.0 - top.a);`
};

export function supportComposition(name: string) {
	return name in COMPOSITE_OPP;
}

export const COMPOSITE_PART = (name: string) => `
uniform float uComposite;
uniform sampler2D fs1;

vec4 composite (vec4 src) {
	vec4 dst = texture2D(fs1, vUv[1]);
	vec4 normal = src + (1.0 - src.a) * dst;

	vec4 pma_src = src;
	vec4 pma_dst = dst;

	if (src.a > 0.0) src.rgb /= src.a;
	if (dst.a > 0.0) dst.rgb /= dst.a;

	// composite as ${name}
	${COMPOSITE_OPP[name]}
}
`;