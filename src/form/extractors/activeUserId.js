module.exports = (req) => {
    return req.user ? req.user._id : undefined;
};
