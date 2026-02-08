module.exports = (req, name) => {
    return req.body?req.body[name]:undefined;
};
