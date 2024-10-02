module.exports = Object.freeze({
    Boolean: {
        type: require("./boolean"),
        true: require("./boolean.true"),
        false: require("./boolean.false"),
    },
    Date: {
        type: require("./date"),
    },
    Number: {
        type: require("./number"),
        int: require("./number.int"),
        positive: require("./number.positive"),
        positiveOrZero: require("./number.positive.or.zero"),
    },
    Object: {
        type: require("./object"),
        identity: require("./object.identity"),
    },
    ObjectId: {
        type: require("./objectId"),
        list: require("./objectId.list"),
    },
    String: {
        type: require("./string"),
        from10to10000: require("./string.10-10000"),
        email: require("./string.email"),
        ip: require("./string.ip"),
        notEmpty: require("./string.not.empty"),
        telephone: require("./string.telephone"),
        uuid: require("./string.uuid"),
    },
});
