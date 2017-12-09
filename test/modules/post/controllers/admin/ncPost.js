class ncPost extends notFramework.CRUDController {
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
				targetQuery: '#formPlace',
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
					preprocessor: (value) => {
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
				}],
			}
		});
		let lib = {
			'products': 'product'
		};
		this.preloadLib(lib)
			.then(this.route.bind(this, params))
			.catch(notFramework.notCommon.report);
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

	updateList() {

	}

}
export default ncPost;
