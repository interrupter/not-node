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

<% for(var i = 0; i < mods.length; i++) {%>
import * as mod_<%=i%> from '<%=mods[i]%>';
appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_<%=i%>);<% } %>

<% for(var i = 0; i < scss.length; i++) {%>
import '<%=scss[i]%>';<% } %>


console.log('application final options', appDefaultOptions);
notFramework.notCommon.startApp(() => new notFramework.notApp(appDefaultOptions));
