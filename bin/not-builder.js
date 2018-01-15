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
	child_process = require('child_process'),
	deepMerge = require('deepmerge'),
	readline = require('readline'),
	lib = require('../src/lib.js');

let opts = {
		'environment': argv.environment || 'production',
		'to': argv.to || false,
		'config': argv.config || './project.manifest.json',
		'rollup': argv.rollup || path.join(process.cwd(),'./node_modules/.bin/rollup'),
	},
	configName = path.join(process.cwd(), opts.config),
	config={};

function listDir(dir){
	return new Promise((resolve, reject)=>{
		fs.stat(dir, (err_stat, info)=>{
			if (err_stat){
				reject(err_stat);
			}else{
				if (info){
					fs.readdir(dir, (err_readdir, files)=>{
						if(err_readdir){
							reject('Error while reading directory file list.');
						}else{
							files.filter((item)=>{
								return fs.lstatSync(path.join(dir, item)).isDirectory();
							});
							resolve(files);
						}
					});
				}else{
					reject('Not exists!');
				}
			}
		});
	});
}

async function loadNPMModule(){
	let result = {};
	try{
		let {modName, modOptions, roles} = arguments[0];
		let mod = require(modName);
		for(let i =0;i<roles.length; i++){
			result[roles[i]] = [];
		}

		if (mod.paths && mod.paths.controllers){
			let pathToControllers = mod.paths.controllers;
			let dirList = await listDir(pathToControllers);
			if (dirList && Array.isArray(dirList) && dirList.length > 0){
				roles.forEach((role)=>{
					if (dirList.indexOf(role)>-1){
						let pathToModRole = path.join(pathToControllers, role);
						result[role].push(pathToModRole);
					}
				});
			}
		}
	}catch(e){
		console.error(e);
	}
	return result;
}


async function loadServerModule(){
	let result = {};
	try{
		let {modName, modOptions, roles, pathToModule} = arguments[0];
		let mod = require(pathToModule);
		for(let i = 0; i < roles.length; i++){
			result[roles[i]] = [];
		}
		if (mod.paths && mod.paths.controllers){
			let pathToControllers = mod.paths.controllers;
			let dirList = await listDir(pathToControllers);
			if (dirList && Array.isArray(dirList) && dirList.length > 0){
				roles.forEach((role)=>{
					if (dirList.indexOf(role)>-1){
						let pathToModRole = path.join(pathToControllers, role);
						result[role].push(pathToModRole);
					}
				});
			}
		}else{
			console.info('...no controllers');
		}
	}catch(e){
		console.error(e);
	}
	return result;
}

function initList(roles, pathTo){
	let list = {};
	for(let i =0;i<roles.length; i++){
		list[roles[i]] = [];
		if (pathTo){
			list[roles[i]].push(pathTo);
		}
	}
	return list;
}

async function loadFrontModules(){
	let result = {};
	try{
		let {modsOptions, roles, pathToModules} = arguments[0];
		for(let i = 0; i < roles.length; i++){
			result[roles[i]] = [];
		}
		let modulesDirList = await listDir(pathToModules);		
		if (modulesDirList.indexOf('common') > -1){
			result = initList(roles, path.join(pathToModules, 'common'));
		}
		for(let i = 0; i < roles.length; i++){
			modulesDirList = await listDir(path.join(pathToModules,roles[i]));
			for(let t = 0; t < modulesDirList.length; t++){
				result[roles[i]].push(path.join(pathToModules,roles[i],modulesDirList[t]));
			}
		}
	}catch(e){
		console.error(e);
	}
	return result;
}

async function loadServerModulesFromDir(){
	let list = {};
	try{
		let {modsOptions, roles, pathToModules} = arguments[0];
		let modulesDirList = await listDir(pathToModules);
		for(let i = 0; i < modulesDirList.length; i++){
			let moduleName = modulesDirList[i];
			console.info('Import from', moduleName);
			let modOptions = (modsOptions&&modsOptions.hasOwnProperty[moduleName])?modsOptions[moduleName]:{};
			let pathToModule = path.join(pathToModules, moduleName);
			let partList = await loadServerModule({pathToModule, roles, modName: moduleName, modOptions});
			list = deepMerge(list, partList);
		}
	}catch(e){
		console.error(e);
	}
	return list;
}


