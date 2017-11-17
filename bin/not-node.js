#!/usr/bin/env node

/*

	not-node project manager

*/

var argv = require('yargs').argv,
	git = require('simple-git'),
	fs = require('fs'),
	os = require('os'),
	fse = require('fs-extra'),
	rmdir = require('rmdir'),
	path = require('path'),
	lib = require('../src/lib.js');

let opts = {
		'project': argv.project || 'default',
		'to': argv.to || './'
	},
	repo = lib.getRepo(opts.project);

if (repo){
	lib.rootCloneRoutine(repo, opts.to)
		.then(()=>{
			console.log('Finally');
		})
		.catch(console.error);
}else{
	console.error('Wrong repo name');
}
