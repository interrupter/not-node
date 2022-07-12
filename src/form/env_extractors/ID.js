module.exports = (form, req) => {
    return {
        name: "targetID",
        value: req.params.ID,
    };
};
