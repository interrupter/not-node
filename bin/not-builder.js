#!/usr/bin/env node

/*

	not-node project builder

	build project to current folder by specified environment rules,
	if `to` path not empty then will be generated project artifact

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
	'environment': argv.environment || 'production',
	'to': argv.to || false,
	'config': argv.config || './project.manifest.json',
};

/*
	dir exists and empty,
	or dir not exists
*/

let noRedFlags = function(dir){
	return new Promise((resolve, reject)=>{
		if (fs.stat(dir, (err_stat, info)=>{
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
		}));
	});
};

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
