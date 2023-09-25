module.exports = (form, req) => {
    return {
        name: "activeUser",
        value: req?.user?._id,
    };
};
