export default class FileUploader extends notFramework.notBase {
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
				notFramework.notCommon.putFile(fileData)
					.then((data) => {
						resolve(data);
					})
					.catch(reject);
			} else {
				reject(new Event('WrongFileType'), file);
			}
		});
	}
}
