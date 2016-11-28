var includePaths = require('rollup-plugin-includepaths');

module.exports = {
	entry: './dist/index.js',
	sourceMap: true,
	format: 'umd',
	moduleName: 'AwayjsStage',
	external: [
		'@awayjs/core',
		'@awayjs/graphics'
	],
	globals: {
		'@awayjs/core': 'AwayjsCore',
		'@awayjs/graphics': 'AwayjsGraphics'
	},
	targets: [
		{ dest: './bundle/awayjs-stage.umd.js'}
	],
	plugins: [
		includePaths({
			include : {
				"tslib": "./node_modules/tslib/tslib.es6.js"
			}
		}) ]
};