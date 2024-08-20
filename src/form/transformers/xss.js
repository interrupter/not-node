const xss = require("xss");
module.exports = (val) => (typeof val === "string" ? xss(val) : val);
