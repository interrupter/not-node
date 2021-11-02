import ncJoy from './ncJoy';

let manifest = {
	router: {
		root: '/control/',
		manifest: [
			{
				paths: ['', 'joy'],
				controller: ncJoy
			}
		]
	}	
};

export {ncJoy, manifest};
