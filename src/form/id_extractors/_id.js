module.exports = (form, req) => {
    return {
        name: "targetId",
        value: req.params._id,
    };
};
