// Rollup plugins
import babel from 'rollup-plugin-babel';
import {eslint} from 'rollup-plugin-eslint';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import sass from 'rollup-plugin-sass';
import postcss from 'rollup-plugin-postcss';

import obfuscatorPlugin from 'rollup-plugin-javascript-obfuscator';

// PostCSS plugins
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import envReplace from 'postcss-env-replace';
import cssnano from 'cssnano';

import {
	babelOn,
	uglifyOn,
	replacerOpts,
	baseHost,
	replaceSets
} from './build.env.js';

export default {
	input: '/var/server/nn/test/application/app/front/src/index.root.js',
	output: {
		file: '/var/server/nn/test/application/app/front/build/root.js',
		name: 'TestServerApplication',
		format: 'iife',
		globals: ['notFramework','$']
	},
	plugins: [
		postcss({
			plugins: [
				envReplace({
					environment: process.env.NODE_ENV || 'development',
					replacements: {
						BASE_URL: {
							stage: baseHost,
							production: baseHost,
							development: baseHost
						},
					}
				}),
				simplevars(),
				nested(),
				cssnext({
					warnForDuplicates: false,
				}),
				cssnano(),
			],
			extensions: ['.scss'],
		}),
		sass({
			  output: true,
		}),
		resolve({
			jsnext: true,
			main: true,
			browser: true
		}),
		commonjs(),
		eslint({
			exclude: ['build/**', 'src/index.template.js']
		}),
		replace(replacerOpts),
		(babelOn() && babel({
			exclude: ['build/**']
		})),
		/**
		(uglifyOn() && uglify()),
		(uglifyOn() && obfuscatorPlugin({
			compact: true
		})),
		**/
		filesize()
	]
};
