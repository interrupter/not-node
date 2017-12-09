const fs = require('fs'),
	os = require('os'),
	fse = require('fs-extra'),
	rmdir = require('rmdir'),
	git = require('simple-git'),
	path = require('path'),
	repos = require('./repos.js'),
	shell = require('./shell.helpers.js');

exports.getRepo = function(name){
	return repos.hasOwnProperty(name)?repos[name]:false;
};

exports.mkTmpDir = function(){
	return fs.mkdtempSync(path.join(os.tmpdir(), 'not-node-'));
};

exports.cloneRepo = function(repo, dir){
	return new Promise((resolve, reject)=>{
		console.log('Cloning ', repo.url, ' into ', dir);
		git().silent(false).clone(repo.url, dir, [ '--depth', 1])
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

exports.clearRepo = function(repo, parentDir){
	return new Promise((resolve, reject)=>{
		console.log('Clearing ', parentDir, ' ...');
		if (repo.clear){
			if (repo.clear.dirs || repo.clear.files){
				let counter = (repo.clear.dirs?repo.clear.dirs.length:0) + (repo.clear.files?repo.clear.files.length:0);
				for (let dir of repo.clear.dirs){
					console.log('removing ',dir);
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
					console.log('removing ',file);
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

exports.moveCleanClone = function(repo, from, to){
	return new Promise((resolve, reject)=>{
		fs.readdir(from, (err, items) => {
			if (err){
				reject(err);
			}else{
				if (to.charAt(to.length-1)  === '/'){
					to = to.substring(0, to.length - 1);
				}
				let counter = items.length;
		 		for (let i = 0; i < items.length; i++) {
					console.log('moving', path.join(from, items[i]), ' >> ', path.join(to, items[i]));
					fse.move(path.join(from, items[i]), path.join(to, items[i]), { overwrite: true })
						.then(()=>{
							counter--;
							if (counter === 0){
								resolve();
							}
						})
						.catch(reject);
				}
			}
		});
	});
};

exports.execShell = function(repo, dir){
	console.log('exec shell');
	return new Promise((resolve, reject)=>{
		// execute multiple commands in series
		if (repo.exec){
			if (repo.exec.after && repo.exec.after.length){
				console.log('exec commands');
				let cmds = repo.exec.after.map((item)=>{
					return path.join(dir, item)+' \''+path.join(__dirname, dir)+'\'';
				});
				console.log(cmds.join('\n'));
				shell.series(cmds, function(err){
					if (err){
						console.log(err);
						reject(err);
					}else{
						resolve();
					}
				});
			}else{
				resolve();
			}
		}else{
			resolve();
		}
	});
};


exports.cloneRoutine = function(repo, to){
	return new Promise((resolve, reject) => {
		let tmpDir = exports.mkTmpDir();
		exports.cloneRepo(repo, tmpDir)
			.then(() => exports.clearRepo(repo, tmpDir))
			.then(() => fse.ensureDir(path.join(to, repo.dir)))
			.then(() => exports.moveCleanClone(repo, tmpDir, path.join(to, repo.dir)))
			.then(() => exports.execShell(repo, path.join(to, repo.dir)))
			.then(resolve)
			.catch(reject);
	});
};

exports.cloneParents = function(repo, to){
	console.log('Cloning parents...');
	return new Promise((resolve, reject)=>{
		if (repos && repo && repo.extends && repo.extends.length > 0){
			let counter = repo.extends.length;
			for(let dep of repo.extends){
				console.log('Cloning parent', repos[dep].url);
				exports.cloneRoutine(repos[dep], to)
					.then(()=>{
						counter--;
						if (!counter){
							resolve();
						}
					})
					.catch(reject);
			}
		}else{
			resolve();
		}
	});
};

exports.rootCloneRoutine = function(repo, to){
	console.log('Clone root project', repo.url, 'to', to);
	return new Promise((resolve, reject) => {
		let tmpDir = exports.mkTmpDir();
		console.log('tmp dir', tmpDir);
		fse.ensureDir(path.join(to, repo.dir))
			.then(() => fse.emptyDir(path.join(to, repo.dir)))
			.then(() => exports.cloneParents(repo, path.join(to, repo.dir)))
			.then(() => exports.cloneRepo(repo, tmpDir))
			.then(() => exports.moveCleanClone(repo, tmpDir, path.join(to, repo.dir)))
			.then(() => exports.execShell(repo, path.join(to, repo.dir)))
			.then(resolve)
			.catch(reject);
	});
};
