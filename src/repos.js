module.exports = {
	default: {
		url: 'https://github.com/interrupter/not-project.git',
		dir:	'./',
		clear:{
			dirs: ['.git'],
			files: ['.gitignore','package-lock.json'],
		}
	},
	gallery: {
		extends: ['default'],
		dir:	'./',
		url:'https://github.com/interrupter/not-project-gallery.git',
		clear: {
			dirs: ['.git'],
			files: ['.gitignore'],
		},
		use: [
			{
				url: 'https://github.com/interrupter/not-store.git',
				dir: 'server/app/modules',
				clear: {
					dirs: ['.git'],
					files: ['.gitignore'],
				}
			},
		],
		npm: [
			'not-store'
		]
	}
};
