import ncPost from './ncPost.js';

let manifest = {	
	//will be added to global router object
	router:	[
		{
			paths: ['post\/([^\/]+)\/([^\/]+)', 'post\/([^\/]+)', 'post'],
			controller: ncPost
		}
	],
	//will be added to global menu
	menu: [{
		url: '/post',
		title: 'Статьи',
		items: [{
			url: '/post/best',
			title: 'Лучшие'
		},{
			url: '/post/popular',
			title: 'Популярные'
		}]
	}],
	/*
		root from module/views/
	*/
	templates: {
		//corresponds to post/views/common/lib.html
		lib: 			'common/lib.html',
		//corresponds to post/views/item_form.html
		item_form: 		'item_form.html',
		//corresponds to post/views/admin/item_details.html
		item_details: 	'admin/item_details.html'
	}
};

export {
	ncPost,
	manifest
};
