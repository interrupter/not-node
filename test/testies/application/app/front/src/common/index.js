import ncInit from './ncInit';
import ncLogin from './ncLogin';
import ncMain from './ncMain';

let manifest = {
	router: {
		manifest: [
			{
				paths: ['', 'login'],
				controller: ncLogin
			}
		],
		index: '/login'
	},
	initController: ncInit,
	templates: {
		lib: '/client/common/lib.html?' + Math.random(),
	},
	paths: {
		common: '/client/common',
		modules: '/client/modules'
	},
};

export {ncInit, ncMain, ncLogin, manifest};
