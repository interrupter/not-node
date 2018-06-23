/** @module Rollup */

// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import postcss from 'rollup-plugin-postcss';

// PostCSS plugins
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import envReplace from 'postcss-env-replace';
import cssnano from 'cssnano';

let replacerOpts = {
		ENV: JSON.stringify(process.env.NODE_ENV || 'development')
	},
	baseHost = replacerOpts.ROLLUP_ENV_PORT+'://'+replacerOpts.ROLLUP_ENV_HOST+':'+replacerOpts.ROLLUP_ENV_PORT+'/editor';

if (['production', 'stage', 'develpment'].indexOf(process.env.NODE_ENV)>-1){
	replacerOpts = Object.assign(replacerOpts, replaceSets[process.env.NODE_ENV]);
}else{
	replacerOpts = Object.assign(replacerOpts, replaceSets.development);
}

export default {
	input: 'src/client/app.js',
	output: {
		file:'build/client/core.js',
		format: 'iife'
	},
	name: 'FrameMuse',
	sourceMap: false && (process.env.NODE_ENV === 'production' ? false : 'inline'),
	plugins: [
		postcss({
			plugins: [
				envReplace({
					environment: process.env.NODE_ENV || 'development',
					replacements: {
						BASE_URL: {
							stage: 		baseHost,
							production: baseHost,
							development:baseHost
						}
					}
				}),
				simplevars(),
				nested(),
				cssnext({
					warnForDuplicates: false,
				}),
				cssnano(),
			],
			extensions: ['.css'],
		}),
		resolve({
			jsnext: true,
			main: true,
			browser: true
		}),
		commonjs(),
		eslint({
			exclude: ['build/**', 'src/css/**'],
			rules:{"useless-escape": "off"}

		}),
		replace(replacerOpts),
		(process.env.NODE_ENV === 'production' && babel({
			exclude: ['build/**']
		})),
		(process.env.NODE_ENV === 'production' && uglify()),
		filesize()
	]
};
