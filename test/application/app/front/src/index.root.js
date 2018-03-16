let appDefaultOptions = {
	//url from which will take interfaceManifest json file
	manifestURL: '/api/manifest',
	//routes for client-side
	router: {
		root: '/',
		manifest: [],
		index: '/'
	},
	//base controller, executed on every site page before any other controller
	initController: ncInit,
	//form auto generation
	templates: {
		//common is for profile
		//associated object is options for generator object
		//default generator notForm
		lib: '/client/common/lib.html?' + Math.random(),
	},
	paths: {
		common: '/client/common',
		modules: '/client/modules'
	},
};


import * as mod_0 from '/var/server/nn/test/application/app/front/src/common';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_0);

import * as mod_1 from '/var/server/nn/test/application/app/front/src/root/config';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_1);

import * as mod_2 from '/var/server/nn/test/application/app/front/src/root/joy';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_2);


console.log('application final options', appDefaultOptions);
notFramework.notCommon.startApp(() => new notFramework.notApp(appDefaultOptions));
