/* global notFramework */

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


import * as mod_0 from '/var/server/nn/node_modules/not-test-module/controllers/admin';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_0);
import * as mod_1 from '/var/server/nn/node_modules/not-test-module/controllers/common';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_1);
import * as mod_2 from '/var/server/nn/test/application/app/server/modules/post/controllers/admin';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_2);
import * as mod_3 from '/var/server/nn/test/application/app/front/src/common';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_3);
import * as mod_4 from '/var/server/nn/test/application/app/front/src/admin/config';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_4);
import * as mod_5 from '/var/server/nn/test/application/app/front/src/admin/joy';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_5);


import '/var/server/nn/test/application/app/server/modules/post/styles/common.scss';
import '/var/server/nn/test/application/app/front/src/common/style.scss';


console.log('application final options', appDefaultOptions);
notFramework.notCommon.startApp(() => new notFramework.notApp(appDefaultOptions));
