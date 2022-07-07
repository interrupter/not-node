module.exports = (req, name) => {
    return req.query[name];
};
