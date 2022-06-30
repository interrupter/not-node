module.exports = class InitFileupload {
    async run({ /*options, config,*/ master }) {
        const fileUpload = require("express-fileupload");
        master.getServer().use(
            fileUpload({
                createParentPath: true,
            })
        );
    }
};
