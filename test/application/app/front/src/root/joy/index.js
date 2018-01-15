import ncJoy from './ncJoy';

let manifest = {
	router: {
		manifest: [
			{
				paths: ['', 'joy'],
				controller: ncJoy
			}
		]
	}
};

export {ncJoy, manifest};
