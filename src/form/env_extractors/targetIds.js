module.exports = (form, req) => {
    return {
        name: "targetIds",
        value: req?.body?._ids || undefined,
    };
};
