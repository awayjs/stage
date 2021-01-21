import includePaths from 'rollup-plugin-includepaths';
import { terser } from 'rollup-plugin-terser';

export default {
	input: './dist/index.js',
	external: [
		'@awayjs/core',
		'@awayjs/graphics'
	],
	output: [
		{
			file: './bundle/awayjs-stage.umd.js',
			format: 'umd',
			name: 'AwayjsStage',
			globals: {
				'@awayjs/core': 'AwayjsCore',
				'@awayjs/graphics': 'AwayjsGraphics'
			},
			sourcemap: true
		},
		{
			file: './bundle/awayjs-stage.umd.min.js',
			format: 'umd',
			name: 'AwayjsStage',
			globals: {
				'@awayjs/core': 'AwayjsCore',
				'@awayjs/graphics': 'AwayjsGraphics'
			},
			sourcemap: true,
			plugins: [
				terser({})
			]
		}
	],
	plugins: [
		includePaths({
			include : {
				'tslib': './node_modules/tslib/tslib.es6.js'
			}
		})
	]
};