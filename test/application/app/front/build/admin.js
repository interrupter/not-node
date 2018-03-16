(function () {
'use strict';

function __$$styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css) { return }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

class ncTest extends notFramework.CRUDController {
	constructor(app, params) {
		notFramework.notCommon.log('running ncTest controller');
		super(app, params);
		this.setModuleName('post');
		this.setOptions('containerSelector', '#content');
		this.setOptions('params', params);
		this.setOptions('role', 'admin');

		this.setOptions('names', {
			plural: 'Tests',
			single: 'Test'
		});

		let formHelpers = {};

		this.setOptions('views', {
			create: {
				preload: {
					products: 'product'
				},
				action: 'create',
				prefix: 'item_form_',
				targetQuery: '#formPlace',
				helpers: formHelpers
			},
			update: {
				preload: {
					products: 'product'
				},
				action: 'update',
				loadAction: 'get',
				prefix: 'item_form_',
				targetQuery: '#formPlace',
				helpers: formHelpers
			},
			details: {
				preload: {
					products: 'product'
				},
				name: 'view',
				prefix: 'item_details_',
				targetQuery: '#formPlace'
			},
			list: {
				targetQuery: '#tablePlace',
				endless: false,
				preload: {
					products: 'product'
				},
				fields: [{
					path: ':bagetID',
					title: 'ID',
					sortable: true
				}, {
					path: ':title',
					title: 'Название',
					sortable: true,
					searchable: true
				}, {
					path: ':codeName',
					title: 'Кодовое название',
					sortable: true,
					searchable: true
				}, {
					path: ':price',
					title: 'Стоимость',
					sortable: true,
					searchable: true
				}, {
					path: ':default',
					title: 'По умолчанию',
					sortable: true,
					searchable: true
				}, {
					path: ':active',
					title: 'В наличии',
					sortable: true,
					searchable: true
				}, {
					path: ':products',
					title: 'Продукты',
					preprocessor: (value, item) => {
						return this.app.getOptions().getNamesByIds(this.getOptions('libs.products'), item.products).join(', ');
					}
				}, {
					path: ':_id',
					title: 'Действия',
					preprocessor: value => {
						return {
							url: [this.getModuleName(), value].join('/'),
							title: 'Смотреть'
						};
					},
					component: {
						template: {
							name: 'link'
						}
					}
				}]
			}
		});
		let lib = {
			'products': 'product'
		};
		this.preloadLib(lib).then(this.route.bind(this, params)).catch(notFramework.notCommon.report);
	}

	initItem() {
		var newRecord = this.make[this.getModuleName()]({
			'_id': null,
			title: this.getOptions('names.single'),
			codeName: '',
			description: '',
			properties: []
		});
		return newRecord;
	}

	updateList() {}
}

let manifest = {
	//will be added to global router object
	router: [{
		paths: ['post\/([^\/]+)\/([^\/]+)', 'post\/([^\/]+)', 'post'],
		controller: ncPost
	}],
	//will be added to global menu
	menu: [{
		url: '/test',
		title: 'Статьи',
		items: [{
			url: '/post/best',
			title: 'Лучшие'
		}, {
			url: '/post/popular',
			title: 'Популярные'
		}]
	}],
	/*
 	root from module/views/
 */
	templates: {
		//corresponds to post/views/common/lib.html
		lib: 'common/lib.html',
		//corresponds to post/views/item_form.html
		item_form: 'item_form.html',
		//corresponds to post/views/admin/item_details.html
		item_details: 'admin/item_details.html'
	}
};



var mod_0 = Object.freeze({
	ncTest: ncTest,
	manifest: manifest
});

class ncPost$1 extends notFramework.CRUDController {
	constructor(app, params) {
		notFramework.notCommon.log('running ncPost controller');
		super(app, params);
		this.setModuleName('post');
		this.setOptions('containerSelector', '#content');
		this.setOptions('params', params);
		this.setOptions('role', 'admin');

		this.setOptions('names', {
			plural: 'Posts',
			single: 'Post'
		});

		let formHelpers = {};

		this.setOptions('views', {
			create: {
				preload: {
					products: 'product'
				},
				action: 'create',
				prefix: 'item_form_',
				targetQuery: '#formPlace',
				helpers: formHelpers
			},
			update: {
				preload: {
					products: 'product'
				},
				action: 'update',
				loadAction: 'get',
				prefix: 'item_form_',
				targetQuery: '#formPlace',
				helpers: formHelpers
			},
			details: {
				preload: {
					products: 'product'
				},
				name: 'view',
				prefix: 'item_details_',
				targetQuery: '#formPlace'
			},
			list: {
				targetQuery: '#tablePlace',
				endless: false,
				preload: {
					products: 'product'
				},
				fields: [{
					path: ':bagetID',
					title: 'ID',
					sortable: true
				}, {
					path: ':title',
					title: 'Название',
					sortable: true,
					searchable: true
				}, {
					path: ':codeName',
					title: 'Кодовое название',
					sortable: true,
					searchable: true
				}, {
					path: ':price',
					title: 'Стоимость',
					sortable: true,
					searchable: true
				}, {
					path: ':default',
					title: 'По умолчанию',
					sortable: true,
					searchable: true
				}, {
					path: ':active',
					title: 'В наличии',
					sortable: true,
					searchable: true
				}, {
					path: ':products',
					title: 'Продукты',
					preprocessor: (value, item) => {
						return this.app.getOptions().getNamesByIds(this.getOptions('libs.products'), item.products).join(', ');
					}
				}, {
					path: ':_id',
					title: 'Действия',
					preprocessor: value => {
						return {
							url: [this.getModuleName(), value].join('/'),
							title: 'Смотреть'
						};
					},
					component: {
						template: {
							name: 'link'
						}
					}
				}]
			}
		});
		let lib = {
			'products': 'product'
		};
		this.preloadLib(lib).then(this.route.bind(this, params)).catch(notFramework.notCommon.report);
	}

	initItem() {
		var newRecord = this.make[this.getModuleName()]({
			'_id': null,
			title: this.getOptions('names.single'),
			codeName: '',
			description: '',
			properties: []
		});
		return newRecord;
	}

	updateList() {}
}

let manifest$1 = {
	//will be added to global router object
	router: {
		manifest: [{
			paths: ['post\/([^\/]+)\/([^\/]+)', 'post\/([^\/]+)', 'post'],
			controller: ncPost$1
		}]
	}, //will be added to global menu
	menu: [{
		url: '/post',
		title: 'Статьи',
		items: [{
			url: '/post/best',
			title: 'Лучшие'
		}, {
			url: '/post/popular',
			title: 'Популярные'
		}]
	}],
	/*
 	root from module/views/
 */
	templates: {
		//corresponds to post/views/common/lib.html
		lib: 'common/lib.html',
		//corresponds to post/views/item_form.html
		item_form: 'item_form.html',
		//corresponds to post/views/admin/item_details.html
		item_details: 'admin/item_details.html'
	}
};



var mod_1 = Object.freeze({
	ncPost: ncPost$1,
	manifest: manifest$1
});

class FileUploader extends notFramework.notBase {
	constructor(input) {
		super(input);
		return this;
	}

	fileAllowed(file) {
		if (!(this.getOptions('fileTypes').indexOf(file.type) > -1)) {
			return false;
		}
		if (!(file.size <= this.getOptions('fileSize'))) {
			return false;
		}
		return true;
	}

	upload(file) {
		return new Promise((resolve, reject) => {
			if (this.fileAllowed(file)) {
				let fileData = {
					file: file,
					url: this.getOptions('uploadUrl')
				};
				notFramework.notCommon.putFile(fileData).then(data => {
					resolve(data);
				}).catch(reject);
			} else {
				reject(new Event('WrongFileType'), file);
			}
		});
	}
}

class ncInit$1 extends notFramework.notController {
	constructor(app) {
		super(app);
		this.setModuleName('main');
		this.initLogout();
		this.initMainMenu();
		this.initUploader();
		return this;
	}

	initMainMenu() {
		if (!this.mainMenu) {
			this.mainMenu = new notFramework.notComponent({
				template: {
					name: 'menu'
				},
				data: new notFramework.notRecord({}, {
					items: notFramework.notCommon.getApp().getOptions('menu')
				}),
				options: {
					helpers: {},
					targetEl: document.getElementById('mainMenu')
				}
			});
		}
	}

	initUploader() {
		let uploader = new FileUploader({
			options: {
				uploadUrl: '/api/file',
				fileTypes: ['image/jpeg', 'image/png', 'image/bmp', ''],
				fileSize: 1024 * 1024 * 1024
			}
		});
		this.app.setWorking('uploader', uploader);
	}

	initLogout() {
		document.getElementById('logout').addEventListener('click', e => {
			e.preventDefault();
			let $this = $(this);
			$.SmartMessageBox({
				title: "<i class='fa fa-sign-out txt-color-orangeDark'></i> Выход <span class='txt-color-orangeDark'><strong>" + $('#show-shortcut').text() + "</strong></span> ?",
				content: $this.data('logout-msg') || notFramework.notCommon.getApp().getOptions('dict.ru.LogoutMessage'),
				buttons: '[Нет][Да]'

			}, ButtonPressed => {
				if (ButtonPressed == "Да") {
					$.root_.addClass('animated fadeOutUp');
					setTimeout(this.logout.bind(this), 1000);
				}
			});
			return false;
		});
	}

	logout() {
		this.make.register({}).$logout().then(() => {
			document.location.href = "/control";
		});
	}
}

class ncLogin extends notFramework.notController {
	constructor(app, params) {
		//notFramework.notCommon.log('init site app ', redirect, 'login');
		super(app);
		this.setModuleName('main');
		this.viewsPrefix = '/client/modules/main/';
		this.commonViewsPrefix = this.app.getOptions().commonPath;
		this.containerId = 'content';
		this.container = document.getElementById('content');
		this.viewsPostfix = '.html';
		this.renderFromURL = true;
		this.tableView = null;
		this.form = null;
		this.buildPage(params);
	}

	goProfile() {
		document.location.href = '/control';
	}

	buildTopLink() {
		var place = document.getElementById('extr-page-header-space');
		place.innerHTML = '<span id="extr-page-header-space"><a href="/composer" class="btn btn-danger">Редактор</a> </span>';
	}

	initItem() {
		var newRecord = window.nrRegister({
			'_id': undefined,
			username: '',
			email: '',
			password: ''
		});
		return newRecord;
	}

	showError(e) {
		notFramework.notCommon.report(e);
	}

	buildForm() {
		this.form = new notFramework.notForm({
			data: this.initItem(),
			options: {
				helpers: {
					submit: params => {
						params.item.$login().then(this.goProfile.bind(this)).catch(this.showError.bind(this));
					}
				},
				action: 'login',
				targetEl: document.getElementById('siteForm')
			},
			events: [['afterSubmit', this.goProfile.bind(this)], ['afterRestore', this.goProfile.bind(this)]]
		});
	}

	buildPage() {
		this.buildTopLink();
		var formParent = document.getElementById('siteForm');
		formParent.innerHTML = '';
		this.buildForm();
	}
}

class ncMain extends notFramework.notController {
	constructor(app) {
		super(app);
		return this;
	}
}

let manifest$2 = {
	router: {
		manifest: [{
			paths: ['', 'login'],
			controller: ncLogin
		}],
		index: '/login'
	},
	initController: ncInit$1,
	templates: {
		lib: '/client/common/lib.html?' + Math.random()
	},
	paths: {
		common: '/client/common',
		modules: '/client/modules'
	}
};



var mod_2 = Object.freeze({
	ncInit: ncInit$1,
	ncMain: ncMain,
	ncLogin: ncLogin,
	manifest: manifest$2
});

let manifest$3 = {
	router: {
		root: '/admin/joy'
	}
};



var mod_3 = Object.freeze({
	manifest: manifest$3
});

class ncJoy extends notFramework.notController {
	constructor(app) {
		super(app);
		this.setModuleName('joy');
		this.is = 'joy module for admin';
		return this;
	}
}

let manifest$4 = {
	router: {
		root: '/control/',
		manifest: [{
			paths: ['', 'joy'],
			controller: ncJoy
		}]
	}
};



var mod_4 = Object.freeze({
	ncJoy: ncJoy,
	manifest: manifest$4
});

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
		lib: '/client/common/lib.html?' + Math.random()
	},
	paths: {
		common: '/client/common',
		modules: '/client/modules'
	}
};

appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_0);

appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_1);

appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_2);

appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_3);

appDefaultOptions = notFramework.notCommon.absorbModule(appDefaultOptions, mod_4);

console.log('application final options', appDefaultOptions);
notFramework.notCommon.startApp(() => new notFramework.notApp(appDefaultOptions));

}());