async function build_Server(pathToRoot, roles, targetName, targetManifest){
	let list = {};
	for(let i =0;i<roles.length; i++){
		list[roles[i]] = [];
	}
	////searching for app.js template
	////searching modules
	let pathTo = {
		"nodeModules": (targetManifest.modules && targetManifest.modules.serverModulesDir)?path.join(pathToRoot, targetManifest.modules.serverModulesDir):undefined,
		"frontModules": (targetManifest.modules && targetManifest.modules.frontModulesDir)?path.join(pathToRoot, targetManifest.modules.frontModulesDir): undefined
	};
	if (targetManifest.modules ){
		/////searching for npm modules
		if (targetManifest.modules.npm){
			let mass = targetManifest.modules.npm;
			console.info('Import from npm modules:');
			for(let t in mass){
				console.info(t, '...');
				let partList = await loadNPMModule({roles, modName: t, modOptions: mass[t]});
				list = deepMerge(list, partList);
			}
		}else{
			console.info('no npm modules in manifest');
		}
		/////searching for server modules
		if (targetManifest.modules.serverModulesDir){
			console.info('Import custom server modules from',targetManifest.modules.serverModulesDir,':');
			let partList = await loadServerModulesFromDir({pathToModules: path.join(pathToRoot,targetManifest.modules.serverModulesDir), roles, modsOptions: targetManifest.modules.server});
			list = deepMerge(list, partList);
		}else{
			console.info('no custom server modules in manifest');
		}
		/////searching for front modules
		if (targetManifest.modules.frontModulesDir){
			console.info('Import custom front modules from', targetManifest.modules.frontModulesDir,':');
			try{
				let mass = targetManifest.modules.front;
				let pathToModules = path.join(pathToRoot, targetManifest.modules.frontModulesDir);
				let partList = await loadFrontModules({pathToModules, roles, modsOptions: mass});
				list = deepMerge(list, partList);
			}catch(e){
				console.error(e);
			}

		}else{
			console.info('no front modules in manifest');
		}
	}else{
		console.info('no modules in manifest');
	}
	console.log('List:', list);
	////forming index.js and rollup.js
	for(let i = 0; i < roles.length; i++){
		let role = roles[i];
		try{
			let indexFile = path.join(pathToRoot, targetManifest.src, 'index.' + role + '.js');
			let rollupFile = path.join(pathToRoot, targetManifest.root, 'rollup.' + role + '.js');
			let bundleFile = path.join(pathToRoot, targetManifest.build, role + '.js');
			await lib.renderScript(path.join(pathToRoot,targetManifest.index), {mods:list[role]}, indexFile);
			await lib.renderScript(path.join(pathToRoot,targetManifest.rollup), {
				appName: targetManifest.name,
				inputPath: indexFile,
				outputPath: bundleFile
			}, rollupFile);
			let proc = child_process.spawn(opts.rollup, ['-c', rollupFile], {
				env : {
					NODE_ENV: opts.environment
				}
			});
		}catch(e){
			console.error(e);
		}
	}
	////executing rollup

}

//loading manifest file
try{
	console.log('config path', configName);
	config = lib.getConfReader(configName);
}catch(e){
	console.error(e);
	process.exit(1);
}
//searchig for targets
if (config.get('targets') && Object.keys(config.get('targets')).length > 0){
	//cycling through targets
	for(let target in config.get('targets')){
		let targetConfig = config.get('targets')[target];
		if (targetConfig && targetConfig.builder){
			//if target type is server
			switch (targetConfig.builder){
			case 'server': build_Server(path.dirname(configName), targetConfig.roles, target, targetConfig);
				break;
			}
		}
	}
}
