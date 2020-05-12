#!/usr/bin/env node

/*

	not-node project manager

	Usage:
	not-node --project='gallery' --to='./project'

*/

var argv = require('yargs').argv,
	git = require('simple-git'),
	fs = require('fs'),
	os = require('os'),
	fse = require('fs-extra'),
	rmdir = require('rmdir'),
	path = require('path'),
	readline = require('readline'),
	lib = require('../src/lib.js');

let opts = {
		'project': argv.project || 'default',
		'to': argv.to || './',
		'help': argv.help || false
	},
	repo = lib.getRepo(opts.project);

/*
	dir exists and empty,
	or dir not exists
*/

let noRedFlags = function(dir){
	return new Promise((resolve, reject)=>{
		fs.stat(dir, (err_stat, info)=>{
			if (err_stat){
				resolve();
			}else{
				if (info){
					fs.readdir(dir, (err_readdir, files)=>{
						if(err_readdir){
							reject('Error while reading directory file list.');
						}else{
							if (!files || files.length===0){
								resolve();
							}else{
								reject('Directory are not empty.');
							}
						}
					});
				}else{
					resolve();
				}
			}
		});
	});
};

if(opts.help){
	console.log('Valid options project, to, help.');
	console.log('not-node --to=./here --project=default');
}else{
	if (repo){
		noRedFlags(opts.to)
			.then(()=>lib.rootCloneRoutine(repo, opts.to))
			.then(()=>{
				console.log('Finally');
			})
			.catch(console.error);
	}else{
		console.error('Wrong repo name');
	}
}
