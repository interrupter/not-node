module.exports = {
    title: [
        {
            validator: "isLength",
            arguments: [3, 500],
            message: "Название компании должно быть от 3 до 500 символов",
        },
    ],
    tripleID: [
        {
            validator: "isnumber",
            message: "ID number  must be specified",
        },
    ],
    objectId: [
        {
            validator: "isLength",
            arguments: [10, 55],
            message: "Owner should be specified",
        },
    ],
    text: [
        {
            validator: "isLength",
            arguments: [1, 500],
            message: "от 1 до 500 знаков",
        },
    ],
};
