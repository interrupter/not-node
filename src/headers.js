const notStyler = require("./styler");

const DEFAULT_STYLER = (req, res) => {
    res.set("X-Frame-Options", "sameorigin");
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Content-Security-Policy", "frame-ancestors 'self'");
    res.set("X-XSS-Protection", "1; mode=block");
    res.set("Referrer-Policy", "strict-origin");
    res.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
    res.set("Cache-Control", "max-age=31536000");
};

class notHeadersStyler extends notStyler {}

notHeadersStyler.setDefault(DEFAULT_STYLER);

module.exports = notHeadersStyler;
