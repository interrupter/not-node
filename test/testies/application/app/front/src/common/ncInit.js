import FileUploader from './FileUploader.js';

class ncInit extends notFramework.notController {
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
				fileSize: 1024 * 1024 * 1024,
			}
		});
		this.app.setWorking('uploader', uploader);
	}

	initLogout() {
		document.getElementById('logout').addEventListener('click', (e) => {
			e.preventDefault();
			let $this = $(this);
			$.SmartMessageBox({
				title: "<i class='fa fa-sign-out txt-color-orangeDark'></i> Выход <span class='txt-color-orangeDark'><strong>" + $('#show-shortcut').text() + "</strong></span> ?",
				content: $this.data('logout-msg') || notFramework.notCommon.getApp().getOptions('dict.ru.LogoutMessage'),
				buttons: '[Нет][Да]'

			}, (ButtonPressed) => {
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

export default ncInit;
