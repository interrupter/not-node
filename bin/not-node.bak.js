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
	projectsRepos = require('../src/projects.js');

require('simple-git/promise');

let opts = {
		'project': argv.project || 'default',
		'dir': argv.dir || './'
	},
	repo = projectsRepos[opts.project];

let mkTmpDir = function(){
	return new Promise((resolve, reject)=>{
		fs.mkdtemp(path.join(os.tmpdir(), 'foo-'), (err, folder) => {
			if (err) { reject(err);}
			else{
				resolve(folder);
			}
		});
	});
};

let clearRepo = function(repo, parentDir){
	return new Promise((resolve, reject)=>{
		console.log('Clearing ', parentDir, ' ...');
		if (repo.clear){
			if (repo.clear.dirs || repo.clear.files){
				let counter = (repo.clear.dirs?repo.clear.dirs.length:0) + (repo.clear.files?repo.clear.files.length:0);
				for (let dir of repo.clear.dirs){
					console.log(dir);
					rmdir(path.join(parentDir, dir), (err)=>{
						if (err){
							reject(err);
						}else{
							counter--;
							if (!counter){
								console.log('done');
								resolve();
							}
						}
					});
				}
				for (let file of repo.clear.files){
					console.log(file);
					fs.exists(path.join(parentDir, file), (exists)=>{
						if (exists){
							fs.unlink(path.join(parentDir, file), (err)=>{
								if (err){
									reject(err);
								}else{
									counter--;
									if (!counter){
										console.log('done');
										resolve();
									}
								}
							});
						}else{
							counter--;
							if (!counter){
								console.log('done');
								resolve();
							}
						}
					});
				}
			}else{
				resolve();
			}
		}else{
			resolve();
		}
	});
};

let cloneRepo = function(repo, dir){
	return new Promise((resolve, reject)=>{
		console.log('Cloning ', repo.url, ' into ', dir);
		git().silent(true).clone(repo.url, dir, [ '--depth', 1])
			.exec((err)=>{
				if (err){
					reject(err);
				}else{
					console.log('done');
					resolve();
				}
			});
	});
};


let cloneParents = function (repos, parentDir){
	let cloneRoutine = function(rep, cntr, resolve, reject){
		cloneRepo(rep, rep.tmpDir)
			.then(() => {
				return clearRepo(rep, rep.tmpDir);
			})
			.then(() => {
				return moveRepo(rep.tmpDir, path.join(parentDir, rep.dir));
			})
			.then(() => {
				cntr--;
				if (!cntr){
					resolve();
				}
			})
			.catch((err)=>{
				reject(err);
			});
	};

	return new Promise((resolve, reject)=>{
		if (repos){
			let counter = repos.length;
			for(let dep of repos){
				projectsRepos[dep].tmpDir = getTmpDir();
				cloneRoutine(projectsRepos[dep], counter, resolve, reject);
			}
		}else{
			resolve();
		}
	});
};

let cloneRoutine = function(repo){

};


cloneParents(repo.extends, opts.dir)
	.then(() => mkTmpDir())
	.then(() => {
		cloneRepo(repo, path.join(opts.dir, repo.dir));
	})
	.then(() => cloneRepo(repo, path.join(opts.dir, repo.dir)))
	.then(() => clearRepo(repo, path.join(opts.dir, repo.dir)));
