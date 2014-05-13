precision mediump float;

// Uniform values from CSS

uniform float cr;
uniform float br;

// Main

void main() {
	css_ColorMatrix = mat4( cr, 0.0, 0.0, br,
							0.0, cr, 0.0, br,
							0.0, 0.0, cr, br,
							0.0, 0.0, 0.0, 1.0 );
}
